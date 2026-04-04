// 尺码规格表类型定义

export interface SizeSpecDetail {
  measurePoint: string;
  unit: string;
  tolerance: string;
  values: { [size: string]: string };
}

export interface SizeSpec {
  id: string;
  name: string;
  customer: string;
  category: string;
  styleNo: string;
  productName: string;
  sizes: string[];
  measurePoints: string[];
  details: SizeSpecDetail[];
  version: string;
  measurements: MeasurementItem[];
  tolerance: string;
  remark: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface MeasurementItem {
  id: string;
  partName: string; // 部位名称
  order: number;
  values: { [size: string]: number };
  tolerance: string;
  measurementMethod: string;
}

// ECN工程变更类型定义

export type ECNStatus = '申请中' | '评审中' | '待执行' | '执行中' | '已完成' | '已关闭';
export type ECNType = '面料变更' | '工艺变更' | '尺码变更' | '颜色变更' | '其他';
export type ChangeType = '工艺变更' | '物料变更' | '尺寸变更' | '颜色变更' | '包装变更' | '其他变更';
export type Priority = '紧急' | '普通' | '低';

export interface ECN {
  id: string;
  ecnNo: string;
  changeType: ChangeType;
  priority: Priority;
  
  // 关联信息
  bomNo: string;
  orderNo?: string;
  styleNo?: string;
  
  // 变更内容
  changeContent: string;
  beforeContent: string;
  afterContent: string;
  changeReason: string;
  
  // 影响范围
  affectedOrders: number;
  affectBOM: boolean;
  affectCutting: boolean;
  affectWorkshop: boolean;
  affectPurchase: boolean;
  
  // 审核流程
  status: ECNStatus;
  applicant: string;
  reviewer?: string;
  reviewedAt?: string;
  reviewComment?: string;
  executor?: string;
  completedAt?: string;
  executeComment?: string;
  
  // 附件
  attachments: string[];
  
  remark: string;
  createdAt: string;
  updatedAt: string;
}

export interface ECNRecord {
  id: string;
  ecnNo: string;
  ecnType: ECNType;
  
  // 关联订单
  orderId: string;
  orderNo: string;
  styleNo: string;
  
  // 变更内容
  changeDescription: string;
  beforeContent: string;
  afterContent: string;
  
  // 影响范围
  affectBOM: boolean;
  affectCutting: boolean;
  affectWorkshop: boolean;
  affectPurchase: boolean;
  affectDescription: string;
  
  // 新BOM版本
  newBOMVersion?: string;
  
  // 审核
  status: ECNStatus;
  reviewedBy?: string;
  reviewedTime?: string;
  reviewComment?: string;
  
  remark: string;
  createdBy: string;
  createdAt: string;
}

// 物料替代类型定义

export type SubstituteStatus = '待审批' | '已生效' | '已失效';

export interface MaterialSubstitute {
  id: string;
  originalMaterial: string;
  originalName: string;
  substituteMaterial: string;
  substituteName: string;
  substituteRatio: string;
  validFrom: string;
  validTo?: string;
  relatedBOM?: string;
  status: SubstituteStatus;
  remark: string;
  createdBy: string;
  createdAt: string;
}

// 借料管理类型定义

export type BorrowStatus = '申请中' | '已借出' | '部分归还' | '已归还' | '已逾期';
export type BorrowType = '借入' | '借出';

export interface BorrowRecord {
  id: string;
  borrowNo: string;
  borrowType: BorrowType;
  materialNo: string;
  materialName: string;
  unit: string;
  borrowQuantity: number;
  returnedQuantity: number;
  counterparty: string; // 对方单位
  borrowDate: string;
  expectedReturnDate: string;
  actualReturnDate?: string;
  status: BorrowStatus;
  remark: string;
  createdBy: string;
  createdAt: string;
}

// 预警消息中心类型定义

export type AlertType = '订单交期' | '物料预警' | '生产异常' | '质量异常' | '外协超期' | '质检超时';
export type AlertLevel = '提示' | '警告' | '紧急';
export type AlertStatus = '未读' | '已读' | '已处理';

export interface AlertMessage {
  id: string;
  alertType: AlertType;
  alertLevel: AlertLevel;
  title: string;
  content: string;
  
  // 关联信息
  relatedType?: string;
  relatedId?: string;
  relatedNo?: string;
  
  // 状态
  status: AlertStatus;
  readTime?: string;
  handleTime?: string;
  handler?: string;
  
  createdAt: string;
}

// 多仓库类型定义

export type WarehouseType = '原料仓' | '成品仓' | '辅料仓' | '半成品仓' | '客供料仓' | '委外仓' | '残次品仓';

export interface WarehouseArea {
  id: string;
  code: string;
  name: string;
  temperature?: string;
  binCount: number;
  utilization: number;
  manager: string;
  status: '正常' | '停用';
}

export interface BinLocation {
  id: string;
  code: string;
  name: string;
  areaId: string;
  status: '空闲' | '使用中' | '锁定';
}

export interface InventoryItem {
  id: string;
  materialNo: string;
  materialName: string;
  binId: string;
  quantity: number;
  batchNo?: string;
}

export interface WarehouseInfo {
  id: string;
  code: string;
  name: string;
  warehouseType: WarehouseType;
  manager: string;
  location: string;
  totalArea: number;
  totalCapacity: number;
  usedCapacity: number;
  areaCount: number;
  binCount: number;
  areas: WarehouseArea[];
  bins: BinLocation[];
  inventory: InventoryItem[];
  isActive: boolean;
  remark: string;
}

export interface WarehouseLocation {
  id: string;
  zoneCode: string; // A区/B区
  zoneName: string;
  shelfCode: string; // 货架号
  locationCode: string; // 库位编码
  isAvailable: boolean;
}

// 兼容旧类型
export type Warehouse = WarehouseInfo;

export interface StockTransfer {
  id: string;
  transferNo: string;
  fromWarehouseId: string;
  fromWarehouseName: string;
  toWarehouseId: string;
  toWarehouseName: string;
  items: StockTransferItem[];
  status: '待审核' | '已审核' | '已完成';
  remark: string;
  createdBy: string;
  createdAt: string;
}

export interface StockTransferItem {
  id: string;
  materialId: string;
  materialNo: string;
  materialName: string;
  unit: string;
  quantity: number;
  fromLocation: string;
  toLocation: string;
}

// 客供料类型定义

export type CustomerMaterialType = '客供料' | '委外加工';
export type CustomerMaterialStatus = '待收货' | '已入库' | '已发料' | '已用完';

export interface CustomerMaterial {
  id: string;
  materialNo: string;
  materialName: string;
  materialType: CustomerMaterialType;
  customerId: string;
  customerName: string;
  unit: string;
  orderNo: string;
  
  // 库存
  totalQuantity: number;
  receivedQuantity: number;
  issuedQuantity: number;
  usedQuantity: number;
  remainingQuantity: number;
  
  // 仓库
  warehouseId?: string;
  warehouseName?: string;
  
  // 状态
  status: CustomerMaterialStatus;
  
  // 不计入成本
  isCostExcluded: boolean;
  
  remark: string;
  createdAt: string;
}

export interface CustomerMaterialLog {
  id: string;
  materialId: string;
  logType: '入库' | '领用' | '消耗' | '退回' | '损耗';
  quantity: number;
  orderId?: string;
  orderNo?: string;
  operator: string;
  operateTime: string;
  remark: string;
}

// 模拟数据
let sizeSpecs: SizeSpec[] = [];
let ecnRecords: ECNRecord[] = [];
let ecns: ECN[] = [];
let alertMessages: AlertMessage[] = [];
let warehouses: Warehouse[] = [];
let customerMaterials: CustomerMaterial[] = [];
let materialSubstitutes: MaterialSubstitute[] = [];
let borrowRecords: BorrowRecord[] = [];

export function initMiscData() {
  if (typeof window === 'undefined') return;
  
  // 尺码规格表
  const storedSizeSpecs = localStorage.getItem('erp_size_specs');
  if (!storedSizeSpecs) {
    sizeSpecs = [
      {
        id: '1',
        name: '男士T恤规格表',
        customer: '优衣库',
        category: 'T恤',
        styleNo: 'ST2024001',
        productName: '男士休闲T恤',
        sizes: ['S', 'M', 'L', 'XL', 'XXL'],
        measurePoints: ['胸围', '肩宽', '衣长', '袖长'],
        details: [
          { measurePoint: '胸围', unit: 'cm', tolerance: '±1cm', values: { 'S': '96', 'M': '100', 'L': '104', 'XL': '108', 'XXL': '112' } },
          { measurePoint: '肩宽', unit: 'cm', tolerance: '±1cm', values: { 'S': '40', 'M': '42', 'L': '44', 'XL': '46', 'XXL': '48' } },
          { measurePoint: '衣长', unit: 'cm', tolerance: '±1cm', values: { 'S': '64', 'M': '66', 'L': '68', 'XL': '70', 'XXL': '72' } },
          { measurePoint: '袖长', unit: 'cm', tolerance: '±0.5cm', values: { 'S': '20', 'M': '21', 'L': '22', 'XL': '23', 'XXL': '24' } },
        ],
        version: 'V1.0',
        measurements: [],
        tolerance: '±1cm',
        remark: '',
        createdBy: 'admin',
        createdAt: '2024-01-10 10:00:00',
        updatedAt: '2024-01-10 10:00:00',
      },
    ];
    localStorage.setItem('erp_size_specs', JSON.stringify(sizeSpecs));
  } else {
    sizeSpecs = JSON.parse(storedSizeSpecs);
  }
  
  // ECN
  const storedECN = localStorage.getItem('erp_ecn_records');
  if (!storedECN) {
    ecnRecords = [];
    localStorage.setItem('erp_ecn_records', JSON.stringify(ecnRecords));
  } else {
    ecnRecords = JSON.parse(storedECN);
  }
  
  // 新版ECN
  const storedECNs = localStorage.getItem('erp_ecns');
  if (!storedECNs) {
    ecns = [
      {
        id: '1',
        ecnNo: 'ECN20240115001',
        changeType: '物料变更',
        priority: '普通',
        bomNo: 'BOM20240110001',
        orderNo: 'ORD20240110001',
        styleNo: 'ST2024001',
        changeContent: '面料由纯棉改为涤棉混纺',
        beforeContent: '纯棉面料 100%',
        afterContent: '涤棉混纺 65/35',
        changeReason: '成本优化',
        affectedOrders: 2,
        affectBOM: true,
        affectCutting: false,
        affectWorkshop: false,
        affectPurchase: true,
        status: '已完成',
        applicant: '张工',
        reviewer: '李经理',
        reviewedAt: '2024-01-15 10:00:00',
        reviewComment: '同意变更',
        executor: '王工',
        completedAt: '2024-01-15 14:00:00',
        executeComment: '已完成物料替换',
        attachments: [],
        remark: '',
        createdAt: '2024-01-15 09:00:00',
        updatedAt: '2024-01-15 14:00:00',
      },
    ];
    localStorage.setItem('erp_ecns', JSON.stringify(ecns));
  } else {
    ecns = JSON.parse(storedECNs);
  }
  
  // 预警消息
  const storedAlerts = localStorage.getItem('erp_alert_messages');
  if (!storedAlerts) {
    alertMessages = [
      {
        id: '1',
        alertType: '物料预警',
        alertLevel: '紧急',
        title: '纯棉面料库存不足',
        content: '订单ORD20240110001所需纯棉面料库存不足，缺料3500米，将影响生产进度',
        relatedType: 'MRP',
        relatedId: '1',
        relatedNo: 'MRP20240110001',
        status: '未读',
        createdAt: '2024-01-15 08:00:00',
      },
      {
        id: '2',
        alertType: '订单交期',
        alertLevel: '警告',
        title: '订单即将到期',
        content: '订单ORD20240110001将于5天后到期，请关注生产进度',
        relatedType: 'Order',
        relatedId: '1',
        relatedNo: 'ORD20240110001',
        status: '未读',
        createdAt: '2024-01-15 08:00:00',
      },
    ];
    localStorage.setItem('erp_alert_messages', JSON.stringify(alertMessages));
  } else {
    alertMessages = JSON.parse(storedAlerts);
  }
  
  // 仓库
  const storedWarehouses = localStorage.getItem('erp_warehouses');
  if (!storedWarehouses) {
    warehouses = [
      { 
        id: '1', 
        code: 'WH01', 
        name: '原料仓', 
        warehouseType: '原料仓', 
        manager: '张仓管', 
        location: 'A栋1楼', 
        totalArea: 500,
        totalCapacity: 10000,
        usedCapacity: 6500,
        areaCount: 3,
        binCount: 50,
        areas: [
          { id: '1', code: 'A', name: '面料区', binCount: 20, utilization: 75, manager: '张三', status: '正常' },
          { id: '2', code: 'B', name: '辅料区', binCount: 15, utilization: 60, manager: '李四', status: '正常' },
          { id: '3', code: 'C', name: '包材区', binCount: 15, utilization: 55, manager: '王五', status: '正常' },
        ],
        bins: [],
        inventory: [],
        isActive: true, 
        remark: '' 
      },
      { 
        id: '2', 
        code: 'WH02', 
        name: '成品仓', 
        warehouseType: '成品仓', 
        manager: '李仓管', 
        location: 'B栋1楼', 
        totalArea: 800,
        totalCapacity: 15000,
        usedCapacity: 8000,
        areaCount: 2,
        binCount: 60,
        areas: [],
        bins: [],
        inventory: [],
        isActive: true, 
        remark: '' 
      },
      { 
        id: '3', 
        code: 'WH03', 
        name: '客供料仓', 
        warehouseType: '客供料仓', 
        manager: '王仓管', 
        location: 'A栋2楼', 
        totalArea: 200,
        totalCapacity: 5000,
        usedCapacity: 2000,
        areaCount: 1,
        binCount: 20,
        areas: [],
        bins: [],
        inventory: [],
        isActive: true, 
        remark: '' 
      },
    ];
    localStorage.setItem('erp_warehouses', JSON.stringify(warehouses));
  } else {
    warehouses = JSON.parse(storedWarehouses);
  }
  
  // 客供料
  const storedCustomerMaterials = localStorage.getItem('erp_customer_materials');
  if (!storedCustomerMaterials) {
    customerMaterials = [
      {
        id: '1',
        materialNo: 'CM001',
        materialName: '客供拉链',
        materialType: '客供料',
        customerId: 'C001',
        customerName: '优衣库',
        unit: '条',
        orderNo: 'ORD20240110001',
        totalQuantity: 5000,
        receivedQuantity: 5000,
        issuedQuantity: 2000,
        usedQuantity: 2000,
        remainingQuantity: 3000,
        warehouseId: '3',
        warehouseName: '客供料仓',
        status: '已发料',
        isCostExcluded: true,
        remark: '',
        createdAt: '2024-01-12 10:00:00',
      },
    ];
    localStorage.setItem('erp_customer_materials', JSON.stringify(customerMaterials));
  } else {
    customerMaterials = JSON.parse(storedCustomerMaterials);
  }
  
  // 物料替代
  const storedSubstitutes = localStorage.getItem('erp_material_substitutes');
  if (!storedSubstitutes) {
    materialSubstitutes = [
      {
        id: '1',
        originalMaterial: 'M001',
        originalName: '纯棉面料',
        substituteMaterial: 'M002',
        substituteName: '涤棉混纺面料',
        substituteRatio: '1:1',
        validFrom: '2024-01-01',
        validTo: '2024-12-31',
        relatedBOM: 'BOM20240110001',
        status: '已生效',
        remark: '',
        createdBy: 'admin',
        createdAt: '2024-01-10 10:00:00',
      },
    ];
    localStorage.setItem('erp_material_substitutes', JSON.stringify(materialSubstitutes));
  } else {
    materialSubstitutes = JSON.parse(storedSubstitutes);
  }
  
  // 借料记录
  const storedBorrows = localStorage.getItem('erp_borrow_records');
  if (!storedBorrows) {
    borrowRecords = [
      {
        id: '1',
        borrowNo: 'BR20240115001',
        borrowType: '借入',
        materialNo: 'M003',
        materialName: '纽扣',
        unit: '粒',
        borrowQuantity: 1000,
        returnedQuantity: 0,
        counterparty: '供应商A',
        borrowDate: '2024-01-15',
        expectedReturnDate: '2024-01-25',
        status: '已借出',
        remark: '',
        createdBy: 'admin',
        createdAt: '2024-01-15 09:00:00',
      },
    ];
    localStorage.setItem('erp_borrow_records', JSON.stringify(borrowRecords));
  } else {
    borrowRecords = JSON.parse(storedBorrows);
  }
}

export function getSizeSpecs(): SizeSpec[] {
  return [...sizeSpecs];
}

export function getSizeSpec(id: string): SizeSpec | undefined {
  return sizeSpecs.find(s => s.id === id);
}

export function getSizeSpecByStyleNo(styleNo: string): SizeSpec | undefined {
  return sizeSpecs.find(s => s.styleNo === styleNo);
}

export function saveSizeSpec(spec: SizeSpec) {
  const index = sizeSpecs.findIndex(s => s.id === spec.id);
  if (index >= 0) {
    sizeSpecs[index] = spec;
  } else {
    sizeSpecs.push(spec);
  }
  localStorage.setItem('erp_size_specs', JSON.stringify(sizeSpecs));
}

export function getECNRecords(): ECNRecord[] {
  return [...ecnRecords].sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
}

export function saveECNRecord(record: ECNRecord) {
  const index = ecnRecords.findIndex(r => r.id === record.id);
  if (index >= 0) {
    ecnRecords[index] = record;
  } else {
    ecnRecords.push(record);
  }
  localStorage.setItem('erp_ecn_records', JSON.stringify(ecnRecords));
}

export function getAlertMessages(): AlertMessage[] {
  return [...alertMessages].sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
}

export function getUnreadAlerts(): AlertMessage[] {
  return alertMessages.filter(a => a.status === '未读');
}

export function markAlertRead(id: string) {
  const alert = alertMessages.find(a => a.id === id);
  if (alert) {
    alert.status = '已读';
    alert.readTime = new Date().toISOString();
    localStorage.setItem('erp_alert_messages', JSON.stringify(alertMessages));
  }
}

export function getWarehouses(): Warehouse[] {
  return warehouses.filter(w => w.isActive);
}

export function saveWarehouse(warehouse: Warehouse) {
  const index = warehouses.findIndex(w => w.id === warehouse.id);
  if (index >= 0) {
    warehouses[index] = warehouse;
  } else {
    warehouses.push(warehouse);
  }
  localStorage.setItem('erp_warehouses', JSON.stringify(warehouses));
}

export function getCustomerMaterials(): CustomerMaterial[] {
  return [...customerMaterials];
}

export function saveCustomerMaterial(material: CustomerMaterial) {
  const index = customerMaterials.findIndex(m => m.id === material.id);
  if (index >= 0) {
    customerMaterials[index] = material;
  } else {
    customerMaterials.push(material);
  }
  localStorage.setItem('erp_customer_materials', JSON.stringify(customerMaterials));
}

export function generateECNNo(): string {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  return `ECN${dateStr}${(ecnRecords.length + 1).toString().padStart(3, '0')}`;
}

// 新版ECN函数
export function getECNs(): ECN[] {
  return [...ecns].sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
}

export function getECN(id: string): ECN | undefined {
  return ecns.find(e => e.id === id);
}

export function saveECN(ecn: ECN) {
  const index = ecns.findIndex(e => e.id === ecn.id);
  if (index >= 0) {
    ecns[index] = ecn;
  } else {
    ecns.push(ecn);
  }
  localStorage.setItem('erp_ecns', JSON.stringify(ecns));
}

// 物料替代函数
export function getMaterialSubstitutes(): MaterialSubstitute[] {
  return [...materialSubstitutes];
}

export function getMaterialSubstitute(id: string): MaterialSubstitute | undefined {
  return materialSubstitutes.find(s => s.id === id);
}

export function saveMaterialSubstitute(substitute: MaterialSubstitute) {
  const index = materialSubstitutes.findIndex(s => s.id === substitute.id);
  if (index >= 0) {
    materialSubstitutes[index] = substitute;
  } else {
    materialSubstitutes.push(substitute);
  }
  localStorage.setItem('erp_material_substitutes', JSON.stringify(materialSubstitutes));
}

// 借料管理函数
export function getBorrowRecords(): BorrowRecord[] {
  return [...borrowRecords].sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
}

export function getBorrowRecord(id: string): BorrowRecord | undefined {
  return borrowRecords.find(r => r.id === id);
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
