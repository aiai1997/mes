'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  UserPlus,
  Eye,
  Edit,
  Trash2,
  Key,
  Shield,
  Search,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { 
  getUsers, 
  deleteUser, 
  saveUsers,
  type User,
  type UserRole,
  ROLE_PERMISSIONS 
} from '@/types/user';

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [searchRole, setSearchRole] = useState('全部');
  const [searchKeyword, setSearchKeyword] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    const allUsers = getUsers();
    // 按创建时间倒序排列
    allUsers.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    setUsers(allUsers);
  };

  const filteredUsers = users.filter(u => {
    if (searchRole !== '全部' && u.role !== searchRole) return false;
    if (searchKeyword && !u.realName.includes(searchKeyword) && !u.username.includes(searchKeyword)) return false;
    return true;
  });

  const handleDelete = (id: string) => {
    if (confirm('确定要删除该用户吗？')) {
      deleteUser(id);
      loadUsers();
    }
  };

  const handleToggleStatus = (id: string) => {
    const users = getUsers();
    const user = users.find(u => u.id === id);
    if (user) {
      user.status = user.status === '启用' ? '禁用' : '启用';
      user.updatedAt = new Date().toISOString();
      const updatedUsers = getUsers().map(u => u.id === id ? user : u);
      saveUsers(updatedUsers);
      loadUsers();
    }
  };

  const stats = {
    total: users.length,
    active: users.filter(u => u.status === '启用').length,
    inactive: users.filter(u => u.status === '禁用').length,
  };

  const roleColors: Record<UserRole, string> = {
    '管理员': 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
    '业务员': 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    '跟单员': 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-300',
    '车间工人': 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    '组长': 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
    '财务': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
  };

  const statusColors: Record<string, string> = {
    '启用': 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    '禁用': 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
  };

  const roles: UserRole[] = ['管理员', '业务员', '跟单员', '车间工人', '组长', '财务'];

  return (
    <DashboardLayout>
      <div className="max-w-full mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">用户管理</h1>
              <p className="text-muted-foreground text-sm">管理系统登录账号、角色权限</p>
            </div>
          </div>
          <Button onClick={() => router.push('/dashboard/users/create')} className="gap-2">
            <UserPlus className="w-4 h-4" />新增用户
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">用户总数</p>
                  <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                  <Shield className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">启用用户</p>
                  <p className="text-2xl font-bold text-green-600">{stats.active}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                  <Key className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">禁用用户</p>
                  <p className="text-2xl font-bold text-red-600">{stats.inactive}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-4 items-end">
              <div>
                <Label>角色</Label>
                <Select value={searchRole} onValueChange={setSearchRole}>
                  <SelectTrigger className="mt-1 w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="全部">全部</SelectItem>
                    {roles.map(role => (
                      <SelectItem key={role} value={role}>{role}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1 max-w-xs">
                <Label>关键字</Label>
                <div className="relative mt-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    placeholder="用户名/姓名" 
                    value={searchKeyword} 
                    onChange={(e) => setSearchKeyword(e.target.value)} 
                    className="pl-9" 
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">#</TableHead>
                  <TableHead>登录账号</TableHead>
                  <TableHead>姓名</TableHead>
                  <TableHead>角色</TableHead>
                  <TableHead>部门</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>最后登录</TableHead>
                  <TableHead>创建时间</TableHead>
                  <TableHead className="w-32 text-center">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow key="empty">
                    <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                      暂无数据
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user, index) => (
                    <TableRow key={user.id}>
                      <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                      <TableCell className="font-medium">{user.username}</TableCell>
                      <TableCell>{user.realName}</TableCell>
                      <TableCell>
                        <Badge className={roleColors[user.role] || ''}>{user.role}</Badge>
                      </TableCell>
                      <TableCell>{user.department || '-'}</TableCell>
                      <TableCell>
                        <Badge 
                          className={statusColors[user.status] + ' cursor-pointer'}
                          onClick={() => handleToggleStatus(user.id)}
                        >
                          {user.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">{user.lastLogin || '-'}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">{user.createdAt}</TableCell>
                      <TableCell>
                        <div className="flex gap-1 justify-center">
                          <Button size="sm" variant="ghost" onClick={() => router.push(`/dashboard/users/${user.id}`)} title="查看">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => router.push(`/dashboard/users/${user.id}/edit`)} title="编辑">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => handleDelete(user.id)} title="删除" className="text-red-500 hover:text-red-600">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* 默认账号提示 */}
        <Card className="bg-muted/50">
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <Key className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium text-foreground">默认登录账号</p>
                <p className="text-sm text-muted-foreground mt-1">
                  管理员账号: <code className="bg-background px-1.5 py-0.5 rounded">admin</code> / 
                  密码: <code className="bg-background px-1.5 py-0.5 rounded">admin123</code>
                </p>
                <p className="text-sm text-muted-foreground">
                  普通账号: <code className="bg-background px-1.5 py-0.5 rounded">user</code> / 
                  密码: <code className="bg-background px-1.5 py-0.5 rounded">123456</code>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
