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
import { FlaskConical, Plus, Eye, Edit, RotateCcw, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface FabricTest {
  id: string;
  testNo: string;
  fabricCode: string;
  fabricName: string;
  supplier: string;
  testItems: string[];
  results: Record<string, { value: string; status: '合格' | '不合格' }>;
  conclusion: '合格' | '不合格' | '待定';
  tester: string;
  testDate: string;
  status: '待测试' | '测试中' | '已完成';
}

const mockData: FabricTest[] = [
  { id: '1', testNo: 'FT-20240101-001', fabricCode: 'F-001', fabricName: '纯棉府绸', supplier: '纺织供应商A', testItems: ['色牢度', '缩水率', 'PH值'], results: { '色牢度': { value: '4级', status: '合格' }, '缩水率': { value: '3%', status: '合格' }, 'PH值': { value: '6.5', status: '合格' } }, conclusion: '合格', tester: '质检员张三', testDate: '2024-01-15', status: '已完成' },
  { id: '2', testNo: 'FT-20240102-001', fabricCode: 'F-002', fabricName: '涤纶斜纹', supplier: '纺织供应商B', testItems: ['色牢度', '起毛起球'], results: { '色牢度': { value: '3级', status: '不合格' } }, conclusion: '不合格', tester: '质检员李四', testDate: '2024-01-16', status: '已完成' },
  { id: '3', testNo: 'FT-20240103-001', fabricCode: 'F-003', fabricName: '真丝缎', supplier: '纺织供应商C', testItems: ['色牢度', '强力'], results: {}, conclusion: '待定', tester: '质检员王五', testDate: '2024-01-17', status: '待测试' },
];

const statusColors = {
  '待测试': 'bg-gray-100 text-gray-700',
  '测试中': 'bg-blue-100 text-blue-700',
  '已完成': 'bg-green-100 text-green-700',
};

const conclusionColors = {
  '合格': 'bg-green-100 text-green-700',
  '不合格': 'bg-red-100 text-red-700',
  '待定': 'bg-yellow-100 text-yellow-700',
};

export default function FabricTestPage() {
  const router = useRouter();
  const [tests, setTests] = useState<FabricTest[]>([]);
  const [searchNo, setSearchNo] = useState('');
  const [searchStatus, setSearchStatus] = useState('全部');
  const [searchConclusion, setSearchConclusion] = useState('全部');
  
  useEffect(() => {
    setTests(mockData);
  }, []);
  
  const handleReset = () => {
    setSearchNo('');
    setSearchStatus('全部');
    setSearchConclusion('全部');
  };
  
  const filteredTests = tests.filter(t => {
    if (searchNo && !t.testNo.includes(searchNo) && !t.fabricCode.includes(searchNo)) return false;
    if (searchStatus !== '全部' && t.status !== searchStatus) return false;
    if (searchConclusion !== '全部' && t.conclusion !== searchConclusion) return false;
    return true;
  });
  
  const stats = {
    total: tests.length,
    pending: tests.filter(t => t.status === '待测试').length,
    completed: tests.filter(t => t.status === '已完成').length,
    qualified: tests.filter(t => t.conclusion === '合格').length,
    unqualified: tests.filter(t => t.conclusion === '不合格').length,
  };

  return (
    <DashboardLayout>
      <div className="max-w-full mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <FlaskConical className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">面料测试</h1>
              <p className="text-muted-foreground text-sm">面料物理/化学性能测试管理</p>
            </div>
          </div>
          <Button onClick={() => router.push('/dashboard/fabric-test/create')}>
            <Plus className="w-4 h-4 mr-2" />新增测试
          </Button>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">测试总数</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <FlaskConical className="w-8 h-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">待测试</p>
                  <p className="text-2xl font-bold text-gray-600">{stats.pending}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">已合格</p>
                  <p className="text-2xl font-bold text-green-600">{stats.qualified}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">不合格</p>
                  <p className="text-2xl font-bold text-red-600">{stats.unqualified}</p>
                </div>
                <XCircle className="w-8 h-8 text-red-400" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">合格率</p>
                  <p className="text-2xl font-bold">{stats.completed > 0 ? ((stats.qualified / stats.completed) * 100).toFixed(0) : 0}%</p>
                </div>
                <CheckCircle className="w-8 h-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div>
                <Label>测试单号/面料编号</Label>
                <Input placeholder="请输入" value={searchNo} onChange={(e) => setSearchNo(e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label>测试状态</Label>
                <Select value={searchStatus} onValueChange={setSearchStatus}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="全部">全部</SelectItem>
                    <SelectItem value="待测试">待测试</SelectItem>
                    <SelectItem value="测试中">测试中</SelectItem>
                    <SelectItem value="已完成">已完成</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>结论</Label>
                <Select value={searchConclusion} onValueChange={setSearchConclusion}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="全部">全部</SelectItem>
                    <SelectItem value="合格">合格</SelectItem>
                    <SelectItem value="不合格">不合格</SelectItem>
                    <SelectItem value="待定">待定</SelectItem>
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
                  <TableHead>测试单号</TableHead>
                  <TableHead>面料编号</TableHead>
                  <TableHead>面料名称</TableHead>
                  <TableHead>供应商</TableHead>
                  <TableHead>测试项目</TableHead>
                  <TableHead>测试结果</TableHead>
                  <TableHead>结论</TableHead>
                  <TableHead>测试员</TableHead>
                  <TableHead>测试日期</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead className="w-20">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center py-12 text-muted-foreground">暂无数据</TableCell>
                  </TableRow>
                ) : (
                  filteredTests.map(t => (
                    <TableRow key={t.id}>
                      <TableCell className="font-medium">{t.testNo}</TableCell>
                      <TableCell>{t.fabricCode}</TableCell>
                      <TableCell>{t.fabricName}</TableCell>
                      <TableCell>{t.supplier}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {t.testItems.map((item, i) => (
                            <Badge key={i} variant="outline" className="text-xs">{item}</Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        {Object.keys(t.results).length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {Object.entries(t.results).map(([key, val]) => (
                              <Badge key={key} className={val.status === '合格' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}>
                                {key}: {val.value}
                              </Badge>
                            ))}
                          </div>
                        ) : '-'}
                      </TableCell>
                      <TableCell><Badge className={conclusionColors[t.conclusion]}>{t.conclusion}</Badge></TableCell>
                      <TableCell>{t.tester}</TableCell>
                      <TableCell>{t.testDate}</TableCell>
                      <TableCell><Badge className={statusColors[t.status]}>{t.status}</Badge></TableCell>
                      <TableCell>
                        <Button size="sm" variant="ghost"><Eye className="w-4 h-4" /></Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            <div className="p-4 border-t text-sm text-muted-foreground">共 {filteredTests.length} 条记录</div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
