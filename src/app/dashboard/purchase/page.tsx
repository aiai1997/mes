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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShoppingCart, Plus, Edit, Trash2, Download, Search, CheckCircle, FileText, Truck } from 'lucide-react';

interface PurchaseRequest {
  id: string;
  requestNo: string;
  materialCode: string;
  materialName: string;
  spec: string;
  unit: string;
  requestQuantity: number;
  approvedQuantity: number;
  supplierName: string;
  estimatedPrice: number;
  status: '待审核' | '已审核' | '已采购' | '已作废';
  remark: string;
  createdAt: string;
}

interface PurchaseOrder {
  id: string;
  orderNo: string;
  supplierName: string;
  materialCode: string;
  materialName: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  taxRate: number;
  taxAmount: number;
  totalAmount: number;
  deliveryDate: string;
  status: '待入库' | '部分入库' | '已入库' | '已作废';
  createdAt: string;
}

interface PurchaseInbound {
  id: string;
  inboundNo: string;
  orderNo: string;
  supplierName: string;
  materialCode: string;
  materialName: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  inboundDate: string;
  status: '待审核' | '已审核';
  createdAt: string;
}

export default function PurchasePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('request');
  const [requests, setRequests] = useState<PurchaseRequest[]>([]);
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [inbounds, setInbounds] = useState<PurchaseInbound[]>([]);
  const [searchText, setSearchText] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [dialogType, setDialogType] = useState<'request' | 'order' | 'inbound'>('request');
  const [formData, setFormData] = useState({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const storedRequests = localStorage.getItem('erp_purchase_requests');
    if (storedRequests) setRequests(JSON.parse(storedRequests));
    else {
      const defaultRequests: PurchaseRequest[] = [
        {
          id: '1',
          requestNo: 'PR20260101001',
          materialCode: 'ML001',
          materialName: '纯棉汗布',
          spec: '180G/㎡',
          unit: '公斤',
          requestQuantity: 500,
          approvedQuantity: 500,
          supplierName: '广州面料供应商',
          estimatedPrice: 35,
          status: '已审核',
          remark: '订单ORD001用料',
          createdAt: new Date().toLocaleString('zh-CN'),
        },
      ];
      localStorage.setItem('erp_purchase_requests', JSON.stringify(defaultRequests));
      setRequests(defaultRequests);
    }

    const storedOrders = localStorage.getItem('erp_purchase_orders');
    if (storedOrders) setOrders(JSON.parse(storedOrders));
    else {
      const defaultOrders: PurchaseOrder[] = [
        {
          id: '1',
          orderNo: 'PO20260101001',
          supplierName: '广州面料供应商',
          materialCode: 'ML001',
          materialName: '纯棉汗布',
          quantity: 500,
          unitPrice: 35,
          amount: 17500,
          taxRate: 13,
          taxAmount: 2275,
          totalAmount: 19775,
          deliveryDate: '2026-01-10',
          status: '待入库',
          createdAt: new Date().toLocaleString('zh-CN'),
        },
      ];
      localStorage.setItem('erp_purchase_orders', JSON.stringify(defaultOrders));
      setOrders(defaultOrders);
    }

    const storedInbounds = localStorage.getItem('erp_purchase_inbounds');
    if (storedInbounds) setInbounds(JSON.parse(storedInbounds));
  };

  const handleExport = (type: string) => {
    let headers: string[] = [];
    let rows: string[][] = [];
    let filename = '';

    if (type === 'request') {
      headers = ['申请单号', '物料编码', '物料名称', '规格', '申请数量', '批准数量', '供应商', '状态', '创建时间'];
      rows = requests.map(r => [
        r.requestNo, r.materialCode, r.materialName, r.spec,
        r.requestQuantity.toString(), r.approvedQuantity.toString(),
        r.supplierName, r.status, r.createdAt
      ]);
      filename = '采购申请';
    } else if (type === 'order') {
      headers = ['订单号', '供应商', '物料编码', '物料名称', '数量', '单价', '金额', '含税总额', '交货日期', '状态'];
      rows = orders.map(o => [
        o.orderNo, o.supplierName, o.materialCode, o.materialName,
        o.quantity.toString(), o.unitPrice.toFixed(2), o.amount.toFixed(2),
        o.totalAmount.toFixed(2), o.deliveryDate, o.status
      ]);
      filename = '采购订单';
    }

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleApproveRequest = (id: string) => {
    const updated = requests.map(r => 
      r.id === id ? { ...r, status: '已审核' as const, approvedQuantity: r.requestQuantity } : r
    );
    localStorage.setItem('erp_purchase_requests', JSON.stringify(updated));
    setRequests(updated);
  };

  const handleCreateOrder = (request: PurchaseRequest) => {
    const order: PurchaseOrder = {
      id: Date.now().toString(),
      orderNo: `PO${new Date().toISOString().slice(0, 10).replace(/-/g, '')}${(orders.length + 1).toString().padStart(3, '0')}`,
      supplierName: request.supplierName,
      materialCode: request.materialCode,
      materialName: request.materialName,
      quantity: request.approvedQuantity,
      unitPrice: request.estimatedPrice,
      amount: request.approvedQuantity * request.estimatedPrice,
      taxRate: 13,
      taxAmount: request.approvedQuantity * request.estimatedPrice * 0.13,
      totalAmount: request.approvedQuantity * request.estimatedPrice * 1.13,
      deliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      status: '待入库',
      createdAt: new Date().toLocaleString('zh-CN'),
    };
    const newOrders = [...orders, order];
    localStorage.setItem('erp_purchase_orders', JSON.stringify(newOrders));
    setOrders(newOrders);

    // 更新申请单状态
    const updated = requests.map(r => r.id === request.id ? { ...r, status: '已采购' as const } : r);
    localStorage.setItem('erp_purchase_requests', JSON.stringify(updated));
    setRequests(updated);
  };

  const handleInbound = (order: PurchaseOrder) => {
    const inbound: PurchaseInbound = {
      id: Date.now().toString(),
      inboundNo: `PI${new Date().toISOString().slice(0, 10).replace(/-/g, '')}${(inbounds.length + 1).toString().padStart(3, '0')}`,
      orderNo: order.orderNo,
      supplierName: order.supplierName,
      materialCode: order.materialCode,
      materialName: order.materialName,
      quantity: order.quantity,
      unitPrice: order.unitPrice,
      amount: order.amount,
      inboundDate: new Date().toISOString().slice(0, 10),
      status: '待审核',
      createdAt: new Date().toLocaleString('zh-CN'),
    };
    const newInbounds = [...inbounds, inbound];
    localStorage.setItem('erp_purchase_inbounds', JSON.stringify(newInbounds));
    setInbounds(newInbounds);

    // 更新订单状态
    const updated = orders.map(o => o.id === order.id ? { ...o, status: '已入库' as const } : o);
    localStorage.setItem('erp_purchase_orders', JSON.stringify(updated));
    setOrders(updated);
  };

  const handleApproveInbound = (id: string) => {
    const updated = inbounds.map(i => 
      i.id === id ? { ...i, status: '已审核' as const } : i
    );
    localStorage.setItem('erp_purchase_inbounds', JSON.stringify(updated));
    setInbounds(updated);

    // 更新库存
    const inbound = inbounds.find(i => i.id === id);
    if (inbound) {
      const stocks = JSON.parse(localStorage.getItem('erp_stock') || '[]');
      const existing = stocks.find((s: any) => s.materialCode === inbound.materialCode);
      if (existing) {
        existing.quantity += inbound.quantity;
        existing.lastInDate = inbound.inboundDate;
      } else {
        stocks.push({
          id: Date.now().toString(),
          type: '面料',
          materialCode: inbound.materialCode,
          materialName: inbound.materialName,
          spec: '',
          color: '',
          unit: '公斤',
          quantity: inbound.quantity,
          safetyStock: 0,
          unitCost: inbound.unitPrice,
          warehouse: '主仓',
          location: '',
          status: '正常',
          lastInDate: inbound.inboundDate,
          createdAt: new Date().toLocaleString('zh-CN'),
          updatedAt: new Date().toLocaleString('zh-CN'),
        });
      }
      localStorage.setItem('erp_stock', JSON.stringify(stocks));
    }
  };

  const getStats = () => ({
    pendingRequests: requests.filter(r => r.status === '待审核').length,
    pendingOrders: orders.filter(o => o.status === '待入库').length,
    totalAmount: orders.reduce((sum, o) => sum + o.totalAmount, 0),
    pendingInbounds: inbounds.filter(i => i.status === '待审核').length,
  });

  const stats = getStats();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* 页面标题 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <ShoppingCart className="w-6 h-6" />
              采购管理
            </h1>
            <p className="text-muted-foreground mt-1">采购申请、采购订单、采购入库管理</p>
          </div>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">待审核申请</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.pendingRequests}</p>
                </div>
                <FileText className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">待入库订单</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.pendingOrders}</p>
                </div>
                <Truck className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">采购总额</p>
                  <p className="text-2xl font-bold text-green-600">¥{stats.totalAmount.toFixed(0)}</p>
                </div>
                <ShoppingCart className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">待审核入库</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.pendingInbounds}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 标签页 */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="request">采购申请</TabsTrigger>
            <TabsTrigger value="order">采购订单</TabsTrigger>
            <TabsTrigger value="inbound">采购入库</TabsTrigger>
          </TabsList>

          {/* 采购申请 */}
          <TabsContent value="request">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>采购申请列表</CardTitle>
                <Button variant="outline" size="sm" onClick={() => handleExport('request')}>
                  <Download className="w-4 h-4 mr-2" />
                  导出
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>申请单号</TableHead>
                      <TableHead>物料编码</TableHead>
                      <TableHead>物料名称</TableHead>
                      <TableHead>申请数量</TableHead>
                      <TableHead>供应商</TableHead>
                      <TableHead>预估金额</TableHead>
                      <TableHead>状态</TableHead>
                      <TableHead>操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {requests.map(r => (
                      <TableRow key={r.id}>
                        <TableCell className="font-mono">{r.requestNo}</TableCell>
                        <TableCell>{r.materialCode}</TableCell>
                        <TableCell>{r.materialName}</TableCell>
                        <TableCell>{r.requestQuantity} {r.unit}</TableCell>
                        <TableCell>{r.supplierName}</TableCell>
                        <TableCell>¥{(r.requestQuantity * r.estimatedPrice).toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge variant={
                            r.status === '已采购' ? 'default' :
                            r.status === '已审核' ? 'secondary' : 'outline'
                          }>
                            {r.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {r.status === '待审核' && (
                              <Button size="sm" variant="outline" onClick={() => handleApproveRequest(r.id)}>
                                审核
                              </Button>
                            )}
                            {r.status === '已审核' && (
                              <Button size="sm" variant="outline" onClick={() => handleCreateOrder(r)}>
                                下单
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 采购订单 */}
          <TabsContent value="order">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>采购订单列表</CardTitle>
                <Button variant="outline" size="sm" onClick={() => handleExport('order')}>
                  <Download className="w-4 h-4 mr-2" />
                  导出
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>订单号</TableHead>
                      <TableHead>供应商</TableHead>
                      <TableHead>物料</TableHead>
                      <TableHead>数量</TableHead>
                      <TableHead>含税总额</TableHead>
                      <TableHead>交货日期</TableHead>
                      <TableHead>状态</TableHead>
                      <TableHead>操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map(o => (
                      <TableRow key={o.id}>
                        <TableCell className="font-mono">{o.orderNo}</TableCell>
                        <TableCell>{o.supplierName}</TableCell>
                        <TableCell>{o.materialName}</TableCell>
                        <TableCell>{o.quantity}</TableCell>
                        <TableCell className="text-green-600 font-medium">¥{o.totalAmount.toFixed(2)}</TableCell>
                        <TableCell>{o.deliveryDate}</TableCell>
                        <TableCell>
                          <Badge variant={
                            o.status === '已入库' ? 'default' :
                            o.status === '部分入库' ? 'secondary' : 'outline'
                          }>
                            {o.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {o.status === '待入库' && (
                            <Button size="sm" variant="outline" onClick={() => handleInbound(o)}>
                              入库
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 采购入库 */}
          <TabsContent value="inbound">
            <Card>
              <CardHeader>
                <CardTitle>采购入库列表</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>入库单号</TableHead>
                      <TableHead>采购订单</TableHead>
                      <TableHead>供应商</TableHead>
                      <TableHead>物料</TableHead>
                      <TableHead>入库数量</TableHead>
                      <TableHead>入库金额</TableHead>
                      <TableHead>入库日期</TableHead>
                      <TableHead>状态</TableHead>
                      <TableHead>操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {inbounds.map(i => (
                      <TableRow key={i.id}>
                        <TableCell className="font-mono">{i.inboundNo}</TableCell>
                        <TableCell>{i.orderNo}</TableCell>
                        <TableCell>{i.supplierName}</TableCell>
                        <TableCell>{i.materialName}</TableCell>
                        <TableCell>{i.quantity}</TableCell>
                        <TableCell>¥{i.amount.toFixed(2)}</TableCell>
                        <TableCell>{i.inboundDate}</TableCell>
                        <TableCell>
                          <Badge variant={i.status === '已审核' ? 'default' : 'outline'}>
                            {i.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {i.status === '待审核' && (
                            <Button size="sm" variant="outline" onClick={() => handleApproveInbound(i.id)}>
                              审核
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                    {inbounds.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                          暂无入库记录
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
