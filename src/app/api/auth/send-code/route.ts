import { NextRequest, NextResponse } from 'next/server';
import { generateVerificationCode, validateEmail, validatePhone } from '@/lib/security';
import { verificationCodeStore } from '@/lib/verification-store';

// 限制发送频率 (每分钟最多1次)
const sendLimits = new Map<string, number>();

// 限制发送频率 (每分钟最多1次)
const sendLimits = new Map<string, number>();

export async function POST(request: NextRequest) {
  try {
    const { method, destination, purpose } = await request.json();

    if (!method || !destination || !purpose) {
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

    // 检查发送频率限制
    const now = Date.now();
    const lastSend = sendLimits.get(destination) || 0;
    if (now - lastSend < 60000) { // 1分钟限制
      return NextResponse.json(
        { success: false, error: '发送过于频繁，请稍后再试' },
        { status: 429 }
      );
    }

    // 生成验证码
    const code = generateVerificationCode();
    const expires = now + 5 * 60 * 1000; // 5分钟过期

    // 存储验证码
    const key = `${method}:${destination}:${purpose}`;
    verificationCodeStore.set(key, code, 5);

    // 更新发送限制
    sendLimits.set(destination, now);

    // 清理过期验证码
    verificationCodeStore.cleanup();

    // 发送验证码
    if (method === 'email') {
      await sendEmailCode(destination, code, purpose);
    } else {
      await sendSmsCode(destination, code, purpose);
    }

    return NextResponse.json({
      success: true,
      message: `验证码已发送到${method === 'email' ? '邮箱' : '手机号'}`
    });

  } catch (error) {
    console.error('发送验证码失败:', error);
    return NextResponse.json(
      { success: false, error: '发送验证码失败，请稍后重试' },
      { status: 500 }
    );
  }
}

async function sendEmailCode(email: string, code: string, purpose: string) {
  try {
    // 动态导入 nodemailer，避免在没有安装时出错
    const nodemailer = await import('nodemailer').catch(() => null);

    if (!nodemailer) {
      console.log(`邮件验证码发送到 ${email}: ${code} (目的: ${purpose})`);
      console.log('注意：需要安装 nodemailer 并配置 SMTP 环境变量才能发送真实邮件');
      return;
    }

    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = parseInt(process.env.SMTP_PORT || '587');
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const fromEmail = process.env.FROM_EMAIL || smtpUser;

    if (!smtpHost || !smtpUser || !smtpPass) {
      console.log(`邮件验证码发送到 ${email}: ${code} (目的: ${purpose})`);
      console.log('注意：SMTP 配置不完整，使用控制台输出代替');
      return;
    }

    const transporter = nodemailer.createTransporter({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    const subject = purpose === 'register' ? '注册验证码' : '密码重置验证码';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">${subject}</h2>
        <p>您的验证码是：</p>
        <div style="font-size: 24px; font-weight: bold; color: #007bff; padding: 10px; border: 1px solid #ddd; text-align: center; margin: 20px 0;">
          ${code}
        </div>
        <p>验证码有效期为5分钟，请及时使用。</p>
        <p>如果这不是您的操作，请忽略此邮件。</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #666; font-size: 12px;">服装生产 ERP 管理系统</p>
      </div>
    `;

    await transporter.sendMail({
      from: fromEmail,
      to: email,
      subject,
      html,
    });
  } catch (error) {
    console.error('发送邮件失败:', error);
    throw new Error('邮件发送失败');
  }
}

async function sendSmsCode(phone: string, code: string, purpose: string) {
  // TODO: 集成真实的短信服务，如阿里云SMS、腾讯云SMS等
  // 目前仅在控制台输出验证码用于测试
  console.log(`SMS 验证码发送到 ${phone}: ${code} (目的: ${purpose})`);

  // 模拟发送延迟
  await new Promise(resolve => setTimeout(resolve, 1000));
}