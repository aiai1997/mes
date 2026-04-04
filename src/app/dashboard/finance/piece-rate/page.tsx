'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';

import { Process, PieceRateRecord, PaySlip, SalaryReport, initPieceRateData, getProcesses, saveProcess, generateProcessCode, getPieceRateRecords, savePieceRateRecord, generateRecordNo, getPaySlips, generatePaySlip, getSalaryReports, generateSalaryReport } from '@/types/piece-rate';
import { ProcessType, ProcessStatus } from '@/types/piece-rate';

// 工序管理组件
const ProcessManagement = () => {
  const [processes, setProcesses] = useState<Process[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProcess, setCurrentProcess] = useState<Process>({
    id: '',
    processCode: '',
    processName: '',
    processType: '裁床',
    unitPrice: 0,
    unit: '件',
    description: '',
    status: '启用',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  useEffect(() => {
    initPieceRateData();
    loadProcesses();
  }, []);

  const loadProcesses = () => {
    setIsLoading(true);
    setTimeout(() => {
      const loadedProcesses = getProcesses();
      setProcesses(loadedProcesses);
      setIsLoading(false);
    }, 500);
  };

  const handleAddProcess = () => {
    setCurrentProcess({
      id: '',
      processCode: generateProcessCode(),
      processName: '',
      processType: '裁床',
      unitPrice: 0,
      unit: '件',
      description: '',
      status: '启用',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    setIsModalOpen(true);
  };

  const handleEditProcess = (process: Process) => {
    setCurrentProcess({ ...process });
    setIsModalOpen(true);
  };

  const handleSaveProcess = () => {
    if (!currentProcess.processName || currentProcess.unitPrice <= 0) {
      alert('请填写完整的工序信息');
      return;
    }

    const processToSave: Process = {
      ...currentProcess,
      id: currentProcess.id || `process_${Date.now()}`,
      updatedAt: new Date().toISOString()
    };

    saveProcess(processToSave);
    loadProcesses();
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">工序管理</h2>
        <Button onClick={handleAddProcess}>添加工序</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>工序列表</CardTitle>
          <CardDescription>管理所有工序及其单价</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, index) => (
                <div key={index} className="space-y-2">
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>工序编号</TableHead>
                  <TableHead>工序名称</TableHead>
                  <TableHead>工序类型</TableHead>
                  <TableHead>单价</TableHead>
                  <TableHead>单位</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {processes.map((process) => (
                  <TableRow key={process.id}>
                    <TableCell>{process.processCode}</TableCell>
                    <TableCell>{process.processName}</TableCell>
                    <TableCell>{process.processType}</TableCell>
                    <TableCell>¥{process.unitPrice.toFixed(2)}</TableCell>
                    <TableCell>{process.unit}</TableCell>
                    <TableCell>
                      <Badge variant={process.status === '启用' ? 'default' : 'destructive'}>
                        {process.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button size="sm" onClick={() => handleEditProcess(process)}>
                        编辑
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* 工序编辑模态框 */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>{currentProcess.id ? '编辑工序' : '添加工序'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="processCode">工序编号</Label>
                <Input id="processCode" value={currentProcess.processCode} readOnly />
              </div>
              <div className="space-y-2">
                <Label htmlFor="processName">工序名称</Label>
                <Input id="processName" value={currentProcess.processName} onChange={(e) => setCurrentProcess({ ...currentProcess, processName: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="processType">工序类型</Label>
                <Select value={currentProcess.processType} onValueChange={(value) => setCurrentProcess({ ...currentProcess, processType: value as ProcessType })}>
                  <SelectTrigger id="processType">
                    <SelectValue placeholder="选择工序类型" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="裁床">裁床</SelectItem>
                    <SelectItem value="缝纫">缝纫</SelectItem>
                    <SelectItem value="锁边">锁边</SelectItem>
                    <SelectItem value="整烫">整烫</SelectItem>
                    <SelectItem value="包装">包装</SelectItem>
                    <SelectItem value="检验">检验</SelectItem>
                    <SelectItem value="其他">其他</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="unitPrice">单价</Label>
                <Input id="unitPrice" type="number" step="0.01" value={currentProcess.unitPrice} onChange={(e) => setCurrentProcess({ ...currentProcess, unitPrice: parseFloat(e.target.value) || 0 })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit">单位</Label>
                <Input id="unit" value={currentProcess.unit} onChange={(e) => setCurrentProcess({ ...currentProcess, unit: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">描述</Label>
                <Input id="description" value={currentProcess.description} onChange={(e) => setCurrentProcess({ ...currentProcess, description: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">状态</Label>
                <Select value={currentProcess.status} onValueChange={(value) => setCurrentProcess({ ...currentProcess, status: value as ProcessStatus })}>
                  <SelectTrigger id="status">
                    <SelectValue placeholder="选择状态" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="启用">启用</SelectItem>
                    <SelectItem value="禁用">禁用</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                  取消
                </Button>
                <Button onClick={handleSaveProcess}>
                  保存
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

// 计件记录组件
const PieceRateRecords = () => {
  const [records, setRecords] = useState<PieceRateRecord[]>([]);
  const [processes, setProcesses] = useState<Process[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<PieceRateRecord>({
    id: '',
    recordNo: '',
    employeeId: '',
    employeeName: '',
    processId: '',
    processName: '',
    processCode: '',
    quantity: 0,
    unitPrice: 0,
    amount: 0,
    workDate: new Date().toISOString().split('T')[0],
    workTime: 8,
    isOvertime: false,
    overtimeMultiplier: 1,
    remarks: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
  const [selectedPeriod, setSelectedPeriod] = useState(new Date().toISOString().slice(0, 7));

  useEffect(() => {
    loadData();
  }, [selectedPeriod]);

  const loadData = () => {
    setIsLoading(true);
    setTimeout(() => {
      const loadedProcesses = getProcesses();
      const loadedRecords = getPieceRateRecords(undefined, selectedPeriod);
      setProcesses(loadedProcesses);
      setRecords(loadedRecords);
      setIsLoading(false);
    }, 500);
  };

  const handleAddRecord = () => {
    setCurrentRecord({
      id: '',
      recordNo: generateRecordNo(),
      employeeId: '',
      employeeName: '',
      processId: '',
      processName: '',
      processCode: '',
      quantity: 0,
      unitPrice: 0,
      amount: 0,
      workDate: new Date().toISOString().split('T')[0],
      workTime: 8,
      isOvertime: false,
      overtimeMultiplier: 1,
      remarks: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    setIsModalOpen(true);
  };

  const handleProcessChange = (processId: string) => {
    const process = processes.find(p => p.id === processId);
    if (process) {
      setCurrentRecord({
        ...currentRecord,
        processId,
        processName: process.processName,
        processCode: process.processCode,
        unitPrice: process.unitPrice,
        amount: currentRecord.quantity * process.unitPrice
      });
    }
  };

  const handleQuantityChange = (quantity: number) => {
    setCurrentRecord({
      ...currentRecord,
      quantity,
      amount: quantity * currentRecord.unitPrice
    });
  };

  const handleSaveRecord = () => {
    if (!currentRecord.employeeId || !currentRecord.employeeName || !currentRecord.processId || currentRecord.quantity <= 0) {
      alert('请填写完整的计件记录信息');
      return;
    }

    const recordToSave: PieceRateRecord = {
      ...currentRecord,
      id: currentRecord.id || `record_${Date.now()}`,
      updatedAt: new Date().toISOString()
    };

    savePieceRateRecord(recordToSave);
    loadData();
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">计件记录</h2>
        <div className="flex space-x-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="选择月份" />
            </SelectTrigger>
            <SelectContent>
              {[...Array(12)].map((_, index) => {
                const date = new Date();
                date.setMonth(date.getMonth() - index);
                const period = date.toISOString().slice(0, 7);
                return <SelectItem key={period} value={period}>{period}</SelectItem>;
              })}
            </SelectContent>
          </Select>
          <Button onClick={handleAddRecord}>添加记录</Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>计件记录列表</CardTitle>
          <CardDescription>管理工人的计件记录</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, index) => (
                <div key={index} className="space-y-2">
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>记录编号</TableHead>
                  <TableHead>员工姓名</TableHead>
                  <TableHead>工序名称</TableHead>
                  <TableHead>数量</TableHead>
                  <TableHead>单价</TableHead>
                  <TableHead>金额</TableHead>
                  <TableHead>工作日期</TableHead>
                  <TableHead>是否加班</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>{record.recordNo}</TableCell>
                    <TableCell>{record.employeeName}</TableCell>
                    <TableCell>{record.processName}</TableCell>
                    <TableCell>{record.quantity}</TableCell>
                    <TableCell>¥{record.unitPrice.toFixed(2)}</TableCell>
                    <TableCell>¥{record.amount.toFixed(2)}</TableCell>
                    <TableCell>{record.workDate}</TableCell>
                    <TableCell>
                      <Badge variant={record.isOvertime ? 'default' : 'secondary'}>
                        {record.isOvertime ? '是' : '否'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* 计件记录编辑模态框 */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>{currentRecord.id ? '编辑计件记录' : '添加计件记录'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="recordNo">记录编号</Label>
                <Input id="recordNo" value={currentRecord.recordNo} readOnly />
              </div>
              <div className="space-y-2">
                <Label htmlFor="employeeId">员工ID</Label>
                <Input id="employeeId" value={currentRecord.employeeId} onChange={(e) => setCurrentRecord({ ...currentRecord, employeeId: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="employeeName">员工姓名</Label>
                <Input id="employeeName" value={currentRecord.employeeName} onChange={(e) => setCurrentRecord({ ...currentRecord, employeeName: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="processId">工序</Label>
                <Select value={currentRecord.processId} onValueChange={handleProcessChange}>
                  <SelectTrigger id="processId">
                    <SelectValue placeholder="选择工序" />
                  </SelectTrigger>
                  <SelectContent>
                    {processes.map((process) => (
                      <SelectItem key={process.id} value={process.id}>
                        {process.processName} (¥{process.unitPrice.toFixed(2)}/{process.unit})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantity">数量</Label>
                <Input id="quantity" type="number" step="1" value={currentRecord.quantity} onChange={(e) => handleQuantityChange(parseFloat(e.target.value) || 0)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unitPrice">单价</Label>
                <Input id="unitPrice" type="number" step="0.01" value={currentRecord.unitPrice} readOnly />
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">金额</Label>
                <Input id="amount" type="number" step="0.01" value={currentRecord.amount} readOnly />
              </div>
              <div className="space-y-2">
                <Label htmlFor="workDate">工作日期</Label>
                <Input id="workDate" type="date" value={currentRecord.workDate} onChange={(e) => setCurrentRecord({ ...currentRecord, workDate: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="workTime">工作时间（小时）</Label>
                <Input id="workTime" type="number" step="0.5" value={currentRecord.workTime} onChange={(e) => setCurrentRecord({ ...currentRecord, workTime: parseFloat(e.target.value) || 0 })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="isOvertime">是否加班</Label>
                <Select value={currentRecord.isOvertime ? 'true' : 'false'} onValueChange={(value) => setCurrentRecord({ ...currentRecord, isOvertime: value === 'true' })}>
                  <SelectTrigger id="isOvertime">
                    <SelectValue placeholder="选择是否加班" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">是</SelectItem>
                    <SelectItem value="false">否</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {currentRecord.isOvertime && (
                <div className="space-y-2">
                  <Label htmlFor="overtimeMultiplier">加班倍数</Label>
                  <Select value={currentRecord.overtimeMultiplier.toString()} onValueChange={(value) => setCurrentRecord({ ...currentRecord, overtimeMultiplier: parseFloat(value) })}>
                    <SelectTrigger id="overtimeMultiplier">
                      <SelectValue placeholder="选择加班倍数" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1.5">1.5倍</SelectItem>
                      <SelectItem value="2">2倍</SelectItem>
                      <SelectItem value="3">3倍</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="remarks">备注</Label>
                <Input id="remarks" value={currentRecord.remarks} onChange={(e) => setCurrentRecord({ ...currentRecord, remarks: e.target.value })} />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                  取消
                </Button>
                <Button onClick={handleSaveRecord}>
                  保存
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

// 工资条组件
const PaySlips = () => {
  const [paySlips, setPaySlips] = useState<PaySlip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState(new Date().toISOString().slice(0, 7));

  useEffect(() => {
    loadPaySlips();
  }, [selectedPeriod]);

  const loadPaySlips = () => {
    setIsLoading(true);
    setTimeout(() => {
      const loadedPaySlips = getPaySlips(undefined, selectedPeriod);
      setPaySlips(loadedPaySlips);
      setIsLoading(false);
    }, 500);
  };

  const handleGeneratePaySlip = () => {
    // 模拟生成工资条
    const testEmployee = {
      id: 'emp_1',
      name: '张三',
      department: '生产部',
      position: '缝纫工',
      basicSalary: 3000,
      bonus: 500,
      deductions: 200,
      socialSecurity: 300,
      housingFund: 200
    };

    generatePaySlip(
      testEmployee.id,
      testEmployee.name,
      testEmployee.department,
      testEmployee.position,
      selectedPeriod,
      testEmployee.basicSalary,
      testEmployee.bonus,
      testEmployee.deductions,
      testEmployee.socialSecurity,
      testEmployee.housingFund
    );

    loadPaySlips();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">工资条管理</h2>
        <div className="flex space-x-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="选择月份" />
            </SelectTrigger>
            <SelectContent>
              {[...Array(12)].map((_, index) => {
                const date = new Date();
                date.setMonth(date.getMonth() - index);
                const period = date.toISOString().slice(0, 7);
                return <SelectItem key={period} value={period}>{period}</SelectItem>;
              })}
            </SelectContent>
          </Select>
          <Button onClick={handleGeneratePaySlip}>生成工资条</Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>工资条列表</CardTitle>
          <CardDescription>管理员工的工资条</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, index) => (
                <div key={index} className="space-y-2">
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>工资条编号</TableHead>
                  <TableHead>员工姓名</TableHead>
                  <TableHead>部门</TableHead>
                  <TableHead>基本工资</TableHead>
                  <TableHead>计件工资</TableHead>
                  <TableHead>实发工资</TableHead>
                  <TableHead>状态</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paySlips.map((paySlip) => (
                  <TableRow key={paySlip.id}>
                    <TableCell>{paySlip.paySlipNo}</TableCell>
                    <TableCell>{paySlip.employeeName}</TableCell>
                    <TableCell>{paySlip.department}</TableCell>
                    <TableCell>¥{paySlip.basicSalary.toFixed(2)}</TableCell>
                    <TableCell>¥{paySlip.pieceRateSalary.toFixed(2)}</TableCell>
                    <TableCell>¥{paySlip.netSalary.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge variant={paySlip.status === '已发放' ? 'default' : paySlip.status === '已审核' ? 'secondary' : 'destructive'}>
                        {paySlip.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// 工资报表组件
const SalaryReports = () => {
  const [reports, setReports] = useState<SalaryReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState(new Date().toISOString().slice(0, 7));

  useEffect(() => {
    loadReports();
  }, [selectedPeriod]);

  const loadReports = () => {
    setIsLoading(true);
    setTimeout(() => {
      const loadedReports = getSalaryReports(selectedPeriod);
      setReports(loadedReports);
      setIsLoading(false);
    }, 500);
  };

  const handleGenerateReport = () => {
    // 模拟生成工资报表
    const testEmployees = [
      {
        id: 'emp_1',
        name: '张三',
        department: '生产部',
        position: '缝纫工',
        basicSalary: 3000,
        bonus: 500,
        deductions: 200,
        socialSecurity: 300,
        housingFund: 200
      },
      {
        id: 'emp_2',
        name: '李四',
        department: '生产部',
        position: '裁床工',
        basicSalary: 3500,
        bonus: 600,
        deductions: 150,
        socialSecurity: 350,
        housingFund: 250
      },
      {
        id: 'emp_3',
        name: '王五',
        department: '生产部',
        position: '整烫工',
        basicSalary: 2800,
        bonus: 400,
        deductions: 100,
        socialSecurity: 280,
        housingFund: 180
      }
    ];

    generateSalaryReport(selectedPeriod, testEmployees);
    loadReports();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">工资报表</h2>
        <div className="flex space-x-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="选择月份" />
            </SelectTrigger>
            <SelectContent>
              {[...Array(12)].map((_, index) => {
                const date = new Date();
                date.setMonth(date.getMonth() - index);
                const period = date.toISOString().slice(0, 7);
                return <SelectItem key={period} value={period}>{period}</SelectItem>;
              })}
            </SelectContent>
          </Select>
          <Button onClick={handleGenerateReport}>生成报表</Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>工资报表列表</CardTitle>
          <CardDescription>查看工资报表汇总</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, index) => (
                <div key={index} className="space-y-2">
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>报表编号</TableHead>
                  <TableHead>报表周期</TableHead>
                  <TableHead>员工总数</TableHead>
                  <TableHead>基本工资总额</TableHead>
                  <TableHead>计件工资总额</TableHead>
                  <TableHead>实发工资总额</TableHead>
                  <TableHead>状态</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell>{report.reportNo}</TableCell>
                    <TableCell>{report.period}</TableCell>
                    <TableCell>{report.totalEmployees}</TableCell>
                    <TableCell>¥{report.totalBasicSalary.toFixed(2)}</TableCell>
                    <TableCell>¥{report.totalPieceRateSalary.toFixed(2)}</TableCell>
                    <TableCell>¥{report.totalNetSalary.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge variant={report.status === '已审核' ? 'default' : report.status === '已生成' ? 'secondary' : 'destructive'}>
                        {report.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// 主页面组件
const PieceRatePage = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">计件工资系统</h1>
          <p className="text-gray-500">管理工序、计件记录、工资条和报表</p>
        </div>
      </div>

      <Tabs defaultValue="processes">
        <TabsList>
          <TabsTrigger value="processes">工序管理</TabsTrigger>
          <TabsTrigger value="records">计件记录</TabsTrigger>
          <TabsTrigger value="payslips">工资条</TabsTrigger>
          <TabsTrigger value="reports">工资报表</TabsTrigger>
        </TabsList>
        <TabsContent value="processes">
          <ProcessManagement />
        </TabsContent>
        <TabsContent value="records">
          <PieceRateRecords />
        </TabsContent>
        <TabsContent value="payslips">
          <PaySlips />
        </TabsContent>
        <TabsContent value="reports">
          <SalaryReports />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PieceRatePage;
