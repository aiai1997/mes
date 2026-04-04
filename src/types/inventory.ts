/**
 * 库存相关类型定义
 */

// 仓库类型
export type WarehouseType = '主料仓' | '辅料仓' | '成品仓' | '次品仓' | '待检仓';

// 仓库状态
export type WarehouseStatus = '正常' | '维护中' | '已停用';

// 库存状态
export type StockStatus = '正常' | '预警' | '缺货' | '过多';

// 库存变动类型
export type StockChangeType = '入库' | '出库' | '调拨' | '盘点';

// 仓库
export interface Warehouse {
  id: string;
  warehouseCode: string;
  warehouseName: string;
  warehouseType: WarehouseType;
  location: string;
  capacity: number; // 容量
  usedCapacity: number; // 已使用容量
  status: WarehouseStatus;
  manager: string;
  contact: string;
  remark: string;
  createdAt: string;
  updatedAt: string;
}

// 库存项目
export interface StockItem {
  id: string;
  materialCode: string;
  materialName: string;
  specification: string;
  unit: string;
  warehouseId: string;
  warehouseName: string;
  quantity: number;
  safetyStock: number;
  maxStock: number;
  status: StockStatus;
  lastInDate?: string;
  lastOutDate?: string;
  createdAt: string;
  updatedAt: string;
}

// 库存变动记录
export interface StockChange {
  id: string;
  changeNo: string;
  materialCode: string;
  materialName: string;
  specification: string;
  unit: string;
  warehouseId: string;
  warehouseName: string;
  type: StockChangeType;
  quantity: number; // 变动数量
  beforeQuantity: number; // 变动前数量
  afterQuantity: number; // 变动后数量
  reason: string;
  operator: string;
  referenceNo?: string; // 参考单号（如订单号、采购单号等）
  createdAt: string;
}

// 库存预警
export interface StockAlert {
  id: string;
  materialCode: string;
  materialName: string;
  specification: string;
  unit: string;
  warehouseId: string;
  warehouseName: string;
  currentQuantity: number;
  safetyStock: number;
  maxStock: number;
  status: StockStatus;
  alertLevel: '低' | '中' | '高';
  createdAt: string;
  handled: boolean;
  handledBy?: string;
  handledAt?: string;
  handlingRemark?: string;
}

// 库存调拨
export interface StockTransfer {
  id: string;
  transferNo: string;
  materialCode: string;
  materialName: string;
  specification: string;
  unit: string;
  fromWarehouseId: string;
  fromWarehouseName: string;
  toWarehouseId: string;
  toWarehouseName: string;
  quantity: number;
  reason: string;
  operator: string;
  status: '待审批' | '已审批' | '已完成' | '已拒绝';
  approvedBy?: string;
  approvedAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// ==================== 数据操作函数 ====================

import { DB_KEYS } from '@/lib/database';

const WAREHOUSES_KEY = 'erp_warehouses';
const STOCK_ITEMS_KEY = 'erp_stock_items';
const STOCK_CHANGES_KEY = 'erp_stock_changes';
const STOCK_ALERTS_KEY = 'erp_stock_alerts';
const STOCK_TRANSFERS_KEY = 'erp_stock_transfers';

// 初始化库存数据
export function initInventoryData(): void {
  if (typeof window === 'undefined') return;
  
  // 初始化仓库数据
  const storedWarehouses = localStorage.getItem(WAREHOUSES_KEY);
  if (!storedWarehouses) {
    const defaultWarehouses: Warehouse[] = [
      {
        id: 'warehouse_1',
        warehouseCode: 'WH001',
        warehouseName: '主料仓',
        warehouseType: '主料仓',
        location: 'A区',
        capacity: 10000,
        usedCapacity: 5000,
        status: '正常',
        manager: '张三',
        contact: '13800138000',
        remark: '存放主要面料',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'warehouse_2',
        warehouseCode: 'WH002',
        warehouseName: '辅料仓',
        warehouseType: '辅料仓',
        location: 'B区',
        capacity: 5000,
        usedCapacity: 3000,
        status: '正常',
        manager: '李四',
        contact: '13900139000',
        remark: '存放辅料',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'warehouse_3',
        warehouseCode: 'WH003',
        warehouseName: '成品仓',
        warehouseType: '成品仓',
        location: 'C区',
        capacity: 8000,
        usedCapacity: 4000,
        status: '正常',
        manager: '王五',
        contact: '13700137000',
        remark: '存放成品',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
    localStorage.setItem(WAREHOUSES_KEY, JSON.stringify(defaultWarehouses));
  }
  
  // 初始化库存项目数据
  const storedStockItems = localStorage.getItem(STOCK_ITEMS_KEY);
  if (!storedStockItems) {
    const defaultStockItems: StockItem[] = [
      {
        id: 'stock_1',
        materialCode: 'ML001',
        materialName: '纯棉汗布',
        specification: '180g/m²',
        unit: '米',
        warehouseId: 'warehouse_1',
        warehouseName: '主料仓',
        quantity: 5000,
        safetyStock: 1000,
        maxStock: 8000,
        status: '正常',
        lastInDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'stock_2',
        materialCode: 'FL001',
        materialName: '树脂纽扣',
        specification: '15mm',
        unit: '个',
        warehouseId: 'warehouse_2',
        warehouseName: '辅料仓',
        quantity: 50000,
        safetyStock: 10000,
        maxStock: 100000,
        status: '正常',
        lastInDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
    localStorage.setItem(STOCK_ITEMS_KEY, JSON.stringify(defaultStockItems));
  }
  
  // 初始化其他数据
  if (!localStorage.getItem(STOCK_CHANGES_KEY)) {
    localStorage.setItem(STOCK_CHANGES_KEY, JSON.stringify([]));
  }
  
  if (!localStorage.getItem(STOCK_ALERTS_KEY)) {
    localStorage.setItem(STOCK_ALERTS_KEY, JSON.stringify([]));
  }
  
  if (!localStorage.getItem(STOCK_TRANSFERS_KEY)) {
    localStorage.setItem(STOCK_TRANSFERS_KEY, JSON.stringify([]));
  }
}

// 生成仓库编号
export function generateWarehouseCode(): string {
  const warehouses = getWarehouses();
  const maxCode = warehouses.reduce((max, w) => {
    const num = parseInt(w.warehouseCode.replace('WH', ''));
    return num > max ? num : max;
  }, 0);
  return `WH${String(maxCode + 1).padStart(3, '0')}`;
}

// 生成库存变动编号
export function generateStockChangeNo(): string {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const changes = getStockChanges();
  const todayChanges = changes.filter(c => c.changeNo.includes(dateStr));
  const maxSeq = todayChanges.length > 0 
    ? Math.max(...todayChanges.map(c => parseInt(c.changeNo.slice(-3)))) 
    : 0;
  const seq = String(maxSeq + 1).padStart(3, '0');
  return `SC${dateStr}${seq}`;
}

// 生成库存调拨编号
export function generateTransferNo(): string {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const transfers = getStockTransfers();
  const todayTransfers = transfers.filter(t => t.transferNo.includes(dateStr));
  const maxSeq = todayTransfers.length > 0 
    ? Math.max(...todayTransfers.map(t => parseInt(t.transferNo.slice(-3)))) 
    : 0;
  const seq = String(maxSeq + 1).padStart(3, '0');
  return `TF${dateStr}${seq}`;
}

// 获取仓库列表
export function getWarehouses(): Warehouse[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(WAREHOUSES_KEY);
  return stored ? JSON.parse(stored) : [];
}

// 获取库存项目列表
export function getStockItems(warehouseId?: string): StockItem[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(STOCK_ITEMS_KEY);
  const items: StockItem[] = stored ? JSON.parse(stored) : [];
  return warehouseId ? items.filter(item => item.warehouseId === warehouseId) : items;
}

// 获取库存变动记录
export function getStockChanges(materialCode?: string): StockChange[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(STOCK_CHANGES_KEY);
  const changes: StockChange[] = stored ? JSON.parse(stored) : [];
  return materialCode ? changes.filter(c => c.materialCode === materialCode) : changes;
}

// 获取库存预警
export function getStockAlerts(warehouseId?: string): StockAlert[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(STOCK_ALERTS_KEY);
  const alerts: StockAlert[] = stored ? JSON.parse(stored) : [];
  return warehouseId ? alerts.filter(a => a.warehouseId === warehouseId) : alerts;
}

// 获取库存调拨记录
export function getStockTransfers(): StockTransfer[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(STOCK_TRANSFERS_KEY);
  return stored ? JSON.parse(stored) : [];
}

// 保存仓库
export function saveWarehouse(warehouse: Warehouse): void {
  if (typeof window === 'undefined') return;
  const warehouses = getWarehouses();
  const index = warehouses.findIndex(w => w.id === warehouse.id);
  if (index >= 0) {
    warehouses[index] = { ...warehouse, updatedAt: new Date().toISOString() };
  } else {
    warehouses.push(warehouse);
  }
  localStorage.setItem(WAREHOUSES_KEY, JSON.stringify(warehouses));
}

// 保存库存项目
export function saveStockItem(item: StockItem): void {
  if (typeof window === 'undefined') return;
  const items = getStockItems();
  const index = items.findIndex(i => i.id === item.id);
  if (index >= 0) {
    items[index] = { ...item, updatedAt: new Date().toISOString() };
  } else {
    items.push(item);
  }
  localStorage.setItem(STOCK_ITEMS_KEY, JSON.stringify(items));
  
  // 检查库存状态并生成预警
  checkStockStatus(item);
}

// 记录库存变动
export function recordStockChange(change: Omit<StockChange, 'id' | 'changeNo' | 'createdAt'>): StockChange {
  const newChange: StockChange = {
    ...change,
    id: `stock_change_${Date.now()}`,
    changeNo: generateStockChangeNo(),
    createdAt: new Date().toISOString()
  };
  
  const changes = getStockChanges();
  changes.push(newChange);
  localStorage.setItem(STOCK_CHANGES_KEY, JSON.stringify(changes));
  
  // 更新库存项目
  const items = getStockItems();
  const itemIndex = items.findIndex(
    i => i.materialCode === change.materialCode && i.warehouseId === change.warehouseId
  );
  
  if (itemIndex >= 0) {
    items[itemIndex].quantity = change.afterQuantity;
    items[itemIndex].updatedAt = new Date().toISOString();
    
    if (change.type === '入库') {
      items[itemIndex].lastInDate = new Date().toISOString();
    } else if (change.type === '出库') {
      items[itemIndex].lastOutDate = new Date().toISOString();
    }
    
    localStorage.setItem(STOCK_ITEMS_KEY, JSON.stringify(items));
    
    // 检查库存状态并生成预警
    checkStockStatus(items[itemIndex]);
  }
  
  return newChange;
}

// 检查库存状态并生成预警
function checkStockStatus(item: StockItem): void {
  let status: StockStatus;
  let alertLevel: '低' | '中' | '高';
  
  if (item.quantity <= 0) {
    status = '缺货';
    alertLevel = '高';
  } else if (item.quantity < item.safetyStock) {
    status = '预警';
    alertLevel = '中';
  } else if (item.quantity > item.maxStock) {
    status = '过多';
    alertLevel = '低';
  } else {
    status = '正常';
    alertLevel = '低';
  }
  
  // 更新库存状态
  item.status = status;
  saveStockItem(item);
  
  // 生成预警
  if (status !== '正常') {
    const alerts = getStockAlerts();
    const existingAlert = alerts.find(
      a => a.materialCode === item.materialCode && a.warehouseId === item.warehouseId && !a.handled
    );
    
    if (!existingAlert) {
      const newAlert: StockAlert = {
        id: `stock_alert_${Date.now()}`,
        materialCode: item.materialCode,
        materialName: item.materialName,
        specification: item.specification,
        unit: item.unit,
        warehouseId: item.warehouseId,
        warehouseName: item.warehouseName,
        currentQuantity: item.quantity,
        safetyStock: item.safetyStock,
        maxStock: item.maxStock,
        status,
        alertLevel,
        createdAt: new Date().toISOString(),
        handled: false
      };
      
      alerts.push(newAlert);
      localStorage.setItem(STOCK_ALERTS_KEY, JSON.stringify(alerts));
    }
  }
}

// 处理库存预警
export function handleStockAlert(alertId: string, handledBy: string, handlingRemark: string): void {
  if (typeof window === 'undefined') return;
  const alerts = getStockAlerts();
  const index = alerts.findIndex(a => a.id === alertId);
  if (index >= 0) {
    alerts[index].handled = true;
    alerts[index].handledBy = handledBy;
    alerts[index].handledAt = new Date().toISOString();
    alerts[index].handlingRemark = handlingRemark;
    localStorage.setItem(STOCK_ALERTS_KEY, JSON.stringify(alerts));
  }
}

// 创建库存调拨
export function createStockTransfer(transfer: Omit<StockTransfer, 'id' | 'transferNo' | 'createdAt' | 'updatedAt'>): StockTransfer {
  const newTransfer: StockTransfer = {
    ...transfer,
    id: `stock_transfer_${Date.now()}`,
    transferNo: generateTransferNo(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  const transfers = getStockTransfers();
  transfers.push(newTransfer);
  localStorage.setItem(STOCK_TRANSFERS_KEY, JSON.stringify(transfers));
  
  return newTransfer;
}

// 审批库存调拨
export function approveStockTransfer(transferId: string, approved: boolean, approvedBy: string): void {
  if (typeof window === 'undefined') return;
  const transfers = getStockTransfers();
  const index = transfers.findIndex(t => t.id === transferId);
  if (index >= 0) {
    transfers[index].status = approved ? '已审批' : '已拒绝';
    transfers[index].approvedBy = approvedBy;
    transfers[index].approvedAt = new Date().toISOString();
    transfers[index].updatedAt = new Date().toISOString();
    localStorage.setItem(STOCK_TRANSFERS_KEY, JSON.stringify(transfers));
  }
}

// 完成库存调拨
export function completeStockTransfer(transferId: string): void {
  if (typeof window === 'undefined') return;
  const transfers = getStockTransfers();
  const transfer = transfers.find(t => t.id === transferId);
  if (!transfer || transfer.status !== '已审批') return;
  
  // 减少源仓库库存
  const items = getStockItems();
  const fromItemIndex = items.findIndex(
    i => i.materialCode === transfer.materialCode && i.warehouseId === transfer.fromWarehouseId
  );
  
  if (fromItemIndex >= 0) {
    const fromItem = items[fromItemIndex];
    if (fromItem.quantity >= transfer.quantity) {
      // 记录源仓库出库
      recordStockChange({
        materialCode: transfer.materialCode,
        materialName: transfer.materialName,
        specification: transfer.specification,
        unit: transfer.unit,
        warehouseId: transfer.fromWarehouseId,
        warehouseName: transfer.fromWarehouseName,
        type: '出库',
        quantity: -transfer.quantity,
        beforeQuantity: fromItem.quantity,
        afterQuantity: fromItem.quantity - transfer.quantity,
        reason: `调拨到${transfer.toWarehouseName}`,
        operator: transfer.operator,
        referenceNo: transfer.transferNo
      });
      
      // 增加目标仓库库存
      const toItemIndex = items.findIndex(
        i => i.materialCode === transfer.materialCode && i.warehouseId === transfer.toWarehouseId
      );
      
      if (toItemIndex >= 0) {
        const toItem = items[toItemIndex];
        recordStockChange({
          materialCode: transfer.materialCode,
          materialName: transfer.materialName,
          specification: transfer.specification,
          unit: transfer.unit,
          warehouseId: transfer.toWarehouseId,
          warehouseName: transfer.toWarehouseName,
          type: '入库',
          quantity: transfer.quantity,
          beforeQuantity: toItem.quantity,
          afterQuantity: toItem.quantity + transfer.quantity,
          reason: `从${transfer.fromWarehouseName}调拨`,
          operator: transfer.operator,
          referenceNo: transfer.transferNo
        });
      } else {
        // 创建新的库存项目
        const newItem: StockItem = {
          id: `stock_${Date.now()}`,
          materialCode: transfer.materialCode,
          materialName: transfer.materialName,
          specification: transfer.specification,
          unit: transfer.unit,
          warehouseId: transfer.toWarehouseId,
          warehouseName: transfer.toWarehouseName,
          quantity: transfer.quantity,
          safetyStock: 0,
          maxStock: 0,
          status: '正常',
          lastInDate: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        saveStockItem(newItem);
        
        recordStockChange({
          materialCode: transfer.materialCode,
          materialName: transfer.materialName,
          specification: transfer.specification,
          unit: transfer.unit,
          warehouseId: transfer.toWarehouseId,
          warehouseName: transfer.toWarehouseName,
          type: '入库',
          quantity: transfer.quantity,
          beforeQuantity: 0,
          afterQuantity: transfer.quantity,
          reason: `从${transfer.fromWarehouseName}调拨`,
          operator: transfer.operator,
          referenceNo: transfer.transferNo
        });
      }
      
      // 更新调拨状态
      transfer.status = '已完成';
      transfer.completedAt = new Date().toISOString();
      transfer.updatedAt = new Date().toISOString();
      localStorage.setItem(STOCK_TRANSFERS_KEY, JSON.stringify(transfers));
    }
  }
}

// 获取库存统计
export function getInventorySummary(): {
  totalWarehouses: number;
  totalItems: number;
  totalQuantity: number;
  alertCount: number;
  outOfStockCount: number;
  overStockCount: number;
} {
  const warehouses = getWarehouses();
  const items = getStockItems();
  const alerts = getStockAlerts();
  
  return {
    totalWarehouses: warehouses.length,
    totalItems: items.length,
    totalQuantity: items.reduce((sum, item) => sum + item.quantity, 0),
    alertCount: alerts.filter(a => !a.handled).length,
    outOfStockCount: items.filter(item => item.status === '缺货').length,
    overStockCount: items.filter(item => item.status === '过多').length
  };
}
