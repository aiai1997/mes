import { type Order, type ColorSizeMatrix, type PrintEmbroideryRequirement, type WashRequirement, type PackingRequirement, type TailRequirement, getOrders } from './order';

// BOM状态
export type BOMStatus = '草稿' | '待审核' | '已审核' | '已生效' | '已作废';

// BOM类型
export type BOMType = '订单BOM' | '通用BOM';

// 物料分类
export type MaterialCategory = '面料' | '辅料' | '印绣花' | '洗水' | '尾部' | '包装';

// 辅料分类
export type AccessoryCategory = '纽扣' | '四合扣' | '拉链' | '线类' | '标类' | '其他';

// 包装分类
export type PackingCategory = 'PE胶袋' | '拷贝纸' | '干燥剂' | '外箱' | '胶带' | '吊牌绳';

// 尾部分类
export type TailCategory = '线类' | '备用配件' | '整烫耗材' | '查衫耗材';

// 洗水类型
export type WashType = '普洗' | '石洗' | '酵素洗' | '砂洗' | '漂洗' | '套色洗' | '复古洗';

// 印绣花工艺类型
export type PrintType = '印花' | '绣花' | '烫钻' | '烫画' | '压花' | '数码印';

// 纸箱材质
export type CartonMaterial = 'A=B' | 'B=B' | 'K=A';

// 物料基础接口
export interface MaterialBase {
  id: string;
  materialCode: string;
  materialName: string;
  specification: string;
  unit: string;
  usagePart: string;
  materialColor: string;
  applicableSizes: string[];
  standardConsumption: number; // 标准单耗（M码基准）
  lossRate: number; // 损耗率%
  actualConsumption: number; // 实际单耗（自动计算）
  totalUsage: number; // 总用量（自动计算）
  unitPrice: number;
  totalCost: number;
  supplier: string;
  processRequirement: string;
  inventory: number; // 当前库存
}

// 面料物料
export interface FabricMaterial extends MaterialBase {
  category: '面料';
  fabricWidth: number; // 门幅cm
  fabricWeight: number; // 克重g/m²
  fabricComposition: string; // 成分
  markerRatio: string; // 唛架配比
}

// 辅料物料
export interface AccessoryMaterial extends MaterialBase {
  category: '辅料';
  accessoryCategory: AccessoryCategory;
  packingSpecification: string; // 包装规格
  sizeMatchingRule: string; // 尺码匹配规则
}

// 印绣花物料
export interface PrintMaterial extends MaterialBase {
  category: '印绣花';
  printType: PrintType;
  patternCode: string; // 花型/LOGO编号
  colorCount: number;
  printWidth: number;
  printHeight: number;
  isSymmetric: boolean;
}

// 洗水物料
export interface WashMaterial extends MaterialBase {
  category: '洗水';
  washType: WashType;
  washColorEffect: string;
  chemicals: string; // 化学品
  chemicalDosage: string; // 化学品用量
  shrinkageControl: string;
  ecoRequirement: string;
}

// 尾部物料
export interface TailMaterial extends MaterialBase {
  category: '尾部';
  tailCategory: TailCategory;
  perPieceUsage: number;
}

// 包装物料
export interface PackingMaterial extends MaterialBase {
  category: '包装';
  packingCategory: PackingCategory;
  packingSize: string;
  packingQuantity: number; // 装箱数量
  packingRatio: string; // 装箱配码比例
  cartonMaterial: CartonMaterial;
}

// 物料联合类型
export type Material = FabricMaterial | AccessoryMaterial | PrintMaterial | WashMaterial | TailMaterial | PackingMaterial;

// BOM主表
export interface BOM {
  id: string;
  bomNo: string; // BOM + 订单日期 + 3位流水号
  orderNo: string; // 关联订单号
  styleNo: string;
  productName: string;
  customerName: string;
  orderQuantity: number; // 订单总数量
  colorSizeMatrix: ColorSizeMatrix[];
  deliveryDate: string;
  bomVersion: string; // 版本号，默认01
  bomType: BOMType;
  status: BOMStatus;
  
  // 订单工艺要求（从订单带出）
  printEmbroidery: PrintEmbroideryRequirement[];
  washRequirement: WashRequirement;
  packingRequirement: PackingRequirement;
  tailRequirement: TailRequirement;
  
  // 物料明细
  fabrics: FabricMaterial[];
  accessories: AccessoryMaterial[];
  prints: PrintMaterial[];
  washes: WashMaterial[];
  tails: TailMaterial[];
  packings: PackingMaterial[];
  
  // 成本汇总
  fabricTotalCost: number;
  accessoryTotalCost: number;
  printTotalCost: number;
  washTotalCost: number;
  tailTotalCost: number;
  packingTotalCost: number;
  pieceCost: number; // 单件成本
  totalCost: number; // 订单总生产成本
  
  // 审核信息
  createdBy: string;
  createdAt: string;
  auditedBy?: string;
  auditedAt?: string;
  effectiveAt?: string; // 生效时间
}

// 物料档案
export interface MaterialMaster {
  id: string;
  materialCode: string;
  materialName: string;
  category: MaterialCategory;
  specification: string;
  unit: string;
  unitPrice: number;
  supplier: string;
  inventory: number;
  safetyStock: number;
}

// 默认物料档案
export const defaultMaterials: MaterialMaster[] = [
  // 面料
  { id: '1', materialCode: 'ML001', materialName: '纯棉汗布', category: '面料', specification: '180g/m²', unit: '米', unitPrice: 35, supplier: '华纺布业', inventory: 5000, safetyStock: 1000 },
  { id: '2', materialCode: 'ML002', materialName: '涤棉斜纹布', category: '面料', specification: '200g/m²', unit: '米', unitPrice: 28, supplier: '华纺布业', inventory: 8000, safetyStock: 2000 },
  { id: '3', materialCode: 'ML003', materialName: '牛仔布', category: '面料', specification: '12oz', unit: '米', unitPrice: 45, supplier: '牛仔世界', inventory: 3000, safetyStock: 800 },
  
  // 辅料
  { id: '4', materialCode: 'FL001', materialName: '树脂纽扣', category: '辅料', specification: '15mm', unit: '个', unitPrice: 0.15, supplier: '纽扣城', inventory: 50000, safetyStock: 10000 },
  { id: '5', materialCode: 'FL002', materialName: '金属拉链', category: '辅料', specification: '20cm', unit: '条', unitPrice: 2.5, supplier: 'YKK', inventory: 3000, safetyStock: 500 },
  { id: '6', materialCode: 'FL003', materialName: '涤纶缝纫线', category: '辅料', specification: '40S/2', unit: '轴', unitPrice: 8, supplier: '线业公司', inventory: 2000, safetyStock: 300 },
  { id: '7', materialCode: 'FL004', materialName: '洗水标', category: '辅料', specification: '3×5cm', unit: '个', unitPrice: 0.05, supplier: '标牌厂', inventory: 100000, safetyStock: 20000 },
  
  // 包装
  { id: '8', materialCode: 'BZ001', materialName: 'PE胶袋', category: '包装', specification: '30×40cm', unit: '个', unitPrice: 0.3, supplier: '包装材料厂', inventory: 20000, safetyStock: 5000 },
  { id: '9', materialCode: 'BZ002', materialName: '纸箱', category: '包装', specification: '60×40×30cm', unit: '个', unitPrice: 5, supplier: '纸箱厂', inventory: 500, safetyStock: 100 },
  { id: '10', materialCode: 'BZ003', materialName: '吊牌', category: '包装', specification: '5×8cm', unit: '个', unitPrice: 0.1, supplier: '印刷厂', inventory: 30000, safetyStock: 5000 },
];

// 默认BOM数据
export const defaultBOMs: BOM[] = [
  {
    id: '1',
    bomNo: 'BOM20260331001',
    orderNo: 'ORD20260331001',
    styleNo: 'TS-2024-001',
    productName: '男士短袖T恤',
    customerName: '优衣库',
    orderQuantity: 1480,
    colorSizeMatrix: [
      { colorName: '白色', S: 100, M: 200, L: 200, XL: 150, XXL: 100, XXXL: 50, subtotal: 800 },
      { colorName: '黑色', S: 80, M: 180, L: 180, XL: 120, XXL: 80, XXXL: 40, subtotal: 680 },
    ],
    deliveryDate: '2026-05-15',
    bomVersion: '01',
    bomType: '订单BOM',
    status: '已生效',
    printEmbroidery: [
      {
        position: '前胸',
        type: '印花',
        colorCount: 2,
        width: 20,
        height: 15,
        pantoneColor: 'PMS 186C',
        isSymmetric: false,
        fastness: '3级',
        washRequirement: '60℃水洗不褪色',
      },
    ],
    washRequirement: {
      washType: '普洗',
      colorEffect: '原色',
      shrinkageRate: '≤3%',
      ecoRequirement: ['无甲醛', '无偶氮'],
    },
    packingRequirement: {
      packingMethod: '独立包装',
      peBagSize: '自动匹配',
      cartonSize: '60×40×30cm',
      piecesPerCarton: 50,
      sizeRatio: '1:2:2:1',
      cartonLabelType: '英文',
      sticker: '需贴价格标签',
      barcode: '需贴条形码',
      moistureProof: true,
      desiccant: true,
      tissuePaper: false,
    },
    tailRequirement: {
      trimThread: true,
      ironing: true,
      inspection: true,
      spareButtons: 2,
      spareThread: '10米',
      hangTag: '需挂吊牌',
      hangRope: '需挂绳',
      foldMethod: '三折',
    },
    fabrics: [
      {
        id: '1',
        materialCode: 'ML001',
        materialName: '纯棉汗布',
        specification: '180g/m²',
        unit: '米',
        usagePart: '大身',
        materialColor: '白色',
        applicableSizes: ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
        standardConsumption: 1.2,
        lossRate: 5,
        actualConsumption: 1.26,
        totalUsage: 1864.8,
        unitPrice: 35,
        totalCost: 65268,
        supplier: '华纺布业',
        processRequirement: '预缩处理',
        inventory: 5000,
        category: '面料',
        fabricWidth: 150,
        fabricWeight: 180,
        fabricComposition: '100%棉',
        markerRatio: '1:2:2:1',
      },
    ],
    accessories: [
      {
        id: '2',
        materialCode: 'FL004',
        materialName: '洗水标',
        specification: '3×5cm',
        unit: '个',
        usagePart: '后领',
        materialColor: '白色',
        applicableSizes: ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
        standardConsumption: 1,
        lossRate: 2,
        actualConsumption: 1.02,
        totalUsage: 1509.6,
        unitPrice: 0.05,
        totalCost: 75.48,
        supplier: '标牌厂',
        processRequirement: '中英文对照',
        inventory: 100000,
        category: '辅料',
        accessoryCategory: '标类',
        packingSpecification: '1000个/包',
        sizeMatchingRule: '通用',
      },
    ],
    prints: [
      {
        id: '3',
        materialCode: 'YX001',
        materialName: '前胸印花',
        specification: '胶浆印花',
        unit: '次',
        usagePart: '前胸',
        materialColor: '双色',
        applicableSizes: ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
        standardConsumption: 1,
        lossRate: 2,
        actualConsumption: 1.02,
        totalUsage: 1509.6,
        unitPrice: 3.5,
        totalCost: 5283.6,
        supplier: '印花厂',
        processRequirement: 'PMS 186C，60℃水洗不褪色',
        inventory: 0,
        category: '印绣花',
        printType: '印花',
        patternCode: 'LOGO-001',
        colorCount: 2,
        printWidth: 20,
        printHeight: 15,
        isSymmetric: false,
      },
    ],
    washes: [],
    tails: [],
    packings: [
      {
        id: '4',
        materialCode: 'BZ001',
        materialName: 'PE胶袋',
        specification: '30×40cm',
        unit: '个',
        usagePart: '外包装',
        materialColor: '透明',
        applicableSizes: ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
        standardConsumption: 1,
        lossRate: 1,
        actualConsumption: 1.01,
        totalUsage: 1494.8,
        unitPrice: 0.3,
        totalCost: 448.44,
        supplier: '包装材料厂',
        processRequirement: '独立包装',
        inventory: 20000,
        category: '包装',
        packingCategory: 'PE胶袋',
        packingSize: '30×40cm',
        packingQuantity: 1,
        packingRatio: '1:2:2:1',
        cartonMaterial: 'A=B',
      },
    ],
    fabricTotalCost: 65268,
    accessoryTotalCost: 75.48,
    printTotalCost: 5283.6,
    washTotalCost: 0,
    tailTotalCost: 0,
    packingTotalCost: 448.44,
    pieceCost: 47.89,
    totalCost: 70875.52,
    createdBy: 'user',
    createdAt: '2026-03-16 10:00:00',
    auditedBy: 'audit',
    auditedAt: '2026-03-17 14:00:00',
    effectiveAt: '2026-03-17 14:00:00',
  },
];

// 初始化BOM数据
export const initBOMData = () => {
  if (typeof window !== 'undefined') {
    const storedBOMs = localStorage.getItem('erp_boms');
    if (!storedBOMs) {
      localStorage.setItem('erp_boms', JSON.stringify(defaultBOMs));
    }
    localStorage.setItem('erp_materials', JSON.stringify(defaultMaterials));
  }
};

// 生成BOM编号
export const generateBOMNo = (orderNo: string): string => {
  const orderDate = orderNo.slice(3, 11); // 从订单号提取日期
  
  if (typeof window === 'undefined') {
    return `BOM${orderDate}001`;
  }
  
  const storedBOMs = localStorage.getItem('erp_boms');
  const boms: BOM[] = storedBOMs ? JSON.parse(storedBOMs) : [];
  
  const sameDateBOMs = boms.filter(b => b.bomNo.includes(orderDate));
  const maxSeq = sameDateBOMs.length > 0 
    ? Math.max(...sameDateBOMs.map(b => parseInt(b.bomNo.slice(-3)))) 
    : 0;
  
  const seq = String(maxSeq + 1).padStart(3, '0');
  return `BOM${orderDate}${seq}`;
};

// 获取所有BOM
export const getBOMs = (): BOM[] => {
  if (typeof window === 'undefined') return [];
  const storedBOMs = localStorage.getItem('erp_boms');
  return storedBOMs ? JSON.parse(storedBOMs) : [];
};

// 保存BOM（自动计算成本）
export const saveBOM = (bom: BOM) => {
  if (typeof window === 'undefined') return;
  
  // 计算所有物料的实际单耗、总用量和成本
  const calculateMaterialCosts = <T extends MaterialBase>(materials: T[], orderQty: number): { materials: T[], totalCost: number } => {
    let totalCost = 0;
    const calculated = materials.map(m => {
      // 实际单耗 = 标准单耗 × (1 + 损耗率/100)
      m.actualConsumption = Number((m.standardConsumption * (1 + m.lossRate / 100)).toFixed(4));
      // 总用量 = 实际单耗 × 订单数量
      m.totalUsage = Number((m.actualConsumption * orderQty).toFixed(4));
      // 物料成本 = 总用量 × 单价
      m.totalCost = Number((m.totalUsage * m.unitPrice).toFixed(2));
      totalCost += m.totalCost;
      return m;
    });
    return { materials: calculated, totalCost: Number(totalCost.toFixed(2)) };
  };
  
  // 计算各类物料成本
  const fabricResult = calculateMaterialCosts(bom.fabrics || [], bom.orderQuantity);
  bom.fabrics = fabricResult.materials as FabricMaterial[];
  bom.fabricTotalCost = fabricResult.totalCost;
  
  const accessoryResult = calculateMaterialCosts(bom.accessories || [], bom.orderQuantity);
  bom.accessories = accessoryResult.materials as AccessoryMaterial[];
  bom.accessoryTotalCost = accessoryResult.totalCost;
  
  const printResult = calculateMaterialCosts(bom.prints || [], bom.orderQuantity);
  bom.prints = printResult.materials as PrintMaterial[];
  bom.printTotalCost = printResult.totalCost;
  
  const washResult = calculateMaterialCosts(bom.washes || [], bom.orderQuantity);
  bom.washes = washResult.materials as WashMaterial[];
  bom.washTotalCost = washResult.totalCost;
  
  const tailResult = calculateMaterialCosts(bom.tails || [], bom.orderQuantity);
  bom.tails = tailResult.materials as TailMaterial[];
  bom.tailTotalCost = tailResult.totalCost;
  
  const packingResult = calculateMaterialCosts(bom.packings || [], bom.orderQuantity);
  bom.packings = packingResult.materials as PackingMaterial[];
  bom.packingTotalCost = packingResult.totalCost;
  
  // 计算总成本
  bom.totalCost = Number((bom.fabricTotalCost + bom.accessoryTotalCost + bom.printTotalCost + 
    bom.washTotalCost + bom.tailTotalCost + bom.packingTotalCost).toFixed(2));
  
  // 计算单件成本
  bom.pieceCost = bom.orderQuantity > 0 ? Number((bom.totalCost / bom.orderQuantity).toFixed(4)) : 0;
  
  const boms = getBOMs();
  const index = boms.findIndex(b => b.id === bom.id);
  if (index >= 0) {
    boms[index] = bom;
  } else {
    boms.push(bom);
  }
  localStorage.setItem('erp_boms', JSON.stringify(boms));
};

// 删除BOM
export const deleteBOM = (bomId: string) => {
  if (typeof window === 'undefined') return;
  const boms = getBOMs().filter(b => b.id !== bomId);
  localStorage.setItem('erp_boms', JSON.stringify(boms));
};

// 审核BOM
export const auditBOM = (bomId: string, auditor: string) => {
  if (typeof window === 'undefined') return;
  const boms = getBOMs();
  const bom = boms.find(b => b.id === bomId);
  if (bom) {
    bom.status = '已生效';
    bom.auditedBy = auditor;
    bom.auditedAt = new Date().toLocaleString('zh-CN');
    bom.effectiveAt = new Date().toLocaleString('zh-CN');
    localStorage.setItem('erp_boms', JSON.stringify(boms));
  }
};

// 退回BOM
export const rejectBOM = (bomId: string) => {
  if (typeof window === 'undefined') return;
  const boms = getBOMs();
  const bom = boms.find(b => b.id === bomId);
  if (bom) {
    bom.status = '草稿';
    bom.auditedBy = undefined;
    bom.auditedAt = undefined;
    localStorage.setItem('erp_boms', JSON.stringify(boms));
  }
};

// 提交审核
export const submitBOMAudit = (bomId: string) => {
  if (typeof window === 'undefined') return;
  const boms = getBOMs();
  const bom = boms.find(b => b.id === bomId);
  if (bom) {
    bom.status = '待审核';
    localStorage.setItem('erp_boms', JSON.stringify(boms));
  }
};

// 作废BOM
export const cancelBOM = (bomId: string) => {
  if (typeof window === 'undefined') return;
  const boms = getBOMs();
  const bom = boms.find(b => b.id === bomId);
  if (bom) {
    bom.status = '已作废';
    localStorage.setItem('erp_boms', JSON.stringify(boms));
  }
};

// 获取物料档案
export const getMaterials = (): MaterialMaster[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem('erp_materials');
  return stored ? JSON.parse(stored) : [];
};

// 获取可创建BOM的订单（已审核或已下达状态）
export const getOrdersForBOM = (): Order[] => {
  const orders = getOrders();
  return orders.filter(o => o.status === '已审核' || o.status === '已下达' || o.status === '生产中');
};

// 检查订单是否已有BOM
export const checkOrderHasBOM = (orderNo: string): boolean => {
  const boms = getBOMs();
  return boms.some(b => b.orderNo === orderNo && b.status !== '已作废');
};

// 根据订单获取BOM
export const getBOMByOrderNo = (orderNo: string): BOM | undefined => {
  const boms = getBOMs();
  return boms.find(b => b.orderNo === orderNo && b.status === '已生效');
};
