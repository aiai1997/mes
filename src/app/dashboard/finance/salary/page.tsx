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
import { DollarSign, Wallet, CreditCard, Users, Plus, Eye, Calculator, PiggyBank } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  initFinanceData,
  getMonthlySalaries,
  getAdvanceApplications,
  getWithdrawalApplications,
  getEmployeeWallet,
  type MonthlySalary,
  type AdvanceApplication,
  type WithdrawalApplication,
  type EmployeeWallet,
  unfreezeSalary,
} from '@/types/finance';
import { getCurrentUser, type CurrentUser } from '@/types/user';

const salaryStatusColors: Record<string, string> = {
  '冻结中': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
  '已解冻': 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  '已结算': 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
};

const advanceStatusColors: Record<string, string> = {
  '待审核': 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300',
  '车间审核中': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
  '财务审核中': 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
  '已通过': 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  '已驳回': 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
};

const withdrawalStatusColors: Record<string, string> = {
  '待审核': 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300',
  '处理中': 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  '已到账': 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  '已失败': 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
};

export default function SalaryPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [monthlySalaries, setMonthlySalaries] = useState<MonthlySalary[]>([]);
  const [advanceApplications, setAdvanceApplications] = useState<AdvanceApplication[]>([]);
  const [withdrawalApplications, setWithdrawalApplications] = useState<WithdrawalApplication[]>([]);
  const [employeeWallets, setEmployeeWallets] = useState<EmployeeWallet[]>([]);

  // 筛选条件
  const [searchEmployee, setSearchEmployee] = useState('');
  const [searchYear, setSearchYear] = useState(new Date().getFullYear().toString());
  const [searchMonth, setSearchMonth] = useState((new Date().getMonth() + 1).toString());

  useEffect(() => {
    initFinanceData();
    const user = getCurrentUser();
    setCurrentUser(user);
    loadData();
  }, []);

  const loadData = () => {
    setMonthlySalaries(getMonthlySalaries());
    setAdvanceApplications(getAdvanceApplications());
    setWithdrawalApplications(getWithdrawalApplications());

    // 加载员工钱包数据
    const wallets: EmployeeWallet[] = [];
    // 这里应该从所有员工ID获取钱包，暂时用示例数据
    const sampleEmployeeIds = ['EMP001', 'EMP002', 'EMP003'];
    sampleEmployeeIds.forEach(id => {
      const wallet = getEmployeeWallet(id);
      if (wallet) wallets.push(wallet);
    });
    setEmployeeWallets(wallets);
  };

  // 筛选后的数据
  const filteredSalaries = monthlySalaries.filter(salary => {
    if (searchEmployee && !salary.employeeName.includes(searchEmployee)) return false;
    if (searchYear && salary.year !== parseInt(searchYear)) return false;
    if (searchMonth && salary.month !== parseInt(searchMonth)) return false;
    return true;
  });

  const filteredAdvances = advanceApplications.filter(advance => {
    if (searchEmployee && !advance.employeeName.includes(searchEmployee)) return false;
    return true;
  });

  const filteredWithdrawals = withdrawalApplications.filter(withdrawal => {
    if (searchEmployee && !withdrawal.employeeName.includes(searchEmployee)) return false;
    return true;
  });

  // 统计数据
  const salaryStats = {
    totalEmployees: new Set(monthlySalaries.map(s => s.employeeId)).size,
    totalFrozen: monthlySalaries.reduce((sum, s) => sum + s.frozenAmount, 0),
    totalAvailable: monthlySalaries.reduce((sum, s) => sum + s.availableAmount, 0),
    totalAdvances: advanceApplications.filter(a => a.status === '已通过').length,
    totalWithdrawals: withdrawalApplications.filter(w => w.status === '已到账').length,
  };

  // 工资解冻操作
  const handleUnfreezeSalary = (employeeId: string, year: number, month: number) => {
    unfreezeSalary(employeeId, year, month);
    loadData(); // 重新加载数据
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* 页面标题 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">工资管理</h1>
            <p className="text-muted-foreground">员工薪酬核算、预支管理和提现处理</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => router.push('/dashboard/finance/salary/advance')}>
              <Plus className="w-4 h-4 mr-2" />
              预支申请
            </Button>
            <Button onClick={() => router.push('/dashboard/finance/salary/withdrawal')}>
              <CreditCard className="w-4 h-4 mr-2" />
              提现申请
            </Button>
          </div>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">在职员工</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{salaryStats.totalEmployees}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">冻结工资</CardTitle>
              <PiggyBank className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">¥{salaryStats.totalFrozen.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">可提现工资</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">¥{salaryStats.totalAvailable.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">预支申请</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{salaryStats.totalAdvances}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">提现成功</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{salaryStats.totalWithdrawals}</div>
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
                <Label htmlFor="searchYear">年份</Label>
                <Select value={searchYear} onValueChange={setSearchYear}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2024">2024年</SelectItem>
                    <SelectItem value="2025">2025年</SelectItem>
                    <SelectItem value="2026">2026年</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="searchMonth">月份</Label>
                <Select value={searchMonth} onValueChange={setSearchMonth}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => (
                      <SelectItem key={i + 1} value={(i + 1).toString()}>
                        {i + 1}月
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

        {/* 标签页内容 */}
        <Tabs defaultValue="salary" className="space-y-4">
          <TabsList>
            <TabsTrigger value="salary">工资明细</TabsTrigger>
            <TabsTrigger value="advance">预支申请</TabsTrigger>
            <TabsTrigger value="withdrawal">提现申请</TabsTrigger>
            <TabsTrigger value="wallet">员工钱包</TabsTrigger>
          </TabsList>

          {/* 工资明细 */}
          <TabsContent value="salary">
            <Card>
              <CardHeader>
                <CardTitle>工资明细</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>员工姓名</TableHead>
                      <TableHead>年月</TableHead>
                      <TableHead>计件工资</TableHead>
                      <TableHead>补贴</TableHead>
                      <TableHead>扣款</TableHead>
                      <TableHead>冻结金额</TableHead>
                      <TableHead>可提现</TableHead>
                      <TableHead>状态</TableHead>
                      <TableHead>操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSalaries.map((salary) => (
                      <TableRow key={salary.id}>
                        <TableCell>{salary.employeeName}</TableCell>
                        <TableCell>{salary.year}年{salary.month}月</TableCell>
                        <TableCell>¥{salary.totalWage.toLocaleString()}</TableCell>
                        <TableCell>¥{salary.totalDeduction.toLocaleString()}</TableCell>
                        <TableCell>¥{salary.frozenAmount.toLocaleString()}</TableCell>
                        <TableCell>¥{salary.availableAmount.toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge className={salaryStatusColors[salary.status]}>
                            {salary.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => router.push(`/dashboard/finance/salary/${salary.id}`)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            {salary.status === '冻结中' && (
                              <Button
                                size="sm"
                                onClick={() => handleUnfreezeSalary(salary.employeeId, salary.year, salary.month)}
                              >
                                解冻
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 预支申请 */}
          <TabsContent value="advance">
            <Card>
              <CardHeader>
                <CardTitle>预支申请</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>申请单号</TableHead>
                      <TableHead>员工姓名</TableHead>
                      <TableHead>预支金额</TableHead>
                      <TableHead>申请时间</TableHead>
                      <TableHead>状态</TableHead>
                      <TableHead>操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAdvances.map((advance) => (
                      <TableRow key={advance.id}>
                        <TableCell>{advance.advanceNo}</TableCell>
                        <TableCell>{advance.employeeName}</TableCell>
                        <TableCell>¥{advance.amount.toLocaleString()}</TableCell>
                        <TableCell>{new Date(advance.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Badge className={advanceStatusColors[advance.status]}>
                            {advance.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => router.push(`/dashboard/finance/salary/advance/${advance.id}`)}
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

          {/* 提现申请 */}
          <TabsContent value="withdrawal">
            <Card>
              <CardHeader>
                <CardTitle>提现申请</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>申请单号</TableHead>
                      <TableHead>员工姓名</TableHead>
                      <TableHead>提现金额</TableHead>
                      <TableHead>提现方式</TableHead>
                      <TableHead>申请时间</TableHead>
                      <TableHead>状态</TableHead>
                      <TableHead>操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredWithdrawals.map((withdrawal) => (
                      <TableRow key={withdrawal.id}>
                        <TableCell>{withdrawal.withdrawalNo}</TableCell>
                        <TableCell>{withdrawal.employeeName}</TableCell>
                        <TableCell>¥{withdrawal.amount.toLocaleString()}</TableCell>
                        <TableCell>{withdrawal.method}</TableCell>
                        <TableCell>{new Date(withdrawal.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Badge className={withdrawalStatusColors[withdrawal.status]}>
                            {withdrawal.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => router.push(`/dashboard/finance/salary/withdrawal/${withdrawal.id}`)}
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

          {/* 员工钱包 */}
          <TabsContent value="wallet">
            <Card>
              <CardHeader>
                <CardTitle>员工钱包</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>员工姓名</TableHead>
                      <TableHead>冻结工资</TableHead>
                      <TableHead>可提现工资</TableHead>
                      <TableHead>预支欠款</TableHead>
                      <TableHead>报销余额</TableHead>
                      <TableHead>净余额</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {employeeWallets.map((wallet) => (
                      <TableRow key={wallet.employeeId}>
                        <TableCell>{wallet.employeeName}</TableCell>
                        <TableCell>¥{wallet.frozenSalary.toLocaleString()}</TableCell>
                        <TableCell>¥{wallet.availableSalary.toLocaleString()}</TableCell>
                        <TableCell className="text-red-600">-¥{wallet.advanceDebt.toLocaleString()}</TableCell>
                        <TableCell>¥{wallet.reimbursementBalance.toLocaleString()}</TableCell>
                        <TableCell className="font-bold">
                          ¥{(wallet.availableSalary + wallet.reimbursementBalance - wallet.advanceDebt).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}