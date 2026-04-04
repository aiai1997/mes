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
import { ClipboardCheck, Plus, Eye, RotateCcw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getInspections, type Inspection, type InspectionType } from '@/types/production-advanced-2';

const typeColors: Record<InspectionType, string> = {
  'IQC': 'bg-blue-100 text-blue-700',
  'IPQC': 'bg-green-100 text-green-700',
  'FQC': 'bg-purple-100 text-purple-700',
  'OQC': 'bg-orange-100 text-orange-700',
};

const statusColors = {
  '待检验': 'bg-yellow-100 text-yellow-700',
  '检验中': 'bg-blue-100 text-blue-700',
  '合格': 'bg-green-100 text-green-700',
  '不合格': 'bg-red-100 text-red-700',
};

export default function InspectionPage() {
  const router = useRouter();
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [searchNo, setSearchNo] = useState('');
  const [searchType, setSearchType] = useState('全部');
  const [searchStatus, setSearchStatus] = useState('全部');

  useEffect(() => { setInspections(getInspections()); }, []);

  const handleReset = () => { setSearchNo(''); setSearchType('全部'); setSearchStatus('全部'); };

  const filtered = inspections.filter(i => {
    if (searchNo && !i.inspectionNo.includes(searchNo)) return false;
    if (searchType !== '全部' && i.type !== searchType) return false;
    if (searchStatus !== '全部' && i.status !== searchStatus) return false;
    return true;
  });

  const stats = {
    total: inspections.length,
    pass: inspections.filter(i => i.status === '合格').length,
    fail: inspections.filter(i => i.status === '不合格').length,
    passRate: inspections.length > 0 ? (inspections.filter(i => i.status === '合格').length / inspections.length * 100).toFixed(1) : '0',
  };

  return (
    <DashboardLayout>
      <div className="max-w-full mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <ClipboardCheck className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">验货管理</h1>
              <p className="text-muted-foreground text-sm">验货任务安排、结果录入、整改跟踪</p>
            </div>
          </div>
          <Button onClick={() => router.push('/dashboard/inspection/create')}>
            <Plus className="w-4 h-4 mr-2" />新增验货
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">验货总数</p><p className="text-2xl font-bold">{stats.total}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">合格</p><p className="text-2xl font-bold text-green-600">{stats.pass}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">不合格</p><p className="text-2xl font-bold text-red-600">{stats.fail}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">合格率</p><p className="text-2xl font-bold">{stats.passRate}%</p></CardContent></Card>
        </div>

        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div><Label>验货单号</Label><Input placeholder="请输入" value={searchNo} onChange={(e) => setSearchNo(e.target.value)} className="mt-1" /></div>
              <div><Label>验货类型</Label>
                <Select value={searchType} onValueChange={setSearchType}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="全部">全部</SelectItem>
                    <SelectItem value="IQC">IQC</SelectItem>
                    <SelectItem value="IPQC">IPQC</SelectItem>
                    <SelectItem value="FQC">FQC</SelectItem>
                    <SelectItem value="OQC">OQC</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>状态</Label>
                <Select value={searchStatus} onValueChange={setSearchStatus}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="全部">全部</SelectItem>
                    <SelectItem value="待检验">待检验</SelectItem>
                    <SelectItem value="检验中">检验中</SelectItem>
                    <SelectItem value="合格">合格</SelectItem>
                    <SelectItem value="不合格">不合格</SelectItem>
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
                  <TableHead>验货单号</TableHead>
                  <TableHead>验货类型</TableHead>
                  <TableHead>订单号</TableHead>
                  <TableHead>产品名称</TableHead>
                  <TableHead className="text-right">抽检数量</TableHead>
                  <TableHead className="text-right">不良数量</TableHead>
                  <TableHead>验货员</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>验货时间</TableHead>
                  <TableHead className="w-20">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={10} className="text-center py-12 text-muted-foreground">暂无数据</TableCell></TableRow>
                ) : filtered.map(i => (
                  <TableRow key={i.id}>
                    <TableCell className="font-medium">{i.inspectionNo}</TableCell>
                    <TableCell><Badge className={typeColors[i.type]}>{i.type}</Badge></TableCell>
                    <TableCell>{i.orderNo}</TableCell>
                    <TableCell>{i.productName}</TableCell>
                    <TableCell className="text-right">{i.sampleQty}</TableCell>
                    <TableCell className={`text-right ${i.defectQty > 0 ? 'text-red-600 font-bold' : ''}`}>{i.defectQty}</TableCell>
                    <TableCell>{i.inspector}</TableCell>
                    <TableCell><Badge className={statusColors[i.status]}>{i.status}</Badge></TableCell>
                    <TableCell className="text-sm">{i.inspectionTime || '-'}</TableCell>
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
