'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, CheckCircle, Wallet } from 'lucide-react';
import {
  type Payable,
  type PaymentRecord,
  getPayables,
  savePayable,
  initFinanceData,
} from '@/types/finance';
import { getCurrentUser, type CurrentUser } from '@/types/user';

export default function PaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [payable, setPayable] = useState<Payable | null>(null);
  
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'银行转账' | '现金' | '支票' | '其他'>('银行转账');
  const [remark, setRemark] = useState('');
  
  const [alertMessage, setAlertMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);
    initFinanceData();
    
    const id = searchParams.get('id');
    if (id) {
      const payables = getPayables();
      const found = payables.find(p => p.id === id);
      if (found) {
        setPayable(found);
      }
    }
  }, [searchParams]);

  const handleSubmit = () => {
    if (!payable || !currentUser) return;
    
    const amount = parseFloat(paymentAmount);
    if (!amount || amount <= 0) {
      setAlertMessage({ type: 'error', message: '请输入有效的付款金额' });
      return;
    }
    
    if (amount > payable.unpaidAmount) {
      setAlertMessage({ type: 'error', message: '付款金额不能超过未付金额' });
      return;
    }
    
    setLoading(true);
    
    const payment: PaymentRecord = {
      id: Date.now().toString(),
      paymentNo: `PAY${Date.now()}`,
      payableNo: payable.payableNo,
      amount,
      paymentDate: new Date().toLocaleDateString('zh-CN'),
      paymentMethod,
      remark,
      operator: currentUser.username,
    };
    
    const newPaidAmount = payable.paidAmount + amount;
    const newUnpaidAmount = payable.unpaidAmount - amount;
    
    const updatedPayable: Payable = {
      ...payable,
      paidAmount: newPaidAmount,
      unpaidAmount: newUnpaidAmount,
      paymentStatus: newUnpaidAmount === 0 ? '已付款' : '部分付款',
      payments: [...payable.payments, payment],
      updatedAt: new Date().toLocaleString('zh-CN'),
    };
    
    savePayable(updatedPayable);
    
    setLoading(false);
    setAlertMessage({ type: 'success', message: `付款成功！付款金额: ¥${amount.toFixed(2)}` });
    
    setTimeout(() => {
      router.push('/dashboard/finance');
    }, 1500);
  };

  if (!payable) {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto space-y-6">
          <Button variant="outline" onClick={() => router.push('/dashboard/finance')} className="border-gray-600 text-gray-300 hover:bg-gray-800">
            <ArrowLeft className="w-4 h-4 mr-2" />返回
          </Button>
          <Card className="bg-gray-900 border-gray-700">
            <CardContent className="py-12 text-center text-gray-500">
              应付单不存在或已失效
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.push('/dashboard/finance')} className="border-gray-600 text-gray-300 hover:bg-gray-800">
            <ArrowLeft className="w-4 h-4 mr-2" />返回
          </Button>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
              <Wallet className="w-6 h-6 text-black" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">付款登记</h1>
              <p className="text-gray-400 text-sm">登记供应商付款</p>
            </div>
          </div>
        </div>

        {alertMessage && (
          <Alert variant={alertMessage.type === 'error' ? 'destructive' : 'default'} className={`border-gray-600 ${alertMessage.type === 'success' ? 'bg-green-900 border-green-700' : 'bg-gray-900'}`}>
            <AlertDescription className="text-white">{alertMessage.message}</AlertDescription>
          </Alert>
        )}

        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">应付信息</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-gray-800 rounded-lg">
                <span className="text-gray-400 text-xs">应付编号</span>
                <p className="text-white font-medium">{payable.payableNo}</p>
              </div>
              <div className="p-3 bg-gray-800 rounded-lg">
                <span className="text-gray-400 text-xs">供应商</span>
                <p className="text-white">{payable.supplierName}</p>
              </div>
              <div className="p-3 bg-gray-800 rounded-lg">
                <span className="text-gray-400 text-xs">应付总额</span>
                <p className="text-white font-bold">¥{payable.totalAmount.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-gray-800 rounded-lg">
                <span className="text-gray-400 text-xs">未付金额</span>
                <p className="text-red-400 font-bold text-xl">¥{payable.unpaidAmount.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">付款信息</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-gray-400">付款金额 *</Label>
              <Input type="number" value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)} className="mt-1 bg-gray-800 border-gray-600 text-white" placeholder={`最大可付: ¥${payable.unpaidAmount}`} />
            </div>
            <div>
              <Label className="text-gray-400">付款方式</Label>
              <Select value={paymentMethod} onValueChange={(v: any) => setPaymentMethod(v)}>
                <SelectTrigger className="mt-1 bg-gray-800 border-gray-600 text-white"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="银行转账">银行转账</SelectItem>
                  <SelectItem value="现金">现金</SelectItem>
                  <SelectItem value="支票">支票</SelectItem>
                  <SelectItem value="其他">其他</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-gray-400">备注</Label>
              <Input value={remark} onChange={(e) => setRemark(e.target.value)} className="mt-1 bg-gray-800 border-gray-600 text-white" />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button variant="outline" onClick={() => router.push('/dashboard/finance')} className="border-gray-600 text-gray-300">取消</Button>
          <Button onClick={handleSubmit} disabled={loading} className="bg-white text-black hover:bg-gray-200 px-8">
            {loading ? '提交中...' : <><CheckCircle className="w-4 h-4 mr-2" />确认付款</>}
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
