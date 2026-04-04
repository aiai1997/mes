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
import { TrendingUp, Users, Target, Award, RotateCcw, BarChart3 } from 'lucide-react';
import {
  type EmployeePerformance,
  getEmployeePerformances,
} from '@/types/production-advanced';
import { getEmployees, type Employee } from '@/types/employee';

export default function EmployeePerformancePage() {
  const [performances, setPerformances] = useState<EmployeePerformance[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  
  const [searchMonth, setSearchMonth] = useState('');
  const [searchEmployee, setSearchEmployee] = useState('');
  const [searchTeam, setSearchTeam] = useState('全部');
  
  useEffect(() => {
    loadData();
  }, []);
  
  const loadData = () => {
    setPerformances(getEmployeePerformances());
    setEmployees(getEmployees());
  };
  
  const handleReset = () => {
    setSearchMonth('');
    setSearchEmployee('');
    setSearchTeam('全部');
  };
  
  const filteredPerformances = performances.filter(p => {
    if (searchMonth && !p.month.includes(searchMonth)) return false;
    if (searchEmployee && !p.employeeName.includes(searchEmployee)) return false;
    if (searchTeam !== '全部' && p.teamName !== searchTeam) return false;
    return true;
  });
  
  // 获取班组列表
  const teams = [...new Set(performances.map(p => p.teamName))];
  
  const stats = {
    totalEmployees: performances.length,
    avgScore: performances.length > 0 
      ? (performances.reduce((sum, p) => sum + p.totalScore, 0) / performances.length).toFixed(1)
      : '0',
    excellent: performances.filter(p => p.totalScore >= 90).length,
    good: performances.filter(p => p.totalScore >= 80 && p.totalScore < 90).length,
  };
  
  // 计算排名
  const rankedPerformances = [...filteredPerformances].sort((a, b) => b.totalScore - a.totalScore);

  return (
    <DashboardLayout>
      <div className="max-w-full mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">员工绩效评分</h1>
              <p className="text-muted-foreground text-sm">质量+效率+纪律综合评分</p>
            </div>
          </div>
          <Button>
            <BarChart3 className="w-4 h-4 mr-2" />生成报表
          </Button>
        </div>
        
        {/* 统计卡片 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">参评人数</p>
                  <p className="text-2xl font-bold">{stats.totalEmployees}</p>
                </div>
                <Users className="w-8 h-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">平均得分</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.avgScore}</p>
                </div>
                <Target className="w-8 h-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">优秀(≥90分)</p>
                  <p className="text-2xl font-bold text-green-600">{stats.excellent}</p>
                </div>
                <Award className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">良好(80-89分)</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.good}</p>
                </div>
                <Award className="w-8 h-8 text-orange-400" />
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* 查询区 */}
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div>
                <Label>月份</Label>
                <Input placeholder="如：2024-01" value={searchMonth} onChange={(e) => setSearchMonth(e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label>员工姓名</Label>
                <Input placeholder="请输入" value={searchEmployee} onChange={(e) => setSearchEmployee(e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label>班组</Label>
                <Select value={searchTeam} onValueChange={setSearchTeam}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="全部">全部</SelectItem>
                    {teams.map(t => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
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
                  <TableHead>排名</TableHead>
                  <TableHead>工号</TableHead>
                  <TableHead>姓名</TableHead>
                  <TableHead>班组</TableHead>
                  <TableHead>月份</TableHead>
                  <TableHead className="text-center">效率分</TableHead>
                  <TableHead className="text-center">质量分</TableHead>
                  <TableHead className="text-center">考勤分</TableHead>
                  <TableHead className="text-center">返工率</TableHead>
                  <TableHead className="text-center">报废率</TableHead>
                  <TableHead className="text-center">总分</TableHead>
                  <TableHead className="text-right">绩效奖金</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rankedPerformances.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={12} className="text-center py-12 text-muted-foreground">暂无绩效记录</TableCell>
                  </TableRow>
                ) : (
                  rankedPerformances.map((perf, index) => (
                    <TableRow key={perf.id}>
                      <TableCell>
                        {index < 3 ? (
                          <Badge className={
                            index === 0 ? 'bg-yellow-100 text-yellow-700' :
                            index === 1 ? 'bg-gray-100 text-gray-700' :
                            'bg-orange-100 text-orange-700'
                          }>
                            {index + 1}
                          </Badge>
                        ) : index + 1}
                      </TableCell>
                      <TableCell>{perf.employeeNo}</TableCell>
                      <TableCell className="font-medium">{perf.employeeName}</TableCell>
                      <TableCell>{perf.teamName}</TableCell>
                      <TableCell>{perf.month}</TableCell>
                      <TableCell className="text-center">
                        <span className={perf.efficiencyScore >= 80 ? 'text-green-600' : 'text-red-600'}>
                          {perf.efficiencyScore}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={perf.qualityScore >= 80 ? 'text-green-600' : 'text-red-600'}>
                          {perf.qualityScore}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">{perf.attendanceScore}</TableCell>
                      <TableCell className="text-center">
                        <span className={perf.reworkRate > 5 ? 'text-red-600' : ''}>
                          {perf.reworkRate.toFixed(1)}%
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={perf.scrapRate > 2 ? 'text-red-600' : ''}>
                          {perf.scrapRate.toFixed(1)}%
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge className={
                          perf.totalScore >= 90 ? 'bg-green-100 text-green-700' :
                          perf.totalScore >= 80 ? 'bg-blue-100 text-blue-700' :
                          perf.totalScore >= 60 ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }>
                          {perf.totalScore.toFixed(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">¥{perf.bonus.toFixed(2)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            <div className="p-4 border-t text-sm text-muted-foreground">
              共 {rankedPerformances.length} 条记录
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
