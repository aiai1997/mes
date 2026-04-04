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
import { Bell, CheckCircle, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  type AlertMessage,
  type AlertType,
  type AlertLevel,
  type AlertStatus,
  getAlertMessages,
  getUnreadAlerts,
  markAlertRead,
  initMiscData,
} from '@/types/misc';

const alertTypeLabels: Record<AlertType, string> = {
  '订单交期': '订单交期',
  '物料预警': '物料预警',
  '生产异常': '生产异常',
  '质量异常': '质量异常',
  '外协超期': '外协超期',
  '质检超时': '质检超时',
};

const levelColors: Record<AlertLevel, string> = {
  '提示': 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  '警告': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
  '紧急': 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
};

const levelIcons: Record<AlertLevel, React.ElementType> = {
  '提示': Info,
  '警告': AlertTriangle,
  '紧急': AlertCircle,
};

export default function AlertPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<AlertMessage[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  
  const [searchType, setSearchType] = useState('全部');
  const [searchLevel, setSearchLevel] = useState('全部');
  const [searchStatus, setSearchStatus] = useState('全部');

  const loadData = () => {
    setMessages(getAlertMessages());
    setUnreadCount(getUnreadAlerts().length);
  };

  useEffect(() => {
    initMiscData();
    loadData();
  }, []);
  
  const filteredMessages = messages.filter(m => {
    if (searchType !== '全部' && m.alertType !== searchType) return false;
    if (searchLevel !== '全部' && m.alertLevel !== searchLevel) return false;
    if (searchStatus !== '全部' && m.status !== searchStatus) return false;
    return true;
  });
  
  const handleMarkRead = (id: string) => {
    markAlertRead(id);
    loadData();
  };
  
  const handleMarkAllRead = () => {
    messages.filter(m => m.status === '未读').forEach(m => markAlertRead(m.id));
    loadData();
  };
  
  const handleReset = () => {
    setSearchType('全部');
    setSearchLevel('全部');
    setSearchStatus('全部');
  };
  
  const stats = {
    total: messages.length,
    unread: messages.filter(m => m.status === '未读').length,
    tip: messages.filter(m => m.alertLevel === '提示').length,
    warning: messages.filter(m => m.alertLevel === '警告').length,
    urgent: messages.filter(m => m.alertLevel === '紧急').length,
  };

  return (
    <DashboardLayout>
      <div className="max-w-full mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center relative">
              <Bell className="w-6 h-6 text-primary-foreground" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">预警消息中心</h1>
              <p className="text-muted-foreground text-sm">订单交期、物料预警、生产异常等自动提醒</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleMarkAllRead}>
            <CheckCircle className="w-4 h-4 mr-2" />全部已读
          </Button>
        </div>
        
        {/* 统计卡片 */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">消息总数</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <Bell className="w-8 h-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">未读消息</p>
                  <p className="text-2xl font-bold text-red-600">{stats.unread}</p>
                </div>
                <AlertCircle className="w-8 h-8 text-red-400" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">提示</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.tip}</p>
                </div>
                <Info className="w-8 h-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">警告</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.warning}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">紧急</p>
                  <p className="text-2xl font-bold text-red-600">{stats.urgent}</p>
                </div>
                <AlertCircle className="w-8 h-8 text-red-400" />
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* 查询区 */}
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div>
                <Label>预警类型</Label>
                <Select value={searchType} onValueChange={setSearchType}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="全部">全部</SelectItem>
                    <SelectItem value="订单交期">订单交期</SelectItem>
                    <SelectItem value="物料预警">物料预警</SelectItem>
                    <SelectItem value="生产异常">生产异常</SelectItem>
                    <SelectItem value="质量异常">质量异常</SelectItem>
                    <SelectItem value="外协超期">外协超期</SelectItem>
                    <SelectItem value="质检超时">质检超时</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>预警级别</Label>
                <Select value={searchLevel} onValueChange={setSearchLevel}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="全部">全部</SelectItem>
                    <SelectItem value="提示">提示</SelectItem>
                    <SelectItem value="警告">警告</SelectItem>
                    <SelectItem value="紧急">紧急</SelectItem>
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
                    <SelectItem value="未读">未读</SelectItem>
                    <SelectItem value="已读">已读</SelectItem>
                    <SelectItem value="已处理">已处理</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end gap-2">
                <Button onClick={loadData} className="flex-1">查询</Button>
                <Button variant="outline" onClick={handleReset}>重置</Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* 消息列表 */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">级别</TableHead>
                  <TableHead>预警类型</TableHead>
                  <TableHead>标题</TableHead>
                  <TableHead>内容</TableHead>
                  <TableHead>关联单号</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>时间</TableHead>
                  <TableHead className="w-20">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMessages.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">暂无预警消息</TableCell>
                  </TableRow>
                ) : (
                  filteredMessages.map(msg => {
                    const LevelIcon = levelIcons[msg.alertLevel];
                    return (
                      <TableRow key={msg.id} className={msg.status === '未读' ? 'bg-primary/5' : ''}>
                        <TableCell>
                          <LevelIcon className={`w-5 h-5 ${
                            msg.alertLevel === '紧急' ? 'text-red-500' :
                            msg.alertLevel === '警告' ? 'text-yellow-500' : 'text-blue-500'
                          }`} />
                        </TableCell>
                        <TableCell>{alertTypeLabels[msg.alertType]}</TableCell>
                        <TableCell className="font-medium">{msg.title}</TableCell>
                        <TableCell className="max-w-xs truncate">{msg.content}</TableCell>
                        <TableCell>
                          {msg.relatedNo && (
                            <Button variant="link" className="h-auto p-0" onClick={() => router.push(`/dashboard/${msg.relatedType?.toLowerCase() || ''}`)}>
                              {msg.relatedNo}
                            </Button>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge className={msg.status === '未读' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}>
                            {msg.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">{msg.createdAt}</TableCell>
                        <TableCell>
                          {msg.status === '未读' && (
                            <Button size="sm" variant="ghost" onClick={() => handleMarkRead(msg.id)}>
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
            <div className="p-4 border-t text-sm text-muted-foreground">
              共 {filteredMessages.length} 条消息
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
