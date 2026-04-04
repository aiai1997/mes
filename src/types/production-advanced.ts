// 生产领料单类型定义

export type MaterialRequisitionStatus = '待审核' | '已审核' | '已发料' | '已关闭';
export type MaterialType = '面料' | '辅料' | '包装' | '耗材';
export type Priority = '普通' | '紧急' | '特急';

export interface MaterialRequisitionItem {
  id: string;
  materialCode: string;
  materialName: string;
  materialType: MaterialType;
  unit: string;
  bomQuantity: number; // 应发数量（BOM标准）
  requestedQuantity: number; // 申请数量
  issuedQuantity: number; // 实发数量
  difference: number; // 差额
  unitPrice: number;
  amount: number;
  batchNo?: string;
  warehouse: string;
  location?: string;
  remark: string;
}

export interface MaterialRequisition {
  id: string;
  requisitionNo: string; // OUTYYYYMMDDXXX
  orderId: string;
  orderNo: string;
  bomId: string;
  bomNo: string;
  styleNo: string;
  productName: string;
  productionNoticeNo?: string;
  
  items: MaterialRequisitionItem[];
  totalBomQuantity: number;
  totalRequestedQuantity: number;
  totalIssuedQuantity: number;
  totalAmount: number;
  
  priority: Priority;
  status: MaterialRequisitionStatus;
  
  // 人员
  applicant: string; // 领料人
  issuer?: string; // 发料人
  warehouseKeeper?: string; // 仓库管理员
  
  // 超领信息
  isOverIssue: boolean;
  overIssueRate: number;
  overIssueReason?: string;
  overIssueApprovedBy?: string;
  
  remark: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  auditedAt?: string;
  issuedAt?: string;
}

// 退料单
export type ReturnStatus = '待审核' | '已审核' | '已入库';
export type QualityType = '完好' | '次品';

export interface MaterialReturnItem {
  id: string;
  materialCode: string;
  materialName: string;
  unit: string;
  returnQuantity: number;
  quality: QualityType;
  batchNo?: string;
  remark: string;
}

export interface MaterialReturn {
  id: string;
  returnNo: string; // BACKYYYYMMDDXXX
  orderId: string;
  orderNo: string;
  bundleNo?: string;
  
  items: MaterialReturnItem[];
  totalQuantity: number;
  
  status: ReturnStatus;
  returner: string; // 退料人
  receiver?: string; // 接收人
  
  remark: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// 批次管理
export interface MaterialBatch {
  id: string;
  batchNo: string; // BAT + 年月日 + 流水
  materialCode: string;
  materialName: string;
  materialType: MaterialType;
  
  supplierId: string;
  supplierName: string;
  vatNo?: string; // 缸号
  vatDifference?: string; // 缸差
  colorNo?: string; // 色号
  arrivalDate: string;
  
  quantity: number;
  usedQuantity: number;
  remainingQuantity: number;
  
  location: string;
  status: '可用' | '已用完' | '冻结';
  
  remark: string;
  createdAt: string;
  updatedAt: string;
}

// 预订单
export type PreOrderStatus = '意向' | '已确认' | '已转正式';

export interface PreOrder {
  id: string;
  preOrderNo: string; // PREORDXXX
  customerId: string;
  customerName: string;
  styleNo: string;
  productName: string;
  
  intentionQuantity: number;
  intentionDeliveryDate: string;
  
  status: PreOrderStatus;
  convertedOrderId?: string;
  convertedOrderNo?: string;
  
  remark: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// 员工绩效
export interface EmployeePerformance {
  id: string;
  employeeId: string;
  employeeNo: string;
  employeeName: string;
  teamName: string;
  month: string; // YYYY-MM
  
  // 效率
  efficiencyScore: number;
  completedQuantity: number;
  standardQuantity: number;
  efficiencyRate: number;
  
  // 质量
  qualityScore: number;
  passQuantity: number;
  failQuantity: number;
  reworkQuantity: number;
  reworkRate: number;
  scrapQuantity: number;
  scrapRate: number;
  
  // 考勤
  attendanceScore: number;
  attendanceDays: number;
  lateDays: number;
  absentDays: number;
  
  // 总分
  totalScore: number;
  rank?: number;
  
  bonus: number;
  remark: string;
  createdAt: string;
}

// 成本异常预警
export type CostAlertLevel = '正常' | '黄色预警' | '红色预警';

export interface CostAlert {
  id: string;
  orderId: string;
  orderNo: string;
  styleNo: string;
  
  standardCost: number;
  actualCost: number;
  costDifference: number;
  costDifferenceRate: number;
  
  alertLevel: CostAlertLevel;
  
  // 异常原因
  materialOverCost: number;
  laborOverCost: number;
  outsourceOverCost: number;
  reworkCost: number;
  
  status: '待处理' | '已确认' | '已解决';
  handledBy?: string;
  handledAt?: string;
  handleRemark?: string;
  
  createdAt: string;
}

// 样品仓管理
export type SampleType = '布办' | '色卡' | '样衣' | '产前版';
export type SampleStatus = '在库' | '借出' | '归还' | '报废';

export interface SampleInventory {
  id: string;
  sampleNo: string;
  sampleType: SampleType;
  sampleName: string;
  orderId?: string;
  orderNo?: string;
  customerId: string;
  customerName: string;
  
  location: string;
  status: SampleStatus;
  
  borrowRecords: SampleBorrowRecord[];
  
  remark: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface SampleBorrowRecord {
  id: string;
  borrowTime: string;
  borrower: string;
  returnTime?: string;
  status: '借出' | '已归还';
}

// 产前会议
export type PreProductionStatus = '待召开' | '已完成' | '有问题';

export interface PreProductionMeeting {
  id: string;
  meetingNo: string; // PREPRODXXX
  orderId: string;
  orderNo: string;
  styleNo: string;
  productName: string;
  
  // 确认项
  fabricConfirmed: boolean;
  accessoryConfirmed: boolean;
  processConfirmed: boolean;
  sizeConfirmed: boolean;
  
  meetingDate: string;
  meetingContent: string;
  issues: string;
  solutions: string;
  
  responsiblePerson: string;
  completionStatus: '未完成' | '进行中' | '已完成';
  
  status: PreProductionStatus;
  
  remark: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// 停工待料
export type StopReason = '缺料' | '坏机' | '品质问题' | '其他';

export interface ProductionStop {
  id: string;
  stopNo: string; // STOPXXX
  orderId: string;
  orderNo: string;
  processName: string;
  
  stopStartTime: string;
  stopEndTime?: string;
  stopDuration: number; // 分钟
  
  reason: StopReason;
  reasonDetail: string;
  responsiblePerson: string;
  affectedQuantity: number;
  handleResult: string;
  
  status: '停工中' | '已恢复';
  
  remark: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// 系统消息
export type MessageType = '审核通知' | '发料通知' | '预警通知' | '超期通知' | '系统通知';

export interface SystemMessage {
  id: string;
  type: MessageType;
  title: string;
  content: string;
  
  targetRole: string; // admin / warehouse / finance / workshop
  targetUser?: string;
  
  relatedId?: string;
  relatedType?: string;
  
  isRead: boolean;
  readAt?: string;
  
  createdAt: string;
}

// 预警
export type AlertType = 
  | '交期预警' 
  | '库存预警' 
  | '超领预警' 
  | '超成本预警' 
  | '待审核预警'
  | '外协超期预警'
  | '停工待料预警'
  | '返工过多预警';

export type AlertLevel = '低' | '中' | '高' | '紧急';

export interface SystemAlert {
  id: string;
  alertType: AlertType;
  alertLevel: AlertLevel;
  title: string;
  content: string;
  
  relatedId: string;
  relatedType: string;
  
  status: '待处理' | '已处理' | '已忽略';
  handledBy?: string;
  handledAt?: string;
  handleRemark?: string;
  
  createdAt: string;
}

// 物流费用
export interface LogisticsFee {
  id: string;
  logisticsNo: string;
  orderId: string;
  orderNo: string;
  
  carrier: string;
  weight: number;
  fee: number;
  paymentMethod: '包邮' | '到付' | '月结';
  
  remark: string;
  createdBy: string;
  createdAt: string;
}

// 内部转移
export interface InternalTransfer {
  id: string;
  transferNo: string;
  fromDepartment: string;
  toDepartment: string;
  
  orderId?: string;
  orderNo?: string;
  
  items: {
    id: string;
    materialCode: string;
    materialName: string;
    quantity: number;
    unit: string;
  }[];
  
  handler: string;
  receiver?: string;
  
  status: '待交接' | '已交接';
  
  remark: string;
  createdAt: string;
}

// 订单预算
export interface OrderBudget {
  id: string;
  orderId: string;
  orderNo: string;
  
  fabricBudget: number;
  accessoryBudget: number;
  laborBudget: number;
  outsourceBudget: number;
  otherBudget: number;
  
  totalBudget: number;
  unitBudget: number;
  suggestedPrice: number;
  grossMargin: number;
  
  remark: string;
  createdBy: string;
  createdAt: string;
}

// 面料测试报告
export type TestResult = '合格' | '不合格' | '待测试';
export type TestType = '缩水率' | '色牢度' | '克重' | '撕裂强度';

export interface FabricTestReport {
  id: string;
  reportNo: string;
  orderId?: string;
  orderNo?: string;
  supplierId: string;
  supplierName: string;
  materialCode: string;
  materialName: string;
  
  testType: TestType;
  testResult: TestResult;
  testValue?: string;
  
  attachmentUrl?: string;
  
  tester: string;
  testDate: string;
  
  remark: string;
  createdAt: string;
}

// 售后退货
export type AfterSalesReturnType = '返工' | '补货' | '扣款';
export type AfterSalesReturnStatus = '待处理' | '处理中' | '已完成';

export interface AfterSalesReturn {
  id: string;
  returnNo: string;
  orderId: string;
  orderNo: string;
  customerId: string;
  customerName: string;
  
  returnQuantity: number;
  reason: string;
  handleType: AfterSalesReturnType;
  
  returnCost: number;
  
  status: AfterSalesReturnStatus;
  
  remark: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// ============ 数据存储函数 ============

const KEYS = {
  REQUISITION: 'erp_material_requisitions',
  RETURN: 'erp_material_returns',
  BATCH: 'erp_material_batches',
  PREORDER: 'erp_pre_orders',
  PERFORMANCE: 'erp_employee_performances',
  COST_ALERT: 'erp_cost_alerts',
  SAMPLE: 'erp_sample_inventory',
  PRE_MEETING: 'erp_pre_production_meetings',
  STOP: 'erp_production_stops',
  MESSAGE: 'erp_system_messages',
  ALERT: 'erp_system_alerts',
  LOGISTICS: 'erp_logistics_fees',
  TRANSFER: 'erp_internal_transfers',
  BUDGET: 'erp_order_budgets',
  FABRIC_TEST: 'erp_fabric_test_reports',
  AFTER_SALES: 'erp_after_sales_returns',
};

// 通用CRUD函数
function getList<T>(key: string): T[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : [];
}

function saveList<T>(key: string, list: T[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(list));
}

function generateNo(prefix: string, date?: Date): string {
  const d = date || new Date();
  const dateStr = d.toISOString().slice(0, 10).replace(/-/g, '');
  return `${prefix}${dateStr}`;
}

// 领料单
export function getMaterialRequisitions(): MaterialRequisition[] {
  return getList<MaterialRequisition>(KEYS.REQUISITION);
}

export function saveMaterialRequisition(req: MaterialRequisition): void {
  const list = getMaterialRequisitions();
  const index = list.findIndex(r => r.id === req.id);
  if (index >= 0) {
    list[index] = req;
  } else {
    list.push(req);
  }
  saveList(KEYS.REQUISITION, list);
}

export function generateRequisitionNo(): string {
  const list = getMaterialRequisitions();
  const d = new Date();
  const dateStr = d.toISOString().slice(0, 10).replace(/-/g, '');
  const todayList = list.filter(r => r.requisitionNo.includes(dateStr));
  return `OUT${dateStr}${(todayList.length + 1).toString().padStart(3, '0')}`;
}

// 退料单
export function getMaterialReturns(): MaterialReturn[] {
  return getList<MaterialReturn>(KEYS.RETURN);
}

export function saveMaterialReturn(ret: MaterialReturn): void {
  const list = getMaterialReturns();
  const index = list.findIndex(r => r.id === ret.id);
  if (index >= 0) {
    list[index] = ret;
  } else {
    list.push(ret);
  }
  saveList(KEYS.RETURN, list);
}

export function generateReturnNo(): string {
  const list = getMaterialReturns();
  const d = new Date();
  const dateStr = d.toISOString().slice(0, 10).replace(/-/g, '');
  const todayList = list.filter(r => r.returnNo.includes(dateStr));
  return `BACK${dateStr}${(todayList.length + 1).toString().padStart(3, '0')}`;
}

// 批次
export function getMaterialBatches(): MaterialBatch[] {
  return getList<MaterialBatch>(KEYS.BATCH);
}

export function saveMaterialBatch(batch: MaterialBatch): void {
  const list = getMaterialBatches();
  const index = list.findIndex(b => b.id === batch.id);
  if (index >= 0) {
    list[index] = batch;
  } else {
    list.push(batch);
  }
  saveList(KEYS.BATCH, list);
}

export function generateBatchNo(): string {
  const list = getMaterialBatches();
  const d = new Date();
  const dateStr = d.toISOString().slice(0, 10).replace(/-/g, '');
  const todayList = list.filter(b => b.batchNo.includes(dateStr));
  return `BAT${dateStr}${(todayList.length + 1).toString().padStart(3, '0')}`;
}

// 预订单
export function getPreOrders(): PreOrder[] {
  return getList<PreOrder>(KEYS.PREORDER);
}

export function savePreOrder(order: PreOrder): void {
  const list = getPreOrders();
  const index = list.findIndex(o => o.id === order.id);
  if (index >= 0) {
    list[index] = order;
  } else {
    list.push(order);
  }
  saveList(KEYS.PREORDER, list);
}

export function generatePreOrderNo(): string {
  const list = getPreOrders();
  return `PREORD${(list.length + 1).toString().padStart(3, '0')}`;
}

// 员工绩效
export function getEmployeePerformances(): EmployeePerformance[] {
  return getList<EmployeePerformance>(KEYS.PERFORMANCE);
}

export function saveEmployeePerformance(perf: EmployeePerformance): void {
  const list = getEmployeePerformances();
  const index = list.findIndex(p => p.id === perf.id);
  if (index >= 0) {
    list[index] = perf;
  } else {
    list.push(perf);
  }
  saveList(KEYS.PERFORMANCE, list);
}

// 成本预警
export function getCostAlerts(): CostAlert[] {
  return getList<CostAlert>(KEYS.COST_ALERT);
}

export function saveCostAlert(alert: CostAlert): void {
  const list = getCostAlerts();
  const index = list.findIndex(a => a.id === alert.id);
  if (index >= 0) {
    list[index] = alert;
  } else {
    list.push(alert);
  }
  saveList(KEYS.COST_ALERT, list);
}

// 样品仓
export function getSampleInventory(): SampleInventory[] {
  return getList<SampleInventory>(KEYS.SAMPLE);
}

export function saveSampleInventory(sample: SampleInventory): void {
  const list = getSampleInventory();
  const index = list.findIndex(s => s.id === sample.id);
  if (index >= 0) {
    list[index] = sample;
  } else {
    list.push(sample);
  }
  saveList(KEYS.SAMPLE, list);
}

// 产前会议
export function getPreProductionMeetings(): PreProductionMeeting[] {
  return getList<PreProductionMeeting>(KEYS.PRE_MEETING);
}

export function savePreProductionMeeting(meeting: PreProductionMeeting): void {
  const list = getPreProductionMeetings();
  const index = list.findIndex(m => m.id === meeting.id);
  if (index >= 0) {
    list[index] = meeting;
  } else {
    list.push(meeting);
  }
  saveList(KEYS.PRE_MEETING, list);
}

export function generatePreProductionNo(): string {
  const list = getPreProductionMeetings();
  return `PREPROD${(list.length + 1).toString().padStart(3, '0')}`;
}

// 停工待料
export function getProductionStops(): ProductionStop[] {
  return getList<ProductionStop>(KEYS.STOP);
}

export function saveProductionStop(stop: ProductionStop): void {
  const list = getProductionStops();
  const index = list.findIndex(s => s.id === stop.id);
  if (index >= 0) {
    list[index] = stop;
  } else {
    list.push(stop);
  }
  saveList(KEYS.STOP, list);
}

export function generateStopNo(): string {
  const list = getProductionStops();
  return `STOP${(list.length + 1).toString().padStart(3, '0')}`;
}

// 系统消息
export function getSystemMessages(): SystemMessage[] {
  return getList<SystemMessage>(KEYS.MESSAGE);
}

export function saveSystemMessage(msg: SystemMessage): void {
  const list = getSystemMessages();
  list.push(msg);
  saveList(KEYS.MESSAGE, list);
}

export function markMessageAsRead(id: string): void {
  const list = getSystemMessages();
  const msg = list.find(m => m.id === id);
  if (msg) {
    msg.isRead = true;
    msg.readAt = new Date().toLocaleString('zh-CN');
    saveList(KEYS.MESSAGE, list);
  }
}

// 系统预警
export function getSystemAlerts(): SystemAlert[] {
  return getList<SystemAlert>(KEYS.ALERT);
}

export function saveSystemAlert(alert: SystemAlert): void {
  const list = getSystemAlerts();
  const index = list.findIndex(a => a.id === alert.id);
  if (index >= 0) {
    list[index] = alert;
  } else {
    list.push(alert);
  }
  saveList(KEYS.ALERT, list);
}

// 物流费用
export function getLogisticsFees(): LogisticsFee[] {
  return getList<LogisticsFee>(KEYS.LOGISTICS);
}

export function saveLogisticsFee(fee: LogisticsFee): void {
  const list = getLogisticsFees();
  const index = list.findIndex(f => f.id === fee.id);
  if (index >= 0) {
    list[index] = fee;
  } else {
    list.push(fee);
  }
  saveList(KEYS.LOGISTICS, list);
}

// 内部转移
export function getInternalTransfers(): InternalTransfer[] {
  return getList<InternalTransfer>(KEYS.TRANSFER);
}

export function saveInternalTransfer(transfer: InternalTransfer): void {
  const list = getInternalTransfers();
  const index = list.findIndex(t => t.id === transfer.id);
  if (index >= 0) {
    list[index] = transfer;
  } else {
    list.push(transfer);
  }
  saveList(KEYS.TRANSFER, list);
}

// 订单预算
export function getOrderBudgets(): OrderBudget[] {
  return getList<OrderBudget>(KEYS.BUDGET);
}

export function saveOrderBudget(budget: OrderBudget): void {
  const list = getOrderBudgets();
  const index = list.findIndex(b => b.id === budget.id);
  if (index >= 0) {
    list[index] = budget;
  } else {
    list.push(budget);
  }
  saveList(KEYS.BUDGET, list);
}

// 面料测试
export function getFabricTestReports(): FabricTestReport[] {
  return getList<FabricTestReport>(KEYS.FABRIC_TEST);
}

export function saveFabricTestReport(report: FabricTestReport): void {
  const list = getFabricTestReports();
  const index = list.findIndex(r => r.id === report.id);
  if (index >= 0) {
    list[index] = report;
  } else {
    list.push(report);
  }
  saveList(KEYS.FABRIC_TEST, list);
}

// 售后退货
export function getAfterSalesReturns(): AfterSalesReturn[] {
  return getList<AfterSalesReturn>(KEYS.AFTER_SALES);
}

export function saveAfterSalesReturn(ret: AfterSalesReturn): void {
  const list = getAfterSalesReturns();
  const index = list.findIndex(r => r.id === ret.id);
  if (index >= 0) {
    list[index] = ret;
  } else {
    list.push(ret);
  }
  saveList(KEYS.AFTER_SALES, list);
}
