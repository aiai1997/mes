/**
 * 计件工资相关类型定义
 */

// 工序类型
export type ProcessType = '裁床' | '缝纫' | '锁边' | '整烫' | '包装' | '检验' | '其他';

// 工序状态
export type ProcessStatus = '启用' | '禁用';

// 工序
export interface Process {
  id: string;
  processCode: string;
  processName: string;
  processType: ProcessType;
  unitPrice: number; // 单价
  unit: string; // 单位（件、套、打等）
  description: string;
  status: ProcessStatus;
  createdAt: string;
  updatedAt: string;
}

// 计件记录
export interface PieceRateRecord {
  id: string;
  recordNo: string;
  employeeId: string;
  employeeName: string;
  processId: string;
  processName: string;
  processCode: string;
  quantity: number; // 数量
  unitPrice: number; // 单价
  amount: number; // 金额
  workDate: string; // 工作日期
  workTime: number; // 工作时间（小时）
  isOvertime: boolean; // 是否加班
  overtimeMultiplier: number; // 加班倍数
  remarks: string;
  createdAt: string;
  updatedAt: string;
}

// 工资核算项目
export type SalaryItemType = '计件工资' | '加班工资' | '奖金' | '罚款' | '社保' | '公积金' | '其他';

// 工资核算项目
export interface SalaryItem {
  id: string;
  itemName: string;
  itemType: SalaryItemType;
  amount: number;
  isDeduction: boolean; // 是否为扣除项
  description: string;
  createdAt: string;
}

// 工资条
export interface PaySlip {
  id: string;
  paySlipNo: string;
  employeeId: string;
  employeeName: string;
  department: string;
  position: string;
  period: string; // 工资周期（如：2024-03）
  basicSalary: number; // 基本工资
  pieceRateSalary: number; // 计件工资
  overtimeSalary: number; // 加班工资
  bonus: number; // 奖金
  deductions: number; // 扣除项总额
  socialSecurity: number; // 社保
  housingFund: number; // 公积金
  tax: number; // 个人所得税
  netSalary: number; // 实发工资
  items: SalaryItem[]; // 工资项目明细
  status: '待审核' | '已审核' | '已发放';
  issuedAt?: string; // 发放时间
  createdAt: string;
  updatedAt: string;
}

// 工资报表
export interface SalaryReport {
  id: string;
  reportNo: string;
  period: string; // 报表周期（如：2024-03）
  totalEmployees: number; // 员工总数
  totalBasicSalary: number; // 基本工资总额
  totalPieceRateSalary: number; // 计件工资总额
  totalOvertimeSalary: number; // 加班工资总额
  totalBonus: number; // 奖金总额
  totalDeductions: number; // 扣除项总额
  totalSocialSecurity: number; // 社保总额
  totalHousingFund: number; // 公积金总额
  totalTax: number; // 个人所得税总额
  totalNetSalary: number; // 实发工资总额
  employeeDetails: Array<{
    employeeId: string;
    employeeName: string;
    department: string;
    position: string;
    basicSalary: number;
    pieceRateSalary: number;
    overtimeSalary: number;
    bonus: number;
    deductions: number;
    socialSecurity: number;
    housingFund: number;
    tax: number;
    netSalary: number;
  }>;
  status: '草稿' | '已生成' | '已审核';
  createdAt: string;
  updatedAt: string;
}

// 工人绩效
export interface EmployeePerformance {
  employeeId: string;
  employeeName: string;
  department: string;
  position: string;
  period: string;
  totalQuantity: number; // 总数量
  totalAmount: number; // 总金额
  averageWage: number; // 平均工资
  performanceRank: number; // 绩效排名
  processDetails: Array<{
    processId: string;
    processName: string;
    quantity: number;
    amount: number;
  }>;
  createdAt: string;
}

// ==================== 数据操作函数 ====================

import { DB_KEYS } from '@/lib/database';

const PROCESSES_KEY = 'erp_processes';
const PIECE_RATE_RECORDS_KEY = 'erp_piece_rate_records';
const PAY_SLIPS_KEY = 'erp_pay_slips';
const SALARY_REPORTS_KEY = 'erp_salary_reports';

// 初始化计件工资数据
export function initPieceRateData(): void {
  if (typeof window === 'undefined') return;
  
  // 初始化工序数据
  const storedProcesses = localStorage.getItem(PROCESSES_KEY);
  if (!storedProcesses) {
    const defaultProcesses: Process[] = [
      {
        id: 'process_1',
        processCode: 'PROC001',
        processName: '裁床',
        processType: '裁床',
        unitPrice: 5.00,
        unit: '件',
        description: '裁剪面料',
        status: '启用',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'process_2',
        processCode: 'PROC002',
        processName: '缝纫',
        processType: '缝纫',
        unitPrice: 8.00,
        unit: '件',
        description: '缝制服装',
        status: '启用',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'process_3',
        processCode: 'PROC003',
        processName: '锁边',
        processType: '锁边',
        unitPrice: 2.00,
        unit: '件',
        description: '锁边处理',
        status: '启用',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'process_4',
        processCode: 'PROC004',
        processName: '整烫',
        processType: '整烫',
        unitPrice: 3.00,
        unit: '件',
        description: '整烫服装',
        status: '启用',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'process_5',
        processCode: 'PROC005',
        processName: '包装',
        processType: '包装',
        unitPrice: 1.50,
        unit: '件',
        description: '包装服装',
        status: '启用',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
    localStorage.setItem(PROCESSES_KEY, JSON.stringify(defaultProcesses));
  }
  
  // 初始化其他数据
  if (!localStorage.getItem(PIECE_RATE_RECORDS_KEY)) {
    localStorage.setItem(PIECE_RATE_RECORDS_KEY, JSON.stringify([]));
  }
  
  if (!localStorage.getItem(PAY_SLIPS_KEY)) {
    localStorage.setItem(PAY_SLIPS_KEY, JSON.stringify([]));
  }
  
  if (!localStorage.getItem(SALARY_REPORTS_KEY)) {
    localStorage.setItem(SALARY_REPORTS_KEY, JSON.stringify([]));
  }
}

// 生成工序编号
export function generateProcessCode(): string {
  if (typeof window === 'undefined') return 'PROC001';
  
  const processes = getProcesses();
  const maxCode = processes.reduce((max, p) => {
    const num = parseInt(p.processCode.replace('PROC', ''));
    return num > max ? num : max;
  }, 0);
  return `PROC${String(maxCode + 1).padStart(3, '0')}`;
}

// 生成计件记录编号
export function generateRecordNo(): string {
  if (typeof window === 'undefined') return 'PR' + new Date().toISOString().slice(0, 10).replace(/-/g, '') + '001';
  
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const records = getPieceRateRecords();
  const todayRecords = records.filter(r => r.recordNo.includes(dateStr));
  const maxSeq = todayRecords.length > 0 
    ? Math.max(...todayRecords.map(r => parseInt(r.recordNo.slice(-3)))) 
    : 0;
  const seq = String(maxSeq + 1).padStart(3, '0');
  return `PR${dateStr}${seq}`;
}

// 生成工资条编号
export function generatePaySlipNo(): string {
  if (typeof window === 'undefined') return 'PS' + new Date().toISOString().slice(0, 7).replace(/-/g, '') + '001';
  
  const now = new Date();
  const periodStr = now.toISOString().slice(0, 7).replace(/-/g, '');
  const paySlips = getPaySlips();
  const periodPaySlips = paySlips.filter(p => p.paySlipNo.includes(periodStr));
  const maxSeq = periodPaySlips.length > 0 
    ? Math.max(...periodPaySlips.map(p => parseInt(p.paySlipNo.slice(-3)))) 
    : 0;
  const seq = String(maxSeq + 1).padStart(3, '0');
  return `PS${periodStr}${seq}`;
}

// 生成工资报表编号
export function generateReportNo(): string {
  if (typeof window === 'undefined') return 'SR' + new Date().toISOString().slice(0, 7).replace(/-/g, '') + '001';
  
  const now = new Date();
  const periodStr = now.toISOString().slice(0, 7).replace(/-/g, '');
  const reports = getSalaryReports();
  const periodReports = reports.filter(r => r.reportNo.includes(periodStr));
  const maxSeq = periodReports.length > 0 
    ? Math.max(...periodReports.map(r => parseInt(r.reportNo.slice(-3)))) 
    : 0;
  const seq = String(maxSeq + 1).padStart(3, '0');
  return `SR${periodStr}${seq}`;
}

// 获取工序列表
export function getProcesses(): Process[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(PROCESSES_KEY);
  return stored ? JSON.parse(stored) : [];
}

// 获取计件记录列表
export function getPieceRateRecords(employeeId?: string, period?: string): PieceRateRecord[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(PIECE_RATE_RECORDS_KEY);
  let records: PieceRateRecord[] = stored ? JSON.parse(stored) : [];
  
  if (employeeId) {
    records = records.filter(r => r.employeeId === employeeId);
  }
  
  if (period) {
    records = records.filter(r => r.workDate.startsWith(period));
  }
  
  return records;
}

// 获取工资条列表
export function getPaySlips(employeeId?: string, period?: string): PaySlip[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(PAY_SLIPS_KEY);
  let paySlips: PaySlip[] = stored ? JSON.parse(stored) : [];
  
  if (employeeId) {
    paySlips = paySlips.filter(p => p.employeeId === employeeId);
  }
  
  if (period) {
    paySlips = paySlips.filter(p => p.period === period);
  }
  
  return paySlips;
}

// 获取工资报表列表
export function getSalaryReports(period?: string): SalaryReport[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(SALARY_REPORTS_KEY);
  let reports: SalaryReport[] = stored ? JSON.parse(stored) : [];
  
  if (period) {
    reports = reports.filter(r => r.period === period);
  }
  
  return reports;
}

// 保存工序
export function saveProcess(process: Process): void {
  if (typeof window === 'undefined') return;
  const processes = getProcesses();
  const index = processes.findIndex(p => p.id === process.id);
  if (index >= 0) {
    processes[index] = { ...process, updatedAt: new Date().toISOString() };
  } else {
    processes.push(process);
  }
  localStorage.setItem(PROCESSES_KEY, JSON.stringify(processes));
}

// 保存计件记录
export function savePieceRateRecord(record: PieceRateRecord): void {
  if (typeof window === 'undefined') return;
  const records = getPieceRateRecords();
  const index = records.findIndex(r => r.id === record.id);
  if (index >= 0) {
    records[index] = { ...record, updatedAt: new Date().toISOString() };
  } else {
    records.push(record);
  }
  localStorage.setItem(PIECE_RATE_RECORDS_KEY, JSON.stringify(records));
}

// 保存工资条
export function savePaySlip(paySlip: PaySlip): void {
  if (typeof window === 'undefined') return;
  const paySlips = getPaySlips();
  const index = paySlips.findIndex(p => p.id === paySlip.id);
  if (index >= 0) {
    paySlips[index] = { ...paySlip, updatedAt: new Date().toISOString() };
  } else {
    paySlips.push(paySlip);
  }
  localStorage.setItem(PAY_SLIPS_KEY, JSON.stringify(paySlips));
}

// 保存工资报表
export function saveSalaryReport(report: SalaryReport): void {
  if (typeof window === 'undefined') return;
  const reports = getSalaryReports();
  const index = reports.findIndex(r => r.id === report.id);
  if (index >= 0) {
    reports[index] = { ...report, updatedAt: new Date().toISOString() };
  } else {
    reports.push(report);
  }
  localStorage.setItem(SALARY_REPORTS_KEY, JSON.stringify(reports));
}

// 计算计件工资
export function calculatePieceRateSalary(employeeId: string, period: string): number {
  const records = getPieceRateRecords(employeeId, period);
  return records.reduce((total, record) => {
    let amount = record.amount;
    if (record.isOvertime && record.overtimeMultiplier > 1) {
      amount *= record.overtimeMultiplier;
    }
    return total + amount;
  }, 0);
}

// 计算加班工资
export function calculateOvertimeSalary(employeeId: string, period: string): number {
  const records = getPieceRateRecords(employeeId, period);
  return records.reduce((total, record) => {
    if (record.isOvertime && record.overtimeMultiplier > 1) {
      const baseAmount = record.amount;
      const overtimeAmount = baseAmount * (record.overtimeMultiplier - 1);
      return total + overtimeAmount;
    }
    return total;
  }, 0);
}

// 生成工资条
export function generatePaySlip(employeeId: string, employeeName: string, department: string, position: string, period: string, basicSalary: number, bonus: number, deductions: number, socialSecurity: number, housingFund: number): PaySlip {
  const pieceRateSalary = calculatePieceRateSalary(employeeId, period);
  const overtimeSalary = calculateOvertimeSalary(employeeId, period);
  
  // 计算个人所得税（简化计算）
  const taxableIncome = basicSalary + pieceRateSalary + overtimeSalary + bonus - deductions - socialSecurity - housingFund - 5000;
  const tax = taxableIncome > 0 ? taxableIncome * 0.03 : 0;
  
  const netSalary = basicSalary + pieceRateSalary + overtimeSalary + bonus - deductions - socialSecurity - housingFund - tax;
  
  const items: SalaryItem[] = [
    {
      id: `item_${Date.now()}_1`,
      itemName: '基本工资',
      itemType: '计件工资',
      amount: basicSalary,
      isDeduction: false,
      description: '基本工资',
      createdAt: new Date().toISOString()
    },
    {
      id: `item_${Date.now()}_2`,
      itemName: '计件工资',
      itemType: '计件工资',
      amount: pieceRateSalary,
      isDeduction: false,
      description: '计件工资',
      createdAt: new Date().toISOString()
    },
    {
      id: `item_${Date.now()}_3`,
      itemName: '加班工资',
      itemType: '加班工资',
      amount: overtimeSalary,
      isDeduction: false,
      description: '加班工资',
      createdAt: new Date().toISOString()
    },
    {
      id: `item_${Date.now()}_4`,
      itemName: '奖金',
      itemType: '奖金',
      amount: bonus,
      isDeduction: false,
      description: '奖金',
      createdAt: new Date().toISOString()
    },
    {
      id: `item_${Date.now()}_5`,
      itemName: '扣除项',
      itemType: '其他',
      amount: deductions,
      isDeduction: true,
      description: '扣除项',
      createdAt: new Date().toISOString()
    },
    {
      id: `item_${Date.now()}_6`,
      itemName: '社保',
      itemType: '社保',
      amount: socialSecurity,
      isDeduction: true,
      description: '社保',
      createdAt: new Date().toISOString()
    },
    {
      id: `item_${Date.now()}_7`,
      itemName: '公积金',
      itemType: '公积金',
      amount: housingFund,
      isDeduction: true,
      description: '公积金',
      createdAt: new Date().toISOString()
    },
    {
      id: `item_${Date.now()}_8`,
      itemName: '个人所得税',
      itemType: '其他',
      amount: tax,
      isDeduction: true,
      description: '个人所得税',
      createdAt: new Date().toISOString()
    }
  ];
  
  const paySlip: PaySlip = {
    id: `pay_slip_${Date.now()}`,
    paySlipNo: generatePaySlipNo(),
    employeeId,
    employeeName,
    department,
    position,
    period,
    basicSalary,
    pieceRateSalary,
    overtimeSalary,
    bonus,
    deductions,
    socialSecurity,
    housingFund,
    tax,
    netSalary,
    items,
    status: '待审核',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  savePaySlip(paySlip);
  return paySlip;
}

// 生成工资报表
export function generateSalaryReport(period: string, employees: Array<{id: string; name: string; department: string; position: string; basicSalary: number; bonus: number; deductions: number; socialSecurity: number; housingFund: number}>): SalaryReport {
  const employeeDetails = employees.map(employee => {
    const pieceRateSalary = calculatePieceRateSalary(employee.id, period);
    const overtimeSalary = calculateOvertimeSalary(employee.id, period);
    const taxableIncome = employee.basicSalary + pieceRateSalary + overtimeSalary + employee.bonus - employee.deductions - employee.socialSecurity - employee.housingFund - 5000;
    const tax = taxableIncome > 0 ? taxableIncome * 0.03 : 0;
    const netSalary = employee.basicSalary + pieceRateSalary + overtimeSalary + employee.bonus - employee.deductions - employee.socialSecurity - employee.housingFund - tax;
    
    return {
      employeeId: employee.id,
      employeeName: employee.name,
      department: employee.department,
      position: employee.position,
      basicSalary: employee.basicSalary,
      pieceRateSalary,
      overtimeSalary,
      bonus: employee.bonus,
      deductions: employee.deductions,
      socialSecurity: employee.socialSecurity,
      housingFund: employee.housingFund,
      tax,
      netSalary
    };
  });
  
  const totalBasicSalary = employeeDetails.reduce((sum, emp) => sum + emp.basicSalary, 0);
  const totalPieceRateSalary = employeeDetails.reduce((sum, emp) => sum + emp.pieceRateSalary, 0);
  const totalOvertimeSalary = employeeDetails.reduce((sum, emp) => sum + emp.overtimeSalary, 0);
  const totalBonus = employeeDetails.reduce((sum, emp) => sum + emp.bonus, 0);
  const totalDeductions = employeeDetails.reduce((sum, emp) => sum + emp.deductions, 0);
  const totalSocialSecurity = employeeDetails.reduce((sum, emp) => sum + emp.socialSecurity, 0);
  const totalHousingFund = employeeDetails.reduce((sum, emp) => sum + emp.housingFund, 0);
  const totalTax = employeeDetails.reduce((sum, emp) => sum + emp.tax, 0);
  const totalNetSalary = employeeDetails.reduce((sum, emp) => sum + emp.netSalary, 0);
  
  const report: SalaryReport = {
    id: `salary_report_${Date.now()}`,
    reportNo: generateReportNo(),
    period,
    totalEmployees: employeeDetails.length,
    totalBasicSalary,
    totalPieceRateSalary,
    totalOvertimeSalary,
    totalBonus,
    totalDeductions,
    totalSocialSecurity,
    totalHousingFund,
    totalTax,
    totalNetSalary,
    employeeDetails,
    status: '已生成',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  saveSalaryReport(report);
  return report;
}

// 获取工人绩效
export function getEmployeePerformance(employeeId: string, period: string): EmployeePerformance | null {
  const records = getPieceRateRecords(employeeId, period);
  if (records.length === 0) return null;
  
  const totalQuantity = records.reduce((sum, record) => sum + record.quantity, 0);
  const totalAmount = records.reduce((sum, record) => sum + record.amount, 0);
  
  // 计算平均工资（假设工作30天）
  const averageWage = totalAmount / 30;
  
  // 按工序分组统计
  const processMap = new Map<string, {processId: string; processName: string; quantity: number; amount: number}>();
  records.forEach(record => {
    if (!processMap.has(record.processId)) {
      processMap.set(record.processId, {
        processId: record.processId,
        processName: record.processName,
        quantity: 0,
        amount: 0
      });
    }
    const process = processMap.get(record.processId)!;
    process.quantity += record.quantity;
    process.amount += record.amount;
  });
  
  const processDetails = Array.from(processMap.values());
  
  // 计算绩效排名（简化计算，实际应该根据所有员工的绩效进行排名）
  const performanceRank = 1;
  
  return {
    employeeId,
    employeeName: records[0].employeeName,
    department: '', // 实际应该从员工信息中获取
    position: '', // 实际应该从员工信息中获取
    period,
    totalQuantity,
    totalAmount,
    averageWage,
    performanceRank,
    processDetails,
    createdAt: new Date().toISOString()
  };
}
