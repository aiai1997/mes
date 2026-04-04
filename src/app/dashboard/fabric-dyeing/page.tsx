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
import { Palette, Plus, Eye, RotateCcw, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getFabricDyeings, type FabricDyeing, type DyeingGrade } from '@/types/production-advanced-2';

const gradeColors: Record<DyeingGrade, string> = {
  'A级': 'bg-green-100 text-green-700',
  'B级': 'bg-blue-100 text-blue-700',
  'C级': 'bg-yellow-100 text-yellow-700',
  'D级': 'bg-red-100 text-red-700',
};

const inspectionColors = {
  '合格': 'bg-green-100 text-green-700',
  '不合格': 'bg-red-100 text-red-700',
  '待检': 'bg-gray-100 text-gray-700',
};

export default function FabricDyeingPage() {
  const router = useRouter();
  const [dyeings, setDyeings] = useState<FabricDyeing[]>([]);
  const [searchNo, setSearchNo] = useState('');
  const [searchGrade, setSearchGrade] = useState('全部');
  const [searchInspection, setSearchInspection] = useState('全部');

  useEffect(() => { setDyeings(getFabricDyeings()); }, []);

  const handleReset = () => {
    setSearchNo('');
    setSearchGrade('全部');
    setSearchInspection('全部');
  };

  const filtered = dyeings.filter(d => {
    if (searchNo && !d.dyeingNo.includes(searchNo) && !d.colorNo.includes(searchNo)) return false;
    if (searchGrade !== '全部' && d.dyeingGrade !== searchGrade) return false;
    if (searchInspection !== '全部' && d.inspectionResult !== searchInspection) return false;
    return true;
  });

  const stats = {
    total: dyeings.length,
    gradeA: dyeings.filter(d => d.dyeingGrade === 'A级').length,
    unqualified: dyeings.filter(d => d.inspectionResult === '不合格').length,
    pending: dyeings.filter(d => d.inspectionResult === '待检').length,
  };

  return (
    <DashboardLayout>
      <div className="max-w-full mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <Palette className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">面料缸差/色号管理</h1>
              <p className="text-muted-foreground text-sm">缸号、色号、潘通号、缸差等级管理</p>
            </div>
          </div>
          <Button onClick={() => router.push('/dashboard/fabric-dyeing/create')}>
            <Plus className="w-4 h-4 mr-2" />新增缸号
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">总缸号数</p><p className="text-2xl font-bold">{stats.total}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">A级缸号</p><p className="text-2xl font-bold text-green-600">{stats.gradeA}</p></CardContent></Card>
          <Card className={stats.unqualified > 0 ? 'border-red-300' : ''}><CardContent className="p-4"><p className="text-sm text-muted-foreground">不合格</p><p className="text-2xl font-bold text-red-600">{stats.unqualified}</p></CardContent></Card>
          <Card className={stats.pending > 0 ? 'border-yellow-300' : ''}><CardContent className="p-4"><p className="text-sm text-muted-foreground">待检验</p><p className="text-2xl font-bold text-yellow-600">{stats.pending}</p></CardContent></Card>
        </div>

        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div><Label>缸号/色号</Label><Input placeholder="请输入" value={searchNo} onChange={(e) => setSearchNo(e.target.value)} className="mt-1" /></div>
              <div><Label>缸差等级</Label>
                <Select value={searchGrade} onValueChange={setSearchGrade}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="全部">全部</SelectItem>
                    <SelectItem value="A级">A级</SelectItem>
                    <SelectItem value="B级">B级</SelectItem>
                    <SelectItem value="C级">C级</SelectItem>
                    <SelectItem value="D级">D级</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>检验结果</Label>
                <Select value={searchInspection} onValueChange={setSearchInspection}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="全部">全部</SelectItem>
                    <SelectItem value="合格">合格</SelectItem>
                    <SelectItem value="不合格">不合格</SelectItem>
                    <SelectItem value="待检">待检</SelectItem>
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
                  <TableHead>批次号</TableHead>
                  <TableHead>缸号</TableHead>
                  <TableHead>色号</TableHead>
                  <TableHead>潘通号</TableHead>
                  <TableHead>面料编号</TableHead>
                  <TableHead>面料名称</TableHead>
                  <TableHead>供应商</TableHead>
                  <TableHead className="text-right">数量</TableHead>
                  <TableHead>缸差等级</TableHead>
                  <TableHead>检验结果</TableHead>
                  <TableHead>创建时间</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={11} className="text-center py-12 text-muted-foreground">暂无数据</TableCell></TableRow>
                ) : filtered.map(d => (
                  <TableRow key={d.id} className={d.inspectionResult === '不合格' ? 'bg-red-50' : ''}>
                    <TableCell className="font-medium">{d.batchNo}</TableCell>
                    <TableCell>{d.dyeingNo}</TableCell>
                    <TableCell>{d.colorNo}</TableCell>
                    <TableCell>{d.pantoneNo}</TableCell>
                    <TableCell>{d.fabricCode}</TableCell>
                    <TableCell>{d.fabricName}</TableCell>
                    <TableCell>{d.supplier}</TableCell>
                    <TableCell className="text-right">{d.quantity} {d.unit}</TableCell>
                    <TableCell><Badge className={gradeColors[d.dyeingGrade]}>{d.dyeingGrade}</Badge></TableCell>
                    <TableCell><Badge className={inspectionColors[d.inspectionResult]}>{d.inspectionResult}</Badge></TableCell>
                    <TableCell className="text-sm">{d.createdAt}</TableCell>
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
