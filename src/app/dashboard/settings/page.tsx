'use client';

import { useState, useRef, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Settings,
  Database,
  Palette,
  Globe,
  Save,
  Moon,
  Sun,
  Check,
  Loader2,
  Download,
  Upload,
  Trash2,
  HardDrive,
  FileJson,
  AlertTriangle,
  RefreshCw,
  BarChart3,
  Sparkles,
  Play,
  Cloud,
} from 'lucide-react';
import { useTheme, colorMap, type ThemeColor } from '@/components/providers/ThemeProvider';
import { useLanguage } from '@/lib/i18n';
import { db, DB_VERSION, initializeDatabase, resetDatabase, downloadExportFile, readImportFile, type ExportData } from '@/lib/database';

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { t } = useLanguage();
  
  // 系统状态
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [importResult, setImportResult] = useState<{ success: boolean; message: string; imported: number } | null>(null);
  
  // 演示数据状态
  const [demoInitialized, setDemoInitialized] = useState(false);
  const [demoStats, setDemoStats] = useState<Record<string, number>>({});
  
  // 统计信息
  const [stats, setStats] = useState(() => db.getStats());
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 颜色选项
  const colorOptions: { key: ThemeColor; name: string; lightColor: string; darkColor: string }[] = 
    Object.entries(colorMap).map(([key, value]) => ({
      key: key as ThemeColor,
      name: value.name,
      lightColor: value.light,
      darkColor: value.dark,
    }));

  // 检查演示数据状态（从数据库API获取）
  useEffect(() => {
    const fetchDataStatus = async () => {
      try {
        const response = await fetch('/api/demo-data');
        if (response.ok) {
          const data = await response.json();
          setDemoInitialized(data.isInitialized);
          setDemoStats(data.counts);
        }
      } catch (error) {
        console.error('获取数据状态失败:', error);
      }
    };
    fetchDataStatus();
  }, []);

  // 初始化演示数据（调用数据库API）
  const handleInitializeDemo = async () => {
    if (!confirm('初始化演示数据将覆盖现有数据，确定要继续吗？')) return;
    
    setIsInitializing(true);
    try {
      const response = await fetch('/api/demo-data', { method: 'POST' });
      const result = await response.json();
      
      if (result.success) {
        setDemoInitialized(true);
        setDemoStats(result.counts);
        setStats(db.getStats());
        alert(`演示数据初始化成功！共导入 ${result.counts.total} 条数据`);
        window.location.reload();
      } else {
        alert('初始化失败：' + (result.error || '未知错误'));
      }
    } catch (error) {
      console.error('初始化演示数据失败:', error);
      alert('初始化失败，请重试');
    } finally {
      setIsInitializing(false);
    }
  };

  // 导出数据
  const handleExport = async () => {
    setIsExporting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      const exportData = db.exportAll();
      downloadExportFile(exportData);
    } catch (error) {
      console.error('导出失败:', error);
      alert('导出失败，请重试');
    } finally {
      setIsExporting(false);
    }
  };

  // 导入数据
  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const data = await readImportFile(file);
      const result = db.importAll(data);
      setImportResult(result);
      setShowImportDialog(true);
      setStats(db.getStats());
    } catch (error) {
      setImportResult({
        success: false,
        message: error instanceof Error ? error.message : '导入失败',
        imported: 0,
      });
      setShowImportDialog(true);
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // 重置数据库
  const handleReset = async () => {
    setIsResetting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      resetDatabase();
      await initializeDatabase();
      setStats(db.getStats());
      setShowResetDialog(false);
      alert('数据库已重置');
      window.location.reload();
    } catch (error) {
      console.error('重置失败:', error);
      alert('重置失败，请重试');
    } finally {
      setIsResetting(false);
    }
  };

  // 格式化文件大小
  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <Settings className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{t.settings.title}</h1>
              <p className="text-muted-foreground text-sm">{t.settings.subtitle}</p>
            </div>
          </div>
          <Badge variant="outline" className="text-xs">
            v{DB_VERSION}
          </Badge>
        </div>

        <Tabs defaultValue="theme" className="space-y-4">
          <TabsList className="grid grid-cols-4 w-full max-w-md">
            <TabsTrigger value="theme">{t.settings.themeSettings}</TabsTrigger>
            <TabsTrigger value="data">{t.settings.dataManagement}</TabsTrigger>
            <TabsTrigger value="storage">存储</TabsTrigger>
            <TabsTrigger value="about">关于</TabsTrigger>
          </TabsList>

          {/* 外观设置 */}
          <TabsContent value="theme" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  {t.settings.themeMode}
                </CardTitle>
                <CardDescription>{t.common.pleaseSelect}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setTheme({ mode: 'light' })}
                    className={`relative p-6 rounded-xl border-2 transition-all ${
                      theme.mode === 'light' 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 bg-white rounded-xl border border-border flex items-center justify-center shadow-sm">
                        <Sun className="w-8 h-8 text-gray-800" />
                      </div>
                      <span className="font-medium text-foreground">{t.settings.lightMode}</span>
                    </div>
                    {theme.mode === 'light' && (
                      <div className="absolute top-2 right-2">
                        <Check className="w-5 h-5 text-primary" />
                      </div>
                    )}
                  </button>
                  
                  <button
                    onClick={() => setTheme({ mode: 'dark' })}
                    className={`relative p-6 rounded-xl border-2 transition-all ${
                      theme.mode === 'dark' 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 bg-gray-900 rounded-xl border border-gray-700 flex items-center justify-center">
                        <Moon className="w-8 h-8 text-white" />
                      </div>
                      <span className="font-medium text-foreground">{t.settings.darkMode}</span>
                    </div>
                    {theme.mode === 'dark' && (
                      <div className="absolute top-2 right-2">
                        <Check className="w-5 h-5 text-primary" />
                      </div>
                    )}
                  </button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  {t.settings.themeColor}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                  {colorOptions.map((color) => (
                    <button
                      key={color.key}
                      onClick={() => setTheme({ primaryColor: color.key })}
                      className={`relative p-4 rounded-xl border-2 transition-all ${
                        theme.primaryColor === color.key 
                          ? 'border-primary' 
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="flex flex-col items-center gap-2">
                        <div 
                          className="w-10 h-10 rounded-full shadow-sm"
                          style={{ 
                            backgroundColor: theme.mode === 'light' ? color.lightColor : color.darkColor 
                          }}
                        />
                        <span className="text-sm font-medium text-foreground">{color.name}</span>
                      </div>
                      {theme.primaryColor === color.key && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                          <Check className="w-3 h-3 text-primary-foreground" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 数据管理 */}
          <TabsContent value="data" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  {t.settings.dataManagement}
                </CardTitle>
                <CardDescription>
                  导出或导入系统数据，支持JSON格式
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* 导出数据 */}
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Download className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <Label className="font-medium">{t.settings.backupData}</Label>
                      <p className="text-sm text-muted-foreground">{t.settings.backupDataDesc}</p>
                    </div>
                  </div>
                  <Button variant="outline" onClick={handleExport} disabled={isExporting}>
                    {isExporting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {t.common.loading}
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4 mr-2" />
                        导出数据
                      </>
                    )}
                  </Button>
                </div>

                {/* 导入数据 */}
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Upload className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <Label className="font-medium">导入数据</Label>
                      <p className="text-sm text-muted-foreground">从JSON文件恢复数据</p>
                    </div>
                  </div>
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".json"
                      onChange={handleImport}
                      className="hidden"
                      id="import-file"
                    />
                    <Button 
                      variant="outline" 
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isImporting}
                    >
                      {isImporting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          {t.common.loading}
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-2" />
                          选择文件
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* 重置数据 */}
                <div className="flex items-center justify-between p-4 bg-destructive/5 rounded-lg border border-destructive/20">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-destructive/10 rounded-lg flex items-center justify-center">
                      <Trash2 className="w-5 h-5 text-destructive" />
                    </div>
                    <div>
                      <Label className="font-medium text-destructive">{t.settings.resetData}</Label>
                      <p className="text-sm text-muted-foreground">{t.settings.resetDataDesc}</p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => setShowResetDialog(true)}
                    disabled={isResetting}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    {t.settings.resetData}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* 演示数据初始化 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  演示数据
                </CardTitle>
                <CardDescription>
                  快速初始化演示数据，体验完整功能
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Play className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <Label className="font-medium">初始化演示数据</Label>
                      <p className="text-sm text-muted-foreground">
                        {demoInitialized 
                          ? '演示数据已初始化，可重新初始化覆盖' 
                          : '一键生成完整的演示数据，包含订单、客户、生产等全流程数据'
                        }
                      </p>
                    </div>
                  </div>
                  <Button 
                    onClick={handleInitializeDemo}
                    disabled={isInitializing}
                  >
                    {isInitializing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        初始化中...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        {demoInitialized ? '重新初始化' : '初始化演示数据'}
                      </>
                    )}
                  </Button>
                </div>

                {/* 演示数据统计 */}
                {demoInitialized && Object.keys(demoStats).length > 0 && (
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="text-sm font-medium mb-3">演示数据包含</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                      {Object.entries(demoStats).map(([key, count]) => (
                        <div key={key} className="flex justify-between">
                          <span className="text-muted-foreground">{key}:</span>
                          <span className="font-medium">{count}条</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 pt-3 border-t text-sm text-muted-foreground">
                      总计：<span className="font-bold text-foreground">{Object.values(demoStats).reduce((a, b) => a + b, 0)}</span> 条数据
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* 存储统计 */}
          <TabsContent value="storage" className="space-y-4">
            {/* 数据库状态 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  数据库存储
                </CardTitle>
                <CardDescription>
                  数据存储在 Supabase PostgreSQL 数据库中，支持持久化存储
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                      <Cloud className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <Label className="font-medium text-green-800 dark:text-green-200">数据库已连接</Label>
                      <p className="text-sm text-green-600 dark:text-green-400">
                        使用 Supabase PostgreSQL 数据库，数据安全可靠
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="border-green-300 text-green-700 dark:border-green-700 dark:text-green-300">
                    在线
                  </Badge>
                </div>
                
                <div className="text-sm text-muted-foreground">
                  演示数据已存储 {demoStats.total || 0} 条记录，可在上方"演示数据"模块重新初始化
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HardDrive className="w-5 h-5" />
                  存储使用情况
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* 总存储 */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">总存储大小</span>
                    <span className="font-medium">{formatSize(stats.totalSize)}</span>
                  </div>
                  <Progress 
                    value={Math.min((stats.totalSize / (5 * 1024 * 1024)) * 100, 100)} 
                    className="h-2"
                  />
                  <p className="text-xs text-muted-foreground">
                    已使用 {formatSize(stats.totalSize)} / 约 5 MB（浏览器限制）
                  </p>
                </div>

                {/* 模块统计 */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium">数据模块统计</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {Object.entries(stats.moduleStats).map(([module, count]) => (
                      <div key={module} className="p-3 bg-muted rounded-lg">
                        <div className="flex items-center gap-2">
                          <BarChart3 className="w-4 h-4 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">{module}</span>
                        </div>
                        <p className="text-lg font-bold mt-1">{count}</p>
                        <p className="text-xs text-muted-foreground">条记录</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 刷新按钮 */}
                <div className="flex justify-end">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setStats(db.getStats())}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    刷新统计
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 关于 */}
          <TabsContent value="about" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileJson className="w-5 h-5" />
                  关于系统
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">系统版本</p>
                    <p className="text-lg font-bold">1.0.0</p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">数据库版本</p>
                    <p className="text-lg font-bold">{DB_VERSION}</p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">技术栈</p>
                    <p className="text-lg font-bold">Next.js 16</p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">数据存储</p>
                    <p className="text-lg font-bold">LocalStorage</p>
                  </div>
                </div>
                
                <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <h4 className="font-medium mb-2">数据说明</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• 数据同时存储在浏览器本地和服务端</li>
                    <li>• 页面关闭时自动同步到服务端</li>
                    <li>• 重启后自动从服务端恢复数据</li>
                    <li>• 建议定期导出数据备份</li>
                    <li>• 导出文件为标准JSON格式</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* 重置确认对话框 */}
        <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-destructive flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                ⚠️ {t.settings.confirmReset}
              </DialogTitle>
              <DialogDescription>
                {t.settings.confirmResetMessage}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowResetDialog(false)}>
                {t.common.cancel}
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleReset}
                disabled={isResetting}
              >
                {isResetting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {t.common.loading}
                  </>
                ) : (
                  t.common.confirm
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* 导入结果对话框 */}
        <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className={importResult?.success ? 'text-primary' : 'text-destructive'}>
                {importResult?.success ? '✅ 导入成功' : '❌ 导入失败'}
              </DialogTitle>
              <DialogDescription>
                {importResult?.message}
              </DialogDescription>
            </DialogHeader>
            {importResult?.success && (
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">已导入记录数</p>
                <p className="text-2xl font-bold text-primary">{importResult.imported}</p>
              </div>
            )}
            <DialogFooter>
              <Button onClick={() => {
                setShowImportDialog(false);
                if (importResult?.success) {
                  window.location.reload();
                }
              }}>
                {t.common.confirm}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
