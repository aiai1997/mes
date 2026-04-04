'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RotateCcw, PackageX, Plus, Undo2, AlertTriangle, Eye } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface AfterSalesReturn {
  id: string;
  returnNo: string;
  orderNo: string;
  customerName: string;
  returnType: '质量退货' | '数量退货' | '换货' | '返修';
  reason: string;
  quantity: number;
  amount: number;
  status: '待审核' | '已批准' | '已入库' | '已拒绝';
  handler: string;
  createdAt: string;
}

const mockData: AfterSalesReturn[] = [
  { id: '1', returnNo: 'RT-20240101-001', orderNo: 'OD-20240101-001', customerName: '时尚服饰有限公司', returnType: '质量退货', reason: '色差严重', quantity: 50, amount: 1750, status: '已入库', handler: '客服张三', createdAt: '2024-01-15' },
  { id: '2', returnNo: 'RT-20240102-001', orderNo: 'OD-20240102-001', customerName: '优衣库服饰', returnType: '数量退货', reason: '客户取消订单', quantity: 100, amount: 3500, status: '待审核', handler: '客服李四', createdAt: '2024-01-16' },
  { id: '3', returnNo: 'RT-20240103-001', orderNo: 'OD-20240103-001', customerName: '耐克体育', returnType: '返修', reason: '线头处理不净', quantity: 20, amount: 0, status: '已批准', handler: '客服王五', createdAt: '2024-01-17' },
];

const returnTypeColors = {
  '质量退货': 'bg-red-100 text-red-700',
  '数量退货': 'bg-orange-100 text-orange-700',
  '换货': 'bg-blue-100 text-blue-700',
  '返修': 'bg-yellow-100 text-yellow-700',
};

const statusColors = {
  '待审核': 'bg-yellow-100 text-yellow-700',
  '已批准': 'bg-blue-100 text-blue-700',
  '已入库': 'bg-green-100 text-green-700',
  '已拒绝': 'bg-red-100 text-red-700',
};

export default function AfterSalesReturnPage() {
  const router = useRouter();
  const [returns] = useState<AfterSalesReturn[]>(mockData);
  const [searchNo, setSearchNo] = useState('');
  const [searchType, setSearchType] = useState('全部');
  const [searchStatus, setSearchStatus] = useState('全部');
  
  const handleReset = () => {
    setSearchNo('');
    setSearchType('全部');
    setSearchStatus('全部');
  };
  
  const filteredReturns = returns.filter(r => {
    if (searchNo && !r.returnNo.includes(searchNo) && !r.orderNo.includes(searchNo)) return false;
    if (searchType !== '全部' && r.returnType !== searchType) return false;
    if (searchStatus !== '全部' && r.status !== searchStatus) return false;
    return true;
  });
  
  const stats = {
    total: returns.length,
    pending: returns.filter(r => r.status === '待审核').length,
    totalQuantity: returns.reduce((sum, r) => sum + r.quantity, 0),
    totalAmount: returns.reduce((sum, r) => sum + r.amount, 0),
  };

  return (
    <DashboardLayout>
      <div className="max-w-full mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <PackageX className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">售后退货</h1>
              <p className="text-muted-foreground text-sm">退货、换货、返修管理</p>
            </div>
          </div>
          <Button onClick={() => router.push('/dashboard/after-sales-return/create')}>
            <Plus className="w-4 h-4 mr-2" />新增退货
          </Button>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">退货单数</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <PackageX className="w-8 h-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card className={stats.pending > 0 ? 'border-yellow-300' : ''}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">待审核</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">退货数量</p>
                  <p className="text-2xl font-bold">{stats.totalQuantity}</p>
                </div>
                <Undo2 className="w-8 h-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">退货金额</p>
                  <p className="text-2xl font-bold text-red-600">¥{stats.totalAmount.toLocaleString()}</p>
                </div>
                <PackageX className="w-8 h-8 text-red-400" />
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div>
                <Label>退货单号/订单号</Label>
                <Input placeholder="请输入" value={searchNo} onChange={(e) => setSearchNo(e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label>退货类型</Label>
                <Select value={searchType} onValueChange={setSearchType}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="全部">全部</SelectItem>
                    <SelectItem value="质量退货">质量退货</SelectItem>
                    <SelectItem value="数量退货">数量退货</SelectItem>
                    <SelectItem value="换货">换货</SelectItem>
                    <SelectItem value="返修">返修</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>状态</Label>
                <Select value={searchStatus} onValueChange={setSearchStatus}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="全部">全部</SelectItem>
                    <SelectItem value="待审核">待审核</SelectItem>
                    <SelectItem value="已批准">已批准</SelectItem>
                    <SelectItem value="已入库">已入库</SelectItem>
                    <SelectItem value="已拒绝">已拒绝</SelectItem>
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
                  <TableHead>退货单号</TableHead>
                  <TableHead>订单号</TableHead>
                  <TableHead>客户</TableHead>
                  <TableHead>退货类型</TableHead>
                  <TableHead>退货原因</TableHead>
                  <TableHead className="text-right">数量</TableHead>
                  <TableHead className="text-right">金额</TableHead>
                  <TableHead>处理人</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>创建时间</TableHead>
                  <TableHead className="w-20">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReturns.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center py-12 text-muted-foreground">暂无数据</TableCell>
                  </TableRow>
                ) : (
                  filteredReturns.map(r => (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium">{r.returnNo}</TableCell>
                      <TableCell>{r.orderNo}</TableCell>
                      <TableCell>{r.customerName}</TableCell>
                      <TableCell><Badge className={returnTypeColors[r.returnType]}>{r.returnType}</Badge></TableCell>
                      <TableCell>{r.reason}</TableCell>
                      <TableCell className="text-right">{r.quantity}</TableCell>
                      <TableCell className="text-right">¥{r.amount.toLocaleString()}</TableCell>
                      <TableCell>{r.handler}</TableCell>
                      <TableCell><Badge className={statusColors[r.status]}>{r.status}</Badge></TableCell>
                      <TableCell>{r.createdAt}</TableCell>
                      <TableCell>
                        <Button size="sm" variant="ghost"><Eye className="w-4 h-4" /></Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            <div className="p-4 border-t text-sm text-muted-foreground">共 {filteredReturns.length} 条记录</div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
