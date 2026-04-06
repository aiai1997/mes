'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, TrendingUp, Package, AlertTriangle, DollarSign, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DashboardStats {
  todayOutput: number;
  completedOrders: number;
  pendingOrders: number;
  lowInventoryAlerts: number;
  todayIncome: number;
  pendingPayments: number;
}

export default function ScreenPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/dashboard/stats');
      const result = await response.json();

      if (result.code === 200) {
        setStats(result.data);
      } else {
        toast({
          title: '获取数据失败',
          description: result.message,
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: '网络错误',
        description: '无法获取统计数据',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();

    // 每10秒自动刷新
    const interval = setInterval(fetchStats, 10000);

    return () => clearInterval(interval);
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY',
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('zh-CN').format(num);
  };

  if (loading && !stats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <RefreshCw className="w-12 h-12 animate-spin mx-auto text-blue-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-300">加载中...</h2>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-7xl mx-auto">
        {/* 头部 */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              生产数据大屏
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              实时监控生产状态和业务指标
            </p>
          </div>
          <Button onClick={fetchStats} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            刷新数据
          </Button>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* 今日产量 */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                今日产量
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {formatNumber(stats?.todayOutput || 0)}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                件
              </p>
            </CardContent>
          </Card>

          {/* 完工订单 */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                完工订单
              </CardTitle>
              <Package className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {formatNumber(stats?.completedOrders || 0)}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                个订单
              </p>
            </CardContent>
          </Card>

          {/* 待加工订单 */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                待加工订单
              </CardTitle>
              <Clock className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {formatNumber(stats?.pendingOrders || 0)}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                个订单
              </p>
            </CardContent>
          </Card>

          {/* 库存预警 */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                库存预警
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {formatNumber(stats?.lowInventoryAlerts || 0)}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                种物料
              </p>
              {(stats?.lowInventoryAlerts || 0) > 0 && (
                <Badge variant="destructive" className="mt-2">
                  需要补货
                </Badge>
              )}
            </CardContent>
          </Card>

          {/* 今日收入 */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                今日收入
              </CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {formatCurrency(stats?.todayIncome || 0)}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                营业收入
              </p>
            </CardContent>
          </Card>

          {/* 待付款 */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                待付款
              </CardTitle>
              <DollarSign className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {formatCurrency(stats?.pendingPayments || 0)}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                应付账款
              </p>
              {(stats?.pendingPayments || 0) > 0 && (
                <Badge variant="secondary" className="mt-2">
                  待处理
                </Badge>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 实时更新提示 */}
        <div className="text-center text-sm text-gray-500 dark:text-gray-400">
          数据每10秒自动更新 · 最后更新时间: {new Date().toLocaleTimeString('zh-CN')}
        </div>
      </div>
    </div>
  );
}