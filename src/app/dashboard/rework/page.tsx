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
import { RotateCcw, Plus, Search, AlertCircle, CheckCircle, Clock, XCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  type ReworkRecord,
  type ReworkStatus,
  type ReworkType,
  getReworkRecords,
  initReworkData,
} from '@/types/rework';

const statusColors: Record<ReworkStatus, string> = {
  '待返工': 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
  '返工中': 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  '已完成': 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  '已报废': 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
};

const typeLabels: Record<ReworkType, string> = {
  '裁床返工': '裁床返工',
  '缝制返工': '缝制返工',
  '尾部返工': '尾部返工',
  '质检返工': '质检返工',
  '包装返工': '包装返工',
};

export default function ReworkPage() {
  const router = useRouter();
  const [reworks, setReworks] = useState<ReworkRecord[]>([]);
  const [scraps, setScraps] = useState<ReworkRecord[]>([]);
  
  const [searchNo, setSearchNo] = useState('');
  const [searchStatus, setSearchStatus] = useState('全部');
  const [searchType, setSearchType] = useState('全部');
  const [activeTab, setActiveTab] = useState('rework');
  
  useEffect(() => {
    initReworkData();
    loadData();
  }, []);
  
  const loadData = () => {
    const allRecords = getReworkRecords();
    setReworks(allRecords.filter(r => r.recordType === '返工'));
    setScraps(allRecords.filter(r => r.recordType === '报废'));
  };
  
  const currentList = activeTab === 'rework' ? reworks : scraps;
  
  const filteredRecords = currentList.filter(r => {
    if (searchNo && !r.reworkNo.includes(searchNo)) return false;
    if (searchStatus !== '全部' && r.status !== searchStatus) return false;
    if (searchType !== '全部' && r.reworkType !== searchType) return false;
    return true;
  });
  
  const handleReset = () => {
    setSearchNo('');
    setSearchStatus('全部');
    setSearchType('全部');
  };
  
  const reworkStats = {
    total: reworks.length,
    pending: reworks.filter(r => r.status === '待返工').length,
    inProgress: reworks.filter(r => r.status === '返工中').length,
    completed: reworks.filter(r => r.status === '已完成').length,
  };
  
  const scrapStats = {
    total: scraps.length,
    pending: scraps.filter(r => r.status === '待返工').length,
    completed: scraps.filter(r => r.status === '已报废').length,
    totalQty: scraps.reduce((sum, r) => sum + r.quantity, 0),
  };

  return (
    <DashboardLayout>
      <div className="max-w-full mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <RotateCcw className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">返工/报废管理</h1>
              <p className="text-muted-foreground text-sm">生产返工记录、不良品报废处理</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => router.push('/dashboard/rework/create')}>
              <Plus className="w-4 h-4 mr-2" />返工登记
            </Button>
            <Button variant="outline" onClick={() => router.push('/dashboard/scrap/create')}>
              报废登记
            </Button>
          </div>
        </div>
        
        {/* 统计卡片 */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            {activeTab === 'rework' ? (
              <>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">返工总数</p>
                        <p className="text-2xl font-bold">{reworkStats.total}</p>
                      </div>
                      <RotateCcw className="w-8 h-8 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">待返工</p>
                        <p className="text-2xl font-bold text-red-600">{reworkStats.pending}</p>
                      </div>
                      <AlertCircle className="w-8 h-8 text-red-400" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">返工中</p>
                        <p className="text-2xl font-bold text-blue-600">{reworkStats.inProgress}</p>
                      </div>
                      <Clock className="w-8 h-8 text-blue-400" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">已完成</p>
                        <p className="text-2xl font-bold text-green-600">{reworkStats.completed}</p>
                      </div>
                      <CheckCircle className="w-8 h-8 text-green-400" />
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">报废总数</p>
                        <p className="text-2xl font-bold">{scrapStats.total}</p>
                      </div>
                      <XCircle className="w-8 h-8 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">报废数量</p>
                        <p className="text-2xl font-bold text-red-600">{scrapStats.totalQty}</p>
                      </div>
                      <AlertCircle className="w-8 h-8 text-red-400" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">已处理</p>
                        <p className="text-2xl font-bold text-gray-600">{scrapStats.completed}</p>
                      </div>
                      <CheckCircle className="w-8 h-8 text-gray-400" />
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
          
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="rework">返工记录</TabsTrigger>
            <TabsTrigger value="scrap">报废记录</TabsTrigger>
          </TabsList>
          
          {/* 查询区 */}
          <Card className="mt-4">
            <CardContent className="p-4">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div>
                  <Label>{activeTab === 'rework' ? '返工编号' : '报废编号'}</Label>
                  <Input placeholder="请输入" value={searchNo} onChange={(e) => setSearchNo(e.target.value)} className="mt-1" />
                </div>
                <div>
                  <Label>类型</Label>
                  <Select value={searchType} onValueChange={setSearchType}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="全部">全部</SelectItem>
                      <SelectItem value="裁床返工">裁床返工</SelectItem>
                      <SelectItem value="缝制返工">缝制返工</SelectItem>
                      <SelectItem value="尾部返工">尾部返工</SelectItem>
                      <SelectItem value="质检返工">质检返工</SelectItem>
                      <SelectItem value="包装返工">包装返工</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>状态</Label>
                  <Select value={searchStatus} onValueChange={setSearchStatus}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="全部">全部</SelectItem>
                      <SelectItem value="待返工">待返工</SelectItem>
                      <SelectItem value="返工中">返工中</SelectItem>
                      <SelectItem value="已完成">已完成</SelectItem>
                      <SelectItem value="已报废">已报废</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end gap-2">
                  <Button onClick={loadData} className="flex-1">查询</Button>
                  <Button variant="outline" onClick={handleReset}><Search className="w-4 h-4" /></Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* 列表 */}
          <Card className="mt-4">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>编号</TableHead>
                    <TableHead>类型</TableHead>
                    <TableHead>生产单号</TableHead>
                    <TableHead>工序</TableHead>
                    <TableHead className="text-right">数量</TableHead>
                    <TableHead>不良现象</TableHead>
                    <TableHead>责任人</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>登记时间</TableHead>
                    <TableHead className="w-20">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecords.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center py-12 text-muted-foreground">
                        暂无{activeTab === 'rework' ? '返工' : '报废'}记录
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRecords.map(record => (
                      <TableRow key={record.id}>
                        <TableCell className="font-medium">{record.reworkNo}</TableCell>
                        <TableCell><Badge variant="outline">{typeLabels[record.reworkType]}</Badge></TableCell>
                        <TableCell>{record.productionOrderNo}</TableCell>
                        <TableCell>{record.processName}</TableCell>
                        <TableCell className="text-right">{record.quantity}</TableCell>
                        <TableCell className="max-w-xs truncate">{record.defectDescription}</TableCell>
                        <TableCell>{record.responsiblePerson}</TableCell>
                        <TableCell><Badge className={statusColors[record.status]}>{record.status}</Badge></TableCell>
                        <TableCell className="text-sm">{record.createdAt}</TableCell>
                        <TableCell>
                          <Button size="sm" variant="ghost" onClick={() => router.push(`/dashboard/rework/${record.id}`)}>
                            查看
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              <div className="p-4 border-t text-sm text-muted-foreground">
                共 {filteredRecords.length} 条记录
              </div>
            </CardContent>
          </Card>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
