/**
 * 计件工资自动核算API
 */

import { NextRequest, NextResponse } from 'next/server';
import { createApiHandler } from '@/lib/api-response';
import { withPermissionCheck } from '@/lib/api-response';

// 自动核算工资
const autoCalculateSalary = createApiHandler(
  withPermissionCheck(
    async (request: NextRequest) => {
      const { employeeId, periodStart, periodEnd } = await request.json();

      const client = (await import('@/storage/database/supabase-client')).getSupabaseClient();

      // 1. 获取员工信息
      const { data: employee, error: employeeError } = await client
        .from('employees')
        .select('*')
        .eq('id', employeeId)
        .single();

      if (employeeError || !employee) {
        throw new Error('员工信息不存在');
      }

      // 2. 获取指定时间段内的报工记录
      const { data: workReports, error: reportsError } = await client
        .from('work_reports')
        .select(`
          id,
          quantity,
          created_at,
          process,
          bundle_no
        `)
        .eq('employee_id', employeeId)
        .gte('created_at', periodStart)
        .lte('created_at', periodEnd)
        .eq('status', '已审核');

      if (reportsError) throw reportsError;

      if (!workReports || workReports.length === 0) {
        throw new Error('该时间段内没有已审核的报工记录');
      }

      // 3. 计算总产量和工序统计
      const totalQuantity = workReports.reduce((sum, report) => sum + (report.quantity || 0), 0);
      const processStats = workReports.reduce((stats, report) => {
        const process = report.process || '其他';
        stats[process] = (stats[process] || 0) + (report.quantity || 0);
        return stats;
      }, {} as Record<string, number>);

      // 4. 根据工序类型计算单价（这里使用简化逻辑，实际应该从工序配置表获取）
      const unitPrice = getUnitPriceByProcess(employee.wage_level || '普通工');

      // 5. 计算计件工资
      const pieceRateIncome = totalQuantity * unitPrice;

      // 6. 计算基础工资（按天数计算）
      const startDate = new Date(periodStart);
      const endDate = new Date(periodEnd);
      const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      const baseWage = (employee.base_wage || 0) * daysDiff;

      // 7. 计算补贴（根据出勤天数）
      const subsidy = (employee.subsidy || 0) * daysDiff;

      // 8. 计算应扣款项（这里简化处理，实际应该计算请假、迟到等）
      const deductions = 0;

      // 9. 计算总工资
      const totalSalary = baseWage + pieceRateIncome + subsidy - deductions;

      // 10. 创建工资记录
      const { createPieceRateSalary } = await import('@/lib/finance-service');

      const salary = await createPieceRateSalary({
        employeeId,
        periodStart,
        periodEnd,
        workReports: workReports.map(report => ({
          id: report.id,
          quantity: report.quantity || 0,
          process: report.process || '',
          bundleNo: report.bundle_no || '',
          createdAt: report.created_at
        })),
        unitPrice,
        baseWage,
        subsidy,
        deductions,
        operator: '系统自动核算',
        operatorId: 'system'
      });

      return {
        salary,
        calculation: {
          periodDays: daysDiff,
          totalQuantity,
          unitPrice,
          pieceRateIncome,
          baseWage,
          subsidy,
          deductions,
          totalSalary,
          processStats
        }
      };
    },
    ['finance:create']
  )
);

// 批量自动核算工资
const batchCalculateSalary = createApiHandler(
  withPermissionCheck(
    async (request: NextRequest) => {
      const { periodStart, periodEnd, department } = await request.json();

      const client = (await import('@/storage/database/supabase-client')).getSupabaseClient();

      // 获取指定部门的员工列表
      let employeeQuery = client
        .from('employees')
        .select('id, employee_no, name')
        .eq('status', '在职');

      if (department) {
        employeeQuery = employeeQuery.eq('department', department);
      }

      const { data: employees, error: employeesError } = await employeeQuery;

      if (employeesError) throw employeesError;

      const results = [];
      const errors = [];

      // 为每个员工自动核算工资
      for (const employee of employees || []) {
        try {
          const result = await autoCalculateSalary({
            json: () => Promise.resolve({
              employeeId: employee.id,
              periodStart,
              periodEnd
            })
          } as any);

          results.push({
            employee: {
              id: employee.id,
              employeeNo: employee.employee_no,
              name: employee.name
            },
            success: true,
            salary: result
          });
        } catch (error) {
          errors.push({
            employee: {
              id: employee.id,
              employeeNo: employee.employee_no,
              name: employee.name
            },
            success: false,
            error: error instanceof Error ? error.message : '未知错误'
          });
        }
      }

      return {
        total: employees?.length || 0,
        successCount: results.length,
        errorCount: errors.length,
        results,
        errors
      };
    },
    ['finance:create']
  )
);

// 获取工序单价配置
function getUnitPriceByProcess(wageLevel: string): number {
  // 这里应该从数据库或配置文件获取，暂时使用固定值
  const priceMap: Record<string, number> = {
    '普通工': 2.5,
    '熟练工': 3.0,
    '高级工': 3.5,
    '技师': 4.0
  };

  return priceMap[wageLevel] || 2.5;
}

export const POST = autoCalculateSalary;

// 支持批量操作
export async function PUT(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  if (action === 'batch') {
    return batchCalculateSalary(request);
  }

  return NextResponse.json(
    { success: false, error: '无效的操作' },
    { status: 400 }
  );
}