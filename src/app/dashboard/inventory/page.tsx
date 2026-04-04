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
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Package,
  Plus,
  Search,
  RotateCcw,
  Download,
  ArrowDownToLine,
  ArrowUpFromLine,
  AlertTriangle,
  TrendingUp,
  Eye,
  CheckCircle,
} from 'lucide-react';
import {
  type StockItem,
  type StockInRecord,
  type StockOutRecord,
  type StockMovement,
  type StockStatus,
  getStockItems,
  getStockStats,
  getStockInRecords,
  getStockOutRecords,
  getStockMovements,
  auditStockIn,
  auditStockOut,
  initStockData,
} from '@/types/stock';
import { getCurrentUser } from '@/types/user';
import { logStockIn, logStockOut } from '@/types/log';

const statusColors: Record<StockStatus, string> = {
  '正常': 'bg-green-600 text-white',
  '预警': 'bg-yellow-600 text-white',
  '短缺': 'bg-red-600 text-white',
  '呆滞': 'bg-gray-600 text-white',
};

export default function InventoryPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('stock');
  
  // 库存数据
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [stockStats, setStockStats] = useState({ total: 0, normal: 0, warning: 0, shortage: 0, totalValue: 0 });
  
  // 入库数据
  const [stockInRecords, setStockInRecords] = useState<StockInRecord[]>([]);
  
  // 出库数据
  const [stockOutRecords, setStockOutRecords] = useState<StockOutRecord[]>([]);
  
  // 变动记录
  const [movements, setMovements] = useState<StockMovement[]>([]);
  
  // 查询条件
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchType, setSearchType] = useState('全部');
  const [searchStatus, setSearchStatus] = useState('全部');
  
  const [alertMessage, setAlertMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    initStockData();
    loadData();
  }, []);

  const loadData = () => {
    setStockItems(getStockItems());
    setStockStats(getStockStats());
    setStockInRecords(getStockInRecords());
    setStockOutRecords(getStockOutRecords());
    setMovements(getStockMovements());
  };

  // 库存过滤
  const filteredStock = stockItems.filter(s => {
    if (searchKeyword && !s.materialCode.includes(searchKeyword) && !s.materialName.includes(searchKeyword)) return false;
    if (searchType !== '全部' && s.type !== searchType) return false;
    if (searchStatus !== '全部' && s.status !== searchStatus) return false;
    return true;
  });

  const handleReset = () => {
    setSearchKeyword('');
    setSearchType('全部');
    setSearchStatus('全部');
  };

  // 入库审核
  const handleAuditIn = (record: StockInRecord) => {
    const user = getCurrentUser();
    if (auditStockIn(record.id, user?.username || 'system')) {
      logStockIn(record.inNo, record.items.map(i => i.materialName).join(','), user?.id || 'system', user?.username || 'system');
      loadData();
      setAlertMessage({ type: 'success', message: '入库审核成功' });
    } else {
      setAlertMessage({ type: 'error', message: '审核失败' });
    }
    setTimeout(() => setAlertMessage(null), 3000);
  };

  // 出库审核
  const handleAuditOut = (record: StockOutRecord) => {
    const user = getCurrentUser();
    if (auditStockOut(record.id, user?.username || 'system')) {
      logStockOut(record.outNo, record.items.map(i => i.materialName).join(','), user?.id || 'system', user?.username || 'system');
      loadData();
      setAlertMessage({ type: 'success', message: '出库审核成功' });
    } else {
      setAlertMessage({ type: 'error', message: '审核失败，请检查库存是否充足' });
    }
    setTimeout(() => setAlertMessage(null), 3000);
  };

  // 导出库存
  const handleExportStock = () => {
    const csvContent = [
      ['物料编码', '物料名称', '规格', '颜色', '单位', '库存数量', '安全库存', '状态', '仓库', '库位'].join(','),
      ...filteredStock.map(s => [
        s.materialCode, s.materialName, s.spec, s.color, s.unit,
        s.quantity.toFixed(4), s.safetyStock.toFixed(4), s.status, s.warehouse, s.location
      ].join(','))
    ].join('\n');
    
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `库存明细_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <DashboardLayout>
      <div className="max-w-full mx-auto space-y-6">
        {alertMessage && (
          <div className={`p-4 rounded-lg ${alertMessage.type === 'success' ? 'bg-green-900 border border-green-700' : 'bg-red-900 border border-red-700'}`}>
            <span className="text-white">{alertMessage.message}</span>
          </div>
        )}

        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-black" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">库存管理</h1>
              <p className="text-gray-400 text-sm">库存查询、入库管理、出库管理、库存变动</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => router.push('/dashboard/inventory/in')} className="bg-green-600 text-white hover:bg-green-700">
              <ArrowDownToLine className="w-4 h-4 mr-2" />入库
            </Button>
            <Button onClick={() => router.push('/dashboard/inventory/out')} className="bg-blue-600 text-white hover:bg-blue-700">
              <ArrowUpFromLine className="w-4 h-4 mr-2" />出库
            </Button>
          </div>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-5 gap-4">
          <Card className="bg-gray-900 border-gray-700">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-lg">
                  <Package className="w-5 h-5 text-black" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">物料种类</p>
                  <p className="text-2xl font-bold text-white">{stockStats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gray-900 border-gray-700">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">正常</p>
                  <p className="text-2xl font-bold text-green-400">{stockStats.normal}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gray-900 border-gray-700">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-500 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-black" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">预警</p>
                  <p className="text-2xl font-bold text-yellow-400">{stockStats.warning}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gray-900 border-gray-700">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-500 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">短缺</p>
                  <p className="text-2xl font-bold text-red-400">{stockStats.shortage}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gray-900 border-gray-700">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">库存金额</p>
                  <p className="text-xl font-bold text-purple-400">¥{stockStats.totalValue.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="stock">库存查询</TabsTrigger>
            <TabsTrigger value="in">入库管理</TabsTrigger>
            <TabsTrigger value="out">出库管理</TabsTrigger>
            <TabsTrigger value="movement">变动记录</TabsTrigger>
          </TabsList>

          {/* 库存查询 */}
          <TabsContent value="stock" className="space-y-4">
            <Card className="bg-gray-900 border-gray-700">
              <CardContent className="pt-6">
                <div className="flex gap-4 items-end">
                  <div>
                    <Label className="text-gray-400">关键词</Label>
                    <Input
                      placeholder="编码/名称"
                      value={searchKeyword}
                      onChange={(e) => setSearchKeyword(e.target.value)}
                      className="mt-1 bg-gray-800 border-gray-600 text-white w-48"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-400">物料类型</Label>
                    <Select value={searchType} onValueChange={setSearchType}>
                      <SelectTrigger className="mt-1 bg-gray-800 border-gray-600 text-white w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="全部">全部</SelectItem>
                        <SelectItem value="面料">面料</SelectItem>
                        <SelectItem value="辅料">辅料</SelectItem>
                        <SelectItem value="成品">成品</SelectItem>
                        <SelectItem value="半成品">半成品</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-gray-400">状态</Label>
                    <Select value={searchStatus} onValueChange={setSearchStatus}>
                      <SelectTrigger className="mt-1 bg-gray-800 border-gray-600 text-white w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="全部">全部</SelectItem>
                        <SelectItem value="正常">正常</SelectItem>
                        <SelectItem value="预警">预警</SelectItem>
                        <SelectItem value="短缺">短缺</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={loadData} className="bg-white text-black hover:bg-gray-200">
                    <Search className="w-4 h-4 mr-1" />查询
                  </Button>
                  <Button variant="outline" onClick={handleReset} className="border-gray-600 text-gray-300">
                    <RotateCcw className="w-4 h-4 mr-1" />重置
                  </Button>
                  <Button variant="outline" onClick={handleExportStock} className="border-gray-600 text-gray-300">
                    <Download className="w-4 h-4 mr-1" />导出
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-700 hidden lg:block">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-700">
                      <TableHead className="text-gray-400">#</TableHead>
                      <TableHead className="text-gray-400">物料类型</TableHead>
                      <TableHead className="text-gray-400">物料编码</TableHead>
                      <TableHead className="text-gray-400">物料名称</TableHead>
                      <TableHead className="text-gray-400">规格</TableHead>
                      <TableHead className="text-gray-400">颜色</TableHead>
                      <TableHead className="text-gray-400">单位</TableHead>
                      <TableHead className="text-gray-400 text-right">库存数量</TableHead>
                      <TableHead className="text-gray-400 text-right">安全库存</TableHead>
                      <TableHead className="text-gray-400 text-right">单价</TableHead>
                      <TableHead className="text-gray-400 text-right">金额</TableHead>
                      <TableHead className="text-gray-400">状态</TableHead>
                      <TableHead className="text-gray-400">仓库</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStock.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={13} className="text-center py-12 text-gray-500">暂无数据</TableCell>
                      </TableRow>
                    ) : (
                      filteredStock.map((item, index) => (
                        <TableRow key={item.id} className="border-gray-700 hover:bg-gray-800">
                          <TableCell className="text-gray-500">{index + 1}</TableCell>
                          <TableCell className="text-gray-300">{item.type}</TableCell>
                          <TableCell className="text-white font-mono">{item.materialCode}</TableCell>
                          <TableCell className="text-white">{item.materialName}</TableCell>
                          <TableCell className="text-gray-300">{item.spec}</TableCell>
                          <TableCell className="text-gray-300">{item.color}</TableCell>
                          <TableCell className="text-gray-300">{item.unit}</TableCell>
                          <TableCell className="text-right text-white font-bold">{item.quantity.toFixed(4)}</TableCell>
                          <TableCell className="text-right text-gray-300">{item.safetyStock.toFixed(4)}</TableCell>
                          <TableCell className="text-right text-gray-300">¥{item.unitCost.toFixed(4)}</TableCell>
                          <TableCell className="text-right text-green-400">¥{(item.quantity * item.unitCost).toFixed(2)}</TableCell>
                          <TableCell>
                            <Badge className={statusColors[item.status]}>{item.status}</Badge>
                          </TableCell>
                          <TableCell className="text-gray-300">{item.warehouse}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
                <div className="p-4 border-t border-gray-700 text-gray-400 text-sm">
                  共 {filteredStock.length} 条记录
                </div>
              </CardContent>
            </Card>
            
            {/* 移动端卡片 */}
            <div className="lg:hidden space-y-3">
              {filteredStock.length === 0 ? (
                <Card className="bg-gray-900 border-gray-700">
                  <CardContent className="py-12 text-center text-gray-500">暂无数据</CardContent>
                </Card>
              ) : (
                filteredStock.map((item, index) => (
                  <Card key={item.id} className="bg-gray-900 border-gray-700">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="text-white font-medium">{item.materialName}</div>
                          <div className="text-gray-400 text-sm font-mono">{item.materialCode}</div>
                        </div>
                        <Badge className={statusColors[item.status]}>{item.status}</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm mb-2">
                        <div>
                          <span className="text-gray-400">类型：</span>
                          <span className="text-gray-300">{item.type}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">规格：</span>
                          <span className="text-gray-300">{item.spec}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">库存：</span>
                          <span className="text-white font-bold">{item.quantity.toFixed(4)} {item.unit}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">金额：</span>
                          <span className="text-green-400">¥{(item.quantity * item.unitCost).toFixed(2)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
              <div className="text-center text-sm text-gray-400 py-2">共 {filteredStock.length} 条记录</div>
            </div>
          </TabsContent>

          {/* 入库管理 */}
          <TabsContent value="in" className="space-y-4">
            <Card className="bg-gray-900 border-gray-700 hidden lg:block">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-700">
                      <TableHead className="text-gray-400">#</TableHead>
                      <TableHead className="text-gray-400">入库单号</TableHead>
                      <TableHead className="text-gray-400">入库类型</TableHead>
                      <TableHead className="text-gray-400">供应商</TableHead>
                      <TableHead className="text-gray-400">入库日期</TableHead>
                      <TableHead className="text-gray-400 text-right">明细数</TableHead>
                      <TableHead className="text-gray-400 text-right">总数量</TableHead>
                      <TableHead className="text-gray-400 text-right">总金额</TableHead>
                      <TableHead className="text-gray-400">状态</TableHead>
                      <TableHead className="text-gray-400">经办人</TableHead>
                      <TableHead className="text-gray-400 w-24">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stockInRecords.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={11} className="text-center py-12 text-gray-500">暂无入库记录</TableCell>
                      </TableRow>
                    ) : (
                      stockInRecords.map((record, index) => (
                        <TableRow key={record.id} className="border-gray-700 hover:bg-gray-800">
                          <TableCell className="text-gray-500">{index + 1}</TableCell>
                          <TableCell className="text-white font-mono">{record.inNo}</TableCell>
                          <TableCell className="text-gray-300">{record.inType}</TableCell>
                          <TableCell className="text-gray-300">{record.supplierName || '-'}</TableCell>
                          <TableCell className="text-gray-300">{record.inDate}</TableCell>
                          <TableCell className="text-right text-white">{record.items.length}</TableCell>
                          <TableCell className="text-right text-white">{record.totalQuantity.toFixed(4)}</TableCell>
                          <TableCell className="text-right text-green-400">¥{record.totalAmount.toFixed(2)}</TableCell>
                          <TableCell>
                            <Badge className={record.status === '已审核' ? 'bg-green-600' : record.status === '待审核' ? 'bg-yellow-600' : 'bg-gray-600'}>
                              {record.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-gray-300">{record.operator}</TableCell>
                          <TableCell>
                            {record.status === '待审核' && (
                              <Button size="sm" variant="outline" onClick={() => handleAuditIn(record)} className="border-green-600 text-green-400">
                                审核
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 出库管理 */}
          <TabsContent value="out" className="space-y-4">
            <Card className="bg-gray-900 border-gray-700">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-700">
                      <TableHead className="text-gray-400">#</TableHead>
                      <TableHead className="text-gray-400">出库单号</TableHead>
                      <TableHead className="text-gray-400">出库类型</TableHead>
                      <TableHead className="text-gray-400">领用人/客户</TableHead>
                      <TableHead className="text-gray-400">出库日期</TableHead>
                      <TableHead className="text-gray-400 text-right">明细数</TableHead>
                      <TableHead className="text-gray-400 text-right">总数量</TableHead>
                      <TableHead className="text-gray-400">状态</TableHead>
                      <TableHead className="text-gray-400">经办人</TableHead>
                      <TableHead className="text-gray-400 w-24">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stockOutRecords.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={10} className="text-center py-12 text-gray-500">暂无出库记录</TableCell>
                      </TableRow>
                    ) : (
                      stockOutRecords.map((record, index) => (
                        <TableRow key={record.id} className="border-gray-700 hover:bg-gray-800">
                          <TableCell className="text-gray-500">{index + 1}</TableCell>
                          <TableCell className="text-white font-mono">{record.outNo}</TableCell>
                          <TableCell className="text-gray-300">{record.outType}</TableCell>
                          <TableCell className="text-gray-300">{record.receiverName || '-'}</TableCell>
                          <TableCell className="text-gray-300">{record.outDate}</TableCell>
                          <TableCell className="text-right text-white">{record.items.length}</TableCell>
                          <TableCell className="text-right text-white">{record.totalQuantity.toFixed(4)}</TableCell>
                          <TableCell>
                            <Badge className={record.status === '已审核' ? 'bg-green-600' : record.status === '待审核' ? 'bg-yellow-600' : 'bg-gray-600'}>
                              {record.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-gray-300">{record.operator}</TableCell>
                          <TableCell>
                            {record.status === '待审核' && (
                              <Button size="sm" variant="outline" onClick={() => handleAuditOut(record)} className="border-green-600 text-green-400">
                                审核
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 变动记录 */}
          <TabsContent value="movement" className="space-y-4">
            <Card className="bg-gray-900 border-gray-700">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-700">
                      <TableHead className="text-gray-400">#</TableHead>
                      <TableHead className="text-gray-400">变动时间</TableHead>
                      <TableHead className="text-gray-400">变动类型</TableHead>
                      <TableHead className="text-gray-400">物料编码</TableHead>
                      <TableHead className="text-gray-400">物料名称</TableHead>
                      <TableHead className="text-gray-400 text-right">变动数量</TableHead>
                      <TableHead className="text-gray-400 text-right">变动前</TableHead>
                      <TableHead className="text-gray-400 text-right">变动后</TableHead>
                      <TableHead className="text-gray-400">关联单号</TableHead>
                      <TableHead className="text-gray-400">操作人</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {movements.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={10} className="text-center py-12 text-gray-500">暂无变动记录</TableCell>
                      </TableRow>
                    ) : (
                      movements.slice(0, 100).map((m, index) => (
                        <TableRow key={m.id} className="border-gray-700 hover:bg-gray-800">
                          <TableCell className="text-gray-500">{index + 1}</TableCell>
                          <TableCell className="text-gray-300 text-sm">{m.createdAt}</TableCell>
                          <TableCell>
                            <Badge className={m.movementType === '入库' ? 'bg-green-600' : m.movementType === '出库' ? 'bg-red-600' : 'bg-blue-600'}>
                              {m.movementType}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-white font-mono">{m.materialCode}</TableCell>
                          <TableCell className="text-gray-300">{m.materialName}</TableCell>
                          <TableCell className={`text-right font-bold ${m.quantity >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {m.quantity >= 0 ? '+' : ''}{m.quantity.toFixed(4)}
                          </TableCell>
                          <TableCell className="text-right text-gray-300">{m.beforeQuantity.toFixed(4)}</TableCell>
                          <TableCell className="text-right text-white">{m.afterQuantity.toFixed(4)}</TableCell>
                          <TableCell className="text-gray-300 font-mono text-sm">{m.relatedNo}</TableCell>
                          <TableCell className="text-gray-300">{m.operator}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
