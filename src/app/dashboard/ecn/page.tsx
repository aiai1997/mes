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
import { FileEdit, Plus, RotateCcw, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  type ECN,
  type ECNStatus,
  type ChangeType,
  getECNs,
  initMiscData,
} from '@/types/misc';
import { useLanguage } from '@/lib/i18n';

export default function ECNPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [ecns, setEcns] = useState<ECN[]>([]);
  
  const [searchNo, setSearchNo] = useState('');
  const [searchStatus, setSearchStatus] = useState('all');
  const [searchType, setSearchType] = useState('all');
  
  useEffect(() => {
    initMiscData();
    loadData();
  }, []);
  
  const loadData = () => {
    setEcns(getECNs());
  };
  
  // 获取状态颜色
  const getStatusColor = (status: ECNStatus) => {
    const colors: Record<ECNStatus, string> = {
      '申请中': 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
      '评审中': 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
      '待执行': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
      '执行中': 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
      '已完成': 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
      '已关闭': 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    };
    return colors[status] || '';
  };

  // 翻译状态
  const translateStatus = (status: ECNStatus): string => {
    const statusMap: Record<ECNStatus, string> = {
      '申请中': t.ecn.status.applying,
      '评审中': t.ecn.status.reviewing,
      '待执行': t.ecn.status.pendingExecution,
      '执行中': t.ecn.status.executing,
      '已完成': t.ecn.status.completed,
      '已关闭': t.ecn.status.closed,
    };
    return statusMap[status] || status;
  };

  // 翻译变更类型
  const translateChangeType = (type: ChangeType): string => {
    const typeMap: Record<ChangeType, string> = {
      '工艺变更': t.ecn.changeTypes.process,
      '物料变更': t.ecn.changeTypes.material,
      '尺寸变更': t.ecn.changeTypes.size,
      '颜色变更': t.ecn.changeTypes.color,
      '包装变更': t.ecn.changeTypes.packaging,
      '其他变更': t.ecn.changeTypes.other,
    };
    return typeMap[type] || type;
  };
  
  const filteredECNs = ecns.filter(e => {
    if (searchNo && !e.ecnNo.includes(searchNo)) return false;
    if (searchStatus !== 'all' && e.status !== searchStatus) return false;
    if (searchType !== 'all' && e.changeType !== searchType) return false;
    return true;
  });
  
  const handleReset = () => {
    setSearchNo('');
    setSearchStatus('all');
    setSearchType('all');
  };
  
  const stats = {
    total: ecns.length,
    pending: ecns.filter(e => e.status === '申请中' || e.status === '评审中').length,
    executing: ecns.filter(e => e.status === '待执行' || e.status === '执行中').length,
    completed: ecns.filter(e => e.status === '已完成').length,
  };

  return (
    <DashboardLayout>
      <div className="max-w-full mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <FileEdit className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{t.ecn.title}</h1>
              <p className="text-muted-foreground text-sm">{t.ecn.subtitle}</p>
            </div>
          </div>
          <Button onClick={() => router.push('/dashboard/ecn/create')}>
            <Plus className="w-4 h-4 mr-2" />{t.ecn.applyChange}
          </Button>
        </div>
        
        {/* 统计卡片 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{t.ecn.totalChanges}</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <FileEdit className="w-8 h-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{t.ecn.pendingApproval}</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.pending}</p>
                </div>
                <Clock className="w-8 h-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{t.ecn.executing}</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.executing}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-orange-400" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{t.ecn.completed}</p>
                  <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* 查询区 */}
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div>
                <Label>{t.ecn.ecnNo}</Label>
                <Input placeholder={t.common.pleaseInput} value={searchNo} onChange={(e) => setSearchNo(e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label>{t.ecn.changeType}</Label>
                <Select value={searchType} onValueChange={setSearchType}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t.common.all}</SelectItem>
                    <SelectItem value="工艺变更">{t.ecn.changeTypes.process}</SelectItem>
                    <SelectItem value="物料变更">{t.ecn.changeTypes.material}</SelectItem>
                    <SelectItem value="尺寸变更">{t.ecn.changeTypes.size}</SelectItem>
                    <SelectItem value="颜色变更">{t.ecn.changeTypes.color}</SelectItem>
                    <SelectItem value="包装变更">{t.ecn.changeTypes.packaging}</SelectItem>
                    <SelectItem value="其他变更">{t.ecn.changeTypes.other}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{t.common.status}</Label>
                <Select value={searchStatus} onValueChange={setSearchStatus}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t.common.all}</SelectItem>
                    <SelectItem value="申请中">{t.ecn.status.applying}</SelectItem>
                    <SelectItem value="评审中">{t.ecn.status.reviewing}</SelectItem>
                    <SelectItem value="待执行">{t.ecn.status.pendingExecution}</SelectItem>
                    <SelectItem value="执行中">{t.ecn.status.executing}</SelectItem>
                    <SelectItem value="已完成">{t.ecn.status.completed}</SelectItem>
                    <SelectItem value="已关闭">{t.ecn.status.closed}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end gap-2">
                <Button onClick={loadData} className="flex-1">{t.common.search}</Button>
                <Button variant="outline" onClick={handleReset}><RotateCcw className="w-4 h-4" /></Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* 列表 */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t.ecn.ecnNo}</TableHead>
                  <TableHead>{t.ecn.changeType}</TableHead>
                  <TableHead>{t.ecn.relatedBOM}</TableHead>
                  <TableHead>{t.ecn.relatedOrder}</TableHead>
                  <TableHead>{t.ecn.changeContent}</TableHead>
                  <TableHead>{t.ecn.affectedOrders}</TableHead>
                  <TableHead>{t.ecn.applicant}</TableHead>
                  <TableHead>{t.common.status}</TableHead>
                  <TableHead>{t.ecn.applyTime}</TableHead>
                  <TableHead className="w-20">{t.common.action}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredECNs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-12 text-muted-foreground">{t.ecn.noRecords}</TableCell>
                  </TableRow>
                ) : (
                  filteredECNs.map(ecn => (
                    <TableRow key={ecn.id}>
                      <TableCell className="font-medium">{ecn.ecnNo}</TableCell>
                      <TableCell><Badge variant="outline">{translateChangeType(ecn.changeType)}</Badge></TableCell>
                      <TableCell>{ecn.bomNo}</TableCell>
                      <TableCell>{ecn.orderNo || '-'}</TableCell>
                      <TableCell className="max-w-xs truncate">{ecn.changeContent}</TableCell>
                      <TableCell>
                        {ecn.affectedOrders > 0 ? (
                          <Badge className="bg-red-100 text-red-700">{t.ecn.ordersAffected.replace('{count}', String(ecn.affectedOrders))}</Badge>
                        ) : '-'}
                      </TableCell>
                      <TableCell>{ecn.applicant}</TableCell>
                      <TableCell><Badge className={getStatusColor(ecn.status)}>{translateStatus(ecn.status)}</Badge></TableCell>
                      <TableCell className="text-sm">{ecn.createdAt}</TableCell>
                      <TableCell>
                        <Button size="sm" variant="ghost" onClick={() => router.push(`/dashboard/ecn/${ecn.id}`)}>
                          {t.common.view}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            <div className="p-4 border-t text-sm text-muted-foreground">
              {t.common.totalRecords.replace('{count}', String(filteredECNs.length))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
