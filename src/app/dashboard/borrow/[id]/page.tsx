'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  ArrowDownToLine, 
  ArrowUpFromLine,
  CheckCircle,
  Clock,
  AlertTriangle,
  Package,
  Building2,
  Calendar,
  User,
  FileText,
  RotateCcw
} from 'lucide-react';
import {
  type BorrowRecord,
  type BorrowStatus,
  getBorrowRecord,
  saveBorrowRecord,
  initMiscData,
} from '@/types/misc';

const statusColors: Record<BorrowStatus, string> = {
  '申请中': 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  '已借出': 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  '部分归还': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
  '已归还': 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  '已逾期': 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
};

const statusIcons: Record<BorrowStatus, React.ReactNode> = {
  '申请中': <Clock className="w-4 h-4" />,
  '已借出': <ArrowDownToLine className="w-4 h-4" />,
  '部分归还': <RotateCcw className="w-4 h-4" />,
  '已归还': <CheckCircle className="w-4 h-4" />,
  '已逾期': <AlertTriangle className="w-4 h-4" />,
};

export default function BorrowDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [record, setRecord] = useState<BorrowRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initMiscData();
    loadData();
  }, [params.id]);

  const loadData = () => {
    const id = params.id as string;
    const foundRecord = getBorrowRecord(id);
    if (foundRecord) {
      setRecord(foundRecord);
    }
    setLoading(false);
  };

  const handleReturn = () => {
    if (!record) return;
    
    const returnQty = prompt(`请输入归还数量（已借: ${record.borrowQuantity}，已还: ${record.returnedQuantity}）:`);
    if (!returnQty) return;
    
    const qty = parseInt(returnQty);
    if (isNaN(qty) || qty <= 0) {
      alert('请输入有效的数量');
      return;
    }
    
    const newReturnedQty = record.returnedQuantity + qty;
    let newStatus: BorrowStatus = record.status;
    
    if (newReturnedQty >= record.borrowQuantity) {
      newStatus = '已归还';
    } else if (newReturnedQty > 0) {
      newStatus = '部分归还';
    }
    
    const updatedRecord: BorrowRecord = {
      ...record,
      returnedQuantity: newReturnedQty,
      status: newStatus,
      actualReturnDate: newStatus === '已归还' ? new Date().toISOString().slice(0, 10) : undefined,
    };
    
    saveBorrowRecord(updatedRecord);
    setRecord(updatedRecord);
    alert('归还成功！');
  };

  const handleComplete = () => {
    if (!record) return;
    if (!confirm('确定要将此记录标记为已归还吗？')) return;
    
    const updatedRecord: BorrowRecord = {
      ...record,
      status: '已归还',
      returnedQuantity: record.borrowQuantity,
      actualReturnDate: new Date().toISOString().slice(0, 10),
    };
    
    saveBorrowRecord(updatedRecord);
    setRecord(updatedRecord);
    alert('操作成功！');
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-muted-foreground">加载中...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (!record) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto space-y-6">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />返回
          </Button>
          <Card>
            <CardContent className="py-12 text-center">
              <AlertTriangle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">未找到借料记录</p>
              <Button className="mt-4" onClick={() => router.push('/dashboard/borrow')}>
                返回列表
              </Button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  const isBorrow = record.borrowType === '借入';
  const canReturn = record.status !== '已归还' && record.status !== '申请中';

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* 头部 */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />返回
          </Button>
        </div>

        {/* 标题区 */}
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-lg flex items-center justify-center ${isBorrow ? 'bg-blue-500' : 'bg-green-500'}`}>
              {isBorrow ? (
                <ArrowDownToLine className="w-7 h-7 text-white" />
              ) : (
                <ArrowUpFromLine className="w-7 h-7 text-white" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-foreground">{record.borrowNo}</h1>
                <Badge className={statusColors[record.status]}>
                  {statusIcons[record.status]}
                  <span className="ml-1">{record.status}</span>
                </Badge>
              </div>
              <p className="text-muted-foreground mt-1">
                {record.borrowType} - {record.materialName}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {canReturn && (
              <Button variant="outline" onClick={handleReturn}>
                <RotateCcw className="w-4 h-4 mr-2" />归还
              </Button>
            )}
            {record.status !== '已归还' && (
              <Button onClick={handleComplete}>
                <CheckCircle className="w-4 h-4 mr-2" />完成
              </Button>
            )}
          </div>
        </div>

        {/* 主要信息卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 物料信息 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5 text-primary" />
                物料信息
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">物料编码</span>
                <span className="font-medium">{record.materialNo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">物料名称</span>
                <span className="font-medium">{record.materialName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">单位</span>
                <span className="font-medium">{record.unit}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">{isBorrow ? '借入数量' : '借出数量'}</span>
                <span className="font-bold text-lg">{record.borrowQuantity}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">已归还数量</span>
                <span className={`font-bold ${record.returnedQuantity === record.borrowQuantity ? 'text-green-600' : 'text-blue-600'}`}>
                  {record.returnedQuantity}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">待归还数量</span>
                <span className={`font-bold ${record.borrowQuantity - record.returnedQuantity > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                  {record.borrowQuantity - record.returnedQuantity}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* 单位信息 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary" />
                单位信息
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{isBorrow ? '借出单位' : '借入单位'}</span>
                <span className="font-medium">{record.counterparty}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">类型</span>
                <Badge variant={isBorrow ? 'default' : 'secondary'}>{record.borrowType}</Badge>
              </div>
            </CardContent>
          </Card>

          {/* 日期信息 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                日期信息
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{isBorrow ? '借入日期' : '借出日期'}</span>
                <span className="font-medium">{record.borrowDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">预计归还日期</span>
                <span className="font-medium">{record.expectedReturnDate}</span>
              </div>
              {record.actualReturnDate && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">实际归还日期</span>
                  <span className="font-medium text-green-600">{record.actualReturnDate}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 操作信息 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                操作信息
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">创建人</span>
                <span className="font-medium">{record.createdBy}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">创建时间</span>
                <span className="font-medium">{record.createdAt}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 备注 */}
        {record.remark && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                备注
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground whitespace-pre-wrap">{record.remark}</p>
            </CardContent>
          </Card>
        )}

        {/* 进度条 */}
        <Card>
          <CardHeader>
            <CardTitle>归还进度</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">已归还 {record.returnedQuantity} / {record.borrowQuantity}</span>
                <span className="font-medium">{Math.round((record.returnedQuantity / record.borrowQuantity) * 100)}%</span>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-300 ${
                    record.returnedQuantity === record.borrowQuantity 
                      ? 'bg-green-500' 
                      : record.returnedQuantity > 0 
                        ? 'bg-blue-500' 
                        : 'bg-gray-300'
                  }`}
                  style={{ width: `${(record.returnedQuantity / record.borrowQuantity) * 100}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
