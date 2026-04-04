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
import { Star, Plus, Eye, RotateCcw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getCustomerGrades, type CustomerPriceGrade, type CustomerGrade } from '@/types/production-advanced-2';

const gradeColors: Record<CustomerGrade, string> = {
  'VIP': 'bg-yellow-100 text-yellow-700',
  'A': 'bg-green-100 text-green-700',
  'B': 'bg-blue-100 text-blue-700',
  'C': 'bg-gray-100 text-gray-700',
};

export default function CustomerPriceGradePage() {
  const router = useRouter();
  const [grades, setGrades] = useState<CustomerPriceGrade[]>([]);
  const [searchName, setSearchName] = useState('');
  const [searchGrade, setSearchGrade] = useState('全部');

  useEffect(() => { setGrades(getCustomerGrades()); }, []);

  const handleReset = () => { setSearchName(''); setSearchGrade('全部'); };

  const filtered = grades.filter(g => {
    if (searchName && !g.customerName.includes(searchName)) return false;
    if (searchGrade !== '全部' && g.grade !== searchGrade) return false;
    return true;
  });

  const stats = {
    total: grades.length,
    vip: grades.filter(g => g.grade === 'VIP').length,
    a: grades.filter(g => g.grade === 'A').length,
    avgDiscount: grades.length > 0 ? (grades.reduce((sum, g) => sum + g.discountRate, 0) / grades.length).toFixed(1) : '0',
  };

  return (
    <DashboardLayout>
      <div className="max-w-full mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <Star className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">客户价格等级管理</h1>
              <p className="text-muted-foreground text-sm">不同客户不同单价、折扣管理</p>
            </div>
          </div>
          <Button onClick={() => router.push('/dashboard/customer-price-grade/create')}>
            <Plus className="w-4 h-4 mr-2" />新增等级
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">客户数</p><p className="text-2xl font-bold">{stats.total}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">VIP客户</p><p className="text-2xl font-bold text-yellow-600">{stats.vip}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">A类客户</p><p className="text-2xl font-bold text-green-600">{stats.a}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">平均折扣</p><p className="text-2xl font-bold">{stats.avgDiscount}%</p></CardContent></Card>
        </div>

        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div><Label>客户名称</Label><Input placeholder="请输入" value={searchName} onChange={(e) => setSearchName(e.target.value)} className="mt-1" /></div>
              <div><Label>等级</Label>
                <Select value={searchGrade} onValueChange={setSearchGrade}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="全部">全部</SelectItem>
                    <SelectItem value="VIP">VIP</SelectItem>
                    <SelectItem value="A">A</SelectItem>
                    <SelectItem value="B">B</SelectItem>
                    <SelectItem value="C">C</SelectItem>
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
                  <TableHead>等级</TableHead>
                  <TableHead className="text-right">折扣率(%)</TableHead>
                  <TableHead className="text-right">赊销额度</TableHead>
                  <TableHead className="text-right">账期(天)</TableHead>
                  <TableHead>价格历史</TableHead>
                  <TableHead>创建时间</TableHead>
                  <TableHead className="w-20">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={8} className="text-center py-12 text-muted-foreground">暂无数据</TableCell></TableRow>
                ) : filtered.map(g => (
                  <TableRow key={g.id}>
                    <TableCell className="font-medium">{g.customerName}</TableCell>
                    <TableCell><Badge className={gradeColors[g.grade]}>{g.grade}</Badge></TableCell>
                    <TableCell className="text-right">{g.discountRate}%</TableCell>
                    <TableCell className="text-right">¥{g.creditLimit.toLocaleString()}</TableCell>
                    <TableCell className="text-right">{g.creditDays}</TableCell>
                    <TableCell>{g.priceHistory.length}条</TableCell>
                    <TableCell className="text-sm">{g.createdAt}</TableCell>
                    <TableCell><Button size="sm" variant="ghost"><Eye className="w-4 h-4" /></Button></TableCell>
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
