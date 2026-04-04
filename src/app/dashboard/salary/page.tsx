'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DollarSign, Download, Calculator, Users, TrendingUp, Calendar, FileText } from 'lucide-react';
import { getWorkReports, getProcesses, type WorkReport, type StandardProcess } from '@/types/workshop';
import { getEmployees, type Employee } from '@/types/employee';

interface SalaryRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  team: string;
  period: string;
  totalPieces: number;
  totalAmount: number;
  baseSalary: number;
  subsidy: number;
  bonus: number;
  deduction: number;
  finalAmount: number;
  status: '待确认' | '已确认' | '已发放';
  createdAt: string;
}

export default function SalaryPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('records');
  const [workReports, setWorkReports] = useState<WorkReport[]>([]);
  const [processes, setProcesses] = useState<StandardProcess[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [salaryRecords, setSalaryRecords] = useState<SalaryRecord[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [selectedEmployee, setSelectedEmployee] = useState<string>('all');
  const [showSettleDialog, setShowSettleDialog] = useState(false);
  const [settleEmployee, setSettleEmployee] = useState<string>('');

  useEffect(() => {
    setWorkReports(getWorkReports().filter(r => r.status === '已审核'));
    setProcesses(getProcesses());
    setEmployees(getEmployees());
    loadSalaryRecords();
  }, []);

  const loadSalaryRecords = () => {
    const stored = localStorage.getItem('erp_salary_records');
    if (stored) {
      setSalaryRecords(JSON.parse(stored));
    }
  };

  const saveSalaryRecords = (records: SalaryRecord[]) => {
    localStorage.setItem('erp_salary_records', JSON.stringify(records));
    setSalaryRecords(records);
  };

  // 计算员工工资统计
  const getEmployeeSalaryStats = () => {
    const stats: Record<string, {
      employeeName: string;
      team: string;
      totalPieces: number;
      totalAmount: number;
      reworkCount: number;
    }> = {};

    const filteredReports = workReports.filter(r => {
      const reportMonth = r.createdAt?.slice(0, 7);
      return reportMonth === selectedMonth;
    });

    filteredReports.forEach(report => {
      if (!stats[report.worker]) {
        stats[report.worker] = {
          employeeName: report.worker,
          team: report.team,
          totalPieces: 0,
          totalAmount: 0,
          reworkCount: 0,
        };
      }
      stats[report.worker].totalPieces += report.goodQuantity;
      stats[report.worker].totalAmount += report.pieceWage;
      stats[report.worker].reworkCount += report.reworkQuantity;
    });

    return Object.values(stats);
  };

  // 获取工序工资统计
  const getProcessSalaryStats = () => {
    const stats: Record<string, {
      processName: string;
      processCode: string;
      totalPieces: number;
      totalAmount: number;
      workerCount: number;
    }> = {};

    const filteredReports = workReports.filter(r => {
      const reportMonth = r.createdAt?.slice(0, 7);
      return reportMonth === selectedMonth;
    });

    filteredReports.forEach(report => {
      if (!stats[report.processCode]) {
        stats[report.processCode] = {
          processName: report.processName,
          processCode: report.processCode,
          totalPieces: 0,
          totalAmount: 0,
          workerCount: 0,
        };
      }
      stats[report.processCode].totalPieces += report.goodQuantity;
      stats[report.processCode].totalAmount += report.pieceWage;
      stats[report.processCode].workerCount += 1;
    });

    return Object.values(stats);
  };

  // 计算总工资
  const getTotalSalary = () => {
    const stats = getEmployeeSalaryStats();
    return stats.reduce((sum, s) => sum + s.totalAmount, 0);
  };

  // 生成工资结算
  const handleSettleSalary = () => {
    if (!settleEmployee) return;

    const employee = employees.find(e => e.id === settleEmployee);
    const stats = getEmployeeSalaryStats().find(s => s.employeeName === employee?.name);

    if (!employee) {
      alert('未找到员工信息');
      return;
    }

    const baseSalary = employee.baseWage || 0;
    const subsidy = employee.subsidy || 0;
    // 如果没有报工记录，计件金额为0
    const pieceAmount = stats?.totalAmount || 0;
    const totalPieces = stats?.totalPieces || 0;
    const bonus = 0;
    const deduction = 0;
    const finalAmount = pieceAmount + (baseSalary / 22) + subsidy + bonus - deduction;

    const record: SalaryRecord = {
      id: `SAL${Date.now()}`,
      employeeId: employee.id,
      employeeName: employee.name,
      team: employee.teamName || '',
      period: selectedMonth,
      totalPieces: totalPieces,
      totalAmount: pieceAmount,
      baseSalary: baseSalary / 22,
      subsidy,
      bonus,
      deduction,
      finalAmount,
      status: '待确认',
      createdAt: new Date().toLocaleString('zh-CN'),
    };

    saveSalaryRecords([...salaryRecords, record]);
    setShowSettleDialog(false);
    setSettleEmployee('');
  };

  // 确认工资
  const handleConfirmSalary = (recordId: string) => {
    const records = salaryRecords.map(r => 
      r.id === recordId ? { ...r, status: '已确认' as const } : r
    );
    saveSalaryRecords(records);
  };

  // 发放工资
  const handlePaySalary = (recordId: string) => {
    const records = salaryRecords.map(r => 
      r.id === recordId ? { ...r, status: '已发放' as const } : r
    );
    saveSalaryRecords(records);
  };

  // 导出工资表
  const handleExport = () => {
    const stats = getEmployeeSalaryStats();
    const headers = ['员工姓名', '班组', '计件数量', '计件金额', '返工数量', '月份'];
    const rows = stats.map(s => [
      s.employeeName,
      s.team,
      s.totalPieces.toString(),
      s.totalAmount.toFixed(2),
      s.reworkCount.toString(),
      selectedMonth
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `工资表_${selectedMonth}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const employeeStats = getEmployeeSalaryStats();
  const processStats = getProcessSalaryStats();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* 页面标题 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <DollarSign className="w-6 h-6" />
              计件工资管理
            </h1>
            <p className="text-muted-foreground mt-1">管理员工计件工资、结算发放</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              导出报表
            </Button>
            <Button onClick={() => setShowSettleDialog(true)}>
              <Calculator className="w-4 h-4 mr-2" />
              生成工资单
            </Button>
          </div>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">本月计件总额</p>
                  <p className="text-2xl font-bold text-foreground">¥{getTotalSalary().toFixed(2)}</p>
                </div>
                <DollarSign className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">参与员工数</p>
                  <p className="text-2xl font-bold text-foreground">{employeeStats.length}</p>
                </div>
                <Users className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">计件总数量</p>
                  <p className="text-2xl font-bold text-foreground">
                    {employeeStats.reduce((sum, s) => sum + s.totalPieces, 0).toLocaleString()}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">待发放工资单</p>
                  <p className="text-2xl font-bold text-foreground">
                    {salaryRecords.filter(r => r.status !== '已发放').length}
                  </p>
                </div>
                <FileText className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 筛选条件 */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <Label>月份</Label>
                <Input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-40"
                />
              </div>
              <div className="flex items-center gap-2">
                <Label>员工</Label>
                <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="全部员工" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部员工</SelectItem>
                    {employees.map(emp => (
                      <SelectItem key={emp.id} value={emp.id}>{emp.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 标签页 */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="records">工资记录</TabsTrigger>
            <TabsTrigger value="employee">员工工资统计</TabsTrigger>
            <TabsTrigger value="process">工序工资统计</TabsTrigger>
            <TabsTrigger value="settlement">工资结算单</TabsTrigger>
          </TabsList>

          {/* 工资记录 */}
          <TabsContent value="records">
            <Card>
              <CardHeader>
                <CardTitle>报工工资明细</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>报工单号</TableHead>
                      <TableHead>员工</TableHead>
                      <TableHead>班组</TableHead>
                      <TableHead>工序</TableHead>
                      <TableHead>合格数量</TableHead>
                      <TableHead>单价</TableHead>
                      <TableHead>计件金额</TableHead>
                      <TableHead>时间</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {workReports
                      .filter(r => {
                        const month = r.createdAt?.slice(0, 7);
                        if (month !== selectedMonth) return false;
                        if (selectedEmployee !== 'all') {
                          const emp = employees.find(e => e.id === selectedEmployee);
                          if (emp && r.worker !== emp.name) return false;
                        }
                        return true;
                      })
                      .map(report => (
                        <TableRow key={report.id}>
                          <TableCell className="font-mono">{report.reportNo}</TableCell>
                          <TableCell>{report.worker}</TableCell>
                          <TableCell>{report.team}</TableCell>
                          <TableCell>{report.processName}</TableCell>
                          <TableCell>{report.goodQuantity}</TableCell>
                          <TableCell>¥{report.processPrice.toFixed(2)}</TableCell>
                          <TableCell className="font-medium text-green-600">¥{report.pieceWage.toFixed(2)}</TableCell>
                          <TableCell className="text-muted-foreground">{report.createdAt}</TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 员工工资统计 */}
          <TabsContent value="employee">
            <Card>
              <CardHeader>
                <CardTitle>员工工资统计</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>员工姓名</TableHead>
                      <TableHead>班组</TableHead>
                      <TableHead>计件数量</TableHead>
                      <TableHead>计件金额</TableHead>
                      <TableHead>返工数量</TableHead>
                      <TableHead>平均单价</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {employeeStats.map((stat, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{stat.employeeName}</TableCell>
                        <TableCell>{stat.team}</TableCell>
                        <TableCell>{stat.totalPieces.toLocaleString()}</TableCell>
                        <TableCell className="text-green-600 font-medium">¥{stat.totalAmount.toFixed(2)}</TableCell>
                        <TableCell>{stat.reworkCount}</TableCell>
                        <TableCell>
                          ¥{stat.totalPieces > 0 ? (stat.totalAmount / stat.totalPieces).toFixed(2) : '0.00'}
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="bg-muted/50 font-bold">
                      <TableCell>合计</TableCell>
                      <TableCell>-</TableCell>
                      <TableCell>{employeeStats.reduce((sum, s) => sum + s.totalPieces, 0).toLocaleString()}</TableCell>
                      <TableCell className="text-green-600">¥{getTotalSalary().toFixed(2)}</TableCell>
                      <TableCell>{employeeStats.reduce((sum, s) => sum + s.reworkCount, 0)}</TableCell>
                      <TableCell>-</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 工序工资统计 */}
          <TabsContent value="process">
            <Card>
              <CardHeader>
                <CardTitle>工序工资统计</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>工序编码</TableHead>
                      <TableHead>工序名称</TableHead>
                      <TableHead>完成数量</TableHead>
                      <TableHead>工资总额</TableHead>
                      <TableHead>参与人数</TableHead>
                      <TableHead>人均金额</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {processStats.map((stat, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-mono">{stat.processCode}</TableCell>
                        <TableCell>{stat.processName}</TableCell>
                        <TableCell>{stat.totalPieces.toLocaleString()}</TableCell>
                        <TableCell className="text-green-600 font-medium">¥{stat.totalAmount.toFixed(2)}</TableCell>
                        <TableCell>{stat.workerCount}</TableCell>
                        <TableCell>
                          ¥{stat.workerCount > 0 ? (stat.totalAmount / stat.workerCount).toFixed(2) : '0.00'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 工资结算单 */}
          <TabsContent value="settlement">
            <Card>
              <CardHeader>
                <CardTitle>工资结算单</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>员工姓名</TableHead>
                      <TableHead>班组</TableHead>
                      <TableHead>期间</TableHead>
                      <TableHead>计件数量</TableHead>
                      <TableHead>计件金额</TableHead>
                      <TableHead>补贴</TableHead>
                      <TableHead>应发金额</TableHead>
                      <TableHead>状态</TableHead>
                      <TableHead>操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {salaryRecords.map(record => (
                      <TableRow key={record.id}>
                        <TableCell className="font-medium">{record.employeeName}</TableCell>
                        <TableCell>{record.team}</TableCell>
                        <TableCell>{record.period}</TableCell>
                        <TableCell>{record.totalPieces}</TableCell>
                        <TableCell>¥{record.totalAmount.toFixed(2)}</TableCell>
                        <TableCell>¥{record.subsidy.toFixed(2)}</TableCell>
                        <TableCell className="text-green-600 font-bold">¥{record.finalAmount.toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge variant={
                            record.status === '已发放' ? 'default' :
                            record.status === '已确认' ? 'secondary' : 'outline'
                          }>
                            {record.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {record.status === '待确认' && (
                              <Button size="sm" variant="outline" onClick={() => handleConfirmSalary(record.id)}>
                                确认
                              </Button>
                            )}
                            {record.status === '已确认' && (
                              <Button size="sm" onClick={() => handlePaySalary(record.id)}>
                                发放
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {salaryRecords.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                          暂无工资结算单，请点击"生成工资单"按钮创建
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* 生成工资单对话框 */}
        <Dialog open={showSettleDialog} onOpenChange={setShowSettleDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>生成工资结算单</DialogTitle>
              <DialogDescription>选择员工生成本月工资结算单</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>选择员工</Label>
                <Select value={settleEmployee} onValueChange={setSettleEmployee}>
                  <SelectTrigger>
                    <SelectValue placeholder="请选择员工" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map(emp => (
                      <SelectItem key={emp.id} value={emp.id}>{emp.name} - {emp.teamName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>结算月份</Label>
                <Input value={selectedMonth} readOnly />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowSettleDialog(false)}>取消</Button>
              <Button onClick={handleSettleSalary} disabled={!settleEmployee}>确认生成</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
