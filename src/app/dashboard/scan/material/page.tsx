'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  ScanLine,
  Package,
  ArrowUpDown,
  CheckCircle,
  XCircle,
  Camera,
  Keyboard,
  Loader2,
  AlertTriangle,
  Warehouse,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MaterialQrcode {
  id: string;
  qrcodeNo: string;
  materialCode: string;
  materialName: string;
  batchNo: string;
  quantity: number;
  unit: string;
  status: string;
}

export default function MaterialScanPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  const [mode, setMode] = useState<'scan' | 'input'>('scan');
  const [scanning, setScanning] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [manualInput, setManualInput] = useState('');
  const [action, setAction] = useState<'入库' | '出库' | '领料'>('入库');
  const [location, setLocation] = useState('');
  const [currentQrcode, setCurrentQrcode] = useState<MaterialQrcode | null>(null);
  const [processing, setProcessing] = useState(false);

  // 初始化摄像头
  const initCamera = useCallback(async () => {
    try {
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (error) {
      console.error('摄像头初始化失败:', error);
      setCameraError('无法访问摄像头，请检查权限设置');
    }
  }, []);

  // 停止摄像头
  const stopCamera = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
  }, []);

  // 扫描二维码
  const scanQrcode = useCallback(async (qrcodeNo: string) => {
    if (processing) return;

    setProcessing(true);
    try {
      // 验证二维码格式
      if (!qrcodeNo.startsWith('MAT')) {
        throw new Error('无效的物料二维码');
      }

      // 调用扫描API
      const response = await fetch('/api/qrcode/scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          qrcodeNo,
          action,
          location: location || '默认库位',
          operatorId: 'current-user-id', // 这里应该从认证上下文获取
          operatorName: '当前用户', // 这里应该从认证上下文获取
        }),
      });

      const result = await response.json();

      if (result.code === 200) {
        setCurrentQrcode(result.data.qrcode);
        toast({
          title: '扫描成功',
          description: `${action}操作完成：${result.data.qrcode.materialName} ${result.data.quantity}${result.data.unit}`,
        });

        // 清空输入
        setManualInput('');
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('扫描失败:', error);
      toast({
        title: '扫描失败',
        description: error instanceof Error ? error.message : '未知错误',
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  }, [action, location, processing, toast]);

  // 处理拍照扫描
  const handleScan = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // 这里应该集成二维码识别库，如jsQR
    // 暂时模拟扫描结果
    const mockQrcodeNo = `MAT${Date.now().toString().slice(-6)}`;
    scanQrcode(mockQrcodeNo);
  }, [scanQrcode]);

  // 处理手动输入
  const handleManualSubmit = () => {
    if (manualInput.trim()) {
      scanQrcode(manualInput.trim());
    }
  };

  useEffect(() => {
    if (mode === 'scan') {
      initCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [mode, initCamera, stopCamera]);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* 头部 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            物料二维码扫描
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            扫描物料二维码进行入库、出库或领料操作
          </p>
        </div>

        {/* 操作配置 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              操作配置
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="action">操作类型</Label>
                <Select value={action} onValueChange={(value: '入库' | '出库' | '领料') => setAction(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="入库">
                      <div className="flex items-center gap-2">
                        <ArrowUpDown className="w-4 h-4 text-green-600" />
                        入库
                      </div>
                    </SelectItem>
                    <SelectItem value="出库">
                      <div className="flex items-center gap-2">
                        <ArrowUpDown className="w-4 h-4 text-red-600" />
                        出库
                      </div>
                    </SelectItem>
                    <SelectItem value="领料">
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-blue-600" />
                        领料
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="location">库位</Label>
                <Input
                  id="location"
                  placeholder="输入库位位置"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>

              <div>
                <Label>扫描模式</Label>
                <div className="flex gap-2 mt-2">
                  <Button
                    variant={mode === 'scan' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setMode('scan')}
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    摄像头扫描
                  </Button>
                  <Button
                    variant={mode === 'input' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setMode('input')}
                  >
                    <Keyboard className="w-4 h-4 mr-2" />
                    手动输入
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 扫描区域 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 扫描界面 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {mode === 'scan' ? (
                  <>
                    <Camera className="w-5 h-5" />
                    摄像头扫描
                  </>
                ) : (
                  <>
                    <Keyboard className="w-5 h-5" />
                    手动输入
                  </>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {mode === 'scan' ? (
                <div className="space-y-4">
                  {cameraError ? (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>{cameraError}</AlertDescription>
                    </Alert>
                  ) : (
                    <div className="relative">
                      <video
                        ref={videoRef}
                        className="w-full h-64 bg-black rounded-lg"
                        playsInline
                        muted
                      />
                      <canvas ref={canvasRef} className="hidden" />
                      <div className="absolute inset-0 border-2 border-dashed border-blue-500 rounded-lg pointer-events-none">
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                          <ScanLine className="w-16 h-16 text-blue-500" />
                        </div>
                      </div>
                    </div>
                  )}

                  <Button
                    onClick={handleScan}
                    disabled={scanning || !!cameraError || processing}
                    className="w-full"
                  >
                    {processing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        处理中...
                      </>
                    ) : (
                      <>
                        <ScanLine className="w-4 h-4 mr-2" />
                        扫描二维码
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="qrcode-input">二维码编号</Label>
                    <Input
                      id="qrcode-input"
                      placeholder="输入二维码编号 (如: MAT202604001001)"
                      value={manualInput}
                      onChange={(e) => setManualInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleManualSubmit()}
                    />
                  </div>

                  <Button
                    onClick={handleManualSubmit}
                    disabled={!manualInput.trim() || processing}
                    className="w-full"
                  >
                    {processing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        处理中...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        确认操作
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 操作结果 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Warehouse className="w-5 h-5" />
                操作结果
              </CardTitle>
            </CardHeader>
            <CardContent>
              {currentQrcode ? (
                <div className="space-y-4">
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      {action}操作成功！
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">二维码编号:</span>
                      <Badge variant="outline">{currentQrcode.qrcodeNo}</Badge>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">物料名称:</span>
                      <span className="text-sm">{currentQrcode.materialName}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">物料编码:</span>
                      <span className="text-sm">{currentQrcode.materialCode}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">批次号:</span>
                      <span className="text-sm">{currentQrcode.batchNo}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">数量:</span>
                      <span className="text-sm font-semibold">
                        {currentQrcode.quantity} {currentQrcode.unit}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">操作类型:</span>
                      <Badge
                        variant={
                          action === '入库' ? 'default' :
                          action === '出库' ? 'destructive' : 'secondary'
                        }
                      >
                        {action}
                      </Badge>
                    </div>

                    {location && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-600">库位:</span>
                        <span className="text-sm">{location}</span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>暂无操作结果</p>
                  <p className="text-sm mt-2">请先扫描二维码进行操作</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 使用说明 */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>使用说明</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <h4 className="font-medium mb-2">📱 摄像头扫描</h4>
                <p className="text-gray-600">将二维码对准摄像头框内，点击扫描按钮</p>
              </div>
              <div>
                <h4 className="font-medium mb-2">⌨️ 手动输入</h4>
                <p className="text-gray-600">切换到手动输入模式，直接输入二维码编号</p>
              </div>
              <div>
                <h4 className="font-medium mb-2">⚙️ 操作配置</h4>
                <p className="text-gray-600">选择操作类型（入库/出库/领料）和库位位置</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}