'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Plus, Eye, Edit, RotateCcw, ArrowRight, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  type PreOrder,
  type PreOrderStatus,
  getPreOrders,
} from '@/types/production-advanced';

const statusColors: Record<PreOrderStatus, string> = {
  '意向': 'bg-gray-100 text-gray-700',
  '已确认': 'bg-blue-100 text-blue-700',
  '已转正式': 'bg-green-100 text-green-700',
};

export default function PreOrderPage() {
  const router = useRouter();
  const [preOrders, setPreOrders] = useState<PreOrder[]>([]);
  
  const [searchNo, setSearchNo] = useState('');
  const [searchCustomer, setSearchCustomer] = useState('');
  const [searchStatus, setSearchStatus] = useState('全部');
  
  useEffect(() => {
    loadData();
  }, []);
  
  const loadData = () => {
    setPreOrders(getPreOrders());
  };
  
  const handleReset = () => {
    setSearchNo('');
    setSearchCustomer('');
    setSearchStatus('全部');
  };
  
  const filteredPreOrders = preOrders.filter(p => {
    if (searchNo && !p.preOrderNo.includes(searchNo)) return false;
    if (searchCustomer && !p.customerName.includes(searchCustomer)) return false;
    if (searchStatus !== '全部' && p.status !== searchStatus) return false;
    return true;
  });
  
  const stats = {
    total: preOrders.length,
    intention: preOrders.filter(p => p.status === '意向').length,
    confirmed: preOrders.filter(p => p.status === '已确认').length,
    converted: preOrders.filter(p => p.status === '已转正式').length,
    totalQuantity: preOrders.reduce((sum, p) => sum + p.intentionQuantity, 0),
  };

  return (
    <DashboardLayout>
      <div className="max-w-full mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">预订单管理</h1>
              <p className="text-muted-foreground text-sm">客户未正式下单前的意向管理</p>
            </div>
          </div>
          <Button onClick={() => router.push('/dashboard/pre-order/create')}>
            <Plus className="w-4 h-4 mr-2" />新增预订单
          </Button>
        </div>
        
        {/* 统计卡片 */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">预订单总数</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <FileText className="w-8 h-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">意向</p>
                  <p className="text-2xl font-bold text-gray-600">{stats.intention}</p>
                </div>
                <FileText className="w-8 h-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">已确认</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.confirmed}</p>
                </div>
                <FileText className="w-8 h-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">已转正式</p>
                  <p className="text-2xl font-bold text-green-600">{stats.converted}</p>
                </div>
                <ArrowRight className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">意向总量</p>
                  <p className="text-2xl font-bold">{stats.totalQuantity}</p>
                </div>
                <FileText className="w-8 h-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* 查询区 */}
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div>
                <Label>预订单号</Label>
                <Input placeholder="请输入" value={searchNo} onChange={(e) => setSearchNo(e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label>客户</Label>
                <Input placeholder="请输入" value={searchCustomer} onChange={(e) => setSearchCustomer(e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label>状态</Label>
                <Select value={searchStatus} onValueChange={setSearchStatus}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="全部">全部</SelectItem>
                    <SelectItem value="意向">意向</SelectItem>
                    <SelectItem value="已确认">已确认</SelectItem>
                    <SelectItem value="已转正式">已转正式</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end gap-2">
                <Button onClick={loadData} className="flex-1">查询</Button>
                <Button variant="outline" onClick={handleReset}><RotateCcw className="w-4 h-4" /></Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* 列表 */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>预订单号</TableHead>
                  <TableHead>客户</TableHead>
                  <TableHead>款号</TableHead>
                  <TableHead>产品名称</TableHead>
                  <TableHead className="text-right">意向数量</TableHead>
                  <TableHead>意向交期</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>正式订单</TableHead>
                  <TableHead>创建时间</TableHead>
                  <TableHead className="w-32">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPreOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-12 text-muted-foreground">暂无预订单记录</TableCell>
                  </TableRow>
                ) : (
                  filteredPreOrders.map(po => (
                    <TableRow key={po.id}>
                      <TableCell className="font-medium">{po.preOrderNo}</TableCell>
                      <TableCell>{po.customerName}</TableCell>
                      <TableCell>{po.styleNo}</TableCell>
                      <TableCell>{po.productName}</TableCell>
                      <TableCell className="text-right">{po.intentionQuantity}</TableCell>
                      <TableCell>{po.intentionDeliveryDate}</TableCell>
                      <TableCell><Badge className={statusColors[po.status]}>{po.status}</Badge></TableCell>
                      <TableCell>{po.convertedOrderNo || '-'}</TableCell>
                      <TableCell className="text-sm">{po.createdAt}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost" onClick={() => router.push(`/dashboard/pre-order/${po.id}`)}>
                            <Eye className="w-4 h-4" />
                          </Button>
                          {po.status !== '已转正式' && (
                            <>
                              <Button size="sm" variant="ghost" onClick={() => router.push(`/dashboard/pre-order/${po.id}/edit`)}>
                                <Edit className="w-4 h-4" />
                              </Button>
                              {po.status === '已确认' && (
                                <Button size="sm" variant="ghost" className="text-green-600" onClick={() => router.push(`/dashboard/orders/create?preOrderId=${po.id}`)}>
                                  <ArrowRight className="w-4 h-4" />
                                </Button>
                              )}
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            <div className="p-4 border-t text-sm text-muted-foreground">
              共 {filteredPreOrders.length} 条记录
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
