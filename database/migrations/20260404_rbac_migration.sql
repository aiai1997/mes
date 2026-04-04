-- RBAC权限管理系统数据库迁移脚本
-- 执行时间: 2026-04-04
-- 说明: 为MES系统添加完整的RBAC权限体系、操作日志、财务核算等功能

-- 1. 角色表
CREATE TABLE IF NOT EXISTS roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_code VARCHAR(50) NOT NULL UNIQUE,
  role_name VARCHAR(50) NOT NULL,
  description TEXT,
  status VARCHAR(10) NOT NULL DEFAULT '启用',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE
);

-- 2. 权限表
CREATE TABLE IF NOT EXISTS permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  permission_code VARCHAR(100) NOT NULL UNIQUE,
  permission_name VARCHAR(100) NOT NULL,
  resource VARCHAR(50) NOT NULL, -- 资源类型：menu, api, data
  action VARCHAR(50) NOT NULL, -- 操作：create, read, update, delete, audit等
  description TEXT,
  status VARCHAR(10) NOT NULL DEFAULT '启用',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE
);

-- 3. 角色权限关联表
CREATE TABLE IF NOT EXISTS role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(role_id, permission_id)
);

-- 4. 用户角色关联表
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, role_id)
);

-- 5. 菜单表
CREATE TABLE IF NOT EXISTS menus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_code VARCHAR(50) NOT NULL UNIQUE,
  menu_name VARCHAR(100) NOT NULL,
  parent_id UUID,
  path VARCHAR(200),
  icon VARCHAR(50),
  sort_order INTEGER DEFAULT 0,
  status VARCHAR(10) NOT NULL DEFAULT '启用',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE
);

-- 6. 菜单权限关联表
CREATE TABLE IF NOT EXISTS menu_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_id UUID NOT NULL REFERENCES menus(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(menu_id, permission_id)
);

-- 7. 数据权限表
CREATE TABLE IF NOT EXISTS data_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  resource VARCHAR(50) NOT NULL, -- 数据资源类型：order, customer, employee等
  condition_type VARCHAR(20) NOT NULL, -- 条件类型：department, creator, all
  condition_value VARCHAR(100), -- 条件值
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. 操作日志表
CREATE TABLE IF NOT EXISTS operation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  log_no VARCHAR(30) NOT NULL UNIQUE,
  module VARCHAR(50) NOT NULL, -- 模块：订单管理、BOM管理等
  action VARCHAR(50) NOT NULL, -- 操作：新增、编辑、删除等
  description TEXT,
  operator VARCHAR(50) NOT NULL, -- 操作人
  operator_id UUID,
  ip_address INET, -- 支持IPv6
  user_agent TEXT,
  old_data JSONB, -- 操作前数据
  new_data JSONB, -- 操作后数据
  resource_id UUID, -- 关联资源ID
  resource_type VARCHAR(50), -- 资源类型
  status VARCHAR(20) DEFAULT '成功', -- 成功/失败
  error_message TEXT,
  operate_time TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. 财务流水表
CREATE TABLE IF NOT EXISTS financial_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_no VARCHAR(30) NOT NULL UNIQUE,
  transaction_type VARCHAR(20) NOT NULL, -- 收入/支出
  category VARCHAR(50) NOT NULL, -- 分类：订单收入、外协支出、工资支出等
  amount DECIMAL(12,2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'CNY',
  related_id UUID, -- 关联业务ID
  related_type VARCHAR(50), -- 关联业务类型：order, outsourcing, salary等
  description TEXT,
  operator VARCHAR(50),
  operator_id UUID,
  transaction_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. 员工计件薪资表
CREATE TABLE IF NOT EXISTS piece_rate_salaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salary_no VARCHAR(30) NOT NULL UNIQUE,
  employee_id UUID NOT NULL REFERENCES employees(id),
  employee_name VARCHAR(50),
  period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  work_reports JSONB, -- 报工记录详情
  total_quantity INTEGER DEFAULT 0,
  unit_price DECIMAL(8,2) DEFAULT 0, -- 计件单价
  total_amount DECIMAL(10,2) DEFAULT 0,
  base_wage DECIMAL(10,2) DEFAULT 0, -- 基本工资
  subsidy DECIMAL(10,2) DEFAULT 0, -- 补贴
  deductions DECIMAL(10,2) DEFAULT 0, -- 扣款
  net_amount DECIMAL(10,2) DEFAULT 0, -- 实发金额
  status VARCHAR(20) DEFAULT '待审核', -- 待审核/已审核/已发放
  audited_by VARCHAR(50),
  audited_at TIMESTAMP WITH TIME ZONE,
  payment_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE
);

-- 11. 供应商付款表
CREATE TABLE IF NOT EXISTS supplier_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_no VARCHAR(30) NOT NULL UNIQUE,
  supplier_id UUID NOT NULL REFERENCES suppliers(id),
  supplier_name VARCHAR(100),
  outsourcing_id UUID, -- 关联外协ID
  outsourcing_no VARCHAR(30),
  amount DECIMAL(12,2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'CNY',
  payment_method VARCHAR(20), -- 付款方式
  payment_date TIMESTAMP WITH TIME ZONE,
  due_date TIMESTAMP WITH TIME ZONE,
  status VARCHAR(20) DEFAULT '待付款', -- 待付款/部分付款/已付款/逾期
  description TEXT,
  operator VARCHAR(50),
  operator_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_roles_code ON roles(role_code);
CREATE INDEX IF NOT EXISTS idx_roles_name ON roles(role_name);

CREATE INDEX IF NOT EXISTS idx_permissions_code ON permissions(permission_code);
CREATE INDEX IF NOT EXISTS idx_permissions_resource ON permissions(resource);

CREATE INDEX IF NOT EXISTS idx_role_permissions_role_id ON role_permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_permission_id ON role_permissions(permission_id);

CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_id ON user_roles(role_id);

CREATE INDEX IF NOT EXISTS idx_menus_code ON menus(menu_code);
CREATE INDEX IF NOT EXISTS idx_menus_parent_id ON menus(parent_id);
CREATE INDEX IF NOT EXISTS idx_menus_sort_order ON menus(sort_order);

CREATE INDEX IF NOT EXISTS idx_menu_permissions_menu_id ON menu_permissions(menu_id);
CREATE INDEX IF NOT EXISTS idx_menu_permissions_permission_id ON menu_permissions(permission_id);

CREATE INDEX IF NOT EXISTS idx_data_permissions_role_id ON data_permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_data_permissions_resource ON data_permissions(resource);

CREATE INDEX IF NOT EXISTS idx_operation_logs_log_no ON operation_logs(log_no);
CREATE INDEX IF NOT EXISTS idx_operation_logs_module ON operation_logs(module);
CREATE INDEX IF NOT EXISTS idx_operation_logs_operator ON operation_logs(operator);
CREATE INDEX IF NOT EXISTS idx_operation_logs_operate_time ON operation_logs(operate_time);
CREATE INDEX IF NOT EXISTS idx_operation_logs_resource_type ON operation_logs(resource_type);
CREATE INDEX IF NOT EXISTS idx_operation_logs_resource_id ON operation_logs(resource_id);

CREATE INDEX IF NOT EXISTS idx_financial_transactions_no ON financial_transactions(transaction_no);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_type ON financial_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_category ON financial_transactions(category);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_related_id ON financial_transactions(related_id);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_date ON financial_transactions(transaction_date);

CREATE INDEX IF NOT EXISTS idx_piece_rate_salaries_no ON piece_rate_salaries(salary_no);
CREATE INDEX IF NOT EXISTS idx_piece_rate_salaries_employee_id ON piece_rate_salaries(employee_id);
CREATE INDEX IF NOT EXISTS idx_piece_rate_salaries_period ON piece_rate_salaries(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_piece_rate_salaries_status ON piece_rate_salaries(status);

CREATE INDEX IF NOT EXISTS idx_supplier_payments_no ON supplier_payments(payment_no);
CREATE INDEX IF NOT EXISTS idx_supplier_payments_supplier_id ON supplier_payments(supplier_id);
CREATE INDEX IF NOT EXISTS idx_supplier_payments_outsourcing_id ON supplier_payments(outsourcing_id);
CREATE INDEX IF NOT EXISTS idx_supplier_payments_status ON supplier_payments(status);
CREATE INDEX IF NOT EXISTS idx_supplier_payments_due_date ON supplier_payments(due_date);

-- 插入默认角色数据
INSERT INTO roles (role_code, role_name, description) VALUES
('admin', '管理员', '系统管理员，拥有所有权限'),
('sales', '业务员', '负责订单和客户管理'),
('merchandiser', '跟单员', '负责订单跟进和生产协调'),
('worker', '车间工人', '负责生产报工'),
('team_leader', '组长', '负责团队管理和审核'),
('finance', '财务', '负责财务管理和核算')
ON CONFLICT (role_code) DO NOTHING;

-- 插入默认权限数据
INSERT INTO permissions (permission_code, permission_name, resource, action, description) VALUES
-- 菜单权限
('menu:dashboard', '仪表板访问', 'menu', 'read', '访问系统仪表板'),
('menu:orders', '订单管理', 'menu', 'read', '订单管理菜单'),
('menu:bom', 'BOM管理', 'menu', 'read', 'BOM管理菜单'),
('menu:cutting', '裁床管理', 'menu', 'read', '裁床管理菜单'),
('menu:workshop', '车间管理', 'menu', 'read', '车间管理菜单'),
('menu:quality', '品质管理', 'menu', 'read', '品质管理菜单'),
('menu:finance', '财务管理', 'menu', 'read', '财务管理菜单'),
('menu:logs', '操作日志', 'menu', 'read', '操作日志菜单'),

-- API权限
('order:create', '创建订单', 'api', 'create', '创建新订单'),
('order:read', '查看订单', 'api', 'read', '查看订单信息'),
('order:update', '编辑订单', 'api', 'update', '编辑订单信息'),
('order:delete', '删除订单', 'api', 'delete', '删除订单'),
('bom:create', '创建BOM', 'api', 'create', '创建BOM'),
('bom:audit', '审核BOM', 'api', 'audit', '审核BOM'),
('finance:view', '查看财务数据', 'api', 'read', '查看财务数据'),
('finance:audit', '财务审核', 'api', 'audit', '财务审核操作'),
('logs:read', '查看日志', 'api', 'read', '查看操作日志')
ON CONFLICT (permission_code) DO NOTHING;

-- 插入默认菜单数据
INSERT INTO menus (menu_code, menu_name, path, sort_order) VALUES
('dashboard', '仪表板', '/dashboard', 1),
('orders', '订单管理', '/dashboard/orders', 2),
('bom', 'BOM管理', '/dashboard/bom', 3),
('cutting', '裁床管理', '/dashboard/cutting', 4),
('workshop', '车间管理', '/dashboard/workshop', 5),
('quality', '品质管理', '/dashboard/quality', 6),
('finance', '财务管理', '/dashboard/finance', 7),
('logs', '操作日志', '/dashboard/logs', 8)
ON CONFLICT (menu_code) DO NOTHING;

-- 为管理员角色分配所有权限
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.role_code = 'admin'
ON CONFLICT DO NOTHING;

-- 为业务员角色分配相关权限
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.role_code = 'sales'
  AND p.permission_code IN ('menu:dashboard', 'menu:orders', 'order:create', 'order:read', 'order:update', 'order:delete')
ON CONFLICT DO NOTHING;

-- 为财务角色分配财务权限
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.role_code = 'finance'
  AND p.permission_code IN ('menu:dashboard', 'menu:finance', 'finance:view', 'finance:audit')
ON CONFLICT DO NOTHING;

-- 为菜单分配权限
INSERT INTO menu_permissions (menu_id, permission_id)
SELECT m.id, p.id
FROM menus m, permissions p
WHERE m.menu_code = 'dashboard' AND p.permission_code = 'menu:dashboard'
   OR m.menu_code = 'orders' AND p.permission_code = 'menu:orders'
   OR m.menu_code = 'bom' AND p.permission_code = 'menu:bom'
   OR m.menu_code = 'cutting' AND p.permission_code = 'menu:cutting'
   OR m.menu_code = 'workshop' AND p.permission_code = 'menu:workshop'
   OR m.menu_code = 'quality' AND p.permission_code = 'menu:quality'
   OR m.menu_code = 'finance' AND p.permission_code = 'menu:finance'
   OR m.menu_code = 'logs' AND p.permission_code = 'menu:logs'
ON CONFLICT DO NOTHING;

-- 为管理员用户分配管理员角色（假设存在admin用户）
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u, roles r
WHERE u.username = 'admin' AND r.role_code = 'admin'
ON CONFLICT DO NOTHING;

-- 为其他用户分配默认角色（业务员）
INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u, roles r
WHERE u.username != 'admin' AND r.role_code = 'sales'
  AND NOT EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = u.id)
ON CONFLICT DO NOTHING;