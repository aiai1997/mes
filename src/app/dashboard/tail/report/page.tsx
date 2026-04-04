'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Tag,
  ArrowLeft,
  CheckCircle,
  Package,
  DollarSign,
} from 'lucide-react';
import {
  type TailTask,
  type TailProcess,
  type TailReworkReason,
  getTailTaskById,
  getTailProcesses,
  saveTailTask,
  initTailData,
} from '@/types/tail';
import { getCurrentUser, type CurrentUser } from '@/types/user';

const reworkReasons: TailReworkReason[] = ['烫痕', '脏污', '破洞', '线头', '印绣花不良', '其他'];

export default function TailReportPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [task, setTask] = useState<TailTask | null>(null);
  const [processes, setProcesses] = useState<TailProcess[]>([]);
  
  const [selectedProcess, setSelectedProcess] = useState('');
  const [goodQuantity, setGoodQuantity] = useState('');
  const [reworkQuantity, setReworkQuantity] = useState('0');
  const [reworkReason, setReworkReason] = useState<TailReworkReason | ''>('');
  const [remark, setRemark] = useState('');
  
  const [alertMessage, setAlertMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);
    initTailData();
    setProcesses(getTailProcesses().filter(p => p.isActive));
    
    // 如果URL有任务ID参数
    const taskId = searchParams.get('id');
    if (taskId) {
      const foundTask = getTailTaskById(taskId);
      if (foundTask) {
        setTask(foundTask);
        setSelectedProcess(foundTask.currentProcess || '整烫精整');
        setGoodQuantity(foundTask.bundleQuantity.toString());
      }
    }
  }, [searchParams]);

  const calculateWage = () => {
    const process = processes.find(p => p.processName === selectedProcess);
    const good = parseInt(goodQuantity) || 0;
    const price = process?.standardPrice || 0;
    return good * price;
  };

  const getRemainingQuantity = () => {
    if (!task) return 0;
    return task.bundleQuantity - task.goodQuantity;
  };

  const handleSubmit = () => {
    if (!task || !selectedProcess || !currentUser) {
      setAlertMessage({ type: 'error', message: '请完善报工信息' });
      return;
    }
    
    const good = parseInt(goodQuantity) || 0;
    const rework = parseInt(reworkQuantity) || 0;
    
    if (good === 0) {
      setAlertMessage({ type: 'error', message: '良品数量不能为0' });
      return;
    }
    
    if (rework > 0 && !reworkReason) {
      setAlertMessage({ type: 'error', message: '返工必须填写原因' });
      return;
    }
    
    setLoading(true);
    
    const process = processes.find(p => p.processName === selectedProcess);
    const newGoodQuantity = task.goodQuantity + good;
    
    // 更新任务
    const updatedTask: TailTask = {
      ...task,
      goodQuantity: newGoodQuantity,
      reworkQuantity: task.reworkQuantity + rework,
      completedProcesses: [...task.completedProcesses, selectedProcess],
      pieceWage: task.pieceWage + calculateWage(),
      operator: currentUser.username,
      updatedAt: new Date().toLocaleString('zh-CN'),
    };
    
    // 检查是否还有下一道工序
    const currentProcessIndex = processes.findIndex(p => p.processName === selectedProcess);
    const nextProcess = processes[currentProcessIndex + 1];
    
    if (nextProcess && nextProcess.isActive) {
      updatedTask.currentProcess = nextProcess.processName;
      updatedTask.status = getTaskStatus(nextProcess.processName);
    } else {
      // 所有工序完成
      updatedTask.currentProcess = '';
      updatedTask.status = '已完成';
    }
    
    saveTailTask(updatedTask);
    
    setLoading(false);
    setAlertMessage({ type: 'success', message: '报工成功！' });
    
    setTimeout(() => {
      router.push('/dashboard/tail');
    }, 1500);
  };

  const getTaskStatus = (processName: string): TailTask['status'] => {
    if (processName.includes('整烫')) return '整烫中';
    if (processName.includes('查衫')) return '查衫中';
    if (processName.includes('装箱') || processName.includes('折叠') || processName.includes('袋')) return '包装中';
    return '整烫中';
  };

  if (!task) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => router.push('/dashboard/tail')} className="border-gray-600 text-gray-300 hover:bg-gray-800">
              <ArrowLeft className="w-4 h-4 mr-2" />返回
            </Button>
          </div>
          <Card className="bg-gray-900 border-gray-700">
            <CardContent className="py-12 text-center text-gray-500">
              任务不存在或已失效
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.push('/dashboard/tail')} className="border-gray-600 text-gray-300 hover:bg-gray-800">
            <ArrowLeft className="w-4 h-4 mr-2" />返回
          </Button>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
              <Tag className="w-6 h-6 text-black" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">尾部报工</h1>
              <p className="text-gray-400 text-sm">整烫、查衫、包装等后整工序</p>
            </div>
          </div>
        </div>

        {alertMessage && (
          <Alert variant={alertMessage.type === 'error' ? 'destructive' : 'default'} className={`border-gray-600 ${alertMessage.type === 'success' ? 'bg-green-900 border-green-700' : 'bg-gray-900'}`}>
            <AlertDescription className="text-white">{alertMessage.message}</AlertDescription>
          </Alert>
        )}

        {/* 任务信息 */}
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Package className="w-5 h-5" />
              扎号信息
              <Badge className="bg-blue-600 ml-2">{task.status}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4">
              <div className="p-3 bg-gray-800 rounded-lg">
                <span className="text-gray-400 text-xs">任务编号</span>
                <p className="text-white font-medium">{task.taskNo}</p>
              </div>
              <div className="p-3 bg-gray-800 rounded-lg">
                <span className="text-gray-400 text-xs">扎号</span>
                <p className="text-white">{task.bundleNo}</p>
              </div>
              <div className="p-3 bg-gray-800 rounded-lg">
                <span className="text-gray-400 text-xs">订单号</span>
                <p className="text-white">{task.orderNo}</p>
              </div>
              <div className="p-3 bg-gray-800 rounded-lg">
                <span className="text-gray-400 text-xs">款号/品名</span>
                <p className="text-white">{task.styleNo} - {task.productName}</p>
              </div>
              <div className="p-3 bg-gray-800 rounded-lg">
                <span className="text-gray-400 text-xs">颜色/尺码</span>
                <p className="text-white">{task.colorName} / {task.sizeName}</p>
              </div>
              <div className="p-3 bg-gray-800 rounded-lg">
                <span className="text-gray-400 text-xs">扎号总数</span>
                <p className="text-2xl font-bold text-white">{task.bundleQuantity}</p>
              </div>
              <div className="p-3 bg-gray-800 rounded-lg">
                <span className="text-gray-400 text-xs">当前工序</span>
                <p className="text-yellow-400 font-medium">{task.currentProcess || '-'}</p>
              </div>
              <div className="p-3 bg-gray-800 rounded-lg">
                <span className="text-gray-400 text-xs">已完成工序</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {task.completedProcesses.map(p => (
                    <Badge key={p} className="bg-green-600 text-xs">{p}</Badge>
                  ))}
                  {task.completedProcesses.length === 0 && <span className="text-gray-500">-</span>}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 报工表单 */}
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">报工信息</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <Label className="text-gray-400">工序名称 *</Label>
                <Select value={selectedProcess} onValueChange={setSelectedProcess}>
                  <SelectTrigger className="mt-1 bg-gray-800 border-gray-600 text-white">
                    <SelectValue placeholder="选择工序" />
                  </SelectTrigger>
                  <SelectContent>
                    {processes.map(p => {
                      const isCompleted = task.completedProcesses.includes(p.processName);
                      return (
                        <SelectItem key={p.id} value={p.processName} disabled={isCompleted}>
                          {p.processName} (¥{p.standardPrice.toFixed(2)}/件) {isCompleted ? '✓' : ''}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-gray-400">良品数量 *</Label>
                <Input
                  type="number"
                  value={goodQuantity}
                  onChange={(e) => setGoodQuantity(e.target.value)}
                  className="mt-1 bg-gray-800 border-gray-600 text-white"
                  max={getRemainingQuantity()}
                />
                <p className="text-gray-500 text-xs mt-1">剩余: {getRemainingQuantity()}</p>
              </div>
              <div>
                <Label className="text-gray-400">返工数量</Label>
                <Input
                  type="number"
                  value={reworkQuantity}
                  onChange={(e) => setReworkQuantity(e.target.value)}
                  className="mt-1 bg-gray-800 border-gray-600 text-white"
                />
              </div>
              {parseInt(reworkQuantity) > 0 && (
                <div>
                  <Label className="text-gray-400">返工原因 *</Label>
                  <Select value={reworkReason} onValueChange={(v) => setReworkReason(v as TailReworkReason)}>
                    <SelectTrigger className="mt-1 bg-gray-800 border-gray-600 text-white">
                      <SelectValue placeholder="选择返工原因" />
                    </SelectTrigger>
                    <SelectContent>
                      {reworkReasons.map(r => (
                        <SelectItem key={r} value={r}>{r}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="col-span-2">
                <Label className="text-gray-400">备注</Label>
                <Input
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                  className="mt-1 bg-gray-800 border-gray-600 text-white"
                />
              </div>
            </div>

            {/* 工资计算 */}
            <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-400" />
                  <span className="text-gray-400">计件工资</span>
                </div>
                <span className="text-3xl font-bold text-green-400">¥{calculateWage().toFixed(2)}</span>
              </div>
            </div>

            {/* 提交按钮 */}
            <div className="flex justify-end gap-4">
              <Button variant="outline" onClick={() => router.push('/dashboard/tail')} className="border-gray-600 text-gray-300">
                取消
              </Button>
              <Button onClick={handleSubmit} disabled={loading} className="bg-white text-black hover:bg-gray-200 px-8">
                {loading ? '提交中...' : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    提交报工
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
