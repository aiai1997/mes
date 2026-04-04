'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, Building2, Truck, Phone, MapPin, FileText, DollarSign, Calendar } from 'lucide-react';
import { getCustomers, getSuppliers, type Customer, type Supplier } from '@/types/partner';

export default function PartnerDetailPage() {
  const router = useRouter();
  const params = useParams();
  const partnerId = params.id as string;

  const [partner, setPartner] = useState<Customer | Supplier | null>(null);
  const [partnerType, setPartnerType] = useState<'customer' | 'supplier'>('customer');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPartner();
  }, [partnerId]);

  const loadPartner = () => {
    // 先从客户中查找
    const customers = getCustomers();
    const customer = customers.find((c) => c.id === partnerId);
    
    if (customer) {
      setPartner(customer);
      setPartnerType('customer');
    } else {
      // 再从供应商中查找
      const suppliers = getSuppliers();
      const supplier = suppliers.find((s) => s.id === partnerId);
      if (supplier) {
        setPartner(supplier);
        setPartnerType('supplier');
      } else {
        alert('客商不存在');
        router.push('/dashboard/partner');
      }
    }
    setLoading(false);
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

  if (!partner) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">客商不存在</p>
        </div>
      </DashboardLayout>
    );
  }

  const isCustomer = partnerType === 'customer';
  const Icon = isCustomer ? Building2 : Truck;

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
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
                  {isCustomer ? (partner as Customer).customerName : (partner as Supplier).supplierName}
                </h1>
                <p className="text-muted-foreground text-sm">
                  {isCustomer ? '客户详情' : '供应商详情'}
                </p>
              </div>
            </div>
          </div>
          <Button onClick={() => router.push(`/dashboard/partner/${partner.id}/edit`)}>
            <Edit className="w-4 h-4 mr-2" />
            编辑
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>基本信息</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-6">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">编码</p>
                  <p className="font-medium">
                    {isCustomer ? (partner as Customer).customerCode : (partner as Supplier).supplierCode}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Building2 className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">
                    {isCustomer ? '简称' : '类型'}
                  </p>
                  <p className="font-medium">
                    {isCustomer ? (partner as Customer).shortName : (partner as Supplier).supplierType}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">联系人</p>
                  <p className="font-medium">{partner.contact}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">电话</p>
                  <p className="font-medium">{partner.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 col-span-2">
                <MapPin className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">地址</p>
                  <p className="font-medium">{partner.address}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 col-span-2">
                <FileText className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">发票信息</p>
                  <p className="font-medium">{partner.invoiceInfo}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">账期</p>
                  <p className="font-medium">{partner.creditDays}天</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <DollarSign className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">状态</p>
                  <Badge variant={partner.status === '启用' ? 'default' : 'destructive'}>
                    {partner.status}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{isCustomer ? '业务统计' : '采购统计'}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-6">
              {isCustomer ? (
                <>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">订单数量</p>
                    <p className="text-2xl font-bold">{(partner as Customer).totalOrders}</p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">订单金额</p>
                    <p className="text-2xl font-bold text-green-600">
                      ¥{(partner as Customer).totalAmount.toLocaleString()}
                    </p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">客户等级</p>
                    <p className="text-2xl font-bold">{(partner as Customer).level}</p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">税率</p>
                    <p className="text-2xl font-bold">{(partner as Customer).taxRate}%</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">采购次数</p>
                    <p className="text-2xl font-bold">{(partner as Supplier).totalPurchases}</p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">采购金额</p>
                    <p className="text-2xl font-bold text-orange-600">
                      ¥{(partner as Supplier).totalAmount.toLocaleString()}
                    </p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">付款方式</p>
                    <p className="text-2xl font-bold">{(partner as Supplier).paymentMethod}</p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg col-span-2">
                    <p className="text-sm text-muted-foreground">创建时间</p>
                    <p className="text-lg font-medium">{partner.createdAt}</p>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {isCustomer && (
          <Card>
            <CardHeader>
              <CardTitle>收货地址</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{(partner as Customer).deliveryAddress || '暂无'}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
