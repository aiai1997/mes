'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Save, Inbox, Send } from 'lucide-react';
import {
  type CustomerMaterial,
  type CustomerMaterialType,
  getCustomerMaterials,
  saveCustomerMaterial,
  getWarehouses,
  initMiscData,
} from '@/types/misc';
import { getCustomers, type Customer } from '@/types/partner';
import { getOrders, type Order } from '@/types/order';

export default function CustomerMaterialCreatePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const typeParam = searchParams.get('type');
  
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [warehouses, setWarehouses] = useState<{ id: string; name: string }[]>([]);
  
  const [formData, setFormData] = useState({
    materialNo: '',
    materialName: '',
    materialType: (typeParam === 'outsource' ? '委外加工' : '客供料') as CustomerMaterialType,
    customerId: '',
    customerName: '',
    unit: '',
    orderNo: '',
    totalQuantity: 0,
    warehouseId: '',
    warehouseName: '',
    isCostExcluded: true,
    remark: '',
  });

  useEffect(() => {
    initMiscData();
    loadData();
  }, []);

  const loadData = () => {
    setCustomers(getCustomers());
    setOrders(getOrders());
    setWarehouses(getWarehouses().map(w => ({ id: w.id, name: w.name })));
  };

  const handleCustomerChange = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    setFormData({
      ...formData,
      customerId,
      customerName: customer?.customerName || '',
    });
  };

  const handleWarehouseChange = (warehouseId: string) => {
    const warehouse = warehouses.find(w => w.id === warehouseId);
    setFormData({
      ...formData,
      warehouseId,
      warehouseName: warehouse?.name || '',
    });
  };

  const handleSubmit = () => {
    if (!formData.materialNo || !formData.materialName || !formData.customerId) {
      alert('请填写必填项：物料编号、物料名称、客户');
      return;
    }

    const material: CustomerMaterial = {
      id: `CM${Date.now()}`,
      materialNo: formData.materialNo,
      materialName: formData.materialName,
      materialType: formData.materialType,
      customerId: formData.customerId,
      customerName: formData.customerName,
      unit: formData.unit,
      orderNo: formData.orderNo,
      totalQuantity: formData.totalQuantity,
      receivedQuantity: 0,
      issuedQuantity: 0,
      usedQuantity: 0,
      remainingQuantity: formData.totalQuantity,
      warehouseId: formData.warehouseId,
      warehouseName: formData.warehouseName,
      status: '待收货',
      isCostExcluded: formData.isCostExcluded,
      remark: formData.remark,
      createdAt: new Date().toLocaleString('zh-CN'),
    };

    saveCustomerMaterial(material);
    router.push('/dashboard/customer-material');
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* 头部 */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard/customer-material')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">
              {formData.materialType === '客供料' ? '客供料入库' : '委外发料'}
            </h1>
            <p className="text-muted-foreground">
              {formData.materialType === '客供料' ? '录入客户提供的物料信息' : '录入委外加工物料发料信息'}
            </p>
          </div>
        </div>

        {/* 表单 */}
        <Card>
          <CardHeader>
            <CardTitle>基本信息</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>物料类型</Label>
                <Select
                  value={formData.materialType}
                  onValueChange={(v) => setFormData({ ...formData, materialType: v as CustomerMaterialType })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="客供料">客供料</SelectItem>
                    <SelectItem value="委外加工">委外加工</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>物料编号 *</Label>
                <Input
                  value={formData.materialNo}
                  onChange={(e) => setFormData({ ...formData, materialNo: e.target.value })}
                  placeholder="请输入物料编号"
                />
              </div>

              <div className="space-y-2">
                <Label>物料名称 *</Label>
                <Input
                  value={formData.materialName}
                  onChange={(e) => setFormData({ ...formData, materialName: e.target.value })}
                  placeholder="请输入物料名称"
                />
              </div>

              <div className="space-y-2">
                <Label>客户 *</Label>
                <Select value={formData.customerId} onValueChange={handleCustomerChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="请选择客户" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.customerName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>关联订单</Label>
                <Select
                  value={formData.orderNo}
                  onValueChange={(v) => setFormData({ ...formData, orderNo: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="请选择订单" />
                  </SelectTrigger>
                  <SelectContent>
                    {orders.map(o => (
                      <SelectItem key={o.id} value={o.orderNo}>{o.orderNo} - {o.styleNo}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>单位</Label>
                <Input
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  placeholder="如：米、条、个"
                />
              </div>

              <div className="space-y-2">
                <Label>{formData.materialType === '客供料' ? '应收数量' : '发料数量'} *</Label>
                <Input
                  type="number"
                  value={formData.totalQuantity || ''}
                  onChange={(e) => setFormData({ ...formData, totalQuantity: Number(e.target.value) })}
                  placeholder="请输入数量"
                />
              </div>

              <div className="space-y-2">
                <Label>仓库</Label>
                <Select value={formData.warehouseId} onValueChange={handleWarehouseChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="请选择仓库" />
                  </SelectTrigger>
                  <SelectContent>
                    {warehouses.map(w => (
                      <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-4">
              <Switch
                checked={formData.isCostExcluded}
                onCheckedChange={(v) => setFormData({ ...formData, isCostExcluded: v })}
              />
              <Label>不计入成本（客供料默认不计入成本）</Label>
            </div>
          </CardContent>
        </Card>

        {/* 备注 */}
        <Card>
          <CardHeader>
            <CardTitle>备注</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={formData.remark}
              onChange={(e) => setFormData({ ...formData, remark: e.target.value })}
              placeholder="请输入备注信息"
              rows={3}
            />
          </CardContent>
        </Card>

        {/* 操作按钮 */}
        <div className="flex justify-end gap-4">
          <Button variant="outline" onClick={() => router.push('/dashboard/customer-material')}>
            取消
          </Button>
          <Button onClick={handleSubmit}>
            <Save className="w-4 h-4 mr-2" />
            保存
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
