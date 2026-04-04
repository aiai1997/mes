/**
 * ERP系统演示数据模块
 * 
 * 包含完整的演示数据，用于快速体验系统功能
 */

import { DB_KEYS } from './database';

// 生成唯一ID
const generateId = () => Math.random().toString(36).substring(2, 15);

// 生成日期字符串
const formatDate = (date: Date) => date.toISOString().slice(0, 10);
const formatDateTime = (date: Date) => date.toISOString().slice(0, 19).replace('T', ' ');

// 当前日期
const today = new Date();
const getDateBefore = (days: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() - days);
  return d;
};
const getDateAfter = (days: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() + days);
  return d;
};

// ==================== 演示数据 ====================

// 客户数据
const demoCustomers = [
  {
    id: generateId(),
    customerCode: 'C001',
    customerName: '广州优衣服装有限公司',
    shortName: '优衣',
    contact: '张经理',
    phone: '13800138001',
    address: '广州市天河区珠江新城',
    level: 'A级' as const,
    creditDays: 30,
    taxRate: 13,
    invoiceInfo: '增值税专用发票',
    deliveryAddress: '广州市天河区珠江新城',
    totalOrders: 15,
    totalAmount: 2580000,
    status: '启用' as const,
    createdAt: formatDateTime(getDateBefore(365)),
  },
  {
    id: generateId(),
    customerCode: 'C002',
    customerName: '深圳时尚服饰集团',
    shortName: '时尚集团',
    contact: '李总',
    phone: '13800138002',
    address: '深圳市南山区科技园',
    level: 'A级' as const,
    creditDays: 30,
    taxRate: 13,
    invoiceInfo: '增值税专用发票',
    deliveryAddress: '深圳市南山区科技园',
    totalOrders: 23,
    totalAmount: 4120000,
    status: '启用' as const,
    createdAt: formatDateTime(getDateBefore(300)),
  },
  {
    id: generateId(),
    customerCode: 'C003',
    customerName: '杭州丝绸女装有限公司',
    shortName: '丝绸女装',
    contact: '王经理',
    phone: '13800138003',
    address: '杭州市西湖区',
    level: 'B级' as const,
    creditDays: 15,
    taxRate: 13,
    invoiceInfo: '增值税普通发票',
    deliveryAddress: '杭州市西湖区',
    totalOrders: 8,
    totalAmount: 960000,
    status: '启用' as const,
    createdAt: formatDateTime(getDateBefore(200)),
  },
  {
    id: generateId(),
    customerCode: 'C004',
    customerName: '上海潮牌服饰有限公司',
    shortName: '潮牌服饰',
    contact: '陈总',
    phone: '13800138004',
    address: '上海市静安区',
    level: 'A级' as const,
    creditDays: 30,
    taxRate: 13,
    invoiceInfo: '增值税专用发票',
    deliveryAddress: '上海市静安区',
    totalOrders: 12,
    totalAmount: 1850000,
    status: '启用' as const,
    createdAt: formatDateTime(getDateBefore(180)),
  },
  {
    id: generateId(),
    customerCode: 'C005',
    customerName: '北京运动服饰有限公司',
    shortName: '运动服饰',
    contact: '刘经理',
    phone: '13800138005',
    address: '北京市朝阳区',
    level: 'B级' as const,
    creditDays: 15,
    taxRate: 13,
    invoiceInfo: '增值税专用发票',
    deliveryAddress: '北京市朝阳区',
    totalOrders: 6,
    totalAmount: 720000,
    status: '启用' as const,
    createdAt: formatDateTime(getDateBefore(150)),
  },
];

// 供应商数据
const demoSuppliers = [
  {
    id: generateId(),
    supplierCode: 'S001',
    supplierName: '广东华纺面料有限公司',
    supplierType: '面料' as const,
    contact: '黄经理',
    phone: '13900139001',
    address: '东莞市虎门镇',
    invoiceInfo: '增值税专用发票',
    creditDays: 30,
    paymentMethod: '月结' as const,
    totalPurchases: 45,
    totalAmount: 1850000,
    status: '启用' as const,
    createdAt: formatDateTime(getDateBefore(400)),
  },
  {
    id: generateId(),
    supplierCode: 'S002',
    supplierName: '浙江辅料精品有限公司',
    supplierType: '辅料' as const,
    contact: '周经理',
    phone: '13900139002',
    address: '义乌市工业区',
    invoiceInfo: '增值税专用发票',
    creditDays: 15,
    paymentMethod: '月结' as const,
    totalPurchases: 68,
    totalAmount: 320000,
    status: '启用' as const,
    createdAt: formatDateTime(getDateBefore(380)),
  },
  {
    id: generateId(),
    supplierCode: 'S003',
    supplierName: '福建洗水加工厂',
    supplierType: '外协' as const,
    contact: '吴总',
    phone: '13900139003',
    address: '泉州市晋江区',
    invoiceInfo: '增值税普通发票',
    creditDays: 15,
    paymentMethod: '现结' as const,
    totalPurchases: 28,
    totalAmount: 180000,
    status: '启用' as const,
    createdAt: formatDateTime(getDateBefore(350)),
  },
  {
    id: generateId(),
    supplierCode: 'S004',
    supplierName: '江苏印绣花加工中心',
    supplierType: '外协' as const,
    contact: '郑经理',
    phone: '13900139004',
    address: '苏州市吴江区',
    invoiceInfo: '增值税专用发票',
    creditDays: 30,
    paymentMethod: '月结' as const,
    totalPurchases: 35,
    totalAmount: 260000,
    status: '启用' as const,
    createdAt: formatDateTime(getDateBefore(300)),
  },
];

// 班组数据
const demoTeams = [
  { id: generateId(), teamCode: 'T001', teamName: '缝制一组', teamType: '缝制' as const, leaderName: '王大姐', memberCount: 25, status: '启用' as const, createdAt: formatDateTime(getDateBefore(500)) },
  { id: generateId(), teamCode: 'T002', teamName: '缝制二组', teamType: '缝制' as const, leaderName: '李大姐', memberCount: 22, status: '启用' as const, createdAt: formatDateTime(getDateBefore(500)) },
  { id: generateId(), teamCode: 'T003', teamName: '缝制三组', teamType: '缝制' as const, leaderName: '张大姐', memberCount: 20, status: '启用' as const, createdAt: formatDateTime(getDateBefore(500)) },
  { id: generateId(), teamCode: 'T004', teamName: '裁床班组', teamType: '裁床' as const, leaderName: '刘师傅', memberCount: 8, status: '启用' as const, createdAt: formatDateTime(getDateBefore(500)) },
  { id: generateId(), teamCode: 'T005', teamName: '尾部一组', teamType: '尾部' as const, leaderName: '陈大姐', memberCount: 15, status: '启用' as const, createdAt: formatDateTime(getDateBefore(500)) },
  { id: generateId(), teamCode: 'T006', teamName: '尾部二组', teamType: '尾部' as const, leaderName: '赵大姐', memberCount: 12, status: '启用' as const, createdAt: formatDateTime(getDateBefore(500)) },
  { id: generateId(), teamCode: 'T007', teamName: '品管组', teamType: '品管' as const, leaderName: '孙主管', memberCount: 10, status: '启用' as const, createdAt: formatDateTime(getDateBefore(500)) },
  { id: generateId(), teamCode: 'T008', teamName: '包装组', teamType: '包装' as const, leaderName: '周大姐', memberCount: 18, status: '启用' as const, createdAt: formatDateTime(getDateBefore(500)) },
];

// 员工数据
const demoEmployees: any[] = [];
demoTeams.forEach(team => {
  for (let i = 1; i <= Math.min(team.memberCount, 5); i++) {
    demoEmployees.push({
      id: generateId(),
      employeeNo: `${team.teamCode}-${String(i).padStart(3, '0')}`,
      name: `员工${team.teamCode}${i}`,
      gender: i % 2 === 0 ? '女' as const : '男' as const,
      phone: `138${String(Math.floor(Math.random() * 100000000)).padStart(8, '0')}`,
      teamId: team.id,
      teamName: team.teamName,
      position: team.teamType === '缝制' ? '缝纫工' : team.teamType === '裁床' ? '裁床工' : team.teamType === '尾部' ? '尾部工' : team.teamType === '品管' ? '质检员' : '包装工',
      wageLevel: ['初级', '中级', '高级'][i % 3],
      baseWage: [3500, 4500, 5500][i % 3],
      subsidy: [200, 300, 500][i % 3],
      entryDate: formatDate(getDateBefore(Math.floor(Math.random() * 500) + 100)),
      status: '在职' as const,
      createdAt: formatDateTime(getDateBefore(Math.floor(Math.random() * 500) + 100)),
    });
  }
});

// 添加领导
demoEmployees.push({
  id: generateId(),
  employeeNo: 'M001',
  name: '王大姐',
  gender: '女' as const,
  phone: '13800001001',
  teamId: demoTeams[0].id,
  teamName: demoTeams[0].teamName,
  position: '班组长',
  wageLevel: '高级',
  baseWage: 6000,
  subsidy: 800,
  entryDate: formatDate(getDateBefore(800)),
  status: '在职' as const,
  createdAt: formatDateTime(getDateBefore(800)),
});

// 订单数据
const demoOrders: any[] = [
  {
    id: generateId(),
    orderNo: 'ORD20240115001',
    customerId: demoCustomers[0].id,
    customerName: demoCustomers[0].customerName,
    customerCode: demoCustomers[0].customerCode,
    customerModel: '',
    productCode: 'P001',
    styleNo: 'YX-2024-001',
    productName: '男士休闲T恤',
    brand: '优衣',
    season: '春夏' as const,
    year: '2024',
    orderDate: formatDate(getDateBefore(45)),
    deliveryDate: formatDate(getDateAfter(15)),
    salesman: '张三',
    remark: '客户急需，请优先安排生产',
    colorSizeMatrix: [
      { colorName: '白色', S: 100, M: 200, L: 300, XL: 200, XXL: 100, XXXL: 50, subtotal: 950 },
      { colorName: '黑色', S: 100, M: 200, L: 300, XL: 200, XXL: 100, XXXL: 50, subtotal: 950 },
      { colorName: '深蓝', S: 50, M: 100, L: 150, XL: 100, XXL: 50, XXXL: 25, subtotal: 475 },
    ],
    totalQuantity: 2375,
    unitPrice: 45,
    amount: 106875,
    currency: '人民币' as const,
    tradeTerms: 'FOB' as const,
    status: '生产中' as const,
    packingRequirement: {
      packingMethod: '折叠' as const,
      peBagSize: '30x40cm',
      cartonSize: '60x40x30cm',
      piecesPerCarton: 50,
      sizeRatio: '1:2:2:1',
      cartonLabelType: '中文' as const,
      sticker: '贴纸',
      barcode: '条形码',
      moistureProof: true,
      desiccant: true,
      tissuePaper: false,
    },
    printEmbroidery: [
      { position: '左胸', type: '绣花' as const, colorCount: 3, width: 5, height: 5, pantoneColor: 'PMS-185C', isSymmetric: false, fastness: '4级', washRequirement: '不可漂白' },
    ],
    washRequirement: {
      washType: '普洗' as const,
      colorEffect: '原色' as const,
      shrinkageRate: '≤3%' as const,
      ecoRequirement: ['环保染料', '无甲醛'],
    },
    tailRequirement: {
      trimThread: true,
      ironing: true,
      inspection: true,
      spareButtons: 2,
      spareThread: '5米',
      hangTag: '吊牌',
      hangRope: '无',
      foldMethod: '常规折叠',
    },
    sewingRequirement: {
      stitchDensity: '12-14针/3cm',
      threadType: '涤纶线402',
      threadColor: '配色',
      overlockType: '四线拷克',
      bartackPosition: '袖口、下摆',
      seamAllowance: '1cm',
      specialProcess: ['双针压线', '圆领包边'],
      otherNotes: '领口需加固处理',
    },
    createdBy: 'admin',
    createdAt: formatDateTime(getDateBefore(45)),
    auditedBy: 'admin',
    auditedAt: formatDateTime(getDateBefore(43)),
    productionIssuedAt: formatDateTime(getDateBefore(42)),
    productionIssuedBy: 'admin',
  },
  {
    id: generateId(),
    orderNo: 'ORD20240110002',
    customerId: demoCustomers[1].id,
    customerName: demoCustomers[1].customerName,
    customerCode: demoCustomers[1].customerCode,
    customerModel: '',
    productCode: 'P002',
    styleNo: 'SS-2024-002',
    productName: '女士连衣裙',
    brand: '时尚',
    season: '春夏' as const,
    year: '2024',
    orderDate: formatDate(getDateBefore(30)),
    deliveryDate: formatDate(getDateAfter(5)),
    salesman: '李四',
    remark: '',
    colorSizeMatrix: [
      { colorName: '粉色', S: 150, M: 200, L: 200, XL: 150, XXL: 80, XXXL: 40, subtotal: 820 },
      { colorName: '蓝色', S: 150, M: 200, L: 200, XL: 150, XXL: 80, XXXL: 40, subtotal: 820 },
    ],
    totalQuantity: 1640,
    unitPrice: 85,
    amount: 139400,
    currency: '人民币' as const,
    tradeTerms: 'FOB' as const,
    status: '已下达' as const,
    packingRequirement: {
      packingMethod: '独立包装' as const,
      peBagSize: '35x45cm',
      cartonSize: '60x40x35cm',
      piecesPerCarton: 30,
      sizeRatio: '1:2:2:1',
      cartonLabelType: '英文' as const,
      sticker: '贴纸',
      barcode: '条形码',
      moistureProof: true,
      desiccant: true,
      tissuePaper: true,
    },
    printEmbroidery: [],
    washRequirement: {
      washType: '酵素' as const,
      colorEffect: '原色' as const,
      shrinkageRate: '≤3%' as const,
      ecoRequirement: ['环保染料'],
    },
    tailRequirement: {
      trimThread: true,
      ironing: true,
      inspection: true,
      spareButtons: 3,
      spareThread: '5米',
      hangTag: '品牌吊牌',
      hangRope: '丝带',
      foldMethod: '挂装',
    },
    sewingRequirement: {
      stitchDensity: '14-16针/3cm',
      threadType: '涤纶线402',
      threadColor: '配色',
      overlockType: '四线拷克',
      bartackPosition: '腰部、裙摆',
      seamAllowance: '1.5cm',
      specialProcess: ['隐形拉链', '裙摆卷边'],
      otherNotes: '裙里需用柔软里布',
    },
    createdBy: 'admin',
    createdAt: formatDateTime(getDateBefore(30)),
    auditedBy: 'admin',
    auditedAt: formatDateTime(getDateBefore(28)),
    productionIssuedAt: formatDateTime(getDateBefore(27)),
    productionIssuedBy: 'admin',
  },
  {
    id: generateId(),
    orderNo: 'ORD20240105003',
    customerId: demoCustomers[2].id,
    customerName: demoCustomers[2].customerName,
    customerCode: demoCustomers[2].customerCode,
    customerModel: '',
    productCode: 'P003',
    styleNo: 'SC-2024-003',
    productName: '真丝衬衫',
    brand: '丝绸',
    season: '春夏' as const,
    year: '2024',
    orderDate: formatDate(getDateBefore(20)),
    deliveryDate: formatDate(getDateAfter(20)),
    salesman: '王五',
    remark: '面料需要特殊处理',
    colorSizeMatrix: [
      { colorName: '米白', S: 80, M: 120, L: 150, XL: 100, XXL: 50, XXXL: 30, subtotal: 530 },
      { colorName: '浅粉', S: 80, M: 120, L: 150, XL: 100, XXL: 50, XXXL: 30, subtotal: 530 },
    ],
    totalQuantity: 1060,
    unitPrice: 180,
    amount: 190800,
    currency: '人民币' as const,
    tradeTerms: 'CIF' as const,
    status: '已审核' as const,
    packingRequirement: {
      packingMethod: '独立包装' as const,
      peBagSize: '40x50cm',
      cartonSize: '70x50x40cm',
      piecesPerCarton: 20,
      sizeRatio: '1:2:2:1',
      cartonLabelType: 'LOGO' as const,
      sticker: '高档贴纸',
      barcode: '条形码',
      moistureProof: true,
      desiccant: true,
      tissuePaper: true,
    },
    printEmbroidery: [
      { position: '领口', type: '绣花' as const, colorCount: 2, width: 3, height: 3, pantoneColor: 'PMS-266C', isSymmetric: true, fastness: '4级', washRequirement: '手洗' },
    ],
    washRequirement: {
      washType: '普洗' as const,
      colorEffect: '原色' as const,
      shrinkageRate: '≤3%' as const,
      ecoRequirement: ['环保染料', '无甲醛', '无荧光剂'],
    },
    tailRequirement: {
      trimThread: true,
      ironing: true,
      inspection: true,
      spareButtons: 5,
      spareThread: '10米',
      hangTag: '高档吊牌',
      hangRope: '丝带',
      foldMethod: '精装折叠',
    },
    sewingRequirement: {
      stitchDensity: '16-18针/3cm',
      threadType: '真丝线',
      threadColor: '配色',
      overlockType: '三线拷克',
      bartackPosition: '领口、袖口',
      seamAllowance: '1.2cm',
      specialProcess: ['手工卷边', '法式缝'],
      otherNotes: '真丝面料需注意防钩丝',
    },
    createdBy: 'admin',
    createdAt: formatDateTime(getDateBefore(20)),
    auditedBy: 'admin',
    auditedAt: formatDateTime(getDateBefore(18)),
  },
  {
    id: generateId(),
    orderNo: 'ORD20240101004',
    customerId: demoCustomers[3].id,
    customerName: demoCustomers[3].customerName,
    customerCode: demoCustomers[3].customerCode,
    customerModel: '',
    productCode: 'P004',
    styleNo: 'CP-2024-004',
    productName: '潮牌卫衣',
    brand: '潮牌',
    season: '秋冬' as const,
    year: '2024',
    orderDate: formatDate(getDateBefore(60)),
    deliveryDate: formatDate(getDateBefore(5)),
    salesman: '赵六',
    remark: '',
    colorSizeMatrix: [
      { colorName: '黑色', S: 200, M: 300, L: 400, XL: 300, XXL: 200, XXXL: 100, subtotal: 1500 },
      { colorName: '灰色', S: 200, M: 300, L: 400, XL: 300, XXL: 200, XXXL: 100, subtotal: 1500 },
      { colorName: '酒红', S: 100, M: 150, L: 200, XL: 150, XXL: 100, XXXL: 50, subtotal: 750 },
    ],
    totalQuantity: 3750,
    unitPrice: 120,
    amount: 450000,
    currency: '人民币' as const,
    tradeTerms: 'FOB' as const,
    status: '已完成' as const,
    packingRequirement: {
      packingMethod: '折叠' as const,
      peBagSize: '35x45cm',
      cartonSize: '60x40x35cm',
      piecesPerCarton: 40,
      sizeRatio: '1:2:2:1',
      cartonLabelType: '英文' as const,
      sticker: '潮牌贴纸',
      barcode: '条形码',
      moistureProof: true,
      desiccant: true,
      tissuePaper: false,
    },
    printEmbroidery: [
      { position: '前胸', type: '印花' as const, colorCount: 5, width: 25, height: 30, pantoneColor: '多色', isSymmetric: false, fastness: '4级', washRequirement: '反面洗涤' },
      { position: '后背', type: '印花' as const, colorCount: 3, width: 30, height: 40, pantoneColor: '多色', isSymmetric: true, fastness: '4级', washRequirement: '反面洗涤' },
    ],
    washRequirement: {
      washType: '普洗' as const,
      colorEffect: '原色' as const,
      shrinkageRate: '≤5%' as const,
      ecoRequirement: ['环保染料'],
    },
    tailRequirement: {
      trimThread: true,
      ironing: true,
      inspection: true,
      spareButtons: 2,
      spareThread: '5米',
      hangTag: '品牌吊牌',
      hangRope: '棉绳',
      foldMethod: '常规折叠',
    },
    sewingRequirement: {
      stitchDensity: '10-12针/3cm',
      threadType: '涤纶线402',
      threadColor: '配色',
      overlockType: '五线拷克',
      bartackPosition: '袋口、袖口',
      seamAllowance: '1cm',
      specialProcess: ['双针压线', '加固肩缝'],
      otherNotes: '帽子需加里布',
    },
    createdBy: 'admin',
    createdAt: formatDateTime(getDateBefore(60)),
    auditedBy: 'admin',
    auditedAt: formatDateTime(getDateBefore(58)),
    productionIssuedAt: formatDateTime(getDateBefore(57)),
    productionIssuedBy: 'admin',
  },
  {
    id: generateId(),
    orderNo: 'ORD20231225005',
    customerId: demoCustomers[4].id,
    customerName: demoCustomers[4].customerName,
    customerCode: demoCustomers[4].customerCode,
    customerModel: '',
    productCode: 'P005',
    styleNo: 'YD-2024-005',
    productName: '运动短裤',
    brand: '运动',
    season: '春夏' as const,
    year: '2024',
    orderDate: formatDate(getDateBefore(15)),
    deliveryDate: formatDate(getDateAfter(30)),
    salesman: '孙七',
    remark: '',
    colorSizeMatrix: [
      { colorName: '黑色', S: 150, M: 200, L: 250, XL: 200, XXL: 150, XXXL: 100, subtotal: 1050 },
      { colorName: '深蓝', S: 150, M: 200, L: 250, XL: 200, XXL: 150, XXXL: 100, subtotal: 1050 },
    ],
    totalQuantity: 2100,
    unitPrice: 55,
    amount: 115500,
    currency: '人民币' as const,
    tradeTerms: 'EXW' as const,
    status: '待审核' as const,
    packingRequirement: {
      packingMethod: '折叠' as const,
      peBagSize: '25x35cm',
      cartonSize: '50x35x30cm',
      piecesPerCarton: 60,
      sizeRatio: '1:2:2:1',
      cartonLabelType: '中文' as const,
      sticker: '贴纸',
      barcode: '条形码',
      moistureProof: true,
      desiccant: false,
      tissuePaper: false,
    },
    printEmbroidery: [
      { position: '左腿', type: '印花' as const, colorCount: 2, width: 8, height: 8, pantoneColor: 'PMS-286C', isSymmetric: false, fastness: '4级', washRequirement: '常规' },
    ],
    washRequirement: {
      washType: '普洗' as const,
      colorEffect: '原色' as const,
      shrinkageRate: '≤3%' as const,
      ecoRequirement: ['环保染料'],
    },
    tailRequirement: {
      trimThread: true,
      ironing: true,
      inspection: true,
      spareButtons: 0,
      spareThread: '3米',
      hangTag: '吊牌',
      hangRope: '无',
      foldMethod: '常规折叠',
    },
    sewingRequirement: {
      stitchDensity: '12-14针/3cm',
      threadType: '涤纶线402',
      threadColor: '配色',
      overlockType: '四线拷克',
      bartackPosition: '腰部、口袋',
      seamAllowance: '1cm',
      specialProcess: ['松紧腰', '内胆包边'],
      otherNotes: '',
    },
    createdBy: 'admin',
    createdAt: formatDateTime(getDateBefore(15)),
  },
  {
    id: generateId(),
    orderNo: 'ORD20231220006',
    customerId: demoCustomers[0].id,
    customerName: demoCustomers[0].customerName,
    customerCode: demoCustomers[0].customerCode,
    customerModel: '',
    productCode: 'P006',
    styleNo: 'YX-2024-006',
    productName: '男士休闲长裤',
    brand: '优衣',
    season: '秋冬' as const,
    year: '2024',
    orderDate: formatDate(getDateBefore(10)),
    deliveryDate: formatDate(getDateAfter(45)),
    salesman: '张三',
    remark: '新款试单',
    colorSizeMatrix: [
      { colorName: '卡其色', S: 50, M: 80, L: 100, XL: 80, XXL: 50, XXXL: 30, subtotal: 390 },
    ],
    totalQuantity: 390,
    unitPrice: 95,
    amount: 37050,
    currency: '人民币' as const,
    tradeTerms: 'FOB' as const,
    status: '草稿' as const,
    packingRequirement: {
      packingMethod: '折叠' as const,
      peBagSize: '35x45cm',
      cartonSize: '60x40x35cm',
      piecesPerCarton: 40,
      sizeRatio: '1:2:2:1',
      cartonLabelType: '中文' as const,
      sticker: '贴纸',
      barcode: '条形码',
      moistureProof: true,
      desiccant: true,
      tissuePaper: false,
    },
    printEmbroidery: [],
    washRequirement: {
      washType: '普洗' as const,
      colorEffect: '原色' as const,
      shrinkageRate: '≤3%' as const,
      ecoRequirement: ['环保染料'],
    },
    tailRequirement: {
      trimThread: true,
      ironing: true,
      inspection: true,
      spareButtons: 2,
      spareThread: '5米',
      hangTag: '吊牌',
      hangRope: '无',
      foldMethod: '常规折叠',
    },
    sewingRequirement: {
      stitchDensity: '12-14针/3cm',
      threadType: '涤纶线402',
      threadColor: '配色',
      overlockType: '四线拷克',
      bartackPosition: '门襟、袋口',
      seamAllowance: '1cm',
      specialProcess: ['门襟压线'],
      otherNotes: '门襟需对条对格',
    },
    createdBy: 'admin',
    createdAt: formatDateTime(getDateBefore(10)),
  },
];

// 物料数据
const demoMaterials = [
  { id: generateId(), materialNo: 'M001', materialName: '全棉针织布', category: '面料', unit: '公斤', specification: '180g/㎡', color: '白色', safetyStock: 500, currentStock: 1200, unitPrice: 35, supplierId: demoSuppliers[0].id, supplierName: demoSuppliers[0].supplierName, status: '启用' as const, createdAt: formatDateTime(getDateBefore(300)) },
  { id: generateId(), materialNo: 'M002', materialName: '涤纶面料', category: '面料', unit: '公斤', specification: '150g/㎡', color: '黑色', safetyStock: 300, currentStock: 800, unitPrice: 28, supplierId: demoSuppliers[0].id, supplierName: demoSuppliers[0].supplierName, status: '启用' as const, createdAt: formatDateTime(getDateBefore(300)) },
  { id: generateId(), materialNo: 'M003', materialName: '真丝面料', category: '面料', unit: '米', specification: '100%真丝', color: '米白', safetyStock: 100, currentStock: 250, unitPrice: 180, supplierId: demoSuppliers[0].id, supplierName: demoSuppliers[0].supplierName, status: '启用' as const, createdAt: formatDateTime(getDateBefore(300)) },
  { id: generateId(), materialNo: 'M004', materialName: '拉链', category: '辅料', unit: '条', specification: '5号尼龙', color: '黑色', safetyStock: 1000, currentStock: 3500, unitPrice: 1.5, supplierId: demoSuppliers[1].id, supplierName: demoSuppliers[1].supplierName, status: '启用' as const, createdAt: formatDateTime(getDateBefore(300)) },
  { id: generateId(), materialNo: 'M005', materialName: '纽扣', category: '辅料', unit: '粒', specification: '18mm', color: '透明', safetyStock: 2000, currentStock: 8000, unitPrice: 0.3, supplierId: demoSuppliers[1].id, supplierName: demoSuppliers[1].supplierName, status: '启用' as const, createdAt: formatDateTime(getDateBefore(300)) },
  { id: generateId(), materialNo: 'M006', materialName: '缝纫线', category: '辅料', unit: '个', specification: '402', color: '白色', safetyStock: 500, currentStock: 1500, unitPrice: 5, supplierId: demoSuppliers[1].id, supplierName: demoSuppliers[1].supplierName, status: '启用' as const, createdAt: formatDateTime(getDateBefore(300)) },
  { id: generateId(), materialNo: 'M007', materialName: '吊牌', category: '辅料', unit: '张', specification: '标准', color: '白色', safetyStock: 3000, currentStock: 10000, unitPrice: 0.2, supplierId: demoSuppliers[1].id, supplierName: demoSuppliers[1].supplierName, status: '启用' as const, createdAt: formatDateTime(getDateBefore(300)) },
  { id: generateId(), materialNo: 'M008', materialName: '包装袋', category: '辅料', unit: '个', specification: '30x40cm', color: '透明', safetyStock: 2000, currentStock: 5000, unitPrice: 0.5, supplierId: demoSuppliers[1].id, supplierName: demoSuppliers[1].supplierName, status: '启用' as const, createdAt: formatDateTime(getDateBefore(300)) },
];

// 库存数据
const demoStockItems = demoMaterials.map(m => ({
  id: generateId(),
  materialNo: m.materialNo,
  materialName: m.materialName,
  category: m.category,
  unit: m.unit,
  specification: m.specification,
  color: m.color,
  currentStock: m.currentStock,
  safetyStock: m.safetyStock,
  lockedStock: Math.floor(m.currentStock * 0.1),
  availableStock: m.currentStock - Math.floor(m.currentStock * 0.1),
  warehouse: '主仓库',
  location: `A-${Math.floor(Math.random() * 10) + 1}-${Math.floor(Math.random() * 20) + 1}`,
  lastInDate: formatDateTime(getDateBefore(Math.floor(Math.random() * 30))),
  lastOutDate: formatDateTime(getDateBefore(Math.floor(Math.random() * 10))),
  status: m.currentStock < m.safetyStock ? '预警' : '正常',
  createdAt: formatDateTime(getDateBefore(300)),
}));

// 裁床任务数据 - 符合 CuttingTask 类型
const demoCuttingTasks = [
  {
    id: generateId(),
    taskNo: 'CT20240115001',
    orderNo: demoOrders[0].orderNo,
    bomNo: 'BOM20240115001',
    styleNo: demoOrders[0].styleNo,
    productName: demoOrders[0].productName,
    plan: {
      id: generateId(),
      orderNo: demoOrders[0].orderNo,
      styleNo: demoOrders[0].styleNo,
      productName: demoOrders[0].productName,
      totalQuantity: 950,
      status: '已裁' as const,
      createdAt: formatDateTime(getDateBefore(40)),
    },
    beds: [
      {
        id: generateId(),
        bedNo: 'CT20240115001-B1',
        bedSeq: 1,
        colorName: '白色',
        fabricName: '全棉针织布',
        fabricQuantity: 150.5,
        fabricWidth: 180,
        sizeRatios: [
          { sizeName: 'S', ratio: 2, layers: 50, pieces: 100 },
          { sizeName: 'M', ratio: 3, layers: 50, pieces: 150 },
          { sizeName: 'L', ratio: 3, layers: 50, pieces: 150 },
          { sizeName: 'XL', ratio: 2, layers: 50, pieces: 100 },
        ],
        totalLayers: 50,
        totalPieces: 500,
        cuttedPieces: 500,
        status: '已移交' as const,
        startedAt: formatDateTime(getDateBefore(39)),
        completedAt: formatDateTime(getDateBefore(38)),
        createdAt: formatDateTime(getDateBefore(40)),
        updatedAt: formatDateTime(getDateBefore(38)),
      },
    ],
    zaHaoRecords: [],
    totalPieces: 950,
    cuttedPieces: 950,
    transferredPieces: 950,
    status: '已移交' as const,
    startedAt: formatDateTime(getDateBefore(39)),
    completedAt: formatDateTime(getDateBefore(38)),
    transferredAt: formatDateTime(getDateBefore(37)),
    remark: '',
    createdBy: 'admin',
    createdAt: formatDateTime(getDateBefore(40)),
    updatedAt: formatDateTime(getDateBefore(37)),
  },
  {
    id: generateId(),
    taskNo: 'CT20240115002',
    orderNo: demoOrders[0].orderNo,
    bomNo: 'BOM20240115001',
    styleNo: demoOrders[0].styleNo,
    productName: demoOrders[0].productName,
    plan: {
      id: generateId(),
      orderNo: demoOrders[0].orderNo,
      styleNo: demoOrders[0].styleNo,
      productName: demoOrders[0].productName,
      totalQuantity: 950,
      status: '已裁' as const,
      createdAt: formatDateTime(getDateBefore(38)),
    },
    beds: [
      {
        id: generateId(),
        bedNo: 'CT20240115002-B1',
        bedSeq: 1,
        colorName: '黑色',
        fabricName: '涤纶面料',
        fabricQuantity: 160.25,
        fabricWidth: 180,
        sizeRatios: [
          { sizeName: 'S', ratio: 2, layers: 50, pieces: 100 },
          { sizeName: 'M', ratio: 3, layers: 50, pieces: 150 },
          { sizeName: 'L', ratio: 3, layers: 50, pieces: 150 },
          { sizeName: 'XL', ratio: 2, layers: 50, pieces: 100 },
        ],
        totalLayers: 50,
        totalPieces: 500,
        cuttedPieces: 500,
        status: '已移交' as const,
        startedAt: formatDateTime(getDateBefore(37)),
        completedAt: formatDateTime(getDateBefore(36)),
        createdAt: formatDateTime(getDateBefore(38)),
        updatedAt: formatDateTime(getDateBefore(36)),
      },
    ],
    zaHaoRecords: [],
    totalPieces: 950,
    cuttedPieces: 950,
    transferredPieces: 950,
    status: '已移交' as const,
    startedAt: formatDateTime(getDateBefore(37)),
    completedAt: formatDateTime(getDateBefore(36)),
    transferredAt: formatDateTime(getDateBefore(35)),
    remark: '',
    createdBy: 'admin',
    createdAt: formatDateTime(getDateBefore(38)),
    updatedAt: formatDateTime(getDateBefore(35)),
  },
  {
    id: generateId(),
    taskNo: 'CT20240115003',
    orderNo: demoOrders[0].orderNo,
    bomNo: 'BOM20240115001',
    styleNo: demoOrders[0].styleNo,
    productName: demoOrders[0].productName,
    plan: {
      id: generateId(),
      orderNo: demoOrders[0].orderNo,
      styleNo: demoOrders[0].styleNo,
      productName: demoOrders[0].productName,
      totalQuantity: 475,
      status: '拉布中' as const,
      createdAt: formatDateTime(getDateBefore(5)),
    },
    beds: [
      {
        id: generateId(),
        bedNo: 'CT20240115003-B1',
        bedSeq: 1,
        colorName: '深蓝',
        fabricName: '真丝面料',
        fabricQuantity: 80.75,
        fabricWidth: 150,
        sizeRatios: [
          { sizeName: 'S', ratio: 2, layers: 25, pieces: 50 },
          { sizeName: 'M', ratio: 3, layers: 25, pieces: 75 },
          { sizeName: 'L', ratio: 3, layers: 25, pieces: 75 },
          { sizeName: 'XL', ratio: 2, layers: 25, pieces: 50 },
        ],
        totalLayers: 25,
        totalPieces: 250,
        cuttedPieces: 150,
        status: '拉布中' as const,
        startedAt: formatDateTime(getDateBefore(4)),
        createdAt: formatDateTime(getDateBefore(5)),
        updatedAt: formatDateTime(getDateBefore(4)),
      },
    ],
    zaHaoRecords: [],
    totalPieces: 475,
    cuttedPieces: 300,
    transferredPieces: 0,
    status: '拉布中' as const,
    startedAt: formatDateTime(getDateBefore(4)),
    remark: '',
    createdBy: 'admin',
    createdAt: formatDateTime(getDateBefore(5)),
    updatedAt: formatDateTime(getDateBefore(4)),
  },
];

// 扎号数据 - 基于 beds 和 sizeRatios 生成
const demoBundles: any[] = [];
demoCuttingTasks.forEach(task => {
  task.beds.forEach(bed => {
    bed.sizeRatios.forEach((ratio, idx) => {
      for (let i = 1; i <= 3; i++) {
        demoBundles.push({
          id: generateId(),
          bundleNo: `${bed.bedNo}-${ratio.sizeName}-${String(i).padStart(3, '0')}`,
          cuttingTaskId: task.id,
          orderId: demoOrders[0].id,
          orderNo: task.orderNo,
          colorName: bed.colorName,
          size: ratio.sizeName,
          quantity: Math.floor(ratio.pieces / 3),
          status: task.status === '已移交' ? '已完成' : i === 1 ? '生产中' : '待生产',
          currentProcess: '缝制',
          createdAt: formatDateTime(getDateBefore(35 - idx * 2)),
        });
      }
    });
  });
});

// 报工记录
const demoWorkReports = [
  {
    id: generateId(),
    reportNo: 'WR20240115001',
    orderId: demoOrders[0].id,
    orderNo: demoOrders[0].orderNo,
    bundleNo: demoBundles[0]?.bundleNo || '',
    employeeId: demoEmployees[0]?.id || '',
    employeeName: demoEmployees[0]?.name || '',
    teamName: demoEmployees[0]?.teamName || '',
    processType: '缝制',
    quantity: 50,
    qualifiedQty: 48,
    defectiveQty: 2,
    reportTime: formatDateTime(getDateBefore(30)),
    status: '已审核' as const,
    remark: '',
    createdAt: formatDateTime(getDateBefore(30)),
  },
  {
    id: generateId(),
    reportNo: 'WR20240116001',
    orderId: demoOrders[0].id,
    orderNo: demoOrders[0].orderNo,
    bundleNo: demoBundles[1]?.bundleNo || '',
    employeeId: demoEmployees[1]?.id || '',
    employeeName: demoEmployees[1]?.name || '',
    teamName: demoEmployees[1]?.teamName || '',
    processType: '缝制',
    quantity: 50,
    qualifiedQty: 50,
    defectiveQty: 0,
    reportTime: formatDateTime(getDateBefore(28)),
    status: '已审核' as const,
    remark: '',
    createdAt: formatDateTime(getDateBefore(28)),
  },
];

// 质检记录
const demoQCRecords = [
  {
    id: generateId(),
    qcNo: 'QC20240120001',
    orderId: demoOrders[0].id,
    orderNo: demoOrders[0].orderNo,
    productName: demoOrders[0].productName,
    qcType: '过程检验',
    inspectQuantity: 100,
    passQuantity: 95,
    defectQuantity: 5,
    defectType: '线头',
    inspector: '孙主管',
    inspectTime: formatDateTime(getDateBefore(20)),
    status: '已完成' as const,
    remark: '线头处理需加强',
    createdAt: formatDateTime(getDateBefore(20)),
  },
  {
    id: generateId(),
    qcNo: 'QC20240125001',
    orderId: demoOrders[3].id,
    orderNo: demoOrders[3].orderNo,
    productName: demoOrders[3].productName,
    qcType: '终检',
    inspectQuantity: 500,
    passQuantity: 490,
    defectQuantity: 10,
    defectType: '色差',
    inspector: '孙主管',
    inspectTime: formatDateTime(getDateBefore(10)),
    status: '已完成' as const,
    remark: '',
    createdAt: formatDateTime(getDateBefore(10)),
  },
];

// 发货记录
const demoDeliveries = [
  {
    id: generateId(),
    deliveryNo: 'DL20240130001',
    orderId: demoOrders[3].id,
    orderNo: demoOrders[3].orderNo,
    customerName: demoOrders[3].customerName,
    productName: demoOrders[3].productName,
    quantity: 2000,
    boxes: 40,
    deliveryDate: formatDate(getDateBefore(5)),
    receiver: '张经理',
    phone: '13800138001',
    address: demoCustomers[3].address,
    status: '已签收' as const,
    remark: '',
    createdAt: formatDateTime(getDateBefore(6)),
  },
];

// 外协记录
const demoOutsourcing = [
  {
    id: generateId(),
    outsourceNo: 'OS20240110001',
    orderId: demoOrders[0].id,
    orderNo: demoOrders[0].orderNo,
    supplierId: demoSuppliers[2].id,
    supplierName: demoSuppliers[2].supplierName,
    processType: '洗水',
    quantity: 1000,
    unitPrice: 8,
    amount: 8000,
    sendDate: formatDate(getDateBefore(35)),
    expectedReturnDate: formatDate(getDateBefore(25)),
    actualReturnDate: formatDate(getDateBefore(26)),
    status: '已完成' as const,
    remark: '',
    createdAt: formatDateTime(getDateBefore(35)),
  },
  {
    id: generateId(),
    outsourceNo: 'OS20240112001',
    orderId: demoOrders[0].id,
    orderNo: demoOrders[0].orderNo,
    supplierId: demoSuppliers[3].id,
    supplierName: demoSuppliers[3].supplierName,
    processType: '印绣花',
    quantity: 2375,
    unitPrice: 5,
    amount: 11875,
    sendDate: formatDate(getDateBefore(33)),
    expectedReturnDate: formatDate(getDateBefore(23)),
    actualReturnDate: formatDate(getDateBefore(24)),
    status: '已完成' as const,
    remark: '绣花质量良好',
    createdAt: formatDateTime(getDateBefore(33)),
  },
];

// 财务应收数据
const demoReceivables = [
  {
    id: generateId(),
    receivableNo: 'AR20240130001',
    orderId: demoOrders[3].id,
    orderNo: demoOrders[3].orderNo,
    customerName: demoOrders[3].customerName,
    amount: 450000,
    receivedAmount: 200000,
    remainingAmount: 250000,
    dueDate: formatDate(getDateAfter(25)),
    status: '部分收款' as const,
    createdAt: formatDateTime(getDateBefore(5)),
  },
  {
    id: generateId(),
    receivableNo: 'AR20240115001',
    orderId: demoOrders[0].id,
    orderNo: demoOrders[0].orderNo,
    customerName: demoOrders[0].customerName,
    amount: 106875,
    receivedAmount: 0,
    remainingAmount: 106875,
    dueDate: formatDate(getDateAfter(15)),
    status: '未收款' as const,
    createdAt: formatDateTime(getDateBefore(10)),
  },
];

// 财务应付数据
const demoPayables = [
  {
    id: generateId(),
    payableNo: 'AP20240115001',
    supplierId: demoSuppliers[0].id,
    supplierName: demoSuppliers[0].supplierName,
    amount: 85000,
    paidAmount: 50000,
    remainingAmount: 35000,
    dueDate: formatDate(getDateAfter(10)),
    status: '部分付款' as const,
    createdAt: formatDateTime(getDateBefore(20)),
  },
];

// 借料记录
const demoBorrowRecords = [
  {
    id: generateId(),
    borrowNo: 'BR20240115001',
    borrowType: '借入' as const,
    materialNo: 'M001',
    materialName: '全棉针织布',
    unit: '公斤',
    borrowQuantity: 500,
    returnedQuantity: 300,
    counterparty: '华纺备用仓库',
    borrowDate: formatDate(getDateBefore(20)),
    expectedReturnDate: formatDate(getDateAfter(10)),
    status: '部分归还' as const,
    remark: '生产急需借入',
    createdBy: 'admin',
    createdAt: formatDateTime(getDateBefore(20)),
  },
  {
    id: generateId(),
    borrowNo: 'BR20240110001',
    borrowType: '借出' as const,
    materialNo: 'M004',
    materialName: '拉链',
    unit: '条',
    borrowQuantity: 200,
    returnedQuantity: 200,
    counterparty: '合作工厂A',
    borrowDate: formatDate(getDateBefore(30)),
    expectedReturnDate: formatDate(getDateBefore(10)),
    actualReturnDate: formatDate(getDateBefore(12)),
    status: '已归还' as const,
    remark: '',
    createdBy: 'admin',
    createdAt: formatDateTime(getDateBefore(30)),
  },
];

// 预警消息
const demoAlerts = [
  {
    id: generateId(),
    alertType: '物料预警' as const,
    alertLevel: '警告' as const,
    title: '物料库存不足',
    content: '物料 M002 涤纶面料 当前库存 800，低于安全库存 1000',
    relatedType: 'material',
    relatedId: demoMaterials[1].id,
    relatedNo: 'M002',
    status: '未读' as const,
    createdAt: formatDateTime(getDateBefore(1)),
  },
  {
    id: generateId(),
    alertType: '订单交期' as const,
    alertLevel: '紧急' as const,
    title: '订单即将到期',
    content: `订单 ${demoOrders[1].orderNo} 将于 ${demoOrders[1].deliveryDate} 到期，请抓紧生产`,
    relatedType: 'order',
    relatedId: demoOrders[1].id,
    relatedNo: demoOrders[1].orderNo,
    status: '未读' as const,
    createdAt: formatDateTime(getDateBefore(0)),
  },
];

// ==================== 初始化函数 ====================

export function initializeDemoData(): { success: boolean; message: string; counts: Record<string, number> } {
  if (typeof window === 'undefined') {
    return { success: false, message: '服务端环境', counts: {} };
  }

  try {
    const counts: Record<string, number> = {};

    // 基础数据
    localStorage.setItem(DB_KEYS.CUSTOMERS, JSON.stringify(demoCustomers));
    counts.customers = demoCustomers.length;

    localStorage.setItem(DB_KEYS.SUPPLIERS, JSON.stringify(demoSuppliers));
    counts.suppliers = demoSuppliers.length;

    localStorage.setItem(DB_KEYS.TEAMS, JSON.stringify(demoTeams));
    counts.teams = demoTeams.length;

    localStorage.setItem(DB_KEYS.EMPLOYEES, JSON.stringify(demoEmployees));
    counts.employees = demoEmployees.length;

    // 订单数据
    localStorage.setItem(DB_KEYS.ORDERS, JSON.stringify(demoOrders));
    counts.orders = demoOrders.length;

    // 物料数据
    localStorage.setItem(DB_KEYS.MATERIALS, JSON.stringify(demoMaterials));
    counts.materials = demoMaterials.length;

    // 库存数据
    localStorage.setItem(DB_KEYS.STOCK_ITEMS, JSON.stringify(demoStockItems));
    counts.stockItems = demoStockItems.length;

    // 生产数据
    localStorage.setItem(DB_KEYS.CUTTING_TASKS, JSON.stringify(demoCuttingTasks));
    counts.cuttingTasks = demoCuttingTasks.length;

    localStorage.setItem(DB_KEYS.BUNDLES, JSON.stringify(demoBundles));
    counts.bundles = demoBundles.length;

    localStorage.setItem(DB_KEYS.WORK_REPORTS, JSON.stringify(demoWorkReports));
    counts.workReports = demoWorkReports.length;

    // 质检数据
    localStorage.setItem(DB_KEYS.QC_RECORDS, JSON.stringify(demoQCRecords));
    counts.qcRecords = demoQCRecords.length;

    // 发货数据
    localStorage.setItem(DB_KEYS.DELIVERIES, JSON.stringify(demoDeliveries));
    counts.deliveries = demoDeliveries.length;

    // 外协数据
    localStorage.setItem(DB_KEYS.OUTSOURCING, JSON.stringify(demoOutsourcing));
    counts.outsourcing = demoOutsourcing.length;

    // 财务数据
    localStorage.setItem(DB_KEYS.RECEIVABLES, JSON.stringify(demoReceivables));
    counts.receivables = demoReceivables.length;

    localStorage.setItem(DB_KEYS.PAYABLES, JSON.stringify(demoPayables));
    counts.payables = demoPayables.length;

    // 借料数据
    localStorage.setItem('erp_borrow_records', JSON.stringify(demoBorrowRecords));
    counts.borrowRecords = demoBorrowRecords.length;

    // 预警数据
    localStorage.setItem('erp_alerts', JSON.stringify(demoAlerts));
    counts.alerts = demoAlerts.length;

    // 标记已初始化
    localStorage.setItem(DB_KEYS.INITIALIZED, 'true');
    localStorage.setItem(DB_KEYS.VERSION, '2.0.0');

    return { success: true, message: '演示数据初始化成功', counts };
  } catch (error) {
    console.error('初始化演示数据失败:', error);
    return { success: false, message: '初始化失败', counts: {} };
  }
}

// 检查是否已初始化
export function isDemoInitialized(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(DB_KEYS.INITIALIZED) === 'true';
}

// 获取演示数据统计
export function getDemoDataStats(): Record<string, number> {
  if (typeof window === 'undefined') return {};
  
  const stats: Record<string, number> = {};
  const keys: Record<string, string> = {
    customers: DB_KEYS.CUSTOMERS,
    suppliers: DB_KEYS.SUPPLIERS,
    teams: DB_KEYS.TEAMS,
    employees: DB_KEYS.EMPLOYEES,
    orders: DB_KEYS.ORDERS,
    materials: DB_KEYS.MATERIALS,
    stockItems: DB_KEYS.STOCK_ITEMS,
    cuttingTasks: DB_KEYS.CUTTING_TASKS,
    bundles: DB_KEYS.BUNDLES,
    workReports: DB_KEYS.WORK_REPORTS,
    qcRecords: DB_KEYS.QC_RECORDS,
    deliveries: DB_KEYS.DELIVERIES,
    outsourcing: DB_KEYS.OUTSOURCING,
    receivables: DB_KEYS.RECEIVABLES,
    payables: DB_KEYS.PAYABLES,
  };

  Object.entries(keys).forEach(([name, key]) => {
    const data = localStorage.getItem(key);
    if (data) {
      try {
        const parsed = JSON.parse(data);
        stats[name] = Array.isArray(parsed) ? parsed.length : 0;
      } catch {
        stats[name] = 0;
      }
    } else {
      stats[name] = 0;
    }
  });

  // 借料和预警
  const borrowData = localStorage.getItem('erp_borrow_records');
  stats.borrowRecords = borrowData ? JSON.parse(borrowData).length : 0;
  
  const alertData = localStorage.getItem('erp_alerts');
  stats.alerts = alertData ? JSON.parse(alertData).length : 0;

  return stats;
}
