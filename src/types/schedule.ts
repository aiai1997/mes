// 生产排程类型定义

export type ScheduleStatus = '未开始' | '进行中' | '已完成' | '暂停' | '取消';

export interface ScheduleTask {
  id: string;
  taskNo: string;
  orderId: string;
  orderNo: string;
  styleNo: string;
  productName: string;
  customerId: string;
  customerName: string;
  totalQuantity: number;
  
  // 排程信息
  plannedStartDate: string;
  plannedEndDate: string;
  actualStartDate?: string;
  actualEndDate?: string;
  
  // 产能信息
  teamId: string;
  teamName: string;
  dailyCapacity: number; // 每天产能上限
  
  // 状态
  status: ScheduleStatus;
  progress: number; // 完成进度 0-100
  
  // 预警
  isOverCapacity: boolean; // 是否超产能
  isDelayed: boolean; // 是否延期
  
  // 工序
  processes: ScheduleProcess[];
  
  remark: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface ScheduleProcess {
  processId: string;
  processName: string;
  processOrder: number;
  plannedStart: string;
  plannedEnd: string;
  actualStart?: string;
  actualEnd?: string;
  status: ScheduleStatus;
  completedQuantity: number;
  teamId: string;
  teamName: string;
}

export interface TeamCapacity {
  id: string;
  teamId: string;
  teamName: string;
  dailyCapacity: number;
  currentLoad: number; // 当前负载
  remainingCapacity: number; // 剩余产能
  date: string;
}

export interface ScheduleChange {
  id: string;
  changeNo: string;
  taskId: string;
  taskNo: string;
  changeType: '时间变更' | '班组变更' | '数量变更' | '状态变更';
  beforeValue: string;
  afterValue: string;
  reason: string;
  operator: string;
  operateTime: string;
}

// 模拟数据
let scheduleTasks: ScheduleTask[] = [];
let scheduleChanges: ScheduleChange[] = [];

export function initScheduleData() {
  if (typeof window === 'undefined') return;
  
  const stored = localStorage.getItem('erp_schedule_tasks');
  if (!stored) {
    scheduleTasks = [
      {
        id: '1',
        taskNo: 'SCH20240115001',
        orderId: '1',
        orderNo: 'ORD20240110001',
        styleNo: 'ST2024001',
        productName: '男士休闲T恤',
        customerId: '1',
        customerName: '优衣库',
        totalQuantity: 5000,
        plannedStartDate: '2024-01-15',
        plannedEndDate: '2024-01-22',
        teamId: '1',
        teamName: '缝制一组',
        dailyCapacity: 800,
        status: '进行中',
        progress: 45,
        isOverCapacity: false,
        isDelayed: false,
        processes: [
          { processId: '1', processName: '裁剪', processOrder: 1, plannedStart: '2024-01-15', plannedEnd: '2024-01-16', status: '已完成', completedQuantity: 5000, teamId: '1', teamName: '裁床组' },
          { processId: '2', processName: '缝制', processOrder: 2, plannedStart: '2024-01-17', plannedEnd: '2024-01-21', status: '进行中', completedQuantity: 2250, teamId: '1', teamName: '缝制一组' },
          { processId: '3', processName: '整烫', processOrder: 3, plannedStart: '2024-01-22', plannedEnd: '2024-01-22', status: '未开始', completedQuantity: 0, teamId: '2', teamName: '尾部组' },
        ],
        remark: '',
        createdBy: 'admin',
        createdAt: '2024-01-10 10:00:00',
        updatedAt: '2024-01-15 08:00:00',
      },
      {
        id: '2',
        taskNo: 'SCH20240118001',
        orderId: '2',
        orderNo: 'ORD20240112001',
        styleNo: 'ST2024002',
        productName: '女士连衣裙',
        customerId: '2',
        customerName: 'ZARA',
        totalQuantity: 3000,
        plannedStartDate: '2024-01-18',
        plannedEndDate: '2024-01-25',
        teamId: '2',
        teamName: '缝制二组',
        dailyCapacity: 600,
        status: '未开始',
        progress: 0,
        isOverCapacity: false,
        isDelayed: false,
        processes: [],
        remark: '急单，优先生产',
        createdBy: 'admin',
        createdAt: '2024-01-12 14:00:00',
        updatedAt: '2024-01-12 14:00:00',
      },
    ];
    localStorage.setItem('erp_schedule_tasks', JSON.stringify(scheduleTasks));
  } else {
    scheduleTasks = JSON.parse(stored);
  }
  
  const storedChanges = localStorage.getItem('erp_schedule_changes');
  if (storedChanges) {
    scheduleChanges = JSON.parse(storedChanges);
  }
}

export function getScheduleTasks(): ScheduleTask[] {
  return [...scheduleTasks].sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
}

export function getScheduleTask(id: string): ScheduleTask | undefined {
  return scheduleTasks.find(t => t.id === id);
}

export function saveScheduleTask(task: ScheduleTask) {
  const index = scheduleTasks.findIndex(t => t.id === task.id);
  if (index >= 0) {
    scheduleTasks[index] = task;
  } else {
    scheduleTasks.push(task);
  }
  localStorage.setItem('erp_schedule_tasks', JSON.stringify(scheduleTasks));
}

export function getScheduleChanges(): ScheduleChange[] {
  return [...scheduleChanges].sort((a, b) => (b.operateTime || '').localeCompare(a.operateTime || ''));
}

export function generateScheduleNo(): string {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const todayTasks = scheduleTasks.filter(t => t.taskNo.includes(dateStr));
  const seq = (todayTasks.length + 1).toString().padStart(3, '0');
  return `SCH${dateStr}${seq}`;
}
