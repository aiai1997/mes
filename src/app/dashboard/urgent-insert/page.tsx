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
import { Zap, Plus, Eye, RotateCcw, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getUrgentInserts, type UrgentOrderInsert } from '@/types/production-advanced-2';

const statusColors = {
  '待审批': 'bg-yellow-100 text-yellow-700',
  '已批准': 'bg-green-100 text-green-700',
  '已拒绝': 'bg-red-100 text-red-700',
};

export default function UrgentInsertPage() {
  const router = useRouter();
  const [inserts, setInserts] = useState<UrgentOrderInsert[]>([]);
  const [searchNo, setSearchNo] = useState('');
  const [searchStatus, setSearchStatus] = useState('全部');

  useEffect(() => { setInserts(getUrgentInserts()); }, []);

  const handleReset = () => { setSearchNo(''); setSearchStatus('全部'); };

  const filtered = inserts.filter(i => {
    if (searchNo && !i.insertNo.includes(searchNo)) return false;
    if (searchStatus !== '全部' && i.status !== searchStatus) return false;
    return true;
  });

  const stats = {
    total: inserts.length,
    pending: inserts.filter(i => i.status === '待审批').length,
    approved: inserts.filter(i => i.status === '已批准').length,
    affectedOrders: inserts.reduce((sum, i) => sum + i.affectedOrders.length, 0),
  };

  return (
    <DashboardLayout>
      <div className="max-w-full mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <Zap className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">生产急单插单管理</h1>
              <p className="text-muted-foreground text-sm">插单申请、审批、影响订单交期提示</p>
            </div>
          </div>
          <Button onClick={() => router.push('/dashboard/urgent-insert/create')}>
            <Plus className="w-4 h-4 mr-2" />申请插单
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">插单申请</p><p className="text-2xl font-bold">{stats.total}</p></CardContent></Card>
          <Card className={stats.pending > 0 ? 'border-yellow-300' : ''}><CardContent className="p-4"><p className="text-sm text-muted-foreground">待审批</p><p className="text-2xl font-bold text-yellow-600">{stats.pending}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">已批准</p><p className="text-2xl font-bold text-green-600">{stats.approved}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">受影响订单</p><p className="text-2xl font-bold text-red-600">{stats.affectedOrders}</p></CardContent></Card>
        </div>

        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div><Label>插单单号</Label><Input placeholder="请输入" value={searchNo} onChange={(e) => setSearchNo(e.target.value)} className="mt-1" /></div>
              <div><Label>状态</Label>
                <Select value={searchStatus} onValueChange={setSearchStatus}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="全部">全部</SelectItem>
                    <SelectItem value="待审批">待审批</SelectItem>
                    <SelectItem value="已批准">已批准</SelectItem>
                    <SelectItem value="已拒绝">已拒绝</SelectItem>
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
                  <TableHead>插单单号</TableHead>
                  <TableHead>订单号</TableHead>
                  <TableHead className="text-right">原优先级</TableHead>
                  <TableHead className="text-right">新优先级</TableHead>
                  <TableHead>受影响订单</TableHead>
                  <TableHead>插单原因</TableHead>
                  <TableHead>审批人</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>创建时间</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={9} className="text-center py-12 text-muted-foreground">暂无数据</TableCell></TableRow>
                ) : filtered.map(i => (
                  <TableRow key={i.id} className={i.status === '待审批' ? 'bg-yellow-50' : ''}>
                    <TableCell className="font-medium">{i.insertNo}</TableCell>
                    <TableCell>{i.orderNo}</TableCell>
                    <TableCell className="text-right">{i.originalPriority}</TableCell>
                    <TableCell className="text-right text-green-600 font-bold">{i.newPriority}</TableCell>
                    <TableCell>
                      {i.affectedOrders.length > 0 ? (
                        <span className="text-red-600"><AlertTriangle className="w-3 h-3 inline mr-1" />{i.affectedOrders.length}个订单</span>
                      ) : '-'}
                    </TableCell>
                    <TableCell>{i.insertReason}</TableCell>
                    <TableCell>{i.approvedBy || '-'}</TableCell>
                    <TableCell><Badge className={statusColors[i.status]}>{i.status}</Badge></TableCell>
                    <TableCell className="text-sm">{i.createdAt}</TableCell>
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
