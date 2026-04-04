import { NextRequest, NextResponse } from 'next/server';
import { hashPassword, generateUUID, logSecurityEvent } from '@/lib/security';

const USERS_KEY = 'erp_users';

// 角色权限映射
const ROLE_PERMISSIONS = {
  '管理员': ['all'],
  '业务员': ['order:create', 'order:view', 'order:edit', 'order:delete', 'bom:create', 'bom:view', 'customer:view', 'customer:edit'],
  '跟单员': ['order:view', 'bom:view', 'cutting:view', 'workshop:view', 'tail:view', 'schedule:view'],
  '车间工人': ['workshop:report', 'cutting:view', 'bundle:view', 'order:view'],
  '组长': ['workshop:view', 'workshop:report', 'workshop:audit', 'cutting:view', 'tail:view', 'employee:view'],
  '财务': ['finance:view', 'finance:audit', 'order:view', 'report:view'],
};

/**
 * POST - 重置用户数据（使用新的哈希密码）
 */
export async function POST(request: NextRequest) {
  try {
    // 验证确认参数
    const body = await request.json().catch(() => ({}));
    
    if (body.confirm !== 'RESET_USERS_CONFIRMED') {
      return NextResponse.json({
        success: false,
        error: '需要确认参数',
        hint: '请在请求体中添加 {"confirm": "RESET_USERS_CONFIRMED"}'
      }, { status: 400 });
    }

    // 生成哈希密码
    const adminPassword = await hashPassword('Admin@2024!');
    const userPassword = await hashPassword('User@2024!');
    const workerPassword = await hashPassword('Worker@2024!');

    // 创建新的用户数据
    const defaultUsers = [
      {
        id: generateUUID(),
        username: 'admin',
        password: adminPassword,
        realName: '系统管理员',
        role: '管理员',
        department: '信息部',
        permissions: ['all'],
        status: '启用',
        createdAt: new Date().toISOString(),
        passwordChangedAt: new Date().toISOString(),
      },
      {
        id: generateUUID(),
        username: 'user',
        password: userPassword,
        realName: '张三',
        role: '业务员',
        department: '业务部',
        permissions: ROLE_PERMISSIONS['业务员'],
        status: '启用',
        createdAt: new Date().toISOString(),
        passwordChangedAt: new Date().toISOString(),
      },
      {
        id: generateUUID(),
        username: 'worker',
        password: workerPassword,
        realName: '李四',
        role: '车间工人',
        department: '缝制车间',
        permissions: ROLE_PERMISSIONS['车间工人'],
        status: '启用',
        createdAt: new Date().toISOString(),
        passwordChangedAt: new Date().toISOString(),
      },
    ];

    // 返回给客户端，让客户端保存到localStorage
    return NextResponse.json({
      success: true,
      message: '用户数据重置成功',
      data: {
        key: USERS_KEY,
        users: defaultUsers,
        credentials: {
          admin: 'Admin@2024!',
          user: 'User@2024!',
          worker: 'Worker@2024!'
        }
      }
    });
  } catch (error) {
    console.error('重置用户数据失败:', error);
    return NextResponse.json({
      success: false,
      error: '重置用户数据失败'
    }, { status: 500 });
  }
}
