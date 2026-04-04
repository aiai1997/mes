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
import { CuttingTask, CuttingTaskStatus, generateCuttingTaskNo, getCuttingTasks, createCuttingTask, updateCuttingTaskProgress } from '@/types/order';
import { getOrders } from '@/types/order';
import { Order } from '@/types/order';

// 裁床管理页面
const CuttingPage = () => {
  const [tasks, setTasks] = useState<CuttingTask[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<string>('');
  const [operator, setOperator] = useState<string>('');
  const [estimatedTime, setEstimatedTime] = useState<number>(60);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<CuttingTask | null>(null);
  const [completedQuantity, setCompletedQuantity] = useState<number>(0);

  // 加载数据
  useEffect(() => {
    loadData();
  }, []);

  // 加载数据
  const loadData = () => {
    setIsLoading(true);
    setTimeout(() => {
      const loadedTasks = getCuttingTasks();
      const allOrders = getOrders();
      setTasks(loadedTasks);
      setOrders(allOrders);
      setIsLoading(false);
    }, 500);
  };

  // 处理创建裁床任务
  const handleCreateTask = () => {
    if (!selectedOrder || !operator) {
      setError('请选择订单和操作员');
      setTimeout(() => setError(null), 3000);
      return;
    }

    try {
      createCuttingTask(selectedOrder, operator, estimatedTime);
      loadData();
      setIsModalOpen(false);
      setSelectedOrder('');
      setOperator('');
      setEstimatedTime(60);
      setSuccess('裁床任务创建成功');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('创建任务失败，请重试');
      setTimeout(() => setError(null), 3000);
    }
  };

  // 处理更新裁床任务进度
  const handleUpdateProgress = (task: CuttingTask) => {
    setEditingTask(task);
    setCompletedQuantity(task.completedQuantity);
  };

  // 处理保存进度
  const handleSaveProgress = () => {
    if (!editingTask) return;

    try {
      updateCuttingTaskProgress(editingTask.id, completedQuantity);
      loadData();
      setEditingTask(null);
      setCompletedQuantity(0);
      setSuccess('进度更新成功');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('更新进度失败，请重试');
      setTimeout(() => setError(null), 3000);
    }
  };

  // 计算面料损耗率
  const calculateFabricLossRate = (task: CuttingTask): number => {
    // 模拟计算，实际应根据BOM和实际用量计算
    return Math.random() * 5 + 2; // 2%-7%之间的随机值
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">裁床管理</h1>
          <p className="text-gray-500">管理裁床任务，跟踪进度，计算面料损耗率</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>创建裁床任务</Button>
      </div>

      {/* 消息提示 */}
      {error && (
        <Alert variant="destructive">
          <AlertTitle>错误</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {success && (
        <Alert variant="default">
          <AlertTitle>成功</AlertTitle>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* 裁床任务列表 */}
      <Card>
        <CardHeader>
          <CardTitle>裁床任务列表</CardTitle>
          <CardDescription>查看和管理所有裁床任务</CardDescription>
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
                  <TableHead>任务编号</TableHead>
                  <TableHead>订单编号</TableHead>
                  <TableHead>产品名称</TableHead>
                  <TableHead>总数量</TableHead>
                  <TableHead>已完成</TableHead>
                  <TableHead>进度</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>操作员</TableHead>
                  <TableHead>面料损耗率</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tasks.map((task) => {
                  const progress = task.totalQuantity > 0 ? Math.round((task.completedQuantity / task.totalQuantity) * 100) : 0;
                  const lossRate = calculateFabricLossRate(task);
                  const isOverLoss = lossRate > 5; // 假设超过5%为超耗

                  return (
                    <TableRow key={task.id}>
                      <TableCell>{task.taskNo}</TableCell>
                      <TableCell>{task.orderNo}</TableCell>
                      <TableCell>{task.productName}</TableCell>
                      <TableCell>{task.totalQuantity}</TableCell>
                      <TableCell>{task.completedQuantity}</TableCell>
                      <TableCell>{progress}%</TableCell>
                      <TableCell>
                        <Badge variant={
                          task.status === '已完成' ? 'default' :
                          task.status === '进行中' ? 'secondary' :
                          task.status === '已取消' ? 'destructive' : 'outline'
                        }>
                          {task.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{task.operator}</TableCell>
                      <TableCell>
                        <Badge variant={isOverLoss ? 'destructive' : 'default'}>
                          {lossRate.toFixed(2)}%
                        </Badge>
                        {isOverLoss && <span className="ml-2 text-red-500 text-sm">超耗</span>}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          {task.status !== '已完成' && task.status !== '已取消' && (
                            <Button size="sm" onClick={() => handleUpdateProgress(task)}>
                              更新进度
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* 创建裁床任务模态框 */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>创建裁床任务</CardTitle>
              <CardDescription>选择订单并创建裁床任务</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="orderSelect">选择订单</Label>
                  <Select value={selectedOrder} onValueChange={setSelectedOrder}>
                    <SelectTrigger id="orderSelect">
                      <SelectValue placeholder="选择订单" />
                    </SelectTrigger>
                    <SelectContent>
                      {orders.map((order) => (
                        <SelectItem key={order.id} value={order.id}>
                          {order.orderNo} - {order.productName} ({order.totalQuantity}件)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="operator">操作员</Label>
                  <Input id="operator" value={operator} onChange={(e) => setOperator(e.target.value)} placeholder="输入操作员姓名" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="estimatedTime">预计时间（分钟）</Label>
                  <Input id="estimatedTime" type="number" value={estimatedTime} onChange={(e) => setEstimatedTime(parseInt(e.target.value) || 0)} />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                    取消
                  </Button>
                  <Button onClick={handleCreateTask}>
                    创建任务
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 更新进度模态框 */}
      {editingTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>更新裁床任务进度</CardTitle>
              <CardDescription>输入已完成数量</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>任务编号</Label>
                  <Input value={editingTask.taskNo} readOnly />
                </div>
                <div className="space-y-2">
                  <Label>订单编号</Label>
                  <Input value={editingTask.orderNo} readOnly />
                </div>
                <div className="space-y-2">
                  <Label>产品名称</Label>
                  <Input value={editingTask.productName} readOnly />
                </div>
                <div className="space-y-2">
                  <Label>总数量</Label>
                  <Input value={editingTask.totalQuantity} readOnly />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="completedQuantity">已完成数量</Label>
                  <Input 
                    id="completedQuantity" 
                    type="number" 
                    value={completedQuantity} 
                    onChange={(e) => setCompletedQuantity(parseInt(e.target.value) || 0)} 
                    max={editingTask.totalQuantity}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="secondary" onClick={() => setEditingTask(null)}>
                    取消
                  </Button>
                  <Button onClick={handleSaveProgress}>
                    保存进度
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default CuttingPage;
