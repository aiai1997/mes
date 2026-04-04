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
import { RefreshCcw, Plus, Eye, RotateCcw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getShiftHandovers, type ShiftHandover, type ShiftType } from '@/types/production-advanced-2';

const shiftColors: Record<ShiftType, string> = {
  '白班': 'bg-yellow-100 text-yellow-700',
  '晚班': 'bg-blue-100 text-blue-700',
  '夜班': 'bg-purple-100 text-purple-700',
};

export default function ShiftHandoverPage() {
  const router = useRouter();
  const [handovers, setHandovers] = useState<ShiftHandover[]>([]);
  const [searchWorkshop, setSearchWorkshop] = useState('');
  const [searchShift, setSearchShift] = useState('全部');

  useEffect(() => { setHandovers(getShiftHandovers()); }, []);

  const handleReset = () => { setSearchWorkshop(''); setSearchShift('全部'); };

  const filtered = handovers.filter(h => {
    if (searchWorkshop && !h.workshop.includes(searchWorkshop)) return false;
    if (searchShift !== '全部' && h.shift !== searchShift) return false;
    return true;
  });

  return (
    <DashboardLayout>
      <div className="max-w-full mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <RefreshCcw className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">车间交接班记录</h1>
              <p className="text-muted-foreground text-sm">白班/晚班/夜班交接管理</p>
            </div>
          </div>
          <Button onClick={() => router.push('/dashboard/shift-handover/create')}>
            <Plus className="w-4 h-4 mr-2" />新增交接
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">交接记录</p><p className="text-2xl font-bold">{handovers.length}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">白班</p><p className="text-2xl font-bold text-yellow-600">{handovers.filter(h => h.shift === '白班').length}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">晚班</p><p className="text-2xl font-bold text-blue-600">{handovers.filter(h => h.shift === '晚班').length}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">夜班</p><p className="text-2xl font-bold text-purple-600">{handovers.filter(h => h.shift === '夜班').length}</p></CardContent></Card>
        </div>

        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div><Label>车间</Label><Input placeholder="请输入" value={searchWorkshop} onChange={(e) => setSearchWorkshop(e.target.value)} className="mt-1" /></div>
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
                  <TableHead>交接单号</TableHead>
                  <TableHead>车间</TableHead>
                  <TableHead>班次</TableHead>
                  <TableHead>交班人</TableHead>
                  <TableHead>接班人</TableHead>
                  <TableHead>订单进度</TableHead>
                  <TableHead>异常问题</TableHead>
                  <TableHead>接班签字</TableHead>
                  <TableHead>交接时间</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={9} className="text-center py-12 text-muted-foreground">暂无数据</TableCell></TableRow>
                ) : filtered.map(h => (
                  <TableRow key={h.id}>
                    <TableCell className="font-medium">{h.handoverNo}</TableCell>
                    <TableCell>{h.workshop}</TableCell>
                    <TableCell><Badge className={shiftColors[h.shift]}>{h.shift}</Badge></TableCell>
                    <TableCell>{h.handoverPerson}</TableCell>
                    <TableCell>{h.receiver}</TableCell>
                    <TableCell>{h.orderProgress.length}个订单</TableCell>
                    <TableCell className="text-sm">{h.issues || '-'}</TableCell>
                    <TableCell><Badge className={h.receiverSign ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>{h.receiverSign ? '已签字' : '未签字'}</Badge></TableCell>
                    <TableCell className="text-sm">{h.handoverTime}</TableCell>
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
