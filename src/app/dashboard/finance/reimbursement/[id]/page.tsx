'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Calendar,
  FileText,
  DollarSign,
  MessageSquare,
  Eye
} from 'lucide-react';
import {
  getReimbursementApplicationById,
  updateReimbursementApplication,
  type ReimbursementApplication,
  type ApprovalRecord
} from '@/types/finance';
import { getCurrentUser, type CurrentUser } from '@/types/user';

const reimbursementStatusColors: Record<string, string> = {
  '待审核': 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300',
  '主管审核中': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
  '财务审核中': 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
  '老板审核中': 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
  '已通过': 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  '已驳回': 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
  '已到账': 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
};

const categoryLabels: Record<string, string> = {
  '出差车费': '出差车费',
  '油费': '油费',
  '路费': '路费',
  '采购辅料': '采购辅料',
  '配件小额杂费': '配件小额杂费',
  '快递物流费': '快递物流费',
  '食堂食材杂费': '食堂食材杂费',
  '办公耗材费': '办公耗材费',
  '维修设备费': '维修设备费',
  '其他因公临时杂费': '其他因公临时杂费',
};

export default function ReimbursementDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [application, setApplication] = useState<ReimbursementApplication | null>(null);
  const [loading, setLoading] = useState(false);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [approvalComment, setApprovalComment] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);
    loadApplication();
  }, [params.id]);

  const loadApplication = () => {
    if (!params.id) return;
    const app = getReimbursementApplicationById(params.id as string);
    setApplication(app);
  };

  const handleApproval = async (approved: boolean) => {
    if (!application || !currentUser) return;

    setLoading(true);
    try {
      const now = new Date().toISOString();
      const approvalRecord: ApprovalRecord = {
        approverId: currentUser.id,
        approverName: currentUser.realName,
        approved,
        comment: approved ? approvalComment : rejectionReason,
        approvedAt: now,
      };

      let newStatus = application.status;
      let updateData: Partial<ReimbursementApplication> = {
        updatedAt: now,
      };

      // 根据当前状态和用户角色确定下一个状态
      if (application.status === '待审核' && currentUser.role === '组长') {
        if (approved) {
          newStatus = '财务审核中';
          updateData.supervisorApproval = approvalRecord;
        } else {
          newStatus = '已驳回';
          updateData.rejectionReason = rejectionReason;
        }
      } else if (application.status === '财务审核中' && currentUser.role === '财务') {
        if (approved) {
          newStatus = '老板审核中';
          updateData.financeApproval = approvalRecord;
        } else {
          newStatus = '已驳回';
          updateData.rejectionReason = rejectionReason;
        }
      } else if (application.status === '老板审核中' && currentUser.role === '管理员') {
        if (approved) {
          newStatus = '已通过';
          updateData.bossApproval = approvalRecord;
        } else {
          newStatus = '已驳回';
          updateData.rejectionReason = rejectionReason;
        }
      }

      updateData.status = newStatus;
      updateReimbursementApplication(application.id, updateData);

      setShowApprovalDialog(false);
      setShowRejectDialog(false);
      setApprovalComment('');
      setRejectionReason('');
      loadApplication();
    } catch (error) {
      console.error('审核失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const canApprove = () => {
    if (!application || !currentUser) return false;

    if (application.status === '待审核' && currentUser.role === '组长') return true;
    if (application.status === '财务审核中' && currentUser.role === '财务') return true;
    if (application.status === '老板审核中' && currentUser.role === '管理员') return true;

    return false;
  };

  const getApprovalHistory = () => {
    if (!application) return [];

    const history: ApprovalRecord[] = [];

    if (application.supervisorApproval) {
      history.push(application.supervisorApproval);
    }
    if (application.financeApproval) {
      history.push(application.financeApproval);
    }
    if (application.bossApproval) {
      history.push(application.bossApproval);
    }

    return history;
  };

  if (!application) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Clock className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">加载中...</h3>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* 页面标题 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">报销详情</h1>
            <p className="text-muted-foreground">报销单号：{application.reimbursementNo}</p>
          </div>
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回
          </Button>
        </div>

        {/* 状态和操作 */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Badge className={reimbursementStatusColors[application.status]}>
                  {application.status}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  申请时间：{new Date(application.createdAt).toLocaleString()}
                </span>
              </div>
              {canApprove() && (
                <div className="flex space-x-2">
                  <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
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
                          <Label htmlFor="approvalComment">审核意见（可选）</Label>
                          <Textarea
                            id="approvalComment"
                            placeholder="请输入审核意见"
                            value={approvalComment}
                            onChange={(e) => setApprovalComment(e.target.value)}
                          />
                        </div>
                        <div className="flex justify-end space-x-2">
                          <Button variant="outline" onClick={() => setShowApprovalDialog(false)}>
                            取消
                          </Button>
                          <Button onClick={() => handleApproval(true)} disabled={loading}>
                            确认通过
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
                    <DialogTrigger asChild>
                      <Button variant="destructive">
                        <XCircle className="w-4 h-4 mr-2" />
                        驳回
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>审核驳回</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="rejectionReason">驳回原因 *</Label>
                          <Textarea
                            id="rejectionReason"
                            placeholder="请输入驳回原因"
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            required
                          />
                        </div>
                        <div className="flex justify-end space-x-2">
                          <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
                            取消
                          </Button>
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

        {/* 报销信息 */}
        <Card>
          <CardHeader>
            <CardTitle>报销信息</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">申请人：</span>
                <span>{application.employeeName}</span>
              </div>
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">报销类目：</span>
                <span>{categoryLabels[application.category]}</span>
              </div>
              <div className="flex items-center space-x-2">
                <DollarSign className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">报销金额：</span>
                <span className="font-bold text-lg">¥{application.amount.toLocaleString()}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">使用日期：</span>
                <span>{application.useDate}</span>
              </div>
            </div>
            <Separator />
            <div>
              <Label className="text-sm font-medium">报销说明：</Label>
              <p className="mt-2 text-sm text-muted-foreground whitespace-pre-wrap">
                {application.description}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 附件 */}
        {application.attachments && application.attachments.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>附件</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {application.attachments.map((attachment, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center space-x-2">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{attachment}</span>
                    </div>
                    <Button size="sm" variant="outline">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 审核历史 */}
        <Card>
          <CardHeader>
            <CardTitle>审核历史</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {getApprovalHistory().map((record, index) => (
                <div key={index} className="flex items-start space-x-4 p-4 border rounded">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    record.approved ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'
                  }`}>
                    {record.approved ? (
                      <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{record.approverName}</span>
                      <Badge variant={record.approved ? "default" : "destructive"}>
                        {record.approved ? '通过' : '驳回'}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {new Date(record.approvedAt).toLocaleString()}
                      </span>
                    </div>
                    {record.comment && (
                      <div className="mt-2 flex items-start space-x-2">
                        <MessageSquare className="w-4 h-4 text-muted-foreground mt-0.5" />
                        <p className="text-sm text-muted-foreground">{record.comment}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {getApprovalHistory().length === 0 && (
                <p className="text-center text-muted-foreground py-8">暂无审核记录</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 驳回原因 */}
        {application.status === '已驳回' && application.rejectionReason && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>驳回原因：</strong>{application.rejectionReason}
            </AlertDescription>
          </Alert>
        )}
      </div>
    </DashboardLayout>
  );
}