'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Printer, Download } from 'lucide-react';
import { type BOM, type BOMStatus } from '@/types/bom';

interface BOMDetailDialogProps {
  bom: BOM;
  onClose: () => void;
}

const statusColors: Record<BOMStatus, string> = {
  '草稿': 'bg-gray-500',
  '待审核': 'bg-yellow-500',
  '已审核': 'bg-blue-500',
  '已生效': 'bg-green-500',
  '已作废': 'bg-red-500',
};

export default function BOMDetailDialog({ bom, onClose }: BOMDetailDialogProps) {
  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(bom, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${bom.bomNo}.json`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <div className="flex justify-between items-center">
            <DialogTitle className="text-xl">BOM详情 - {bom.bomNo}</DialogTitle>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={handleExport}>
                <Download className="w-4 h-4 mr-1" />
                导出
              </Button>
              <Button size="sm" variant="outline" onClick={handlePrint}>
                <Printer className="w-4 h-4 mr-1" />
                打印
              </Button>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 h-[calc(90vh-80px)]">
          <div className="p-6">
            {/* BOM状态 */}
            <div className="mb-6 flex items-center gap-4">
              <span className="text-sm text-gray-600">BOM状态：</span>
              <Badge className={`${statusColors[bom.status]} text-white text-base px-4 py-1`}>
                {bom.status}
              </Badge>
              <span className="text-sm text-gray-600 ml-4">版本：{bom.bomVersion}</span>
            </div>

            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid grid-cols-8 mb-6">
                <TabsTrigger value="basic">基本信息</TabsTrigger>
                <TabsTrigger value="fabric">面料({bom.fabrics.length})</TabsTrigger>
                <TabsTrigger value="accessory">辅料({bom.accessories.length})</TabsTrigger>
                <TabsTrigger value="print">印绣花({bom.prints.length})</TabsTrigger>
                <TabsTrigger value="wash">洗水({bom.washes.length})</TabsTrigger>
                <TabsTrigger value="tail">尾部({bom.tails.length})</TabsTrigger>
                <TabsTrigger value="packing">包装({bom.packings.length})</TabsTrigger>
                <TabsTrigger value="cost">成本汇总</TabsTrigger>
              </TabsList>

              {/* 基本信息 */}
              <TabsContent value="basic">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <Label className="text-gray-600">BOM编号</Label>
                    <div className="font-medium">{bom.bomNo}</div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-gray-600">关联订单号</Label>
                    <div className="font-medium">{bom.orderNo}</div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-gray-600">款号</Label>
                    <div className="font-medium">{bom.styleNo}</div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-gray-600">产品名称</Label>
                    <div className="font-medium">{bom.productName}</div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-gray-600">客户名称</Label>
                    <div className="font-medium">{bom.customerName}</div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-gray-600">订单总数量</Label>
                    <div className="font-medium text-blue-600 text-lg">{bom.orderQuantity} 件</div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-gray-600">交货日期</Label>
                    <div className="font-medium">{bom.deliveryDate}</div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-gray-600">BOM版本</Label>
                    <div className="font-medium">{bom.bomVersion}</div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-gray-600">单件成本</Label>
                    <div className="font-medium text-blue-600 text-lg">¥{bom.pieceCost}</div>
                  </div>
                </div>
                <div className="mt-6 pt-4 border-t grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-1">
                    <Label className="text-gray-600">创建人</Label>
                    <div className="font-medium">{bom.createdBy}</div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-gray-600">创建时间</Label>
                    <div className="font-medium">{bom.createdAt}</div>
                  </div>
                  {bom.auditedBy && (
                    <>
                      <div className="space-y-1">
                        <Label className="text-gray-600">审核人</Label>
                        <div className="font-medium">{bom.auditedBy}</div>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-gray-600">审核时间</Label>
                        <div className="font-medium">{bom.auditedAt}</div>
                      </div>
                    </>
                  )}
                </div>
              </TabsContent>

              {/* 面料物料 */}
              <TabsContent value="fabric">
                {bom.fabrics.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">暂无面料物料</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>物料编码</TableHead>
                        <TableHead>物料名称</TableHead>
                        <TableHead>规格</TableHead>
                        <TableHead>使用部位</TableHead>
                        <TableHead className="text-right">标准单耗</TableHead>
                        <TableHead className="text-right">实际单耗</TableHead>
                        <TableHead className="text-right">总用量</TableHead>
                        <TableHead className="text-right">单价</TableHead>
                        <TableHead className="text-right">总成本</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bom.fabrics.map((fabric, index) => (
                        <TableRow key={index}>
                          <TableCell>{fabric.materialCode}</TableCell>
                          <TableCell>{fabric.materialName}</TableCell>
                          <TableCell>{fabric.specification}</TableCell>
                          <TableCell>{fabric.usagePart}</TableCell>
                          <TableCell className="text-right">{fabric.standardConsumption}</TableCell>
                          <TableCell className="text-right">{fabric.actualConsumption.toFixed(4)}</TableCell>
                          <TableCell className="text-right">{fabric.totalUsage.toFixed(2)}</TableCell>
                          <TableCell className="text-right">{fabric.unitPrice}</TableCell>
                          <TableCell className="text-right font-medium">{fabric.totalCost.toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="bg-gray-50 font-bold">
                        <TableCell colSpan={8}>面料总成本</TableCell>
                        <TableCell className="text-right text-blue-600">¥{bom.fabricTotalCost.toFixed(2)}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                )}
              </TabsContent>

              {/* 辅料物料 */}
              <TabsContent value="accessory">
                {bom.accessories.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">暂无辅料物料</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>物料编码</TableHead>
                        <TableHead>物料名称</TableHead>
                        <TableHead>规格</TableHead>
                        <TableHead className="text-right">总用量</TableHead>
                        <TableHead className="text-right">总成本</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bom.accessories.map((acc, index) => (
                        <TableRow key={index}>
                          <TableCell>{acc.materialCode}</TableCell>
                          <TableCell>{acc.materialName}</TableCell>
                          <TableCell>{acc.specification}</TableCell>
                          <TableCell className="text-right">{acc.totalUsage}</TableCell>
                          <TableCell className="text-right">{acc.totalCost.toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </TabsContent>

              {/* 印绣花 */}
              <TabsContent value="print">
                {bom.prints.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">暂无印绣花物料</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>位置</TableHead>
                        <TableHead>工艺类型</TableHead>
                        <TableHead>颜色数</TableHead>
                        <TableHead>尺寸</TableHead>
                        <TableHead className="text-right">总用量</TableHead>
                        <TableHead className="text-right">总成本</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bom.prints.map((print, index) => (
                        <TableRow key={index}>
                          <TableCell>{print.usagePart}</TableCell>
                          <TableCell>{print.printType}</TableCell>
                          <TableCell>{print.colorCount}</TableCell>
                          <TableCell>{print.printWidth}×{print.printHeight}</TableCell>
                          <TableCell className="text-right">{print.totalUsage}</TableCell>
                          <TableCell className="text-right font-medium">{print.totalCost.toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </TabsContent>

              {/* 洗水 */}
              <TabsContent value="wash">
                {bom.washes.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">暂无洗水物料</div>
                ) : (
                  <div>洗水物料列表</div>
                )}
              </TabsContent>

              {/* 尾部 */}
              <TabsContent value="tail">
                {bom.tails.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">暂无尾部物料</div>
                ) : (
                  <div>尾部物料列表</div>
                )}
              </TabsContent>

              {/* 包装 */}
              <TabsContent value="packing">
                {bom.packings.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">暂无包装物料</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>物料名称</TableHead>
                        <TableHead>规格</TableHead>
                        <TableHead>装箱数量</TableHead>
                        <TableHead className="text-right">总用量</TableHead>
                        <TableHead className="text-right">总成本</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bom.packings.map((pack, index) => (
                        <TableRow key={index}>
                          <TableCell>{pack.materialName}</TableCell>
                          <TableCell>{pack.specification}</TableCell>
                          <TableCell>{pack.packingQuantity}</TableCell>
                          <TableCell className="text-right">{pack.totalUsage}</TableCell>
                          <TableCell className="text-right">{pack.totalCost.toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </TabsContent>

              {/* 成本汇总 */}
              <TabsContent value="cost">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <Label className="text-gray-600">面料总成本</Label>
                    <div className="text-2xl font-bold text-blue-600 mt-1">¥{bom.fabricTotalCost.toFixed(2)}</div>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <Label className="text-gray-600">辅料总成本</Label>
                    <div className="text-2xl font-bold text-green-600 mt-1">¥{bom.accessoryTotalCost.toFixed(2)}</div>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <Label className="text-gray-600">印绣花总成本</Label>
                    <div className="text-2xl font-bold text-purple-600 mt-1">¥{bom.printTotalCost.toFixed(2)}</div>
                  </div>
                  <div className="p-4 bg-orange-50 rounded-lg">
                    <Label className="text-gray-600">洗水总成本</Label>
                    <div className="text-2xl font-bold text-orange-600 mt-1">¥{bom.washTotalCost.toFixed(2)}</div>
                  </div>
                  <div className="p-4 bg-pink-50 rounded-lg">
                    <Label className="text-gray-600">尾部总成本</Label>
                    <div className="text-2xl font-bold text-pink-600 mt-1">¥{bom.tailTotalCost.toFixed(2)}</div>
                  </div>
                  <div className="p-4 bg-cyan-50 rounded-lg">
                    <Label className="text-gray-600">包装总成本</Label>
                    <div className="text-2xl font-bold text-cyan-600 mt-1">¥{bom.packingTotalCost.toFixed(2)}</div>
                  </div>
                </div>
                
                <div className="mt-6 p-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg text-white">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <Label className="text-blue-100">单件产品成本</Label>
                      <div className="text-3xl font-bold mt-1">¥{bom.pieceCost}</div>
                    </div>
                    <div>
                      <Label className="text-blue-100">订单总生产成本</Label>
                      <div className="text-3xl font-bold mt-1">¥{bom.totalCost.toFixed(2)}</div>
                    </div>
                    <div>
                      <Label className="text-blue-100">订单总数量</Label>
                      <div className="text-3xl font-bold mt-1">{bom.orderQuantity} 件</div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </ScrollArea>

        <div className="flex justify-end gap-2 px-6 py-4 border-t bg-gray-50">
          <Button variant="outline" onClick={onClose}>关闭</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Label({ className, children }: { className?: string; children: React.ReactNode }) {
  return <label className={`text-sm ${className}`}>{children}</label>;
}
