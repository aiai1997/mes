'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Warehouse, Plus, Search, Package, MapPin, Building2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  type WarehouseInfo,
  type WarehouseType,
  type WarehouseArea,
  getWarehouses,
  initMiscData,
} from '@/types/misc';

const warehouseTypeLabels: Record<WarehouseType, string> = {
  '原料仓': '原料仓',
  '成品仓': '成品仓',
  '辅料仓': '辅料仓',
  '半成品仓': '半成品仓',
  '客供料仓': '客供料仓',
  '委外仓': '委外仓',
  '残次品仓': '残次品仓',
};

export default function WarehousePage() {
  const router = useRouter();
  const [warehouses, setWarehouses] = useState<WarehouseInfo[]>([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState<WarehouseInfo | null>(null);
  
  const [searchName, setSearchName] = useState('');
  const [searchType, setSearchType] = useState('全部');
  
  const loadData = () => {
    const allWarehouses = getWarehouses();
    setWarehouses(allWarehouses);
    if (allWarehouses.length > 0 && !selectedWarehouse) {
      setSelectedWarehouse(allWarehouses[0]);
    }
  };
  
  useEffect(() => {
    initMiscData();
    loadData();
  }, []);
  
  const filteredWarehouses = warehouses.filter(w => {
    if (searchName && !w.name.includes(searchName)) return false;
    if (searchType !== '全部' && w.warehouseType !== searchType) return false;
    return true;
  });
  
  const stats = {
    total: warehouses.length,
    totalArea: warehouses.reduce((sum, w) => sum + w.totalArea, 0),
    totalCapacity: warehouses.reduce((sum, w) => sum + w.totalCapacity, 0),
    usedCapacity: warehouses.reduce((sum, w) => sum + w.usedCapacity, 0),
  };

  return (
    <DashboardLayout>
      <div className="max-w-full mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <Warehouse className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">多仓库管理</h1>
              <p className="text-muted-foreground text-sm">仓库设置、库区管理、库位管理、库存预警</p>
            </div>
          </div>
          <Button onClick={() => router.push('/dashboard/warehouse/create')}>
            <Plus className="w-4 h-4 mr-2" />新建仓库
          </Button>
        </div>
        
        {/* 统计卡片 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">仓库总数</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <Warehouse className="w-8 h-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">总面积(m²)</p>
                  <p className="text-2xl font-bold">{stats.totalArea.toLocaleString()}</p>
                </div>
                <MapPin className="w-8 h-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">总库容</p>
                  <p className="text-2xl font-bold">{stats.totalCapacity.toLocaleString()}</p>
                </div>
                <Package className="w-8 h-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">使用率</p>
                  <p className="text-2xl font-bold">
                    {stats.totalCapacity > 0 ? Math.round(stats.usedCapacity / stats.totalCapacity * 100) : 0}%
                  </p>
                </div>
                <Building2 className="w-8 h-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 仓库列表 */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg flex justify-between items-center">
                仓库列表
                <div className="flex gap-1">
                  <Input placeholder="搜索" value={searchName} onChange={(e) => setSearchName(e.target.value)} className="w-24 h-8" />
                  <Select value={searchType} onValueChange={setSearchType}>
                    <SelectTrigger className="w-24 h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="全部">全部</SelectItem>
                      <SelectItem value="原料仓">原料仓</SelectItem>
                      <SelectItem value="成品仓">成品仓</SelectItem>
                      <SelectItem value="辅料仓">辅料仓</SelectItem>
                      <SelectItem value="半成品仓">半成品仓</SelectItem>
                      <SelectItem value="客供料仓">客供料仓</SelectItem>
                      <SelectItem value="委外仓">委外仓</SelectItem>
                      <SelectItem value="残次品仓">残次品仓</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {filteredWarehouses.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">暂无仓库</div>
                ) : (
                  filteredWarehouses.map(wh => (
                    <div
                      key={wh.id}
                      className={`p-3 cursor-pointer hover:bg-muted/50 ${selectedWarehouse?.id === wh.id ? 'bg-muted' : ''}`}
                      onClick={() => setSelectedWarehouse(wh)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium">{wh.name}</div>
                          <div className="text-sm text-muted-foreground">{wh.code}</div>
                        </div>
                        <Badge variant="outline">{warehouseTypeLabels[wh.warehouseType]}</Badge>
                      </div>
                      <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
                        <span>库区: {wh.areaCount}</span>
                        <span>库位: {wh.binCount}</span>
                        <span className={wh.usedCapacity / wh.totalCapacity > 0.8 ? 'text-red-600' : ''}>
                          使用率: {Math.round(wh.usedCapacity / wh.totalCapacity * 100)}%
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* 库区和库位 */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg flex justify-between items-center">
                <div className="flex items-center gap-2">
                  库区/库位
                  {selectedWarehouse && <span className="text-muted-foreground">- {selectedWarehouse.name}</span>}
                </div>
                {selectedWarehouse && (
                  <Button size="sm" variant="outline" onClick={() => alert('新增库区功能开发中，敬请期待！')}>
                    新增库区
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {!selectedWarehouse ? (
                <div className="p-8 text-center text-muted-foreground">请选择一个仓库</div>
              ) : !selectedWarehouse.areas || selectedWarehouse.areas.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">暂无库区数据</div>
              ) : (
                <Tabs defaultValue="areas">
                  <TabsList className="w-full justify-start px-4 pt-2">
                    <TabsTrigger value="areas">库区管理</TabsTrigger>
                    <TabsTrigger value="bins">库位管理</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="areas">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>库区编码</TableHead>
                          <TableHead>库区名称</TableHead>
                          <TableHead>温度要求</TableHead>
                          <TableHead className="text-right">库位数</TableHead>
                          <TableHead className="text-right">使用率</TableHead>
                          <TableHead>负责人</TableHead>
                          <TableHead>状态</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedWarehouse.areas.map((area: WarehouseArea) => (
                          <TableRow key={area.id}>
                            <TableCell className="font-medium">{area.code}</TableCell>
                            <TableCell>{area.name}</TableCell>
                            <TableCell>{area.temperature || '常温'}</TableCell>
                            <TableCell className="text-right">{area.binCount}</TableCell>
                            <TableCell className="text-right">
                              <span className={area.utilization > 80 ? 'text-red-600' : ''}>
                                {area.utilization}%
                              </span>
                            </TableCell>
                            <TableCell>{area.manager}</TableCell>
                            <TableCell>
                              <Badge className={area.status === '正常' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                                {area.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TabsContent>
                  
                  <TabsContent value="bins">
                    <div className="p-4 text-muted-foreground">
                      选择库区查看库位详情...
                    </div>
                  </TabsContent>
                </Tabs>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
