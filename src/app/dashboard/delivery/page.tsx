'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import {
  Truck,
  Plus,
  Search,
  RotateCcw,
  Download,
  Eye,
  Send,
  CheckCircle,
  XCircle,
  Package,
  MapPin,
  Phone,
  User,
} from 'lucide-react';
import {
  type DeliveryRecord,
  type DeliveryStatus,
  type DeliveryType,
  type DeliveryBox,
  getDeliveries,
  getDeliveryStats,
  saveDeliveryRecord,
  confirmDelivery,
  confirmReceived,
  cancelDelivery,
  generateDeliveryNo,
  initDeliveryData,
} from '@/types/delivery';
import { getOrders } from '@/types/order';
import { getCurrentUser } from '@/types/user';
import { logDelivery } from '@/types/log';

const statusColors: Record<DeliveryStatus, string> = {
  '待发货': 'bg-yellow-600 text-white',
  '已发货': 'bg-blue-600 text-white',
  '已签收': 'bg-green-600 text-white',
  '已取消': 'bg-gray-600 text-gray-400',
};

export default function DeliveryPage() {
  const router = useRouter();
  const [deliveries, setDeliveries] = useState<DeliveryRecord[]>([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, shipped: 0, received: 0 });
  
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchStatus, setSearchStatus] = useState('全部');
  
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [shipDialogOpen, setShipDialogOpen] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState<DeliveryRecord | null>(null);
  const [logisticsNo, setLogisticsNo] = useState('');
  
  const [alertMessage, setAlertMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // 新建发货单表单
  const [formData, setFormData] = useState({
    orderNo: '',
    customerName: '',
    customerAddress: '',
    customerContact: '',
    customerPhone: '',
    deliveryType: '快递发货' as DeliveryType,
    logisticsCompany: '',
    driverName: '',
    driverPhone: '',
    vehicleNo: '',
    deliveryDate: new Date().toISOString().split('T')[0],
    remark: '',
  });

  const [boxes, setBoxes] = useState<DeliveryBox[]>([
    { id: '1', boxNo: '', colorName: '', sizeName: '', quantity: 0, cartonSize: '60x40x30', grossWeight: 0, netWeight: 0 },
  ]);

  useEffect(() => {
    initDeliveryData();
    loadData();
  }, []);

  const loadData = () => {
    setDeliveries(getDeliveries());
    setStats(getDeliveryStats());
  };

  const filteredDeliveries = deliveries.filter(d => {
    if (searchKeyword && !d.deliveryNo.includes(searchKeyword) && !d.orderNo.includes(searchKeyword) && !d.customerName.includes(searchKeyword)) return false;
    if (searchStatus !== '全部' && d.status !== searchStatus) return false;
    return true;
  });

  const handleReset = () => {
    setSearchKeyword('');
    setSearchStatus('全部');
  };

  // 选择订单后自动填充客户信息
  const handleOrderSelect = (orderNo: string) => {
    setFormData(prev => ({ ...prev, orderNo }));
    // 这里可以根据订单号查询客户信息
  };

  const addBox = () => {
    setBoxes(prev => [...prev, {
      id: String(prev.length + 1),
      boxNo: '', colorName: '', sizeName: '', quantity: 0, cartonSize: '60x40x30', grossWeight: 0, netWeight: 0,
    }]);
  };

  const removeBox = (id: string) => {
    if (boxes.length > 1) {
      setBoxes(prev => prev.filter(b => b.id !== id));
    }
  };

  const updateBox = (id: string, field: string, value: string | number) => {
    setBoxes(prev => prev.map(box => box.id === id ? { ...box, [field]: value } : box));
  };

  const handleCreateDelivery = () => {
    if (!formData.orderNo || !formData.customerName || boxes.some(b => b.quantity <= 0)) {
      setAlertMessage({ type: 'error', message: '请填写完整信息' });
      return;
    }

    const user = getCurrentUser();
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const createdAt = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

    const record: DeliveryRecord = {
      id: Date.now().toString(),
      deliveryNo: generateDeliveryNo(),
      orderId: '',
      customerId: '',
      ...formData,
      boxes,
      totalBoxes: boxes.length,
      totalQuantity: boxes.reduce((sum, b) => sum + b.quantity, 0),
      totalGrossWeight: boxes.reduce((sum, b) => sum + b.grossWeight, 0),
      totalNetWeight: boxes.reduce((sum, b) => sum + b.netWeight, 0),
      status: '待发货',
      operator: user?.username || 'system',
      createdBy: user?.username || 'system',
      createdAt,
      updatedAt: createdAt,
    };

    saveDeliveryRecord(record);
    logDelivery(record.deliveryNo, record.orderNo, user?.id || 'system', user?.username || 'system');
    
    loadData();
    setCreateDialogOpen(false);
    resetFormData();
    setAlertMessage({ type: 'success', message: '发货单创建成功' });
    setTimeout(() => setAlertMessage(null), 3000);
  };

  const resetFormData = () => {
    setFormData({
      orderNo: '',
      customerName: '',
      customerAddress: '',
      customerContact: '',
      customerPhone: '',
      deliveryType: '快递发货',
      logisticsCompany: '',
      driverName: '',
      driverPhone: '',
      vehicleNo: '',
      deliveryDate: new Date().toISOString().split('T')[0],
      remark: '',
    });
    setBoxes([{ id: '1', boxNo: '', colorName: '', sizeName: '', quantity: 0, cartonSize: '60x40x30', grossWeight: 0, netWeight: 0 }]);
  };

  const handleViewDetail = (record: DeliveryRecord) => {
    setSelectedDelivery(record);
    setDetailDialogOpen(true);
  };

  const handleShip = (record: DeliveryRecord) => {
    setSelectedDelivery(record);
    setLogisticsNo(record.logisticsNo || '');
    setShipDialogOpen(true);
  };

  const handleConfirmShip = () => {
    if (!selectedDelivery || !logisticsNo) {
      setAlertMessage({ type: 'error', message: '请填写物流单号' });
      return;
    }
    
    if (confirmDelivery(selectedDelivery.id, logisticsNo)) {
      loadData();
      setShipDialogOpen(false);
      setAlertMessage({ type: 'success', message: '发货成功' });
    }
    setTimeout(() => setAlertMessage(null), 3000);
  };

  const handleReceive = (record: DeliveryRecord) => {
    if (confirmReceived(record.id)) {
      loadData();
      setAlertMessage({ type: 'success', message: '已确认签收' });
    }
    setTimeout(() => setAlertMessage(null), 3000);
  };

  const handleCancel = (record: DeliveryRecord) => {
    if (cancelDelivery(record.id)) {
      loadData();
      setAlertMessage({ type: 'success', message: '已取消发货' });
    }
    setTimeout(() => setAlertMessage(null), 3000);
  };

  const handleExport = () => {
    const csvContent = [
      ['发货单号', '订单号', '客户名称', '发货日期', '箱数', '件数', '毛重', '净重', '状态'].join(','),
      ...filteredDeliveries.map(d => [
        d.deliveryNo, d.orderNo, d.customerName, d.deliveryDate,
        d.totalBoxes, d.totalQuantity, d.totalGrossWeight.toFixed(2), d.totalNetWeight.toFixed(2), d.status
      ].join(','))
    ].join('\n');
    
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `发货记录_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <DashboardLayout>
      <div className="max-w-full mx-auto space-y-6">
        {alertMessage && (
          <div className={`p-4 rounded-lg ${alertMessage.type === 'success' ? 'bg-green-900 border border-green-700' : 'bg-red-900 border border-red-700'}`}>
            <span className="text-white">{alertMessage.message}</span>
          </div>
        )}

        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
              <Truck className="w-6 h-6 text-black" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">发货管理</h1>
              <p className="text-gray-400 text-sm">发货单管理、物流跟踪、签收确认</p>
            </div>
          </div>
          <Button onClick={() => setCreateDialogOpen(true)} className="bg-white text-black hover:bg-gray-200">
            <Plus className="w-4 h-4 mr-2" />新建发货单
          </Button>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-4 gap-4">
          <Card className="bg-gray-900 border-gray-700">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-lg">
                  <Package className="w-5 h-5 text-black" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">总发货单</p>
                  <p className="text-2xl font-bold text-white">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gray-900 border-gray-700">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-500 rounded-lg">
                  <Truck className="w-5 h-5 text-black" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">待发货</p>
                  <p className="text-2xl font-bold text-yellow-400">{stats.pending}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gray-900 border-gray-700">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500 rounded-lg">
                  <Send className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">运输中</p>
                  <p className="text-2xl font-bold text-blue-400">{stats.shipped}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gray-900 border-gray-700">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">已签收</p>
                  <p className="text-2xl font-bold text-green-400">{stats.received}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 查询区 */}
        <Card className="bg-gray-900 border-gray-700">
          <CardContent className="pt-6">
            <div className="flex gap-4 items-end">
              <div>
                <Label className="text-gray-400">关键词</Label>
                <Input
                  placeholder="发货单号/订单号/客户"
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  className="mt-1 bg-gray-800 border-gray-600 text-white w-48"
                />
              </div>
              <div>
                <Label className="text-gray-400">状态</Label>
                <Select value={searchStatus} onValueChange={setSearchStatus}>
                  <SelectTrigger className="mt-1 bg-gray-800 border-gray-600 text-white w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="全部">全部</SelectItem>
                    <SelectItem value="待发货">待发货</SelectItem>
                    <SelectItem value="已发货">已发货</SelectItem>
                    <SelectItem value="已签收">已签收</SelectItem>
                    <SelectItem value="已取消">已取消</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={loadData} className="bg-white text-black hover:bg-gray-200">
                <Search className="w-4 h-4 mr-1" />查询
              </Button>
              <Button variant="outline" onClick={handleReset} className="border-gray-600 text-gray-300">
                <RotateCcw className="w-4 h-4 mr-1" />重置
              </Button>
              <Button variant="outline" onClick={handleExport} className="border-gray-600 text-gray-300">
                <Download className="w-4 h-4 mr-1" />导出
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 数据表格 */}
        <Card className="bg-gray-900 border-gray-700">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-700">
                  <TableHead className="text-gray-400">#</TableHead>
                  <TableHead className="text-gray-400">发货单号</TableHead>
                  <TableHead className="text-gray-400">订单号</TableHead>
                  <TableHead className="text-gray-400">客户名称</TableHead>
                  <TableHead className="text-gray-400">发货方式</TableHead>
                  <TableHead className="text-gray-400 text-right">箱数</TableHead>
                  <TableHead className="text-gray-400 text-right">件数</TableHead>
                  <TableHead className="text-gray-400">发货日期</TableHead>
                  <TableHead className="text-gray-400">状态</TableHead>
                  <TableHead className="text-gray-400 w-40">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDeliveries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-12 text-gray-500">暂无发货记录</TableCell>
                  </TableRow>
                ) : (
                  filteredDeliveries.map((d, index) => (
                    <TableRow key={d.id} className="border-gray-700 hover:bg-gray-800">
                      <TableCell className="text-gray-500">{index + 1}</TableCell>
                      <TableCell className="text-white font-mono">{d.deliveryNo}</TableCell>
                      <TableCell className="text-gray-300">{d.orderNo}</TableCell>
                      <TableCell className="text-gray-300">{d.customerName}</TableCell>
                      <TableCell className="text-gray-300">{d.deliveryType}</TableCell>
                      <TableCell className="text-right text-white">{d.totalBoxes}</TableCell>
                      <TableCell className="text-right text-white">{d.totalQuantity}</TableCell>
                      <TableCell className="text-gray-300">{d.deliveryDate}</TableCell>
                      <TableCell>
                        <Badge className={statusColors[d.status]}>{d.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost" onClick={() => handleViewDetail(d)} className="text-gray-400 hover:text-white">
                            <Eye className="w-4 h-4" />
                          </Button>
                          {d.status === '待发货' && (
                            <Button size="sm" variant="outline" onClick={() => handleShip(d)} className="border-blue-600 text-blue-400">
                              发货
                            </Button>
                          )}
                          {d.status === '已发货' && (
                            <Button size="sm" variant="outline" onClick={() => handleReceive(d)} className="border-green-600 text-green-400">
                              签收
                            </Button>
                          )}
                          {(d.status === '待发货' || d.status === '已发货') && (
                            <Button size="sm" variant="ghost" onClick={() => handleCancel(d)} className="text-red-400">
                              <XCircle className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            <div className="p-4 border-t border-gray-700 text-gray-400 text-sm">
              共 {filteredDeliveries.length} 条记录
            </div>
          </CardContent>
        </Card>

        {/* 新建发货单弹窗 */}
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogContent className="max-w-4xl bg-gray-900 border-gray-700">
            <DialogHeader>
              <DialogTitle className="text-white">新建发货单</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <Label className="text-gray-400">订单号 *</Label>
                  <Input value={formData.orderNo} onChange={(e) => handleOrderSelect(e.target.value)} placeholder="输入订单号" className="mt-1 bg-gray-800 border-gray-600 text-white" />
                </div>
                <div>
                  <Label className="text-gray-400">客户名称 *</Label>
                  <Input value={formData.customerName} onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))} placeholder="客户名称" className="mt-1 bg-gray-800 border-gray-600 text-white" />
                </div>
                <div>
                  <Label className="text-gray-400">联系电话</Label>
                  <Input value={formData.customerPhone} onChange={(e) => setFormData(prev => ({ ...prev, customerPhone: e.target.value }))} placeholder="联系电话" className="mt-1 bg-gray-800 border-gray-600 text-white" />
                </div>
                <div>
                  <Label className="text-gray-400">联系人</Label>
                  <Input value={formData.customerContact} onChange={(e) => setFormData(prev => ({ ...prev, customerContact: e.target.value }))} placeholder="联系人" className="mt-1 bg-gray-800 border-gray-600 text-white" />
                </div>
                <div className="col-span-4">
                  <Label className="text-gray-400">收货地址</Label>
                  <Input value={formData.customerAddress} onChange={(e) => setFormData(prev => ({ ...prev, customerAddress: e.target.value }))} placeholder="详细地址" className="mt-1 bg-gray-800 border-gray-600 text-white" />
                </div>
                <div>
                  <Label className="text-gray-400">发货方式</Label>
                  <Select value={formData.deliveryType} onValueChange={(v) => setFormData(prev => ({ ...prev, deliveryType: v as DeliveryType }))}>
                    <SelectTrigger className="mt-1 bg-gray-800 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="快递发货">快递发货</SelectItem>
                      <SelectItem value="零担发货">零担发货</SelectItem>
                      <SelectItem value="整车发货">整车发货</SelectItem>
                      <SelectItem value="自提">自提</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-gray-400">物流公司</Label>
                  <Input value={formData.logisticsCompany} onChange={(e) => setFormData(prev => ({ ...prev, logisticsCompany: e.target.value }))} placeholder="物流公司" className="mt-1 bg-gray-800 border-gray-600 text-white" />
                </div>
                <div>
                  <Label className="text-gray-400">司机姓名</Label>
                  <Input value={formData.driverName} onChange={(e) => setFormData(prev => ({ ...prev, driverName: e.target.value }))} placeholder="司机姓名" className="mt-1 bg-gray-800 border-gray-600 text-white" />
                </div>
                <div>
                  <Label className="text-gray-400">司机电话</Label>
                  <Input value={formData.driverPhone} onChange={(e) => setFormData(prev => ({ ...prev, driverPhone: e.target.value }))} placeholder="司机电话" className="mt-1 bg-gray-800 border-gray-600 text-white" />
                </div>
                <div>
                  <Label className="text-gray-400">发货日期</Label>
                  <Input type="date" value={formData.deliveryDate} onChange={(e) => setFormData(prev => ({ ...prev, deliveryDate: e.target.value }))} className="mt-1 bg-gray-800 border-gray-600 text-white" />
                </div>
                <div className="col-span-3">
                  <Label className="text-gray-400">备注</Label>
                  <Input value={formData.remark} onChange={(e) => setFormData(prev => ({ ...prev, remark: e.target.value }))} placeholder="备注" className="mt-1 bg-gray-800 border-gray-600 text-white" />
                </div>
              </div>

              {/* 箱明细 */}
              <div className="border-t border-gray-700 pt-4">
                <div className="flex justify-between items-center mb-3">
                  <Label className="text-white font-medium">装箱明细</Label>
                  <Button size="sm" onClick={addBox} className="bg-gray-700 text-white hover:bg-gray-600">
                    <Plus className="w-4 h-4 mr-1" />添加箱
                  </Button>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-700">
                      <TableHead className="text-gray-400">箱号</TableHead>
                      <TableHead className="text-gray-400">颜色</TableHead>
                      <TableHead className="text-gray-400">尺码</TableHead>
                      <TableHead className="text-gray-400 text-right">件数</TableHead>
                      <TableHead className="text-gray-400">纸箱尺寸</TableHead>
                      <TableHead className="text-gray-400 text-right">毛重(KG)</TableHead>
                      <TableHead className="text-gray-400 text-right">净重(KG)</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {boxes.map((box) => (
                      <TableRow key={box.id} className="border-gray-700">
                        <TableCell>
                          <Input value={box.boxNo} onChange={(e) => updateBox(box.id, 'boxNo', e.target.value)} placeholder="箱号" className="h-8 bg-gray-800 border-gray-600 text-white" />
                        </TableCell>
                        <TableCell>
                          <Input value={box.colorName} onChange={(e) => updateBox(box.id, 'colorName', e.target.value)} placeholder="颜色" className="h-8 bg-gray-800 border-gray-600 text-white" />
                        </TableCell>
                        <TableCell>
                          <Input value={box.sizeName} onChange={(e) => updateBox(box.id, 'sizeName', e.target.value)} placeholder="尺码" className="h-8 bg-gray-800 border-gray-600 text-white" />
                        </TableCell>
                        <TableCell>
                          <Input type="number" value={box.quantity || ''} onChange={(e) => updateBox(box.id, 'quantity', Number(e.target.value))} className="h-8 w-20 text-right bg-gray-800 border-gray-600 text-white" />
                        </TableCell>
                        <TableCell>
                          <Input value={box.cartonSize} onChange={(e) => updateBox(box.id, 'cartonSize', e.target.value)} placeholder="尺寸" className="h-8 w-24 bg-gray-800 border-gray-600 text-white" />
                        </TableCell>
                        <TableCell>
                          <Input type="number" step="0.01" value={box.grossWeight || ''} onChange={(e) => updateBox(box.id, 'grossWeight', Number(e.target.value))} className="h-8 w-20 text-right bg-gray-800 border-gray-600 text-white" />
                        </TableCell>
                        <TableCell>
                          <Input type="number" step="0.01" value={box.netWeight || ''} onChange={(e) => updateBox(box.id, 'netWeight', Number(e.target.value))} className="h-8 w-20 text-right bg-gray-800 border-gray-600 text-white" />
                        </TableCell>
                        <TableCell>
                          <Button size="sm" variant="ghost" onClick={() => removeBox(box.id)} disabled={boxes.length === 1}>
                            <XCircle className="w-4 h-4 text-red-500" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateDialogOpen(false)} className="border-gray-600 text-gray-300">取消</Button>
              <Button onClick={handleCreateDelivery} className="bg-white text-black hover:bg-gray-200">创建</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* 详情弹窗 */}
        <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
          <DialogContent className="max-w-3xl bg-gray-900 border-gray-700">
            <DialogHeader>
              <DialogTitle className="text-white">发货单详情</DialogTitle>
            </DialogHeader>
            {selectedDelivery && (
              <div className="space-y-4">
                <div className="grid grid-cols-4 gap-3">
                  <div className="p-3 bg-gray-800 rounded-lg">
                    <span className="text-gray-400 text-xs">发货单号</span>
                    <p className="text-white font-mono">{selectedDelivery.deliveryNo}</p>
                  </div>
                  <div className="p-3 bg-gray-800 rounded-lg">
                    <span className="text-gray-400 text-xs">订单号</span>
                    <p className="text-white">{selectedDelivery.orderNo}</p>
                  </div>
                  <div className="p-3 bg-gray-800 rounded-lg">
                    <span className="text-gray-400 text-xs">状态</span>
                    <Badge className={statusColors[selectedDelivery.status]}>{selectedDelivery.status}</Badge>
                  </div>
                  <div className="p-3 bg-gray-800 rounded-lg">
                    <span className="text-gray-400 text-xs">发货方式</span>
                    <p className="text-white">{selectedDelivery.deliveryType}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 p-3 bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-400">客户：</span>
                    <span className="text-white">{selectedDelivery.customerName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-400">电话：</span>
                    <span className="text-white">{selectedDelivery.customerPhone}</span>
                  </div>
                  <div className="flex items-center gap-2 col-span-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-400">地址：</span>
                    <span className="text-white">{selectedDelivery.customerAddress}</span>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-3 p-3 bg-gray-800 rounded-lg">
                  <div className="text-center">
                    <p className="text-gray-400 text-xs">总箱数</p>
                    <p className="text-xl font-bold text-white">{selectedDelivery.totalBoxes}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-400 text-xs">总件数</p>
                    <p className="text-xl font-bold text-white">{selectedDelivery.totalQuantity}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-400 text-xs">毛重(KG)</p>
                    <p className="text-xl font-bold text-white">{selectedDelivery.totalGrossWeight.toFixed(2)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-400 text-xs">净重(KG)</p>
                    <p className="text-xl font-bold text-white">{selectedDelivery.totalNetWeight.toFixed(2)}</p>
                  </div>
                </div>
                {selectedDelivery.logisticsNo && (
                  <div className="p-3 bg-blue-900/30 rounded-lg border border-blue-700">
                    <span className="text-blue-400">物流单号：</span>
                    <span className="text-white font-mono">{selectedDelivery.logisticsNo}</span>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* 发货确认弹窗 */}
        <Dialog open={shipDialogOpen} onOpenChange={setShipDialogOpen}>
          <DialogContent className="bg-gray-900 border-gray-700">
            <DialogHeader>
              <DialogTitle className="text-white">确认发货</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label className="text-gray-400">物流单号 *</Label>
                <Input
                  value={logisticsNo}
                  onChange={(e) => setLogisticsNo(e.target.value)}
                  placeholder="输入物流单号"
                  className="mt-1 bg-gray-800 border-gray-600 text-white"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShipDialogOpen(false)} className="border-gray-600 text-gray-300">取消</Button>
              <Button onClick={handleConfirmShip} className="bg-white text-black hover:bg-gray-200">确认发货</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
