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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Package, Plus, Edit, Trash2, Download, Search, AlertTriangle, ArrowRightLeft, Settings } from 'lucide-react';

interface Material {
  id: string;
  materialCode: string;
  materialName: string;
  type: '面料' | '辅料' | '印绣' | '洗水' | '尾部' | '包装';
  spec: string;
  color: string;
  unit: string;
  unitType: '基本单位' | '多单位';
  baseUnit: string;
  subUnit?: string;
  conversionRate?: number;
  safetyStock: number;
  unitPrice: number;
  supplierId?: string;
  supplierName?: string;
  substituteIds: string[];
  status: '启用' | '停用';
  createdAt: string;
  updatedAt: string;
}

const materialTypes = ['面料', '辅料', '印绣', '洗水', '尾部', '包装'];
const units = ['米', '码', '公斤', '克', '卷', '个', '打', '包', '件', '套', '条', '张'];
const subUnitOptions = ['米', '码', '公斤', '个', '打'];

export default function MaterialPage() {
  const router = useRouter();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [searchText, setSearchText] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showDialog, setShowDialog] = useState(false);
  const [showSubstituteDialog, setShowSubstituteDialog] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [selectedSubstitutes, setSelectedSubstitutes] = useState<string[]>([]);
  const [formData, setFormData] = useState<{
    materialCode: string;
    materialName: string;
    type: Material['type'];
    spec: string;
    color: string;
    unit: string;
    unitType: '基本单位' | '多单位';
    baseUnit: string;
    subUnit: string;
    conversionRate: number;
    safetyStock: number;
    unitPrice: number;
    supplierId: string;
    supplierName: string;
    status: '启用' | '停用';
  }>({
    materialCode: '',
    materialName: '',
    type: '面料',
    spec: '',
    color: '',
    unit: '米',
    unitType: '基本单位',
    baseUnit: '米',
    subUnit: '',
    conversionRate: 1,
    safetyStock: 0,
    unitPrice: 0,
    supplierId: '',
    supplierName: '',
    status: '启用',
  });

  useEffect(() => {
    loadMaterials();
  }, []);

  const loadMaterials = () => {
    const stored = localStorage.getItem('erp_materials');
    if (stored) {
      setMaterials(JSON.parse(stored));
    } else {
      // 示例数据
      const defaultMaterials: Material[] = [
        {
          id: '1',
          materialCode: 'ML001',
          materialName: '纯棉汗布',
          type: '面料',
          spec: '180G/㎡',
          color: '白色',
          unit: '公斤',
          unitType: '多单位',
          baseUnit: '公斤',
          subUnit: '米',
          conversionRate: 2.5,
          safetyStock: 500,
          unitPrice: 35,
          supplierName: '广州面料供应商',
          substituteIds: ['2'],
          status: '启用',
          createdAt: new Date().toLocaleString('zh-CN'),
          updatedAt: new Date().toLocaleString('zh-CN'),
        },
        {
          id: '2',
          materialCode: 'ML002',
          materialName: '涤纶面料',
          type: '面料',
          spec: '150G/㎡',
          color: '黑色',
          unit: '米',
          unitType: '基本单位',
          baseUnit: '米',
          safetyStock: 300,
          unitPrice: 28,
          supplierName: '浙江面料厂',
          substituteIds: [],
          status: '启用',
          createdAt: new Date().toLocaleString('zh-CN'),
          updatedAt: new Date().toLocaleString('zh-CN'),
        },
        {
          id: '3',
          materialCode: 'FJ001',
          materialName: '缝纫线',
          type: '辅料',
          spec: '402#',
          color: '白色',
          unit: '个',
          unitType: '多单位',
          baseUnit: '个',
          subUnit: '打',
          conversionRate: 12,
          safetyStock: 200,
          unitPrice: 3.5,
          supplierName: '东莞辅料供应商',
          substituteIds: [],
          status: '启用',
          createdAt: new Date().toLocaleString('zh-CN'),
          updatedAt: new Date().toLocaleString('zh-CN'),
        },
      ];
      localStorage.setItem('erp_materials', JSON.stringify(defaultMaterials));
      setMaterials(defaultMaterials);
    }
  };

  const saveMaterials = (newMaterials: Material[]) => {
    localStorage.setItem('erp_materials', JSON.stringify(newMaterials));
    setMaterials(newMaterials);
  };

  const generateMaterialCode = () => {
    const prefix = 'ML';
    const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, '');
    const count = materials.length + 1;
    return `${prefix}${dateStr}${count.toString().padStart(3, '0')}`;
  };

  const handleOpenDialog = (material?: Material) => {
    if (material) {
      setEditingMaterial(material);
      setFormData({
        materialCode: material.materialCode,
        materialName: material.materialName,
        type: material.type,
        spec: material.spec,
        color: material.color,
        unit: material.unit,
        unitType: material.unitType,
        baseUnit: material.baseUnit,
        subUnit: material.subUnit || '',
        conversionRate: material.conversionRate || 1,
        safetyStock: material.safetyStock,
        unitPrice: material.unitPrice,
        supplierId: material.supplierId || '',
        supplierName: material.supplierName || '',
        status: material.status,
      });
    } else {
      setEditingMaterial(null);
      setFormData({
        materialCode: generateMaterialCode(),
        materialName: '',
        type: '面料',
        spec: '',
        color: '',
        unit: '米',
        unitType: '基本单位',
        baseUnit: '米',
        subUnit: '',
        conversionRate: 1,
        safetyStock: 0,
        unitPrice: 0,
        supplierId: '',
        supplierName: '',
        status: '启用',
      });
    }
    setShowDialog(true);
  };

  const handleSaveMaterial = () => {
    if (!formData.materialCode || !formData.materialName) {
      alert('请填写物料编码和名称');
      return;
    }

    const now = new Date().toLocaleString('zh-CN');
    if (editingMaterial) {
      const updated = materials.map(m => 
        m.id === editingMaterial.id 
          ? { ...m, ...formData, updatedAt: now }
          : m
      );
      saveMaterials(updated);
    } else {
      const newMaterial: Material = {
        id: Date.now().toString(),
        ...formData,
        substituteIds: [],
        createdAt: now,
        updatedAt: now,
      };
      saveMaterials([...materials, newMaterial]);
    }
    setShowDialog(false);
  };

  const handleDeleteMaterial = (id: string) => {
    if (confirm('确定要删除此物料吗？')) {
      saveMaterials(materials.filter(m => m.id !== id));
    }
  };

  const handleOpenSubstituteDialog = (material: Material) => {
    setSelectedMaterial(material);
    setSelectedSubstitutes(material.substituteIds);
    setShowSubstituteDialog(true);
  };

  const handleSaveSubstitutes = () => {
    if (!selectedMaterial) return;
    
    const updated = materials.map(m => 
      m.id === selectedMaterial.id 
        ? { ...m, substituteIds: selectedSubstitutes, updatedAt: new Date().toLocaleString('zh-CN') }
        : m
    );
    saveMaterials(updated);
    setShowSubstituteDialog(false);
  };

  const handleExport = () => {
    const headers = ['物料编码', '物料名称', '类型', '规格', '颜色', '单位', '安全库存', '单价', '供应商', '状态'];
    const rows = materials.map(m => [
      m.materialCode, m.materialName, m.type, m.spec, m.color,
      m.unit, m.safetyStock.toString(), m.unitPrice.toFixed(2), m.supplierName || '', m.status
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `物料管理_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredMaterials = materials.filter(m => {
    if (searchText && !m.materialCode.includes(searchText) && !m.materialName.includes(searchText)) return false;
    if (filterType !== 'all' && m.type !== filterType) return false;
    return true;
  });

  // 获取物料统计数据
  const getStats = () => ({
    total: materials.length,
    fabric: materials.filter(m => m.type === '面料').length,
    accessory: materials.filter(m => m.type === '辅料').length,
    warning: materials.filter(m => m.safetyStock > 0).length,
  });

  const stats = getStats();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* 页面标题 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Package className="w-6 h-6" />
              物料管理
            </h1>
            <p className="text-muted-foreground mt-1">管理面料、辅料、包装材料等物料档案</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              导出
            </Button>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="w-4 h-4 mr-2" />
              新增物料
            </Button>
          </div>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">物料总数</p>
                  <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                </div>
                <Package className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">面料</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.fabric}</p>
                </div>
                <Package className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">辅料</p>
                  <p className="text-2xl font-bold text-green-600">{stats.accessory}</p>
                </div>
                <Package className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">设置预警</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.warning}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 筛选条件 */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 flex-1 min-w-64">
                <Search className="w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="搜索物料编码/名称..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="flex-1"
                />
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部类型</SelectItem>
                  {materialTypes.map(t => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* 物料列表 */}
        <Card>
          <CardHeader>
            <CardTitle>物料列表</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>物料编码</TableHead>
                  <TableHead>物料名称</TableHead>
                  <TableHead>类型</TableHead>
                  <TableHead>规格</TableHead>
                  <TableHead>颜色</TableHead>
                  <TableHead>单位</TableHead>
                  <TableHead>安全库存</TableHead>
                  <TableHead>单价</TableHead>
                  <TableHead>替代料</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMaterials.map(material => (
                  <TableRow key={material.id}>
                    <TableCell className="font-mono">{material.materialCode}</TableCell>
                    <TableCell className="font-medium">{material.materialName}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{material.type}</Badge>
                    </TableCell>
                    <TableCell>{material.spec}</TableCell>
                    <TableCell>{material.color}</TableCell>
                    <TableCell>
                      <div>
                        {material.unit}
                        {material.unitType === '多单位' && material.subUnit && (
                          <span className="text-xs text-muted-foreground ml-1">
                            (1{material.subUnit}={material.conversionRate}{material.baseUnit})
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{material.safetyStock}</TableCell>
                    <TableCell className="text-right">¥{material.unitPrice.toFixed(2)}</TableCell>
                    <TableCell>
                      {material.substituteIds.length > 0 && (
                        <Badge variant="secondary">{material.substituteIds.length}个</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={material.status === '启用' ? 'default' : 'secondary'}>
                        {material.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline" onClick={() => handleOpenDialog(material)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleOpenSubstituteDialog(material)} title="设置替代料">
                          <ArrowRightLeft className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleDeleteMaterial(material.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* 新增/编辑物料对话框 */}
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingMaterial ? '编辑物料' : '新增物料'}</DialogTitle>
              <DialogDescription>配置物料基本信息</DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-3 gap-4 py-4">
              <div className="space-y-2">
                <Label>物料编码 *</Label>
                <Input
                  value={formData.materialCode}
                  onChange={(e) => setFormData({ ...formData, materialCode: e.target.value })}
                  placeholder="自动生成"
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
                <Label>类型</Label>
                <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v as Material['type'] })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {materialTypes.map(t => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>规格</Label>
                <Input
                  value={formData.spec}
                  onChange={(e) => setFormData({ ...formData, spec: e.target.value })}
                  placeholder="如：180G/㎡"
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
                <Label>单位类型</Label>
                <Select value={formData.unitType} onValueChange={(v) => setFormData({ ...formData, unitType: v as '基本单位' | '多单位' })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="基本单位">基本单位</SelectItem>
                    <SelectItem value="多单位">多单位</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>基本单位</Label>
                <Select value={formData.baseUnit} onValueChange={(v) => setFormData({ ...formData, baseUnit: v, unit: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {units.map(u => (
                      <SelectItem key={u} value={u}>{u}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {formData.unitType === '多单位' && (
                <>
                  <div className="space-y-2">
                    <Label>辅助单位</Label>
                    <Select value={formData.subUnit} onValueChange={(v) => setFormData({ ...formData, subUnit: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="选择辅助单位" />
                      </SelectTrigger>
                      <SelectContent>
                        {subUnitOptions.map(u => (
                          <SelectItem key={u} value={u}>{u}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>换算率</Label>
                    <Input
                      type="number"
                      value={formData.conversionRate}
                      onChange={(e) => setFormData({ ...formData, conversionRate: parseFloat(e.target.value) || 1 })}
                      placeholder="1辅助单位=?基本单位"
                    />
                  </div>
                </>
              )}
              <div className="space-y-2">
                <Label>安全库存</Label>
                <Input
                  type="number"
                  value={formData.safetyStock}
                  onChange={(e) => setFormData({ ...formData, safetyStock: parseFloat(e.target.value) || 0 })}
                  placeholder="最低库存预警"
                />
              </div>
              <div className="space-y-2">
                <Label>单价</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.unitPrice}
                  onChange={(e) => setFormData({ ...formData, unitPrice: parseFloat(e.target.value) || 0 })}
                  placeholder="单价"
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
                <Label>状态</Label>
                <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v as '启用' | '停用' })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="启用">启用</SelectItem>
                    <SelectItem value="停用">停用</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDialog(false)}>取消</Button>
              <Button onClick={handleSaveMaterial}>保存</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* 替代料设置对话框 */}
        <Dialog open={showSubstituteDialog} onOpenChange={setShowSubstituteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>设置替代料</DialogTitle>
              <DialogDescription>
                为 {selectedMaterial?.materialName} 设置可替代的物料
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>选择替代物料</Label>
                <div className="flex flex-wrap gap-2">
                  {materials
                    .filter(m => m.id !== selectedMaterial?.id)
                    .map(m => (
                      <Badge
                        key={m.id}
                        variant={selectedSubstitutes.includes(m.id) ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => {
                          if (selectedSubstitutes.includes(m.id)) {
                            setSelectedSubstitutes(selectedSubstitutes.filter(id => id !== m.id));
                          } else {
                            setSelectedSubstitutes([...selectedSubstitutes, m.id]);
                          }
                        }}
                      >
                        {m.materialName} ({m.materialCode})
                      </Badge>
                    ))}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowSubstituteDialog(false)}>取消</Button>
              <Button onClick={handleSaveSubstitutes}>保存</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
