/**
 * 统一API响应格式工具
 */

export interface ApiResponse<T = any> {
  code: number;
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  timestamp: string;
  requestId?: string;
}

export interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface ListQuery {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  filters?: Record<string, any>;
}

/**
 * 创建成功响应
 */
export function createSuccessResponse<T = any>(
  data?: T,
  message = 'ok',
  code = 200
): ApiResponse<T> {
  return {
    code,
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
  };
}

/**
 * 创建错误响应
 */
export function createErrorResponse(
  error: string,
  code = 500,
  message = 'error'
): ApiResponse {
  return {
    code,
    success: false,
    message,
    error,
    timestamp: new Date().toISOString(),
  };
}

/**
 * 创建分页响应
 */
export function createPaginatedResponse<T = any>(
  data: T[],
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  },
  message = 'ok'
): PaginatedResponse<T> {
  const totalPages = Math.ceil(pagination.total / pagination.pageSize);

  return {
    code: 200,
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
    pagination: {
      ...pagination,
      totalPages,
    },
  };
}

/**
 * 解析列表查询参数
 */
export function parseListQuery(searchParams: URLSearchParams): ListQuery {
  const page = parseInt(searchParams.get('page') || '1');
  const pageSize = parseInt(searchParams.get('pageSize') || '10');
  const sortBy = searchParams.get('sortBy') || 'created_at';
  const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc';
  const search = searchParams.get('search') || undefined;

  // 解析过滤器
  const filters: Record<string, any> = {};
  for (const [key, value] of searchParams.entries()) {
    if (key.startsWith('filter_')) {
      const filterKey = key.replace('filter_', '');
      filters[filterKey] = value;
    }
  }

  return {
    page: Math.max(1, page),
    pageSize: Math.max(1, Math.min(100, pageSize)), // 限制每页最多100条
    sortBy,
    sortOrder,
    search,
    filters: Object.keys(filters).length > 0 ? filters : undefined,
  };
}

/**
 * 应用列表查询到Supabase查询
 */
export function applyListQuery<T>(
  query: any,
  listQuery: ListQuery,
  searchFields: string[] = []
) {
  let resultQuery = query;

  // 应用搜索
  if (listQuery.search && searchFields.length > 0) {
    const searchConditions = searchFields.map(field =>
      `${field}.ilike.%${listQuery.search}%`
    );
    resultQuery = resultQuery.or(searchConditions.join(','));
  }

  // 应用过滤器
  if (listQuery.filters) {
    Object.entries(listQuery.filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        resultQuery = resultQuery.eq(key, value);
      }
    });
  }

  // 应用排序
  resultQuery = resultQuery.order(listQuery.sortBy || 'created_at', {
    ascending: listQuery.sortOrder === 'asc'
  });

  // 应用分页
  const offset = (listQuery.page - 1) * listQuery.pageSize;
  resultQuery = resultQuery.range(offset, offset + listQuery.pageSize - 1);

  return resultQuery;
}

/**
 * 创建统一API路由处理器
 */
export function createApiHandler<T extends any[], R>(
  handler: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<Response> => {
    try {
      const result = await handler(...args);
      return new Response(JSON.stringify(createSuccessResponse(result)), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      console.error('API处理失败:', error);
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      const status = (error as any)?.status || (errorMessage === '权限不足' ? 403 : 500);
      const code = (error as any)?.code || (status === 403 ? 403 : 500);
      return new Response(JSON.stringify(createErrorResponse(errorMessage, code, errorMessage)), {
        status,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  };
}

/**
 * 统一的错误处理包装器
 */
export function withErrorHandler<T extends any[], R>(
  handler: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R> => {
    try {
      return await handler(...args);
    } catch (error) {
      console.error('API错误:', error);
      throw error;
    }
  };
}

/**
 * 权限检查包装器
 */
export function withPermissionCheck<T extends any[], R>(
  handler: (...args: T) => Promise<R>,
  requiredPermissions: string[]
) {
  return async (...args: T): Promise<R> => {
    const request = args[0] as Request | undefined;
    const userId = request instanceof Request ? request.headers.get('x-user-id') : undefined;

    if (!userId) {
      const err = new Error('未认证用户');
      (err as any).status = 401;
      throw err;
    }

    const { checkUserPermission } = await import('./rbac-service');
    const hasPermission = await checkUserPermission(userId, requiredPermissions);
    if (!hasPermission) {
      const err = new Error('权限不足');
      (err as any).status = 403;
      throw err;
    }

    return handler(...args);
  };
}

/**
 * 数据权限过滤包装器
 */
export function withDataPermissionFilter<T extends any[], R extends any>(
  handler: (...args: T) => Promise<R>,
  resource: string
) {
  return async (...args: T): Promise<R> => {
    const request = args[0] as Request | undefined;
    const userId = request instanceof Request ? request.headers.get('x-user-id') : undefined;
    const result = await handler(...args);

    if (!userId) {
      return result;
    }

    const { getDataPermissionFilter, applyDataPermissionFilter } = await import('./rbac-service');
    const filter = await getDataPermissionFilter(userId, resource);
    if (!filter) {
      return result;
    }

    if (Array.isArray(result)) {
      return applyDataPermissionFilter(result as any, filter) as unknown as R;
    }

    if (result && typeof result === 'object' && Array.isArray((result as any).data)) {
      return {
        ...(result as any),
        data: applyDataPermissionFilter((result as any).data, filter) as any,
      } as unknown as R;
    }

    return result;
  };
}

/**
 * 财务数据隐藏包装器（对非财务人员隐藏敏感价格信息）
 */
export function withFinanceDataMask<T extends any[], R>(
  handler: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<ApiResponse<R>> => {
    try {
      const result = await handler(...args);

      // 获取当前用户ID并检查财务权限
      const userId = (global as any).currentUserId;
      if (userId) {
        const { checkUserPermission } = await import('./rbac-service');
        const hasFinanceView = await checkUserPermission(userId, ['finance:view']);

        // 如果用户没有财务权限，隐藏敏感字段
        if (!hasFinanceView) {
          const maskedResult = maskFinancialFields(result);
          return createSuccessResponse(maskedResult);
        }
      }

      return createSuccessResponse(result);
    } catch (error) {
      console.error('财务数据处理失败:', error);
      return createErrorResponse('数据处理失败', 'DATA_PROCESSING_ERROR');
    }
  };
}

/**
 * 隐藏财务敏感字段
 */
export function maskFinancialFields(data: any): any {
  if (!data) return data;

  if (Array.isArray(data)) {
    return data.map(item => maskFinancialFields(item));
  }

  if (typeof data === 'object') {
    const masked = { ...data };

    // 隐藏敏感的财务字段
    const sensitiveFields = [
      'unit_price', 'total_cost', 'piece_cost', 'fabric_total_cost',
      'accessory_total_cost', 'print_total_cost', 'wash_total_cost',
      'tail_total_cost', 'packing_total_cost', 'amount', 'net_amount'
    ];

    sensitiveFields.forEach(field => {
      if (masked[field] !== undefined) {
        masked[field] = '***'; // 或根据需求显示为其他占位符
      }
    });

    // 递归处理嵌套对象
    Object.keys(masked).forEach(key => {
      if (typeof masked[key] === 'object' && masked[key] !== null) {
        masked[key] = maskFinancialFields(masked[key]);
      }
    });

    return masked;
  }

  return data;
}