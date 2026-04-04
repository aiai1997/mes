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
import { BarChart3, RotateCcw, TrendingUp, TrendingDown } from 'lucide-react';
import { getCapacityLoads, type CapacityLoad } from '@/types/production-advanced-2';

export default function CapacityLoadPage() {
  const [loads, setLoads] = useState<CapacityLoad[]>([]);
  const [searchWorkshop, setSearchWorkshop] = useState('');
  const [searchDate, setSearchDate] = useState('');

  useEffect(() => { setLoads(getCapacityLoads()); }, []);

  const handleReset = () => { setSearchWorkshop(''); setSearchDate(''); };

  const filtered = loads.filter(l => {
    if (searchWorkshop && !l.workshop.includes(searchWorkshop)) return false;
    if (searchDate && !l.date.includes(searchDate)) return false;
    return true;
  });

  const stats = {
    overload: loads.filter(l => l.loadRate > 100).length,
    highLoad: loads.filter(l => l.loadRate > 80 && l.loadRate <= 100).length,
    normal: loads.filter(l => l.loadRate <= 80).length,
    avgLoadRate: loads.length > 0 ? (loads.reduce((sum, l) => sum + l.loadRate, 0) / loads.length).toFixed(1) : '0',
  };

  const loadRateColor = (rate: number) => {
    if (rate > 100) return 'text-red-600';
    if (rate > 80) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <DashboardLayout>
      <div className="max-w-full mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">生产产能负荷分析</h1>
              <p className="text-muted-foreground text-sm">按车间分析产能利用率、预警</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-red-300"><CardContent className="p-4"><p className="text-sm text-muted-foreground">超负荷</p><p className="text-2xl font-bold text-red-600">{stats.overload}</p></CardContent></Card>
          <Card className="border-yellow-300"><CardContent className="p-4"><p className="text-sm text-muted-foreground">高负荷(&gt;80%)</p><p className="text-2xl font-bold text-yellow-600">{stats.highLoad}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">正常</p><p className="text-2xl font-bold text-green-600">{stats.normal}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">平均负荷率</p><p className="text-2xl font-bold">{stats.avgLoadRate}%</p></CardContent></Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader><CardTitle className="text-base">产能趋势</CardTitle></CardHeader>
            <CardContent className="h-48 flex items-end gap-2">
              {[85, 92, 78, 105, 88, 95, 110].map((rate, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className={`w-full rounded-t ${rate > 100 ? 'bg-red-500' : rate > 80 ? 'bg-yellow-500' : 'bg-green-500'}`} style={{ height: `${Math.min(rate, 120) * 1.5}px` }}></div>
                  <span className="text-xs text-muted-foreground">周{i + 1}</span>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-base">车间负荷对比</CardTitle></CardHeader>
            <CardContent className="h-48 flex items-end gap-4">
              {['裁床', '缝制', '整烫', '包装'].map((ws, i) => {
                const rate = [78, 95, 88, 72][i];
                return (
                  <div key={ws} className="flex-1 flex flex-col items-center gap-1">
                    <div className={`w-full rounded-t ${rate > 100 ? 'bg-red-500' : rate > 80 ? 'bg-yellow-500' : 'bg-green-500'}`} style={{ height: `${rate * 1.5}px` }}></div>
                    <span className="text-xs text-muted-foreground">{ws}</span>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div><Label>车间</Label><Input placeholder="请输入" value={searchWorkshop} onChange={(e) => setSearchWorkshop(e.target.value)} className="mt-1" /></div>
              <div><Label>日期</Label><Input type="date" value={searchDate} onChange={(e) => setSearchDate(e.target.value)} className="mt-1" /></div>
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
                  <TableHead>日期</TableHead>
                  <TableHead>车间</TableHead>
                  <TableHead className="text-right">总产能(件)</TableHead>
                  <TableHead className="text-right">已排产能(件)</TableHead>
                  <TableHead className="text-right">剩余产能(件)</TableHead>
                  <TableHead className="text-right">负荷率</TableHead>
                  <TableHead>预警</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={7} className="text-center py-12 text-muted-foreground">暂无数据</TableCell></TableRow>
                ) : filtered.map(l => (
                  <TableRow key={l.id} className={l.loadRate > 100 ? 'bg-red-50' : l.loadRate > 80 ? 'bg-yellow-50' : ''}>
                    <TableCell className="font-medium">{l.date}</TableCell>
                    <TableCell>{l.workshop}</TableCell>
                    <TableCell className="text-right">{l.totalCapacity}</TableCell>
                    <TableCell className="text-right">{l.scheduledCapacity}</TableCell>
                    <TableCell className="text-right">{l.remainingCapacity}</TableCell>
                    <TableCell className={`text-right font-bold ${loadRateColor(l.loadRate)}`}>{l.loadRate}%</TableCell>
                    <TableCell>
                      {l.loadRate > 100 && <Badge className="bg-red-100 text-red-700">超负荷</Badge>}
                      {l.loadRate > 80 && l.loadRate <= 100 && <Badge className="bg-yellow-100 text-yellow-700">高负荷</Badge>}
                      {l.loadRate <= 80 && <Badge className="bg-green-100 text-green-700">正常</Badge>}
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
