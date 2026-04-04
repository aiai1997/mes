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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Tag,
  Search,
  RotateCcw,
  Download,
  Eye,
  Plus,
  Box,
  Package,
  CheckCircle,
  Clock,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  type TailTask,
  type TailTaskStatus,
  type TailProcess,
  type PackingBox,
  getTailTasks,
  getTailProcesses,
  getPackingBoxes,
  initTailData,
} from '@/types/tail';

const statusColors: Record<TailTaskStatus, string> = {
  '待尾部': 'bg-gray-600 text-white',
  '整烫中': 'bg-yellow-600 text-white',
  '查衫中': 'bg-orange-600 text-white',
  '包装中': 'bg-blue-600 text-white',
  '已完成': 'bg-green-600 text-white',
  '已入库': 'bg-purple-600 text-white',
};

export default function TailPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<TailTask[]>([]);
  const [processes, setProcesses] = useState<TailProcess[]>([]);
  const [boxes, setBoxes] = useState<PackingBox[]>([]);
  
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TailTask | null>(null);
  
  const [searchOrderNo, setSearchOrderNo] = useState('');
  const [searchStatus, setSearchStatus] = useState('全部');

  useEffect(() => {
    initTailData();
    loadData();
  }, []);

  const loadData = () => {
    setTasks(getTailTasks());
    setProcesses(getTailProcesses().filter(p => p.isActive));
    setBoxes(getPackingBoxes());
  };

  const filteredTasks = tasks.filter(t => {
    if (searchOrderNo && !t.orderNo.includes(searchOrderNo)) return false;
    if (searchStatus !== '全部' && t.status !== searchStatus) return false;
    return true;
  });

  const handleViewDetail = (task: TailTask) => {
    setSelectedTask(task);
    setDetailDialogOpen(true);
  };

  const stats = {
    total: tasks.length,
    pending: tasks.filter(t => t.status === '待尾部').length,
    completed: tasks.filter(t => t.status === '已完成' || t.status === '已入库').length,
    totalGood: tasks.reduce((sum, t) => sum + t.goodQuantity, 0),
  };

  return (
    <DashboardLayout>
      <div className="max-w-full mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
              <Tag className="w-6 h-6 text-black" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">尾部管理</h1>
              <p className="text-gray-400 text-sm">后整工序管理、装箱入库</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => router.push('/dashboard/tail/packing')} className="bg-white text-black hover:bg-gray-200">
              <Box className="w-4 h-4 mr-2" />新增装箱
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <Card className="bg-gray-900 border-gray-700">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500 rounded-lg">
                  <Package className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">尾部任务</p>
                  <p className="text-2xl font-bold text-white">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gray-900 border-gray-700">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-500 rounded-lg">
                  <Clock className="w-5 h-5 text-black" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">待处理</p>
                  <p className="text-2xl font-bold text-yellow-400">{stats.pending}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gray-900 border-gray-700">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">已完成</p>
                  <p className="text-2xl font-bold text-green-400">{stats.completed}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gray-900 border-gray-700">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500 rounded-lg">
                  <Box className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">装箱数</p>
                  <p className="text-2xl font-bold text-purple-400">{boxes.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="tasks" className="space-y-4">
          <TabsList className="bg-gray-900 border border-gray-700">
            <TabsTrigger value="tasks" className="data-[state=active]:bg-white data-[state=active]:text-black">尾部任务</TabsTrigger>
            <TabsTrigger value="packing" className="data-[state=active]:bg-white data-[state=active]:text-black">装箱管理</TabsTrigger>
            <TabsTrigger value="processes" className="data-[state=active]:bg-white data-[state=active]:text-black">尾部工序</TabsTrigger>
          </TabsList>

          <TabsContent value="tasks">
            <Card className="bg-gray-900 border-gray-700">
              <CardContent className="pt-6">
                <div className="flex gap-4 mb-4">
                  <Input placeholder="订单号" value={searchOrderNo} onChange={(e) => setSearchOrderNo(e.target.value)} className="bg-gray-800 border-gray-600 text-white w-48" />
                  <Select value={searchStatus} onValueChange={setSearchStatus}>
                    <SelectTrigger className="bg-gray-800 border-gray-600 text-white w-32"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="全部">全部</SelectItem>
                      <SelectItem value="待尾部">待尾部</SelectItem>
                      <SelectItem value="整烫中">整烫中</SelectItem>
                      <SelectItem value="查衫中">查衫中</SelectItem>
                      <SelectItem value="已完成">已完成</SelectItem>
                      <SelectItem value="已入库">已入库</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={loadData} className="bg-white text-black hover:bg-gray-200"><Search className="w-4 h-4 mr-1" />查询</Button>
                  <Button variant="outline" onClick={() => { setSearchOrderNo(''); setSearchStatus('全部'); }} className="border-gray-600 text-gray-300"><RotateCcw className="w-4 h-4" /></Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-700">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-700">
                      <TableHead className="text-gray-400">任务编号</TableHead>
                      <TableHead className="text-gray-400">扎号</TableHead>
                      <TableHead className="text-gray-400">订单号</TableHead>
                      <TableHead className="text-gray-400">款号</TableHead>
                      <TableHead className="text-gray-400">颜色/尺码</TableHead>
                      <TableHead className="text-gray-400 text-right">扎号数</TableHead>
                      <TableHead className="text-gray-400 text-right">良品</TableHead>
                      <TableHead className="text-gray-400">当前工序</TableHead>
                      <TableHead className="text-gray-400">状态</TableHead>
                      <TableHead className="text-gray-400 w-32">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTasks.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={10} className="text-center py-12 text-gray-500">
                          暂无尾部任务
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredTasks.map((task) => (
                        <TableRow key={task.id} className="border-gray-700 hover:bg-gray-800">
                          <TableCell className="text-white font-medium">{task.taskNo}</TableCell>
                          <TableCell className="text-gray-300">{task.bundleNo}</TableCell>
                          <TableCell className="text-gray-300">{task.orderNo}</TableCell>
                          <TableCell className="text-gray-300">{task.styleNo}</TableCell>
                          <TableCell className="text-gray-300">{task.colorName}/{task.sizeName}</TableCell>
                          <TableCell className="text-right text-white">{task.bundleQuantity}</TableCell>
                          <TableCell className="text-right text-green-400">{task.goodQuantity}</TableCell>
                          <TableCell className="text-gray-300">{task.currentProcess || '-'}</TableCell>
                          <TableCell><Badge className={statusColors[task.status]}>{task.status}</Badge></TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button size="sm" variant="ghost" onClick={() => handleViewDetail(task)} className="text-gray-400 hover:text-white hover:bg-gray-700">
                                <Eye className="w-4 h-4" />
                              </Button>
                              {task.status !== '已完成' && task.status !== '已入库' && (
                                <Button size="sm" variant="outline" onClick={() => router.push(`/dashboard/tail/report?id=${task.id}`)} className="border-green-600 text-green-400 hover:bg-gray-800">
                                  报工
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="packing">
            <Card className="bg-gray-900 border-gray-700">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-700">
                      <TableHead className="text-gray-400">箱号</TableHead>
                      <TableHead className="text-gray-400">订单号</TableHead>
                      <TableHead className="text-gray-400">款号</TableHead>
                      <TableHead className="text-gray-400">颜色</TableHead>
                      <TableHead className="text-gray-400 text-right">数量</TableHead>
                      <TableHead className="text-gray-400 text-right">毛重</TableHead>
                      <TableHead className="text-gray-400">目的地</TableHead>
                      <TableHead className="text-gray-400">状态</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {boxes.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-12 text-gray-500">
                          暂无装箱记录
                        </TableCell>
                      </TableRow>
                    ) : (
                      boxes.map((box) => (
                        <TableRow key={box.id} className="border-gray-700 hover:bg-gray-800">
                          <TableCell className="text-white font-medium">{box.boxNo}</TableCell>
                          <TableCell className="text-gray-300">{box.orderNo}</TableCell>
                          <TableCell className="text-gray-300">{box.styleNo}</TableCell>
                          <TableCell className="text-gray-300">{box.colorName}</TableCell>
                          <TableCell className="text-right text-white">{box.totalQuantity}</TableCell>
                          <TableCell className="text-right text-gray-300">{box.grossWeight.toFixed(1)}kg</TableCell>
                          <TableCell className="text-gray-300">{box.destination}</TableCell>
                          <TableCell>
                            <Badge className={box.status === '已入库' ? 'bg-purple-600' : box.status === '已封箱' ? 'bg-blue-600' : 'bg-green-600'}>
                              {box.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="processes">
            <Card className="bg-gray-900 border-gray-700">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-700">
                      <TableHead className="text-gray-400">代码</TableHead>
                      <TableHead className="text-gray-400">工序名称</TableHead>
                      <TableHead className="text-gray-400 text-right">单价</TableHead>
                      <TableHead className="text-gray-400">顺序</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {processes.map((p) => (
                      <TableRow key={p.id} className="border-gray-700 hover:bg-gray-800">
                        <TableCell className="text-gray-300">{p.processCode}</TableCell>
                        <TableCell className="text-white">{p.processName}</TableCell>
                        <TableCell className="text-right text-green-400">¥{p.standardPrice.toFixed(2)}</TableCell>
                        <TableCell className="text-gray-300">{p.processOrder}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
          <DialogContent className="max-w-md bg-gray-900 border-gray-700">
            <DialogHeader><DialogTitle className="text-white">任务详情</DialogTitle></DialogHeader>
            {selectedTask && (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-400">任务编号:</span><span className="text-white">{selectedTask.taskNo}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">扎号:</span><span className="text-white">{selectedTask.bundleNo}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">订单号:</span><span className="text-white">{selectedTask.orderNo}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">款号:</span><span className="text-white">{selectedTask.styleNo}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">颜色/尺码:</span><span className="text-white">{selectedTask.colorName}/{selectedTask.sizeName}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">扎号数量:</span><span className="text-white">{selectedTask.bundleQuantity}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">良品:</span><span className="text-green-400">{selectedTask.goodQuantity}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">返工:</span><span className="text-yellow-400">{selectedTask.reworkQuantity}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">计件工资:</span><span className="text-green-400">¥{selectedTask.pieceWage.toFixed(2)}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">当前工序:</span><span className="text-white">{selectedTask.currentProcess || '-'}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">状态:</span><Badge className={statusColors[selectedTask.status]}>{selectedTask.status}</Badge></div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
