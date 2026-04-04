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
import { Receipt, Plus, Eye, Calculator, FileText, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  initFinanceData,
  getReimbursementApplications,
  getReimbursementRecords,
  type ReimbursementApplication,
  type ReimbursementRecord,
} from '@/types/finance';
import { getCurrentUser, type CurrentUser } from '@/types/user';

const reimbursementStatusColors: Record<string, string> = {
  '待审核': 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300',
  '主管审核中': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
  '财务审核中': 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
  '老板审核中': 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
  '已通过': 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  '已驳回': 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
  '已到账': 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
};

const categoryLabels: Record<string, string> = {
  '出差车费': '出差车费',
  '油费': '油费',
  '路费': '路费',
  '采购辅料': '采购辅料',
  '配件小额杂费': '配件小额杂费',
  '快递物流费': '快递物流费',
  '食堂食材杂费': '食堂食材杂费',
  '办公耗材费': '办公耗材费',
  '维修设备费': '维修设备费',
  '其他因公临时杂费': '其他因公临时杂费',
};

export default function ReimbursementPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [applications, setApplications] = useState<ReimbursementApplication[]>([]);
  const [records, setRecords] = useState<ReimbursementRecord[]>([]);

  // 筛选条件
  const [searchEmployee, setSearchEmployee] = useState('');
  const [searchCategory, setSearchCategory] = useState('全部');
  const [searchStatus, setSearchStatus] = useState('全部');

  useEffect(() => {
    initFinanceData();
    const user = getCurrentUser();
    setCurrentUser(user);
    loadData();
  }, []);

  const loadData = () => {
    setApplications(getReimbursementApplications());
    setRecords(getReimbursementRecords());
  };

  // 筛选后的数据
  const filteredApplications = applications.filter(app => {
    if (searchEmployee && !app.employeeName.includes(searchEmployee)) return false;
    if (searchCategory !== '全部' && app.category !== searchCategory) return false;
    if (searchStatus !== '全部' && app.status !== searchStatus) return false;
    return true;
  });

  // 统计数据
  const reimbursementStats = {
    totalApplications: applications.length,
    pendingCount: applications.filter(a => a.status.includes('审核中')).length,
    approvedCount: applications.filter(a => a.status === '已通过').length,
    paidCount: applications.filter(a => a.status === '已到账').length,
    totalAmount: applications
      .filter(a => a.status === '已到账')
      .reduce((sum, a) => sum + a.amount, 0),
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* 页面标题 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">报销管理</h1>
            <p className="text-muted-foreground">因公费用实报实销申请和审核</p>
          </div>
          <Button onClick={() => router.push('/dashboard/finance/reimbursement/apply')}>
            <Plus className="w-4 h-4 mr-2" />
            报销申请
          </Button>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">报销申请</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reimbursementStats.totalApplications}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">审核中</CardTitle>
              <Calculator className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reimbursementStats.pendingCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">已通过</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reimbursementStats.approvedCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">已到账</CardTitle>
              <Receipt className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reimbursementStats.paidCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">总金额</CardTitle>
              <Receipt className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">¥{reimbursementStats.totalAmount.toLocaleString()}</div>
            </CardContent>
          </Card>
        </div>

        {/* 筛选条件 */}
        <Card>
          <CardHeader>
            <CardTitle>筛选条件</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                <Label htmlFor="searchCategory">报销类目</Label>
                <Select value={searchCategory} onValueChange={setSearchCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="全部">全部</SelectItem>
                    {Object.entries(categoryLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="searchStatus">审核状态</Label>
                <Select value={searchStatus} onValueChange={setSearchStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="全部">全部</SelectItem>
                    <SelectItem value="待审核">待审核</SelectItem>
                    <SelectItem value="主管审核中">主管审核中</SelectItem>
                    <SelectItem value="财务审核中">财务审核中</SelectItem>
                    <SelectItem value="老板审核中">老板审核中</SelectItem>
                    <SelectItem value="已通过">已通过</SelectItem>
                    <SelectItem value="已驳回">已驳回</SelectItem>
                    <SelectItem value="已到账">已到账</SelectItem>
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

        {/* 标签页内容 */}
        <Tabs defaultValue="applications" className="space-y-4">
          <TabsList>
            <TabsTrigger value="applications">报销申请</TabsTrigger>
            <TabsTrigger value="records">报销记录</TabsTrigger>
            <TabsTrigger value="statistics">统计报表</TabsTrigger>
          </TabsList>

          {/* 报销申请 */}
          <TabsContent value="applications">
            <Card>
              <CardHeader>
                <CardTitle>报销申请列表</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>报销单号</TableHead>
                      <TableHead>员工姓名</TableHead>
                      <TableHead>报销类目</TableHead>
                      <TableHead>金额</TableHead>
                      <TableHead>使用日期</TableHead>
                      <TableHead>状态</TableHead>
                      <TableHead>申请时间</TableHead>
                      <TableHead>操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredApplications.map((application) => (
                      <TableRow key={application.id}>
                        <TableCell>{application.reimbursementNo}</TableCell>
                        <TableCell>{application.employeeName}</TableCell>
                        <TableCell>{categoryLabels[application.category]}</TableCell>
                        <TableCell>¥{application.amount.toLocaleString()}</TableCell>
                        <TableCell>{application.useDate}</TableCell>
                        <TableCell>
                          <Badge className={reimbursementStatusColors[application.status]}>
                            {application.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(application.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => router.push(`/dashboard/finance/reimbursement/${application.id}`)}
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
          </TabsContent>

          {/* 报销记录 */}
          <TabsContent value="records">
            <Card>
              <CardHeader>
                <CardTitle>报销到账记录</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>报销单号</TableHead>
                      <TableHead>员工姓名</TableHead>
                      <TableHead>报销类目</TableHead>
                      <TableHead>金额</TableHead>
                      <TableHead>到账时间</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {records.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>{record.reimbursementNo}</TableCell>
                        <TableCell>{record.employeeName}</TableCell>
                        <TableCell>{categoryLabels[record.category]}</TableCell>
                        <TableCell>¥{record.amount.toLocaleString()}</TableCell>
                        <TableCell>{new Date(record.paidAt).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 统计报表 */}
          <TabsContent value="statistics">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 类目统计 */}
              <Card>
                <CardHeader>
                  <CardTitle>报销类目统计</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(
                      records.reduce((acc, record) => {
                        acc[record.category] = (acc[record.category] || 0) + record.amount;
                        return acc;
                      }, {} as Record<string, number>)
                    ).map(([category, amount]) => (
                      <div key={category} className="flex justify-between items-center">
                        <span>{categoryLabels[category]}</span>
                        <span className="font-bold">¥{amount.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* 月度统计 */}
              <Card>
                <CardHeader>
                  <CardTitle>月度报销统计</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(
                      records.reduce((acc, record) => {
                        const month = new Date(record.paidAt).toISOString().slice(0, 7);
                        acc[month] = (acc[month] || 0) + record.amount;
                        return acc;
                      }, {} as Record<string, number>)
                    ).map(([month, amount]) => (
                      <div key={month} className="flex justify-between items-center">
                        <span>{month}</span>
                        <span className="font-bold">¥{amount.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}