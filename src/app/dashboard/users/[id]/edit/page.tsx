'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Save, Eye, EyeOff, AlertCircle, User, Shield, Calendar, Mail, Phone, Building } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { 
  getUsers, 
  saveUsers, 
  isUsernameExists,
  ROLE_PERMISSIONS,
  type User as UserType,
  type UserRole,
} from '@/types/user';

const roles: UserRole[] = ['管理员', '业务员', '跟单员', '车间工人', '组长', '财务'];

export default function UserEditPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;

  const [user, setUser] = useState<UserType | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    realName: '',
    role: '业务员' as UserRole,
    department: '',
    phone: '',
    email: '',
    status: '启用' as '启用' | '禁用',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (userId) {
      const users = getUsers();
      const foundUser = users.find(u => u.id === userId);
      if (foundUser) {
        setUser(foundUser);
        setFormData({
          username: foundUser.username,
          password: '',
          confirmPassword: '',
          realName: foundUser.realName,
          role: foundUser.role,
          department: foundUser.department || '',
          phone: foundUser.phone || '',
          email: foundUser.email || '',
          status: foundUser.status,
        });
      }
    }
  }, [userId]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.username.trim()) {
      newErrors.username = '请输入登录账号';
    } else if (formData.username.length < 3) {
      newErrors.username = '账号长度至少3位';
    } else if (isUsernameExists(formData.username, userId)) {
      newErrors.username = '该账号已存在';
    }

    if (formData.password && formData.password.length < 6) {
      newErrors.password = '密码长度至少6位';
    }

    if (formData.password && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = '两次密码输入不一致';
    }

    if (!formData.realName.trim()) {
      newErrors.realName = '请输入姓名';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate() || !user) return;

    const users = getUsers();
    const index = users.findIndex(u => u.id === userId);
    
    if (index >= 0) {
      users[index] = {
        ...users[index],
        username: formData.username,
        password: formData.password || users[index].password,
        realName: formData.realName,
        role: formData.role,
        department: formData.department,
        phone: formData.phone,
        email: formData.email,
        permissions: ROLE_PERMISSIONS[formData.role],
        status: formData.status,
        updatedAt: new Date().toISOString(),
      };
      
      saveUsers(users);
      alert('用户信息已更新！');
      router.push('/dashboard/users');
    }
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

  if (!user) {
    return (
      <DashboardLayout>
        <div className="text-center py-20">
          <p className="text-muted-foreground">用户不存在</p>
          <Button variant="outline" onClick={() => router.push('/dashboard/users')} className="mt-4">
            返回列表
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">编辑用户</h1>
            <p className="text-muted-foreground text-sm">修改用户信息和登录密码</p>
          </div>
        </div>

        {/* 当前用户信息卡片 */}
        <Card className="bg-muted/50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-primary-foreground" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold">{user.realName}</h3>
                  <Badge className={roleColors[user.role]}>{user.role}</Badge>
                  <Badge className={statusColors[user.status]}>{user.status}</Badge>
                </div>
                <p className="text-muted-foreground text-sm">@{user.username}</p>
                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                  {user.department && (
                    <span className="flex items-center gap-1">
                      <Building className="w-3 h-3" />{user.department}
                    </span>
                  )}
                  {user.lastLogin && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />最后登录: {user.lastLogin}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              登录账号信息
              <span className="text-xs text-muted-foreground font-normal">（用于系统登录）</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>登录账号 <span className="text-red-500">*</span></Label>
                <Input
                  value={formData.username}
                  onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                  placeholder="请输入登录账号"
                  className={`mt-1 ${errors.username ? 'border-red-500' : ''}`}
                />
                {errors.username && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />{errors.username}
                  </p>
                )}
              </div>
              <div>
                <Label>姓名 <span className="text-red-500">*</span></Label>
                <Input
                  value={formData.realName}
                  onChange={(e) => setFormData(prev => ({ ...prev, realName: e.target.value }))}
                  placeholder="请输入姓名"
                  className={`mt-1 ${errors.realName ? 'border-red-500' : ''}`}
                />
                {errors.realName && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />{errors.realName}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>
                  密码
                  <span className="text-muted-foreground text-xs ml-2">（留空则不修改）</span>
                </Label>
                <div className="relative mt-1">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="留空则不修改密码"
                    className={errors.password ? 'border-red-500 pr-10' : 'pr-10'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />{errors.password}
                  </p>
                )}
              </div>
              <div>
                <Label>确认密码 {formData.password && <span className="text-red-500">*</span>}</Label>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  placeholder="请再次输入密码"
                  className={`mt-1 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                />
                {errors.confirmPassword && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />{errors.confirmPassword}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">基本信息</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>角色 <span className="text-red-500">*</span></Label>
                <Select value={formData.role} onValueChange={(v) => setFormData(prev => ({ ...prev, role: v as UserRole }))}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map(role => (
                      <SelectItem key={role} value={role}>{role}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>状态</Label>
                <Select value={formData.status} onValueChange={(v) => setFormData(prev => ({ ...prev, status: v as '启用' | '禁用' }))}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="启用">启用</SelectItem>
                    <SelectItem value="禁用">禁用</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>部门</Label>
                <Input
                  value={formData.department}
                  onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                  placeholder="请输入部门"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>手机号</Label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="请输入手机号"
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label>邮箱</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="请输入邮箱"
                className="mt-1"
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button variant="outline" onClick={() => router.back()}>取消</Button>
          <Button onClick={handleSave} className="gap-2">
            <Save className="w-4 h-4" />保存
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
