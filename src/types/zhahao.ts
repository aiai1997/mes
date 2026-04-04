// 扎号类型定义 - 服装生产核心追溯功能

export interface Zhahao {
  id: string;
  zhahaoCode: string;        // 扎号编码（条码）
  orderNo: string;            // 订单号
  color: string;              // 颜色
  size: string;               // 尺码
  quantity: number;           // 数量
  
  // 裁床信息
  cuttingBed?: string;        // 裁床床次
  cuttingQuantity: number;    // 裁床数量
  cuttingOperator?: string;   // 裁床操作员
  cuttingTime?: string;       // 裁床时间
  
  // 扎包信息
  bundleQuantity: number;     // 扎包数量
  
  // 车间生产信息
  workshopQuantity: number;   // 车间生产数量
  workshopOperator?: string;  // 车间操作员
  workshopTime?: string;      // 车间时间
  
  // 尾部信息
  tailQuantity: number;       // 尾部数量
  
  // 质检信息
  qualityQuantity: number;    // 质检数量
  
  // 装箱信息
  packingQuantity: number;    // 装箱数量
  
  // 入库信息
  inboundQuantity: number;    // 入库数量
  
  // 发货信息
  outboundQuantity: number;   // 发货数量
  
  // 当前工序
  currentProcess?: string;    // 当前工序
  
  // 时间戳
  createdAt: string;
  updatedAt: string;
}

const ZAHAO_STORAGE_KEY = 'erp_zahaos';

export function getZahaos(): Zhahao[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(ZAHAO_STORAGE_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  // 返回示例数据
  const defaultZahaos: Zhahao[] = [
    {
      id: '1',
      zhahaoCode: 'ZH20260101001',
      orderNo: 'ORD20260101001',
      color: '黑色',
      size: 'M',
      quantity: 50,
      cuttingBed: 'A床',
      cuttingQuantity: 50,
      cuttingOperator: '张裁床',
      cuttingTime: '2026-01-01 08:30',
      bundleQuantity: 50,
      workshopQuantity: 48,
      workshopOperator: '李车位',
      workshopTime: '2026-01-02 14:00',
      tailQuantity: 45,
      qualityQuantity: 45,
      packingQuantity: 45,
      inboundQuantity: 45,
      outboundQuantity: 0,
      currentProcess: '入库',
      createdAt: '2026-01-01 08:00',
      updatedAt: '2026-01-03 16:00',
    },
    {
      id: '2',
      zhahaoCode: 'ZH20260101002',
      orderNo: 'ORD20260101001',
      color: '黑色',
      size: 'L',
      quantity: 60,
      cuttingBed: 'A床',
      cuttingQuantity: 60,
      cuttingOperator: '张裁床',
      cuttingTime: '2026-01-01 09:00',
      bundleQuantity: 60,
      workshopQuantity: 55,
      workshopOperator: '王车位',
      workshopTime: '2026-01-02 15:00',
      tailQuantity: 50,
      qualityQuantity: 50,
      packingQuantity: 0,
      inboundQuantity: 0,
      outboundQuantity: 0,
      currentProcess: '尾部',
      createdAt: '2026-01-01 08:00',
      updatedAt: '2026-01-02 18:00',
    },
    {
      id: '3',
      zhahaoCode: 'ZH20260101003',
      orderNo: 'ORD20260101001',
      color: '白色',
      size: 'S',
      quantity: 40,
      cuttingBed: 'B床',
      cuttingQuantity: 40,
      cuttingOperator: '张裁床',
      cuttingTime: '2026-01-01 10:00',
      bundleQuantity: 40,
      workshopQuantity: 30,
      workshopOperator: '李车位',
      workshopTime: '2026-01-02 16:00',
      tailQuantity: 0,
      qualityQuantity: 0,
      packingQuantity: 0,
      inboundQuantity: 0,
      outboundQuantity: 0,
      currentProcess: '车间',
      createdAt: '2026-01-01 08:00',
      updatedAt: '2026-01-02 17:00',
    },
  ];
  localStorage.setItem(ZAHAO_STORAGE_KEY, JSON.stringify(defaultZahaos));
  return defaultZahaos;
}

export function saveZhahao(zhahao: Zhahao): void {
  if (typeof window === 'undefined') return;
  const zhahaos = getZahaos();
  const index = zhahaos.findIndex(z => z.id === zhahao.id);
  if (index >= 0) {
    zhahaos[index] = zhahao;
  } else {
    zhahaos.push(zhahao);
  }
  localStorage.setItem(ZAHAO_STORAGE_KEY, JSON.stringify(zhahaos));
}

export function deleteZhahao(id: string): void {
  if (typeof window === 'undefined') return;
  const zhahaos = getZahaos().filter(z => z.id !== id);
  localStorage.setItem(ZAHAO_STORAGE_KEY, JSON.stringify(zhahaos));
}

export function generateZhahaoCode(orderNo: string, color: string, size: string): string {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const zhahaos = getZahaos();
  const seq = (zhahaos.length + 1).toString().padStart(3, '0');
  return `ZH${dateStr}${seq}`;
}
