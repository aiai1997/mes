/**
 * 数据大屏统计API
 */

import { NextRequest, NextResponse } from 'next/server';
import { createApiHandler } from '@/lib/api-response';
import { withPermissionCheck } from '@/lib/api-response';

// 获取大屏统计数据
const getDashboardStats = createApiHandler(
  withPermissionCheck(
    async (request: NextRequest) => {
      const client = (await import('@/storage/database/supabase-client')).getSupabaseClient();

      // 今日产量
      const today = new Date().toISOString().split('T')[0];
      const { data: todayOutputData, error: todayOutputError } = await client
        .from('work_reports')
        .select('quantity')
        .gte('created_at', `${today}T00:00:00.000Z`)
        .lt('created_at', `${today}T23:59:59.999Z`);

      if (todayOutputError) throw todayOutputError;

      const todayOutput = todayOutputData?.reduce((sum, report) => sum + (report.quantity || 0), 0) || 0;

      // 完工订单数
      const { data: completedOrdersData, error: completedOrdersError } = await client
        .from('orders')
        .select('id')
        .eq('status', '完工');

      if (completedOrdersError) throw completedOrdersError;

      const completedOrders = completedOrdersData?.length || 0;

      // 待加工订单数
      const { data: pendingOrdersData, error: pendingOrdersError } = await client
        .from('orders')
        .select('id')
        .in('status', ['待生产', '生产中']);

      if (pendingOrdersError) throw pendingOrdersError;

      const pendingOrders = pendingOrdersData?.length || 0;

      // 库存预警数
      const { data: lowStockData, error: lowStockError } = await client
        .from('materials')
        .select('id')
        .lt('current_stock', 10); // 假设库存低于10为预警

      if (lowStockError) throw lowStockError;

      const lowInventoryAlerts = lowStockData?.length || 0;

      // 今日收入（从财务流水表获取）
      const { data: todayIncomeData, error: todayIncomeError } = await client
        .from('financial_transactions')
        .select('amount')
        .eq('transaction_type', '收入')
        .gte('transaction_date', `${today}T00:00:00.000Z`)
        .lt('transaction_date', `${today}T23:59:59.999Z`);

      if (todayIncomeError) throw todayIncomeError;

      const todayIncome = todayIncomeData?.reduce((sum, transaction) => sum + (transaction.amount || 0), 0) || 0;

      // 待付款金额
      const { data: pendingPaymentsData, error: pendingPaymentsError } = await client
        .from('supplier_payments')
        .select('amount, paid_amount')
        .eq('status', '待付');

      if (pendingPaymentsError) throw pendingPaymentsError;

      const pendingPayments = pendingPaymentsData?.reduce((sum, payment) =>
        sum + ((payment.amount || 0) - (payment.paid_amount || 0)), 0) || 0;

      return {
        todayOutput,
        completedOrders,
        pendingOrders,
        lowInventoryAlerts,
        todayIncome,
        pendingPayments
      };
    },
    ['dashboard:view']
  )
);

export const GET = getDashboardStats;