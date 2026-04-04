'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PackageSearch, Plus, RotateCcw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getAccessoryInventoryChecks, type AccessoryInventoryCheck } from '@/types/production-advanced-2';

const statusColors = {
  '待审核': 'bg-yellow-100 text-yellow-700',
  '已审核': 'bg-green-100 text-green-700',
};

export default function AccessoryInventoryCheckPage() {
  const router = useRouter();
  const [checks] = useState<AccessoryInventoryCheck[]>(getAccessoryInventoryChecks());
  const [searchNo, setSearchNo] = useState('');

  const handleReset = () => { setSearchNo(''); };

  const filtered = checks.filter(c => {
    if (searchNo && !c.checkNo.includes(searchNo)) return false;
    return true;
  });

  return (
    <DashboardLayout>
      <div className="max-w-full mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <PackageSearch className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">生产辅料盘点专项</h1>
              <p className="text-muted-foreground text-sm">线、扣、拉链、标专项盘点</p>
            </div>
          </div>
          <Button onClick={() => router.push('/dashboard/accessory-check/create')}>
            <Plus className="w-4 h-4 mr-2" />新增盘点
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">盘点单数</p><p className="text-2xl font-bold">{checks.length}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">已审核</p><p className="text-2xl font-bold text-green-600">{checks.filter(c => c.status === '已审核').length}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">总差异</p><p className="text-2xl font-bold text-red-600">{checks.reduce((sum, c) => sum + c.totalDifference, 0)}</p></CardContent></Card>
        </div>

        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div><Label>盘点单号</Label><Input placeholder="请输入" value={searchNo} onChange={(e) => setSearchNo(e.target.value)} className="mt-1" /></div>
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
                  <TableHead>盘点单号</TableHead>
                  <TableHead>盘点日期</TableHead>
                  <TableHead>仓库</TableHead>
                  <TableHead className="text-right">物料数</TableHead>
                  <TableHead className="text-right">总差异</TableHead>
                  <TableHead>盘点人</TableHead>
                  <TableHead>审核人</TableHead>
                  <TableHead>状态</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={8} className="text-center py-12 text-muted-foreground">暂无数据</TableCell></TableRow>
                ) : filtered.map(c => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.checkNo}</TableCell>
                    <TableCell>{c.checkDate}</TableCell>
                    <TableCell>{c.warehouse}</TableCell>
                    <TableCell className="text-right">{c.items.length}</TableCell>
                    <TableCell className={`text-right ${c.totalDifference !== 0 ? 'text-red-600 font-bold' : ''}`}>{c.totalDifference}</TableCell>
                    <TableCell>{c.checker}</TableCell>
                    <TableCell>{c.reviewer || '-'}</TableCell>
                    <TableCell><Badge className={statusColors[c.status]}>{c.status}</Badge></TableCell>
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
