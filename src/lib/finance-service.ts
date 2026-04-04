/**
 * 财务核算服务层
 * 处理财务流水、员工计件薪资、供应商付款等业务
 */

import { getSupabaseClient } from '@/storage/database/supabase-client';
import {
  FinancialTransaction,
  PieceRateSalary,
  SupplierPayment
} from '@/types/rbac';

// 获取数据库客户端
function getClient() {
  return getSupabaseClient();
}

/**
 * 生成财务流水编号
 */
function generateTransactionNo(): string {
  const now = new Date();
  const timestamp = now.getFullYear().toString() +
    (now.getMonth() + 1).toString().padStart(2, '0') +
    now.getDate().toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `FT${timestamp}${random}`;
}

/**
 * 生成薪资编号
 */
function generateSalaryNo(): string {
  const now = new Date();
  const timestamp = now.getFullYear().toString() +
    (now.getMonth() + 1).toString().padStart(2, '0') +
    now.getDate().toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `SAL${timestamp}${random}`;
}

/**
 * 生成付款编号
 */
function generatePaymentNo(): string {
  const now = new Date();
  const timestamp = now.getFullYear().toString() +
    (now.getMonth() + 1).toString().padStart(2, '0') +
    now.getDate().toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `PAY${timestamp}${random}`;
}

/**
 * 创建财务流水
 */
export async function createFinancialTransaction(data: {
  transactionType: '收入' | '支出';
  category: string;
  amount: number;
  currency?: string;
  relatedId?: string;
  relatedType?: string;
  description?: string;
  operator?: string;
  operatorId?: string;
}): Promise<FinancialTransaction> {
  const client = getClient();

  const transactionData = {
    transaction_no: generateTransactionNo(),
    transaction_type: data.transactionType,
    category: data.category,
    amount: data.amount,
    currency: data.currency || 'CNY',
    related_id: data.relatedId,
    related_type: data.relatedType,
    description: data.description,
    operator: data.operator,
    operator_id: data.operatorId,
    transaction_date: new Date().toISOString(),
  };

  const { data: result, error } = await client
    .from('financial_transactions')
    .insert(transactionData)
    .select()
    .single();

  if (error) throw error;

  return {
    id: result.id,
    transactionNo: result.transaction_no,
    transactionType: result.transaction_type,
    category: result.category,
    amount: result.amount,
    currency: result.currency,
    relatedId: result.related_id,
    relatedType: result.related_type,
    description: result.description,
    operator: result.operator,
    operatorId: result.operator_id,
    transactionDate: result.transaction_date,
    createdAt: result.created_at,
  };
}

/**
 * 订单完工自动生成财务收入
 */
export async function generateOrderIncome(orderId: string, orderNo: string, totalAmount: number, operator: string): Promise<void> {
  await createFinancialTransaction({
    transactionType: '收入',
    category: '订单收入',
    amount: totalAmount,
    relatedId: orderId,
    relatedType: 'order',
    description: `订单 ${orderNo} 完工收入`,
    operator,
  });
}

/**
 * 工序结算自动生成财务支出（人工成本）
 */
export async function generateProcessCost(processId: string, processName: string, cost: number, operator: string): Promise<void> {
  await createFinancialTransaction({
    transactionType: '支出',
    category: '人工成本',
    amount: cost,
    relatedId: processId,
    relatedType: 'process',
    description: `工序 ${processName} 结算成本`,
    operator,
  });
}

/**
 * 创建员工计件薪资记录
 */
export async function createPieceRateSalary(data: {
  employeeId: string;
  periodStart: string;
  periodEnd: string;
  workReports: any[];
  unitPrice: number;
  baseWage?: number;
  subsidy?: number;
  deductions?: number;
  operator: string;
}): Promise<PieceRateSalary> {
  const client = getClient();

  // 计算总数量和金额
  const totalQuantity = data.workReports.reduce((sum, report) => sum + (report.quantity || 0), 0);
  const totalAmount = totalQuantity * data.unitPrice;
  const baseWage = data.baseWage || 0;
  const subsidy = data.subsidy || 0;
  const deductions = data.deductions || 0;
  const netAmount = totalAmount + baseWage + subsidy - deductions;

  // 获取员工信息
  const { data: employee, error: employeeError } = await client
    .from('employees')
    .select('name')
    .eq('id', data.employeeId)
    .single();

  if (employeeError) throw employeeError;

  const salaryData = {
    salary_no: generateSalaryNo(),
    employee_id: data.employeeId,
    employee_name: employee.name,
    period_start: data.periodStart,
    period_end: data.periodEnd,
    work_reports: data.workReports,
    total_quantity: totalQuantity,
    unit_price: data.unitPrice,
    total_amount: totalAmount,
    base_wage: baseWage,
    subsidy: subsidy,
    deductions: deductions,
    net_amount: netAmount,
    status: '待审核',
    operator,
  };

  const { data: result, error } = await client
    .from('piece_rate_salaries')
    .insert(salaryData)
    .select()
    .single();

  if (error) throw error;

  return {
    id: result.id,
    salaryNo: result.salary_no,
    employeeId: result.employee_id,
    employeeName: result.employee_name,
    periodStart: result.period_start,
    periodEnd: result.period_end,
    workReports: result.work_reports,
    totalQuantity: result.total_quantity,
    unitPrice: result.unit_price,
    totalAmount: result.total_amount,
    baseWage: result.base_wage,
    subsidy: result.subsidy,
    deductions: result.deductions,
    netAmount: result.net_amount,
    status: result.status,
    auditedBy: result.audited_by,
    auditedAt: result.audited_at,
    paymentDate: result.payment_date,
    createdAt: result.created_at,
    updatedAt: result.updated_at,
  };
}

/**
 * 审核员工薪资
 */
export async function auditPieceRateSalary(salaryId: string, auditor: string, approved: boolean): Promise<void> {
  const client = getClient();

  const updateData = {
    status: approved ? '已审核' : '已拒绝',
    audited_by: auditor,
    audited_at: new Date().toISOString(),
  };

  const { error } = await client
    .from('piece_rate_salaries')
    .update(updateData)
    .eq('id', salaryId);

  if (error) throw error;

  // 如果审核通过，生成财务支出记录
  if (approved) {
    const { data: salary, error: salaryError } = await client
      .from('piece_rate_salaries')
      .select('net_amount, employee_name, salary_no')
      .eq('id', salaryId)
      .single();

    if (salaryError) throw salaryError;

    await createFinancialTransaction({
      transactionType: '支出',
      category: '员工工资',
      amount: salary.net_amount,
      relatedId: salaryId,
      relatedType: 'salary',
      description: `员工 ${salary.employee_name} 工资发放 ${salary.salary_no}`,
      operator: auditor,
    });
  }
}

/**
 * 创建供应商付款记录
 */
export async function createSupplierPayment(data: {
  supplierId: string;
  outsourcingId?: string;
  amount: number;
  paymentMethod?: string;
  dueDate?: string;
  description?: string;
  operator: string;
}): Promise<SupplierPayment> {
  const client = getClient();

  // 获取供应商信息
  const { data: supplier, error: supplierError } = await client
    .from('suppliers')
    .select('supplier_name')
    .eq('id', data.supplierId)
    .single();

  if (supplierError) throw supplierError;

  // 获取外协信息
  let outsourcingNo: string | undefined;
  if (data.outsourcingId) {
    const { data: outsourcing, error: outsourcingError } = await client
      .from('outsourcing')
      .select('outsourcing_no')
      .eq('id', data.outsourcingId)
      .single();

    if (outsourcingError) throw outsourcingError;
    outsourcingNo = outsourcing.outsourcing_no;
  }

  const paymentData = {
    payment_no: generatePaymentNo(),
    supplier_id: data.supplierId,
    supplier_name: supplier.supplier_name,
    outsourcing_id: data.outsourcingId,
    outsourcing_no: outsourcingNo,
    amount: data.amount,
    currency: 'CNY',
    payment_method: data.paymentMethod,
    due_date: data.dueDate,
    status: '待付款',
    description: data.description,
    operator: data.operator,
  };

  const { data: result, error } = await client
    .from('supplier_payments')
    .insert(paymentData)
    .select()
    .single();

  if (error) throw error;

  return {
    id: result.id,
    paymentNo: result.payment_no,
    supplierId: result.supplier_id,
    supplierName: result.supplier_name,
    outsourcingId: result.outsourcing_id,
    outsourcingNo: result.outsourcing_no,
    amount: result.amount,
    currency: result.currency,
    paymentMethod: result.payment_method,
    paymentDate: result.payment_date,
    dueDate: result.due_date,
    status: result.status,
    description: result.description,
    operator: result.operator,
    operatorId: result.operator_id,
    createdAt: result.created_at,
    updatedAt: result.updated_at,
  };
}

/**
 * 供应商付款
 */
export async function processSupplierPayment(paymentId: string, paymentDate: string, operator: string): Promise<void> {
  const client = getClient();

  const updateData = {
    status: '已付款',
    payment_date: paymentDate,
    operator,
    updated_at: new Date().toISOString(),
  };

  const { error } = await client
    .from('supplier_payments')
    .update(updateData)
    .eq('id', paymentId);

  if (error) throw error;

  // 生成财务支出记录
  const { data: payment, error: paymentError } = await client
    .from('supplier_payments')
    .select('amount, supplier_name, payment_no')
    .eq('id', paymentId)
    .single();

  if (paymentError) throw paymentError;

  await createFinancialTransaction({
    transactionType: '支出',
    category: '供应商付款',
    amount: payment.amount,
    relatedId: paymentId,
    relatedType: 'supplier_payment',
    description: `供应商 ${payment.supplier_name} 付款 ${payment.payment_no}`,
    operator,
  });
}

/**
 * 获取财务统计数据
 */
export async function getFinancialStatistics(period?: { start: string; end: string }) {
  const client = getClient();

  let query = client.from('financial_transactions').select('*');

  if (period) {
    query = query.gte('transaction_date', period.start).lte('transaction_date', period.end);
  }

  const { data: transactions, error } = await query;

  if (error) throw error;

  const stats = {
    totalIncome: 0,
    totalExpense: 0,
    netIncome: 0,
    transactionCount: transactions?.length || 0,
    categoryBreakdown: {} as Record<string, { income: number; expense: number }>,
  };

  transactions?.forEach(transaction => {
    if (transaction.transaction_type === '收入') {
      stats.totalIncome += transaction.amount;
    } else {
      stats.totalExpense += transaction.amount;
    }

    const category = transaction.category;
    if (!stats.categoryBreakdown[category]) {
      stats.categoryBreakdown[category] = { income: 0, expense: 0 };
    }

    if (transaction.transaction_type === '收入') {
      stats.categoryBreakdown[category].income += transaction.amount;
    } else {
      stats.categoryBreakdown[category].expense += transaction.amount;
    }
  });

  stats.netIncome = stats.totalIncome - stats.totalExpense;

  return stats;
}