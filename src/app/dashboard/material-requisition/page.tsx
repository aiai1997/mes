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
import { Package, Plus, Search, RotateCcw, Eye, Edit, CheckCircle, Send, XCircle, Printer, Download } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  type MaterialRequisition,
  type MaterialRequisitionStatus,
  type Priority,
  getMaterialRequisitions,
  generateRequisitionNo,
} from '@/types/production-advanced';
import { getOrders, type Order } from '@/types/order';

const statusColors: Record<MaterialRequisitionStatus, string> = {
  '待审核': 'bg-yellow-100 text-yellow-700',
  '已审核': 'bg-blue-100 text-blue-700',
  '已发料': 'bg-green-100 text-green-700',
  '已关闭': 'bg-gray-100 text-gray-700',
};

const priorityColors: Record<Priority, string> = {
  '普通': 'bg-gray-100 text-gray-700',
  '紧急': 'bg-orange-100 text-orange-700',
  '特急': 'bg-red-100 text-red-700',
};

export default function MaterialRequisitionPage() {
  const router = useRouter();
  const [requisitions, setRequisitions] = useState<MaterialRequisition[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  
  const [searchNo, setSearchNo] = useState('');
  const [searchOrder, setSearchOrder] = useState('');
  const [searchStatus, setSearchStatus] = useState('全部');
  const [searchPriority, setSearchPriority] = useState('全部');
  
  useEffect(() => {
    loadData();
  }, []);
  
  const loadData = () => {
    setRequisitions(getMaterialRequisitions());
    setOrders(getOrders());
  };
  
  const handleReset = () => {
    setSearchNo('');
    setSearchOrder('');
    setSearchStatus('全部');
    setSearchPriority('全部');
  };
  
  const filteredRequisitions = requisitions.filter(r => {
    if (searchNo && !r.requisitionNo.includes(searchNo)) return false;
    if (searchOrder && !r.orderNo.includes(searchOrder)) return false;
    if (searchStatus !== '全部' && r.status !== searchStatus) return false;
    if (searchPriority !== '全部' && r.priority !== searchPriority) return false;
    return true;
  });
  
  const stats = {
    total: requisitions.length,
    pending: requisitions.filter(r => r.status === '待审核').length,
    audited: requisitions.filter(r => r.status === '已审核').length,
    issued: requisitions.filter(r => r.status === '已发料').length,
  };

  return (
    <DashboardLayout>
      <div className="max-w-full mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">生产领料单</h1>
              <p className="text-muted-foreground text-sm">独立领料单据，支持超领审批</p>
            </div>
          </div>
          <Button onClick={() => router.push('/dashboard/material-requisition/create')}>
            <Plus className="w-4 h-4 mr-2" />新增领料单
          </Button>
        </div>
        
        {/* 统计卡片 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">领料单总数</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <Package className="w-8 h-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">待审核</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">已审核</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.audited}</p>
                </div>
                <Send className="w-8 h-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">已发料</p>
                  <p className="text-2xl font-bold text-green-600">{stats.issued}</p>
                </div>
                <Package className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* 查询区 */}
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              <div>
                <Label>领料单号</Label>
                <Input placeholder="请输入" value={searchNo} onChange={(e) => setSearchNo(e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label>订单号</Label>
                <Input placeholder="请输入" value={searchOrder} onChange={(e) => setSearchOrder(e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label>优先级</Label>
                <Select value={searchPriority} onValueChange={setSearchPriority}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="全部">全部</SelectItem>
                    <SelectItem value="普通">普通</SelectItem>
                    <SelectItem value="紧急">紧急</SelectItem>
                    <SelectItem value="特急">特急</SelectItem>
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
                    <SelectItem value="待审核">待审核</SelectItem>
                    <SelectItem value="已审核">已审核</SelectItem>
                    <SelectItem value="已发料">已发料</SelectItem>
                    <SelectItem value="已关闭">已关闭</SelectItem>
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
                  <TableHead>领料单号</TableHead>
                  <TableHead>订单号</TableHead>
                  <TableHead>款号</TableHead>
                  <TableHead>物料数</TableHead>
                  <TableHead className="text-right">申请数量</TableHead>
                  <TableHead className="text-right">实发数量</TableHead>
                  <TableHead className="text-right">金额</TableHead>
                  <TableHead>优先级</TableHead>
                  <TableHead>超领</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>领料人</TableHead>
                  <TableHead>创建时间</TableHead>
                  <TableHead className="w-28">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequisitions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={13} className="text-center py-12 text-muted-foreground">暂无领料单记录</TableCell>
                  </TableRow>
                ) : (
                  filteredRequisitions.map(req => (
                    <TableRow key={req.id} className={req.priority === '特急' ? 'bg-red-50' : ''}>
                      <TableCell className="font-medium">{req.requisitionNo}</TableCell>
                      <TableCell>{req.orderNo}</TableCell>
                      <TableCell>{req.styleNo}</TableCell>
                      <TableCell>{req.items.length}</TableCell>
                      <TableCell className="text-right">{req.totalRequestedQuantity}</TableCell>
                      <TableCell className="text-right">{req.totalIssuedQuantity}</TableCell>
                      <TableCell className="text-right">¥{req.totalAmount.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge className={priorityColors[req.priority]}>{req.priority}</Badge>
                      </TableCell>
                      <TableCell>
                        {req.isOverIssue ? (
                          <Badge className="bg-red-100 text-red-700">{(req.overIssueRate * 100).toFixed(1)}%</Badge>
                        ) : '-'}
                      </TableCell>
                      <TableCell><Badge className={statusColors[req.status]}>{req.status}</Badge></TableCell>
                      <TableCell>{req.applicant}</TableCell>
                      <TableCell className="text-sm">{req.createdAt}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost" onClick={() => router.push(`/dashboard/material-requisition/${req.id}`)}>
                            <Eye className="w-4 h-4" />
                          </Button>
                          {req.status === '待审核' && (
                            <Button size="sm" variant="ghost" onClick={() => router.push(`/dashboard/material-requisition/${req.id}/edit`)}>
                              <Edit className="w-4 h-4" />
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
              共 {filteredRequisitions.length} 条记录
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
