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
import { checkUserPermission } from '@/lib/rbac-service';
import { getSupabaseClient } from '@/storage/database/supabase-client';

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

/**
 * 检查是否为公开API（不需要权限验证）
 */
function isPublicApi(pathname: string): boolean {
  const publicPaths = [
    '/api/auth/login',
    '/api/auth/logout',
    '/api/auth/send-code',
    '/api/auth/verify-code',
    '/api/health',
    '/api/public',
  ];
  
  return publicPaths.some(path => pathname.startsWith(path));
}

/**
 * 检查API权限
 */
async function checkApiPermission(request: NextRequest): Promise<{ allowed: boolean; error?: string }> {
  try {
    // 从请求头获取用户ID（假设通过认证中间件设置）
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return { allowed: false, error: '未认证用户' };
    }
    
    // 验证用户是否存在且状态正常
    const client = getSupabaseClient();
    const { data: user, error: userError } = await client
      .from('users')
      .select('id, status')
      .eq('id', userId)
      .single();
    
    if (userError || !user || user.status !== '启用') {
      return { allowed: false, error: '用户不存在或已被禁用' };
    }
    
    // 根据路径确定所需权限
    const requiredPermissions = getRequiredPermissions(request.nextUrl.pathname, request.method);
    
    if (requiredPermissions.length === 0) {
      return { allowed: true }; // 不需要特殊权限
    }
    
    // 检查用户权限
    const hasPermission = await checkUserPermission(userId, requiredPermissions);
    
    return { allowed: hasPermission };
  } catch (error) {
    console.error('权限检查失败:', error);
    return { allowed: false, error: '权限检查失败' };
  }
}

/**
 * 根据API路径和方法获取所需权限
 */
function getRequiredPermissions(pathname: string, method: string): string[] {
  // API权限映射表
  const permissionMap: Record<string, Record<string, string[]>> = {
    '/api/orders': {
      'GET': ['order:read'],
      'POST': ['order:create'],
      'PUT': ['order:update'],
      'DELETE': ['order:delete'],
    },
    '/api/bom': {
      'GET': ['bom:read'],
      'POST': ['bom:create'],
      'PUT': ['bom:update', 'bom:audit'],
      'DELETE': ['bom:delete'],
    },
    '/api/cutting': {
      'GET': ['cutting:read'],
      'POST': ['cutting:create'],
      'PUT': ['cutting:update'],
      'DELETE': ['cutting:delete'],
    },
    '/api/workshop': {
      'GET': ['workshop:read'],
      'POST': ['workshop:report'],
      'PUT': ['workshop:audit'],
    },
    '/api/finance': {
      'GET': ['finance:view'],
      'POST': ['finance:create'],
      'PUT': ['finance:audit'],
      'DELETE': ['finance:delete'],
    },
    '/api/logs': {
      'GET': ['logs:read'],
    },
  };
  
  // 精确匹配路径
  for (const [path, methods] of Object.entries(permissionMap)) {
    if (pathname.startsWith(path)) {
      return methods[method] || [];
    }
  }
  
  // 默认需要登录即可访问
  return [];
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
  
  // RBAC权限检查（仅对受保护的API请求）
  if (request.nextUrl.pathname.startsWith('/api/') && !isPublicApi(request.nextUrl.pathname)) {
    const authResult = await checkApiPermission(request);
    if (!authResult.allowed) {
      return new NextResponse(
        JSON.stringify({
          success: false,
          error: authResult.error || '权限不足',
          code: 'PERMISSION_DENIED'
        }),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
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
