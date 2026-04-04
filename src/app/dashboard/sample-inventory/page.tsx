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
import { Shirt, Plus, Eye, Edit, RotateCcw, Package, ArrowRightLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  type SampleInventory,
  type SampleStatus,
  type SampleType,
  getSampleInventory,
} from '@/types/production-advanced';

const statusColors: Record<SampleStatus, string> = {
  '在库': 'bg-green-100 text-green-700',
  '借出': 'bg-yellow-100 text-yellow-700',
  '归还': 'bg-blue-100 text-blue-700',
  '报废': 'bg-red-100 text-red-700',
};

const typeLabels: Record<SampleType, string> = {
  '布办': '布办',
  '色卡': '色卡',
  '样衣': '样衣',
  '产前版': '产前版',
};

export default function SampleInventoryPage() {
  const router = useRouter();
  const [samples, setSamples] = useState<SampleInventory[]>([]);
  
  const [searchNo, setSearchNo] = useState('');
  const [searchName, setSearchName] = useState('');
  const [searchType, setSearchType] = useState('全部');
  const [searchStatus, setSearchStatus] = useState('全部');
  
  useEffect(() => {
    loadData();
  }, []);
  
  const loadData = () => {
    setSamples(getSampleInventory());
  };
  
  const handleReset = () => {
    setSearchNo('');
    setSearchName('');
    setSearchType('全部');
    setSearchStatus('全部');
  };
  
  const filteredSamples = samples.filter(s => {
    if (searchNo && !s.sampleNo.includes(searchNo)) return false;
    if (searchName && !s.sampleName.includes(searchName)) return false;
    if (searchType !== '全部' && s.sampleType !== searchType) return false;
    if (searchStatus !== '全部' && s.status !== searchStatus) return false;
    return true;
  });
  
  const stats = {
    total: samples.length,
    inStock: samples.filter(s => s.status === '在库').length,
    borrowed: samples.filter(s => s.status === '借出').length,
    scrapped: samples.filter(s => s.status === '报废').length,
  };

  return (
    <DashboardLayout>
      <div className="max-w-full mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <Shirt className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">样品仓管理</h1>
              <p className="text-muted-foreground text-sm">样衣、布办、色卡、产前版管理</p>
            </div>
          </div>
          <Button onClick={() => router.push('/dashboard/sample-inventory/create')}>
            <Plus className="w-4 h-4 mr-2" />新增样品
          </Button>
        </div>
        
        {/* 统计卡片 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">样品总数</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <Shirt className="w-8 h-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">在库</p>
                  <p className="text-2xl font-bold text-green-600">{stats.inStock}</p>
                </div>
                <Package className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">借出</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.borrowed}</p>
                </div>
                <ArrowRightLeft className="w-8 h-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">报废</p>
                  <p className="text-2xl font-bold text-red-600">{stats.scrapped}</p>
                </div>
                <Shirt className="w-8 h-8 text-red-400" />
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* 查询区 */}
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              <div>
                <Label>样品编号</Label>
                <Input placeholder="请输入" value={searchNo} onChange={(e) => setSearchNo(e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label>样品名称</Label>
                <Input placeholder="请输入" value={searchName} onChange={(e) => setSearchName(e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label>样品类型</Label>
                <Select value={searchType} onValueChange={setSearchType}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="全部">全部</SelectItem>
                    <SelectItem value="布办">布办</SelectItem>
                    <SelectItem value="色卡">色卡</SelectItem>
                    <SelectItem value="样衣">样衣</SelectItem>
                    <SelectItem value="产前版">产前版</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>状态</Label>
                <Select value={searchStatus} onValueChange={setSearchStatus}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="全部">全部</SelectItem>
                    <SelectItem value="在库">在库</SelectItem>
                    <SelectItem value="借出">借出</SelectItem>
                    <SelectItem value="归还">归还</SelectItem>
                    <SelectItem value="报废">报废</SelectItem>
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
                  <TableHead>样品编号</TableHead>
                  <TableHead>样品类型</TableHead>
                  <TableHead>样品名称</TableHead>
                  <TableHead>客户</TableHead>
                  <TableHead>订单号</TableHead>
                  <TableHead>存放位置</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>借还记录</TableHead>
                  <TableHead>创建时间</TableHead>
                  <TableHead className="w-20">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSamples.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-12 text-muted-foreground">暂无样品记录</TableCell>
                  </TableRow>
                ) : (
                  filteredSamples.map(sample => (
                    <TableRow key={sample.id}>
                      <TableCell className="font-medium">{sample.sampleNo}</TableCell>
                      <TableCell><Badge variant="outline">{typeLabels[sample.sampleType]}</Badge></TableCell>
                      <TableCell>{sample.sampleName}</TableCell>
                      <TableCell>{sample.customerName}</TableCell>
                      <TableCell>{sample.orderNo || '-'}</TableCell>
                      <TableCell>{sample.location}</TableCell>
                      <TableCell><Badge className={statusColors[sample.status]}>{sample.status}</Badge></TableCell>
                      <TableCell>
                        {sample.borrowRecords.length > 0 ? (
                          <span className="text-sm text-muted-foreground">{sample.borrowRecords.length}条记录</span>
                        ) : '-'}
                      </TableCell>
                      <TableCell className="text-sm">{sample.createdAt}</TableCell>
                      <TableCell>
                        <Button size="sm" variant="ghost" onClick={() => router.push(`/dashboard/sample-inventory/${sample.id}`)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            <div className="p-4 border-t text-sm text-muted-foreground">
              共 {filteredSamples.length} 条记录
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
