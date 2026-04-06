'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { User, Mail, Phone, Lock, ArrowLeft, Zap, Moon, Sun } from 'lucide-react';
import { useTheme } from '@/components/providers/ThemeProvider';
import { escapeHtml } from '@/lib/security';
import { registerUser, isUsernameExists } from '@/types/user';
import { validateEmail, validatePhone, validatePasswordStrength } from '@/lib/security';

export default function RegisterPage() {
  const router = useRouter();
  const { theme, toggleMode } = useTheme();
  const [step, setStep] = useState(1);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [verificationMethod, setVerificationMethod] = useState<'email' | 'phone'>('email');
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const handleRegisterStep = async () => {
    setError('');
    setSuccess('');

    const cleanUsername = escapeHtml(username.trim());
    const emailValue = email.trim().toLowerCase();
    const phoneValue = phone.trim();

    if (!cleanUsername) {
      setError('用户名不能为空');
      return;
    }

    if (!validateEmail(emailValue) && !validatePhone(phoneValue)) {
      setError('请提供有效的邮箱或手机号');
      return;
    }

    if (!password.trim()) {
      setError('密码不能为空');
      return;
    }

    if (password !== confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }

    if (isUsernameExists(cleanUsername)) {
      setError('用户名已存在');
      return;
    }

    const strength = validatePasswordStrength(password);
    if (!strength.isValid) {
      setError(`密码强度不足：${strength.suggestions.join('、')}`);
      return;
    }

    if (verificationMethod === 'email' && !validateEmail(emailValue)) {
      setError('请输入有效的邮箱地址');
      return;
    }

    if (verificationMethod === 'phone' && !validatePhone(phoneValue)) {
      setError('请输入有效的手机号');
      return;
    }

    setIsLoading(true);

    try {
      const destination = verificationMethod === 'email' ? emailValue : phoneValue;
      const response = await fetch('/api/auth/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method: verificationMethod,
          destination,
          purpose: 'register',
        }),
      });

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || '验证码发送失败');
      }

      setSuccess(`验证码已发送到${verificationMethod === 'email' ? '邮箱' : '手机号'}`);
      setStep(2);
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
      setError(err instanceof Error ? err.message : '验证码发送失败');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteRegistration = async () => {
    setError('');
    setSuccess('');

    const cleanUsername = escapeHtml(username.trim());
    const emailValue = email.trim().toLowerCase();
    const phoneValue = phone.trim();
    const destination = verificationMethod === 'email' ? emailValue : phoneValue;

    if (!verificationCode.trim()) {
      setError('验证码不能为空');
      return;
    }

    setIsLoading(true);

    try {
      const verifyResponse = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method: verificationMethod,
          destination,
          code: verificationCode,
          purpose: 'register',
        }),
      });

      const verifyResult = await verifyResponse.json();
      if (!verifyResult.success) {
        throw new Error(verifyResult.error || '验证码验证失败');
      }

      await registerUser({
        username: cleanUsername,
        password,
        email: emailValue || undefined,
        phone: phoneValue || undefined,
        realName: cleanUsername,
      });

      setSuccess('注册成功，请使用用户名和密码登录');
      setTimeout(() => {
        router.push('/login');
      }, 2200);
    } catch (err) {
      setError(err instanceof Error ? err.message : '注册失败，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      if (step === 1) {
        handleRegisterStep();
      } else {
        handleCompleteRegistration();
      }
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative">
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

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-primary rounded-xl mx-auto mb-4 flex items-center justify-center shadow-lg">
            <Zap className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">服装生产 ERP 管理系统</h1>
          <p className="text-muted-foreground mt-2">专业的服装生产管理解决方案</p>
        </div>

        <div className="bg-card rounded-2xl border border-border p-8 shadow-sm">
          <div className="flex items-center mb-6">
            <button
              onClick={() => router.push('/login')}
              className="mr-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-semibold text-foreground">注册账号</h2>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert variant="default" className="mb-6 bg-green-50 text-green-700 border-green-200">
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          {step === 1 && (
            <>
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

              <div className="mb-5">
                <Label htmlFor="email" className="text-sm font-medium text-foreground mb-2 block">
                  邮箱
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="请输入邮箱"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="pl-10 h-12 bg-background border-input"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="mb-5">
                <Label htmlFor="phone" className="text-sm font-medium text-foreground mb-2 block">
                  手机号
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="请输入手机号"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="pl-10 h-12 bg-background border-input"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="mb-5">
                <Label htmlFor="password" className="text-sm font-medium text-foreground mb-2 block">
                  密码
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="请输入密码"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="pl-10 h-12 bg-background border-input"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="mb-5">
                <Label htmlFor="confirmPassword" className="text-sm font-medium text-foreground mb-2 block">
                  确认密码
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="请再次输入密码"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="h-12 bg-background border-input"
                  disabled={isLoading}
                />
              </div>

              <div className="mb-5">
                <Label className="text-sm font-medium text-foreground mb-2 block">
                  验证方式
                </Label>
                <div className="flex gap-3">
                  <Button
                    variant={verificationMethod === 'email' ? 'default' : 'outline'}
                    onClick={() => setVerificationMethod('email')}
                    disabled={isLoading}
                    className="flex-1 h-12"
                  >
                    邮箱
                  </Button>
                  <Button
                    variant={verificationMethod === 'phone' ? 'default' : 'outline'}
                    onClick={() => setVerificationMethod('phone')}
                    disabled={isLoading}
                    className="flex-1 h-12"
                  >
                    手机
                  </Button>
                </div>
              </div>

              <Button
                onClick={handleRegisterStep}
                disabled={isLoading}
                className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 font-medium text-base"
              >
                {isLoading ? '发送验证码中...' : '发送验证码'}
              </Button>
            </>
          )}

          {step === 2 && (
            <>
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
                    onClick={handleRegisterStep}
                    disabled={isLoading || countdown > 0}
                    className="w-32 h-12 font-medium"
                  >
                    {countdown > 0 ? `${countdown}s` : '重新发送'}
                  </Button>
                </div>
              </div>

              <Button
                onClick={handleCompleteRegistration}
                disabled={isLoading}
                className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 font-medium text-base"
              >
                {isLoading ? '注册中...' : '完成注册'}
              </Button>
            </>
          )}
        </div>

        <div className="text-center mt-6 text-sm text-muted-foreground">
          <p>已有账号？ <a href="/login" className="text-primary hover:text-primary/80">去登录</a></p>
          <p className="mt-2">支持邮箱和手机号验证码注册</p>
        </div>
      </div>
    </div>
  );
}
