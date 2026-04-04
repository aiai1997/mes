'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Save, Plus } from 'lucide-react';
import {
  type SizeSpec,
  type SizeSpecDetail,
  getSizeSpecs,
  saveSizeSpec,
  initMiscData,
} from '@/types/misc';

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
const MEASURE_POINTS = ['胸围', '肩宽', '衣长', '袖长', '领围', '下摆', '袖口', '腰围', '臀围', '裤长'];

export default function SizeSpecCreatePage() {
  const router = useRouter();
  const [formData, setFormData] = useState<Omit<SizeSpec, 'id' | 'createdAt' | 'updatedAt'>>({
    name: '',
    customer: '',
    category: 'T恤',
    styleNo: '',
    productName: '',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    measurePoints: ['胸围', '肩宽', '衣长', '袖长'],
    details: [
      { measurePoint: '胸围', unit: 'cm', tolerance: '±1cm', values: {} },
      { measurePoint: '肩宽', unit: 'cm', tolerance: '±1cm', values: {} },
      { measurePoint: '衣长', unit: 'cm', tolerance: '±1cm', values: {} },
      { measurePoint: '袖长', unit: 'cm', tolerance: '±0.5cm', values: {} },
    ],
    version: 'V1.0',
    measurements: [],
    tolerance: '±1cm',
    remark: '',
    createdBy: 'admin',
  });

  const handleSave = () => {
    initMiscData();
    const specs = getSizeSpecs();
    const newSpec: SizeSpec = {
      ...formData,
      id: Date.now().toString(),
      createdAt: new Date().toLocaleString('zh-CN'),
      updatedAt: new Date().toLocaleString('zh-CN'),
    };
    saveSizeSpec(newSpec);
    router.push('/dashboard/size-spec');
  };

  const addSize = (size: string) => {
    if (formData.sizes.includes(size)) return;
    setFormData({
      ...formData,
      sizes: [...formData.sizes, size],
    });
  };

  const removeSize = (size: string) => {
    setFormData({
      ...formData,
      sizes: formData.sizes.filter(s => s !== size),
    });
  };

  const addMeasurePoint = (point: string) => {
    if (formData.measurePoints.includes(point)) return;
    const newDetail: SizeSpecDetail = {
      measurePoint: point,
      unit: 'cm',
      tolerance: '±1cm',
      values: {},
    };
    setFormData({
      ...formData,
      measurePoints: [...formData.measurePoints, point],
      details: [...formData.details, newDetail],
    });
  };

  const removeMeasurePoint = (point: string) => {
    setFormData({
      ...formData,
      measurePoints: formData.measurePoints.filter(p => p !== point),
      details: formData.details.filter(d => d.measurePoint !== point),
    });
  };

  const updateDetailValue = (measurePoint: string, size: string, value: string) => {
    const updatedDetails = formData.details.map(d => {
      if (d.measurePoint === measurePoint) {
        return {
          ...d,
          values: { ...d.values, [size]: value },
        };
      }
      return d;
    });
    setFormData({ ...formData, details: updatedDetails });
  };

  const updateDetailMeta = (measurePoint: string, field: 'unit' | 'tolerance', value: string) => {
    const updatedDetails = formData.details.map(d => {
      if (d.measurePoint === measurePoint) {
        return { ...d, [field]: value };
      }
      return d;
    });
    setFormData({ ...formData, details: updatedDetails });
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* 头部 */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard/size-spec')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">新建规格表</h1>
            <p className="text-muted-foreground">创建服装尺码规格模板</p>
          </div>
          <Button onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />保存
          </Button>
        </div>

        {/* 基本信息 */}
        <Card>
          <CardHeader>
            <CardTitle>基本信息</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>规格表名称 *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="如：男士T恤规格表"
                />
              </div>
              <div className="space-y-2">
                <Label>客户 *</Label>
                <Input
                  value={formData.customer}
                  onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
                  placeholder="客户名称"
                />
              </div>
              <div className="space-y-2">
                <Label>品类</Label>
                <Select
                  value={formData.category}
                  onValueChange={(v) => setFormData({ ...formData, category: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="T恤">T恤</SelectItem>
                    <SelectItem value="衬衫">衬衫</SelectItem>
                    <SelectItem value="夹克">夹克</SelectItem>
                    <SelectItem value="裤子">裤子</SelectItem>
                    <SelectItem value="连衣裙">连衣裙</SelectItem>
                    <SelectItem value="外套">外套</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>版本</Label>
                <Input
                  value={formData.version}
                  onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>款号</Label>
                <Input
                  value={formData.styleNo}
                  onChange={(e) => setFormData({ ...formData, styleNo: e.target.value })}
                  placeholder="选填"
                />
              </div>
              <div className="space-y-2">
                <Label>品名</Label>
                <Input
                  value={formData.productName}
                  onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                  placeholder="选填"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 尺码设置 */}
        <Card>
          <CardHeader>
            <CardTitle>尺码设置</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {formData.sizes.map(size => (
                <div key={size} className="flex items-center gap-1 bg-primary/10 text-primary px-3 py-1 rounded-full">
                  <span>{size}</span>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => removeSize(size)}
                  >
                    ×
                  </Button>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              <span className="text-sm text-muted-foreground">添加尺码：</span>
              {SIZES.filter(s => !formData.sizes.includes(s)).map(size => (
                <Button
                  key={size}
                  size="sm"
                  variant="outline"
                  onClick={() => addSize(size)}
                >
                  <Plus className="w-3 h-3 mr-1" />{size}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 测量点设置 */}
        <Card>
          <CardHeader>
            <CardTitle>测量点设置</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {formData.measurePoints.map(point => (
                <div key={point} className="flex items-center gap-1 bg-muted px-3 py-1 rounded-full">
                  <span>{point}</span>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => removeMeasurePoint(point)}
                  >
                    ×
                  </Button>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              <span className="text-sm text-muted-foreground">添加测量点：</span>
              {MEASURE_POINTS.filter(p => !formData.measurePoints.includes(p)).map(point => (
                <Button
                  key={point}
                  size="sm"
                  variant="outline"
                  onClick={() => addMeasurePoint(point)}
                >
                  <Plus className="w-3 h-3 mr-1" />{point}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 规格数据 */}
        <Card>
          <CardHeader>
            <CardTitle>规格数据</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="sticky left-0 bg-muted min-w-[120px]">测量点</TableHead>
                    <TableHead className="w-20">单位</TableHead>
                    <TableHead className="w-20">允差</TableHead>
                    {formData.sizes.map(size => (
                      <TableHead key={size} className="text-center min-w-[80px]">{size}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {formData.measurePoints.map(point => {
                    const detail = formData.details.find(d => d.measurePoint === point) || {
                      measurePoint: point,
                      unit: 'cm',
                      tolerance: '±1cm',
                      values: {},
                    };
                    return (
                      <TableRow key={point}>
                        <TableCell className="sticky left-0 bg-background font-medium">{point}</TableCell>
                        <TableCell>
                          <Select
                            value={detail.unit}
                            onValueChange={(v) => updateDetailMeta(point, 'unit', v)}
                          >
                            <SelectTrigger className="h-8 w-16">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="cm">cm</SelectItem>
                              <SelectItem value="inch">inch</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Input
                            value={detail.tolerance}
                            onChange={(e) => updateDetailMeta(point, 'tolerance', e.target.value)}
                            className="h-8 w-20"
                          />
                        </TableCell>
                        {formData.sizes.map(size => (
                          <TableCell key={size} className="text-center">
                            <Input
                              value={detail.values[size] || ''}
                              onChange={(e) => updateDetailValue(point, size, e.target.value)}
                              className="h-8 w-16 text-center"
                              placeholder="-"
                            />
                          </TableCell>
                        ))}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
