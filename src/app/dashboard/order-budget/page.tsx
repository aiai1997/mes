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
import { Calculator, Plus, Eye, Edit, RotateCcw, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface OrderBudget {
  id: string;
  orderNo: string;
  customerName: string;
  productCode: string;
  productName: string;
  quantity: number;
  materialCost: number;
  laborCost: number;
  overheadCost: number;
  otherCost: number;
  totalCost: number;
  unitPrice: number;
  totalRevenue: number;
  grossProfit: number;
  grossMargin: number;
  status: '预算中' | '已确认' | '已变更';
  createdAt: string;
}

const mockData: OrderBudget[] = [
  { id: '1', orderNo: 'OD-20240101-001', customerName: '时尚服饰有限公司', productCode: 'TS-001', productName: '男士T恤', quantity: 1000, materialCost: 15000, laborCost: 8000, overheadCost: 3000, otherCost: 500, totalCost: 26500, unitPrice: 35, totalRevenue: 35000, grossProfit: 8500, grossMargin: 24.3, status: '已确认', createdAt: '2024-01-15' },
  { id: '2', orderNo: 'OD-20240102-001', customerName: '优衣库服饰', productCode: 'JK-001', productName: '女装夹克', quantity: 500, materialCost: 25000, laborCost: 12000, overheadCost: 5000, otherCost: 800, totalCost: 42800, unitPrice: 120, totalRevenue: 60000, grossProfit: 17200, grossMargin: 28.7, status: '预算中', createdAt: '2024-01-16' },
];

const statusColors = {
  '预算中': 'bg-blue-100 text-blue-700',
  '已确认': 'bg-green-100 text-green-700',
  '已变更': 'bg-orange-100 text-orange-700',
};

export default function OrderBudgetPage() {
  const router = useRouter();
  const [budgets, setBudgets] = useState<OrderBudget[]>([]);
  const [searchNo, setSearchNo] = useState('');
  const [searchStatus, setSearchStatus] = useState('全部');
  
  useEffect(() => {
    setBudgets(mockData);
  }, []);
  
  const handleReset = () => {
    setSearchNo('');
    setSearchStatus('全部');
  };
  
  const filteredBudgets = budgets.filter(b => {
    if (searchNo && !b.orderNo.includes(searchNo)) return false;
    if (searchStatus !== '全部' && b.status !== searchStatus) return false;
    return true;
  });
  
  const stats = {
    total: budgets.length,
    totalRevenue: budgets.reduce((sum, b) => sum + b.totalRevenue, 0),
    totalCost: budgets.reduce((sum, b) => sum + b.totalCost, 0),
    totalProfit: budgets.reduce((sum, b) => sum + b.grossProfit, 0),
    avgMargin: budgets.length > 0 ? (budgets.reduce((sum, b) => sum + b.grossMargin, 0) / budgets.length).toFixed(1) : '0',
  };

  return (
    <DashboardLayout>
      <div className="max-w-full mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <Calculator className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">订单预算</h1>
              <p className="text-muted-foreground text-sm">成本核算与利润分析</p>
            </div>
          </div>
          <Button onClick={() => router.push('/dashboard/order-budget/create')}>
            <Plus className="w-4 h-4 mr-2" />新增预算
          </Button>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">预算订单</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <Calculator className="w-8 h-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">总收入</p>
                  <p className="text-2xl font-bold text-green-600">¥{stats.totalRevenue.toLocaleString()}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">总成本</p>
                  <p className="text-2xl font-bold text-orange-600">¥{stats.totalCost.toLocaleString()}</p>
                </div>
                <DollarSign className="w-8 h-8 text-orange-400" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">毛利润</p>
                  <p className="text-2xl font-bold text-blue-600">¥{stats.totalProfit.toLocaleString()}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">平均毛利率</p>
                  <p className="text-2xl font-bold">{stats.avgMargin}%</p>
                </div>
                <TrendingUp className="w-8 h-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <Label>订单号</Label>
                <Input placeholder="请输入" value={searchNo} onChange={(e) => setSearchNo(e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label>状态</Label>
                <Select value={searchStatus} onValueChange={setSearchStatus}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="全部">全部</SelectItem>
                    <SelectItem value="预算中">预算中</SelectItem>
                    <SelectItem value="已确认">已确认</SelectItem>
                    <SelectItem value="已变更">已变更</SelectItem>
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
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>订单号</TableHead>
                  <TableHead>客户</TableHead>
                  <TableHead>产品</TableHead>
                  <TableHead className="text-right">数量</TableHead>
                  <TableHead className="text-right">材料成本</TableHead>
                  <TableHead className="text-right">人工成本</TableHead>
                  <TableHead className="text-right">制造费用</TableHead>
                  <TableHead className="text-right">其他费用</TableHead>
                  <TableHead className="text-right">总成本</TableHead>
                  <TableHead className="text-right">总收入</TableHead>
                  <TableHead className="text-right">毛利</TableHead>
                  <TableHead className="text-right">毛利率</TableHead>
                  <TableHead>状态</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBudgets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={13} className="text-center py-12 text-muted-foreground">暂无数据</TableCell>
                  </TableRow>
                ) : (
                  filteredBudgets.map(b => (
                    <TableRow key={b.id}>
                      <TableCell className="font-medium">{b.orderNo}</TableCell>
                      <TableCell>{b.customerName}</TableCell>
                      <TableCell>{b.productName}</TableCell>
                      <TableCell className="text-right">{b.quantity.toLocaleString()}</TableCell>
                      <TableCell className="text-right">¥{b.materialCost.toLocaleString()}</TableCell>
                      <TableCell className="text-right">¥{b.laborCost.toLocaleString()}</TableCell>
                      <TableCell className="text-right">¥{b.overheadCost.toLocaleString()}</TableCell>
                      <TableCell className="text-right">¥{b.otherCost.toLocaleString()}</TableCell>
                      <TableCell className="text-right font-medium">¥{b.totalCost.toLocaleString()}</TableCell>
                      <TableCell className="text-right text-green-600">¥{b.totalRevenue.toLocaleString()}</TableCell>
                      <TableCell className="text-right font-medium text-blue-600">¥{b.grossProfit.toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        <span className={b.grossMargin >= 25 ? 'text-green-600' : b.grossMargin >= 15 ? 'text-yellow-600' : 'text-red-600'}>
                          {b.grossMargin}%
                        </span>
                      </TableCell>
                      <TableCell><Badge className={statusColors[b.status]}>{b.status}</Badge></TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            <div className="p-4 border-t text-sm text-muted-foreground">共 {filteredBudgets.length} 条记录</div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
