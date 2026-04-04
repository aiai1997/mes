// 返工管理类型定义

export type ReworkStatus = '待返工' | '返工中' | '已完成' | '已报废';
export type ReworkSource = '车间' | '尾部' | '质检';
export type ReworkType = '裁床返工' | '缝制返工' | '尾部返工' | '质检返工' | '包装返工';
export type RecordType = '返工' | '报废';

export interface ReworkRecord {
  id: string;
  reworkNo: string;
  
  // 记录类型
  recordType: RecordType;
  
  // 返工类型
  reworkType: ReworkType;
  
  // 来源
  source: ReworkSource;
  sourceId?: string;
  sourceNo?: string;
  
  // 关联信息
  orderId: string;
  orderNo: string;
  productionOrderNo?: string;
  styleNo: string;
  bundleId?: string;
  bundleNo?: string;
  
  // 返工信息
  reworkQuantity: number;
  quantity: number;
  completedQuantity: number;
  
  // 不良信息
  defectType: string;
  defectDescription: string;
  defectPhotos: string[];
  
  // 责任
  responsibleTeam: string;
  responsiblePerson: string;
  
  // 返工工序
  reworkProcessId: string;
  reworkProcessName: string;
  processName: string;
  reworkTeam: string;
  reworkWorker: string;
  
  // 返工次数
  reworkCount: number;
  maxReworkCount: number;
  
  // 状态
  status: ReworkStatus;
  
  // 成本
  reworkCost: number;
  
  // 时间
  createTime: string;
  createdAt: string;
  startTime?: string;
  completeTime?: string;
  
  remark: string;
  createdBy: string;
}

// 报废管理类型定义

export type ScrapStatus = '待审核' | '已审核' | '已拒绝';
export type ScrapType = '面料' | '辅料' | '裁片' | '成品';

export interface ScrapRecord {
  id: string;
  scrapNo: string;
  
  // 报废类型
  scrapType: ScrapType;
  
  // 关联信息
  orderId?: string;
  orderNo?: string;
  materialId?: string;
  materialNo?: string;
  materialName: string;
  
  // 报废信息
  quantity: number;
  unit: string;
  unitPrice: number;
  totalAmount: number;
  
  // 原因
  scrapReason: string;
  scrapDescription: string;
  scrapPhotos: string[];
  
  // 责任
  responsiblePerson: string;
  
  // 审核
  status: ScrapStatus;
  reviewedBy?: string;
  reviewedTime?: string;
  reviewComment?: string;
  
  remark: string;
  createdBy: string;
  createdAt: string;
}

// 借料管理类型定义

export type BorrowStatus = '借用中' | '已归还' | '已丢失';
export type BorrowType = '辅料' | '工具' | '物料';

export interface BorrowRecord {
  id: string;
  borrowNo: string;
  
  // 借料类型
  borrowType: BorrowType;
  
  // 物料信息
  materialId: string;
  materialNo: string;
  materialName: string;
  unit: string;
  
  // 借用信息
  borrowQuantity: number;
  returnQuantity: number;
  
  // 用途
  purpose: string;
  orderId?: string;
  orderNo?: string;
  
  // 借用人
  borrowerId: string;
  borrowerName: string;
  borrowerTeam: string;
  
  // 时间
  borrowTime: string;
  expectedReturnTime: string;
  actualReturnTime?: string;
  
  // 状态
  status: BorrowStatus;
  isOverdue: boolean;
  
  remark: string;
  createdBy: string;
}

// 模拟数据
let reworkRecords: ReworkRecord[] = [];
let scrapRecords: ScrapRecord[] = [];
let borrowRecords: BorrowRecord[] = [];

export function initReworkData() {
  if (typeof window === 'undefined') return;
  
  const storedRework = localStorage.getItem('erp_rework_records');
  if (!storedRework) {
    reworkRecords = [
      {
        id: '1',
        reworkNo: 'RW20240115001',
        recordType: '返工',
        reworkType: '缝制返工',
        source: '质检',
        sourceId: '1',
        sourceNo: 'FQC20240115001',
        orderId: '1',
        orderNo: 'ORD20240110001',
        productionOrderNo: 'PO20240115001',
        styleNo: 'ST2024001',
        reworkQuantity: 5,
        quantity: 5,
        completedQuantity: 3,
        defectType: '线头',
        defectDescription: '线头未剪干净',
        defectPhotos: [],
        responsibleTeam: '缝制一组',
        responsiblePerson: '张三',
        reworkProcessId: '10',
        reworkProcessName: '剪线头',
        processName: '剪线头',
        reworkTeam: '尾部组',
        reworkWorker: '李四',
        reworkCount: 1,
        maxReworkCount: 3,
        status: '返工中',
        reworkCost: 15,
        createTime: '2024-01-15 16:00:00',
        createdAt: '2024-01-15 16:00:00',
        startTime: '2024-01-16 08:00:00',
        remark: '',
        createdBy: 'admin',
      },
      {
        id: '2',
        reworkNo: 'SCP20240115001',
        recordType: '报废',
        reworkType: '裁床返工',
        source: '车间',
        orderId: '1',
        orderNo: 'ORD20240110001',
        productionOrderNo: 'PO20240115001',
        styleNo: 'ST2024001',
        reworkQuantity: 2,
        quantity: 2,
        completedQuantity: 2,
        defectType: '裁错',
        defectDescription: '裁片尺寸错误',
        defectPhotos: [],
        responsibleTeam: '裁床组',
        responsiblePerson: '王五',
        reworkProcessId: '1',
        reworkProcessName: '裁床',
        processName: '裁床',
        reworkTeam: '裁床组',
        reworkWorker: '赵六',
        reworkCount: 0,
        maxReworkCount: 0,
        status: '已报废',
        reworkCost: 50,
        createTime: '2024-01-15 10:00:00',
        createdAt: '2024-01-15 10:00:00',
        remark: '无法返修',
        createdBy: 'admin',
      },
    ];
    localStorage.setItem('erp_rework_records', JSON.stringify(reworkRecords));
  } else {
    reworkRecords = JSON.parse(storedRework);
  }
  
  const storedScrap = localStorage.getItem('erp_scrap_records');
  if (!storedScrap) {
    scrapRecords = [];
    localStorage.setItem('erp_scrap_records', JSON.stringify(scrapRecords));
  } else {
    scrapRecords = JSON.parse(storedScrap);
  }
  
  const storedBorrow = localStorage.getItem('erp_borrow_records');
  if (!storedBorrow) {
    borrowRecords = [];
    localStorage.setItem('erp_borrow_records', JSON.stringify(borrowRecords));
  } else {
    borrowRecords = JSON.parse(storedBorrow);
  }
}

export function getReworkRecords(): ReworkRecord[] {
  return [...reworkRecords].sort((a, b) => (b.createTime || '').localeCompare(a.createTime || ''));
}

export function getReworkRecord(id: string): ReworkRecord | undefined {
  return reworkRecords.find(r => r.id === id);
}

export function saveReworkRecord(record: ReworkRecord) {
  const index = reworkRecords.findIndex(r => r.id === record.id);
  if (index >= 0) {
    reworkRecords[index] = record;
  } else {
    reworkRecords.push(record);
  }
  localStorage.setItem('erp_rework_records', JSON.stringify(reworkRecords));
}

export function getScrapRecords(): ScrapRecord[] {
  return [...scrapRecords].sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
}

export function saveScrapRecord(record: ScrapRecord) {
  const index = scrapRecords.findIndex(r => r.id === record.id);
  if (index >= 0) {
    scrapRecords[index] = record;
  } else {
    scrapRecords.push(record);
  }
  localStorage.setItem('erp_scrap_records', JSON.stringify(scrapRecords));
}

export function getBorrowRecords(): BorrowRecord[] {
  return [...borrowRecords].sort((a, b) => (b.borrowTime || '').localeCompare(a.borrowTime || ''));
}

export function saveBorrowRecord(record: BorrowRecord) {
  const index = borrowRecords.findIndex(r => r.id === record.id);
  if (index >= 0) {
    borrowRecords[index] = record;
  } else {
    borrowRecords.push(record);
  }
  localStorage.setItem('erp_borrow_records', JSON.stringify(borrowRecords));
}

export function generateReworkNo(): string {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const today = reworkRecords.filter(r => r.reworkNo.includes(dateStr));
  return `RW${dateStr}${(today.length + 1).toString().padStart(3, '0')}`;
}

export function generateScrapNo(): string {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const today = scrapRecords.filter(r => r.scrapNo.includes(dateStr));
  return `SCP${dateStr}${(today.length + 1).toString().padStart(3, '0')}`;
}

export function generateBorrowNo(): string {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const today = borrowRecords.filter(r => r.borrowNo.includes(dateStr));
  return `BRW${dateStr}${(today.length + 1).toString().padStart(3, '0')}`;
}
