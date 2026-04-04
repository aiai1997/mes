'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, User, Mail, Phone, Building, Shield, Calendar, Key } from 'lucide-react';
import { getUserById, type User as UserType, type UserRole } from '@/types/user';

export default function UserDetailPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;

  const [user, setUser] = useState<UserType | null>(() => {
    if (userId) {
      const foundUser = getUserById(userId);
      return foundUser || null;
    }
    return null;
  });

  useEffect(() => {
    if (!user && userId) {
      alert('用户不存在');
      router.push('/dashboard/users');
    }
  }, [user, userId, router]);

  if (!user) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">加载中...</p>
        </div>
      </DashboardLayout>
    );
  }

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

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-foreground">{user.realName}</h1>
                  <Badge className={roleColors[user.role]}>{user.role}</Badge>
                  <Badge className={statusColors[user.status]}>{user.status}</Badge>
                </div>
                <p className="text-muted-foreground text-sm">@{user.username}</p>
              </div>
            </div>
          </div>
          <Button onClick={() => router.push(`/dashboard/users/${user.id}/edit`)}>
            <Edit className="w-4 h-4 mr-2" />
            编辑
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="w-5 h-5" />
              登录信息
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-6">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">登录账号</p>
                  <p className="font-medium font-mono">{user.username}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Key className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">登录密码</p>
                  <p className="font-medium">••••••••</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>基本信息</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-6">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">姓名</p>
                  <p className="font-medium">{user.realName}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">角色</p>
                  <Badge className={roleColors[user.role]}>{user.role}</Badge>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Building className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">部门</p>
                  <p className="font-medium">{user.department || '-'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">手机号</p>
                  <p className="font-medium">{user.phone || '-'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 col-span-2">
                <Mail className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">邮箱</p>
                  <p className="font-medium">{user.email || '-'}</p>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t grid grid-cols-2 gap-6">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">最后登录</p>
                  <p className="font-medium">{user.lastLogin || '-'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">创建时间</p>
                  <p className="font-medium">{user.createdAt}</p>
                </div>
              </div>
              {user.updatedAt && (
                <div className="flex items-center gap-3 col-span-2">
                  <Calendar className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">更新时间</p>
                    <p className="font-medium">{user.updatedAt}</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
