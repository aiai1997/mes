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
import { Truck, Plus, Eye, Edit, RotateCcw, DollarSign } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface LogisticsFee {
  id: string;
  feeNo: string;
  orderNo: string;
  customerName: string;
  feeType: '运输费' | '快递费' | '报关费' | '其他';
  amount: number;
  carrier: string;
  trackingNo: string;
  status: '待支付' | '已支付' | '已开票';
  createdAt: string;
}

const mockData: LogisticsFee[] = [
  { id: '1', feeNo: 'LF-20240101-001', orderNo: 'OD-20240101-001', customerName: '时尚服饰有限公司', feeType: '运输费', amount: 1500, carrier: '顺丰物流', trackingNo: 'SF123456789', status: '已支付', createdAt: '2024-01-15 10:00' },
  { id: '2', feeNo: 'LF-20240102-001', orderNo: 'OD-20240102-001', customerName: '优衣库服饰', feeType: '快递费', amount: 85, carrier: '圆通快递', trackingNo: 'YT987654321', status: '待支付', createdAt: '2024-01-16 14:30' },
  { id: '3', feeNo: 'LF-20240103-001', orderNo: 'OD-20240103-001', customerName: '耐克体育', feeType: '报关费', amount: 3200, carrier: '中外运', trackingNo: 'CN456789012', status: '已开票', createdAt: '2024-01-17 09:15' },
];

const feeTypeColors = {
  '运输费': 'bg-blue-100 text-blue-700',
  '快递费': 'bg-green-100 text-green-700',
  '报关费': 'bg-orange-100 text-orange-700',
  '其他': 'bg-gray-100 text-gray-700',
};

const statusColors = {
  '待支付': 'bg-yellow-100 text-yellow-700',
  '已支付': 'bg-green-100 text-green-700',
  '已开票': 'bg-blue-100 text-blue-700',
};

export default function LogisticsFeePage() {
  const router = useRouter();
  const [fees, setFees] = useState<LogisticsFee[]>([]);
  const [searchNo, setSearchNo] = useState('');
  const [searchOrder, setSearchOrder] = useState('');
  const [searchType, setSearchType] = useState('全部');
  const [searchStatus, setSearchStatus] = useState('全部');
  
  useEffect(() => {
    setFees(mockData);
  }, []);
  
  const handleReset = () => {
    setSearchNo('');
    setSearchOrder('');
    setSearchType('全部');
    setSearchStatus('全部');
  };
  
  const filteredFees = fees.filter(f => {
    if (searchNo && !f.feeNo.includes(searchNo)) return false;
    if (searchOrder && !f.orderNo.includes(searchOrder)) return false;
    if (searchType !== '全部' && f.feeType !== searchType) return false;
    if (searchStatus !== '全部' && f.status !== searchStatus) return false;
    return true;
  });
  
  const stats = {
    total: fees.length,
    pending: fees.filter(f => f.status === '待支付').length,
    totalAmount: fees.reduce((sum, f) => sum + f.amount, 0),
    paidAmount: fees.filter(f => f.status !== '待支付').reduce((sum, f) => sum + f.amount, 0),
  };

  return (
    <DashboardLayout>
      <div className="max-w-full mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <Truck className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">物流费用管理</h1>
              <p className="text-muted-foreground text-sm">运输费、快递费、报关费管理</p>
            </div>
          </div>
          <Button onClick={() => router.push('/dashboard/logistics-fee/create')}>
            <Plus className="w-4 h-4 mr-2" />新增费用
          </Button>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">费用单数</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <Truck className="w-8 h-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">待支付</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                </div>
                <DollarSign className="w-8 h-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">总金额</p>
                  <p className="text-2xl font-bold">¥{stats.totalAmount.toLocaleString()}</p>
                </div>
                <DollarSign className="w-8 h-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">已支付金额</p>
                  <p className="text-2xl font-bold text-green-600">¥{stats.paidAmount.toLocaleString()}</p>
                </div>
                <DollarSign className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              <div>
                <Label>费用单号</Label>
                <Input placeholder="请输入" value={searchNo} onChange={(e) => setSearchNo(e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label>订单号</Label>
                <Input placeholder="请输入" value={searchOrder} onChange={(e) => setSearchOrder(e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label>费用类型</Label>
                <Select value={searchType} onValueChange={setSearchType}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="全部">全部</SelectItem>
                    <SelectItem value="运输费">运输费</SelectItem>
                    <SelectItem value="快递费">快递费</SelectItem>
                    <SelectItem value="报关费">报关费</SelectItem>
                    <SelectItem value="其他">其他</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>状态</Label>
                <Select value={searchStatus} onValueChange={setSearchStatus}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="全部">全部</SelectItem>
                    <SelectItem value="待支付">待支付</SelectItem>
                    <SelectItem value="已支付">已支付</SelectItem>
                    <SelectItem value="已开票">已开票</SelectItem>
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
                  <TableHead>费用单号</TableHead>
                  <TableHead>订单号</TableHead>
                  <TableHead>客户</TableHead>
                  <TableHead>费用类型</TableHead>
                  <TableHead className="text-right">金额</TableHead>
                  <TableHead>承运商</TableHead>
                  <TableHead>运单号</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>创建时间</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFees.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-12 text-muted-foreground">暂无数据</TableCell>
                  </TableRow>
                ) : (
                  filteredFees.map(fee => (
                    <TableRow key={fee.id}>
                      <TableCell className="font-medium">{fee.feeNo}</TableCell>
                      <TableCell>{fee.orderNo}</TableCell>
                      <TableCell>{fee.customerName}</TableCell>
                      <TableCell><Badge className={feeTypeColors[fee.feeType]}>{fee.feeType}</Badge></TableCell>
                      <TableCell className="text-right">¥{fee.amount.toLocaleString()}</TableCell>
                      <TableCell>{fee.carrier}</TableCell>
                      <TableCell>{fee.trackingNo}</TableCell>
                      <TableCell><Badge className={statusColors[fee.status]}>{fee.status}</Badge></TableCell>
                      <TableCell className="text-sm">{fee.createdAt}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            <div className="p-4 border-t text-sm text-muted-foreground">共 {filteredFees.length} 条记录</div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
