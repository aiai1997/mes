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
import { ArrowRightLeft, Plus, Eye, Edit, RotateCcw, User } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface InternalTransfer {
  id: string;
  transferNo: string;
  type: '订单' | '物料' | '设备' | '人员';
  fromDept: string;
  toDept: string;
  itemName: string;
  quantity: number;
  reason: string;
  status: '待审批' | '已通过' | '已拒绝';
  applicant: string;
  createdAt: string;
}

const mockData: InternalTransfer[] = [
  { id: '1', transferNo: 'IT-20240101-001', type: '订单', fromDept: '裁床车间', toDept: '缝制一车间', itemName: 'OD-20240101-001', quantity: 1, reason: '产能调整', status: '已通过', applicant: '张三', createdAt: '2024-01-15 10:00' },
  { id: '2', transferNo: 'IT-20240102-001', type: '物料', fromDept: '原料仓', toDept: '缝制二车间', itemName: '白色面料', quantity: 500, reason: '生产领料', status: '已通过', applicant: '李四', createdAt: '2024-01-16 14:30' },
  { id: '3', transferNo: 'IT-20240103-001', type: '人员', fromDept: '缝制一车间', toDept: '缝制二车间', itemName: '王五', quantity: 1, reason: '人员支援', status: '待审批', applicant: '赵六', createdAt: '2024-01-17 09:15' },
];

const typeColors = {
  '订单': 'bg-blue-100 text-blue-700',
  '物料': 'bg-green-100 text-green-700',
  '设备': 'bg-orange-100 text-orange-700',
  '人员': 'bg-purple-100 text-purple-700',
};

const statusColors = {
  '待审批': 'bg-yellow-100 text-yellow-700',
  '已通过': 'bg-green-100 text-green-700',
  '已拒绝': 'bg-red-100 text-red-700',
};

export default function InternalTransferPage() {
  const router = useRouter();
  const [transfers, setTransfers] = useState<InternalTransfer[]>([]);
  const [searchNo, setSearchNo] = useState('');
  const [searchType, setSearchType] = useState('全部');
  const [searchStatus, setSearchStatus] = useState('全部');
  
  useEffect(() => {
    setTransfers(mockData);
  }, []);
  
  const handleReset = () => {
    setSearchNo('');
    setSearchType('全部');
    setSearchStatus('全部');
  };
  
  const filteredTransfers = transfers.filter(t => {
    if (searchNo && !t.transferNo.includes(searchNo)) return false;
    if (searchType !== '全部' && t.type !== searchType) return false;
    if (searchStatus !== '全部' && t.status !== searchStatus) return false;
    return true;
  });
  
  const stats = {
    total: transfers.length,
    pending: transfers.filter(t => t.status === '待审批').length,
    approved: transfers.filter(t => t.status === '已通过').length,
  };

  return (
    <DashboardLayout>
      <div className="max-w-full mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <ArrowRightLeft className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">内部转移单</h1>
              <p className="text-muted-foreground text-sm">订单/物料/设备/人员转移管理</p>
            </div>
          </div>
          <Button onClick={() => router.push('/dashboard/internal-transfer/create')}>
            <Plus className="w-4 h-4 mr-2" />新增转移
          </Button>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">转移单数</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <ArrowRightLeft className="w-8 h-8 text-muted-foreground" />
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
                <User className="w-8 h-8 text-yellow-400" />
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
                <ArrowRightLeft className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div>
                <Label>转移单号</Label>
                <Input placeholder="请输入" value={searchNo} onChange={(e) => setSearchNo(e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label>转移类型</Label>
                <Select value={searchType} onValueChange={setSearchType}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="全部">全部</SelectItem>
                    <SelectItem value="订单">订单</SelectItem>
                    <SelectItem value="物料">物料</SelectItem>
                    <SelectItem value="设备">设备</SelectItem>
                    <SelectItem value="人员">人员</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>状态</Label>
                <Select value={searchStatus} onValueChange={setSearchStatus}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="全部">全部</SelectItem>
                    <SelectItem value="待审批">待审批</SelectItem>
                    <SelectItem value="已通过">已通过</SelectItem>
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
                  <TableHead>转移单号</TableHead>
                  <TableHead>类型</TableHead>
                  <TableHead>调出部门</TableHead>
                  <TableHead>调入部门</TableHead>
                  <TableHead>转移项目</TableHead>
                  <TableHead className="text-right">数量</TableHead>
                  <TableHead>原因</TableHead>
                  <TableHead>申请人</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>创建时间</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransfers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-12 text-muted-foreground">暂无数据</TableCell>
                  </TableRow>
                ) : (
                  filteredTransfers.map(t => (
                    <TableRow key={t.id}>
                      <TableCell className="font-medium">{t.transferNo}</TableCell>
                      <TableCell><Badge className={typeColors[t.type]}>{t.type}</Badge></TableCell>
                      <TableCell>{t.fromDept}</TableCell>
                      <TableCell>{t.toDept}</TableCell>
                      <TableCell>{t.itemName}</TableCell>
                      <TableCell className="text-right">{t.quantity}</TableCell>
                      <TableCell>{t.reason}</TableCell>
                      <TableCell>{t.applicant}</TableCell>
                      <TableCell><Badge className={statusColors[t.status]}>{t.status}</Badge></TableCell>
                      <TableCell className="text-sm">{t.createdAt}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            <div className="p-4 border-t text-sm text-muted-foreground">共 {filteredTransfers.length} 条记录</div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
