'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Save, Plus, Trash2 } from 'lucide-react';
import {
  type QCType,
  type QCResult,
  type DefectType,
  type DefectItem,
  type QCRecord,
  generateQCNo,
  saveQCRecord,
  initQualityData,
  getDefectLibrary,
} from '@/types/quality';
import { getOrders, type Order } from '@/types/order';

const qcTypeLabels: Record<QCType, string> = {
  'IQC': '来料检验',
  'IPQC': '制程检验',
  'FQC': '尾部终检',
  'OQC': '出货检验',
};

const defectTypeLabels: DefectType[] = ['线头', '脏污', '破洞', '色差', '尺寸偏差', '跳线', '断线', '油污', '其他'];

export default function QualityCreatePage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [defectLib, setDefectLib] = useState<{ code: string; name: string }[]>([]);
  
  const [formData, setFormData] = useState({
    qcType: 'FQC' as QCType,
    orderId: '',
    orderNo: '',
    styleNo: '',
    bundleNo: '',
    inspectQuantity: 0,
    passQuantity: 0,
    failQuantity: 0,
    inspector: '',
    remark: '',
  });

  const [defects, setDefects] = useState<DefectItem[]>([]);

  useEffect(() => {
    initQualityData();
    loadData();
  }, []);

  const loadData = () => {
    setOrders(getOrders());
    setDefectLib(getDefectLibrary().map(d => ({ code: d.defectCode, name: d.defectName })));
  };

  const handleOrderChange = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (order) {
      setFormData({
        ...formData,
        orderId,
        orderNo: order.orderNo,
        styleNo: order.styleNo,
      });
    }
  };

  const handleInspectQuantityChange = (value: number) => {
    const inspectQty = value;
    const failQty = defects.reduce((sum, d) => sum + d.quantity, 0);
    const passQty = Math.max(0, inspectQty - failQty);
    setFormData({
      ...formData,
      inspectQuantity: inspectQty,
      passQuantity: passQty,
      failQuantity: failQty,
    });
  };

  const addDefect = () => {
    setDefects([
      ...defects,
      {
        id: `DF${Date.now()}`,
        defectType: '线头',
        quantity: 1,
        position: '',
        description: '',
      },
    ]);
  };

  const removeDefect = (id: string) => {
    const newDefects = defects.filter(d => d.id !== id);
    setDefects(newDefects);
    // 重新计算合格数
    const failQty = newDefects.reduce((sum, d) => sum + d.quantity, 0);
    setFormData({
      ...formData,
      failQuantity: failQty,
      passQuantity: Math.max(0, formData.inspectQuantity - failQty),
    });
  };

  const updateDefect = (id: string, field: keyof DefectItem, value: string | number) => {
    const newDefects = defects.map(d => {
      if (d.id === id) {
        return { ...d, [field]: value };
      }
      return d;
    });
    setDefects(newDefects);
    
    // 如果更新了数量，重新计算合格数
    if (field === 'quantity') {
      const failQty = newDefects.reduce((sum, d) => sum + d.quantity, 0);
      setFormData({
        ...formData,
        failQuantity: failQty,
        passQuantity: Math.max(0, formData.inspectQuantity - failQty),
      });
    }
  };

  const calculatePassRate = () => {
    if (formData.inspectQuantity === 0) return '0.0';
    return ((formData.passQuantity / formData.inspectQuantity) * 100).toFixed(1);
  };

  const getResult = (): QCResult => {
    const passRate = parseFloat(calculatePassRate());
    if (passRate >= 90) return '合格';
    if (passRate >= 70) return '待检';
    return '不合格';
  };

  const handleSubmit = () => {
    if (!formData.orderId || formData.inspectQuantity === 0) {
      alert('请填写必填项：订单、检验数量');
      return;
    }

    const record: QCRecord = {
      id: `QC${Date.now()}`,
      qcNo: generateQCNo(formData.qcType),
      qcType: formData.qcType,
      orderId: formData.orderId,
      orderNo: formData.orderNo,
      styleNo: formData.styleNo,
      bundleNo: formData.bundleNo,
      inspectQuantity: formData.inspectQuantity,
      passQuantity: formData.passQuantity,
      failQuantity: formData.failQuantity,
      defectRate: formData.inspectQuantity > 0 ? (formData.failQuantity / formData.inspectQuantity) * 100 : 0,
      passRate: parseFloat(calculatePassRate()),
      defects: defects,
      result: getResult(),
      inspector: formData.inspector || '系统',
      inspectTime: new Date().toLocaleString('zh-CN'),
      remark: formData.remark,
      createdAt: new Date().toLocaleString('zh-CN'),
    };

    saveQCRecord(record);
    router.push('/dashboard/quality');
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* 头部 */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard/quality')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">新增检验</h1>
            <p className="text-muted-foreground">创建IQC/IPQC/FQC/OQC检验单</p>
          </div>
        </div>

        {/* 基本信息 */}
        <Card>
          <CardHeader>
            <CardTitle>基本信息</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>检验类型 *</Label>
                <Select value={formData.qcType} onValueChange={(v) => setFormData({ ...formData, qcType: v as QCType })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="IQC">IQC - 来料检验</SelectItem>
                    <SelectItem value="IPQC">IPQC - 制程检验</SelectItem>
                    <SelectItem value="FQC">FQC - 尾部终检</SelectItem>
                    <SelectItem value="OQC">OQC - 出货检验</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>订单 *</Label>
                <Select value={formData.orderId} onValueChange={handleOrderChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="请选择订单" />
                  </SelectTrigger>
                  <SelectContent>
                    {orders.map(o => (
                      <SelectItem key={o.id} value={o.id}>{o.orderNo} - {o.styleNo}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>款号</Label>
                <Input value={formData.styleNo} readOnly placeholder="自动带出" />
              </div>

              <div className="space-y-2">
                <Label>扎号/批次号</Label>
                <Input
                  value={formData.bundleNo}
                  onChange={(e) => setFormData({ ...formData, bundleNo: e.target.value })}
                  placeholder="选填"
                />
              </div>

              <div className="space-y-2">
                <Label>检验数量 *</Label>
                <Input
                  type="number"
                  value={formData.inspectQuantity || ''}
                  onChange={(e) => handleInspectQuantityChange(Number(e.target.value))}
                  placeholder="请输入"
                />
              </div>

              <div className="space-y-2">
                <Label>检验人</Label>
                <Input
                  value={formData.inspector}
                  onChange={(e) => setFormData({ ...formData, inspector: e.target.value })}
                  placeholder="请输入"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 不良明细 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>不良明细</CardTitle>
            <Button size="sm" variant="outline" onClick={addDefect}>
              <Plus className="w-4 h-4 mr-1" />添加不良项
            </Button>
          </CardHeader>
          <CardContent>
            {defects.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                暂无不良项，点击"添加不良项"添加
              </div>
            ) : (
              <div className="space-y-4">
                {defects.map((defect, index) => (
                  <div key={defect.id} className="flex items-end gap-4 p-4 bg-muted rounded-lg">
                    <div className="flex-1 grid grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <Label>不良类型</Label>
                        <Select
                          value={defect.defectType}
                          onValueChange={(v) => updateDefect(defect.id, 'defectType', v)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {defectTypeLabels.map(t => (
                              <SelectItem key={t} value={t}>{t}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>数量</Label>
                        <Input
                          type="number"
                          value={defect.quantity || ''}
                          onChange={(e) => updateDefect(defect.id, 'quantity', Number(e.target.value))}
                          min={0}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>位置</Label>
                        <Input
                          value={defect.position}
                          onChange={(e) => updateDefect(defect.id, 'position', e.target.value)}
                          placeholder="如：袖口、前胸"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>描述</Label>
                        <Input
                          value={defect.description}
                          onChange={(e) => updateDefect(defect.id, 'description', e.target.value)}
                          placeholder="不良描述"
                        />
                      </div>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-destructive"
                      onClick={() => removeDefect(defect.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 检验结果 */}
        <Card>
          <CardHeader>
            <CardTitle>检验结果</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-muted rounded-lg text-center">
                <p className="text-sm text-muted-foreground">检验数量</p>
                <p className="text-2xl font-bold">{formData.inspectQuantity}</p>
              </div>
              <div className="p-4 bg-green-100 dark:bg-green-900 rounded-lg text-center">
                <p className="text-sm text-muted-foreground">合格数</p>
                <p className="text-2xl font-bold text-green-600">{formData.passQuantity}</p>
              </div>
              <div className="p-4 bg-red-100 dark:bg-red-900 rounded-lg text-center">
                <p className="text-sm text-muted-foreground">不良数</p>
                <p className="text-2xl font-bold text-red-600">{formData.failQuantity}</p>
              </div>
              <div className="p-4 bg-blue-100 dark:bg-blue-900 rounded-lg text-center">
                <p className="text-sm text-muted-foreground">良品率</p>
                <p className="text-2xl font-bold text-blue-600">{calculatePassRate()}%</p>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <span className="text-muted-foreground">检验结果：</span>
              <Badge
                className={
                  getResult() === '合格' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
                  getResult() === '待检' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' :
                  'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                }
              >
                {getResult()}
              </Badge>
              <span className="text-sm text-muted-foreground">
                （良品率≥90%合格，70%-90%待检，&lt;70%不合格）
              </span>
            </div>
          </CardContent>
        </Card>

        {/* 备注 */}
        <Card>
          <CardHeader>
            <CardTitle>备注</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={formData.remark}
              onChange={(e) => setFormData({ ...formData, remark: e.target.value })}
              placeholder="请输入备注信息"
              rows={3}
            />
          </CardContent>
        </Card>

        {/* 操作按钮 */}
        <div className="flex justify-end gap-4">
          <Button variant="outline" onClick={() => router.push('/dashboard/quality')}>
            取消
          </Button>
          <Button onClick={handleSubmit}>
            <Save className="w-4 h-4 mr-2" />
            保存
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
