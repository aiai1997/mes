'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, Trash2 } from 'lucide-react';
import { 
  type BOM, 
  type FabricMaterial,
  type AccessoryMaterial,
  type PrintMaterial,
  type WashMaterial,
  type TailMaterial,
  type PackingMaterial,
  type MaterialMaster,
  generateBOMNo, 
  saveBOM, 
  getMaterials,
  getOrdersForBOM,
  checkOrderHasBOM,
} from '@/types/bom';
import { type Order } from '@/types/order';
import { getCurrentUser } from '@/types/user';

interface BOMFormDialogProps {
  bom: BOM | null;
  onClose: (needRefresh: boolean) => void;
}

const emptyFabricMaterial: FabricMaterial = {
  id: '',
  materialCode: '',
  materialName: '',
  specification: '',
  unit: '米',
  usagePart: '',
  materialColor: '',
  applicableSizes: ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
  standardConsumption: 0,
  lossRate: 5,
  actualConsumption: 0,
  totalUsage: 0,
  unitPrice: 0,
  totalCost: 0,
  supplier: '',
  processRequirement: '',
  inventory: 0,
  category: '面料',
  fabricWidth: 0,
  fabricWeight: 0,
  fabricComposition: '',
  markerRatio: '',
};

export default function BOMFormDialog({ bom, onClose }: BOMFormDialogProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [materials, setMaterials] = useState<MaterialMaster[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  
  // BOM基本信息
  const [bomNo, setBOMNo] = useState('');
  const [orderNo, setOrderNo] = useState('');
  const [styleNo, setStyleNo] = useState('');
  const [productName, setProductName] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [orderQuantity, setOrderQuantity] = useState(0);
  const [deliveryDate, setDeliveryDate] = useState('');
  const [bomVersion, setBOMVersion] = useState('01');
  const [bomType, setBOMType] = useState<'订单BOM' | '通用BOM'>('订单BOM');
  const [status, setStatus] = useState<'草稿' | '待审核' | '已审核' | '已生效' | '已作废'>('草稿');
  
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
  
  // 订单工艺要求
  const [printEmbroidery, setPrintEmbroidery] = useState<any[]>([]);
  const [washRequirement, setWashRequirement] = useState<any>(null);
  const [packingRequirement, setPackingRequirement] = useState<any>(null);
  const [tailRequirement, setTailRequirement] = useState<any>(null);

  useEffect(() => {
    setOrders(getOrdersForBOM());
    setMaterials(getMaterials());
    
    if (bom) {
      // 编辑模式
      setBOMNo(bom.bomNo);
      setOrderNo(bom.orderNo);
      setStyleNo(bom.styleNo);
      setProductName(bom.productName);
      setCustomerName(bom.customerName);
      setOrderQuantity(bom.orderQuantity);
      setDeliveryDate(bom.deliveryDate);
      setBOMVersion(bom.bomVersion);
      setBOMType(bom.bomType);
      setStatus(bom.status);
      setFabrics(bom.fabrics);
      setAccessories(bom.accessories);
      setPrints(bom.prints);
      setWashes(bom.washes);
      setTails(bom.tails);
      setPackings(bom.packings);
      setPrintEmbroidery(bom.printEmbroidery);
      setWashRequirement(bom.washRequirement);
      setPackingRequirement(bom.packingRequirement);
      setTailRequirement(bom.tailRequirement);
    }
  }, [bom]);

  // 计算成本汇总
  useEffect(() => {
    const fabricCost = fabrics.reduce((sum, f) => sum + f.totalCost, 0);
    const accessoryCost = accessories.reduce((sum, a) => sum + a.totalCost, 0);
    const printCost = prints.reduce((sum, p) => sum + p.totalCost, 0);
    const washCost = washes.reduce((sum, w) => sum + w.totalCost, 0);
    const tailCost = tails.reduce((sum, t) => sum + t.totalCost, 0);
    const packingCost = packings.reduce((sum, p) => sum + p.totalCost, 0);
    
    setFabricTotalCost(fabricCost);
    setAccessoryTotalCost(accessoryCost);
    setPrintTotalCost(printCost);
    setWashTotalCost(washCost);
    setTailTotalCost(tailCost);
    setPackingTotalCost(packingCost);
  }, [fabrics, accessories, prints, washes, tails, packings]);

  // 选择订单
  const handleSelectOrder = (orderNo: string) => {
    const order = orders.find(o => o.orderNo === orderNo);
    if (!order) return;
    
    // 检查订单是否已有BOM
    if (!bom && checkOrderHasBOM(orderNo)) {
      alert('该订单已存在BOM，不可重复创建');
      return;
    }
    
    setSelectedOrder(order);
    setOrderNo(order.orderNo);
    setStyleNo(order.styleNo);
    setProductName(order.productName);
    setCustomerName(order.customerName);
    setOrderQuantity(order.totalQuantity);
    setDeliveryDate(order.deliveryDate);
    setBOMNo(generateBOMNo(order.orderNo));
    
    // 带出订单工艺要求
    setPrintEmbroidery(order.printEmbroidery);
    setWashRequirement(order.washRequirement);
    setPackingRequirement(order.packingRequirement);
    setTailRequirement(order.tailRequirement);
    
    // 根据订单印绣花要求预填充印绣花物料
    if (order.printEmbroidery && order.printEmbroidery.length > 0) {
      const printMaterials: PrintMaterial[] = order.printEmbroidery.map((pe, idx) => ({
        id: String(idx + 1),
        materialCode: `YX00${idx + 1}`,
        materialName: `${pe.position}${pe.type}`,
        specification: pe.type,
        unit: '次',
        usagePart: pe.position,
        materialColor: '',
        applicableSizes: ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
        standardConsumption: 1,
        lossRate: 2,
        actualConsumption: 1.02,
        totalUsage: Math.ceil(order.totalQuantity * 1.02),
        unitPrice: 3.5,
        totalCost: Math.ceil(order.totalQuantity * 1.02) * 3.5,
        supplier: '',
        processRequirement: `${pe.pantoneColor}，${pe.washRequirement}`,
        inventory: 0,
        category: '印绣花',
        printType: pe.type as any,
        patternCode: '',
        colorCount: pe.colorCount,
        printWidth: pe.width,
        printHeight: pe.height,
        isSymmetric: pe.isSymmetric,
      }));
      setPrints(printMaterials);
    }
  };

  // 更新面料物料
  const handleFabricChange = (index: number, field: keyof FabricMaterial, value: any) => {
    const newFabrics = [...fabrics];
    (newFabrics[index] as any)[field] = value;
    
    // 自动计算
    if (field === 'standardConsumption' || field === 'lossRate') {
      const std = newFabrics[index].standardConsumption;
      const loss = newFabrics[index].lossRate;
      newFabrics[index].actualConsumption = Number((std * (1 + loss / 100)).toFixed(4));
      newFabrics[index].totalUsage = Number((newFabrics[index].actualConsumption * orderQuantity).toFixed(2));
    }
    if (field === 'unitPrice' || field === 'totalUsage') {
      newFabrics[index].totalCost = Number((newFabrics[index].totalUsage * newFabrics[index].unitPrice).toFixed(2));
    }
    
    setFabrics(newFabrics);
  };

  // 选择物料档案
  const handleSelectMaterial = (index: number, materialCode: string, type: 'fabric' | 'accessory' | 'packing') => {
    const material = materials.find(m => m.materialCode === materialCode);
    if (!material) return;
    
    if (type === 'fabric') {
      const newFabrics = [...fabrics];
      newFabrics[index] = {
        ...newFabrics[index],
        materialCode: material.materialCode,
        materialName: material.materialName,
        specification: material.specification,
        unit: material.unit,
        unitPrice: material.unitPrice,
        supplier: material.supplier,
        inventory: material.inventory,
      };
      setFabrics(newFabrics);
    }
  };

  // 添加面料行
  const handleAddFabric = () => {
    setFabrics([...fabrics, { ...emptyFabricMaterial, id: String(fabrics.length + 1) }]);
  };

  // 删除面料行
  const handleRemoveFabric = (index: number) => {
    setFabrics(fabrics.filter((_, i) => i !== index));
  };

  // 保存BOM
  const handleSave = () => {
    if (!orderNo) {
      alert('请选择关联订单');
      return;
    }
    if (fabrics.length === 0 && accessories.length === 0) {
      alert('请至少添加一种物料');
      return;
    }

    const currentUser = getCurrentUser();
    const totalCost = fabricTotalCost + accessoryTotalCost + printTotalCost + washTotalCost + tailTotalCost + packingTotalCost;
    
    const newBOM: BOM = {
      id: bom?.id || Date.now().toString(),
      bomNo,
      orderNo,
      styleNo,
      productName,
      customerName,
      orderQuantity,
      colorSizeMatrix: selectedOrder?.colorSizeMatrix || [],
      deliveryDate,
      bomVersion,
      bomType,
      status,
      printEmbroidery,
      washRequirement: washRequirement || { washType: '普洗', colorEffect: '原色', shrinkageRate: '≤3%', ecoRequirement: [] },
      packingRequirement: packingRequirement || { packingMethod: '独立包装', peBagSize: '', cartonSize: '', piecesPerCarton: 0, sizeRatio: '', cartonLabelType: '中文', sticker: '', barcode: '', moistureProof: false, desiccant: false, tissuePaper: false },
      tailRequirement: tailRequirement || { trimThread: true, ironing: true, inspection: true, spareButtons: 0, spareThread: '', hangTag: '', hangRope: '', foldMethod: '' },
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
      pieceCost: orderQuantity > 0 ? Number((totalCost / orderQuantity).toFixed(2)) : 0,
      totalCost,
      createdBy: bom?.createdBy || currentUser?.username || 'system',
      createdAt: bom?.createdAt || new Date().toLocaleString('zh-CN'),
    };

    saveBOM(newBOM);
    onClose(true);
  };

  const pieceCost = orderQuantity > 0 
    ? Number(((fabricTotalCost + accessoryTotalCost + printTotalCost + washTotalCost + tailTotalCost + packingTotalCost) / orderQuantity).toFixed(2))
    : 0;
  const totalCost = fabricTotalCost + accessoryTotalCost + printTotalCost + washTotalCost + tailTotalCost + packingTotalCost;

  return (
    <Dialog open={true} onOpenChange={() => onClose(false)}>
      <DialogContent className="max-w-7xl max-h-[90vh] p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="text-xl">
            {bom ? '编辑BOM' : '新增BOM'}
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="flex-1 h-[calc(90vh-120px)]">
          <div className="p-6">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid grid-cols-8 mb-6">
                <TabsTrigger value="basic">基本信息</TabsTrigger>
                <TabsTrigger value="fabric">面料物料</TabsTrigger>
                <TabsTrigger value="accessory">辅料物料</TabsTrigger>
                <TabsTrigger value="print">印绣花</TabsTrigger>
                <TabsTrigger value="wash">洗水</TabsTrigger>
                <TabsTrigger value="tail">尾部</TabsTrigger>
                <TabsTrigger value="packing">包装</TabsTrigger>
                <TabsTrigger value="cost">成本汇总</TabsTrigger>
              </TabsList>

              {/* 基本信息 */}
              <TabsContent value="basic" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-sm font-medium">关联订单号 *</Label>
                    <Select value={orderNo} onValueChange={handleSelectOrder} disabled={!!bom}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="请选择已审核/已下达订单" />
                      </SelectTrigger>
                      <SelectContent>
                        {orders.map(o => (
                          <SelectItem key={o.id} value={o.orderNo}>{o.orderNo} - {o.productName}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">BOM编号</Label>
                    <Input value={bomNo} disabled className="mt-1 bg-gray-50" />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">款号</Label>
                    <Input value={styleNo} disabled className="mt-1 bg-gray-50" />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">产品名称</Label>
                    <Input value={productName} disabled className="mt-1 bg-gray-50" />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">客户名称</Label>
                    <Input value={customerName} disabled className="mt-1 bg-gray-50" />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">订单总数量</Label>
                    <Input value={orderQuantity} disabled className="mt-1 bg-gray-50" />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">交货日期</Label>
                    <Input value={deliveryDate} disabled className="mt-1 bg-gray-50" />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">BOM版本</Label>
                    <Input value={bomVersion} disabled className="mt-1 bg-gray-50" />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">BOM状态</Label>
                    <Input value={status} disabled className="mt-1 bg-gray-50" />
                  </div>
                </div>
                
                {/* 订单工艺要求预览 */}
                {selectedOrder && (
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium mb-3">订单工艺要求（已自动带出）</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      {printEmbroidery && printEmbroidery.length > 0 && (
                        <div>
                          <Label className="text-gray-600">印绣花要求：</Label>
                          <span className="ml-2">{printEmbroidery.map(p => `${p.position}(${p.type})`).join('、')}</span>
                        </div>
                      )}
                      {washRequirement && (
                        <div>
                          <Label className="text-gray-600">洗水要求：</Label>
                          <span className="ml-2">{washRequirement.washType} - {washRequirement.colorEffect}</span>
                        </div>
                      )}
                      {packingRequirement && (
                        <div>
                          <Label className="text-gray-600">包装要求：</Label>
                          <span className="ml-2">{packingRequirement.packingMethod}</span>
                        </div>
                      )}
                      {tailRequirement && (
                        <div>
                          <Label className="text-gray-600">尾部要求：</Label>
                          <span className="ml-2">
                            {[
                              tailRequirement.trimThread && '剪线',
                              tailRequirement.ironing && '整烫',
                              tailRequirement.inspection && '查衫'
                            ].filter(Boolean).join('、')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </TabsContent>

              {/* 面料物料 */}
              <TabsContent value="fabric" className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label className="text-lg font-medium">面料物料明细</Label>
                  <Button size="sm" onClick={handleAddFabric}>
                    <Plus className="w-4 h-4 mr-1" />
                    添加面料
                  </Button>
                </div>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-32">物料编码</TableHead>
                        <TableHead className="w-32">物料名称</TableHead>
                        <TableHead className="w-24">规格</TableHead>
                        <TableHead className="w-20">单位</TableHead>
                        <TableHead className="w-24">使用部位</TableHead>
                        <TableHead className="w-20">门幅(cm)</TableHead>
                        <TableHead className="w-20">克重</TableHead>
                        <TableHead className="w-20">标准单耗</TableHead>
                        <TableHead className="w-16">损耗率%</TableHead>
                        <TableHead className="w-20">实际单耗</TableHead>
                        <TableHead className="w-24">总用量</TableHead>
                        <TableHead className="w-20">单价</TableHead>
                        <TableHead className="w-24">总成本</TableHead>
                        <TableHead className="w-16">操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {fabrics.map((fabric, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Select 
                              value={fabric.materialCode} 
                              onValueChange={(v) => handleSelectMaterial(index, v, 'fabric')}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="选择" />
                              </SelectTrigger>
                              <SelectContent>
                                {materials.filter(m => m.category === '面料').map(m => (
                                  <SelectItem key={m.id} value={m.materialCode}>{m.materialCode}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>{fabric.materialName || '-'}</TableCell>
                          <TableCell>{fabric.specification || '-'}</TableCell>
                          <TableCell>{fabric.unit}</TableCell>
                          <TableCell>
                            <Input
                              value={fabric.usagePart}
                              onChange={(e) => handleFabricChange(index, 'usagePart', e.target.value)}
                              placeholder="大身"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              value={fabric.fabricWidth || ''}
                              onChange={(e) => handleFabricChange(index, 'fabricWidth', parseFloat(e.target.value))}
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              value={fabric.fabricWeight || ''}
                              onChange={(e) => handleFabricChange(index, 'fabricWeight', parseFloat(e.target.value))}
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              step="0.0001"
                              value={fabric.standardConsumption || ''}
                              onChange={(e) => handleFabricChange(index, 'standardConsumption', parseFloat(e.target.value))}
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              value={fabric.lossRate}
                              onChange={(e) => handleFabricChange(index, 'lossRate', parseFloat(e.target.value))}
                            />
                          </TableCell>
                          <TableCell className="text-right">{fabric.actualConsumption.toFixed(4)}</TableCell>
                          <TableCell className="text-right">{fabric.totalUsage.toFixed(2)}</TableCell>
                          <TableCell className="text-right">{fabric.unitPrice}</TableCell>
                          <TableCell className="text-right font-medium">{fabric.totalCost.toFixed(2)}</TableCell>
                          <TableCell>
                            <Button size="sm" variant="ghost" onClick={() => handleRemoveFabric(index)}>
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <div className="text-right text-lg font-medium">
                  面料总成本：<span className="text-blue-600">¥{fabricTotalCost.toFixed(2)}</span>
                </div>
              </TabsContent>

              {/* 辅料物料 */}
              <TabsContent value="accessory" className="space-y-4">
                <div className="text-center py-8 text-gray-500 border rounded">
                  辅料物料明细（功能开发中）
                </div>
              </TabsContent>

              {/* 印绣花 */}
              <TabsContent value="print" className="space-y-4">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>位置</TableHead>
                        <TableHead>工艺类型</TableHead>
                        <TableHead>颜色数</TableHead>
                        <TableHead>尺寸(宽×高)</TableHead>
                        <TableHead>标准单耗</TableHead>
                        <TableHead>总用量</TableHead>
                        <TableHead>单价</TableHead>
                        <TableHead>总成本</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {prints.map((print, index) => (
                        <TableRow key={index}>
                          <TableCell>{print.usagePart}</TableCell>
                          <TableCell>{print.printType}</TableCell>
                          <TableCell>{print.colorCount}</TableCell>
                          <TableCell>{print.printWidth}×{print.printHeight}</TableCell>
                          <TableCell>{print.standardConsumption}</TableCell>
                          <TableCell>{print.totalUsage}</TableCell>
                          <TableCell>{print.unitPrice}</TableCell>
                          <TableCell className="font-medium">{print.totalCost.toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <div className="text-right text-lg font-medium">
                  印绣花总成本：<span className="text-blue-600">¥{printTotalCost.toFixed(2)}</span>
                </div>
              </TabsContent>

              {/* 洗水 */}
              <TabsContent value="wash" className="space-y-4">
                <div className="text-center py-8 text-gray-500 border rounded">
                  洗水物料明细（功能开发中）
                </div>
              </TabsContent>

              {/* 尾部 */}
              <TabsContent value="tail" className="space-y-4">
                <div className="text-center py-8 text-gray-500 border rounded">
                  尾部物料明细（功能开发中）
                </div>
              </TabsContent>

              {/* 包装 */}
              <TabsContent value="packing" className="space-y-4">
                <div className="text-center py-8 text-gray-500 border rounded">
                  包装物料明细（功能开发中）
                </div>
              </TabsContent>

              {/* 成本汇总 */}
              <TabsContent value="cost" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <Label className="text-gray-600">面料总成本</Label>
                    <div className="text-2xl font-bold text-blue-600 mt-1">¥{fabricTotalCost.toFixed(2)}</div>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <Label className="text-gray-600">辅料总成本</Label>
                    <div className="text-2xl font-bold text-green-600 mt-1">¥{accessoryTotalCost.toFixed(2)}</div>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <Label className="text-gray-600">印绣花总成本</Label>
                    <div className="text-2xl font-bold text-purple-600 mt-1">¥{printTotalCost.toFixed(2)}</div>
                  </div>
                  <div className="p-4 bg-orange-50 rounded-lg">
                    <Label className="text-gray-600">洗水总成本</Label>
                    <div className="text-2xl font-bold text-orange-600 mt-1">¥{washTotalCost.toFixed(2)}</div>
                  </div>
                  <div className="p-4 bg-pink-50 rounded-lg">
                    <Label className="text-gray-600">尾部总成本</Label>
                    <div className="text-2xl font-bold text-pink-600 mt-1">¥{tailTotalCost.toFixed(2)}</div>
                  </div>
                  <div className="p-4 bg-cyan-50 rounded-lg">
                    <Label className="text-gray-600">包装总成本</Label>
                    <div className="text-2xl font-bold text-cyan-600 mt-1">¥{packingTotalCost.toFixed(2)}</div>
                  </div>
                </div>
                
                <div className="mt-6 p-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg text-white">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <Label className="text-blue-100">单件产品成本</Label>
                      <div className="text-3xl font-bold mt-1">¥{pieceCost.toFixed(2)}</div>
                    </div>
                    <div>
                      <Label className="text-blue-100">订单总生产成本</Label>
                      <div className="text-3xl font-bold mt-1">¥{totalCost.toFixed(2)}</div>
                    </div>
                    <div>
                      <Label className="text-blue-100">订单总数量</Label>
                      <div className="text-3xl font-bold mt-1">{orderQuantity} 件</div>
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
