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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Send,
  RotateCcw,
  Plus,
  Eye,
  Truck,
  Calculator,
  AlertTriangle,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, type CurrentUser } from '@/types/user';
import {
  type Outsource,
  type OutsourceType,
  type OutsourceStatus,
  getOutsources,
  initOutsourceData,
} from '@/types/outsource';

const statusColors: Record<OutsourceStatus, string> = {
  '待外发': 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  '已外发': 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  '部分回货': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
  '全部回货': 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  '已对账': 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
};

const typeColors: Record<OutsourceType, string> = {
  '印花': 'text-pink-600',
  '绣花': 'text-purple-600',
  '洗水': 'text-blue-600',
  '缝制': 'text-green-600',
  '整烫': 'text-orange-600',
};

export default function OutsourcePage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [outsources, setOutsources] = useState<Outsource[]>([]);
  
  const [searchType, setSearchType] = useState('全部');
  const [searchStatus, setSearchStatus] = useState('全部');
  const [searchSupplier, setSearchSupplier] = useState('');
  const [searchOrderNo, setSearchOrderNo] = useState('');
  
  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);
    initOutsourceData();
    loadData();
  }, []);
  
  const loadData = () => {
    setOutsources(getOutsources());
  };
  
  const filteredOutsources = outsources.filter(o => {
    if (searchType !== '全部' && o.outsourceType !== searchType) return false;
    if (searchStatus !== '全部' && o.status !== searchStatus) return false;
    if (searchSupplier && !o.supplierName.includes(searchSupplier)) return false;
    if (searchOrderNo && !o.orderNo.includes(searchOrderNo)) return false;
    return true;
  });
  
  const stats = {
    total: outsources.length,
    pending: outsources.filter(o => o.status === '待外发').length,
    sent: outsources.filter(o => o.status === '已外发').length,
    totalFee: outsources.reduce((sum, o) => sum + o.processingFee, 0),
  };
  
  const handleReset = () => {
    setSearchType('全部');
    setSearchStatus('全部');
    setSearchSupplier('');
    setSearchOrderNo('');
  };

  return (
    <DashboardLayout>
      <div className="max-w-full mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <Send className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">外协管理</h1>
              <p className="text-muted-foreground text-sm">外发加工、收发、对账、应付管理</p>
            </div>
          </div>
          <Button onClick={() => router.push('/dashboard/outsource/form')} className="gap-2">
            <Plus className="w-4 h-4" />新增外协单
          </Button>
        </div>
        
        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">外协总数</p>
                  <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                </div>
                <Send className="w-8 h-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">待外发</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">已外发</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.sent}</p>
                </div>
                <Truck className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">加工费合计</p>
                  <p className="text-2xl font-bold text-green-600">¥{stats.totalFee.toFixed(0)}</p>
                </div>
                <Calculator className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* 查询区 */}
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              <div>
                <Label>外协类型</Label>
                <Select value={searchType} onValueChange={setSearchType}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="全部">全部</SelectItem>
                    <SelectItem value="印花">印花</SelectItem>
                    <SelectItem value="绣花">绣花</SelectItem>
                    <SelectItem value="洗水">洗水</SelectItem>
                    <SelectItem value="缝制">缝制</SelectItem>
                    <SelectItem value="整烫">整烫</SelectItem>
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
                    <SelectItem value="待外发">待外发</SelectItem>
                    <SelectItem value="已外发">已外发</SelectItem>
                    <SelectItem value="部分回货">部分回货</SelectItem>
                    <SelectItem value="全部回货">全部回货</SelectItem>
                    <SelectItem value="已对账">已对账</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>供应商</Label>
                <Input placeholder="请输入" value={searchSupplier} onChange={(e) => setSearchSupplier(e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label>订单号</Label>
                <Input placeholder="请输入" value={searchOrderNo} onChange={(e) => setSearchOrderNo(e.target.value)} className="mt-1" />
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
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>外协单号</TableHead>
                    <TableHead>类型</TableHead>
                    <TableHead>订单号</TableHead>
                    <TableHead>供应商</TableHead>
                    <TableHead className="text-right">外发数</TableHead>
                    <TableHead className="text-right">回货数</TableHead>
                    <TableHead className="text-right">良品数</TableHead>
                    <TableHead className="text-right">加工费</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>外发日期</TableHead>
                    <TableHead className="w-20">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOutsources.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={11} className="text-center py-12 text-muted-foreground">
                        暂无外协记录
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredOutsources.map((o) => (
                      <TableRow key={o.id}>
                        <TableCell className="font-medium">{o.outsourceNo}</TableCell>
                        <TableCell className={typeColors[o.outsourceType]}>{o.outsourceType}</TableCell>
                        <TableCell>{o.orderNo}</TableCell>
                        <TableCell>{o.supplierName}</TableCell>
                        <TableCell className="text-right">{o.sendQuantity}</TableCell>
                        <TableCell className="text-right">{o.returnedQuantity}</TableCell>
                        <TableCell className="text-right text-green-600">{o.goodQuantity}</TableCell>
                        <TableCell className="text-right font-medium">¥{o.processingFee.toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge className={statusColors[o.status]}>{o.status}</Badge>
                        </TableCell>
                        <TableCell>{o.sendDate}</TableCell>
                        <TableCell>
                          <Button size="sm" variant="ghost" onClick={() => router.push(`/dashboard/outsource/${o.id}`)} title="查看详情"><Eye className="w-4 h-4" /></Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            <div className="p-4 border-t text-sm text-muted-foreground">
              共 {filteredOutsources.length} 条
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
