'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Activity,
  Package,
  Scissors,
  Users,
  AlertTriangle,
  TrendingUp,
  Clock,
  DollarSign,
} from 'lucide-react';
import { getOrders } from '@/types/order';

export default function DashboardPage() {
  const [orderStats, setOrderStats] = useState({
    total: 0,
    inProduction: 0,
    completed: 0,
    delayed: 0,
  });
  
  const [productionStats, setProductionStats] = useState([
    { line: '裁床线A', target: 500, actual: 480, rate: 96 },
    { line: '裁床线B', target: 400, actual: 420, rate: 105 },
    { line: '缝制线1', target: 300, actual: 280, rate: 93 },
    { line: '缝制线2', target: 300, actual: 320, rate: 107 },
    { line: '缝制线3', target: 300, actual: 290, rate: 97 },
    { line: '尾部组', target: 400, actual: 380, rate: 95 },
  ]);
  
  const [orderProgress, setOrderProgress] = useState([
    { orderNo: 'ORD-2024-001', style: 'T恤-白色-S', total: 1000, completed: 850, rate: 85 },
    { orderNo: 'ORD-2024-002', style: '连衣裙-蓝色-M', total: 500, completed: 300, rate: 60 },
    { orderNo: 'ORD-2024-003', style: '外套-黑色-L', total: 300, completed: 180, rate: 60 },
  ]);
  
  const [inventoryAlerts, setInventoryAlerts] = useState([
    { name: '白色棉布', stock: 50, min: 200, unit: '米' },
    { name: '黑色拉链', stock: 100, min: 500, unit: '条' },
    { name: '蓝色纽扣', stock: 30, min: 100, unit: '颗' },
  ]);
  
  useEffect(() => {
    const orders = getOrders();
    const stats = {
      total: orders.length,
      inProduction: orders.filter(o => o.status === '生产中').length,
      completed: orders.filter(o => o.status === '已完成').length,
      delayed: orders.filter(o => o.status === '已审核').length,
    };
    setOrderStats(stats);
  }, []);

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 p-6">
        <div className="max-w-full mx-auto space-y-6">
          {/* 头部标题 */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-primary rounded-xl flex items-center justify-center shadow-lg">
              <Activity className="w-7 h-7 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">生产看板大屏</h1>
              <p className="text-muted-foreground text-sm">实时监控订单进度、生产线产量、库存预警</p>
            </div>
            <div className="ml-auto text-right">
              <p className="text-2xl font-bold text-foreground">{new Date().toLocaleDateString('zh-CN')}</p>
              <p className="text-muted-foreground">{new Date().toLocaleTimeString('zh-CN')}</p>
            </div>
          </div>
          
          {/* 核心指标卡片 */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card className="border-l-4 border-l-blue-500 shadow-lg">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">订单总数</p>
                    <p className="text-4xl font-bold text-foreground mt-1">{orderStats.total}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                    <Package className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-l-4 border-l-orange-500 shadow-lg">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">生产中</p>
                    <p className="text-4xl font-bold text-orange-600 mt-1">{orderStats.inProduction}</p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center">
                    <Activity className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-l-4 border-l-green-500 shadow-lg">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">已完成</p>
                    <p className="text-4xl font-bold text-green-600 mt-1">{orderStats.completed}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-l-4 border-l-red-500 shadow-lg">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">延期订单</p>
                    <p className="text-4xl font-bold text-red-600 mt-1">{orderStats.delayed}</p>
                  </div>
                  <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                    <Clock className="w-6 h-6 text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-l-4 border-l-purple-500 shadow-lg">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">今日产量</p>
                    <p className="text-4xl font-bold text-purple-600 mt-1">2,170</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                    <Scissors className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* 两列布局 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 订单进度 */}
            <Card className="shadow-lg">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                  <Package className="w-5 h-5 text-primary" />
                  订单生产进度
                </h3>
                <div className="space-y-4">
                  {orderProgress.map((order, idx) => (
                    <div key={idx} className="border rounded-lg p-4 bg-muted/30">
                      <div className="flex justify-between items-center mb-2">
                        <div>
                          <span className="font-medium text-foreground">{order.orderNo}</span>
                          <span className="text-muted-foreground text-sm ml-2">{order.style}</span>
                        </div>
                        <span className="text-lg font-bold text-primary">{order.rate}%</span>
                      </div>
                      <Progress value={order.rate} className="h-3" />
                      <div className="flex justify-between text-sm text-muted-foreground mt-2">
                        <span>已完成: {order.completed}</span>
                        <span>总数: {order.total}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            {/* 生产线产量 */}
            <Card className="shadow-lg">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" />
                  生产线实时产量
                </h3>
                <div className="space-y-3">
                  {productionStats.map((line, idx) => (
                    <div key={idx} className="flex items-center gap-4 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                      <div className="w-28 font-medium text-foreground">{line.line}</div>
                      <div className="flex-1">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-muted-foreground">目标: {line.target} | 实际: {line.actual}</span>
                          <span className={line.rate >= 100 ? 'text-green-600 font-bold' : 'text-orange-600 font-bold'}>
                            {line.rate}%
                          </span>
                        </div>
                        <Progress value={Math.min(line.rate, 100)} className="h-2" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* 底部两列 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 库存预警 */}
            <Card className="shadow-lg">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  库存预警
                </h3>
                <div className="space-y-3">
                  {inventoryAlerts.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-900 rounded-lg">
                      <div className="flex items-center gap-3">
                        <AlertTriangle className="w-5 h-5 text-red-500" />
                        <div>
                          <p className="font-medium text-foreground">{item.name}</p>
                          <p className="text-sm text-muted-foreground">库存: {item.stock} {item.unit} | 最低库存: {item.min} {item.unit}</p>
                        </div>
                      </div>
                      <div className="text-red-600 font-bold">
                        {Math.round((item.stock / item.min) * 100)}%
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            {/* 今日动态 */}
            <Card className="shadow-lg">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  今日动态
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-950 border-l-4 border-green-500">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div>
                      <p className="font-medium text-foreground">订单 ORD-2024-004 完成生产</p>
                      <p className="text-sm text-muted-foreground">10:30 - 缝制线1完成最后一件成品</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-950 border-l-4 border-blue-500">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div>
                      <p className="font-medium text-foreground">新订单 ORD-2024-010 下达</p>
                      <p className="text-sm text-muted-foreground">09:15 - 客户ABC下单500件</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-950 border-l-4 border-yellow-500">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                    <div>
                      <p className="font-medium text-foreground">外协加工已回货</p>
                      <p className="text-sm text-muted-foreground">08:45 - 绣花厂回货300件</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-red-50 dark:bg-red-950 border-l-4 border-red-500">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                    <div>
                      <p className="font-medium text-foreground">物料库存不足预警</p>
                      <p className="text-sm text-muted-foreground">08:20 - 白色棉布低于安全库存</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
