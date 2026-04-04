'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Split, Plus, Eye, RotateCcw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getOrderSplits, type OrderSplit } from '@/types/production-advanced-2';

export default function OrderSplitPage() {
  const router = useRouter();
  const [splits, setSplits] = useState<OrderSplit[]>([]);

  useEffect(() => { setSplits(getOrderSplits()); }, []);

  return (
    <DashboardLayout>
      <div className="max-w-full mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <Split className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">订单拆单生产</h1>
              <p className="text-muted-foreground text-sm">大订单分多次生产，进度统一追踪</p>
            </div>
          </div>
          <Button onClick={() => router.push('/dashboard/order-split/create')}>
            <Plus className="w-4 h-4 mr-2" />新增拆单
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">拆单数</p><p className="text-2xl font-bold">{splits.length}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">总子订单</p><p className="text-2xl font-bold">{splits.reduce((sum, s) => sum + s.subOrders.length, 0)}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">已完成</p><p className="text-2xl font-bold text-green-600">{splits.filter(s => s.subOrders.every(so => so.status === '已完成')).length}</p></CardContent></Card>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>拆单单号</TableHead>
                  <TableHead>主订单号</TableHead>
                  <TableHead className="text-right">主订单数量</TableHead>
                  <TableHead>子订单数</TableHead>
                  <TableHead>拆单原因</TableHead>
                  <TableHead>创建时间</TableHead>
                  <TableHead className="w-20">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {splits.length === 0 ? (
                  <TableRow><TableCell colSpan={7} className="text-center py-12 text-muted-foreground">暂无数据</TableCell></TableRow>
                ) : splits.map(s => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.splitNo}</TableCell>
                    <TableCell>{s.mainOrderNo}</TableCell>
                    <TableCell className="text-right">{s.mainQuantity}</TableCell>
                    <TableCell>{s.subOrders.length}个</TableCell>
                    <TableCell>{s.splitReason}</TableCell>
                    <TableCell className="text-sm">{s.createdAt}</TableCell>
                    <TableCell><Button size="sm" variant="ghost"><Eye className="w-4 h-4" /></Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="p-4 border-t text-sm text-muted-foreground">共 {splits.length} 条记录</div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
