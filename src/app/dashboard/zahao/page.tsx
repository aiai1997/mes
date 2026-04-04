'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Tag,
  Search,
  RotateCcw,
  Printer,
  Check,
  Loader2,
  ChevronDown,
  ChevronRight,
  Shirt,
  Layers,
  Palette,
  Hash,
} from 'lucide-react';
import {
  type ZaHaoRecord,
  getCuttingTasks,
  getZaHaoRecords,
  initCuttingData,
} from '@/types/cutting';

interface ZaHaoDisplay extends ZaHaoRecord {
  taskId: string;
  orderNo: string;
  styleNo: string;
  productName: string;
  rangeDisplay: string;
}

// 三级分组结构
interface StyleGroup {
  styleNo: string;
  productName: string;
  orderNo: string;
  beds: BedGroup[];
  totalZaHao: number;
  totalQuantity: number;
}

interface BedGroup {
  bedNo: string;
  bedId: string;
  colorName: string;
  fabricName: string;
  totalLayers: number;
  totalPieces: number;
  sizes: SizeGroup[];
  totalZaHao: number;
}

interface SizeGroup {
  sizeName: string;
  items: ZaHaoDisplay[];
  totalQuantity: number;
}

const statusColors: Record<string, string> = {
  '已生成': 'bg-gray-500 text-white',
  '已移交': 'bg-blue-500 text-white',
  '缝制中': 'bg-orange-500 text-white',
  '已转入尾部': 'bg-purple-500 text-white',
  '已入库': 'bg-green-500 text-white',
};

export default function ZaHaoPage() {
  const router = useRouter();
  const [zaHaoList, setZaHaoList] = useState<ZaHaoDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  
  // 筛选条件
  const [searchZaNo, setSearchZaNo] = useState('');
  const [searchOrder, setSearchOrder] = useState('');
  const [searchStyle, setSearchStyle] = useState('');
  const [searchBed, setSearchBed] = useState('');
  const [searchColor, setSearchColor] = useState('');
  const [searchSize, setSearchSize] = useState('');
  const [searchStatus, setSearchStatus] = useState('all');

  // 折叠状态
  const [expandedStyles, setExpandedStyles] = useState<Set<string>>(new Set());
  const [expandedBeds, setExpandedBeds] = useState<Set<string>>(new Set());
  const [expandedSizes, setExpandedSizes] = useState<Set<string>>(new Set());

  const loadData = () => {
    setLoading(true);
    initCuttingData();
    const tasks = getCuttingTasks();
    const allZaHao: ZaHaoDisplay[] = [];
    
    tasks.forEach(task => {
      const records = getZaHaoRecords(task.id);
      records.forEach(record => {
        const bed = task.beds.find(b => b.bedNo === record.bedNo);
        const rangeStart = (record.layerStart - 1) * (bed?.sizeRatios.find(s => s.sizeName === record.sizeName)?.ratio || 1) + 1;
        const rangeEnd = record.layerEnd * (bed?.sizeRatios.find(s => s.sizeName === record.sizeName)?.ratio || 1);
        
        allZaHao.push({
          ...record,
          taskId: task.id,
          orderNo: task.orderNo,
          styleNo: task.styleNo,
          productName: task.productName,
          rangeDisplay: `${rangeStart}-${rangeEnd}`,
        });
      });
    });
    
    setZaHaoList(allZaHao);
    
    // 默认展开所有分组
    const styleSet = new Set(allZaHao.map(z => z.styleNo));
    const bedSet = new Set(allZaHao.map(z => `${z.styleNo}-${z.bedNo}`));
    const sizeSet = new Set(allZaHao.map(z => `${z.styleNo}-${z.bedNo}-${z.sizeName}`));
    setExpandedStyles(styleSet);
    setExpandedBeds(bedSet);
    setExpandedSizes(sizeSet);
    
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  // 筛选后的列表
  const filteredList = zaHaoList.filter(z => {
    if (searchZaNo && !z.zaNo.toLowerCase().includes(searchZaNo.toLowerCase())) return false;
    if (searchOrder && !z.orderNo.toLowerCase().includes(searchOrder.toLowerCase())) return false;
    if (searchStyle && !z.styleNo.toLowerCase().includes(searchStyle.toLowerCase())) return false;
    if (searchBed && !z.bedNo.toLowerCase().includes(searchBed.toLowerCase())) return false;
    if (searchColor && !z.colorName.includes(searchColor)) return false;
    if (searchSize && !z.sizeName.includes(searchSize)) return false;
    if (searchStatus !== 'all' && z.status !== searchStatus) return false;
    return true;
  });

  // 构建三级分组数据
  const buildGroupedData = (): StyleGroup[] => {
    const styleMap = new Map<string, StyleGroup>();
    
    filteredList.forEach(z => {
      // 款号分组
      if (!styleMap.has(z.styleNo)) {
        styleMap.set(z.styleNo, {
          styleNo: z.styleNo,
          productName: z.productName,
          orderNo: z.orderNo,
          beds: [],
          totalZaHao: 0,
          totalQuantity: 0,
        });
      }
      const styleGroup = styleMap.get(z.styleNo)!;
      styleGroup.totalZaHao++;
      styleGroup.totalQuantity += z.quantity;
      
      // 床次分组
      let bedGroup = styleGroup.beds.find(b => b.bedNo === z.bedNo);
      if (!bedGroup) {
        const task = getCuttingTasks().find(t => t.id === z.taskId);
        const bed = task?.beds.find(b => b.bedNo === z.bedNo);
        bedGroup = {
          bedNo: z.bedNo,
          bedId: bed?.id || '',
          colorName: z.colorName,
          fabricName: bed?.fabricName || '',
          totalLayers: bed?.totalLayers || 0,
          totalPieces: bed?.totalPieces || 0,
          sizes: [],
          totalZaHao: 0,
        };
        styleGroup.beds.push(bedGroup);
      }
      bedGroup.totalZaHao++;
      
      // 尺码分组
      let sizeGroup = bedGroup.sizes.find(s => s.sizeName === z.sizeName);
      if (!sizeGroup) {
        sizeGroup = {
          sizeName: z.sizeName,
          items: [],
          totalQuantity: 0,
        };
        bedGroup.sizes.push(sizeGroup);
      }
      sizeGroup.items.push(z);
      sizeGroup.totalQuantity += z.quantity;
    });
    
    // 尺码排序
    const sizeOrder = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
    styleMap.forEach(style => {
      style.beds.forEach(bed => {
        bed.sizes.sort((a, b) => sizeOrder.indexOf(a.sizeName) - sizeOrder.indexOf(b.sizeName));
      });
    });
    
    return Array.from(styleMap.values());
  };

  const groupedData = buildGroupedData();

  // 统计数据
  const stats = {
    total: zaHaoList.length,
    styles: new Set(zaHaoList.map(z => z.styleNo)).size,
    beds: new Set(zaHaoList.map(z => z.bedNo)).size,
    transferred: zaHaoList.filter(z => z.status === '已移交').length,
    sewing: zaHaoList.filter(z => z.status === '缝制中').length,
    finished: zaHaoList.filter(z => z.status === '已入库').length,
  };

  const handleReset = () => {
    setSearchZaNo('');
    setSearchOrder('');
    setSearchStyle('');
    setSearchBed('');
    setSearchColor('');
    setSearchSize('');
    setSearchStatus('all');
  };

  const handleSelectAll = () => {
    if (selectedIds.size === filteredList.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredList.map(z => z.id)));
    }
  };

  const handleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  // 批量选择（按分组）
  const handleSelectStyle = (styleNo: string, checked: boolean) => {
    const newSet = new Set(selectedIds);
    const styleItems = filteredList.filter(z => z.styleNo === styleNo);
    if (checked) {
      styleItems.forEach(z => newSet.add(z.id));
    } else {
      styleItems.forEach(z => newSet.delete(z.id));
    }
    setSelectedIds(newSet);
  };

  const handleSelectBed = (styleNo: string, bedNo: string, checked: boolean) => {
    const newSet = new Set(selectedIds);
    const bedItems = filteredList.filter(z => z.styleNo === styleNo && z.bedNo === bedNo);
    if (checked) {
      bedItems.forEach(z => newSet.add(z.id));
    } else {
      bedItems.forEach(z => newSet.delete(z.id));
    }
    setSelectedIds(newSet);
  };

  const handleSelectSize = (styleNo: string, bedNo: string, sizeName: string, checked: boolean) => {
    const newSet = new Set(selectedIds);
    const sizeItems = filteredList.filter(z => z.styleNo === styleNo && z.bedNo === bedNo && z.sizeName === sizeName);
    if (checked) {
      sizeItems.forEach(z => newSet.add(z.id));
    } else {
      sizeItems.forEach(z => newSet.delete(z.id));
    }
    setSelectedIds(newSet);
  };

  const handleTransfer = (id: string) => {
    const updated = zaHaoList.map(z => 
      z.id === id ? { ...z, status: '已移交' as const } : z
    );
    setZaHaoList(updated);
  };

  const handleBatchTransfer = () => {
    const updated = zaHaoList.map(z => 
      selectedIds.has(z.id) ? { ...z, status: '已移交' as const } : z
    );
    setZaHaoList(updated);
    setSelectedIds(new Set());
  };

  const handlePrint = () => {
    if (selectedIds.size === 0) {
      alert('请先选择要打印的扎号');
      return;
    }
    const ids = Array.from(selectedIds).join(',');
    router.push(`/dashboard/zahao/print?ids=${ids}`);
  };

  // 切换折叠状态
  const toggleStyle = (styleNo: string) => {
    const newSet = new Set(expandedStyles);
    if (newSet.has(styleNo)) {
      newSet.delete(styleNo);
    } else {
      newSet.add(styleNo);
    }
    setExpandedStyles(newSet);
  };

  const toggleBed = (key: string) => {
    const newSet = new Set(expandedBeds);
    if (newSet.has(key)) {
      newSet.delete(key);
    } else {
      newSet.add(key);
    }
    setExpandedBeds(newSet);
  };

  const toggleSize = (key: string) => {
    const newSet = new Set(expandedSizes);
    if (newSet.has(key)) {
      newSet.delete(key);
    } else {
      newSet.add(key);
    }
    setExpandedSizes(newSet);
  };

  return (
    <DashboardLayout>
      <div className="max-w-full mx-auto space-y-4 pb-20">
        {/* 页面标题 */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <Tag className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">扎号管理</h1>
              <p className="text-muted-foreground text-sm">款号分床 / 绑菲追溯 / 标签打印</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={handlePrint}
              disabled={selectedIds.size === 0}
            >
              <Printer className="w-4 h-4 mr-2" />
              打印标签 ({selectedIds.size})
            </Button>
            {selectedIds.size > 0 && (
              <Button onClick={handleBatchTransfer}>
                <Check className="w-4 h-4 mr-2" />
                批量移交
              </Button>
            )}
          </div>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-5 gap-4">
          <Card className="bg-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">扎号总数</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <Tag className="w-8 h-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">款号数</p>
                  <p className="text-2xl font-bold text-indigo-600">{stats.styles}</p>
                </div>
                <Shirt className="w-8 h-8 text-indigo-400" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">床次数</p>
                  <p className="text-2xl font-bold text-cyan-600">{stats.beds}</p>
                </div>
                <Layers className="w-8 h-8 text-cyan-400" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">已移交</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.transferred}</p>
                </div>
                <Tag className="w-8 h-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">缝制中</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.sewing}</p>
                </div>
                <Tag className="w-8 h-8 text-orange-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 搜索筛选 */}
        <Card className="bg-card">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-4 items-end">
              <div className="w-40">
                <Label className="text-sm">扎号</Label>
                <Input placeholder="ZY..." value={searchZaNo} onChange={(e) => setSearchZaNo(e.target.value)} className="mt-1" />
              </div>
              <div className="w-40">
                <Label className="text-sm">订单号</Label>
                <Input placeholder="ORD..." value={searchOrder} onChange={(e) => setSearchOrder(e.target.value)} className="mt-1" />
              </div>
              <div className="w-32">
                <Label className="text-sm">款号</Label>
                <Input placeholder="ST..." value={searchStyle} onChange={(e) => setSearchStyle(e.target.value)} className="mt-1" />
              </div>
              <div className="w-36">
                <Label className="text-sm">床次</Label>
                <Input placeholder="BED..." value={searchBed} onChange={(e) => setSearchBed(e.target.value)} className="mt-1" />
              </div>
              <div className="w-28">
                <Label className="text-sm">颜色</Label>
                <Input placeholder="颜色" value={searchColor} onChange={(e) => setSearchColor(e.target.value)} className="mt-1" />
              </div>
              <div className="w-24">
                <Label className="text-sm">尺码</Label>
                <Input placeholder="尺码" value={searchSize} onChange={(e) => setSearchSize(e.target.value)} className="mt-1" />
              </div>
              <div className="w-32">
                <Label className="text-sm">状态</Label>
                <Select value={searchStatus} onValueChange={setSearchStatus}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部</SelectItem>
                    <SelectItem value="已生成">已生成</SelectItem>
                    <SelectItem value="已移交">已移交</SelectItem>
                    <SelectItem value="缝制中">缝制中</SelectItem>
                    <SelectItem value="已转入尾部">已转入尾部</SelectItem>
                    <SelectItem value="已入库">已入库</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button onClick={loadData}>
                  <Search className="w-4 h-4 mr-1" />查询
                </Button>
                <Button variant="outline" onClick={handleReset}>
                  <RotateCcw className="w-4 h-4 mr-1" />重置
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 扎号列表 - 按款号 > 床次 > 尺码三级分组 */}
        <div className="space-y-4">
          {loading ? (
            <Card className="bg-card">
              <CardContent className="py-12 text-center text-muted-foreground">
                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                加载中...
              </CardContent>
            </Card>
          ) : groupedData.length === 0 ? (
            <Card className="bg-card">
              <CardContent className="py-12 text-center text-muted-foreground">
                暂无扎号记录
              </CardContent>
            </Card>
          ) : (
            groupedData.map((style) => {
              const styleKey = style.styleNo;
              const isStyleExpanded = expandedStyles.has(styleKey);
              const styleSelectedCount = filteredList.filter(z => z.styleNo === style.styleNo && selectedIds.has(z.id)).length;
              const styleTotalCount = filteredList.filter(z => z.styleNo === style.styleNo).length;
              
              return (
                <Card key={styleKey} className="bg-card overflow-hidden">
                  {/* 款号标题栏 */}
                  <div 
                    className="bg-indigo-50 dark:bg-indigo-950/30 px-4 py-3 flex items-center justify-between cursor-pointer border-b border-indigo-100 dark:border-indigo-900"
                    onClick={() => toggleStyle(styleKey)}
                  >
                    <div className="flex items-center gap-3">
                      {isStyleExpanded ? (
                        <ChevronDown className="w-5 h-5 text-indigo-600" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-indigo-600" />
                      )}
                      <Shirt className="w-5 h-5 text-indigo-600" />
                      <Badge variant="outline" className="text-base font-bold px-3 py-1 border-indigo-300 text-indigo-700 dark:text-indigo-300">
                        {style.styleNo}
                      </Badge>
                      <span className="text-muted-foreground">{style.productName}</span>
                      <div className="flex items-center gap-4 ml-4 text-sm text-muted-foreground">
                        <span>订单: <span className="font-mono">{style.orderNo}</span></span>
                        <span>共 <span className="font-bold text-indigo-600">{style.totalZaHao}</span> 扎</span>
                        <span>合计 <span className="font-bold text-indigo-600">{style.totalQuantity}</span> 件</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={styleSelectedCount === styleTotalCount && styleTotalCount > 0}
                        ref={(ref) => {
                          if (ref) {
                            (ref as HTMLButtonElement).dataset.state = styleSelectedCount > 0 && styleSelectedCount < styleTotalCount ? 'indeterminate' : ref.dataset.state;
                          }
                        }}
                        onCheckedChange={(checked) => handleSelectStyle(style.styleNo, checked as boolean)}
                      />
                      <span className="text-sm text-muted-foreground">
                        已选 {styleSelectedCount}/{styleTotalCount}
                      </span>
                    </div>
                  </div>
                  
                  {/* 床次列表 */}
                  {isStyleExpanded && (
                    <div className="divide-y divide-border">
                      {style.beds.map((bed) => {
                        const bedKey = `${style.styleNo}-${bed.bedNo}`;
                        const isBedExpanded = expandedBeds.has(bedKey);
                        const bedSelectedCount = filteredList.filter(z => z.styleNo === style.styleNo && z.bedNo === bed.bedNo && selectedIds.has(z.id)).length;
                        const bedTotalCount = filteredList.filter(z => z.styleNo === style.styleNo && z.bedNo === bed.bedNo).length;
                        
                        return (
                          <div key={bedKey}>
                            {/* 床次标题栏 */}
                            <div 
                              className="bg-cyan-50 dark:bg-cyan-950/20 px-4 py-2 flex items-center justify-between cursor-pointer hover:bg-cyan-100 dark:hover:bg-cyan-950/30"
                              onClick={() => toggleBed(bedKey)}
                            >
                              <div className="flex items-center gap-3">
                                {isBedExpanded ? (
                                  <ChevronDown className="w-4 h-4 text-cyan-600" />
                                ) : (
                                  <ChevronRight className="w-4 h-4 text-cyan-600" />
                                )}
                                <Layers className="w-4 h-4 text-cyan-600" />
                                <span className="font-mono font-bold text-cyan-700 dark:text-cyan-300">{bed.bedNo}</span>
                                
                                {/* 床次详情标签 */}
                                <div className="flex items-center gap-2 ml-2">
                                  <Badge variant="secondary" className="text-xs">
                                    <Palette className="w-3 h-3 mr-1" />
                                    {bed.colorName}
                                  </Badge>
                                  <Badge variant="secondary" className="text-xs">
                                    <Hash className="w-3 h-3 mr-1" />
                                    {bed.totalLayers}层
                                  </Badge>
                                  <Badge variant="secondary" className="text-xs">
                                    {bed.totalPieces}件
                                  </Badge>
                                  {/* 尺码组合 */}
                                  <div className="flex items-center gap-1">
                                    {bed.sizes.map(s => (
                                      <Badge key={s.sizeName} variant="outline" className="text-xs px-1.5">
                                        {s.sizeName}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                                
                                <span className="text-sm text-muted-foreground ml-2">
                                  共 <span className="font-bold">{bed.totalZaHao}</span> 扎
                                </span>
                              </div>
                              <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                <Checkbox
                                  checked={bedSelectedCount === bedTotalCount && bedTotalCount > 0}
                                  onCheckedChange={(checked) => handleSelectBed(style.styleNo, bed.bedNo, checked as boolean)}
                                />
                                <span className="text-sm text-muted-foreground">
                                  已选 {bedSelectedCount}/{bedTotalCount}
                                </span>
                              </div>
                            </div>
                            
                            {/* 尺码列表 */}
                            {isBedExpanded && (
                              <div className="bg-muted/30 p-2 space-y-2">
                                {bed.sizes.map((size) => {
                                  const sizeKey = `${style.styleNo}-${bed.bedNo}-${size.sizeName}`;
                                  const isSizeExpanded = expandedSizes.has(sizeKey);
                                  const sizeSelectedCount = size.items.filter(z => selectedIds.has(z.id)).length;
                                  
                                  return (
                                    <div key={sizeKey} className="border rounded-lg overflow-hidden">
                                      {/* 尺码标题栏 */}
                                      <div 
                                        className="bg-muted/50 px-3 py-2 flex items-center justify-between cursor-pointer"
                                        onClick={() => toggleSize(sizeKey)}
                                      >
                                        <div className="flex items-center gap-2">
                                          {isSizeExpanded ? (
                                            <ChevronDown className="w-4 h-4 text-muted-foreground" />
                                          ) : (
                                            <ChevronRight className="w-4 h-4 text-muted-foreground" />
                                          )}
                                          <Badge variant="outline" className="font-bold">
                                            {size.sizeName}
                                          </Badge>
                                          <span className="text-sm text-muted-foreground">
                                            {size.items.length} 扎 · {size.totalQuantity} 件
                                          </span>
                                        </div>
                                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                          <Checkbox
                                            checked={sizeSelectedCount === size.items.length && size.items.length > 0}
                                            onCheckedChange={(checked) => handleSelectSize(style.styleNo, bed.bedNo, size.sizeName, checked as boolean)}
                                          />
                                          <span className="text-sm text-muted-foreground">
                                            全选
                                          </span>
                                        </div>
                                      </div>
                                      
                                      {/* 扎号卡片 */}
                                      {isSizeExpanded && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 p-2 bg-background">
                                          {size.items.map((z) => (
                                            <div
                                              key={z.id}
                                              className={`border rounded-lg p-3 transition-all cursor-pointer hover:border-primary ${
                                                selectedIds.has(z.id) ? 'border-primary bg-primary/5' : 'border-border'
                                              }`}
                                              onClick={() => handleSelect(z.id)}
                                            >
                                              <div className="flex items-start justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                  <Checkbox
                                                    checked={selectedIds.has(z.id)}
                                                    onCheckedChange={() => handleSelect(z.id)}
                                                    onClick={(e) => e.stopPropagation()}
                                                  />
                                                  <span className="font-mono font-bold text-sm">{z.zaNo}</span>
                                                </div>
                                                <Badge className={statusColors[z.status]}>{z.status}</Badge>
                                              </div>
                                              
                                              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                                                <div className="flex justify-between">
                                                  <span className="text-muted-foreground">层:</span>
                                                  <span className="font-mono">{z.layerStart}-{z.layerEnd}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                  <span className="text-muted-foreground">区间:</span>
                                                  <span className="font-medium">{z.rangeDisplay}</span>
                                                </div>
                                              </div>
                                              
                                              <div className="flex items-center justify-between mt-2 pt-2 border-t">
                                                <div className="flex items-center gap-2">
                                                  <Badge variant="outline" className="font-bold">{z.sizeName}</Badge>
                                                  <span className="font-bold text-lg">{z.quantity}件</span>
                                                </div>
                                                {z.status === '已生成' && (
                                                  <Button 
                                                    size="sm" 
                                                    variant="outline"
                                                    onClick={(e) => {
                                                      e.stopPropagation();
                                                      handleTransfer(z.id);
                                                    }}
                                                  >
                                                    移交
                                                  </Button>
                                                )}
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </Card>
              );
            })
          )}
        </div>

        {/* 底部操作栏 */}
        {filteredList.length > 0 && (
          <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-card border rounded-full px-6 py-3 shadow-lg flex items-center gap-4 z-50">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={selectedIds.size === filteredList.length}
                onCheckedChange={handleSelectAll}
              />
              <span className="text-sm">全选</span>
            </div>
            <div className="text-sm text-muted-foreground">
              已选 {selectedIds.size} / {filteredList.length} 扎
            </div>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={handlePrint}
              disabled={selectedIds.size === 0}
            >
              <Printer className="w-4 h-4 mr-1" />打印标签
            </Button>
            {selectedIds.size > 0 && (
              <Button size="sm" onClick={handleBatchTransfer}>
                <Check className="w-4 h-4 mr-1" />批量移交
              </Button>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
