'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Package, Building, Inbox, Send, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import {
  type CustomerMaterial,
  type CustomerMaterialStatus,
  getCustomerMaterials,
  saveCustomerMaterial,
  initMiscData,
} from '@/types/misc';

const statusColors: Record<CustomerMaterialStatus, string> = {
  '待收货': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
  '已入库': 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  '已发料': 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  '已用完': 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
};

const statusLabels: Record<CustomerMaterialStatus, string> = {
  '待收货': '待收货',
  '已入库': '已入库',
  '已发料': '已发料',
  '已用完': '已用完',
};

export default function CustomerMaterialDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [material, setMaterial] = useState<CustomerMaterial | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initMiscData();
    loadData();
  }, [params.id]);

  const loadData = () => {
    const materials = getCustomerMaterials();
    const found = materials.find(m => m.id === params.id);
    setMaterial(found || null);
    setLoading(false);
  };

  const handleReceive = () => {
    if (!material) return;
    const updated = {
      ...material,
      receivedQuantity: material.totalQuantity,
      status: '已入库' as CustomerMaterialStatus,
    };
    saveCustomerMaterial(updated);
    setMaterial(updated);
  };

  const handleIssue = () => {
    if (!material) return;
    const issueQty = Math.min(material.receivedQuantity - material.issuedQuantity, material.remainingQuantity);
    const updated = {
      ...material,
      issuedQuantity: material.issuedQuantity + issueQty,
      status: '已发料' as CustomerMaterialStatus,
    };
    saveCustomerMaterial(updated);
    setMaterial(updated);
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

  if (!material) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <Package className="w-16 h-16 text-muted-foreground" />
          <div className="text-muted-foreground">未找到物料信息</div>
          <Button onClick={() => router.push('/dashboard/customer-material')}>返回列表</Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* 头部 */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard/customer-material')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{material.materialNo}</h1>
              <Badge className={statusColors[material.status]}>{material.status}</Badge>
            </div>
            <p className="text-muted-foreground">{material.materialName}</p>
          </div>
          <div className="flex gap-2">
            {material.status === '待收货' && (
              <Button onClick={handleReceive}>
                <Inbox className="w-4 h-4 mr-2" />确认收货
              </Button>
            )}
            {material.status === '已入库' && (
              <Button onClick={handleIssue}>
                <Send className="w-4 h-4 mr-2" />发料
              </Button>
            )}
          </div>
        </div>

        {/* 基本信息 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="w-5 h-5" />
              基本信息
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-muted-foreground">物料编号</p>
                <p className="font-medium">{material.materialNo}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">物料名称</p>
                <p className="font-medium">{material.materialName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">物料类型</p>
                <p className="font-medium">{material.materialType}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">客户</p>
                <p className="font-medium">{material.customerName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">关联订单</p>
                <p className="font-medium">{material.orderNo}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">单位</p>
                <p className="font-medium">{material.unit}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">仓库</p>
                <p className="font-medium">{material.warehouseName || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">成本核算</p>
                <p className="font-medium">{material.isCostExcluded ? '不计入成本' : '计入成本'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">创建时间</p>
                <p className="font-medium">{material.createdAt}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 库存信息 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              库存信息
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="p-4 bg-muted rounded-lg text-center">
                <p className="text-sm text-muted-foreground">应收数量</p>
                <p className="text-2xl font-bold">{material.totalQuantity}</p>
              </div>
              <div className="p-4 bg-muted rounded-lg text-center">
                <p className="text-sm text-muted-foreground">已收数量</p>
                <p className="text-2xl font-bold text-green-600">{material.receivedQuantity}</p>
              </div>
              <div className="p-4 bg-muted rounded-lg text-center">
                <p className="text-sm text-muted-foreground">已发数量</p>
                <p className="text-2xl font-bold text-blue-600">{material.issuedQuantity}</p>
              </div>
              <div className="p-4 bg-muted rounded-lg text-center">
                <p className="text-sm text-muted-foreground">已用数量</p>
                <p className="text-2xl font-bold text-purple-600">{material.usedQuantity}</p>
              </div>
              <div className="p-4 bg-muted rounded-lg text-center">
                <p className="text-sm text-muted-foreground">剩余数量</p>
                <p className="text-2xl font-bold text-orange-600">{material.remainingQuantity}</p>
              </div>
            </div>

            {/* 进度条 */}
            <div className="mt-6">
              <div className="flex justify-between text-sm mb-2">
                <span>收货进度</span>
                <span>{Math.round((material.receivedQuantity / material.totalQuantity) * 100)}%</span>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 rounded-full transition-all"
                  style={{ width: `${(material.receivedQuantity / material.totalQuantity) * 100}%` }}
                />
              </div>
            </div>

            <div className="mt-4">
              <div className="flex justify-between text-sm mb-2">
                <span>发料进度</span>
                <span>{material.receivedQuantity > 0 ? Math.round((material.issuedQuantity / material.receivedQuantity) * 100) : 0}%</span>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all"
                  style={{ width: `${material.receivedQuantity > 0 ? (material.issuedQuantity / material.receivedQuantity) * 100 : 0}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 备注 */}
        {material.remark && (
          <Card>
            <CardHeader>
              <CardTitle>备注</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{material.remark}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
