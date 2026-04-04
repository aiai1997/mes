'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Printer, Download } from 'lucide-react';
import { type Order, type OrderStatus } from '@/types/order';

interface OrderDetailDialogProps {
  order: Order;
  onClose: () => void;
}

// 订单状态颜色映射
const statusColors: Record<OrderStatus, string> = {
  '草稿': 'bg-gray-500',
  '待审核': 'bg-yellow-500',
  '已审核': 'bg-green-500',
  '已下达': 'bg-blue-500',
  '生产中': 'bg-purple-500',
  '已完成': 'bg-emerald-500',
  '已作废': 'bg-red-500',
};

export default function OrderDetailDialog({ order, onClose }: OrderDetailDialogProps) {
  // 打印订单
  const handlePrint = () => {
    window.print();
  };

  // 导出订单
  const handleExport = () => {
    const dataStr = JSON.stringify(order, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${order.orderNo}.json`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <div className="flex justify-between items-center">
            <DialogTitle className="text-xl">订单详情 - {order.orderNo}</DialogTitle>
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
            {/* 订单状态 */}
            <div className="mb-6 flex items-center gap-4">
              <span className="text-sm text-gray-600">订单状态：</span>
              <Badge className={`${statusColors[order.status]} text-white text-base px-4 py-1`}>
                {order.status}
              </Badge>
            </div>

            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid grid-cols-6 mb-6">
                <TabsTrigger value="basic">基本信息</TabsTrigger>
                <TabsTrigger value="colorSize">色码矩阵</TabsTrigger>
                <TabsTrigger value="price">价格信息</TabsTrigger>
                <TabsTrigger value="packing">包装要求</TabsTrigger>
                <TabsTrigger value="print">印绣花</TabsTrigger>
                <TabsTrigger value="wash">洗水/尾部</TabsTrigger>
              </TabsList>

              {/* 基本信息 */}
              <TabsContent value="basic">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <Label className="text-gray-600">订单号</Label>
                    <div className="font-medium">{order.orderNo}</div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-gray-600">客户名称</Label>
                    <div className="font-medium">{order.customerName}</div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-gray-600">客户型号</Label>
                    <div className="font-medium">{order.customerModel || '-'}</div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-gray-600">款号</Label>
                    <div className="font-medium">{order.styleNo}</div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-gray-600">产品名称</Label>
                    <div className="font-medium">{order.productName}</div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-gray-600">品牌</Label>
                    <div className="font-medium">{order.brand}</div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-gray-600">季节</Label>
                    <div className="font-medium">{order.season}</div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-gray-600">年份</Label>
                    <div className="font-medium">{order.year}</div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-gray-600">交货日期</Label>
                    <div className="font-medium">{order.deliveryDate}</div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-gray-600">订单日期</Label>
                    <div className="font-medium">{order.orderDate}</div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-gray-600">业务员</Label>
                    <div className="font-medium">{order.salesman || '-'}</div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-gray-600">总数量</Label>
                    <div className="font-medium text-blue-600 text-lg">{order.totalQuantity} 件</div>
                  </div>
                </div>
                {order.remark && (
                  <div className="mt-4 space-y-1">
                    <Label className="text-gray-600">备注</Label>
                    <div className="bg-gray-50 p-3 rounded text-sm">{order.remark}</div>
                  </div>
                )}
                <div className="mt-6 pt-4 border-t">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="space-y-1">
                      <Label className="text-gray-600">创建人</Label>
                      <div className="font-medium">{order.createdBy}</div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-gray-600">创建时间</Label>
                      <div className="font-medium">{order.createdAt}</div>
                    </div>
                    {order.auditedBy && (
                      <>
                        <div className="space-y-1">
                          <Label className="text-gray-600">审核人</Label>
                          <div className="font-medium">{order.auditedBy}</div>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-gray-600">审核时间</Label>
                          <div className="font-medium">{order.auditedAt}</div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </TabsContent>

              {/* 色码矩阵 */}
              <TabsContent value="colorSize">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>颜色名称</TableHead>
                        <TableHead className="text-center">S</TableHead>
                        <TableHead className="text-center">M</TableHead>
                        <TableHead className="text-center">L</TableHead>
                        <TableHead className="text-center">XL</TableHead>
                        <TableHead className="text-center">XXL</TableHead>
                        <TableHead className="text-center">XXXL</TableHead>
                        <TableHead className="text-center">小计</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {order.colorSizeMatrix.map((row, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{row.colorName}</TableCell>
                          <TableCell className="text-center">{row.S || '-'}</TableCell>
                          <TableCell className="text-center">{row.M || '-'}</TableCell>
                          <TableCell className="text-center">{row.L || '-'}</TableCell>
                          <TableCell className="text-center">{row.XL || '-'}</TableCell>
                          <TableCell className="text-center">{row.XXL || '-'}</TableCell>
                          <TableCell className="text-center">{row.XXXL || '-'}</TableCell>
                          <TableCell className="text-center font-medium">{row.subtotal}</TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="bg-gray-50 font-bold">
                        <TableCell>合计</TableCell>
                        <TableCell className="text-center">
                          {order.colorSizeMatrix.reduce((sum, r) => sum + r.S, 0)}
                        </TableCell>
                        <TableCell className="text-center">
                          {order.colorSizeMatrix.reduce((sum, r) => sum + r.M, 0)}
                        </TableCell>
                        <TableCell className="text-center">
                          {order.colorSizeMatrix.reduce((sum, r) => sum + r.L, 0)}
                        </TableCell>
                        <TableCell className="text-center">
                          {order.colorSizeMatrix.reduce((sum, r) => sum + r.XL, 0)}
                        </TableCell>
                        <TableCell className="text-center">
                          {order.colorSizeMatrix.reduce((sum, r) => sum + r.XXL, 0)}
                        </TableCell>
                        <TableCell className="text-center">
                          {order.colorSizeMatrix.reduce((sum, r) => sum + r.XXXL, 0)}
                        </TableCell>
                        <TableCell className="text-center text-blue-600">{order.totalQuantity}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>

              {/* 价格信息 */}
              <TabsContent value="price">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="space-y-1">
                    <Label className="text-gray-600">单价</Label>
                    <div className="font-medium text-lg">{order.unitPrice} {order.currency === '人民币' ? '¥' : '$'}</div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-gray-600">金额</Label>
                    <div className="font-medium text-lg text-blue-600">
                      {order.amount.toFixed(2)} {order.currency === '人民币' ? '¥' : '$'}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-gray-600">币种</Label>
                    <div className="font-medium">{order.currency}</div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-gray-600">贸易条款</Label>
                    <div className="font-medium">{order.tradeTerms}</div>
                  </div>
                </div>
              </TabsContent>

              {/* 包装要求 */}
              <TabsContent value="packing">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <Label className="text-gray-600">装箱方式</Label>
                    <div className="font-medium">{order.packingRequirement.packingMethod}</div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-gray-600">PE袋尺寸</Label>
                    <div className="font-medium">{order.packingRequirement.peBagSize || '-'}</div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-gray-600">纸箱尺寸</Label>
                    <div className="font-medium">{order.packingRequirement.cartonSize || '-'}</div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-gray-600">每箱件数</Label>
                    <div className="font-medium">{order.packingRequirement.piecesPerCarton || '-'}</div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-gray-600">配码比例</Label>
                    <div className="font-medium">{order.packingRequirement.sizeRatio || '-'}</div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-gray-600">箱唛要求</Label>
                    <div className="font-medium">{order.packingRequirement.cartonLabelType}</div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-gray-600">贴纸/不干胶</Label>
                    <div className="font-medium">{order.packingRequirement.sticker || '-'}</div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-gray-600">条形码要求</Label>
                    <div className="font-medium">{order.packingRequirement.barcode || '-'}</div>
                  </div>
                </div>
                <div className="mt-4 flex gap-6">
                  <div className="flex items-center gap-2">
                    <span className={`w-4 h-4 rounded ${order.packingRequirement.moistureProof ? 'bg-blue-500' : 'bg-gray-300'}`}></span>
                    <span>防潮</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`w-4 h-4 rounded ${order.packingRequirement.desiccant ? 'bg-blue-500' : 'bg-gray-300'}`}></span>
                    <span>干燥剂</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`w-4 h-4 rounded ${order.packingRequirement.tissuePaper ? 'bg-blue-500' : 'bg-gray-300'}`}></span>
                    <span>拷贝纸</span>
                  </div>
                </div>
              </TabsContent>

              {/* 印绣花要求 */}
              <TabsContent value="print">
                {order.printEmbroidery.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">暂无印绣花要求</div>
                ) : (
                  <div className="space-y-4">
                    {order.printEmbroidery.map((item, index) => (
                      <div key={index} className="border rounded-lg p-4 bg-gray-50">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div className="space-y-1">
                            <Label className="text-gray-600">位置</Label>
                            <div className="font-medium">{item.position}</div>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-gray-600">工艺</Label>
                            <div className="font-medium">{item.type}</div>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-gray-600">颜色数</Label>
                            <div className="font-medium">{item.colorCount}</div>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-gray-600">尺寸</Label>
                            <div className="font-medium">{item.width}×{item.height} cm</div>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-gray-600">潘通色号</Label>
                            <div className="font-medium">{item.pantoneColor || '-'}</div>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-gray-600">牢度</Label>
                            <div className="font-medium">{item.fastness || '-'}</div>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-gray-600">左右对称</Label>
                            <div className="font-medium">{item.isSymmetric ? '是' : '否'}</div>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-gray-600">水洗要求</Label>
                            <div className="font-medium">{item.washRequirement || '-'}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* 洗水/尾部要求 */}
              <TabsContent value="wash">
                <div className="space-y-6">
                  {/* 洗水要求 */}
                  <div>
                    <h3 className="text-lg font-medium mb-4">洗水要求</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="space-y-1">
                        <Label className="text-gray-600">洗水类型</Label>
                        <div className="font-medium">{order.washRequirement.washType}</div>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-gray-600">颜色效果</Label>
                        <div className="font-medium">{order.washRequirement.colorEffect}</div>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-gray-600">缩率要求</Label>
                        <div className="font-medium">{order.washRequirement.shrinkageRate}</div>
                      </div>
                    </div>
                    <div className="mt-4">
                      <Label className="text-gray-600">环保要求</Label>
                      <div className="flex gap-4 mt-2">
                        {order.washRequirement.ecoRequirement.map((req, i) => (
                          <span key={i} className="px-3 py-1 bg-green-100 text-green-700 rounded">
                            {req}
                          </span>
                        ))}
                        {order.washRequirement.ecoRequirement.length === 0 && '-'}
                      </div>
                    </div>
                  </div>

                  {/* 尾部要求 */}
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-medium mb-4">尾部要求</h3>
                    <div className="flex gap-6 mb-4">
                      <div className="flex items-center gap-2">
                        <span className={`w-4 h-4 rounded ${order.tailRequirement.trimThread ? 'bg-blue-500' : 'bg-gray-300'}`}></span>
                        <span>剪线</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`w-4 h-4 rounded ${order.tailRequirement.ironing ? 'bg-blue-500' : 'bg-gray-300'}`}></span>
                        <span>整烫</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`w-4 h-4 rounded ${order.tailRequirement.inspection ? 'bg-blue-500' : 'bg-gray-300'}`}></span>
                        <span>查衫</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                      <div className="space-y-1">
                        <Label className="text-gray-600">备用扣数量</Label>
                        <div className="font-medium">{order.tailRequirement.spareButtons || '-'}</div>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-gray-600">备用线</Label>
                        <div className="font-medium">{order.tailRequirement.spareThread || '-'}</div>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-gray-600">挂牌</Label>
                        <div className="font-medium">{order.tailRequirement.hangTag || '-'}</div>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-gray-600">挂绳</Label>
                        <div className="font-medium">{order.tailRequirement.hangRope || '-'}</div>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-gray-600">折叠方式</Label>
                        <div className="font-medium">{order.tailRequirement.foldMethod || '-'}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </ScrollArea>

        {/* 底部按钮 */}
        <div className="flex justify-end gap-2 px-6 py-4 border-t bg-gray-50">
          <Button variant="outline" onClick={onClose}>
            关闭
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Label 组件
function Label({ className, children }: { className?: string; children: React.ReactNode }) {
  return <label className={`text-sm ${className}`}>{children}</label>;
}
