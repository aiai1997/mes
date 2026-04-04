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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Eye, Calculator, ArrowLeft, FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  initFinanceData,
  getAdvanceApplications,
  saveAdvanceApplication,
  type AdvanceApplication,
  calculateMaxAdvanceAmount,
  checkAdvanceEligibility,
} from '@/types/finance';
import { getCurrentUser, type CurrentUser } from '@/types/user';

const advanceStatusColors: Record<string, string> = {
  '待审核': 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300',
  '车间审核中': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
  '财务审核中': 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
  '已通过': 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  '已驳回': 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
};

export default function AdvancePage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [applications, setApplications] = useState<AdvanceApplication[]>([]);
  const [loading, setLoading] = useState(false);
  const [showApplyDialog, setShowApplyDialog] = useState(false);

  // 搜索和筛选
  const [searchEmployee, setSearchEmployee] = useState('');
  const [searchStatus, setSearchStatus] = useState('全部');

  // 申请表单
  const [formData, setFormData] = useState({
    amount: '',
    reason: '',
  });

  useEffect(() => {
    initFinanceData();
    const user = getCurrentUser();
    setCurrentUser(user);
    loadData();
  }, []);

  const loadData = () => {
    setApplications(getAdvanceApplications());
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleApply = async () => {
    if (!currentUser) {
      alert('用户未登录');
      return;
    }

    const amount = Number(formData.amount);

    // 检查资格
    const eligibility = checkAdvanceEligibility(currentUser.id);
    if (!eligibility.eligible) {
      alert(`无法申请预支：${eligibility.reason}`);
      return;
    }

    // 检查金额
    const maxAmount = calculateMaxAdvanceAmount(currentUser.id);
    if (amount <= 0 || amount > maxAmount) {
      alert(`预支金额应在 0 ~ ${maxAmount} 之间`);
      return;
    }

    setLoading(true);
    try {
      const newApplication: AdvanceApplication = {
        id: `adv${Date.now()}${Math.random()}`,
        advanceNo: `ADV${Date.now()}`,
        employeeId: currentUser.id,
        employeeName: currentUser.realName,
        amount,
        reason: formData.reason,
        maxAdvanceAmount: maxAmount,
        status: '待审核',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      saveAdvanceApplication(newApplication);
      setShowApplyDialog(false);
      setFormData({ amount: '', reason: '' });
      loadData();
      alert('预支申请已提交');
    } catch (error) {
      alert('申请失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const filteredApplications = applications.filter(app => {
    if (searchEmployee && !app.employeeName.includes(searchEmployee)) return false;
    if (searchStatus !== '全部' && app.status !== searchStatus) return false;
    return true;
  });

  const stats = {
    totalApplications: applications.length,
    pendingCount: applications.filter(a => a.status.includes('审核')).length,
    approvedCount: applications.filter(a => a.status === '已通过').length,
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* 页面标题 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">预支申请</h1>
            <p className="text-muted-foreground">工资预支申请及审核管理</p>
          </div>
          <Dialog open={showApplyDialog} onOpenChange={setShowApplyDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                新申请
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>申请工资预支</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="advanceAmount">预支金额</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">¥</span>
                    <Input
                      id="advanceAmount"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="请输入预支金额"
                      className="pl-8"
                      value={formData.amount}
                      onChange={(e) => handleInputChange('amount', e.target.value)}
                    />
                  </div>
                  {formData.amount && (
                    <p className="text-sm text-muted-foreground mt-1">
                      最多可预支：¥{calculateMaxAdvanceAmount(currentUser?.id || '').toLocaleString()}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="advanceReason">预支原因</Label>
                  <Textarea
                    id="advanceReason"
                    placeholder="请说明预支原因"
                    rows={3}
                    value={formData.reason}
                    onChange={(e) => handleInputChange('reason', e.target.value)}
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowApplyDialog(false)}>
                    取消
                  </Button>
                  <Button onClick={handleApply} disabled={loading}>
                    提交申请
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">申请总数</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalApplications}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">审核中</CardTitle>
              <Calculator className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">已通过</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.approvedCount}</div>
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
                <Label htmlFor="searchStatus">审核状态</Label>
                <Select value={searchStatus} onValueChange={setSearchStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="全部">全部</SelectItem>
                    {Object.keys(advanceStatusColors).map((status) => (
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

        {/* 申请列表 */}
        <Card>
          <CardHeader>
            <CardTitle>预支申请列表</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>预支单号</TableHead>
                  <TableHead>员工姓名</TableHead>
                  <TableHead>预支金额</TableHead>
                  <TableHead>最高限额</TableHead>
                  <TableHead>申请原因</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>申请时间</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredApplications.map((application) => (
                  <TableRow key={application.id}>
                    <TableCell>{application.advanceNo}</TableCell>
                    <TableCell>{application.employeeName}</TableCell>
                    <TableCell>¥{application.amount.toLocaleString()}</TableCell>
                    <TableCell>¥{application.maxAdvanceAmount.toLocaleString()}</TableCell>
                    <TableCell>{application.reason}</TableCell>
                    <TableCell>
                      <Badge className={advanceStatusColors[application.status]}>
                        {application.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(application.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => router.push(`/dashboard/finance/salary/advance/${application.id}`)}
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
