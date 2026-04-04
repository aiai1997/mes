'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ClipboardCheck, Plus, Search, Download, CheckCircle, AlertTriangle } from 'lucide-react';
import { getStockItems, saveStockItem, type StockItem } from '@/types/stock';

interface StockCheckItem {
  id: string;
  checkNo: string;
  materialCode: string;
  materialName: string;
  spec: string;
  color: string;
  unit: string;
  warehouse: string;
  bookQuantity: number;    // 账面数量
  actualQuantity: number;  // 实盘数量
  profitLoss: number;      // 盈亏数量
  reason: string;
  operator: string;
  auditor?: string;
  status: '待审核' | '已审核';
  createdAt: string;
}

export default function StockCheckPage() {
  const router = useRouter();
  const [checkItems, setCheckItems] = useState<StockCheckItem[]>([]);
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showDialog, setShowDialog] = useState(false);
  const [formData, setFormData] = useState({
    materialCode: '',
    materialName: '',
    spec: '',
    color: '',
    unit: '',
    warehouse: '',
    bookQuantity: 0,
    actualQuantity: 0,
    reason: '',
  });

  useEffect(() => {
    loadCheckItems();
    setStockItems(getStockItems());
  }, []);

  const loadCheckItems = () => {
    const stored = localStorage.getItem('erp_stock_checks');
    if (stored) {
      setCheckItems(JSON.parse(stored));
    }
  };

  const saveCheckItems = (newItems: StockCheckItem[]) => {
    localStorage.setItem('erp_stock_checks', JSON.stringify(newItems));
    setCheckItems(newItems);
  };

  const generateCheckNo = () => {
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const seq = (checkItems.length + 1).toString().padStart(3, '0');
    return `SC${dateStr}${seq}`;
  };

  const handleCreateCheck = () => {
    if (!formData.materialCode || !formData.warehouse) {
      alert('请填写完整信息');
      return;
    }

    const profitLoss = formData.actualQuantity - formData.bookQuantity;

    const checkItem: StockCheckItem = {
      id: Date.now().toString(),
      checkNo: generateCheckNo(),
      ...formData,
      profitLoss,
      operator: '管理员',
      status: '待审核',
      createdAt: new Date().toLocaleString('zh-CN'),
    };

    saveCheckItems([checkItem, ...checkItems]);
    setShowDialog(false);
    setFormData({
      materialCode: '',
      materialName: '',
      spec: '',
      color: '',
      unit: '',
      warehouse: '',
      bookQuantity: 0,
      actualQuantity: 0,
      reason: '',
    });
  };

  const handleApprove = (id: string) => {
    const checkItem = checkItems.find(c => c.id === id);
    if (!checkItem) return;

    // 更新库存
    const stocks = getStockItems();
    const stock = stocks.find(s => 
      s.materialCode === checkItem.materialCode && 
      s.color === checkItem.color &&
      s.warehouse === checkItem.warehouse
    );
    
    if (stock) {
      stock.quantity = checkItem.actualQuantity;
      stock.updatedAt = new Date().toLocaleString('zh-CN');
      saveStockItem(stock);
    }

    // 更新盘点单状态
    const updated = checkItems.map(c => 
      c.id === id ? { ...c, status: '已审核' as const, auditor: '管理员' } : c
    );
    saveCheckItems(updated);
  };

  const handleExport = () => {
    const headers = ['盘点单号', '物料编码', '物料名称', '仓库', '账面数量', '实盘数量', '盈亏数量', '原因', '状态', '创建时间'];
    const rows = checkItems.map(c => [
      c.checkNo, c.materialCode, c.materialName, c.warehouse,
      c.bookQuantity.toString(), c.actualQuantity.toString(), c.profitLoss.toString(),
      c.reason, c.status, c.createdAt
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `库存盘点_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSelectStock = (materialCode: string) => {
    const stock = stockItems.find(s => s.materialCode === materialCode);
    if (stock) {
      setFormData({
        ...formData,
        materialCode: stock.materialCode,
        materialName: stock.materialName,
        spec: stock.spec,
        color: stock.color,
        unit: stock.unit,
        warehouse: stock.warehouse,
        bookQuantity: stock.quantity,
      });
    }
  };

  const filteredItems = checkItems.filter(c => {
    if (searchText && !c.checkNo.includes(searchText) && !c.materialName.includes(searchText)) return false;
    if (filterStatus !== 'all' && c.status !== filterStatus) return false;
    return true;
  });

  const getStats = () => ({
    total: checkItems.length,
    pending: checkItems.filter(c => c.status === '待审核').length,
    profit: checkItems.filter(c => c.profitLoss > 0).length,
    loss: checkItems.filter(c => c.profitLoss < 0).length,
  });

  const stats = getStats();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <ClipboardCheck className="w-6 h-6" />
              库存盘点
            </h1>
            <p className="text-muted-foreground mt-1">管理库存盘点，审核后自动调整库存</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              导出
            </Button>
            <Button onClick={() => setShowDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              新增盘点
            </Button>
          </div>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">盘点总数</p>
                  <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                </div>
                <ClipboardCheck className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">待审核</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.pending}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">盘盈</p>
                  <p className="text-2xl font-bold text-green-600">{stats.profit}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">盘亏</p>
                  <p className="text-2xl font-bold text-red-600">{stats.loss}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 flex-1 min-w-64">
                <Search className="w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="搜索盘点单号/物料名称..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="flex-1"
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部状态</SelectItem>
                  <SelectItem value="待审核">待审核</SelectItem>
                  <SelectItem value="已审核">已审核</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>盘点记录</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>盘点单号</TableHead>
                  <TableHead>物料编码</TableHead>
                  <TableHead>物料名称</TableHead>
                  <TableHead>仓库</TableHead>
                  <TableHead>账面数量</TableHead>
                  <TableHead>实盘数量</TableHead>
                  <TableHead>盈亏</TableHead>
                  <TableHead>原因</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map(c => (
                  <TableRow key={c.id}>
                    <TableCell className="font-mono">{c.checkNo}</TableCell>
                    <TableCell>{c.materialCode}</TableCell>
                    <TableCell>{c.materialName}</TableCell>
                    <TableCell>{c.warehouse}</TableCell>
                    <TableCell>{c.bookQuantity} {c.unit}</TableCell>
                    <TableCell>{c.actualQuantity} {c.unit}</TableCell>
                    <TableCell>
                      <span className={c.profitLoss > 0 ? 'text-green-600 font-medium' : c.profitLoss < 0 ? 'text-red-600 font-medium' : ''}>
                        {c.profitLoss > 0 ? '+' : ''}{c.profitLoss} {c.unit}
                      </span>
                    </TableCell>
                    <TableCell>{c.reason || '-'}</TableCell>
                    <TableCell>
                      <Badge variant={c.status === '已审核' ? 'default' : 'outline'}>
                        {c.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {c.status === '待审核' && (
                        <Button size="sm" variant="outline" onClick={() => handleApprove(c.id)}>
                          <CheckCircle className="w-4 h-4 mr-1" />
                          审核
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {filteredItems.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center text-muted-foreground py-8">
                      暂无盘点记录
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>新增库存盘点</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label>选择物料</Label>
                <Select onValueChange={handleSelectStock}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择物料" />
                  </SelectTrigger>
                  <SelectContent>
                    {stockItems.map(s => (
                      <SelectItem key={s.id} value={s.materialCode}>
                        {s.materialCode} - {s.materialName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>仓库</Label>
                <Input value={formData.warehouse} readOnly />
              </div>
              <div className="space-y-2">
                <Label>物料编码</Label>
                <Input value={formData.materialCode} readOnly />
              </div>
              <div className="space-y-2">
                <Label>物料名称</Label>
                <Input value={formData.materialName} readOnly />
              </div>
              <div className="space-y-2">
                <Label>账面数量</Label>
                <Input value={formData.bookQuantity} readOnly />
              </div>
              <div className="space-y-2">
                <Label>实盘数量 *</Label>
                <Input
                  type="number"
                  value={formData.actualQuantity}
                  onChange={(e) => setFormData({ ...formData, actualQuantity: parseFloat(e.target.value) || 0 })}
                  placeholder="输入实盘数量"
                />
              </div>
              <div className="col-span-2 space-y-2">
                <Label>差异原因</Label>
                <Input
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  placeholder="如数量有差异请填写原因"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDialog(false)}>取消</Button>
              <Button onClick={handleCreateCheck}>确认盘点</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
