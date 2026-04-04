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
import { ArrowRightLeft, Plus, Search, Download, CheckCircle } from 'lucide-react';

interface StockTransfer {
  id: string;
  transferNo: string;
  materialCode: string;
  materialName: string;
  spec: string;
  color: string;
  unit: string;
  quantity: number;
  fromWarehouse: string;
  toWarehouse: string;
  reason: string;
  operator: string;
  auditor?: string;
  status: '待审核' | '已审核' | '已作废';
  createdAt: string;
}

export default function StockTransferPage() {
  const router = useRouter();
  const [transfers, setTransfers] = useState<StockTransfer[]>([]);
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showDialog, setShowDialog] = useState(false);
  const [formData, setFormData] = useState({
    materialCode: '',
    materialName: '',
    spec: '',
    color: '',
    unit: '',
    quantity: 0,
    fromWarehouse: '主仓',
    toWarehouse: '',
    reason: '',
  });

  useEffect(() => {
    loadTransfers();
  }, []);

  const loadTransfers = () => {
    const stored = localStorage.getItem('erp_stock_transfers');
    if (stored) {
      setTransfers(JSON.parse(stored));
    }
  };

  const saveTransfers = (newTransfers: StockTransfer[]) => {
    localStorage.setItem('erp_stock_transfers', JSON.stringify(newTransfers));
    setTransfers(newTransfers);
  };

  const generateTransferNo = () => {
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const seq = (transfers.length + 1).toString().padStart(3, '0');
    return `ST${dateStr}${seq}`;
  };

  const handleCreateTransfer = () => {
    if (!formData.materialCode || !formData.quantity || !formData.toWarehouse) {
      alert('请填写完整信息');
      return;
    }

    const transfer: StockTransfer = {
      id: Date.now().toString(),
      transferNo: generateTransferNo(),
      ...formData,
      operator: '管理员',
      status: '待审核',
      createdAt: new Date().toLocaleString('zh-CN'),
    };

    saveTransfers([transfer, ...transfers]);
    setShowDialog(false);
    setFormData({
      materialCode: '',
      materialName: '',
      spec: '',
      color: '',
      unit: '',
      quantity: 0,
      fromWarehouse: '主仓',
      toWarehouse: '',
      reason: '',
    });
  };

  const handleApprove = (id: string) => {
    const transfer = transfers.find(t => t.id === id);
    if (!transfer) return;

    // 更新库存
    const stocks = JSON.parse(localStorage.getItem('erp_stock') || '[]');
    
    // 扣减调出仓库存
    const fromStock = stocks.find((s: any) => 
      s.materialCode === transfer.materialCode && 
      s.color === transfer.color && 
      s.warehouse === transfer.fromWarehouse
    );
    if (fromStock) {
      fromStock.quantity -= transfer.quantity;
    }

    // 增加调入仓库存
    const toStock = stocks.find((s: any) => 
      s.materialCode === transfer.materialCode && 
      s.color === transfer.color && 
      s.warehouse === transfer.toWarehouse
    );
    if (toStock) {
      toStock.quantity += transfer.quantity;
    } else {
      stocks.push({
        id: Date.now().toString(),
        type: '面料',
        materialCode: transfer.materialCode,
        materialName: transfer.materialName,
        spec: transfer.spec,
        color: transfer.color,
        unit: transfer.unit,
        quantity: transfer.quantity,
        warehouse: transfer.toWarehouse,
        location: '',
        status: '正常',
        createdAt: new Date().toLocaleString('zh-CN'),
        updatedAt: new Date().toLocaleString('zh-CN'),
      });
    }

    localStorage.setItem('erp_stock', JSON.stringify(stocks));

    // 更新调拨单状态
    const updated = transfers.map(t => 
      t.id === id ? { ...t, status: '已审核' as const, auditor: '管理员' } : t
    );
    saveTransfers(updated);
  };

  const handleExport = () => {
    const headers = ['调拨单号', '物料编码', '物料名称', '数量', '调出仓库', '调入仓库', '状态', '创建时间'];
    const rows = transfers.map(t => [
      t.transferNo, t.materialCode, t.materialName, t.quantity.toString(),
      t.fromWarehouse, t.toWarehouse, t.status, t.createdAt
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `库存调拨_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredTransfers = transfers.filter(t => {
    if (searchText && !t.transferNo.includes(searchText) && !t.materialName.includes(searchText)) return false;
    if (filterStatus !== 'all' && t.status !== filterStatus) return false;
    return true;
  });

  const warehouses = ['主仓', '辅料仓', '成品仓', '外协仓', '次品仓'];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <ArrowRightLeft className="w-6 h-6" />
              库存调拨
            </h1>
            <p className="text-muted-foreground mt-1">管理仓库之间的物料调拨</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              导出
            </Button>
            <Button onClick={() => setShowDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              新增调拨
            </Button>
          </div>
        </div>

        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 flex-1 min-w-64">
                <Search className="w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="搜索调拨单号/物料名称..."
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
            <CardTitle>调拨记录</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>调拨单号</TableHead>
                  <TableHead>物料编码</TableHead>
                  <TableHead>物料名称</TableHead>
                  <TableHead>数量</TableHead>
                  <TableHead>调出仓库</TableHead>
                  <TableHead>调入仓库</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>创建时间</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransfers.map(t => (
                  <TableRow key={t.id}>
                    <TableCell className="font-mono">{t.transferNo}</TableCell>
                    <TableCell>{t.materialCode}</TableCell>
                    <TableCell>{t.materialName}</TableCell>
                    <TableCell>{t.quantity} {t.unit}</TableCell>
                    <TableCell>{t.fromWarehouse}</TableCell>
                    <TableCell>{t.toWarehouse}</TableCell>
                    <TableCell>
                      <Badge variant={t.status === '已审核' ? 'default' : 'outline'}>
                        {t.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">{t.createdAt}</TableCell>
                    <TableCell>
                      {t.status === '待审核' && (
                        <Button size="sm" variant="outline" onClick={() => handleApprove(t.id)}>
                          <CheckCircle className="w-4 h-4 mr-1" />
                          审核
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {filteredTransfers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                      暂无调拨记录
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>新增库存调拨</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label>物料编码</Label>
                <Input
                  value={formData.materialCode}
                  onChange={(e) => setFormData({ ...formData, materialCode: e.target.value })}
                  placeholder="物料编码"
                />
              </div>
              <div className="space-y-2">
                <Label>物料名称</Label>
                <Input
                  value={formData.materialName}
                  onChange={(e) => setFormData({ ...formData, materialName: e.target.value })}
                  placeholder="物料名称"
                />
              </div>
              <div className="space-y-2">
                <Label>颜色</Label>
                <Input
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  placeholder="颜色"
                />
              </div>
              <div className="space-y-2">
                <Label>单位</Label>
                <Input
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  placeholder="单位"
                />
              </div>
              <div className="space-y-2">
                <Label>调拨数量</Label>
                <Input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) || 0 })}
                  placeholder="数量"
                />
              </div>
              <div className="space-y-2">
                <Label>调出仓库</Label>
                <Select value={formData.fromWarehouse} onValueChange={(v) => setFormData({ ...formData, fromWarehouse: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {warehouses.map(w => (
                      <SelectItem key={w} value={w}>{w}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>调入仓库</Label>
                <Select value={formData.toWarehouse} onValueChange={(v) => setFormData({ ...formData, toWarehouse: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择调入仓库" />
                  </SelectTrigger>
                  <SelectContent>
                    {warehouses.filter(w => w !== formData.fromWarehouse).map(w => (
                      <SelectItem key={w} value={w}>{w}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>调拨原因</Label>
                <Input
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  placeholder="调拨原因"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDialog(false)}>取消</Button>
              <Button onClick={handleCreateTransfer}>确认调拨</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
