'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Calculator, Search, Download, TrendingUp, TrendingDown, DollarSign, Package, Users } from 'lucide-react';
import { getOrders, type Order } from '@/types/order';
import { getBOMs, type BOM } from '@/types/bom';
import { getWorkReports } from '@/types/workshop';

interface CostBreakdown {
  orderId: string;
  orderNo: string;
  styleNo: string;
  productName: string;
  customerName: string;
  quantity: number;
  unitPrice: number;
  salesAmount: number;
  
  // 材料成本
  fabricCost: number;
  accessoryCost: number;
  printEmbroideryCost: number;
  washCost: number;
  tailCost: number;
  packagingCost: number;
  materialLoss: number;
  totalMaterialCost: number;
  
  // 人工成本
  workshopLaborCost: number;
  tailLaborCost: number;
  totalLaborCost: number;
  
  // 制造费用
  utilityCost: number;
  depreciationCost: number;
  rentCost: number;
  managementCost: number;
  totalOverheadCost: number;
  
  // 汇总
  totalCost: number;
  unitCost: number;
  grossProfit: number;
  grossProfitMargin: number;
}

export default function CostPage() {
  const router = useRouter();
  const [costs, setCosts] = useState<CostBreakdown[]>([]);
  const [searchText, setSearchText] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<CostBreakdown | null>(null);

  useEffect(() => {
    calculateCosts();
  }, []);

  const calculateCosts = () => {
    const orders = getOrders();
    const boms = getBOMs();
    const workReports = getWorkReports();

    const costData: CostBreakdown[] = orders.map(order => {
      const bom = boms.find(b => b.orderNo === order.orderNo);
      const reports = workReports.filter(r => r.orderNo === order.orderNo);
      
      // 模拟成本计算
      const quantity = order.totalQuantity || 100;
      const unitPrice = order.unitPrice || 50;
      const salesAmount = quantity * unitPrice;
      
      // 材料成本（基于BOM）
      const fabricCost = bom ? quantity * 15 : quantity * 12;
      const accessoryCost = bom ? quantity * 3 : quantity * 2;
      const printEmbroideryCost = bom ? quantity * 2 : 0;
      const washCost = bom ? quantity * 1.5 : 0;
      const tailCost = quantity * 0.5;
      const packagingCost = quantity * 1;
      const materialLoss = (fabricCost + accessoryCost) * 0.03; // 3%损耗
      const totalMaterialCost = fabricCost + accessoryCost + printEmbroideryCost + washCost + tailCost + packagingCost + materialLoss;
      
      // 人工成本（基于报工）
      const workshopLaborCost = reports.reduce((sum, r) => sum + r.pieceWage, 0) || quantity * 5;
      const tailLaborCost = quantity * 2;
      const totalLaborCost = workshopLaborCost + tailLaborCost;
      
      // 制造费用（固定分摊）
      const utilityCost = quantity * 0.5;
      const depreciationCost = quantity * 0.3;
      const rentCost = quantity * 0.2;
      const managementCost = quantity * 0.5;
      const totalOverheadCost = utilityCost + depreciationCost + rentCost + managementCost;
      
      // 汇总
      const totalCost = totalMaterialCost + totalLaborCost + totalOverheadCost;
      const unitCost = totalCost / quantity;
      const grossProfit = salesAmount - totalCost;
      const grossProfitMargin = salesAmount > 0 ? (grossProfit / salesAmount * 100) : 0;

      return {
        orderId: order.id,
        orderNo: order.orderNo,
        styleNo: order.styleNo,
        productName: order.productName,
        customerName: order.customerName,
        quantity,
        unitPrice,
        salesAmount,
        fabricCost,
        accessoryCost,
        printEmbroideryCost,
        washCost,
        tailCost,
        packagingCost,
        materialLoss,
        totalMaterialCost,
        workshopLaborCost,
        tailLaborCost,
        totalLaborCost,
        utilityCost,
        depreciationCost,
        rentCost,
        managementCost,
        totalOverheadCost,
        totalCost,
        unitCost,
        grossProfit,
        grossProfitMargin,
      };
    });

    setCosts(costData);
  };

  const handleExport = () => {
    const headers = [
      '订单号', '款号', '产品名称', '数量', '销售单价', '销售金额',
      '面料成本', '辅料成本', '印绣成本', '洗水成本', '尾部成本', '包装成本', '损耗',
      '材料总成本', '车间人工', '尾部人工', '人工总成本',
      '水电', '折旧', '房租', '管理费', '制造费用',
      '总成本', '单件成本', '毛利', '毛利率'
    ];
    const rows = costs.map(c => [
      c.orderNo, c.styleNo, c.productName, c.quantity.toString(), c.unitPrice.toFixed(2), c.salesAmount.toFixed(2),
      c.fabricCost.toFixed(2), c.accessoryCost.toFixed(2), c.printEmbroideryCost.toFixed(2),
      c.washCost.toFixed(2), c.tailCost.toFixed(2), c.packagingCost.toFixed(2), c.materialLoss.toFixed(2),
      c.totalMaterialCost.toFixed(2), c.workshopLaborCost.toFixed(2), c.tailLaborCost.toFixed(2),
      c.totalLaborCost.toFixed(2), c.utilityCost.toFixed(2), c.depreciationCost.toFixed(2),
      c.rentCost.toFixed(2), c.managementCost.toFixed(2), c.totalOverheadCost.toFixed(2),
      c.totalCost.toFixed(2), c.unitCost.toFixed(2), c.grossProfit.toFixed(2), c.grossProfitMargin.toFixed(2) + '%'
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `订单成本核算_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredCosts = costs.filter(c => 
    !searchText || c.orderNo.includes(searchText) || c.productName.includes(searchText)
  );

  const getStats = () => {
    const totalSales = costs.reduce((sum, c) => sum + c.salesAmount, 0);
    const totalCost = costs.reduce((sum, c) => sum + c.totalCost, 0);
    const totalProfit = costs.reduce((sum, c) => sum + c.grossProfit, 0);
    const avgMargin = costs.length > 0 ? costs.reduce((sum, c) => sum + c.grossProfitMargin, 0) / costs.length : 0;
    return { totalSales, totalCost, totalProfit, avgMargin };
  };

  const stats = getStats();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Calculator className="w-6 h-6" />
              订单成本核算
            </h1>
            <p className="text-muted-foreground mt-1">计算订单材料、人工、制造费用成本</p>
          </div>
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            导出报表
          </Button>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">销售总额</p>
                  <p className="text-2xl font-bold text-foreground">¥{stats.totalSales.toLocaleString()}</p>
                </div>
                <DollarSign className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">总成本</p>
                  <p className="text-2xl font-bold text-orange-600">¥{stats.totalCost.toLocaleString()}</p>
                </div>
                <Calculator className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">毛利总额</p>
                  <p className="text-2xl font-bold text-green-600">¥{stats.totalProfit.toLocaleString()}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">平均毛利率</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.avgMargin.toFixed(1)}%</p>
                </div>
                <TrendingUp className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="搜索订单号/产品名称..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="flex-1"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>成本明细</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>订单号</TableHead>
                    <TableHead>产品名称</TableHead>
                    <TableHead>数量</TableHead>
                    <TableHead>销售金额</TableHead>
                    <TableHead>材料成本</TableHead>
                    <TableHead>人工成本</TableHead>
                    <TableHead>制造费用</TableHead>
                    <TableHead>总成本</TableHead>
                    <TableHead>单件成本</TableHead>
                    <TableHead>毛利</TableHead>
                    <TableHead>毛利率</TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCosts.map(cost => (
                    <TableRow key={cost.orderId}>
                      <TableCell className="font-mono">{cost.orderNo}</TableCell>
                      <TableCell>{cost.productName}</TableCell>
                      <TableCell>{cost.quantity}</TableCell>
                      <TableCell>¥{cost.salesAmount.toLocaleString()}</TableCell>
                      <TableCell>¥{cost.totalMaterialCost.toLocaleString()}</TableCell>
                      <TableCell>¥{cost.totalLaborCost.toLocaleString()}</TableCell>
                      <TableCell>¥{cost.totalOverheadCost.toLocaleString()}</TableCell>
                      <TableCell className="font-medium">¥{cost.totalCost.toLocaleString()}</TableCell>
                      <TableCell>¥{cost.unitCost.toFixed(2)}</TableCell>
                      <TableCell className={cost.grossProfit >= 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                        ¥{cost.grossProfit.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant={cost.grossProfitMargin >= 20 ? 'default' : cost.grossProfitMargin >= 10 ? 'secondary' : 'destructive'}>
                          {cost.grossProfitMargin.toFixed(1)}%
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline" onClick={() => setSelectedOrder(cost)}>
                          详情
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* 成本详情弹窗 */}
        {selectedOrder && (
          <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>成本明细 - {selectedOrder.orderNo}</DialogTitle>
              </DialogHeader>
              <div className="space-y-6 py-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">订单号</p>
                    <p className="font-bold">{selectedOrder.orderNo}</p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">产品名称</p>
                    <p className="font-bold">{selectedOrder.productName}</p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">数量</p>
                    <p className="font-bold">{selectedOrder.quantity}</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Package className="w-5 h-5" /> 材料成本
                  </h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>项目</TableHead>
                        <TableHead className="text-right">金额</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow><TableCell>面料成本</TableCell><TableCell className="text-right">¥{selectedOrder.fabricCost.toFixed(2)}</TableCell></TableRow>
                      <TableRow><TableCell>辅料成本</TableCell><TableCell className="text-right">¥{selectedOrder.accessoryCost.toFixed(2)}</TableCell></TableRow>
                      <TableRow><TableCell>印绣花成本</TableCell><TableCell className="text-right">¥{selectedOrder.printEmbroideryCost.toFixed(2)}</TableCell></TableRow>
                      <TableRow><TableCell>洗水成本</TableCell><TableCell className="text-right">¥{selectedOrder.washCost.toFixed(2)}</TableCell></TableRow>
                      <TableRow><TableCell>尾部成本</TableCell><TableCell className="text-right">¥{selectedOrder.tailCost.toFixed(2)}</TableCell></TableRow>
                      <TableRow><TableCell>包装成本</TableCell><TableCell className="text-right">¥{selectedOrder.packagingCost.toFixed(2)}</TableCell></TableRow>
                      <TableRow><TableCell>损耗</TableCell><TableCell className="text-right">¥{selectedOrder.materialLoss.toFixed(2)}</TableCell></TableRow>
                      <TableRow className="font-bold bg-muted"><TableCell>材料总成本</TableCell><TableCell className="text-right">¥{selectedOrder.totalMaterialCost.toFixed(2)}</TableCell></TableRow>
                    </TableBody>
                  </Table>
                </div>

                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Users className="w-5 h-5" /> 人工成本
                  </h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>项目</TableHead>
                        <TableHead className="text-right">金额</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow><TableCell>车间人工</TableCell><TableCell className="text-right">¥{selectedOrder.workshopLaborCost.toFixed(2)}</TableCell></TableRow>
                      <TableRow><TableCell>尾部人工</TableCell><TableCell className="text-right">¥{selectedOrder.tailLaborCost.toFixed(2)}</TableCell></TableRow>
                      <TableRow className="font-bold bg-muted"><TableCell>人工总成本</TableCell><TableCell className="text-right">¥{selectedOrder.totalLaborCost.toFixed(2)}</TableCell></TableRow>
                    </TableBody>
                  </Table>
                </div>

                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Calculator className="w-5 h-5" /> 制造费用
                  </h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>项目</TableHead>
                        <TableHead className="text-right">金额</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow><TableCell>水电费</TableCell><TableCell className="text-right">¥{selectedOrder.utilityCost.toFixed(2)}</TableCell></TableRow>
                      <TableRow><TableCell>折旧</TableCell><TableCell className="text-right">¥{selectedOrder.depreciationCost.toFixed(2)}</TableCell></TableRow>
                      <TableRow><TableCell>房租</TableCell><TableCell className="text-right">¥{selectedOrder.rentCost.toFixed(2)}</TableCell></TableRow>
                      <TableRow><TableCell>管理费</TableCell><TableCell className="text-right">¥{selectedOrder.managementCost.toFixed(2)}</TableCell></TableRow>
                      <TableRow className="font-bold bg-muted"><TableCell>制造费用合计</TableCell><TableCell className="text-right">¥{selectedOrder.totalOverheadCost.toFixed(2)}</TableCell></TableRow>
                    </TableBody>
                  </Table>
                </div>

                <div className="p-4 bg-primary/10 rounded-lg">
                  <div className="grid grid-cols-4 gap-4 text-center">
                    <div>
                      <p className="text-sm text-muted-foreground">销售金额</p>
                      <p className="text-xl font-bold">¥{selectedOrder.salesAmount.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">总成本</p>
                      <p className="text-xl font-bold text-orange-600">¥{selectedOrder.totalCost.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">毛利</p>
                      <p className="text-xl font-bold text-green-600">¥{selectedOrder.grossProfit.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">毛利率</p>
                      <p className="text-xl font-bold text-blue-600">{selectedOrder.grossProfitMargin.toFixed(1)}%</p>
                    </div>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </DashboardLayout>
  );
}

import { Dialog, DialogHeader, DialogContent, DialogTitle } from '@/components/ui/dialog';
