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
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock,
  User,
  DollarSign,
  FileText,
  MessageSquare,
} from 'lucide-react';
import {
  getAdvanceApplications,
  saveAdvanceApplication,
  type AdvanceApplication,
} from '@/types/finance';
import { getCurrentUser, type CurrentUser } from '@/types/user';

const advanceStatusColors: Record<string, string> = {
  '待审核': 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300',
  '车间审核中': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
  '财务审核中': 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
  '已通过': 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  '已驳回': 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
};

export default function AdvanceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [application, setApplication] = useState<AdvanceApplication | null>(null);
  const [loading, setLoading] = useState(false);
  const [approvalComment, setApprovalComment] = useState('');

  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);
    loadApplication();
  }, [params.id]);

  const loadApplication = () => {
    if (!params.id) return;
    const applications = getAdvanceApplications();
    const app = applications.find(a => a.id === params.id);
    setApplication(app || null);
  };

  const handleApproval = async (approved: boolean) => {
    if (!application) return;

    setLoading(true);
    try {
      const now = new Date().toISOString();
      let newStatus = application.status;

      if (approved) {
        if (application.status === '待审核') {
          newStatus = '财务审核中';
          application.workshopAuditor = currentUser?.realName;
          application.workshopAuditTime = now;
          application.workshopComment = approvalComment;
        } else if (application.status === '财务审核中') {
          newStatus = '已通过';
          application.financeAuditor = currentUser?.realName;
          application.financeAuditTime = now;
          application.financeComment = approvalComment;
        }
      } else {
        newStatus = '已驳回';
        application.workshopComment = approvalComment;
      }

      application.status = newStatus;
      application.updatedAt = now;

      saveAdvanceApplication(application);
      setApprovalComment('');
      loadApplication();
      alert('审核完成');
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

  const canApprove = application.status === '待审核' || application.status === '财务审核中';

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* 页面标题 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">预支申请详情</h1>
            <p className="text-muted-foreground">申请号：{application.advanceNo}</p>
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
              <Badge className={advanceStatusColors[application.status]}>
                {application.status}
              </Badge>
              {canApprove && (
                <div className="flex space-x-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        通过
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>审核通过</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="comment">审核意见（可选）</Label>
                          <Textarea
                            id="comment"
                            placeholder="请输入审核意见"
                            value={approvalComment}
                            onChange={(e) => setApprovalComment(e.target.value)}
                          />
                        </div>
                        <div className="flex justify-end space-x-2">
                          <Button variant="outline">取消</Button>
                          <Button onClick={() => handleApproval(true)} disabled={loading}>
                            确认通过
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="destructive">
                        <XCircle className="w-4 h-4 mr-2" />
                        驳回
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>驳回申请</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="rejectReason">驳回原因</Label>
                          <Textarea
                            id="rejectReason"
                            placeholder="请输入驳回原因"
                            value={approvalComment}
                            onChange={(e) => setApprovalComment(e.target.value)}
                          />
                        </div>
                        <div className="flex justify-end space-x-2">
                          <Button variant="outline">取消</Button>
                          <Button variant="destructive" onClick={() => handleApproval(false)} disabled={loading}>
                            确认驳回
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              )}
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
                <span className="text-sm font-medium">预支金额：</span>
                <span className="font-bold text-lg">¥{application.amount.toLocaleString()}</span>
              </div>
              <div className="flex items-center space-x-2">
                <DollarSign className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">最高限额：</span>
                <span>¥{application.maxAdvanceAmount.toLocaleString()}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">申请时间：</span>
                <span>{new Date(application.createdAt).toLocaleString()}</span>
              </div>
            </div>
            <Separator />
            <div>
              <Label className="text-sm font-medium">申请原因：</Label>
              <p className="mt-2 text-sm text-muted-foreground whitespace-pre-wrap">
                {application.reason}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 审核历史 */}
        <Card>
          <CardHeader>
            <CardTitle>审核历史</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {application.workshopAuditor && (
                <div className="flex items-start space-x-4 p-4 border rounded">
                  <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{application.workshopAuditor}</span>
                      <span className="text-xs text-muted-foreground">
                        {application.workshopAuditTime && new Date(application.workshopAuditTime).toLocaleString()}
                      </span>
                    </div>
                    {application.workshopComment && (
                      <div className="mt-2 flex items-start space-x-2">
                        <MessageSquare className="w-4 h-4 text-muted-foreground mt-0.5" />
                        <p className="text-sm text-muted-foreground">{application.workshopComment}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {application.financeAuditor && (
                <div className="flex items-start space-x-4 p-4 border rounded">
                  <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{application.financeAuditor}</span>
                      <span className="text-xs text-muted-foreground">
                        {application.financeAuditTime && new Date(application.financeAuditTime).toLocaleString()}
                      </span>
                    </div>
                    {application.financeComment && (
                      <div className="mt-2 flex items-start space-x-2">
                        <MessageSquare className="w-4 h-4 text-muted-foreground mt-0.5" />
                        <p className="text-sm text-muted-foreground">{application.financeComment}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {!application.workshopAuditor && (
                <p className="text-center text-muted-foreground py-8">等待审核</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
