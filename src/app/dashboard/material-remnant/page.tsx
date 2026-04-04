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
import { Layers, Plus, Eye, RotateCcw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getMaterialRemnants, type MaterialRemnant } from '@/types/production-advanced-2';

const categoryColors = {
  '余料': 'bg-blue-100 text-blue-700',
  '碎料': 'bg-orange-100 text-orange-700',
  '剩线': 'bg-purple-100 text-purple-700',
};

export default function MaterialRemnantPage() {
  const router = useRouter();
  const [remnants, setRemnants] = useState<MaterialRemnant[]>([]);
  const [searchNo, setSearchNo] = useState('');
  const [searchCategory, setSearchCategory] = useState('全部');

  useEffect(() => { setRemnants(getMaterialRemnants()); }, []);

  const handleReset = () => { setSearchNo(''); setSearchCategory('全部'); };

  const filtered = remnants.filter(r => {
    if (searchNo && !r.remnantNo.includes(searchNo)) return false;
    if (searchCategory !== '全部' && r.category !== searchCategory) return false;
    return true;
  });

  return (
    <DashboardLayout>
      <div className="max-w-full mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <Layers className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">生产辅料零头管理</h1>
              <p className="text-muted-foreground text-sm">余料/碎料/剩线管理，优先使用零料</p>
            </div>
          </div>
          <Button onClick={() => router.push('/dashboard/material-remnant/create')}>
            <Plus className="w-4 h-4 mr-2" />入库零料
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">零料总数</p><p className="text-2xl font-bold">{remnants.length}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">余料</p><p className="text-2xl font-bold text-blue-600">{remnants.filter(r => r.category === '余料').length}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">碎料</p><p className="text-2xl font-bold text-orange-600">{remnants.filter(r => r.category === '碎料').length}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">剩线</p><p className="text-2xl font-bold text-purple-600">{remnants.filter(r => r.category === '剩线').length}</p></CardContent></Card>
        </div>

        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div><Label>零料编号</Label><Input placeholder="请输入" value={searchNo} onChange={(e) => setSearchNo(e.target.value)} className="mt-1" /></div>
              <div><Label>类别</Label>
                <Select value={searchCategory} onValueChange={setSearchCategory}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="全部">全部</SelectItem>
                    <SelectItem value="余料">余料</SelectItem>
                    <SelectItem value="碎料">碎料</SelectItem>
                    <SelectItem value="剩线">剩线</SelectItem>
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
                  <TableHead>零料编号</TableHead>
                  <TableHead>物料编号</TableHead>
                  <TableHead>物料名称</TableHead>
                  <TableHead>类别</TableHead>
                  <TableHead className="text-right">数量</TableHead>
                  <TableHead>存放位置</TableHead>
                  <TableHead>来源订单</TableHead>
                  <TableHead>可用</TableHead>
                  <TableHead>入库时间</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={9} className="text-center py-12 text-muted-foreground">暂无数据</TableCell></TableRow>
                ) : filtered.map(r => (
                  <TableRow key={r.id} className={!r.usable ? 'bg-gray-50' : ''}>
                    <TableCell className="font-medium">{r.remnantNo}</TableCell>
                    <TableCell>{r.materialCode}</TableCell>
                    <TableCell>{r.materialName}</TableCell>
                    <TableCell><Badge className={categoryColors[r.category]}>{r.category}</Badge></TableCell>
                    <TableCell className="text-right">{r.quantity} {r.unit}</TableCell>
                    <TableCell>{r.location}</TableCell>
                    <TableCell>{r.sourceOrderNo}</TableCell>
                    <TableCell><Badge className={r.usable ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>{r.usable ? '可用' : '不可用'}</Badge></TableCell>
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
