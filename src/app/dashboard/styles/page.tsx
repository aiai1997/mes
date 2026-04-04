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
import { Shirt, Plus, Edit, Trash2, Download, Search, Ruler, FileText } from 'lucide-react';

interface Style {
  id: string;
  styleNo: string;
  name: string;
  category: string;
  brand: string;
  season: string;
  year: string;
  sizeGroup: string;
  colorGroup: string;
  status: '启用' | '停用';
  sizeChart?: SizeChartRow[];
  colors?: string[];
  createdAt: string;
  updatedAt: string;
}

interface SizeChartRow {
  size: string;
  chest: string;
  length: string;
  shoulder: string;
  sleeve: string;
  waist: string;
  hip: string;
  cuff: string;
  hem: string;
  tolerance: string;
}

const sizeGroups = [
  { name: 'S-XL', sizes: ['S', 'M', 'L', 'XL'] },
  { name: 'XS-3XL', sizes: ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'] },
  { name: '儿童码', sizes: ['100', '110', '120', '130', '140', '150', '160'] },
  { name: '裤装码', sizes: ['26', '27', '28', '29', '30', '31', '32', '34', '36'] },
];

const colorGroups = [
  { name: '基础色', colors: ['黑色', '白色', '灰色', '藏青'] },
  { name: '时尚色', colors: ['红色', '蓝色', '绿色', '黄色', '粉色', '紫色'] },
  { name: '自定义', colors: [] },
];

export default function StylePage() {
  const router = useRouter();
  const [styles, setStyles] = useState<Style[]>([]);
  const [searchText, setSearchText] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showDialog, setShowDialog] = useState(false);
  const [showSizeChartDialog, setShowSizeChartDialog] = useState(false);
  const [editingStyle, setEditingStyle] = useState<Style | null>(null);
  const [formData, setFormData] = useState<{
    styleNo: string;
    name: string;
    category: string;
    brand: string;
    season: string;
    year: string;
    sizeGroup: string;
    colorGroup: string;
    status: '启用' | '停用';
  }>({
    styleNo: '',
    name: '',
    category: '',
    brand: '',
    season: '',
    year: new Date().getFullYear().toString(),
    sizeGroup: 'S-XL',
    colorGroup: '基础色',
    status: '启用',
  });
  const [sizeChart, setSizeChart] = useState<SizeChartRow[]>([]);
  const [customColors, setCustomColors] = useState<string[]>([]);

  useEffect(() => {
    loadStyles();
  }, []);

  const loadStyles = () => {
    const stored = localStorage.getItem('erp_styles');
    if (stored) {
      setStyles(JSON.parse(stored));
    } else {
      // 示例数据
      const defaultStyles: Style[] = [
        {
          id: '1',
          styleNo: 'ST001',
          name: '男士圆领T恤',
          category: 'T恤',
          brand: '自有品牌',
          season: '春夏',
          year: '2026',
          sizeGroup: 'S-XL',
          colorGroup: '基础色',
          status: '启用',
          colors: ['黑色', '白色', '灰色'],
          sizeChart: [
            { size: 'S', chest: '96', length: '66', shoulder: '42', sleeve: '20', waist: '-', hip: '-', cuff: '-', hem: '48', tolerance: '±1' },
            { size: 'M', chest: '100', length: '68', shoulder: '44', sleeve: '21', waist: '-', hip: '-', cuff: '-', hem: '50', tolerance: '±1' },
            { size: 'L', chest: '104', length: '70', shoulder: '46', sleeve: '22', waist: '-', hip: '-', cuff: '-', hem: '52', tolerance: '±1' },
            { size: 'XL', chest: '108', length: '72', shoulder: '48', sleeve: '23', waist: '-', hip: '-', cuff: '-', hem: '54', tolerance: '±1' },
          ],
          createdAt: new Date().toLocaleString('zh-CN'),
          updatedAt: new Date().toLocaleString('zh-CN'),
        },
      ];
      localStorage.setItem('erp_styles', JSON.stringify(defaultStyles));
      setStyles(defaultStyles);
    }
  };

  const saveStyles = (newStyles: Style[]) => {
    localStorage.setItem('erp_styles', JSON.stringify(newStyles));
    setStyles(newStyles);
  };

  const generateStyleNo = () => {
    const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, '');
    const count = styles.length + 1;
    return `ST${dateStr}${count.toString().padStart(3, '0')}`;
  };

  const handleOpenDialog = (style?: Style) => {
    if (style) {
      setEditingStyle(style);
      setFormData({
        styleNo: style.styleNo,
        name: style.name,
        category: style.category,
        brand: style.brand,
        season: style.season,
        year: style.year,
        sizeGroup: style.sizeGroup,
        colorGroup: style.colorGroup,
        status: style.status,
      });
      setSizeChart(style.sizeChart || []);
      setCustomColors(style.colors || []);
    } else {
      setEditingStyle(null);
      setFormData({
        styleNo: generateStyleNo(),
        name: '',
        category: '',
        brand: '',
        season: '',
        year: new Date().getFullYear().toString(),
        sizeGroup: 'S-XL',
        colorGroup: '基础色',
        status: '启用',
      });
      const sizeGroup = sizeGroups.find(g => g.name === 'S-XL');
      setSizeChart(sizeGroup?.sizes.map(s => ({
        size: s, chest: '', length: '', shoulder: '', sleeve: '', waist: '-', hip: '-', cuff: '-', hem: '', tolerance: '±1'
      })) || []);
      setCustomColors([]);
    }
    setShowDialog(true);
  };

  const handleSaveStyle = () => {
    if (!formData.styleNo || !formData.name) {
      alert('请填写款号和名称');
      return;
    }

    const now = new Date().toLocaleString('zh-CN');
    if (editingStyle) {
      const updated = styles.map(s => 
        s.id === editingStyle.id 
          ? { ...s, ...formData, sizeChart, colors: customColors, updatedAt: now }
          : s
      );
      saveStyles(updated);
    } else {
      const newStyle: Style = {
        id: Date.now().toString(),
        ...formData,
        sizeChart,
        colors: customColors,
        createdAt: now,
        updatedAt: now,
      };
      saveStyles([...styles, newStyle]);
    }
    setShowDialog(false);
  };

  const handleDeleteStyle = (id: string) => {
    if (confirm('确定要删除此款号吗？')) {
      saveStyles(styles.filter(s => s.id !== id));
    }
  };

  const handleSizeGroupChange = (groupName: string) => {
    setFormData({ ...formData, sizeGroup: groupName });
    const sizeGroup = sizeGroups.find(g => g.name === groupName);
    if (sizeGroup) {
      setSizeChart(sizeGroup.sizes.map(s => ({
        size: s, chest: '', length: '', shoulder: '', sleeve: '', waist: '-', hip: '-', cuff: '-', hem: '', tolerance: '±1'
      })));
    }
  };

  const handleSizeChartChange = (index: number, field: keyof SizeChartRow, value: string) => {
    const updated = [...sizeChart];
    updated[index] = { ...updated[index], [field]: value };
    setSizeChart(updated);
  };

  const handleExport = () => {
    const headers = ['款号', '名称', '品类', '品牌', '季节', '年份', '尺码组', '颜色组', '状态', '创建时间'];
    const rows = styles.map(s => [
      s.styleNo, s.name, s.category, s.brand, s.season, s.year,
      s.sizeGroup, s.colorGroup, s.status, s.createdAt
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `款号管理_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportSizeChart = (style: Style) => {
    if (!style.sizeChart || style.sizeChart.length === 0) {
      alert('该款号暂无尺寸表数据');
      return;
    }

    const headers = ['尺码', '胸围', '衣长', '肩宽', '袖长', '腰围', '臀围', '袖口', '下摆', '公差'];
    const rows = style.sizeChart.map(row => [
      row.size, row.chest, row.length, row.shoulder, row.sleeve,
      row.waist, row.hip, row.cuff, row.hem, row.tolerance
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `尺寸表_${style.styleNo}_${style.name}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredStyles = styles.filter(s => {
    if (searchText && !s.styleNo.includes(searchText) && !s.name.includes(searchText)) return false;
    if (filterCategory !== 'all' && s.category !== filterCategory) return false;
    return true;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* 页面标题 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Shirt className="w-6 h-6" />
              款号管理
            </h1>
            <p className="text-muted-foreground mt-1">管理产品款号和尺寸规格表</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              导出
            </Button>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="w-4 h-4 mr-2" />
              新增款号
            </Button>
          </div>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">款号总数</p>
                  <p className="text-2xl font-bold text-foreground">{styles.length}</p>
                </div>
                <Shirt className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">启用款号</p>
                  <p className="text-2xl font-bold text-green-600">{styles.filter(s => s.status === '启用').length}</p>
                </div>
                <Shirt className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">品类数量</p>
                  <p className="text-2xl font-bold text-blue-600">{new Set(styles.map(s => s.category)).size}</p>
                </div>
                <FileText className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">本年新增</p>
                  <p className="text-2xl font-bold text-orange-600">{styles.filter(s => s.year === new Date().getFullYear().toString()).length}</p>
                </div>
                <Ruler className="w-8 h-8 text-orange-500" />
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
                  placeholder="搜索款号/名称..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="flex-1"
                />
              </div>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="品类" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部品类</SelectItem>
                  <SelectItem value="T恤">T恤</SelectItem>
                  <SelectItem value="衬衫">衬衫</SelectItem>
                  <SelectItem value="裤子">裤子</SelectItem>
                  <SelectItem value="外套">外套</SelectItem>
                  <SelectItem value="连衣裙">连衣裙</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* 款号列表 */}
        <Card>
          <CardHeader>
            <CardTitle>款号列表</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>款号</TableHead>
                  <TableHead>名称</TableHead>
                  <TableHead>品类</TableHead>
                  <TableHead>品牌</TableHead>
                  <TableHead>季节/年份</TableHead>
                  <TableHead>尺码组</TableHead>
                  <TableHead>颜色</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStyles.map(style => (
                  <TableRow key={style.id}>
                    <TableCell className="font-mono font-medium">{style.styleNo}</TableCell>
                    <TableCell>{style.name}</TableCell>
                    <TableCell>{style.category}</TableCell>
                    <TableCell>{style.brand}</TableCell>
                    <TableCell>{style.season} / {style.year}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{style.sizeGroup}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {(style.colors || []).slice(0, 3).map(c => (
                          <Badge key={c} variant="secondary" className="text-xs">{c}</Badge>
                        ))}
                        {(style.colors || []).length > 3 && (
                          <Badge variant="secondary" className="text-xs">+{(style.colors || []).length - 3}</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={style.status === '启用' ? 'default' : 'secondary'}>
                        {style.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline" onClick={() => handleOpenDialog(style)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleExportSizeChart(style)} title="导出尺寸表">
                          <Ruler className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleDeleteStyle(style.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredStyles.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                      暂无款号数据
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* 新增/编辑款号对话框 */}
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingStyle ? '编辑款号' : '新增款号'}</DialogTitle>
              <DialogDescription>配置款号基本信息和尺寸规格表</DialogDescription>
            </DialogHeader>
            
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="basic">基本信息</TabsTrigger>
                <TabsTrigger value="size">尺寸规格表</TabsTrigger>
              </TabsList>
              
              <TabsContent value="basic" className="space-y-4 py-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>款号 *</Label>
                    <Input
                      value={formData.styleNo}
                      onChange={(e) => setFormData({ ...formData, styleNo: e.target.value })}
                      placeholder="自动生成"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>名称 *</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="产品名称"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>品类</Label>
                    <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="选择品类" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="T恤">T恤</SelectItem>
                        <SelectItem value="衬衫">衬衫</SelectItem>
                        <SelectItem value="裤子">裤子</SelectItem>
                        <SelectItem value="外套">外套</SelectItem>
                        <SelectItem value="连衣裙">连衣裙</SelectItem>
                        <SelectItem value="卫衣">卫衣</SelectItem>
                        <SelectItem value="毛衣">毛衣</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>品牌</Label>
                    <Input
                      value={formData.brand}
                      onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                      placeholder="品牌名称"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>季节</Label>
                    <Select value={formData.season} onValueChange={(v) => setFormData({ ...formData, season: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="选择季节" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="春夏">春夏</SelectItem>
                        <SelectItem value="秋冬">秋冬</SelectItem>
                        <SelectItem value="四季">四季</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>年份</Label>
                    <Input
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                      placeholder="年份"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>尺码组</Label>
                    <Select value={formData.sizeGroup} onValueChange={handleSizeGroupChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {sizeGroups.map(g => (
                          <SelectItem key={g.name} value={g.name}>{g.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>颜色组</Label>
                    <Select value={formData.colorGroup} onValueChange={(v) => setFormData({ ...formData, colorGroup: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {colorGroups.map(g => (
                          <SelectItem key={g.name} value={g.name}>{g.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                
                {/* 颜色选择 */}
                <div className="space-y-2">
                  <Label>选择颜色</Label>
                  <div className="flex flex-wrap gap-2">
                    {['黑色', '白色', '灰色', '藏青', '红色', '蓝色', '绿色', '黄色', '粉色', '紫色', '橙色', '棕色'].map(color => (
                      <Badge
                        key={color}
                        variant={customColors.includes(color) ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => {
                          if (customColors.includes(color)) {
                            setCustomColors(customColors.filter(c => c !== color));
                          } else {
                            setCustomColors([...customColors, color]);
                          }
                        }}
                      >
                        {color}
                      </Badge>
                    ))}
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="size" className="space-y-4 py-4">
                <div className="border rounded-lg overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="bg-muted">尺码</TableHead>
                        <TableHead>胸围</TableHead>
                        <TableHead>衣长</TableHead>
                        <TableHead>肩宽</TableHead>
                        <TableHead>袖长</TableHead>
                        <TableHead>腰围</TableHead>
                        <TableHead>臀围</TableHead>
                        <TableHead>袖口</TableHead>
                        <TableHead>下摆</TableHead>
                        <TableHead>公差</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sizeChart.map((row, index) => (
                        <TableRow key={row.size}>
                          <TableCell className="bg-muted font-medium">{row.size}</TableCell>
                          <TableCell>
                            <Input
                              value={row.chest}
                              onChange={(e) => handleSizeChartChange(index, 'chest', e.target.value)}
                              className="w-20"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              value={row.length}
                              onChange={(e) => handleSizeChartChange(index, 'length', e.target.value)}
                              className="w-20"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              value={row.shoulder}
                              onChange={(e) => handleSizeChartChange(index, 'shoulder', e.target.value)}
                              className="w-20"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              value={row.sleeve}
                              onChange={(e) => handleSizeChartChange(index, 'sleeve', e.target.value)}
                              className="w-20"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              value={row.waist}
                              onChange={(e) => handleSizeChartChange(index, 'waist', e.target.value)}
                              className="w-20"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              value={row.hip}
                              onChange={(e) => handleSizeChartChange(index, 'hip', e.target.value)}
                              className="w-20"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              value={row.cuff}
                              onChange={(e) => handleSizeChartChange(index, 'cuff', e.target.value)}
                              className="w-20"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              value={row.hem}
                              onChange={(e) => handleSizeChartChange(index, 'hem', e.target.value)}
                              className="w-20"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              value={row.tolerance}
                              onChange={(e) => handleSizeChartChange(index, 'tolerance', e.target.value)}
                              className="w-20"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDialog(false)}>取消</Button>
              <Button onClick={handleSaveStyle}>保存</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
