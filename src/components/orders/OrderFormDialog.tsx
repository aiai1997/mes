'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, Trash2 } from 'lucide-react';
import { 
  type Order, 
  type ColorSizeMatrix,
  type PrintEmbroideryRequirement,
  type PackingRequirement,
  type WashRequirement,
  type TailRequirement,
  generateOrderNo, 
  saveOrder, 
  getCustomers, 
  getProducts,
  type Customer,
  type Product
} from '@/types/order';
import { getCurrentUser } from '@/types/user';

interface OrderFormDialogProps {
  order: Order | null;
  onClose: (needRefresh: boolean) => void;
}

// 初始化空色码矩阵
const emptyColorMatrix: ColorSizeMatrix = {
  colorName: '',
  S: 0,
  M: 0,
  L: 0,
  XL: 0,
  XXL: 0,
  XXXL: 0,
  subtotal: 0,
};

// 初始化空印绣花要求
const emptyPrintEmbroidery: PrintEmbroideryRequirement = {
  position: '前胸',
  type: '印花',
  colorCount: 1,
  width: 0,
  height: 0,
  pantoneColor: '',
  isSymmetric: false,
  fastness: '',
  washRequirement: '',
};

// 初始化空包装要求
const defaultPackingRequirement: PackingRequirement = {
  packingMethod: '独立包装',
  peBagSize: '',
  cartonSize: '',
  piecesPerCarton: 0,
  sizeRatio: '',
  cartonLabelType: '中文',
  sticker: '',
  barcode: '',
  moistureProof: false,
  desiccant: false,
  tissuePaper: false,
};

// 初始化空洗水要求
const defaultWashRequirement: WashRequirement = {
  washType: '普洗',
  colorEffect: '原色',
  shrinkageRate: '≤3%',
  ecoRequirement: [],
};

// 初始化空尾部要求
const defaultTailRequirement: TailRequirement = {
  trimThread: true,
  ironing: true,
  inspection: true,
  spareButtons: 0,
  spareThread: '',
  hangTag: '',
  hangRope: '',
  foldMethod: '',
};

export default function OrderFormDialog({ order, onClose }: OrderFormDialogProps) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  
  // 订单基本信息
  const [orderNo, setOrderNo] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerModel, setCustomerModel] = useState('');
  const [styleNo, setStyleNo] = useState('');
  const [productName, setProductName] = useState('');
  const [brand, setBrand] = useState('');
  const [season, setSeason] = useState<'春夏' | '秋冬'>('春夏');
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [deliveryDate, setDeliveryDate] = useState('');
  const [orderDate, setOrderDate] = useState(new Date().toISOString().split('T')[0]);
  const [salesman, setSalesman] = useState('');
  const [remark, setRemark] = useState('');
  
  // 色码矩阵
  const [colorSizeMatrix, setColorSizeMatrix] = useState<ColorSizeMatrix[]>([{ ...emptyColorMatrix }]);
  const [totalQuantity, setTotalQuantity] = useState(0);
  
  // 价格信息
  const [unitPrice, setUnitPrice] = useState(0);
  const [amount, setAmount] = useState(0);
  const [currency, setCurrency] = useState<'人民币' | '美元'>('人民币');
  const [tradeTerms, setTradeTerms] = useState<'FOB' | 'EXW' | 'CIF' | 'DDP'>('FOB');
  
  // 包装要求
  const [packingRequirement, setPackingRequirement] = useState<PackingRequirement>(defaultPackingRequirement);
  
  // 印绣花要求
  const [printEmbroidery, setPrintEmbroidery] = useState<PrintEmbroideryRequirement[]>([]);
  
  // 洗水要求
  const [washRequirement, setWashRequirement] = useState<WashRequirement>(defaultWashRequirement);
  
  // 尾部要求
  const [tailRequirement, setTailRequirement] = useState<TailRequirement>(defaultTailRequirement);

  // 加载数据
  useEffect(() => {
    setCustomers(getCustomers());
    setProducts(getProducts());
    
    if (order) {
      // 编辑模式：填充订单数据
      setOrderNo(order.orderNo);
      setCustomerName(order.customerName);
      setCustomerModel(order.customerModel);
      setStyleNo(order.styleNo);
      setProductName(order.productName);
      setBrand(order.brand);
      setSeason(order.season);
      setYear(order.year);
      setDeliveryDate(order.deliveryDate);
      setOrderDate(order.orderDate);
      setSalesman(order.salesman);
      setRemark(order.remark);
      setColorSizeMatrix(order.colorSizeMatrix);
      setTotalQuantity(order.totalQuantity);
      setUnitPrice(order.unitPrice);
      setAmount(order.amount);
      setCurrency(order.currency);
      setTradeTerms(order.tradeTerms);
      setPackingRequirement(order.packingRequirement);
      setPrintEmbroidery(order.printEmbroidery);
      setWashRequirement(order.washRequirement);
      setTailRequirement(order.tailRequirement);
    } else {
      // 新增模式：生成订单号
      setOrderNo(generateOrderNo());
    }
  }, [order]);

  // 计算总数量和金额
  useEffect(() => {
    const total = colorSizeMatrix.reduce((sum, row) => sum + row.subtotal, 0);
    setTotalQuantity(total);
    setAmount(total * unitPrice);
  }, [colorSizeMatrix, unitPrice]);

  // 选择客户
  const handleSelectCustomer = (name: string) => {
    setCustomerName(name);
  };

  // 选择产品（款号）
  const handleSelectProduct = (style: string) => {
    setStyleNo(style);
    const product = products.find(p => p.styleNo === style);
    if (product) {
      setProductName(product.productName);
      setBrand(product.brand);
      
      // 根据产品的颜色自动创建色码矩阵行
      const newMatrix = product.colors.map(color => ({
        ...emptyColorMatrix,
        colorName: color,
      }));
      if (newMatrix.length > 0) {
        setColorSizeMatrix(newMatrix);
      }
    }
  };

  // 更新色码矩阵
  const handleMatrixChange = (index: number, field: keyof ColorSizeMatrix, value: string | number) => {
    const newMatrix = [...colorSizeMatrix];
    if (field === 'colorName') {
      newMatrix[index][field] = value as string;
    } else {
      const numValue = parseInt(value as string) || 0;
      newMatrix[index][field] = numValue;
      // 计算小计
      newMatrix[index].subtotal = 
        newMatrix[index].S + 
        newMatrix[index].M + 
        newMatrix[index].L + 
        newMatrix[index].XL + 
        newMatrix[index].XXL + 
        newMatrix[index].XXXL;
    }
    setColorSizeMatrix(newMatrix);
  };

  // 添加颜色行
  const handleAddColorRow = () => {
    setColorSizeMatrix([...colorSizeMatrix, { ...emptyColorMatrix }]);
  };

  // 删除颜色行
  const handleRemoveColorRow = (index: number) => {
    if (colorSizeMatrix.length > 1) {
      const newMatrix = colorSizeMatrix.filter((_, i) => i !== index);
      setColorSizeMatrix(newMatrix);
    }
  };

  // 添加印绣花要求
  const handleAddPrintEmbroidery = () => {
    setPrintEmbroidery([...printEmbroidery, { ...emptyPrintEmbroidery }]);
  };

  // 删除印绣花要求
  const handleRemovePrintEmbroidery = (index: number) => {
    const newList = printEmbroidery.filter((_, i) => i !== index);
    setPrintEmbroidery(newList);
  };

  // 更新印绣花要求
  const handlePrintEmbroideryChange = (index: number, field: keyof PrintEmbroideryRequirement, value: any) => {
    const newList = [...printEmbroidery];
    (newList[index] as any)[field] = value;
    setPrintEmbroidery(newList);
  };

  // 更新洗水要求
  const handleWashRequirementChange = (field: keyof WashRequirement, value: any) => {
    setWashRequirement({ ...washRequirement, [field]: value });
  };

  // 更新尾部要求
  const handleTailRequirementChange = (field: keyof TailRequirement, value: any) => {
    setTailRequirement({ ...tailRequirement, [field]: value });
  };

  // 更新包装要求
  const handlePackingRequirementChange = (field: keyof PackingRequirement, value: any) => {
    setPackingRequirement({ ...packingRequirement, [field]: value });
  };

  // 保存订单
  const handleSave = () => {
    // 验证必填字段
    if (!customerName) {
      alert('请选择客户');
      return;
    }
    if (!styleNo) {
      alert('请选择款号');
      return;
    }
    if (!deliveryDate) {
      alert('请选择交货日期');
      return;
    }
    if (totalQuantity === 0) {
      alert('请填写订单数量');
      return;
    }

    const currentUser = getCurrentUser();
    
    // 查找客户信息
    const customer = customers.find(c => c.name === customerName);
    
    const newOrder: Order = {
      id: order?.id || Date.now().toString(),
      orderNo,
      customerId: customer?.id || order?.customerId || '',
      customerName,
      customerCode: customer?.code || order?.customerCode || '',
      customerModel,
      productCode: styleNo,
      styleNo,
      productName,
      brand,
      season,
      year,
      deliveryDate,
      orderDate,
      salesman,
      remark,
      colorSizeMatrix,
      totalQuantity,
      unitPrice,
      amount,
      currency,
      tradeTerms,
      status: order?.status || '草稿',
      packingRequirement,
      printEmbroidery,
      washRequirement,
      tailRequirement,
      createdBy: order?.createdBy || currentUser?.username || 'system',
      createdAt: order?.createdAt || new Date().toLocaleString('zh-CN'),
      auditedBy: order?.auditedBy,
      auditedAt: order?.auditedAt,
    };

    saveOrder(newOrder);
    onClose(true);
  };

  return (
    <Dialog open={true} onOpenChange={() => onClose(false)}>
      <DialogContent className="max-w-6xl max-h-[90vh] p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="text-xl">
            {order ? '编辑订单' : '新增订单'}
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="flex-1 h-[calc(90vh-120px)]">
          <div className="p-6">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid grid-cols-6 mb-6">
                <TabsTrigger value="basic">基本信息</TabsTrigger>
                <TabsTrigger value="colorSize">色码矩阵</TabsTrigger>
                <TabsTrigger value="price">价格信息</TabsTrigger>
                <TabsTrigger value="packing">包装要求</TabsTrigger>
                <TabsTrigger value="print">印绣花</TabsTrigger>
                <TabsTrigger value="wash">洗水/尾部</TabsTrigger>
              </TabsList>

              {/* 基本信息 */}
              <TabsContent value="basic" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-sm font-medium">订单号</Label>
                    <Input value={orderNo} disabled className="mt-1 bg-gray-50" />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">客户名称 *</Label>
                    <Select value={customerName} onValueChange={handleSelectCustomer}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="请选择客户" />
                      </SelectTrigger>
                      <SelectContent>
                        {customers.map(c => (
                          <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">客户型号</Label>
                    <Input 
                      value={customerModel} 
                      onChange={(e) => setCustomerModel(e.target.value)}
                      placeholder="客户内部款号"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">款号 *</Label>
                    <Select value={styleNo} onValueChange={handleSelectProduct}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="请选择款号" />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map(p => (
                          <SelectItem key={p.id} value={p.styleNo}>{p.styleNo} - {p.productName}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">产品名称</Label>
                    <Input value={productName} disabled className="mt-1 bg-gray-50" />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">品牌</Label>
                    <Input value={brand} disabled className="mt-1 bg-gray-50" />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">季节</Label>
                    <Select value={season} onValueChange={(v) => setSeason(v as '春夏' | '秋冬')}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="春夏">春夏</SelectItem>
                        <SelectItem value="秋冬">秋冬</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">年份</Label>
                    <Input value={year} onChange={(e) => setYear(e.target.value)} className="mt-1" />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">交货日期 *</Label>
                    <Input 
                      type="date" 
                      value={deliveryDate} 
                      onChange={(e) => setDeliveryDate(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">订单日期</Label>
                    <Input type="date" value={orderDate} onChange={(e) => setOrderDate(e.target.value)} className="mt-1" />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">业务员</Label>
                    <Input value={salesman} onChange={(e) => setSalesman(e.target.value)} className="mt-1" />
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">备注</Label>
                  <textarea
                    value={remark}
                    onChange={(e) => setRemark(e.target.value)}
                    placeholder="客户要求、工艺、洗水、印绣花、尾部、包装要求等"
                    className="w-full mt-1 p-2 border rounded-md min-h-[80px]"
                  />
                </div>
              </TabsContent>

              {/* 色码矩阵 */}
              <TabsContent value="colorSize" className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label className="text-lg font-medium">颜色 × 尺码 矩阵</Label>
                  <Button size="sm" onClick={handleAddColorRow}>
                    <Plus className="w-4 h-4 mr-1" />
                    添加颜色
                  </Button>
                </div>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-32">颜色名称</TableHead>
                        <TableHead className="w-20">S</TableHead>
                        <TableHead className="w-20">M</TableHead>
                        <TableHead className="w-20">L</TableHead>
                        <TableHead className="w-20">XL</TableHead>
                        <TableHead className="w-20">XXL</TableHead>
                        <TableHead className="w-20">XXXL</TableHead>
                        <TableHead className="w-24">小计</TableHead>
                        <TableHead className="w-16">操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {colorSizeMatrix.map((row, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Input
                              value={row.colorName}
                              onChange={(e) => handleMatrixChange(index, 'colorName', e.target.value)}
                              placeholder="颜色"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              value={row.S || ''}
                              onChange={(e) => handleMatrixChange(index, 'S', e.target.value)}
                              className="text-center"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              value={row.M || ''}
                              onChange={(e) => handleMatrixChange(index, 'M', e.target.value)}
                              className="text-center"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              value={row.L || ''}
                              onChange={(e) => handleMatrixChange(index, 'L', e.target.value)}
                              className="text-center"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              value={row.XL || ''}
                              onChange={(e) => handleMatrixChange(index, 'XL', e.target.value)}
                              className="text-center"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              value={row.XXL || ''}
                              onChange={(e) => handleMatrixChange(index, 'XXL', e.target.value)}
                              className="text-center"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              value={row.XXXL || ''}
                              onChange={(e) => handleMatrixChange(index, 'XXXL', e.target.value)}
                              className="text-center"
                            />
                          </TableCell>
                          <TableCell className="font-medium text-center">{row.subtotal}</TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleRemoveColorRow(index)}
                              disabled={colorSizeMatrix.length <= 1}
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <div className="text-right text-lg font-medium">
                  总数量：<span className="text-blue-600">{totalQuantity}</span> 件
                </div>
              </TabsContent>

              {/* 价格信息 */}
              <TabsContent value="price" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Label className="text-sm font-medium">单价</Label>
                    <Input
                      type="number"
                      value={unitPrice || ''}
                      onChange={(e) => setUnitPrice(parseFloat(e.target.value) || 0)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">金额</Label>
                    <Input value={amount.toFixed(2)} disabled className="mt-1 bg-gray-50" />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">币种</Label>
                    <Select value={currency} onValueChange={(v) => setCurrency(v as '人民币' | '美元')}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="人民币">人民币</SelectItem>
                        <SelectItem value="美元">美元</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">贸易条款</Label>
                    <Select value={tradeTerms} onValueChange={(v) => setTradeTerms(v as any)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="FOB">FOB</SelectItem>
                        <SelectItem value="EXW">EXW</SelectItem>
                        <SelectItem value="CIF">CIF</SelectItem>
                        <SelectItem value="DDP">DDP</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>

              {/* 包装要求 */}
              <TabsContent value="packing" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-sm font-medium">装箱方式</Label>
                    <Select 
                      value={packingRequirement.packingMethod} 
                      onValueChange={(v) => handlePackingRequirementChange('packingMethod', v)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="独立包装">独立包装</SelectItem>
                        <SelectItem value="折叠">折叠</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">PE袋尺寸</Label>
                    <Input
                      value={packingRequirement.peBagSize}
                      onChange={(e) => handlePackingRequirementChange('peBagSize', e.target.value)}
                      placeholder="自动按尺码匹配"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">纸箱尺寸</Label>
                    <Input
                      value={packingRequirement.cartonSize}
                      onChange={(e) => handlePackingRequirementChange('cartonSize', e.target.value)}
                      placeholder="如：60×40×30cm"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">每箱件数</Label>
                    <Input
                      type="number"
                      value={packingRequirement.piecesPerCarton || ''}
                      onChange={(e) => handlePackingRequirementChange('piecesPerCarton', parseInt(e.target.value) || 0)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">配码比例</Label>
                    <Input
                      value={packingRequirement.sizeRatio}
                      onChange={(e) => handlePackingRequirementChange('sizeRatio', e.target.value)}
                      placeholder="如：1:2:2:1"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">箱唛要求</Label>
                    <Select 
                      value={packingRequirement.cartonLabelType} 
                      onValueChange={(v) => handlePackingRequirementChange('cartonLabelType', v)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="英文">英文</SelectItem>
                        <SelectItem value="中文">中文</SelectItem>
                        <SelectItem value="LOGO">LOGO</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">贴纸/不干胶要求</Label>
                    <Input
                      value={packingRequirement.sticker}
                      onChange={(e) => handlePackingRequirementChange('sticker', e.target.value)}
                      placeholder="如：需贴价格标签"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">条形码要求</Label>
                    <Input
                      value={packingRequirement.barcode}
                      onChange={(e) => handlePackingRequirementChange('barcode', e.target.value)}
                      placeholder="如：需贴条形码"
                      className="mt-1"
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={packingRequirement.moistureProof}
                        onCheckedChange={(checked) => handlePackingRequirementChange('moistureProof', checked)}
                      />
                      <Label>防潮</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={packingRequirement.desiccant}
                        onCheckedChange={(checked) => handlePackingRequirementChange('desiccant', checked)}
                      />
                      <Label>干燥剂</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={packingRequirement.tissuePaper}
                        onCheckedChange={(checked) => handlePackingRequirementChange('tissuePaper', checked)}
                      />
                      <Label>拷贝纸</Label>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* 印绣花要求 */}
              <TabsContent value="print" className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label className="text-lg font-medium">印绣花要求</Label>
                  <Button size="sm" onClick={handleAddPrintEmbroidery}>
                    <Plus className="w-4 h-4 mr-1" />
                    添加
                  </Button>
                </div>
                {printEmbroidery.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 border rounded">
                    暂无印绣花要求，点击"添加"按钮新增
                  </div>
                ) : (
                  <div className="space-y-4">
                    {printEmbroidery.map((item, index) => (
                      <div key={index} className="border rounded-lg p-4 relative">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="absolute top-2 right-2"
                          onClick={() => handleRemovePrintEmbroidery(index)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div>
                            <Label className="text-sm">位置</Label>
                            <Select 
                              value={item.position} 
                              onValueChange={(v) => handlePrintEmbroideryChange(index, 'position', v)}
                            >
                              <SelectTrigger className="mt-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="前胸">前胸</SelectItem>
                                <SelectItem value="后背">后背</SelectItem>
                                <SelectItem value="袖口">袖口</SelectItem>
                                <SelectItem value="领口">领口</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="text-sm">工艺</Label>
                            <Select 
                              value={item.type} 
                              onValueChange={(v) => handlePrintEmbroideryChange(index, 'type', v)}
                            >
                              <SelectTrigger className="mt-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="印花">印花</SelectItem>
                                <SelectItem value="绣花">绣花</SelectItem>
                                <SelectItem value="烫画">烫画</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="text-sm">颜色数</Label>
                            <Input
                              type="number"
                              value={item.colorCount || ''}
                              onChange={(e) => handlePrintEmbroideryChange(index, 'colorCount', parseInt(e.target.value) || 0)}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label className="text-sm">宽度(cm)</Label>
                            <Input
                              type="number"
                              value={item.width || ''}
                              onChange={(e) => handlePrintEmbroideryChange(index, 'width', parseFloat(e.target.value) || 0)}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label className="text-sm">高度(cm)</Label>
                            <Input
                              type="number"
                              value={item.height || ''}
                              onChange={(e) => handlePrintEmbroideryChange(index, 'height', parseFloat(e.target.value) || 0)}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label className="text-sm">潘通色号</Label>
                            <Input
                              value={item.pantoneColor}
                              onChange={(e) => handlePrintEmbroideryChange(index, 'pantoneColor', e.target.value)}
                              placeholder="PMS 186C"
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label className="text-sm">牢度</Label>
                            <Input
                              value={item.fastness}
                              onChange={(e) => handlePrintEmbroideryChange(index, 'fastness', e.target.value)}
                              placeholder="3级"
                              className="mt-1"
                            />
                          </div>
                          <div className="flex items-center gap-2 pt-6">
                            <Checkbox
                              checked={item.isSymmetric}
                              onCheckedChange={(checked) => handlePrintEmbroideryChange(index, 'isSymmetric', checked)}
                            />
                            <Label>左右对称</Label>
                          </div>
                        </div>
                        <div className="mt-2">
                          <Label className="text-sm">水洗要求</Label>
                          <Input
                            value={item.washRequirement}
                            onChange={(e) => handlePrintEmbroideryChange(index, 'washRequirement', e.target.value)}
                            placeholder="60℃水洗不褪色"
                            className="mt-1"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* 洗水/尾部要求 */}
              <TabsContent value="wash" className="space-y-6">
                {/* 洗水要求 */}
                <div>
                  <Label className="text-lg font-medium mb-4 block">洗水要求</Label>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <Label className="text-sm">洗水类型</Label>
                      <Select 
                        value={washRequirement.washType} 
                        onValueChange={(v) => handleWashRequirementChange('washType', v)}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="普洗">普洗</SelectItem>
                          <SelectItem value="酵素">酵素</SelectItem>
                          <SelectItem value="石洗">石洗</SelectItem>
                          <SelectItem value="漂洗">漂洗</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-sm">颜色效果</Label>
                      <Select 
                        value={washRequirement.colorEffect} 
                        onValueChange={(v) => handleWashRequirementChange('colorEffect', v)}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="原色">原色</SelectItem>
                          <SelectItem value="做旧">做旧</SelectItem>
                          <SelectItem value="复古">复古</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-sm">缩率要求</Label>
                      <Select 
                        value={washRequirement.shrinkageRate} 
                        onValueChange={(v) => handleWashRequirementChange('shrinkageRate', v)}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="≤3%">≤3%</SelectItem>
                          <SelectItem value="≤5%">≤5%</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="mt-4">
                    <Label className="text-sm">环保要求</Label>
                    <div className="flex gap-4 mt-2">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          checked={washRequirement.ecoRequirement.includes('无甲醛')}
                          onCheckedChange={(checked) => {
                            const newEco = checked 
                              ? [...washRequirement.ecoRequirement, '无甲醛']
                              : washRequirement.ecoRequirement.filter(e => e !== '无甲醛');
                            handleWashRequirementChange('ecoRequirement', newEco);
                          }}
                        />
                        <Label>无甲醛</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox
                          checked={washRequirement.ecoRequirement.includes('无偶氮')}
                          onCheckedChange={(checked) => {
                            const newEco = checked 
                              ? [...washRequirement.ecoRequirement, '无偶氮']
                              : washRequirement.ecoRequirement.filter(e => e !== '无偶氮');
                            handleWashRequirementChange('ecoRequirement', newEco);
                          }}
                        />
                        <Label>无偶氮</Label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 尾部要求 */}
                <div>
                  <Label className="text-lg font-medium mb-4 block">尾部要求</Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={tailRequirement.trimThread}
                        onCheckedChange={(checked) => handleTailRequirementChange('trimThread', checked)}
                      />
                      <Label>剪线</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={tailRequirement.ironing}
                        onCheckedChange={(checked) => handleTailRequirementChange('ironing', checked)}
                      />
                      <Label>整烫</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={tailRequirement.inspection}
                        onCheckedChange={(checked) => handleTailRequirementChange('inspection', checked)}
                      />
                      <Label>查衫</Label>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                    <div>
                      <Label className="text-sm">备用扣数量</Label>
                      <Input
                        type="number"
                        value={tailRequirement.spareButtons || ''}
                        onChange={(e) => handleTailRequirementChange('spareButtons', parseInt(e.target.value) || 0)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-sm">备用线</Label>
                      <Input
                        value={tailRequirement.spareThread}
                        onChange={(e) => handleTailRequirementChange('spareThread', e.target.value)}
                        placeholder="10米"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-sm">挂牌</Label>
                      <Input
                        value={tailRequirement.hangTag}
                        onChange={(e) => handleTailRequirementChange('hangTag', e.target.value)}
                        placeholder="需挂吊牌"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-sm">挂绳</Label>
                      <Input
                        value={tailRequirement.hangRope}
                        onChange={(e) => handleTailRequirementChange('hangRope', e.target.value)}
                        placeholder="需挂绳"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-sm">折叠方式</Label>
                      <Input
                        value={tailRequirement.foldMethod}
                        onChange={(e) => handleTailRequirementChange('foldMethod', e.target.value)}
                        placeholder="三折"
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </ScrollArea>

        {/* 底部按钮 */}
        <div className="flex justify-end gap-2 px-6 py-4 border-t bg-gray-50">
          <Button variant="outline" onClick={() => onClose(false)}>
            取消
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleSave}>
            保存
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
