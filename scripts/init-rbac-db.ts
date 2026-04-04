/**
 * 数据库初始化脚本
 * 创建RBAC相关表和初始数据
 */

import { getSupabaseClient } from '@/storage/database/supabase-client';

async function initializeDatabase() {
  const client = getSupabaseClient();

  console.log('开始初始化RBAC数据库...');

  try {
    // 创建角色表
    console.log('创建角色表...');
    const { error: rolesError } = await client.rpc('create_roles_table', {});
    if (rolesError && !rolesError.message.includes('already exists')) {
      console.error('创建角色表失败:', rolesError);
    }

    // 创建权限表
    console.log('创建权限表...');
    const { error: permissionsError } = await client.rpc('create_permissions_table', {});
    if (permissionsError && !permissionsError.message.includes('already exists')) {
      console.error('创建权限表失败:', permissionsError);
    }

    // 创建其他RBAC表...
    const tables = [
      'role_permissions',
      'user_roles',
      'menus',
      'menu_permissions',
      'data_permissions',
      'operation_logs',
      'financial_transactions',
      'piece_rate_salaries',
      'supplier_payments'
    ];

    for (const table of tables) {
      console.log(`创建${table}表...`);
      const { error } = await client.rpc(`create_${table}_table`, {});
      if (error && !error.message.includes('already exists')) {
        console.error(`创建${table}表失败:`, error);
      }
    }

    // 初始化默认数据
    console.log('初始化默认RBAC数据...');
    await initializeDefaultRBACData();

    console.log('RBAC数据库初始化完成！');
  } catch (error) {
    console.error('数据库初始化失败:', error);
  }
}

async function initializeDefaultRBACData() {
  const client = getSupabaseClient();

  // 初始化默认角色
  const defaultRoles = [
    { role_code: 'admin', role_name: '管理员', description: '系统管理员，拥有所有权限' },
    { role_code: 'sales', role_name: '业务员', description: '负责订单和客户管理' },
    { role_code: 'merchandiser', role_name: '跟单员', description: '负责订单跟进和生产协调' },
    { role_code: 'worker', role_name: '车间工人', description: '负责生产报工' },
    { role_code: 'team_leader', role_name: '组长', description: '负责团队管理和审核' },
    { role_code: 'finance', role_name: '财务', description: '负责财务管理和核算' }
  ];

  for (const role of defaultRoles) {
    const { error } = await client
      .from('roles')
      .upsert(role, { onConflict: 'role_code' });
    if (error) console.error('插入角色失败:', error);
  }

  // 初始化默认权限
  const defaultPermissions = [
    // 菜单权限
    { permission_code: 'menu:dashboard', permission_name: '仪表板访问', resource: 'menu', action: 'read' },
    { permission_code: 'menu:orders', permission_name: '订单管理', resource: 'menu', action: 'read' },
    { permission_code: 'menu:bom', permission_name: 'BOM管理', resource: 'menu', action: 'read' },
    { permission_code: 'menu:cutting', permission_name: '裁床管理', resource: 'menu', action: 'read' },
    { permission_code: 'menu:workshop', permission_name: '车间管理', resource: 'menu', action: 'read' },
    { permission_code: 'menu:quality', permission_name: '品质管理', resource: 'menu', action: 'read' },
    { permission_code: 'menu:finance', permission_name: '财务管理', resource: 'menu', action: 'read' },
    { permission_code: 'menu:logs', permission_name: '操作日志', resource: 'menu', action: 'read' },

    // API权限
    { permission_code: 'order:create', permission_name: '创建订单', resource: 'api', action: 'create' },
    { permission_code: 'order:read', permission_name: '查看订单', resource: 'api', action: 'read' },
    { permission_code: 'order:update', permission_name: '编辑订单', resource: 'api', action: 'update' },
    { permission_code: 'order:delete', permission_name: '删除订单', resource: 'api', action: 'delete' },
    { permission_code: 'bom:create', permission_name: '创建BOM', resource: 'api', action: 'create' },
    { permission_code: 'bom:audit', permission_name: '审核BOM', resource: 'api', action: 'audit' },
    { permission_code: 'finance:view', permission_name: '查看财务数据', resource: 'api', action: 'read' },
    { permission_code: 'finance:audit', permission_name: '财务审核', resource: 'api', action: 'audit' },
  ];

  for (const permission of defaultPermissions) {
    const { error } = await client
      .from('permissions')
      .upsert(permission, { onConflict: 'permission_code' });
    if (error) console.error('插入权限失败:', error);
  }

  // 初始化默认菜单
  const defaultMenus = [
    { menu_code: 'dashboard', menu_name: '仪表板', path: '/dashboard', sort_order: 1 },
    { menu_code: 'orders', menu_name: '订单管理', path: '/dashboard/orders', sort_order: 2 },
    { menu_code: 'bom', menu_name: 'BOM管理', path: '/dashboard/bom', sort_order: 3 },
    { menu_code: 'cutting', menu_name: '裁床管理', path: '/dashboard/cutting', sort_order: 4 },
    { menu_code: 'workshop', menu_name: '车间管理', path: '/dashboard/workshop', sort_order: 5 },
    { menu_code: 'quality', menu_name: '品质管理', path: '/dashboard/quality', sort_order: 6 },
    { menu_code: 'finance', menu_name: '财务管理', path: '/dashboard/finance', sort_order: 7 },
    { menu_code: 'logs', menu_name: '操作日志', path: '/dashboard/logs', sort_order: 8 },
  ];

  for (const menu of defaultMenus) {
    const { error } = await client
      .from('menus')
      .upsert(menu, { onConflict: 'menu_code' });
    if (error) console.error('插入菜单失败:', error);
  }

  console.log('默认RBAC数据初始化完成');
}

// 如果直接运行此脚本
if (require.main === module) {
  initializeDatabase().catch(console.error);
}

export { initializeDatabase };