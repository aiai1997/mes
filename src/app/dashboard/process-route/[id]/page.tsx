'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Edit, Copy, CheckCircle, AlertCircle, Clock, Package } from 'lucide-react';
import {
  type ProcessRoute,
  getProcessRoutes,
  initProcessRouteData,
} from '@/types/process-route';

export default function ProcessRouteDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [route, setRoute] = useState<ProcessRoute | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initProcessRouteData();
    loadData();
  }, [params.id]);

  const loadData = () => {
    const routes = getProcessRoutes();
    const found = routes.find(r => r.id === params.id);
    setRoute(found || null);
    setLoading(false);
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

  if (!route) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <div className="text-muted-foreground">未找到工艺路线</div>
          <Button onClick={() => router.push('/dashboard/process-route')}>返回列表</Button>
        </div>
      </DashboardLayout>
    );
  }

  const totalTime = route.processes.reduce((sum, p) => sum + p.standardTime, 0);
  const totalPrice = route.processes.reduce((sum, p) => sum + p.standardPrice, 0);

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* 头部 */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard/process-route')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{route.routeName}</h1>
              <Badge className={route.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                {route.isActive ? '启用' : '停用'}
              </Badge>
            </div>
            <p className="text-muted-foreground">{route.routeCode}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.push(`/dashboard/process-route/create?copyFrom=${route.id}`)}>
              <Copy className="w-4 h-4 mr-2" />复制
            </Button>
            <Button onClick={() => router.push(`/dashboard/process-route/${route.id}/edit`)}>
              <Edit className="w-4 h-4 mr-2" />编辑
            </Button>
          </div>
        </div>

        {/* 基本信息 */}
        <div className="grid grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                基本信息
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">路线编号</p>
                  <p className="font-medium">{route.routeCode}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">路线名称</p>
                  <p className="font-medium">{route.routeName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">适用款号</p>
                  <p className="font-medium">{route.styleNo}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">品类</p>
                  <p className="font-medium">{route.category}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">创建时间</p>
                  <p className="font-medium">{route.createdAt}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">更新时间</p>
                  <p className="font-medium">{route.updatedAt}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                工艺汇总
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">工序数量</p>
                  <p className="text-2xl font-bold">{route.processes.length}</p>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">总工时</p>
                  <p className="text-2xl font-bold">{totalTime}分</p>
                </div>
                <div className="text-center p-4 bg-primary/10 rounded-lg">
                  <p className="text-sm text-primary">总单价</p>
                  <p className="text-2xl font-bold text-primary">¥{totalPrice.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 工序列表 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              工序流程
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">序号</TableHead>
                  <TableHead>工序代码</TableHead>
                  <TableHead>工序名称</TableHead>
                  <TableHead>工种</TableHead>
                  <TableHead>班组</TableHead>
                  <TableHead className="text-right">单价(元)</TableHead>
                  <TableHead className="text-right">工时(分)</TableHead>
                  <TableHead>难度</TableHead>
                  <TableHead>必检</TableHead>
                  <TableHead>下一工序</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {route.processes.map((process) => (
                  <TableRow key={process.id}>
                    <TableCell className="font-medium">{process.processOrder}</TableCell>
                    <TableCell>{process.processCode}</TableCell>
                    <TableCell>{process.processName}</TableCell>
                    <TableCell>{process.workType}</TableCell>
                    <TableCell>{process.teamName || '-'}</TableCell>
                    <TableCell className="text-right">¥{process.standardPrice.toFixed(2)}</TableCell>
                    <TableCell className="text-right">{process.standardTime}</TableCell>
                    <TableCell>
                      <Badge variant="outline">Lv.{process.difficulty}</Badge>
                    </TableCell>
                    <TableCell>
                      {process.isRequiredCheck ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {process.nextProcessCode || '结束'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* 工序流程图 */}
        <Card>
          <CardHeader>
            <CardTitle>工序流程图</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-center gap-2">
              {route.processes.map((process, index) => (
                <div key={process.id} className="flex items-center gap-2">
                  <div className="px-4 py-2 bg-primary/10 rounded-lg border border-primary/20">
                    <div className="text-sm font-medium">{process.processName}</div>
                    <div className="text-xs text-muted-foreground">
                      {process.processCode} · {process.standardTime}分
                    </div>
                  </div>
                  {index < route.processes.length - 1 && (
                    <div className="text-muted-foreground">→</div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
