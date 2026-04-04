'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Palette, Plus, Eye, RotateCcw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getColorSchemes, type AccessoryColorScheme } from '@/types/production-advanced-2';

const statusColors = {
  '草稿': 'bg-gray-100 text-gray-700',
  '已确认': 'bg-green-100 text-green-700',
};

export default function AccessoryColorSchemePage() {
  const router = useRouter();
  const [schemes] = useState<AccessoryColorScheme[]>(getColorSchemes());
  const [searchNo, setSearchNo] = useState('');
  const [searchStyle, setSearchStyle] = useState('');
  const [searchStatus, setSearchStatus] = useState('全部');

  const handleReset = () => {
    setSearchNo('');
    setSearchStyle('');
    setSearchStatus('全部');
  };

  const filtered = schemes.filter(s => {
    if (searchNo && !s.schemeNo.includes(searchNo)) return false;
    if (searchStyle && !s.styleNo.includes(searchStyle)) return false;
    if (searchStatus !== '全部' && s.status !== searchStatus) return false;
    return true;
  });

  return (
    <DashboardLayout>
      <div className="max-w-full mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <Palette className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">辅料配色管理</h1>
              <p className="text-muted-foreground text-sm">主色/配色/撞色方案管理</p>
            </div>
          </div>
          <Button onClick={() => router.push('/dashboard/accessory-color/create')}>
            <Plus className="w-4 h-4 mr-2" />新增配色方案
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">配色方案数</p><p className="text-2xl font-bold">{schemes.length}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">已确认</p><p className="text-2xl font-bold text-green-600">{schemes.filter(s => s.status === '已确认').length}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">草稿</p><p className="text-2xl font-bold text-gray-600">{schemes.filter(s => s.status === '草稿').length}</p></CardContent></Card>
        </div>

        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div><Label>方案编号</Label><Input placeholder="请输入" value={searchNo} onChange={(e) => setSearchNo(e.target.value)} className="mt-1" /></div>
              <div><Label>款号</Label><Input placeholder="请输入" value={searchStyle} onChange={(e) => setSearchStyle(e.target.value)} className="mt-1" /></div>
              <div><Label>状态</Label>
                <Select value={searchStatus} onValueChange={setSearchStatus}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="全部">全部</SelectItem>
                    <SelectItem value="草稿">草稿</SelectItem>
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
                  <TableHead>方案编号</TableHead>
                  <TableHead>方案名称</TableHead>
                  <TableHead>款号</TableHead>
                  <TableHead>产品名称</TableHead>
                  <TableHead>配色数量</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>创建时间</TableHead>
                  <TableHead className="w-20">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={8} className="text-center py-12 text-muted-foreground">暂无数据</TableCell></TableRow>
                ) : filtered.map(s => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.schemeNo}</TableCell>
                    <TableCell>{s.schemeName}</TableCell>
                    <TableCell>{s.styleNo}</TableCell>
                    <TableCell>{s.productName}</TableCell>
                    <TableCell>{s.colors.length}种</TableCell>
                    <TableCell><Badge className={statusColors[s.status]}>{s.status}</Badge></TableCell>
                    <TableCell className="text-sm">{s.createdAt}</TableCell>
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
