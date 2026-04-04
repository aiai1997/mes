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
import { Replace, Plus, Search, RotateCcw, CheckCircle, Clock, XCircle, ArrowRightLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  type MaterialSubstitute,
  type SubstituteStatus,
  getMaterialSubstitutes,
  initMiscData,
} from '@/types/misc';

const statusColors: Record<SubstituteStatus, string> = {
  '待审批': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
  '已生效': 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  '已失效': 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
};

export default function SubstitutePage() {
  const router = useRouter();
  const [substitutes, setSubstitutes] = useState<MaterialSubstitute[]>([]);
  
  const [searchNo, setSearchNo] = useState('');
  const [searchStatus, setSearchStatus] = useState('全部');
  
  useEffect(() => {
    initMiscData();
    loadData();
  }, []);
  
  const loadData = () => {
    setSubstitutes(getMaterialSubstitutes());
  };
  
  const filteredSubstitutes = substitutes.filter(s => {
    if (searchNo && !s.originalMaterial.includes(searchNo) && !s.substituteMaterial.includes(searchNo)) return false;
    if (searchStatus !== '全部' && s.status !== searchStatus) return false;
    return true;
  });
  
  const handleReset = () => {
    setSearchNo('');
    setSearchStatus('全部');
  };
  
  const stats = {
    total: substitutes.length,
    pending: substitutes.filter(s => s.status === '待审批').length,
    active: substitutes.filter(s => s.status === '已生效').length,
    inactive: substitutes.filter(s => s.status === '已失效').length,
  };

  return (
    <DashboardLayout>
      <div className="max-w-full mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <Replace className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">物料替代管理</h1>
              <p className="text-muted-foreground text-sm">物料替代关系设置，支持主料/代料切换</p>
            </div>
          </div>
          <Button onClick={() => router.push('/dashboard/substitute/create')}>
            <Plus className="w-4 h-4 mr-2" />新增替代
          </Button>
        </div>
        
        {/* 统计卡片 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">替代关系总数</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <Replace className="w-8 h-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">待审批</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">已生效</p>
                  <p className="text-2xl font-bold text-green-600">{stats.active}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">已失效</p>
                  <p className="text-2xl font-bold text-gray-600">{stats.inactive}</p>
                </div>
                <XCircle className="w-8 h-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* 查询区 */}
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <Label>物料编号</Label>
                <Input placeholder="主料/代料编号" value={searchNo} onChange={(e) => setSearchNo(e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label>状态</Label>
                <Select value={searchStatus} onValueChange={setSearchStatus}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="全部">全部</SelectItem>
                    <SelectItem value="待审批">待审批</SelectItem>
                    <SelectItem value="已生效">已生效</SelectItem>
                    <SelectItem value="已失效">已失效</SelectItem>
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
                  <TableHead>主料编号</TableHead>
                  <TableHead>主料名称</TableHead>
                  <TableHead className="w-16"></TableHead>
                  <TableHead>代料编号</TableHead>
                  <TableHead>代料名称</TableHead>
                  <TableHead className="text-center">替代比例</TableHead>
                  <TableHead>有效期</TableHead>
                  <TableHead>关联BOM</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead className="w-20">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubstitutes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-12 text-muted-foreground">暂无替代关系</TableCell>
                  </TableRow>
                ) : (
                  filteredSubstitutes.map(sub => (
                    <TableRow key={sub.id}>
                      <TableCell className="font-medium">{sub.originalMaterial}</TableCell>
                      <TableCell>{sub.originalName}</TableCell>
                      <TableCell className="text-center">
                        <ArrowRightLeft className="w-4 h-4 text-muted-foreground inline" />
                      </TableCell>
                      <TableCell className="font-medium">{sub.substituteMaterial}</TableCell>
                      <TableCell>{sub.substituteName}</TableCell>
                      <TableCell className="text-center">{sub.substituteRatio}</TableCell>
                      <TableCell className="text-sm">
                        {sub.validFrom} ~ {sub.validTo || '长期'}
                      </TableCell>
                      <TableCell>{sub.relatedBOM || '-'}</TableCell>
                      <TableCell><Badge className={statusColors[sub.status]}>{sub.status}</Badge></TableCell>
                      <TableCell>
                        <Button size="sm" variant="ghost" onClick={() => router.push(`/dashboard/substitute/${sub.id}`)}>
                          查看
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            <div className="p-4 border-t text-sm text-muted-foreground">
              共 {filteredSubstitutes.length} 条记录
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
