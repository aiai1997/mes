'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { XCircle, RotateCcw, Eye, Lock, Unlock } from 'lucide-react';
import { getOrderCloses, type OrderClose } from '@/types/production-advanced-2';

const statusColors = {
  '正常': 'bg-green-100 text-green-700',
  '已关闭': 'bg-gray-100 text-gray-700',
  '待审核': 'bg-yellow-100 text-yellow-700',
};

export default function OrderClosePage() {
  const [orders, setOrders] = useState<OrderClose[]>([]);
  const [searchNo, setSearchNo] = useState('');
  const [searchStatus, setSearchStatus] = useState('全部');

  useEffect(() => { setOrders(getOrderCloses()); }, []);

  const handleReset = () => { setSearchNo(''); setSearchStatus('全部'); };

  const filtered = orders.filter(o => {
    if (searchNo && !o.orderNo.includes(searchNo)) return false;
    if (searchStatus !== '全部' && o.status !== searchStatus) return false;
    return true;
  });

  const stats = {
    total: orders.length,
    normal: orders.filter(o => o.status === '正常').length,
    closed: orders.filter(o => o.status === '已关闭').length,
    pending: orders.filter(o => o.status === '待审核').length,
  };

  return (
    <DashboardLayout>
      <div className="max-w-full mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <XCircle className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">订单关闭/反关闭管理</h1>
              <p className="text-muted-foreground text-sm">订单完成后关闭，禁止修改；异常情况可反关闭</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">订单总数</p><p className="text-2xl font-bold">{stats.total}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">正常</p><p className="text-2xl font-bold text-green-600">{stats.normal}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">已关闭</p><p className="text-2xl font-bold text-gray-600">{stats.closed}</p></CardContent></Card>
          <Card className={stats.pending > 0 ? 'border-yellow-300' : ''}><CardContent className="p-4"><p className="text-sm text-muted-foreground">待审核</p><p className="text-2xl font-bold text-yellow-600">{stats.pending}</p></CardContent></Card>
        </div>

        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div><Label>订单号</Label><Input placeholder="请输入" value={searchNo} onChange={(e) => setSearchNo(e.target.value)} className="mt-1" /></div>
              <div><Label>状态</Label>
                <Select value={searchStatus} onValueChange={setSearchStatus}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="全部">全部</SelectItem>
                    <SelectItem value="正常">正常</SelectItem>
                    <SelectItem value="已关闭">已关闭</SelectItem>
                    <SelectItem value="待审核">待审核</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end gap-2">
                <Button className="flex-1">查询</Button>
                <Button variant="outline" onClick={handleReset}><RotateCcw className="w-4 h-4" /></Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>订单号</TableHead>
                  <TableHead>款号</TableHead>
                  <TableHead>客户</TableHead>
                  <TableHead className="text-right">订单数量</TableHead>
                  <TableHead className="text-right">入库数量</TableHead>
                  <TableHead className="text-right">未完成</TableHead>
                  <TableHead>交期</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>关闭时间</TableHead>
                  <TableHead>关闭原因</TableHead>
                  <TableHead className="w-20">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={11} className="text-center py-12 text-muted-foreground">暂无数据</TableCell></TableRow>
                ) : filtered.map(o => (
                  <TableRow key={o.id} className={o.status === '已关闭' ? 'bg-gray-50' : ''}>
                    <TableCell className="font-medium">{o.orderNo}</TableCell>
                    <TableCell>{o.styleNo}</TableCell>
                    <TableCell>{o.customer}</TableCell>
                    <TableCell className="text-right">{o.orderQuantity}</TableCell>
                    <TableCell className="text-right">{o.deliveredQuantity}</TableCell>
                    <TableCell className={`text-right ${o.unfinishedQuantity > 0 ? 'text-red-600' : ''}`}>{o.unfinishedQuantity}</TableCell>
                    <TableCell>{o.deliveryDate}</TableCell>
                    <TableCell><Badge className={statusColors[o.status]}>{o.status}</Badge></TableCell>
                    <TableCell className="text-sm">{o.closedAt || '-'}</TableCell>
                    <TableCell className="text-sm">{o.closeReason || '-'}</TableCell>
                    <TableCell>
                      {o.status === '正常' ? (
                        <Button size="sm" variant="ghost" title="关闭订单"><Lock className="w-4 h-4 text-red-600" /></Button>
                      ) : o.status === '已关闭' ? (
                        <Button size="sm" variant="ghost" title="反关闭"><Unlock className="w-4 h-4 text-green-600" /></Button>
                      ) : (
                        <Button size="sm" variant="ghost"><Eye className="w-4 h-4" /></Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="p-4 border-t text-sm text-muted-foreground">共 {filtered.length} 条记录</div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
