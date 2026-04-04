'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { FileText, CheckCircle, Package, Factory, Zap, TrendingUp, Users, DollarSign, AlertTriangle, Clock, ArrowRight, Bell, AlertCircle, ShoppingCart } from 'lucide-react';
import { getCurrentUser, type CurrentUser } from '@/types/user';
import { getOrders, type Order } from '@/types/order';
import { getBOMs } from '@/types/bom';
import { getWorkReports, getBundles } from '@/types/workshop';
import { getStockItems, type StockItem } from '@/types/stock';
import { useTheme } from '@/components/providers/ThemeProvider';
import DashboardLayout from '@/components/layout/DashboardLayout';

interface AlertItem {
  id: string;
  type: 'order' | 'bom' | 'workshop' | 'inventory' | 'audit';
  title: string;
  description: string;
  level: 'warning' | 'danger' | 'info';
  path: string;
  createdAt: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingBOMs: 0,
    pendingAudits: 0,
    activeBundles: 0,
  });
  const [urgentOrders, setUrgentOrders] = useState<Order[]>([]);
  const [lowStockItems, setLowStockItems] = useState<StockItem[]>([]);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);

  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);
    
    // 加载统计数据
    const orders = getOrders();
    const boms = getBOMs();
    const workReports = getWorkReports();
    const bundles = getBundles();
    const inventoryItems = getStockItems();
    
    setStats({
      totalOrders: orders.length,
      pendingBOMs: boms.filter(b => b.status === '待审核').length,
      pendingAudits: workReports.filter(r => r.status === '待审核').length + orders.filter(o => o.status === '待审核').length,
      activeBundles: bundles.filter(b => b.status === '缝制中' || b.status === '待缝制').length,
    });

    // 7天内出货订单（交期倒计时）
    const now = new Date();
    const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const urgent = orders.filter(o => {
      if (o.status === '已完成') return false;
      const deliveryDate = new Date(o.deliveryDate);
      const daysLeft = Math.ceil((deliveryDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
      return daysLeft <= 7 && daysLeft >= 0;
    }).sort((a, b) => new Date(a.deliveryDate).getTime() - new Date(b.deliveryDate).getTime());
    setUrgentOrders(urgent);

    // 库存预警（低于安全库存）
    const lowStock = inventoryItems.filter((item: StockItem) => {
      if (!item.safetyStock) return false;
      return item.quantity < item.safetyStock;
    });
    setLowStockItems(lowStock);

    // 生成预警列表
    const alertList: AlertItem[] = [];

    // 待审核订单
    orders.filter(o => o.status === '待审核').forEach(o => {
      alertList.push({
        id: `order-${o.id}`,
        type: 'order',
        title: `订单待审核: ${o.orderNo}`,
        description: `客户: ${o.customerName}, 款号: ${o.styleNo}`,
        level: 'warning',
        path: '/dashboard/orders',
        createdAt: o.createdAt,
      });
    });

    // 待审核BOM
    boms.filter(b => b.status === '待审核').forEach(b => {
      alertList.push({
        id: `bom-${b.id}`,
        type: 'bom',
        title: `BOM待审核: ${b.bomNo}`,
        description: `订单: ${b.orderNo}, 产品: ${b.productName}`,
        level: 'warning',
        path: '/dashboard/bom',
        createdAt: b.createdAt,
      });
    });

    // 待审核报工
    workReports.filter(r => r.status === '待审核').forEach(r => {
      alertList.push({
        id: `workshop-${r.id}`,
        type: 'workshop',
        title: `报工待审核: ${r.reportNo}`,
        description: `员工: ${r.worker}, 工序: ${r.processName}`,
        level: 'info',
        path: '/dashboard/workshop',
        createdAt: r.createdAt,
      });
    });

    // 库存预警
    lowStock.forEach((item: StockItem) => {
      alertList.push({
        id: `inventory-${item.id}`,
        type: 'inventory',
        title: `库存不足: ${item.materialName}`,
        description: `当前库存: ${item.quantity}${item.unit}, 安全库存: ${item.safetyStock}${item.unit}`,
        level: 'danger',
        path: '/dashboard/inventory',
        createdAt: new Date().toLocaleString('zh-CN'),
      });
    });

    setAlerts(alertList);
  }, []);

  // 获取角色中文名
  const getRoleName = (role: string) => {
    const roleMap: Record<string, string> = {
      admin: '系统管理员',
      '制单员': '制单员',
      '审核员': '审核员',
      '车间': '车间管理员',
      '仓库': '仓库管理员',
      '财务': '财务管理员',
    };
    return roleMap[role] || role;
  };

  // 计算剩余天数
  const getDaysLeft = (deliveryDate: string) => {
    const now = new Date();
    const delivery = new Date(deliveryDate);
    const diff = delivery.getTime() - now.getTime();
    const days = Math.ceil(diff / (24 * 60 * 60 * 1000));
    return days;
  };

  // 获取进度条颜色
  const getProgressColor = (daysLeft: number) => {
    if (daysLeft <= 1) return 'bg-red-500';
    if (daysLeft <= 3) return 'bg-orange-500';
    if (daysLeft <= 5) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  // 快捷操作项
  const quickActions = [
    { icon: FileText, label: '创建订单', path: '/dashboard/orders', color: 'bg-blue-500', permissions: ['all', 'order:create'] },
    { icon: FileText, label: '创建BOM', path: '/dashboard/bom/form', color: 'bg-green-500', permissions: ['all', 'bom:create'] },
    { icon: CheckCircle, label: '审核管理', path: '/dashboard/audit', color: 'bg-yellow-500', permissions: ['all', 'audit:view'] },
    { icon: Package, label: '库存查询', path: '/dashboard/inventory', color: 'bg-orange-500', permissions: ['all', 'inventory:view'] },
    { icon: Factory, label: '车间报工', path: '/dashboard/workshop/scan', color: 'bg-purple-500', permissions: ['all', 'workshop:report'] },
    { icon: DollarSign, label: '财务成本', path: '/dashboard/finance', color: 'bg-cyan-500', permissions: ['all', 'finance:view'] },
  ];

  const hasPermission = (permissions: string[]) => {
    if (!currentUser) return false;
    return permissions.some(perm => currentUser.permissions.includes(perm));
  };

  return (
    <DashboardLayout>
      <div className="max-w-full mx-auto space-y-6">
        {/* 欢迎信息 */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <Zap className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                欢迎回来，{currentUser?.username}
              </h1>
              <p className="text-muted-foreground text-sm">
                {getRoleName(currentUser?.role || '')} · {new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
              </p>
            </div>
          </div>
          {/* 预警红点提示 */}
          {(alerts.filter(a => a.level === 'danger').length > 0 || lowStockItems.length > 0) && (
            <div 
              onClick={() => router.push('/dashboard/alert')}
              className="flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg cursor-pointer hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
            >
              <div className="relative">
                <Bell className="w-5 h-5 text-red-600" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
              </div>
              <span className="text-red-600 font-medium text-sm">
                {alerts.filter(a => a.level === 'danger').length} 条紧急预警
              </span>
              <ArrowRight className="w-4 h-4 text-red-600" />
            </div>
          )}
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">订单总数</p>
                  <p className="text-3xl font-bold text-foreground mt-1">{stats.totalOrders}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <div className="flex items-center mt-4 text-sm">
                <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                <span className="text-green-600">+12%</span>
                <span className="text-muted-foreground ml-2">较上月</span>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push('/dashboard/bom')}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">待审BOM</p>
                  <p className="text-3xl font-bold text-foreground mt-1">{stats.pendingBOMs}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center relative">
                  <FileText className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                  {stats.pendingBOMs > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">
                      {stats.pendingBOMs}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center mt-4 text-sm">
                <span className="text-muted-foreground">需要审核处理</span>
                <ArrowRight className="w-4 h-4 ml-2 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push('/dashboard/audit')}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">待审核事项</p>
                  <p className="text-3xl font-bold text-foreground mt-1">{stats.pendingAudits}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center relative">
                  <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                  {stats.pendingAudits > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">
                      {stats.pendingAudits}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center mt-4 text-sm">
                <span className="text-muted-foreground">订单和报工审核</span>
                <ArrowRight className="w-4 h-4 ml-2 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">生产中扎号</p>
                  <p className="text-3xl font-bold text-foreground mt-1">{stats.activeBundles}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                  <Factory className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
              <div className="flex items-center mt-4 text-sm">
                <span className="text-muted-foreground">正在车间生产</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 7天出货倒计时看板 */}
        {urgentOrders.length > 0 && (
          <Card className="border-red-200 dark:border-red-800">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="w-5 h-5" />
                7天内出货倒计时
                <Badge variant="destructive" className="ml-2">{urgentOrders.length} 个订单</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {urgentOrders.slice(0, 6).map(order => {
                  const daysLeft = getDaysLeft(order.deliveryDate);
                  return (
                    <div 
                      key={order.id}
                      onClick={() => router.push('/dashboard/orders')}
                      className="p-4 bg-muted rounded-lg cursor-pointer hover:bg-accent transition-colors"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-medium text-foreground">{order.orderNo}</p>
                          <p className="text-sm text-muted-foreground">{order.styleNo} - {order.productName}</p>
                        </div>
                        <Badge variant={daysLeft <= 1 ? 'destructive' : daysLeft <= 3 ? 'secondary' : 'outline'}>
                          剩余 {daysLeft} 天
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>客户: {order.customerName}</span>
                          <span>数量: {order.totalQuantity}</span>
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>交期: {order.deliveryDate}</span>
                          <span>{order.status}</span>
                        </div>
                        <Progress 
                          value={Math.max(0, Math.min(100, ((7 - daysLeft) / 7) * 100))} 
                          className="h-2 mt-2"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 库存预警红点提醒 */}
        {lowStockItems.length > 0 && (
          <Card className="border-orange-200 dark:border-orange-800">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-orange-600">
                <ShoppingCart className="w-5 h-5" />
                库存预警
                <Badge variant="secondary" className="ml-2 bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300">
                  {lowStockItems.length} 项缺料
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {lowStockItems.slice(0, 10).map(item => (
                  <div 
                    key={item.id}
                    onClick={() => router.push('/dashboard/inventory')}
                    className="flex items-center gap-2 px-3 py-2 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg cursor-pointer hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors"
                  >
                    <AlertCircle className="w-4 h-4 text-orange-500" />
                    <span className="text-sm font-medium text-orange-700 dark:text-orange-300">{item.materialName}</span>
                    <span className="text-xs text-orange-600 dark:text-orange-400">
                      {item.quantity}/{item.safetyStock}{item.unit}
                    </span>
                  </div>
                ))}
                {lowStockItems.length > 10 && (
                  <div 
                    onClick={() => router.push('/dashboard/inventory')}
                    className="flex items-center gap-2 px-3 py-2 bg-muted rounded-lg cursor-pointer hover:bg-accent transition-colors"
                  >
                    <span className="text-sm text-muted-foreground">+{lowStockItems.length - 10} 更多</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 待审核事项提醒 */}
        {alerts.filter(a => a.type === 'audit' || a.level === 'warning').length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                待处理事项
                <Badge variant="outline" className="ml-2">{alerts.filter(a => a.type === 'audit' || a.level === 'warning').length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {alerts.filter(a => a.type === 'audit' || a.level === 'warning').slice(0, 5).map(alert => (
                  <div 
                    key={alert.id}
                    onClick={() => router.push(alert.path)}
                    className="flex items-center justify-between p-3 bg-muted rounded-lg cursor-pointer hover:bg-accent transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${
                        alert.level === 'danger' ? 'bg-red-500' : 
                        alert.level === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                      }`} />
                      <div>
                        <p className="font-medium text-foreground text-sm">{alert.title}</p>
                        <p className="text-xs text-muted-foreground">{alert.description}</p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 快捷操作 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              快捷操作
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {quickActions.map((action, index) => {
                if (!hasPermission(action.permissions)) return null;
                const Icon = action.icon;
                return (
                  <button
                    key={index}
                    onClick={() => router.push(action.path)}
                    className="p-4 bg-muted rounded-lg hover:bg-accent transition-all text-center group"
                  >
                    <div className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <p className="text-foreground font-medium">{action.label}</p>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* 系统信息 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              系统信息
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-muted-foreground mb-1">系统版本</p>
                <p className="text-foreground font-medium">ERP v1.0.0</p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-muted-foreground mb-1">当前用户</p>
                <p className="text-foreground font-medium">{currentUser?.username} ({getRoleName(currentUser?.role || '')})</p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-muted-foreground mb-1">登录时间</p>
                <p className="text-foreground font-medium">{new Date().toLocaleString('zh-CN')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
