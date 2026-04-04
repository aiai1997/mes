'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Save, Plus, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getOrders, type Order } from '@/types/order';
import { type OutsourceType } from '@/types/outsource';
import { getSuppliers, type Supplier } from '@/types/partner';

export default function OutsourceFormPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  
  const [formData, setFormData] = useState({
    outsourceNo: 'WX' + Date.now(),
    outsourceType: '印花' as OutsourceType,
    orderId: '',
    orderNo: '',
    styleNo: '',
    supplierId: '',
    supplierName: '',
    sendDate: new Date().toISOString().split('T')[0],
    expectedReturnDate: '',
    remark: '',
  });
  
  const [details, setDetails] = useState([
    { id: '1', color: '', size: '', sendQuantity: 0, unitPrice: 0, remark: '' },
  ]);
  
  useEffect(() => {
    setOrders(getOrders().filter(o => o.status !== '已完成'));
    setSuppliers(getSuppliers().filter(s => s.status === '启用'));
  }, []);
  
  const handleOrderChange = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (order) {
      setFormData(prev => ({
        ...prev,
        orderId: order.id,
        orderNo: order.orderNo,
        styleNo: order.styleNo,
      }));
    }
  };
  
  const handleSupplierChange = (supplierId: string) => {
    const supplier = suppliers.find(s => s.id === supplierId);
    if (supplier) {
      setFormData(prev => ({
        ...prev,
        supplierId: supplier.id,
        supplierName: supplier.supplierName,
      }));
    }
  };
  
  const addDetail = () => {
    setDetails(prev => [...prev, {
      id: String(prev.length + 1),
      color: '',
      size: '',
      sendQuantity: 0,
      unitPrice: 0,
      remark: '',
    }]);
  };
  
  const removeDetail = (id: string) => {
    if (details.length > 1) {
      setDetails(prev => prev.filter(d => d.id !== id));
    }
  };
  
  const updateDetail = (id: string, field: string, value: string | number) => {
    setDetails(prev => prev.map(d => 
      d.id === id ? { ...d, [field]: value } : d
    ));
  };
  
  const handleSave = () => {
    // 这里应该调用保存逻辑
    alert('保存成功！');
    router.push('/dashboard/outsource');
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* 头部 */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">新增外协单</h1>
            <p className="text-muted-foreground text-sm">填写外协加工信息</p>
          </div>
        </div>
        
        {/* 基本信息 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">基本信息</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <Label>外协单号</Label>
                <Input value={formData.outsourceNo} disabled className="mt-1" />
              </div>
              <div>
                <Label>外协类型 <span className="text-red-500">*</span></Label>
                <Select value={formData.outsourceType} onValueChange={(v) => setFormData(prev => ({ ...prev, outsourceType: v as OutsourceType }))}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="印花">印花</SelectItem>
                    <SelectItem value="绣花">绣花</SelectItem>
                    <SelectItem value="洗水">洗水</SelectItem>
                    <SelectItem value="缝制">缝制</SelectItem>
                    <SelectItem value="整烫">整烫</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>关联订单 <span className="text-red-500">*</span></Label>
                <Select onValueChange={handleOrderChange}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="请选择订单" />
                  </SelectTrigger>
                  <SelectContent>
                    {orders.map(order => (
                      <SelectItem key={order.id} value={order.id}>
                        {order.orderNo} - {order.styleNo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>款号</Label>
                <Input value={formData.styleNo} disabled className="mt-1" />
              </div>
              <div>
                <Label>外协供应商 <span className="text-red-500">*</span></Label>
                <Select onValueChange={handleSupplierChange}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="请选择供应商" />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers.map(s => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.supplierName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>外发日期 <span className="text-red-500">*</span></Label>
                <Input type="date" value={formData.sendDate} onChange={(e) => setFormData(prev => ({ ...prev, sendDate: e.target.value }))} className="mt-1" />
              </div>
              <div>
                <Label>预计回货日期</Label>
                <Input type="date" value={formData.expectedReturnDate} onChange={(e) => setFormData(prev => ({ ...prev, expectedReturnDate: e.target.value }))} className="mt-1" />
              </div>
              <div className="col-span-2 md:col-span-4">
                <Label>备注</Label>
                <Textarea value={formData.remark} onChange={(e) => setFormData(prev => ({ ...prev, remark: e.target.value }))} className="mt-1" rows={2} />
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* 明细信息 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">明细信息</CardTitle>
            <Button size="sm" onClick={addDetail} className="gap-2">
              <Plus className="w-4 h-4" />添加明细
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>颜色</TableHead>
                    <TableHead>尺码</TableHead>
                    <TableHead className="text-right">外发数量</TableHead>
                    <TableHead className="text-right">加工单价</TableHead>
                    <TableHead className="text-right">加工费</TableHead>
                    <TableHead>备注</TableHead>
                    <TableHead className="w-16">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {details.map((detail) => (
                    <TableRow key={detail.id}>
                      <TableCell>
                        <Input value={detail.color} onChange={(e) => updateDetail(detail.id, 'color', e.target.value)} placeholder="颜色" />
                      </TableCell>
                      <TableCell>
                        <Input value={detail.size} onChange={(e) => updateDetail(detail.id, 'size', e.target.value)} placeholder="尺码" />
                      </TableCell>
                      <TableCell>
                        <Input type="number" value={detail.sendQuantity || ''} onChange={(e) => updateDetail(detail.id, 'sendQuantity', Number(e.target.value))} className="text-right" />
                      </TableCell>
                      <TableCell>
                        <Input type="number" step="0.01" value={detail.unitPrice || ''} onChange={(e) => updateDetail(detail.id, 'unitPrice', Number(e.target.value))} className="text-right" />
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        ¥{(detail.sendQuantity * detail.unitPrice).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Input value={detail.remark} onChange={(e) => updateDetail(detail.id, 'remark', e.target.value)} placeholder="备注" />
                      </TableCell>
                      <TableCell>
                        <Button size="sm" variant="ghost" onClick={() => removeDetail(detail.id)} disabled={details.length === 1}>
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="p-4 border-t flex justify-between items-center">
              <div className="text-muted-foreground">
                合计外发数量: <span className="font-bold text-foreground">{details.reduce((sum, d) => sum + d.sendQuantity, 0)}</span> 件
              </div>
              <div className="text-lg">
                合计加工费: <span className="font-bold text-green-600">¥{details.reduce((sum, d) => sum + d.sendQuantity * d.unitPrice, 0).toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* 操作按钮 */}
        <div className="flex justify-end gap-4">
          <Button variant="outline" onClick={() => router.back()}>取消</Button>
          <Button onClick={handleSave} className="gap-2">
            <Save className="w-4 h-4" />保存
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
