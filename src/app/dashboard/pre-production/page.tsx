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
import { Checkbox } from '@/components/ui/checkbox';
import { ClipboardCheck, Plus, Eye, Edit, RotateCcw, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  type PreProductionMeeting,
  type PreProductionStatus,
  getPreProductionMeetings,
} from '@/types/production-advanced';

const statusColors: Record<PreProductionStatus, string> = {
  '待召开': 'bg-gray-100 text-gray-700',
  '已完成': 'bg-green-100 text-green-700',
  '有问题': 'bg-red-100 text-red-700',
};

const completionColors: Record<string, string> = {
  '未完成': 'text-red-600',
  '进行中': 'text-yellow-600',
  '已完成': 'text-green-600',
};

export default function PreProductionMeetingPage() {
  const router = useRouter();
  const [meetings, setMeetings] = useState<PreProductionMeeting[]>([]);
  
  const [searchNo, setSearchNo] = useState('');
  const [searchOrder, setSearchOrder] = useState('');
  const [searchStatus, setSearchStatus] = useState('全部');
  
  useEffect(() => {
    loadData();
  }, []);
  
  const loadData = () => {
    setMeetings(getPreProductionMeetings());
  };
  
  const handleReset = () => {
    setSearchNo('');
    setSearchOrder('');
    setSearchStatus('全部');
  };
  
  const filteredMeetings = meetings.filter(m => {
    if (searchNo && !m.meetingNo.includes(searchNo)) return false;
    if (searchOrder && !m.orderNo.includes(searchOrder)) return false;
    if (searchStatus !== '全部' && m.status !== searchStatus) return false;
    return true;
  });
  
  const stats = {
    total: meetings.length,
    pending: meetings.filter(m => m.status === '待召开').length,
    completed: meetings.filter(m => m.status === '已完成').length,
    hasIssues: meetings.filter(m => m.status === '有问题').length,
    notAllowed: meetings.filter(m => !m.fabricConfirmed || !m.accessoryConfirmed || !m.processConfirmed || !m.sizeConfirmed).length,
  };

  return (
    <DashboardLayout>
      <div className="max-w-full mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <ClipboardCheck className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">产前会议管理</h1>
              <p className="text-muted-foreground text-sm">产前版确认、会议记录管理</p>
            </div>
          </div>
          <Button onClick={() => router.push('/dashboard/pre-production/create')}>
            <Plus className="w-4 h-4 mr-2" />新增产前会议
          </Button>
        </div>
        
        {/* 警告提示 */}
        {stats.notAllowed > 0 && (
          <Card className="border-red-300 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-red-700">
                <AlertTriangle className="w-5 h-5" />
                <span>有 {stats.notAllowed} 个订单未完成产前确认，禁止开裁生产！</span>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* 统计卡片 */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">会议总数</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <ClipboardCheck className="w-8 h-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">待召开</p>
                  <p className="text-2xl font-bold text-gray-600">{stats.pending}</p>
                </div>
                <XCircle className="w-8 h-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">已完成</p>
                  <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">有问题</p>
                  <p className="text-2xl font-bold text-red-600">{stats.hasIssues}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-400" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-red-300">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">禁止开裁</p>
                  <p className="text-2xl font-bold text-red-600">{stats.notAllowed}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-400" />
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* 查询区 */}
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div>
                <Label>会议编号</Label>
                <Input placeholder="请输入" value={searchNo} onChange={(e) => setSearchNo(e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label>订单号</Label>
                <Input placeholder="请输入" value={searchOrder} onChange={(e) => setSearchOrder(e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label>状态</Label>
                <Select value={searchStatus} onValueChange={setSearchStatus}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="全部">全部</SelectItem>
                    <SelectItem value="待召开">待召开</SelectItem>
                    <SelectItem value="已完成">已完成</SelectItem>
                    <SelectItem value="有问题">有问题</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end gap-2">
                <Button onClick={loadData} className="flex-1">查询</Button>
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
                  <TableHead>会议编号</TableHead>
                  <TableHead>订单号</TableHead>
                  <TableHead>款号</TableHead>
                  <TableHead>产品名称</TableHead>
                  <TableHead className="text-center">面料确认</TableHead>
                  <TableHead className="text-center">辅料确认</TableHead>
                  <TableHead className="text-center">工艺确认</TableHead>
                  <TableHead className="text-center">尺寸确认</TableHead>
                  <TableHead>会议日期</TableHead>
                  <TableHead>负责人</TableHead>
                  <TableHead>完成状态</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead className="w-20">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMeetings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={13} className="text-center py-12 text-muted-foreground">暂无产前会议记录</TableCell>
                  </TableRow>
                ) : (
                  filteredMeetings.map(meeting => {
                    const allConfirmed = meeting.fabricConfirmed && meeting.accessoryConfirmed && meeting.processConfirmed && meeting.sizeConfirmed;
                    return (
                      <TableRow key={meeting.id} className={!allConfirmed ? 'bg-red-50' : ''}>
                        <TableCell className="font-medium">{meeting.meetingNo}</TableCell>
                        <TableCell>{meeting.orderNo}</TableCell>
                        <TableCell>{meeting.styleNo}</TableCell>
                        <TableCell>{meeting.productName}</TableCell>
                        <TableCell className="text-center">
                          {meeting.fabricConfirmed ? (
                            <CheckCircle className="w-5 h-5 text-green-600 mx-auto" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-600 mx-auto" />
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {meeting.accessoryConfirmed ? (
                            <CheckCircle className="w-5 h-5 text-green-600 mx-auto" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-600 mx-auto" />
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {meeting.processConfirmed ? (
                            <CheckCircle className="w-5 h-5 text-green-600 mx-auto" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-600 mx-auto" />
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {meeting.sizeConfirmed ? (
                            <CheckCircle className="w-5 h-5 text-green-600 mx-auto" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-600 mx-auto" />
                          )}
                        </TableCell>
                        <TableCell>{meeting.meetingDate}</TableCell>
                        <TableCell>{meeting.responsiblePerson}</TableCell>
                        <TableCell>
                          <span className={completionColors[meeting.completionStatus]}>
                            {meeting.completionStatus}
                          </span>
                        </TableCell>
                        <TableCell><Badge className={statusColors[meeting.status]}>{meeting.status}</Badge></TableCell>
                        <TableCell>
                          <Button size="sm" variant="ghost" onClick={() => router.push(`/dashboard/pre-production/${meeting.id}`)}>
                            <Eye className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
            <div className="p-4 border-t text-sm text-muted-foreground">
              共 {filteredMeetings.length} 条记录
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
