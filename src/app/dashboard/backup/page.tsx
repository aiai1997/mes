'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { Download, Upload, Trash2, Database, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

interface BackupFile {
  name: string;
  fileName: string;
  path: string;
  size: number;
  createdAt: string;
  modifiedAt: string;
}

export default function BackupPage() {
  const [backups, setBackups] = useState<BackupFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [restoring, setRestoring] = useState<string | null>(null);

  // 获取备份列表
  const fetchBackups = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/backup');
      const data = await response.json();
      if (data.success) {
        setBackups(data.data.backups);
      } else {
        toast.error('获取备份列表失败');
      }
    } catch (error) {
      toast.error('获取备份列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 创建备份
  const createBackup = async (backupType: 'full' = 'full') => {
    setCreating(true);
    try {
      const response = await fetch('/api/backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ backupType })
      });
      const data = await response.json();
      if (data.success) {
        toast.success('备份创建成功');
        fetchBackups();
      } else {
        toast.error(data.error || '备份创建失败');
      }
    } catch (error) {
      toast.error('备份创建失败');
    } finally {
      setCreating(false);
    }
  };

  // 恢复备份
  const restoreBackup = async (backupName: string) => {
    setRestoring(backupName);
    try {
      const response = await fetch('/api/backup?action=restore', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ backupName })
      });
      const data = await response.json();
      if (data.success) {
        toast.success('数据恢复成功');
        // 刷新页面以反映恢复的数据
        window.location.reload();
      } else {
        toast.error(data.error || '数据恢复失败');
      }
    } catch (error) {
      toast.error('数据恢复失败');
    } finally {
      setRestoring(null);
    }
  };

  // 删除备份
  const deleteBackup = async (backupName: string) => {
    try {
      const response = await fetch('/api/backup', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ backupName })
      });
      const data = await response.json();
      if (data.success) {
        toast.success('备份删除成功');
        fetchBackups();
      } else {
        toast.error(data.error || '备份删除失败');
      }
    } catch (error) {
      toast.error('备份删除失败');
    }
  };

  // 下载备份文件
  const downloadBackup = async (backupName: string) => {
    try {
      const response = await fetch(`/api/backup/download/${backupName}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${backupName}.sql`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        toast.error('下载失败');
      }
    } catch (error) {
      toast.error('下载失败');
    }
  };

  // 格式化文件大小
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  useEffect(() => {
    fetchBackups();
  }, []);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">数据备份与恢复</h1>
          <p className="text-muted-foreground">
            管理系统数据备份和恢复功能，确保数据安全
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => fetchBackups()}
            variant="outline"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            刷新
          </Button>
          <Button
            onClick={() => createBackup()}
            disabled={creating}
          >
            <Database className="h-4 w-4 mr-2" />
            {creating ? '创建中...' : '创建备份'}
          </Button>
        </div>
      </div>

      {/* 备份列表 */}
      <Card>
        <CardHeader>
          <CardTitle>备份文件列表</CardTitle>
          <CardDescription>
            显示所有可用的数据备份文件
          </CardDescription>
        </CardHeader>
        <CardContent>
          {backups.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              暂无备份文件
            </div>
          ) : (
            <div className="space-y-4">
              {backups.map((backup) => (
                <div
                  key={backup.name}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Database className="h-4 w-4" />
                      <span className="font-medium">{backup.name}</span>
                      <Badge variant="secondary">
                        {formatFileSize(backup.size)}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      创建时间：{format(new Date(backup.createdAt), 'yyyy-MM-dd HH:mm:ss', { locale: zhCN })}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadBackup(backup.name)}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      下载
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={restoring === backup.name}
                        >
                          <Upload className="h-4 w-4 mr-1" />
                          {restoring === backup.name ? '恢复中...' : '恢复'}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>确认恢复数据</AlertDialogTitle>
                          <AlertDialogDescription>
                            确定要从备份 "{backup.name}" 恢复数据吗？此操作将覆盖当前所有数据，且不可撤销。
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>取消</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => restoreBackup(backup.name)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            确认恢复
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4 mr-1" />
                          删除
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>确认删除备份</AlertDialogTitle>
                          <AlertDialogDescription>
                            确定要删除备份文件 "{backup.name}" 吗？此操作不可撤销。
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>取消</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteBackup(backup.name)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            确认删除
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 使用说明 */}
      <Card>
        <CardHeader>
          <CardTitle>使用说明</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">备份功能</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• 点击"创建备份"按钮可创建完整的数据备份</li>
              <li>• 备份文件保存在服务器的 backups 目录中</li>
              <li>• 备份操作会记录在操作日志中</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">恢复功能</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• 选择要恢复的备份文件，点击"恢复"按钮</li>
              <li>• 恢复操作将覆盖当前所有数据，请谨慎操作</li>
              <li>• 恢复成功后页面会自动刷新</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">下载功能</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• 可以下载备份文件到本地保存</li>
              <li>• 下载的文件为 SQL 格式，可用于手动恢复</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}