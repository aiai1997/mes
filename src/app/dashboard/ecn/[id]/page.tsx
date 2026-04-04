'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  ArrowLeft, 
  FileEdit, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  User,
  Calendar,
  FileText,
  Package,
  History,
} from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import {
  type ECN,
  type ECNStatus,
  getECNs,
} from '@/types/misc';

const statusColors: Record<ECNStatus, string> = {
  '申请中': 'bg-gray-100 text-gray-700',
  '评审中': 'bg-blue-100 text-blue-700',
  '待执行': 'bg-yellow-100 text-yellow-700',
  '执行中': 'bg-orange-100 text-orange-700',
  '已完成': 'bg-green-100 text-green-700',
  '已关闭': 'bg-gray-100 text-gray-700',
};

export default function ECNDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [ecn, setEcn] = useState<ECN | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ecnId = params.id as string;
    const ecns = getECNs();
    const found = ecns.find(e => e.id === ecnId);
    if (found) {
      setEcn(found);
    }
    setLoading(false);
  }, [params.id]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">加载中...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (!ecn) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <div className="text-muted-foreground">未找到ECN记录</div>
          <Button onClick={() => router.push('/dashboard/ecn')}>
            <ArrowLeft className="w-4 h-4 mr-2" />返回列表
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* 头部 */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.push('/dashboard/ecn')}>
            <ArrowLeft className="w-4 h-4 mr-2" />返回
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-foreground">{ecn.ecnNo}</h1>
              <Badge className={statusColors[ecn.status]}>{ecn.status}</Badge>
            </div>
            <p className="text-muted-foreground text-sm mt-1">工程变更详情</p>
          </div>
          <div className="flex gap-2">
            {ecn.status === '申请中' && (
              <Button onClick={() => router.push(`/dashboard/ecn/${ecn.id}/edit`)}>
                编辑
              </Button>
            )}
            {ecn.status === '评审中' && (
              <Button>审批</Button>
            )}
            {ecn.status === '待执行' && (
              <Button>开始执行</Button>
            )}
            {ecn.status === '执行中' && (
              <Button>完成执行</Button>
            )}
          </div>
        </div>

        {/* 基本信息 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="w-5 h-5" />
                变更信息
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">变更类型</p>
                  <p className="font-medium">{ecn.changeType}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">紧急程度</p>
                  <Badge variant={ecn.priority === '紧急' ? 'destructive' : 'outline'}>
                    {ecn.priority}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">关联BOM</p>
                  <p className="font-medium">{ecn.bomNo}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">关联订单</p>
                  <p className="font-medium">{ecn.orderNo || '-'}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">变更内容</p>
                <p className="mt-1 p-3 bg-muted rounded-lg">{ecn.changeContent}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">变更原因</p>
                <p className="mt-1 p-3 bg-muted rounded-lg">{ecn.changeReason}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <User className="w-5 h-5" />
                流程信息
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">申请人</p>
                  <p className="font-medium">{ecn.applicant}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">申请时间</p>
                  <p className="font-medium">{ecn.createdAt}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">评审人</p>
                  <p className="font-medium">{ecn.reviewer || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">评审时间</p>
                  <p className="font-medium">{ecn.reviewedAt || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">执行人</p>
                  <p className="font-medium">{ecn.executor || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">完成时间</p>
                  <p className="font-medium">{ecn.completedAt || '-'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 影响范围 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Package className="w-5 h-5" />
              影响范围
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">影响订单数</p>
                <p className="text-2xl font-bold text-red-600">{ecn.affectedOrders}</p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">在产订单</p>
                <p className="text-2xl font-bold text-orange-600">{Math.floor(ecn.affectedOrders * 0.6)}</p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">待产订单</p>
                <p className="text-2xl font-bold text-blue-600">{Math.floor(ecn.affectedOrders * 0.4)}</p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">预计损失</p>
                <p className="text-2xl font-bold">¥{(ecn.affectedOrders * 500).toLocaleString()}</p>
              </div>
            </div>
            {ecn.affectedOrders > 0 && (
              <div className="flex items-center gap-2 text-orange-600">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-sm">此变更将影响 {ecn.affectedOrders} 个订单的生产进度</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 审批记录 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <History className="w-5 h-5" />
              审批记录
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>步骤</TableHead>
                  <TableHead>操作人</TableHead>
                  <TableHead>操作</TableHead>
                  <TableHead>意见</TableHead>
                  <TableHead>时间</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>1</TableCell>
                  <TableCell>{ecn.applicant}</TableCell>
                  <TableCell><Badge className="bg-blue-100 text-blue-700">提交申请</Badge></TableCell>
                  <TableCell>-</TableCell>
                  <TableCell>{ecn.createdAt}</TableCell>
                </TableRow>
                {ecn.status !== '申请中' && (
                  <TableRow>
                    <TableCell>2</TableCell>
                    <TableCell>{ecn.reviewer || '待定'}</TableCell>
                    <TableCell>
                      {ecn.status === '评审中' ? (
                        <Badge className="bg-yellow-100 text-yellow-700">待评审</Badge>
                      ) : (
                        <Badge className="bg-green-100 text-green-700">评审通过</Badge>
                      )}
                    </TableCell>
                    <TableCell>{ecn.reviewComment || '-'}</TableCell>
                    <TableCell>{ecn.reviewedAt || '-'}</TableCell>
                  </TableRow>
                )}
                {(ecn.status === '执行中' || ecn.status === '已完成') && (
                  <TableRow>
                    <TableCell>3</TableCell>
                    <TableCell>{ecn.executor || '待定'}</TableCell>
                    <TableCell>
                      {ecn.status === '已完成' ? (
                        <Badge className="bg-green-100 text-green-700">执行完成</Badge>
                      ) : (
                        <Badge className="bg-orange-100 text-orange-700">执行中</Badge>
                      )}
                    </TableCell>
                    <TableCell>{ecn.executeComment || '-'}</TableCell>
                    <TableCell>{ecn.completedAt || '-'}</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* 附件 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="w-5 h-5" />
              相关附件
            </CardTitle>
          </CardHeader>
          <CardContent>
            {ecn.attachments && ecn.attachments.length > 0 ? (
              <div className="space-y-2">
                {ecn.attachments.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <span>{file}</span>
                    <Button size="sm" variant="ghost">下载</Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">暂无附件</p>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
