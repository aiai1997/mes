import { NextRequest, NextResponse } from 'next/server';
import { validateEmail, validatePhone } from '@/lib/security';
import { verificationCodeStore } from '@/lib/verification-store';

export async function POST(request: NextRequest) {
  try {
    const { method, destination, code, purpose } = await request.json();

    if (!method || !destination || !code || !purpose) {
      return NextResponse.json(
        { success: false, error: '缺少必要参数' },
        { status: 400 }
      );
    }

    if (!['email', 'phone'].includes(method)) {
      return NextResponse.json(
        { success: false, error: '无效的验证方式' },
        { status: 400 }
      );
    }

    if (!['register', 'forgot-password'].includes(purpose)) {
      return NextResponse.json(
        { success: false, error: '无效的目的' },
        { status: 400 }
      );
    }

    // 验证格式
    if (method === 'email' && !validateEmail(destination)) {
      return NextResponse.json(
        { success: false, error: '邮箱格式无效' },
        { status: 400 }
      );
    }

    if (method === 'phone' && !validatePhone(destination)) {
      return NextResponse.json(
        { success: false, error: '手机号格式无效' },
        { status: 400 }
      );
    }

    const key = `${method}:${destination}:${purpose}`;
    const stored = verificationCodeStore.get(key);

    if (!stored) {
      return NextResponse.json(
        { success: false, error: '验证码不存在或已过期' },
        { status: 400 }
      );
    }

    const now = Date.now();

    // 检查是否过期
    if (stored.expires < now) {
      verificationCodeStore.delete(key);
      return NextResponse.json(
        { success: false, error: '验证码已过期' },
        { status: 400 }
      );
    }

    // 检查尝试次数 (最多3次)
    if (stored.attempts >= 3) {
      verificationCodeStore.delete(key);
      return NextResponse.json(
        { success: false, error: '验证码尝试次数过多' },
        { status: 400 }
      );
    }

    // 增加尝试次数
    verificationCodeStore.incrementAttempts(key);

    // 验证验证码
    if (stored.code !== code.trim()) {
      return NextResponse.json(
        { success: false, error: '验证码错误' },
        { status: 400 }
      );
    }

    // 验证成功，删除验证码
    verificationCodeStore.delete(key);

    return NextResponse.json({
      success: true,
      message: '验证码验证成功'
    });

  } catch (error) {
    console.error('验证验证码失败:', error);
    return NextResponse.json(
      { success: false, error: '验证失败，请稍后重试' },
      { status: 500 }
    );
  }
}