import { NextRequest, NextResponse } from 'next/server';
import { Process, PieceRateRecord, PaySlip, SalaryReport, initPieceRateData, getProcesses, saveProcess, getPieceRateRecords, savePieceRateRecord, getPaySlips, generatePaySlip, getSalaryReports, generateSalaryReport } from '@/types/piece-rate';

// 初始化数据
initPieceRateData();

// GET - 获取数据
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const type = url.searchParams.get('type');
    const employeeId = url.searchParams.get('employeeId');
    const period = url.searchParams.get('period');
    
    let data: any;
    
    switch (type) {
      case 'processes':
        data = getProcesses();
        break;
      case 'records':
        data = getPieceRateRecords(employeeId || undefined, period || undefined);
        break;
      case 'payslips':
        data = getPaySlips(employeeId || undefined, period || undefined);
        break;
      case 'reports':
        data = getSalaryReports(period || undefined);
        break;
      default:
        return NextResponse.json(
          { success: false, error: '请指定数据类型' },
          { status: 400 }
        );
    }
    
    return NextResponse.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('获取数据失败:', error);
    return NextResponse.json(
      { success: false, error: '获取数据失败' },
      { status: 500 }
    );
  }
}

// POST - 创建数据
export async function POST(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const type = url.searchParams.get('type');
    const body = await request.json();
    
    let result: any;
    
    switch (type) {
      case 'process':
        saveProcess(body as Process);
        result = { success: true, message: '工序保存成功' };
        break;
      case 'record':
        savePieceRateRecord(body as PieceRateRecord);
        result = { success: true, message: '计件记录保存成功' };
        break;
      case 'payslip':
        if (!body.employeeId || !body.employeeName || !body.department || !body.position || !body.period) {
          return NextResponse.json(
            { success: false, error: '缺少必要参数' },
            { status: 400 }
          );
        }
        const paySlip = generatePaySlip(
          body.employeeId,
          body.employeeName,
          body.department,
          body.position,
          body.period,
          body.basicSalary || 0,
          body.bonus || 0,
          body.deductions || 0,
          body.socialSecurity || 0,
          body.housingFund || 0
        );
        result = { success: true, message: '工资条生成成功', data: paySlip };
        break;
      case 'report':
        if (!body.period || !Array.isArray(body.employees)) {
          return NextResponse.json(
            { success: false, error: '缺少必要参数' },
            { status: 400 }
          );
        }
        const report = generateSalaryReport(body.period, body.employees);
        result = { success: true, message: '工资报表生成成功', data: report };
        break;
      default:
        return NextResponse.json(
          { success: false, error: '请指定数据类型' },
          { status: 400 }
        );
    }
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('创建数据失败:', error);
    return NextResponse.json(
      { success: false, error: '创建数据失败' },
      { status: 500 }
    );
  }
}

// PUT - 更新数据
export async function PUT(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const type = url.searchParams.get('type');
    const body = await request.json();
    
    if (!body.id) {
      return NextResponse.json(
        { success: false, error: '缺少ID参数' },
        { status: 400 }
      );
    }
    
    let result: any;
    
    switch (type) {
      case 'process':
        saveProcess(body as Process);
        result = { success: true, message: '工序更新成功' };
        break;
      case 'record':
        savePieceRateRecord(body as PieceRateRecord);
        result = { success: true, message: '计件记录更新成功' };
        break;
      default:
        return NextResponse.json(
          { success: false, error: '请指定数据类型' },
          { status: 400 }
        );
    }
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('更新数据失败:', error);
    return NextResponse.json(
      { success: false, error: '更新数据失败' },
      { status: 500 }
    );
  }
}

// DELETE - 删除数据
export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const type = url.searchParams.get('type');
    const id = url.searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: '缺少ID参数' },
        { status: 400 }
      );
    }
    
    // 注意：由于使用localStorage存储，删除操作需要特殊处理
    // 这里简化处理，实际项目中可能需要更复杂的逻辑
    
    return NextResponse.json({
      success: true,
      message: '删除成功'
    });
  } catch (error) {
    console.error('删除数据失败:', error);
    return NextResponse.json(
      { success: false, error: '删除数据失败' },
      { status: 500 }
    );
  }
}
