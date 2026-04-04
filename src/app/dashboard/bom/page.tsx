'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { BOM, BOMStatus, BOMType, initBOMData, getBOMs, saveBOM, deleteBOM, getOrdersForBOM, getBOMByOrderNo, generateBOMNo } from '@/types/bom';
import { Order } from '@/types/order';

// BOM管理页面
const BOMPage = () => {
  const [boms, setBoms] = useState<BOM[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentBOM, setCurrentBOM] = useState<BOM | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // 初始化数据
  useEffect(() => {
    initBOMData();
    loadData();
  }, []);

  // 加载数据
  const loadData = () => {
    setIsLoading(true);
    setTimeout(() => {
      const loadedBOMs = getBOMs();
      const availableOrders = getOrdersForBOM();
      setBoms(loadedBOMs);
      setOrders(availableOrders);
      setIsLoading(false);
    }, 500);
  };

  // 处理添加工单
  const handleAddBOM = () => {
    setSelectedOrder('');
    setCurrentBOM(null);
    setIsModalOpen(true);
  };

  // 处理选择订单
  const handleOrderSelect = (orderId: string) => {
    setSelectedOrder(orderId);
    const order = orders.find(o => o.id === orderId);
    if (order) {
      // 检查订单是否已有BOM
      const existingBOM = getBOMByOrderNo(order.orderNo);
      if (existingBOM) {
        setCurrentBOM(existingBOM);
        setError('该订单已有BOM，将显示现有BOM信息');
        setTimeout(() => setError(null), 3000);
      } else {
        // 创建新BOM
        const newBOM: BOM = {
          id: `bom_${Date.now()}`,
          bomNo: generateBOMNo(order.orderNo),
          orderNo: order.orderNo,
          styleNo: order.styleNo || '',
          productName: order.productName,
          customerName: order.customerName,
          orderQuantity: order.totalQuantity,
          colorSizeMatrix: order.colorSizeMatrix || [],
          deliveryDate: order.deliveryDate || '',
          bomVersion: '01',
          bomType: '订单BOM' as BOMType,
          status: '草稿' as BOMStatus,
          printEmbroidery: order.printEmbroidery || [],
          washRequirement: order.washRequirement || {
            washType: '普洗',
            colorEffect: '原色',
            shrinkageRate: '≤3%',
            ecoRequirement: []
          },
          packingRequirement: order.packingRequirement || {
            packingMethod: '独立包装',
            peBagSize: '自动匹配',
            cartonSize: '60×40×30cm',
            piecesPerCarton: 50,
            sizeRatio: '1:2:2:1',
            cartonLabelType: '英文',
            sticker: '',
            barcode: '',
            moistureProof: false,
            desiccant: false,
            tissuePaper: false
          },
          tailRequirement: order.tailRequirement || {
            trimThread: true,
            ironing: true,
            inspection: true,
            spareButtons: 0,
            spareThread: '',
            hangTag: '',
            hangRope: '',
            foldMethod: '三折'
          },
          fabrics: [],
          accessories: [],
          prints: [],
          washes: [],
          tails: [],
          packings: [],
          fabricTotalCost: 0,
          accessoryTotalCost: 0,
          printTotalCost: 0,
          washTotalCost: 0,
          tailTotalCost: 0,
          packingTotalCost: 0,
          totalCost: 0,
          pieceCost: 0,
          createdBy: 'admin',
          createdAt: new Date().toISOString()
        };
        setCurrentBOM(newBOM);
      }
    }
  };

  // 处理保存BOM
  const handleSaveBOM = () => {
    if (!currentBOM) return;

    try {
      saveBOM(currentBOM);
      loadData();
      setIsModalOpen(false);
      setSuccess('BOM保存成功');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('保存失败，请重试');
      setTimeout(() => setError(null), 3000);
    }
  };

  // 处理删除BOM
  const handleDeleteBOM = (bom: BOM) => {
    if (window.confirm(`确定要删除BOM ${bom.bomNo}吗？`)) {
      try {
        deleteBOM(bom.id);
        loadData();
        setSuccess('BOM删除成功');
        setTimeout(() => setSuccess(null), 3000);
      } catch (err) {
        setError('删除失败，请重试');
        setTimeout(() => setError(null), 3000);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">BOM管理</h1>
          <p className="text-gray-500">管理物料清单，支持服装面料/辅料/配件的BOM录入、版本管理、成本核算</p>
        </div>
        <Button onClick={handleAddBOM}>创建BOM</Button>
      </div>

      {/* 消息提示 */}
      {error && (
        <Alert variant="destructive">
          <AlertTitle>错误</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {success && (
        <Alert variant="default">
          <AlertTitle>成功</AlertTitle>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* BOM列表 */}
      <Card>
        <CardHeader>
          <CardTitle>BOM列表</CardTitle>
          <CardDescription>查看和管理所有BOM</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, index) => (
                <div key={index} className="space-y-2">
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>BOM编号</TableHead>
                  <TableHead>订单编号</TableHead>
                  <TableHead>产品名称</TableHead>
                  <TableHead>客户名称</TableHead>
                  <TableHead>数量</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>版本</TableHead>
                  <TableHead>创建人</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {boms.map((bom) => (
                  <TableRow key={bom.id}>
                    <TableCell>{bom.bomNo}</TableCell>
                    <TableCell>{bom.orderNo}</TableCell>
                    <TableCell>{bom.productName}</TableCell>
                    <TableCell>{bom.customerName}</TableCell>
                    <TableCell>{bom.orderQuantity}</TableCell>
                    <TableCell>
                      <Badge variant={
                        bom.status === '已审核' ? 'default' :
                        bom.status === '待审核' ? 'secondary' :
                        bom.status === '草稿' ? 'outline' : 'destructive'
                      }>
                        {bom.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{bom.bomVersion}</TableCell>
                    <TableCell>{bom.createdBy}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button size="sm" onClick={() => {
                          setCurrentBOM(bom);
                          setIsModalOpen(true);
                        }}>
                          查看
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDeleteBOM(bom)}>
                          删除
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* 创建/编辑BOM模态框 */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-4xl">
            <CardHeader>
              <CardTitle>{currentBOM ? '编辑BOM' : '创建BOM'}</CardTitle>
              <CardDescription>{currentBOM ? '修改BOM信息' : '选择订单并创建BOM'}</CardDescription>
            </CardHeader>
            <CardContent>
              {!selectedOrder ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="orderSelect">选择订单</Label>
                    <Select value={selectedOrder} onValueChange={handleOrderSelect}>
                      <SelectTrigger id="orderSelect">
                        <SelectValue placeholder="选择订单" />
                      </SelectTrigger>
                      <SelectContent>
                        {orders.map((order) => (
                          <SelectItem key={order.id} value={order.id}>
                            {order.orderNo} - {order.productName} ({order.totalQuantity}件)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ) : currentBOM ? (
                <div className="space-y-6">
                  {/* BOM基本信息 */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>BOM编号</Label>
                      <Input value={currentBOM.bomNo} readOnly />
                    </div>
                    <div className="space-y-2">
                      <Label>订单编号</Label>
                      <Input value={currentBOM.orderNo} readOnly />
                    </div>
                    <div className="space-y-2">
                      <Label>产品名称</Label>
                      <Input value={currentBOM.productName} readOnly />
                    </div>
                    <div className="space-y-2">
                      <Label>客户名称</Label>
                      <Input value={currentBOM.customerName} readOnly />
                    </div>
                    <div className="space-y-2">
                      <Label>数量</Label>
                      <Input value={currentBOM.orderQuantity} readOnly />
                    </div>
                    <div className="space-y-2">
                      <Label>状态</Label>
                      <Input value={currentBOM.status} readOnly />
                    </div>
                  </div>
                  
                  {/* 成本信息 */}
                  <div>
                    <h3 className="text-lg font-medium mb-4">成本信息</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>面料总成本</Label>
                        <Input value={`¥${currentBOM.fabricTotalCost.toFixed(2)}`} readOnly />
                      </div>
                      <div className="space-y-2">
                        <Label>辅料总成本</Label>
                        <Input value={`¥${currentBOM.accessoryTotalCost.toFixed(2)}`} readOnly />
                      </div>
                      <div className="space-y-2">
                        <Label>印绣花总成本</Label>
                        <Input value={`¥${currentBOM.printTotalCost.toFixed(2)}`} readOnly />
                      </div>
                      <div className="space-y-2">
                        <Label>洗水总成本</Label>
                        <Input value={`¥${currentBOM.washTotalCost.toFixed(2)}`} readOnly />
                      </div>
                      <div className="space-y-2">
                        <Label>尾部总成本</Label>
                        <Input value={`¥${currentBOM.tailTotalCost.toFixed(2)}`} readOnly />
                      </div>
                      <div className="space-y-2">
                        <Label>包装总成本</Label>
                        <Input value={`¥${currentBOM.packingTotalCost.toFixed(2)}`} readOnly />
                      </div>
                      <div className="space-y-2 col-span-2">
                        <Label>总成本</Label>
                        <Input value={`¥${currentBOM.totalCost.toFixed(2)}`} readOnly />
                      </div>
                      <div className="space-y-2 col-span-2">
                        <Label>单件成本</Label>
                        <Input value={`¥${currentBOM.pieceCost.toFixed(4)}`} readOnly />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                      取消
                    </Button>
                    <Button onClick={handleSaveBOM}>
                      保存BOM
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center py-8">
                  <Skeleton className="h-8 w-48" />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default BOMPage;
