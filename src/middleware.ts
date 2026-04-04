/**
 * 安全中间件
 * 
 * 功能：
 * 1. 添加安全响应头
 * 2. 防止常见的Web攻击
 * 3. 请求速率限制
 * 4. 敏感路径保护
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 速率限制配置
const RATE_LIMIT_WINDOW = 60 * 1000; // 1分钟
const RATE_LIMIT_MAX_REQUESTS = 100; // 每分钟最多100次请求

// 简单的内存速率限制（生产环境应使用Redis）
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

/**
 * 检查速率限制
 */
function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const record = rateLimitMap.get(ip);
  
  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW
    });
    return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - 1 };
  }
  
  if (record.count >= RATE_LIMIT_MAX_REQUESTS) {
    return { allowed: false, remaining: 0 };
  }
  
  record.count++;
  return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - record.count };
}

/**
 * 清理过期的速率限制记录
 */
function cleanupRateLimitMap() {
  const now = Date.now();
  for (const [ip, record] of rateLimitMap.entries()) {
    if (now > record.resetTime) {
      rateLimitMap.delete(ip);
    }
  }
}

// 定期清理（每5分钟）
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupRateLimitMap, 5 * 60 * 1000);
}

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  // 获取客户端IP（考虑代理）
  const forwardedFor = request.headers.get('x-forwarded-for');
  const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : 'unknown';
  
  // 检查速率限制（仅对API请求）
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const rateLimit = checkRateLimit(ip);
    
    if (!rateLimit.allowed) {
      return new NextResponse(
        JSON.stringify({
          success: false,
          error: '请求过于频繁，请稍后再试',
          retryAfter: 60
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': '60',
            'X-RateLimit-Limit': String(RATE_LIMIT_MAX_REQUESTS),
            'X-RateLimit-Remaining': '0',
          }
        }
      );
    }
    
    response.headers.set('X-RateLimit-Limit', String(RATE_LIMIT_MAX_REQUESTS));
    response.headers.set('X-RateLimit-Remaining', String(rateLimit.remaining));
  }
  
  // 添加安全响应头
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  // 内容安全策略（CSP）- 基础版本
  // 注意：开发模式下可能需要放宽限制
  const isDev = process.env.COZE_PROJECT_ENV === 'DEV';
  if (!isDev) {
    response.headers.set(
      'Content-Security-Policy',
      [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // 注意：unsafe-inline和unsafe-eval用于兼容性，生产环境应移除
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: blob: https:",
        "font-src 'self' data:",
        "connect-src 'self' https:",
        "frame-ancestors 'self'",
      ].join('; ')
    );
  }
  
  // 移除可能暴露服务器信息的头
  response.headers.delete('X-Powered-By');
  response.headers.delete('Server');
  
  // 防止敏感路径访问
  const pathname = request.nextUrl.pathname;
  const blockedPaths = [
    '/.env',
    '/.git',
    '/.ssh',
    '/config',
    '/backup',
    '/dump',
    '/.htaccess',
    '/nginx.conf',
    '/package.json',
    '/tsconfig.json',
  ];
  
  for (const blocked of blockedPaths) {
    if (pathname.startsWith(blocked)) {
      return new NextResponse(
        JSON.stringify({ error: 'Not Found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }
  
  // 检查SQL注入和XSS尝试（基础检测）
  const searchParams = request.nextUrl.searchParams.toString();
  
  // SQL注入检测（检测完整的SQL语句模式）
  const sqlInjectionPatterns = [
    /(\b(union\s+select|select\s+.*\s+from|insert\s+into|drop\s+table|create\s+table|alter\s+table|exec\s*\(|xp_cmdshell)\b)/gi,
    /(--\s*$|;\s*drop\s|;\s*delete\s|;\s*update\s|'\s*or\s+.*\s*=\s*)/gi,
  ];
  
  // XSS检测
  const xssPatterns = [
    /<script[\s>]/gi,
    /javascript:/gi,
    /on(error|load|click|mouse\w+|key\w+)\s*=/gi,
    /<img[^>]+on\w+\s*=/gi,
  ];
  
  if (searchParams) {
    const decodedParams = decodeURIComponent(searchParams);
    
    // 检查SQL注入
    for (const pattern of sqlInjectionPatterns) {
      if (pattern.test(decodedParams)) {
        return new NextResponse(
          JSON.stringify({
            success: false,
            error: '检测到非法请求'
          }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }
    
    // 检查XSS
    for (const pattern of xssPatterns) {
      if (pattern.test(decodedParams)) {
        return new NextResponse(
          JSON.stringify({
            success: false,
            error: '检测到非法请求'
          }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }
  }
  
  return response;
}

// 配置中间件匹配的路径
export const config = {
  matcher: [
    /*
     * 匹配所有请求路径，除了：
     * - _next/static (静态文件)
     * - _next/image (图片优化文件)
     * - favicon.ico (网站图标)
     * - public 文件夹中的静态资源
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*$).*)',
  ],
};
