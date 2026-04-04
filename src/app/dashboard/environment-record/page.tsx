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
import { Thermometer, Plus, Eye, RotateCcw, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getEnvironmentRecords, type EnvironmentRecord } from '@/types/production-advanced-2';

export default function EnvironmentRecordPage() {
  const router = useRouter();
  const [records, setRecords] = useState<EnvironmentRecord[]>([]);
  const [searchWorkshop, setSearchWorkshop] = useState('');
  const [searchExceeded, setSearchExceeded] = useState('全部');

  useEffect(() => { setRecords(getEnvironmentRecords()); }, []);

  const handleReset = () => {
    setSearchWorkshop('');
    setSearchExceeded('全部');
  };

  const filtered = records.filter(r => {
    if (searchWorkshop && !r.workshopName.includes(searchWorkshop)) return false;
    if (searchExceeded === '超标' && !r.isExceeded) return false;
    if (searchExceeded === '正常' && r.isExceeded) return false;
    return true;
  });

  const stats = {
    total: records.length,
    exceeded: records.filter(r => r.isExceeded).length,
    avgTemp: records.length > 0 ? (records.reduce((sum, r) => sum + r.temperature, 0) / records.length).toFixed(1) : '0',
    avgHumidity: records.length > 0 ? (records.reduce((sum, r) => sum + r.humidity, 0) / records.length).toFixed(1) : '0',
  };

  return (
    <DashboardLayout>
      <div className="max-w-full mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <Thermometer className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">车间温湿度/环境记录</h1>
              <p className="text-muted-foreground text-sm">环境参数监控与超标预警</p>
            </div>
          </div>
          <Button onClick={() => router.push('/dashboard/environment-record/create')}>
            <Plus className="w-4 h-4 mr-2" />新增记录
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">记录总数</p><p className="text-2xl font-bold">{stats.total}</p></CardContent></Card>
          <Card className={Number(stats.exceeded) > 0 ? 'border-red-300' : ''}><CardContent className="p-4"><p className="text-sm text-muted-foreground">超标记录</p><p className="text-2xl font-bold text-red-600">{stats.exceeded}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">平均温度</p><p className="text-2xl font-bold">{stats.avgTemp}°C</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">平均湿度</p><p className="text-2xl font-bold">{stats.avgHumidity}%</p></CardContent></Card>
        </div>

        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div><Label>车间名称</Label><Input placeholder="请输入" value={searchWorkshop} onChange={(e) => setSearchWorkshop(e.target.value)} className="mt-1" /></div>
              <div><Label>超标状态</Label>
                <Select value={searchExceeded} onValueChange={setSearchExceeded}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="全部">全部</SelectItem>
                    <SelectItem value="正常">正常</SelectItem>
                    <SelectItem value="超标">超标</SelectItem>
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
                  <TableHead>记录编号</TableHead>
                  <TableHead>车间编号</TableHead>
                  <TableHead>车间名称</TableHead>
                  <TableHead className="text-center">温度(°C)</TableHead>
                  <TableHead className="text-center">标准范围</TableHead>
                  <TableHead className="text-center">湿度(%)</TableHead>
                  <TableHead className="text-center">标准范围</TableHead>
                  <TableHead>超标</TableHead>
                  <TableHead>记录人</TableHead>
                  <TableHead>记录时间</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={10} className="text-center py-12 text-muted-foreground">暂无数据</TableCell></TableRow>
                ) : filtered.map(r => (
                  <TableRow key={r.id} className={r.isExceeded ? 'bg-red-50' : ''}>
                    <TableCell className="font-medium">{r.recordNo}</TableCell>
                    <TableCell>{r.workshopNo}</TableCell>
                    <TableCell>{r.workshopName}</TableCell>
                    <TableCell className="text-center">
                      <span className={r.temperature < r.standardTempMin || r.temperature > r.standardTempMax ? 'text-red-600 font-bold' : ''}>
                        {r.temperature}
                      </span>
                    </TableCell>
                    <TableCell className="text-center text-xs text-muted-foreground">{r.standardTempMin}-{r.standardTempMax}</TableCell>
                    <TableCell className="text-center">
                      <span className={r.humidity < r.standardHumidityMin || r.humidity > r.standardHumidityMax ? 'text-red-600 font-bold' : ''}>
                        {r.humidity}
                      </span>
                    </TableCell>
                    <TableCell className="text-center text-xs text-muted-foreground">{r.standardHumidityMin}-{r.standardHumidityMax}</TableCell>
                    <TableCell>
                      {r.isExceeded ? (
                        <Badge className="bg-red-100 text-red-700"><AlertTriangle className="w-3 h-3 mr-1" />超标</Badge>
                      ) : (
                        <Badge className="bg-green-100 text-green-700">正常</Badge>
                      )}
                    </TableCell>
                    <TableCell>{r.recorder}</TableCell>
                    <TableCell className="text-sm">{r.recordTime}</TableCell>
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
