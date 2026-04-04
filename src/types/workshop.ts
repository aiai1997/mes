export type WorkReportStatus = '待审核' | '已审核' | '已结算' | '已作废';
export type ScrapReason = '裁片问题' | '缝制不良' | '辅料问题' | '人为失误' | '其他';

export interface StandardProcess {
  id: string;
  processCode: string;
  processName: string;
  category: string;
  standardPrice: number;
  processOrder: number;
  isActive: boolean;
}

export interface Bundle {
  id: string;
  bundleNo: string;
  orderNo: string;
  bomNo: string;
  styleNo: string;
  productName: string;
  colorName: string;
  sizeName: string;
  totalQuantity: number;
  cuttedQuantity: number;
  currentProcess: string;
  completedProcesses: string[];
  status: '待缝制' | '缝制中' | '已完成' | '已转入尾部';
  bedNo: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkReport {
  id: string;
  reportNo: string;
  bundleNo: string;
  orderNo: string;
  bomNo: string;
  styleNo: string;
  productName: string;
  colorName: string;
  sizeName: string;
  bundleQuantity: number;
  processName: string;
  processCode: string;
  processPrice: number;
  goodQuantity: number;
  reworkQuantity: number;
  scrapQuantity: number;
  scrapReason?: ScrapReason;
  pieceWage: number;
  worker: string;
  team: string;
  status: WorkReportStatus;
  remark: string;
  auditedBy?: string;
  auditedAt?: string;
  createdAt: string;
  updatedAt: string;
}

const BUNDLES_KEY = 'erp_bundles';
const REPORTS_KEY = 'erp_work_reports';
const PROCESSES_KEY = 'erp_standard_processes';

let bundles: Bundle[] = [];
let workReports: WorkReport[] = [];
let standardProcesses: StandardProcess[] = [];

export function initWorkshopData(): void {
  if (typeof window === 'undefined') return;
  
  // 初始化标准工序库
  const storedProcesses = localStorage.getItem(PROCESSES_KEY);
  if (storedProcesses) {
    standardProcesses = JSON.parse(storedProcesses);
  } else {
    standardProcesses = [
      { id: '1', processCode: 'P001', processName: '合肩', category: '缝制', standardPrice: 0.5, processOrder: 1, isActive: true },
      { id: '2', processCode: 'P002', processName: '锁边', category: '缝制', standardPrice: 0.3, processOrder: 2, isActive: true },
      { id: '3', processCode: 'P003', processName: '开袋', category: '缝制', standardPrice: 0.8, processOrder: 3, isActive: true },
      { id: '4', processCode: 'P004', processName: '上领', category: '缝制', standardPrice: 1.0, processOrder: 4, isActive: true },
      { id: '5', processCode: 'P005', processName: '装袖', category: '缝制', standardPrice: 0.9, processOrder: 5, isActive: true },
      { id: '6', processCode: 'P006', processName: '门襟缝制', category: '缝制', standardPrice: 1.2, processOrder: 6, isActive: true },
      { id: '7', processCode: 'P007', processName: '钉扣', category: '缝制', standardPrice: 0.2, processOrder: 7, isActive: true },
      { id: '8', processCode: 'P008', processName: '合缝', category: '缝制', standardPrice: 0.6, processOrder: 8, isActive: true },
      { id: '9', processCode: 'P009', processName: '整烫初整', category: '缝制', standardPrice: 0.6, processOrder: 9, isActive: true },
      { id: '10', processCode: 'P010', processName: '质检初检', category: '质检', standardPrice: 0.4, processOrder: 10, isActive: true },
    ];
    localStorage.setItem(PROCESSES_KEY, JSON.stringify(standardProcesses));
  }

  // 初始化扎号数据
  const storedBundles = localStorage.getItem(BUNDLES_KEY);
  if (storedBundles) {
    bundles = JSON.parse(storedBundles);
  } else {
    bundles = [
      {
        id: '1',
        bundleNo: 'BN20250101001',
        orderNo: 'ORD20250101001',
        bomNo: 'BOM20250101001',
        styleNo: 'ST001',
        productName: '男士T恤',
        colorName: '黑色',
        sizeName: 'M',
        totalQuantity: 50,
        cuttedQuantity: 50,
        currentProcess: '合肩',
        completedProcesses: [],
        status: '待缝制',
        bedNo: 'BED001',
        createdAt: '2025-01-01 08:00:00',
        updatedAt: '2025-01-01 08:00:00',
      },
      {
        id: '2',
        bundleNo: 'BN20250101002',
        orderNo: 'ORD20250101001',
        bomNo: 'BOM20250101001',
        styleNo: 'ST001',
        productName: '男士T恤',
        colorName: '黑色',
        sizeName: 'L',
        totalQuantity: 50,
        cuttedQuantity: 50,
        currentProcess: '合肩',
        completedProcesses: [],
        status: '待缝制',
        bedNo: 'BED001',
        createdAt: '2025-01-01 08:00:00',
        updatedAt: '2025-01-01 08:00:00',
      },
    ];
    localStorage.setItem(BUNDLES_KEY, JSON.stringify(bundles));
  }

  // 初始化报工记录
  const storedReports = localStorage.getItem(REPORTS_KEY);
  if (storedReports) {
    workReports = JSON.parse(storedReports);
  } else {
    workReports = [
      {
        id: '1',
        reportNo: 'WO20250101001',
        bundleNo: 'BN20250101001',
        orderNo: 'ORD20250101001',
        bomNo: 'BOM20250101001',
        styleNo: 'ST001',
        productName: '男士T恤',
        colorName: '黑色',
        sizeName: 'M',
        bundleQuantity: 50,
        processName: '合肩',
        processCode: 'P001',
        processPrice: 0.5,
        goodQuantity: 48,
        reworkQuantity: 2,
        scrapQuantity: 0,
        pieceWage: 24.0,
        worker: '王五',
        team: '缝制一组',
        status: '待审核',
        remark: '',
        createdAt: '2025-01-01 14:00:00',
        updatedAt: '2025-01-01 14:00:00',
      },
    ];
    localStorage.setItem(REPORTS_KEY, JSON.stringify(workReports));
  }
}

export function getBundles(): Bundle[] {
  return [...bundles].sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
}

export function getBundleByNo(bundleNo: string): Bundle | undefined {
  return bundles.find(b => b.bundleNo === bundleNo);
}

export function saveBundle(bundle: Bundle): void {
  const index = bundles.findIndex(b => b.id === bundle.id);
  if (index >= 0) {
    bundles[index] = bundle;
  } else {
    bundles.push(bundle);
  }
  localStorage.setItem(BUNDLES_KEY, JSON.stringify(bundles));
}

export function getWorkReports(): WorkReport[] {
  return [...workReports].sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
}

export function getWorkReportById(id: string): WorkReport | undefined {
  return workReports.find(r => r.id === id);
}

export function saveWorkReport(report: WorkReport): void {
  const index = workReports.findIndex(r => r.id === report.id);
  if (index >= 0) {
    workReports[index] = report;
  } else {
    workReports.push(report);
  }
  localStorage.setItem(REPORTS_KEY, JSON.stringify(workReports));
}

export function getProcesses(): StandardProcess[] {
  return [...standardProcesses].sort((a, b) => a.processOrder - b.processOrder);
}

export function getProcessByCode(code: string): StandardProcess | undefined {
  return standardProcesses.find(p => p.processCode === code);
}

export function auditWorkReport(reportId: string, auditor: string): void {
  const report = workReports.find(r => r.id === reportId);
  if (report) {
    report.status = '已审核';
    report.auditedBy = auditor;
    report.auditedAt = new Date().toLocaleString('zh-CN');
    report.updatedAt = new Date().toLocaleString('zh-CN');
    
    // 更新扎号状态
    const bundle = bundles.find(b => b.bundleNo === report.bundleNo);
    if (bundle) {
      bundle.completedProcesses.push(report.processName);
      
      // 检查是否还有下一道工序
      const currentProcessIndex = standardProcesses.findIndex(p => p.processName === report.processName);
      const nextProcess = standardProcesses[currentProcessIndex + 1];
      
      if (nextProcess && nextProcess.isActive) {
        bundle.currentProcess = nextProcess.processName;
        bundle.status = '缝制中';
      } else {
        // 所有工序完成，转入尾部
        bundle.status = '已转入尾部';
        bundle.currentProcess = '';
        
        // 创建尾部任务
        createTailTaskFromBundle(bundle);
      }
      
      bundle.updatedAt = new Date().toLocaleString('zh-CN');
      localStorage.setItem(BUNDLES_KEY, JSON.stringify(bundles));
    }
    
    localStorage.setItem(REPORTS_KEY, JSON.stringify(workReports));
  }
}

/**
 * 扎号完成后自动创建尾部任务
 */
function createTailTaskFromBundle(bundle: Bundle): void {
  if (typeof window === 'undefined') return;
  
  const TAIL_TASKS_KEY = 'erp_tail_tasks';
  const stored = localStorage.getItem(TAIL_TASKS_KEY);
  let tailTasks: any[] = stored ? JSON.parse(stored) : [];
  
  // 检查是否已存在
  const exists = tailTasks.some(t => t.bundleNo === bundle.bundleNo);
  if (exists) return;
  
  // 获取尾部工序
  const TAIL_PROCESSES_KEY = 'erp_tail_processes';
  const storedProcesses = localStorage.getItem(TAIL_PROCESSES_KEY);
  let tailProcesses: { processName: string; processOrder: number }[] = [];
  if (storedProcesses) {
    tailProcesses = JSON.parse(storedProcesses).sort((a: any, b: any) => a.processOrder - b.processOrder);
  }
  const firstProcess = tailProcesses.length > 0 ? tailProcesses[0].processName : '整烫精整';
  
  const now = new Date().toLocaleString('zh-CN');
  
  const tailTask = {
    id: `TT${Date.now()}`,
    taskNo: `TT${new Date().toISOString().slice(0, 10).replace(/-/g, '')}${(tailTasks.length + 1).toString().padStart(3, '0')}`,
    bundleNo: bundle.bundleNo,
    orderNo: bundle.orderNo,
    bomNo: bundle.bomNo,
    styleNo: bundle.styleNo,
    productName: bundle.productName,
    colorName: bundle.colorName,
    sizeName: bundle.sizeName,
    bundleQuantity: bundle.totalQuantity,
    goodQuantity: 0,
    reworkQuantity: 0,
    currentProcess: firstProcess,
    completedProcesses: [],
    status: '待尾部',
    pieceWage: 0,
    operator: '',
    remark: '',
    createdAt: now,
    updatedAt: now,
  };
  
  tailTasks.push(tailTask);
  localStorage.setItem(TAIL_TASKS_KEY, JSON.stringify(tailTasks));
}

export function cancelWorkReport(reportId: string): void {
  const report = workReports.find(r => r.id === reportId);
  if (report) {
    report.status = '已作废';
    report.updatedAt = new Date().toLocaleString('zh-CN');
    localStorage.setItem(REPORTS_KEY, JSON.stringify(workReports));
  }
}

export function generateReportNo(): string {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const todayReports = workReports.filter(r => r.reportNo.includes(dateStr));
  const seq = (todayReports.length + 1).toString().padStart(3, '0');
  return `WO${dateStr}${seq}`;
}

export function generateBundleNo(): string {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const seq = (bundles.length + 1).toString().padStart(3, '0');
  return `BN${dateStr}${seq}`;
}
