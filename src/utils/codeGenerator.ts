// 统一编码规则管理

/**
 * 编码规则说明：
 * - 订单：ORD + YYYYMMDD + XXX（3位流水号）
 * - BOM：BOM + YYYYMMDD + XXX
 * - 裁床：CUT + YYYYMMDD + XXX
 * - 扎号：ZY + YYYYMMDD + XXX
 * - 报工：WO + YYYYMMDD + XXX
 * - 发货：DEL + YYYYMMDD + XXX
 * - 入库：IN + YYYYMMDD + XXX
 * - 出库：OUT + YYYYMMDD + XXX
 * - 返工：RW + YYYYMMDD + XXX
 * - 报废：SCP + YYYYMMDD + XXX
 * - ECN：ECN + YYYYMMDD + XXX
 * - MRP：MRP + YYYYMMDD + XXX
 * - 借料：BR + YYYYMMDD + XXX
 */

// 编码前缀类型
export type CodePrefix = 
  | 'ORD'   // 订单
  | 'BOM'   // BOM
  | 'CUT'   // 裁床
  | 'ZY'    // 扎号
  | 'WO'    // 报工
  | 'DEL'   // 发货
  | 'IN'    // 入库
  | 'OUT'   // 出库
  | 'RW'    // 返工
  | 'SCP'   // 报废
  | 'ECN'   // 工程变更
  | 'MRP'   // 物料需求计划
  | 'BR'    // 借料
  | 'SM'    // 打样
  | 'QC';   // 品质检验

// localStorage 存储键
const STORAGE_KEYS: Record<CodePrefix, string> = {
  'ORD': 'erp_orders',
  'BOM': 'erp_boms',
  'CUT': 'erp_cutting_tasks',
  'ZY': 'erp_zahao_list',
  'WO': 'erp_work_reports',
  'DEL': 'erp_deliveries',
  'IN': 'erp_stock_in',
  'OUT': 'erp_stock_out',
  'RW': 'erp_rework_records',
  'SCP': 'erp_scrap_records',
  'ECN': 'erp_ecns',
  'MRP': 'erp_mrp_plans',
  'BR': 'erp_borrow_records',
  'SM': 'erp_samples',
  'QC': 'erp_quality_records',
};

// 编号字段名
const CODE_FIELDS: Record<CodePrefix, string> = {
  'ORD': 'orderNo',
  'BOM': 'bomNo',
  'CUT': 'taskNo',
  'ZY': 'zaNo',
  'WO': 'reportNo',
  'DEL': 'deliveryNo',
  'IN': 'inNo',
  'OUT': 'outNo',
  'RW': 'reworkNo',
  'SCP': 'scrapNo',
  'ECN': 'ecnNo',
  'MRP': 'planNo',
  'BR': 'borrowNo',
  'SM': 'sampleNo',
  'QC': 'qcNo',
};

/**
 * 生成业务编码
 * @param prefix 编码前缀
 * @param customDate 自定义日期（可选，默认今天）
 * @returns 生成的编码
 */
export function generateCode(prefix: CodePrefix, customDate?: Date): string {
  const date = customDate || new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const dateStr = `${year}${month}${day}`;
  
  if (typeof window === 'undefined') {
    return `${prefix}${dateStr}001`;
  }
  
  const storageKey = STORAGE_KEYS[prefix];
  const codeField = CODE_FIELDS[prefix];
  
  const stored = localStorage.getItem(storageKey);
  const list: Record<string, any>[] = stored ? JSON.parse(stored) : [];
  
  // 过滤今天的记录
  const todayRecords = list.filter((item: any) => {
    const code = item[codeField];
    return code && code.includes(dateStr);
  });
  
  // 计算最大序号
  const maxSeq = todayRecords.length > 0 
    ? Math.max(...todayRecords.map((item: any) => {
        const code = item[codeField];
        return parseInt(code.slice(-3));
      }))
    : 0;
  
  const seq = String(maxSeq + 1).padStart(3, '0');
  return `${prefix}${dateStr}${seq}`;
}

/**
 * 批量生成编码
 * @param prefix 编码前缀
 * @param count 数量
 * @returns 编码数组
 */
export function generateCodes(prefix: CodePrefix, count: number): string[] {
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    codes.push(generateCode(prefix));
  }
  return codes;
}

/**
 * 解析编码
 * @param code 编码
 * @returns 解析结果 { prefix, date, seq }
 */
export function parseCode(code: string): { prefix: string; date: string; seq: number } | null {
  const match = code.match(/^([A-Z]+)(\d{8})(\d{3})$/);
  if (!match) return null;
  
  return {
    prefix: match[1],
    date: match[2],
    seq: parseInt(match[3]),
  };
}

/**
 * 验证编码格式
 * @param code 编码
 * @param expectedPrefix 期望的前缀
 * @returns 是否有效
 */
export function validateCode(code: string, expectedPrefix?: CodePrefix): boolean {
  const parsed = parseCode(code);
  if (!parsed) return false;
  
  if (expectedPrefix && parsed.prefix !== expectedPrefix) return false;
  
  // 验证日期是否有效
  const year = parseInt(parsed.date.slice(0, 4));
  const month = parseInt(parsed.date.slice(4, 6));
  const day = parseInt(parsed.date.slice(6, 8));
  
  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;
  
  return true;
}

/**
 * 获取编码显示名称
 * @param prefix 编码前缀
 * @returns 显示名称
 */
export function getCodeDisplayName(prefix: CodePrefix): string {
  const names: Record<CodePrefix, string> = {
    'ORD': '订单号',
    'BOM': 'BOM编号',
    'CUT': '裁床任务号',
    'ZY': '扎号',
    'WO': '报工单号',
    'DEL': '发货单号',
    'IN': '入库单号',
    'OUT': '出库单号',
    'RW': '返工单号',
    'SCP': '报废单号',
    'ECN': '工程变更号',
    'MRP': 'MRP计划号',
    'BR': '借料单号',
    'SM': '打样单号',
    'QC': '检验单号',
  };
  return names[prefix];
}

// 便捷方法
export const generateOrderNo = () => generateCode('ORD');
export const generateBOMNo = () => generateCode('BOM');
export const generateCutNo = () => generateCode('CUT');
export const generateZaNo = () => generateCode('ZY');
export const generateWorkNo = () => generateCode('WO');
export const generateDeliveryNo = () => generateCode('DEL');
export const generateStockInNo = () => generateCode('IN');
export const generateStockOutNo = () => generateCode('OUT');
export const generateReworkNo = () => generateCode('RW');
export const generateScrapNo = () => generateCode('SCP');
export const generateECNNo = () => generateCode('ECN');
export const generateMRPNo = () => generateCode('MRP');
export const generateBorrowNo = () => generateCode('BR');
export const generateSampleNo = () => generateCode('SM');
export const generateQCNo = () => generateCode('QC');
