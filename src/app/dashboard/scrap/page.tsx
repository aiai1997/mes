'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Trash2, Plus, Search, Download, AlertTriangle, FileText } from 'lucide-react';
import { getWorkReports, type WorkReport, type ScrapReason } from '@/types/workshop';
import { getOrders, type Order } from '@/types/order';

interface ScrapRecord {
  id: string;
  scrapNo: string;
  orderNo: string;
  styleNo: string;
  productName: string;
  colorName: string;
  sizeName: string;
  quantity: number;
  reason: ScrapReason;
  stage: '裁床' | '缝制' | '整烫' | '质检' | '包装';
  responsiblePerson: string;
  cost: number;
  status: '待处理' | '已处理' | '已索赔';
  remark: string;
  createdAt: string;
  updatedAt: string;
}

const SCRAP_REASONS: ScrapReason[] = ['裁片问题', '缝制不良', '辅料问题', '人为失误', '其他'];
const SCRAP_STAGES = ['裁床', '缝制', '整烫', '质检', '包装'] as const;

export default function ScrapPage() {
  const router = useRouter();
  const [scrapRecords, setScrapRecords] = useState<ScrapRecord[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [workReports, setWorkReports] = useState<WorkReport[]>([]);
  const [searchText, setSearchText] = useState('');
  const [filterReason, setFilterReason] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<ScrapRecord | null>(null);
  const [formData, setFormData] = useState({
    orderNo: '',
    styleNo: '',
    productName: '',
    colorName: '',
    sizeName: '',
    quantity: 1,
    reason: '其他' as ScrapReason,
    stage: '缝制' as const,
    responsiblePerson: '',
    cost: 0,
    remark: '',
  });

  useEffect(() => {
    loadScrapRecords();
    setOrders(getOrders());
    setWorkReports(getWorkReports());
  }, []);

  const loadScrapRecords = () => {
    const stored = localStorage.getItem('erp_scrap_records');
    if (stored) {
      setScrapRecords(JSON.parse(stored));
    }
  };

  const saveScrapRecords = (records: ScrapRecord[]) => {
    localStorage.setItem('erp_scrap_records', JSON.stringify(records));
    setScrapRecords(records);
  };

  const generateScrapNo = () => {
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const todayRecords = scrapRecords.filter(r => r.scrapNo.includes(dateStr));
    const seq = (todayRecords.length + 1).toString().padStart(3, '0');
    return `SC${dateStr}${seq}`;
  };

  const handleAddScrap = () => {
    const newRecord: ScrapRecord = {
      id: `SCR${Date.now()}`,
      scrapNo: generateScrapNo(),
      ...formData,
      status: '待处理',
      createdAt: new Date().toLocaleString('zh-CN'),
      updatedAt: new Date().toLocaleString('zh-CN'),
    };

    saveScrapRecords([newRecord, ...scrapRecords]);
    setShowAddDialog(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      orderNo: '',
      styleNo: '',
      productName: '',
      colorName: '',
      sizeName: '',
      quantity: 1,
      reason: '其他',
      stage: '缝制',
      responsiblePerson: '',
      cost: 0,
      remark: '',
    });
  };

  const handleStatusChange = (id: string, status: '待处理' | '已处理' | '已索赔') => {
    const records = scrapRecords.map(r => 
      r.id === id ? { ...r, status, updatedAt: new Date().toLocaleString('zh-CN') } : r
    );
    saveScrapRecords(records);
  };

  const handleDelete = (id: string) => {
    if (confirm('确定要删除此报废记录吗？')) {
      saveScrapRecords(scrapRecords.filter(r => r.id !== id));
    }
  };

  const handleView = (record: ScrapRecord) => {
    setSelectedRecord(record);
    setShowViewDialog(true);
  };

  const handleExport = () => {
    const headers = ['报废单号', '订单号', '款号', '产品名称', '颜色', '尺码', '数量', '报废原因', '发生阶段', '责任人', '损失金额', '状态', '创建时间'];
    const rows = scrapRecords.map(r => [
      r.scrapNo,
      r.orderNo,
      r.styleNo,
      r.productName,
      r.colorName,
      r.sizeName,
      r.quantity.toString(),
      r.reason,
      r.stage,
      r.responsiblePerson,
      r.cost.toFixed(2),
      r.status,
      r.createdAt
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `报废记录_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // 统计数据
  const getStatistics = () => {
    const total = scrapRecords.length;
    const totalQuantity = scrapRecords.reduce((sum, r) => sum + r.quantity, 0);
    const totalCost = scrapRecords.reduce((sum, r) => sum + r.cost, 0);
    const pending = scrapRecords.filter(r => r.status === '待处理').length;
    const byReason: Record<string, number> = {};
    scrapRecords.forEach(r => {
      byReason[r.reason] = (byReason[r.reason] || 0) + r.quantity;
    });

    return { total, totalQuantity, totalCost, pending, byReason };
  };

  const stats = getStatistics();

  // 筛选记录
  const filteredRecords = scrapRecords.filter(r => {
    if (searchText && !r.scrapNo.includes(searchText) && !r.productName.includes(searchText) && !r.orderNo.includes(searchText)) {
      return false;
    }
    if (filterReason !== 'all' && r.reason !== filterReason) return false;
    if (filterStatus !== 'all' && r.status !== filterStatus) return false;
    return true;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* 页面标题 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Trash2 className="w-6 h-6" />
              报废管理
            </h1>
            <p className="text-muted-foreground mt-1">管理生产过程中的报废记录，追踪损失原因</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              导出
            </Button>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              新增报废
            </Button>
          </div>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">报废总单数</p>
                  <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                </div>
                <FileText className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">报废总数量</p>
                  <p className="text-2xl font-bold text-foreground">{stats.totalQuantity}</p>
                </div>
                <Trash2 className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">损失总金额</p>
                  <p className="text-2xl font-bold text-red-600">¥{stats.totalCost.toFixed(2)}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">待处理</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.pending}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 原因分布 */}
        {Object.keys(stats.byReason).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>报废原因分布</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                {Object.entries(stats.byReason).map(([reason, count]) => (
                  <div key={reason} className="flex items-center gap-2 px-4 py-2 bg-muted rounded-lg">
                    <Badge variant="outline">{reason}</Badge>
                    <span className="font-medium">{count} 件</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 筛选条件 */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 flex-1 min-w-64">
                <Search className="w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="搜索报废单号/订单号/产品名称..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="flex-1"
                />
              </div>
              <Select value={filterReason} onValueChange={setFilterReason}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="报废原因" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部原因</SelectItem>
                  {SCRAP_REASONS.map(r => (
                    <SelectItem key={r} value={r}>{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部状态</SelectItem>
                  <SelectItem value="待处理">待处理</SelectItem>
                  <SelectItem value="已处理">已处理</SelectItem>
                  <SelectItem value="已索赔">已索赔</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* 报废记录列表 */}
        <Card>
          <CardHeader>
            <CardTitle>报废记录列表</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>报废单号</TableHead>
                  <TableHead>订单号</TableHead>
                  <TableHead>产品/颜色/尺码</TableHead>
                  <TableHead>数量</TableHead>
                  <TableHead>报废原因</TableHead>
                  <TableHead>发生阶段</TableHead>
                  <TableHead>责任人</TableHead>
                  <TableHead>损失金额</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecords.map(record => (
                  <TableRow key={record.id}>
                    <TableCell className="font-mono">{record.scrapNo}</TableCell>
                    <TableCell>{record.orderNo}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{record.productName}</div>
                        <div className="text-xs text-muted-foreground">{record.colorName} / {record.sizeName}</div>
                      </div>
                    </TableCell>
                    <TableCell>{record.quantity}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{record.reason}</Badge>
                    </TableCell>
                    <TableCell>{record.stage}</TableCell>
                    <TableCell>{record.responsiblePerson}</TableCell>
                    <TableCell className="text-red-600 font-medium">¥{record.cost.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge variant={
                        record.status === '已索赔' ? 'default' :
                        record.status === '已处理' ? 'secondary' : 'destructive'
                      }>
                        {record.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline" onClick={() => handleView(record)}>
                          查看
                        </Button>
                        {record.status === '待处理' && (
                          <Button size="sm" variant="outline" onClick={() => handleStatusChange(record.id, '已处理')}>
                            处理
                          </Button>
                        )}
                        {record.status === '已处理' && (
                          <Button size="sm" variant="outline" onClick={() => handleStatusChange(record.id, '已索赔')}>
                            索赔
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredRecords.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center text-muted-foreground py-8">
                      暂无报废记录
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* 新增报废对话框 */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>新增报废记录</DialogTitle>
              <DialogDescription>记录生产过程中的报废情况</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label>订单号</Label>
                <Input
                  value={formData.orderNo}
                  onChange={(e) => setFormData({ ...formData, orderNo: e.target.value })}
                  placeholder="输入订单号"
                />
              </div>
              <div className="space-y-2">
                <Label>款号</Label>
                <Input
                  value={formData.styleNo}
                  onChange={(e) => setFormData({ ...formData, styleNo: e.target.value })}
                  placeholder="输入款号"
                />
              </div>
              <div className="space-y-2">
                <Label>产品名称</Label>
                <Input
                  value={formData.productName}
                  onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                  placeholder="输入产品名称"
                />
              </div>
              <div className="space-y-2">
                <Label>颜色</Label>
                <Input
                  value={formData.colorName}
                  onChange={(e) => setFormData({ ...formData, colorName: e.target.value })}
                  placeholder="输入颜色"
                />
              </div>
              <div className="space-y-2">
                <Label>尺码</Label>
                <Input
                  value={formData.sizeName}
                  onChange={(e) => setFormData({ ...formData, sizeName: e.target.value })}
                  placeholder="输入尺码"
                />
              </div>
              <div className="space-y-2">
                <Label>报废数量</Label>
                <Input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                  min="1"
                />
              </div>
              <div className="space-y-2">
                <Label>报废原因</Label>
                <Select value={formData.reason} onValueChange={(v) => setFormData({ ...formData, reason: v as ScrapReason })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SCRAP_REASONS.map(r => (
                      <SelectItem key={r} value={r}>{r}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>发生阶段</Label>
                <Select value={formData.stage} onValueChange={(v) => setFormData({ ...formData, stage: v as typeof formData.stage })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SCRAP_STAGES.map(s => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>责任人</Label>
                <Input
                  value={formData.responsiblePerson}
                  onChange={(e) => setFormData({ ...formData, responsiblePerson: e.target.value })}
                  placeholder="输入责任人"
                />
              </div>
              <div className="space-y-2">
                <Label>损失金额</Label>
                <Input
                  type="number"
                  value={formData.cost}
                  onChange={(e) => setFormData({ ...formData, cost: parseFloat(e.target.value) || 0 })}
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="col-span-2 space-y-2">
                <Label>备注</Label>
                <Textarea
                  value={formData.remark}
                  onChange={(e) => setFormData({ ...formData, remark: e.target.value })}
                  placeholder="输入详细说明..."
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>取消</Button>
              <Button onClick={handleAddScrap}>确认保存</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* 查看详情对话框 */}
        <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>报废详情</DialogTitle>
            </DialogHeader>
            {selectedRecord && (
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">报废单号</Label>
                    <p className="font-mono">{selectedRecord.scrapNo}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">状态</Label>
                    <p>
                      <Badge variant={
                        selectedRecord.status === '已索赔' ? 'default' :
                        selectedRecord.status === '已处理' ? 'secondary' : 'destructive'
                      }>
                        {selectedRecord.status}
                      </Badge>
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">订单号</Label>
                    <p>{selectedRecord.orderNo}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">款号</Label>
                    <p>{selectedRecord.styleNo}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">产品名称</Label>
                    <p>{selectedRecord.productName}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">颜色/尺码</Label>
                    <p>{selectedRecord.colorName} / {selectedRecord.sizeName}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">报废数量</Label>
                    <p className="font-bold text-red-600">{selectedRecord.quantity}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">损失金额</Label>
                    <p className="font-bold text-red-600">¥{selectedRecord.cost.toFixed(2)}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">报废原因</Label>
                    <p><Badge variant="outline">{selectedRecord.reason}</Badge></p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">发生阶段</Label>
                    <p>{selectedRecord.stage}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">责任人</Label>
                    <p>{selectedRecord.responsiblePerson}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">创建时间</Label>
                    <p>{selectedRecord.createdAt}</p>
                  </div>
                </div>
                {selectedRecord.remark && (
                  <div>
                    <Label className="text-muted-foreground">备注</Label>
                    <p className="text-sm bg-muted p-2 rounded">{selectedRecord.remark}</p>
                  </div>
                )}
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowViewDialog(false)}>关闭</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
