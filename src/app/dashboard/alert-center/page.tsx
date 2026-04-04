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
import { Bell, AlertTriangle, CheckCircle, Clock, Package, DollarSign, Users, Truck, RotateCcw } from 'lucide-react';
import {
  type SystemAlert,
  type AlertType,
  type AlertLevel,
  getSystemAlerts,
  saveSystemAlert,
} from '@/types/production-advanced';

const alertLevelColors: Record<AlertLevel, string> = {
  '低': 'bg-blue-100 text-blue-700',
  '中': 'bg-yellow-100 text-yellow-700',
  '高': 'bg-orange-100 text-orange-700',
  '紧急': 'bg-red-100 text-red-700',
};

const alertTypeIcons: Record<AlertType, React.ElementType> = {
  '交期预警': Clock,
  '库存预警': Package,
  '超领预警': Package,
  '超成本预警': DollarSign,
  '待审核预警': CheckCircle,
  '外协超期预警': Truck,
  '停工待料预警': AlertTriangle,
  '返工过多预警': RotateCcw,
};

export default function AlertCenterPage() {
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [activeTab, setActiveTab] = useState('all');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [filterLevel, setFilterLevel] = useState('全部');
  const [filterStatus, setFilterStatus] = useState('全部');

  const loadData = () => {
    setAlerts(getSystemAlerts());
  };

  useEffect(() => {
    loadData();
  }, []);
  
  const handleProcess = (alert: SystemAlert) => {
    alert.status = '已处理';
    alert.handledBy = 'admin';
    alert.handledAt = new Date().toLocaleString('zh-CN');
    saveSystemAlert(alert);
    loadData();
  };
  
  const handleIgnore = (alert: SystemAlert) => {
    alert.status = '已忽略';
    alert.handledBy = 'admin';
    alert.handledAt = new Date().toLocaleString('zh-CN');
    saveSystemAlert(alert);
    loadData();
  };
  
  const filteredAlerts = alerts.filter(a => {
    if (searchKeyword && !a.title.includes(searchKeyword) && !a.content.includes(searchKeyword)) return false;
    if (filterLevel !== '全部' && a.alertLevel !== filterLevel) return false;
    if (filterStatus !== '全部' && a.status !== filterStatus) return false;
    
    if (activeTab !== 'all') {
      const tabMap: Record<string, AlertType[]> = {
        'delivery': ['交期预警'],
        'stock': ['库存预警', '超领预警'],
        'cost': ['超成本预警'],
        'audit': ['待审核预警'],
        'outsource': ['外协超期预警'],
        'production': ['停工待料预警', '返工过多预警'],
      };
      if (!tabMap[activeTab]?.includes(a.alertType)) return false;
    }
    
    return true;
  });
  
  const stats = {
    total: alerts.length,
    pending: alerts.filter(a => a.status === '待处理').length,
    processed: alerts.filter(a => a.status === '已处理').length,
    urgent: alerts.filter(a => a.alertLevel === '紧急' && a.status === '待处理').length,
  };
  
  const alertsByType: Record<AlertType, number> = {
    '交期预警': alerts.filter(a => a.alertType === '交期预警' && a.status === '待处理').length,
    '库存预警': alerts.filter(a => a.alertType === '库存预警' && a.status === '待处理').length,
    '超领预警': alerts.filter(a => a.alertType === '超领预警' && a.status === '待处理').length,
    '超成本预警': alerts.filter(a => a.alertType === '超成本预警' && a.status === '待处理').length,
    '待审核预警': alerts.filter(a => a.alertType === '待审核预警' && a.status === '待处理').length,
    '外协超期预警': alerts.filter(a => a.alertType === '外协超期预警' && a.status === '待处理').length,
    '停工待料预警': alerts.filter(a => a.alertType === '停工待料预警' && a.status === '待处理').length,
    '返工过多预警': alerts.filter(a => a.alertType === '返工过多预警' && a.status === '待处理').length,
  };

  return (
    <DashboardLayout>
      <div className="max-w-full mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <Bell className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">智能预警中心</h1>
              <p className="text-muted-foreground text-sm">所有预警统一展示与处理</p>
            </div>
          </div>
          {stats.urgent > 0 && (
            <Badge className="bg-red-100 text-red-700 text-lg px-4 py-2">
              <AlertTriangle className="w-4 h-4 mr-2" />紧急预警 {stats.urgent}
            </Badge>
          )}
        </div>
        
        {/* 统计卡片 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">预警总数</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <Bell className="w-8 h-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card className={stats.pending > 0 ? 'border-yellow-300' : ''}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">待处理</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">已处理</p>
                  <p className="text-2xl font-bold text-green-600">{stats.processed}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">紧急预警</p>
                  <p className="text-2xl font-bold text-red-600">{stats.urgent}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-400" />
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* 预警类型统计 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">预警类型分布</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
              {(Object.entries(alertsByType) as [AlertType, number][]).map(([type, count]) => {
                const Icon = alertTypeIcons[type];
                return (
                  <div 
                    key={type} 
                    className={`text-center p-3 rounded-lg border ${count > 0 ? 'bg-red-50 border-red-200' : 'bg-muted/50'}`}
                  >
                    <Icon className={`w-6 h-6 mx-auto mb-1 ${count > 0 ? 'text-red-600' : 'text-muted-foreground'}`} />
                    <p className="text-xs text-muted-foreground">{type.replace('预警', '')}</p>
                    <p className={`text-lg font-bold ${count > 0 ? 'text-red-600' : ''}`}>{count}</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
        
        {/* 筛选区 */}
        <Card>
          <CardContent className="p-4">
            <div className="flex gap-4 items-center">
              <div className="flex-1">
                <Input placeholder="搜索预警标题或内容" value={searchKeyword} onChange={(e) => setSearchKeyword(e.target.value)} />
              </div>
              <Select value={filterLevel} onValueChange={setFilterLevel}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="预警级别" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="全部">全部级别</SelectItem>
                  <SelectItem value="低">低</SelectItem>
                  <SelectItem value="中">中</SelectItem>
                  <SelectItem value="高">高</SelectItem>
                  <SelectItem value="紧急">紧急</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="全部">全部状态</SelectItem>
                  <SelectItem value="待处理">待处理</SelectItem>
                  <SelectItem value="已处理">已处理</SelectItem>
                  <SelectItem value="已忽略">已忽略</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={loadData}>刷新</Button>
            </div>
          </CardContent>
        </Card>
        
        {/* 预警列表 */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-24">级别</TableHead>
                  <TableHead className="w-28">预警类型</TableHead>
                  <TableHead>标题</TableHead>
                  <TableHead>内容</TableHead>
                  <TableHead className="w-20">状态</TableHead>
                  <TableHead>时间</TableHead>
                  <TableHead className="w-32">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAlerts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                      <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-400" />
                      暂无预警
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAlerts.map(alert => {
                    const Icon = alertTypeIcons[alert.alertType];
                    return (
                      <TableRow key={alert.id} className={alert.status === '待处理' && alert.alertLevel === '紧急' ? 'bg-red-50' : ''}>
                        <TableCell>
                          <Badge className={alertLevelColors[alert.alertLevel]}>{alert.alertLevel}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Icon className="w-4 h-4" />
                            {alert.alertType}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{alert.title}</TableCell>
                        <TableCell className="text-sm text-muted-foreground max-w-xs truncate">{alert.content}</TableCell>
                        <TableCell>
                          <Badge className={
                            alert.status === '待处理' ? 'bg-yellow-100 text-yellow-700' :
                            alert.status === '已处理' ? 'bg-green-100 text-green-700' :
                            'bg-gray-100 text-gray-700'
                          }>
                            {alert.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">{alert.createdAt}</TableCell>
                        <TableCell>
                          {alert.status === '待处理' && (
                            <div className="flex gap-1">
                              <Button size="sm" variant="default" onClick={() => handleProcess(alert)}>处理</Button>
                              <Button size="sm" variant="ghost" onClick={() => handleIgnore(alert)}>忽略</Button>
                            </div>
                          )}
                          {alert.status !== '待处理' && (
                            <span className="text-sm text-muted-foreground">{alert.handledBy}</span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
            <div className="p-4 border-t text-sm text-muted-foreground">
              共 {filteredAlerts.length} 条预警
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
