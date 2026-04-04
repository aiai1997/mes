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
import { FileCheck, Plus, Eye, RotateCcw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getReleaseNotesWithCreated, type ReleaseNoteWithCreatedAt as ReleaseNote } from '@/types/production-advanced-2';

const statusColors = {
  '待审批': 'bg-yellow-100 text-yellow-700',
  '已批准': 'bg-blue-100 text-blue-700',
  '已放行': 'bg-green-100 text-green-700',
};

export default function ReleaseNotePage() {
  const router = useRouter();
  const [releases, setReleases] = useState<ReleaseNote[]>([]);
  const [searchNo, setSearchNo] = useState('');
  const [searchStatus, setSearchStatus] = useState('全部');

  useEffect(() => { setReleases(getReleaseNotesWithCreated()); }, []);

  const handleReset = () => { setSearchNo(''); setSearchStatus('全部'); };

  const filtered = releases.filter(r => {
    if (searchNo && !r.releaseNo.includes(searchNo)) return false;
    if (searchStatus !== '全部' && r.status !== searchStatus) return false;
    return true;
  });

  const stats = {
    total: releases.length,
    pending: releases.filter(r => r.status === '待审批').length,
    released: releases.filter(r => r.status === '已放行').length,
    totalQty: releases.reduce((sum, r) => sum + r.totalQuantity, 0),
  };

  return (
    <DashboardLayout>
      <div className="max-w-full mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <FileCheck className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">客户物料放行条</h1>
              <p className="text-muted-foreground text-sm">出货必须签字，无放行条禁止发货</p>
            </div>
          </div>
          <Button onClick={() => router.push('/dashboard/release-note/create')}>
            <Plus className="w-4 h-4 mr-2" />新增放行条
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">放行条数</p><p className="text-2xl font-bold">{stats.total}</p></CardContent></Card>
          <Card className={stats.pending > 0 ? 'border-yellow-300' : ''}><CardContent className="p-4"><p className="text-sm text-muted-foreground">待审批</p><p className="text-2xl font-bold text-yellow-600">{stats.pending}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">已放行</p><p className="text-2xl font-bold text-green-600">{stats.released}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">放行总数</p><p className="text-2xl font-bold">{stats.totalQty}</p></CardContent></Card>
        </div>

        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div><Label>放行单号</Label><Input placeholder="请输入" value={searchNo} onChange={(e) => setSearchNo(e.target.value)} className="mt-1" /></div>
              <div><Label>状态</Label>
                <Select value={searchStatus} onValueChange={setSearchStatus}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="全部">全部</SelectItem>
                    <SelectItem value="待审批">待审批</SelectItem>
                    <SelectItem value="已批准">已批准</SelectItem>
                    <SelectItem value="已放行">已放行</SelectItem>
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
                  <TableHead>放行单号</TableHead>
                  <TableHead>订单号</TableHead>
                  <TableHead>客户</TableHead>
                  <TableHead className="text-right">产品数</TableHead>
                  <TableHead className="text-right">总数量</TableHead>
                  <TableHead className="text-right">总箱数</TableHead>
                  <TableHead>审批人</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>创建时间</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={9} className="text-center py-12 text-muted-foreground">暂无数据</TableCell></TableRow>
                ) : filtered.map(r => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.releaseNo}</TableCell>
                    <TableCell>{r.orderNo}</TableCell>
                    <TableCell>{r.customerName}</TableCell>
                    <TableCell className="text-right">{r.releaseItems.length}</TableCell>
                    <TableCell className="text-right">{r.totalQuantity}</TableCell>
                    <TableCell className="text-right">{r.totalCartons}</TableCell>
                    <TableCell>{r.approvedBy || '-'}</TableCell>
                    <TableCell><Badge className={statusColors[r.status]}>{r.status}</Badge></TableCell>
                    <TableCell className="text-sm">{r.createdAt}</TableCell>
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
