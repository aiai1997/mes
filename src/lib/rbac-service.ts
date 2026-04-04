/**
 * RBAC权限管理服务层
 * 提供角色、权限、菜单、数据权限的统一管理接口
 */

import { getSupabaseClient } from '@/storage/database/supabase-client';
import {
  Role,
  Permission,
  Menu,
  DataPermission,
  UserPermissionInfo,
  MenuTreeNode,
  DataPermissionFilter
} from '@/types/rbac';

// 获取数据库客户端
function getClient() {
  return getSupabaseClient();
}

/**
 * 获取用户权限信息
 */
export async function getUserPermissionInfo(userId: string): Promise<UserPermissionInfo | null> {
  const client = getClient();

  try {
    // 获取用户角色
    const { data: userRolesData, error: userRolesError } = await client
      .from('user_roles')
      .select(`
        role_id,
        roles (
          id,
          role_code,
          role_name,
          description,
          status
        )
      `)
      .eq('user_id', userId);

    if (userRolesError) throw userRolesError;

    const roles: Role[] = userRolesData?.map(ur => ur.roles).filter(Boolean) || [];

    // 获取角色权限
    const roleIds = roles.map(r => r.id);
    if (roleIds.length === 0) {
      return {
        userId,
        username: '',
        roles: [],
        permissions: [],
        menuPermissions: [],
        dataPermissions: []
      };
    }

    const { data: rolePermissionsData, error: rolePermissionsError } = await client
      .from('role_permissions')
      .select(`
        permission_id,
        permissions (
          id,
          permission_code,
          permission_name,
          resource,
          action,
          description,
          status
        )
      `)
      .in('role_id', roleIds);

    if (rolePermissionsError) throw rolePermissionsError;

    const permissions: Permission[] = rolePermissionsData?.map(rp => rp.permissions).filter(Boolean) || [];

    // 获取菜单权限
    const { data: menuPermissionsData, error: menuPermissionsError } = await client
      .from('menu_permissions')
      .select(`
        menus (
          menu_code
        )
      `)
      .in('permission_id', permissions.map(p => p.id));

    if (menuPermissionsError) throw menuPermissionsError;

    const menuPermissions = menuPermissionsData?.map(mp => mp.menus?.menu_code).filter(Boolean) || [];

    // 获取数据权限
    const { data: dataPermissionsData, error: dataPermissionsError } = await client
      .from('data_permissions')
      .select('*')
      .in('role_id', roleIds);

    if (dataPermissionsError) throw dataPermissionsError;

    const dataPermissions: DataPermission[] = dataPermissionsData || [];

    // 获取用户名
    const { data: userData, error: userError } = await client
      .from('users')
      .select('username')
      .eq('id', userId)
      .single();

    if (userError) throw userError;

    return {
      userId,
      username: userData.username,
      roles,
      permissions,
      menuPermissions,
      dataPermissions
    };
  } catch (error) {
    console.error('获取用户权限信息失败:', error);
    return null;
  }
}

/**
 * 检查用户是否有指定权限
 */
export async function checkUserPermission(userId: string, permissionCodes: string[]): Promise<boolean> {
  const permissionInfo = await getUserPermissionInfo(userId);
  if (!permissionInfo) return false;

  const userPermissionCodes = permissionInfo.permissions.map(p => p.permissionCode);
  return permissionCodes.some(code => userPermissionCodes.includes(code));
}

/**
 * 获取用户菜单树
 */
export async function getUserMenuTree(userId: string): Promise<MenuTreeNode[]> {
  const client = getClient();

  try {
    // 获取用户有权限的菜单
    const permissionInfo = await getUserPermissionInfo(userId);
    if (!permissionInfo) return [];

    const menuCodes = permissionInfo.menuPermissions;

    const { data: menusData, error: menusError } = await client
      .from('menus')
      .select('*')
      .eq('status', '启用')
      .in('menu_code', menuCodes)
      .order('sort_order');

    if (menusError) throw menusError;

    const menus: Menu[] = menusData || [];

    // 构建菜单树
    const menuMap = new Map<string, MenuTreeNode>();
    const rootMenus: MenuTreeNode[] = [];

    // 先创建所有节点
    menus.forEach(menu => {
      const node: MenuTreeNode = {
        ...menu,
        children: [],
        hasPermission: true
      };
      menuMap.set(menu.id, node);
    });

    // 构建树结构
    menus.forEach(menu => {
      const node = menuMap.get(menu.id)!;
      if (menu.parentId && menuMap.has(menu.parentId)) {
        const parent = menuMap.get(menu.parentId)!;
        parent.children.push(node);
      } else {
        rootMenus.push(node);
      }
    });

    // 排序子菜单
    rootMenus.forEach(menu => {
      menu.children.sort((a, b) => a.sortOrder - b.sortOrder);
    });

    return rootMenus.sort((a, b) => a.sortOrder - b.sortOrder);
  } catch (error) {
    console.error('获取用户菜单树失败:', error);
    return [];
  }
}

/**
 * 获取数据权限过滤条件
 */
export async function getDataPermissionFilter(userId: string, resource: string): Promise<DataPermissionFilter | null> {
  const permissionInfo = await getUserPermissionInfo(userId);
  if (!permissionInfo) return null;

  // 获取用户部门信息
  const client = getClient();
  const { data: userData, error: userError } = await client
    .from('users')
    .select('department')
    .eq('id', userId)
    .single();

  if (userError) {
    console.error('获取用户部门信息失败:', userError);
  }

  const department = userData?.department;

  // 过滤相关数据权限
  const relevantPermissions = permissionInfo.dataPermissions.filter(dp => dp.resource === resource);

  return {
    resource,
    userId,
    userRoles: permissionInfo.roles.map(r => r.id),
    department,
    conditions: relevantPermissions
  };
}

/**
 * 应用数据权限过滤
 */
export function applyDataPermissionFilter<T extends Record<string, any>>(
  data: T[],
  filter: DataPermissionFilter,
  creatorField = 'created_by',
  departmentField = 'department'
): T[] {
  if (!filter.conditions.length) return data;

  return data.filter(item => {
    // 检查每个条件
    return filter.conditions.some(condition => {
      switch (condition.conditionType) {
        case 'all':
          return true;
        case 'self':
          return item[creatorField] === filter.userId;
        case 'department':
          return item[departmentField] === filter.department;
        case 'creator':
          return item[creatorField] === filter.userId;
        case 'team':
          // 这里需要根据具体业务逻辑实现团队权限
          return true; // 暂时允许
        default:
          return false;
      }
    });
  });
}

/**
 * 初始化默认角色和权限
 */
export async function initializeDefaultRBAC(): Promise<void> {
  const client = getClient();

  try {
    // 默认角色
    const defaultRoles = [
      { role_code: 'admin', role_name: '管理员', description: '系统管理员，拥有所有权限' },
      { role_code: 'sales', role_name: '业务员', description: '负责订单和客户管理' },
      { role_code: 'merchandiser', role_name: '跟单员', description: '负责订单跟进和生产协调' },
      { role_code: 'worker', role_name: '车间工人', description: '负责生产报工' },
      { role_code: 'team_leader', role_name: '组长', description: '负责团队管理和审核' },
      { role_code: 'finance', role_name: '财务', description: '负责财务管理和核算' }
    ];

    // 插入默认角色
    for (const role of defaultRoles) {
      const { error } = await client
        .from('roles')
        .upsert(role, { onConflict: 'role_code' });
      if (error) throw error;
    }

    // 默认权限
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

    // 插入默认权限
    for (const permission of defaultPermissions) {
      const { error } = await client
        .from('permissions')
        .upsert(permission, { onConflict: 'permission_code' });
      if (error) throw error;
    }

    console.log('RBAC默认数据初始化完成');
  } catch (error) {
    console.error('初始化RBAC默认数据失败:', error);
    throw error;
  }
}