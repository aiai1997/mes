'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Plus, Trash2, Save } from 'lucide-react';
import { useRouter } from 'next/navigation';
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
  type Product,
} from '@/types/order';
import { getCurrentUser } from '@/types/user';

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

// 默认包装要求
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

// 默认洗水要求
const defaultWashRequirement: WashRequirement = {
  washType: '普洗',
  colorEffect: '原色',
  shrinkageRate: '≤3%',
  ecoRequirement: [],
};

// 默认尾部要求
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

// 默认车工要求
const defaultSewingRequirement = {
  stitchDensity: '',
  threadType: '',
  threadColor: '',
  overlockType: '',
  bartackPosition: '',
  seamAllowance: '',
  specialProcess: [] as string[],
  otherNotes: '',
};

export default function OrderCreatePage() {
  const router = useRouter();
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

  // 车工要求
  const [sewingRequirement, setSewingRequirement] = useState(defaultSewingRequirement);

  useEffect(() => {
    setCustomers(getCustomers());
    setProducts(getProducts());
    setOrderNo(generateOrderNo());
  }, []);

  // 计算总数量和金额
  useEffect(() => {
    const total = colorSizeMatrix.reduce((sum, row) => sum + row.subtotal, 0);
    setTotalQuantity(total);
    setAmount(total * unitPrice);
  }, [colorSizeMatrix, unitPrice]);

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
      (newMatrix[index] as any)[field] = numValue;
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

  // 保存订单
  const handleSave = () => {
    if (!customerName || !styleNo || !productName || !deliveryDate) {
      alert('请填写必填项：客户、款号、产品名称、交货日期');
      return;
    }

    // 查找客户信息
    const customer = customers.find(c => c.name === customerName);
    
    const user = getCurrentUser();
    const newOrder: Order = {
      id: Date.now().toString(),
      orderNo,
      customerId: customer?.id || '',
      customerName,
      customerCode: customer?.code || '',
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
      packingRequirement,
      printEmbroidery,
      washRequirement,
      tailRequirement,
      sewingRequirement: sewingRequirement.stitchDensity || sewingRequirement.threadType ? sewingRequirement : undefined,
      status: '草稿',
      createdBy: user?.username || '系统',
      createdAt: new Date().toISOString(),
    };

    saveOrder(newOrder);
    router.push('/dashboard/orders');
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" />返回
            </Button>
            <div>
              <h1 className="text-2xl font-bold">新增订单</h1>
              <p className="text-muted-foreground text-sm">订单编号: {orderNo}</p>
            </div>
          </div>
          <Button onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />保存订单
          </Button>
        </div>

        <Tabs defaultValue="basic" className="space-y-4">
          <TabsList>
            <TabsTrigger value="basic">基本信息</TabsTrigger>
            <TabsTrigger value="colorSize">色码矩阵</TabsTrigger>
            <TabsTrigger value="price">价格信息</TabsTrigger>
            <TabsTrigger value="process">工艺要求</TabsTrigger>
            <TabsTrigger value="sewing">车工要求</TabsTrigger>
            <TabsTrigger value="packing">包装要求</TabsTrigger>
            <TabsTrigger value="tail">尾部要求</TabsTrigger>
          </TabsList>

          <TabsContent value="basic">
            <Card>
              <CardHeader>
                <CardTitle>基本信息</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>订单号</Label>
                    <Input value={orderNo} disabled className="mt-1" />
                  </div>
                  <div>
                    <Label>客户 <span className="text-red-500">*</span></Label>
                    <Select value={customerName} onValueChange={setCustomerName}>
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
                    <Label>客户款号</Label>
                    <Input value={customerModel} onChange={(e) => setCustomerModel(e.target.value)} className="mt-1" />
                  </div>
                  <div>
                    <Label>款号 <span className="text-red-500">*</span></Label>
                    <Select value={styleNo} onValueChange={handleSelectProduct}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="请选择款号" />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map(p => (
                          <SelectItem key={p.id} value={p.styleNo}>{p.styleNo}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>产品名称 <span className="text-red-500">*</span></Label>
                    <Input value={productName} onChange={(e) => setProductName(e.target.value)} className="mt-1" />
                  </div>
                  <div>
                    <Label>品牌</Label>
                    <Input value={brand} onChange={(e) => setBrand(e.target.value)} className="mt-1" />
                  </div>
                  <div>
                    <Label>季节</Label>
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
                    <Label>年份</Label>
                    <Input value={year} onChange={(e) => setYear(e.target.value)} className="mt-1" />
                  </div>
                  <div>
                    <Label>下单日期</Label>
                    <Input type="date" value={orderDate} onChange={(e) => setOrderDate(e.target.value)} className="mt-1" />
                  </div>
                  <div>
                    <Label>交货日期 <span className="text-red-500">*</span></Label>
                    <Input type="date" value={deliveryDate} onChange={(e) => setDeliveryDate(e.target.value)} className="mt-1" />
                  </div>
                  <div>
                    <Label>业务员</Label>
                    <Input value={salesman} onChange={(e) => setSalesman(e.target.value)} className="mt-1" />
                  </div>
                  <div className="col-span-3">
                    <Label>备注</Label>
                    <Textarea value={remark} onChange={(e) => setRemark(e.target.value)} className="mt-1" rows={3} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="colorSize">
            <Card>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  色码矩阵
                  <Button size="sm" variant="outline" onClick={handleAddColorRow}>
                    <Plus className="w-4 h-4 mr-1" />添加颜色
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>颜色</TableHead>
                      <TableHead className="text-center">S</TableHead>
                      <TableHead className="text-center">M</TableHead>
                      <TableHead className="text-center">L</TableHead>
                      <TableHead className="text-center">XL</TableHead>
                      <TableHead className="text-center">XXL</TableHead>
                      <TableHead className="text-center">XXXL</TableHead>
                      <TableHead className="text-center">小计</TableHead>
                      <TableHead className="w-16"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {colorSizeMatrix.map((row, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Input
                            value={row.colorName}
                            onChange={(e) => handleMatrixChange(index, 'colorName', e.target.value)}
                            placeholder="颜色名称"
                            className="w-32"
                          />
                        </TableCell>
                        {['S', 'M', 'L', 'XL', 'XXL', 'XXXL'].map((size) => (
                          <TableCell key={size} className="text-center">
                            <Input
                              type="number"
                              value={(row as any)[size] || ''}
                              onChange={(e) => handleMatrixChange(index, size as any, e.target.value)}
                              className="w-16 text-center mx-auto"
                              min={0}
                            />
                          </TableCell>
                        ))}
                        <TableCell className="text-center font-medium">{row.subtotal}</TableCell>
                        <TableCell>
                          {colorSizeMatrix.length > 1 && (
                            <Button size="sm" variant="ghost" onClick={() => handleRemoveColorRow(index)} className="text-red-600">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className="mt-4 text-right font-medium">
                  总数量: <span className="text-primary text-lg">{totalQuantity}</span> 件
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="price">
            <Card>
              <CardHeader>
                <CardTitle>价格信息</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <Label>单价（元）</Label>
                    <Input
                      type="number"
                      value={unitPrice || ''}
                      onChange={(e) => setUnitPrice(parseFloat(e.target.value) || 0)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>总金额</Label>
                    <Input value={`¥${amount.toLocaleString()}`} disabled className="mt-1" />
                  </div>
                  <div>
                    <Label>币种</Label>
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
                    <Label>贸易条款</Label>
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
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="process">
            <Card>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  印绣花要求
                  <Button size="sm" variant="outline" onClick={handleAddPrintEmbroidery}>
                    <Plus className="w-4 h-4 mr-1" />添加印绣花
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {printEmbroidery.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">暂无印绣花要求</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>位置</TableHead>
                        <TableHead>类型</TableHead>
                        <TableHead>色数</TableHead>
                        <TableHead>宽(cm)</TableHead>
                        <TableHead>高(cm)</TableHead>
                        <TableHead>潘通色号</TableHead>
                        <TableHead>对称</TableHead>
                        <TableHead className="w-16"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {printEmbroidery.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Select value={item.position} onValueChange={(v) => handlePrintEmbroideryChange(index, 'position', v)}>
                              <SelectTrigger className="w-24">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="前胸">前胸</SelectItem>
                                <SelectItem value="后背">后背</SelectItem>
                                <SelectItem value="左袖">左袖</SelectItem>
                                <SelectItem value="右袖">右袖</SelectItem>
                                <SelectItem value="下摆">下摆</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Select value={item.type} onValueChange={(v) => handlePrintEmbroideryChange(index, 'type', v)}>
                              <SelectTrigger className="w-20">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="印花">印花</SelectItem>
                                <SelectItem value="绣花">绣花</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              value={item.colorCount || ''}
                              onChange={(e) => handlePrintEmbroideryChange(index, 'colorCount', parseInt(e.target.value) || 0)}
                              className="w-16"
                              min={1}
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              value={item.width || ''}
                              onChange={(e) => handlePrintEmbroideryChange(index, 'width', parseFloat(e.target.value) || 0)}
                              className="w-16"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              value={item.height || ''}
                              onChange={(e) => handlePrintEmbroideryChange(index, 'height', parseFloat(e.target.value) || 0)}
                              className="w-16"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              value={item.pantoneColor}
                              onChange={(e) => handlePrintEmbroideryChange(index, 'pantoneColor', e.target.value)}
                              className="w-28"
                            />
                          </TableCell>
                          <TableCell>
                            <Checkbox
                              checked={item.isSymmetric}
                              onCheckedChange={(v) => handlePrintEmbroideryChange(index, 'isSymmetric', v)}
                            />
                          </TableCell>
                          <TableCell>
                            <Button size="sm" variant="ghost" onClick={() => handleRemovePrintEmbroidery(index)} className="text-red-600">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            <Card className="mt-4">
              <CardHeader>
                <CardTitle>洗水要求</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>洗水类型</Label>
                    <Select value={washRequirement.washType} onValueChange={(v) => setWashRequirement({ ...washRequirement, washType: v as '普洗' | '酵素' | '石洗' | '漂洗' })}>
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
                    <Label>颜色效果</Label>
                    <Select value={washRequirement.colorEffect} onValueChange={(v) => setWashRequirement({ ...washRequirement, colorEffect: v as '原色' | '做旧' | '复古' })}>
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
                    <Label>缩水率要求</Label>
                    <Select value={washRequirement.shrinkageRate} onValueChange={(v) => setWashRequirement({ ...washRequirement, shrinkageRate: v as '≤3%' | '≤5%' })}>
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
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="packing">
            <Card>
              <CardHeader>
                <CardTitle>包装要求</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>包装方式</Label>
                    <Select value={packingRequirement.packingMethod} onValueChange={(v) => setPackingRequirement({ ...packingRequirement, packingMethod: v as '独立包装' | '折叠' })}>
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
                    <Label>PE袋尺寸</Label>
                    <Input
                      value={packingRequirement.peBagSize}
                      onChange={(e) => setPackingRequirement({ ...packingRequirement, peBagSize: e.target.value })}
                      className="mt-1"
                      placeholder="如: 30x40cm"
                    />
                  </div>
                  <div>
                    <Label>箱唛语言</Label>
                    <Select value={packingRequirement.cartonLabelType} onValueChange={(v) => setPackingRequirement({ ...packingRequirement, cartonLabelType: v as '中文' | '英文' | 'LOGO' })}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="中文">中文</SelectItem>
                        <SelectItem value="英文">英文</SelectItem>
                        <SelectItem value="LOGO">LOGO</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>纸箱尺寸</Label>
                    <Input
                      value={packingRequirement.cartonSize}
                      onChange={(e) => setPackingRequirement({ ...packingRequirement, cartonSize: e.target.value })}
                      className="mt-1"
                      placeholder="如: 60x40x30cm"
                    />
                  </div>
                  <div>
                    <Label>每箱件数</Label>
                    <Input
                      type="number"
                      value={packingRequirement.piecesPerCarton || ''}
                      onChange={(e) => setPackingRequirement({ ...packingRequirement, piecesPerCarton: parseInt(e.target.value) || 0 })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>配比</Label>
                    <Input
                      value={packingRequirement.sizeRatio}
                      onChange={(e) => setPackingRequirement({ ...packingRequirement, sizeRatio: e.target.value })}
                      className="mt-1"
                      placeholder="如: 1:2:2:1"
                    />
                  </div>
                  <div className="col-span-3 flex gap-6 pt-2">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={packingRequirement.moistureProof}
                        onCheckedChange={(v) => setPackingRequirement({ ...packingRequirement, moistureProof: v as boolean })}
                      />
                      <Label>防潮袋</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={packingRequirement.desiccant}
                        onCheckedChange={(v) => setPackingRequirement({ ...packingRequirement, desiccant: v as boolean })}
                      />
                      <Label>干燥剂</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={packingRequirement.tissuePaper}
                        onCheckedChange={(v) => setPackingRequirement({ ...packingRequirement, tissuePaper: v as boolean })}
                      />
                      <Label>拷贝纸</Label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sewing">
            <Card>
              <CardHeader>
                <CardTitle>车工要求</CardTitle>
                <CardDescription>缝制工艺要求，用于指导车间生产</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>线迹密度</Label>
                    <Select value={sewingRequirement.stitchDensity} onValueChange={(v) => setSewingRequirement({ ...sewingRequirement, stitchDensity: v })}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="请选择" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="8-10针/3cm">8-10针/3cm</SelectItem>
                        <SelectItem value="10-12针/3cm">10-12针/3cm</SelectItem>
                        <SelectItem value="12-14针/3cm">12-14针/3cm</SelectItem>
                        <SelectItem value="14-16针/3cm">14-16针/3cm</SelectItem>
                        <SelectItem value="16-18针/3cm">16-18针/3cm</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>线型</Label>
                    <Select value={sewingRequirement.threadType} onValueChange={(v) => setSewingRequirement({ ...sewingRequirement, threadType: v })}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="请选择" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="涤纶线402">涤纶线402</SelectItem>
                        <SelectItem value="涤纶线203">涤纶线203</SelectItem>
                        <SelectItem value="尼龙线">尼龙线</SelectItem>
                        <SelectItem value="棉线">棉线</SelectItem>
                        <SelectItem value="真丝线">真丝线</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>缝纫线颜色</Label>
                    <Input
                      value={sewingRequirement.threadColor}
                      onChange={(e) => setSewingRequirement({ ...sewingRequirement, threadColor: e.target.value })}
                      className="mt-1"
                      placeholder="如: 配色、黑色"
                    />
                  </div>
                  <div>
                    <Label>拷克要求</Label>
                    <Select value={sewingRequirement.overlockType} onValueChange={(v) => setSewingRequirement({ ...sewingRequirement, overlockType: v })}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="请选择" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="三线拷克">三线拷克</SelectItem>
                        <SelectItem value="四线拷克">四线拷克</SelectItem>
                        <SelectItem value="五线拷克">五线拷克</SelectItem>
                        <SelectItem value="密拷">密拷</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>打枣位置</Label>
                    <Input
                      value={sewingRequirement.bartackPosition}
                      onChange={(e) => setSewingRequirement({ ...sewingRequirement, bartackPosition: e.target.value })}
                      className="mt-1"
                      placeholder="如: 袖口、袋口"
                    />
                  </div>
                  <div>
                    <Label>止口要求</Label>
                    <Select value={sewingRequirement.seamAllowance} onValueChange={(v) => setSewingRequirement({ ...sewingRequirement, seamAllowance: v })}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="请选择" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0.5cm">0.5cm</SelectItem>
                        <SelectItem value="0.8cm">0.8cm</SelectItem>
                        <SelectItem value="1cm">1cm</SelectItem>
                        <SelectItem value="1.2cm">1.2cm</SelectItem>
                        <SelectItem value="1.5cm">1.5cm</SelectItem>
                        <SelectItem value="2cm">2cm</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-3">
                    <Label>特殊工艺</Label>
                    <div className="grid grid-cols-4 gap-2 mt-2">
                      {['双针压线', '链条车缝', '圆领包边', '隐形拉链', '门襟压线', '松紧腰', '手工卷边', '法式缝', '加固肩缝', '内胆包边'].map((process) => (
                        <div key={process} className="flex items-center gap-2">
                          <Checkbox
                            checked={sewingRequirement.specialProcess.includes(process)}
                            onCheckedChange={(v) => {
                              if (v) {
                                setSewingRequirement({ ...sewingRequirement, specialProcess: [...sewingRequirement.specialProcess, process] });
                              } else {
                                setSewingRequirement({ ...sewingRequirement, specialProcess: sewingRequirement.specialProcess.filter(p => p !== process) });
                              }
                            }}
                          />
                          <Label className="font-normal">{process}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="col-span-3">
                    <Label>其他说明</Label>
                    <Input
                      value={sewingRequirement.otherNotes}
                      onChange={(e) => setSewingRequirement({ ...sewingRequirement, otherNotes: e.target.value })}
                      className="mt-1"
                      placeholder="其他需要说明的缝制要求"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tail">
            <Card>
              <CardHeader>
                <CardTitle>尾部要求</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={tailRequirement.trimThread}
                      onCheckedChange={(v) => setTailRequirement({ ...tailRequirement, trimThread: v as boolean })}
                    />
                    <Label>剪线头</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={tailRequirement.ironing}
                      onCheckedChange={(v) => setTailRequirement({ ...tailRequirement, ironing: v as boolean })}
                    />
                    <Label>整烫</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={tailRequirement.inspection}
                      onCheckedChange={(v) => setTailRequirement({ ...tailRequirement, inspection: v as boolean })}
                    />
                    <Label>质检</Label>
                  </div>
                  <div>
                    <Label>备用扣数量</Label>
                    <Input
                      type="number"
                      value={tailRequirement.spareButtons || ''}
                      onChange={(e) => setTailRequirement({ ...tailRequirement, spareButtons: parseInt(e.target.value) || 0 })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>备用线</Label>
                    <Input
                      value={tailRequirement.spareThread}
                      onChange={(e) => setTailRequirement({ ...tailRequirement, spareThread: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>吊牌</Label>
                    <Input
                      value={tailRequirement.hangTag}
                      onChange={(e) => setTailRequirement({ ...tailRequirement, hangTag: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>吊绳</Label>
                    <Input
                      value={tailRequirement.hangRope}
                      onChange={(e) => setTailRequirement({ ...tailRequirement, hangRope: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>折叠方式</Label>
                    <Select value={tailRequirement.foldMethod || ''} onValueChange={(v) => setTailRequirement({ ...tailRequirement, foldMethod: v })}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="请选择" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="平铺折叠">平铺折叠</SelectItem>
                        <SelectItem value="对折">对折</SelectItem>
                        <SelectItem value="三折">三折</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
