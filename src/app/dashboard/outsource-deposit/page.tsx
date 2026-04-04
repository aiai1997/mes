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
import { ShieldCheck, Plus, Eye, RotateCcw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getOutsourceDeposits, type OutsourceDeposit } from '@/types/production-advanced-2';

const depositTypeColors = {
  '押金': 'bg-blue-100 text-blue-700',
  '保证金': 'bg-purple-100 text-purple-700',
};

const statusColors = {
  '已缴纳': 'bg-green-100 text-green-700',
  '部分扣除': 'bg-yellow-100 text-yellow-700',
  '已退还': 'bg-gray-100 text-gray-700',
};

export default function OutsourceDepositPage() {
  const router = useRouter();
  const [deposits, setDeposits] = useState<OutsourceDeposit[]>([]);
  const [searchNo, setSearchNo] = useState('');
  const [searchType, setSearchType] = useState('全部');
  const [searchStatus, setSearchStatus] = useState('全部');

  useEffect(() => { setDeposits(getOutsourceDeposits()); }, []);

  const handleReset = () => { setSearchNo(''); setSearchType('全部'); setSearchStatus('全部'); };

  const filtered = deposits.filter(d => {
    if (searchNo && !d.depositNo.includes(searchNo)) return false;
    if (searchType !== '全部' && d.depositType !== searchType) return false;
    if (searchStatus !== '全部' && d.status !== searchStatus) return false;
    return true;
  });

  const stats = {
    total: deposits.length,
    totalAmount: deposits.reduce((sum, d) => sum + d.amount, 0),
    totalBalance: deposits.reduce((sum, d) => sum + d.balance, 0),
    totalDeducted: deposits.reduce((sum, d) => sum + d.deductedAmount, 0),
  };

  return (
    <DashboardLayout>
      <div className="max-w-full mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">外协厂押金/保证金管理</h1>
              <p className="text-muted-foreground text-sm">押金缴纳、扣除、退还管理</p>
            </div>
          </div>
          <Button onClick={() => router.push('/dashboard/outsource-deposit/create')}>
            <Plus className="w-4 h-4 mr-2" />新增押金
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">押金笔数</p><p className="text-2xl font-bold">{stats.total}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">押金总额</p><p className="text-2xl font-bold text-blue-600">¥{stats.totalAmount.toLocaleString()}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">剩余余额</p><p className="text-2xl font-bold text-green-600">¥{stats.totalBalance.toLocaleString()}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">已扣除</p><p className="text-2xl font-bold text-red-600">¥{stats.totalDeducted.toLocaleString()}</p></CardContent></Card>
        </div>

        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div><Label>押金单号</Label><Input placeholder="请输入" value={searchNo} onChange={(e) => setSearchNo(e.target.value)} className="mt-1" /></div>
              <div><Label>类型</Label>
                <Select value={searchType} onValueChange={setSearchType}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="全部">全部</SelectItem>
                    <SelectItem value="押金">押金</SelectItem>
                    <SelectItem value="保证金">保证金</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>状态</Label>
                <Select value={searchStatus} onValueChange={setSearchStatus}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="全部">全部</SelectItem>
                    <SelectItem value="已缴纳">已缴纳</SelectItem>
                    <SelectItem value="部分扣除">部分扣除</SelectItem>
                    <SelectItem value="已退还">已退还</SelectItem>
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
                  <TableHead>押金单号</TableHead>
                  <TableHead>类型</TableHead>
                  <TableHead>供应商</TableHead>
                  <TableHead className="text-right">押金金额</TableHead>
                  <TableHead className="text-right">已缴纳</TableHead>
                  <TableHead className="text-right">已扣除</TableHead>
                  <TableHead className="text-right">已退还</TableHead>
                  <TableHead className="text-right">剩余余额</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>缴纳日期</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={10} className="text-center py-12 text-muted-foreground">暂无数据</TableCell></TableRow>
                ) : filtered.map(d => (
                  <TableRow key={d.id}>
                    <TableCell className="font-medium">{d.depositNo}</TableCell>
                    <TableCell><Badge className={depositTypeColors[d.depositType]}>{d.depositType}</Badge></TableCell>
                    <TableCell>{d.supplierName}</TableCell>
                    <TableCell className="text-right">¥{d.amount.toLocaleString()}</TableCell>
                    <TableCell className="text-right">¥{d.paidAmount.toLocaleString()}</TableCell>
                    <TableCell className="text-right text-red-600">¥{d.deductedAmount.toLocaleString()}</TableCell>
                    <TableCell className="text-right text-green-600">¥{d.returnedAmount.toLocaleString()}</TableCell>
                    <TableCell className="text-right font-medium">¥{d.balance.toLocaleString()}</TableCell>
                    <TableCell><Badge className={statusColors[d.status]}>{d.status}</Badge></TableCell>
                    <TableCell>{d.paymentDate}</TableCell>
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
