// 工艺路线
export interface ProcessRoute {
  id: string;
  routeCode: string; // 工艺路线编号
  routeName: string;
  styleNo: string; // 适用款号
  category: string; // 品类
  processes: RouteProcess[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// 路线工序
export interface RouteProcess {
  id: string;
  processOrder: number; // 工序序号
  processCode: string; // 工序代码
  processName: string; // 工序名称
  processDesc: string; // 工序说明
  standardPrice: number; // 工序单价
  workType: string; // 工种
  teamName: string; // 班组
  standardTime: number; // 标准工时(分钟)
  difficulty: number; // 难度系数 1-5
  isRequiredCheck: boolean; // 是否必检
  nextProcessCode: string; // 下一道工序代码
}

// 标准工序库
export interface StandardProcessLibrary {
  id: string;
  processCode: string;
  processName: string;
  category: string;
  standardPrice: number;
  standardTime: number;
  workType: string;
  isActive: boolean;
}

// 默认工序库
export const defaultProcessLibrary: StandardProcessLibrary[] = [
  { id: '1', processCode: 'P001', processName: '合肩', category: '缝制', standardPrice: 0.5, standardTime: 2, workType: '车工', isActive: true },
  { id: '2', processCode: 'P002', processName: '锁边', category: '缝制', standardPrice: 0.3, standardTime: 1.5, workType: '车工', isActive: true },
  { id: '3', processCode: 'P003', processName: '开袋', category: '缝制', standardPrice: 0.8, standardTime: 3, workType: '车工', isActive: true },
  { id: '4', processCode: 'P004', processName: '上领', category: '缝制', standardPrice: 1.0, standardTime: 4, workType: '车工', isActive: true },
  { id: '5', processCode: 'P005', processName: '装袖', category: '缝制', standardPrice: 0.9, standardTime: 3.5, workType: '车工', isActive: true },
  { id: '6', processCode: 'P006', processName: '门襟缝制', category: '缝制', standardPrice: 1.2, standardTime: 4, workType: '车工', isActive: true },
  { id: '7', processCode: 'P007', processName: '钉扣', category: '缝制', standardPrice: 0.2, standardTime: 1, workType: '车工', isActive: true },
  { id: '8', processCode: 'P008', processName: '合缝', category: '缝制', standardPrice: 0.6, standardTime: 2.5, workType: '车工', isActive: true },
  { id: '9', processCode: 'P009', processName: '整烫初整', category: '整烫', standardPrice: 0.6, standardTime: 2, workType: '烫工', isActive: true },
  { id: '10', processCode: 'P010', processName: '质检初检', category: '质检', standardPrice: 0.4, standardTime: 1.5, workType: '质检员', isActive: true },
];

// 默认工艺路线
export const defaultProcessRoutes: ProcessRoute[] = [
  {
    id: '1',
    routeCode: 'RT001',
    routeName: 'T恤标准工艺',
    styleNo: 'TS-2024-001',
    category: 'T恤',
    processes: [
      { id: '1', processOrder: 1, processCode: 'P001', processName: '合肩', processDesc: '合肩缝', standardPrice: 0.5, workType: '车工', teamName: '缝制一组', standardTime: 2, difficulty: 2, isRequiredCheck: false, nextProcessCode: 'P002' },
      { id: '2', processOrder: 2, processCode: 'P002', processName: '锁边', processDesc: '锁边处理', standardPrice: 0.3, workType: '车工', teamName: '缝制一组', standardTime: 1.5, difficulty: 1, isRequiredCheck: false, nextProcessCode: 'P003' },
      { id: '3', processOrder: 3, processCode: 'P005', processName: '装袖', processDesc: '装袖子', standardPrice: 0.9, workType: '车工', teamName: '缝制一组', standardTime: 3.5, difficulty: 3, isRequiredCheck: false, nextProcessCode: 'P004' },
      { id: '4', processOrder: 4, processCode: 'P004', processName: '上领', processDesc: '上领子', standardPrice: 1.0, workType: '车工', teamName: '缝制一组', standardTime: 4, difficulty: 4, isRequiredCheck: true, nextProcessCode: 'P009' },
      { id: '5', processOrder: 5, processCode: 'P009', processName: '整烫初整', processDesc: '初整烫', standardPrice: 0.6, workType: '烫工', teamName: '尾部', standardTime: 2, difficulty: 2, isRequiredCheck: false, nextProcessCode: 'P010' },
      { id: '6', processOrder: 6, processCode: 'P010', processName: '质检初检', processDesc: '质量检验', standardPrice: 0.4, workType: '质检员', teamName: '品管', standardTime: 1.5, difficulty: 2, isRequiredCheck: true, nextProcessCode: '' },
    ],
    isActive: true,
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
  },
];

const LIBRARY_KEY = 'erp_process_library';
const ROUTES_KEY = 'erp_process_routes';

export function initProcessRouteData(): void {
  if (typeof window === 'undefined') return;
  const storedLibrary = localStorage.getItem(LIBRARY_KEY);
  if (!storedLibrary) {
    localStorage.setItem(LIBRARY_KEY, JSON.stringify(defaultProcessLibrary));
  }
  const storedRoutes = localStorage.getItem(ROUTES_KEY);
  if (!storedRoutes) {
    localStorage.setItem(ROUTES_KEY, JSON.stringify(defaultProcessRoutes));
  }
}

export function getProcessLibrary(): StandardProcessLibrary[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(LIBRARY_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function getProcessRoutes(): ProcessRoute[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(ROUTES_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function getProcessRouteByStyleNo(styleNo: string): ProcessRoute | undefined {
  return getProcessRoutes().find(r => r.styleNo === styleNo && r.isActive);
}

export function saveProcessRoute(route: ProcessRoute): void {
  if (typeof window === 'undefined') return;
  const routes = getProcessRoutes();
  const index = routes.findIndex(r => r.id === route.id);
  if (index >= 0) {
    routes[index] = route;
  } else {
    routes.push(route);
  }
  localStorage.setItem(ROUTES_KEY, JSON.stringify(routes));
}
