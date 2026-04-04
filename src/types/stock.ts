// 库存管理类型定义

export type StockInType = '面料入库' | '辅料入库' | '成品入库' | '半成品入库' | '外协入库' | '退货入库';
export type StockOutType = '生产领料' | '外协出库' | '销售出库' | '调拨出库' | '报废出库';
export type StockStatus = '正常' | '预警' | '短缺' | '呆滞';

export interface StockItem {
  id: string;
  type: '面料' | '辅料' | '成品' | '半成品';
  materialCode: string;
  materialName: string;
  spec: string;
  color: string;
  unit: string;
  quantity: number;        // 库存数量，保留4位小数
  safetyStock: number;     // 安全库存
  unitCost: number;        // 单位成本
  warehouse: string;
  location: string;
  status: StockStatus;
  lastInDate?: string;
  lastOutDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StockInRecord {
  id: string;
  inNo: string;            // 入库单号：IN + YYYYMMDD + XXX
  inType: StockInType;
  supplierId?: string;
  supplierName: string;
  inDate: string;
  operator: string;
  auditor?: string;
  auditedAt?: string;
  status: '待审核' | '已审核' | '已作废';
  items: StockInItem[];
  totalQuantity: number;
  totalAmount: number;
  remark: string;
  createdAt: string;
}

export interface StockInItem {
  id: string;
  materialCode: string;
  materialName: string;
  spec: string;
  color: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  warehouse: string;
  location: string;
  remark: string;
}

export interface StockOutRecord {
  id: string;
  outNo: string;           // 出库单号：OUT + YYYYMMDD + XXX
  outType: StockOutType;
  orderId?: string;
  orderNo?: string;
  receiverId?: string;
  receiverName: string;
  outDate: string;
  operator: string;
  auditor?: string;
  auditedAt?: string;
  status: '待审核' | '已审核' | '已作废';
  items: StockOutItem[];
  totalQuantity: number;
  remark: string;
  createdAt: string;
}

export interface StockOutItem {
  id: string;
  materialCode: string;
  materialName: string;
  spec: string;
  color: string;
  unit: string;
  quantity: number;
  unitCost: number;
  warehouse: string;
  location: string;
  remark: string;
}

export interface StockMovement {
  id: string;
  movementNo: string;
  movementType: '入库' | '出库' | '调拨' | '盘点';
  materialCode: string;
  materialName: string;
  quantity: number;
  beforeQuantity: number;
  afterQuantity: number;
  relatedNo: string;
  operator: string;
  createdAt: string;
}

const STOCK_KEY = 'erp_stock';
const STOCK_IN_KEY = 'erp_stock_in';
const STOCK_OUT_KEY = 'erp_stock_out';
const STOCK_MOVEMENT_KEY = 'erp_stock_movement';

let stockItems: StockItem[] = [];
let stockInRecords: StockInRecord[] = [];
let stockOutRecords: StockOutRecord[] = [];
let stockMovements: StockMovement[] = [];

/**
 * 获取当前时间字符串
 */
function getNowStr(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

/**
 * 初始化库存数据
 */
export function initStockData(): void {
  if (typeof window === 'undefined') return;
  
  const storedStock = localStorage.getItem(STOCK_KEY);
  if (storedStock) {
    stockItems = JSON.parse(storedStock);
  } else {
    stockItems = [
      {
        id: '1',
        type: '面料',
        materialCode: 'ML001',
        materialName: '纯棉面料',
        spec: '150CM',
        color: '白色',
        unit: '米',
        quantity: 5000.0000,
        safetyStock: 1000,
        unitCost: 25.0000,
        warehouse: '主仓',
        location: 'A-01-01',
        status: '正常',
        createdAt: getNowStr(),
        updatedAt: getNowStr(),
      },
      {
        id: '2',
        type: '面料',
        materialCode: 'ML002',
        materialName: '涤纶面料',
        spec: '150CM',
        color: '黑色',
        unit: '米',
        quantity: 3000.0000,
        safetyStock: 500,
        unitCost: 20.0000,
        warehouse: '主仓',
        location: 'A-01-02',
        status: '正常',
        createdAt: getNowStr(),
        updatedAt: getNowStr(),
      },
      {
        id: '3',
        type: '辅料',
        materialCode: 'FJ001',
        materialName: '缝纫线',
        spec: '402#',
        color: '白色',
        unit: '个',
        quantity: 200.0000,
        safetyStock: 100,
        unitCost: 5.0000,
        warehouse: '辅料仓',
        location: 'B-01-01',
        status: '正常',
        createdAt: getNowStr(),
        updatedAt: getNowStr(),
      },
    ];
    localStorage.setItem(STOCK_KEY, JSON.stringify(stockItems));
  }
  
  const storedIn = localStorage.getItem(STOCK_IN_KEY);
  if (storedIn) stockInRecords = JSON.parse(storedIn);
  
  const storedOut = localStorage.getItem(STOCK_OUT_KEY);
  if (storedOut) stockOutRecords = JSON.parse(storedOut);
  
  const storedMovement = localStorage.getItem(STOCK_MOVEMENT_KEY);
  if (storedMovement) stockMovements = JSON.parse(storedMovement);
}

// ============ 库存查询 ============

export function getStockItems(): StockItem[] {
  return [...stockItems].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function getStockByCode(materialCode: string, color: string): StockItem | undefined {
  return stockItems.find(s => s.materialCode === materialCode && s.color === color);
}

export function getStockStats(): { total: number; normal: number; warning: number; shortage: number; totalValue: number } {
  return {
    total: stockItems.length,
    normal: stockItems.filter(s => s.status === '正常').length,
    warning: stockItems.filter(s => s.status === '预警').length,
    shortage: stockItems.filter(s => s.status === '短缺').length,
    totalValue: stockItems.reduce((sum, s) => sum + s.quantity * s.unitCost, 0),
  };
}

export function updateStockStatus(): void {
  stockItems.forEach(item => {
    if (item.quantity <= 0) {
      item.status = '短缺';
    } else if (item.quantity <= item.safetyStock) {
      item.status = '预警';
    } else {
      item.status = '正常';
    }
  });
  localStorage.setItem(STOCK_KEY, JSON.stringify(stockItems));
}

// ============ 入库管理 ============

export function getStockInRecords(): StockInRecord[] {
  return [...stockInRecords].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getStockInById(id: string): StockInRecord | undefined {
  return stockInRecords.find(r => r.id === id);
}

export function saveStockInRecord(record: StockInRecord): void {
  const index = stockInRecords.findIndex(r => r.id === record.id);
  if (index >= 0) {
    stockInRecords[index] = record;
  } else {
    stockInRecords.push(record);
  }
  localStorage.setItem(STOCK_IN_KEY, JSON.stringify(stockInRecords));
}

export function auditStockIn(id: string, auditor: string): boolean {
  const record = stockInRecords.find(r => r.id === id);
  if (!record || record.status !== '待审核') return false;
  
  record.status = '已审核';
  record.auditor = auditor;
  record.auditedAt = getNowStr();
  
  // 更新库存
  record.items.forEach(item => {
    const existing = stockItems.find(s => s.materialCode === item.materialCode && s.color === item.color);
    if (existing) {
      existing.quantity += item.quantity;
      existing.unitCost = item.unitPrice;
      existing.lastInDate = record.inDate;
      existing.updatedAt = getNowStr();
    } else {
      stockItems.push({
        id: Date.now().toString() + item.id,
        type: record.inType.includes('面料') ? '面料' : record.inType.includes('辅料') ? '辅料' : '成品',
        materialCode: item.materialCode,
        materialName: item.materialName,
        spec: item.spec,
        color: item.color,
        unit: item.unit,
        quantity: item.quantity,
        safetyStock: 0,
        unitCost: item.unitPrice,
        warehouse: item.warehouse,
        location: item.location,
        status: '正常',
        lastInDate: record.inDate,
        createdAt: getNowStr(),
        updatedAt: getNowStr(),
      });
    }
    
    // 记录库存变动
    addStockMovement({
      movementType: '入库',
      materialCode: item.materialCode,
      materialName: item.materialName,
      quantity: item.quantity,
      beforeQuantity: existing?.quantity || 0,
      afterQuantity: (existing?.quantity || 0) + item.quantity,
      relatedNo: record.inNo,
      operator: auditor,
    });
  });
  
  updateStockStatus();
  localStorage.setItem(STOCK_KEY, JSON.stringify(stockItems));
  localStorage.setItem(STOCK_IN_KEY, JSON.stringify(stockInRecords));
  return true;
}

// ============ 出库管理 ============

export function getStockOutRecords(): StockOutRecord[] {
  return [...stockOutRecords].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getStockOutById(id: string): StockOutRecord | undefined {
  return stockOutRecords.find(r => r.id === id);
}

export function saveStockOutRecord(record: StockOutRecord): void {
  const index = stockOutRecords.findIndex(r => r.id === record.id);
  if (index >= 0) {
    stockOutRecords[index] = record;
  } else {
    stockOutRecords.push(record);
  }
  localStorage.setItem(STOCK_OUT_KEY, JSON.stringify(stockOutRecords));
}

export function auditStockOut(id: string, auditor: string): boolean {
  const record = stockOutRecords.find(r => r.id === id);
  if (!record || record.status !== '待审核') return false;
  
  // 检查库存是否充足
  for (const item of record.items) {
    const stock = stockItems.find(s => s.materialCode === item.materialCode && s.color === item.color);
    if (!stock || stock.quantity < item.quantity) {
      return false;
    }
  }
  
  record.status = '已审核';
  record.auditor = auditor;
  record.auditedAt = getNowStr();
  
  // 更新库存
  record.items.forEach(item => {
    const stock = stockItems.find(s => s.materialCode === item.materialCode && s.color === item.color);
    if (stock) {
      const beforeQuantity = stock.quantity;
      stock.quantity -= item.quantity;
      stock.lastOutDate = record.outDate;
      stock.updatedAt = getNowStr();
      
      // 记录库存变动
      addStockMovement({
        movementType: '出库',
        materialCode: item.materialCode,
        materialName: item.materialName,
        quantity: -item.quantity,
        beforeQuantity,
        afterQuantity: stock.quantity,
        relatedNo: record.outNo,
        operator: auditor,
      });
    }
  });
  
  updateStockStatus();
  localStorage.setItem(STOCK_KEY, JSON.stringify(stockItems));
  localStorage.setItem(STOCK_OUT_KEY, JSON.stringify(stockOutRecords));
  return true;
}

// ============ 库存变动记录 ============

export function getStockMovements(): StockMovement[] {
  return [...stockMovements].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

function addStockMovement(params: {
  movementType: '入库' | '出库' | '调拨' | '盘点';
  materialCode: string;
  materialName: string;
  quantity: number;
  beforeQuantity: number;
  afterQuantity: number;
  relatedNo: string;
  operator: string;
}): StockMovement {
  const movement: StockMovement = {
    id: Date.now().toString(),
    movementNo: `MV${Date.now()}`,
    ...params,
    createdAt: getNowStr(),
  };
  stockMovements.push(movement);
  localStorage.setItem(STOCK_MOVEMENT_KEY, JSON.stringify(stockMovements));
  return movement;
}

// ============ 编号生成 ============

export function generateInNo(): string {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const todayRecords = stockInRecords.filter(r => r.inNo.includes(dateStr));
  const seq = (todayRecords.length + 1).toString().padStart(3, '0');
  return `IN${dateStr}${seq}`;
}

export function generateOutNo(): string {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const todayRecords = stockOutRecords.filter(r => r.outNo.includes(dateStr));
  const seq = (todayRecords.length + 1).toString().padStart(3, '0');
  return `OUT${dateStr}${seq}`;
}

// 保存单个库存项
export function saveStockItem(item: StockItem): void {
  const index = stockItems.findIndex(s => s.id === item.id);
  if (index >= 0) {
    stockItems[index] = item;
  } else {
    stockItems.push(item);
  }
  localStorage.setItem(STOCK_KEY, JSON.stringify(stockItems));
}
