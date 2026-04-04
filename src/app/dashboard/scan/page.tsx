'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  ScanLine,
  Keyboard,
  History,
  User,
  Package,
  Palette,
  Hash,
  CheckCircle,
  XCircle,
  Camera,
  SwitchCamera,
  Loader2,
  ChevronRight,
  Shirt,
  Clock,
} from 'lucide-react';
import {
  type Bundle,
  type StandardProcess,
  getBundleByNo,
  getProcesses,
  initWorkshopData,
  saveWorkReport,
  generateReportNo,
} from '@/types/workshop';

export default function ScanPage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [mode, setMode] = useState<'scan' | 'input'>('scan');
  const [scanning, setScanning] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [manualInput, setManualInput] = useState('');
  const [bundle, setBundle] = useState<Bundle | null>(null);
  const [processes, setProcesses] = useState<StandardProcess[]>([]);
  const [selectedProcess, setSelectedProcess] = useState<string>('');
  const [goodQty, setGoodQty] = useState<number>(0);
  const [reworkQty, setReworkQty] = useState<number>(0);
  const [scrapQty, setScrapQty] = useState<number>(0);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [currentWorker, setCurrentWorker] = useState<string>('王五');
  const [currentTeam, setCurrentTeam] = useState<string>('缝制一组');

  useEffect(() => {
    initWorkshopData();
    setProcesses(getProcesses());
    
    // 尝试启动摄像头
    startCamera();
    
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setScanning(true);
      }
    } catch (err: unknown) {
      console.error('摄像头错误:', err);
      setCameraError('无法访问摄像头，请使用手动输入');
      setScanning(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
    }
  };

  const handleScan = useCallback(() => {
    // 模拟扫码结果
    const testBundleNos = ['BN20250101001', 'BN20250101002', 'ZY20260401001'];
    const randomBundle = testBundleNos[Math.floor(Math.random() * testBundleNos.length)];
    lookupBundle(randomBundle);
  }, []);

  const handleManualInput = () => {
    if (manualInput.trim()) {
      lookupBundle(manualInput.trim());
    }
  };

  const lookupBundle = (bundleNo: string) => {
    setMessage(null);
    
    // 查找扎号
    let foundBundle = getBundleByNo(bundleNo);
    
    if (!foundBundle) {
      // 模拟数据用于演示
      foundBundle = {
        id: Date.now().toString(),
        bundleNo: bundleNo,
        orderNo: 'ORD20260401001',
        bomNo: 'BOM20260401001',
        styleNo: 'ST001',
        productName: '男士T恤',
        colorName: '白色',
        sizeName: 'M',
        totalQuantity: 20,
        cuttedQuantity: 20,
        currentProcess: '合肩',
        completedProcesses: [],
        status: '待缝制',
        bedNo: 'BED20260401001',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }
    
    setBundle(foundBundle);
    setGoodQty(foundBundle.totalQuantity);
    setReworkQty(0);
    setScrapQty(0);
    setSelectedProcess(foundBundle.currentProcess || processes[0]?.processName || '');
  };

  const handleReport = async () => {
    if (!bundle || !selectedProcess) {
      setMessage({ type: 'error', text: '请选择工序' });
      return;
    }
    
    if (goodQty + reworkQty + scrapQty > bundle.totalQuantity) {
      setMessage({ type: 'error', text: '数量超出扎号总数' });
      return;
    }
    
    setSubmitting(true);
    
    // 模拟提交延迟
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const process = processes.find(p => p.processName === selectedProcess);
    const report = {
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
      goodQuantity: goodQty,
      reworkQuantity: reworkQty,
      scrapQuantity: scrapQty,
      pieceWage: goodQty * (process?.standardPrice || 0),
      worker: currentWorker,
      team: currentTeam,
      status: '待审核' as const,
      remark: '',
      createdAt: new Date().toLocaleString('zh-CN'),
      updatedAt: new Date().toLocaleString('zh-CN'),
    };
    
    saveWorkReport(report);
    
    setMessage({ type: 'success', text: `报工成功！报工号: ${report.reportNo}` });
    setBundle(null);
    setManualInput('');
    
    setSubmitting(false);
  };

  const resetScan = () => {
    setBundle(null);
    setManualInput('');
    setMessage(null);
    setGoodQty(0);
    setReworkQty(0);
    setScrapQty(0);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* 顶部状态栏 */}
      <div className="bg-primary text-primary-foreground px-4 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <ScanLine className="w-6 h-6" />
          <span className="font-bold text-lg">扫码报工</span>
        </div>
        <div className="flex items-center gap-2">
          <User className="w-5 h-5" />
          <span className="text-sm">{currentWorker}</span>
        </div>
      </div>

      <div className="max-w-lg mx-auto p-4 space-y-4 pb-20">
        {/* 消息提示 */}
        {message && (
          <Alert variant={message.type === 'error' ? 'destructive' : 'default'} className={message.type === 'success' ? 'bg-green-50 border-green-200' : ''}>
            {message.type === 'success' ? <CheckCircle className="w-4 h-4 text-green-600" /> : <XCircle className="w-4 h-4" />}
            <AlertDescription className={message.type === 'success' ? 'text-green-700' : ''}>{message.text}</AlertDescription>
          </Alert>
        )}

        {/* 模式切换 */}
        <div className="flex gap-2">
          <Button 
            variant={mode === 'scan' ? 'default' : 'outline'} 
            className="flex-1"
            onClick={() => { setMode('scan'); startCamera(); }}
          >
            <Camera className="w-4 h-4 mr-2" />扫码
          </Button>
          <Button 
            variant={mode === 'input' ? 'default' : 'outline'} 
            className="flex-1"
            onClick={() => { setMode('input'); stopCamera(); }}
          >
            <Keyboard className="w-4 h-4 mr-2" />手动输入
          </Button>
        </div>

        {/* 扫码区域 */}
        {mode === 'scan' && !bundle && (
          <Card>
            <CardContent className="p-4">
              <div className="relative aspect-square bg-black rounded-lg overflow-hidden mb-4">
                {scanning ? (
                  <>
                    <video 
                      ref={videoRef} 
                      className="w-full h-full object-cover"
                      playsInline
                      muted
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-48 h-48 border-2 border-white/50 rounded-lg">
                        <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-lg" />
                        <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-lg" />
                        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-lg" />
                        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-lg" />
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-white gap-4">
                    <Camera className="w-16 h-16 opacity-50" />
                    <p className="text-sm opacity-75">点击下方按钮启动摄像头</p>
                  </div>
                )}
                <canvas ref={canvasRef} className="hidden" />
              </div>
              
              {cameraError && (
                <p className="text-sm text-orange-600 text-center mb-4">{cameraError}</p>
              )}
              
              <div className="flex gap-2">
                <Button onClick={startCamera} className="flex-1" disabled={scanning}>
                  {scanning ? '摄像头已启动' : '启动摄像头'}
                </Button>
                <Button onClick={handleScan} variant="secondary">
                  模拟扫码
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 手动输入 */}
        {mode === 'input' && !bundle && (
          <Card>
            <CardContent className="p-4">
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">扎号/菲票号</label>
                  <Input
                    placeholder="输入扎号如：BN20250101001"
                    value={manualInput}
                    onChange={(e) => setManualInput(e.target.value)}
                    className="text-lg"
                  />
                </div>
                <Button onClick={handleManualInput} className="w-full" disabled={!manualInput.trim()}>
                  查询
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 扎号信息 */}
        {bundle && (
          <>
            <Card className="border-primary">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Package className="w-5 h-5 text-primary" />
                    <span className="font-bold text-lg">{bundle.bundleNo}</span>
                  </div>
                  <Badge className="bg-primary text-white">{bundle.status}</Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Shirt className="w-4 h-4 text-muted-foreground" />
                    <span>{bundle.styleNo} {bundle.productName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Palette className="w-4 h-4 text-muted-foreground" />
                    <span>{bundle.colorName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Hash className="w-4 h-4 text-muted-foreground" />
                    <span>尺码: <Badge variant="outline">{bundle.sizeName}</Badge></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-muted-foreground" />
                    <span className="font-bold text-lg">{bundle.totalQuantity}件</span>
                  </div>
                </div>
                
                {bundle.currentProcess && (
                  <div className="mt-3 pt-3 border-t">
                    <div className="text-sm text-muted-foreground">当前工序</div>
                    <div className="font-medium">{bundle.currentProcess}</div>
                    {bundle.completedProcesses.length > 0 && (
                      <div className="text-xs text-muted-foreground mt-1">
                        已完成: {bundle.completedProcesses.join(' → ')}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 报工表单 */}
            <Card>
              <CardContent className="p-4 space-y-4">
                <div className="font-medium flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  报工信息
                </div>
                
                {/* 工序选择 */}
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">选择工序</label>
                  <div className="grid grid-cols-2 gap-2">
                    {processes.slice(0, 6).map(p => (
                      <Button
                        key={p.id}
                        variant={selectedProcess === p.processName ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedProcess(p.processName)}
                        className="justify-start"
                      >
                        {p.processName}
                        <span className="ml-auto text-xs opacity-70">¥{p.standardPrice}</span>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* 数量输入 */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-sm text-muted-foreground mb-1 block">良品数</label>
                    <Input
                      type="number"
                      value={goodQty}
                      onChange={(e) => setGoodQty(parseInt(e.target.value) || 0)}
                      className="text-center text-lg font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-1 block">返工数</label>
                    <Input
                      type="number"
                      value={reworkQty}
                      onChange={(e) => setReworkQty(parseInt(e.target.value) || 0)}
                      className="text-center"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-1 block">报废数</label>
                    <Input
                      type="number"
                      value={scrapQty}
                      onChange={(e) => setScrapQty(parseInt(e.target.value) || 0)}
                      className="text-center"
                    />
                  </div>
                </div>

                {/* 计件工资预览 */}
                {selectedProcess && (
                  <div className="bg-muted/50 rounded-lg p-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">计件工资</span>
                      <span className="text-xl font-bold text-primary">
                        ¥{(goodQty * (processes.find(p => p.processName === selectedProcess)?.standardPrice || 0)).toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}

                {/* 操作按钮 */}
                <div className="flex gap-2">
                  <Button variant="outline" onClick={resetScan} className="flex-1">
                    取消
                  </Button>
                  <Button onClick={handleReport} disabled={submitting} className="flex-1">
                    {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                    确认报工
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* 快捷操作 */}
        <div className="grid grid-cols-2 gap-3">
          <Link href="/dashboard/scan/history">
            <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                  <History className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div className="font-medium">报工记录</div>
                  <div className="text-xs text-muted-foreground">查看历史报工</div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground ml-auto" />
              </CardContent>
            </Card>
          </Link>
          
          <Link href="/dashboard/scan/worker">
            <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                  <User className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <div className="font-medium">我的信息</div>
                  <div className="text-xs text-muted-foreground">员工/班组</div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground ml-auto" />
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* 今日统计 */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-5 h-5 text-muted-foreground" />
              <span className="font-medium">今日统计</span>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-primary">3</div>
                <div className="text-xs text-muted-foreground">报工次数</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">120</div>
                <div className="text-xs text-muted-foreground">良品数</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">¥68.5</div>
                <div className="text-xs text-muted-foreground">计件工资</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 底部导航 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t flex justify-around py-2 z-50">
        <Link href="/dashboard/scan" className="flex flex-col items-center text-primary">
          <ScanLine className="w-6 h-6" />
          <span className="text-xs mt-1">扫码</span>
        </Link>
        <Link href="/dashboard/scan/history" className="flex flex-col items-center text-muted-foreground">
          <History className="w-6 h-6" />
          <span className="text-xs mt-1">记录</span>
        </Link>
        <Link href="/dashboard/scan/worker" className="flex flex-col items-center text-muted-foreground">
          <User className="w-6 h-6" />
          <span className="text-xs mt-1">我的</span>
        </Link>
      </div>
    </div>
  );
}
