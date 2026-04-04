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
import { Eye, Calculator, CreditCard, TrendingUp } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  initFinanceData,
  getWithdrawalApplications,
  type WithdrawalApplication,
} from '@/types/finance';

const withdrawalStatusColors: Record<string, string> = {
  '待审核': 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300',
  '处理中': 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  '已到账': 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  '已失败': 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
};

const methodLabels: Record<string, string> = {
  '银行卡': '银行卡',
  '微信': '微信',
  '支付宝': '支付宝',
};

export default function WithdrawalPage() {
  const router = useRouter();
  const [applications, setApplications] = useState<WithdrawalApplication[]>([]);

  // 搜索和筛选
  const [searchEmployee, setSearchEmployee] = useState('');
  const [searchStatus, setSearchStatus] = useState('全部');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setApplications(getWithdrawalApplications());
  };

  const filteredApplications = applications.filter(app => {
    if (searchEmployee && !app.employeeName.includes(searchEmployee)) return false;
    if (searchStatus !== '全部' && app.status !== searchStatus) return false;
    return true;
  });

  const stats = {
    totalApplications: applications.length,
    totalAmount: applications
      .filter(a => a.status === '已到账')
      .reduce((sum, a) => sum + a.amount, 0),
    processingCount: applications.filter(a => a.status === '处理中').length,
    successCount: applications.filter(a => a.status === '已到账').length,
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* 页面标题 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">提现管理</h1>
            <p className="text-muted-foreground">员工工资提现申请及处理</p>
          </div>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">申请总数</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalApplications}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">处理中</CardTitle>
              <Calculator className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.processingCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">已到账</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.successCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">到账总额</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">¥{stats.totalAmount.toLocaleString()}</div>
            </CardContent>
          </Card>
        </div>

        {/* 筛选条件 */}
        <Card>
          <CardHeader>
            <CardTitle>筛选条件</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="searchEmployee">员工姓名</Label>
                <Input
                  id="searchEmployee"
                  placeholder="输入员工姓名"
                  value={searchEmployee}
                  onChange={(e) => setSearchEmployee(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="searchStatus">提现状态</Label>
                <Select value={searchStatus} onValueChange={setSearchStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="全部">全部</SelectItem>
                    {Object.keys(withdrawalStatusColors).map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button onClick={loadData} className="w-full">
                  <Calculator className="w-4 h-4 mr-2" />
                  查询
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 提现列表 */}
        <Card>
          <CardHeader>
            <CardTitle>提现申请列表</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>提现单号</TableHead>
                  <TableHead>员工姓名</TableHead>
                  <TableHead>提现金额</TableHead>
                  <TableHead>提现方式</TableHead>
                  <TableHead>账户信息</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>申请时间</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredApplications.map((application) => (
                  <TableRow key={application.id}>
                    <TableCell>{application.withdrawalNo}</TableCell>
                    <TableCell>{application.employeeName}</TableCell>
                    <TableCell>¥{application.amount.toLocaleString()}</TableCell>
                    <TableCell>{methodLabels[application.method]}</TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {application.method === '银行卡'
                          ? `${application.accountInfo.accountNumber?.slice(-4)}`
                          : application.accountInfo.accountName}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge className={withdrawalStatusColors[application.status]}>
                        {application.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(application.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => router.push(`/dashboard/finance/salary/withdrawal/${application.id}`)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
