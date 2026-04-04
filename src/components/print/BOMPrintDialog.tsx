'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Printer, X } from 'lucide-react';
import type { Order, ColorSizeMatrix } from '@/types/order';

interface BOMPrintDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: Order | null;
}

// 计算各尺码合计
const calculateTotals = (matrix: ColorSizeMatrix[] | undefined) => {
  const totals = {
    S: 0, M: 0, L: 0, XL: 0, XXL: 0, XXXL: 0, total: 0
  };
  if (!matrix || !Array.isArray(matrix)) return totals;
  matrix.forEach(row => {
    totals.S += row.S || 0;
    totals.M += row.M || 0;
    totals.L += row.L || 0;
    totals.XL += row.XL || 0;
    totals.XXL += row.XXL || 0;
    totals.XXXL += row.XXXL || 0;
    totals.total += row.subtotal || 0;
  });
  return totals;
};

export default function BOMPrintDialog({ open, onOpenChange, order }: BOMPrintDialogProps) {
  const [isPrinting, setIsPrinting] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 添加打印样式 - 使用更高的优先级
    const style = document.createElement('style');
    style.id = 'bom-print-styles';
    style.textContent = `
      @media print {
        @page {
          size: A4;
          margin: 10mm;
        }
        
        /* 隐藏所有非打印内容 */
        body > *:not(.print-container) {
          display: none !important;
        }
        
        /* 打印容器显示 */
        .print-container {
          display: block !important;
          position: absolute !important;
          left: 0 !important;
          top: 0 !important;
          width: 100% !important;
          background: white !important;
          z-index: 9999 !important;
        }
        
        /* 打印内容样式 */
        .print-content {
          width: 100% !important;
          padding: 0 !important;
          margin: 0 !important;
        }
        
        /* 隐藏非打印元素 */
        .no-print {
          display: none !important;
        }
        
        /* 分页 */
        .print-break {
          page-break-before: always;
        }
        
        /* 确保表格正确打印 */
        table {
          width: 100% !important;
          border-collapse: collapse !important;
        }
        
        th, td {
          border: 1px solid #000 !important;
          padding: 4px 8px !important;
        }
      }
    `;
    document.head.appendChild(style);

    return () => {
      const existingStyle = document.getElementById('bom-print-styles');
      if (existingStyle) {
        existingStyle.remove();
      }
    };
  }, []);

  const handlePrint = () => {
    if (!printRef.current) return;
    
    setIsPrinting(true);
    
    // 创建打印容器
    const printContainer = document.createElement('div');
    printContainer.className = 'print-container';
    printContainer.innerHTML = printRef.current.innerHTML;
    document.body.appendChild(printContainer);
    
    // 延迟打印，确保内容已渲染
    setTimeout(() => {
      window.print();
      
      // 打印完成后移除打印容器
      setTimeout(() => {
        document.body.removeChild(printContainer);
        setIsPrinting(false);
      }, 100);
    }, 100);
  };

  if (!order) return null;

  const totals = calculateTotals(order.colorSizeMatrix);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="no-print">
          <DialogTitle className="flex items-center justify-between">
            <span>生产制单 - {order.orderNo}</span>
            <div className="flex gap-2">
              <Button onClick={handlePrint} disabled={isPrinting}>
                <Printer className="w-4 h-4 mr-2" />
                {isPrinting ? '打印中...' : '打印'}
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        {/* 预览区域 */}
        <div className="bg-gray-100 p-4 rounded-lg">
          <div ref={printRef} className="print-content bg-white p-6 text-sm shadow-sm">
            {/* 标题 */}
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold">生产制单</h1>
              <p className="text-gray-500 mt-1">Production Order Sheet</p>
            </div>

            {/* 订单基本信息 */}
            <div className="grid grid-cols-4 gap-4 mb-6 border-b pb-4">
              <div>
                <label className="text-gray-500 text-xs">订单号</label>
                <p className="font-medium">{order.orderNo}</p>
              </div>
              <div>
                <label className="text-gray-500 text-xs">款号</label>
                <p className="font-medium">{order.styleNo}</p>
              </div>
              <div>
                <label className="text-gray-500 text-xs">产品名称</label>
                <p className="font-medium">{order.productName}</p>
              </div>
              <div>
                <label className="text-gray-500 text-xs">品牌</label>
                <p className="font-medium">{order.brand || '-'}</p>
              </div>
              <div>
                <label className="text-gray-500 text-xs">客户名称</label>
                <p className="font-medium">{order.customerName}</p>
              </div>
              <div>
                <label className="text-gray-500 text-xs">客户款号</label>
                <p className="font-medium">{order.customerModel || '-'}</p>
              </div>
              <div>
                <label className="text-gray-500 text-xs">下单日期</label>
                <p className="font-medium">{order.orderDate}</p>
              </div>
              <div>
                <label className="text-gray-500 text-xs">交货日期</label>
                <p className="font-medium text-red-600">{order.deliveryDate}</p>
              </div>
            </div>

            {/* 色码尺寸表 */}
            <div className="mb-6">
              <h2 className="text-lg font-bold mb-3 border-b pb-2">色码配比表</h2>
              <table className="w-full border-collapse border text-center">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border p-2">颜色</th>
                    <th className="border p-2">S</th>
                    <th className="border p-2">M</th>
                    <th className="border p-2">L</th>
                    <th className="border p-2">XL</th>
                    <th className="border p-2">XXL</th>
                    <th className="border p-2">XXXL</th>
                    <th className="border p-2 bg-yellow-50">小计</th>
                  </tr>
                </thead>
                <tbody>
                  {order.colorSizeMatrix?.map((row, idx) => (
                    <tr key={idx}>
                      <td className="border p-2 font-medium">{row.colorName}</td>
                      <td className="border p-2">{row.S || '-'}</td>
                      <td className="border p-2">{row.M || '-'}</td>
                      <td className="border p-2">{row.L || '-'}</td>
                      <td className="border p-2">{row.XL || '-'}</td>
                      <td className="border p-2">{row.XXL || '-'}</td>
                      <td className="border p-2">{row.XXXL || '-'}</td>
                      <td className="border p-2 font-bold bg-yellow-50">{row.subtotal}</td>
                    </tr>
                  ))}
                  <tr className="bg-gray-50 font-bold">
                    <td className="border p-2">合计</td>
                    <td className="border p-2">{totals.S || '-'}</td>
                    <td className="border p-2">{totals.M || '-'}</td>
                    <td className="border p-2">{totals.L || '-'}</td>
                    <td className="border p-2">{totals.XL || '-'}</td>
                    <td className="border p-2">{totals.XXL || '-'}</td>
                    <td className="border p-2">{totals.XXXL || '-'}</td>
                    <td className="border p-2 text-red-600 bg-yellow-50">{order.totalQuantity}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* 印绣花要求 */}
            {order.printEmbroidery && order.printEmbroidery.length > 0 && (
              <div className="mb-6">
                <h2 className="text-lg font-bold mb-3 border-b pb-2">印绣花要求</h2>
                <table className="w-full border-collapse border text-sm">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border p-2">位置</th>
                      <th className="border p-2">工艺</th>
                      <th className="border p-2">尺寸(宽×高)</th>
                      <th className="border p-2">色数</th>
                      <th className="border p-2">Pantone色号</th>
                      <th className="border p-2">对称</th>
                      <th className="border p-2">牢度</th>
                      <th className="border p-2">洗水要求</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.printEmbroidery.map((item, idx) => (
                      <tr key={idx}>
                        <td className="border p-2">{item.position}</td>
                        <td className="border p-2">{item.type}</td>
                        <td className="border p-2">{item.width}×{item.height}cm</td>
                        <td className="border p-2">{item.colorCount}色</td>
                        <td className="border p-2">{item.pantoneColor || '-'}</td>
                        <td className="border p-2">{item.isSymmetric ? '是' : '否'}</td>
                        <td className="border p-2">{item.fastness || '-'}</td>
                        <td className="border p-2">{item.washRequirement || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* 洗水要求 */}
            {order.washRequirement && (
              <div className="mb-6">
                <h2 className="text-lg font-bold mb-3 border-b pb-2">洗水要求</h2>
                <div className="grid grid-cols-4 gap-4 border p-3">
                  <div>
                    <span className="text-gray-500 text-xs">洗水类型：</span>
                    <span className="font-medium ml-1">{order.washRequirement.washType}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 text-xs">颜色效果：</span>
                    <span className="font-medium ml-1">{order.washRequirement.colorEffect}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 text-xs">缩水率：</span>
                    <span className="font-medium ml-1">{order.washRequirement.shrinkageRate}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 text-xs">环保要求：</span>
                    <span className="font-medium ml-1">{order.washRequirement.ecoRequirement?.join('、') || '-'}</span>
                  </div>
                </div>
              </div>
            )}

            {/* 包装要求 */}
            {order.packingRequirement && (
              <div className="mb-6">
                <h2 className="text-lg font-bold mb-3 border-b pb-2">包装要求</h2>
                <div className="grid grid-cols-4 gap-3 border p-3 text-sm">
                  <div>
                    <span className="text-gray-500 text-xs">装箱方式：</span>
                    <span className="font-medium ml-1">{order.packingRequirement.packingMethod}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 text-xs">PE袋尺寸：</span>
                    <span className="font-medium ml-1">{order.packingRequirement.peBagSize}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 text-xs">外箱尺寸：</span>
                    <span className="font-medium ml-1">{order.packingRequirement.cartonSize}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 text-xs">每箱件数：</span>
                    <span className="font-medium ml-1">{order.packingRequirement.piecesPerCarton}件</span>
                  </div>
                  <div>
                    <span className="text-gray-500 text-xs">装箱配码：</span>
                    <span className="font-medium ml-1">{order.packingRequirement.sizeRatio}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 text-xs">箱唛类型：</span>
                    <span className="font-medium ml-1">{order.packingRequirement.cartonLabelType}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 text-xs">贴纸：</span>
                    <span className="font-medium ml-1">{order.packingRequirement.sticker || '-'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 text-xs">条码：</span>
                    <span className="font-medium ml-1">{order.packingRequirement.barcode || '-'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 text-xs">防潮处理：</span>
                    <span className="font-medium ml-1">
                      {[
                        order.packingRequirement.moistureProof && '防潮',
                        order.packingRequirement.desiccant && '干燥剂',
                        order.packingRequirement.tissuePaper && '拷贝纸'
                      ].filter(Boolean).join('、') || '无'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* 车工要求（缝制工艺要求） */}
            {order.sewingRequirement && (
              <div className="mb-6">
                <h2 className="text-lg font-bold mb-3 border-b pb-2">车工要求</h2>
                <div className="grid grid-cols-4 gap-3 border p-3 text-sm">
                  <div>
                    <span className="text-gray-500 text-xs">线迹密度：</span>
                    <span className="font-medium ml-1">{order.sewingRequirement.stitchDensity || '-'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 text-xs">线型：</span>
                    <span className="font-medium ml-1">{order.sewingRequirement.threadType || '-'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 text-xs">缝纫线颜色：</span>
                    <span className="font-medium ml-1">{order.sewingRequirement.threadColor || '-'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 text-xs">拷克要求：</span>
                    <span className="font-medium ml-1">{order.sewingRequirement.overlockType || '-'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 text-xs">打枣位置：</span>
                    <span className="font-medium ml-1">{order.sewingRequirement.bartackPosition || '-'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 text-xs">止口要求：</span>
                    <span className="font-medium ml-1">{order.sewingRequirement.seamAllowance || '-'}</span>
                  </div>
                  {order.sewingRequirement.specialProcess && order.sewingRequirement.specialProcess.length > 0 && (
                    <div className="col-span-2">
                      <span className="text-gray-500 text-xs">特殊工艺：</span>
                      <span className="font-medium ml-1">{order.sewingRequirement.specialProcess.join('、')}</span>
                    </div>
                  )}
                  {order.sewingRequirement.otherNotes && (
                    <div className="col-span-4">
                      <span className="text-gray-500 text-xs">其他说明：</span>
                      <span className="font-medium ml-1">{order.sewingRequirement.otherNotes}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 尾部要求 */}
            {order.tailRequirement && (
              <div className="mb-6">
                <h2 className="text-lg font-bold mb-3 border-b pb-2">尾部要求</h2>
                <div className="grid grid-cols-4 gap-3 border p-3 text-sm">
                  <div>
                    <span className="text-gray-500 text-xs">剪线头：</span>
                    <span className="font-medium ml-1">{order.tailRequirement.trimThread ? '需要' : '不需要'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 text-xs">整烫：</span>
                    <span className="font-medium ml-1">{order.tailRequirement.ironing ? '需要' : '不需要'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 text-xs">查衫：</span>
                    <span className="font-medium ml-1">{order.tailRequirement.inspection ? '需要' : '不需要'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 text-xs">备用扣：</span>
                    <span className="font-medium ml-1">{order.tailRequirement.spareButtons || 0}粒</span>
                  </div>
                  <div>
                    <span className="text-gray-500 text-xs">备用线：</span>
                    <span className="font-medium ml-1">{order.tailRequirement.spareThread || '-'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 text-xs">吊牌：</span>
                    <span className="font-medium ml-1">{order.tailRequirement.hangTag || '-'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 text-xs">挂绳：</span>
                    <span className="font-medium ml-1">{order.tailRequirement.hangRope || '-'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 text-xs">折叠方式：</span>
                    <span className="font-medium ml-1">{order.tailRequirement.foldMethod || '-'}</span>
                  </div>
                </div>
              </div>
            )}

            {/* 备注 */}
            {order.remark && (
              <div className="mb-6">
                <h2 className="text-lg font-bold mb-3 border-b pb-2">备注</h2>
                <div className="border p-3 whitespace-pre-wrap">{order.remark}</div>
              </div>
            )}

            {/* 签名区 */}
            <div className="mt-8 pt-4 border-t">
              <div className="grid grid-cols-4 gap-8 text-sm">
                <div>
                  <span className="text-gray-500">制单人：</span>
                  <span className="border-b border-gray-300 inline-block w-24 ml-1">&nbsp;</span>
                </div>
                <div>
                  <span className="text-gray-500">审核人：</span>
                  <span className="border-b border-gray-300 inline-block w-24 ml-1">&nbsp;</span>
                </div>
                <div>
                  <span className="text-gray-500">生产主管：</span>
                  <span className="border-b border-gray-300 inline-block w-24 ml-1">&nbsp;</span>
                </div>
                <div>
                  <span className="text-gray-500">日期：</span>
                  <span className="border-b border-gray-300 inline-block w-24 ml-1">&nbsp;</span>
                </div>
              </div>
            </div>

            {/* 打印时间 */}
            <div className="mt-4 text-right text-xs text-gray-400">
              打印时间：{new Date().toLocaleString('zh-CN')}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
