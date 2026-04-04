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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import BOMPrintDialog from '@/components/print/BOMPrintDialog';
import { 
  Plus, 
  Pencil, 
  Trash2, 
  CheckCircle, 
  Eye, 
  Download, 
  Printer,
  XCircle,
  Send,
  Search,
  RotateCcw,
  FileSpreadsheet,
  AlertTriangle,
  Palette,
  Clock,
  TrendingUp,
  ChevronRight,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { 
  getOrders, 
  deleteOrder, 
  auditOrder, 
  cancelOrder,
  issueProduction,
  rejectOrder,
  type Order,
  type OrderStatus,
  getOrderProgress,
  type OrderProgress,
} from '@/types/order';
import { getCurrentUser, type CurrentUser } from '@/types/user';

// 订单状态颜色映射
const statusColors: Record<OrderStatus, string> = {
  '草稿': 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  '待审核': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
  '已审核': 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  '已下达': 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  '生产中': 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
  '已完成': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300',
  '已作废': 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
};

// 进度条颜色
const getProgressColor = (progress: number): string => {
  if (progress >= 80) return 'bg-green-500';
  if (progress >= 50) return 'bg-blue-500';
  if (progress >= 30) return 'bg-yellow-500';
  return 'bg-gray-300';
};

export default function OrdersPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [orderProgressMap, setOrderProgressMap] = useState<Map<string, OrderProgress>>(new Map());
  
  // 查询条件
  const [searchOrderNo, setSearchOrderNo] = useState('');
  const [searchCustomer, setSearchCustomer] = useState('');
  const [searchStyleNo, setSearchStyleNo] = useState('');
  const [searchProductName, setSearchProductName] = useState('');
  const [searchStatus, setSearchStatus] = useState<string>('全部');
  const [searchDeliveryStart, setSearchDeliveryStart] = useState('');
  const [searchDeliveryEnd, setSearchDeliveryEnd] = useState('');
  const [searchCreateStart, setSearchCreateStart] = useState('');
  const [searchCreateEnd, setSearchCreateEnd] = useState('');
  const [searchCreator, setSearchCreator] = useState('');
  
  // 提示消息
  const [alertMessage, setAlertMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  
  // 打印BOM对话框
  const [printDialogOpen, setPrintDialogOpen] = useState(false);
  const [selectedOrderForPrint, setSelectedOrderForPrint] = useState<Order | null>(null);

  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);
    loadOrders();
  }, []);

  // 加载订单数据
  const loadOrders = () => {
    const allOrders = getOrders();
    // 按创建时间倒序排列
    allOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    setOrders(allOrders);
    setFilteredOrders(allOrders);
    
    // 加载进度数据
    const progressMap = new Map<string, OrderProgress>();
    allOrders.forEach(order => {
      if (order.status === '已下达' || order.status === '生产中' || order.status === '已完成') {
        const progress = getOrderProgress(order.id);
        if (progress) {
          progressMap.set(order.id, progress);
        }
      }
    });
    setOrderProgressMap(progressMap);
  };

  // 筛选订单
  useEffect(() => {
    let result = orders;
    
    if (searchOrderNo) {
      result = result.filter(o => o.orderNo.includes(searchOrderNo));
    }
    if (searchCustomer) {
      result = result.filter(o => o.customerName.includes(searchCustomer));
    }
    if (searchStyleNo) {
      result = result.filter(o => o.styleNo.includes(searchStyleNo));
    }
    if (searchProductName) {
      result = result.filter(o => o.productName.includes(searchProductName));
    }
    if (searchStatus !== '全部') {
      result = result.filter(o => o.status === searchStatus);
    }
    if (searchDeliveryStart) {
      result = result.filter(o => o.deliveryDate >= searchDeliveryStart);
    }
    if (searchDeliveryEnd) {
      result = result.filter(o => o.deliveryDate <= searchDeliveryEnd);
    }
    if (searchCreateStart) {
      result = result.filter(o => o.createdAt.split(' ')[0] >= searchCreateStart);
    }
    if (searchCreateEnd) {
      result = result.filter(o => o.createdAt.split(' ')[0] <= searchCreateEnd);
    }
    if (searchCreator) {
      result = result.filter(o => o.createdBy.includes(searchCreator));
    }
    
    setFilteredOrders(result);
  }, [orders, searchOrderNo, searchCustomer, searchStyleNo, searchProductName, searchStatus, searchDeliveryStart, searchDeliveryEnd, searchCreateStart, searchCreateEnd, searchCreator]);

  // 重置查询条件
  const handleResetSearch = () => {
    setSearchOrderNo('');
    setSearchCustomer('');
    setSearchStyleNo('');
    setSearchProductName('');
    setSearchStatus('全部');
    setSearchDeliveryStart('');
    setSearchDeliveryEnd('');
    setSearchCreateStart('');
    setSearchCreateEnd('');
    setSearchCreator('');
  };

  // 打印BOM制单
  const handlePrintBOM = (order: Order) => {
    setSelectedOrderForPrint(order);
    setPrintDialogOpen(true);
  };

  // 新增订单
  const handleAddOrder = () => {
    router.push('/dashboard/orders/create');
  };

  // 编辑订单
  const handleEditOrder = (order: Order) => {
    if (order.status !== '草稿' && order.status !== '待审核') {
      showAlert('error', '已审核订单不可修改，请作废后重新创建');
      return;
    }
    router.push(`/dashboard/orders/edit?id=${order.id}`);
  };

  // 查看订单详情
  const handleViewOrder = (order: Order) => {
    router.push(`/dashboard/orders/${order.id}`);
  };

  // 删除订单
  const handleDeleteOrder = (order: Order) => {
    if (order.status !== '草稿') {
      showAlert('error', '只有草稿状态的订单可以删除');
      return;
    }
    if (confirm(`确定要删除订单 ${order.orderNo} 吗？`)) {
      deleteOrder(order.id);
      loadOrders();
      showAlert('success', '订单删除成功');
    }
  };

  // 提交审核
  const handleSubmitAudit = (order: Order) => {
    if (order.status !== '草稿') {
      showAlert('error', '只有草稿状态的订单可以提交审核');
      return;
    }
    const orderList = getOrders();
    const targetOrder = orderList.find(o => o.id === order.id);
    if (targetOrder) {
      targetOrder.status = '待审核';
      localStorage.setItem('erp_orders', JSON.stringify(orderList));
      loadOrders();
      showAlert('success', '订单已提交审核');
    }
  };

  // 审核通过
  const handleApproveOrder = (order: Order) => {
    if (order.status !== '待审核') {
      showAlert('error', '只有待审核状态的订单可以审核');
      return;
    }
    if (!currentUser) return;
    auditOrder(order.id, currentUser.username);
    loadOrders();
    showAlert('success', '订单审核通过');
  };

  // 退回订单
  const handleRejectOrder = (order: Order) => {
    if (order.status !== '待审核') {
      showAlert('error', '只有待审核状态的订单可以退回');
      return;
    }
    rejectOrder(order.id);
    loadOrders();
    showAlert('success', '订单已退回');
  };

  // 下达生产
  const handleIssueProduction = (order: Order) => {
    if (order.status !== '已审核') {
      showAlert('error', '只有已审核状态的订单可以下达生产');
      return;
    }
    issueProduction(order.id);
    loadOrders();
    showAlert('success', '订单已下达生产');
  };

  // 作废订单
  const handleCancelOrder = (order: Order) => {
    // 检查状态
    if (order.status === '已作废' || order.status === '已完成') {
      showAlert('error', '该订单不可作废');
      return;
    }
    // 已下达的订单不能作废（规范要求）
    if (order.status === '已下达' || order.status === '生产中') {
      showAlert('error', '已下达生产的订单不能作废，请先完成或撤销生产');
      return;
    }
    if (confirm(`确定要作废订单 ${order.orderNo} 吗？`)) {
      cancelOrder(order.id);
      loadOrders();
      showAlert('success', '订单已作废');
    }
  };

  // 导出订单
  const handleExportOrders = () => {
    // 导出为CSV
    const headers = ['订单号', '客户', '款号', '产品名称', '数量', '交期', '状态', '创建时间'];
    const rows = filteredOrders.map(o => [
      o.orderNo, o.customerName, o.styleNo, o.productName, 
      o.totalQuantity, o.deliveryDate, o.status, o.createdAt
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `订单列表_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showAlert('success', '导出成功');
  };

  // 打印订单
  const handlePrintOrder = (order: Order) => {
    router.push(`/dashboard/orders/${order.id}?print=order`);
  };

  // 打印生产单
  const handlePrintProduction = (order: Order) => {
    router.push(`/dashboard/orders/${order.id}?print=production`);
  };

  // 查看色码明细
  const handleViewColorSize = (order: Order) => {
    router.push(`/dashboard/orders/${order.id}?tab=color-size`);
  };

  // 检查交期是否超期
  const isOverdue = (deliveryDate: string): boolean => {
    const delivery = new Date(deliveryDate);
    const now = new Date();
    const diffDays = Math.ceil((delivery.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays < 0;
  };

  // 检查交期是否即将到期（7天内）
  const isNearDue = (deliveryDate: string): boolean => {
    const delivery = new Date(deliveryDate);
    const now = new Date();
    const diffDays = Math.ceil((delivery.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 7;
  };

  // 显示提示消息
  const showAlert = (type: 'success' | 'error', message: string) => {
    setAlertMessage({ type, message });
    setTimeout(() => setAlertMessage(null), 3000);
  };

  // 权限检查
  const hasPermission = (permission: string) => {
    if (!currentUser) return false;
    return currentUser.permissions.includes('all') || currentUser.permissions.includes(permission);
  };

  // 渲染进度条
  const renderProgressBar = (order: Order) => {
    const progress = orderProgressMap.get(order.id);
    
    if (order.status === '已下达' || order.status === '生产中' || order.status === '已完成') {
      if (progress) {
        return (
          <div className="min-w-[120px]">
            <div className="flex items-center gap-2 mb-1">
              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-300 ${getProgressColor(progress.overallProgress)}`}
                  style={{ width: `${progress.overallProgress}%` }}
                />
              </div>
              <span className="text-xs font-medium min-w-[36px]">{progress.overallProgress}%</span>
            </div>
            <div className="text-xs text-muted-foreground">
              {progress.completedQuantity}/{progress.totalQuantity}件
            </div>
          </div>
        );
      }
    }
    
    return <span className="text-xs text-muted-foreground">-</span>;
  };

  // 渲染工序进度简览
  const renderProcessMini = (order: Order) => {
    const progress = orderProgressMap.get(order.id);
    
    if (!progress || (order.status !== '已下达' && order.status !== '生产中' && order.status !== '已完成')) {
      return null;
    }
    
    const processColors = ['bg-cyan-500', 'bg-blue-500', 'bg-purple-500', 'bg-green-500'];
    
    return (
      <div className="flex items-center gap-1">
        {progress.processes.map((p, idx) => (
          <div 
            key={p.processType}
            className={`w-2 h-2 rounded-full ${p.progress === 100 ? processColors[idx] : 'bg-gray-300'}`}
            title={`${p.processName}: ${p.progress}%`}
          />
        ))}
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* 提示消息 */}
        {alertMessage && (
          <Alert variant={alertMessage.type === 'error' ? 'destructive' : 'default'}>
            <AlertDescription>{alertMessage.message}</AlertDescription>
          </Alert>
        )}

        {/* 页面标题 */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">订单管理</h1>
            <p className="text-muted-foreground mt-1">管理所有销售订单，跟踪订单状态和生产进度</p>
          </div>
          {hasPermission('order:create') && (
            <Button onClick={handleAddOrder}>
              <Plus className="w-4 h-4 mr-2" />
              新增订单
            </Button>
          )}
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">全部订单</p>
                  <p className="text-2xl font-bold">{orders.length}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">生产中</p>
                  <p className="text-2xl font-bold text-purple-600">{orders.filter(o => o.status === '生产中').length}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">已完成</p>
                  <p className="text-2xl font-bold text-green-600">{orders.filter(o => o.status === '已完成').length}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">即将到期</p>
                  <p className="text-2xl font-bold text-orange-600">{orders.filter(o => isNearDue(o.deliveryDate) && o.status !== '已完成').length}</p>
                </div>
                <Clock className="w-8 h-8 text-orange-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 查询区域 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">查询条件</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label className="text-sm">订单号</Label>
                <Input
                  placeholder="请输入订单号"
                  value={searchOrderNo}
                  onChange={(e) => setSearchOrderNo(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-sm">客户名称</Label>
                <Input
                  placeholder="请输入客户名称"
                  value={searchCustomer}
                  onChange={(e) => setSearchCustomer(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-sm">款号</Label>
                <Input
                  placeholder="请输入款号"
                  value={searchStyleNo}
                  onChange={(e) => setSearchStyleNo(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-sm">产品名称</Label>
                <Input
                  placeholder="请输入产品名称"
                  value={searchProductName}
                  onChange={(e) => setSearchProductName(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-sm">订单状态</Label>
                <Select value={searchStatus} onValueChange={setSearchStatus}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="请选择状态" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="全部">全部</SelectItem>
                    <SelectItem value="草稿">草稿</SelectItem>
                    <SelectItem value="待审核">待审核</SelectItem>
                    <SelectItem value="已审核">已审核</SelectItem>
                    <SelectItem value="已下达">已下达</SelectItem>
                    <SelectItem value="生产中">生产中</SelectItem>
                    <SelectItem value="已完成">已完成</SelectItem>
                    <SelectItem value="已作废">已作废</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm">交货日期（开始）</Label>
                <Input
                  type="date"
                  value={searchDeliveryStart}
                  onChange={(e) => setSearchDeliveryStart(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-sm">交货日期（结束）</Label>
                <Input
                  type="date"
                  value={searchDeliveryEnd}
                  onChange={(e) => setSearchDeliveryEnd(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-sm">创建人</Label>
                <Input
                  placeholder="请输入创建人"
                  value={searchCreator}
                  onChange={(e) => setSearchCreator(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
            <div className="flex justify-end mt-4 gap-2">
              <Button variant="outline" onClick={handleResetSearch}>
                <RotateCcw className="w-4 h-4 mr-2" />
                重置
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Search className="w-4 h-4 mr-2" />
                查询
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 订单列表 - 桌面端表格 */}
        <Card className="hidden lg:block">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="w-12">序号</TableHead>
                    <TableHead>订单号</TableHead>
                    <TableHead>客户名称</TableHead>
                    <TableHead>款号</TableHead>
                    <TableHead>产品名称</TableHead>
                    <TableHead className="text-right">总数量</TableHead>
                    <TableHead className="min-w-[140px]">生产进度</TableHead>
                    <TableHead>交货日期</TableHead>
                    <TableHead>订单状态</TableHead>
                    <TableHead>创建人</TableHead>
                    <TableHead className="w-40">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={11} className="text-center py-8 text-gray-500">
                      暂无订单数据
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrders.map((order, index) => {
                    const progress = orderProgressMap.get(order.id);
                    return (
                      <TableRow key={order.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => handleViewOrder(order)}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell className="font-medium">{order.orderNo}</TableCell>
                        <TableCell>{order.customerName}</TableCell>
                        <TableCell>{order.styleNo}</TableCell>
                        <TableCell>{order.productName}</TableCell>
                        <TableCell className="text-right">{order.totalQuantity}</TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          {renderProgressBar(order)}
                        </TableCell>
                        <TableCell>
                          <span className={`${
                            isOverdue(order.deliveryDate) ? 'text-red-600 font-bold' :
                            isNearDue(order.deliveryDate) ? 'text-orange-600 font-semibold' : ''
                          }`}>
                            {order.deliveryDate}
                            {isOverdue(order.deliveryDate) && (
                              <AlertTriangle className="inline w-4 h-4 ml-1 text-red-600" />
                            )}
                            {isNearDue(order.deliveryDate) && !isOverdue(order.deliveryDate) && (
                              <Clock className="inline w-4 h-4 ml-1 text-orange-600" />
                            )}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${statusColors[order.status]} text-white`}>
                            {order.status}
                          </Badge>
                          {renderProcessMini(order)}
                        </TableCell>
                        <TableCell>{order.createdBy}</TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <div className="flex gap-1 flex-wrap">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleViewOrder(order)}
                              title="查看详情"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            {hasPermission('order:edit') && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleEditOrder(order)}
                                title="编辑"
                                disabled={order.status !== '草稿' && order.status !== '待审核'}
                              >
                                <Pencil className="w-4 h-4" />
                              </Button>
                            )}
                            {hasPermission('audit:approve') && order.status === '待审核' && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleApproveOrder(order)}
                                title="审核"
                                className="text-green-600"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </Button>
                            )}
                            {hasPermission('audit:approve') && order.status === '待审核' && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleRejectOrder(order)}
                                title="退回"
                                className="text-orange-600"
                              >
                                <XCircle className="w-4 h-4" />
                              </Button>
                            )}
                            {hasPermission('order:edit') && order.status === '草稿' && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleSubmitAudit(order)}
                                title="提交审核"
                                className="text-blue-600"
                              >
                                <Send className="w-4 h-4" />
                              </Button>
                            )}
                            {hasPermission('order:edit') && order.status === '已审核' && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleIssueProduction(order)}
                                title="下达生产"
                                className="text-purple-600"
                              >
                                <Send className="w-4 h-4" />
                              </Button>
                            )}
                            {hasPermission('order:delete') && order.status === '草稿' && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDeleteOrder(order)}
                                title="删除"
                                className="text-red-600"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handlePrintBOM(order)}
                              title="打印制单"
                              className="text-cyan-600"
                            >
                              <Printer className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
          
          {/* 底部操作栏 */}
          <div className="flex justify-between items-center p-4 border-t">
            <div className="text-sm text-gray-600">
              共 {filteredOrders.length} 条订单
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleExportOrders}>
                <Download className="w-4 h-4 mr-2" />
                导出
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
        
        {/* 订单列表 - 移动端卡片 */}
        <div className="lg:hidden space-y-3">
          {filteredOrders.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-gray-500">
                暂无订单数据
              </CardContent>
            </Card>
          ) : (
            filteredOrders.map((order) => {
              const progress = orderProgressMap.get(order.id);
              return (
                <Card key={order.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="font-medium">{order.orderNo}</div>
                        <div className="text-gray-500 text-sm">{order.customerName}</div>
                      </div>
                      <Badge className={`${statusColors[order.status]} text-white`}>{order.status}</Badge>
                    </div>
                    
                    {/* 进度条 */}
                    {progress && (order.status === '已下达' || order.status === '生产中' || order.status === '已完成') && (
                      <div className="mb-3 p-2 bg-muted/50 rounded">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-muted-foreground">生产进度</span>
                          <span className="text-xs font-medium">{progress.overallProgress}%</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-300 ${getProgressColor(progress.overallProgress)}`}
                            style={{ width: `${progress.overallProgress}%` }}
                          />
                        </div>
                        <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                          <span>{progress.completedQuantity}/{progress.totalQuantity}件</span>
                          <div className="flex items-center gap-1">
                            {progress.processes.map((p, idx) => (
                              <span key={p.processType} className={`px-1 rounded text-[10px] ${p.progress === 100 ? 'bg-green-100 text-green-700' : 'bg-gray-100'}`}>
                                {p.processType.slice(0,1)}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                      <div>
                        <span className="text-gray-500">款号：</span>
                        <span>{order.styleNo}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">数量：</span>
                        <span>{order.totalQuantity}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-gray-500">交期：</span>
                        <span className={isOverdue(order.deliveryDate) ? 'text-red-600 font-bold' : ''}>
                          {order.deliveryDate}
                          {isOverdue(order.deliveryDate) && <AlertTriangle className="inline w-4 h-4 ml-1" />}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-wrap border-t pt-3">
                      <Button size="sm" variant="outline" onClick={() => handleViewOrder(order)}>
                        <Eye className="w-4 h-4 mr-1" />查看
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handlePrintBOM(order)} className="text-cyan-600">
                        <Printer className="w-4 h-4 mr-1" />打印
                      </Button>
                      {hasPermission('order:edit') && (order.status === '草稿' || order.status === '待审核') && (
                        <Button size="sm" variant="outline" onClick={() => handleEditOrder(order)}>
                          <Pencil className="w-4 h-4 mr-1" />编辑
                        </Button>
                      )}
                      {hasPermission('audit:approve') && order.status === '待审核' && (
                        <Button size="sm" variant="outline" onClick={() => handleApproveOrder(order)} className="border-green-600 text-green-600">
                          <CheckCircle className="w-4 h-4 mr-1" />审核
                        </Button>
                      )}
                      {order.status === '草稿' && hasPermission('order:edit') && (
                        <Button size="sm" variant="outline" onClick={() => handleSubmitAudit(order)} className="border-blue-600 text-blue-600">
                          <Send className="w-4 h-4 mr-1" />提交
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
          <div className="text-center text-sm text-gray-500 py-2">
            共 {filteredOrders.length} 条订单
          </div>
        </div>
      </div>
      
      {/* 打印BOM对话框 */}
      <BOMPrintDialog 
        open={printDialogOpen} 
        onOpenChange={setPrintDialogOpen} 
        order={selectedOrderForPrint} 
      />
    </DashboardLayout>
  );
}
