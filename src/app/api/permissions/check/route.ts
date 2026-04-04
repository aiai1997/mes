/**
 * 权限检查API
 * 检查用户是否有特定权限
 * GET /api/permissions/check?permission=order:create
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = request.headers.get('x-user-id');
    const permission = searchParams.get('permission');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: '未认证用户' },
        { status: 401 }
      );
    }

    if (!permission) {
      return NextResponse.json(
        { success: false, error: '缺少permission参数' },
        { status: 400 }
      );
    }

    const client = getSupabaseClient();

    // 获取用户的所有角色
    const { data: userRoles, error: rolesError } = await client
      .from('user_roles')
      .select(`
        role_id,
        roles (id)
      `)
      .eq('user_id', userId);

    if (rolesError) {
      console.error('获取用户角色失败:', rolesError);
      return NextResponse.json(
        { success: false, error: '查询失败' },
        { status: 500 }
      );
    }

    const roleIds = userRoles?.map(ur => ur.role_id) || [];

    if (roleIds.length === 0) {
      return NextResponse.json({
        success: true,
        has_permission: false,
        permission,
        reason: '用户没有分配任何角色'
      });
    }

    // 获取权限ID
    const { data: permissionData, error: permError } = await client
      .from('permissions')
      .select('id')
      .eq('permission_code', permission)
      .eq('status', '启用')
      .single();

    if (permError || !permissionData) {
      return NextResponse.json({
        success: true,
        has_permission: false,
        permission,
        reason: '权限不存在或已被禁用'
      });
    }

    // 检查用户的角色是否有该权限
    const { data: rolePerms, error: rolePermsError } = await client
      .from('role_permissions')
      .select('id')
      .eq('permission_id', permissionData.id)
      .in('role_id', roleIds);

    if (rolePermsError) {
      console.error('检查角色权限失败:', rolePermsError);
      return NextResponse.json(
        { success: false, error: '检查失败' },
        { status: 500 }
      );
    }

    const hasPermission = (rolePerms && rolePerms.length > 0) ? true : false;

    return NextResponse.json({
      success: true,
      has_permission: hasPermission,
      permission,
      user_id: userId,
      role_count: roleIds.length
    });

  } catch (error) {
    console.error('权限检查失败:', error);
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    );
  }
}
