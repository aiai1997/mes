/**
 * 定时任务调度器
 * 使用node-cron实现四大自动任务
 */

import * as cron from 'node-cron';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// 获取数据库客户端
function getClient() {
  return getSupabaseClient();
}

/**
 * 工序超时预警任务
 * 每小时检查一次，预警超时工序
 */
async function checkProcessTimeout(): Promise<void> {
  try {
    const client = getClient();
    const now = new Date().toISOString();

    // 查询超时工序（假设有工序表，这里用work_reports作为示例）
    const { data: timeoutProcesses, error } = await client
      .from('work_reports')
      .select(`
        id,
        employee_id,
        employees (name),
        created_at,
        status
      `)
      .eq('status', '进行中')
      .lt('created_at', new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString()); // 8小时前

    if (error) {
      console.error('查询超时工序失败:', error);
      return;
    }

    if (timeoutProcesses && timeoutProcesses.length > 0) {
      // 创建预警记录
      const alerts = timeoutProcesses.map(process => ({
        alert_type: '工序超时',
        severity: '高',
        title: `工序超时预警`,
        message: `员工 ${process.employees?.name || '未知'} 的工序已超时8小时`,
        related_id: process.id,
        related_type: 'work_report',
        status: '未读',
        created_at: now,
      }));

      const { error: alertError } = await client
        .from('alerts')
        .insert(alerts);

      if (alertError) {
        console.error('创建工序超时预警失败:', alertError);
      } else {
        console.log(`创建了 ${alerts.length} 条工序超时预警`);
      }
    }
  } catch (error) {
    console.error('工序超时预警任务执行失败:', error);
  }
}

/**
 * 订单进度自动同步任务
 * 每天早上8点同步订单进度
 */
async function syncOrderProgress(): Promise<void> {
  try {
    const client = getClient();

    // 查询所有进行中的订单
    const { data: orders, error: ordersError } = await client
      .from('orders')
      .select('id, order_no, status')
      .in('status', ['待审核', '进行中']);

    if (ordersError) {
      console.error('查询订单失败:', ordersError);
      return;
    }

    if (!orders || orders.length === 0) return;

    // 计算每个订单的进度
    for (const order of orders) {
      // 查询订单相关的裁床任务完成情况
      const { data: cuttingTasks, error: cuttingError } = await client
        .from('cutting_tasks')
        .select('status')
        .eq('order_id', order.id);

      if (cuttingError) continue;

      // 查询报工记录
      const { data: workReports, error: workError } = await client
        .from('work_reports')
        .select('quantity')
        .eq('order_id', order.id);

      if (workError) continue;

      // 简单进度计算逻辑（可根据实际业务调整）
      const totalTasks = cuttingTasks?.length || 0;
      const completedTasks = cuttingTasks?.filter(task => task.status === '完成').length || 0;
      const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      // 更新订单进度（假设有progress字段）
      // 这里需要根据实际表结构调整
      console.log(`订单 ${order.order_no} 进度: ${progress}%`);
    }

    console.log('订单进度同步完成');
  } catch (error) {
    console.error('订单进度同步任务执行失败:', error);
  }
}

/**
 * 库存低于阈值告警任务
 * 每4小时检查一次库存
 */
async function checkLowInventory(): Promise<void> {
  try {
    const client = getClient();
    const now = new Date().toISOString();

    // 查询库存低于安全库存的物料
    const { data: lowStockItems, error } = await client
      .from('materials')
      .select('id, material_code, material_name, inventory, safety_stock')
      .lt('inventory', 'safety_stock')
      .gt('safety_stock', 0);

    if (error) {
      console.error('查询低库存物料失败:', error);
      return;
    }

    if (lowStockItems && lowStockItems.length > 0) {
      // 创建库存预警
      const alerts = lowStockItems.map(item => ({
        alert_type: '库存不足',
        severity: item.inventory === 0 ? '高' : '中',
        title: `库存不足预警`,
        message: `物料 ${item.material_name}(${item.material_code}) 库存 ${item.inventory} 低于安全库存 ${item.safety_stock}`,
        related_id: item.id,
        related_type: 'material',
        status: '未读',
        created_at: now,
      }));

      const { error: alertError } = await client
        .from('alerts')
        .insert(alerts);

      if (alertError) {
        console.error('创建库存预警失败:', alertError);
      } else {
        console.log(`创建了 ${alerts.length} 条库存不足预警`);
      }
    }
  } catch (error) {
    console.error('库存检查任务执行失败:', error);
  }
}

/**
 * 到期付款提醒任务
 * 每天早上9点检查即将到期的付款
 */
async function checkDuePayments(): Promise<void> {
  try {
    const client = getClient();
    const now = new Date();
    const threeDaysLater = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString();
    const nowStr = now.toISOString();

    // 查询3天内到期的供应商付款
    const { data: duePayments, error } = await client
      .from('supplier_payments')
      .select(`
        id,
        payment_no,
        supplier_name,
        amount,
        due_date,
        status
      `)
      .eq('status', '待付款')
      .gte('due_date', nowStr)
      .lte('due_date', threeDaysLater);

    if (error) {
      console.error('查询到期付款失败:', error);
      return;
    }

    if (duePayments && duePayments.length > 0) {
      const alerts = duePayments.map(payment => {
        const dueDate = new Date(payment.due_date);
        const daysDiff = Math.ceil((dueDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));

        return {
          alert_type: '付款到期',
          severity: daysDiff <= 1 ? '高' : '中',
          title: `付款到期提醒`,
          message: `供应商 ${payment.supplier_name} 的付款 ${payment.payment_no} 金额 ${payment.amount} 元，将于 ${daysDiff} 天后到期`,
          related_id: payment.id,
          related_type: 'supplier_payment',
          status: '未读',
          created_at: nowStr,
        };
      });

      const { error: alertError } = await client
        .from('alerts')
        .insert(alerts);

      if (alertError) {
        console.error('创建付款到期提醒失败:', alertError);
      } else {
        console.log(`创建了 ${alerts.length} 条付款到期提醒`);
      }
    }
  } catch (error) {
    console.error('到期付款检查任务执行失败:', error);
  }
}

/**
 * 初始化定时任务
 */
export function initializeScheduler(): void {
  // 工序超时预警：每小时执行
  cron.schedule('0 * * * *', () => {
    console.log('执行工序超时预警任务');
    checkProcessTimeout();
  });

  // 订单进度同步：每天早上8点
  cron.schedule('0 8 * * *', () => {
    console.log('执行订单进度同步任务');
    syncOrderProgress();
  });

  // 库存检查：每4小时执行
  cron.schedule('0 */4 * * *', () => {
    console.log('执行库存检查任务');
    checkLowInventory();
  });

  // 到期付款提醒：每天早上9点
  cron.schedule('0 9 * * *', () => {
    console.log('执行到期付款提醒任务');
    checkDuePayments();
  });

  console.log('定时任务调度器已初始化');
}

/**
 * 手动执行任务（用于测试）
 */
export const manualTasks = {
  checkProcessTimeout,
  syncOrderProgress,
  checkLowInventory,
  checkDuePayments,
};