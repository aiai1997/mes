'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Settings2, Plus, Eye, RotateCcw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getCodeRules, type CodeRule } from '@/types/production-advanced-2';

export default function CodeRulePage() {
  const router = useRouter();
  const [rules, setRules] = useState<CodeRule[]>([]);
  const [searchModule, setSearchModule] = useState('');

  useEffect(() => { setRules(getCodeRules()); }, []);

  const handleReset = () => { setSearchModule(''); };

  const filtered = rules.filter(r => {
    if (searchModule && !r.module.includes(searchModule)) return false;
    return true;
  });

  return (
    <DashboardLayout>
      <div className="max-w-full mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <Settings2 className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">系统编码规则自定义</h1>
              <p className="text-muted-foreground text-sm">订单/BOM/裁床编码前缀、日期格式、流水位数</p>
            </div>
          </div>
          <Button onClick={() => router.push('/dashboard/code-rule/create')}>
            <Plus className="w-4 h-4 mr-2" />新增规则
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">编码规则数</p><p className="text-2xl font-bold">{rules.length}</p></CardContent></Card>
        </div>

        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div><Label>模块名称</Label><Input placeholder="请输入" value={searchModule} onChange={(e) => setSearchModule(e.target.value)} className="mt-1" /></div>
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
                  <TableHead>模块</TableHead>
                  <TableHead>前缀</TableHead>
                  <TableHead>日期格式</TableHead>
                  <TableHead className="text-right">流水位数</TableHead>
                  <TableHead className="text-right">当前流水号</TableHead>
                  <TableHead>示例</TableHead>
                  <TableHead>说明</TableHead>
                  <TableHead>更新时间</TableHead>
                  <TableHead className="w-20">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={9} className="text-center py-12 text-muted-foreground">暂无数据</TableCell></TableRow>
                ) : filtered.map(r => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.module}</TableCell>
                    <TableCell>{r.prefix}</TableCell>
                    <TableCell>{r.dateFormat}</TableCell>
                    <TableCell className="text-right">{r.serialDigits}</TableCell>
                    <TableCell className="text-right">{r.currentSerial}</TableCell>
                    <TableCell className="font-mono text-sm text-blue-600">{r.example}</TableCell>
                    <TableCell>{r.description}</TableCell>
                    <TableCell className="text-sm">{r.updatedAt}</TableCell>
                    <TableCell><Button size="sm" variant="ghost"><Eye className="w-4 h-4" /></Button></TableCell>
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
