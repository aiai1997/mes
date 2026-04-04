'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Database, TrendingUp, TrendingDown, Package, Users, DollarSign, 
  ShoppingCart, Truck, AlertTriangle, CheckCircle, Clock, BarChart3,
  PieChart, Activity, Zap, Target, Award
} from 'lucide-react';
import { getDataCenterReports, type DataCenterReport } from '@/types/production-advanced-2';

export default function DataCenterPage() {
  const [reports, setReports] = useState<DataCenterReport[]>([]);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => { setReports(getDataCenterReports()); }, []);

  const kpiData = [
    { label: '本月订单', value: '156', change: '+12%', icon: ShoppingCart, color: 'text-blue-600', bgColor: 'bg-blue-100' },
    { label: '生产产值', value: '¥2,345,678', change: '+8%', icon: DollarSign, color: 'text-green-600', bgColor: 'bg-green-100' },
    { label: '入库数量', value: '45,678', change: '+15%', icon: Package, color: 'text-purple-600', bgColor: 'bg-purple-100' },
    { label: '合格率', value: '98.5%', change: '+0.3%', icon: CheckCircle, color: 'text-emerald-600', bgColor: 'bg-emerald-100' },
  ];

  const alertData = [
    { type: 'warning', message: '订单ORD-2024-001交期紧迫，剩余3天', count: 5 },
    { type: 'error', message: '面料库存不足，请及时采购', count: 3 },
    { type: 'info', message: '外协加工即将完成', count: 8 },
  ];

  const chartData = {
    ordersByMonth: [120, 135, 156, 142, 178, 165],
    productionByWorkshop: [
      { name: '裁床', value: 12500 },
      { name: '缝制', value: 32000 },
      { name: '整烫', value: 18000 },
      { name: '包装', value: 15000 },
    ],
  };

  const topProducts = [
    { rank: 1, styleNo: 'TS-2024-001', name: '纯棉T恤', quantity: 12000, amount: 360000 },
    { rank: 2, styleNo: 'JK-2024-003', name: '休闲夹克', quantity: 8000, amount: 480000 },
    { rank: 3, styleNo: 'PT-2024-002', name: '运动长裤', quantity: 10000, amount: 400000 },
    { rank: 4, styleNo: 'DR-2024-005', name: '连衣裙', quantity: 6000, amount: 300000 },
    { rank: 5, styleNo: 'SS-2024-008', name: '衬衫', quantity: 7500, amount: 225000 },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-full mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <Database className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">大数据中心报表中心</h1>
              <p className="text-muted-foreground text-sm">企业运营数据全景展示与分析</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">导出报告</Button>
            <Button>刷新数据</Button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {kpiData.map((kpi, i) => (
            <Card key={i}>
              <CardContent className="p-4 flex items-center gap-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${kpi.bgColor}`}>
                  <kpi.icon className={`w-6 h-6 ${kpi.color}`} />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">{kpi.label}</p>
                  <div className="flex items-end gap-2">
                    <p className="text-2xl font-bold">{kpi.value}</p>
                    <span className={`text-sm ${kpi.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                      {kpi.change}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="md:col-span-2">
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><TrendingUp className="w-5 h-5 text-blue-600" />月度订单趋势</CardTitle></CardHeader>
            <CardContent className="h-48">
              <div className="h-full flex items-end gap-2">
                {chartData.ordersByMonth.map((val, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full bg-blue-500 rounded-t" style={{ height: `${(val / 200) * 100}%` }}></div>
                    <span className="text-xs text-muted-foreground">{i + 1}月</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-yellow-600" />预警提醒</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {alertData.map((alert, i) => (
                <div key={i} className={`p-2 rounded text-sm ${alert.type === 'error' ? 'bg-red-50 text-red-700' : alert.type === 'warning' ? 'bg-yellow-50 text-yellow-700' : 'bg-blue-50 text-blue-700'}`}>
                  <div className="flex justify-between items-center">
                    <span>{alert.message}</span>
                    <Badge className={alert.type === 'error' ? 'bg-red-100 text-red-700' : alert.type === 'warning' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'}>{alert.count}</Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><PieChart className="w-5 h-5 text-purple-600" />车间产量分布</CardTitle></CardHeader>
            <CardContent className="h-48 flex items-center justify-center">
              <div className="grid grid-cols-2 gap-4 w-full">
                {chartData.productionByWorkshop.map((ws, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded ${['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500'][i]}`}></div>
                    <div>
                      <p className="text-sm font-medium">{ws.name}</p>
                      <p className="text-xs text-muted-foreground">{ws.value.toLocaleString()} 件</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Award className="w-5 h-5 text-yellow-600" />热销产品 TOP5</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">排名</TableHead>
                    <TableHead>款号</TableHead>
                    <TableHead className="text-right">数量</TableHead>
                    <TableHead className="text-right">金额</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topProducts.map((p) => (
                    <TableRow key={p.rank}>
                      <TableCell>
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${p.rank <= 3 ? 'bg-yellow-500 text-white' : 'bg-gray-200'}`}>
                          {p.rank}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{p.styleNo}</TableCell>
                      <TableCell className="text-right">{p.quantity.toLocaleString()}</TableCell>
                      <TableCell className="text-right">¥{p.amount.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><BarChart3 className="w-5 h-5 text-green-600" />数据报表中心</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {reports.slice(0, 12).map((r, i) => (
                <div key={i} className="p-4 border rounded-lg hover:shadow-md cursor-pointer transition-shadow">
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart3 className="w-5 h-5 text-blue-600" />
                    <span className="font-medium text-sm">{r.name}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{r.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
