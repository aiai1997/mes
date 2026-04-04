'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  ArrowLeft, 
  Edit, 
  Send, 
  CheckCircle, 
  Clock,
  FileText,
  User,
  Calendar,
  DollarSign,
  Package
} from 'lucide-react';
import {
  type Sample,
  type SampleStatus,
  getSample,
  initSampleData,
  saveSample,
} from '@/types/sample';

const statusColors: Record<SampleStatus, string> = {
  '申请中': 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  '制作中': 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  '待审批': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
  '已通过': 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  '需修改': 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
  '已转大货': 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
};

const statusActions: Record<SampleStatus, SampleStatus[]> = {
  '申请中': ['制作中'],
  '制作中': ['待审批'],
  '待审批': ['已通过', '需修改'],
  '已通过': ['已转大货'],
  '需修改': ['制作中'],
  '已转大货': [],
};

export default function SampleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [sample, setSample] = useState<Sample | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initSampleData();
    loadData();
  }, [params.id]);

  const loadData = () => {
    const found = getSample(params.id as string);
    setSample(found || null);
    setLoading(false);
  };

  const handleStatusChange = (newStatus: SampleStatus) => {
    if (!sample) return;
    
    const updated = {
      ...sample,
      status: newStatus,
      updatedAt: new Date().toLocaleString('zh-CN'),
    };
    
    if (newStatus === '已通过') {
      updated.approvedBy = 'admin';
      updated.approvedTime = new Date().toLocaleString('zh-CN');
    }
    
    saveSample(updated);
    loadData();
  };

  const handleConvertToOrder = () => {
    router.push(`/dashboard/orders/create?sampleId=${sample?.id}`);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">加载中...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (!sample) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <div className="text-muted-foreground">未找到样衣信息</div>
          <Button onClick={() => router.push('/dashboard/sample')}>返回列表</Button>
        </div>
      </DashboardLayout>
    );
  }

  const availableActions = statusActions[sample.status];

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* 头部 */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard/sample')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{sample.sampleNo}</h1>
              <Badge className={statusColors[sample.status]}>{sample.status}</Badge>
            </div>
            <p className="text-muted-foreground">{sample.productName}</p>
          </div>
          <div className="flex gap-2">
            {availableActions.map(action => (
              <Button 
                key={action}
                onClick={() => handleStatusChange(action)}
                variant={action === '已通过' ? 'default' : 'outline'}
              >
                {action === '制作中' && <Edit className="w-4 h-4 mr-2" />}
                {action === '已通过' && <CheckCircle className="w-4 h-4 mr-2" />}
                {action}
              </Button>
            ))}
            {sample.status === '已通过' && (
              <Button onClick={handleConvertToOrder} className="bg-purple-600 hover:bg-purple-700">
                <Send className="w-4 h-4 mr-2" />转大货订单
              </Button>
            )}
          </div>
        </div>

        {/* 基本信息 */}
        <div className="grid grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                基本信息
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">样衣类型</p>
                  <p className="font-medium">{sample.sampleType}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">款号</p>
                  <p className="font-medium">{sample.styleNo}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">客户</p>
                  <p className="font-medium">{sample.customerName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">产品名称</p>
                  <p className="font-medium">{sample.productName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">尺寸</p>
                  <p className="font-medium">{sample.size}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">颜色</p>
                  <p className="font-medium">{sample.color || '-'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                打样信息
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">打样组</p>
                  <p className="font-medium">{sample.teamName || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">设计师</p>
                  <p className="font-medium">{sample.designer || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">创建人</p>
                  <p className="font-medium">{sample.createdBy}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">创建时间</p>
                  <p className="font-medium">{sample.createdAt}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 打样要求 */}
        <Card>
          <CardHeader>
            <CardTitle>打样要求</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">整体要求</p>
              <p className="bg-muted p-3 rounded-lg">{sample.requirements || '无'}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">面料要求</p>
                <p className="bg-muted p-3 rounded-lg">{sample.materialRequirement || '无'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">工艺要求</p>
                <p className="bg-muted p-3 rounded-lg">{sample.processRequirement || '无'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 用料明细 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              用料明细
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>物料名称</TableHead>
                  <TableHead>单位</TableHead>
                  <TableHead className="text-right">数量</TableHead>
                  <TableHead className="text-right">单价</TableHead>
                  <TableHead className="text-right">金额</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sample.materials.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      暂无用料记录
                    </TableCell>
                  </TableRow>
                ) : (
                  sample.materials.map(material => (
                    <TableRow key={material.id}>
                      <TableCell className="font-medium">{material.materialName}</TableCell>
                      <TableCell>{material.unit}</TableCell>
                      <TableCell className="text-right">{material.quantity}</TableCell>
                      <TableCell className="text-right">¥{material.unitPrice.toFixed(2)}</TableCell>
                      <TableCell className="text-right">¥{material.amount.toFixed(2)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* 成本汇总 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              成本汇总
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">材料成本</p>
                <p className="text-2xl font-bold">¥{sample.materialCost.toFixed(2)}</p>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">人工成本</p>
                <p className="text-2xl font-bold">¥{sample.laborCost.toFixed(2)}</p>
              </div>
              <div className="text-center p-4 bg-primary/10 rounded-lg">
                <p className="text-sm text-primary">总成本</p>
                <p className="text-2xl font-bold text-primary">¥{sample.totalCost.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 审批信息 */}
        {sample.approvedBy && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                审批信息
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">审批人</p>
                  <p className="font-medium">{sample.approvedBy}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">审批时间</p>
                  <p className="font-medium">{sample.approvedTime}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">审批意见</p>
                  <p className="font-medium">{sample.approvalComment || '-'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 备注 */}
        {sample.remark && (
          <Card>
            <CardHeader>
              <CardTitle>备注</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="bg-muted p-3 rounded-lg">{sample.remark}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
