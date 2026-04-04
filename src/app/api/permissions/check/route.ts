/**
 * 权限检查API
 * GET /api/permissions/check?permission=order:create
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const permission = searchParams.get('permission');
    const userId = request.headers.get('x-user-id');

    if (!permission || !userId) {
      return NextResponse.json(
        {
          code: 400,
          success: false,
          message: '缺少必要参数',
          error: '缺少必要参数'
        },
        { status: 400 }
      );
    }

    const client = getSupabaseClient();

    // 获取用户角色
    const { data: userRolesData, error: roleError } = await client
      .from('user_roles')
      .select(`
        roles (
          id,
          role_code,
          role_permissions (
            permissions (
              permission_code
            )
          )
        )
      `)
      .eq('user_id', userId);

    if (roleError) throw roleError;

    // 检查是否有该权限
    const hasPermission = userRolesData?.some(ur => {
      return ur.roles?.role_permissions?.some((rp: any) =>
        rp.permissions?.permission_code === permission
      );
    }) || false;

    return NextResponse.json({
      code: 200,
      success: true,
      message: 'ok',
      allowed: hasPermission,
      permission,
      userId
    });
  } catch (error) {
    console.error('权限检查失败:', error);
    return NextResponse.json(
      {
        code: 500,
        success: false,
        message: '权限检查失败',
        error: '权限检查失败'
      },
      { status: 500 }
    );
  }
}
