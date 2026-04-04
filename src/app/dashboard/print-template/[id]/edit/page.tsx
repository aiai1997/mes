'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Save, Printer } from 'lucide-react';
import { type PrintTemplate, type PrintTemplateType, getPrintTemplates } from '@/types/system';

export default function PrintTemplateEditPage() {
  const router = useRouter();
  const params = useParams();
  const templateId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    templateCode: '',
    templateName: '',
    templateType: '扎号标签' as PrintTemplateType,
    paperWidth: 50,
    paperHeight: 30,
    barcodeType: 'Code128',
    hasLogo: false,
    isActive: true,
  });

  useEffect(() => {
    loadTemplate();
  }, [templateId]);

  const loadTemplate = () => {
    const templates = getPrintTemplates();
    const template = templates.find((t: PrintTemplate) => t.id === templateId);
    if (template) {
      setFormData({
        templateCode: template.templateCode,
        templateName: template.templateName,
        templateType: template.templateType,
        paperWidth: template.paperWidth,
        paperHeight: template.paperHeight,
        barcodeType: template.barcodeType,
        hasLogo: template.hasLogo,
        isActive: template.isActive,
      });
    } else {
      alert('模板不存在');
      router.push('/dashboard/print-template');
    }
    setLoading(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.templateCode || !formData.templateName) {
      alert('请填写必填项');
      return;
    }

    const templates = getPrintTemplates();
    const updated = templates.map((t: PrintTemplate) => 
      t.id === templateId 
        ? { 
            ...t, 
            ...formData,
          }
        : t
    );
    localStorage.setItem('erp_print_templates', JSON.stringify(updated));
    alert('保存成功');
    router.push('/dashboard/print-template');
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">加载中...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Printer className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">编辑打印模板</h1>
              <p className="text-muted-foreground text-sm">修改打印模板配置</p>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>基本信息</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="templateCode">模板编号 *</Label>
                  <Input
                    id="templateCode"
                    value={formData.templateCode}
                    onChange={(e) => setFormData({ ...formData, templateCode: e.target.value })}
                    placeholder="TPL001"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="templateName">模板名称 *</Label>
                  <Input
                    id="templateName"
                    value={formData.templateName}
                    onChange={(e) => setFormData({ ...formData, templateName: e.target.value })}
                    placeholder="模板名称"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="templateType">模板类型</Label>
                  <Select 
                    value={formData.templateType} 
                    onValueChange={(v) => setFormData({ ...formData, templateType: v as PrintTemplateType })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="选择类型" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="扎号标签">扎号标签</SelectItem>
                      <SelectItem value="装箱单">装箱单</SelectItem>
                      <SelectItem value="送货单">送货单</SelectItem>
                      <SelectItem value="外协单">外协单</SelectItem>
                      <SelectItem value="生产流程卡">生产流程卡</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="barcodeType">条码类型</Label>
                  <Select 
                    value={formData.barcodeType} 
                    onValueChange={(v) => setFormData({ ...formData, barcodeType: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="选择条码类型" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Code128">Code128</SelectItem>
                      <SelectItem value="Code39">Code39</SelectItem>
                      <SelectItem value="QRCode">QRCode</SelectItem>
                      <SelectItem value="EAN13">EAN13</SelectItem>
                      <SelectItem value="无">无条码</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>纸张设置</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="paperWidth">纸张宽度 (mm)</Label>
                <Input
                  id="paperWidth"
                  type="number"
                  value={formData.paperWidth}
                  onChange={(e) => setFormData({ ...formData, paperWidth: parseInt(e.target.value) || 0 })}
                  placeholder="宽度"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="paperHeight">纸张高度 (mm)</Label>
                <Input
                  id="paperHeight"
                  type="number"
                  value={formData.paperHeight}
                  onChange={(e) => setFormData({ ...formData, paperHeight: parseInt(e.target.value) || 0 })}
                  placeholder="高度"
                />
              </div>
            </div>
            
            {/* 常用纸张规格快捷选择 */}
            <div className="mt-4">
              <Label className="text-sm text-muted-foreground">常用规格</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setFormData({ ...formData, paperWidth: 50, paperHeight: 30 })}>
                  50×30mm
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() => setFormData({ ...formData, paperWidth: 70, paperHeight: 50 })}>
                  70×50mm
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() => setFormData({ ...formData, paperWidth: 100, paperHeight: 70 })}>
                  100×70mm
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() => setFormData({ ...formData, paperWidth: 210, paperHeight: 140 })}>
                  A5 (210×140mm)
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() => setFormData({ ...formData, paperWidth: 210, paperHeight: 297 })}>
                  A4 (210×297mm)
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>其他设置</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>包含LOGO</Label>
                  <p className="text-sm text-muted-foreground">打印时是否显示公司LOGO</p>
                </div>
                <Switch
                  checked={formData.hasLogo}
                  onCheckedChange={(checked) => setFormData({ ...formData, hasLogo: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>启用状态</Label>
                  <p className="text-sm text-muted-foreground">是否启用此模板</p>
                </div>
                <Switch
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 模板预览 */}
        <Card>
          <CardHeader>
            <CardTitle>模板预览</CardTitle>
          </CardHeader>
          <CardContent>
            <div 
              className="border-2 border-dashed border-muted-foreground/30 bg-muted/30 mx-auto flex items-center justify-center"
              style={{ 
                width: Math.min(formData.paperWidth * 2, 400), 
                height: Math.min(formData.paperHeight * 2, 300),
                minWidth: 150,
                minHeight: 100,
              }}
            >
              <div className="text-center">
                <p className="text-sm font-medium">{formData.templateName || '模板预览'}</p>
                <p className="text-xs text-muted-foreground mt-1">{formData.paperWidth}×{formData.paperHeight}mm</p>
                {formData.hasLogo && <p className="text-xs text-muted-foreground">[LOGO]</p>}
                {formData.barcodeType !== '无' && <p className="text-xs text-muted-foreground">[{formData.barcodeType}]</p>}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-2">
          <Button onClick={handleSubmit} className="gap-2">
            <Save className="w-4 h-4" />
            保存
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            取消
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
