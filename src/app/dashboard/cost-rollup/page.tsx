'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Calculator, Eye, RotateCcw, RefreshCw } from 'lucide-react';
import { getCostRollups, type CostRollup } from '@/types/production-advanced-2';

export default function CostRollupPage() {
  const [rollups, setRollups] = useState<CostRollup[]>([]);
  const [searchCode, setSearchCode] = useState('');

  useEffect(() => { setRollups(getCostRollups()); }, []);

  const handleReset = () => { setSearchCode(''); };

  const filtered = rollups.filter(r => {
    if (searchCode && !r.productCode.includes(searchCode)) return false;
    return true;
  });

  const stats = {
    total: rollups.length,
    totalCost: rollups.reduce((sum, r) => sum + r.totalCost, 0),
    avgMaterialRate: rollups.length > 0 ? (rollups.reduce((sum, r) => sum + r.materialCost + r.accessoryCost, 0) / rollups.reduce((sum, r) => sum + r.totalCost, 0) * 100).toFixed(1) : '0',
  };

  return (
    <DashboardLayout>
      <div className="max-w-full mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <Calculator className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">成本卷积计算</h1>
              <p className="text-muted-foreground text-sm">多级BOM成本自动叠加，实时刷新</p>
            </div>
          </div>
          <Button><RefreshCw className="w-4 h-4 mr-2" />重新计算</Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">产品数</p><p className="text-2xl font-bold">{stats.total}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">总成本</p><p className="text-2xl font-bold text-blue-600">¥{stats.totalCost.toLocaleString()}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">材料占比</p><p className="text-2xl font-bold">{stats.avgMaterialRate}%</p></CardContent></Card>
        </div>

        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div><Label>产品编码</Label><Input placeholder="请输入" value={searchCode} onChange={(e) => setSearchCode(e.target.value)} className="mt-1" /></div>
              <div className="flex items-end gap-2">
                <Button className="flex-1">查询</Button>
                <Button variant="outline" onClick={handleReset}><RotateCcw className="w-4 h-4" /></Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>产品编码</TableHead>
                  <TableHead>产品名称</TableHead>
                  <TableHead className="text-right">主料成本</TableHead>
                  <TableHead className="text-right">辅料成本</TableHead>
                  <TableHead className="text-right">人工成本</TableHead>
                  <TableHead className="text-right">外协成本</TableHead>
                  <TableHead className="text-right">损耗成本</TableHead>
                  <TableHead className="text-right">分摊费用</TableHead>
                  <TableHead className="text-right">杂费</TableHead>
                  <TableHead className="text-right">总成本</TableHead>
                  <TableHead>计算时间</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={11} className="text-center py-12 text-muted-foreground">暂无数据</TableCell></TableRow>
                ) : filtered.map(r => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.productCode}</TableCell>
                    <TableCell>{r.productName}</TableCell>
                    <TableCell className="text-right">¥{r.materialCost.toFixed(2)}</TableCell>
                    <TableCell className="text-right">¥{r.accessoryCost.toFixed(2)}</TableCell>
                    <TableCell className="text-right">¥{r.laborCost.toFixed(2)}</TableCell>
                    <TableCell className="text-right">¥{r.outsourceCost.toFixed(2)}</TableCell>
                    <TableCell className="text-right">¥{r.wastageCost.toFixed(2)}</TableCell>
                    <TableCell className="text-right">¥{r.overheadCost.toFixed(2)}</TableCell>
                    <TableCell className="text-right">¥{r.otherCost.toFixed(2)}</TableCell>
                    <TableCell className="text-right font-bold text-blue-600">¥{r.totalCost.toFixed(2)}</TableCell>
                    <TableCell className="text-sm">{r.calculatedAt}</TableCell>
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
