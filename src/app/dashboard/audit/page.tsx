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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  CheckCircle,
  XCircle,
  Eye,
  Clock,
  FileText,
  Users,
  Package,
} from 'lucide-react';

interface AuditRecord {
  id: string;
  type: '订单' | 'BOM' | '裁床' | '报工' | '尾部' | '付款' | '收款';
  bizNo: string;
  orderNo?: string;
  applicant: string;
  applyTime: string;
  status: '待审核' | '已通过' | '已驳回';
  auditor?: string;
  auditTime?: string;
  remark?: string;
}

export default function AuditPage() {
  const [records, setRecords] = useState<AuditRecord[]>([]);
  const [searchType, setSearchType] = useState('全部');
  const [searchStatus, setSearchStatus] = useState('待审核');

  useEffect(() => {
    // 模拟数据
    setRecords([
      { id: '1', type: '订单', bizNo: 'ORD20250101001', applicant: '张三', applyTime: '2025-01-01 10:00:00', status: '待审核' },
      { id: '2', type: 'BOM', bizNo: 'BOM20250101001', orderNo: 'ORD20250101001', applicant: '李四', applyTime: '2025-01-01 11:00:00', status: '待审核' },
      { id: '3', type: '报工', bizNo: 'WO20250101001', orderNo: 'ORD20250101001', applicant: '王五', applyTime: '2025-01-01 14:00:00', status: '已通过', auditor: '赵六', auditTime: '2025-01-01 14:30:00' },
      { id: '4', type: '付款', bizNo: 'PAY20250101001', applicant: '财务', applyTime: '2025-01-01 15:00:00', status: '待审核' },
    ]);
  }, []);

  const filteredRecords = records.filter(r => {
    if (searchType !== '全部' && r.type !== searchType) return false;
    if (searchStatus !== '全部' && r.status !== searchStatus) return false;
    return true;
  });

  const stats = {
    pending: records.filter(r => r.status === '待审核').length,
    passed: records.filter(r => r.status === '已通过').length,
    rejected: records.filter(r => r.status === '已驳回').length,
  };

  const handleApprove = (id: string) => {
    setRecords(records.map(r => r.id === id ? { ...r, status: '已通过' as const, auditor: '当前用户', auditTime: new Date().toLocaleString('zh-CN') } : r));
  };

  const handleReject = (id: string) => {
    setRecords(records.map(r => r.id === id ? { ...r, status: '已驳回' as const, auditor: '当前用户', auditTime: new Date().toLocaleString('zh-CN') } : r));
  };

  const typeColors: Record<string, string> = {
    '订单': 'bg-blue-600',
    'BOM': 'bg-purple-600',
    '裁床': 'bg-orange-600',
    '报工': 'bg-green-600',
    '尾部': 'bg-cyan-600',
    '付款': 'bg-red-600',
    '收款': 'bg-yellow-600',
  };

  const statusColors: Record<string, string> = {
    '待审核': 'bg-yellow-600 text-white',
    '已通过': 'bg-green-600 text-white',
    '已驳回': 'bg-red-600 text-white',
  };

  return (
    <DashboardLayout>
      <div className="max-w-full mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-black" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">审核管理</h1>
              <p className="text-gray-400 text-sm">订单、BOM、报工、付款等业务审核</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <Card className="bg-gray-900 border-gray-700">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-500 rounded-lg">
                  <Clock className="w-5 h-5 text-black" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">待审核</p>
                  <p className="text-2xl font-bold text-yellow-400">{stats.pending}</p>
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
                  <p className="text-gray-400 text-sm">已通过</p>
                  <p className="text-2xl font-bold text-green-400">{stats.passed}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gray-900 border-gray-700">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-500 rounded-lg">
                  <XCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">已驳回</p>
                  <p className="text-2xl font-bold text-red-400">{stats.rejected}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gray-900 border-gray-700">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500 rounded-lg">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">总记录</p>
                  <p className="text-2xl font-bold text-white">{records.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-gray-900 border-gray-700">
          <CardContent className="pt-6">
            <div className="flex gap-4 items-end">
              <div>
                <Label className="text-gray-400">业务类型</Label>
                <Select value={searchType} onValueChange={setSearchType}>
                  <SelectTrigger className="mt-1 bg-gray-800 border-gray-600 text-white w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="全部">全部</SelectItem>
                    <SelectItem value="订单">订单</SelectItem>
                    <SelectItem value="BOM">BOM</SelectItem>
                    <SelectItem value="报工">报工</SelectItem>
                    <SelectItem value="付款">付款</SelectItem>
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
                    <SelectItem value="待审核">待审核</SelectItem>
                    <SelectItem value="已通过">已通过</SelectItem>
                    <SelectItem value="已驳回">已驳回</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-700">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-700">
                  <TableHead className="text-gray-400">业务类型</TableHead>
                  <TableHead className="text-gray-400">单据编号</TableHead>
                  <TableHead className="text-gray-400">关联订单</TableHead>
                  <TableHead className="text-gray-400">申请人</TableHead>
                  <TableHead className="text-gray-400">申请时间</TableHead>
                  <TableHead className="text-gray-400">状态</TableHead>
                  <TableHead className="text-gray-400">审核人</TableHead>
                  <TableHead className="text-gray-400">审核时间</TableHead>
                  <TableHead className="text-gray-400 w-28">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecords.map((record) => (
                  <TableRow key={record.id} className="border-gray-700 hover:bg-gray-800">
                    <TableCell>
                      <Badge className={typeColors[record.type]}>{record.type}</Badge>
                    </TableCell>
                    <TableCell className="text-white font-medium">{record.bizNo}</TableCell>
                    <TableCell className="text-gray-300">{record.orderNo || '-'}</TableCell>
                    <TableCell className="text-gray-300">{record.applicant}</TableCell>
                    <TableCell className="text-gray-400 text-sm">{record.applyTime}</TableCell>
                    <TableCell>
                      <Badge className={statusColors[record.status]}>{record.status}</Badge>
                    </TableCell>
                    <TableCell className="text-gray-300">{record.auditor || '-'}</TableCell>
                    <TableCell className="text-gray-400 text-sm">{record.auditTime || '-'}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white hover:bg-gray-700" onClick={() => alert(`查看审核记录: ${record.bizNo}`)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        {record.status === '待审核' && (
                          <>
                            <Button size="sm" variant="ghost" onClick={() => handleApprove(record.id)} className="text-green-400 hover:text-green-300">
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => handleReject(record.id)} className="text-red-400 hover:text-red-300">
                              <XCircle className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
