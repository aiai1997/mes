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
import { Award, Plus, Eye, RotateCcw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getRewardPenalties, type RewardPenalty } from '@/types/production-advanced-2';

const typeColors = {
  '奖励': 'bg-green-100 text-green-700',
  '罚款': 'bg-red-100 text-red-700',
};

const categoryColors = {
  '效率': 'bg-blue-100 text-blue-700',
  '品质': 'bg-purple-100 text-purple-700',
  '全勤': 'bg-green-100 text-green-700',
  '返工': 'bg-orange-100 text-orange-700',
  '报废': 'bg-red-100 text-red-700',
  '迟到': 'bg-yellow-100 text-yellow-700',
  '浪费': 'bg-gray-100 text-gray-700',
};

export default function RewardPenaltyPage() {
  const router = useRouter();
  const [records, setRecords] = useState<RewardPenalty[]>([]);
  const [searchName, setSearchName] = useState('');
  const [searchType, setSearchType] = useState('全部');
  const [searchStatus, setSearchStatus] = useState('全部');

  useEffect(() => { setRecords(getRewardPenalties()); }, []);

  const handleReset = () => { setSearchName(''); setSearchType('全部'); setSearchStatus('全部'); };

  const filtered = records.filter(r => {
    if (searchName && !r.employeeName.includes(searchName)) return false;
    if (searchType !== '全部' && r.type !== searchType) return false;
    if (searchStatus !== '全部' && r.status !== searchStatus) return false;
    return true;
  });

  const stats = {
    total: records.length,
    rewards: records.filter(r => r.type === '奖励').reduce((sum, r) => sum + r.amount, 0),
    penalties: records.filter(r => r.type === '罚款').reduce((sum, r) => sum + r.amount, 0),
    netAmount: records.filter(r => r.type === '奖励').reduce((sum, r) => sum + r.amount, 0) - records.filter(r => r.type === '罚款').reduce((sum, r) => sum + r.amount, 0),
  };

  return (
    <DashboardLayout>
      <div className="max-w-full mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <Award className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">车间罚款/奖励管理</h1>
              <p className="text-muted-foreground text-sm">质量/纪律/效率奖罚管理</p>
            </div>
          </div>
          <Button onClick={() => router.push('/dashboard/reward-penalty/create')}>
            <Plus className="w-4 h-4 mr-2" />新增记录
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">记录总数</p><p className="text-2xl font-bold">{stats.total}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">奖励总额</p><p className="text-2xl font-bold text-green-600">¥{stats.rewards.toLocaleString()}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">罚款总额</p><p className="text-2xl font-bold text-red-600">¥{stats.penalties.toLocaleString()}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">净额</p><p className={`text-2xl font-bold ${stats.netAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>¥{stats.netAmount.toLocaleString()}</p></CardContent></Card>
        </div>

        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div><Label>员工姓名</Label><Input placeholder="请输入" value={searchName} onChange={(e) => setSearchName(e.target.value)} className="mt-1" /></div>
              <div><Label>类型</Label>
                <Select value={searchType} onValueChange={setSearchType}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="全部">全部</SelectItem>
                    <SelectItem value="奖励">奖励</SelectItem>
                    <SelectItem value="罚款">罚款</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>状态</Label>
                <Select value={searchStatus} onValueChange={setSearchStatus}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="全部">全部</SelectItem>
                    <SelectItem value="待确认">待确认</SelectItem>
                    <SelectItem value="已确认">已确认</SelectItem>
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
                  <TableHead>员工姓名</TableHead>
                  <TableHead>类型</TableHead>
                  <TableHead>类别</TableHead>
                  <TableHead className="text-right">金额</TableHead>
                  <TableHead>原因</TableHead>
                  <TableHead>订单号</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>创建时间</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={9} className="text-center py-12 text-muted-foreground">暂无数据</TableCell></TableRow>
                ) : filtered.map(r => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.recordNo}</TableCell>
                    <TableCell>{r.employeeName}</TableCell>
                    <TableCell><Badge className={typeColors[r.type]}>{r.type}</Badge></TableCell>
                    <TableCell><Badge className={categoryColors[r.category]}>{r.category}</Badge></TableCell>
                    <TableCell className={`text-right font-medium ${r.type === '奖励' ? 'text-green-600' : 'text-red-600'}`}>
                      {r.type === '奖励' ? '+' : '-'}¥{r.amount}
                    </TableCell>
                    <TableCell>{r.reason}</TableCell>
                    <TableCell>{r.orderNo || '-'}</TableCell>
                    <TableCell><Badge className={r.status === '已确认' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>{r.status}</Badge></TableCell>
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
