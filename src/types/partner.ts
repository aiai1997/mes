/**
 * 客户和供应商相关类型定义
 */

// 客户等级
export type CustomerLevel = 'A级' | 'B级' | 'C级' | 'D级';

// 账期天数
export type CreditDays = 7 | 15 | 30;

// 付款方式
export type PaymentMethod = '月结' | '现结' | '预付';

// 供应商类型
export type SupplierType = '面料' | '辅料' | '外协' | '其他';

// 客户状态
export type PartnerStatus = '启用' | '停用';

// 客户
export interface Customer {
  id: string;
  customerCode: string;
  customerName: string;
  shortName: string;
  contact: string;
  phone: string;
  address: string;
  level: CustomerLevel;
  creditDays: CreditDays;
  taxRate: number;
  invoiceInfo: string;
  deliveryAddress: string;
  totalOrders: number;
  totalAmount: number;
  status: PartnerStatus;
  createdAt: string;
  updatedAt?: string;
}

// 供应商
export interface Supplier {
  id: string;
  supplierCode: string;
  supplierName: string;
  supplierType: SupplierType;
  contact: string;
  phone: string;
  address: string;
  invoiceInfo: string;
  creditDays: CreditDays;
  paymentMethod: PaymentMethod;
  totalPurchases: number;
  totalAmount: number;
  status: PartnerStatus;
  createdAt: string;
  updatedAt?: string;
}

// ==================== 数据操作函数 ====================

import { DB_KEYS } from '@/lib/database';

const CUSTOMERS_KEY = DB_KEYS.CUSTOMERS;
const SUPPLIERS_KEY = DB_KEYS.SUPPLIERS;

// 初始化客户和供应商数据（创建空数组）
export function initPartnerData(): void {
  if (typeof window === 'undefined') return;
  
  const storedCustomers = localStorage.getItem(CUSTOMERS_KEY);
  if (!storedCustomers) {
    localStorage.setItem(CUSTOMERS_KEY, JSON.stringify([]));
  }
  
  const storedSuppliers = localStorage.getItem(SUPPLIERS_KEY);
  if (!storedSuppliers) {
    localStorage.setItem(SUPPLIERS_KEY, JSON.stringify([]));
  }
}

// 获取客户列表
export function getCustomers(): Customer[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(CUSTOMERS_KEY);
  return stored ? JSON.parse(stored) : [];
}

// 获取供应商列表
export function getSuppliers(): Supplier[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(SUPPLIERS_KEY);
  return stored ? JSON.parse(stored) : [];
}

// 根据ID获取客户
export function getCustomerById(id: string): Customer | null {
  const customers = getCustomers();
  return customers.find(c => c.id === id) || null;
}

// 根据ID获取供应商
export function getSupplierById(id: string): Supplier | null {
  const suppliers = getSuppliers();
  return suppliers.find(s => s.id === id) || null;
}

// 保存客户
export function saveCustomer(customer: Customer): void {
  if (typeof window === 'undefined') return;
  const customers = getCustomers();
  const index = customers.findIndex(c => c.id === customer.id);
  if (index >= 0) {
    customers[index] = { ...customer, updatedAt: new Date().toISOString() };
  } else {
    customers.push(customer);
  }
  localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(customers));
}

// 保存供应商
export function saveSupplier(supplier: Supplier): void {
  if (typeof window === 'undefined') return;
  const suppliers = getSuppliers();
  const index = suppliers.findIndex(s => s.id === supplier.id);
  if (index >= 0) {
    suppliers[index] = { ...supplier, updatedAt: new Date().toISOString() };
  } else {
    suppliers.push(supplier);
  }
  localStorage.setItem(SUPPLIERS_KEY, JSON.stringify(suppliers));
}

// 删除客户
export function deleteCustomer(id: string): void {
  if (typeof window === 'undefined') return;
  const customers = getCustomers().filter(c => c.id !== id);
  localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(customers));
}

// 删除供应商
export function deleteSupplier(id: string): void {
  if (typeof window === 'undefined') return;
  const suppliers = getSuppliers().filter(s => s.id !== id);
  localStorage.setItem(SUPPLIERS_KEY, JSON.stringify(suppliers));
}

// 生成客户编号
export function generateCustomerCode(): string {
  const customers = getCustomers();
  const maxCode = customers.reduce((max, c) => {
    const num = parseInt(c.customerCode.replace('CUS', ''));
    return num > max ? num : max;
  }, 0);
  return `CUS${String(maxCode + 1).padStart(3, '0')}`;
}

// 生成供应商编号
export function generateSupplierCode(): string {
  const suppliers = getSuppliers();
  const maxCode = suppliers.reduce((max, s) => {
    const num = parseInt(s.supplierCode.replace('SUP', ''));
    return num > max ? num : max;
  }, 0);
  return `SUP${String(maxCode + 1).padStart(3, '0')}`;
}

// ==================== 供应商对账相关类型 ====================

// 对账单状态
export type StatementStatus = '待确认' | '已确认' | '已付款' | '已逾期';

// 供应商对账单
export interface SupplierStatement {
  id: string;
  statementNo: string;
  supplierId: string;
  supplierName: string;
  periodStart: string; // 对账周期开始日期
  periodEnd: string;   // 对账周期结束日期
  totalAmount: number; // 总金额
  paidAmount: number;  // 已付金额
  remainingAmount: number; // 剩余金额
  dueDate: string;     // 到期日期
  status: StatementStatus;
  items: StatementItem[]; // 对账项
  attachments: string[]; // 附件（如发票、回执等）
  createdAt: string;
  updatedAt: string;
  confirmedAt?: string;
  paidAt?: string;
}

// 对账单项
export interface StatementItem {
  id: string;
  orderNo: string; // 订单编号
  productName: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  deliveryDate: string;
  invoiceNo?: string;
}

// 付款记录
export interface PaymentRecord {
  id: string;
  paymentNo: string;
  statementId: string;
  statementNo: string;
  supplierId: string;
  supplierName: string;
  amount: number;
  paymentDate: string;
  paymentMethod: '银行转账' | '现金' | '支票' | '其他';
  receiptImages: string[]; // 付款回执
  operator: string;
  createdAt: string;
}

// 账期管理
export interface CreditPeriod {
  id: string;
  supplierId: string;
  supplierName: string;
  creditDays: CreditDays;
  startDate: string;
  endDate?: string;
  status: '生效中' | '已过期' | '已暂停';
  createdAt: string;
  updatedAt: string;
}

// ==================== 供应商对账相关函数 ====================

const SUPPLIER_STATEMENTS_KEY = 'erp_supplier_statements';
const PAYMENT_RECORDS_KEY = 'erp_payment_records';
const CREDIT_PERIODS_KEY = 'erp_credit_periods';

// 初始化对账相关数据
export function initSupplierStatementData(): void {
  if (typeof window === 'undefined') return;
  
  const storedStatements = localStorage.getItem(SUPPLIER_STATEMENTS_KEY);
  if (!storedStatements) {
    localStorage.setItem(SUPPLIER_STATEMENTS_KEY, JSON.stringify([]));
  }
  
  const storedPayments = localStorage.getItem(PAYMENT_RECORDS_KEY);
  if (!storedPayments) {
    localStorage.setItem(PAYMENT_RECORDS_KEY, JSON.stringify([]));
  }
  
  const storedCreditPeriods = localStorage.getItem(CREDIT_PERIODS_KEY);
  if (!storedCreditPeriods) {
    localStorage.setItem(CREDIT_PERIODS_KEY, JSON.stringify([]));
  }
}

// 获取供应商对账单列表
export function getSupplierStatements(supplierId?: string): SupplierStatement[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(SUPPLIER_STATEMENTS_KEY);
  const statements: SupplierStatement[] = stored ? JSON.parse(stored) : [];
  return supplierId ? statements.filter(s => s.supplierId === supplierId) : statements;
}

// 获取付款记录列表
export function getPaymentRecords(supplierId?: string): PaymentRecord[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(PAYMENT_RECORDS_KEY);
  const records: PaymentRecord[] = stored ? JSON.parse(stored) : [];
  return supplierId ? records.filter(r => r.supplierId === supplierId) : records;
}

// 获取账期管理列表
export function getCreditPeriods(supplierId?: string): CreditPeriod[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(CREDIT_PERIODS_KEY);
  const periods: CreditPeriod[] = stored ? JSON.parse(stored) : [];
  return supplierId ? periods.filter(p => p.supplierId === supplierId) : periods;
}

// 生成对账单编号
export function generateStatementNo(): string {
  const statements = getSupplierStatements();
  const maxNo = statements.reduce((max, s) => {
    const num = parseInt(s.statementNo.replace('STAT', ''));
    return num > max ? num : max;
  }, 0);
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  return `STAT${dateStr}${String(maxNo + 1).padStart(4, '0')}`;
}

// 生成付款记录编号
export function generatePaymentNo(): string {
  const records = getPaymentRecords();
  const maxNo = records.reduce((max, r) => {
    const num = parseInt(r.paymentNo.replace('PAY', ''));
    return num > max ? num : max;
  }, 0);
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  return `PAY${dateStr}${String(maxNo + 1).padStart(4, '0')}`;
}

// 自动生成供应商对账单
export function generateSupplierStatement(supplierId: string, periodStart: string, periodEnd: string): SupplierStatement | null {
  const supplier = getSupplierById(supplierId);
  if (!supplier) return null;
  
  // 模拟获取该供应商在对账周期内的订单数据
  // 实际应用中应从订单系统获取
  const items: StatementItem[] = [
    {
      id: `item${Date.now() + 1}`,
      orderNo: 'ORD20240101001',
      productName: '纯棉面料',
      quantity: 1000,
      unitPrice: 50,
      amount: 50000,
      deliveryDate: '2024-01-15'
    },
    {
      id: `item${Date.now() + 2}`,
      orderNo: 'ORD20240102002',
      productName: '辅料包',
      quantity: 500,
      unitPrice: 20,
      amount: 10000,
      deliveryDate: '2024-01-20'
    }
  ];
  
  const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);
  
  // 计算到期日期（根据供应商账期）
  const dueDate = new Date(periodEnd);
  dueDate.setDate(dueDate.getDate() + supplier.creditDays);
  
  const statement: SupplierStatement = {
    id: `stat${Date.now()}`,
    statementNo: generateStatementNo(),
    supplierId,
    supplierName: supplier.supplierName,
    periodStart,
    periodEnd,
    totalAmount,
    paidAmount: 0,
    remainingAmount: totalAmount,
    dueDate: dueDate.toISOString().slice(0, 10),
    status: '待确认',
    items,
    attachments: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  // 保存对账单
  const statements = getSupplierStatements();
  statements.push(statement);
  localStorage.setItem(SUPPLIER_STATEMENTS_KEY, JSON.stringify(statements));
  
  return statement;
}

// 确认对账单
export function confirmStatement(statementId: string, confirmedBy: string): void {
  const statements = getSupplierStatements();
  const index = statements.findIndex(s => s.id === statementId);
  if (index >= 0) {
    statements[index].status = '已确认';
    statements[index].confirmedAt = new Date().toISOString();
    statements[index].updatedAt = new Date().toISOString();
    localStorage.setItem(SUPPLIER_STATEMENTS_KEY, JSON.stringify(statements));
  }
}

// 处理供应商付款
export function processSupplierPayment(
  statementId: string,
  amount: number,
  paymentMethod: '银行转账' | '现金' | '支票' | '其他',
  receiptImages: string[],
  operator: string
): PaymentRecord | null {
  const statements = getSupplierStatements();
  const statement = statements.find(s => s.id === statementId);
  if (!statement) return null;
  
  // 检查付款金额
  if (amount > statement.remainingAmount) {
    throw new Error('付款金额不能超过剩余金额');
  }
  
  // 创建付款记录
  const paymentRecord: PaymentRecord = {
    id: `pay${Date.now()}`,
    paymentNo: generatePaymentNo(),
    statementId,
    statementNo: statement.statementNo,
    supplierId: statement.supplierId,
    supplierName: statement.supplierName,
    amount,
    paymentDate: new Date().toISOString().slice(0, 10),
    paymentMethod,
    receiptImages,
    operator,
    createdAt: new Date().toISOString()
  };
  
  // 保存付款记录
  const payments = getPaymentRecords();
  payments.push(paymentRecord);
  localStorage.setItem(PAYMENT_RECORDS_KEY, JSON.stringify(payments));
  
  // 更新对账单状态
  statement.paidAmount += amount;
  statement.remainingAmount -= amount;
  statement.updatedAt = new Date().toISOString();
  
  if (statement.remainingAmount === 0) {
    statement.status = '已付款';
    statement.paidAt = new Date().toISOString();
  }
  
  localStorage.setItem(SUPPLIER_STATEMENTS_KEY, JSON.stringify(statements));
  
  return paymentRecord;
}

// 自动扣款（根据账期）
export function autoDeductPayments(): void {
  const statements = getSupplierStatements();
  const today = new Date().toISOString().slice(0, 10);
  
  for (const statement of statements) {
    if (statement.status === '已确认' && statement.dueDate <= today) {
      // 模拟自动扣款
      // 实际应用中应调用支付接口
      try {
        processSupplierPayment(
          statement.id,
          statement.remainingAmount,
          '银行转账',
          [], // 自动扣款无需回执
          '系统自动扣款'
        );
      } catch (error) {
        console.error('自动扣款失败:', error);
        // 标记为逾期
        statement.status = '已逾期';
        statement.updatedAt = new Date().toISOString();
      }
    }
  }
  
  localStorage.setItem(SUPPLIER_STATEMENTS_KEY, JSON.stringify(statements));
}

// 管理供应商账期
export function manageCreditPeriod(supplierId: string, creditDays: CreditDays): CreditPeriod {
  const supplier = getSupplierById(supplierId);
  if (!supplier) {
    throw new Error('供应商不存在');
  }
  
  // 停用之前的账期
  const periods = getCreditPeriods(supplierId);
  periods.forEach(period => {
    if (period.status === '生效中') {
      period.status = '已过期';
      period.endDate = new Date().toISOString().slice(0, 10);
      period.updatedAt = new Date().toISOString();
    }
  });
  
  // 创建新账期
  const newPeriod: CreditPeriod = {
    id: `credit${Date.now()}`,
    supplierId,
    supplierName: supplier.supplierName,
    creditDays,
    startDate: new Date().toISOString().slice(0, 10),
    status: '生效中',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  periods.push(newPeriod);
  localStorage.setItem(CREDIT_PERIODS_KEY, JSON.stringify(periods));
  
  // 更新供应商的账期信息
  supplier.creditDays = creditDays;
  saveSupplier(supplier);
  
  return newPeriod;
}

// 上传对账单附件
export async function uploadStatementAttachments(statementId: string, files: File[]): Promise<string[]> {
  const statements = getSupplierStatements();
  const statement = statements.find(s => s.id === statementId);
  if (!statement) {
    throw new Error('对账单不存在');
  }
  
  // 上传文件
  // 实际应用中应上传到服务器
  const uploadedFiles: string[] = [];
  for (const file of files) {
    const fileName = `attachment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}${file.name}`;
    uploadedFiles.push(fileName);
  }
  
  // 更新对账单附件
  statement.attachments = [...statement.attachments, ...uploadedFiles];
  statement.updatedAt = new Date().toISOString();
  
  localStorage.setItem(SUPPLIER_STATEMENTS_KEY, JSON.stringify(statements));
  
  return uploadedFiles;
}

// 获取供应商对账统计
export function getSupplierStatementSummary(supplierId: string): {
  totalStatements: number;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  overdueAmount: number;
} {
  const statements = getSupplierStatements(supplierId);
  const today = new Date().toISOString().slice(0, 10);
  
  const totalStatements = statements.length;
  const totalAmount = statements.reduce((sum, s) => sum + s.totalAmount, 0);
  const paidAmount = statements.reduce((sum, s) => sum + s.paidAmount, 0);
  const remainingAmount = statements.reduce((sum, s) => sum + s.remainingAmount, 0);
  const overdueAmount = statements
    .filter(s => s.status === '已逾期')
    .reduce((sum, s) => sum + s.remainingAmount, 0);
  
  return {
    totalStatements,
    totalAmount,
    paidAmount,
    remainingAmount,
    overdueAmount
  };
}
