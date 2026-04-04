'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  ArrowLeft,
  Package,
  User,
  Calendar,
  Truck,
  Palette,
  Shirt,
  Scissors,
  Sparkles,
  CheckCircle,
  Clock,
  AlertTriangle,
  Play,
  Pause,
  Check,
  TrendingUp,
} from 'lucide-react';
import {
  type Order,
  type OrderProgress,
  type ProcessProgress,
  getOrders,
  getOrderProgress,
  updateProcessProgress,
  PROCESS_WEIGHTS,
} from '@/types/order';

// 工序图标和颜色
const PROCESS_CONFIG: Record<string, { icon: React.ElementType; color: string; bgColor: string }> = {
  '裁床': { icon: Scissors, color: 'text-cyan-600', bgColor: 'bg-cyan-100' },
  '缝制': { icon: Shirt, color: 'text-blue-600', bgColor: 'bg-blue-100' },
  '尾部': { icon: Sparkles, color: 'text-purple-600', bgColor: 'bg-purple-100' },
  '入库': { icon: Package, color: 'text-green-600', bgColor: 'bg-green-100' },
};

// 订单状态颜色
const statusColors: Record<string, string> = {
  '草稿': 'bg-gray-500 text-white',
  '待审核': 'bg-yellow-500 text-white',
  '已审核': 'bg-green-500 text-white',
  '已下达': 'bg-blue-500 text-white',
  '生产中': 'bg-purple-500 text-white',
  '已完成': 'bg-emerald-500 text-white',
  '已作废': 'bg-red-500 text-white',
};

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;
  
  const [order, setOrder] = useState<Order | null>(null);
  const [progress, setProgress] = useState<OrderProgress | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrderDetail();
  }, [orderId]);

  const loadOrderDetail = () => {
    setLoading(true);
    const orders = getOrders();
    const foundOrder = orders.find(o => o.id === orderId);
    
    if (foundOrder) {
      setOrder(foundOrder);
      const orderProgress = getOrderProgress(orderId);
      setProgress(orderProgress);
    }
    
    setLoading(false);
  };

  const handleUpdateProgress = (processType: '裁床' | '缝制' | '尾部' | '入库', delta: number) => {
    if (!progress) return;
    
    const process = progress.processes.find(p => p.processType === processType);
    if (!process) return;
    
    const newQuantity = Math.max(0, Math.min(process.completedQuantity + delta, process.totalQuantity));
    updateProcessProgress(orderId, processType, newQuantity);
    loadOrderDetail();
  };

  const getProgressColor = (prog: number): string => {
    if (prog >= 80) return 'bg-green-500';
    if (prog >= 50) return 'bg-blue-500';
    if (prog >= 30) return 'bg-yellow-500';
    return 'bg-gray-300';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case '已完成': return <CheckCircle className="w-4 h-4" />;
      case '进行中': return <Play className="w-4 h-4" />;
      case '已暂停': return <Pause className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-muted-foreground">加载中...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (!order) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <div className="text-muted-foreground">订单不存在</div>
          <Button variant="outline" onClick={() => router.push('/dashboard/orders')}>
            <ArrowLeft className="w-4 h-4 mr-2" />返回订单列表
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* 顶部导航 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={() => router.push('/dashboard/orders')}>
              <ArrowLeft className="w-4 h-4 mr-1" />返回
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{order.orderNo}</h1>
              <p className="text-muted-foreground">{order.productName} · {order.styleNo}</p>
            </div>
          </div>
          <Badge className={`${statusColors[order.status]} text-base px-4 py-1`}>
            {order.status}
          </Badge>
        </div>

        {/* 总体进度卡片 */}
        {progress && (order.status === '已下达' || order.status === '生产中' || order.status === '已完成') && (
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                  <div>
                    <h3 className="text-lg font-semibold">生产进度总览</h3>
                    <p className="text-sm text-muted-foreground">实时跟踪各工序完成情况</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-blue-600">{progress.overallProgress}%</div>
                  <div className="text-sm text-muted-foreground">
                    {progress.completedQuantity} / {progress.totalQuantity} 件
                  </div>
                </div>
              </div>
              
              {/* 总体进度条 */}
              <div className="relative mb-6">
                <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 ${getProgressColor(progress.overallProgress)}`}
                    style={{ width: `${progress.overallProgress}%` }}
                  />
                </div>
                {/* 工序分段标记 */}
                <div className="absolute inset-0 flex">
                  {progress.processes.map((p, idx) => {
                    const weight = PROCESS_WEIGHTS[p.processType];
                    const width = weight;
                    return (
                      <div 
                        key={p.processType}
                        className="h-full border-r border-white/50"
                        style={{ width: `${width}%` }}
                      />
                    );
                  })}
                </div>
              </div>
              
              {/* 工序分栏进度 */}
              <div className="grid grid-cols-4 gap-4">
                {progress.processes.map((p, idx) => {
                  const config = PROCESS_CONFIG[p.processType];
                  const Icon = config.icon;
                  return (
                    <div 
                      key={p.processType}
                      className={`p-3 rounded-lg ${config.bgColor} dark:bg-opacity-20`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Icon className={`w-5 h-5 ${config.color}`} />
                        <span className="font-medium">{p.processType}</span>
                      </div>
                      <div className="text-2xl font-bold mb-1">{p.progress}%</div>
                      <div className="text-xs text-muted-foreground">
                        {p.completedQuantity}/{p.totalQuantity}件
                      </div>
                      <div className="mt-2 h-1.5 bg-white/50 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${getProgressColor(p.progress)}`}
                          style={{ width: `${p.progress}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="progress" className="space-y-4">
          <TabsList>
            <TabsTrigger value="progress">生产进度</TabsTrigger>
            <TabsTrigger value="info">订单信息</TabsTrigger>
            <TabsTrigger value="color-size">色码明细</TabsTrigger>
          </TabsList>

          {/* 生产进度详情 */}
          <TabsContent value="progress" className="space-y-4">
            {progress && (order.status === '已下达' || order.status === '生产中' || order.status === '已完成') ? (
              <div className="space-y-4">
                {progress.processes.map((p, idx) => {
                  const config = PROCESS_CONFIG[p.processType];
                  const Icon = config.icon;
                  
                  return (
                    <Card key={p.processType}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${config.bgColor}`}>
                              <Icon className={`w-6 h-6 ${config.color}`} />
                            </div>
                            <div>
                              <h4 className="font-semibold">{p.processName}</h4>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                {getStatusIcon(p.status)}
                                <span>{p.status}</span>
                                {p.startTime && (
                                  <span className="ml-2">开始: {p.startTime.split(' ')[0]}</span>
                                )}
                                {p.endTime && (
                                  <span className="ml-2">完成: {p.endTime.split(' ')[0]}</span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold">{p.progress}%</div>
                            <div className="text-sm text-muted-foreground">
                              {p.completedQuantity} / {p.totalQuantity} 件
                            </div>
                          </div>
                        </div>
                        
                        {/* 进度条 */}
                        <div className="mb-4">
                          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                            <div 
                              className={`h-full transition-all duration-300 ${getProgressColor(p.progress)}`}
                              style={{ width: `${p.progress}%` }}
                            />
                          </div>
                        </div>
                        
                        {/* 进度操作（生产中状态可调整） */}
                        {order.status === '生产中' && p.status !== '已完成' && (
                          <div className="flex items-center gap-2 pt-2 border-t">
                            <span className="text-sm text-muted-foreground">调整数量:</span>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleUpdateProgress(p.processType, -10)}
                              disabled={p.completedQuantity <= 0}
                            >
                              -10
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleUpdateProgress(p.processType, -1)}
                              disabled={p.completedQuantity <= 0}
                            >
                              -1
                            </Button>
                            <span className="px-3 font-mono">{p.completedQuantity}</span>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleUpdateProgress(p.processType, 1)}
                              disabled={p.completedQuantity >= p.totalQuantity}
                            >
                              +1
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleUpdateProgress(p.processType, 10)}
                              disabled={p.completedQuantity >= p.totalQuantity}
                            >
                              +10
                            </Button>
                            <Button 
                              size="sm"
                              variant="default"
                              onClick={() => handleUpdateProgress(p.processType, p.totalQuantity)}
                              disabled={p.completedQuantity >= p.totalQuantity}
                            >
                              完成此工序
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  {order.status === '草稿' || order.status === '待审核' || order.status === '已审核'
                    ? '订单尚未下达生产，暂无进度数据'
                    : '暂无进度数据'}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* 订单信息 */}
          <TabsContent value="info" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 基本信息 */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    基本信息
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">订单号</span>
                    <span className="font-medium">{order.orderNo}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">款号</span>
                    <span className="font-medium">{order.styleNo}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">产品名称</span>
                    <span className="font-medium">{order.productName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">品牌</span>
                    <span>{order.brand}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">季节</span>
                    <span>{order.season} {order.year}</span>
                  </div>
                </CardContent>
              </Card>

              {/* 客户信息 */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <User className="w-5 h-5" />
                    客户信息
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">客户名称</span>
                    <span className="font-medium">{order.customerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">客户编号</span>
                    <span>{order.customerCode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">客户款号</span>
                    <span>{order.customerModel}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">业务员</span>
                    <span>{order.salesman}</span>
                  </div>
                </CardContent>
              </Card>

              {/* 日期信息 */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    日期信息
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">订单日期</span>
                    <span>{order.orderDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">交货日期</span>
                    <span className={progress?.delayDays && progress.delayDays > 0 ? 'text-red-600 font-medium' : ''}>
                      {order.deliveryDate}
                      {progress?.delayDays && progress.delayDays > 0 && (
                        <span className="ml-2 text-xs">(延期{progress.delayDays}天)</span>
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">创建时间</span>
                    <span>{order.createdAt}</span>
                  </div>
                  {order.auditedAt && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">审核时间</span>
                      <span>{order.auditedAt}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* 数量金额 */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Truck className="w-5 h-5" />
                    数量金额
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">总数量</span>
                    <span className="font-bold text-lg">{order.totalQuantity} 件</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">单价</span>
                    <span>¥{order.unitPrice}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">总金额</span>
                    <span className="font-bold text-lg text-primary">¥{order.amount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">币种</span>
                    <span>{order.currency}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">贸易条款</span>
                    <span>{order.tradeTerms}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 备注 */}
            {order.remark && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">备注</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground whitespace-pre-wrap">{order.remark}</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* 色码明细 */}
          <TabsContent value="color-size">
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-muted/50">
                        <th className="px-4 py-3 text-left">颜色</th>
                        <th className="px-4 py-3 text-right">S</th>
                        <th className="px-4 py-3 text-right">M</th>
                        <th className="px-4 py-3 text-right">L</th>
                        <th className="px-4 py-3 text-right">XL</th>
                        <th className="px-4 py-3 text-right">XXL</th>
                        <th className="px-4 py-3 text-right">XXXL</th>
                        <th className="px-4 py-3 text-right font-medium">小计</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.colorSizeMatrix.map((row, idx) => (
                        <tr key={idx} className="border-t">
                          <td className="px-4 py-3 font-medium">{row.colorName}</td>
                          <td className="px-4 py-3 text-right">{row.S || '-'}</td>
                          <td className="px-4 py-3 text-right">{row.M || '-'}</td>
                          <td className="px-4 py-3 text-right">{row.L || '-'}</td>
                          <td className="px-4 py-3 text-right">{row.XL || '-'}</td>
                          <td className="px-4 py-3 text-right">{row.XXL || '-'}</td>
                          <td className="px-4 py-3 text-right">{row.XXXL || '-'}</td>
                          <td className="px-4 py-3 text-right font-bold">{row.subtotal}</td>
                        </tr>
                      ))}
                      <tr className="border-t bg-muted/30">
                        <td className="px-4 py-3 font-bold">合计</td>
                        <td className="px-4 py-3 text-right font-bold">
                          {order.colorSizeMatrix.reduce((sum, r) => sum + (r.S || 0), 0)}
                        </td>
                        <td className="px-4 py-3 text-right font-bold">
                          {order.colorSizeMatrix.reduce((sum, r) => sum + (r.M || 0), 0)}
                        </td>
                        <td className="px-4 py-3 text-right font-bold">
                          {order.colorSizeMatrix.reduce((sum, r) => sum + (r.L || 0), 0)}
                        </td>
                        <td className="px-4 py-3 text-right font-bold">
                          {order.colorSizeMatrix.reduce((sum, r) => sum + (r.XL || 0), 0)}
                        </td>
                        <td className="px-4 py-3 text-right font-bold">
                          {order.colorSizeMatrix.reduce((sum, r) => sum + (r.XXL || 0), 0)}
                        </td>
                        <td className="px-4 py-3 text-right font-bold">
                          {order.colorSizeMatrix.reduce((sum, r) => sum + (r.XXXL || 0), 0)}
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-primary">
                          {order.totalQuantity}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
