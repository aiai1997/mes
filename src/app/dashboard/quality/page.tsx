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
import { CheckCircle, Plus, Search, RotateCcw, AlertTriangle, ClipboardCheck, TrendingUp } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  type QCRecord,
  type QCType,
  type QCResult,
  getQCRecords,
  getQCStatistics,
  initQualityData,
} from '@/types/quality';

const qcTypeLabels: Record<QCType, string> = {
  'IQC': '来料检验',
  'IPQC': '制程检验',
  'FQC': '尾部终检',
  'OQC': '出货检验',
};

const resultColors: Record<QCResult, string> = {
  '合格': 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  '不合格': 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
  '待检': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
};

export default function QualityPage() {
  const router = useRouter();
  const [records, setRecords] = useState<QCRecord[]>([]);
  const [stats, setStats] = useState({ total: 0, passed: 0, failed: 0, avgPassRate: '0' });
  
  const [searchType, setSearchType] = useState('全部');
  const [searchOrderNo, setSearchOrderNo] = useState('');
  const [searchResult, setSearchResult] = useState('全部');
  
  useEffect(() => {
    initQualityData();
    loadData();
  }, []);
  
  const loadData = () => {
    setRecords(getQCRecords());
    setStats(getQCStatistics());
  };
  
  const filteredRecords = records.filter(r => {
    if (searchType !== '全部' && r.qcType !== searchType) return false;
    if (searchOrderNo && !r.orderNo.includes(searchOrderNo)) return false;
    if (searchResult !== '全部' && r.result !== searchResult) return false;
    return true;
  });
  
  const handleReset = () => {
    setSearchType('全部');
    setSearchOrderNo('');
    setSearchResult('全部');
  };
  
  // 按类型分组统计
  const typeStats = {
    IQC: { total: records.filter(r => r.qcType === 'IQC').length, passed: records.filter(r => r.qcType === 'IQC' && r.result === '合格').length },
    IPQC: { total: records.filter(r => r.qcType === 'IPQC').length, passed: records.filter(r => r.qcType === 'IPQC' && r.result === '合格').length },
    FQC: { total: records.filter(r => r.qcType === 'FQC').length, passed: records.filter(r => r.qcType === 'FQC' && r.result === '合格').length },
    OQC: { total: records.filter(r => r.qcType === 'OQC').length, passed: records.filter(r => r.qcType === 'OQC' && r.result === '合格').length },
  };

  return (
    <DashboardLayout>
      <div className="max-w-full mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">品质管理</h1>
              <p className="text-muted-foreground text-sm">IQC来料检验、IPQC制程检验、FQC终检、OQC出货检验</p>
            </div>
          </div>
          <Button onClick={() => router.push('/dashboard/quality/create')}>
            <Plus className="w-4 h-4 mr-2" />新增检验
          </Button>
        </div>
        
        {/* 统计卡片 */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">检验总数</p>
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
                  <p className="text-sm text-muted-foreground">合格数</p>
                  <p className="text-2xl font-bold text-green-600">{stats.passed}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">不合格数</p>
                  <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-400" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">平均良品率</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.avgPassRate}%</p>
                </div>
                <TrendingUp className="w-8 h-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground mb-2">各类型检验</div>
              <div className="space-y-1 text-xs">
                {Object.entries(typeStats).map(([type, data]) => (
                  <div key={type} className="flex justify-between">
                    <span>{qcTypeLabels[type as QCType]}</span>
                    <span>{data.passed}/{data.total}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">全部检验</TabsTrigger>
            <TabsTrigger value="IQC">IQC来料检验</TabsTrigger>
            <TabsTrigger value="IPQC">IPQC制程检验</TabsTrigger>
            <TabsTrigger value="FQC">FQC终检</TabsTrigger>
            <TabsTrigger value="OQC">OQC出货检验</TabsTrigger>
            <TabsTrigger value="defects">不良现象库</TabsTrigger>
          </TabsList>
          
          {[{ value: 'all', filter: '全部' }, { value: 'IQC', filter: 'IQC' }, { value: 'IPQC', filter: 'IPQC' }, { value: 'FQC', filter: 'FQC' }, { value: 'OQC', filter: 'OQC' }].map(tab => (
            <TabsContent key={tab.value} value={tab.value}>
              {/* 查询区 */}
              <Card>
                <CardContent className="p-4">
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div>
                      <Label>检验类型</Label>
                      <Select value={tab.value === 'all' ? searchType : tab.value} onValueChange={setSearchType} disabled={tab.value !== 'all'}>
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="全部">全部</SelectItem>
                          <SelectItem value="IQC">IQC来料检验</SelectItem>
                          <SelectItem value="IPQC">IPQC制程检验</SelectItem>
                          <SelectItem value="FQC">FQC终检</SelectItem>
                          <SelectItem value="OQC">OQC出货检验</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>订单号</Label>
                      <Input placeholder="请输入" value={searchOrderNo} onChange={(e) => setSearchOrderNo(e.target.value)} className="mt-1" />
                    </div>
                    <div>
                      <Label>检验结果</Label>
                      <Select value={searchResult} onValueChange={setSearchResult}>
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="全部">全部</SelectItem>
                          <SelectItem value="合格">合格</SelectItem>
                          <SelectItem value="不合格">不合格</SelectItem>
                          <SelectItem value="待检">待检</SelectItem>
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
                        <TableHead>检验单号</TableHead>
                        <TableHead>检验类型</TableHead>
                        <TableHead>订单号</TableHead>
                        <TableHead>款号</TableHead>
                        <TableHead className="text-right">检验数</TableHead>
                        <TableHead className="text-right">合格数</TableHead>
                        <TableHead className="text-right">不良数</TableHead>
                        <TableHead className="text-right">良品率</TableHead>
                        <TableHead>结果</TableHead>
                        <TableHead>检验人</TableHead>
                        <TableHead>检验时间</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRecords.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={11} className="text-center py-12 text-muted-foreground">暂无检验记录</TableCell>
                        </TableRow>
                      ) : (
                        filteredRecords.map(record => (
                          <TableRow key={record.id}>
                            <TableCell className="font-medium">{record.qcNo}</TableCell>
                            <TableCell><Badge variant="outline">{qcTypeLabels[record.qcType]}</Badge></TableCell>
                            <TableCell>{record.orderNo}</TableCell>
                            <TableCell>{record.styleNo}</TableCell>
                            <TableCell className="text-right">{record.inspectQuantity}</TableCell>
                            <TableCell className="text-right text-green-600">{record.passQuantity}</TableCell>
                            <TableCell className="text-right text-red-600">{record.failQuantity}</TableCell>
                            <TableCell className="text-right font-medium">{record.passRate}%</TableCell>
                            <TableCell><Badge className={resultColors[record.result]}>{record.result}</Badge></TableCell>
                            <TableCell>{record.inspector}</TableCell>
                            <TableCell className="text-sm">{record.inspectTime}</TableCell>
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
            </TabsContent>
          ))}
          
          <TabsContent value="defects">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">不良现象库</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {['线头', '脏污', '破洞', '色差', '尺寸偏差', '跳线', '断线', '油污', '印花不良', '绣花不良'].map(defect => (
                    <Card key={defect}>
                      <CardContent className="p-4 text-center">
                        <div className="text-lg font-medium">{defect}</div>
                        <div className="text-sm text-muted-foreground mt-1">
                          出现次数: {Math.floor(Math.random() * 50)}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
