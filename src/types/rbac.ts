/**
 * RBAC权限管理相关类型定义
 */

// 角色接口
export interface Role {
  id: string;
  roleCode: string;
  roleName: string;
  description?: string;
  status: '启用' | '禁用';
  createdAt: string;
  updatedAt?: string;
}

// 权限接口
export interface Permission {
  id: string;
  permissionCode: string;
  permissionName: string;
  resource: string; // 资源类型：menu, api, data
  action: string; // 操作：create, read, update, delete, audit等
  description?: string;
  status: '启用' | '禁用';
  createdAt: string;
  updatedAt?: string;
}

// 角色权限关联接口
export interface RolePermission {
  id: string;
  roleId: string;
  permissionId: string;
  createdAt: string;
}

// 用户角色关联接口
export interface UserRole {
  id: string;
  userId: string;
  roleId: string;
  createdAt: string;
}

// 菜单接口
export interface Menu {
  id: string;
  menuCode: string;
  menuName: string;
  parentId?: string;
  path?: string;
  icon?: string;
  sortOrder: number;
  status: '启用' | '禁用';
  createdAt: string;
  updatedAt?: string;
  children?: Menu[];
  permissions?: string[];
}

// 菜单权限关联接口
export interface MenuPermission {
  id: string;
  menuId: string;
  permissionId: string;
  createdAt: string;
}

// 数据权限接口
export interface DataPermission {
  id: string;
  roleId: string;
  resource: string; // 数据资源类型：order, customer, employee等
  conditionType: 'department' | 'creator' | 'all' | 'team' | 'self';
  conditionValue?: string;
  createdAt: string;
}

// 操作日志接口
export interface OperationLog {
  id: string;
  logNo: string;
  module: string; // 模块：订单管理、BOM管理等
  action: string; // 操作：新增、编辑、删除等
  description?: string;
  operator: string; // 操作人
  operatorId?: string;
  ipAddress?: string;
  userAgent?: string;
  oldData?: any; // 操作前数据
  newData?: any; // 操作后数据
  resourceId?: string;
  resourceType?: string;
  status: '成功' | '失败';
  errorMessage?: string;
  operateTime: string;
}

// 财务流水接口
export interface FinancialTransaction {
  id: string;
  transactionNo: string;
  transactionType: '收入' | '支出';
  category: string; // 分类：订单收入、外协支出、工资支出等
  amount: number;
  currency: string;
  relatedId?: string;
  relatedType?: string;
  description?: string;
  operator?: string;
  operatorId?: string;
  transactionDate: string;
  createdAt: string;
}

// 员工计件薪资接口
export interface PieceRateSalary {
  id: string;
  salaryNo: string;
  employeeId: string;
  employeeName?: string;
  periodStart: string;
  periodEnd: string;
  workReports?: any[];
  totalQuantity: number;
  unitPrice: number;
  totalAmount: number;
  baseWage: number;
  subsidy: number;
  deductions: number;
  netAmount: number;
  status: '待审核' | '已审核' | '已发放';
  auditedBy?: string;
  auditedAt?: string;
  paymentDate?: string;
  createdAt: string;
  updatedAt?: string;
}

// 供应商付款接口
export interface SupplierPayment {
  id: string;
  paymentNo: string;
  supplierId: string;
  supplierName?: string;
  outsourcingId?: string;
  outsourcingNo?: string;
  amount: number;
  currency: string;
  paymentMethod?: string;
  paymentDate?: string;
  dueDate?: string;
  status: '待付款' | '部分付款' | '已付款' | '逾期';
  description?: string;
  operator?: string;
  operatorId?: string;
  createdAt: string;
  updatedAt?: string;
}

// 权限检查结果
export interface PermissionCheckResult {
  hasPermission: boolean;
  requiredPermissions: string[];
  userPermissions: string[];
}

// 数据权限过滤条件
export interface DataPermissionFilter {
  resource: string;
  userId: string;
  userRoles: string[];
  department?: string;
  conditions: DataPermission[];
}

// 菜单树节点
export interface MenuTreeNode extends Menu {
  children: MenuTreeNode[];
  hasPermission: boolean;
}

// 用户权限信息
export interface UserPermissionInfo {
  userId: string;
  username: string;
  roles: Role[];
  permissions: Permission[];
  menuPermissions: string[];
  dataPermissions: DataPermission[];
}