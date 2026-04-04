/**
 * 登录用户权限信息接口
 * GET /api/permissions
 */

import { NextRequest } from 'next/server';
import { createApiHandler } from '@/lib/api-response';
import { getUserPermissionInfo } from '@/lib/rbac-service';

const getUserPermissions = async (request: NextRequest) => {
  const userId = request.headers.get('x-user-id');
  if (!userId) {
    const err = new Error('未认证用户');
    (err as any).status = 401;
    throw err;
  }

  const permissionInfo = await getUserPermissionInfo(userId);
  if (!permissionInfo) {
    throw new Error('无法获取用户权限信息');
  }

  return {
    userId,
    username: permissionInfo.username,
    roles: permissionInfo.roles,
    permissions: permissionInfo.permissions.map(p => p.permissionCode),
    menuPermissions: permissionInfo.menuPermissions,
    dataPermissions: permissionInfo.dataPermissions,
  };
};

export const GET = createApiHandler(getUserPermissions);
