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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shirt, Plus, Search, RotateCcw, CheckCircle, Clock, Edit, Send } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  type Sample,
  type SampleStatus,
  type SampleType,
  getSamples,
  initSampleData,
} from '@/types/sample';

const statusColors: Record<SampleStatus, string> = {
  '申请中': 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  '制作中': 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  '待审批': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
  '已通过': 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  '需修改': 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
  '已转大货': 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
};

const typeLabels: Record<SampleType, string> = {
  '初样': '初样',
  '修改样': '修改样',
  '确认样': '确认样',
  '产前样': '产前样',
};

export default function SamplePage() {
  const router = useRouter();
  const [samples, setSamples] = useState<Sample[]>([]);
  
  const [searchNo, setSearchNo] = useState('');
  const [searchCustomer, setSearchCustomer] = useState('');
  const [searchStatus, setSearchStatus] = useState('全部');
  const [searchType, setSearchType] = useState('全部');
  
  useEffect(() => {
    initSampleData();
    loadData();
  }, []);
  
  const loadData = () => {
    setSamples(getSamples());
  };
  
  const filteredSamples = samples.filter(s => {
    if (searchNo && !s.sampleNo.includes(searchNo)) return false;
    if (searchCustomer && !s.customerName.includes(searchCustomer)) return false;
    if (searchStatus !== '全部' && s.status !== searchStatus) return false;
    if (searchType !== '全部' && s.sampleType !== searchType) return false;
    return true;
  });
  
  const handleReset = () => {
    setSearchNo('');
    setSearchCustomer('');
    setSearchStatus('全部');
    setSearchType('全部');
  };
  
  const stats = {
    total: samples.length,
    pending: samples.filter(s => s.status === '申请中').length,
    producing: samples.filter(s => s.status === '制作中').length,
    approved: samples.filter(s => s.status === '已通过').length,
    converted: samples.filter(s => s.status === '已转大货').length,
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
              <h1 className="text-2xl font-bold text-foreground">打样管理</h1>
              <p className="text-muted-foreground text-sm">样衣申请、制作、审批、转大货订单</p>
            </div>
          </div>
          <Button onClick={() => router.push('/dashboard/sample/create')}>
            <Plus className="w-4 h-4 mr-2" />申请打样
          </Button>
        </div>
        
        {/* 统计卡片 */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">样衣总数</p>
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
                  <p className="text-sm text-muted-foreground">申请中</p>
                  <p className="text-2xl font-bold text-gray-600">{stats.pending}</p>
                </div>
                <Clock className="w-8 h-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">制作中</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.producing}</p>
                </div>
                <Edit className="w-8 h-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">已通过</p>
                  <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">已转大货</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.converted}</p>
                </div>
                <Send className="w-8 h-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* 查询区 */}
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              <div>
                <Label>样衣编号</Label>
                <Input placeholder="请输入" value={searchNo} onChange={(e) => setSearchNo(e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label>客户</Label>
                <Input placeholder="请输入" value={searchCustomer} onChange={(e) => setSearchCustomer(e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label>样衣类型</Label>
                <Select value={searchType} onValueChange={setSearchType}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="全部">全部</SelectItem>
                    <SelectItem value="初样">初样</SelectItem>
                    <SelectItem value="修改样">修改样</SelectItem>
                    <SelectItem value="确认样">确认样</SelectItem>
                    <SelectItem value="产前样">产前样</SelectItem>
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
                    <SelectItem value="申请中">申请中</SelectItem>
                    <SelectItem value="制作中">制作中</SelectItem>
                    <SelectItem value="待审批">待审批</SelectItem>
                    <SelectItem value="已通过">已通过</SelectItem>
                    <SelectItem value="需修改">需修改</SelectItem>
                    <SelectItem value="已转大货">已转大货</SelectItem>
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
                  <TableHead>样衣编号</TableHead>
                  <TableHead>类型</TableHead>
                  <TableHead>客户</TableHead>
                  <TableHead>款号</TableHead>
                  <TableHead>产品名称</TableHead>
                  <TableHead>尺寸/颜色</TableHead>
                  <TableHead>打样组</TableHead>
                  <TableHead className="text-right">成本</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>创建时间</TableHead>
                  <TableHead className="w-20">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSamples.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center py-12 text-muted-foreground">暂无样衣记录</TableCell>
                  </TableRow>
                ) : (
                  filteredSamples.map(sample => (
                    <TableRow key={sample.id}>
                      <TableCell className="font-medium">{sample.sampleNo}</TableCell>
                      <TableCell><Badge variant="outline">{typeLabels[sample.sampleType]}</Badge></TableCell>
                      <TableCell>{sample.customerName}</TableCell>
                      <TableCell>{sample.styleNo}</TableCell>
                      <TableCell>{sample.productName}</TableCell>
                      <TableCell>{sample.size} / {sample.color}</TableCell>
                      <TableCell>{sample.teamName}</TableCell>
                      <TableCell className="text-right">¥{sample.totalCost.toFixed(2)}</TableCell>
                      <TableCell><Badge className={statusColors[sample.status]}>{sample.status}</Badge></TableCell>
                      <TableCell className="text-sm">{sample.createdAt}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost" onClick={() => router.push(`/dashboard/sample/${sample.id}`)}>
                            查看
                          </Button>
                          {sample.status === '已通过' && (
                            <Button size="sm" variant="ghost" className="text-purple-600" onClick={() => router.push(`/dashboard/orders/create?sampleId=${sample.id}`)}>
                              转大货
                            </Button>
                          )}
                        </div>
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
