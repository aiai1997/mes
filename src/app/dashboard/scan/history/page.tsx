'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  History,
  ScanLine,
  User,
  Package,
  CheckCircle,
  Clock,
  Calendar,
  ChevronDown,
  ChevronUp,
  Filter,
} from 'lucide-react';
import {
  type WorkReport,
  getWorkReports,
  initWorkshopData,
} from '@/types/workshop';

const statusColors: Record<string, string> = {
  '待审核': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
  '已审核': 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  '已结算': 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  '已作废': 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
};

export default function ScanHistoryPage() {
  const [reports, setReports] = useState<WorkReport[]>([]);
  const [filteredReports, setFilteredReports] = useState<WorkReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterDate, setFilterDate] = useState<string>('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    initWorkshopData();
    const allReports = getWorkReports();
    // 只显示当前用户的报工记录（模拟数据）
    setReports(allReports);
    setFilteredReports(allReports);
    setLoading(false);
  };

  useEffect(() => {
    let result = reports;
    
    if (filterStatus !== 'all') {
      result = result.filter(r => r.status === filterStatus);
    }
    if (filterDate) {
      result = result.filter(r => r.createdAt.startsWith(filterDate));
    }
    
    setFilteredReports(result);
  }, [reports, filterStatus, filterDate]);

  // 按日期分组
  const groupedByDate = filteredReports.reduce((acc, report) => {
    const date = report.createdAt.split(' ')[0];
    if (!acc[date]) acc[date] = [];
    acc[date].push(report);
    return acc;
  }, {} as Record<string, WorkReport[]>);

  // 计算统计数据
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayReports = reports.filter(r => r.createdAt.startsWith(todayStr));
  const todayStats = {
    count: todayReports.length,
    goodQty: todayReports.reduce((sum, r) => sum + r.goodQuantity, 0),
    pieceWage: todayReports.reduce((sum, r) => sum + r.pieceWage, 0),
  };

  const monthStr = new Date().toISOString().slice(0, 7);
  const monthReports = reports.filter(r => r.createdAt.startsWith(monthStr));
  const monthStats = {
    count: monthReports.length,
    goodQty: monthReports.reduce((sum, r) => sum + r.goodQuantity, 0),
    pieceWage: monthReports.reduce((sum, r) => sum + r.pieceWage, 0),
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* 顶部状态栏 */}
      <div className="bg-primary text-primary-foreground px-4 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <History className="w-6 h-6" />
          <span className="font-bold text-lg">报工记录</span>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-primary-foreground"
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter className="w-4 h-4 mr-1" />
          筛选
        </Button>
      </div>

      <div className="max-w-lg mx-auto p-4 space-y-4 pb-20">
        {/* 筛选条件 */}
        {showFilters && (
          <Card>
            <CardContent className="p-4 space-y-3">
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">状态</label>
                <div className="flex gap-2 flex-wrap">
                  <Button size="sm" variant={filterStatus === 'all' ? 'default' : 'outline'} onClick={() => setFilterStatus('all')}>全部</Button>
                  <Button size="sm" variant={filterStatus === '待审核' ? 'default' : 'outline'} onClick={() => setFilterStatus('待审核')}>待审核</Button>
                  <Button size="sm" variant={filterStatus === '已审核' ? 'default' : 'outline'} onClick={() => setFilterStatus('已审核')}>已审核</Button>
                  <Button size="sm" variant={filterStatus === '已结算' ? 'default' : 'outline'} onClick={() => setFilterStatus('已结算')}>已结算</Button>
                </div>
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">日期</label>
                <Input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} />
              </div>
            </CardContent>
          </Card>
        )}

        {/* 统计卡片 */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="bg-blue-50 dark:bg-blue-950/30">
            <CardContent className="p-3">
              <div className="text-xs text-muted-foreground">今日报工</div>
              <div className="text-xl font-bold">{todayStats.count} 次</div>
              <div className="text-xs text-muted-foreground">良品 {todayStats.goodQty} 件</div>
              <div className="text-sm font-medium text-primary mt-1">¥{todayStats.pieceWage.toFixed(2)}</div>
            </CardContent>
          </Card>
          <Card className="bg-green-50 dark:bg-green-950/30">
            <CardContent className="p-3">
              <div className="text-xs text-muted-foreground">本月报工</div>
              <div className="text-xl font-bold">{monthStats.count} 次</div>
              <div className="text-xs text-muted-foreground">良品 {monthStats.goodQty} 件</div>
              <div className="text-sm font-medium text-green-600 mt-1">¥{monthStats.pieceWage.toFixed(2)}</div>
            </CardContent>
          </Card>
        </div>

        {/* 记录列表 */}
        {loading ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              加载中...
            </CardContent>
          </Card>
        ) : Object.keys(groupedByDate).length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              暂无报工记录
            </CardContent>
          </Card>
        ) : (
          Object.entries(groupedByDate).map(([date, items]) => (
            <div key={date}>
              <div className="flex items-center gap-2 text-sm text-muted-foreground px-1 mb-2">
                <Calendar className="w-4 h-4" />
                {date}
                <span className="ml-auto">{items.length} 条</span>
              </div>
              
              <div className="space-y-2">
                {items.map((report) => {
                  const isExpanded = expandedId === report.id;
                  return (
                    <Card key={report.id} className="overflow-hidden">
                      <CardContent 
                        className="p-3 cursor-pointer"
                        onClick={() => setExpandedId(isExpanded ? null : report.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                              <Package className="w-5 h-5 text-muted-foreground" />
                            </div>
                            <div>
                              <div className="font-medium">{report.bundleNo}</div>
                              <div className="text-xs text-muted-foreground">
                                {report.processName} · {report.createdAt.split(' ')[1]}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge className={statusColors[report.status]}>{report.status}</Badge>
                            <div className="text-sm font-medium mt-1">¥{report.pieceWage.toFixed(2)}</div>
                          </div>
                        </div>
                        
                        {isExpanded && (
                          <div className="mt-3 pt-3 border-t space-y-2 text-sm">
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <span className="text-muted-foreground">订单:</span>
                                <span className="ml-1">{report.orderNo}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">款号:</span>
                                <span className="ml-1">{report.styleNo}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">颜色:</span>
                                <span className="ml-1">{report.colorName}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">尺码:</span>
                                <Badge variant="outline" className="ml-1">{report.sizeName}</Badge>
                              </div>
                            </div>
                            <div className="grid grid-cols-3 gap-2 bg-muted/50 rounded p-2">
                              <div className="text-center">
                                <div className="text-lg font-bold text-green-600">{report.goodQuantity}</div>
                                <div className="text-xs text-muted-foreground">良品</div>
                              </div>
                              <div className="text-center">
                                <div className="text-lg font-bold text-orange-600">{report.reworkQuantity}</div>
                                <div className="text-xs text-muted-foreground">返工</div>
                              </div>
                              <div className="text-center">
                                <div className="text-lg font-bold text-red-600">{report.scrapQuantity}</div>
                                <div className="text-xs text-muted-foreground">报废</div>
                              </div>
                            </div>
                            <div className="flex justify-between text-muted-foreground">
                              <span>单价: ¥{report.processPrice}</span>
                              <span>班组: {report.team}</span>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {/* 底部导航 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t flex justify-around py-2 z-50">
        <Link href="/dashboard/scan" className="flex flex-col items-center text-muted-foreground">
          <ScanLine className="w-6 h-6" />
          <span className="text-xs mt-1">扫码</span>
        </Link>
        <Link href="/dashboard/scan/history" className="flex flex-col items-center text-primary">
          <History className="w-6 h-6" />
          <span className="text-xs mt-1">记录</span>
        </Link>
        <Link href="/dashboard/scan/worker" className="flex flex-col items-center text-muted-foreground">
          <User className="w-6 h-6" />
          <span className="text-xs mt-1">我的</span>
        </Link>
      </div>
    </div>
  );
}
