'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Calculator, Search, Download, AlertTriangle, Package, CheckCircle, ArrowRight } from 'lucide-react';
import { getOrders } from '@/types/order';
import { getBOMs } from '@/types/bom';
import { getStockItems } from '@/types/stock';

interface MRPItem {
  id: string;
  orderNo: string;
  styleNo: string;
  materialCode: string;
  materialName: string;
  spec: string;
  unit: string;
  requiredQuantity: number;   // 需求量
  inventoryQuantity: number;   // 库存量
  inTransitQuantity: number;   // 在途量
  availableQuantity: number;   // 可用量
  shortageQuantity: number;    // 缺料量
  safetyStock: number;         // 安全库存
  suggestedPurchase: number;   // 建议采购量
  status: '充足' | '预警' | '缺料';
}

export default function MRPPage() {
  const router = useRouter();
  const [mrpItems, setMRPItems] = useState<MRPItem[]>([]);
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<string>('all');

  useEffect(() => {
    calculateMRP();
  }, [selectedOrder]);

  const calculateMRP = () => {
    const orders = getOrders();
    const boms = getBOMs();
    const stocks = getStockItems();

    const items: MRPItem[] = [];

    // 遍历订单计算物料需求
    orders.forEach(order => {
      if (selectedOrder !== 'all' && order.orderNo !== selectedOrder) return;

      const bom = boms.find(b => b.orderNo === order.orderNo);
      if (!bom) return;

      const orderQuantity = order.totalQuantity || 100;

      // 面料需求
      if (bom.fabrics && bom.fabrics.length > 0) {
        bom.fabrics.forEach((fabric, idx) => {
          const fabricStock = stocks.find(s => s.materialCode === fabric.materialCode && s.type === '面料');
          const required = orderQuantity * (fabric.standardConsumption || 0.5);
          const inventory = fabricStock?.quantity || 0;
          const available = inventory - (fabricStock?.safetyStock || 0);
          const shortage = Math.max(0, required - available);

          items.push({
            id: `${order.orderNo}-${fabric.materialCode || `FAB${idx}`}`,
            orderNo: order.orderNo,
            styleNo: order.styleNo,
            materialCode: fabric.materialCode || `FAB${idx}`,
            materialName: fabric.materialName || '面料',
            spec: fabric.specification || '',
            unit: fabric.unit || '米',
            requiredQuantity: required,
            inventoryQuantity: inventory,
            inTransitQuantity: 0,
            availableQuantity: available,
            shortageQuantity: shortage,
            safetyStock: fabricStock?.safetyStock || 0,
            suggestedPurchase: shortage > 0 ? shortage * 1.1 : 0,
            status: shortage > 0 ? '缺料' : available < required * 0.2 ? '预警' : '充足',
          });
        });
      } else {
        // 默认面料
        const fabricStock = stocks.find(s => s.materialCode === 'ML001' && s.type === '面料');
        const required = orderQuantity * 0.5;
        const inventory = fabricStock?.quantity || 0;
        const available = inventory - (fabricStock?.safetyStock || 0);
        const shortage = Math.max(0, required - available);

        items.push({
          id: `${order.orderNo}-ML001`,
          orderNo: order.orderNo,
          styleNo: order.styleNo,
          materialCode: 'ML001',
          materialName: '主面料',
          spec: '',
          unit: '米',
          requiredQuantity: required,
          inventoryQuantity: inventory,
          inTransitQuantity: 0,
          availableQuantity: available,
          shortageQuantity: shortage,
          safetyStock: fabricStock?.safetyStock || 0,
          suggestedPurchase: shortage > 0 ? shortage * 1.1 : 0,
          status: shortage > 0 ? '缺料' : available < required * 0.2 ? '预警' : '充足',
        });
      }

      // 辅料需求
      if (bom.accessories && bom.accessories.length > 0) {
        bom.accessories.forEach((acc, idx) => {
          const accStock = stocks.find(s => s.materialCode === acc.materialCode && s.type === '辅料');
          const required = orderQuantity * (acc.standardConsumption || 1);
          const inventory = accStock?.quantity || 0;
          const available = inventory - (accStock?.safetyStock || 0);
          const shortage = Math.max(0, required - available);

          items.push({
            id: `${order.orderNo}-${acc.materialCode || `ACC${idx}`}`,
            orderNo: order.orderNo,
            styleNo: order.styleNo,
            materialCode: acc.materialCode || `ACC${idx}`,
            materialName: acc.materialName || '辅料',
            spec: acc.specification || '',
            unit: acc.unit || '个',
            requiredQuantity: required,
            inventoryQuantity: inventory,
            inTransitQuantity: 0,
            availableQuantity: available,
            shortageQuantity: shortage,
            safetyStock: accStock?.safetyStock || 0,
            suggestedPurchase: shortage > 0 ? shortage * 1.1 : 0,
            status: shortage > 0 ? '缺料' : available < required * 0.2 ? '预警' : '充足',
          });
        });
      } else {
        // 默认辅料：纽扣
        const buttonStock = stocks.find(s => s.materialCode === 'FJ001' && s.type === '辅料');
        const buttonRequired = orderQuantity * 6;
        const buttonInventory = buttonStock?.quantity || 0;
        const buttonAvailable = buttonInventory - (buttonStock?.safetyStock || 0);
        const buttonShortage = Math.max(0, buttonRequired - buttonAvailable);

        items.push({
          id: `${order.orderNo}-FJ001`,
          orderNo: order.orderNo,
          styleNo: order.styleNo,
          materialCode: 'FJ001',
          materialName: '纽扣',
          spec: '标准',
          unit: '粒',
          requiredQuantity: buttonRequired,
          inventoryQuantity: buttonInventory,
          inTransitQuantity: 0,
          availableQuantity: buttonAvailable,
          shortageQuantity: buttonShortage,
          safetyStock: buttonStock?.safetyStock || 0,
          suggestedPurchase: buttonShortage > 0 ? buttonShortage * 1.1 : 0,
          status: buttonShortage > 0 ? '缺料' : buttonAvailable < buttonRequired * 0.2 ? '预警' : '充足',
        });

        // 默认辅料：拉链
        const zipperStock = stocks.find(s => s.materialCode === 'FJ002' && s.type === '辅料');
        const zipperRequired = orderQuantity * 1;
        const zipperInventory = zipperStock?.quantity || 0;
        const zipperAvailable = zipperInventory - (zipperStock?.safetyStock || 0);
        const zipperShortage = Math.max(0, zipperRequired - zipperAvailable);

        items.push({
          id: `${order.orderNo}-FJ002`,
          orderNo: order.orderNo,
          styleNo: order.styleNo,
          materialCode: 'FJ002',
          materialName: '拉链',
          spec: '标准',
          unit: '条',
          requiredQuantity: zipperRequired,
          inventoryQuantity: zipperInventory,
          inTransitQuantity: 0,
          availableQuantity: zipperAvailable,
          shortageQuantity: zipperShortage,
          safetyStock: zipperStock?.safetyStock || 0,
          suggestedPurchase: zipperShortage > 0 ? zipperShortage * 1.1 : 0,
          status: zipperShortage > 0 ? '缺料' : zipperAvailable < zipperRequired * 0.2 ? '预警' : '充足',
        });
      }
    });

    setMRPItems(items);
  };

  const handleExport = () => {
    const headers = ['订单号', '款号', '物料编码', '物料名称', '规格', '单位', '需求量', '库存量', '在途量', '可用量', '缺料量', '安全库存', '建议采购', '状态'];
    const rows = mrpItems.map(i => [
      i.orderNo, i.styleNo, i.materialCode, i.materialName, i.spec, i.unit,
      i.requiredQuantity.toFixed(2), i.inventoryQuantity.toFixed(2), i.inTransitQuantity.toFixed(2),
      i.availableQuantity.toFixed(2), i.shortageQuantity.toFixed(2), i.safetyStock.toFixed(2),
      i.suggestedPurchase.toFixed(2), i.status
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MRP物料需求_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleGeneratePurchase = () => {
    const shortageItems = mrpItems.filter(i => i.shortageQuantity > 0);
    if (shortageItems.length === 0) {
      alert('当前无缺料物料，无需生成采购申请');
      return;
    }

    // 生成采购申请
    const requests = shortageItems.map((item, idx) => ({
      id: Date.now().toString() + idx,
      requestNo: `PR${new Date().toISOString().slice(0, 10).replace(/-/g, '')}${(idx + 1).toString().padStart(3, '0')}`,
      materialCode: item.materialCode,
      materialName: item.materialName,
      spec: item.spec,
      unit: item.unit,
      requestQuantity: Math.ceil(item.suggestedPurchase),
      approvedQuantity: 0,
      supplierName: '待定',
      estimatedPrice: 0,
      status: '待审核' as const,
      remark: `MRP自动生成 - 订单${item.orderNo}`,
      createdAt: new Date().toLocaleString('zh-CN'),
    }));

    const existingRequests = JSON.parse(localStorage.getItem('erp_purchase_requests') || '[]');
    localStorage.setItem('erp_purchase_requests', JSON.stringify([...requests, ...existingRequests]));

    alert(`已生成 ${shortageItems.length} 条采购申请单`);
    router.push('/dashboard/purchase');
  };

  const filteredItems = mrpItems.filter(i => {
    if (searchText && !i.materialName.includes(searchText) && !i.materialCode.includes(searchText)) return false;
    if (filterStatus !== 'all' && i.status !== filterStatus) return false;
    return true;
  });

  const orders = getOrders();

  const getStats = () => ({
    total: mrpItems.length,
    sufficient: mrpItems.filter(i => i.status === '充足').length,
    warning: mrpItems.filter(i => i.status === '预警').length,
    shortage: mrpItems.filter(i => i.status === '缺料').length,
    totalShortage: mrpItems.reduce((sum, i) => sum + i.shortageQuantity, 0),
  });

  const stats = getStats();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Calculator className="w-6 h-6" />
              MRP物料需求计划
            </h1>
            <p className="text-muted-foreground mt-1">根据订单+BOM+库存自动计算物料需求</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              导出
            </Button>
            <Button onClick={handleGeneratePurchase}>
              <Package className="w-4 h-4 mr-2" />
              生成采购申请
            </Button>
          </div>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
                  <p className="text-sm text-muted-foreground">库存充足</p>
                  <p className="text-2xl font-bold text-green-600">{stats.sufficient}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">库存预警</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.warning}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">缺料</p>
                  <p className="text-2xl font-bold text-red-600">{stats.shortage}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">缺料总量</p>
                  <p className="text-2xl font-bold text-red-600">{stats.totalShortage.toFixed(0)}</p>
                </div>
                <Calculator className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-4">
              <Select value={selectedOrder} onValueChange={setSelectedOrder}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="选择订单" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部订单</SelectItem>
                  {orders.map(o => (
                    <SelectItem key={o.id} value={o.orderNo}>{o.orderNo} - {o.productName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex items-center gap-2 flex-1 min-w-64">
                <Search className="w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="搜索物料编码/名称..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="flex-1"
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部状态</SelectItem>
                  <SelectItem value="充足">充足</SelectItem>
                  <SelectItem value="预警">预警</SelectItem>
                  <SelectItem value="缺料">缺料</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>MRP需求明细</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>订单号</TableHead>
                    <TableHead>物料编码</TableHead>
                    <TableHead>物料名称</TableHead>
                    <TableHead>规格</TableHead>
                    <TableHead>需求量</TableHead>
                    <TableHead>库存量</TableHead>
                    <TableHead>可用量</TableHead>
                    <TableHead>缺料量</TableHead>
                    <TableHead>建议采购</TableHead>
                    <TableHead>状态</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.map(item => (
                    <TableRow key={item.id} className={item.status === '缺料' ? 'bg-red-50' : item.status === '预警' ? 'bg-orange-50' : ''}>
                      <TableCell className="font-mono">{item.orderNo}</TableCell>
                      <TableCell>{item.materialCode}</TableCell>
                      <TableCell>{item.materialName}</TableCell>
                      <TableCell>{item.spec}</TableCell>
                      <TableCell>{item.requiredQuantity.toFixed(2)} {item.unit}</TableCell>
                      <TableCell>{item.inventoryQuantity.toFixed(2)} {item.unit}</TableCell>
                      <TableCell>{item.availableQuantity.toFixed(2)} {item.unit}</TableCell>
                      <TableCell className={item.shortageQuantity > 0 ? 'text-red-600 font-bold' : ''}>
                        {item.shortageQuantity.toFixed(2)} {item.unit}
                      </TableCell>
                      <TableCell className={item.suggestedPurchase > 0 ? 'text-blue-600 font-bold' : ''}>
                        {item.suggestedPurchase > 0 ? `${item.suggestedPurchase.toFixed(2)} ${item.unit}` : '-'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={
                          item.status === '充足' ? 'default' :
                          item.status === '预警' ? 'secondary' : 'destructive'
                        }>
                          {item.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {filteredItems.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                暂无MRP数据，请先创建订单和BOM
              </div>
            )}
          </CardContent>
        </Card>

        {/* 计算说明 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">计算公式</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <ArrowRight className="w-4 h-4" />
              <span><strong>需求量</strong> = 订单数量 × 单件用量</span>
            </div>
            <div className="flex items-center gap-2">
              <ArrowRight className="w-4 h-4" />
              <span><strong>可用量</strong> = 库存量 - 安全库存 + 在途量</span>
            </div>
            <div className="flex items-center gap-2">
              <ArrowRight className="w-4 h-4" />
              <span><strong>缺料量</strong> = MAX(0, 需求量 - 可用量)</span>
            </div>
            <div className="flex items-center gap-2">
              <ArrowRight className="w-4 h-4" />
              <span><strong>建议采购</strong> = 缺料量 × 1.1 (预留10%损耗)</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
