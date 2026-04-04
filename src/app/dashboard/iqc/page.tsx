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
import { CheckCircle, Plus, Search, Download, AlertTriangle, XCircle } from 'lucide-react';

interface IQCInspection {
  id: string;
  inspectionNo: string;
  inboundNo: string;
  purchaseNo: string;
  supplierName: string;
  materialCode: string;
  materialName: string;
  spec: string;
  color: string;
  batchNo: string;
  quantity: number;
  sampleQuantity: number;
  inspectQuantity: number;
  passQuantity: number;
  failQuantity: number;
  defectType: string;
  defectDesc: string;
  result: '合格' | '不合格' | '让步接收' | '待检';
  inspector: string;
  inspectDate: string;
  status: '待检' | '已检';
  createdAt: string;
}

export default function IQCPage() {
  const router = useRouter();
  const [inspections, setInspections] = useState<IQCInspection[]>([]);
  const [searchText, setSearchText] = useState('');
  const [filterResult, setFilterResult] = useState('all');
  const [showDialog, setShowDialog] = useState(false);
  const [formData, setFormData] = useState({
    inboundNo: '',
    purchaseNo: '',
    supplierName: '',
    materialCode: '',
    materialName: '',
    spec: '',
    color: '',
    batchNo: '',
    quantity: 0,
    sampleQuantity: 0,
    inspectQuantity: 0,
    passQuantity: 0,
    failQuantity: 0,
    defectType: '',
    defectDesc: '',
    result: '待检' as const,
  });

  useEffect(() => {
    loadInspections();
  }, []);

  const loadInspections = () => {
    const stored = localStorage.getItem('erp_iqc');
    if (stored) {
      setInspections(JSON.parse(stored));
    }
  };

  const saveInspections = (newItems: IQCInspection[]) => {
    localStorage.setItem('erp_iqc', JSON.stringify(newItems));
    setInspections(newItems);
  };

  const generateInspectionNo = () => {
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const seq = (inspections.length + 1).toString().padStart(3, '0');
    return `IQC${dateStr}${seq}`;
  };

  const handleCreateInspection = () => {
    if (!formData.materialCode || !formData.quantity) {
      alert('请填写完整信息');
      return;
    }

    const inspection: IQCInspection = {
      id: Date.now().toString(),
      inspectionNo: generateInspectionNo(),
      ...formData,
      inspector: '质检员',
      inspectDate: new Date().toISOString().slice(0, 10),
      status: '待检',
      createdAt: new Date().toLocaleString('zh-CN'),
    };

    saveInspections([inspection, ...inspections]);
    setShowDialog(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      inboundNo: '',
      purchaseNo: '',
      supplierName: '',
      materialCode: '',
      materialName: '',
      spec: '',
      color: '',
      batchNo: '',
      quantity: 0,
      sampleQuantity: 0,
      inspectQuantity: 0,
      passQuantity: 0,
      failQuantity: 0,
      defectType: '',
      defectDesc: '',
      result: '待检',
    });
  };

  const handleInspect = (id: string, result: '合格' | '不合格' | '让步接收') => {
    const updated = inspections.map(i => 
      i.id === id ? { 
        ...i, 
        status: '已检' as const, 
        result,
        inspectDate: new Date().toISOString().slice(0, 10),
        inspector: '质检员',
      } : i
    );
    saveInspections(updated);
  };

  const handleExport = () => {
    const headers = ['检验单号', '入库单号', '采购单号', '供应商', '物料编码', '物料名称', '数量', '抽检数', '合格数', '不合格数', '检验结果', '检验日期', '状态'];
    const rows = inspections.map(i => [
      i.inspectionNo, i.inboundNo, i.purchaseNo, i.supplierName,
      i.materialCode, i.materialName, i.quantity.toString(),
      i.inspectQuantity.toString(), i.passQuantity.toString(), i.failQuantity.toString(),
      i.result, i.inspectDate, i.status
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `IQC来料检验_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredInspections = inspections.filter(i => {
    if (searchText && !i.inspectionNo.includes(searchText) && !i.materialName.includes(searchText)) return false;
    if (filterResult !== 'all' && i.result !== filterResult) return false;
    return true;
  });

  const getStats = () => ({
    total: inspections.length,
    pending: inspections.filter(i => i.status === '待检').length,
    passed: inspections.filter(i => i.result === '合格').length,
    failed: inspections.filter(i => i.result === '不合格').length,
  });

  const stats = getStats();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <CheckCircle className="w-6 h-6" />
              IQC来料检验
            </h1>
            <p className="text-muted-foreground mt-1">来料质量检验管理，确保入库物料质量合格</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              导出
            </Button>
            <Button onClick={() => setShowDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              新建检验单
            </Button>
          </div>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">检验总数</p>
                  <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">待检</p>
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
                  <p className="text-sm text-muted-foreground">合格</p>
                  <p className="text-2xl font-bold text-green-600">{stats.passed}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">不合格</p>
                  <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
                </div>
                <XCircle className="w-8 h-8 text-red-500" />
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
                  placeholder="搜索检验单号/物料名称..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="flex-1"
                />
              </div>
              <Select value={filterResult} onValueChange={setFilterResult}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="检验结果" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部结果</SelectItem>
                  <SelectItem value="待检">待检</SelectItem>
                  <SelectItem value="合格">合格</SelectItem>
                  <SelectItem value="不合格">不合格</SelectItem>
                  <SelectItem value="让步接收">让步接收</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>检验记录</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>检验单号</TableHead>
                  <TableHead>供应商</TableHead>
                  <TableHead>物料编码</TableHead>
                  <TableHead>物料名称</TableHead>
                  <TableHead>数量</TableHead>
                  <TableHead>抽检数</TableHead>
                  <TableHead>合格数</TableHead>
                  <TableHead>不合格数</TableHead>
                  <TableHead>检验结果</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInspections.map(i => (
                  <TableRow key={i.id}>
                    <TableCell className="font-mono">{i.inspectionNo}</TableCell>
                    <TableCell>{i.supplierName}</TableCell>
                    <TableCell>{i.materialCode}</TableCell>
                    <TableCell>{i.materialName}</TableCell>
                    <TableCell>{i.quantity}</TableCell>
                    <TableCell>{i.inspectQuantity || i.sampleQuantity}</TableCell>
                    <TableCell>{i.passQuantity || '-'}</TableCell>
                    <TableCell className={i.failQuantity > 0 ? 'text-red-600 font-medium' : ''}>
                      {i.failQuantity || '-'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                        i.result === '合格' ? 'default' :
                        i.result === '不合格' ? 'destructive' :
                        i.result === '让步接收' ? 'secondary' : 'outline'
                      }>
                        {i.result}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={i.status === '已检' ? 'default' : 'outline'}>
                        {i.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {i.status === '待检' && (
                        <div className="flex gap-1">
                          <Button size="sm" variant="outline" className="text-green-600" onClick={() => handleInspect(i.id, '合格')}>
                            合格
                          </Button>
                          <Button size="sm" variant="outline" className="text-red-600" onClick={() => handleInspect(i.id, '不合格')}>
                            不合格
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {filteredInspections.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center text-muted-foreground py-8">
                      暂无检验记录
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
              <DialogTitle>新建IQC检验单</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label>入库单号</Label>
                <Input
                  value={formData.inboundNo}
                  onChange={(e) => setFormData({ ...formData, inboundNo: e.target.value })}
                  placeholder="入库单号"
                />
              </div>
              <div className="space-y-2">
                <Label>采购单号</Label>
                <Input
                  value={formData.purchaseNo}
                  onChange={(e) => setFormData({ ...formData, purchaseNo: e.target.value })}
                  placeholder="采购单号"
                />
              </div>
              <div className="space-y-2">
                <Label>供应商</Label>
                <Input
                  value={formData.supplierName}
                  onChange={(e) => setFormData({ ...formData, supplierName: e.target.value })}
                  placeholder="供应商名称"
                />
              </div>
              <div className="space-y-2">
                <Label>物料编码 *</Label>
                <Input
                  value={formData.materialCode}
                  onChange={(e) => setFormData({ ...formData, materialCode: e.target.value })}
                  placeholder="物料编码"
                />
              </div>
              <div className="space-y-2">
                <Label>物料名称 *</Label>
                <Input
                  value={formData.materialName}
                  onChange={(e) => setFormData({ ...formData, materialName: e.target.value })}
                  placeholder="物料名称"
                />
              </div>
              <div className="space-y-2">
                <Label>规格</Label>
                <Input
                  value={formData.spec}
                  onChange={(e) => setFormData({ ...formData, spec: e.target.value })}
                  placeholder="规格"
                />
              </div>
              <div className="space-y-2">
                <Label>数量 *</Label>
                <Input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) || 0 })}
                  placeholder="数量"
                />
              </div>
              <div className="space-y-2">
                <Label>抽检数量</Label>
                <Input
                  type="number"
                  value={formData.sampleQuantity}
                  onChange={(e) => setFormData({ ...formData, sampleQuantity: parseFloat(e.target.value) || 0 })}
                  placeholder="抽检数量"
                />
              </div>
              <div className="space-y-2">
                <Label>批次号</Label>
                <Input
                  value={formData.batchNo}
                  onChange={(e) => setFormData({ ...formData, batchNo: e.target.value })}
                  placeholder="批次号"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setShowDialog(false); resetForm(); }}>取消</Button>
              <Button onClick={handleCreateInspection}>创建检验单</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
