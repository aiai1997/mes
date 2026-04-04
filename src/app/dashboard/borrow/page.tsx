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
import { ArrowLeftRight, Plus, Search, RotateCcw, Clock, CheckCircle, AlertTriangle, ArrowDownToLine, ArrowUpFromLine } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  type BorrowRecord,
  type BorrowStatus,
  type BorrowType,
  getBorrowRecords,
  initMiscData,
} from '@/types/misc';

const statusColors: Record<BorrowStatus, string> = {
  '申请中': 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  '已借出': 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  '部分归还': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
  '已归还': 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  '已逾期': 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
};

export default function BorrowPage() {
  const router = useRouter();
  const [records, setRecords] = useState<BorrowRecord[]>([]);
  
  const [searchNo, setSearchNo] = useState('');
  const [searchStatus, setSearchStatus] = useState('全部');
  const [searchType, setSearchType] = useState('全部');
  const [activeTab, setActiveTab] = useState('borrow');
  
  useEffect(() => {
    initMiscData();
    loadData();
  }, []);
  
  const loadData = () => {
    setRecords(getBorrowRecords());
  };
  
  const filteredRecords = records.filter(r => {
    if (searchNo && !r.borrowNo.includes(searchNo) && !r.materialNo.includes(searchNo)) return false;
    if (searchStatus !== '全部' && r.status !== searchStatus) return false;
    if (searchType !== '全部' && r.borrowType !== searchType) return false;
    if (activeTab === 'borrow' && r.borrowType !== '借入') return false;
    if (activeTab === 'lend' && r.borrowType !== '借出') return false;
    return true;
  });
  
  const handleReset = () => {
    setSearchNo('');
    setSearchStatus('全部');
    setSearchType('全部');
  };
  
  const stats = {
    total: records.length,
    borrowing: records.filter(r => r.borrowType === '借入' && (r.status === '已借出' || r.status === '部分归还')).length,
    lending: records.filter(r => r.borrowType === '借出' && (r.status === '已借出' || r.status === '部分归还')).length,
    overdue: records.filter(r => r.status === '已逾期').length,
  };

  return (
    <DashboardLayout>
      <div className="max-w-full mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <ArrowLeftRight className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">借料管理</h1>
              <p className="text-muted-foreground text-sm">物料借入/借出登记、归还跟踪</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => router.push('/dashboard/borrow/create?type=borrow')}>
              <ArrowDownToLine className="w-4 h-4 mr-2" />借入登记
            </Button>
            <Button variant="outline" onClick={() => router.push('/dashboard/borrow/create?type=lend')}>
              <ArrowUpFromLine className="w-4 h-4 mr-2" />借出登记
            </Button>
          </div>
        </div>
        
        {/* 统计卡片 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">记录总数</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <ArrowLeftRight className="w-8 h-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">借入中</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.borrowing}</p>
                </div>
                <ArrowDownToLine className="w-8 h-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">借出中</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.lending}</p>
                </div>
                <ArrowUpFromLine className="w-8 h-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">已逾期</p>
                  <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-400" />
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="borrow">借入记录</TabsTrigger>
            <TabsTrigger value="lend">借出记录</TabsTrigger>
          </TabsList>
          
          {/* 查询区 */}
          <Card className="mt-4">
            <CardContent className="p-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <Label>单据编号/物料</Label>
                  <Input placeholder="请输入" value={searchNo} onChange={(e) => setSearchNo(e.target.value)} className="mt-1" />
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
                      <SelectItem value="已借出">已借出</SelectItem>
                      <SelectItem value="部分归还">部分归还</SelectItem>
                      <SelectItem value="已归还">已归还</SelectItem>
                      <SelectItem value="已逾期">已逾期</SelectItem>
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
          <Card className="mt-4">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>单据编号</TableHead>
                    <TableHead>物料编号</TableHead>
                    <TableHead>物料名称</TableHead>
                    <TableHead className="text-right">借出数量</TableHead>
                    <TableHead className="text-right">已归还</TableHead>
                    <TableHead>对方单位</TableHead>
                    <TableHead>借出日期</TableHead>
                    <TableHead>预计归还</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead className="w-20">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecords.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center py-12 text-muted-foreground">
                        暂无{activeTab === 'borrow' ? '借入' : '借出'}记录
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRecords.map(record => (
                      <TableRow key={record.id} className={record.status === '已逾期' ? 'bg-red-50 dark:bg-red-950' : ''}>
                        <TableCell className="font-medium">{record.borrowNo}</TableCell>
                        <TableCell>{record.materialNo}</TableCell>
                        <TableCell>{record.materialName}</TableCell>
                        <TableCell className="text-right">{record.borrowQuantity}</TableCell>
                        <TableCell className="text-right">{record.returnedQuantity}</TableCell>
                        <TableCell>{record.counterparty}</TableCell>
                        <TableCell className="text-sm">{record.borrowDate}</TableCell>
                        <TableCell className="text-sm">{record.expectedReturnDate}</TableCell>
                        <TableCell><Badge className={statusColors[record.status]}>{record.status}</Badge></TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button size="sm" variant="ghost" onClick={() => router.push(`/dashboard/borrow/${record.id}`)}>
                              查看
                            </Button>
                            {record.status === '已借出' && (
                              <Button size="sm" variant="ghost" className="text-green-600">
                                归还
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
                共 {filteredRecords.length} 条记录
              </div>
            </CardContent>
          </Card>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
