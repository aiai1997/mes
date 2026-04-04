// MRP物料需求计划类型定义

export type MRPStatus = '待计算' | '已计算' | '已生成采购';
export type ShortageLevel = '安全' | '预警' | '紧急' | '断料';

export interface MRPPlan {
  id: string;
  planNo: string;
  planName: string;
  
  // 计算范围
  orderIds: string[];
  orders: MRPOrder[];
  
  // 计算日期
  calculateDate: string;
  deliveryDate: string;
  
  // 结果
  materials: MRPMaterial[];
  
  // 汇总
  totalMaterials: number;
  shortageCount: number;
  warningCount: number;
  
  status: MRPStatus;
  
  remark: string;
  createdBy: string;
  createdAt: string;
}

export interface MRPOrder {
  orderId: string;
  orderNo: string;
  styleNo: string;
  productName: string;
  quantity: number;
  deliveryDate: string;
}

export interface MRPMaterial {
  id: string;
  materialId: string;
  materialNo: string;
  materialName: string;
  unit: string;
  
  // 需求
  requiredQuantity: number; // 需求量
  bomQuantity: number; // 单件用量
  orderQuantity: number; // 订单数量
  
  // 库存
  currentStock: number; // 现有库存
  inTransit: number; // 在途数量
  safetyStock: number; // 安全库存
  
  // 缺口
  availableQuantity: number; // 可用数量
  shortageQuantity: number; // 缺料数量
  
  // 建议
  suggestedPurchase: number; // 建议采购量
  suggestedDate: string; // 建议到料日期
  
  // 预警
  shortageLevel: ShortageLevel;
  affectProduction: boolean; // 是否影响生产
  
  // 已处理
  purchaseRequestId?: string;
  purchasedQuantity: number;
}

export interface PurchaseRequest {
  id: string;
  requestNo: string;
  mrpId?: string;
  mrpNo?: string;
  
  items: PurchaseRequestItem[];
  
  totalAmount: number;
  status: '待审核' | '已审核' | '已下单';
  
  remark: string;
  createdBy: string;
  createdAt: string;
}

export interface PurchaseRequestItem {
  id: string;
  materialId: string;
  materialNo: string;
  materialName: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  supplierId: string;
  supplierName: string;
  requiredDate: string;
}

// 模拟数据
let mrpPlans: MRPPlan[] = [];

export function initMRPData() {
  if (typeof window === 'undefined') return;
  
  const stored = localStorage.getItem('erp_mrp_plans');
  if (!stored) {
    mrpPlans = [
      {
        id: '1',
        planNo: 'MRP20240110001',
        planName: '2024年1月物料计划',
        orderIds: ['1', '2'],
        orders: [
          { orderId: '1', orderNo: 'ORD20240110001', styleNo: 'ST2024001', productName: '男士休闲T恤', quantity: 5000, deliveryDate: '2024-01-20' },
          { orderId: '2', orderNo: 'ORD20240112001', styleNo: 'ST2024002', productName: '女士连衣裙', quantity: 3000, deliveryDate: '2024-01-25' },
        ],
        calculateDate: '2024-01-10',
        deliveryDate: '2024-01-25',
        materials: [
          {
            id: '1',
            materialId: '1',
            materialNo: 'M001',
            materialName: '纯棉面料',
            unit: '米',
            requiredQuantity: 8000,
            bomQuantity: 1,
            orderQuantity: 8000,
            currentStock: 3000,
            inTransit: 1000,
            safetyStock: 500,
            availableQuantity: 4500,
            shortageQuantity: 3500,
            suggestedPurchase: 3500,
            suggestedDate: '2024-01-15',
            shortageLevel: '紧急',
            affectProduction: true,
            purchasedQuantity: 0,
          },
        ],
        totalMaterials: 1,
        shortageCount: 1,
        warningCount: 0,
        status: '已计算',
        remark: '',
        createdBy: 'admin',
        createdAt: '2024-01-10 10:00:00',
      },
    ];
    localStorage.setItem('erp_mrp_plans', JSON.stringify(mrpPlans));
  } else {
    mrpPlans = JSON.parse(stored);
  }
}

export function getMRPPlans(): MRPPlan[] {
  return [...mrpPlans].sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
}

export function getMRPPlan(id: string): MRPPlan | undefined {
  return mrpPlans.find(p => p.id === id);
}

export function saveMRPPlan(plan: MRPPlan) {
  const index = mrpPlans.findIndex(p => p.id === plan.id);
  if (index >= 0) {
    mrpPlans[index] = plan;
  } else {
    mrpPlans.push(plan);
  }
  localStorage.setItem('erp_mrp_plans', JSON.stringify(mrpPlans));
}

export function generateMRPNo(): string {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const todayPlans = mrpPlans.filter(p => p.planNo.includes(dateStr));
  const seq = (todayPlans.length + 1).toString().padStart(3, '0');
  return `MRP${dateStr}${seq}`;
}
