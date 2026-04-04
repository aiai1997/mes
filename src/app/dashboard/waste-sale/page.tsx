'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Trash2, Plus, RotateCcw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getWasteSales, type WasteSale } from '@/types/production-advanced-2';

export default function WasteSalePage() {
  const router = useRouter();
  const [sales] = useState<WasteSale[]>(getWasteSales());
  const [searchNo, setSearchNo] = useState('');

  const handleReset = () => { setSearchNo(''); };

  const filtered = sales.filter(s => {
    if (searchNo && !s.saleNo.includes(searchNo)) return false;
    return true;
  });

  const stats = {
    total: sales.length,
    totalWeight: sales.reduce((sum, s) => sum + s.weight, 0),
    totalAmount: sales.reduce((sum, s) => sum + s.totalAmount, 0),
  };

  return (
    <DashboardLayout>
      <div className="max-w-full mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <Trash2 className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">布皮/碎料变卖管理</h1>
              <p className="text-muted-foreground text-sm">废料变卖收入冲减制造费用</p>
            </div>
          </div>
          <Button onClick={() => router.push('/dashboard/waste-sale/create')}>
            <Plus className="w-4 h-4 mr-2" />新增变卖
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">变卖记录</p><p className="text-2xl font-bold">{stats.total}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">总重量</p><p className="text-2xl font-bold">{stats.totalWeight}kg</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">总收入</p><p className="text-2xl font-bold text-green-600">¥{stats.totalAmount.toLocaleString()}</p></CardContent></Card>
        </div>

        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div><Label>变卖单号</Label><Input placeholder="请输入" value={searchNo} onChange={(e) => setSearchNo(e.target.value)} className="mt-1" /></div>
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
                  <TableHead>变卖单号</TableHead>
                  <TableHead>废料类别</TableHead>
                  <TableHead className="text-right">重量</TableHead>
                  <TableHead>单位</TableHead>
                  <TableHead className="text-right">单价</TableHead>
                  <TableHead className="text-right">总收入</TableHead>
                  <TableHead>购买方</TableHead>
                  <TableHead>经手人</TableHead>
                  <TableHead>变卖日期</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={9} className="text-center py-12 text-muted-foreground">暂无数据</TableCell></TableRow>
                ) : filtered.map(s => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.saleNo}</TableCell>
                    <TableCell>{s.wasteType}</TableCell>
                    <TableCell className="text-right">{s.weight}</TableCell>
                    <TableCell>{s.unit}</TableCell>
                    <TableCell className="text-right">¥{s.unitPrice}</TableCell>
                    <TableCell className="text-right font-medium text-green-600">¥{s.totalAmount.toLocaleString()}</TableCell>
                    <TableCell>{s.buyer}</TableCell>
                    <TableCell>{s.handler}</TableCell>
                    <TableCell>{s.saleDate}</TableCell>
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
