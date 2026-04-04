'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Save, Plus, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import {
  type ProcessRoute,
  type RouteProcess,
  type StandardProcessLibrary,
  getProcessRoutes,
  getProcessLibrary,
  initProcessRouteData,
  saveProcessRoute,
} from '@/types/process-route';
import { getTeams, type Team } from '@/types/employee';

const CATEGORIES = ['T恤', '衬衫', '夹克', '裤子', '连衣裙', '外套', '卫衣', '短裤'];

export default function ProcessRouteEditPage() {
  const params = useParams();
  const router = useRouter();
  
  const [processLibrary, setProcessLibrary] = useState<StandardProcessLibrary[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  
  // 表单数据
  const [routeId, setRouteId] = useState('');
  const [routeCode, setRouteCode] = useState('');
  const [routeName, setRouteName] = useState('');
  const [styleNo, setStyleNo] = useState('');
  const [category, setCategory] = useState('T恤');
  const [isActive, setIsActive] = useState(true);
  const [processes, setProcesses] = useState<RouteProcess[]>([]);
  
  // 选中的工序
  const [selectedProcessId, setSelectedProcessId] = useState('');

  useEffect(() => {
    initProcessRouteData();
    loadData();
  }, [params.id]);

  const loadData = () => {
    setProcessLibrary(getProcessLibrary().filter(p => p.isActive));
    setTeams(getTeams().filter(t => t.status === '启用'));
    
    // 加载路线数据
    const routes = getProcessRoutes();
    const route = routes.find(r => r.id === params.id);
    
    if (route) {
      setRouteId(route.id);
      setRouteCode(route.routeCode);
      setRouteName(route.routeName);
      setStyleNo(route.styleNo);
      setCategory(route.category);
      setIsActive(route.isActive);
      setProcesses([...route.processes]);
    }
    
    setLoading(false);
  };

  // 添加工序
  const handleAddProcess = () => {
    if (!selectedProcessId) return;
    
    const process = processLibrary.find(p => p.id === selectedProcessId);
    if (!process) return;
    
    const newProcess: RouteProcess = {
      id: Date.now().toString(),
      processOrder: processes.length + 1,
      processCode: process.processCode,
      processName: process.processName,
      processDesc: '',
      standardPrice: process.standardPrice,
      workType: process.workType,
      teamName: '',
      standardTime: process.standardTime,
      difficulty: 2,
      isRequiredCheck: false,
      nextProcessCode: '',
    };
    
    const updated = [...processes, newProcess];
    
    // 更新上一道工序的下一工序
    if (processes.length > 0) {
      updated[updated.length - 2] = {
        ...updated[updated.length - 2],
        nextProcessCode: process.processCode,
      };
    }
    
    setProcesses(updated);
    setSelectedProcessId('');
  };

  // 删除工序
  const handleRemoveProcess = (index: number) => {
    const updated = processes.filter((_, i) => i !== index);
    // 重新排序
    updated.forEach((p, i) => {
      p.processOrder = i + 1;
      p.nextProcessCode = updated[i + 1]?.processCode || '';
    });
    setProcesses(updated);
  };

  // 上移工序
  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const updated = [...processes];
    [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
    updated.forEach((p, i) => {
      p.processOrder = i + 1;
      p.nextProcessCode = updated[i + 1]?.processCode || '';
    });
    setProcesses(updated);
  };

  // 下移工序
  const handleMoveDown = (index: number) => {
    if (index === processes.length - 1) return;
    const updated = [...processes];
    [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
    updated.forEach((p, i) => {
      p.processOrder = i + 1;
      p.nextProcessCode = updated[i + 1]?.processCode || '';
    });
    setProcesses(updated);
  };

  // 更新工序信息
  const updateProcess = (index: number, field: keyof RouteProcess, value: string | number | boolean) => {
    const updated = [...processes];
    updated[index] = { ...updated[index], [field]: value };
    setProcesses(updated);
  };

  // 保存
  const handleSave = () => {
    if (!routeCode || !routeName || !styleNo) {
      alert('请填写路线编号、名称和款号');
      return;
    }
    
    if (processes.length === 0) {
      alert('请至少添加一道工序');
      return;
    }
    
    const updatedRoute: ProcessRoute = {
      id: routeId,
      routeCode,
      routeName,
      styleNo,
      category,
      processes,
      isActive,
      createdAt: '', // 保持原值
      updatedAt: new Date().toLocaleString('zh-CN'),
    };
    
    // 保留原创建时间
    const routes = getProcessRoutes();
    const original = routes.find(r => r.id === routeId);
    if (original) {
      updatedRoute.createdAt = original.createdAt;
    }
    
    saveProcessRoute(updatedRoute);
    router.push('/dashboard/process-route');
  };

  // 计算总工时和总成本
  const totalTime = processes.reduce((sum, p) => sum + p.standardTime, 0);
  const totalPrice = processes.reduce((sum, p) => sum + p.standardPrice, 0);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">加载中...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* 头部 */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard/process-route')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">编辑工艺路线</h1>
            <p className="text-muted-foreground">{routeCode}</p>
          </div>
          <Button onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />保存
          </Button>
        </div>

        {/* 基本信息 */}
        <Card>
          <CardHeader>
            <CardTitle>基本信息</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>路线编号 *</Label>
                <Input value={routeCode} onChange={(e) => setRouteCode(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>路线名称 *</Label>
                <Input value={routeName} onChange={(e) => setRouteName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>适用款号 *</Label>
                <Input value={styleNo} onChange={(e) => setStyleNo(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>品类</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(c => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2 col-span-2">
                <input 
                  type="checkbox" 
                  id="isActive" 
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="isActive">启用</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 添加工序 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>工序列表</CardTitle>
            <div className="flex gap-2 items-center">
              <Select value={selectedProcessId} onValueChange={setSelectedProcessId}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="选择工序" />
                </SelectTrigger>
                <SelectContent>
                  {processLibrary.filter(p => !processes.some(pr => pr.processCode === p.processCode)).map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.processCode} - {p.processName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button size="sm" onClick={handleAddProcess} disabled={!selectedProcessId}>
                <Plus className="w-4 h-4 mr-1" />添加工序
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {processes.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                请从上方选择工序添加
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">序号</TableHead>
                    <TableHead>工序代码</TableHead>
                    <TableHead>工序名称</TableHead>
                    <TableHead>工种</TableHead>
                    <TableHead>班组</TableHead>
                    <TableHead className="text-right">单价(元)</TableHead>
                    <TableHead className="text-right">工时(分)</TableHead>
                    <TableHead>难度</TableHead>
                    <TableHead>必检</TableHead>
                    <TableHead>下一工序</TableHead>
                    <TableHead className="w-24">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {processes.map((process, index) => (
                    <TableRow key={process.id}>
                      <TableCell className="font-medium">{process.processOrder}</TableCell>
                      <TableCell>{process.processCode}</TableCell>
                      <TableCell>{process.processName}</TableCell>
                      <TableCell>{process.workType}</TableCell>
                      <TableCell>
                        <Select 
                          value={process.teamName} 
                          onValueChange={(v) => updateProcess(index, 'teamName', v)}
                        >
                          <SelectTrigger className="w-28 h-8">
                            <SelectValue placeholder="选择" />
                          </SelectTrigger>
                          <SelectContent>
                            {teams.map(t => (
                              <SelectItem key={t.id} value={t.teamName}>{t.teamName}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-right">{process.standardPrice.toFixed(2)}</TableCell>
                      <TableCell className="text-right">{process.standardTime}</TableCell>
                      <TableCell>
                        <Select 
                          value={process.difficulty.toString()} 
                          onValueChange={(v) => updateProcess(index, 'difficulty', Number(v))}
                        >
                          <SelectTrigger className="w-16 h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {[1, 2, 3, 4, 5].map(n => (
                              <SelectItem key={n} value={n.toString()}>{n}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <input 
                          type="checkbox"
                          checked={process.isRequiredCheck}
                          onChange={(e) => updateProcess(index, 'isRequiredCheck', e.target.checked)}
                          className="rounded"
                        />
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {process.nextProcessCode || '结束'}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost" onClick={() => handleMoveUp(index)} disabled={index === 0}>
                            <ArrowUp className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => handleMoveDown(index)} disabled={index === processes.length - 1}>
                            <ArrowDown className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleRemoveProcess(index)}>
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* 汇总信息 */}
        {processes.length > 0 && (
          <Card>
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <div className="flex gap-8">
                  <div>
                    <span className="text-muted-foreground">工序数量：</span>
                    <span className="font-bold">{processes.length}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">总工时：</span>
                    <span className="font-bold">{totalTime} 分钟</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">总单价：</span>
                    <span className="font-bold text-primary">¥{totalPrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
