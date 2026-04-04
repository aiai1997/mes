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
import { PauseCircle, Plus, Eye, Edit, RotateCcw, PlayCircle, AlertTriangle, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  type ProductionStop,
  type StopReason,
  getProductionStops,
} from '@/types/production-advanced';

const reasonColors: Record<StopReason, string> = {
  '缺料': 'bg-red-100 text-red-700',
  '坏机': 'bg-orange-100 text-orange-700',
  '品质问题': 'bg-yellow-100 text-yellow-700',
  '其他': 'bg-gray-100 text-gray-700',
};

export default function ProductionStopPage() {
  const router = useRouter();
  const [stops, setStops] = useState<ProductionStop[]>([]);
  
  const [searchNo, setSearchNo] = useState('');
  const [searchOrder, setSearchOrder] = useState('');
  const [searchReason, setSearchReason] = useState('全部');
  const [searchStatus, setSearchStatus] = useState('全部');
  
  useEffect(() => {
    loadData();
  }, []);
  
  const loadData = () => {
    setStops(getProductionStops());
  };
  
  const handleReset = () => {
    setSearchNo('');
    setSearchOrder('');
    setSearchReason('全部');
    setSearchStatus('全部');
  };
  
  const filteredStops = stops.filter(s => {
    if (searchNo && !s.stopNo.includes(searchNo)) return false;
    if (searchOrder && !s.orderNo.includes(searchOrder)) return false;
    if (searchReason !== '全部' && s.reason !== searchReason) return false;
    if (searchStatus !== '全部' && s.status !== searchStatus) return false;
    return true;
  });
  
  const stats = {
    total: stops.length,
    ongoing: stops.filter(s => s.status === '停工中').length,
    resolved: stops.filter(s => s.status === '已恢复').length,
    totalDuration: stops.reduce((sum, s) => sum + s.stopDuration, 0),
    materialIssue: stops.filter(s => s.reason === '缺料').length,
  };
  
  // 按原因统计
  const reasonStats: Record<StopReason, number> = {
    '缺料': stops.filter(s => s.reason === '缺料').length,
    '坏机': stops.filter(s => s.reason === '坏机').length,
    '品质问题': stops.filter(s => s.reason === '品质问题').length,
    '其他': stops.filter(s => s.reason === '其他').length,
  };

  return (
    <DashboardLayout>
      <div className="max-w-full mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <PauseCircle className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">停工待料登记</h1>
              <p className="text-muted-foreground text-sm">生产异常停工记录管理</p>
            </div>
          </div>
          <Button onClick={() => router.push('/dashboard/production-stop/create')}>
            <Plus className="w-4 h-4 mr-2" />登记停工
          </Button>
        </div>
        
        {/* 统计卡片 */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">停工总数</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <PauseCircle className="w-8 h-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card className={stats.ongoing > 0 ? 'border-red-300' : ''}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">停工中</p>
                  <p className="text-2xl font-bold text-red-600">{stats.ongoing}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-400" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">已恢复</p>
                  <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
                </div>
                <PlayCircle className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">总停工时长</p>
                  <p className="text-2xl font-bold">{Math.floor(stats.totalDuration / 60)}h</p>
                </div>
                <Clock className="w-8 h-8 text-orange-400" />
              </div>
            </CardContent>
          </Card>
          <Card className={stats.materialIssue > 0 ? 'border-red-300' : ''}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">缺料停工</p>
                  <p className="text-2xl font-bold text-red-600">{stats.materialIssue}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-400" />
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* 原因统计 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">停工原因分布</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4">
              {(Object.entries(reasonStats) as [StopReason, number][]).map(([reason, count]) => (
                <div key={reason} className={`text-center p-4 rounded-lg border ${count > 0 ? 'bg-red-50 border-red-200' : 'bg-muted/50'}`}>
                  <Badge className={reasonColors[reason]}>{reason}</Badge>
                  <p className={`text-2xl font-bold mt-2 ${count > 0 ? 'text-red-600' : ''}`}>{count}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        {/* 查询区 */}
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              <div>
                <Label>停工单号</Label>
                <Input placeholder="请输入" value={searchNo} onChange={(e) => setSearchNo(e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label>订单号</Label>
                <Input placeholder="请输入" value={searchOrder} onChange={(e) => setSearchOrder(e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label>停工原因</Label>
                <Select value={searchReason} onValueChange={setSearchReason}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="全部">全部</SelectItem>
                    <SelectItem value="缺料">缺料</SelectItem>
                    <SelectItem value="坏机">坏机</SelectItem>
                    <SelectItem value="品质问题">品质问题</SelectItem>
                    <SelectItem value="其他">其他</SelectItem>
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
                    <SelectItem value="停工中">停工中</SelectItem>
                    <SelectItem value="已恢复">已恢复</SelectItem>
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
                  <TableHead>停工单号</TableHead>
                  <TableHead>订单号</TableHead>
                  <TableHead>工序</TableHead>
                  <TableHead>停工开始</TableHead>
                  <TableHead>恢复时间</TableHead>
                  <TableHead className="text-right">时长(分)</TableHead>
                  <TableHead>原因</TableHead>
                  <TableHead>责任人</TableHead>
                  <TableHead className="text-right">影响产量</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead className="w-20">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStops.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center py-12 text-muted-foreground">暂无停工记录</TableCell>
                  </TableRow>
                ) : (
                  filteredStops.map(stop => (
                    <TableRow key={stop.id} className={stop.status === '停工中' ? 'bg-red-50' : ''}>
                      <TableCell className="font-medium">{stop.stopNo}</TableCell>
                      <TableCell>{stop.orderNo}</TableCell>
                      <TableCell>{stop.processName}</TableCell>
                      <TableCell>{stop.stopStartTime}</TableCell>
                      <TableCell>{stop.stopEndTime || '-'}</TableCell>
                      <TableCell className="text-right">{stop.stopDuration}</TableCell>
                      <TableCell><Badge className={reasonColors[stop.reason]}>{stop.reason}</Badge></TableCell>
                      <TableCell>{stop.responsiblePerson}</TableCell>
                      <TableCell className="text-right">{stop.affectedQuantity}</TableCell>
                      <TableCell>
                        <Badge className={stop.status === '停工中' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}>
                          {stop.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button size="sm" variant="ghost" onClick={() => router.push(`/dashboard/production-stop/${stop.id}`)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            <div className="p-4 border-t text-sm text-muted-foreground">
              共 {filteredStops.length} 条记录
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
