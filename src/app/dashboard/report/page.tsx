'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  Users,
  Calendar,
  Download,
} from 'lucide-react';
import { getOrders } from '@/types/order';

export default function ReportPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [orderStats, setOrderStats] = useState({
    total: 0,
    completed: 0,
    totalAmount: 0,
  });
  
  useEffect(() => {
    const orders = getOrders();
    setOrderStats({
      total: orders.length,
      completed: orders.filter(o => o.status === '已完成').length,
      totalAmount: orders.reduce((sum, o) => sum + o.amount, 0),
    });
  }, []);
  
  // 模拟报表数据
  const monthlyProduction = [
    { month: '2024-07', target: 5000, actual: 4800, rate: 96 },
    { month: '2024-08', target: 5500, actual: 5600, rate: 102 },
    { month: '2024-09', target: 6000, actual: 5900, rate: 98 },
    { month: '2024-10', target: 6500, actual: 6700, rate: 103 },
    { month: '2024-11', target: 7000, actual: 7200, rate: 103 },
    { month: '2024-12', target: 7500, actual: 0, rate: 0 },
  ];
  
  const productCost = [
    { item: '面料成本', amount: 150000, percentage: 45 },
    { item: '辅料成本', amount: 30000, percentage: 9 },
    { item: '人工成本', amount: 80000, percentage: 24 },
    { item: '外协费用', amount: 40000, percentage: 12 },
    { item: '其他费用', amount: 34000, percentage: 10 },
  ];
  
  const employeePerformance = [
    { name: '张三', team: '缝制线1', completed: 520, rate: 104 },
    { name: '李四', team: '缝制线1', completed: 490, rate: 98 },
    { name: '王五', team: '缝制线2', completed: 510, rate: 102 },
    { name: '赵六', team: '缝制线2', completed: 485, rate: 97 },
    { name: '钱七', team: '缝制线3', completed: 500, rate: 100 },
  ];

  // 导出报表
  const handleExportReport = () => {
    // 月度生产统计
    const productionHeaders = ['月份', '目标产量', '实际产量', '达成率'];
    const productionRows = monthlyProduction.map(p => [
      p.month, p.target, p.actual, p.rate + '%'
    ]);
    
    // 成本分析
    const costHeaders = ['成本项目', '金额', '占比'];
    const costRows = productCost.map(c => [
      c.item, c.amount, c.percentage + '%'
    ]);
    
    // 员工绩效
    const perfHeaders = ['员工姓名', '班组', '完成数量', '达成率'];
    const perfRows = employeePerformance.map(e => [
      e.name, e.team, e.completed, e.rate + '%'
    ]);
    
    // 合并所有报表
    const csvContent = [
      '生产报表',
      '导出时间：' + new Date().toLocaleString('zh-CN'),
      '',
      '【月度生产统计】',
      productionHeaders.join(','),
      ...productionRows.map(r => r.join(',')),
      '',
      '【成本构成分析】',
      costHeaders.join(','),
      ...costRows.map(r => r.join(',')),
      '',
      '【员工绩效统计】',
      perfHeaders.join(','),
      ...perfRows.map(r => r.join(',')),
      '',
      '【订单统计汇总】',
      `订单总数,${orderStats.total}`,
      `已完成订单,${orderStats.completed}`,
      `订单总金额,${orderStats.totalAmount}`,
    ].join('\n');
    
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `生产报表_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <DashboardLayout>
      <div className="max-w-full mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">报表中心</h1>
              <p className="text-muted-foreground text-sm">生产统计、成本分析、效率分析、绩效统计</p>
            </div>
          </div>
          <Button variant="outline" className="gap-2" onClick={handleExportReport}>
            <Download className="w-4 h-4" />导出报表
          </Button>
        </div>
        
        {/* 核心指标卡片 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">本月订单</p>
                  <p className="text-2xl font-bold text-foreground">{orderStats.total}</p>
                </div>
                <Package className="w-8 h-8 text-blue-500" />
              </div>
              <div className="flex items-center gap-1 mt-2 text-sm text-green-600">
                <TrendingUp className="w-4 h-4" />
                <span>+12%</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">本月产量</p>
                  <p className="text-2xl font-bold text-foreground">6,720</p>
                </div>
                <BarChart3 className="w-8 h-8 text-green-500" />
              </div>
              <div className="flex items-center gap-1 mt-2 text-sm text-green-600">
                <TrendingUp className="w-4 h-4" />
                <span>+8%</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">本月产值</p>
                  <p className="text-2xl font-bold text-foreground">¥{orderStats.totalAmount.toLocaleString()}</p>
                </div>
                <DollarSign className="w-8 h-8 text-purple-500" />
              </div>
              <div className="flex items-center gap-1 mt-2 text-sm text-green-600">
                <TrendingUp className="w-4 h-4" />
                <span>+15%</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">人均效率</p>
                  <p className="text-2xl font-bold text-foreground">98.5%</p>
                </div>
                <Users className="w-8 h-8 text-orange-500" />
              </div>
              <div className="flex items-center gap-1 mt-2 text-sm text-red-600">
                <TrendingDown className="w-4 h-4" />
                <span>-2%</span>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* 报表Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">生产总览</TabsTrigger>
            <TabsTrigger value="cost">成本分析</TabsTrigger>
            <TabsTrigger value="efficiency">效率分析</TabsTrigger>
            <TabsTrigger value="performance">绩效统计</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  月度产量统计
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>月份</TableHead>
                      <TableHead className="text-right">目标产量</TableHead>
                      <TableHead className="text-right">实际产量</TableHead>
                      <TableHead>完成率</TableHead>
                      <TableHead className="w-32">进度</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {monthlyProduction.map((item, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium">{item.month}</TableCell>
                        <TableCell className="text-right">{item.target.toLocaleString()}</TableCell>
                        <TableCell className="text-right">{item.actual.toLocaleString()}</TableCell>
                        <TableCell>
                          <span className={item.rate >= 100 ? 'text-green-600 font-bold' : item.rate > 0 ? 'text-orange-600' : 'text-muted-foreground'}>
                            {item.rate}%
                          </span>
                        </TableCell>
                        <TableCell>
                          <Progress value={item.rate} className="h-2" />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="cost" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">产品成本构成</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {productCost.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-4">
                      <div className="w-24 font-medium">{item.item}</div>
                      <div className="flex-1">
                        <Progress value={item.percentage} className="h-3" />
                      </div>
                      <div className="w-32 text-right">¥{item.amount.toLocaleString()}</div>
                      <div className="w-16 text-right text-muted-foreground">{item.percentage}%</div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 pt-4 border-t flex justify-between">
                  <span className="font-bold">总计</span>
                  <span className="font-bold text-lg">¥{productCost.reduce((sum, p) => sum + p.amount, 0).toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="efficiency" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">生产线效率对比</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {['裁床线A', '缝制线1', '缝制线2', '缝制线3', '尾部组'].map((line, idx) => {
                      const efficiency = [96, 102, 98, 95, 97][idx];
                      return (
                        <div key={idx} className="flex items-center gap-4">
                          <div className="w-24 font-medium">{line}</div>
                          <div className="flex-1">
                            <Progress value={Math.min(efficiency, 100)} className="h-2" />
                          </div>
                          <div className={`w-16 text-right font-bold ${efficiency >= 100 ? 'text-green-600' : 'text-orange-600'}`}>
                            {efficiency}%
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">工时分析</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>工序</TableHead>
                        <TableHead className="text-right">标准工时</TableHead>
                        <TableHead className="text-right">实际工时</TableHead>
                        <TableHead className="text-right">差异</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {[
                        { process: '裁床', standard: 2.5, actual: 2.3 },
                        { process: '缝制', standard: 15, actual: 16 },
                        { process: '整烫', standard: 3, actual: 2.8 },
                        { process: '包装', standard: 2, actual: 2.1 },
                      ].map((item, idx) => (
                        <TableRow key={idx}>
                          <TableCell>{item.process}</TableCell>
                          <TableCell className="text-right">{item.standard}分</TableCell>
                          <TableCell className="text-right">{item.actual}分</TableCell>
                          <TableCell className={`text-right ${item.actual <= item.standard ? 'text-green-600' : 'text-red-600'}`}>
                            {item.actual <= item.standard ? '-' : '+'}{(item.actual - item.standard).toFixed(1)}分
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="performance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">员工绩效排行</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>排名</TableHead>
                      <TableHead>姓名</TableHead>
                      <TableHead>班组</TableHead>
                      <TableHead className="text-right">完成件数</TableHead>
                      <TableHead className="text-right">效率</TableHead>
                      <TableHead className="w-32">表现</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {employeePerformance.sort((a, b) => b.completed - a.completed).map((emp, idx) => (
                      <TableRow key={idx}>
                        <TableCell>
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
                            idx === 0 ? 'bg-yellow-100 text-yellow-700' :
                            idx === 1 ? 'bg-gray-100 text-gray-700' :
                            idx === 2 ? 'bg-orange-100 text-orange-700' :
                            'text-muted-foreground'
                          }`}>
                            {idx + 1}
                          </span>
                        </TableCell>
                        <TableCell className="font-medium">{emp.name}</TableCell>
                        <TableCell>{emp.team}</TableCell>
                        <TableCell className="text-right">{emp.completed}</TableCell>
                        <TableCell className="text-right">
                          <span className={emp.rate >= 100 ? 'text-green-600 font-bold' : 'text-orange-600'}>
                            {emp.rate}%
                          </span>
                        </TableCell>
                        <TableCell>
                          <Progress value={emp.rate} className="h-2" />
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
