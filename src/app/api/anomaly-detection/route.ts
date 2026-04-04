import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

interface AnomalyRecord {
  tableName: string;
  recordId: string;
  anomalyType: string;
  anomalyDescription: string;
  originalData: any;
}

/**
 * 异常数据检测 API
 * POST: 执行异常数据检测
 * GET: 获取异常数据列表
 */
export async function POST(request: NextRequest) {
  try {
    const client = getSupabaseClient();
    const anomalies: AnomalyRecord[] = [];

    // 1. 检测用户表异常
    const { data: users, error: usersError } = await client.from('users').select('*');
    if (!usersError && users) {
      for (const user of users) {
        // 检查必填字段缺失
        if (!user.username || !user.real_name || !user.role) {
          anomalies.push({
            tableName: 'users',
            recordId: user.id,
            anomalyType: '必填字段缺失',
            anomalyDescription: `用户记录缺少必填字段：${!user.username ? '用户名 ' : ''}${!user.real_name ? '姓名 ' : ''}${!user.role ? '角色' : ''}`,
            originalData: user,
          });
        }
        
        // 检查用户名格式
        if (user.username && !/^[\w-]{3,20}$/.test(user.username)) {
          anomalies.push({
            tableName: 'users',
            recordId: user.id,
            anomalyType: '格式异常',
            anomalyDescription: `用户名格式不符合规范：${user.username}`,
            originalData: user,
          });
        }
      }
    }

    // 2. 检测员工表异常
    const { data: employees, error: empError } = await client.from('employees').select('*');
    if (!empError && employees) {
      for (const emp of employees) {
        // 检查必填字段缺失
        if (!emp.employee_no || !emp.name || !emp.phone) {
          anomalies.push({
            tableName: 'employees',
            recordId: emp.id,
            anomalyType: '必填字段缺失',
            anomalyDescription: `员工记录缺少必填字段：${!emp.employee_no ? '工号 ' : ''}${!emp.name ? '姓名 ' : ''}${!emp.phone ? '电话' : ''}`,
            originalData: emp,
          });
        }
        
        // 检查手机号格式
        if (emp.phone && !/^1[3-9]\d{9}$/.test(emp.phone)) {
          anomalies.push({
            tableName: 'employees',
            recordId: emp.id,
            anomalyType: '格式异常',
            anomalyDescription: `手机号格式不正确：${emp.phone}`,
            originalData: emp,
          });
        }
        
        // 检查基础工资异常
        if (emp.base_wage !== null && emp.base_wage < 0) {
          anomalies.push({
            tableName: 'employees',
            recordId: emp.id,
            anomalyType: '数据异常',
            anomalyDescription: `基础工资为负数：${emp.base_wage}`,
            originalData: emp,
          });
        }
      }
    }

    // 3. 检测钱包表异常
    const { data: wallets, error: walletError } = await client.from('wallets').select('*');
    if (!walletError && wallets) {
      for (const wallet of wallets) {
        // 检查余额异常
        if (wallet.balance < 0) {
          anomalies.push({
            tableName: 'wallets',
            recordId: wallet.id,
            anomalyType: '余额异常',
            anomalyDescription: `钱包余额为负数：${wallet.balance}`,
            originalData: wallet,
          });
        }
        
        // 检查数据一致性
        if (wallet.total_earnings < wallet.total_withdrawals) {
          anomalies.push({
            tableName: 'wallets',
            recordId: wallet.id,
            anomalyType: '数据不一致',
            anomalyDescription: `累计提现(${wallet.total_withdrawals})大于累计收入(${wallet.total_earnings})`,
            originalData: wallet,
          });
        }
        
        // 检查余额与收支不符
        const expectedBalance = wallet.total_earnings - wallet.total_withdrawals;
        if (Math.abs(wallet.balance - expectedBalance) > 0.01) {
          anomalies.push({
            tableName: 'wallets',
            recordId: wallet.id,
            anomalyType: '数据不一致',
            anomalyDescription: `余额(${wallet.balance})与收支计算不符(应为${expectedBalance})`,
            originalData: wallet,
          });
        }
      }
    }

    // 4. 检测订单表异常
    const { data: orders, error: orderError } = await client.from('orders').select('*');
    if (!orderError && orders) {
      for (const order of orders) {
        // 检查日期逻辑
        if (order.delivery_date && order.order_date && new Date(order.delivery_date) < new Date(order.order_date)) {
          anomalies.push({
            tableName: 'orders',
            recordId: order.id,
            anomalyType: '日期异常',
            anomalyDescription: `交货日期早于订单日期`,
            originalData: order,
          });
        }
        
        // 检查数量异常
        if (order.total_quantity !== null && order.total_quantity <= 0) {
          anomalies.push({
            tableName: 'orders',
            recordId: order.id,
            anomalyType: '数量异常',
            anomalyDescription: `订单数量异常：${order.total_quantity}`,
            originalData: order,
          });
        }
      }
    }

    // 5. 保存异常记录到数据库
    if (anomalies.length > 0) {
      const anomalyRecords = anomalies.map((a, index) => ({
        id: `anomaly-${Date.now()}-${index}`,
        table_name: a.tableName,
        record_id: a.recordId,
        anomaly_type: a.anomalyType,
        anomaly_description: a.anomalyDescription,
        original_data: a.originalData,
        status: '待处理',
        created_at: new Date().toISOString(),
      }));

      const { error: insertError } = await client
        .from('anomaly_records')
        .insert(anomalyRecords);

      if (insertError) {
        console.error('保存异常记录失败:', insertError);
      }
    }

    // 6. 记录安全日志
    await client.from('security_logs').insert({
      id: `log-${Date.now()}`,
      event_type: '异常数据检测',
      event_level: anomalies.length > 0 ? 'WARNING' : 'INFO',
      description: `检测到 ${anomalies.length} 条异常数据`,
      created_at: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      anomalyCount: anomalies.length,
      anomalies: anomalies.map(a => ({
        tableName: a.tableName,
        recordId: a.recordId,
        anomalyType: a.anomalyType,
        anomalyDescription: a.anomalyDescription,
      })),
    });
  } catch (error) {
    console.error('异常数据检测失败:', error);
    return NextResponse.json(
      { success: false, error: '异常数据检测失败' },
      { status: 500 }
    );
  }
}

/**
 * 获取异常数据列表
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || '待处理';
    const limit = parseInt(searchParams.get('limit') || '100');

    const client = getSupabaseClient();

    const { data: anomalies, error } = await client
      .from('anomaly_records')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    const formattedAnomalies = anomalies.map(a => ({
      id: a.id,
      tableName: a.table_name,
      recordId: a.record_id,
      anomalyType: a.anomaly_type,
      anomalyDescription: a.anomaly_description,
      originalData: a.original_data,
      status: a.status,
      handledBy: a.handled_by,
      handledAt: a.handled_at,
      createdAt: a.created_at,
    }));

    return NextResponse.json({
      success: true,
      anomalies: formattedAnomalies,
    });
  } catch (error) {
    console.error('获取异常数据列表失败:', error);
    return NextResponse.json(
      { success: false, error: '获取异常数据列表失败' },
      { status: 500 }
    );
  }
}
