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
import { Layers, Plus, Eye, Edit, RotateCcw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  type MaterialBatch,
  getMaterialBatches,
} from '@/types/production-advanced';

const statusColors: Record<string, string> = {
  '可用': 'bg-green-100 text-green-700',
  '已用完': 'bg-gray-100 text-gray-700',
  '冻结': 'bg-red-100 text-red-700',
};

export default function BatchManagementPage() {
  const router = useRouter();
  const [batches, setBatches] = useState<MaterialBatch[]>([]);
  
  const [searchNo, setSearchNo] = useState('');
  const [searchMaterial, setSearchMaterial] = useState('');
  const [searchStatus, setSearchStatus] = useState('全部');
  
  const loadData = () => {
    setBatches(getMaterialBatches());
  };
  
  useEffect(() => {
    loadData();
  }, []);
  
  const handleReset = () => {
    setSearchNo('');
    setSearchMaterial('');
    setSearchStatus('全部');
  };
  
  const filteredBatches = batches.filter(b => {
    if (searchNo && !b.batchNo.includes(searchNo)) return false;
    if (searchMaterial && !b.materialName.includes(searchMaterial)) return false;
    if (searchStatus !== '全部' && b.status !== searchStatus) return false;
    return true;
  });
  
  const stats = {
    total: batches.length,
    available: batches.filter(b => b.status === '可用').length,
    used: batches.filter(b => b.status === '已用完').length,
    frozen: batches.filter(b => b.status === '冻结').length,
  };

  return (
    <DashboardLayout>
      <div className="max-w-full mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <Layers className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">批次管理</h1>
              <p className="text-muted-foreground text-sm">面料批次、色差、缸差管控</p>
            </div>
          </div>
          <Button onClick={() => router.push('/dashboard/batch/create')}>
            <Plus className="w-4 h-4 mr-2" />新增批次
          </Button>
        </div>
        
        {/* 统计卡片 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">批次总数</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <Layers className="w-8 h-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">可用</p>
                  <p className="text-2xl font-bold text-green-600">{stats.available}</p>
                </div>
                <Layers className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">已用完</p>
                  <p className="text-2xl font-bold text-gray-600">{stats.used}</p>
                </div>
                <Layers className="w-8 h-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">冻结</p>
                  <p className="text-2xl font-bold text-red-600">{stats.frozen}</p>
                </div>
                <Layers className="w-8 h-8 text-red-400" />
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* 查询区 */}
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div>
                <Label>批次号</Label>
                <Input placeholder="请输入" value={searchNo} onChange={(e) => setSearchNo(e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label>物料名称</Label>
                <Input placeholder="请输入" value={searchMaterial} onChange={(e) => setSearchMaterial(e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label>状态</Label>
                <Select value={searchStatus} onValueChange={setSearchStatus}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="全部">全部</SelectItem>
                    <SelectItem value="可用">可用</SelectItem>
                    <SelectItem value="已用完">已用完</SelectItem>
                    <SelectItem value="冻结">冻结</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end gap-2">
                <Button onClick={loadData} className="flex-1">查询</Button>
                <Button variant="outline" onClick={handleReset}><RotateCcw className="w-4 h-4" /></Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* 列表 */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>批次号</TableHead>
                  <TableHead>物料编码</TableHead>
                  <TableHead>物料名称</TableHead>
                  <TableHead>类型</TableHead>
                  <TableHead>供应商</TableHead>
                  <TableHead>缸号</TableHead>
                  <TableHead>色号</TableHead>
                  <TableHead className="text-right">入库数量</TableHead>
                  <TableHead className="text-right">已用数量</TableHead>
                  <TableHead className="text-right">剩余数量</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>到货日期</TableHead>
                  <TableHead className="w-20">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBatches.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={13} className="text-center py-12 text-muted-foreground">暂无批次记录</TableCell>
                  </TableRow>
                ) : (
                  filteredBatches.map(batch => (
                    <TableRow key={batch.id}>
                      <TableCell className="font-medium">{batch.batchNo}</TableCell>
                      <TableCell>{batch.materialCode}</TableCell>
                      <TableCell>{batch.materialName}</TableCell>
                      <TableCell>{batch.materialType}</TableCell>
                      <TableCell>{batch.supplierName}</TableCell>
                      <TableCell>{batch.vatNo || '-'}</TableCell>
                      <TableCell>{batch.colorNo || '-'}</TableCell>
                      <TableCell className="text-right">{batch.quantity}</TableCell>
                      <TableCell className="text-right">{batch.usedQuantity}</TableCell>
                      <TableCell className="text-right">{batch.remainingQuantity}</TableCell>
                      <TableCell><Badge className={statusColors[batch.status]}>{batch.status}</Badge></TableCell>
                      <TableCell>{batch.arrivalDate}</TableCell>
                      <TableCell>
                        <Button size="sm" variant="ghost" onClick={() => router.push(`/dashboard/batch/${batch.id}`)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            <div className="p-4 border-t text-sm text-muted-foreground">
              共 {filteredBatches.length} 条记录
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
