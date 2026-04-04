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
import { UserPlus, Plus, Eye, RotateCcw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getTemporaryWorkers, type TemporaryWorker } from '@/types/production-advanced-2';

const statusColors = {
  '在职': 'bg-green-100 text-green-700',
  '离职': 'bg-gray-100 text-gray-700',
  '结算中': 'bg-yellow-100 text-yellow-700',
};

export default function TemporaryWorkerPage() {
  const router = useRouter();
  const [workers, setWorkers] = useState<TemporaryWorker[]>([]);
  const [searchName, setSearchName] = useState('');
  const [searchStatus, setSearchStatus] = useState('全部');

  useEffect(() => { setWorkers(getTemporaryWorkers()); }, []);

  const handleReset = () => { setSearchName(''); setSearchStatus('全部'); };

  const filtered = workers.filter(w => {
    if (searchName && !w.name.includes(searchName)) return false;
    if (searchStatus !== '全部' && w.status !== searchStatus) return false;
    return true;
  });

  const stats = {
    total: workers.length,
    active: workers.filter(w => w.status === '在职').length,
    totalHours: workers.reduce((sum, w) => sum + w.totalHours, 0),
    totalAmount: workers.reduce((sum, w) => sum + w.totalAmount, 0),
  };

  return (
    <DashboardLayout>
      <div className="max-w-full mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <UserPlus className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">杂工/临时工管理</h1>
              <p className="text-muted-foreground text-sm">非固定员工登记、工时、结算管理</p>
            </div>
          </div>
          <Button onClick={() => router.push('/dashboard/temporary-worker/create')}>
            <Plus className="w-4 h-4 mr-2" />新增临时工
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">临时工总数</p><p className="text-2xl font-bold">{stats.total}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">在职</p><p className="text-2xl font-bold text-green-600">{stats.active}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">总工时</p><p className="text-2xl font-bold">{stats.totalHours}h</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">应付总额</p><p className="text-2xl font-bold text-blue-600">¥{stats.totalAmount.toLocaleString()}</p></CardContent></Card>
        </div>

        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div><Label>姓名</Label><Input placeholder="请输入" value={searchName} onChange={(e) => setSearchName(e.target.value)} className="mt-1" /></div>
              <div><Label>状态</Label>
                <Select value={searchStatus} onValueChange={setSearchStatus}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="全部">全部</SelectItem>
                    <SelectItem value="在职">在职</SelectItem>
                    <SelectItem value="离职">离职</SelectItem>
                    <SelectItem value="结算中">结算中</SelectItem>
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
                  <TableHead>工号</TableHead>
                  <TableHead>姓名</TableHead>
                  <TableHead>电话</TableHead>
                  <TableHead>工种</TableHead>
                  <TableHead className="text-right">时薪</TableHead>
                  <TableHead className="text-right">工作天数</TableHead>
                  <TableHead className="text-right">总工时</TableHead>
                  <TableHead className="text-right">应付金额</TableHead>
                  <TableHead className="text-right">已付金额</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>入职日期</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={11} className="text-center py-12 text-muted-foreground">暂无数据</TableCell></TableRow>
                ) : filtered.map(w => (
                  <TableRow key={w.id}>
                    <TableCell className="font-medium">{w.workerNo}</TableCell>
                    <TableCell>{w.name}</TableCell>
                    <TableCell>{w.phone}</TableCell>
                    <TableCell>{w.workType}</TableCell>
                    <TableCell className="text-right">¥{w.hourlyRate}</TableCell>
                    <TableCell className="text-right">{w.workDays}</TableCell>
                    <TableCell className="text-right">{w.totalHours}h</TableCell>
                    <TableCell className="text-right font-medium">¥{w.totalAmount.toLocaleString()}</TableCell>
                    <TableCell className="text-right text-green-600">¥{w.paidAmount.toLocaleString()}</TableCell>
                    <TableCell><Badge className={statusColors[w.status]}>{w.status}</Badge></TableCell>
                    <TableCell>{w.entryDate}</TableCell>
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
