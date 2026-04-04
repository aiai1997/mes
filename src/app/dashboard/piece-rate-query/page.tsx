'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calculator, RotateCcw, TrendingUp, Users, DollarSign } from 'lucide-react';
import { getPieceRateQueries, type PieceRateQuery } from '@/types/production-advanced-2';

export default function PieceRateQueryPage() {
  const [queries, setQueries] = useState<PieceRateQuery[]>([]);
  const [searchEmployee, setSearchEmployee] = useState('');
  const [searchDate, setSearchDate] = useState('');

  useEffect(() => { setQueries(getPieceRateQueries()); }, []);

  const handleReset = () => { setSearchEmployee(''); setSearchDate(''); };

  const filtered = queries.filter(q => {
    if (searchEmployee && !q.employeeName.includes(searchEmployee)) return false;
    if (searchDate && !q.date.includes(searchDate)) return false;
    return true;
  });

  const stats = {
    employees: new Set(queries.map(q => q.employeeId)).size,
    totalQty: queries.reduce((sum, q) => sum + q.totalQuantity, 0),
    totalAmount: queries.reduce((sum, q) => sum + q.totalAmount, 0),
    avgAmount: queries.length > 0 ? (queries.reduce((sum, q) => sum + q.totalAmount, 0) / queries.length).toFixed(2) : '0',
  };

  const topEmployees = [...queries]
    .sort((a, b) => b.totalAmount - a.totalAmount)
    .slice(0, 5);

  return (
    <DashboardLayout>
      <div className="max-w-full mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <Calculator className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">员工计件实时查询</h1>
              <p className="text-muted-foreground text-sm">实时查询员工计件数量与工资金额</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card><CardContent className="p-4 flex items-center gap-3"><Users className="w-8 h-8 text-blue-600" /><div><p className="text-sm text-muted-foreground">员工数</p><p className="text-2xl font-bold">{stats.employees}</p></div></CardContent></Card>
          <Card><CardContent className="p-4 flex items-center gap-3"><TrendingUp className="w-8 h-8 text-green-600" /><div><p className="text-sm text-muted-foreground">总件数</p><p className="text-2xl font-bold">{stats.totalQty.toLocaleString()}</p></div></CardContent></Card>
          <Card><CardContent className="p-4 flex items-center gap-3"><DollarSign className="w-8 h-8 text-purple-600" /><div><p className="text-sm text-muted-foreground">总金额</p><p className="text-2xl font-bold">¥{stats.totalAmount.toLocaleString()}</p></div></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">人均金额</p><p className="text-2xl font-bold">¥{stats.avgAmount}</p></CardContent></Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="md:col-span-2">
            <CardContent className="p-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div><Label>员工姓名</Label><Input placeholder="请输入" value={searchEmployee} onChange={(e) => setSearchEmployee(e.target.value)} className="mt-1" /></div>
                <div><Label>日期</Label><Input type="date" value={searchDate} onChange={(e) => setSearchDate(e.target.value)} className="mt-1" /></div>
                <div className="flex items-end gap-2">
                  <Button className="flex-1">查询</Button>
                  <Button variant="outline" onClick={handleReset}><RotateCcw className="w-4 h-4" /></Button>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-base">排行榜 TOP5</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {topEmployees.map((e, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? 'bg-yellow-500 text-white' : i === 1 ? 'bg-gray-400 text-white' : i === 2 ? 'bg-orange-500 text-white' : 'bg-gray-200'}`}>{i + 1}</span>
                    <span>{e.employeeName}</span>
                  </div>
                  <span className="font-bold text-green-600">¥{e.totalAmount.toFixed(0)}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>员工工号</TableHead>
                  <TableHead>员工姓名</TableHead>
                  <TableHead>车间</TableHead>
                  <TableHead>班组</TableHead>
                  <TableHead>日期</TableHead>
                  <TableHead className="text-right">工序数</TableHead>
                  <TableHead className="text-right">总件数</TableHead>
                  <TableHead className="text-right">总金额</TableHead>
                  <TableHead>更新时间</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={9} className="text-center py-12 text-muted-foreground">暂无数据</TableCell></TableRow>
                ) : filtered.map((q, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium">{q.employeeId}</TableCell>
                    <TableCell>{q.employeeName}</TableCell>
                    <TableCell>{q.workshop}</TableCell>
                    <TableCell>{q.team}</TableCell>
                    <TableCell>{q.date}</TableCell>
                    <TableCell className="text-right">{q.processCount}</TableCell>
                    <TableCell className="text-right">{q.totalQuantity}</TableCell>
                    <TableCell className="text-right font-bold text-green-600">¥{q.totalAmount.toFixed(2)}</TableCell>
                    <TableCell className="text-sm">{q.lastUpdate}</TableCell>
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
