'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import {
  Database,
  Download,
  Upload,
  AlertTriangle,
  Shield,
  History,
  FileJson,
  CheckCircle,
  Loader2,
} from 'lucide-react';

interface Backup {
  id: string;
  backupType: string;
  backupName: string;
  description: string;
  dataSize: string;
  tableCount: number;
  status: string;
  createdBy: string;
  createdAt: string;
}

interface Anomaly {
  id: string;
  tableName: string;
  recordId: string;
  anomalyType: string;
  anomalyDescription: string;
  status: string;
  createdAt: string;
}

export default function DataManagementPage() {
  const [backups, setBackups] = useState<Backup[]>([]);
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [loading, setLoading] = useState(false);
  const [showBackupDialog, setShowBackupDialog] = useState(false);
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);
  const [backupName, setBackupName] = useState('');
  const [backupDescription, setBackupDescription] = useState('');
  const [selectedBackupId, setSelectedBackupId] = useState('');
  const [activeTab, setActiveTab] = useState('backup');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await Promise.all([loadBackups(), loadAnomalies()]);
  };

  const loadBackups = async () => {
    try {
      const response = await fetch('/api/data-backup');
      const result = await response.json();
      if (result.success) {
        setBackups(result.backups);
      }
    } catch (error) {
      console.error('加载备份列表失败:', error);
    }
  };

  const loadAnomalies = async () => {
    try {
      const response = await fetch('/api/anomaly-detection');
      const result = await response.json();
      if (result.success) {
        setAnomalies(result.anomalies);
      }
    } catch (error) {
      console.error('加载异常数据失败:', error);
    }
  };

  const handleCreateBackup = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/data-backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          backupName,
          description: backupDescription,
          createdBy: 'admin',
        }),
      });

      const result = await response.json();
      if (result.success) {
        alert(`备份创建成功！\n备份ID: ${result.backupId}\n表数量: ${result.stats.tableCount}\n数据大小: ${result.stats.dataSize}`);
        setShowBackupDialog(false);
        setBackupName('');
        setBackupDescription('');
        loadBackups();
      } else {
        alert('备份创建失败：' + result.error);
      }
    } catch (error) {
      console.error('创建备份失败:', error);
      alert('创建备份失败');
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    if (!selectedBackupId) {
      alert('请选择要恢复的备份');
      return;
    }

    if (!confirm('⚠️ 警告：恢复数据前会先备份当前数据。确定要继续吗？')) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/data-restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          backupId: selectedBackupId,
          createdBy: 'admin',
          confirmRestore: true,
        }),
      });

      const result = await response.json();
      if (result.success) {
        alert(`数据恢复成功！\n已创建恢复前备份: ${result.preRestoreBackupId}\n恢复表数量: ${result.stats.tableCount}\n总记录数: ${result.stats.totalRecords}`);
        setShowRestoreDialog(false);
        loadData();
      } else {
        alert('数据恢复失败：' + result.error + (result.details ? '\n详情：' + result.details.join(', ') : ''));
      }
    } catch (error) {
      console.error('恢复数据失败:', error);
      alert('恢复数据失败');
    } finally {
      setLoading(false);
    }
  };

  const handleDetectAnomalies = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/anomaly-detection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const result = await response.json();
      if (result.success) {
        alert(`异常数据检测完成！\n检测到 ${result.anomalyCount} 条异常数据`);
        loadAnomalies();
      } else {
        alert('检测失败：' + result.error);
      }
    } catch (error) {
      console.error('检测异常数据失败:', error);
      alert('检测异常数据失败');
    } finally {
      setLoading(false);
    }
  };

  const handleExportAnomalies = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/anomaly-export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ exportAll: true }),
      });

      const result = await response.json();
      if (result.success) {
        // 创建下载
        const blob = new Blob([JSON.stringify(result.data, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = result.filename;
        a.click();
        window.URL.revokeObjectURL(url);
        alert('异常数据导出成功！');
      } else {
        alert('导出失败：' + result.error);
      }
    } catch (error) {
      console.error('导出异常数据失败:', error);
      alert('导出异常数据失败');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('zh-CN');
  };

  const getBackupTypeColor = (type: string) => {
    switch (type) {
      case '手动备份':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300';
      case '自动备份':
        return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
      case '恢复前备份':
        return 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getAnomalyTypeColor = (type: string) => {
    switch (type) {
      case '必填字段缺失':
        return 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300';
      case '格式异常':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300';
      case '数据异常':
        return 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300';
      case '数据不一致':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <Database className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">数据管理</h1>
              <p className="text-muted-foreground text-sm">数据备份、恢复、异常检测与导出</p>
            </div>
          </div>
        </div>

        {/* 标签页切换 */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('backup')}
              className={`px-4 py-2 border-b-2 transition-colors ${
                activeTab === 'backup'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Download className="w-4 h-4 inline mr-2" />
              数据备份
            </button>
            <button
              onClick={() => setActiveTab('restore')}
              className={`px-4 py-2 border-b-2 transition-colors ${
                activeTab === 'restore'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Upload className="w-4 h-4 inline mr-2" />
              数据恢复
            </button>
            <button
              onClick={() => setActiveTab('anomaly')}
              className={`px-4 py-2 border-b-2 transition-colors ${
                activeTab === 'anomaly'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <AlertTriangle className="w-4 h-4 inline mr-2" />
              异常数据
            </button>
          </div>
        </div>

        {/* 备份管理 */}
        {activeTab === 'backup' && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>数据备份</CardTitle>
                  <Button onClick={() => setShowBackupDialog(true)} className="gap-2">
                    <Download className="w-4 h-4" />创建备份
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                    <div className="text-sm text-blue-700 dark:text-blue-300">
                      <p className="font-medium">备份说明</p>
                      <ul className="mt-1 list-disc list-inside space-y-1">
                        <li>备份将保存所有核心业务数据</li>
                        <li>备份文件保留30天</li>
                        <li>建议在重要操作前手动备份</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>备份名称</TableHead>
                      <TableHead>类型</TableHead>
                      <TableHead>数据大小</TableHead>
                      <TableHead>创建人</TableHead>
                      <TableHead>创建时间</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {backups.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                          暂无备份数据
                        </TableCell>
                      </TableRow>
                    ) : (
                      backups.map((backup) => (
                        <TableRow key={backup.id}>
                          <TableCell>{backup.backupName}</TableCell>
                          <TableCell>
                            <Badge className={getBackupTypeColor(backup.backupType)}>
                              {backup.backupType}
                            </Badge>
                          </TableCell>
                          <TableCell>{backup.dataSize}</TableCell>
                          <TableCell>{backup.createdBy}</TableCell>
                          <TableCell>{formatDate(backup.createdAt)}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 恢复管理 */}
        {activeTab === 'restore' && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>数据恢复</CardTitle>
                  <Button onClick={() => setShowRestoreDialog(true)} className="gap-2">
                    <Upload className="w-4 h-4" />恢复数据
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400 mt-0.5" />
                    <div className="text-sm text-orange-700 dark:text-orange-300">
                      <p className="font-medium">⚠️ 重要提醒</p>
                      <ul className="mt-1 list-disc list-inside space-y-1">
                        <li>恢复数据前会自动备份当前数据</li>
                        <li>恢复操作不可撤销</li>
                        <li>请谨慎操作，建议先手动备份</li>
                        <li>异常数据不会被恢复</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>备份名称</TableHead>
                      <TableHead>类型</TableHead>
                      <TableHead>数据大小</TableHead>
                      <TableHead>创建时间</TableHead>
                      <TableHead>操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {backups.filter(b => b.backupType !== '恢复前备份').length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                          暂无可恢复的备份
                        </TableCell>
                      </TableRow>
                    ) : (
                      backups
                        .filter(b => b.backupType !== '恢复前备份')
                        .map((backup) => (
                          <TableRow key={backup.id}>
                            <TableCell>{backup.backupName}</TableCell>
                            <TableCell>
                              <Badge className={getBackupTypeColor(backup.backupType)}>
                                {backup.backupType}
                              </Badge>
                            </TableCell>
                            <TableCell>{backup.dataSize}</TableCell>
                            <TableCell>{formatDate(backup.createdAt)}</TableCell>
                            <TableCell>
                              <Button
                                size="sm"
                                onClick={() => {
                                  setSelectedBackupId(backup.id);
                                  setShowRestoreDialog(true);
                                }}
                              >
                                恢复
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 异常数据管理 */}
        {activeTab === 'anomaly' && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>异常数据检测</CardTitle>
                  <div className="flex gap-2">
                    <Button onClick={handleDetectAnomalies} className="gap-2">
                      <AlertTriangle className="w-4 h-4" />检测异常
                    </Button>
                    <Button variant="outline" onClick={handleExportAnomalies} className="gap-2">
                      <FileJson className="w-4 h-4" />导出异常数据
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {anomalies.length > 0 && (
                  <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                      <div className="text-sm text-red-700 dark:text-red-300">
                        <p className="font-medium">检测到 {anomalies.length} 条异常数据</p>
                        <p className="mt-1">建议立即处理或导出异常数据进行审查</p>
                      </div>
                    </div>
                  </div>
                )}

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>表名</TableHead>
                      <TableHead>记录ID</TableHead>
                      <TableHead>异常类型</TableHead>
                      <TableHead>异常描述</TableHead>
                      <TableHead>状态</TableHead>
                      <TableHead>检测时间</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {anomalies.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-500" />
                          <p>暂无异常数据</p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      anomalies.map((anomaly) => (
                        <TableRow key={anomaly.id}>
                          <TableCell>{anomaly.tableName}</TableCell>
                          <TableCell>{anomaly.recordId}</TableCell>
                          <TableCell>
                            <Badge className={getAnomalyTypeColor(anomaly.anomalyType)}>
                              {anomaly.anomalyType}
                            </Badge>
                          </TableCell>
                          <TableCell>{anomaly.anomalyDescription}</TableCell>
                          <TableCell>
                            <Badge variant={anomaly.status === '待处理' ? 'destructive' : 'default'}>
                              {anomaly.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{formatDate(anomaly.createdAt)}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 创建备份对话框 */}
        <Dialog open={showBackupDialog} onOpenChange={setShowBackupDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>创建数据备份</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>备份名称</Label>
                <Input
                  value={backupName}
                  onChange={(e) => setBackupName(e.target.value)}
                  placeholder="请输入备份名称"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>备份描述</Label>
                <Textarea
                  value={backupDescription}
                  onChange={(e) => setBackupDescription(e.target.value)}
                  placeholder="请输入备份描述（可选）"
                  className="mt-1"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowBackupDialog(false)}>
                取消
              </Button>
              <Button onClick={handleCreateBackup} disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                创建备份
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* 恢复数据对话框 */}
        <Dialog open={showRestoreDialog} onOpenChange={setShowRestoreDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>恢复数据</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400 mt-0.5" />
                  <div className="text-sm text-orange-700 dark:text-orange-300">
                    <p className="font-medium">⚠️ 警告</p>
                    <p className="mt-1">恢复数据前会自动备份当前数据，但恢复操作不可撤销。确定要继续吗？</p>
                  </div>
                </div>
              </div>
              <div>
                <Label>选择备份</Label>
                <select
                  value={selectedBackupId}
                  onChange={(e) => setSelectedBackupId(e.target.value)}
                  className="w-full mt-1 p-2 border rounded-md"
                >
                  <option value="">请选择要恢复的备份</option>
                  {backups
                    .filter(b => b.backupType !== '恢复前备份')
                    .map((backup) => (
                      <option key={backup.id} value={backup.id}>
                        {backup.backupName} - {formatDate(backup.createdAt)}
                      </option>
                    ))}
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowRestoreDialog(false)}>
                取消
              </Button>
              <Button onClick={handleRestore} disabled={loading || !selectedBackupId}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                确认恢复
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
