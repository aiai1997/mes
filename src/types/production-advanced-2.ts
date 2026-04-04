// ============ 66. 面料缸差/色号管理 ============
export type DyeingGrade = 'A级' | 'B级' | 'C级' | 'D级';

export interface FabricDyeing {
  id: string;
  batchNo: string;          // 批次号
  dyeingNo: string;         // 缸号
  colorNo: string;          // 色号
  pantoneNo: string;        // 潘通号
  fabricCode: string;       // 面料编号
  fabricName: string;       // 面料名称
  supplier: string;         // 供应商
  dyeingGrade: DyeingGrade; // 缸差等级
  quantity: number;         // 数量
  unit: string;
  warehouse: string;
  location: string;
  inspectionResult: '合格' | '不合格' | '待检';
  remark: string;
  createdAt: string;
}

// ============ 67. 辅料配色管理 ============
export type ColorType = '主色' | '配色' | '撞色';

export interface AccessoryColorScheme {
  id: string;
  schemeNo: string;
  schemeName: string;
  styleNo: string;
  productName: string;
  colors: {
    colorType: ColorType;
    colorName: string;
    pantoneNo: string;
    accessories: {
      accessoryCode: string;
      accessoryName: string;
      quantity: number;
      unit: string;
    }[];
  }[];
  status: '草稿' | '已确认';
  createdAt: string;
}

// ============ 68. 车间移位/转工序管理 ============
export interface WorkshopTransfer {
  id: string;
  transferNo: string;
  zaHao: string;            // 扎号
  orderId: string;
  orderNo: string;
  fromProcess: string;      // 原工序
  toProcess: string;        // 目标工序
  fromTeam: string;         // 原班组
  toTeam: string;           // 目标班组
  transferType: '工序转移' | '班组转移';
  quantity: number;
  transferPerson: string;   // 移位人
  receiver: string;         // 接收人
  transferTime: string;
  remark: string;
  status: '待接收' | '已接收';
}

// ============ 69. 车间温湿度/环境记录 ============
export interface EnvironmentRecord {
  id: string;
  recordNo: string;
  workshopNo: string;       // 车间编号
  workshopName: string;
  temperature: number;      // 温度
  humidity: number;         // 湿度
  standardTempMin: number;  // 标准温度下限
  standardTempMax: number;  // 标准温度上限
  standardHumidityMin: number;
  standardHumidityMax: number;
  isExceeded: boolean;      // 是否超标
  recorder: string;
  recordTime: string;
  remark: string;
}

// ============ 70. 工具/刀具/易耗品管理 ============
export interface ToolItem {
  id: string;
  toolNo: string;
  toolName: string;
  category: '工具' | '刀具' | '易耗品';
  specification: string;
  unit: string;
  stockQty: number;
  minQty: number;
  unitPrice: number;
  location: string;
  status: '在库' | '领用' | '报废';
}

export interface ToolUsage {
  id: string;
  usageNo: string;
  toolId: string;
  toolNo: string;
  toolName: string;
  usageType: '领用' | '归还' | '报废' | '丢失';
  employeeId: string;
  employeeName: string;
  quantity: number;
  remark: string;
  createdAt: string;
}

// ============ 71. 生产辅料零头管理 ============
export interface MaterialRemnant {
  id: string;
  remnantNo: string;
  materialCode: string;
  materialName: string;
  category: '余料' | '碎料' | '剩线';
  quantity: number;
  unit: string;
  location: string;
  sourceOrderNo: string;
  usable: boolean;
  createdAt: string;
}

// ============ 72. 外协厂押金/保证金管理 ============
export interface OutsourceDeposit {
  id: string;
  depositNo: string;
  supplierId: string;
  supplierName: string;
  depositType: '押金' | '保证金';
  amount: number;
  paidAmount: number;
  deductedAmount: number;
  returnedAmount: number;
  balance: number;
  paymentDate: string;
  status: '已缴纳' | '部分扣除' | '已退还';
  remark: string;
  createdAt: string;
}

// ============ 73. 客户价格等级管理 ============
export type CustomerGrade = 'VIP' | 'A' | 'B' | 'C';

export interface CustomerPriceGrade {
  id: string;
  customerId: string;
  customerName: string;
  grade: CustomerGrade;
  discountRate: number;     // 折扣率
  creditLimit: number;      // 赊销额度
  creditDays: number;       // 账期天数
  priceHistory: {
    styleNo: string;
    productName: string;
    unitPrice: number;
    effectiveDate: string;
  }[];
  createdAt: string;
}

// ============ 74. 面料测试/理化报告管理 ============
export interface FabricTestReport {
  id: string;
  reportNo: string;
  fabricCode: string;
  fabricName: string;
  supplier: string;
  batchNo: string;
  testDate: string;
  testItems: {
    itemName: string;
    standard: string;
    result: string;
    status: '合格' | '不合格';
  }[];
  conclusion: '合格' | '不合格' | '特采使用';
  attachments: string[];
  tester: string;
  reviewer: string;
  status: '待审核' | '已审核';
}

// ============ 75. 生产节拍管理 ============
export interface ProductionTakt {
  id: string;
  processCode: string;
  processName: string;
  standardTime: number;     // 标准工时(秒)
  targetTakt: number;       // 目标节拍(秒)
  actualTime: number;       // 实际工时(秒)
  efficiency: number;       // 效率%
  teamName: string;
  date: string;
  shift: '白班' | '晚班' | '夜班';
  output: number;
  workerCount: number;
}

// ============ 76. 杂工/临时工管理 ============
export interface TemporaryWorker {
  id: string;
  workerNo: string;
  name: string;
  phone: string;
  idCard: string;
  workType: string;
  hourlyRate: number;       // 时薪
  workDays: number;
  totalHours: number;
  totalAmount: number;
  paidAmount: number;
  status: '在职' | '离职' | '结算中';
  entryDate: string;
  leaveDate?: string;
}

// ============ 77. 订单合并生产 ============
export interface OrderMerge {
  id: string;
  mergeNo: string;
  orderIds: string[];
  orderNos: string[];
  fabricCode: string;
  fabricName: string;
  totalQuantity: number;
  mergedLayPlan: string;    // 合并唛架
  utilizationRate: number;  // 利用率
  fabricSaving: number;     // 节省面料
  status: '待裁床' | '已裁床' | '已完成';
  createdAt: string;
}

// ============ 78. 订单拆单生产 ============
export interface OrderSplit {
  id: string;
  splitNo: string;
  mainOrderId: string;
  mainOrderNo: string;
  mainQuantity: number;
  subOrders: {
    subOrderNo: string;
    quantity: number;
    cuttingId?: string;
    status: string;
  }[];
  splitReason: string;
  createdAt: string;
}

// ============ 79. 仓库库位条码管理 ============
export interface WarehouseLocation {
  id: string;
  locationCode: string;     // A-01-02-03
  warehouse: string;
  zone: string;             // 区
  shelf: string;            // 架
  layer: string;            // 层
  position: string;         // 位
  barcode: string;
  materialCode?: string;
  materialName?: string;
  quantity?: number;
  status: '空闲' | '占用' | '锁定';
}

// ============ 80. 物料领用先进先出 FIFO ============
export interface FIFOMaterial {
  id: string;
  materialCode: string;
  materialName: string;
  batchNo: string;
  inboundDate: string;
  quantity: number;
  usedQuantity: number;
  remainingQty: number;
  expiryDate?: string;
  daysInStock: number;
  isExpired: boolean;
  priority: number;         // 领用优先级
}

// ============ 81. 生产急单插单管理 ============
export interface UrgentOrderInsert {
  id: string;
  insertNo: string;
  orderId: string;
  orderNo: string;
  originalPriority: number;
  newPriority: number;
  affectedOrders: {
    orderNo: string;
    originalDelivery: string;
    newDelivery: string;
  }[];
  insertReason: string;
  approvedBy: string;
  approvedAt: string;
  status: '待审批' | '已批准' | '已拒绝';
  createdAt: string;
}

// ============ 82. 车间罚款/奖励管理 ============
export interface RewardPenalty {
  id: string;
  recordNo: string;
  employeeId: string;
  employeeName: string;
  type: '奖励' | '罚款';
  category: '效率' | '品质' | '全勤' | '返工' | '报废' | '迟到' | '浪费';
  amount: number;
  reason: string;
  orderNo?: string;
  processName?: string;
  approvedBy: string;
  createdAt: string;
  status: '待确认' | '已确认';
}

// ============ 83. 布皮/碎料变卖管理 ============
export interface WasteSale {
  id: string;
  saleNo: string;
  wasteType: string;
  weight: number;
  unit: string;
  unitPrice: number;
  totalAmount: number;
  buyer: string;
  saleDate: string;
  handler: string;
  remark: string;
}

// ============ 84. 客户授权/赊销额度管理 ============
export interface CustomerCredit {
  id: string;
  customerId: string;
  customerName: string;
  creditLimit: number;
  usedAmount: number;
  availableAmount: number;
  overdueAmount: number;
  creditDays: number;
  status: '正常' | '超额度' | '逾期';
  warningLevel: '绿色' | '黄色' | '红色';
}

// ============ 85. 采购价格对比管理 ============
export interface PurchasePriceCompare {
  id: string;
  materialCode: string;
  materialName: string;
  supplier: string;
  currentPrice: number;
  historyMinPrice: number;
  historyMaxPrice: number;
  historyAvgPrice: number;
  priceChange: number;      // 价格变动%
  isAbnormal: boolean;
  lastPurchaseDate: string;
}

// ============ 86. 生产辅料盘点专项 ============
export interface AccessoryInventoryCheck {
  id: string;
  checkNo: string;
  checkDate: string;
  warehouse: string;
  items: {
    accessoryCode: string;
    accessoryName: string;
    unit: string;
    systemQty: number;
    actualQty: number;
    difference: number;
    differenceRate: number;
  }[];
  totalDifference: number;
  checker: string;
  reviewer: string;
  status: '待审核' | '已审核';
}

// ============ 87. 车间交接班记录 ============
export type ShiftType = '白班' | '晚班' | '夜班';

export interface ShiftHandover {
  id: string;
  handoverNo: string;
  workshop: string;
  shift: ShiftType;
  handoverPerson: string;   // 交班人
  receiver: string;         // 接班人
  handoverTime: string;
  orderProgress: {
    orderNo: string;
    processName: string;
    completedQty: number;
    pendingQty: number;
  }[];
  issues: string;           // 异常问题
  notes: string;            // 注意事项
  receiverSign: boolean;    // 接班人签字
  createdAt: string;
}

// ============ 88. 客户物料放行条 ============
export interface ReleaseNote {
  id: string;
  releaseNo: string;
  orderId: string;
  orderNo: string;
  customerId: string;
  customerName: string;
  releaseItems: {
    productName: string;
    quantity: number;
    cartons: number;
  }[];
  totalQuantity: number;
  totalCartons: number;
  approvedBy: string;
  approvedAt: string;
  remark: string;
  status: '待审批' | '已批准' | '已放行';
}

// ============ 89. 系统编码规则自定义 ============
export interface CodeRule {
  id: string;
  module: string;
  prefix: string;
  dateFormat: string;
  serialDigits: number;
  currentSerial: number;
  example: string;
  description: string;
  updatedAt: string;
}

// ============ 91. 成本卷积计算 ============
export interface CostRollup {
  id: string;
  productId: string;
  productCode: string;
  productName: string;
  materialCost: number;     // 主料成本
  accessoryCost: number;    // 辅料成本
  laborCost: number;        // 人工成本
  outsourceCost: number;    // 外协成本
  wastageCost: number;      // 损耗成本
  overheadCost: number;     // 分摊费用
  otherCost: number;        // 杂费
  totalCost: number;        // 总成本
  calculatedAt: string;
}

// ============ 92. 生产产能负荷分析 ============
export interface CapacityLoad {
  id: string;
  teamId: string;
  teamName: string;
  workshop: string;
  date: string;
  totalCapacity: number;
  scheduledCapacity: number;
  remainingCapacity: number;
  dailyCapacity: number;    // 每日产能
  plannedLoad: number;      // 计划负荷
  actualLoad: number;       // 实际负荷
  loadRate: number;         // 负荷率%
  status: '空闲' | '饱和' | '过载';
  suggestion: string;
}

// ============ 93. 验货管理 ============
export type InspectionType = 'IQC' | 'IPQC' | 'FQC' | 'OQC';

export interface Inspection {
  id: string;
  inspectionNo: string;
  type: InspectionType;
  orderId: string;
  orderNo: string;
  productId: string;
  productName: string;
  sampleQty: number;
  defectQty: number;
  defectDescription: string;
  inspector: string;
  inspectionTime: string;
  result: '合格' | '不合格';
  status: '待检验' | '检验中' | '合格' | '不合格';
  remark: string;
  createdAt: string;
}

export interface InspectionRecord {
  id: string;
  inspectionNo: string;
  orderId: string;
  orderNo: string;
  customerId: string;
  customerName: string;
  inspectionType: '客户QC' | '第三方验货' | '内部验货';
  inspector: string;
  inspectionDate: string;
  inspectionLocation: string;
  aqlStandard: string;
  sampleSize: number;
  defectCount: number;
  result: '通过' | '返工' | '拒货';
  reportAttachments: string[];
  remark: string;
  status: '待验货' | '已验货';
}

// ============ 94. 装箱清单 Packing List ============
export interface PackingList {
  id: string;
  packingNo: string;
  orderId: string;
  orderNo: string;
  customerId: string;
  customerName: string;
  destinationPort: string;
  shipDate: string;
  totalQuantity: number;
  totalCartons: number;
  totalGrossWeight: number;
  totalNetWeight: number;
  totalVolume: number;
  items: {
    cartonNo: string;
    productName: string;
    styleNo: string;
    color: string;
    size: string;
    quantity: number;
    grossWeight: number;
    netWeight: number;
    volume: number;
  }[];
  exportFormat: 'PDF' | 'Excel';
  status: '草稿' | '已确认' | '已打印';
  createdAt: string;
}

// ============ 95. 商业发票 Commercial Invoice ============
export interface CommercialInvoice {
  id: string;
  invoiceNo: string;
  packingListNo: string;
  orderId: string;
  orderNo: string;
  customerId: string;
  customerName: string;
  invoiceDate: string;
  currency: string;
  exchangeRate: number;
  paymentTerms: string;
  totalQuantity: number;
  totalAmount: number;
  fobPrice: number;
  destinationPort: string;
  items: {
    productName: string;
    styleNo: string;
    quantity: number;
    unitPrice: number;
    amount: number;
  }[];
  shippingMarks: string;
  customsInfo: string;
  status: '草稿' | '已确认' | '已打印';
  createdAt: string;
}

// ============ 96. 生产SOP工艺文档管理 ============
export interface SopDocument {
  id: string;
  code: string;
  name: string;
  category: string;
  process: string;
  version: string;
  fileName: string;
  uploadedBy: string;
  uploadedAt: string;
  sopNo: string;
  styleNo: string;
  productName: string;
  processSteps: {
    stepNo: number;
    processName: string;
    description: string;
    images: string[];
    video?: string;
    notes: string;
    standardTime: number;
  }[];
  attachments: string[];
  status: '草稿' | '已发布' | '已归档';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// ============ 97. 员工计件实时查询 ============
export interface PieceWorkQuery {
  id: string;
  employeeId: string;
  employeeName: string;
  workshop: string;
  team: string;
  date: string;
  month: string;
  processCount: number;
  totalQuantity: number;
  totalAmount: number;
  lastUpdate: string;
  dailyRecords: {
    orderNo: string;
    processName: string;
    quantity: number;
    unitPrice: number;
    amount: number;
  }[];
  dailyTotal: number;
  monthlyTotal: number;
}

// ============ 99. 订单关闭/反关闭管理 ============
export interface OrderCloseRecord {
  id: string;
  orderId: string;
  orderNo: string;
  styleNo: string;
  customer: string;
  orderQuantity: number;
  deliveredQuantity: number;
  unfinishedQuantity: number;
  deliveryDate: string;
  status: '正常' | '已关闭' | '待审核';
  closeType: '关闭' | '反关闭';
  closeReason: string;
  closedAt?: string;
  deliveryCompleted: boolean;
  allShipped: boolean;
  allInvoiced: boolean;
  approvedBy: string;
  approvedAt: string;
  remark: string;
}

// ============ 100. 大数据中心报表 ============
export interface BigDataReport {
  id: string;
  reportType: string;
  name: string;
  description: string;
  reportName: string;
  period: '日' | '周' | '月' | '年';
  startDate: string;
  endDate: string;
  data: Record<string, unknown>;
  generatedAt: string;
  generatedBy: string;
}

// ============ 数据存储函数 ============
const KEYS = {
  DYEING: 'erp_fabric_dyeings',
  COLOR_SCHEME: 'erp_color_schemes',
  WORKSHOP_TRANSFER: 'erp_workshop_transfers',
  ENVIRONMENT: 'erp_environment_records',
  TOOL: 'erp_tools',
  TOOL_USAGE: 'erp_tool_usages',
  REMNANT: 'erp_material_remnants',
  DEPOSIT: 'erp_outsource_deposits',
  CUSTOMER_GRADE: 'erp_customer_grades',
  TEST_REPORT: 'erp_fabric_test_reports',
  TAKT: 'erp_production_takts',
  TEMP_WORKER: 'erp_temp_workers',
  ORDER_MERGE: 'erp_order_merges',
  ORDER_SPLIT: 'erp_order_splits',
  LOCATION: 'erp_warehouse_locations',
  FIFO: 'erp_fifo_materials',
  URGENT_INSERT: 'erp_urgent_inserts',
  REWARD_PENALTY: 'erp_reward_penalties',
  WASTE_SALE: 'erp_waste_sales',
  CUSTOMER_CREDIT: 'erp_customer_credits',
  PRICE_COMPARE: 'erp_purchase_price_compare',
  ACCESSORY_CHECK: 'erp_accessory_inventory_check',
  SHIFT_HANDOVER: 'erp_shift_handovers',
  RELEASE_NOTE: 'erp_release_notes',
  CODE_RULE: 'erp_code_rules',
  COST_ROLLUP: 'erp_cost_rollups',
  CAPACITY_LOAD: 'erp_capacity_loads',
  INSPECTION: 'erp_inspections',
  PACKING_LIST: 'erp_packing_lists',
  COMMERCIAL_INVOICE: 'erp_commercial_invoices',
  SOP: 'erp_sop_documents',
  PIECE_QUERY: 'erp_piece_work_queries',
  ORDER_CLOSE: 'erp_order_close_records',
  BIG_DATA: 'erp_big_data_reports',
};

// 通用存储函数
function getData<T>(key: string): T[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
}

function setData<T>(key: string, data: T[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(data));
}

// ============ 导出函数 ============
// 缸差管理
export const getFabricDyeings = () => getData<FabricDyeing>(KEYS.DYEING);
export const saveFabricDyeings = (data: FabricDyeing[]) => setData(KEYS.DYEING, data);

// 配色管理
export const getColorSchemes = () => getData<AccessoryColorScheme>(KEYS.COLOR_SCHEME);
export const saveColorSchemes = (data: AccessoryColorScheme[]) => setData(KEYS.COLOR_SCHEME, data);

// 车间移位
export const getWorkshopTransfers = () => getData<WorkshopTransfer>(KEYS.WORKSHOP_TRANSFER);
export const saveWorkshopTransfers = (data: WorkshopTransfer[]) => setData(KEYS.WORKSHOP_TRANSFER, data);

// 环境记录
export const getEnvironmentRecords = () => getData<EnvironmentRecord>(KEYS.ENVIRONMENT);
export const saveEnvironmentRecords = (data: EnvironmentRecord[]) => setData(KEYS.ENVIRONMENT, data);

// 工具管理
export const getTools = () => getData<ToolItem>(KEYS.TOOL);
export const saveTools = (data: ToolItem[]) => setData(KEYS.TOOL, data);
export const getToolUsages = () => getData<ToolUsage>(KEYS.TOOL_USAGE);
export const saveToolUsages = (data: ToolUsage[]) => setData(KEYS.TOOL_USAGE, data);

// 零头管理
export const getMaterialRemnants = () => getData<MaterialRemnant>(KEYS.REMNANT);
export const saveMaterialRemnants = (data: MaterialRemnant[]) => setData(KEYS.REMNANT, data);

// 押金管理
export const getOutsourceDeposits = () => getData<OutsourceDeposit>(KEYS.DEPOSIT);
export const saveOutsourceDeposits = (data: OutsourceDeposit[]) => setData(KEYS.DEPOSIT, data);

// 客户等级
export const getCustomerGrades = () => getData<CustomerPriceGrade>(KEYS.CUSTOMER_GRADE);
export const saveCustomerGrades = (data: CustomerPriceGrade[]) => setData(KEYS.CUSTOMER_GRADE, data);

// 面料测试报告
export const getFabricTestReports = () => getData<FabricTestReport>(KEYS.TEST_REPORT);
export const saveFabricTestReports = (data: FabricTestReport[]) => setData(KEYS.TEST_REPORT, data);

// 生产节拍
export const getProductionTakts = () => getData<ProductionTakt>(KEYS.TAKT);
export const saveProductionTakts = (data: ProductionTakt[]) => setData(KEYS.TAKT, data);

// 临时工
export const getTemporaryWorkers = () => getData<TemporaryWorker>(KEYS.TEMP_WORKER);
export const saveTemporaryWorkers = (data: TemporaryWorker[]) => setData(KEYS.TEMP_WORKER, data);

// 订单合并
export const getOrderMerges = () => getData<OrderMerge>(KEYS.ORDER_MERGE);
export const saveOrderMerges = (data: OrderMerge[]) => setData(KEYS.ORDER_MERGE, data);

// 订单拆分
export const getOrderSplits = () => getData<OrderSplit>(KEYS.ORDER_SPLIT);
export const saveOrderSplits = (data: OrderSplit[]) => setData(KEYS.ORDER_SPLIT, data);

// 库位管理
export const getWarehouseLocations = () => getData<WarehouseLocation>(KEYS.LOCATION);
export const saveWarehouseLocations = (data: WarehouseLocation[]) => setData(KEYS.LOCATION, data);

// FIFO管理
export const getFIFOMaterials = () => getData<FIFOMaterial>(KEYS.FIFO);
export const saveFIFOMaterials = (data: FIFOMaterial[]) => setData(KEYS.FIFO, data);

// 急单插单
export const getUrgentInserts = () => getData<UrgentOrderInsert>(KEYS.URGENT_INSERT);
export const saveUrgentInserts = (data: UrgentOrderInsert[]) => setData(KEYS.URGENT_INSERT, data);

// 奖罚管理
export const getRewardPenalties = () => getData<RewardPenalty>(KEYS.REWARD_PENALTY);
export const saveRewardPenalties = (data: RewardPenalty[]) => setData(KEYS.REWARD_PENALTY, data);

// 废料变卖
export const getWasteSales = () => getData<WasteSale>(KEYS.WASTE_SALE);
export const saveWasteSales = (data: WasteSale[]) => setData(KEYS.WASTE_SALE, data);

// 客户额度
export const getCustomerCredits = () => getData<CustomerCredit>(KEYS.CUSTOMER_CREDIT);
export const saveCustomerCredits = (data: CustomerCredit[]) => setData(KEYS.CUSTOMER_CREDIT, data);

// 价格对比
export const getPurchasePriceCompares = () => getData<PurchasePriceCompare>(KEYS.PRICE_COMPARE);
export const savePurchasePriceCompares = (data: PurchasePriceCompare[]) => setData(KEYS.PRICE_COMPARE, data);

// 辅料盘点
export const getAccessoryInventoryChecks = () => getData<AccessoryInventoryCheck>(KEYS.ACCESSORY_CHECK);
export const saveAccessoryInventoryChecks = (data: AccessoryInventoryCheck[]) => setData(KEYS.ACCESSORY_CHECK, data);

// 交接班
export const getShiftHandovers = () => getData<ShiftHandover>(KEYS.SHIFT_HANDOVER);
export const saveShiftHandovers = (data: ShiftHandover[]) => setData(KEYS.SHIFT_HANDOVER, data);

// 放行条
export const getReleaseNotes = () => getData<ReleaseNote>(KEYS.RELEASE_NOTE);
export const saveReleaseNotes = (data: ReleaseNote[]) => setData(KEYS.RELEASE_NOTE, data);

// 编码规则
export const getCodeRules = () => getData<CodeRule>(KEYS.CODE_RULE);
export const saveCodeRules = (data: CodeRule[]) => setData(KEYS.CODE_RULE, data);

// 成本卷积
export const getCostRollups = () => getData<CostRollup>(KEYS.COST_ROLLUP);
export const saveCostRollups = (data: CostRollup[]) => setData(KEYS.COST_ROLLUP, data);

// 产能负荷
export const getCapacityLoads = () => getData<CapacityLoad>(KEYS.CAPACITY_LOAD);
export const saveCapacityLoads = (data: CapacityLoad[]) => setData(KEYS.CAPACITY_LOAD, data);

// 验货管理
export const getInspections = () => getData<Inspection>(KEYS.INSPECTION);
export const saveInspections = (data: Inspection[]) => setData(KEYS.INSPECTION, data);

// 装箱清单
export const getPackingLists = () => getData<PackingList>(KEYS.PACKING_LIST);
export const savePackingLists = (data: PackingList[]) => setData(KEYS.PACKING_LIST, data);

// 商业发票
export const getCommercialInvoices = () => getData<CommercialInvoice>(KEYS.COMMERCIAL_INVOICE);
export const saveCommercialInvoices = (data: CommercialInvoice[]) => setData(KEYS.COMMERCIAL_INVOICE, data);

// SOP文档
export const getSopDocuments = () => getData<SopDocument>(KEYS.SOP);
export const saveSopDocuments = (data: SopDocument[]) => setData(KEYS.SOP, data);

// 计件查询
export const getPieceWorkQueries = () => getData<PieceWorkQuery>(KEYS.PIECE_QUERY);
export const savePieceWorkQueries = (data: PieceWorkQuery[]) => setData(KEYS.PIECE_QUERY, data);

// 订单关闭
export const getOrderCloseRecords = () => getData<OrderCloseRecord>(KEYS.ORDER_CLOSE);
export const saveOrderCloseRecords = (data: OrderCloseRecord[]) => setData(KEYS.ORDER_CLOSE, data);
export const getOrderCloses = getOrderCloseRecords;
export type OrderClose = OrderCloseRecord;

// 大数据报表
export const getBigDataReports = () => getData<BigDataReport>(KEYS.BIG_DATA);
export const saveBigDataReports = (data: BigDataReport[]) => setData(KEYS.BIG_DATA, data);
export const getDataCenterReports = getBigDataReports;
export type DataCenterReport = BigDataReport;

// 计件查询别名
export const getPieceRateQueries = getPieceWorkQueries;
export type PieceRateQuery = PieceWorkQuery;

// SOP文档别名
export type SOPDocument = SopDocument;
export const getSOPDocuments = getSopDocuments;

// 放行条添加createdAt字段
export interface ReleaseNoteWithCreatedAt extends ReleaseNote {
  createdAt: string;
}

// 修复ReleaseNote类型
export const getReleaseNotesWithCreated = () => {
  const notes = getData<ReleaseNote>(KEYS.RELEASE_NOTE);
  return notes.map((n, i) => ({ ...n, createdAt: n.approvedAt || new Date().toISOString() }));
};
