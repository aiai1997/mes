'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Save, Plus, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface InventoryInItem {
  id: string;
  materialCode: string;
  materialName: string;
  spec: string;
  color: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  warehouse: string;
  location: string;
  remark: string;
}

const INVENTORY_IN_KEY = 'erp_inventory_in';
const INVENTORY_KEY = 'erp_inventory';

export default function InventoryInPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    inNo: 'RK' + Date.now(),
    inType: '面料入库',
    supplierId: '',
    supplierName: '',
    inDate: new Date().toISOString().split('T')[0],
    operator: '',
    remark: '',
  });

  const [items, setItems] = useState<InventoryInItem[]>([
    { id: '1', materialCode: '', materialName: '', spec: '', color: '', unit: '米', quantity: 0, unitPrice: 0, amount: 0, warehouse: '主仓', location: '', remark: '' },
  ]);

  const addItem = () => {
    setItems(prev => [...prev, {
      id: String(prev.length + 1),
      materialCode: '', materialName: '', spec: '', color: '', unit: '米', quantity: 0, unitPrice: 0, amount: 0, warehouse: '主仓', location: '', remark: '',
    }]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(prev => prev.filter(i => i.id !== id));
    }
  };

  const updateItem = (id: string, field: string, value: string | number) => {
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        updated.amount = updated.quantity * updated.unitPrice;
        return updated;
      }
      return item;
    }));
  };

  const handleSave = () => {
    if (!formData.inDate || items.some(i => !i.materialName || i.quantity <= 0)) {
      alert('请填写完整的入库信息！');
      return;
    }

    // 保存入库单
    const inRecords = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem(INVENTORY_IN_KEY) || '[]') : [];
    inRecords.unshift({
      ...formData,
      items,
      totalAmount: items.reduce((sum, i) => sum + i.amount, 0),
      createdAt: new Date().toLocaleString('zh-CN'),
    });
    localStorage.setItem(INVENTORY_IN_KEY, JSON.stringify(inRecords));

    // 更新库存
    const inventory = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem(INVENTORY_KEY) || '[]') : [];
    items.forEach(item => {
      const existing = inventory.find((i: { materialCode: string; color: string }) => i.materialCode === item.materialCode && i.color === item.color);
      if (existing) {
        existing.quantity += item.quantity;
      } else {
        inventory.push({
          id: Date.now().toString() + item.id,
          type: formData.inType.includes('面料') ? '面料' : formData.inType.includes('辅料') ? '辅料' : '成品',
          materialCode: item.materialCode,
          materialName: item.materialName,
          spec: item.spec,
          color: item.color,
          unit: item.unit,
          quantity: item.quantity,
          safetyStock: 100,
          warehouse: item.warehouse,
          location: item.location,
          status: '正常',
        });
      }
    });
    localStorage.setItem(INVENTORY_KEY, JSON.stringify(inventory));

    alert('入库成功！');
    router.push('/dashboard/inventory');
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">入库单</h1>
            <p className="text-muted-foreground text-sm">物料入库登记</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">基本信息</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <Label>入库单号</Label>
                <Input value={formData.inNo} disabled className="mt-1" />
              </div>
              <div>
                <Label>入库类型</Label>
                <Select value={formData.inType} onValueChange={(v) => setFormData(prev => ({ ...prev, inType: v }))}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="面料入库">面料入库</SelectItem>
                    <SelectItem value="辅料入库">辅料入库</SelectItem>
                    <SelectItem value="成品入库">成品入库</SelectItem>
                    <SelectItem value="半成品入库">半成品入库</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>供应商</Label>
                <Input value={formData.supplierName} onChange={(e) => setFormData(prev => ({ ...prev, supplierName: e.target.value }))} placeholder="请输入供应商" className="mt-1" />
              </div>
              <div>
                <Label>入库日期 <span className="text-red-500">*</span></Label>
                <Input type="date" value={formData.inDate} onChange={(e) => setFormData(prev => ({ ...prev, inDate: e.target.value }))} className="mt-1" />
              </div>
              <div>
                <Label>经办人</Label>
                <Input value={formData.operator} onChange={(e) => setFormData(prev => ({ ...prev, operator: e.target.value }))} placeholder="请输入经办人" className="mt-1" />
              </div>
              <div className="col-span-2">
                <Label>备注</Label>
                <Input value={formData.remark} onChange={(e) => setFormData(prev => ({ ...prev, remark: e.target.value }))} placeholder="备注" className="mt-1" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">入库明细</CardTitle>
            <Button size="sm" onClick={addItem} className="gap-2">
              <Plus className="w-4 h-4" />添加明细
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="p-3 text-left text-sm font-medium text-muted-foreground">物料编码</th>
                    <th className="p-3 text-left text-sm font-medium text-muted-foreground">物料名称</th>
                    <th className="p-3 text-left text-sm font-medium text-muted-foreground">规格</th>
                    <th className="p-3 text-left text-sm font-medium text-muted-foreground">颜色</th>
                    <th className="p-3 text-left text-sm font-medium text-muted-foreground">单位</th>
                    <th className="p-3 text-right text-sm font-medium text-muted-foreground">数量</th>
                    <th className="p-3 text-right text-sm font-medium text-muted-foreground">单价</th>
                    <th className="p-3 text-right text-sm font-medium text-muted-foreground">金额</th>
                    <th className="p-3 text-left text-sm font-medium text-muted-foreground">仓库</th>
                    <th className="p-3 text-left text-sm font-medium text-muted-foreground">库位</th>
                    <th className="p-3 w-16"></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id} className="border-b">
                      <td className="p-3">
                        <Input value={item.materialCode} onChange={(e) => updateItem(item.id, 'materialCode', e.target.value)} placeholder="编码" className="h-8" />
                      </td>
                      <td className="p-3">
                        <Input value={item.materialName} onChange={(e) => updateItem(item.id, 'materialName', e.target.value)} placeholder="名称" className="h-8" />
                      </td>
                      <td className="p-3">
                        <Input value={item.spec} onChange={(e) => updateItem(item.id, 'spec', e.target.value)} placeholder="规格" className="h-8 w-20" />
                      </td>
                      <td className="p-3">
                        <Input value={item.color} onChange={(e) => updateItem(item.id, 'color', e.target.value)} placeholder="颜色" className="h-8 w-20" />
                      </td>
                      <td className="p-3">
                        <Select value={item.unit} onValueChange={(v) => updateItem(item.id, 'unit', v)}>
                          <SelectTrigger className="h-8 w-16"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="米">米</SelectItem>
                            <SelectItem value="件">件</SelectItem>
                            <SelectItem value="条">条</SelectItem>
                            <SelectItem value="个">个</SelectItem>
                            <SelectItem value="公斤">公斤</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="p-3">
                        <Input type="number" value={item.quantity || ''} onChange={(e) => updateItem(item.id, 'quantity', Number(e.target.value))} className="h-8 w-20 text-right" />
                      </td>
                      <td className="p-3">
                        <Input type="number" step="0.01" value={item.unitPrice || ''} onChange={(e) => updateItem(item.id, 'unitPrice', Number(e.target.value))} className="h-8 w-20 text-right" />
                      </td>
                      <td className="p-3 text-right font-medium">¥{item.amount.toFixed(2)}</td>
                      <td className="p-3">
                        <Select value={item.warehouse} onValueChange={(v) => updateItem(item.id, 'warehouse', v)}>
                          <SelectTrigger className="h-8 w-20"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="主仓">主仓</SelectItem>
                            <SelectItem value="辅料仓">辅料仓</SelectItem>
                            <SelectItem value="成品仓">成品仓</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="p-3">
                        <Input value={item.location} onChange={(e) => updateItem(item.id, 'location', e.target.value)} placeholder="库位" className="h-8 w-16" />
                      </td>
                      <td className="p-3">
                        <Button size="sm" variant="ghost" onClick={() => removeItem(item.id)} disabled={items.length === 1}>
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-4 border-t flex justify-between items-center">
              <div className="text-muted-foreground">
                合计数量: <span className="font-bold text-foreground">{items.reduce((sum, i) => sum + i.quantity, 0)}</span>
              </div>
              <div className="text-lg">
                合计金额: <span className="font-bold text-green-600">¥{items.reduce((sum, i) => sum + i.amount, 0).toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

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
