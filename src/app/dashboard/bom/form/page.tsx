'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Save, Send, Plus, Trash2, Calculator, AlertCircle } from 'lucide-react';
import { 
  getOrdersForBOM,
  getBOMs,
  saveBOM,
  generateBOMNo,
  type BOM,
  type FabricMaterial,
  type AccessoryMaterial,
  type PrintMaterial,
  type WashMaterial,
  type TailMaterial,
  type PackingMaterial,
  defaultMaterials,
} from '@/types/bom';
import { type Order, getOrders } from '@/types/order';
import { getCurrentUser, type CurrentUser } from '@/types/user';

const emptyFabric: FabricMaterial = {
  id: '',
  materialCode: '',
  materialName: '',
  specification: '',
  unit: '米',
  usagePart: '',
  materialColor: '',
  applicableSizes: [],
  standardConsumption: 0,
  lossRate: 3,
  actualConsumption: 0,
  totalUsage: 0,
  unitPrice: 0,
  totalCost: 0,
  supplier: '',
  processRequirement: '',
  inventory: 0,
  category: '面料',
  fabricWidth: 150,
  fabricWeight: 0,
  fabricComposition: '',
  markerRatio: '',
};

export default function BOMFormPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bomId = searchParams.get('id');
  const orderNoParam = searchParams.get('orderNo');
  
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  
  // 订单选择
  const [availableOrders, setAvailableOrders] = useState<Order[]>([]);
  const [selectedOrderNo, setSelectedOrderNo] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  
  // BOM基本信息
  const [bomNo, setBomNo] = useState('');
  const [bomVersion, setBomVersion] = useState('01');
  const [remark, setRemark] = useState('');
  
  // 物料明细
  const [fabrics, setFabrics] = useState<FabricMaterial[]>([]);
  const [accessories, setAccessories] = useState<AccessoryMaterial[]>([]);
  const [prints, setPrints] = useState<PrintMaterial[]>([]);
  const [washes, setWashes] = useState<WashMaterial[]>([]);
  const [tails, setTails] = useState<TailMaterial[]>([]);
  const [packings, setPackings] = useState<PackingMaterial[]>([]);
  
  // 成本汇总
  const [fabricTotalCost, setFabricTotalCost] = useState(0);
  const [accessoryTotalCost, setAccessoryTotalCost] = useState(0);
  const [printTotalCost, setPrintTotalCost] = useState(0);
  const [washTotalCost, setWashTotalCost] = useState(0);
  const [tailTotalCost, setTailTotalCost] = useState(0);
  const [packingTotalCost, setPackingTotalCost] = useState(0);

  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);
    
    const orders = getOrdersForBOM();
    setAvailableOrders(orders);
    
    // 如果有传入订单号，自动选中
    if (orderNoParam) {
      setSelectedOrderNo(orderNoParam);
      handleOrderChange(orderNoParam);
    }
    
    // 如果是编辑模式，加载BOM数据
    if (bomId) {
      loadBOM(bomId);
    } else {
      setBomNo(generateBOMNo(selectedOrderNo || 'ORD' + Date.now().toString().slice(0, 10)));
    }
  }, [bomId, orderNoParam]);

  const loadBOM = (id: string) => {
    const boms = getBOMs();
    const bom = boms.find(b => b.id === id);
    if (bom) {
      setSelectedOrderNo(bom.orderNo);
      const order = getOrders().find(o => o.orderNo === bom.orderNo);
      if (order) setSelectedOrder(order);
      setBomNo(bom.bomNo);
      setBomVersion(bom.bomVersion);
      setFabrics(bom.fabrics);
      setAccessories(bom.accessories);
      setPrints(bom.prints);
      setWashes(bom.washes);
      setTails(bom.tails);
      setPackings(bom.packings);
    }
  };

  const handleOrderChange = (orderNo: string) => {
    setSelectedOrderNo(orderNo);
    const order = getOrders().find(o => o.orderNo === orderNo);
    setSelectedOrder(order || null);
    
    if (order) {
      setBomNo(generateBOMNo(orderNo));
      
      // 自动带入印绣花要求
      if (order.printEmbroidery && order.printEmbroidery.length > 0) {
        const printItems: PrintMaterial[] = order.printEmbroidery.map((pe, idx) => ({
          id: `print-${idx}`,
          materialCode: `YX-${idx + 1}`,
          materialName: `${pe.position}${pe.type}`,
          specification: pe.type === '印花' ? '胶浆印花' : '电脑绣花',
          unit: '次',
          usagePart: pe.position,
          materialColor: `${pe.colorCount}色`,
          applicableSizes: ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
          standardConsumption: 1,
          lossRate: 2,
          actualConsumption: 1.02,
          totalUsage: order.totalQuantity * 1.02,
          unitPrice: pe.colorCount * 1.5 + 1,
          totalCost: order.totalQuantity * 1.02 * (pe.colorCount * 1.5 + 1),
          supplier: '印花厂',
          processRequirement: `${pe.pantoneColor}，${pe.washRequirement}`,
          inventory: 0,
          category: '印绣花',
          printType: pe.type as any,
          patternCode: `LOGO-${idx + 1}`,
          colorCount: pe.colorCount,
          printWidth: pe.width,
          printHeight: pe.height,
          isSymmetric: pe.isSymmetric,
        }));
        setPrints(printItems);
      }
    }
  };

  const handleAddFabric = () => {
    setFabrics([...fabrics, { ...emptyFabric, id: `fabric-${Date.now()}` }]);
  };

  const handleUpdateFabric = (index: number, field: keyof FabricMaterial, value: any) => {
    const updated = [...fabrics];
    updated[index] = { ...updated[index], [field]: value };
    
    // 自动计算
    if (field === 'standardConsumption' || field === 'lossRate') {
      const lossRate = updated[index].lossRate || 0;
      const std = updated[index].standardConsumption || 0;
      updated[index].actualConsumption = Number((std * (1 + lossRate / 100)).toFixed(2));
    }
    
    if (field === 'actualConsumption' || field === 'unitPrice' || field === 'standardConsumption' || field === 'lossRate') {
      const actual = updated[index].actualConsumption || 0;
      const price = updated[index].unitPrice || 0;
      const orderQty = selectedOrder?.totalQuantity || 0;
      updated[index].totalUsage = Number((actual * orderQty).toFixed(2));
      updated[index].totalCost = Number((actual * orderQty * price).toFixed(2));
    }
    
    setFabrics(updated);
  };

  const handleRemoveFabric = (index: number) => {
    setFabrics(fabrics.filter((_, i) => i !== index));
  };

  // 辅料操作函数
  const emptyAccessory: AccessoryMaterial = {
    id: '',
    materialCode: '',
    materialName: '',
    specification: '',
    unit: '个',
    usagePart: '',
    materialColor: '',
    applicableSizes: [],
    standardConsumption: 0,
    lossRate: 2,
    actualConsumption: 0,
    totalUsage: 0,
    unitPrice: 0,
    totalCost: 0,
    supplier: '',
    processRequirement: '',
    inventory: 0,
    category: '辅料',
    accessoryCategory: '其他',
    packingSpecification: '',
    sizeMatchingRule: '',
  };

  const handleAddAccessory = () => {
    setAccessories([...accessories, { ...emptyAccessory, id: `acc-${Date.now()}` }]);
  };

  const handleUpdateAccessory = (index: number, field: keyof AccessoryMaterial, value: any) => {
    const updated = [...accessories];
    updated[index] = { ...updated[index], [field]: value };
    if (field === 'standardConsumption' || field === 'lossRate') {
      const lossRate = updated[index].lossRate || 0;
      const std = updated[index].standardConsumption || 0;
      updated[index].actualConsumption = Number((std * (1 + lossRate / 100)).toFixed(4));
    }
    if (field === 'actualConsumption' || field === 'unitPrice' || field === 'standardConsumption' || field === 'lossRate') {
      const actual = updated[index].actualConsumption || 0;
      const price = updated[index].unitPrice || 0;
      const orderQty = selectedOrder?.totalQuantity || 0;
      updated[index].totalUsage = Number((actual * orderQty).toFixed(4));
      updated[index].totalCost = Number((actual * orderQty * price).toFixed(4));
    }
    setAccessories(updated);
  };

  const handleRemoveAccessory = (index: number) => {
    setAccessories(accessories.filter((_, i) => i !== index));
  };

  // 洗水物料操作函数
  const emptyWash: WashMaterial = {
    id: '',
    materialCode: '',
    materialName: '',
    specification: '',
    unit: '次',
    usagePart: '整件',
    materialColor: '',
    applicableSizes: [],
    standardConsumption: 1,
    lossRate: 0,
    actualConsumption: 1,
    totalUsage: 0,
    unitPrice: 0,
    totalCost: 0,
    supplier: '',
    processRequirement: '',
    inventory: 0,
    category: '洗水',
    washType: '普洗',
    washColorEffect: '原色',
    chemicals: '',
    chemicalDosage: '',
    shrinkageControl: '≤3%',
    ecoRequirement: '',
  };

  const handleAddWash = () => {
    setWashes([...washes, { ...emptyWash, id: `wash-${Date.now()}` }]);
  };

  const handleUpdateWash = (index: number, field: keyof WashMaterial, value: any) => {
    const updated = [...washes];
    updated[index] = { ...updated[index], [field]: value };
    const actual = updated[index].actualConsumption || 0;
    const price = updated[index].unitPrice || 0;
    const orderQty = selectedOrder?.totalQuantity || 0;
    updated[index].totalUsage = Number((actual * orderQty).toFixed(4));
    updated[index].totalCost = Number((actual * orderQty * price).toFixed(4));
    setWashes(updated);
  };

  const handleRemoveWash = (index: number) => {
    setWashes(washes.filter((_, i) => i !== index));
  };

  // 尾部物料操作函数
  const emptyTail: TailMaterial = {
    id: '',
    materialCode: '',
    materialName: '',
    specification: '',
    unit: '个',
    usagePart: '',
    materialColor: '',
    applicableSizes: [],
    standardConsumption: 1,
    lossRate: 2,
    actualConsumption: 1,
    totalUsage: 0,
    unitPrice: 0,
    totalCost: 0,
    supplier: '',
    processRequirement: '',
    inventory: 0,
    category: '尾部',
    tailCategory: '线类',
    perPieceUsage: 1,
  };

  const handleAddTail = () => {
    setTails([...tails, { ...emptyTail, id: `tail-${Date.now()}` }]);
  };

  const handleUpdateTail = (index: number, field: keyof TailMaterial, value: any) => {
    const updated = [...tails];
    updated[index] = { ...updated[index], [field]: value };
    const actual = updated[index].actualConsumption || 0;
    const price = updated[index].unitPrice || 0;
    const orderQty = selectedOrder?.totalQuantity || 0;
    updated[index].totalUsage = Number((actual * orderQty).toFixed(4));
    updated[index].totalCost = Number((actual * orderQty * price).toFixed(4));
    setTails(updated);
  };

  const handleRemoveTail = (index: number) => {
    setTails(tails.filter((_, i) => i !== index));
  };

  // 包装物料操作函数
  const emptyPacking: PackingMaterial = {
    id: '',
    materialCode: '',
    materialName: '',
    specification: '',
    unit: '个',
    usagePart: '',
    materialColor: '',
    applicableSizes: [],
    standardConsumption: 1,
    lossRate: 1,
    actualConsumption: 1,
    totalUsage: 0,
    unitPrice: 0,
    totalCost: 0,
    supplier: '',
    processRequirement: '',
    inventory: 0,
    category: '包装',
    packingCategory: 'PE胶袋',
    packingSize: '',
    packingQuantity: 1,
    packingRatio: '',
    cartonMaterial: 'A=B',
  };

  const handleAddPacking = () => {
    setPackings([...packings, { ...emptyPacking, id: `pack-${Date.now()}` }]);
  };

  const handleUpdatePacking = (index: number, field: keyof PackingMaterial, value: any) => {
    const updated = [...packings];
    updated[index] = { ...updated[index], [field]: value };
    const actual = updated[index].actualConsumption || 0;
    const price = updated[index].unitPrice || 0;
    const orderQty = selectedOrder?.totalQuantity || 0;
    updated[index].totalUsage = Number((actual * orderQty).toFixed(4));
    updated[index].totalCost = Number((actual * orderQty * price).toFixed(4));
    setPackings(updated);
  };

  const handleRemovePacking = (index: number) => {
    setPackings(packings.filter((_, i) => i !== index));
  };

  // 计算成本汇总
  useEffect(() => {
    setFabricTotalCost(fabrics.reduce((sum, f) => sum + (f.totalCost || 0), 0));
    setAccessoryTotalCost(accessories.reduce((sum, a) => sum + (a.totalCost || 0), 0));
    setPrintTotalCost(prints.reduce((sum, p) => sum + (p.totalCost || 0), 0));
    setWashTotalCost(washes.reduce((sum, w) => sum + (w.totalCost || 0), 0));
    setTailTotalCost(tails.reduce((sum, t) => sum + (t.totalCost || 0), 0));
    setPackingTotalCost(packings.reduce((sum, p) => sum + (p.totalCost || 0), 0));
  }, [fabrics, accessories, prints, washes, tails, packings]);

  const totalCost = fabricTotalCost + accessoryTotalCost + printTotalCost + washTotalCost + tailTotalCost + packingTotalCost;
  const pieceCost = selectedOrder?.totalQuantity ? totalCost / selectedOrder.totalQuantity : 0;

  const handleSave = (submitAudit: boolean = false) => {
    if (!selectedOrderNo) {
      setAlertMessage({ type: 'error', message: '请选择关联订单' });
      return;
    }
    
    if (fabrics.length === 0) {
      setAlertMessage({ type: 'error', message: '请至少添加一种面料' });
      return;
    }
    
    setLoading(true);
    
    const bom: BOM = {
      id: bomId || Date.now().toString(),
      bomNo,
      orderNo: selectedOrderNo,
      styleNo: selectedOrder?.styleNo || '',
      productName: selectedOrder?.productName || '',
      customerName: selectedOrder?.customerName || '',
      orderQuantity: selectedOrder?.totalQuantity || 0,
      colorSizeMatrix: selectedOrder?.colorSizeMatrix || [],
      deliveryDate: selectedOrder?.deliveryDate || '',
      bomVersion,
      bomType: '订单BOM',
      status: submitAudit ? '待审核' : '草稿',
      printEmbroidery: selectedOrder?.printEmbroidery || [],
      washRequirement: selectedOrder?.washRequirement || { washType: '普洗', colorEffect: '原色', shrinkageRate: '≤3%', ecoRequirement: [] },
      packingRequirement: selectedOrder?.packingRequirement || { packingMethod: '独立包装', peBagSize: '', cartonSize: '', piecesPerCarton: 0, sizeRatio: '', cartonLabelType: '英文', sticker: '', barcode: '', moistureProof: false, desiccant: false, tissuePaper: false },
      tailRequirement: selectedOrder?.tailRequirement || { trimThread: false, ironing: false, inspection: false, spareButtons: 0, spareThread: '', hangTag: '', hangRope: '', foldMethod: '' },
      fabrics,
      accessories,
      prints,
      washes,
      tails,
      packings,
      fabricTotalCost,
      accessoryTotalCost,
      printTotalCost,
      washTotalCost,
      tailTotalCost,
      packingTotalCost,
      pieceCost,
      totalCost,
      createdBy: currentUser?.username || '',
      createdAt: new Date().toLocaleString('zh-CN'),
    };
    
    saveBOM(bom);
    setLoading(false);
    
    if (submitAudit) {
      setAlertMessage({ type: 'success', message: 'BOM已保存并提交审核' });
    } else {
      setAlertMessage({ type: 'success', message: 'BOM保存成功' });
    }
    
    setTimeout(() => {
      router.push('/dashboard/bom');
    }, 1500);
  };

  return (
    <DashboardLayout>
      <div className="max-w-full mx-auto space-y-6">
        {alertMessage && (
          <Alert variant={alertMessage.type === 'error' ? 'destructive' : 'default'} className="border-2">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{alertMessage.message}</AlertDescription>
          </Alert>
        )}

        {/* 页面标题 */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              onClick={() => router.push('/dashboard/bom')}
              className="text-gray-400 hover:text-white hover:bg-gray-800"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-white">
                {bomId ? '编辑BOM' : '新增BOM'}
              </h1>
              <p className="text-gray-400 text-sm mt-1">物料清单制单，与订单数据完全联动</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => handleSave(false)}
              disabled={loading}
              className="border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              <Save className="w-4 h-4 mr-2" />
              保存草稿
            </Button>
            <Button 
              onClick={() => handleSave(true)}
              disabled={loading}
              className="bg-white text-black hover:bg-gray-200"
            >
              <Send className="w-4 h-4 mr-2" />
              提交审核
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* 左侧主区域 */}
          <div className="lg:col-span-3 space-y-6">
            <Tabs defaultValue="basic" className="space-y-4">
              <TabsList className="bg-gray-900 border border-gray-700">
                <TabsTrigger value="basic" className="data-[state=active]:bg-white data-[state=active]:text-black">基本信息</TabsTrigger>
                <TabsTrigger value="fabric" className="data-[state=active]:bg-white data-[state=active]:text-black">面料物料</TabsTrigger>
                <TabsTrigger value="accessory" className="data-[state=active]:bg-white data-[state=active]:text-black">辅料物料</TabsTrigger>
                <TabsTrigger value="print" className="data-[state=active]:bg-white data-[state=active]:text-black">印绣花</TabsTrigger>
                <TabsTrigger value="wash" className="data-[state=active]:bg-white data-[state=active]:text-black">洗水</TabsTrigger>
                <TabsTrigger value="tail" className="data-[state=active]:bg-white data-[state=active]:text-black">尾部</TabsTrigger>
                <TabsTrigger value="packing" className="data-[state=active]:bg-white data-[state=active]:text-black">包装</TabsTrigger>
              </TabsList>

              {/* 基本信息 */}
              <TabsContent value="basic">
                <Card className="bg-gray-900 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">基本信息</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="col-span-2">
                        <Label className="text-gray-400">关联订单号 *</Label>
                        <Select value={selectedOrderNo} onValueChange={handleOrderChange}>
                          <SelectTrigger className="mt-1 bg-gray-800 border-gray-600 text-white">
                            <SelectValue placeholder="选择订单" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableOrders.map(order => (
                              <SelectItem key={order.id} value={order.orderNo}>
                                {order.orderNo} - {order.styleNo} ({order.customerName})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-gray-400">BOM编号</Label>
                        <Input
                          value={bomNo}
                          readOnly
                          className="mt-1 bg-gray-800 border-gray-600 text-gray-400"
                        />
                      </div>
                      <div>
                        <Label className="text-gray-400">BOM版本</Label>
                        <Input
                          value={bomVersion}
                          onChange={(e) => setBomVersion(e.target.value)}
                          className="mt-1 bg-gray-800 border-gray-600 text-white"
                        />
                      </div>
                    </div>
                    
                    {selectedOrder && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-700">
                        <div>
                          <Label className="text-gray-400">款号</Label>
                          <p className="text-white mt-1">{selectedOrder.styleNo}</p>
                        </div>
                        <div>
                          <Label className="text-gray-400">产品名称</Label>
                          <p className="text-white mt-1">{selectedOrder.productName}</p>
                        </div>
                        <div>
                          <Label className="text-gray-400">客户名称</Label>
                          <p className="text-white mt-1">{selectedOrder.customerName}</p>
                        </div>
                        <div>
                          <Label className="text-gray-400">订单数量</Label>
                          <p className="text-white mt-1 font-bold">{selectedOrder.totalQuantity}</p>
                        </div>
                        <div>
                          <Label className="text-gray-400">交货日期</Label>
                          <p className="text-white mt-1">{selectedOrder.deliveryDate}</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* 面料物料 */}
              <TabsContent value="fabric">
                <Card className="bg-gray-900 border-gray-700">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-white">面料物料</CardTitle>
                    <Button size="sm" onClick={handleAddFabric} className="bg-white text-black hover:bg-gray-200">
                      <Plus className="w-4 h-4 mr-1" />
                      添加面料
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-gray-700 hover:bg-gray-800">
                            <TableHead className="text-gray-400">物料编码</TableHead>
                            <TableHead className="text-gray-400">物料名称</TableHead>
                            <TableHead className="text-gray-400">规格</TableHead>
                            <TableHead className="text-gray-400">使用部位</TableHead>
                            <TableHead className="text-gray-400 text-right">标准单耗</TableHead>
                            <TableHead className="text-gray-400 text-right">损耗率%</TableHead>
                            <TableHead className="text-gray-400 text-right">实际单耗</TableHead>
                            <TableHead className="text-gray-400 text-right">单价</TableHead>
                            <TableHead className="text-gray-400 text-right">总成本</TableHead>
                            <TableHead className="w-16"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {fabrics.map((fabric, index) => (
                            <TableRow key={fabric.id} className="border-gray-700">
                              <TableCell>
                                <Input
                                  value={fabric.materialCode}
                                  onChange={(e) => handleUpdateFabric(index, 'materialCode', e.target.value)}
                                  className="bg-gray-800 border-gray-600 text-white w-24"
                                />
                              </TableCell>
                              <TableCell>
                                <Input
                                  value={fabric.materialName}
                                  onChange={(e) => handleUpdateFabric(index, 'materialName', e.target.value)}
                                  className="bg-gray-800 border-gray-600 text-white"
                                />
                              </TableCell>
                              <TableCell>
                                <Input
                                  value={fabric.specification}
                                  onChange={(e) => handleUpdateFabric(index, 'specification', e.target.value)}
                                  className="bg-gray-800 border-gray-600 text-white w-24"
                                />
                              </TableCell>
                              <TableCell>
                                <Input
                                  value={fabric.usagePart}
                                  onChange={(e) => handleUpdateFabric(index, 'usagePart', e.target.value)}
                                  className="bg-gray-800 border-gray-600 text-white w-20"
                                />
                              </TableCell>
                              <TableCell>
                                <Input
                                  type="number"
                                  value={fabric.standardConsumption}
                                  onChange={(e) => handleUpdateFabric(index, 'standardConsumption', parseFloat(e.target.value) || 0)}
                                  className="bg-gray-800 border-gray-600 text-white w-20 text-right"
                                />
                              </TableCell>
                              <TableCell>
                                <Input
                                  type="number"
                                  value={fabric.lossRate}
                                  onChange={(e) => handleUpdateFabric(index, 'lossRate', parseFloat(e.target.value) || 0)}
                                  className="bg-gray-800 border-gray-600 text-white w-16 text-right"
                                />
                              </TableCell>
                              <TableCell className="text-white text-right">{fabric.actualConsumption.toFixed(2)}</TableCell>
                              <TableCell>
                                <Input
                                  type="number"
                                  value={fabric.unitPrice}
                                  onChange={(e) => handleUpdateFabric(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                                  className="bg-gray-800 border-gray-600 text-white w-20 text-right"
                                />
                              </TableCell>
                              <TableCell className="text-green-400 font-bold text-right">¥{fabric.totalCost.toFixed(2)}</TableCell>
                              <TableCell>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleRemoveFabric(index)}
                                  className="text-red-400 hover:text-red-300 hover:bg-gray-800"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                          {fabrics.length === 0 && (
                            <TableRow>
                              <TableCell colSpan={10} className="text-center py-8 text-gray-500">
                                暂无面料数据，请点击"添加面料"按钮
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                    {fabrics.length > 0 && (
                      <div className="flex justify-end mt-4 pt-4 border-t border-gray-700">
                        <div className="text-right">
                          <span className="text-gray-400">面料成本合计: </span>
                          <span className="text-xl font-bold text-green-400">¥{fabricTotalCost.toLocaleString()}</span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* 辅料物料 */}
              <TabsContent value="accessory">
                <Card className="bg-gray-900 border-gray-700">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-white">辅料物料</CardTitle>
                    <Button size="sm" onClick={handleAddAccessory} className="bg-white text-black hover:bg-gray-200">
                      <Plus className="w-4 h-4 mr-1" />添加辅料
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-gray-700 hover:bg-gray-800">
                            <TableHead className="text-gray-400">物料编码</TableHead>
                            <TableHead className="text-gray-400">物料名称</TableHead>
                            <TableHead className="text-gray-400">辅料分类</TableHead>
                            <TableHead className="text-gray-400">规格</TableHead>
                            <TableHead className="text-gray-400">使用部位</TableHead>
                            <TableHead className="text-gray-400 text-right">标准单耗</TableHead>
                            <TableHead className="text-gray-400 text-right">损耗率%</TableHead>
                            <TableHead className="text-gray-400 text-right">单价</TableHead>
                            <TableHead className="text-gray-400 text-right">总成本</TableHead>
                            <TableHead className="w-16"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {accessories.map((acc, index) => (
                            <TableRow key={acc.id} className="border-gray-700">
                              <TableCell>
                                <Input value={acc.materialCode} onChange={(e) => handleUpdateAccessory(index, 'materialCode', e.target.value)} className="bg-gray-800 border-gray-600 text-white w-24" />
                              </TableCell>
                              <TableCell>
                                <Input value={acc.materialName} onChange={(e) => handleUpdateAccessory(index, 'materialName', e.target.value)} className="bg-gray-800 border-gray-600 text-white" />
                              </TableCell>
                              <TableCell>
                                <Select value={acc.accessoryCategory} onValueChange={(v) => handleUpdateAccessory(index, 'accessoryCategory', v)}>
                                  <SelectTrigger className="bg-gray-800 border-gray-600 text-white w-20">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="纽扣">纽扣</SelectItem>
                                    <SelectItem value="四合扣">四合扣</SelectItem>
                                    <SelectItem value="拉链">拉链</SelectItem>
                                    <SelectItem value="线类">线类</SelectItem>
                                    <SelectItem value="标类">标类</SelectItem>
                                    <SelectItem value="其他">其他</SelectItem>
                                  </SelectContent>
                                </Select>
                              </TableCell>
                              <TableCell>
                                <Input value={acc.specification} onChange={(e) => handleUpdateAccessory(index, 'specification', e.target.value)} className="bg-gray-800 border-gray-600 text-white w-20" />
                              </TableCell>
                              <TableCell>
                                <Input value={acc.usagePart} onChange={(e) => handleUpdateAccessory(index, 'usagePart', e.target.value)} className="bg-gray-800 border-gray-600 text-white w-20" />
                              </TableCell>
                              <TableCell>
                                <Input type="number" value={acc.standardConsumption} onChange={(e) => handleUpdateAccessory(index, 'standardConsumption', parseFloat(e.target.value) || 0)} className="bg-gray-800 border-gray-600 text-white w-16 text-right" />
                              </TableCell>
                              <TableCell>
                                <Input type="number" value={acc.lossRate} onChange={(e) => handleUpdateAccessory(index, 'lossRate', parseFloat(e.target.value) || 0)} className="bg-gray-800 border-gray-600 text-white w-14 text-right" />
                              </TableCell>
                              <TableCell>
                                <Input type="number" value={acc.unitPrice} onChange={(e) => handleUpdateAccessory(index, 'unitPrice', parseFloat(e.target.value) || 0)} className="bg-gray-800 border-gray-600 text-white w-16 text-right" />
                              </TableCell>
                              <TableCell className="text-green-400 font-bold text-right">¥{acc.totalCost.toFixed(4)}</TableCell>
                              <TableCell>
                                <Button size="sm" variant="ghost" onClick={() => handleRemoveAccessory(index)} className="text-red-400 hover:text-red-300 hover:bg-gray-800">
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                          {accessories.length === 0 && (
                            <TableRow>
                              <TableCell colSpan={10} className="text-center py-8 text-gray-500">暂无辅料数据，请点击"添加辅料"按钮</TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                    {accessories.length > 0 && (
                      <div className="flex justify-end mt-4 pt-4 border-t border-gray-700">
                        <span className="text-gray-400">辅料成本合计: </span>
                        <span className="text-xl font-bold text-green-400">¥{accessoryTotalCost.toLocaleString()}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="print">
                <Card className="bg-gray-900 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">印绣花物料</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {prints.length > 0 ? (
                      <div className="space-y-2">
                        {prints.map((p, i) => (
                          <div key={i} className="flex justify-between items-center p-3 bg-gray-800 rounded">
                            <span className="text-white">{p.materialName}</span>
                            <span className="text-green-400">¥{p.totalCost.toFixed(2)}</span>
                          </div>
                        ))}
                        <div className="flex justify-end mt-4 pt-4 border-t border-gray-700">
                          <span className="text-gray-400">印绣花成本合计: </span>
                          <span className="text-xl font-bold text-green-400">¥{printTotalCost.toLocaleString()}</span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-8">暂无印绣花数据</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="wash">
                <Card className="bg-gray-900 border-gray-700">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-white">洗水物料</CardTitle>
                    <Button size="sm" onClick={handleAddWash} className="bg-white text-black hover:bg-gray-200">
                      <Plus className="w-4 h-4 mr-1" />添加洗水
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-gray-700 hover:bg-gray-800">
                            <TableHead className="text-gray-400">洗水类型</TableHead>
                            <TableHead className="text-gray-400">颜色效果</TableHead>
                            <TableHead className="text-gray-400">缩率控制</TableHead>
                            <TableHead className="text-gray-400">化学品</TableHead>
                            <TableHead className="text-gray-400 text-right">单价</TableHead>
                            <TableHead className="text-gray-400 text-right">总成本</TableHead>
                            <TableHead className="w-16"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {washes.map((wash, index) => (
                            <TableRow key={wash.id} className="border-gray-700">
                              <TableCell>
                                <Select value={wash.washType} onValueChange={(v) => handleUpdateWash(index, 'washType', v)}>
                                  <SelectTrigger className="bg-gray-800 border-gray-600 text-white w-24">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="普洗">普洗</SelectItem>
                                    <SelectItem value="石洗">石洗</SelectItem>
                                    <SelectItem value="酵素洗">酵素洗</SelectItem>
                                    <SelectItem value="砂洗">砂洗</SelectItem>
                                    <SelectItem value="漂洗">漂洗</SelectItem>
                                    <SelectItem value="套色洗">套色洗</SelectItem>
                                    <SelectItem value="复古洗">复古洗</SelectItem>
                                  </SelectContent>
                                </Select>
                              </TableCell>
                              <TableCell>
                                <Input value={wash.washColorEffect} onChange={(e) => handleUpdateWash(index, 'washColorEffect', e.target.value)} className="bg-gray-800 border-gray-600 text-white w-20" />
                              </TableCell>
                              <TableCell>
                                <Input value={wash.shrinkageControl} onChange={(e) => handleUpdateWash(index, 'shrinkageControl', e.target.value)} className="bg-gray-800 border-gray-600 text-white w-20" />
                              </TableCell>
                              <TableCell>
                                <Input value={wash.chemicals} onChange={(e) => handleUpdateWash(index, 'chemicals', e.target.value)} className="bg-gray-800 border-gray-600 text-white w-24" placeholder="如: 酵素、柔顺剂" />
                              </TableCell>
                              <TableCell>
                                <Input type="number" value={wash.unitPrice} onChange={(e) => handleUpdateWash(index, 'unitPrice', parseFloat(e.target.value) || 0)} className="bg-gray-800 border-gray-600 text-white w-16 text-right" />
                              </TableCell>
                              <TableCell className="text-green-400 font-bold text-right">¥{wash.totalCost.toFixed(4)}</TableCell>
                              <TableCell>
                                <Button size="sm" variant="ghost" onClick={() => handleRemoveWash(index)} className="text-red-400 hover:text-red-300 hover:bg-gray-800">
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                          {washes.length === 0 && (
                            <TableRow>
                              <TableCell colSpan={7} className="text-center py-8 text-gray-500">暂无洗水数据，请点击"添加洗水"按钮</TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                    {washes.length > 0 && (
                      <div className="flex justify-end mt-4 pt-4 border-t border-gray-700">
                        <span className="text-gray-400">洗水成本合计: </span>
                        <span className="text-xl font-bold text-green-400">¥{washTotalCost.toLocaleString()}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="tail">
                <Card className="bg-gray-900 border-gray-700">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-white">尾部物料</CardTitle>
                    <Button size="sm" onClick={handleAddTail} className="bg-white text-black hover:bg-gray-200">
                      <Plus className="w-4 h-4 mr-1" />添加尾部物料
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-gray-700 hover:bg-gray-800">
                            <TableHead className="text-gray-400">物料名称</TableHead>
                            <TableHead className="text-gray-400">尾部分类</TableHead>
                            <TableHead className="text-gray-400">规格</TableHead>
                            <TableHead className="text-gray-400">使用部位</TableHead>
                            <TableHead className="text-gray-400 text-right">单件用量</TableHead>
                            <TableHead className="text-gray-400 text-right">单价</TableHead>
                            <TableHead className="text-gray-400 text-right">总成本</TableHead>
                            <TableHead className="w-16"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {tails.map((tail, index) => (
                            <TableRow key={tail.id} className="border-gray-700">
                              <TableCell>
                                <Input value={tail.materialName} onChange={(e) => handleUpdateTail(index, 'materialName', e.target.value)} className="bg-gray-800 border-gray-600 text-white" placeholder="如: 备用扣" />
                              </TableCell>
                              <TableCell>
                                <Select value={tail.tailCategory} onValueChange={(v) => handleUpdateTail(index, 'tailCategory', v)}>
                                  <SelectTrigger className="bg-gray-800 border-gray-600 text-white w-24">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="线类">线类</SelectItem>
                                    <SelectItem value="备用配件">备用配件</SelectItem>
                                    <SelectItem value="整烫耗材">整烫耗材</SelectItem>
                                    <SelectItem value="查衫耗材">查衫耗材</SelectItem>
                                  </SelectContent>
                                </Select>
                              </TableCell>
                              <TableCell>
                                <Input value={tail.specification} onChange={(e) => handleUpdateTail(index, 'specification', e.target.value)} className="bg-gray-800 border-gray-600 text-white w-20" />
                              </TableCell>
                              <TableCell>
                                <Input value={tail.usagePart} onChange={(e) => handleUpdateTail(index, 'usagePart', e.target.value)} className="bg-gray-800 border-gray-600 text-white w-20" />
                              </TableCell>
                              <TableCell>
                                <Input type="number" value={tail.perPieceUsage} onChange={(e) => { handleUpdateTail(index, 'perPieceUsage', parseFloat(e.target.value) || 0); handleUpdateTail(index, 'actualConsumption', parseFloat(e.target.value) || 0); }} className="bg-gray-800 border-gray-600 text-white w-16 text-right" />
                              </TableCell>
                              <TableCell>
                                <Input type="number" value={tail.unitPrice} onChange={(e) => handleUpdateTail(index, 'unitPrice', parseFloat(e.target.value) || 0)} className="bg-gray-800 border-gray-600 text-white w-16 text-right" />
                              </TableCell>
                              <TableCell className="text-green-400 font-bold text-right">¥{tail.totalCost.toFixed(4)}</TableCell>
                              <TableCell>
                                <Button size="sm" variant="ghost" onClick={() => handleRemoveTail(index)} className="text-red-400 hover:text-red-300 hover:bg-gray-800">
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                          {tails.length === 0 && (
                            <TableRow>
                              <TableCell colSpan={8} className="text-center py-8 text-gray-500">暂无尾部数据，请点击"添加尾部物料"按钮</TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                    {tails.length > 0 && (
                      <div className="flex justify-end mt-4 pt-4 border-t border-gray-700">
                        <span className="text-gray-400">尾部成本合计: </span>
                        <span className="text-xl font-bold text-green-400">¥{tailTotalCost.toLocaleString()}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="packing">
                <Card className="bg-gray-900 border-gray-700">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-white">包装物料</CardTitle>
                    <Button size="sm" onClick={handleAddPacking} className="bg-white text-black hover:bg-gray-200">
                      <Plus className="w-4 h-4 mr-1" />添加包装
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-gray-700 hover:bg-gray-800">
                            <TableHead className="text-gray-400">物料名称</TableHead>
                            <TableHead className="text-gray-400">包装分类</TableHead>
                            <TableHead className="text-gray-400">规格尺寸</TableHead>
                            <TableHead className="text-gray-400 text-right">装箱数量</TableHead>
                            <TableHead className="text-gray-400 text-right">单价</TableHead>
                            <TableHead className="text-gray-400 text-right">总成本</TableHead>
                            <TableHead className="w-16"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {packings.map((pack, index) => (
                            <TableRow key={pack.id} className="border-gray-700">
                              <TableCell>
                                <Input value={pack.materialName} onChange={(e) => handleUpdatePacking(index, 'materialName', e.target.value)} className="bg-gray-800 border-gray-600 text-white" placeholder="如: PE胶袋" />
                              </TableCell>
                              <TableCell>
                                <Select value={pack.packingCategory} onValueChange={(v) => handleUpdatePacking(index, 'packingCategory', v)}>
                                  <SelectTrigger className="bg-gray-800 border-gray-600 text-white w-24">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="PE胶袋">PE胶袋</SelectItem>
                                    <SelectItem value="拷贝纸">拷贝纸</SelectItem>
                                    <SelectItem value="干燥剂">干燥剂</SelectItem>
                                    <SelectItem value="外箱">外箱</SelectItem>
                                    <SelectItem value="胶带">胶带</SelectItem>
                                    <SelectItem value="吊牌绳">吊牌绳</SelectItem>
                                  </SelectContent>
                                </Select>
                              </TableCell>
                              <TableCell>
                                <Input value={pack.packingSize} onChange={(e) => handleUpdatePacking(index, 'packingSize', e.target.value)} className="bg-gray-800 border-gray-600 text-white w-24" placeholder="如: 30×40cm" />
                              </TableCell>
                              <TableCell>
                                <Input type="number" value={pack.packingQuantity} onChange={(e) => { handleUpdatePacking(index, 'packingQuantity', parseFloat(e.target.value) || 0); handleUpdatePacking(index, 'actualConsumption', parseFloat(e.target.value) || 0); }} className="bg-gray-800 border-gray-600 text-white w-16 text-right" />
                              </TableCell>
                              <TableCell>
                                <Input type="number" value={pack.unitPrice} onChange={(e) => handleUpdatePacking(index, 'unitPrice', parseFloat(e.target.value) || 0)} className="bg-gray-800 border-gray-600 text-white w-16 text-right" />
                              </TableCell>
                              <TableCell className="text-green-400 font-bold text-right">¥{pack.totalCost.toFixed(4)}</TableCell>
                              <TableCell>
                                <Button size="sm" variant="ghost" onClick={() => handleRemovePacking(index)} className="text-red-400 hover:text-red-300 hover:bg-gray-800">
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                          {packings.length === 0 && (
                            <TableRow>
                              <TableCell colSpan={7} className="text-center py-8 text-gray-500">暂无包装数据，请点击"添加包装"按钮</TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                    {packings.length > 0 && (
                      <div className="flex justify-end mt-4 pt-4 border-t border-gray-700">
                        <span className="text-gray-400">包装成本合计: </span>
                        <span className="text-xl font-bold text-green-400">¥{packingTotalCost.toLocaleString()}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* 右侧成本汇总 */}
          <div className="space-y-6">
            <Card className="bg-gray-900 border-gray-700 sticky top-20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Calculator className="w-4 h-4" />
                  成本汇总
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-800 rounded">
                  <span className="text-gray-400">面料成本</span>
                  <span className="text-white font-medium">¥{fabricTotalCost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-800 rounded">
                  <span className="text-gray-400">辅料成本</span>
                  <span className="text-white font-medium">¥{accessoryTotalCost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-800 rounded">
                  <span className="text-gray-400">印绣花成本</span>
                  <span className="text-white font-medium">¥{printTotalCost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-800 rounded">
                  <span className="text-gray-400">洗水成本</span>
                  <span className="text-white font-medium">¥{washTotalCost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-800 rounded">
                  <span className="text-gray-400">尾部成本</span>
                  <span className="text-white font-medium">¥{tailTotalCost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-800 rounded">
                  <span className="text-gray-400">包装成本</span>
                  <span className="text-white font-medium">¥{packingTotalCost.toLocaleString()}</span>
                </div>
                
                <div className="border-t border-gray-700 pt-4 mt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-white font-medium">订单总成本</span>
                    <span className="text-2xl font-bold text-green-400">¥{totalCost.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-gray-400">单件成本</span>
                    <span className="text-xl font-bold text-white">¥{pieceCost.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
