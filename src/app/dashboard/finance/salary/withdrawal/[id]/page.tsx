'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock,
  User,
  DollarSign,
  CreditCard,
  AlertTriangle,
} from 'lucide-react';
import {
  getWithdrawalApplications,
  saveWithdrawalApplication,
  type WithdrawalApplication,
} from '@/types/finance';

const withdrawalStatusColors: Record<string, string> = {
  '待审核': 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300',
  '处理中': 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  '已到账': 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  '已失败': 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
};

const methodLabels: Record<string, string> = {
  '银行卡': '银行卡',
  '微信': '微信',
  '支付宝': '支付宝',
};

export default function WithdrawalDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [application, setApplication] = useState<WithdrawalApplication | null>(null);
  const [loading, setLoading] = useState(false);
  const [operationReason, setOperationReason] = useState('');

  useEffect(() => {
    loadApplication();
  }, [params.id]);

  const loadApplication = () => {
    if (!params.id) return;
    const applications = getWithdrawalApplications();
    const app = applications.find(a => a.id === params.id);
    setApplication(app || null);
  };

  const handleStatusUpdate = async (newStatus: '处理中' | '已到账' | '已失败') => {
    if (!application) return;

    setLoading(true);
    try {
      const updatedApp = { ...application };
      updatedApp.status = newStatus;
      updatedApp.processedAt = new Date().toISOString();

      if (newStatus === '已失败') {
        updatedApp.failureReason = operationReason;
      }

      updatedApp.transferReceiptImages = [];
      saveWithdrawalApplication(updatedApp);

      setOperationReason('');
      loadApplication();
      alert(`状态已更新为"${newStatus}"`);
    } catch (error) {
      alert('操作失败');
    } finally {
      setLoading(false);
    }
  };

  if (!application) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Clock className="h-12 w-12 text-gray-400" />
        </div>
      </DashboardLayout>
    );
  }

  const canProcess = application.status === '待审核';
  const canMarkSuccess = application.status === '处理中';
  const canMarkFailed = application.status !== '已到账' && application.status !== '已失败';

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* 页面标题 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">提现申请详情</h1>
            <p className="text-muted-foreground">申请号：{application.withdrawalNo}</p>
          </div>
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回
          </Button>
        </div>

        {/* 状态栏 */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <Badge className={withdrawalStatusColors[application.status]}>
                {application.status}
              </Badge>
              <div className="flex space-x-2">
                {canProcess && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        开始处理
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>开始处理提现</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                          确认开始处理该提现申请吗？
                        </p>
                        <div className="flex justify-end space-x-2">
                          <Button variant="outline">取消</Button>
                          <Button
                            onClick={() => handleStatusUpdate('处理中')}
                            disabled={loading}
                          >
                            确认
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}

                {canMarkSuccess && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="bg-green-600 hover:bg-green-700">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        标记到账
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>标记为已到账</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                          确认已将资金转账到员工账户吗？
                        </p>
                        <div className="flex justify-end space-x-2">
                          <Button variant="outline">取消</Button>
                          <Button
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => handleStatusUpdate('已到账')}
                            disabled={loading}
                          >
                            确认到账
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}

                {canMarkFailed && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="destructive">
                        <XCircle className="w-4 h-4 mr-2" />
                        标记失败
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>标记为失败</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="reason">失败原因</Label>
                          <Textarea
                            id="reason"
                            placeholder="请输入失败原因"
                            value={operationReason}
                            onChange={(e) => setOperationReason(e.target.value)}
                          />
                        </div>
                        <div className="flex justify-end space-x-2">
                          <Button variant="outline">取消</Button>
                          <Button
                            variant="destructive"
                            onClick={() => handleStatusUpdate('已失败')}
                            disabled={loading}
                          >
                            确认失败
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 申请信息 */}
        <Card>
          <CardHeader>
            <CardTitle>申请信息</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">申请人：</span>
                <span>{application.employeeName}</span>
              </div>
              <div className="flex items-center space-x-2">
                <DollarSign className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">提现金额：</span>
                <span className="font-bold text-lg">¥{application.amount.toLocaleString()}</span>
              </div>
              <div className="flex items-center space-x-2">
                <CreditCard className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">提现方式：</span>
                <span>{methodLabels[application.method]}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">申请时间：</span>
                <span>{new Date(application.createdAt).toLocaleString()}</span>
              </div>
            </div>
            <Separator />
            <div>
              <Label className="text-sm font-medium">账户信息：</Label>
              <div className="mt-2 space-y-1 text-sm">
                {application.method === '银行卡' ? (
                  <>
                    <p><span className="font-medium">开户名：</span>{application.accountInfo.accountName}</p>
                    <p><span className="font-medium">银行卡号：</span>{application.accountInfo.accountNumber}</p>
                    <p><span className="font-medium">开户银行：</span>{application.accountInfo.bankName}</p>
                  </>
                ) : (
                  <p><span className="font-medium">{methodLabels[application.method]}账户：</span>{application.accountInfo.accountName}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 失败原因 */}
        {application.status === '已失败' && application.failureReason && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>失败原因：</strong>{application.failureReason}
            </AlertDescription>
          </Alert>
        )}

        {/* 处理记录 */}
        <Card>
          <CardHeader>
            <CardTitle>处理记录</CardTitle>
          </CardHeader>
          <CardContent>
            {application.processedAt ? (
              <div className="space-y-2">
                <p className="text-sm">
                  <span className="font-medium">处理时间：</span>
                  {new Date(application.processedAt).toLocaleString()}
                </p>
                {application.failureReason && (
                  <p className="text-sm">
                    <span className="font-medium">原因：</span>
                    {application.failureReason}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">等待处理</p>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
