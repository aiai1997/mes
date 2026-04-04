// 外协类型
export type OutsourceType = '印花' | '绣花' | '洗水' | '缝制' | '整烫';

// 外协状态
export type OutsourceStatus = '待外发' | '已外发' | '部分回货' | '全部回货' | '已对账';

// 损耗原因
export type LossReason = '工艺问题' | '人为失误' | '物料问题' | '其他';

// 外协主表
export interface Outsource {
  id: string;
  outsourceNo: string; // OUT + 日期 + 流水
  outsourceType: OutsourceType;
  orderNo: string;
  bomNo: string;
  styleNo: string;
  productName: string;
  colorName: string;
  sizeName?: string;
  
  // 外发信息
  supplierId: string;
  supplierName: string;
  processName: string; // 外发工序
  sendQuantity: number; // 外发数量
  unitPrice: number; // 加工单价
  sendDate: string; // 外发日期
  requiredReturnDate: string; // 要求回货日期
  
  // 回货信息
  returnedQuantity: number; // 回货数
  goodQuantity: number; // 良品数
  lossQuantity: number; // 损耗数
  defectQuantity: number; // 次品数
  lossReason?: LossReason;
  
  // 费用
  processingFee: number; // 加工费 = 良品数 × 单价
  
  // 状态
  status: OutsourceStatus;
  
  // 审核信息
  createdBy: string;
  createdAt: string;
  auditedBy?: string;
  auditedAt?: string;
  remark: string;
}

// 默认外协数据
export const defaultOutsources: Outsource[] = [
  {
    id: '1',
    outsourceNo: 'OUT20260331001',
    outsourceType: '印花',
    orderNo: 'ORD20260331001',
    bomNo: 'BOM20260331001',
    styleNo: 'TS-2024-001',
    productName: '男士短袖T恤',
    colorName: '白色',
    supplierId: 'SUP001',
    supplierName: 'XX印花厂',
    processName: '前胸印花',
    sendQuantity: 1000,
    unitPrice: 2.5,
    sendDate: '2026-03-31',
    requiredReturnDate: '2026-04-07',
    returnedQuantity: 980,
    goodQuantity: 975,
    lossQuantity: 5,
    defectQuantity: 20,
    lossReason: '工艺问题',
    processingFee: 2437.5,
    status: '全部回货',
    createdBy: 'user',
    createdAt: '2026-03-31 10:00:00',
    remark: '双色印花',
  },
];

const OUTSOURCES_KEY = 'erp_outsources';

export function initOutsourceData(): void {
  if (typeof window === 'undefined') return;
  const stored = localStorage.getItem(OUTSOURCES_KEY);
  if (!stored) {
    localStorage.setItem(OUTSOURCES_KEY, JSON.stringify(defaultOutsources));
  }
}

export function getOutsources(): Outsource[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(OUTSOURCES_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function saveOutsource(outsource: Outsource): void {
  if (typeof window === 'undefined') return;
  const outsources = getOutsources();
  const index = outsources.findIndex(o => o.id === outsource.id);
  if (index >= 0) {
    outsources[index] = outsource;
  } else {
    outsources.push(outsource);
  }
  localStorage.setItem(OUTSOURCES_KEY, JSON.stringify(outsources));
}

export function generateOutsourceNo(): string {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const outsources = getOutsources();
  const todayOutsources = outsources.filter(o => o.outsourceNo.includes(dateStr));
  const seq = (todayOutsources.length + 1).toString().padStart(3, '0');
  return `OUT${dateStr}${seq}`;
}
