export type TailTaskStatus = '待尾部' | '整烫中' | '查衫中' | '包装中' | '已完成' | '已入库';
export type TailReworkReason = '烫痕' | '脏污' | '破洞' | '线头' | '印绣花不良' | '其他';

export interface TailProcess {
  id: string;
  processCode: string;
  processName: string;
  standardPrice: number;
  processOrder: number;
  isActive: boolean;
}

export interface TailTask {
  id: string;
  taskNo: string;
  bundleNo: string;
  orderNo: string;
  bomNo: string;
  styleNo: string;
  productName: string;
  colorName: string;
  sizeName: string;
  bundleQuantity: number;
  goodQuantity: number;
  reworkQuantity: number;
  currentProcess: string;
  completedProcesses: string[];
  status: TailTaskStatus;
  pieceWage: number;
  operator: string;
  remark: string;
  createdAt: string;
  updatedAt: string;
}

export interface SizeQuantity {
  sizeName: string;
  quantity: number;
}

export interface PackingBox {
  id: string;
  boxNo: string;
  orderNo: string;
  styleNo: string;
  productName: string;
  colorName: string;
  sizeRatio: string;
  sizes: SizeQuantity[];
  totalQuantity: number;
  cartonSize: string;
  cartonMaterial: string;
  grossWeight: number;
  netWeight: number;
  customerPO: string;
  destination: string;
  status: '装箱中' | '已封箱' | '已入库';
  bundleNos: string[];
  createdBy: string;
  createdAt: string;
}

const TAIL_TASKS_KEY = 'erp_tail_tasks';
const TAIL_PROCESSES_KEY = 'erp_tail_processes';
const PACKING_BOXES_KEY = 'erp_packing_boxes';

let tailTasks: TailTask[] = [];
let tailProcesses: TailProcess[] = [];
let packingBoxes: PackingBox[] = [];

export function initTailData(): void {
  if (typeof window === 'undefined') return;
  
  // 初始化尾部工序
  const storedProcesses = localStorage.getItem(TAIL_PROCESSES_KEY);
  if (storedProcesses) {
    tailProcesses = JSON.parse(storedProcesses);
  } else {
    tailProcesses = [
      { id: '1', processCode: 'T001', processName: '整烫精整', standardPrice: 0.8, processOrder: 1, isActive: true },
      { id: '2', processCode: 'T002', processName: '查衫质检', standardPrice: 0.5, processOrder: 2, isActive: true },
      { id: '3', processCode: 'T003', processName: '剪线', standardPrice: 0.3, processOrder: 3, isActive: true },
      { id: '4', processCode: 'T004', processName: '备用扣', standardPrice: 0.2, processOrder: 4, isActive: true },
      { id: '5', processCode: 'T005', processName: '挂吊牌', standardPrice: 0.3, processOrder: 5, isActive: true },
      { id: '6', processCode: 'T006', processName: '折叠', standardPrice: 0.3, processOrder: 6, isActive: true },
      { id: '7', processCode: 'T007', processName: '入PE袋', standardPrice: 0.2, processOrder: 7, isActive: true },
      { id: '8', processCode: 'T008', processName: '复检', standardPrice: 0.4, processOrder: 8, isActive: true },
      { id: '9', processCode: 'T009', processName: '装箱', standardPrice: 0.3, processOrder: 9, isActive: true },
    ];
    localStorage.setItem(TAIL_PROCESSES_KEY, JSON.stringify(tailProcesses));
  }

  // 初始化尾部任务（从缝制转入）
  const storedTasks = localStorage.getItem(TAIL_TASKS_KEY);
  if (storedTasks) {
    tailTasks = JSON.parse(storedTasks);
  } else {
    tailTasks = [
      {
        id: '1',
        taskNo: 'TT20250101001',
        bundleNo: 'BN20250101001',
        orderNo: 'ORD20250101001',
        bomNo: 'BOM20250101001',
        styleNo: 'ST001',
        productName: '男士T恤',
        colorName: '黑色',
        sizeName: 'M',
        bundleQuantity: 48,
        goodQuantity: 0,
        reworkQuantity: 0,
        currentProcess: '整烫精整',
        completedProcesses: [],
        status: '待尾部',
        pieceWage: 0,
        operator: '',
        remark: '',
        createdAt: '2025-01-01 16:00:00',
        updatedAt: '2025-01-01 16:00:00',
      },
    ];
    localStorage.setItem(TAIL_TASKS_KEY, JSON.stringify(tailTasks));
  }

  // 初始化装箱数据
  const storedBoxes = localStorage.getItem(PACKING_BOXES_KEY);
  if (storedBoxes) {
    packingBoxes = JSON.parse(storedBoxes);
  } else {
    packingBoxes = [];
    localStorage.setItem(PACKING_BOXES_KEY, JSON.stringify(packingBoxes));
  }
}

export function getTailTasks(): TailTask[] {
  return [...tailTasks].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getTailTaskById(id: string): TailTask | undefined {
  return tailTasks.find(t => t.id === id);
}

export function saveTailTask(task: TailTask): void {
  const index = tailTasks.findIndex(t => t.id === task.id);
  if (index >= 0) {
    tailTasks[index] = task;
  } else {
    tailTasks.push(task);
  }
  localStorage.setItem(TAIL_TASKS_KEY, JSON.stringify(tailTasks));
}

export function getTailProcesses(): TailProcess[] {
  return [...tailProcesses].sort((a, b) => a.processOrder - b.processOrder);
}

export function getPackingBoxes(): PackingBox[] {
  return [...packingBoxes].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function savePackingBox(box: PackingBox): void {
  const index = packingBoxes.findIndex(b => b.id === box.id);
  if (index >= 0) {
    packingBoxes[index] = box;
  } else {
    packingBoxes.push(box);
  }
  localStorage.setItem(PACKING_BOXES_KEY, JSON.stringify(packingBoxes));
}

export function generateTaskNo(): string {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const todayTasks = tailTasks.filter(t => t.taskNo.includes(dateStr));
  const seq = (todayTasks.length + 1).toString().padStart(3, '0');
  return `TT${dateStr}${seq}`;
}

export function generateBoxNo(): string {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const seq = (packingBoxes.length + 1).toString().padStart(3, '0');
  return `BOX${dateStr}${seq}`;
}
