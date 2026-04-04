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
import { CreditCard, Eye, RotateCcw, AlertTriangle } from 'lucide-react';
import { getCustomerCredits, type CustomerCredit } from '@/types/production-advanced-2';

const statusColors = {
  '正常': 'bg-green-100 text-green-700',
  '超额度': 'bg-red-100 text-red-700',
  '逾期': 'bg-orange-100 text-orange-700',
};

const warningColors = {
  '绿色': 'bg-green-100 text-green-700',
  '黄色': 'bg-yellow-100 text-yellow-700',
  '红色': 'bg-red-100 text-red-700',
};

export default function CustomerCreditPage() {
  const [credits, setCredits] = useState<CustomerCredit[]>([]);
  const [searchName, setSearchName] = useState('');
  const [searchWarning, setSearchWarning] = useState('全部');

  useEffect(() => { setCredits(getCustomerCredits()); }, []);

  const handleReset = () => { setSearchName(''); setSearchWarning('全部'); };

  const filtered = credits.filter(c => {
    if (searchName && !c.customerName.includes(searchName)) return false;
    if (searchWarning !== '全部' && c.warningLevel !== searchWarning) return false;
    return true;
  });

  const stats = {
    total: credits.length,
    overLimit: credits.filter(c => c.status === '超额度').length,
    overdue: credits.filter(c => c.status === '逾期').length,
    totalOverdue: credits.reduce((sum, c) => sum + c.overdueAmount, 0),
  };

  return (
    <DashboardLayout>
      <div className="max-w-full mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">客户授权/赊销额度管理</h1>
              <p className="text-muted-foreground text-sm">超额度禁止发货，账期到期预警</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">客户总数</p><p className="text-2xl font-bold">{stats.total}</p></CardContent></Card>
          <Card className={stats.overLimit > 0 ? 'border-red-300' : ''}><CardContent className="p-4"><p className="text-sm text-muted-foreground">超额度</p><p className="text-2xl font-bold text-red-600">{stats.overLimit}</p></CardContent></Card>
          <Card className={stats.overdue > 0 ? 'border-orange-300' : ''}><CardContent className="p-4"><p className="text-sm text-muted-foreground">逾期</p><p className="text-2xl font-bold text-orange-600">{stats.overdue}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">逾期金额</p><p className="text-2xl font-bold text-red-600">¥{stats.totalOverdue.toLocaleString()}</p></CardContent></Card>
        </div>

        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div><Label>客户名称</Label><Input placeholder="请输入" value={searchName} onChange={(e) => setSearchName(e.target.value)} className="mt-1" /></div>
              <div><Label>预警等级</Label>
                <Select value={searchWarning} onValueChange={setSearchWarning}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="全部">全部</SelectItem>
                    <SelectItem value="绿色">绿色</SelectItem>
                    <SelectItem value="黄色">黄色</SelectItem>
                    <SelectItem value="红色">红色</SelectItem>
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
                  <TableHead>客户名称</TableHead>
                  <TableHead className="text-right">赊销额度</TableHead>
                  <TableHead className="text-right">已用金额</TableHead>
                  <TableHead className="text-right">可用金额</TableHead>
                  <TableHead className="text-right">逾期金额</TableHead>
                  <TableHead className="text-right">账期(天)</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>预警等级</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={8} className="text-center py-12 text-muted-foreground">暂无数据</TableCell></TableRow>
                ) : filtered.map(c => (
                  <TableRow key={c.id} className={c.warningLevel === '红色' ? 'bg-red-50' : c.warningLevel === '黄色' ? 'bg-yellow-50' : ''}>
                    <TableCell className="font-medium">{c.customerName}</TableCell>
                    <TableCell className="text-right">¥{c.creditLimit.toLocaleString()}</TableCell>
                    <TableCell className="text-right">¥{c.usedAmount.toLocaleString()}</TableCell>
                    <TableCell className={`text-right ${c.availableAmount < 0 ? 'text-red-600' : ''}`}>¥{c.availableAmount.toLocaleString()}</TableCell>
                    <TableCell className="text-right text-red-600">¥{c.overdueAmount.toLocaleString()}</TableCell>
                    <TableCell className="text-right">{c.creditDays}</TableCell>
                    <TableCell><Badge className={statusColors[c.status]}>{c.status}</Badge></TableCell>
                    <TableCell><Badge className={warningColors[c.warningLevel]}>{c.warningLevel}</Badge></TableCell>
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
