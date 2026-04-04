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
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  ScanLine,
  Search,
  RotateCcw,
  Download,
  Settings,
  CheckCircle,
  XCircle,
  DollarSign,
  Package,
  Users,
  TrendingUp,
  Eye,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, type CurrentUser } from '@/types/user';
import {
  type WorkReport,
  type Bundle,
  type StandardProcess,
  type WorkReportStatus,
  getWorkReports,
  getBundles,
  getProcesses,
  auditWorkReport,
  cancelWorkReport,
  initWorkshopData,
} from '@/types/workshop';

const statusColors: Record<WorkReportStatus, string> = {
  '待审核': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
  '已审核': 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  '已结算': 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  '已作废': 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400',
};

export default function WorkshopPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [reports, setReports] = useState<WorkReport[]>([]);
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [processes, setProcesses] = useState<StandardProcess[]>([]);
  
  const [processDialogOpen, setProcessDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<WorkReport | null>(null);
  
  const [searchOrderNo, setSearchOrderNo] = useState('');
  const [searchBundleNo, setSearchBundleNo] = useState('');
  const [searchProcess, setSearchProcess] = useState('全部');
  const [searchWorker, setSearchWorker] = useState('');
  const [searchStatus, setSearchStatus] = useState('全部');
  
  const [alertMessage, setAlertMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const loadData = () => {
    setReports(getWorkReports());
    setBundles(getBundles());
    setProcesses(getProcesses().filter(p => p.isActive));
  };

  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);
    initWorkshopData();
    loadData();
  }, []);

  const hasPermission = (permission: string) => {
    if (!currentUser) return false;
    return currentUser.permissions.includes('all') || currentUser.permissions.includes(permission);
  };

  const filteredReports = reports.filter(r => {
    if (searchOrderNo && !r.orderNo.includes(searchOrderNo)) return false;
    if (searchBundleNo && !r.bundleNo.includes(searchBundleNo)) return false;
    if (searchProcess !== '全部' && r.processName !== searchProcess) return false;
    if (searchWorker && !r.worker.includes(searchWorker)) return false;
    if (searchStatus !== '全部' && r.status !== searchStatus) return false;
    return true;
  });

  const handleReset = () => {
    setSearchOrderNo('');
    setSearchBundleNo('');
    setSearchProcess('全部');
    setSearchWorker('');
    setSearchStatus('全部');
  };

  const handleAudit = (reportId: string) => {
    if (!currentUser) return;
    auditWorkReport(reportId, currentUser.username);
    loadData();
    setAlertMessage({ type: 'success', message: '审核成功' });
    setTimeout(() => setAlertMessage(null), 3000);
  };

  const handleCancel = (reportId: string) => {
    cancelWorkReport(reportId);
    loadData();
    setAlertMessage({ type: 'success', message: '已作废' });
    setTimeout(() => setAlertMessage(null), 3000);
  };

  const handleViewDetail = (report: WorkReport) => {
    setSelectedReport(report);
    setDetailDialogOpen(true);
  };

  const stats = {
    totalReports: reports.length,
    pendingReports: reports.filter(r => r.status === '待审核').length,
    totalGoodQuantity: reports.reduce((sum, r) => sum + r.goodQuantity, 0),
    totalWage: reports.filter(r => r.status === '已审核').reduce((sum, r) => sum + r.pieceWage, 0),
  };

  const workerStats = () => {
    const workerMap = new Map<string, { good: number; wage: number; count: number }>();
    reports.forEach(r => {
      if (r.status !== '已作废') {
        const existing = workerMap.get(r.worker) || { good: 0, wage: 0, count: 0 };
        workerMap.set(r.worker, {
          good: existing.good + r.goodQuantity,
          wage: existing.wage + r.pieceWage,
          count: existing.count + 1,
        });
      }
    });
    return Array.from(workerMap.entries()).map(([worker, data]) => ({ worker, ...data }));
  };

  // 导出报工记录
  const handleExport = () => {
    const headers = ['报工单号', '扎号', '订单号', '款号', '品名', '颜色', '尺码', '工序', '良品数', '返工数', '报废数', '计件工资', '员工', '班组', '状态', '报工时间'];
    const rows = filteredReports.map(r => [
      r.reportNo, r.bundleNo, r.orderNo, r.styleNo, r.productName,
      r.colorName, r.sizeName, r.processName, r.goodQuantity, r.reworkQuantity,
      r.scrapQuantity, r.pieceWage.toFixed(2), r.worker, r.team, r.status, r.createdAt
    ]);
    
    const csvContent = [
      '车间报工明细',
      '导出时间：' + new Date().toLocaleString('zh-CN'),
      '',
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\n');
    
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `报工记录_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <DashboardLayout>
      <div className="max-w-full mx-auto space-y-6">
        {alertMessage && (
          <Alert variant={alertMessage.type === 'error' ? 'destructive' : 'default'}>
            <AlertDescription>{alertMessage.message}</AlertDescription>
          </Alert>
        )}

        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <ScanLine className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">车间报工</h1>
              <p className="text-muted-foreground text-sm">缝制车间报工管理，扫码报工、计件工资</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setProcessDialogOpen(true)}>
              <Settings className="w-4 h-4 mr-2" />
              工序维护
            </Button>
            <Button onClick={() => router.push('/dashboard/workshop/scan')}>
              <ScanLine className="w-4 h-4 mr-2" />
              扫码报工
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 space-y-6">
            {/* 查询区 */}
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                  <div>
                    <Label>订单号</Label>
                    <Input
                      placeholder="请输入"
                      value={searchOrderNo}
                      onChange={(e) => setSearchOrderNo(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>扎号编号</Label>
                    <Input
                      placeholder="请输入"
                      value={searchBundleNo}
                      onChange={(e) => setSearchBundleNo(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>工序</Label>
                    <Select value={searchProcess} onValueChange={setSearchProcess}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="全部">全部</SelectItem>
                        {processes.map(p => (
                          <SelectItem key={p.id} value={p.processName}>{p.processName}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>报工人</Label>
                    <Input
                      placeholder="请输入"
                      value={searchWorker}
                      onChange={(e) => setSearchWorker(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>状态</Label>
                    <Select value={searchStatus} onValueChange={setSearchStatus}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="全部">全部</SelectItem>
                        <SelectItem value="待审核">待审核</SelectItem>
                        <SelectItem value="已审核">已审核</SelectItem>
                        <SelectItem value="已结算">已结算</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end gap-2">
                    <Button onClick={loadData} className="flex-1">
                      <Search className="w-4 h-4 mr-1" />查询
                    </Button>
                    <Button variant="outline" onClick={handleReset}>
                      <RotateCcw className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 报工列表 - 桌面端 */}
            <Card className="hidden lg:block">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-10">#</TableHead>
                        <TableHead>报工单号</TableHead>
                        <TableHead>扎号</TableHead>
                        <TableHead>订单号</TableHead>
                        <TableHead>工序</TableHead>
                        <TableHead className="text-right">良品</TableHead>
                        <TableHead className="text-right">返工</TableHead>
                        <TableHead className="text-right">报废</TableHead>
                        <TableHead className="text-right">工资</TableHead>
                        <TableHead>报工人</TableHead>
                        <TableHead>状态</TableHead>
                        <TableHead className="w-24">操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredReports.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={12} className="text-center py-12 text-muted-foreground">
                            暂无报工记录
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredReports.map((report, index) => (
                          <TableRow key={report.id}>
                            <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                            <TableCell className="font-medium">{report.reportNo}</TableCell>
                            <TableCell>{report.bundleNo}</TableCell>
                            <TableCell>{report.orderNo}</TableCell>
                            <TableCell>{report.processName}</TableCell>
                            <TableCell className="text-right text-green-600 dark:text-green-400">{report.goodQuantity}</TableCell>
                            <TableCell className="text-right text-yellow-600 dark:text-yellow-400">{report.reworkQuantity}</TableCell>
                            <TableCell className="text-right text-red-600 dark:text-red-400">{report.scrapQuantity}</TableCell>
                            <TableCell className="text-right font-medium">¥{(report.pieceWage || 0).toFixed(2)}</TableCell>
                            <TableCell>{report.worker}</TableCell>
                            <TableCell>
                              <Badge className={statusColors[report.status]}>{report.status}</Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                <Button size="sm" variant="ghost" onClick={() => handleViewDetail(report)}>
                                  <Eye className="w-4 h-4" />
                                </Button>
                                {report.status === '待审核' && hasPermission('workshop:audit') && (
                                  <>
                                    <Button size="sm" variant="ghost" onClick={() => handleAudit(report.id)} className="text-green-600 hover:text-green-700">
                                      <CheckCircle className="w-4 h-4" />
                                    </Button>
                                    <Button size="sm" variant="ghost" onClick={() => handleCancel(report.id)} className="text-red-600 hover:text-red-700">
                                      <XCircle className="w-4 h-4" />
                                    </Button>
                                  </>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
                <div className="flex justify-between items-center p-4 border-t">
                  <div className="text-sm text-muted-foreground">共 {filteredReports.length} 条</div>
                  <Button variant="outline" onClick={handleExport}>
                    <Download className="w-4 h-4 mr-2" />导出
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            {/* 报工列表 - 移动端 */}
            <div className="lg:hidden space-y-3">
              {filteredReports.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center text-muted-foreground">暂无报工记录</CardContent>
                </Card>
              ) : (
                filteredReports.map((report, index) => (
                  <Card key={report.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="font-medium">{report.reportNo}</div>
                          <div className="text-muted-foreground text-sm">扎号: {report.bundleNo}</div>
                        </div>
                        <Badge className={statusColors[report.status]}>{report.status}</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                        <div>
                          <span className="text-muted-foreground">工序：</span>
                          <span>{report.processName}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">报工人：</span>
                          <span>{report.worker}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">良品：</span>
                          <span className="text-green-600">{report.goodQuantity}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">工资：</span>
                          <span className="font-medium">¥{(report.pieceWage || 0).toFixed(2)}</span>
                        </div>
                      </div>
                      <div className="flex gap-2 flex-wrap border-t pt-3">
                        <Button size="sm" variant="outline" onClick={() => handleViewDetail(report)}>
                          <Eye className="w-4 h-4 mr-1" />详情
                        </Button>
                        {report.status === '待审核' && hasPermission('workshop:audit') && (
                          <Button size="sm" variant="outline" onClick={() => handleAudit(report.id)} className="border-green-600 text-green-600">
                            <CheckCircle className="w-4 h-4 mr-1" />审核
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
              <div className="text-center text-sm text-muted-foreground py-2">共 {filteredReports.length} 条</div>
            </div>
          </div>

          {/* 右侧看板 */}
          <div className="space-y-4 hidden lg:block">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">生产统计</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground text-sm">报工总数</span>
                  </div>
                  <span className="font-bold">{stats.totalReports}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-yellow-500" />
                    <span className="text-muted-foreground text-sm">待审核</span>
                  </div>
                  <span className="text-yellow-600 dark:text-yellow-400 font-bold">{stats.pendingReports}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-muted-foreground text-sm">良品总数</span>
                  </div>
                  <span className="text-green-600 dark:text-green-400 font-bold">{stats.totalGoodQuantity}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-blue-500" />
                    <span className="text-muted-foreground text-sm">计件工资</span>
                  </div>
                  <span className="text-blue-600 dark:text-blue-400 font-bold">¥{(stats.totalWage || 0).toFixed(0)}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  员工排行
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {workerStats().sort((a, b) => b.good - a.good).slice(0, 5).map((w, i) => (
                    <div key={w.worker} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                          i === 0 ? 'bg-yellow-500 text-black' : 
                          i === 1 ? 'bg-gray-400 text-black' : 
                          i === 2 ? 'bg-amber-700 text-white' : 'bg-muted text-muted-foreground'
                        }`}>
                          {i + 1}
                        </span>
                        <span>{w.worker}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-medium">{w.good}</span>
                        <span className="text-muted-foreground text-xs ml-1">件</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">扎号状态</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">待缝制</span>
                    <span className="text-yellow-600 dark:text-yellow-400">{bundles.filter(b => b.status === '待缝制').length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">缝制中</span>
                    <span className="text-blue-600 dark:text-blue-400">{bundles.filter(b => b.status === '缝制中').length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">已转入尾部</span>
                    <span className="text-green-600 dark:text-green-400">{bundles.filter(b => b.status === '已转入尾部').length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>报工详情</DialogTitle>
            </DialogHeader>
            {selectedReport && (
              <div className="space-y-4 text-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div><span className="text-muted-foreground">报工单号:</span><p className="font-medium">{selectedReport.reportNo}</p></div>
                  <div><span className="text-muted-foreground">扎号:</span><p className="font-medium">{selectedReport.bundleNo}</p></div>
                  <div><span className="text-muted-foreground">订单号:</span><p className="font-medium">{selectedReport.orderNo}</p></div>
                  <div><span className="text-muted-foreground">款号:</span><p className="font-medium">{selectedReport.styleNo}</p></div>
                  <div><span className="text-muted-foreground">工序:</span><p className="font-medium">{selectedReport.processName}</p></div>
                  <div><span className="text-muted-foreground">工序单价:</span><p className="font-medium">¥{(selectedReport.processPrice || 0).toFixed(2)}</p></div>
                  <div><span className="text-muted-foreground">良品数:</span><p className="text-green-600 dark:text-green-400">{selectedReport.goodQuantity}</p></div>
                  <div><span className="text-muted-foreground">返工数:</span><p className="text-yellow-600 dark:text-yellow-400">{selectedReport.reworkQuantity}</p></div>
                  <div><span className="text-muted-foreground">报废数:</span><p className="text-red-600 dark:text-red-400">{selectedReport.scrapQuantity}</p></div>
                  {selectedReport.scrapReason && <div className="col-span-2"><span className="text-muted-foreground">报废原因:</span><p className="text-red-600 dark:text-red-400">{selectedReport.scrapReason}</p></div>}
                  <div><span className="text-muted-foreground">计件工资:</span><p className="font-bold text-lg">¥{(selectedReport.pieceWage || 0).toFixed(2)}</p></div>
                  <div><span className="text-muted-foreground">状态:</span><Badge className={statusColors[selectedReport.status]}>{selectedReport.status}</Badge></div>
                  <div><span className="text-muted-foreground">报工人:</span><p className="font-medium">{selectedReport.worker}</p></div>
                  <div><span className="text-muted-foreground">报工时间:</span><p className="font-medium">{selectedReport.createdAt}</p></div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        <Dialog open={processDialogOpen} onOpenChange={setProcessDialogOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>标准工序库</DialogTitle>
            </DialogHeader>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>代码</TableHead>
                  <TableHead>工序名称</TableHead>
                  <TableHead>分类</TableHead>
                  <TableHead className="text-right">单价</TableHead>
                  <TableHead>顺序</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {processes.map(p => (
                  <TableRow key={p.id}>
                    <TableCell>{p.processCode}</TableCell>
                    <TableCell className="font-medium">{p.processName}</TableCell>
                    <TableCell>{p.category}</TableCell>
                    <TableCell className="text-right text-green-600 dark:text-green-400">¥{(p.standardPrice || 0).toFixed(2)}</TableCell>
                    <TableCell>{p.processOrder}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
