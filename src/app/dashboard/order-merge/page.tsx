'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Merge, Plus, Eye, RotateCcw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getOrderMerges, type OrderMerge } from '@/types/production-advanced-2';

const statusColors = {
  '待裁床': 'bg-yellow-100 text-yellow-700',
  '已裁床': 'bg-blue-100 text-blue-700',
  '已完成': 'bg-green-100 text-green-700',
};

export default function OrderMergePage() {
  const router = useRouter();
  const [merges, setMerges] = useState<OrderMerge[]>([]);

  useEffect(() => { setMerges(getOrderMerges()); }, []);

  const stats = {
    total: merges.length,
    totalSaving: merges.reduce((sum, m) => sum + m.fabricSaving, 0),
    avgUtilization: merges.length > 0 ? (merges.reduce((sum, m) => sum + m.utilizationRate, 0) / merges.length).toFixed(1) : '0',
  };

  return (
    <DashboardLayout>
      <div className="max-w-full mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <Merge className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">订单合并生产</h1>
              <p className="text-muted-foreground text-sm">多款同面料合并裁剪，提高利用率</p>
            </div>
          </div>
          <Button onClick={() => router.push('/dashboard/order-merge/create')}>
            <Plus className="w-4 h-4 mr-2" />新增合并
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">合并单数</p><p className="text-2xl font-bold">{stats.total}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">节省面料</p><p className="text-2xl font-bold text-green-600">{stats.totalSaving}米</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">平均利用率</p><p className="text-2xl font-bold">{stats.avgUtilization}%</p></CardContent></Card>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>合并单号</TableHead>
                  <TableHead>包含订单</TableHead>
                  <TableHead>面料编号</TableHead>
                  <TableHead>面料名称</TableHead>
                  <TableHead className="text-right">总数量</TableHead>
                  <TableHead className="text-right">利用率</TableHead>
                  <TableHead className="text-right">节省面料(米)</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>创建时间</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {merges.length === 0 ? (
                  <TableRow><TableCell colSpan={9} className="text-center py-12 text-muted-foreground">暂无数据</TableCell></TableRow>
                ) : merges.map(m => (
                  <TableRow key={m.id}>
                    <TableCell className="font-medium">{m.mergeNo}</TableCell>
                    <TableCell>{m.orderNos.length}个订单</TableCell>
                    <TableCell>{m.fabricCode}</TableCell>
                    <TableCell>{m.fabricName}</TableCell>
                    <TableCell className="text-right">{m.totalQuantity}</TableCell>
                    <TableCell className="text-right">{m.utilizationRate}%</TableCell>
                    <TableCell className="text-right text-green-600">{m.fabricSaving}</TableCell>
                    <TableCell><Badge className={statusColors[m.status]}>{m.status}</Badge></TableCell>
                    <TableCell className="text-sm">{m.createdAt}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="p-4 border-t text-sm text-muted-foreground">共 {merges.length} 条记录</div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
