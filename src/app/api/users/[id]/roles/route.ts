/**
 * 用户角色管理API
 * 为用户分配/移除角色，自动记录权限变更日志
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// 分配角色
export async function POST(request: NextRequest) {
  try {
    const { user_id, role_id } = await request.json();
    const operator_id = request.headers.get('x-user-id');

    if (!operator_id) {
      return NextResponse.json(
        { success: false, error: '未认证用户' },
        { status: 401 }
      );
    }

    if (!user_id || !role_id) {
      return NextResponse.json(
        { success: false, error: '缺少必要参数' },
        { status: 400 }
      );
    }

    const client = getSupabaseClient();

    // 检查用户和角色是否存在
    const [{ data: user }, { data: role }] = await Promise.all([
      client.from('users').select('id, real_name').eq('id', user_id).single(),
      client.from('roles').select('id, role_name').eq('id', role_id).single()
    ]);

    if (!user || !role) {
      return NextResponse.json(
        { success: false, error: '用户或角色不存在' },
        { status: 404 }
      );
    }

    // 检查是否已有该角色
    const { data: existing } = await client
      .from('user_roles')
      .select('id')
      .eq('user_id', user_id)
      .eq('role_id', role_id);

    if (existing && existing.length > 0) {
      return NextResponse.json(
        { success: false, error: '用户已拥有该角色' },
        { status: 400 }
      );
    }

    // 分配角色
    const { data: newRole, error: insertError } = await client
      .from('user_roles')
      .insert({ user_id, role_id })
      .select();

    if (insertError) {
      console.error('分配角色失败:', insertError);
      return NextResponse.json(
        { success: false, error: '分配失败' },
        { status: 500 }
      );
    }

    // 记录操作日志
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown';
    await client
      .from('operation_logs')
      .insert({
        log_no: generateLogNo(),
        module: '权限管理',
        action: '分配角色',
        description: `为用户 ${user.real_name} 分配角色 ${role.role_name}`,
        operator: operator_id,
        operator_id,
        ip_address: ip,
        resource_id: user_id,
        resource_type: 'user_role',
        new_data: { user_id, role_id, role_name: role.role_name },
        status: '成功'
      })
      .catch(err => console.error('记录日志失败:', err));

    return NextResponse.json({
      success: true,
      message: '角色分配成功',
      data: newRole?.[0]
    });

  } catch (error) {
    console.error('分配角色失败:', error);
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    );
  }
}

// 移除角色
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const user_id = searchParams.get('user_id');
    const role_id = searchParams.get('role_id');
    const operator_id = request.headers.get('x-user-id');

    if (!operator_id) {
      return NextResponse.json(
        { success: false, error: '未认证用户' },
        { status: 401 }
      );
    }

    if (!user_id || !role_id) {
      return NextResponse.json(
        { success: false, error: '缺少必要参数' },
        { status: 400 }
      );
    }

    const client = getSupabaseClient();

    // 获取用户和角色信息用于日志
    const [{ data: user }, { data: role }] = await Promise.all([
      client.from('users').select('real_name').eq('id', user_id).single(),
      client.from('roles').select('role_name').eq('id', role_id).single()
    ]);

    // 移除角色
    const { error: deleteError } = await client
      .from('user_roles')
      .delete()
      .eq('user_id', user_id)
      .eq('role_id', role_id);

    if (deleteError) {
      console.error('移除角色失败:', deleteError);
      return NextResponse.json(
        { success: false, error: '移除失败' },
        { status: 500 }
      );
    }

    // 记录操作日志
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown';
    await client
      .from('operation_logs')
      .insert({
        log_no: generateLogNo(),
        module: '权限管理',
        action: '移除角色',
        description: `从用户 ${user?.real_name} 移除角色 ${role?.role_name}`,
        operator: operator_id,
        operator_id,
        ip_address: ip,
        resource_id: user_id,
        resource_type: 'user_role',
        old_data: { user_id, role_id, role_name: role?.role_name },
        status: '成功'
      })
      .catch(err => console.error('记录日志失败:', err));

    return NextResponse.json({
      success: true,
      message: '角色移除成功'
    });

  } catch (error) {
    console.error('移除角色失败:', error);
    return NextResponse.json(
      { success: false, error: '服务器错误' },
      { status: 500 }
    );
  }
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
