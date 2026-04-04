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
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Route,
  Plus,
  Eye,
  Edit,
  Trash2,
  Copy,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  type ProcessRoute,
  type StandardProcessLibrary,
  getProcessRoutes,
  getProcessLibrary,
  initProcessRouteData,
  saveProcessRoute,
} from '@/types/process-route';

export default function ProcessRoutePage() {
  const router = useRouter();
  const [routes, setRoutes] = useState<ProcessRoute[]>([]);
  const [processLibrary, setProcessLibrary] = useState<StandardProcessLibrary[]>([]);
  const [activeTab, setActiveTab] = useState('routes');
  const [searchKeyword, setSearchKeyword] = useState('');
  
  // 工序弹窗
  const [showProcessDialog, setShowProcessDialog] = useState(false);
  const [editingProcess, setEditingProcess] = useState<StandardProcessLibrary | null>(null);
  const [processForm, setProcessForm] = useState({
    processCode: '',
    processName: '',
    category: '缝制',
    workType: '车工',
    standardPrice: 0,
    standardTime: 0,
    isActive: true,
  });
  
  useEffect(() => {
    initProcessRouteData();
    loadData();
  }, []);
  
  const loadData = () => {
    setRoutes(getProcessRoutes());
    setProcessLibrary(getProcessLibrary());
  };
  
  const handleCopyRoute = (route: ProcessRoute) => {
    router.push(`/dashboard/process-route/create?copyFrom=${route.id}`);
  };
  
  const handleAddProcess = () => {
    setEditingProcess(null);
    setProcessForm({
      processCode: '',
      processName: '',
      category: '缝制',
      workType: '车工',
      standardPrice: 0,
      standardTime: 0,
      isActive: true,
    });
    setShowProcessDialog(true);
  };
  
  const handleEditProcess = (process: StandardProcessLibrary) => {
    setEditingProcess(process);
    setProcessForm({
      processCode: process.processCode,
      processName: process.processName,
      category: process.category,
      workType: process.workType,
      standardPrice: process.standardPrice,
      standardTime: process.standardTime,
      isActive: process.isActive,
    });
    setShowProcessDialog(true);
  };
  
  const handleSaveProcess = () => {
    if (!processForm.processCode || !processForm.processName) {
      alert('请填写工序代码和名称');
      return;
    }
    
    const library = getProcessLibrary();
    
    if (editingProcess) {
      // 编辑
      const index = library.findIndex(p => p.id === editingProcess.id);
      if (index >= 0) {
        library[index] = {
          ...library[index],
          ...processForm,
        };
      }
    } else {
      // 新增
      library.push({
        id: Date.now().toString(),
        ...processForm,
      });
    }
    
    localStorage.setItem('erp_process_library', JSON.stringify(library));
    setShowProcessDialog(false);
    loadData();
  };
  
  const filteredRoutes = routes.filter(r => 
    r.routeCode.includes(searchKeyword) || 
    r.routeName.includes(searchKeyword) ||
    r.styleNo.includes(searchKeyword)
  );

  return (
    <DashboardLayout>
      <div className="max-w-full mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <Route className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">工艺路线管理</h1>
              <p className="text-muted-foreground text-sm">标准工序库、工艺路线配置</p>
            </div>
          </div>
          <Button className="gap-2" onClick={() => router.push('/dashboard/process-route/create')}>
            <Plus className="w-4 h-4" />新增路线
          </Button>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="routes">工艺路线</TabsTrigger>
            <TabsTrigger value="library">标准工序库</TabsTrigger>
          </TabsList>
          
          <TabsContent value="routes" className="space-y-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex gap-4 items-center">
                  <div className="flex-1">
                    <Input placeholder="搜索路线编号/名称/款号" value={searchKeyword} onChange={(e) => setSearchKeyword(e.target.value)} />
                  </div>
                  <Button onClick={loadData}>查询</Button>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>路线编号</TableHead>
                        <TableHead>路线名称</TableHead>
                        <TableHead>适用款号</TableHead>
                        <TableHead>品类</TableHead>
                        <TableHead className="text-center">工序数</TableHead>
                        <TableHead>状态</TableHead>
                        <TableHead>创建时间</TableHead>
                        <TableHead className="w-32">操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRoutes.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                            暂无工艺路线
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredRoutes.map((route) => (
                          <TableRow key={route.id}>
                            <TableCell className="font-medium">{route.routeCode}</TableCell>
                            <TableCell>{route.routeName}</TableCell>
                            <TableCell>{route.styleNo}</TableCell>
                            <TableCell>{route.category}</TableCell>
                            <TableCell className="text-center">{route.processes.length}</TableCell>
                            <TableCell>
                              <Badge className={route.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                                {route.isActive ? '启用' : '停用'}
                              </Badge>
                            </TableCell>
                            <TableCell>{route.createdAt}</TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                <Button size="sm" variant="ghost" onClick={() => router.push(`/dashboard/process-route/${route.id}`)} title="查看"><Eye className="w-4 h-4" /></Button>
                                <Button size="sm" variant="ghost" onClick={() => router.push(`/dashboard/process-route/${route.id}/edit`)} title="编辑"><Edit className="w-4 h-4" /></Button>
                                <Button size="sm" variant="ghost" onClick={() => handleCopyRoute(route)} title="复制"><Copy className="w-4 h-4" /></Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="library" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">标准工序库</CardTitle>
                <Button size="sm" className="gap-2" onClick={handleAddProcess}>
                  <Plus className="w-4 h-4" />新增工序
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>工序代码</TableHead>
                        <TableHead>工序名称</TableHead>
                        <TableHead>分类</TableHead>
                        <TableHead>工种</TableHead>
                        <TableHead className="text-right">标准单价</TableHead>
                        <TableHead className="text-right">标准工时(分)</TableHead>
                        <TableHead>状态</TableHead>
                        <TableHead className="w-20">操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {processLibrary.map((p) => (
                        <TableRow key={p.id}>
                          <TableCell className="font-medium">{p.processCode}</TableCell>
                          <TableCell>{p.processName}</TableCell>
                          <TableCell>{p.category}</TableCell>
                          <TableCell>{p.workType}</TableCell>
                          <TableCell className="text-right">¥{p.standardPrice.toFixed(2)}</TableCell>
                          <TableCell className="text-right">{p.standardTime}</TableCell>
                          <TableCell>
                            <Badge className={p.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                              {p.isActive ? '启用' : '停用'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button size="sm" variant="ghost" onClick={() => handleEditProcess(p)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        {/* 工序编辑弹窗 */}
        <Dialog open={showProcessDialog} onOpenChange={setShowProcessDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingProcess ? '编辑工序' : '新增工序'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>工序代码 *</Label>
                  <Input 
                    value={processForm.processCode}
                    onChange={(e) => setProcessForm({...processForm, processCode: e.target.value})}
                    placeholder="如：P001"
                  />
                </div>
                <div className="space-y-2">
                  <Label>工序名称 *</Label>
                  <Input 
                    value={processForm.processName}
                    onChange={(e) => setProcessForm({...processForm, processName: e.target.value})}
                    placeholder="如：合肩"
                  />
                </div>
                <div className="space-y-2">
                  <Label>分类</Label>
                  <Select value={processForm.category} onValueChange={(v) => setProcessForm({...processForm, category: v})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="缝制">缝制</SelectItem>
                      <SelectItem value="整烫">整烫</SelectItem>
                      <SelectItem value="质检">质检</SelectItem>
                      <SelectItem value="包装">包装</SelectItem>
                      <SelectItem value="裁床">裁床</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>工种</Label>
                  <Select value={processForm.workType} onValueChange={(v) => setProcessForm({...processForm, workType: v})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="车工">车工</SelectItem>
                      <SelectItem value="烫工">烫工</SelectItem>
                      <SelectItem value="质检员">质检员</SelectItem>
                      <SelectItem value="包装工">包装工</SelectItem>
                      <SelectItem value="裁床工">裁床工</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>标准单价(元)</Label>
                  <Input 
                    type="number"
                    step="0.01"
                    value={processForm.standardPrice}
                    onChange={(e) => setProcessForm({...processForm, standardPrice: Number(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>标准工时(分钟)</Label>
                  <Input 
                    type="number"
                    value={processForm.standardTime}
                    onChange={(e) => setProcessForm({...processForm, standardTime: Number(e.target.value)})}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="isActive" 
                  checked={processForm.isActive}
                  onChange={(e) => setProcessForm({...processForm, isActive: e.target.checked})}
                  className="rounded"
                />
                <Label htmlFor="isActive">启用</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowProcessDialog(false)}>取消</Button>
              <Button onClick={handleSaveProcess}>保存</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
