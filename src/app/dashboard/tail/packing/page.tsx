'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Box,
  ArrowLeft,
  CheckCircle,
  Package,
} from 'lucide-react';
import {
  type SizeQuantity,
  type PackingBox,
  savePackingBox,
  generateBoxNo,
  initTailData,
} from '@/types/tail';
import { getCurrentUser, type CurrentUser } from '@/types/user';

const cartonSizes = ['60×40×30cm', '50×35×25cm', '40×30×20cm', '70×50×40cm'];

export default function PackingCreatePage() {
  const router = useRouter();
  
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  
  const [orderNo, setOrderNo] = useState('');
  const [styleNo, setStyleNo] = useState('');
  const [productName, setProductName] = useState('');
  const [colorName, setColorName] = useState('');
  const [sizeRatio, setSizeRatio] = useState('S:1,M:2,L:2,XL:1');
  const [sizes, setSizes] = useState<SizeQuantity[]>([]);
  const [cartonSize, setCartonSize] = useState('60×40×30cm');
  const [cartonMaterial, setCartonMaterial] = useState('A=B');
  const [customerPO, setCustomerPO] = useState('');
  const [destination, setDestination] = useState('');
  
  const [alertMessage, setAlertMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);
    initTailData();
  }, []);

  const parseSizeRatio = () => {
    const result: SizeQuantity[] = [];
    const pairs = sizeRatio.split(',');
    pairs.forEach(pair => {
      const [size, ratio] = pair.trim().split(':');
      if (size && ratio) {
        result.push({ sizeName: size.trim(), quantity: parseInt(ratio) || 0 });
      }
    });
    return result;
  };

  const totalQuantity = () => {
    return parseSizeRatio().reduce((sum, s) => sum + s.quantity, 0);
  };

  const calculateWeight = () => {
    const total = totalQuantity();
    const netWeight = total * 0.25; // 假设每件0.25kg
    const grossWeight = netWeight + 1; // 包装重量约1kg
    return { netWeight, grossWeight };
  };

  const handleSizeRatioChange = (value: string) => {
    setSizeRatio(value);
    setSizes(parseSizeRatio());
  };

  const handleSubmit = () => {
    if (!orderNo || !colorName) {
      setAlertMessage({ type: 'error', message: '请填写订单号和颜色' });
      return;
    }
    
    if (totalQuantity() === 0) {
      setAlertMessage({ type: 'error', message: '请填写尺码配比' });
      return;
    }
    
    setLoading(true);
    
    const weights = calculateWeight();
    const newBox: PackingBox = {
      id: Date.now().toString(),
      boxNo: generateBoxNo(),
      orderNo,
      styleNo,
      productName,
      colorName,
      sizeRatio,
      sizes: parseSizeRatio(),
      totalQuantity: totalQuantity(),
      cartonSize,
      cartonMaterial,
      grossWeight: weights.grossWeight,
      netWeight: weights.netWeight,
      customerPO,
      destination,
      status: '装箱中',
      bundleNos: [],
      createdBy: currentUser?.username || '',
      createdAt: new Date().toLocaleString('zh-CN'),
    };
    
    savePackingBox(newBox);
    
    setLoading(false);
    setAlertMessage({ type: 'success', message: `装箱单创建成功！箱号: ${newBox.boxNo}` });
    
    setTimeout(() => {
      router.push('/dashboard/tail');
    }, 1500);
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.push('/dashboard/tail')} className="border-gray-600 text-gray-300 hover:bg-gray-800">
            <ArrowLeft className="w-4 h-4 mr-2" />返回
          </Button>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
              <Box className="w-6 h-6 text-black" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">新增装箱</h1>
              <p className="text-gray-400 text-sm">创建装箱单，生成箱唛</p>
            </div>
          </div>
        </div>

        {alertMessage && (
          <Alert variant={alertMessage.type === 'error' ? 'destructive' : 'default'} className={`border-gray-600 ${alertMessage.type === 'success' ? 'bg-green-900 border-green-700' : 'bg-gray-900'}`}>
            <AlertDescription className="text-white">{alertMessage.message}</AlertDescription>
          </Alert>
        )}

        {/* 订单信息 */}
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Package className="w-5 h-5" />
              订单信息
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label className="text-gray-400">订单号 *</Label>
                <Input value={orderNo} onChange={(e) => setOrderNo(e.target.value)} className="mt-1 bg-gray-800 border-gray-600 text-white" />
              </div>
              <div>
                <Label className="text-gray-400">款号</Label>
                <Input value={styleNo} onChange={(e) => setStyleNo(e.target.value)} className="mt-1 bg-gray-800 border-gray-600 text-white" />
              </div>
              <div>
                <Label className="text-gray-400">品名</Label>
                <Input value={productName} onChange={(e) => setProductName(e.target.value)} className="mt-1 bg-gray-800 border-gray-600 text-white" />
              </div>
              <div>
                <Label className="text-gray-400">颜色 *</Label>
                <Input value={colorName} onChange={(e) => setColorName(e.target.value)} className="mt-1 bg-gray-800 border-gray-600 text-white" />
              </div>
              <div>
                <Label className="text-gray-400">客户PO</Label>
                <Input value={customerPO} onChange={(e) => setCustomerPO(e.target.value)} className="mt-1 bg-gray-800 border-gray-600 text-white" />
              </div>
              <div>
                <Label className="text-gray-400">目的地</Label>
                <Input value={destination} onChange={(e) => setDestination(e.target.value)} className="mt-1 bg-gray-800 border-gray-600 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 装箱信息 */}
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">装箱配码</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-gray-400">尺码配比 (格式: S:1,M:2,L:2,XL:1)</Label>
              <Input value={sizeRatio} onChange={(e) => handleSizeRatioChange(e.target.value)} className="mt-1 bg-gray-800 border-gray-600 text-white" />
            </div>
            
            <div className="grid grid-cols-6 gap-2">
              {parseSizeRatio().map((s, i) => (
                <div key={i} className="p-3 bg-gray-800 rounded-lg text-center">
                  <span className="text-gray-400 text-xs">{s.sizeName}</span>
                  <p className="text-white font-bold text-lg">{s.quantity}</p>
                </div>
              ))}
              <div className="p-3 bg-gray-800 rounded-lg text-center border border-green-600">
                <span className="text-gray-400 text-xs">合计</span>
                <p className="text-green-400 font-bold text-lg">{totalQuantity()}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-400">外箱尺寸</Label>
                <Select value={cartonSize} onValueChange={setCartonSize}>
                  <SelectTrigger className="mt-1 bg-gray-800 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {cartonSizes.map(s => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-gray-400">纸箱材质</Label>
                <Input value={cartonMaterial} onChange={(e) => setCartonMaterial(e.target.value)} className="mt-1 bg-gray-800 border-gray-600 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 重量信息 */}
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">重量信息</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-800 rounded-lg">
                <span className="text-gray-400 text-sm">净重</span>
                <p className="text-2xl font-bold text-white">{calculateWeight().netWeight.toFixed(2)} kg</p>
              </div>
              <div className="p-4 bg-gray-800 rounded-lg">
                <span className="text-gray-400 text-sm">毛重</span>
                <p className="text-2xl font-bold text-white">{calculateWeight().grossWeight.toFixed(2)} kg</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 提交按钮 */}
        <div className="flex justify-end gap-4">
          <Button variant="outline" onClick={() => router.push('/dashboard/tail')} className="border-gray-600 text-gray-300">
            取消
          </Button>
          <Button onClick={handleSubmit} disabled={loading} className="bg-white text-black hover:bg-gray-200 px-8">
            {loading ? '创建中...' : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                创建装箱单
              </>
            )}
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
