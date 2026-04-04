/**
 * ERP系统完整数据库Schema定义
 * 所有表结构、字段、关联关系
 */

// ==================== 表名定义 ====================
export const TABLES = {
  // 基础资料 (1-10)
  CUSTOMERS: 'erp_customers',           // 客户档案
  SUPPLIERS: 'erp_suppliers',           // 供应商档案
  EMPLOYEES: 'erp_employees',           // 员工档案
  TEAMS: 'erp_teams',                   // 班组
  USERS: 'erp_users',                   // 用户
  ROLES: 'erp_roles',                   // 角色
  WAREHOUSES: 'erp_warehouses',         // 仓库
  DEPARTMENTS: 'erp_departments',       // 部门
  PRODUCTS: 'erp_products',             // 产品
  MATERIALS: 'erp_materials',           // 物料

  // 订单管理 (11-20)
  ORDERS: 'erp_orders',                 // 订单
  ORDER_DETAILS: 'erp_order_details',   // 订单明细
  SAMPLES: 'erp_samples',               // 样板
  SAMPLE_DETAILS: 'erp_sample_details', // 样板明细
  STYLE_FILES: 'erp_style_files',       // 款式档案
  SIZE_SPECS: 'erp_size_specs',         // 尺码规格
  COLOR_CARDS: 'erp_color_cards',       // 色卡
  ECN_RECORDS: 'erp_ecn_records',       // ECN变更记录
  ORDER_PROGRESS: 'erp_order_progress', // 订单进度
  DELIVERY_SCHEDULES: 'erp_delivery_schedules', // 交货计划

  // BOM管理 (21-25)
  BOMS: 'erp_boms',                     // BOM清单
  BOM_DETAILS: 'erp_bom_details',       // BOM明细
  BOM_MATERIALS: 'erp_bom_materials',   // BOM物料
  ZAHAO_RECORDS: 'erp_zahao_records',   // 扎号记录
  BUNDLE_RECORDS: 'erp_bundle_records', // 扎包记录

  // 工艺路线 (26-30)
  PROCESSES: 'erp_processes',           // 标准工序
  PROCESS_ROUTES: 'erp_process_routes', // 工艺路线
  PROCESS_STEPS: 'erp_process_steps',   // 工艺步骤
  PROCESS_PRICES: 'erp_process_prices', // 工序价格
  STANDARD_TIMES: 'erp_standard_times', // 标准工时

  // 裁床管理 (31-35)
  CUTTING_TASKS: 'erp_cutting_tasks',   // 裁床任务
  CUTTING_BEDS: 'erp_cutting_beds',     // 裁床床次
  CUTTING_PLANS: 'erp_cutting_plans',   // 裁床计划
  SPREADING_RECORDS: 'erp_spreading_records', // 拉布记录
  LAYERS: 'erp_layers',                 // 床次层数

  // 车间报工 (36-40)
  WORK_REPORTS: 'erp_work_reports',     // 报工记录
  WORK_ORDERS: 'erp_work_orders',       // 生产工单
  PRODUCTION_LINES: 'erp_production_lines', // 生产线
  WORK_STATIONS: 'erp_work_stations',   // 工位
  MACHINE_STATUS: 'erp_machine_status', // 设备状态

  // 尾部管理 (41-45)
  TAIL_TASKS: 'erp_tail_tasks',         // 尾部任务
  IRONING_RECORDS: 'erp_ironing_records', // 整烫记录
  QC_RECORDS: 'erp_qc_records',         // 质检记录
  PACKING_RECORDS: 'erp_packing_records', // 包装记录
  PACKING_BOXES: 'erp_packing_boxes',   // 装箱记录

  // 外协管理 (46-50)
  OUTSOURCING_ORDERS: 'erp_outsourcing_orders', // 外协订单
  OUTSOURCING_RECEIVES: 'erp_outsourcing_receives', // 外协收货
  OUTSOURCING_PAYMENTS: 'erp_outsourcing_payments', // 外协付款
  PRINT_EMBROIDERY: 'erp_print_embroidery', // 印绣花
  WASH_REQUIREMENTS: 'erp_wash_requirements', // 洗水要求

  // 财务成本 (51-60)
  RECEIVABLES: 'erp_receivables',       // 应收款
  PAYABLES: 'erp_payables',             // 应付款
  RECEIPTS: 'erp_receipts',             // 收款单
  PAYMENTS: 'erp_payments',             // 付款单
  INVOICES: 'erp_invoices',             // 发票
  COST_SHEETS: 'erp_cost_sheets',       // 成本单
  PIECE_WAGES: 'erp_piece_wages',       // 计件工资
  SALARIES: 'erp_salaries',             // 工资表
  EXPENSES: 'erp_expenses',             // 费用
  LEDGERS: 'erp_ledgers',               // 台账
  
  // 钱包管理 (61-65)
  WALLET_FLOW: 'erp_wallet_flow',       // 钱包流水
  ADVANCE_LOG: 'erp_advance_log',       // 预支明细
  REIMBURSE: 'erp_reimburse',           // 报销完整记录
  RISK_EXCEPTIONS: 'erp_risk_exceptions', // 风控异常表

  // 审核管理 (61-65)
  AUDIT_FLOWS: 'erp_audit_flows',       // 审核流程
  AUDIT_RECORDS: 'erp_audit_records',   // 审核记录
  AUDIT_TEMPLATES: 'erp_audit_templates', // 审核模板
  APPROVAL_NODES: 'erp_approval_nodes', // 审批节点
  NOTIFICATIONS: 'erp_notifications',   // 通知

  // 库存管理 (66-75)
  STOCK_ITEMS: 'erp_stock_items',       // 库存项目
  STOCK_IN: 'erp_stock_in',             // 入库单
  STOCK_OUT: 'erp_stock_out',           // 出库单
  STOCK_TRANSFERS: 'erp_stock_transfers', // 调拨单
  STOCK_CHECKS: 'erp_stock_checks',     // 盘点单
  STOCK_ALERTS: 'erp_stock_alerts',     // 库存预警
  STOCK_MOVEMENTS: 'erp_stock_movements', // 库存流水
  STOCK_LOCKS: 'erp_stock_locks',       // 库存锁定
  MATERIAL_REQUESTS: 'erp_material_requests', // 领料单
  MATERIAL_RETURNS: 'erp_material_returns', // 退料单

  // 员工班组 (76-80)
  EMPLOYEE_GROUPS: 'erp_employee_groups', // 员工分组
  ATTENDANCES: 'erp_attendances',       // 考勤
  LEAVE_RECORDS: 'erp_leave_records',   // 请假
  OVERTIME_RECORDS: 'erp_overtime_records', // 加班
  PERFORMANCE: 'erp_performance',       // 绩效

  // 客商管理 (81-85)
  CONTACTS: 'erp_contacts',             // 联系人
  CONTRACTS: 'erp_contracts',           // 合同
  PRICE_LISTS: 'erp_price_lists',       // 价目表
  DISCOUNTS: 'erp_discounts',           // 折扣
  CREDIT_LIMITS: 'erp_credit_limits',   // 信用额度

  // 报表中心 (86-90)
  REPORT_TEMPLATES: 'erp_report_templates', // 报表模板
  REPORT_DATA: 'erp_report_data',       // 报表数据
  CHART_CONFIGS: 'erp_chart_configs',   // 图表配置
  DASHBOARDS: 'erp_dashboards',         // 仪表盘
  ALERT_RULES: 'erp_alert_rules',       // 预警规则

  // 系统管理 (91-100)
  SETTINGS: 'erp_settings',             // 系统设置
  LOGS: 'erp_logs',                     // 系统日志
  LOGIN_LOGS: 'erp_login_logs',         // 登录日志
  OPERATION_LOGS: 'erp_operation_logs', // 操作日志
  ERROR_LOGS: 'erp_error_logs',         // 错误日志
  PRINT_TEMPLATES: 'erp_print_templates', // 打印模板
  BACKUPS: 'erp_backups',               // 备份记录
  SCHEDULES: 'erp_schedules',           // 生产排程
  TASKS: 'erp_tasks',                   // 任务
  MESSAGES: 'erp_messages',             // 消息

  // 系统元数据
  META: 'erp_meta',                     // 元数据
  SEQUENCES: 'erp_sequences',           // 序列号
} as const;

// ==================== 编号前缀 ====================
export const CODE_PREFIX: Record<string, string> = {
  // 基础资料
  CUSTOMERS: 'CUST',
  SUPPLIERS: 'SUP',
  EMPLOYEES: 'EMP',
  USERS: 'USR',
  PRODUCTS: 'PRD',
  MATERIALS: 'MAT',
  
  // 订单
  ORDERS: 'ORD',
  SAMPLES: 'SPL',
  STYLE_FILES: 'SF',
  
  // 生产
  BOMS: 'BOM',
  ZAHAO_RECORDS: 'ZY',
  BUNDLE_RECORDS: 'ZB',
  CUTTING_TASKS: 'CUT',
  CUTTING_BEDS: 'BED',
  WORK_REPORTS: 'WR',
  WORK_ORDERS: 'WO',
  TAIL_TASKS: 'TT',
  OUTSOURCING_ORDERS: 'OUT',
  
  // 财务
  RECEIVABLES: 'AR',
  PAYABLES: 'AP',
  RECEIPTS: 'RC',
  PAYMENTS: 'PY',
  INVOICES: 'INV',
  COST_SHEETS: 'CS',
  
  // 库存
  STOCK_IN: 'SI',
  STOCK_OUT: 'SO',
  STOCK_TRANSFERS: 'ST',
  STOCK_CHECKS: 'SC',
  MATERIAL_REQUESTS: 'MR',
  MATERIAL_RETURNS: 'RT',
  
  // 系统
  LOGS: 'LOG',
  SCHEDULES: 'SCH',
  TASKS: 'TSK',
  MESSAGES: 'MSG',
};

// ==================== 数据类型定义 ====================
export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

// 客户
export interface Customer extends BaseEntity {
  code: string;
  name: string;
  shortName?: string;
  type: '国内' | '外贸';
  level: 'A' | 'B' | 'C' | 'D';
  contact?: string;
  phone?: string;
  email?: string;
  address?: string;
  taxNo?: string;
  bank?: string;
  bankAccount?: string;
  creditLimit?: number;
  status: '启用' | '禁用';
  remark?: string;
}

// 供应商
export interface Supplier extends BaseEntity {
  code: string;
  name: string;
  shortName?: string;
  type: '面料' | '辅料' | '外协' | '其他';
  level: 'A' | 'B' | 'C' | 'D';
  contact?: string;
  phone?: string;
  email?: string;
  address?: string;
  taxNo?: string;
  bank?: string;
  bankAccount?: string;
  paymentTerms?: string;
  status: '启用' | '禁用';
  remark?: string;
}

// 员工
export interface Employee extends BaseEntity {
  code: string;
  name: string;
  gender: '男' | '女';
  idCard?: string;
  phone?: string;
  department?: string;
  position?: string;
  teamId?: string;
  teamName?: string;
  entryDate?: string;
  leaveDate?: string;
  status: '在职' | '离职' | '请假';
  skillLevel?: string;
  pieceWageRate?: number;
  bankCard?: string;
  remark?: string;
}

// 班组
export interface Team extends BaseEntity {
  code: string;
  name: string;
  type: '缝制' | '裁床' | '尾部' | '包装' | '其他';
  leaderId?: string;
  leaderName?: string;
  memberCount: number;
  workshop?: string;
  status: '启用' | '禁用';
}

// 用户
export interface User extends BaseEntity {
  username: string;
  password: string;
  realName: string;
  role: '管理员' | '业务员' | '跟单员' | '车间工人' | '组长' | '财务';
  department?: string;
  phone?: string;
  email?: string;
  permissions: string[];
  status: '启用' | '禁用';
  lastLogin?: string;
}

// 订单
export interface Order extends BaseEntity {
  orderNo: string;
  styleNo: string;
  productName: string;
  customerId?: string;
  customerName: string;
  customerModel?: string;
  brand?: string;
  season?: string;
  year?: string;
  orderDate: string;
  deliveryDate: string;
  totalQuantity: number;
  unit: '件' | '条' | '套' | '打';
  price: number;
  totalAmount: number;
  currency: 'CNY' | 'USD' | 'EUR';
  colorSizeMatrix: ColorSizeMatrix[];
  status: '草稿' | '待审核' | '已审核' | '生产中' | '已完成' | '已取消';
  priority: '普通' | '加急' | '特急';
  progress: number;
  printEmbroidery?: PrintEmbroidery[];
  washRequirement?: WashRequirement;
  packingRequirement?: PackingRequirement;
  sewingRequirement?: SewingRequirement;
  tailRequirement?: TailRequirement;
  remark?: string;
}

export interface ColorSizeMatrix {
  colorName: string;
  colorCode?: string;
  S: number;
  M: number;
  L: number;
  XL: number;
  XXL: number;
  XXXL: number;
  subtotal: number;
}

export interface PrintEmbroidery {
  position: string;
  type: string;
  width: number;
  height: number;
  colorCount: number;
  pantoneColor?: string;
  isSymmetric: boolean;
  fastness?: string;
  washRequirement?: string;
}

export interface WashRequirement {
  washType: string;
  colorEffect: string;
  shrinkageRate: string;
  ecoRequirement?: string[];
}

export interface PackingRequirement {
  packingMethod: string;
  peBagSize: string;
  cartonSize: string;
  piecesPerCarton: number;
  sizeRatio: string;
  cartonLabelType: string;
  sticker?: string;
  barcode?: string;
  moistureProof: boolean;
  desiccant: boolean;
  tissuePaper: boolean;
}

export interface SewingRequirement {
  stitchDensity?: string;
  threadType?: string;
  threadColor?: string;
  overlockType?: string;
  bartackPosition?: string;
  seamAllowance?: string;
  specialProcess?: string[];
  otherNotes?: string;
}

export interface TailRequirement {
  trimThread: boolean;
  ironing: boolean;
  inspection: boolean;
  spareButtons?: number;
  spareThread?: string;
  hangTag?: string;
  hangRope?: string;
  foldMethod?: string;
}

// BOM
export interface BOM extends BaseEntity {
  bomNo: string;
  orderNo: string;
  styleNo: string;
  productName: string;
  customerId?: string;
  customerName: string;
  status: '草稿' | '待审核' | '已审核';
  materials: BOMMaterial[];
  totalCost: number;
  remark?: string;
}

export interface BOMMaterial {
  id: string;
  materialCode: string;
  materialName: string;
  specification?: string;
  unit: string;
  unitUsage: number;
  totalUsage: number;
  unitPrice: number;
  totalPrice: number;
  supplier?: string;
  color?: string;
  position?: string;
  remark?: string;
}

// 工序
export interface Process extends BaseEntity {
  code: string;
  name: string;
  category: '缝制' | '裁床' | '尾部' | '包装' | '其他';
  standardPrice: number;
  standardTime: number;
  processOrder: number;
  description?: string;
  status: '启用' | '禁用';
}

// 工艺路线
export interface ProcessRoute extends BaseEntity {
  code: string;
  name: string;
  bomId?: string;
  bomNo?: string;
  styleNo?: string;
  processes: ProcessStep[];
  status: '草稿' | '已审核';
  remark?: string;
}

export interface ProcessStep {
  id: string;
  processCode: string;
  processName: string;
  order: number;
  standardPrice: number;
  standardTime: number;
  isRequired: boolean;
  remark?: string;
}

// 裁床任务
export interface CuttingTask extends BaseEntity {
  taskNo: string;
  orderNo: string;
  bomNo: string;
  styleNo: string;
  productName: string;
  plan: CuttingPlan;
  beds: CuttingBed[];
  zaHaoRecords: ZaHaoRecord[];
  status: '待裁' | '拉布中' | '已裁' | '已移交' | '已取消';
  remark?: string;
}

export interface CuttingPlan {
  id: string;
  orderNo: string;
  styleNo: string;
  productName: string;
  totalQuantity: number;
  status: string;
  createdAt: string;
}

export interface CuttingSizeRatio {
  sizeName: string;
  ratio: number;
  layers: number;
  pieces: number;
}

export interface CuttingBed {
  id: string;
  bedNo: string;
  bedSeq: number;
  colorName: string;
  fabricName?: string;
  fabricQuantity: number;
  sizeRatios: CuttingSizeRatio[];
  totalLayers: number;
  totalPieces: number;
  cuttedPieces: number;
  status: '待拉布' | '拉布中' | '已裁' | '已移交';
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ZaHaoRecord {
  id: string;
  zaNo: string;
  bedNo: string;
  colorName: string;
  sizeName: string;
  pieces: number;
  layerStart: number;
  layerEnd: number;
  status: '已生成' | '已移交' | '缝制中' | '已转入尾部' | '已入库';
  createdAt: string;
  transferredAt?: string;
}

// 报工记录
export interface WorkReport extends BaseEntity {
  reportNo: string;
  zaNo: string;
  orderNo: string;
  styleNo: string;
  colorName: string;
  sizeName: string;
  processCode: string;
  processName: string;
  employeeId: string;
  employeeName: string;
  teamId?: string;
  teamName?: string;
  reportDate: string;
  reportTime: string;
  goodQuantity: number;
  reworkQuantity: number;
  scrapQuantity: number;
  scrapReason?: string;
  processPrice: number;
  pieceWage: number;
  status: '待审核' | '已审核' | '已驳回';
  auditor?: string;
  auditedAt?: string;
  remark?: string;
}

// 尾部任务
export interface TailTask extends BaseEntity {
  taskNo: string;
  orderNo: string;
  styleNo: string;
  productName: string;
  colorName: string;
  sizeName: string;
  zaNo: string;
  quantity: number;
  completedQuantity: number;
  ironing: boolean;
  ironingStatus?: '待整烫' | '整烫中' | '已完成';
  inspection: boolean;
  inspectionStatus?: '待质检' | '质检中' | '已完成';
  qcResult?: '合格' | '返工' | '报废';
  packing: boolean;
  packingStatus?: '待包装' | '包装中' | '已完成';
  boxNo?: string;
  status: '待处理' | '处理中' | '已完成';
  remark?: string;
}

// 外协订单
export interface OutsourceOrder extends BaseEntity {
  orderNo: string;
  type: '印花' | '绣花' | '洗水' | '缝制' | '整烫';
  orderId?: string;
  orderNo_ref?: string;
  styleNo?: string;
  productName?: string;
  supplierId: string;
  supplierName: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  sendDate: string;
  expectedReturnDate: string;
  actualReturnDate?: string;
  receivedQuantity?: number;
  status: '待发货' | '已发货' | '已收货' | '已结算';
  payableId?: string;
  remark?: string;
}

// 应收款
export interface Receivable extends BaseEntity {
  receivableNo: string;
  orderId: string;
  orderNo: string;
  customerId: string;
  customerName: string;
  amount: number;
  receivedAmount: number;
  remainingAmount: number;
  dueDate: string;
  status: '未收款' | '部分收款' | '已收款' | '已逾期';
  receiptIds: string[];
  remark?: string;
}

// 应付款
export interface Payable extends BaseEntity {
  payableNo: string;
  type: '采购' | '外协' | '其他';
  sourceId?: string;
  sourceNo?: string;
  supplierId: string;
  supplierName: string;
  amount: number;
  paidAmount: number;
  remainingAmount: number;
  dueDate: string;
  status: '未付款' | '部分付款' | '已付款' | '已逾期';
  paymentIds: string[];
  remark?: string;
}

// 收款单
export interface Receipt extends BaseEntity {
  receiptNo: string;
  receivableId: string;
  receivableNo: string;
  orderId: string;
  orderNo: string;
  customerId: string;
  customerName: string;
  amount: number;
  paymentMethod: '现金' | '银行转账' | '支票' | '其他';
  bankAccount?: string;
  receiptDate: string;
  voucherNo?: string;
  status: '待审核' | '已审核';
  auditor?: string;
  auditedAt?: string;
  remark?: string;
}

// 付款单
export interface Payment extends BaseEntity {
  paymentNo: string;
  payableId: string;
  payableNo: string;
  supplierId: string;
  supplierName: string;
  amount: number;
  paymentMethod: '现金' | '银行转账' | '支票' | '其他';
  bankAccount?: string;
  paymentDate: string;
  voucherNo?: string;
  status: '待审核' | '已审核';
  auditor?: string;
  auditedAt?: string;
  remark?: string;
}

// 库存
export interface StockItem extends BaseEntity {
  materialCode: string;
  materialName: string;
  specification?: string;
  unit: string;
  warehouseId?: string;
  warehouseName?: string;
  quantity: number;
  lockedQuantity: number;
  availableQuantity: number;
  safetyStock: number;
  unitCost: number;
  totalCost: number;
  lastInDate?: string;
  lastOutDate?: string;
  status: '正常' | '预警' | '缺货';
}

// 入库单
export interface StockIn extends BaseEntity {
  inNo: string;
  type: '采购入库' | '生产入库' | '退货入库' | '其他';
  sourceId?: string;
  sourceNo?: string;
  supplierId?: string;
  supplierName?: string;
  warehouseId: string;
  warehouseName: string;
  totalQuantity: number;
  totalAmount: number;
  inDate: string;
  operatorId?: string;
  operatorName?: string;
  status: '待审核' | '已审核';
  items: StockInItem[];
  remark?: string;
}

export interface StockInItem {
  id: string;
  materialCode: string;
  materialName: string;
  specification?: string;
  unit: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  batchNo?: string;
  position?: string;
}

// 出库单
export interface StockOut extends BaseEntity {
  outNo: string;
  type: '生产领料' | '销售出库' | '退货出库' | '其他';
  sourceId?: string;
  sourceNo?: string;
  customerId?: string;
  customerName?: string;
  warehouseId: string;
  warehouseName: string;
  totalQuantity: number;
  totalAmount: number;
  outDate: string;
  operatorId?: string;
  operatorName?: string;
  status: '待审核' | '已审核';
  items: StockOutItem[];
  remark?: string;
}

export interface StockOutItem {
  id: string;
  materialCode: string;
  materialName: string;
  specification?: string;
  unit: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  batchNo?: string;
  position?: string;
}

// 系统日志
export interface SystemLog extends BaseEntity {
  logNo: string;
  module: string;
  action: '新增' | '修改' | '删除' | '审核' | '反审核' | '登录' | '登出' | '其他';
  entityType: string;
  entityId?: string;
  entityNo?: string;
  operatorId: string;
  operatorName: string;
  operationTime: string;
  beforeData?: string;
  afterData?: string;
  ip?: string;
  deviceInfo?: string;
  remark?: string;
}

// 打印模板
export interface PrintTemplate extends BaseEntity {
  code: string;
  name: string;
  type: '订单' | 'BOM' | '裁床' | '报工' | '外协' | '财务' | '库存' | '其他';
  paperSize: 'A4' | 'A5' | '热敏纸' | '自定义';
  width?: number;
  height?: number;
  content: string;
  isDefault: boolean;
  status: '启用' | '禁用';
}

// 生产排程
export interface Schedule extends BaseEntity {
  scheduleNo: string;
  orderId: string;
  orderNo: string;
  styleNo: string;
  productName: string;
  lineId?: string;
  lineName?: string;
  startDate: string;
  endDate: string;
  plannedQuantity: number;
  actualQuantity: number;
  progress: number;
  status: '未开始' | '进行中' | '已完成' | '已暂停';
  priority: number;
  remark?: string;
}

// 计件工资
export interface PieceWage extends BaseEntity {
  wageNo: string;
  employeeId: string;
  employeeName: string;
  teamId?: string;
  teamName?: string;
  period: string;
  totalQuantity: number;
  totalAmount: number;
  bonusAmount: number;
  deductionAmount: number;
  finalAmount: number;
  status: '待审核' | '已审核' | '已发放';
  details: PieceWageDetail[];
  remark?: string;
}

export interface PieceWageDetail {
  id: string;
  reportId: string;
  reportNo: string;
  reportDate: string;
  processCode: string;
  processName: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

// 预警规则
export interface AlertRule extends BaseEntity {
  code: string;
  name: string;
  type: '库存' | '订单' | '财务' | '生产' | '其他';
  condition: string;
  threshold: number;
  notifyType: '系统消息' | '邮件' | '短信';
  notifyTargets: string[];
  isActive: boolean;
  lastTriggered?: string;
}

// 系统设置
export interface SystemSettings {
  companyName: string;
  companyShortName: string;
  logo?: string;
  address?: string;
  phone?: string;
  email?: string;
  taxNo?: string;
  bank?: string;
  bankAccount?: string;
  defaultWarehouse?: string;
  defaultCurrency: string;
  dateFormat: string;
  numberFormat: string;
  autoBackup: boolean;
  backupInterval: number;
  theme: 'light' | 'dark';
  primaryColor: string;
  language: 'zh-CN' | 'en-US' | 'ja-JP';
}

// 钱包流水
export interface WalletFlow extends BaseEntity {
  flowNo: string;
  employeeId: string;
  employeeName: string;
  type: '工资解冻' | '预支到账' | '工资抵扣' | '工资提现' | '报销到账' | '报销提现';
  amount: number;
  balance: number;
  relatedId?: string;
  relatedType?: string;
  remark: string;
  evidenceImages?: string[];
  status: '成功' | '失败' | '处理中';
}

// 预支明细
export interface AdvanceLog extends BaseEntity {
  logNo: string;
  advanceId: string;
  advanceNo: string;
  employeeId: string;
  employeeName: string;
  amount: number;
  reason: string;
  status: '待审核' | '已通过' | '已驳回' | '已到账' | '部分抵扣' | '已结清';
  workshopAuditor?: string;
  financeAuditor?: string;
  paidAt?: string;
  deductionRecords: {
    id: string;
    amount: number;
    deductionDate: string;
    salaryId: string;
  }[];
}

// 报销完整记录
export interface Reimburse extends BaseEntity {
  reimburseNo: string;
  employeeId: string;
  employeeName: string;
  category: '出差车费' | '油费' | '路费' | '采购辅料' | '配件小额杂费' | '快递物流费' | '食堂食材杂费' | '办公耗材费' | '维修设备费' | '其他因公临时杂费';
  amount: number;
  useDate: string;
  description: string;
  attachments: string[];
  status: '待审核' | '主管审核中' | '财务审核中' | '老板审核中' | '已通过' | '已驳回' | '已到账';
  supervisorApproval?: {
    approverId: string;
    approverName: string;
    approved: boolean;
    comment: string;
    approvedAt: string;
  };
  financeApproval?: {
    approverId: string;
    approverName: string;
    approved: boolean;
    comment: string;
    approvedAt: string;
  };
  bossApproval?: {
    approverId: string;
    approverName: string;
    approved: boolean;
    comment: string;
    approvedAt: string;
  };
  rejectionReason?: string;
  paidAt?: string;
  paymentMethod?: '银行卡' | '微信' | '支付宝';
  accountInfo?: {
    accountName: string;
    accountNumber: string;
    bankName?: string;
  };
}

// 风控异常表
export interface RiskException extends BaseEntity {
  exceptionNo: string;
  employeeId?: string;
  employeeName?: string;
  type: '频繁换卡' | '异地登录' | '异常提现' | '超额预支' | '可疑操作';
  severity: '低' | '中' | '高' | '严重';
  description: string;
  evidence: string[];
  status: '待处理' | '处理中' | '已解决' | '已忽略';
  handler?: string;
  handledAt?: string;
  handlingNotes?: string;
  riskScore: number;
  freezeAccount: boolean;
  freezeUntil?: string;
}

// 序列号
export interface Sequence {
  prefix: string;
  currentValue: number;
  updatedAt: string;
}

// 导出所有表名
export type TableName = typeof TABLES[keyof typeof TABLES];

// 导出所有实体类型
export type EntityType = 
  | Customer
  | Supplier
  | Employee
  | Team
  | User
  | Order
  | BOM
  | Process
  | ProcessRoute
  | CuttingTask
  | WorkReport
  | TailTask
  | OutsourceOrder
  | Receivable
  | Payable
  | Receipt
  | Payment
  | StockItem
  | StockIn
  | StockOut
  | SystemLog
  | PrintTemplate
  | Schedule
  | PieceWage
  | AlertRule
  | SystemSettings
  | Sequence
  | WalletFlow
  | AdvanceLog
  | Reimburse
  | RiskException;
