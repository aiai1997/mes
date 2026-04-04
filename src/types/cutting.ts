// 裁床状态流转：待裁 → 拉布中 → 已裁 → 已移交
// 扎号生成：裁床完成后自动生成扎号，用于全流程追溯

export type CuttingStatus = '待裁' | '拉布中' | '已裁' | '已移交' | '已取消';

export type CuttingBedStatus = '待拉布' | '拉布中' | '已裁' | '已移交';

export interface CuttingSizeRatio {
  sizeName: string;
  ratio: number;
  layers: number;
  pieces: number;  // 该尺码件数 = ratio × layers
}

export interface CuttingBed {
  id: string;
  bedNo: string;          // 床次号
  bedSeq: number;         // 床次序号
  colorName: string;
  fabricName: string;
  fabricQuantity: number; // 面料用量（米），保留4位小数
  fabricWidth?: number;   // 面料门幅（CM）
  sizeRatios: CuttingSizeRatio[];
  totalLayers: number;    // 总层数
  totalPieces: number;    // 总件数
  cuttedPieces: number;   // 已裁件数
  status: CuttingBedStatus;
  startedAt?: string;     // 开始拉布时间
  completedAt?: string;   // 裁剪完成时间
  transferredAt?: string; // 移交时间
  operator?: string;      // 裁床工
  remark?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ZaHaoRecord {
  id: string;
  zaNo: string;           // 扎号
  bedNo: string;          // 床次号
  layerStart: number;     // 起始层
  layerEnd: number;       // 结束层
  colorName: string;
  sizeName: string;
  quantity: number;       // 件数
  status: '已生成' | '已移交' | '缝制中' | '已转入尾部' | '已入库';
  bundleNo?: string;      // 关联的扎号编号（BN开头）
  createdAt: string;
}

export interface CuttingPlan {
  id: string;
  orderNo: string;
  styleNo: string;
  productName: string;
  totalQuantity: number;
  status: CuttingStatus;
  createdAt: string;
}

export interface CuttingTask {
  id: string;
  taskNo: string;         // 裁床任务号
  orderNo: string;        // 订单号
  bomNo: string;          // BOM单号
  styleNo: string;        // 款号
  productName: string;    // 品名
  plan: CuttingPlan;
  beds: CuttingBed[];
  zaHaoRecords: ZaHaoRecord[];  // 扎号记录
  totalPieces: number;    // 总件数
  cuttedPieces: number;   // 已裁件数
  transferredPieces: number; // 已移交件数
  status: CuttingStatus;
  startedAt?: string;     // 开始时间
  completedAt?: string;   // 完成时间
  transferredAt?: string; // 移交时间
  remark: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = 'erp_cutting_tasks';

let cuttingTasks: CuttingTask[] = [];

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
 * 初始化裁床数据
 */
export function initCuttingData(): void {
  if (typeof window === 'undefined') return;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    cuttingTasks = JSON.parse(stored);
  } else {
    // 示例数据
    const now = getNowStr();
    cuttingTasks = [
      {
        id: '1',
        taskNo: 'CUT20260331001',
        orderNo: 'ORD20260331001',
        bomNo: 'BOM20260331001',
        styleNo: 'ST001',
        productName: '男士T恤',
        plan: {
          id: '1',
          orderNo: 'ORD20260331001',
          styleNo: 'ST001',
          productName: '男士T恤',
          totalQuantity: 500,
          status: '待裁',
          createdAt: now,
        },
        beds: [
          {
            id: '1',
            bedNo: 'BED20260331001',
            bedSeq: 1,
            colorName: '黑色',
            fabricName: '纯棉面料',
            fabricQuantity: 120.0000,
            sizeRatios: [
              { sizeName: 'S', ratio: 2, layers: 50, pieces: 100 },
              { sizeName: 'M', ratio: 3, layers: 50, pieces: 150 },
              { sizeName: 'L', ratio: 3, layers: 50, pieces: 150 },
              { sizeName: 'XL', ratio: 2, layers: 50, pieces: 100 },
            ],
            totalLayers: 50,
            totalPieces: 500,
            cuttedPieces: 0,
            status: '待拉布',
            createdAt: now,
            updatedAt: now,
          },
        ],
        zaHaoRecords: [],
        totalPieces: 500,
        cuttedPieces: 0,
        transferredPieces: 0,
        status: '待裁',
        remark: '',
        createdBy: 'admin',
        createdAt: now,
        updatedAt: now,
      },
    ];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cuttingTasks));
  }
}

/**
 * 获取所有裁床任务
 */
export function getCuttingTasks(): CuttingTask[] {
  return [...cuttingTasks].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/**
 * 根据ID获取裁床任务
 */
export function getCuttingTaskById(id: string): CuttingTask | undefined {
  return cuttingTasks.find(t => t.id === id);
}

/**
 * 保存裁床任务
 */
export function saveCuttingTask(task: CuttingTask): void {
  task.updatedAt = getNowStr();
  const index = cuttingTasks.findIndex(t => t.id === task.id);
  if (index >= 0) {
    cuttingTasks[index] = task;
  } else {
    cuttingTasks.push(task);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cuttingTasks));
}

/**
 * 删除裁床任务（仅待裁状态可删除）
 */
export function deleteCuttingTask(id: string): boolean {
  const task = cuttingTasks.find(t => t.id === id);
  if (!task || task.status !== '待裁') return false;
  cuttingTasks = cuttingTasks.filter(t => t.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cuttingTasks));
  return true;
}

/**
 * 生成裁床任务号
 */
export function generateTaskNo(): string {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const todayTasks = cuttingTasks.filter(t => t.taskNo.includes(dateStr));
  const seq = (todayTasks.length + 1).toString().padStart(3, '0');
  return `CUT${dateStr}${seq}`;
}

/**
 * 生成床次号
 */
export function generateBedNo(): string {
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const count = cuttingTasks.reduce((sum, t) => sum + (t.beds?.length || 0), 0);
  return `BED${today}${(count + 1).toString().padStart(3, '0')}`;
}

/**
 * 生成扎号
 * 格式：ZY + YYYYMMDD + XXX
 */
export function generateZaNo(): string {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const zaCount = cuttingTasks.reduce((sum, t) => sum + (t.zaHaoRecords?.length || 0), 0);
  const seq = (zaCount + 1).toString().padStart(3, '0');
  return `ZY${dateStr}${seq}`;
}

/**
 * 生成扎号编号（BN开头）
 */
export function generateBundleNo(): string {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const count = cuttingTasks.reduce((sum, t) => sum + (t.zaHaoRecords?.length || 0), 0);
  const seq = (count + 1).toString().padStart(3, '0');
  return `BN${dateStr}${seq}`;
}

/**
 * 开始拉布
 * 状态流转：待裁 → 拉布中
 */
export function startSpreading(taskId: string, bedId: string, operator: string): boolean {
  const task = cuttingTasks.find(t => t.id === taskId);
  if (!task || task.status !== '待裁') return false;
  
  const bed = task.beds?.find(b => b.id === bedId);
  if (!bed || bed.status !== '待拉布') return false;
  
  const now = getNowStr();
  
  // 更新床次状态
  bed.status = '拉布中';
  bed.startedAt = now;
  bed.operator = operator;
  bed.updatedAt = now;
  
  // 更新任务状态
  task.status = '拉布中';
  task.startedAt = now;
  
  saveCuttingTask(task);
  return true;
}

/**
 * 完成裁剪并生成扎号
 * 状态流转：拉布中 → 已裁
 */
export function completeCutting(taskId: string, bedId: string): boolean {
  const task = cuttingTasks.find(t => t.id === taskId);
  if (!task || task.status !== '拉布中') return false;
  
  const bed = task.beds?.find(b => b.id === bedId);
  if (!bed || bed.status !== '拉布中') return false;
  
  const now = getNowStr();
  
  // 更新床次状态
  bed.status = '已裁';
  bed.completedAt = now;
  bed.cuttedPieces = bed.totalPieces;
  bed.updatedAt = now;
  
  // 更新任务裁剪数量
  task.cuttedPieces = task.beds?.reduce((sum, b) => sum + b.cuttedPieces, 0) || 0;
  
  // 检查是否所有床次都已完成裁剪
  const allCutted = task.beds?.every(b => b.status === '已裁' || b.status === '已移交') ?? true;
  if (allCutted) {
    task.status = '已裁';
    task.completedAt = now;
    
    // 自动生成扎号
    generateZaHaoRecords(task);
  }
  
  saveCuttingTask(task);
  return true;
}

/**
 * 移交车间
 * 状态流转：已裁 → 已移交
 * 同时将扎号同步到车间报工系统
 */
export function transferToWorkshop(taskId: string): boolean {
  const task = cuttingTasks.find(t => t.id === taskId);
  if (!task || task.status !== '已裁') return false;
  
  const now = getNowStr();
  
  // 更新所有床次状态
  task.beds?.forEach(bed => {
    if (bed.status === '已裁') {
      bed.status = '已移交';
      bed.transferredAt = now;
      bed.updatedAt = now;
    }
  });
  
  // 更新任务状态
  task.status = '已移交';
  task.transferredAt = now;
  task.transferredPieces = task.cuttedPieces;
  
  // 更新所有扎号状态
  task.zaHaoRecords?.forEach(za => {
    za.status = '已移交';
  });
  
  saveCuttingTask(task);
  
  // 同步扎号到车间报工系统
  syncBundlesToWorkshop(task);
  
  return true;
}

/**
 * 将扎号同步到车间报工系统
 */
function syncBundlesToWorkshop(task: CuttingTask): void {
  if (typeof window === 'undefined') return;
  
  const BUNDLES_KEY = 'erp_bundles';
  const stored = localStorage.getItem(BUNDLES_KEY);
  let bundles: any[] = stored ? JSON.parse(stored) : [];
  const syncTime = getNowStr();
  
  // 获取第一道工序
  const processes = getStandardProcesses();
  const firstProcess = processes.length > 0 ? processes[0].processName : '合肩';
  
  // 将每个扎号转换为车间报工的bundle格式
  task.zaHaoRecords.forEach(za => {
    // 检查是否已存在
    const exists = bundles.some(b => b.bundleNo === za.bundleNo);
    if (!exists && za.bundleNo) {
      bundles.push({
        id: za.id,
        bundleNo: za.bundleNo,
        orderNo: task.orderNo,
        bomNo: task.bomNo,
        styleNo: task.styleNo,
        productName: task.productName,
        colorName: za.colorName,
        sizeName: za.sizeName,
        totalQuantity: za.quantity,
        cuttedQuantity: za.quantity,
        currentProcess: firstProcess,
        completedProcesses: [],
        status: '待缝制',
        bedNo: za.bedNo,
        createdAt: syncTime,
        updatedAt: syncTime,
      });
    }
  });
  
  localStorage.setItem(BUNDLES_KEY, JSON.stringify(bundles));
}

/**
 * 获取标准工序（从localStorage读取）
 */
function getStandardProcesses(): { processName: string; processOrder: number }[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem('erp_standard_processes');
  if (stored) {
    const processes = JSON.parse(stored);
    return processes.sort((a: any, b: any) => a.processOrder - b.processOrder);
  }
  return [];
}

/**
 * 生成扎号记录
 * 按床次、颜色、尺码、每10层生成一个扎号
 */
function generateZaHaoRecords(task: CuttingTask): void {
  if (!task.zaHaoRecords) task.zaHaoRecords = [];
  if (!task.beds) task.beds = [];
  
  const now = getNowStr();
  
  task.beds.forEach(bed => {
    bed.sizeRatios?.forEach(sizeRatio => {
      // 按每10层生成一个扎号
      const layersPerBundle = 10;
      const bundleCount = Math.ceil(bed.totalLayers / layersPerBundle);
      
      for (let i = 0; i < bundleCount; i++) {
        const layerStart = i * layersPerBundle + 1;
        const layerEnd = Math.min((i + 1) * layersPerBundle, bed.totalLayers);
        const actualLayers = layerEnd - layerStart + 1;
        const quantity = sizeRatio.ratio * actualLayers;
        
        const zaRecord: ZaHaoRecord = {
          id: `${task.id}-${bed.id}-${sizeRatio.sizeName}-${i + 1}`,
          zaNo: generateZaNo(),
          bedNo: bed.bedNo,
          layerStart,
          layerEnd,
          colorName: bed.colorName,
          sizeName: sizeRatio.sizeName,
          quantity,
          status: '已生成',
          bundleNo: generateBundleNo(),
          createdAt: now,
        };
        
        task.zaHaoRecords.push(zaRecord);
      }
    });
  });
}

/**
 * 获取扎号记录
 */
export function getZaHaoRecords(taskId: string): ZaHaoRecord[] {
  const task = cuttingTasks.find(t => t.id === taskId);
  return task?.zaHaoRecords || [];
}

/**
 * 批量获取所有扎号
 */
export function getAllZaHaoRecords(): ZaHaoRecord[] {
  return cuttingTasks.flatMap(t => t.zaHaoRecords || []);
}

/**
 * 获取裁床统计
 */
export function getCuttingStats(): {
  total: number;
  pending: number;
  spreading: number;
  cutted: number;
  transferred: number;
} {
  return {
    total: cuttingTasks.length,
    pending: cuttingTasks.filter(t => t.status === '待裁').length,
    spreading: cuttingTasks.filter(t => t.status === '拉布中').length,
    cutted: cuttingTasks.filter(t => t.status === '已裁').length,
    transferred: cuttingTasks.filter(t => t.status === '已移交').length,
  };
}
