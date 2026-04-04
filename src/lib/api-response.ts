/**
 * 统一API响应格式工具
 */

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  code?: string;
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
  message?: string,
  code?: string
): ApiResponse<T> {
  return {
    success: true,
    data,
    message,
    code,
    timestamp: new Date().toISOString(),
  };
}

/**
 * 创建错误响应
 */
export function createErrorResponse(
  error: string,
  code?: string,
  message?: string
): ApiResponse {
  return {
    success: false,
    error,
    message,
    code,
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
  message?: string
): PaginatedResponse<T> {
  const totalPages = Math.ceil(pagination.total / pagination.pageSize);

  return {
    success: true,
    data,
    message,
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
 * 统一的错误处理包装器
 */
export function withErrorHandler<T extends any[], R>(
  handler: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<ApiResponse<R>> => {
    try {
      const result = await handler(...args);
      return createSuccessResponse(result);
    } catch (error) {
      console.error('API错误:', error);
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      return createErrorResponse(errorMessage, 'INTERNAL_ERROR');
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
  return async (...args: T): Promise<ApiResponse<R>> => {
    try {
      // 这里应该从请求上下文中获取用户信息并检查权限
      // 由于这是服务端函数，我们假设权限检查已在中间件中完成
      const result = await handler(...args);
      return createSuccessResponse(result);
    } catch (error) {
      console.error('权限检查失败:', error);
      return createErrorResponse('权限不足', 'PERMISSION_DENIED');
    }
  };
}

/**
 * 数据权限过滤包装器
 */
export function withDataPermissionFilter<T extends any[], R extends any[]>(
  handler: (...args: T) => Promise<R>,
  resource: string
) {
  return async (...args: T): Promise<ApiResponse<R>> => {
    try {
      const result = await handler(...args);

      // 从请求上下文中获取用户ID（这里需要根据实际的认证中间件调整）
      const userId = (global as any).currentUserId; // 临时方案，实际应该从middleware传递

      if (userId && Array.isArray(result)) {
        // 获取数据权限过滤器
        const { getDataPermissionFilter, applyDataPermissionFilter } = await import('./rbac-service');
        const filter = await getDataPermissionFilter(userId, resource);

        if (filter) {
          // 应用数据权限过滤
          const filteredResult = applyDataPermissionFilter(result, filter);
          return createSuccessResponse(filteredResult as R);
        }
      }

      return createSuccessResponse(result);
    } catch (error) {
      console.error('数据权限过滤失败:', error);
      return createErrorResponse('数据访问失败', 'DATA_ACCESS_DENIED');
    }
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