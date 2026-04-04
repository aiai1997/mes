'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Plus, RotateCcw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getWarehouseLocations, type WarehouseLocation } from '@/types/production-advanced-2';

const statusColors = {
  '空闲': 'bg-green-100 text-green-700',
  '占用': 'bg-blue-100 text-blue-700',
  '锁定': 'bg-red-100 text-red-700',
};

export default function WarehouseLocationPage() {
  const router = useRouter();
  const [locations] = useState<WarehouseLocation[]>(getWarehouseLocations());
  const [searchCode, setSearchCode] = useState('');
  const [searchStatus, setSearchStatus] = useState('全部');

  const handleReset = () => { setSearchCode(''); setSearchStatus('全部'); };

  const filtered = locations.filter(l => {
    if (searchCode && !l.locationCode.includes(searchCode)) return false;
    if (searchStatus !== '全部' && l.status !== searchStatus) return false;
    return true;
  });

  const stats = {
    total: locations.length,
    available: locations.filter(l => l.status === '空闲').length,
    occupied: locations.filter(l => l.status === '占用').length,
    locked: locations.filter(l => l.status === '锁定').length,
  };

  return (
    <DashboardLayout>
      <div className="max-w-full mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <MapPin className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">仓库库位条码管理</h1>
              <p className="text-muted-foreground text-sm">货架-区-层-位编码管理</p>
            </div>
          </div>
          <Button onClick={() => router.push('/dashboard/warehouse-location/create')}>
            <Plus className="w-4 h-4 mr-2" />新增库位
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">库位总数</p><p className="text-2xl font-bold">{stats.total}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">空闲</p><p className="text-2xl font-bold text-green-600">{stats.available}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">占用</p><p className="text-2xl font-bold text-blue-600">{stats.occupied}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">锁定</p><p className="text-2xl font-bold text-red-600">{stats.locked}</p></CardContent></Card>
        </div>

        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div><Label>库位编码</Label><Input placeholder="请输入" value={searchCode} onChange={(e) => setSearchCode(e.target.value)} className="mt-1" /></div>
              <div><Label>状态</Label>
                <select className="w-full mt-1 border rounded px-3 py-2" value={searchStatus} onChange={(e) => setSearchStatus(e.target.value)}>
                  <option value="全部">全部</option>
                  <option value="空闲">空闲</option>
                  <option value="占用">占用</option>
                  <option value="锁定">锁定</option>
                </select>
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
                  <TableHead>库位编码</TableHead>
                  <TableHead>仓库</TableHead>
                  <TableHead>区</TableHead>
                  <TableHead>架</TableHead>
                  <TableHead>层</TableHead>
                  <TableHead>位</TableHead>
                  <TableHead>物料编码</TableHead>
                  <TableHead>物料名称</TableHead>
                  <TableHead className="text-right">数量</TableHead>
                  <TableHead>状态</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={10} className="text-center py-12 text-muted-foreground">暂无数据</TableCell></TableRow>
                ) : filtered.map(l => (
                  <TableRow key={l.id}>
                    <TableCell className="font-medium">{l.locationCode}</TableCell>
                    <TableCell>{l.warehouse}</TableCell>
                    <TableCell>{l.zone}</TableCell>
                    <TableCell>{l.shelf}</TableCell>
                    <TableCell>{l.layer}</TableCell>
                    <TableCell>{l.position}</TableCell>
                    <TableCell>{l.materialCode || '-'}</TableCell>
                    <TableCell>{l.materialName || '-'}</TableCell>
                    <TableCell className="text-right">{l.quantity || '-'}</TableCell>
                    <TableCell><Badge className={statusColors[l.status]}>{l.status}</Badge></TableCell>
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
