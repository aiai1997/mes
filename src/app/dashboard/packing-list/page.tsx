'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, Plus, Eye, RotateCcw, Printer } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getPackingLists, type PackingList } from '@/types/production-advanced-2';

const statusColors = {
  '草稿': 'bg-gray-100 text-gray-700',
  '已确认': 'bg-green-100 text-green-700',
  '已打印': 'bg-blue-100 text-blue-700',
};

export default function PackingListPage() {
  const router = useRouter();
  const [lists, setLists] = useState<PackingList[]>([]);
  const [searchNo, setSearchNo] = useState('');

  useEffect(() => { setLists(getPackingLists()); }, []);

  const handleReset = () => { setSearchNo(''); };

  const filtered = lists.filter(l => {
    if (searchNo && !l.packingNo.includes(searchNo)) return false;
    return true;
  });

  const stats = {
    total: lists.length,
    totalCartons: lists.reduce((sum, l) => sum + l.totalCartons, 0),
    totalQty: lists.reduce((sum, l) => sum + l.totalQuantity, 0),
    totalGrossWeight: lists.reduce((sum, l) => sum + l.totalGrossWeight, 0),
  };

  return (
    <DashboardLayout>
      <div className="max-w-full mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">装箱清单 Packing List</h1>
              <p className="text-muted-foreground text-sm">出口报关单据，每箱明细</p>
            </div>
          </div>
          <Button onClick={() => router.push('/dashboard/packing-list/create')}>
            <Plus className="w-4 h-4 mr-2" />新增清单
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">清单数</p><p className="text-2xl font-bold">{stats.total}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">总箱数</p><p className="text-2xl font-bold">{stats.totalCartons}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">总件数</p><p className="text-2xl font-bold">{stats.totalQty.toLocaleString()}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">毛重(KG)</p><p className="text-2xl font-bold">{stats.totalGrossWeight.toFixed(1)}</p></CardContent></Card>
        </div>

        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div><Label>装箱单号</Label><Input placeholder="请输入" value={searchNo} onChange={(e) => setSearchNo(e.target.value)} className="mt-1" /></div>
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
                  <TableHead>装箱单号</TableHead>
                  <TableHead>订单号</TableHead>
                  <TableHead>客户</TableHead>
                  <TableHead>目的港</TableHead>
                  <TableHead className="text-right">总箱数</TableHead>
                  <TableHead className="text-right">总件数</TableHead>
                  <TableHead className="text-right">净重(KG)</TableHead>
                  <TableHead className="text-right">毛重(KG)</TableHead>
                  <TableHead className="text-right">体积(CBM)</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead className="w-24">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={11} className="text-center py-12 text-muted-foreground">暂无数据</TableCell></TableRow>
                ) : filtered.map(l => (
                  <TableRow key={l.id}>
                    <TableCell className="font-medium">{l.packingNo}</TableCell>
                    <TableCell>{l.orderNo}</TableCell>
                    <TableCell>{l.customerName}</TableCell>
                    <TableCell>{l.destinationPort}</TableCell>
                    <TableCell className="text-right">{l.totalCartons}</TableCell>
                    <TableCell className="text-right">{l.totalQuantity.toLocaleString()}</TableCell>
                    <TableCell className="text-right">{l.totalNetWeight.toFixed(1)}</TableCell>
                    <TableCell className="text-right">{l.totalGrossWeight.toFixed(1)}</TableCell>
                    <TableCell className="text-right">{l.totalVolume.toFixed(2)}</TableCell>
                    <TableCell><Badge className={statusColors[l.status]}>{l.status}</Badge></TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost"><Eye className="w-4 h-4" /></Button>
                        <Button size="sm" variant="ghost"><Printer className="w-4 h-4" /></Button>
                      </div>
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
