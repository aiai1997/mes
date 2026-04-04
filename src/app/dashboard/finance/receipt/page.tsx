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
import { ArrowLeft, CheckCircle, CreditCard } from 'lucide-react';
import {
  type Receivable,
  type ReceiptRecord,
  getReceivables,
  saveReceivable,
  initFinanceData,
} from '@/types/finance';
import { getCurrentUser, type CurrentUser } from '@/types/user';

export default function ReceiptPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [receivable, setReceivable] = useState<Receivable | null>(null);
  
  const [receiptAmount, setReceiptAmount] = useState('');
  const [receiptMethod, setReceiptMethod] = useState<'银行转账' | '现金' | '支票' | '其他'>('银行转账');
  const [remark, setRemark] = useState('');
  
  const [alertMessage, setAlertMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);
    initFinanceData();
    
    const id = searchParams.get('id');
    if (id) {
      const receivables = getReceivables();
      const found = receivables.find(r => r.id === id);
      if (found) {
        setReceivable(found);
      }
    }
  }, [searchParams]);

  const handleSubmit = () => {
    if (!receivable || !currentUser) return;
    
    const amount = parseFloat(receiptAmount);
    if (!amount || amount <= 0) {
      setAlertMessage({ type: 'error', message: '请输入有效的收款金额' });
      return;
    }
    
    if (amount > receivable.unreceivedAmount) {
      setAlertMessage({ type: 'error', message: '收款金额不能超过未收金额' });
      return;
    }
    
    setLoading(true);
    
    const receipt: ReceiptRecord = {
      id: Date.now().toString(),
      receiptNo: `RCV${Date.now()}`,
      receivableNo: receivable.receivableNo,
      amount,
      receiptDate: new Date().toLocaleDateString('zh-CN'),
      receiptMethod,
      remark,
      operator: currentUser.username,
    };
    
    const newReceivedAmount = receivable.receivedAmount + amount;
    const newUnreceivedAmount = receivable.unreceivedAmount - amount;
    
    const updatedReceivable: Receivable = {
      ...receivable,
      receivedAmount: newReceivedAmount,
      unreceivedAmount: newUnreceivedAmount,
      receiptStatus: newUnreceivedAmount === 0 ? '已收款' : '部分收款',
      receipts: [...receivable.receipts, receipt],
      updatedAt: new Date().toLocaleString('zh-CN'),
    };
    
    saveReceivable(updatedReceivable);
    
    setLoading(false);
    setAlertMessage({ type: 'success', message: `收款成功！收款金额: ¥${amount.toFixed(2)}` });
    
    setTimeout(() => {
      router.push('/dashboard/finance');
    }, 1500);
  };

  if (!receivable) {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto space-y-6">
          <Button variant="outline" onClick={() => router.push('/dashboard/finance')} className="border-gray-600 text-gray-300 hover:bg-gray-800">
            <ArrowLeft className="w-4 h-4 mr-2" />返回
          </Button>
          <Card className="bg-gray-900 border-gray-700">
            <CardContent className="py-12 text-center text-gray-500">
              应收单不存在或已失效
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
              <CreditCard className="w-6 h-6 text-black" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">收款登记</h1>
              <p className="text-gray-400 text-sm">登记客户收款</p>
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
            <CardTitle className="text-white">应收信息</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-gray-800 rounded-lg">
                <span className="text-gray-400 text-xs">应收编号</span>
                <p className="text-white font-medium">{receivable.receivableNo}</p>
              </div>
              <div className="p-3 bg-gray-800 rounded-lg">
                <span className="text-gray-400 text-xs">客户</span>
                <p className="text-white">{receivable.customerName}</p>
              </div>
              <div className="p-3 bg-gray-800 rounded-lg">
                <span className="text-gray-400 text-xs">应收总额</span>
                <p className="text-white font-bold">¥{receivable.totalAmount.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-gray-800 rounded-lg">
                <span className="text-gray-400 text-xs">未收金额</span>
                <p className="text-red-400 font-bold text-xl">¥{receivable.unreceivedAmount.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">收款信息</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-gray-400">收款金额 *</Label>
              <Input type="number" value={receiptAmount} onChange={(e) => setReceiptAmount(e.target.value)} className="mt-1 bg-gray-800 border-gray-600 text-white" placeholder={`最大可收: ¥${receivable.unreceivedAmount}`} />
            </div>
            <div>
              <Label className="text-gray-400">收款方式</Label>
              <Select value={receiptMethod} onValueChange={(v: any) => setReceiptMethod(v)}>
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
            {loading ? '提交中...' : <><CheckCircle className="w-4 h-4 mr-2" />确认收款</>}
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
