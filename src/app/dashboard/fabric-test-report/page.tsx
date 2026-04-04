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
import { FileText, Plus, Eye, RotateCcw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getFabricTestReports, type FabricTestReport } from '@/types/production-advanced-2';

const conclusionColors = {
  '合格': 'bg-green-100 text-green-700',
  '不合格': 'bg-red-100 text-red-700',
  '特采使用': 'bg-yellow-100 text-yellow-700',
};

const statusColors = {
  '待审核': 'bg-yellow-100 text-yellow-700',
  '已审核': 'bg-green-100 text-green-700',
};

export default function FabricTestReportPage() {
  const router = useRouter();
  const [reports, setReports] = useState<FabricTestReport[]>([]);
  const [searchNo, setSearchNo] = useState('');
  const [searchConclusion, setSearchConclusion] = useState('全部');
  const [searchStatus, setSearchStatus] = useState('全部');

  useEffect(() => { setReports(getFabricTestReports()); }, []);

  const handleReset = () => { setSearchNo(''); setSearchConclusion('全部'); setSearchStatus('全部'); };

  const filtered = reports.filter(r => {
    if (searchNo && !r.reportNo.includes(searchNo)) return false;
    if (searchConclusion !== '全部' && r.conclusion !== searchConclusion) return false;
    if (searchStatus !== '全部' && r.status !== searchStatus) return false;
    return true;
  });

  const stats = {
    total: reports.length,
    qualified: reports.filter(r => r.conclusion === '合格').length,
    unqualified: reports.filter(r => r.conclusion === '不合格').length,
    specialUse: reports.filter(r => r.conclusion === '特采使用').length,
  };

  return (
    <DashboardLayout>
      <div className="max-w-full mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">面料测试/理化报告管理</h1>
              <p className="text-muted-foreground text-sm">克重、门幅、缩水率、色牢度、撕裂、起球测试</p>
            </div>
          </div>
          <Button onClick={() => router.push('/dashboard/fabric-test-report/create')}>
            <Plus className="w-4 h-4 mr-2" />新增报告
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">报告总数</p><p className="text-2xl font-bold">{stats.total}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">合格</p><p className="text-2xl font-bold text-green-600">{stats.qualified}</p></CardContent></Card>
          <Card className={stats.unqualified > 0 ? 'border-red-300' : ''}><CardContent className="p-4"><p className="text-sm text-muted-foreground">不合格</p><p className="text-2xl font-bold text-red-600">{stats.unqualified}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">特采使用</p><p className="text-2xl font-bold text-yellow-600">{stats.specialUse}</p></CardContent></Card>
        </div>

        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div><Label>报告编号</Label><Input placeholder="请输入" value={searchNo} onChange={(e) => setSearchNo(e.target.value)} className="mt-1" /></div>
              <div><Label>结论</Label>
                <Select value={searchConclusion} onValueChange={setSearchConclusion}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="全部">全部</SelectItem>
                    <SelectItem value="合格">合格</SelectItem>
                    <SelectItem value="不合格">不合格</SelectItem>
                    <SelectItem value="特采使用">特采使用</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>审核状态</Label>
                <Select value={searchStatus} onValueChange={setSearchStatus}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="全部">全部</SelectItem>
                    <SelectItem value="待审核">待审核</SelectItem>
                    <SelectItem value="已审核">已审核</SelectItem>
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
                  <TableHead>报告编号</TableHead>
                  <TableHead>面料编号</TableHead>
                  <TableHead>面料名称</TableHead>
                  <TableHead>供应商</TableHead>
                  <TableHead>批次号</TableHead>
                  <TableHead>测试项目</TableHead>
                  <TableHead>结论</TableHead>
                  <TableHead>测试员</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>测试日期</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={10} className="text-center py-12 text-muted-foreground">暂无数据</TableCell></TableRow>
                ) : filtered.map(r => (
                  <TableRow key={r.id} className={r.conclusion === '不合格' ? 'bg-red-50' : ''}>
                    <TableCell className="font-medium">{r.reportNo}</TableCell>
                    <TableCell>{r.fabricCode}</TableCell>
                    <TableCell>{r.fabricName}</TableCell>
                    <TableCell>{r.supplier}</TableCell>
                    <TableCell>{r.batchNo}</TableCell>
                    <TableCell>{r.testItems.length}项</TableCell>
                    <TableCell><Badge className={conclusionColors[r.conclusion]}>{r.conclusion}</Badge></TableCell>
                    <TableCell>{r.tester}</TableCell>
                    <TableCell><Badge className={statusColors[r.status]}>{r.status}</Badge></TableCell>
                    <TableCell>{r.testDate}</TableCell>
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
