'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Printer,
  Plus,
  Eye,
  Edit,
  Copy,
  FileText,
  QrCode,
  Image,
} from 'lucide-react';
import {
  type PrintTemplate,
  type PrintTemplateType,
  getPrintTemplates,
  initPrintTemplateData,
} from '@/types/system';

export default function PrintTemplatePage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<PrintTemplate[]>([]);
  const [activeTab, setActiveTab] = useState<PrintTemplateType>('扎号标签');
  
  useEffect(() => {
    initPrintTemplateData();
    loadData();
  }, []);
  
  const loadData = () => {
    setTemplates(getPrintTemplates());
  };
  
  const handlePreview = (template: PrintTemplate) => {
    // 预览模板功能 - 可以打开一个模态框或新页面
    alert(`预览模板: ${template.templateName}`);
  };
  
  const handleCopyTemplate = (template: PrintTemplate) => {
    // 复制模板功能
    alert(`复制模板: ${template.templateName}`);
  };
  
  const filteredTemplates = templates.filter(t => t.templateType === activeTab);
  
  const typeNames: Record<PrintTemplateType, string> = {
    '扎号标签': '扎号标签',
    '装箱单': '装箱单',
    '送货单': '送货单',
    '外协单': '外协单',
    '生产流程卡': '生产流程卡',
  };

  return (
    <DashboardLayout>
      <div className="max-w-full mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <Printer className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">打印模板管理</h1>
              <p className="text-muted-foreground text-sm">自定义纸张、条码、LOGO、字体、位置</p>
            </div>
          </div>
          <Button className="gap-2" onClick={() => router.push('/dashboard/print-template/create')}>
            <Plus className="w-4 h-4" />新增模板
          </Button>
        </div>
        
        {/* 模板类型统计 */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {(['扎号标签', '装箱单', '送货单', '外协单', '生产流程卡'] as PrintTemplateType[]).map(type => (
            <Card 
              key={type} 
              className={`cursor-pointer transition-all ${activeTab === type ? 'border-primary shadow-md' : 'hover:border-muted-foreground/50'}`}
              onClick={() => setActiveTab(type)}
            >
              <CardContent className="p-4 text-center">
                <p className="text-sm text-muted-foreground">{typeNames[type]}</p>
                <p className="text-2xl font-bold text-foreground mt-1">
                  {templates.filter(t => t.templateType === type).length}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* 模板列表 */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>模板编号</TableHead>
                    <TableHead>模板名称</TableHead>
                    <TableHead>纸张规格</TableHead>
                    <TableHead>条码类型</TableHead>
                    <TableHead>包含LOGO</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>创建时间</TableHead>
                    <TableHead className="w-32">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTemplates.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                        暂无模板
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTemplates.map((template) => (
                      <TableRow key={template.id}>
                        <TableCell className="font-medium">{template.templateCode}</TableCell>
                        <TableCell>{template.templateName}</TableCell>
                        <TableCell>
                          <span className="text-sm">{template.paperWidth}×{template.paperHeight}mm</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <QrCode className="w-4 h-4 text-muted-foreground" />
                            {template.barcodeType}
                          </div>
                        </TableCell>
                        <TableCell>
                          {template.hasLogo ? (
                            <Badge className="bg-green-100 text-green-700">
                              <Image className="w-3 h-3 mr-1" />有
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground text-sm">无</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge className={template.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                            {template.isActive ? '启用' : '停用'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">{template.createdAt}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button size="sm" variant="ghost" onClick={() => handlePreview(template)} title="预览"><Eye className="w-4 h-4" /></Button>
                            <Button size="sm" variant="ghost" onClick={() => router.push(`/dashboard/print-template/${template.id}/edit`)} title="编辑"><Edit className="w-4 h-4" /></Button>
                            <Button size="sm" variant="ghost" onClick={() => handleCopyTemplate(template)} title="复制"><Copy className="w-4 h-4" /></Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
        
        {/* 模板预览示例 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              模板预览示例
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-6">
              {/* 扎号标签示例 */}
              <div className="border-2 border-dashed border-muted-foreground/30 p-4 w-48 text-center bg-muted/30">
                <p className="text-xs text-muted-foreground mb-2">扎号标签示例</p>
                <div className="border border-foreground/20 bg-background p-3">
                  <p className="text-sm font-bold">订单号: ORD-2024-001</p>
                  <p className="text-xs mt-1">款号: T-SHIRT-001</p>
                  <p className="text-xs">颜色: 白色 | 尺码: M</p>
                  <p className="text-xs">扎号: ZH-001 | 件数: 50</p>
                  <div className="mt-2 flex justify-center">
                    <div className="w-20 h-10 bg-muted flex items-center justify-center text-xs text-muted-foreground">
                      [条码]
                    </div>
                  </div>
                </div>
              </div>
              
              {/* 装箱单示例 */}
              <div className="border-2 border-dashed border-muted-foreground/30 p-4 w-64 text-center bg-muted/30">
                <p className="text-xs text-muted-foreground mb-2">装箱单示例</p>
                <div className="border border-foreground/20 bg-background p-3">
                  <p className="text-sm font-bold mb-2">装箱单</p>
                  <p className="text-xs text-left">订单号: ORD-2024-001</p>
                  <p className="text-xs text-left">款号: T-SHIRT-001</p>
                  <p className="text-xs text-left">箱号: BOX-001</p>
                  <div className="mt-2 text-xs text-left">
                    <p>S码: 20件</p>
                    <p>M码: 30件</p>
                    <p>L码: 20件</p>
                  </div>
                  <p className="text-xs text-right mt-2 font-bold">合计: 70件</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
