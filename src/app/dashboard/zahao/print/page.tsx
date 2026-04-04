'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  Printer,
  ArrowLeft,
  Eye,
  Settings,
  QrCode,
  ChevronDown,
  ChevronRight,
  Shirt,
  Layers,
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

// 分组结构
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
  sizes: SizeGroup[];
  totalZaHao: number;
  colorName: string;
}

interface SizeGroup {
  sizeName: string;
  items: ZaHaoDisplay[];
  totalQuantity: number;
}

export default function ZaHaoPrintPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedIds = searchParams.get('ids')?.split(',') || [];
  
  const [zaHaoList, setZaHaoList] = useState<ZaHaoDisplay[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(preselectedIds));
  
  // 折叠状态
  const [expandedStyles, setExpandedStyles] = useState<Set<string>>(new Set(preselectedIds.length > 0 ? [] : undefined));
  const [expandedBeds, setExpandedBeds] = useState<Set<string>>(new Set());
  
  // 打印配置
  const [config, setConfig] = useState({
    labelWidth: 70,      // mm
    labelHeight: 40,     // mm
    columns: 3,          // 每行标签数
    showQR: true,
    showOrder: true,
    showStyle: true,
    showProductName: true,
    showColor: true,
    showSize: true,
    showQuantity: true,
    showBedNo: true,
    showLayer: true,
    showRange: true,
    fontSize: 9,
  });
  
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    initCuttingData();
    const tasks = getCuttingTasks();
    const allZaHao: ZaHaoDisplay[] = [];
    
    tasks.forEach(task => {
      const records = getZaHaoRecords(task.id);
      records.forEach(record => {
        const bed = task.beds.find(b => b.bedNo === record.bedNo);
        const sizeRatio = bed?.sizeRatios.find(s => s.sizeName === record.sizeName);
        const ratio = sizeRatio?.ratio || 1;
        const rangeStart = (record.layerStart - 1) * ratio + 1;
        const rangeEnd = record.layerEnd * ratio;
        
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
    
    // 如果有预选项，展开对应的分组
    if (preselectedIds.length > 0) {
      const styleSet = new Set<string>();
      const bedSet = new Set<string>();
      allZaHao.forEach(z => {
        if (preselectedIds.includes(z.id)) {
          styleSet.add(z.styleNo);
          bedSet.add(`${z.styleNo}-${z.bedNo}`);
        }
      });
      setExpandedStyles(styleSet);
      setExpandedBeds(bedSet);
    }
  };

  // 构建分组数据
  const buildGroupedData = (): StyleGroup[] => {
    const styleMap = new Map<string, StyleGroup>();
    
    zaHaoList.forEach(z => {
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
      
      let bedGroup = styleGroup.beds.find(b => b.bedNo === z.bedNo);
      if (!bedGroup) {
        bedGroup = {
          bedNo: z.bedNo,
          sizes: [],
          totalZaHao: 0,
          colorName: z.colorName,
        };
        styleGroup.beds.push(bedGroup);
      }
      bedGroup.totalZaHao++;
      
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
    
    return Array.from(styleMap.values());
  };

  const groupedData = buildGroupedData();
  const selectedItems = zaHaoList.filter(z => selectedIds.has(z.id));

  const handleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const handleSelectStyle = (styleNo: string, checked: boolean) => {
    const newSet = new Set(selectedIds);
    const styleItems = zaHaoList.filter(z => z.styleNo === styleNo);
    if (checked) {
      styleItems.forEach(z => newSet.add(z.id));
    } else {
      styleItems.forEach(z => newSet.delete(z.id));
    }
    setSelectedIds(newSet);
  };

  const handleSelectBed = (styleNo: string, bedNo: string, checked: boolean) => {
    const newSet = new Set(selectedIds);
    const bedItems = zaHaoList.filter(z => z.styleNo === styleNo && z.bedNo === bedNo);
    if (checked) {
      bedItems.forEach(z => newSet.add(z.id));
    } else {
      bedItems.forEach(z => newSet.delete(z.id));
    }
    setSelectedIds(newSet);
  };

  const handleSelectSize = (styleNo: string, bedNo: string, sizeName: string, checked: boolean) => {
    const newSet = new Set(selectedIds);
    const sizeItems = zaHaoList.filter(z => z.styleNo === styleNo && z.bedNo === bedNo && z.sizeName === sizeName);
    if (checked) {
      sizeItems.forEach(z => newSet.add(z.id));
    } else {
      sizeItems.forEach(z => newSet.delete(z.id));
    }
    setSelectedIds(newSet);
  };

  // 切换折叠
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

  // 执行打印
  const handlePrint = () => {
    if (selectedIds.size === 0) {
      alert('请先选择要打印的菲票');
      return;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('请允许弹出窗口以打印标签');
      return;
    }

    // 生成打印内容 - 改进的标签模板
    const labelsHtml = selectedItems.map(z => {
      const lines = [];
      
      lines.push(`<div class="label">`);
      
      // 标题行：扎号 + 床次
      lines.push(`<div class="header-row">`);
      lines.push(`<div class="za-no">${z.zaNo}</div>`);
      if (z.bundleNo) {
        lines.push(`<div class="bundle-no">${z.bundleNo}</div>`);
      }
      lines.push(`<div class="bed-no">${z.bedNo.replace('BED', '')}</div>`);
      lines.push(`</div>`);
      
      // 信息区域
      lines.push(`<div class="info-area">`);
      
      // 左侧：主要信息
      lines.push(`<div class="info-left">`);
      if (config.showStyle) {
        lines.push(`<div class="row"><span class="key">款号</span><span class="val style-val">${z.styleNo}</span></div>`);
      }
      if (config.showProductName) {
        lines.push(`<div class="row"><span class="key">品名</span><span class="val">${z.productName}</span></div>`);
      }
      if (config.showColor) {
        lines.push(`<div class="row"><span class="key">颜色</span><span class="val">${z.colorName}</span></div>`);
      }
      lines.push(`</div>`);
      
      // 右侧：尺码和数量（突出显示）
      lines.push(`<div class="info-right">`);
      lines.push(`<div class="size-box">`);
      lines.push(`<div class="size-label">尺码</div>`);
      lines.push(`<div class="size-value">${z.sizeName}</div>`);
      lines.push(`</div>`);
      lines.push(`<div class="qty-box">`);
      lines.push(`<div class="qty-value">${z.quantity}</div>`);
      lines.push(`<div class="qty-label">件</div>`);
      lines.push(`</div>`);
      lines.push(`</div>`);
      
      lines.push(`</div>`);
      
      // 底部：附加信息
      lines.push(`<div class="footer-row">`);
      if (config.showLayer) {
        lines.push(`<span>层: ${z.layerStart}-${z.layerEnd}</span>`);
      }
      if (config.showRange) {
        lines.push(`<span>区间: ${z.rangeDisplay}</span>`);
      }
      if (config.showOrder) {
        lines.push(`<span>订单: ${z.orderNo}</span>`);
      }
      lines.push(`</div>`);
      
      // 二维码
      if (config.showQR) {
        lines.push(`<div class="qr-area">`);
        lines.push(`<div class="qr-placeholder">QR</div>`);
        lines.push(`</div>`);
      }
      
      lines.push(`</div>`);
      return lines.join('\n');
    }).join('\n');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>菲票打印 - ${selectedItems.length}张</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          
          body {
            font-family: 'Microsoft YaHei', 'SimHei', Arial, sans-serif;
            padding: 3mm;
            background: white;
          }
          
          .labels-grid {
            display: grid;
            grid-template-columns: repeat(${config.columns}, 1fr);
            gap: 3mm;
          }
          
          .label {
            width: ${config.labelWidth}mm;
            height: ${config.labelHeight}mm;
            border: 2px solid #000;
            padding: 2mm;
            page-break-inside: avoid;
            display: flex;
            flex-direction: column;
            background: white;
            position: relative;
            overflow: hidden;
          }
          
          .header-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid #000;
            padding-bottom: 1mm;
            margin-bottom: 1mm;
          }
          
          .za-no {
            font-size: 12px;
            font-weight: bold;
            letter-spacing: 1px;
          }
          
          .bundle-no {
            font-size: 9px;
            color: #666;
          }
          
          .bed-no {
            font-size: 10px;
            font-weight: bold;
            color: #333;
            background: #f0f0f0;
            padding: 0 3px;
            border-radius: 2px;
          }
          
          .info-area {
            flex: 1;
            display: flex;
            gap: 2mm;
          }
          
          .info-left {
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: space-around;
          }
          
          .row {
            display: flex;
            justify-content: space-between;
            font-size: 9px;
            line-height: 1.3;
          }
          
          .key { color: #666; }
          .val { font-weight: 500; }
          .style-val { font-weight: bold; }
          
          .info-right {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 1mm;
          }
          
          .size-box {
            text-align: center;
            background: #f5f5f5;
            padding: 1mm 3mm;
            border-radius: 2px;
          }
          
          .size-label {
            font-size: 8px;
            color: #666;
          }
          
          .size-value {
            font-size: 16px;
            font-weight: bold;
          }
          
          .qty-box {
            display: flex;
            align-items: baseline;
            gap: 1px;
          }
          
          .qty-value {
            font-size: 18px;
            font-weight: bold;
            color: #d32f2f;
          }
          
          .qty-label {
            font-size: 10px;
            color: #666;
          }
          
          .footer-row {
            display: flex;
            justify-content: space-between;
            font-size: 8px;
            color: #666;
            border-top: 1px dashed #ccc;
            padding-top: 1mm;
            margin-top: 1mm;
          }
          
          .qr-area {
            position: absolute;
            right: 2mm;
            bottom: 6mm;
            width: 10mm;
            height: 10mm;
            border: 1px solid #ccc;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          
          .qr-placeholder {
            font-size: 7px;
            color: #999;
          }
          
          @media print {
            body { padding: 0; }
            .label {
              border: 2px solid #000 !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            @page { size: auto; margin: 3mm; }
          }
        </style>
      </head>
      <body>
        <div class="labels-grid">${labelsHtml}</div>
        <script>
          window.onload = function() {
            setTimeout(function() { window.print(); }, 300);
          };
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  // 预览
  const renderPreview = () => {
    if (selectedItems.length === 0) return null;

    return (
      <div className="bg-white p-4 rounded-lg border overflow-auto max-h-[400px]">
        <div 
          className="grid gap-2"
          style={{
            gridTemplateColumns: `repeat(${config.columns}, ${config.labelWidth}mm)`,
          }}
        >
          {selectedItems.slice(0, 12).map(z => (
            <div
              key={z.id}
              className="border-2 border-black p-1 relative"
              style={{
                width: `${config.labelWidth}mm`,
                height: `${config.labelHeight}mm`,
                fontSize: `${config.fontSize}px`,
              }}
            >
              <div className="flex justify-between items-center border-b border-black pb-0.5 mb-0.5">
                <span className="font-bold text-xs">{z.zaNo}</span>
                <span className="text-xs bg-gray-100 px-1 rounded">{z.bedNo.replace('BED', '')}</span>
              </div>
              <div className="flex gap-1">
                <div className="flex-1 text-xs space-y-0.5">
                  {config.showStyle && <div className="flex justify-between"><span className="text-gray-500">款号</span><span className="font-bold">{z.styleNo}</span></div>}
                  {config.showColor && <div className="flex justify-between"><span className="text-gray-500">颜色</span><span>{z.colorName}</span></div>}
                </div>
                <div className="text-center">
                  <div className="bg-gray-100 px-2 rounded text-xs">尺码</div>
                  <div className="text-lg font-bold">{z.sizeName}</div>
                  <div className="text-red-600 font-bold text-lg">{z.quantity}<span className="text-xs">件</span></div>
                </div>
              </div>
              <div className="absolute right-1 bottom-1 w-6 h-6 border border-gray-300 flex items-center justify-center text-xs text-gray-400">
                QR
              </div>
            </div>
          ))}
        </div>
        {selectedItems.length > 12 && (
          <div className="text-center text-muted-foreground text-sm mt-2">
            还有 {selectedItems.length - 12} 张标签...
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background p-4 pb-20">
      {/* 顶部标题栏 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-1" />返回
          </Button>
          <div>
            <h1 className="text-2xl font-bold">菲票打印</h1>
            <p className="text-muted-foreground text-sm">款号分床 / 选择扎号 / 打印标签</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setPreviewMode(!previewMode)}
            disabled={selectedIds.size === 0}
          >
            <Eye className="w-4 h-4 mr-2" />预览
          </Button>
          <Button 
            onClick={handlePrint}
            disabled={selectedIds.size === 0}
          >
            <Printer className="w-4 h-4 mr-2" />
            打印 ({selectedIds.size}张)
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* 左侧：选择扎号（按款号-床次分组） */}
        <div className="lg:col-span-2 space-y-3">
          {/* 统计 */}
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center gap-4 text-sm">
                <span className="text-muted-foreground">已选</span>
                <span className="font-bold text-lg text-primary">{selectedIds.size}</span>
                <span className="text-muted-foreground">/ {zaHaoList.length} 张</span>
                <div className="flex-1" />
                <span className="text-muted-foreground">款号: <span className="font-medium">{new Set(selectedItems.map(z => z.styleNo)).size}</span></span>
                <span className="text-muted-foreground">床次: <span className="font-medium">{new Set(selectedItems.map(z => z.bedNo)).size}</span></span>
              </div>
            </CardContent>
          </Card>

          {/* 分组列表 */}
          <div className="space-y-2">
            {groupedData.map((style) => {
              const styleKey = style.styleNo;
              const isStyleExpanded = expandedStyles.has(styleKey);
              const styleSelected = selectedItems.filter(z => z.styleNo === style.styleNo).length;
              
              return (
                <Card key={styleKey} className="overflow-hidden">
                  {/* 款号标题 */}
                  <div 
                    className="bg-indigo-50 dark:bg-indigo-950/30 px-3 py-2 flex items-center justify-between cursor-pointer"
                    onClick={() => toggleStyle(styleKey)}
                  >
                    <div className="flex items-center gap-2">
                      {isStyleExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      <Shirt className="w-4 h-4 text-indigo-600" />
                      <Badge variant="outline" className="font-bold">{style.styleNo}</Badge>
                      <span className="text-sm text-muted-foreground">{style.productName}</span>
                      <span className="text-xs text-muted-foreground">共 {style.totalZaHao} 扎</span>
                    </div>
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={styleSelected === style.totalZaHao && style.totalZaHao > 0}
                        onCheckedChange={(checked) => handleSelectStyle(style.styleNo, !!checked)}
                      />
                      <span className="text-xs text-muted-foreground">{styleSelected}/{style.totalZaHao}</span>
                    </div>
                  </div>
                  
                  {/* 床次列表 */}
                  {isStyleExpanded && (
                    <div className="divide-y divide-border">
                      {style.beds.map((bed) => {
                        const bedKey = `${style.styleNo}-${bed.bedNo}`;
                        const isBedExpanded = expandedBeds.has(bedKey);
                        const bedSelected = selectedItems.filter(z => z.styleNo === style.styleNo && z.bedNo === bed.bedNo).length;
                        
                        return (
                          <div key={bedKey}>
                            {/* 床次标题 */}
                            <div 
                              className="bg-cyan-50 dark:bg-cyan-950/20 px-3 py-1.5 flex items-center justify-between cursor-pointer hover:bg-cyan-100 dark:hover:bg-cyan-950/30"
                              onClick={() => toggleBed(bedKey)}
                            >
                              <div className="flex items-center gap-2">
                                {isBedExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                                <Layers className="w-3 h-3 text-cyan-600" />
                                <span className="font-mono text-sm text-cyan-700 dark:text-cyan-300">{bed.bedNo}</span>
                                <Badge variant="secondary" className="text-xs">{bed.colorName}</Badge>
                                <span className="text-xs text-muted-foreground">{bed.totalZaHao} 扎</span>
                                <div className="flex gap-1">
                                  {bed.sizes.map(s => (
                                    <Badge key={s.sizeName} variant="outline" className="text-xs px-1">{s.sizeName}</Badge>
                                  ))}
                                </div>
                              </div>
                              <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                <Checkbox
                                  checked={bedSelected === bed.totalZaHao && bed.totalZaHao > 0}
                                  onCheckedChange={(checked) => handleSelectBed(style.styleNo, bed.bedNo, !!checked)}
                                />
                              </div>
                            </div>
                            
                            {/* 扎号卡片 */}
                            {isBedExpanded && (
                              <div className="p-2 bg-muted/30 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-1.5">
                                {bed.sizes.map((size) => (
                                  size.items.map((z) => (
                                    <div
                                      key={z.id}
                                      onClick={() => handleSelect(z.id)}
                                      className={`p-2 border rounded cursor-pointer transition-all text-xs ${
                                        selectedIds.has(z.id) ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'
                                      }`}
                                    >
                                      <div className="flex items-center gap-1 mb-1">
                                        <Checkbox
                                          checked={selectedIds.has(z.id)}
                                          onCheckedChange={() => handleSelect(z.id)}
                                          onClick={(e) => e.stopPropagation()}
                                          className="scale-75"
                                        />
                                        <span className="font-mono font-bold">{z.zaNo}</span>
                                      </div>
                                      <div className="flex justify-between items-center">
                                        <Badge variant="outline" className="text-xs">{z.sizeName}</Badge>
                                        <span className="font-bold text-red-600">{z.quantity}件</span>
                                      </div>
                                    </div>
                                  ))
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </div>

        {/* 右侧：配置 */}
        <div className="space-y-3">
          <Card>
            <div className="p-3 border-b">
              <h3 className="font-medium flex items-center gap-2">
                <Settings className="w-4 h-4" />
                打印配置
              </h3>
            </div>
            <CardContent className="p-3 space-y-3">
              {/* 尺寸 */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs">宽度(mm)</Label>
                  <Input
                    type="number"
                    value={config.labelWidth}
                    onChange={(e) => setConfig({ ...config, labelWidth: parseInt(e.target.value) || 70 })}
                    className="mt-1 h-8"
                  />
                </div>
                <div>
                  <Label className="text-xs">高度(mm)</Label>
                  <Input
                    type="number"
                    value={config.labelHeight}
                    onChange={(e) => setConfig({ ...config, labelHeight: parseInt(e.target.value) || 40 })}
                    className="mt-1 h-8"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs">每行列数</Label>
                  <Select value={String(config.columns)} onValueChange={(v) => setConfig({ ...config, columns: parseInt(v) })}>
                    <SelectTrigger className="mt-1 h-8"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2">2列</SelectItem>
                      <SelectItem value="3">3列</SelectItem>
                      <SelectItem value="4">4列</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">字体大小</Label>
                  <Select value={String(config.fontSize)} onValueChange={(v) => setConfig({ ...config, fontSize: parseInt(v) })}>
                    <SelectTrigger className="mt-1 h-8"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="8">8px</SelectItem>
                      <SelectItem value="9">9px</SelectItem>
                      <SelectItem value="10">10px</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* 显示项 */}
              <div>
                <Label className="text-xs mb-1 block">显示内容</Label>
                <div className="grid grid-cols-3 gap-1 text-xs">
                  {[
                    { key: 'showQR', label: '二维码' },
                    { key: 'showStyle', label: '款号' },
                    { key: 'showProductName', label: '品名' },
                    { key: 'showColor', label: '颜色' },
                    { key: 'showSize', label: '尺码' },
                    { key: 'showQuantity', label: '数量' },
                    { key: 'showBedNo', label: '床次' },
                    { key: 'showLayer', label: '层号' },
                    { key: 'showRange', label: '区间' },
                    { key: 'showOrder', label: '订单' },
                  ].map(item => (
                    <label key={item.key} className="flex items-center gap-1">
                      <Checkbox
                        checked={config[item.key as keyof typeof config] as boolean}
                        onCheckedChange={(checked) => setConfig({ ...config, [item.key]: !!checked })}
                        className="scale-75"
                      />
                      {item.label}
                    </label>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 预览 */}
          {previewMode && selectedItems.length > 0 && (
            <Card>
              <div className="p-3 border-b"><h3 className="font-medium text-sm">预览</h3></div>
              <CardContent className="p-2">{renderPreview()}</CardContent>
            </Card>
          )}

          {/* 操作按钮 */}
          <Card>
            <CardContent className="p-3 space-y-2">
              <Button className="w-full" onClick={handlePrint} disabled={selectedIds.size === 0}>
                <Printer className="w-4 h-4 mr-2" />
                打印 {selectedIds.size > 0 && `(${selectedIds.size}张)`}
              </Button>
              <Button variant="outline" className="w-full" onClick={() => router.push('/dashboard/zahao')}>
                返回扎号管理
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
