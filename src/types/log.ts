// 操作日志系统

export type LogAction = 
  | '创建' | '修改' | '删除' | '审核' | '反审核' 
  | '下达' | '完成' | '作废' | '导出' | '打印'
  | '报工' | '入库' | '出库' | '发货' | '结算';

export type LogModule = 
  | '订单管理' | 'BOM管理' | '裁床管理' | '车间报工' 
  | '尾部管理' | '库存管理' | '发货管理' | '财务管理'
  | '用户管理' | '系统设置' | '基础资料';

export interface OperationLog {
  id: string;
  module: LogModule;
  action: LogAction;
  targetId: string;      // 操作对象ID
  targetNo: string;      // 操作对象编号（如订单号）
  targetName: string;    // 操作对象名称
  operatorId: string;    // 操作人ID
  operatorName: string;  // 操作人姓名
  beforeData?: string;   // 操作前数据（JSON字符串）
  afterData?: string;    // 操作后数据（JSON字符串）
  remark?: string;       // 备注
  ipAddress?: string;    // IP地址
  createdAt: string;     // 操作时间
}

const LOGS_KEY = 'erp_operation_logs';

let logs: OperationLog[] = [];

/**
 * 初始化日志数据
 */
export function initLogData(): void {
  if (typeof window === 'undefined') return;
  
  const stored = localStorage.getItem(LOGS_KEY);
  if (stored) {
    logs = JSON.parse(stored);
  } else {
    logs = [];
    localStorage.setItem(LOGS_KEY, JSON.stringify(logs));
  }
}

/**
 * 获取所有日志
 */
export function getLogs(): OperationLog[] {
  return [...logs].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/**
 * 按条件查询日志
 */
export function queryLogs(params: {
  module?: LogModule;
  action?: LogAction;
  operatorName?: string;
  targetNo?: string;
  startDate?: string;
  endDate?: string;
}): OperationLog[] {
  return logs.filter(log => {
    if (params.module && log.module !== params.module) return false;
    if (params.action && log.action !== params.action) return false;
    if (params.operatorName && !log.operatorName.includes(params.operatorName)) return false;
    if (params.targetNo && !log.targetNo.includes(params.targetNo)) return false;
    if (params.startDate && log.createdAt < params.startDate) return false;
    if (params.endDate && log.createdAt > params.endDate + ' 23:59:59') return false;
    return true;
  }).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/**
 * 记录操作日志
 */
export function logOperation(params: {
  module: LogModule;
  action: LogAction;
  targetId: string;
  targetNo: string;
  targetName: string;
  operatorId: string;
  operatorName: string;
  beforeData?: any;
  afterData?: any;
  remark?: string;
}): OperationLog {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  const createdAt = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  
  const log: OperationLog = {
    id: Date.now().toString(),
    module: params.module,
    action: params.action,
    targetId: params.targetId,
    targetNo: params.targetNo,
    targetName: params.targetName,
    operatorId: params.operatorId,
    operatorName: params.operatorName,
    beforeData: params.beforeData ? JSON.stringify(params.beforeData, null, 2) : undefined,
    afterData: params.afterData ? JSON.stringify(params.afterData, null, 2) : undefined,
    remark: params.remark,
    createdAt,
  };
  
  logs.push(log);
  localStorage.setItem(LOGS_KEY, JSON.stringify(logs));
  
  return log;
}

/**
 * 获取模块统计
 */
export function getLogStats(): Record<LogModule, number> {
  const stats: Record<LogModule, number> = {
    '订单管理': 0,
    'BOM管理': 0,
    '裁床管理': 0,
    '车间报工': 0,
    '尾部管理': 0,
    '库存管理': 0,
    '发货管理': 0,
    '财务管理': 0,
    '用户管理': 0,
    '系统设置': 0,
    '基础资料': 0,
  };
  
  logs.forEach(log => {
    stats[log.module]++;
  });
  
  return stats;
}

/**
 * 获取今日操作次数
 */
export function getTodayLogCount(): number {
  const today = new Date().toISOString().slice(0, 10);
  return logs.filter(log => log.createdAt.startsWith(today)).length;
}

/**
 * 清除所有日志（仅系统管理员可用）
 */
export function clearAllLogs(): void {
  logs = [];
  localStorage.setItem(LOGS_KEY, JSON.stringify(logs));
}

// 便捷方法
export const logOrderCreate = (orderNo: string, productName: string, operatorId: string, operatorName: string) => 
  logOperation({ module: '订单管理', action: '创建', targetId: orderNo, targetNo: orderNo, targetName: productName, operatorId, operatorName });

export const logOrderUpdate = (orderNo: string, productName: string, operatorId: string, operatorName: string, before?: any, after?: any) => 
  logOperation({ module: '订单管理', action: '修改', targetId: orderNo, targetNo: orderNo, targetName: productName, operatorId, operatorName, beforeData: before, afterData: after });

export const logOrderAudit = (orderNo: string, productName: string, operatorId: string, operatorName: string) => 
  logOperation({ module: '订单管理', action: '审核', targetId: orderNo, targetNo: orderNo, targetName: productName, operatorId, operatorName });

export const logOrderIssue = (orderNo: string, productName: string, operatorId: string, operatorName: string) => 
  logOperation({ module: '订单管理', action: '下达', targetId: orderNo, targetNo: orderNo, targetName: productName, operatorId, operatorName });

export const logOrderCancel = (orderNo: string, productName: string, operatorId: string, operatorName: string) => 
  logOperation({ module: '订单管理', action: '作废', targetId: orderNo, targetNo: orderNo, targetName: productName, operatorId, operatorName });

export const logBOMCreate = (bomNo: string, productName: string, operatorId: string, operatorName: string) => 
  logOperation({ module: 'BOM管理', action: '创建', targetId: bomNo, targetNo: bomNo, targetName: productName, operatorId, operatorName });

export const logCuttingCreate = (taskNo: string, orderNo: string, operatorId: string, operatorName: string) => 
  logOperation({ module: '裁床管理', action: '创建', targetId: taskNo, targetNo: taskNo, targetName: `裁床任务-${orderNo}`, operatorId, operatorName });

export const logCuttingComplete = (taskNo: string, orderNo: string, operatorId: string, operatorName: string) => 
  logOperation({ module: '裁床管理', action: '完成', targetId: taskNo, targetNo: taskNo, targetName: `裁床任务-${orderNo}`, operatorId, operatorName });

export const logWorkReport = (reportNo: string, bundleNo: string, processName: string, operatorId: string, operatorName: string) => 
  logOperation({ module: '车间报工', action: '报工', targetId: reportNo, targetNo: reportNo, targetName: `${bundleNo}-${processName}`, operatorId, operatorName });

export const logWorkAudit = (reportNo: string, operatorId: string, operatorName: string) => 
  logOperation({ module: '车间报工', action: '审核', targetId: reportNo, targetNo: reportNo, targetName: '报工审核', operatorId, operatorName });

export const logTailReport = (taskNo: string, processName: string, operatorId: string, operatorName: string) => 
  logOperation({ module: '尾部管理', action: '报工', targetId: taskNo, targetNo: taskNo, targetName: processName, operatorId, operatorName });

export const logStockIn = (inNo: string, productName: string, operatorId: string, operatorName: string) => 
  logOperation({ module: '库存管理', action: '入库', targetId: inNo, targetNo: inNo, targetName: productName, operatorId, operatorName });

export const logStockOut = (outNo: string, productName: string, operatorId: string, operatorName: string) => 
  logOperation({ module: '库存管理', action: '出库', targetId: outNo, targetNo: outNo, targetName: productName, operatorId, operatorName });

export const logDelivery = (deliveryNo: string, orderNo: string, operatorId: string, operatorName: string) => 
  logOperation({ module: '发货管理', action: '发货', targetId: deliveryNo, targetNo: deliveryNo, targetName: `发货-${orderNo}`, operatorId, operatorName });
