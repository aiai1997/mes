'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRightLeft, Plus, RotateCcw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getWorkshopTransfers, type WorkshopTransfer } from '@/types/production-advanced-2';

const statusColors = {
  '待接收': 'bg-yellow-100 text-yellow-700',
  '已接收': 'bg-green-100 text-green-700',
};

const transferTypeColors = {
  '工序转移': 'bg-blue-100 text-blue-700',
  '班组转移': 'bg-purple-100 text-purple-700',
};

export default function WorkshopTransferPage() {
  const router = useRouter();
  const [transfers] = useState<WorkshopTransfer[]>(getWorkshopTransfers());
  const [searchNo, setSearchNo] = useState('');
  const [searchZaHao, setSearchZaHao] = useState('');
  const [searchType, setSearchType] = useState('全部');
  const [searchStatus, setSearchStatus] = useState('全部');

  const handleReset = () => {
    setSearchNo('');
    setSearchZaHao('');
    setSearchType('全部');
    setSearchStatus('全部');
  };

  const filtered = transfers.filter(t => {
    if (searchNo && !t.transferNo.includes(searchNo)) return false;
    if (searchZaHao && !t.zaHao.includes(searchZaHao)) return false;
    if (searchType !== '全部' && t.transferType !== searchType) return false;
    if (searchStatus !== '全部' && t.status !== searchStatus) return false;
    return true;
  });

  return (
    <DashboardLayout>
      <div className="max-w-full mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <ArrowRightLeft className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">车间移位/转工序管理</h1>
              <p className="text-muted-foreground text-sm">扎号位置实时追踪</p>
            </div>
          </div>
          <Button onClick={() => router.push('/dashboard/workshop-transfer/create')}>
            <Plus className="w-4 h-4 mr-2" />登记移位
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">移位记录数</p><p className="text-2xl font-bold">{transfers.length}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">待接收</p><p className="text-2xl font-bold text-yellow-600">{transfers.filter(t => t.status === '待接收').length}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">工序转移</p><p className="text-2xl font-bold text-blue-600">{transfers.filter(t => t.transferType === '工序转移').length}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">班组转移</p><p className="text-2xl font-bold text-purple-600">{transfers.filter(t => t.transferType === '班组转移').length}</p></CardContent></Card>
        </div>

        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              <div><Label>移位单号</Label><Input placeholder="请输入" value={searchNo} onChange={(e) => setSearchNo(e.target.value)} className="mt-1" /></div>
              <div><Label>扎号</Label><Input placeholder="请输入" value={searchZaHao} onChange={(e) => setSearchZaHao(e.target.value)} className="mt-1" /></div>
              <div><Label>转移类型</Label>
                <Select value={searchType} onValueChange={setSearchType}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="全部">全部</SelectItem>
                    <SelectItem value="工序转移">工序转移</SelectItem>
                    <SelectItem value="班组转移">班组转移</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>状态</Label>
                <Select value={searchStatus} onValueChange={setSearchStatus}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="全部">全部</SelectItem>
                    <SelectItem value="待接收">待接收</SelectItem>
                    <SelectItem value="已接收">已接收</SelectItem>
                  </SelectContent>
                </Select>
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
                  <TableHead>移位单号</TableHead>
                  <TableHead>扎号</TableHead>
                  <TableHead>订单号</TableHead>
                  <TableHead>转移类型</TableHead>
                  <TableHead>原工序→目标工序</TableHead>
                  <TableHead>原班组→目标班组</TableHead>
                  <TableHead className="text-right">数量</TableHead>
                  <TableHead>移位人</TableHead>
                  <TableHead>接收人</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>移位时间</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={11} className="text-center py-12 text-muted-foreground">暂无数据</TableCell></TableRow>
                ) : filtered.map(t => (
                  <TableRow key={t.id} className={t.status === '待接收' ? 'bg-yellow-50' : ''}>
                    <TableCell className="font-medium">{t.transferNo}</TableCell>
                    <TableCell>{t.zaHao}</TableCell>
                    <TableCell>{t.orderNo}</TableCell>
                    <TableCell><Badge className={transferTypeColors[t.transferType]}>{t.transferType}</Badge></TableCell>
                    <TableCell>{t.fromProcess} → {t.toProcess}</TableCell>
                    <TableCell>{t.fromTeam} → {t.toTeam}</TableCell>
                    <TableCell className="text-right">{t.quantity}</TableCell>
                    <TableCell>{t.transferPerson}</TableCell>
                    <TableCell>{t.receiver || '-'}</TableCell>
                    <TableCell><Badge className={statusColors[t.status]}>{t.status}</Badge></TableCell>
                    <TableCell className="text-sm">{t.transferTime}</TableCell>
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
