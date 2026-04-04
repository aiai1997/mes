// 扎号表类型定义 - 核心追溯功能

export type ZaHaoStatus = '已移交' | '缝制中' | '尾部' | '已包装' | '已入库';

export interface ZaHao {
  id: string;
  zaNo: string; // 扎号：ZY + 年月日 + 3位流水号
  
  // 关联信息
  orderId: string;
  orderNo: string;
  cutId: string;
  cutNo: string; // 裁床单号
  productCode: string;
  styleNo: string;
  productName: string;
  
  // 裁床信息
  bedNo: number; // 床次
  layerNo: number; // 层号
  
  // 规格信息
  color: string;
  size: string;
  qty: number; // 扎号数量
  
  // 状态追踪
  status: ZaHaoStatus;
  location: string; // 当前位置（车间/工序）
  
  // 当前工序
  currentProcessId?: string;
  currentProcessName?: string;
  currentWorker?: string;
  
  // 时间戳
  createdAt: string;
  transferredAt?: string; // 移交时间
  completedAt?: string; // 完成时间
  
  remark: string;
}

// 扎号流转记录
export interface ZaHaoFlow {
  id: string;
  zaNo: string;
  processId: string;
  processName: string;
  workerId: string;
  workerName: string;
  action: '报工' | '移交' | '返工' | '入库';
  quantity: number;
  timestamp: string;
  remark: string;
}

// 扎号打印模板
export interface ZaHaoPrintTemplate {
  id: string;
  name: string;
  paperSize: string;
  width: number;
  height: number;
  barcodeType: 'QR' | 'Code128' | 'Code39';
  fontSize: number;
  showOrderNo: boolean;
  showColor: boolean;
  showSize: boolean;
  showQty: boolean;
  showBedNo: boolean;
}

// 默认打印模板
export const defaultPrintTemplate: ZaHaoPrintTemplate = {
  id: '1',
  name: '标准扎号标签',
  paperSize: '50×30mm',
  width: 50,
  height: 30,
  barcodeType: 'QR',
  fontSize: 10,
  showOrderNo: true,
  showColor: true,
  showSize: true,
  showQty: true,
  showBedNo: true,
};

// 模拟数据
let zaHaoList: ZaHao[] = [];

export function initZaHaoData() {
  if (typeof window === 'undefined') return;
  
  const stored = localStorage.getItem('erp_zahao_list');
  if (!stored) {
    zaHaoList = [
      {
        id: '1',
        zaNo: 'ZY20260331001',
        orderId: '1',
        orderNo: 'ORD20260331001',
        cutId: '1',
        cutNo: 'CUT20260331001',
        productCode: 'TS-2024-001',
        styleNo: 'TS-2024-001',
        productName: '男士短袖T恤',
        bedNo: 1,
        layerNo: 1,
        color: '白色',
        size: 'M',
        qty: 50,
        status: '缝制中',
        location: '缝制一组',
        currentProcessId: '5',
        currentProcessName: '合侧缝',
        currentWorker: '张三',
        createdAt: '2026-03-31 08:00:00',
        transferredAt: '2026-03-31 09:00:00',
        remark: '',
      },
      {
        id: '2',
        zaNo: 'ZY20260331002',
        orderId: '1',
        orderNo: 'ORD20260331001',
        cutId: '1',
        cutNo: 'CUT20260331001',
        productCode: 'TS-2024-001',
        styleNo: 'TS-2024-001',
        productName: '男士短袖T恤',
        bedNo: 1,
        layerNo: 2,
        color: '白色',
        size: 'L',
        qty: 50,
        status: '已移交',
        location: '车间待领',
        createdAt: '2026-03-31 08:00:00',
        transferredAt: '2026-03-31 09:00:00',
        remark: '',
      },
    ];
    localStorage.setItem('erp_zahao_list', JSON.stringify(zaHaoList));
  } else {
    zaHaoList = JSON.parse(stored);
  }
}

// 生成扎号
export function generateZaNo(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const dateStr = `${year}${month}${day}`;
  
  if (typeof window === 'undefined') {
    return `ZY${dateStr}001`;
  }
  
  const stored = localStorage.getItem('erp_zahao_list');
  const list: ZaHao[] = stored ? JSON.parse(stored) : [];
  
  const todayList = list.filter(z => z.zaNo.includes(dateStr));
  const maxSeq = todayList.length > 0 
    ? Math.max(...todayList.map(z => parseInt(z.zaNo.slice(-3)))) 
    : 0;
  
  const seq = String(maxSeq + 1).padStart(3, '0');
  return `ZY${dateStr}${seq}`;
}

// 获取所有扎号
export function getZaHaoList(): ZaHao[] {
  return [...zaHaoList].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

// 根据扎号查询
export function getZaHaoByNo(zaNo: string): ZaHao | undefined {
  return zaHaoList.find(z => z.zaNo === zaNo);
}

// 根据订单查询扎号
export function getZaHaoByOrder(orderId: string): ZaHao[] {
  return zaHaoList.filter(z => z.orderId === orderId);
}

// 根据裁床查询扎号
export function getZaHaoByCut(cutId: string): ZaHao[] {
  return zaHaoList.filter(z => z.cutId === cutId);
}

// 保存扎号
export function saveZaHao(zahao: ZaHao) {
  const index = zaHaoList.findIndex(z => z.id === zahao.id);
  if (index >= 0) {
    zaHaoList[index] = zahao;
  } else {
    zaHaoList.push(zahao);
  }
  localStorage.setItem('erp_zahao_list', JSON.stringify(zaHaoList));
}

// 批量生成扎号（裁床完成后调用）
export function generateZaHaoFromCut(
  cutId: string,
  cutNo: string,
  orderId: string,
  orderNo: string,
  productCode: string,
  styleNo: string,
  productName: string,
  bedNo: number,
  color: string,
  sizeQuantities: { size: string; qty: number }[],
  layersPerBundle: number = 50
): ZaHao[] {
  const generated: ZaHao[] = [];
  
  sizeQuantities.forEach(sq => {
    const totalQty = sq.qty;
    const bundleCount = Math.ceil(totalQty / layersPerBundle);
    
    for (let i = 0; i < bundleCount; i++) {
      const bundleQty = Math.min(layersPerBundle, totalQty - i * layersPerBundle);
      
      const zahao: ZaHao = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        zaNo: generateZaNo(),
        orderId,
        orderNo,
        cutId,
        cutNo,
        productCode,
        styleNo,
        productName,
        bedNo,
        layerNo: i + 1,
        color,
        size: sq.size,
        qty: bundleQty,
        status: '已移交',
        location: '车间待领',
        createdAt: new Date().toLocaleString('zh-CN'),
        remark: '',
      };
      
      saveZaHao(zahao);
      generated.push(zahao);
    }
  });
  
  return generated;
}

// 更新扎号状态
export function updateZaHaoStatus(zaNo: string, status: ZaHaoStatus, location?: string) {
  const zahao = zaHaoList.find(z => z.zaNo === zaNo);
  if (zahao) {
    zahao.status = status;
    if (location) zahao.location = location;
    if (status === '已入库') {
      zahao.completedAt = new Date().toLocaleString('zh-CN');
    }
    localStorage.setItem('erp_zahao_list', JSON.stringify(zaHaoList));
  }
}

// 扎号统计
export function getZaHaoStats(orderId?: string) {
  const list = orderId ? zaHaoList.filter(z => z.orderId === orderId) : zaHaoList;
  
  return {
    total: list.length,
    totalQty: list.reduce((sum, z) => sum + z.qty, 0),
    byStatus: {
      '已移交': list.filter(z => z.status === '已移交').length,
      '缝制中': list.filter(z => z.status === '缝制中').length,
      '尾部': list.filter(z => z.status === '尾部').length,
      '已包装': list.filter(z => z.status === '已包装').length,
      '已入库': list.filter(z => z.status === '已入库').length,
    },
    byColor: list.reduce((acc, z) => {
      acc[z.color] = (acc[z.color] || 0) + z.qty;
      return acc;
    }, {} as Record<string, number>),
    bySize: list.reduce((acc, z) => {
      acc[z.size] = (acc[z.size] || 0) + z.qty;
      return acc;
    }, {} as Record<string, number>),
  };
}
