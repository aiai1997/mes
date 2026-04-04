'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Eye, RotateCcw, AlertTriangle } from 'lucide-react';
import { getPurchasePriceCompares, type PurchasePriceCompare } from '@/types/production-advanced-2';

export default function PurchasePriceComparePage() {
  const [compares, setCompares] = useState<PurchasePriceCompare[]>([]);
  const [searchCode, setSearchCode] = useState('');
  const [searchAbnormal, setSearchAbnormal] = useState('全部');

  useEffect(() => { setCompares(getPurchasePriceCompares()); }, []);

  const handleReset = () => { setSearchCode(''); setSearchAbnormal('全部'); };

  const filtered = compares.filter(c => {
    if (searchCode && !c.materialCode.includes(searchCode)) return false;
    if (searchAbnormal === '异常' && !c.isAbnormal) return false;
    if (searchAbnormal === '正常' && c.isAbnormal) return false;
    return true;
  });

  const stats = {
    total: compares.length,
    abnormal: compares.filter(c => c.isAbnormal).length,
    avgChange: compares.length > 0 ? (compares.reduce((sum, c) => sum + c.priceChange, 0) / compares.length).toFixed(1) : '0',
  };

  return (
    <DashboardLayout>
      <div className="max-w-full mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">采购价格对比管理</h1>
              <p className="text-muted-foreground text-sm">历史采购价对比，异常偏高预警</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">物料数</p><p className="text-2xl font-bold">{stats.total}</p></CardContent></Card>
          <Card className={stats.abnormal > 0 ? 'border-red-300' : ''}><CardContent className="p-4"><p className="text-sm text-muted-foreground">价格异常</p><p className="text-2xl font-bold text-red-600">{stats.abnormal}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">平均涨幅</p><p className={`text-2xl font-bold ${Number(stats.avgChange) > 0 ? 'text-red-600' : 'text-green-600'}`}>{stats.avgChange}%</p></CardContent></Card>
        </div>

        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div><Label>物料编码</Label><Input placeholder="请输入" value={searchCode} onChange={(e) => setSearchCode(e.target.value)} className="mt-1" /></div>
              <div><Label>价格状态</Label>
                <select className="w-full mt-1 border rounded px-3 py-2" value={searchAbnormal} onChange={(e) => setSearchAbnormal(e.target.value)}>
                  <option value="全部">全部</option>
                  <option value="正常">正常</option>
                  <option value="异常">异常</option>
                </select>
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
                  <TableHead>物料编码</TableHead>
                  <TableHead>物料名称</TableHead>
                  <TableHead>供应商</TableHead>
                  <TableHead className="text-right">当前价格</TableHead>
                  <TableHead className="text-right">历史最低</TableHead>
                  <TableHead className="text-right">历史最高</TableHead>
                  <TableHead className="text-right">历史均价</TableHead>
                  <TableHead className="text-right">价格变动</TableHead>
                  <TableHead>最近采购</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={9} className="text-center py-12 text-muted-foreground">暂无数据</TableCell></TableRow>
                ) : filtered.map(c => (
                  <TableRow key={c.id} className={c.isAbnormal ? 'bg-red-50' : ''}>
                    <TableCell className="font-medium">{c.materialCode}</TableCell>
                    <TableCell>{c.materialName}</TableCell>
                    <TableCell>{c.supplier}</TableCell>
                    <TableCell className="text-right font-medium">¥{c.currentPrice}</TableCell>
                    <TableCell className="text-right text-green-600">¥{c.historyMinPrice}</TableCell>
                    <TableCell className="text-right text-red-600">¥{c.historyMaxPrice}</TableCell>
                    <TableCell className="text-right">¥{c.historyAvgPrice}</TableCell>
                    <TableCell className="text-right">
                      <span className={c.priceChange > 0 ? 'text-red-600' : c.priceChange < 0 ? 'text-green-600' : ''}>
                        {c.priceChange > 0 ? '+' : ''}{c.priceChange}%
                        {c.isAbnormal && <AlertTriangle className="w-3 h-3 inline ml-1 text-red-500" />}
                      </span>
                    </TableCell>
                    <TableCell>{c.lastPurchaseDate}</TableCell>
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
