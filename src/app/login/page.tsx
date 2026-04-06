'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, User, Lock, Zap, Moon, Sun, AlertCircle } from 'lucide-react';
import { 
  initDefaultUsers, 
  validateUserAsync, 
  saveCurrentUser, 
  saveRememberedUsername, 
  getRememberedUsername,
  clearRememberedUsername
} from '@/types/user';
import { useTheme } from '@/components/providers/ThemeProvider';
import { escapeHtml } from '@/lib/security';

export default function LoginPage() {
  const router = useRouter();
  const { theme, toggleMode } = useTheme();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberPassword, setRememberPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 初始化用户数据和检查记住密码
  useEffect(() => {
    initDefaultUsers();
    
    const rememberedUsername = getRememberedUsername();
    if (rememberedUsername) {
      setUsername(rememberedUsername);
      setRememberPassword(true);
    }
  }, []);

  // 处理登录
  const handleLogin = async () => {
    setError('');
    
    // 验证输入
    if (!username.trim()) {
      setError('用户名不能为空');
      return;
    }
    
    if (!password.trim()) {
      setError('密码不能为空');
      return;
    }

    // 输入清理
    const cleanUsername = escapeHtml(username.trim());
    
    setIsLoading(true);

    // 模拟网络延迟（防止时序攻击）
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 500));

    // 使用安全验证函数
    const result = await validateUserAsync(cleanUsername, password);

    if (!result.user) {
      setError(result.error || '登录失败');
      setIsLoading(false);
      return;
    }

    // 处理记住密码（只保存用户名，不保存密码）
    if (rememberPassword) {
      saveRememberedUsername(cleanUsername);
    } else {
      clearRememberedUsername();
    }

    // 保存当前用户信息（不包含密码）
    saveCurrentUser({
      id: result.user.id,
      username: result.user.username,
      realName: result.user.realName,
      role: result.user.role,
      permissions: result.user.permissions,
    });

    setIsLoading(false);
    
    // 跳转到主页
    router.push('/dashboard');
  };

  // 处理重置
  const handleReset = () => {
    setUsername('');
    setPassword('');
    setError('');
    setRememberPassword(false);
  };

  // 处理回车键登录
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      handleLogin();
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative">
      {/* 主题切换按钮 */}
      <button
        onClick={toggleMode}
        className="absolute top-4 right-4 w-10 h-10 rounded-lg bg-card border border-border flex items-center justify-center hover:bg-accent transition-colors"
      >
        {theme.mode === 'dark' ? (
          <Sun className="w-5 h-5 text-foreground" />
        ) : (
          <Moon className="w-5 h-5 text-foreground" />
        )}
      </button>

      {/* 登录框 */}
      <div className="w-full max-w-md">
        {/* LOGO 和系统名称 */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-primary rounded-xl mx-auto mb-4 flex items-center justify-center shadow-lg">
            <Zap className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">服装生产 ERP 管理系统</h1>
          <p className="text-muted-foreground mt-2">专业的服装生产管理解决方案</p>
        </div>

        {/* 登录表单 */}
        <div className="bg-card rounded-2xl border border-border p-8 shadow-sm">
          {/* 错误提示 */}
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* 用户名输入框 */}
          <div className="mb-5">
            <Label htmlFor="username" className="text-sm font-medium text-foreground mb-2 block">
              用户名
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                id="username"
                type="text"
                placeholder="请输入用户名 / 工号"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyPress={handleKeyPress}
                className="pl-10 h-12 bg-background border-input"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* 密码输入框 */}
          <div className="mb-5">
            <Label htmlFor="password" className="text-sm font-medium text-foreground mb-2 block">
              密码
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="请输入密码"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={handleKeyPress}
                className="pl-10 pr-10 h-12 bg-background border-input"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* 记住密码和找回密码 */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center">
                <Checkbox
                  id="remember"
                  checked={rememberPassword}
                  onCheckedChange={(checked) => setRememberPassword(checked as boolean)}
                  disabled={isLoading}
                />
                <label
                  htmlFor="remember"
                  className="ml-2 text-sm text-muted-foreground cursor-pointer select-none"
                >
                  记住密码
                </label>
              </div>
              <a
                href="/login/register"
                className="text-sm text-primary hover:text-primary/80 transition-colors"
              >
                注册账号
              </a>
            </div>
            <a
              href="/login/forgot-password"
              className="text-sm text-primary hover:text-primary/80 transition-colors"
            >
              找回密码
            </a>
          </div>

          {/* 按钮组 */}
          <div className="flex gap-3">
            <Button
              onClick={handleLogin}
              disabled={isLoading}
              className="flex-1 h-12 bg-primary text-primary-foreground hover:bg-primary/90 font-medium text-base"
            >
              {isLoading ? '登录中...' : '登录'}
            </Button>
            <Button
              onClick={handleReset}
              disabled={isLoading}
              variant="outline"
              className="flex-1 h-12 font-medium text-base"
            >
              重置
            </Button>
          </div>
        </div>

        {/* 安全提示 */}
        <div className="bg-card rounded-2xl border border-border p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-foreground mb-1">安全提示</p>
              <p className="text-muted-foreground text-xs leading-relaxed">
                默认密码已更新，首次登录后请及时修改密码。
                <br />
                <span className="text-amber-600 dark:text-amber-400">
                  admin / Admin@2024! | user / User@2024! | worker / Worker@2024!
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* 版权信息 */}
        <div className="text-center mt-6 text-sm text-muted-foreground">
          <p>© 2026 服装 ERP 系统 技术支持</p>
          <p className="text-xs mt-1">密码已加密存储 · 登录失败5次将锁定15分钟</p>
        </div>
      </div>
    </div>
  );
}
