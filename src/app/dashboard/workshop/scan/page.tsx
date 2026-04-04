'use client';

import { useState, useEffect, useRef } from 'react';
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
  ScanLine,
  ArrowLeft,
  CheckCircle,
  Package,
  Tag,
  FileText,
  DollarSign,
} from 'lucide-react';
import {
  type Bundle,
  type StandardProcess,
  type ScrapReason,
  type WorkReport,
  getBundleByNo,
  getProcesses,
  saveWorkReport,
  saveBundle,
  generateReportNo,
  initWorkshopData,
  getWorkReports,
} from '@/types/workshop';
import { getCurrentUser, type CurrentUser } from '@/types/user';

const scrapReasons: ScrapReason[] = ['裁片问题', '缝制不良', '辅料问题', '人为失误', '其他'];

export default function WorkshopScanPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const scanInputRef = useRef<HTMLInputElement>(null);
  
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [bundleNo, setBundleNo] = useState('');
  const [bundle, setBundle] = useState<Bundle | null>(null);
  const [processes, setProcesses] = useState<StandardProcess[]>([]);
  const [existingReports, setExistingReports] = useState<WorkReport[]>([]);
  
  const [selectedProcess, setSelectedProcess] = useState('');
  const [goodQuantity, setGoodQuantity] = useState('');
  const [reworkQuantity, setReworkQuantity] = useState('0');
  const [scrapQuantity, setScrapQuantity] = useState('0');
  const [scrapReason, setScrapReason] = useState<ScrapReason | ''>('');
  const [remark, setRemark] = useState('');
  
  const [alertMessage, setAlertMessage] = useState<{ type: 'success' | 'error' | 'warning'; message: string } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);
    initWorkshopData();
    setProcesses(getProcesses().filter(p => p.isActive));
    
    // 如果URL有扎号参数，自动填入
    const bundleParam = searchParams.get('bundle');
    if (bundleParam) {
      setBundleNo(bundleParam);
      handleScanBundle(bundleParam);
    }
    
    // 自动聚焦扫描输入框
    setTimeout(() => {
      scanInputRef.current?.focus();
    }, 100);
  }, [searchParams]);

  const handleScanBundle = (scannedNo: string) => {
    if (!scannedNo.trim()) return;
    
    const foundBundle = getBundleByNo(scannedNo.trim());
    if (!foundBundle) {
      setAlertMessage({ type: 'error', message: '扎号不存在，请检查条码' });
      setBundle(null);
      return;
    }
    
    if (foundBundle.status === '已转入尾部') {
      setAlertMessage({ type: 'warning', message: '该扎号已转入尾部工序' });
      setBundle(null);
      return;
    }
    
    setBundle(foundBundle);
    setExistingReports(getWorkReports().filter(r => r.bundleNo === foundBundle.bundleNo && r.status !== '已作废'));
    
    // 自动选择当前工序
    if (foundBundle.currentProcess) {
      setSelectedProcess(foundBundle.currentProcess);
    }
    
    setGoodQuantity('');
    setReworkQuantity('0');
    setScrapQuantity('0');
    setScrapReason('');
    setRemark('');
    setAlertMessage(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleScanBundle(bundleNo);
    }
  };

  const calculateWage = () => {
    const process = processes.find(p => p.processName === selectedProcess);
    const good = parseInt(goodQuantity) || 0;
    const price = process?.standardPrice || 0;
    return good * price;
  };

  const getRemainingQuantity = () => {
    if (!bundle) return 0;
    const reportedGood = existingReports
      .filter(r => r.processName === selectedProcess)
      .reduce((sum, r) => sum + r.goodQuantity, 0);
    return bundle.totalQuantity - reportedGood;
  };

  const canReport = () => {
    if (!bundle || !selectedProcess) return false;
    
    const processIndex = processes.findIndex(p => p.processName === selectedProcess);
    
    // 必须按工序顺序报工
    if (processIndex > 0) {
      const prevProcess = processes[processIndex - 1];
      if (!bundle.completedProcesses.includes(prevProcess.processName)) {
        return false;
      }
    }
    
    // 检查是否已报过此工序
    if (bundle.completedProcesses.includes(selectedProcess)) {
      return false;
    }
    
    return true;
  };

  const handleSubmit = () => {
    if (!bundle || !selectedProcess || !currentUser) {
      setAlertMessage({ type: 'error', message: '请完善报工信息' });
      return;
    }
    
    const good = parseInt(goodQuantity) || 0;
    const rework = parseInt(reworkQuantity) || 0;
    const scrap = parseInt(scrapQuantity) || 0;
    const remaining = getRemainingQuantity();
    
    if (good === 0) {
      setAlertMessage({ type: 'error', message: '良品数量不能为0' });
      return;
    }
    
    if (good + rework + scrap > remaining) {
      setAlertMessage({ type: 'error', message: `报工数量不能超过剩余数量 ${remaining}` });
      return;
    }
    
    if (scrap > 0 && !scrapReason) {
      setAlertMessage({ type: 'error', message: '报废必须填写原因' });
      return;
    }
    
    if (!canReport()) {
      setAlertMessage({ type: 'error', message: '必须按工序顺序报工，或该工序已完成' });
      return;
    }
    
    setLoading(true);
    
    const process = processes.find(p => p.processName === selectedProcess);
    const newReport: WorkReport = {
      id: Date.now().toString(),
      reportNo: generateReportNo(),
      bundleNo: bundle.bundleNo,
      orderNo: bundle.orderNo,
      bomNo: bundle.bomNo,
      styleNo: bundle.styleNo,
      productName: bundle.productName,
      colorName: bundle.colorName,
      sizeName: bundle.sizeName,
      bundleQuantity: bundle.totalQuantity,
      processName: selectedProcess,
      processCode: process?.processCode || '',
      processPrice: process?.standardPrice || 0,
      goodQuantity: good,
      reworkQuantity: rework,
      scrapQuantity: scrap,
      scrapReason: scrap > 0 ? scrapReason as ScrapReason : undefined,
      pieceWage: calculateWage(),
      worker: currentUser.username,
      team: '缝制一组',
      status: '待审核',
      remark,
      createdAt: new Date().toLocaleString('zh-CN'),
      updatedAt: new Date().toLocaleString('zh-CN'),
    };
    
    saveWorkReport(newReport);
    
    // 更新扎号状态
    const updatedBundle: Bundle = {
      ...bundle,
      status: '缝制中',
      updatedAt: new Date().toLocaleString('zh-CN'),
    };
    saveBundle(updatedBundle);
    
    setLoading(false);
    setAlertMessage({ type: 'success', message: `报工成功！报工单号: ${newReport.reportNo}` });
    
    // 清空表单，准备下一次扫描
    setTimeout(() => {
      setBundleNo('');
      setBundle(null);
      setExistingReports([]);
      setSelectedProcess('');
      setGoodQuantity('');
      setReworkQuantity('0');
      setScrapQuantity('0');
      setScrapReason('');
      setRemark('');
      setAlertMessage(null);
      scanInputRef.current?.focus();
    }, 2000);
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.push('/dashboard/workshop')} className="border-gray-600 text-gray-300 hover:bg-gray-800">
            <ArrowLeft className="w-4 h-4 mr-2" />返回
          </Button>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
              <ScanLine className="w-6 h-6 text-black" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">扫码报工</h1>
              <p className="text-gray-400 text-sm">扫描扎号条码进行报工</p>
            </div>
          </div>
        </div>

        {alertMessage && (
          <Alert variant={alertMessage.type === 'error' ? 'destructive' : 'default'} className={`border-gray-600 ${alertMessage.type === 'success' ? 'bg-green-900 border-green-700' : alertMessage.type === 'warning' ? 'bg-yellow-900 border-yellow-700' : 'bg-gray-900'}`}>
            <AlertDescription className="text-white">{alertMessage.message}</AlertDescription>
          </Alert>
        )}

        {/* 扫描输入区 */}
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <ScanLine className="w-5 h-5" />
              扫描扎号条码
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  ref={scanInputRef}
                  placeholder="请扫描或输入扎号条码..."
                  value={bundleNo}
                  onChange={(e) => setBundleNo(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="h-12 text-lg bg-gray-800 border-gray-600 text-white"
                />
              </div>
              <Button onClick={() => handleScanBundle(bundleNo)} className="h-12 px-8 bg-white text-black hover:bg-gray-200">
                查询
              </Button>
            </div>
          </CardContent>
        </Card>

        {bundle && (
          <>
            {/* 扎号信息 */}
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  扎号信息
                  <Badge className="bg-blue-600 ml-2">{bundle.status}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-4">
                  <div className="p-3 bg-gray-800 rounded-lg">
                    <span className="text-gray-400 text-xs">扎号编号</span>
                    <p className="text-white font-medium text-lg">{bundle.bundleNo}</p>
                  </div>
                  <div className="p-3 bg-gray-800 rounded-lg">
                    <span className="text-gray-400 text-xs">订单号</span>
                    <p className="text-white">{bundle.orderNo}</p>
                  </div>
                  <div className="p-3 bg-gray-800 rounded-lg">
                    <span className="text-gray-400 text-xs">款号/品名</span>
                    <p className="text-white">{bundle.styleNo} - {bundle.productName}</p>
                  </div>
                  <div className="p-3 bg-gray-800 rounded-lg">
                    <span className="text-gray-400 text-xs">颜色/尺码</span>
                    <p className="text-white">{bundle.colorName} / {bundle.sizeName}</p>
                  </div>
                  <div className="p-3 bg-gray-800 rounded-lg">
                    <span className="text-gray-400 text-xs">扎号总数</span>
                    <p className="text-2xl font-bold text-white">{bundle.totalQuantity}</p>
                  </div>
                  <div className="p-3 bg-gray-800 rounded-lg">
                    <span className="text-gray-400 text-xs">当前工序</span>
                    <p className="text-yellow-400 font-medium">{bundle.currentProcess || '-'}</p>
                  </div>
                  <div className="p-3 bg-gray-800 rounded-lg">
                    <span className="text-gray-400 text-xs">已完成工序</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {bundle.completedProcesses.map(p => (
                        <Badge key={p} className="bg-green-600 text-xs">{p}</Badge>
                      ))}
                      {bundle.completedProcesses.length === 0 && <span className="text-gray-500">-</span>}
                    </div>
                  </div>
                  <div className="p-3 bg-gray-800 rounded-lg">
                    <span className="text-gray-400 text-xs">床次号</span>
                    <p className="text-white">{bundle.bedNo}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 报工表单 */}
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  报工信息
                </CardTitle>
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
                          const isCompleted = bundle.completedProcesses.includes(p.processName);
                          const canReportThis = !isCompleted && canReportByOrder(p.processName);
                          return (
                            <SelectItem key={p.id} value={p.processName} disabled={!canReportThis}>
                              {p.processName} (¥{p.standardPrice.toFixed(2)}/件) {isCompleted ? '✓' : ''}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                    <p className="text-gray-500 text-xs mt-1">
                      剩余可报: <span className="text-yellow-400">{getRemainingQuantity()}</span> 件
                    </p>
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
                  <div>
                    <Label className="text-gray-400">报废数量</Label>
                    <Input
                      type="number"
                      value={scrapQuantity}
                      onChange={(e) => setScrapQuantity(e.target.value)}
                      className="mt-1 bg-gray-800 border-gray-600 text-white"
                    />
                  </div>
                  {parseInt(scrapQuantity) > 0 && (
                    <div>
                      <Label className="text-gray-400">报废原因 *</Label>
                      <Select value={scrapReason} onValueChange={(v) => setScrapReason(v as ScrapReason)}>
                        <SelectTrigger className="mt-1 bg-gray-800 border-gray-600 text-white">
                          <SelectValue placeholder="选择报废原因" />
                        </SelectTrigger>
                        <SelectContent>
                          {scrapReasons.map(r => (
                            <SelectItem key={r} value={r}>{r}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  <div>
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
                  <p className="text-gray-500 text-sm mt-1">
                    = 良品 {goodQuantity || 0} 件 × 单价 ¥{processes.find(p => p.processName === selectedProcess)?.standardPrice.toFixed(2) || '0.00'}
                  </p>
                </div>

                {/* 提交按钮 */}
                <div className="flex justify-end gap-4">
                  <Button variant="outline" onClick={() => router.push('/dashboard/workshop')} className="border-gray-600 text-gray-300">
                    取消
                  </Button>
                  <Button onClick={handleSubmit} disabled={loading || !canReport()} className="bg-white text-black hover:bg-gray-200 px-8">
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

            {/* 已报工记录 */}
            {existingReports.length > 0 && (
              <Card className="bg-gray-900 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Tag className="w-5 h-5" />
                    该扎号已报工记录
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {existingReports.map(r => (
                      <div key={r.id} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                        <div className="flex items-center gap-4">
                          <span className="text-white font-medium">{r.processName}</span>
                          <span className="text-gray-400">良品: {r.goodQuantity}</span>
                          {r.scrapQuantity > 0 && <span className="text-red-400">报废: {r.scrapQuantity}</span>}
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-green-400">¥{r.pieceWage.toFixed(2)}</span>
                          <Badge className={r.status === '已审核' ? 'bg-green-600' : r.status === '待审核' ? 'bg-yellow-600' : 'bg-gray-600'}>
                            {r.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* 提示信息 */}
        {!bundle && (
          <Card className="bg-gray-900 border-gray-700 border-dashed">
            <CardContent className="py-12 text-center">
              <ScanLine className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">请扫描扎号条码开始报工</p>
              <p className="text-gray-500 text-sm mt-2">支持条码枪扫描或手动输入扎号编号</p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );

  function canReportByOrder(processName: string): boolean {
    const processIndex = processes.findIndex(p => p.processName === processName);
    if (processIndex <= 0) return true;
    
    const prevProcess = processes[processIndex - 1];
    return bundle!.completedProcesses.includes(prevProcess.processName);
  }
}
