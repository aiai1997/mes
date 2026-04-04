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
import { DollarSign, CreditCard, Wallet, Users, Download, Eye, Calculator } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  type OrderCost,
  type Payable,
  type Receivable,
  type EmployeeSalary,
  type PaymentStatus,
  type ReceiptStatus,
  getOrderCosts,
  getPayables,
  getReceivables,
  getSalaries,
  getFinanceSummary,
  initFinanceData,
  type FinanceSummary,
} from '@/types/finance';
import { getCurrentUser, type CurrentUser } from '@/types/user';

const paymentStatusColors: Record<PaymentStatus, string> = {
  '未付款': 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
  '部分付款': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
  '已付款': 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
};

const receiptStatusColors: Record<ReceiptStatus, string> = {
  '未收款': 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
  '部分收款': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
  '已收款': 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
};

export default function FinancePage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [orderCosts, setOrderCosts] = useState<OrderCost[]>([]);
  const [payables, setPayables] = useState<Payable[]>([]);
  const [receivables, setReceivables] = useState<Receivable[]>([]);
  const [salaries, setSalaries] = useState<EmployeeSalary[]>([]);
  const [summary, setSummary] = useState<FinanceSummary | null>(null);

  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);
    initFinanceData();
    loadData();
  }, []);

  const loadData = () => {
    setOrderCosts(getOrderCosts());
    setPayables(getPayables());
    setReceivables(getReceivables());
    setSalaries(getSalaries());
    setSummary(getFinanceSummary());
  };

  // 导出财务报表
  const handleExportReport = () => {
    // 订单成本表
    const costHeaders = ['订单号', '款号', '品名', '订单数量', '物料成本', '人工成本', '制造费用', '总生产成本', '单件成本', '销售金额', '毛利率', '状态'];
    const costRows = orderCosts.map(c => [
      c.orderNo, c.styleNo, c.productName, c.orderQuantity,
      c.materialCost, c.laborCost, c.manufacturingCost, c.totalProductionCost,
      c.pieceCost.toFixed(2), c.salesAmount, c.grossMargin.toFixed(1) + '%', c.status
    ]);
    
    // 应付账款表
    const payableHeaders = ['应付单号', '订单号', '供应商', '类别', '应付金额', '已付金额', '未付金额', '付款状态'];
    const payableRows = payables.map(p => [
      p.payableNo, p.orderNo, p.supplierName, p.category,
      p.totalAmount, p.paidAmount, p.unpaidAmount, p.paymentStatus
    ]);
    
    // 应收账款表
    const receivableHeaders = ['应收单号', '订单号', '客户', '应收金额', '已收金额', '未收金额', '收款状态'];
    const receivableRows = receivables.map(r => [
      r.receivableNo, r.orderNo, r.customerName,
      r.totalAmount, r.receivedAmount, r.unreceivedAmount, r.receiptStatus
    ]);
    
    // 员工工资表
    const salaryHeaders = ['员工姓名', '班组', '年月', '计件工资', '补贴', '扣款', '实发工资', '状态'];
    const salaryRows = salaries.map(s => [
      s.employeeName, s.team, `${s.year}年${s.month}月`,
      s.pieceWageAmount, s.subsidyAmount, s.deductionAmount, s.netSalary, s.status
    ]);
    
    // 合并所有报表
    const csvContent = [
      '财务成本报表',
      '导出时间：' + new Date().toLocaleString('zh-CN'),
      '',
      '【订单成本明细】',
      costHeaders.join(','),
      ...costRows.map(r => r.join(',')),
      '',
      '【应付账款明细】',
      payableHeaders.join(','),
      ...payableRows.map(r => r.join(',')),
      '',
      '【应收账款明细】',
      receivableHeaders.join(','),
      ...receivableRows.map(r => r.join(',')),
      '',
      '【员工工资明细】',
      salaryHeaders.join(','),
      ...salaryRows.map(r => r.join(',')),
    ].join('\n');
    
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `财务报表_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <DashboardLayout>
      <div className="max-w-full mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">财务成本</h1>
              <p className="text-muted-foreground text-sm">订单成本核算、应收应付、工资管理</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleExportReport}>
            <Download className="w-4 h-4 mr-2" />导出报表
          </Button>
        </div>

        {/* 财务汇总 */}
        {summary && (
          <div className="grid grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <CreditCard className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm">应收总额</p>
                    <p className="text-xl font-bold text-foreground">¥{summary.totalReceivable.toLocaleString()}</p>
                  </div>
                </div>
                <div className="mt-2 text-sm">
                  <span className="text-green-600">已收: ¥{summary.totalReceived.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                    <Wallet className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm">应付总额</p>
                    <p className="text-xl font-bold text-foreground">¥{summary.totalPayable.toLocaleString()}</p>
                  </div>
                </div>
                <div className="mt-2 text-sm">
                  <span className="text-green-600">已付: ¥{summary.totalPaid.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                    <Users className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm">人工成本</p>
                    <p className="text-xl font-bold text-foreground">¥{summary.totalLaborCost.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                    <Calculator className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm">材料成本</p>
                    <p className="text-xl font-bold text-foreground">¥{summary.totalMaterialCost.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <Tabs defaultValue="costs" className="space-y-4">
          <TabsList>
            <TabsTrigger value="costs">成本核算</TabsTrigger>
            <TabsTrigger value="receivables">应收管理</TabsTrigger>
            <TabsTrigger value="payables">应付管理</TabsTrigger>
            <TabsTrigger value="salaries">工资管理</TabsTrigger>
          </TabsList>

          <TabsContent value="costs">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>订单号</TableHead>
                      <TableHead>款号</TableHead>
                      <TableHead className="text-right">数量</TableHead>
                      <TableHead className="text-right">材料成本</TableHead>
                      <TableHead className="text-right">人工成本</TableHead>
                      <TableHead className="text-right">总成本</TableHead>
                      <TableHead className="text-right">单件成本</TableHead>
                      <TableHead className="text-right">毛利率</TableHead>
                      <TableHead>状态</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orderCosts.map((cost) => (
                      <TableRow key={cost.id}>
                        <TableCell className="font-medium">{cost.orderNo}</TableCell>
                        <TableCell>{cost.styleNo}</TableCell>
                        <TableCell className="text-right">{cost.orderQuantity}</TableCell>
                        <TableCell className="text-right">¥{cost.materialCost.toLocaleString()}</TableCell>
                        <TableCell className="text-right">¥{cost.laborCost.toLocaleString()}</TableCell>
                        <TableCell className="text-right font-bold">¥{cost.totalProductionCost.toLocaleString()}</TableCell>
                        <TableCell className="text-right">¥{cost.pieceCost.toFixed(2)}</TableCell>
                        <TableCell className={`text-right font-medium ${cost.grossMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {cost.grossMargin.toFixed(1)}%
                        </TableCell>
                        <TableCell>
                          <Badge className={cost.status === '已确认' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>{cost.status}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="receivables">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>编号</TableHead>
                      <TableHead>客户</TableHead>
                      <TableHead>订单号</TableHead>
                      <TableHead className="text-right">应收金额</TableHead>
                      <TableHead className="text-right">已收</TableHead>
                      <TableHead className="text-right">未收</TableHead>
                      <TableHead>状态</TableHead>
                      <TableHead className="w-20"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {receivables.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell className="font-medium">{r.receivableNo}</TableCell>
                        <TableCell>{r.customerName}</TableCell>
                        <TableCell>{r.orderNo}</TableCell>
                        <TableCell className="text-right">¥{r.totalAmount.toLocaleString()}</TableCell>
                        <TableCell className="text-right text-green-600">¥{r.receivedAmount.toLocaleString()}</TableCell>
                        <TableCell className="text-right text-red-600">¥{r.unreceivedAmount.toLocaleString()}</TableCell>
                        <TableCell><Badge className={receiptStatusColors[r.receiptStatus]}>{r.receiptStatus}</Badge></TableCell>
                        <TableCell>
                          {r.unreceivedAmount > 0 && (
                            <Button size="sm" variant="outline" onClick={() => router.push(`/dashboard/finance/receipt?id=${r.id}`)}>收款</Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payables">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>编号</TableHead>
                      <TableHead>供应商</TableHead>
                      <TableHead>类别</TableHead>
                      <TableHead className="text-right">应付金额</TableHead>
                      <TableHead className="text-right">已付</TableHead>
                      <TableHead className="text-right">未付</TableHead>
                      <TableHead>状态</TableHead>
                      <TableHead className="w-20"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payables.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell className="font-medium">{p.payableNo}</TableCell>
                        <TableCell>{p.supplierName}</TableCell>
                        <TableCell>{p.category}</TableCell>
                        <TableCell className="text-right">¥{p.totalAmount.toLocaleString()}</TableCell>
                        <TableCell className="text-right text-green-600">¥{p.paidAmount.toLocaleString()}</TableCell>
                        <TableCell className="text-right text-red-600">¥{p.unpaidAmount.toLocaleString()}</TableCell>
                        <TableCell><Badge className={paymentStatusColors[p.paymentStatus]}>{p.paymentStatus}</Badge></TableCell>
                        <TableCell>
                          {p.unpaidAmount > 0 && (
                            <Button size="sm" variant="outline" onClick={() => router.push(`/dashboard/finance/payment?id=${p.id}`)}>付款</Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="salaries">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>员工</TableHead>
                      <TableHead>班组</TableHead>
                      <TableHead>年月</TableHead>
                      <TableHead className="text-right">计件工资</TableHead>
                      <TableHead className="text-right">补贴</TableHead>
                      <TableHead className="text-right">扣款</TableHead>
                      <TableHead className="text-right">实发</TableHead>
                      <TableHead>状态</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {salaries.map((s) => (
                      <TableRow key={s.id}>
                        <TableCell>{s.employeeName}</TableCell>
                        <TableCell>{s.team}</TableCell>
                        <TableCell>{s.year}年{s.month}月</TableCell>
                        <TableCell className="text-right">¥{s.pieceWageAmount.toLocaleString()}</TableCell>
                        <TableCell className="text-right text-green-600">¥{s.subsidyAmount.toLocaleString()}</TableCell>
                        <TableCell className="text-right text-red-600">¥{s.deductionAmount.toLocaleString()}</TableCell>
                        <TableCell className="text-right font-bold text-green-600">¥{s.netSalary.toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge className={s.status === '已发放' ? 'bg-purple-100 text-purple-700' : s.status === '已审核' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>
                            {s.status}
                          </Badge>
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
