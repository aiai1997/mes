// 发货管理类型定义

export type DeliveryStatus = '待发货' | '已发货' | '已签收' | '已取消';
export type DeliveryType = '整车发货' | '零担发货' | '快递发货' | '自提';

export interface DeliveryBox {
  id: string;
  boxNo: string;           // 箱号
  colorName: string;
  sizeName: string;
  quantity: number;
  cartonSize: string;      // 纸箱尺寸
  grossWeight: number;     // 毛重
  netWeight: number;       // 净重
}

export interface DeliveryRecord {
  id: string;
  deliveryNo: string;      // 发货单号：DEL + YYYYMMDD + XXX
  orderId: string;
  orderNo: string;
  customerId: string;
  customerName: string;
  customerAddress: string;
  customerContact: string;
  customerPhone: string;
  
  deliveryType: DeliveryType;
  logisticsCompany?: string;
  logisticsNo?: string;
  driverName?: string;
  driverPhone?: string;
  vehicleNo?: string;
  
  boxes: DeliveryBox[];
  totalBoxes: number;
  totalQuantity: number;
  totalGrossWeight: number;
  totalNetWeight: number;
  
  deliveryDate: string;
  status: DeliveryStatus;
  remark: string;
  
  operator: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  shippedAt?: string;
  receivedAt?: string;
}

const DELIVERY_KEY = 'erp_deliveries';

let deliveries: DeliveryRecord[] = [];

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
 * 初始化发货数据
 */
export function initDeliveryData(): void {
  if (typeof window === 'undefined') return;
  
  const stored = localStorage.getItem(DELIVERY_KEY);
  if (stored) {
    deliveries = JSON.parse(stored);
  } else {
    deliveries = [];
    localStorage.setItem(DELIVERY_KEY, JSON.stringify(deliveries));
  }
}

/**
 * 获取所有发货记录
 */
export function getDeliveries(): DeliveryRecord[] {
  return [...deliveries].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/**
 * 根据ID获取发货记录
 */
export function getDeliveryById(id: string): DeliveryRecord | undefined {
  return deliveries.find(d => d.id === id);
}

/**
 * 根据订单号获取发货记录
 */
export function getDeliveriesByOrder(orderNo: string): DeliveryRecord[] {
  return deliveries.filter(d => d.orderNo === orderNo);
}

/**
 * 保存发货记录
 */
export function saveDeliveryRecord(record: DeliveryRecord): void {
  record.updatedAt = getNowStr();
  const index = deliveries.findIndex(d => d.id === record.id);
  if (index >= 0) {
    deliveries[index] = record;
  } else {
    deliveries.push(record);
  }
  localStorage.setItem(DELIVERY_KEY, JSON.stringify(deliveries));
}

/**
 * 删除发货记录（仅待发货状态可删除）
 */
export function deleteDeliveryRecord(id: string): boolean {
  const record = deliveries.find(d => d.id === id);
  if (!record || record.status !== '待发货') return false;
  deliveries = deliveries.filter(d => d.id !== id);
  localStorage.setItem(DELIVERY_KEY, JSON.stringify(deliveries));
  return true;
}

/**
 * 确认发货
 */
export function confirmDelivery(id: string, logisticsNo: string): boolean {
  const record = deliveries.find(d => d.id === id);
  if (!record || record.status !== '待发货') return false;
  
  record.status = '已发货';
  record.logisticsNo = logisticsNo;
  record.shippedAt = getNowStr();
  localStorage.setItem(DELIVERY_KEY, JSON.stringify(deliveries));
  return true;
}

/**
 * 确认签收
 */
export function confirmReceived(id: string): boolean {
  const record = deliveries.find(d => d.id === id);
  if (!record || record.status !== '已发货') return false;
  
  record.status = '已签收';
  record.receivedAt = getNowStr();
  localStorage.setItem(DELIVERY_KEY, JSON.stringify(deliveries));
  return true;
}

/**
 * 取消发货
 */
export function cancelDelivery(id: string): boolean {
  const record = deliveries.find(d => d.id === id);
  if (!record || record.status === '已签收') return false;
  
  record.status = '已取消';
  localStorage.setItem(DELIVERY_KEY, JSON.stringify(deliveries));
  return true;
}

/**
 * 生成发货单号
 */
export function generateDeliveryNo(): string {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const todayRecords = deliveries.filter(d => d.deliveryNo.includes(dateStr));
  const seq = (todayRecords.length + 1).toString().padStart(3, '0');
  return `DEL${dateStr}${seq}`;
}

/**
 * 获取发货统计
 */
export function getDeliveryStats(): {
  total: number;
  pending: number;
  shipped: number;
  received: number;
} {
  return {
    total: deliveries.length,
    pending: deliveries.filter(d => d.status === '待发货').length,
    shipped: deliveries.filter(d => d.status === '已发货').length,
    received: deliveries.filter(d => d.status === '已签收').length,
  };
}
