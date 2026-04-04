'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Save, Building2, Truck } from 'lucide-react';
import { getCustomers, getSuppliers, saveCustomer, saveSupplier, type Customer, type Supplier } from '@/types/partner';

export default function PartnerEditPage() {
  const router = useRouter();
  const params = useParams();
  const partnerId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [partnerType, setPartnerType] = useState<'customer' | 'supplier'>('customer');
  
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    shortName: '',
    type: '面料' as '面料' | '辅料' | '外协' | '其他',
    contact: '',
    phone: '',
    address: '',
    level: 'B级' as 'A级' | 'B级' | 'C级' | 'D级',
    creditDays: 30 as 7 | 15 | 30,
    taxRate: 13,
    invoiceInfo: '',
    deliveryAddress: '',
    paymentMethod: '月结' as '月结' | '现结' | '预付',
    status: '启用' as '启用' | '停用',
  });

  useEffect(() => {
    loadPartner();
  }, [partnerId]);

  const loadPartner = () => {
    const customers = getCustomers();
    const customer = customers.find((c) => c.id === partnerId);
    
    if (customer) {
      setPartnerType('customer');
      setFormData({
        code: customer.customerCode,
        name: customer.customerName,
        shortName: customer.shortName,
        type: '面料',
        contact: customer.contact,
        phone: customer.phone,
        address: customer.address,
        level: customer.level,
        creditDays: customer.creditDays,
        taxRate: customer.taxRate,
        invoiceInfo: customer.invoiceInfo,
        deliveryAddress: customer.deliveryAddress,
        paymentMethod: '月结',
        status: customer.status,
      });
    } else {
      const suppliers = getSuppliers();
      const supplier = suppliers.find((s) => s.id === partnerId);
      if (supplier) {
        setPartnerType('supplier');
        setFormData({
          code: supplier.supplierCode,
          name: supplier.supplierName,
          shortName: '',
          type: supplier.supplierType,
          contact: supplier.contact,
          phone: supplier.phone,
          address: supplier.address,
          level: 'B级',
          creditDays: supplier.creditDays,
          taxRate: 13,
          invoiceInfo: supplier.invoiceInfo,
          deliveryAddress: '',
          paymentMethod: supplier.paymentMethod,
          status: supplier.status,
        });
      } else {
        alert('客商不存在');
        router.push('/dashboard/partner');
      }
    }
    setLoading(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.code || !formData.name) {
      alert('请填写必填项');
      return;
    }

    if (partnerType === 'customer') {
      const customers = getCustomers();
      const existing = customers.find((c) => c.id === partnerId);
      if (existing) {
        const updated: Customer = {
          ...existing,
          customerCode: formData.code,
          customerName: formData.name,
          shortName: formData.shortName,
          contact: formData.contact,
          phone: formData.phone,
          address: formData.address,
          level: formData.level,
          creditDays: formData.creditDays,
          taxRate: formData.taxRate,
          invoiceInfo: formData.invoiceInfo,
          deliveryAddress: formData.deliveryAddress,
          status: formData.status,
        };
        saveCustomer(updated);
      }
    } else {
      const suppliers = getSuppliers();
      const existing = suppliers.find((s) => s.id === partnerId);
      if (existing) {
        const updated: Supplier = {
          ...existing,
          supplierCode: formData.code,
          supplierName: formData.name,
          supplierType: formData.type,
          contact: formData.contact,
          phone: formData.phone,
          address: formData.address,
          creditDays: formData.creditDays,
          invoiceInfo: formData.invoiceInfo,
          paymentMethod: formData.paymentMethod,
          status: formData.status,
        };
        saveSupplier(updated);
      }
    }

    alert('保存成功');
    router.push('/dashboard/partner');
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">加载中...</p>
        </div>
      </DashboardLayout>
    );
  }

  const Icon = partnerType === 'customer' ? Building2 : Truck;

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Icon className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">
                编辑{partnerType === 'customer' ? '客户' : '供应商'}
              </h1>
              <p className="text-muted-foreground text-sm">修改客商信息</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>基本信息</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="code">{partnerType === 'customer' ? '客户编码' : '供应商编码'} *</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="编码"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">{partnerType === 'customer' ? '客户名称' : '供应商名称'} *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="名称"
                  />
                </div>
                {partnerType === 'customer' && (
                  <div className="space-y-2">
                    <Label htmlFor="shortName">简称</Label>
                    <Input
                      id="shortName"
                      value={formData.shortName}
                      onChange={(e) => setFormData({ ...formData, shortName: e.target.value })}
                      placeholder="简称"
                    />
                  </div>
                )}
                {partnerType === 'supplier' && (
                  <div className="space-y-2">
                    <Label htmlFor="type">类型</Label>
                    <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v as any })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="面料">面料</SelectItem>
                        <SelectItem value="辅料">辅料</SelectItem>
                        <SelectItem value="外协">外协</SelectItem>
                        <SelectItem value="其他">其他</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="contact">联系人</Label>
                  <Input
                    id="contact"
                    value={formData.contact}
                    onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                    placeholder="联系人"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">电话</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="电话"
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="address">地址</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="地址"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="invoiceInfo">发票信息</Label>
                  <Input
                    id="invoiceInfo"
                    value={formData.invoiceInfo}
                    onChange={(e) => setFormData({ ...formData, invoiceInfo: e.target.value })}
                    placeholder="发票信息"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="creditDays">账期</Label>
                  <Select 
                    value={formData.creditDays.toString()} 
                    onValueChange={(v) => setFormData({ ...formData, creditDays: parseInt(v) as 7 | 15 | 30 })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">7天</SelectItem>
                      <SelectItem value="15">15天</SelectItem>
                      <SelectItem value="30">30天</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {partnerType === 'customer' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="level">客户等级</Label>
                      <Select value={formData.level} onValueChange={(v) => setFormData({ ...formData, level: v as any })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="A级">A级</SelectItem>
                          <SelectItem value="B级">B级</SelectItem>
                          <SelectItem value="C级">C级</SelectItem>
                          <SelectItem value="D级">D级</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="taxRate">税率(%)</Label>
                      <Input
                        id="taxRate"
                        type="number"
                        value={formData.taxRate}
                        onChange={(e) => setFormData({ ...formData, taxRate: parseInt(e.target.value) || 0 })}
                        placeholder="税率"
                      />
                    </div>
                    <div className="space-y-2 col-span-2">
                      <Label htmlFor="deliveryAddress">收货地址</Label>
                      <Input
                        id="deliveryAddress"
                        value={formData.deliveryAddress}
                        onChange={(e) => setFormData({ ...formData, deliveryAddress: e.target.value })}
                        placeholder="收货地址"
                      />
                    </div>
                  </>
                )}
                {partnerType === 'supplier' && (
                  <div className="space-y-2">
                    <Label htmlFor="paymentMethod">付款方式</Label>
                    <Select value={formData.paymentMethod} onValueChange={(v) => setFormData({ ...formData, paymentMethod: v as any })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="月结">月结</SelectItem>
                        <SelectItem value="现结">现结</SelectItem>
                        <SelectItem value="预付">预付</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="status">状态</Label>
                  <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v as any })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="启用">启用</SelectItem>
                      <SelectItem value="停用">停用</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-2 mt-4">
            <Button type="submit" className="gap-2">
              <Save className="w-4 h-4" />
              保存
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              取消
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
