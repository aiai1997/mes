'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Settings, Plus, Edit, Trash2, Download, Search, ArrowRight, ArrowDown } from 'lucide-react';

interface Process {
  id: string;
  processCode: string;
  processName: string;
  type: '缝制' | '尾部' | '裁床' | 'QC';
  standardPrice: number;
  standardTime: number; // 标准工时（分钟）
  difficulty: '简单' | '中等' | '复杂';
  teamId?: string;
  teamName?: string;
  prevProcess?: string;
  nextProcess?: string;
  isRequiredCheck: boolean;
  status: '启用' | '停用';
  createdAt: string;
}

export default function ProcessPage() {
  const router = useRouter();
  const [processes, setProcesses] = useState<Process[]>([]);
  const [searchText, setSearchText] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showDialog, setShowDialog] = useState(false);
  const [editingProcess, setEditingProcess] = useState<Process | null>(null);
  const [formData, setFormData] = useState<{
    processCode: string;
    processName: string;
    type: Process['type'];
    standardPrice: number;
    standardTime: number;
    difficulty: Process['difficulty'];
    teamName: string;
    prevProcess: string;
    nextProcess: string;
    isRequiredCheck: boolean;
    status: '启用' | '停用';
  }>({
    processCode: '',
    processName: '',
    type: '缝制',
    standardPrice: 0,
    standardTime: 0,
    difficulty: '中等',
    teamName: '',
    prevProcess: '',
    nextProcess: '',
    isRequiredCheck: false,
    status: '启用',
  });

  useEffect(() => {
    loadProcesses();
  }, []);

  const loadProcesses = () => {
    const stored = localStorage.getItem('erp_processes');
    if (stored) {
      setProcesses(JSON.parse(stored));
    } else {
      // 示例数据
      const defaultProcesses: Process[] = [
        { id: '1', processCode: 'P001', processName: '合肩', type: '缝制', standardPrice: 0.5, standardTime: 30, difficulty: '简单', teamName: '缝制一组', prevProcess: '', nextProcess: 'P002', isRequiredCheck: false, status: '启用', createdAt: new Date().toLocaleString('zh-CN') },
        { id: '2', processCode: 'P002', processName: '锁边', type: '缝制', standardPrice: 0.3, standardTime: 20, difficulty: '简单', teamName: '缝制一组', prevProcess: 'P001', nextProcess: 'P003', isRequiredCheck: false, status: '启用', createdAt: new Date().toLocaleString('zh-CN') },
        { id: '3', processCode: 'P003', processName: '开袋', type: '缝制', standardPrice: 0.8, standardTime: 45, difficulty: '复杂', teamName: '缝制一组', prevProcess: 'P002', nextProcess: 'P004', isRequiredCheck: false, status: '启用', createdAt: new Date().toLocaleString('zh-CN') },
        { id: '4', processCode: 'P004', processName: '上领', type: '缝制', standardPrice: 1.0, standardTime: 60, difficulty: '复杂', teamName: '缝制一组', prevProcess: 'P003', nextProcess: 'P005', isRequiredCheck: false, status: '启用', createdAt: new Date().toLocaleString('zh-CN') },
        { id: '5', processCode: 'P005', processName: '装袖', type: '缝制', standardPrice: 0.9, standardTime: 50, difficulty: '中等', teamName: '缝制一组', prevProcess: 'P004', nextProcess: 'P006', isRequiredCheck: false, status: '启用', createdAt: new Date().toLocaleString('zh-CN') },
        { id: '6', processCode: 'P006', processName: '门襟缝制', type: '缝制', standardPrice: 1.2, standardTime: 70, difficulty: '复杂', teamName: '缝制一组', prevProcess: 'P005', nextProcess: 'P007', isRequiredCheck: false, status: '启用', createdAt: new Date().toLocaleString('zh-CN') },
        { id: '7', processCode: 'P007', processName: '钉扣', type: '缝制', standardPrice: 0.2, standardTime: 15, difficulty: '简单', teamName: '缝制一组', prevProcess: 'P006', nextProcess: 'P008', isRequiredCheck: false, status: '启用', createdAt: new Date().toLocaleString('zh-CN') },
        { id: '8', processCode: 'P008', processName: '整烫初整', type: '尾部', standardPrice: 0.6, standardTime: 40, difficulty: '中等', teamName: '尾部组', prevProcess: 'P007', nextProcess: 'P009', isRequiredCheck: false, status: '启用', createdAt: new Date().toLocaleString('zh-CN') },
        { id: '9', processCode: 'P009', processName: '质检初检', type: 'QC', standardPrice: 0.4, standardTime: 25, difficulty: '中等', teamName: '品管组', prevProcess: 'P008', nextProcess: '', isRequiredCheck: true, status: '启用', createdAt: new Date().toLocaleString('zh-CN') },
        { id: '10', processCode: 'P010', processName: '裁床裁剪', type: '裁床', standardPrice: 0.3, standardTime: 20, difficulty: '中等', teamName: '裁床组', prevProcess: '', nextProcess: 'P001', isRequiredCheck: false, status: '启用', createdAt: new Date().toLocaleString('zh-CN') },
      ];
      localStorage.setItem('erp_processes', JSON.stringify(defaultProcesses));
      setProcesses(defaultProcesses);
    }
  };

  const saveProcesses = (newProcesses: Process[]) => {
    localStorage.setItem('erp_processes', JSON.stringify(newProcesses));
    setProcesses(newProcesses);
  };

  const generateProcessCode = () => {
    const count = processes.length + 1;
    return `P${count.toString().padStart(3, '0')}`;
  };

  const handleOpenDialog = (process?: Process) => {
    if (process) {
      setEditingProcess(process);
      setFormData({
        processCode: process.processCode,
        processName: process.processName,
        type: process.type,
        standardPrice: process.standardPrice,
        standardTime: process.standardTime,
        difficulty: process.difficulty,
        teamName: process.teamName || '',
        prevProcess: process.prevProcess || '',
        nextProcess: process.nextProcess || '',
        isRequiredCheck: process.isRequiredCheck,
        status: process.status,
      });
    } else {
      setEditingProcess(null);
      setFormData({
        processCode: generateProcessCode(),
        processName: '',
        type: '缝制',
        standardPrice: 0,
        standardTime: 0,
        difficulty: '中等',
        teamName: '',
        prevProcess: '',
        nextProcess: '',
        isRequiredCheck: false,
        status: '启用',
      });
    }
    setShowDialog(true);
  };

  const handleSaveProcess = () => {
    if (!formData.processCode || !formData.processName) {
      alert('请填写工序编码和名称');
      return;
    }

    const now = new Date().toLocaleString('zh-CN');
    if (editingProcess) {
      const updated = processes.map(p => 
        p.id === editingProcess.id 
          ? { ...p, ...formData, updatedAt: now }
          : p
      );
      saveProcesses(updated);
    } else {
      const newProcess: Process = {
        id: Date.now().toString(),
        ...formData,
        createdAt: now,
      };
      saveProcesses([...processes, newProcess]);
    }
    setShowDialog(false);
  };

  const handleDeleteProcess = (id: string) => {
    if (confirm('确定要删除此工序吗？')) {
      saveProcesses(processes.filter(p => p.id !== id));
    }
  };

  const handleExport = () => {
    const headers = ['工序编码', '工序名称', '类型', '标准单价', '标准工时', '难度', '班组', '上工序', '下工序', '必检', '状态'];
    const rows = processes.map(p => [
      p.processCode, p.processName, p.type, p.standardPrice.toFixed(2),
      p.standardTime.toString(), p.difficulty, p.teamName || '',
      p.prevProcess || '', p.nextProcess || '',
      p.isRequiredCheck ? '是' : '否', p.status
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `工序管理_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getProcessName = (code: string) => {
    return processes.find(p => p.processCode === code)?.processName || code;
  };

  const filteredProcesses = processes.filter(p => {
    if (searchText && !p.processCode.includes(searchText) && !p.processName.includes(searchText)) return false;
    if (filterType !== 'all' && p.type !== filterType) return false;
    return true;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* 页面标题 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Settings className="w-6 h-6" />
              工序管理
            </h1>
            <p className="text-muted-foreground mt-1">管理标准工序库，用于报工、计件、工艺路线</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              导出
            </Button>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="w-4 h-4 mr-2" />
              新增工序
            </Button>
          </div>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">工序总数</p>
                  <p className="text-2xl font-bold text-foreground">{processes.length}</p>
                </div>
                <Settings className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">缝制工序</p>
                  <p className="text-2xl font-bold text-blue-600">{processes.filter(p => p.type === '缝制').length}</p>
                </div>
                <Settings className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">必检工序</p>
                  <p className="text-2xl font-bold text-orange-600">{processes.filter(p => p.isRequiredCheck).length}</p>
                </div>
                <Settings className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">启用工序</p>
                  <p className="text-2xl font-bold text-green-600">{processes.filter(p => p.status === '启用').length}</p>
                </div>
                <Settings className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 筛选条件 */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 flex-1 min-w-64">
                <Search className="w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="搜索工序编码/名称..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="flex-1"
                />
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部类型</SelectItem>
                  <SelectItem value="缝制">缝制</SelectItem>
                  <SelectItem value="尾部">尾部</SelectItem>
                  <SelectItem value="裁床">裁床</SelectItem>
                  <SelectItem value="QC">QC</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* 工序列表 */}
        <Card>
          <CardHeader>
            <CardTitle>工序列表</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>工序编码</TableHead>
                  <TableHead>工序名称</TableHead>
                  <TableHead>类型</TableHead>
                  <TableHead>标准单价</TableHead>
                  <TableHead>标准工时</TableHead>
                  <TableHead>难度</TableHead>
                  <TableHead>班组</TableHead>
                  <TableHead>工序流程</TableHead>
                  <TableHead>必检</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProcesses.map(process => (
                  <TableRow key={process.id}>
                    <TableCell className="font-mono">{process.processCode}</TableCell>
                    <TableCell className="font-medium">{process.processName}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{process.type}</Badge>
                    </TableCell>
                    <TableCell className="text-right">¥{process.standardPrice.toFixed(2)}</TableCell>
                    <TableCell>{process.standardTime}分钟</TableCell>
                    <TableCell>
                      <Badge variant={
                        process.difficulty === '复杂' ? 'destructive' :
                        process.difficulty === '中等' ? 'secondary' : 'outline'
                      }>
                        {process.difficulty}
                      </Badge>
                    </TableCell>
                    <TableCell>{process.teamName || '-'}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-xs">
                        {process.prevProcess && (
                          <>
                            <span className="text-muted-foreground">{getProcessName(process.prevProcess)}</span>
                            <ArrowRight className="w-3 h-3" />
                          </>
                        )}
                        <span className="font-medium">{process.processName}</span>
                        {process.nextProcess && (
                          <>
                            <ArrowRight className="w-3 h-3" />
                            <span className="text-muted-foreground">{getProcessName(process.nextProcess)}</span>
                          </>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {process.isRequiredCheck && (
                        <Badge variant="destructive">必检</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={process.status === '启用' ? 'default' : 'secondary'}>
                        {process.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline" onClick={() => handleOpenDialog(process)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleDeleteProcess(process.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* 新增/编辑工序对话框 */}
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingProcess ? '编辑工序' : '新增工序'}</DialogTitle>
              <DialogDescription>配置工序基本信息</DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label>工序编码 *</Label>
                <Input
                  value={formData.processCode}
                  onChange={(e) => setFormData({ ...formData, processCode: e.target.value })}
                  placeholder="自动生成"
                />
              </div>
              <div className="space-y-2">
                <Label>工序名称 *</Label>
                <Input
                  value={formData.processName}
                  onChange={(e) => setFormData({ ...formData, processName: e.target.value })}
                  placeholder="工序名称"
                />
              </div>
              <div className="space-y-2">
                <Label>类型</Label>
                <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v as Process['type'] })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="缝制">缝制</SelectItem>
                    <SelectItem value="尾部">尾部</SelectItem>
                    <SelectItem value="裁床">裁床</SelectItem>
                    <SelectItem value="QC">QC</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>标准单价</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.standardPrice}
                  onChange={(e) => setFormData({ ...formData, standardPrice: parseFloat(e.target.value) || 0 })}
                  placeholder="计件单价"
                />
              </div>
              <div className="space-y-2">
                <Label>标准工时（分钟）</Label>
                <Input
                  type="number"
                  value={formData.standardTime}
                  onChange={(e) => setFormData({ ...formData, standardTime: parseInt(e.target.value) || 0 })}
                  placeholder="标准工时"
                />
              </div>
              <div className="space-y-2">
                <Label>难度</Label>
                <Select value={formData.difficulty} onValueChange={(v) => setFormData({ ...formData, difficulty: v as Process['difficulty'] })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="简单">简单</SelectItem>
                    <SelectItem value="中等">中等</SelectItem>
                    <SelectItem value="复杂">复杂</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>班组</Label>
                <Select value={formData.teamName} onValueChange={(v) => setFormData({ ...formData, teamName: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择班组" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="缝制一组">缝制一组</SelectItem>
                    <SelectItem value="缝制二组">缝制二组</SelectItem>
                    <SelectItem value="裁床组">裁床组</SelectItem>
                    <SelectItem value="尾部组">尾部组</SelectItem>
                    <SelectItem value="品管组">品管组</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>上工序</Label>
                <Select value={formData.prevProcess} onValueChange={(v) => setFormData({ ...formData, prevProcess: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择上工序" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">无</SelectItem>
                    {processes.filter(p => p.id !== editingProcess?.id).map(p => (
                      <SelectItem key={p.id} value={p.processCode}>{p.processName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>下工序</Label>
                <Select value={formData.nextProcess} onValueChange={(v) => setFormData({ ...formData, nextProcess: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择下工序" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">无</SelectItem>
                    {processes.filter(p => p.id !== editingProcess?.id).map(p => (
                      <SelectItem key={p.id} value={p.processCode}>{p.processName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>状态</Label>
                <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v as '启用' | '停用' })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="启用">启用</SelectItem>
                    <SelectItem value="停用">停用</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isRequiredCheck"
                  checked={formData.isRequiredCheck}
                  onChange={(e) => setFormData({ ...formData, isRequiredCheck: e.target.checked })}
                  className="w-4 h-4"
                />
                <Label htmlFor="isRequiredCheck">必检工序</Label>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDialog(false)}>取消</Button>
              <Button onClick={handleSaveProcess}>保存</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
