// 系统日志
export type LogAction = '登录' | '新增' | '编辑' | '删除' | '审核' | '作废' | '导出' | '打印' | '发货' | '修改成本';
export type LogModule = '订单管理' | 'BOM管理' | '裁床管理' | '车间报工' | '财务成本' | '系统设置' | '外协管理' | '库存管理';

export interface SystemLog {
  id: string;
  logNo: string;
  module: LogModule;
  action: LogAction;
  description: string;
  operator: string;
  ip: string;
  operateTime: string;
}

// 打印模板
export type PrintTemplateType = '扎号标签' | '装箱单' | '送货单' | '外协单' | '生产流程卡';

export interface PrintTemplate {
  id: string;
  templateCode: string;
  templateName: string;
  templateType: PrintTemplateType;
  paperWidth: number;
  paperHeight: number;
  barcodeType: string;
  hasLogo: boolean;
  isActive: boolean;
  createdAt: string;
}

// 默认打印模板
export const defaultPrintTemplates: PrintTemplate[] = [
  { id: '1', templateCode: 'TPL001', templateName: '扎号标签-标准', templateType: '扎号标签', paperWidth: 50, paperHeight: 30, barcodeType: 'Code128', hasLogo: false, isActive: true, createdAt: '2026-01-01' },
  { id: '2', templateCode: 'TPL002', templateName: '装箱单-A4', templateType: '装箱单', paperWidth: 210, paperHeight: 297, barcodeType: 'QRCode', hasLogo: true, isActive: true, createdAt: '2026-01-01' },
  { id: '3', templateCode: 'TPL003', templateName: '送货单-A4', templateType: '送货单', paperWidth: 210, paperHeight: 297, barcodeType: 'Code128', hasLogo: true, isActive: true, createdAt: '2026-01-01' },
  { id: '4', templateCode: 'TPL004', templateName: '外协加工单', templateType: '外协单', paperWidth: 210, paperHeight: 140, barcodeType: 'Code128', hasLogo: false, isActive: true, createdAt: '2026-01-01' },
  { id: '5', templateCode: 'TPL005', templateName: '生产流程卡', templateType: '生产流程卡', paperWidth: 100, paperHeight: 70, barcodeType: 'QRCode', hasLogo: true, isActive: true, createdAt: '2026-01-01' },
];

// 默认系统日志
export const defaultSystemLogs: SystemLog[] = [
  { id: '1', logNo: 'LOG001', module: '订单管理', action: '新增', description: '新增订单 ORD20260331001', operator: '张三', ip: '192.168.1.100', operateTime: '2026-03-15 09:30:00' },
  { id: '2', logNo: 'LOG002', module: '订单管理', action: '审核', description: '审核订单 ORD20260331001', operator: '审核员', ip: '192.168.1.101', operateTime: '2026-03-15 14:20:00' },
  { id: '3', logNo: 'LOG003', module: 'BOM管理', action: '新增', description: '新增BOM单 BOM001', operator: '李四', ip: '192.168.1.102', operateTime: '2026-03-16 10:15:00' },
  { id: '4', logNo: 'LOG004', module: '系统设置', action: '登录', description: '用户登录系统', operator: 'admin', ip: '192.168.1.1', operateTime: '2026-03-17 08:00:00' },
  { id: '5', logNo: 'LOG005', module: '裁床管理', action: '新增', description: '新增裁床单 CD001', operator: '王五', ip: '192.168.1.103', operateTime: '2026-03-17 09:30:00' },
];

const LOGS_KEY = 'erp_system_logs';
const TEMPLATES_KEY = 'erp_print_templates';

export function initSystemLogData(): void {
  if (typeof window === 'undefined') return;
  const storedLogs = localStorage.getItem(LOGS_KEY);
  if (!storedLogs) {
    localStorage.setItem(LOGS_KEY, JSON.stringify(defaultSystemLogs));
  }
  const storedTemplates = localStorage.getItem(TEMPLATES_KEY);
  if (!storedTemplates) {
    localStorage.setItem(TEMPLATES_KEY, JSON.stringify(defaultPrintTemplates));
  }
}

export const initPrintTemplateData = initSystemLogData;

export function getSystemLogs(): SystemLog[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(LOGS_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function addSystemLog(log: Omit<SystemLog, 'id' | 'logNo' | 'operateTime'>): void {
  if (typeof window === 'undefined') return;
  const logs = getSystemLogs();
  const newLog: SystemLog = {
    ...log,
    id: Date.now().toString(),
    logNo: 'LOG' + String(logs.length + 1).padStart(3, '0'),
    operateTime: new Date().toLocaleString('zh-CN'),
  };
  logs.unshift(newLog);
  // 只保留最近1000条日志
  if (logs.length > 1000) {
    logs.pop();
  }
  localStorage.setItem(LOGS_KEY, JSON.stringify(logs));
}

export function getPrintTemplates(): PrintTemplate[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(TEMPLATES_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function savePrintTemplate(template: PrintTemplate): void {
  if (typeof window === 'undefined') return;
  const templates = getPrintTemplates();
  const index = templates.findIndex(t => t.id === template.id);
  if (index >= 0) {
    templates[index] = template;
  } else {
    templates.push(template);
  }
  localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates));
}
