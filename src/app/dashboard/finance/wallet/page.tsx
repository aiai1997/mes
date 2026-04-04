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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import {
  Wallet,
  CreditCard,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  History,
  AlertCircle
} from 'lucide-react';
import { getCurrentUser, type CurrentUser } from '@/types/user';

interface WalletData {
  id: string;
  balance: number;
  totalEarnings: number;
  totalWithdrawals: number;
  status: string;
}

interface Transaction {
  id: string;
  type: string;
  amount: number;
  description: string;
  relatedOrder?: string;
  createdAt: string;
}

export default function WalletPage() {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showWithdrawalDialog, setShowWithdrawalDialog] = useState(false);
  const [withdrawalAmount, setWithdrawalAmount] = useState('');

  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);
    if (user) {
      loadWalletData(user.id);
    } else {
      setLoading(false);
    }
  }, []);

  const loadWalletData = async (userId: string) => {
    setLoading(true);
    try {
      // 获取钱包信息
      const walletResponse = await fetch(`/api/wallet?userId=${userId}`);
      const walletResult = await walletResponse.json();

      if (walletResult.success) {
        setWallet(walletResult.wallet);

        // 获取交易记录
        const transResponse = await fetch(`/api/wallet/transactions?walletId=${walletResult.wallet.id}`);
        const transResult = await transResponse.json();

        if (transResult.success) {
          setTransactions(transResult.transactions);
        }
      }
    } catch (error) {
      console.error('加载钱包数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdrawal = async () => {
    if (!wallet || !withdrawalAmount) return;

    const amount = parseFloat(withdrawalAmount);
    if (isNaN(amount) || amount <= 0) {
      alert('请输入有效的提现金额');
      return;
    }

    if (amount > wallet.balance) {
      alert('提现金额不能超过账户余额');
      return;
    }

    // 这里应该调用提现API，暂时只显示提示
    alert(`提现申请已提交：¥${amount.toFixed(2)}`);
    setShowWithdrawalDialog(false);
    setWithdrawalAmount('');
    
    // 刷新钱包数据
    if (currentUser) {
      loadWalletData(currentUser.id);
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY',
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('zh-CN');
  };

  const getTypeColor = (type: string) => {
    return type === '收入' ? 'text-green-600' : type === '支出' ? 'text-red-600' : 'text-orange-600';
  };

  const getTypeBadgeColor = (type: string) => {
    return type === '收入' 
      ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
      : type === '支出'
      ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
      : 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300';
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">加载中...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!currentUser) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6">
              <div className="text-center">
                <AlertCircle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">请先登录</h3>
                <p className="text-muted-foreground">您需要登录后才能查看钱包</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <Wallet className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">我的钱包</h1>
              <p className="text-muted-foreground text-sm">查看余额、交易记录、提现申请</p>
            </div>
          </div>
          <Button onClick={() => setShowWithdrawalDialog(true)} className="gap-2">
            <DollarSign className="w-4 h-4" />申请提现
          </Button>
        </div>

        {/* 钱包统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">账户余额</p>
                  <p className="text-3xl font-bold text-foreground">
                    {wallet ? formatAmount(wallet.balance) : '¥0.00'}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
                  <CreditCard className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">累计收入</p>
                  <p className="text-3xl font-bold text-green-600">
                    {wallet ? formatAmount(wallet.totalEarnings) : '¥0.00'}
                  </p>
                </div>
                <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
                  <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">累计提现</p>
                  <p className="text-3xl font-bold text-orange-600">
                    {wallet ? formatAmount(wallet.totalWithdrawals) : '¥0.00'}
                  </p>
                </div>
                <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-full">
                  <TrendingDown className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 交易记录 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="w-5 h-5" />
              交易记录
            </CardTitle>
          </CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                暂无交易记录
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>类型</TableHead>
                      <TableHead>金额</TableHead>
                      <TableHead>描述</TableHead>
                      <TableHead>关联订单</TableHead>
                      <TableHead>时间</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((trans) => (
                      <TableRow key={trans.id}>
                        <TableCell>
                          <Badge className={getTypeBadgeColor(trans.type)}>
                            {trans.type}
                          </Badge>
                        </TableCell>
                        <TableCell className={getTypeColor(trans.type)}>
                          {trans.type === '收入' ? '+' : '-'}
                          {formatAmount(trans.amount)}
                        </TableCell>
                        <TableCell>{trans.description}</TableCell>
                        <TableCell>{trans.relatedOrder || '-'}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDate(trans.createdAt)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 提现对话框 */}
        <Dialog open={showWithdrawalDialog} onOpenChange={setShowWithdrawalDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>申请提现</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>可提现余额</Label>
                <p className="text-2xl font-bold text-foreground mt-1">
                  {wallet ? formatAmount(wallet.balance) : '¥0.00'}
                </p>
              </div>
              <div>
                <Label>提现金额</Label>
                <Input
                  type="number"
                  placeholder="请输入提现金额"
                  value={withdrawalAmount}
                  onChange={(e) => setWithdrawalAmount(e.target.value)}
                  className="mt-1"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                提现申请将在1-3个工作日内处理
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowWithdrawalDialog(false)}>
                取消
              </Button>
              <Button onClick={handleWithdrawal}>确认提现</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
