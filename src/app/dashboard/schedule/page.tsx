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
import { Calendar, Plus, Search, RotateCcw, AlertTriangle, Clock, Users, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  type ScheduleTask,
  type ScheduleStatus,
  getScheduleTasks,
  initScheduleData,
} from '@/types/schedule';

const statusColors: Record<ScheduleStatus, string> = {
  '未开始': 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  '进行中': 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  '已完成': 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  '暂停': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
  '取消': 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
};

export default function SchedulePage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<ScheduleTask[]>([]);
  
  const [searchOrderNo, setSearchOrderNo] = useState('');
  const [searchStatus, setSearchStatus] = useState('全部');
  const [searchTeam, setSearchTeam] = useState('全部');
  
  useEffect(() => {
    initScheduleData();
    loadData();
  }, []);
  
  const loadData = () => {
    setTasks(getScheduleTasks());
  };
  
  const filteredTasks = tasks.filter(t => {
    if (searchOrderNo && !t.orderNo.includes(searchOrderNo)) return false;
    if (searchStatus !== '全部' && t.status !== searchStatus) return false;
    if (searchTeam !== '全部' && t.teamName !== searchTeam) return false;
    return true;
  });
  
  const handleReset = () => {
    setSearchOrderNo('');
    setSearchStatus('全部');
    setSearchTeam('全部');
  };
  
  const stats = {
    total: tasks.length,
    notStarted: tasks.filter(t => t.status === '未开始').length,
    inProgress: tasks.filter(t => t.status === '进行中').length,
    completed: tasks.filter(t => t.status === '已完成').length,
    delayed: tasks.filter(t => t.isDelayed).length,
    overCapacity: tasks.filter(t => t.isOverCapacity).length,
  };
  
  const teams = [...new Set(tasks.map(t => t.teamName))];
  
  // 甘特图数据
  const ganttData = filteredTasks.map(task => ({
    id: task.id,
    name: `${task.orderNo} - ${task.productName}`,
    start: task.plannedStartDate,
    end: task.plannedEndDate,
    progress: task.progress,
    status: task.status,
    team: task.teamName,
    isDelayed: task.isDelayed,
    isOverCapacity: task.isOverCapacity,
  }));
  
  // 计算甘特图日期范围
  const getGanttDateRange = () => {
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - 3);
    const endDate = new Date(today);
    endDate.setDate(endDate.getDate() + 14);
    
    const dates = [];
    const current = new Date(startDate);
    while (current <= endDate) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    return dates;
  };
  
  const ganttDates = getGanttDateRange();
  
  const getTaskPosition = (task: typeof ganttData[0]) => {
    const startDate = new Date(ganttDates[0]);
    const taskStart = new Date(task.start);
    const taskEnd = new Date(task.end);
    const totalDays = ganttDates.length;
    
    const startOffset = Math.max(0, (taskStart.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const duration = (taskEnd.getTime() - taskStart.getTime()) / (1000 * 60 * 60 * 24) + 1;
    
    return {
      left: `${(startOffset / totalDays) * 100}%`,
      width: `${Math.min((duration / totalDays) * 100, 100 - (startOffset / totalDays) * 100)}%`,
    };
  };

  return (
    <DashboardLayout>
      <div className="max-w-full mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">生产排程</h1>
              <p className="text-muted-foreground text-sm">按订单交期自动排产、产能预警</p>
            </div>
          </div>
          <Button onClick={() => router.push('/dashboard/schedule/create')}>
            <Plus className="w-4 h-4 mr-2" />新增排程
          </Button>
        </div>
        
        {/* 统计卡片 */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">排程总数</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <Calendar className="w-8 h-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">未开始</p>
                  <p className="text-2xl font-bold text-gray-600">{stats.notStarted}</p>
                </div>
                <Clock className="w-8 h-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">进行中</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
                </div>
                <Users className="w-8 h-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">已完成</p>
                  <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">延期</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.delayed}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-orange-400" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">超产能</p>
                  <p className="text-2xl font-bold text-red-600">{stats.overCapacity}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-400" />
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Tabs defaultValue="gantt" className="space-y-4">
          <TabsList>
            <TabsTrigger value="gantt">甘特图</TabsTrigger>
            <TabsTrigger value="list">列表视图</TabsTrigger>
          </TabsList>
          
          <TabsContent value="gantt">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">生产甘特图</CardTitle>
              </CardHeader>
              <CardContent>
                {/* 甘特图时间轴 */}
                <div className="overflow-x-auto">
                  <div className="min-w-[1200px]">
                    {/* 日期头部 */}
                    <div className="flex border-b">
                      <div className="w-48 flex-shrink-0 p-2 font-medium text-sm">任务名称</div>
                      <div className="flex-1 flex">
                        {ganttDates.map((date, i) => {
                          const isToday = date.toDateString() === new Date().toDateString();
                          const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                          return (
                            <div 
                              key={i} 
                              className={`flex-1 text-center text-xs p-2 border-l ${
                                isToday ? 'bg-primary/10 font-bold' : 
                                isWeekend ? 'bg-muted/50' : ''
                              }`}
                            >
                              {date.getDate()}
                              <div className="text-muted-foreground">
                                {['日', '一', '二', '三', '四', '五', '六'][date.getDay()]}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    
                    {/* 任务条 */}
                    {ganttData.length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground">暂无排程数据</div>
                    ) : (
                      ganttData.map(task => {
                        const position = getTaskPosition(task);
                        return (
                          <div key={task.id} className="flex border-b hover:bg-muted/30">
                            <div className="w-48 flex-shrink-0 p-2 text-sm truncate">
                              <div className="font-medium">{task.name}</div>
                              <div className="text-xs text-muted-foreground">{task.team}</div>
                            </div>
                            <div className="flex-1 relative h-12">
                              {ganttDates.map((date, i) => {
                                const isToday = date.toDateString() === new Date().toDateString();
                                return (
                                  <div 
                                    key={i} 
                                    className={`absolute top-0 bottom-0 border-l ${isToday ? 'bg-primary/5' : ''}`}
                                    style={{ left: `${(i / ganttDates.length) * 100}%`, width: `${100 / ganttDates.length}%` }}
                                  />
                                );
                              })}
                              {/* 今日线 */}
                              <div 
                                className="absolute top-0 bottom-0 w-0.5 bg-primary z-10"
                                style={{ left: `${(3 / ganttDates.length) * 100}%` }}
                              />
                              {/* 任务条 */}
                              <div
                                className={`absolute top-2 h-8 rounded flex items-center px-2 text-xs text-white cursor-pointer ${
                                  task.isDelayed || task.isOverCapacity 
                                    ? 'bg-red-500' 
                                    : task.status === '已完成' 
                                      ? 'bg-green-500' 
                                      : task.status === '进行中'
                                        ? 'bg-blue-500'
                                        : 'bg-gray-400'
                                }`}
                                style={{ left: position.left, width: position.width }}
                                title={`${task.name} (${task.start} ~ ${task.end})`}
                              >
                                <span className="truncate">{task.progress}%</span>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="list">
            {/* 查询区 */}
            <Card>
              <CardContent className="p-4">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div>
                    <Label>订单号</Label>
                    <Input placeholder="请输入" value={searchOrderNo} onChange={(e) => setSearchOrderNo(e.target.value)} className="mt-1" />
                  </div>
                  <div>
                    <Label>状态</Label>
                    <Select value={searchStatus} onValueChange={setSearchStatus}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="全部">全部</SelectItem>
                        <SelectItem value="未开始">未开始</SelectItem>
                        <SelectItem value="进行中">进行中</SelectItem>
                        <SelectItem value="已完成">已完成</SelectItem>
                        <SelectItem value="暂停">暂停</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>班组</Label>
                    <Select value={searchTeam} onValueChange={setSearchTeam}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="全部">全部</SelectItem>
                        {teams.map(t => (
                          <SelectItem key={t} value={t}>{t}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end gap-2">
                    <Button onClick={loadData} className="flex-1">查询</Button>
                    <Button variant="outline" onClick={handleReset}><RotateCcw className="w-4 h-4" /></Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* 列表 */}
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>排程单号</TableHead>
                      <TableHead>订单号</TableHead>
                      <TableHead>款号</TableHead>
                      <TableHead>产品名称</TableHead>
                      <TableHead>数量</TableHead>
                      <TableHead>班组</TableHead>
                      <TableHead>计划开始</TableHead>
                      <TableHead>计划结束</TableHead>
                      <TableHead>进度</TableHead>
                      <TableHead>状态</TableHead>
                      <TableHead>预警</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTasks.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={11} className="text-center py-12 text-muted-foreground">暂无排程数据</TableCell>
                      </TableRow>
                    ) : (
                      filteredTasks.map(task => (
                        <TableRow key={task.id}>
                          <TableCell className="font-medium">{task.taskNo}</TableCell>
                          <TableCell>{task.orderNo}</TableCell>
                          <TableCell>{task.styleNo}</TableCell>
                          <TableCell>{task.productName}</TableCell>
                          <TableCell>{task.totalQuantity}</TableCell>
                          <TableCell>{task.teamName}</TableCell>
                          <TableCell>{task.plannedStartDate}</TableCell>
                          <TableCell>{task.plannedEndDate}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                                <div className="h-full bg-primary" style={{ width: `${task.progress}%` }} />
                              </div>
                              <span className="text-sm">{task.progress}%</span>
                            </div>
                          </TableCell>
                          <TableCell><Badge className={statusColors[task.status]}>{task.status}</Badge></TableCell>
                          <TableCell>
                            {task.isOverCapacity && (
                              <Badge className="bg-red-100 text-red-700">超产能</Badge>
                            )}
                            {task.isDelayed && (
                              <Badge className="bg-orange-100 text-orange-700">延期</Badge>
                            )}
                            {!task.isOverCapacity && !task.isDelayed && '-'}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
                <div className="p-4 border-t text-sm text-muted-foreground">
                  共 {filteredTasks.length} 条记录
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
