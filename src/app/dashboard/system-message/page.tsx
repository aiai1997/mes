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
import { Bell, MessageSquare, CheckCircle, Clock, RotateCcw, Trash2 } from 'lucide-react';
import {
  type SystemMessage,
  type MessageType,
  getSystemMessages,
  markMessageAsRead,
} from '@/types/production-advanced';

const typeColors: Record<MessageType, string> = {
  '审核通知': 'bg-blue-100 text-blue-700',
  '发料通知': 'bg-green-100 text-green-700',
  '预警通知': 'bg-yellow-100 text-yellow-700',
  '超期通知': 'bg-red-100 text-red-700',
  '系统通知': 'bg-gray-100 text-gray-700',
};

export default function SystemMessagePage() {
  const [messages, setMessages] = useState<SystemMessage[]>([]);
  const [activeTab, setActiveTab] = useState('all');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [filterType, setFilterType] = useState('全部');
  const [filterRead, setFilterRead] = useState('全部');
  
  useEffect(() => {
    loadData();
  }, []);
  
  const loadData = () => {
    setMessages(getSystemMessages());
  };
  
  const handleMarkAsRead = (id: string) => {
    markMessageAsRead(id);
    loadData();
  };
  
  const handleMarkAllAsRead = () => {
    messages.filter(m => !m.isRead).forEach(m => markMessageAsRead(m.id));
    loadData();
  };
  
  const filteredMessages = messages.filter(m => {
    if (searchKeyword && !m.title.includes(searchKeyword) && !m.content.includes(searchKeyword)) return false;
    if (filterType !== '全部' && m.type !== filterType) return false;
    if (filterRead === '未读' && m.isRead) return false;
    if (filterRead === '已读' && !m.isRead) return false;
    
    if (activeTab !== 'all') {
      const tabMap: Record<string, string> = {
        'audit': '审核通知',
        'issue': '发料通知',
        'alert': '预警通知',
        'overdue': '超期通知',
      };
      if (m.type !== tabMap[activeTab]) return false;
    }
    
    return true;
  });
  
  const stats = {
    total: messages.length,
    unread: messages.filter(m => !m.isRead).length,
    audit: messages.filter(m => m.type === '审核通知' && !m.isRead).length,
    issue: messages.filter(m => m.type === '发料通知' && !m.isRead).length,
    alert: messages.filter(m => m.type === '预警通知' && !m.isRead).length,
    overdue: messages.filter(m => m.type === '超期通知' && !m.isRead).length,
  };

  return (
    <DashboardLayout>
      <div className="max-w-full mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center relative">
              <Bell className="w-6 h-6 text-primary-foreground" />
              {stats.unread > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {stats.unread > 9 ? '9+' : stats.unread}
                </span>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">系统消息</h1>
              <p className="text-muted-foreground text-sm">站内消息通知中心</p>
            </div>
          </div>
          {stats.unread > 0 && (
            <Button variant="outline" onClick={handleMarkAllAsRead}>
              <CheckCircle className="w-4 h-4 mr-2" />全部标记已读
            </Button>
          )}
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
                <MessageSquare className="w-8 h-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card className={stats.unread > 0 ? 'border-red-300' : ''}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">未读消息</p>
                  <p className="text-2xl font-bold text-red-600">{stats.unread}</p>
                </div>
                <Bell className="w-8 h-8 text-red-400" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">审核通知</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.audit}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">发料通知</p>
                  <p className="text-2xl font-bold text-green-600">{stats.issue}</p>
                </div>
                <Bell className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">预警/超期</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.alert + stats.overdue}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* 筛选区 */}
        <Card>
          <CardContent className="p-4">
            <div className="flex gap-4 items-center">
              <div className="flex-1">
                <Input placeholder="搜索消息标题或内容" value={searchKeyword} onChange={(e) => setSearchKeyword(e.target.value)} />
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="消息类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="全部">全部类型</SelectItem>
                  <SelectItem value="审核通知">审核通知</SelectItem>
                  <SelectItem value="发料通知">发料通知</SelectItem>
                  <SelectItem value="预警通知">预警通知</SelectItem>
                  <SelectItem value="超期通知">超期通知</SelectItem>
                  <SelectItem value="系统通知">系统通知</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterRead} onValueChange={setFilterRead}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="阅读状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="全部">全部</SelectItem>
                  <SelectItem value="未读">未读</SelectItem>
                  <SelectItem value="已读">已读</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={loadData}>刷新</Button>
            </div>
          </CardContent>
        </Card>
        
        {/* 消息列表 */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-24">类型</TableHead>
                  <TableHead>标题</TableHead>
                  <TableHead>内容</TableHead>
                  <TableHead>目标角色</TableHead>
                  <TableHead className="w-20">状态</TableHead>
                  <TableHead>时间</TableHead>
                  <TableHead className="w-24">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMessages.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                      <Bell className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                      暂无消息
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredMessages.map(msg => (
                    <TableRow key={msg.id} className={!msg.isRead ? 'bg-blue-50' : ''}>
                      <TableCell>
                        <Badge className={typeColors[msg.type]}>{msg.type}</Badge>
                      </TableCell>
                      <TableCell className="font-medium">{msg.title}</TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-xs truncate">{msg.content}</TableCell>
                      <TableCell>{msg.targetRole}</TableCell>
                      <TableCell>
                        {msg.isRead ? (
                          <Badge className="bg-gray-100 text-gray-700">已读</Badge>
                        ) : (
                          <Badge className="bg-red-100 text-red-700">未读</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm">{msg.createdAt}</TableCell>
                      <TableCell>
                        {!msg.isRead && (
                          <Button size="sm" variant="ghost" onClick={() => handleMarkAsRead(msg.id)}>
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
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
