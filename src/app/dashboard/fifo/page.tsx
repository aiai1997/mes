'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ListOrdered, Eye, RotateCcw, AlertTriangle } from 'lucide-react';
import { getFIFOMaterials, type FIFOMaterial } from '@/types/production-advanced-2';

export default function FIFOPage() {
  const [materials, setMaterials] = useState<FIFOMaterial[]>([]);
  const [searchCode, setSearchCode] = useState('');
  const [searchExpired, setSearchExpired] = useState('全部');

  useEffect(() => { setMaterials(getFIFOMaterials()); }, []);

  const handleReset = () => { setSearchCode(''); setSearchExpired('全部'); };

  const filtered = materials.filter(m => {
    if (searchCode && !m.materialCode.includes(searchCode)) return false;
    if (searchExpired === '已过期' && !m.isExpired) return false;
    if (searchExpired === '未过期' && m.isExpired) return false;
    return true;
  });

  const stats = {
    total: materials.length,
    expired: materials.filter(m => m.isExpired).length,
    longStock: materials.filter(m => m.daysInStock > 90).length,
    totalQty: materials.reduce((sum, m) => sum + m.remainingQty, 0),
  };

  return (
    <DashboardLayout>
      <div className="max-w-full mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <ListOrdered className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">物料领用FIFO管理</h1>
              <p className="text-muted-foreground text-sm">先进先出，防止面料老化变质</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">批次总数</p><p className="text-2xl font-bold">{stats.total}</p></CardContent></Card>
          <Card className={stats.expired > 0 ? 'border-red-300' : ''}><CardContent className="p-4"><p className="text-sm text-muted-foreground">已过期</p><p className="text-2xl font-bold text-red-600">{stats.expired}</p></CardContent></Card>
          <Card className={stats.longStock > 0 ? 'border-yellow-300' : ''}><CardContent className="p-4"><p className="text-sm text-muted-foreground">存放{'>'}90天</p><p className="text-2xl font-bold text-yellow-600">{stats.longStock}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">总库存量</p><p className="text-2xl font-bold">{stats.totalQty}</p></CardContent></Card>
        </div>

        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div><Label>物料编码</Label><Input placeholder="请输入" value={searchCode} onChange={(e) => setSearchCode(e.target.value)} className="mt-1" /></div>
              <div><Label>过期状态</Label>
                <select className="w-full mt-1 border rounded px-3 py-2" value={searchExpired} onChange={(e) => setSearchExpired(e.target.value)}>
                  <option value="全部">全部</option>
                  <option value="未过期">未过期</option>
                  <option value="已过期">已过期</option>
                </select>
              </div>
              <div className="flex items-end gap-2">
                <Button className="flex-1">查询</Button>
                <Button variant="outline" onClick={handleReset}><RotateCcw className="w-4 h-4" /></Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>物料编码</TableHead>
                  <TableHead>物料名称</TableHead>
                  <TableHead>批次号</TableHead>
                  <TableHead>入库日期</TableHead>
                  <TableHead className="text-right">入库数量</TableHead>
                  <TableHead className="text-right">已用量</TableHead>
                  <TableHead className="text-right">剩余量</TableHead>
                  <TableHead>有效期</TableHead>
                  <TableHead className="text-right">存放天数</TableHead>
                  <TableHead className="text-right">优先级</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={10} className="text-center py-12 text-muted-foreground">暂无数据</TableCell></TableRow>
                ) : filtered.sort((a, b) => a.priority - b.priority).map(m => (
                  <TableRow key={m.id} className={m.isExpired ? 'bg-red-50' : m.daysInStock > 90 ? 'bg-yellow-50' : ''}>
                    <TableCell className="font-medium">{m.materialCode}</TableCell>
                    <TableCell>{m.materialName}</TableCell>
                    <TableCell>{m.batchNo}</TableCell>
                    <TableCell>{m.inboundDate}</TableCell>
                    <TableCell className="text-right">{m.quantity}</TableCell>
                    <TableCell className="text-right">{m.usedQuantity}</TableCell>
                    <TableCell className="text-right font-medium">{m.remainingQty}</TableCell>
                    <TableCell>{m.expiryDate || '-'}</TableCell>
                    <TableCell className="text-right">
                      <span className={m.daysInStock > 90 ? 'text-yellow-600' : ''}>{m.daysInStock}天</span>
                    </TableCell>
                    <TableCell className="text-right">
                      {m.isExpired ? (
                        <Badge className="bg-red-100 text-red-700"><AlertTriangle className="w-3 h-3 mr-1" />过期</Badge>
                      ) : (
                        <Badge className="bg-green-100 text-green-700">优先{m.priority}</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="p-4 border-t text-sm text-muted-foreground">共 {filtered.length} 条记录</div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
