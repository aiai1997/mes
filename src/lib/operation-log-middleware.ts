/**
 * 操作日志中间件
 * 自动记录用户的操作行为
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { OperationLog } from '@/types/rbac';

// 获取客户端IP
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const clientIP = request.headers.get('x-client-ip');

  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  if (realIP) {
    return realIP;
  }
  if (clientIP) {
    return clientIP;
  }

  return request.ip || 'unknown';
}

// 获取用户代理
function getUserAgent(request: NextRequest): string {
  return request.headers.get('user-agent') || '';
}

// 生成日志编号
function generateLogNo(): string {
  const now = new Date();
  const timestamp = now.getFullYear().toString() +
    (now.getMonth() + 1).toString().padStart(2, '0') +
    now.getDate().toString().padStart(2, '0') +
    now.getHours().toString().padStart(2, '0') +
    now.getMinutes().toString().padStart(2, '0') +
    now.getSeconds().toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `LOG${timestamp}${random}`;
}

// 确定操作模块
function getOperationModule(pathname: string): string {
  const moduleMap: Record<string, string> = {
    '/api/orders': '订单管理',
    '/api/bom': 'BOM管理',
    '/api/cutting': '裁床管理',
    '/api/workshop': '车间报工',
    '/api/quality': '品质管理',
    '/api/materials': '物料管理',
    '/api/customers': '客户管理',
    '/api/suppliers': '供应商管理',
    '/api/employees': '员工管理',
    '/api/finance': '财务管理',
    '/api/auth/login': '用户登录',
    '/api/auth/logout': '用户登出',
  };

  for (const [path, module] of Object.entries(moduleMap)) {
    if (pathname.startsWith(path)) {
      return module;
    }
  }

  return '系统操作';
}

// 确定操作类型
function getOperationAction(pathname: string, method: string): string {
  const actionMap: Record<string, Record<string, string>> = {
    '/api/orders': {
      'POST': '新增订单',
      'PUT': '编辑订单',
      'DELETE': '删除订单',
    },
    '/api/bom': {
      'POST': '新增BOM',
      'PUT': '编辑BOM',
      'DELETE': '删除BOM',
    },
    '/api/cutting': {
      'POST': '新增裁床任务',
      'PUT': '编辑裁床任务',
      'DELETE': '删除裁床任务',
    },
    '/api/workshop': {
      'POST': '报工',
      'PUT': '审核报工',
    },
    '/api/finance': {
      'POST': '财务操作',
      'PUT': '财务审核',
    },
    '/api/auth/login': {
      'POST': '登录',
    },
    '/api/auth/logout': {
      'POST': '登出',
    },
  };

  const pathActions = actionMap[pathname];
  if (pathActions && pathActions[method]) {
    return pathActions[method];
  }

  // 默认操作类型
  switch (method) {
    case 'POST': return '新增';
    case 'PUT': return '编辑';
    case 'DELETE': return '删除';
    case 'GET': return '查看';
    default: return '操作';
  }
}

/**
 * 记录操作日志
 */
export async function logOperation(
  request: NextRequest,
  response: NextResponse,
  userId?: string,
  userName?: string,
  oldData?: any,
  newData?: any,
  resourceId?: string,
  resourceType?: string,
  errorMessage?: string
): Promise<void> {
  try {
    const pathname = request.nextUrl.pathname;
    const method = request.method;
    const ipAddress = getClientIP(request);
    const userAgent = getUserAgent(request);

    // 只记录重要的API操作
    if (!pathname.startsWith('/api/') ||
        pathname.includes('/health') ||
        pathname.includes('/public')) {
      return;
    }

    const client = getSupabaseClient();

    // 如果没有提供用户信息，尝试从请求头获取
    let operator = userName || '系统';
    let operatorId = userId;

    if (!operatorId) {
      operatorId = request.headers.get('x-user-id') || undefined;
      if (operatorId) {
        // 获取用户名
        const { data: userData } = await client
          .from('users')
          .select('real_name')
          .eq('id', operatorId)
          .single();
        operator = userData?.real_name || '未知用户';
      }
    }

    const logData: Omit<OperationLog, 'id' | 'createdAt'> = {
      logNo: generateLogNo(),
      module: getOperationModule(pathname),
      action: getOperationAction(pathname, method),
      description: `${operator}执行了${getOperationAction(pathname, method)}操作`,
      operator,
      operatorId,
      ipAddress,
      userAgent,
      oldData,
      newData,
      resourceId,
      resourceType,
      status: errorMessage ? '失败' : '成功',
      errorMessage,
      operateTime: new Date().toISOString(),
    };

    // 异步插入日志，不阻塞响应
    client
      .from('operation_logs')
      .insert(logData)
      .then(({ error }) => {
        if (error) {
          console.error('插入操作日志失败:', error);
        }
      });

  } catch (error) {
    console.error('记录操作日志失败:', error);
  }
}

/**
 * 创建操作日志中间件包装器
 */
export function withOperationLogging(
  handler: (request: NextRequest, ...args: any[]) => Promise<NextResponse> | NextResponse
) {
  return async (request: NextRequest, ...args: any[]): Promise<NextResponse> => {
    const startTime = Date.now();

    try {
      const response = await handler(request, ...args);
      const duration = Date.now() - startTime;

      // 记录成功操作
      await logOperation(request, response);

      // 添加响应时间头
      response.headers.set('X-Response-Time', `${duration}ms`);

      return response;
    } catch (error) {
      const duration = Date.now() - startTime;

      // 记录失败操作
      await logOperation(
        request,
        new NextResponse(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 }),
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        (error as Error).message
      );

      throw error;
    }
  };
}