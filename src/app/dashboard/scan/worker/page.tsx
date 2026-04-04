'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  User,
  ScanLine,
  History,
  Settings,
  ChevronRight,
  CheckCircle,
  Clock,
  Calendar,
  DollarSign,
  Award,
  LogOut,
} from 'lucide-react';
import {
  getWorkReports,
  initWorkshopData,
} from '@/types/workshop';

// 模拟员工数据
const WORKERS = [
  { id: '1', name: '王五', team: '缝制一组', avatar: 'W' },
  { id: '2', name: '赵六', team: '缝制二组', avatar: 'Z' },
  { id: '3', name: '李四', team: '缝制一组', avatar: 'L' },
];

const TEAMS = ['缝制一组', '缝制二组', '缝制三组', '尾部组'];

export default function ScanWorkerPage() {
  const [currentWorker, setCurrentWorker] = useState(WORKERS[0]);
  const [team, setTeam] = useState(currentWorker.team);
  const [editMode, setEditMode] = useState(false);
  const [stats, setStats] = useState({
    todayCount: 0,
    todayWage: 0,
    monthCount: 0,
    monthWage: 0,
    totalWage: 0,
  });

  useEffect(() => {
    loadData();
  }, [currentWorker]);

  const loadData = () => {
    initWorkshopData();
    const reports = getWorkReports().filter(r => r.worker === currentWorker.name);
    
    const todayStr = new Date().toISOString().slice(0, 10);
    const todayReports = reports.filter(r => r.createdAt.startsWith(todayStr));
    
    const monthStr = new Date().toISOString().slice(0, 7);
    const monthReports = reports.filter(r => r.createdAt.startsWith(monthStr));
    
    setStats({
      todayCount: todayReports.length,
      todayWage: todayReports.reduce((sum, r) => sum + r.pieceWage, 0),
      monthCount: monthReports.length,
      monthWage: monthReports.reduce((sum, r) => sum + r.pieceWage, 0),
      totalWage: reports.reduce((sum, r) => sum + r.pieceWage, 0),
    });
  };

  const handleSave = () => {
    setCurrentWorker(prev => ({ ...prev, team }));
    setEditMode(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* 顶部状态栏 */}
      <div className="bg-primary text-primary-foreground px-4 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <User className="w-6 h-6" />
          <span className="font-bold text-lg">我的信息</span>
        </div>
      </div>

      <div className="max-w-lg mx-auto p-4 space-y-4 pb-20">
        {/* 用户卡片 */}
        <Card className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold">
                {currentWorker.avatar}
              </div>
              <div>
                <div className="text-xl font-bold">{currentWorker.name}</div>
                <div className="opacity-80">{currentWorker.team}</div>
                <Badge className="bg-white/20 text-white mt-1">
                  <Award className="w-3 h-3 mr-1" />
                  技术工
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 今日数据 */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-5 h-5 text-muted-foreground" />
              <span className="font-medium">今日数据</span>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-primary">{stats.todayCount}</div>
                <div className="text-xs text-muted-foreground">报工次数</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">¥{stats.todayWage.toFixed(2)}</div>
                <div className="text-xs text-muted-foreground">今日工资</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">-</div>
                <div className="text-xs text-muted-foreground">排名</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 本月数据 */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <DollarSign className="w-5 h-5 text-muted-foreground" />
              <span className="font-medium">本月统计</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-muted/50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold">{stats.monthCount}</div>
                <div className="text-xs text-muted-foreground">报工次数</div>
              </div>
              <div className="bg-green-50 dark:bg-green-950/30 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-green-600">¥{stats.monthWage.toFixed(2)}</div>
                <div className="text-xs text-muted-foreground">本月工资</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 设置 */}
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              <div className="p-4 flex items-center justify-between cursor-pointer hover:bg-muted/50" onClick={() => setEditMode(true)}>
                <div className="flex items-center gap-3">
                  <Settings className="w-5 h-5 text-muted-foreground" />
                  <span>个人信息设置</span>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </div>
              
              <div className="p-4 flex items-center justify-between cursor-pointer hover:bg-muted/50">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-muted-foreground" />
                  <span>工时记录</span>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </div>
              
              <div className="p-4 flex items-center justify-between cursor-pointer hover:bg-muted/50">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-muted-foreground" />
                  <span>技能认证</span>
                </div>
                <Badge variant="secondary">已认证</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 切换员工（演示用） */}
        <Card>
          <CardContent className="p-4">
            <Label className="text-sm text-muted-foreground mb-2 block">切换员工（演示）</Label>
            <div className="flex gap-2">
              {WORKERS.map(w => (
                <Button
                  key={w.id}
                  variant={currentWorker.id === w.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCurrentWorker(w)}
                >
                  {w.name}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 退出按钮 */}
        <Button variant="outline" className="w-full" asChild>
          <Link href="/dashboard">
            <LogOut className="w-4 h-4 mr-2" />
            返回管理后台
          </Link>
        </Button>
      </div>

      {/* 底部导航 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t flex justify-around py-2 z-50">
        <Link href="/dashboard/scan" className="flex flex-col items-center text-muted-foreground">
          <ScanLine className="w-6 h-6" />
          <span className="text-xs mt-1">扫码</span>
        </Link>
        <Link href="/dashboard/scan/history" className="flex flex-col items-center text-muted-foreground">
          <History className="w-6 h-6" />
          <span className="text-xs mt-1">记录</span>
        </Link>
        <Link href="/dashboard/scan/worker" className="flex flex-col items-center text-primary">
          <User className="w-6 h-6" />
          <span className="text-xs mt-1">我的</span>
        </Link>
      </div>
    </div>
  );
}
