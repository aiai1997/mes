'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { User, Mail, Phone, ArrowLeft, Zap, Moon, Sun } from 'lucide-react';
import { useTheme } from '@/components/providers/ThemeProvider';
import { escapeHtml } from '@/lib/security';
import { getUserByUsername, updateUserPassword } from '@/types/user';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { theme, toggleMode } = useTheme();
  const [step, setStep] = useState(1); // 1: 输入用户名, 2: 验证身份, 3: 重置密码
  const [username, setUsername] = useState('');
  const [verificationMethod, setVerificationMethod] = useState<'email' | 'phone'>('email');
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [user, setUser] = useState<any>(null);

  // 处理用户名验证
  const handleUsernameSubmit = async () => {
    setError('');
    setSuccess('');

    if (!username.trim()) {
      setError('用户名不能为空');
      return;
    }

    const cleanUsername = escapeHtml(username.trim());
    setIsLoading(true);

    try {
      const foundUser = getUserByUsername(cleanUsername);
      if (!foundUser) {
        setError('用户不存在');
        return;
      }

      if (!foundUser.email && !foundUser.phone) {
        setError('该用户未绑定邮箱或手机号，无法找回密码');
        return;
      }

      setUser(foundUser);
      setStep(2);
    } catch (err) {
      setError('验证失败，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  // 发送验证码
  const sendVerificationCode = async () => {
    setError('');
    setSuccess('');

    if (!user) {
      setError('用户信息有误');
      return;
    }

    const destination = verificationMethod === 'email' ? user.email : user.phone;
    if (!destination) {
      setError(`该用户未绑定${verificationMethod === 'email' ? '邮箱' : '手机号'}`);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method: verificationMethod,
          destination,
          purpose: 'reset_password',
        }),
      });

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || '发送验证码失败');
      }

      setSuccess(`验证码已发送到${verificationMethod === 'email' ? '邮箱' : '手机'}`);
      setCountdown(60);

      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : '发送验证码失败，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  // 验证验证码
  const handleVerificationSubmit = async () => {
    setError('');
    setSuccess('');

    if (!verificationCode.trim()) {
      setError('验证码不能为空');
      return;
    }

    if (!user) {
      setError('用户信息有误');
      return;
    }

    const destination = verificationMethod === 'email' ? user.email : user.phone;
    if (!destination) {
      setError('验证目标信息缺失');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method: verificationMethod,
          destination,
          code: verificationCode,
          purpose: 'reset_password',
        }),
      });

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || '验证码验证失败');
      }

      setStep(3);
    } catch (err) {
      setError(err instanceof Error ? err.message : '验证失败，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  // 重置密码
  const handlePasswordReset = async () => {
    setError('');
    setSuccess('');

    if (!newPassword.trim()) {
      setError('新密码不能为空');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }

    if (newPassword.length < 8) {
      setError('新密码长度至少为8位');
      return;
    }

    if (!user) {
      setError('用户信息有误');
      return;
    }

    setIsLoading(true);

    try {
      // 重置密码
      await updateUserPassword(user.id, newPassword);
      setSuccess('密码重置成功，请使用新密码登录');

      // 3秒后跳转到登录页面
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (err) {
      setError('重置密码失败，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  // 处理回车键
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      if (step === 1) {
        handleUsernameSubmit();
      } else if (step === 2) {
        handleVerificationSubmit();
      } else if (step === 3) {
        handlePasswordReset();
      }
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

      {/* 找回密码框 */}
      <div className="w-full max-w-md">
        {/* LOGO 和系统名称 */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-primary rounded-xl mx-auto mb-4 flex items-center justify-center shadow-lg">
            <Zap className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">服装生产 ERP 管理系统</h1>
          <p className="text-muted-foreground mt-2">专业的服装生产管理解决方案</p>
        </div>

        {/* 找回密码表单 */}
        <div className="bg-card rounded-2xl border border-border p-8 shadow-sm">
          {/* 标题和返回按钮 */}
          <div className="flex items-center mb-6">
            <button
              onClick={() => router.push('/login')}
              className="mr-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-semibold text-foreground">找回密码</h2>
          </div>

          {/* 错误提示 */}
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* 成功提示 */}
          {success && (
            <Alert variant="default" className="mb-6 bg-green-50 text-green-700 border-green-200">
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          {/* 步骤1：输入用户名 */}
          {step === 1 && (
            <div>
              <div className="mb-5">
                <Label htmlFor="username" className="text-sm font-medium text-foreground mb-2 block">
                  用户名
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="请输入用户名"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="pl-10 h-12 bg-background border-input"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <Button
                onClick={handleUsernameSubmit}
                disabled={isLoading}
                className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 font-medium text-base"
              >
                {isLoading ? '验证中...' : '下一步'}
              </Button>
            </div>
          )}

          {/* 步骤2：验证身份 */}
          {step === 2 && user && (
            <div>
              <div className="mb-5">
                <Label className="text-sm font-medium text-foreground mb-2 block">
                  选择验证方式
                </Label>
                <div className="flex gap-4">
                  <Button
                    variant={verificationMethod === 'email' ? 'default' : 'outline'}
                    onClick={() => setVerificationMethod('email')}
                    disabled={!user.email || isLoading}
                    className="flex-1 h-12 flex items-center justify-center gap-2"
                  >
                    <Mail className="w-4 h-4" />
                    邮箱验证
                  </Button>
                  <Button
                    variant={verificationMethod === 'phone' ? 'default' : 'outline'}
                    onClick={() => setVerificationMethod('phone')}
                    disabled={!user.phone || isLoading}
                    className="flex-1 h-12 flex items-center justify-center gap-2"
                  >
                    <Phone className="w-4 h-4" />
                    手机验证
                  </Button>
                </div>
              </div>

              <div className="mb-5">
                <Label htmlFor="verificationCode" className="text-sm font-medium text-foreground mb-2 block">
                  验证码
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="verificationCode"
                    type="text"
                    placeholder="请输入验证码"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="flex-1 h-12 bg-background border-input"
                    disabled={isLoading}
                  />
                  <Button
                    onClick={sendVerificationCode}
                    disabled={isLoading || countdown > 0}
                    className="w-32 h-12 font-medium"
                  >
                    {countdown > 0 ? `${countdown}s` : '发送'}
                  </Button>
                </div>
              </div>

              <Button
                onClick={handleVerificationSubmit}
                disabled={isLoading}
                className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 font-medium text-base"
              >
                {isLoading ? '验证中...' : '验证'}
              </Button>
            </div>
          )}

          {/* 步骤3：重置密码 */}
          {step === 3 && (
            <div>
              <div className="mb-5">
                <Label htmlFor="newPassword" className="text-sm font-medium text-foreground mb-2 block">
                  新密码
                </Label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="请输入新密码（至少8位）"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="h-12 bg-background border-input"
                  disabled={isLoading}
                />
              </div>

              <div className="mb-5">
                <Label htmlFor="confirmPassword" className="text-sm font-medium text-foreground mb-2 block">
                  确认密码
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="请再次输入新密码"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="h-12 bg-background border-input"
                  disabled={isLoading}
                />
              </div>

              <Button
                onClick={handlePasswordReset}
                disabled={isLoading}
                className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 font-medium text-base"
              >
                {isLoading ? '重置中...' : '重置密码'}
              </Button>
            </div>
          )}
        </div>

        {/* 版权信息 */}
        <div className="text-center mt-6 text-sm text-muted-foreground">
          <p>© 2026 服装 ERP 系统 技术支持</p>
        </div>
      </div>
    </div>
  );
}
