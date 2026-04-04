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
import { Timer, Plus, Eye, RotateCcw, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getProductionTakts, type ProductionTakt, type ShiftType } from '@/types/production-advanced-2';

const shiftColors: Record<ShiftType, string> = {
  '白班': 'bg-yellow-100 text-yellow-700',
  '晚班': 'bg-blue-100 text-blue-700',
  '夜班': 'bg-purple-100 text-purple-700',
};

export default function ProductionTaktPage() {
  const router = useRouter();
  const [takts, setTakts] = useState<ProductionTakt[]>([]);
  const [searchProcess, setSearchProcess] = useState('');
  const [searchTeam, setSearchTeam] = useState('');
  const [searchShift, setSearchShift] = useState('全部');

  useEffect(() => { setTakts(getProductionTakts()); }, []);

  const handleReset = () => { setSearchProcess(''); setSearchTeam(''); setSearchShift('全部'); };

  const filtered = takts.filter(t => {
    if (searchProcess && !t.processName.includes(searchProcess)) return false;
    if (searchTeam && !t.teamName.includes(searchTeam)) return false;
    if (searchShift !== '全部' && t.shift !== searchShift) return false;
    return true;
  });

  const stats = {
    total: takts.length,
    avgEfficiency: takts.length > 0 ? (takts.reduce((sum, t) => sum + t.efficiency, 0) / takts.length).toFixed(1) : '0',
    lowEfficiency: takts.filter(t => t.efficiency < 70).length,
    highEfficiency: takts.filter(t => t.efficiency >= 90).length,
  };

  return (
    <DashboardLayout>
      <div className="max-w-full mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <Timer className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">生产节拍管理</h1>
              <p className="text-muted-foreground text-sm">单件工时、节拍时间、效率分析</p>
            </div>
          </div>
          <Button onClick={() => router.push('/dashboard/production-takt/create')}>
            <Plus className="w-4 h-4 mr-2" />新增记录
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">记录总数</p><p className="text-2xl font-bold">{stats.total}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">平均效率</p><p className="text-2xl font-bold text-blue-600">{stats.avgEfficiency}%</p></CardContent></Card>
          <Card className={Number(stats.lowEfficiency) > 0 ? 'border-red-300' : ''}><CardContent className="p-4"><p className="text-sm text-muted-foreground">效率&lt;70%</p><p className="text-2xl font-bold text-red-600">{stats.lowEfficiency}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">效率≥90%</p><p className="text-2xl font-bold text-green-600">{stats.highEfficiency}</p></CardContent></Card>
        </div>

        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div><Label>工序名称</Label><Input placeholder="请输入" value={searchProcess} onChange={(e) => setSearchProcess(e.target.value)} className="mt-1" /></div>
              <div><Label>班组</Label><Input placeholder="请输入" value={searchTeam} onChange={(e) => setSearchTeam(e.target.value)} className="mt-1" /></div>
              <div><Label>班次</Label>
                <Select value={searchShift} onValueChange={setSearchShift}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="全部">全部</SelectItem>
                    <SelectItem value="白班">白班</SelectItem>
                    <SelectItem value="晚班">晚班</SelectItem>
                    <SelectItem value="夜班">夜班</SelectItem>
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
                  <TableHead>工序名称</TableHead>
                  <TableHead>班组</TableHead>
                  <TableHead>日期</TableHead>
                  <TableHead>班次</TableHead>
                  <TableHead className="text-right">标准工时(秒)</TableHead>
                  <TableHead className="text-right">目标节拍(秒)</TableHead>
                  <TableHead className="text-right">实际工时(秒)</TableHead>
                  <TableHead className="text-right">效率</TableHead>
                  <TableHead className="text-right">产出</TableHead>
                  <TableHead className="text-right">人数</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={10} className="text-center py-12 text-muted-foreground">暂无数据</TableCell></TableRow>
                ) : filtered.map(t => (
                  <TableRow key={t.id} className={t.efficiency < 70 ? 'bg-red-50' : t.efficiency >= 90 ? 'bg-green-50' : ''}>
                    <TableCell className="font-medium">{t.processName}</TableCell>
                    <TableCell>{t.teamName}</TableCell>
                    <TableCell>{t.date}</TableCell>
                    <TableCell><Badge className={shiftColors[t.shift]}>{t.shift}</Badge></TableCell>
                    <TableCell className="text-right">{t.standardTime}</TableCell>
                    <TableCell className="text-right">{t.targetTakt}</TableCell>
                    <TableCell className="text-right">{t.actualTime}</TableCell>
                    <TableCell className="text-right">
                      <span className={t.efficiency < 70 ? 'text-red-600 font-bold' : t.efficiency >= 90 ? 'text-green-600 font-bold' : ''}>
                        {t.efficiency.toFixed(1)}%
                      </span>
                      {t.efficiency < 70 && <AlertTriangle className="w-3 h-3 inline ml-1 text-red-500" />}
                    </TableCell>
                    <TableCell className="text-right">{t.output}</TableCell>
                    <TableCell className="text-right">{t.workerCount}</TableCell>
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
