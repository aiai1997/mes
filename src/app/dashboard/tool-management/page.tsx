'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Wrench, Plus, Eye, RotateCcw, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getTools, getToolUsages, type ToolItem, type ToolUsage } from '@/types/production-advanced-2';

const categoryColors = {
  '工具': 'bg-blue-100 text-blue-700',
  '刀具': 'bg-orange-100 text-orange-700',
  '易耗品': 'bg-purple-100 text-purple-700',
};

const statusColors = {
  '在库': 'bg-green-100 text-green-700',
  '领用': 'bg-yellow-100 text-yellow-700',
  '报废': 'bg-red-100 text-red-700',
};

const usageTypeColors = {
  '领用': 'bg-blue-100 text-blue-700',
  '归还': 'bg-green-100 text-green-700',
  '报废': 'bg-red-100 text-red-700',
  '丢失': 'bg-gray-100 text-gray-700',
};

export default function ToolManagementPage() {
  const router = useRouter();
  const [tools, setTools] = useState<ToolItem[]>([]);
  const [usages, setUsages] = useState<ToolUsage[]>([]);
  const [activeTab, setActiveTab] = useState<'tools' | 'usages'>('tools');

  useEffect(() => {
    setTools(getTools());
    setUsages(getToolUsages());
  }, []);

  const stats = {
    total: tools.length,
    inStock: tools.filter(t => t.status === '在库').length,
    borrowed: tools.filter(t => t.status === '领用').length,
    scrapped: tools.filter(t => t.status === '报废').length,
    lowStock: tools.filter(t => t.stockQty <= t.minQty).length,
  };

  return (
    <DashboardLayout>
      <div className="max-w-full mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <Wrench className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">工具/刀具/易耗品管理</h1>
              <p className="text-muted-foreground text-sm">工具档案、领用、归还、报废管理</p>
            </div>
          </div>
          <Button onClick={() => router.push('/dashboard/tool-management/create')}>
            <Plus className="w-4 h-4 mr-2" />新增工具
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">工具总数</p><p className="text-2xl font-bold">{stats.total}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">在库</p><p className="text-2xl font-bold text-green-600">{stats.inStock}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">领用中</p><p className="text-2xl font-bold text-yellow-600">{stats.borrowed}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">已报废</p><p className="text-2xl font-bold text-red-600">{stats.scrapped}</p></CardContent></Card>
          <Card className={stats.lowStock > 0 ? 'border-red-300' : ''}><CardContent className="p-4"><p className="text-sm text-muted-foreground">库存不足</p><p className="text-2xl font-bold text-red-600">{stats.lowStock}</p></CardContent></Card>
        </div>

        <div className="flex gap-2">
          <Button variant={activeTab === 'tools' ? 'default' : 'outline'} onClick={() => setActiveTab('tools')}>工具台账</Button>
          <Button variant={activeTab === 'usages' ? 'default' : 'outline'} onClick={() => setActiveTab('usages')}>领用记录</Button>
        </div>

        {activeTab === 'tools' ? (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>工具编号</TableHead>
                    <TableHead>工具名称</TableHead>
                    <TableHead>类别</TableHead>
                    <TableHead>规格</TableHead>
                    <TableHead className="text-right">库存数量</TableHead>
                    <TableHead className="text-right">最低数量</TableHead>
                    <TableHead className="text-right">单价</TableHead>
                    <TableHead>存放位置</TableHead>
                    <TableHead>状态</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tools.length === 0 ? (
                    <TableRow><TableCell colSpan={9} className="text-center py-12 text-muted-foreground">暂无数据</TableCell></TableRow>
                  ) : tools.map(t => (
                    <TableRow key={t.id} className={t.stockQty <= t.minQty ? 'bg-red-50' : ''}>
                      <TableCell className="font-medium">{t.toolNo}</TableCell>
                      <TableCell>{t.toolName}</TableCell>
                      <TableCell><Badge className={categoryColors[t.category]}>{t.category}</Badge></TableCell>
                      <TableCell>{t.specification}</TableCell>
                      <TableCell className="text-right">{t.stockQty} {t.unit}</TableCell>
                      <TableCell className="text-right">{t.minQty}</TableCell>
                      <TableCell className="text-right">¥{t.unitPrice}</TableCell>
                      <TableCell>{t.location}</TableCell>
                      <TableCell><Badge className={statusColors[t.status]}>{t.status}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="p-4 border-t text-sm text-muted-foreground">共 {tools.length} 条记录</div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>记录编号</TableHead>
                    <TableHead>工具编号</TableHead>
                    <TableHead>工具名称</TableHead>
                    <TableHead>类型</TableHead>
                    <TableHead>领用人</TableHead>
                    <TableHead className="text-right">数量</TableHead>
                    <TableHead>备注</TableHead>
                    <TableHead>时间</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usages.length === 0 ? (
                    <TableRow><TableCell colSpan={8} className="text-center py-12 text-muted-foreground">暂无数据</TableCell></TableRow>
                  ) : usages.map(u => (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium">{u.usageNo}</TableCell>
                      <TableCell>{u.toolNo}</TableCell>
                      <TableCell>{u.toolName}</TableCell>
                      <TableCell><Badge className={usageTypeColors[u.usageType]}>{u.usageType}</Badge></TableCell>
                      <TableCell>{u.employeeName}</TableCell>
                      <TableCell className="text-right">{u.quantity}</TableCell>
                      <TableCell>{u.remark}</TableCell>
                      <TableCell className="text-sm">{u.createdAt}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="p-4 border-t text-sm text-muted-foreground">共 {usages.length} 条记录</div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
