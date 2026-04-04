import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

/**
 * 更新员工关联用户账号
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { employeeId, userId } = body;

    // 参数验证
    if (!employeeId) {
      return NextResponse.json(
        { success: false, error: '缺少员工ID' },
        { status: 400 }
      );
    }

    // 防止注入：验证ID格式
    if (typeof employeeId !== 'string' || employeeId.length > 50 || !/^[\w-]+$/.test(employeeId)) {
      return NextResponse.json(
        { success: false, error: '无效的员工ID格式' },
        { status: 400 }
      );
    }

    if (userId && (typeof userId !== 'string' || userId.length > 50 || !/^[\w-]+$/.test(userId))) {
      return NextResponse.json(
        { success: false, error: '无效的用户ID格式' },
        { status: 400 }
      );
    }

    const client = getSupabaseClient();

    // 更新员工表中的 user_id 字段
    const { error } = await client
      .from('employees')
      .update({ 
        user_id: userId || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', employeeId);

    if (error) {
      console.error('更新员工关联失败:', error);
      return NextResponse.json(
        { success: false, error: '更新失败，请稍后重试' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: userId ? '关联成功' : '已取消关联',
    });

  } catch (error) {
    console.error('更新员工关联异常:', error);
    return NextResponse.json(
      { success: false, error: '服务器错误，请稍后重试' },
      { status: 500 }
    );
  }
}