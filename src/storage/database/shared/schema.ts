import { pgTable, serial, varchar, timestamp, boolean, integer, numeric, jsonb, index, text } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

// 系统健康检查表（必须保留）
export const healthCheck = pgTable("health_check", {
  id: serial().notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
});

// 用户表
export const users = pgTable("users", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  username: varchar("username", { length: 50 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  real_name: varchar("real_name", { length: 50 }),
  role: varchar("role", { length: 20 }).notNull().default('业务员'),
  department: varchar("department", { length: 50 }),
  permissions: jsonb("permissions").$type<string[]>().default([]),
  status: varchar("status", { length: 10 }).notNull().default('启用'),
  last_login: varchar("last_login", { length: 50 }),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }),
  password_changed_at: timestamp("password_changed_at", { withTimezone: true }),
}, (table) => [
  index("users_username_idx").on(table.username),
  index("users_status_idx").on(table.status),
]);

// 角色表
export const roles = pgTable("roles", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  role_code: varchar("role_code", { length: 50 }).notNull().unique(),
  role_name: varchar("role_name", { length: 50 }).notNull(),
  description: text("description"),
  status: varchar("status", { length: 10 }).notNull().default('启用'),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }),
}, (table) => [
  index("roles_code_idx").on(table.role_code),
  index("roles_name_idx").on(table.role_name),
]);

// 权限表
export const permissions = pgTable("permissions", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  permission_code: varchar("permission_code", { length: 100 }).notNull().unique(),
  permission_name: varchar("permission_name", { length: 100 }).notNull(),
  resource: varchar("resource", { length: 50 }).notNull(), // 资源类型：menu, api, data
  action: varchar("action", { length: 50 }).notNull(), // 操作：create, read, update, delete, audit等
  description: text("description"),
  status: varchar("status", { length: 10 }).notNull().default('启用'),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }),
}, (table) => [
  index("permissions_code_idx").on(table.permission_code),
  index("permissions_resource_idx").on(table.resource),
]);

// 角色权限关联表
export const role_permissions = pgTable("role_permissions", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  role_id: varchar("role_id", { length: 36 }).notNull().references(() => roles.id),
  permission_id: varchar("permission_id", { length: 36 }).notNull().references(() => permissions.id),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("role_permissions_role_id_idx").on(table.role_id),
  index("role_permissions_permission_id_idx").on(table.permission_id),
]);

// 用户角色关联表
export const user_roles = pgTable("user_roles", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  user_id: varchar("user_id", { length: 36 }).notNull().references(() => users.id),
  role_id: varchar("role_id", { length: 36 }).notNull().references(() => roles.id),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("user_roles_user_id_idx").on(table.user_id),
  index("user_roles_role_id_idx").on(table.role_id),
]);

// 菜单表
export const menus = pgTable("menus", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  menu_code: varchar("menu_code", { length: 50 }).notNull().unique(),
  menu_name: varchar("menu_name", { length: 100 }).notNull(),
  parent_id: varchar("parent_id", { length: 36 }),
  path: varchar("path", { length: 200 }),
  icon: varchar("icon", { length: 50 }),
  sort_order: integer("sort_order").default(0),
  status: varchar("status", { length: 10 }).notNull().default('启用'),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }),
}, (table) => [
  index("menus_code_idx").on(table.menu_code),
  index("menus_parent_id_idx").on(table.parent_id),
  index("menus_sort_order_idx").on(table.sort_order),
]);

// 菜单权限关联表
export const menu_permissions = pgTable("menu_permissions", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  menu_id: varchar("menu_id", { length: 36 }).notNull().references(() => menus.id),
  permission_id: varchar("permission_id", { length: 36 }).notNull().references(() => permissions.id),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("menu_permissions_menu_id_idx").on(table.menu_id),
  index("menu_permissions_permission_id_idx").on(table.permission_id),
]);

// 数据权限表
export const data_permissions = pgTable("data_permissions", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  role_id: varchar("role_id", { length: 36 }).notNull().references(() => roles.id),
  resource: varchar("resource", { length: 50 }).notNull(), // 数据资源类型：order, customer, employee等
  condition_type: varchar("condition_type", { length: 20 }).notNull(), // 条件类型：department, creator, all
  condition_value: varchar("condition_value", { length: 100 }), // 条件值
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("data_permissions_role_id_idx").on(table.role_id),
  index("data_permissions_resource_idx").on(table.resource),
]);

// 操作日志表
export const operation_logs = pgTable("operation_logs", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  log_no: varchar("log_no", { length: 30 }).notNull().unique(),
  module: varchar("module", { length: 50 }).notNull(), // 模块：订单管理、BOM管理等
  action: varchar("action", { length: 50 }).notNull(), // 操作：新增、编辑、删除等
  description: text("description"),
  operator: varchar("operator", { length: 50 }).notNull(), // 操作人
  operator_id: varchar("operator_id", { length: 36 }),
  ip_address: varchar("ip_address", { length: 45 }), // 支持IPv6
  user_agent: text("user_agent"),
  old_data: jsonb("old_data"), // 操作前数据
  new_data: jsonb("new_data"), // 操作后数据
  resource_id: varchar("resource_id", { length: 36 }), // 关联资源ID
  resource_type: varchar("resource_type", { length: 50 }), // 资源类型
  status: varchar("status", { length: 20 }).default('成功'), // 成功/失败
  error_message: text("error_message"),
  operate_time: timestamp("operate_time", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("operation_logs_log_no_idx").on(table.log_no),
  index("operation_logs_module_idx").on(table.module),
  index("operation_logs_operator_idx").on(table.operator),
  index("operation_logs_operate_time_idx").on(table.operate_time),
  index("operation_logs_resource_type_idx").on(table.resource_type),
  index("operation_logs_resource_id_idx").on(table.resource_id),
]);

// 财务流水表
export const financial_transactions = pgTable("financial_transactions", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  transaction_no: varchar("transaction_no", { length: 30 }).notNull().unique(),
  transaction_type: varchar("transaction_type", { length: 20 }).notNull(), // 收入/支出
  category: varchar("category", { length: 50 }).notNull(), // 分类：订单收入、外协支出、工资支出等
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 10 }).default('CNY'),
  related_id: varchar("related_id", { length: 36 }), // 关联业务ID
  related_type: varchar("related_type", { length: 50 }), // 关联业务类型：order, outsourcing, salary等
  description: text("description"),
  operator: varchar("operator", { length: 50 }),
  operator_id: varchar("operator_id", { length: 36 }),
  transaction_date: timestamp("transaction_date", { withTimezone: true }).defaultNow().notNull(),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("financial_transactions_no_idx").on(table.transaction_no),
  index("financial_transactions_type_idx").on(table.transaction_type),
  index("financial_transactions_category_idx").on(table.category),
  index("financial_transactions_related_id_idx").on(table.related_id),
  index("financial_transactions_date_idx").on(table.transaction_date),
]);

// 员工计件薪资表
export const piece_rate_salaries = pgTable("piece_rate_salaries", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  salary_no: varchar("salary_no", { length: 30 }).notNull().unique(),
  employee_id: varchar("employee_id", { length: 36 }).notNull().references(() => employees.id),
  employee_name: varchar("employee_name", { length: 50 }),
  period_start: timestamp("period_start", { withTimezone: true }).notNull(),
  period_end: timestamp("period_end", { withTimezone: true }).notNull(),
  work_reports: jsonb("work_reports"), // 报工记录详情
  total_quantity: integer("total_quantity").default(0),
  unit_price: numeric("unit_price", { precision: 8, scale: 2 }).default('0'), // 计件单价
  total_amount: numeric("total_amount", { precision: 10, scale: 2 }).default('0'),
  base_wage: numeric("base_wage", { precision: 10, scale: 2 }).default('0'), // 基本工资
  subsidy: numeric("subsidy", { precision: 10, scale: 2 }).default('0'), // 补贴
  deductions: numeric("deductions", { precision: 10, scale: 2 }).default('0'), // 扣款
  net_amount: numeric("net_amount", { precision: 10, scale: 2 }).default('0'), // 实发金额
  status: varchar("status", { length: 20 }).default('待审核'), // 待审核/已审核/已发放
  audited_by: varchar("audited_by", { length: 50 }),
  audited_at: timestamp("audited_at", { withTimezone: true }),
  payment_date: timestamp("payment_date", { withTimezone: true }),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }),
}, (table) => [
  index("piece_rate_salaries_no_idx").on(table.salary_no),
  index("piece_rate_salaries_employee_id_idx").on(table.employee_id),
  index("piece_rate_salaries_period_idx").on(table.period_start, table.period_end),
  index("piece_rate_salaries_status_idx").on(table.status),
]);

// 供应商付款表
export const supplier_payments = pgTable("supplier_payments", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  payment_no: varchar("payment_no", { length: 30 }).notNull().unique(),
  supplier_id: varchar("supplier_id", { length: 36 }).notNull().references(() => suppliers.id),
  supplier_name: varchar("supplier_name", { length: 100 }),
  outsourcing_id: varchar("outsourcing_id", { length: 36 }), // 关联外协ID
  outsourcing_no: varchar("outsourcing_no", { length: 30 }),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 10 }).default('CNY'),
  payment_method: varchar("payment_method", { length: 20 }), // 付款方式
  payment_date: timestamp("payment_date", { withTimezone: true }),
  due_date: timestamp("due_date", { withTimezone: true }),
  status: varchar("status", { length: 20 }).default('待付款'), // 待付款/部分付款/已付款/逾期
  description: text("description"),
  operator: varchar("operator", { length: 50 }),
  operator_id: varchar("operator_id", { length: 36 }),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }),
}, (table) => [
  index("supplier_payments_no_idx").on(table.payment_no),
  index("supplier_payments_supplier_id_idx").on(table.supplier_id),
  index("supplier_payments_outsourcing_id_idx").on(table.outsourcing_id),
  index("supplier_payments_status_idx").on(table.status),
  index("supplier_payments_due_date_idx").on(table.due_date),
]);

// 客户表
export const customers = pgTable("customers", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  customer_code: varchar("customer_code", { length: 20 }).notNull().unique(),
  customer_name: varchar("customer_name", { length: 100 }).notNull(),
  contact_person: varchar("contact_person", { length: 50 }),
  phone: varchar("phone", { length: 20 }),
  address: varchar("address", { length: 255 }),
  status: varchar("status", { length: 10 }).notNull().default('启用'),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }),
}, (table) => [
  index("customers_code_idx").on(table.customer_code),
  index("customers_name_idx").on(table.customer_name),
]);

// 供应商表
export const suppliers = pgTable("suppliers", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  supplier_code: varchar("supplier_code", { length: 20 }).notNull().unique(),
  supplier_name: varchar("supplier_name", { length: 100 }).notNull(),
  contact_person: varchar("contact_person", { length: 50 }),
  phone: varchar("phone", { length: 20 }),
  address: varchar("address", { length: 255 }),
  status: varchar("status", { length: 10 }).notNull().default('启用'),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }),
}, (table) => [
  index("suppliers_code_idx").on(table.supplier_code),
  index("suppliers_name_idx").on(table.supplier_name),
]);

// 班组表
export const teams = pgTable("teams", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  team_code: varchar("team_code", { length: 20 }).notNull().unique(),
  team_name: varchar("team_name", { length: 50 }).notNull(),
  team_type: varchar("team_type", { length: 20 }),
  leader_name: varchar("leader_name", { length: 50 }),
  member_count: integer("member_count").default(0),
  status: varchar("status", { length: 10 }).notNull().default('启用'),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }),
}, (table) => [
  index("teams_code_idx").on(table.team_code),
  index("teams_name_idx").on(table.team_name),
]);

// 员工表
export const employees = pgTable("employees", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  employee_no: varchar("employee_no", { length: 20 }).notNull().unique(),
  name: varchar("name", { length: 50 }).notNull(),
  gender: varchar("gender", { length: 10 }).notNull().default('男'),
  id_card: varchar("id_card", { length: 18 }),
  phone: varchar("phone", { length: 20 }),
  team_id: varchar("team_id", { length: 36 }).references(() => teams.id),
  team_name: varchar("team_name", { length: 50 }),
  position: varchar("position", { length: 50 }),
  wage_level: varchar("wage_level", { length: 20 }),
  base_wage: numeric("base_wage", { precision: 10, scale: 2 }).default('0'),
  subsidy: numeric("subsidy", { precision: 10, scale: 2 }).default('0'),
  entry_date: varchar("entry_date", { length: 20 }),
  status: varchar("status", { length: 10 }).notNull().default('在职'),
  user_id: varchar("user_id", { length: 36 }).references(() => users.id),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }),
}, (table) => [
  index("employees_no_idx").on(table.employee_no),
  index("employees_name_idx").on(table.name),
  index("employees_team_id_idx").on(table.team_id),
  index("employees_user_id_idx").on(table.user_id),
]);

// 订单表
export const orders = pgTable("orders", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  order_no: varchar("order_no", { length: 30 }).notNull().unique(),
  style_no: varchar("style_no", { length: 50 }).notNull(),
  product_name: varchar("product_name", { length: 100 }).notNull(),
  customer_id: varchar("customer_id", { length: 36 }).references(() => customers.id),
  customer_name: varchar("customer_name", { length: 100 }),
  brand: varchar("brand", { length: 50 }),
  customer_model: varchar("customer_model", { length: 50 }),
  order_date: varchar("order_date", { length: 20 }).notNull(),
  delivery_date: varchar("delivery_date", { length: 20 }).notNull(),
  total_quantity: integer("total_quantity").notNull().default(0),
  color_size_matrix: jsonb("color_size_matrix"),
  print_embroidery: jsonb("print_embroidery"),
  wash_requirement: jsonb("wash_requirement"),
  packing_requirement: jsonb("packing_requirement"),
  tail_requirement: jsonb("tail_requirement"),
  status: varchar("status", { length: 20 }).notNull().default('待审核'),
  created_by: varchar("created_by", { length: 50 }),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }),
}, (table) => [
  index("orders_no_idx").on(table.order_no),
  index("orders_customer_id_idx").on(table.customer_id),
  index("orders_status_idx").on(table.status),
  index("orders_created_at_idx").on(table.created_at),
]);

// 物料档案表
export const materials = pgTable("materials", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  material_code: varchar("material_code", { length: 20 }).notNull().unique(),
  material_name: varchar("material_name", { length: 100 }).notNull(),
  category: varchar("category", { length: 20 }).notNull(),
  specification: varchar("specification", { length: 100 }),
  unit: varchar("unit", { length: 10 }),
  unit_price: numeric("unit_price", { precision: 10, scale: 2 }).default('0'),
  supplier: varchar("supplier", { length: 100 }),
  inventory: integer("inventory").default(0),
  safety_stock: integer("safety_stock").default(0),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }),
}, (table) => [
  index("materials_code_idx").on(table.material_code),
  index("materials_category_idx").on(table.category),
  index("materials_name_idx").on(table.material_name),
]);

// BOM表
export const boms = pgTable("boms", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  bom_no: varchar("bom_no", { length: 30 }).notNull().unique(),
  order_id: varchar("order_id", { length: 36 }).references(() => orders.id),
  order_no: varchar("order_no", { length: 30 }).notNull(),
  style_no: varchar("style_no", { length: 50 }),
  product_name: varchar("product_name", { length: 100 }),
  customer_name: varchar("customer_name", { length: 100 }),
  order_quantity: integer("order_quantity").default(0),
  color_size_matrix: jsonb("color_size_matrix"),
  delivery_date: varchar("delivery_date", { length: 20 }),
  bom_version: varchar("bom_version", { length: 10 }).default('01'),
  bom_type: varchar("bom_type", { length: 20 }).default('生产BOM'),
  status: varchar("status", { length: 20 }).notNull().default('草稿'),
  fabrics: jsonb("fabrics"),
  accessories: jsonb("accessories"),
  prints: jsonb("prints"),
  washes: jsonb("washes"),
  tails: jsonb("tails"),
  packings: jsonb("packings"),
  fabric_total_cost: numeric("fabric_total_cost", { precision: 12, scale: 2 }).default('0'),
  accessory_total_cost: numeric("accessory_total_cost", { precision: 12, scale: 2 }).default('0'),
  print_total_cost: numeric("print_total_cost", { precision: 12, scale: 2 }).default('0'),
  wash_total_cost: numeric("wash_total_cost", { precision: 12, scale: 2 }).default('0'),
  tail_total_cost: numeric("tail_total_cost", { precision: 12, scale: 2 }).default('0'),
  packing_total_cost: numeric("packing_total_cost", { precision: 12, scale: 2 }).default('0'),
  piece_cost: numeric("piece_cost", { precision: 12, scale: 2 }).default('0'),
  total_cost: numeric("total_cost", { precision: 12, scale: 2 }).default('0'),
  created_by: varchar("created_by", { length: 50 }),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }),
  audited_by: varchar("audited_by", { length: 50 }),
  audited_at: timestamp("audited_at", { withTimezone: true }),
  effective_at: timestamp("effective_at", { withTimezone: true }),
}, (table) => [
  index("boms_no_idx").on(table.bom_no),
  index("boms_order_id_idx").on(table.order_id),
  index("boms_status_idx").on(table.status),
  index("boms_created_at_idx").on(table.created_at),
]);

// 裁床任务表
export const cutting_tasks = pgTable("cutting_tasks", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  task_no: varchar("task_no", { length: 30 }).notNull().unique(),
  order_id: varchar("order_id", { length: 36 }).references(() => orders.id),
  order_no: varchar("order_no", { length: 30 }),
  style_no: varchar("style_no", { length: 50 }),
  product_name: varchar("product_name", { length: 100 }),
  cut_quantity: integer("cut_quantity").default(0),
  status: varchar("status", { length: 20 }).notNull().default('待裁剪'),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }),
}, (table) => [
  index("cutting_tasks_no_idx").on(table.task_no),
  index("cutting_tasks_order_id_idx").on(table.order_id),
  index("cutting_tasks_status_idx").on(table.status),
]);

// 扎号表
export const bundles = pgTable("bundles", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  bundle_no: varchar("bundle_no", { length: 30 }).notNull().unique(),
  order_id: varchar("order_id", { length: 36 }).references(() => orders.id),
  order_no: varchar("order_no", { length: 30 }),
  color: varchar("color", { length: 50 }),
  size: varchar("size", { length: 20 }),
  quantity: integer("quantity").default(0),
  status: varchar("status", { length: 20 }).notNull().default('待处理'),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }),
}, (table) => [
  index("bundles_no_idx").on(table.bundle_no),
  index("bundles_order_id_idx").on(table.order_id),
  index("bundles_status_idx").on(table.status),
]);

// 报工记录表
export const work_reports = pgTable("work_reports", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  report_no: varchar("report_no", { length: 30 }).notNull().unique(),
  employee_id: varchar("employee_id", { length: 36 }).references(() => employees.id),
  employee_name: varchar("employee_name", { length: 50 }),
  bundle_no: varchar("bundle_no", { length: 30 }),
  process: varchar("process", { length: 50 }),
  quantity: integer("quantity").default(0),
  status: varchar("status", { length: 20 }).notNull().default('待审核'),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }),
}, (table) => [
  index("work_reports_no_idx").on(table.report_no),
  index("work_reports_employee_id_idx").on(table.employee_id),
  index("work_reports_created_at_idx").on(table.created_at),
]);

// 质检记录表
export const qc_records = pgTable("qc_records", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  qc_no: varchar("qc_no", { length: 30 }).notNull().unique(),
  order_id: varchar("order_id", { length: 36 }).references(() => orders.id),
  order_no: varchar("order_no", { length: 30 }),
  inspector: varchar("inspector", { length: 50 }),
  pass_quantity: integer("pass_quantity").default(0),
  fail_quantity: integer("fail_quantity").default(0),
  status: varchar("status", { length: 20 }).notNull().default('待检验'),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }),
}, (table) => [
  index("qc_records_no_idx").on(table.qc_no),
  index("qc_records_order_id_idx").on(table.order_id),
]);

// 外协表
export const outsourcing = pgTable("outsourcing", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  outsource_no: varchar("outsource_no", { length: 30 }).notNull().unique(),
  order_id: varchar("order_id", { length: 36 }).references(() => orders.id),
  order_no: varchar("order_no", { length: 30 }),
  supplier_id: varchar("supplier_id", { length: 36 }).references(() => suppliers.id),
  supplier_name: varchar("supplier_name", { length: 100 }),
  outsource_type: varchar("outsource_type", { length: 20 }),
  quantity: integer("quantity").default(0),
  unit_price: numeric("unit_price", { precision: 10, scale: 2 }).default('0'),
  total_amount: numeric("total_amount", { precision: 12, scale: 2 }).default('0'),
  status: varchar("status", { length: 20 }).notNull().default('待发外'),
  send_date: varchar("send_date", { length: 20 }),
  return_date: varchar("return_date", { length: 20 }),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }),
}, (table) => [
  index("outsourcing_no_idx").on(table.outsource_no),
  index("outsourcing_order_id_idx").on(table.order_id),
  index("outsourcing_supplier_id_idx").on(table.supplier_id),
  index("outsourcing_status_idx").on(table.status),
]);

// 发货记录表
export const deliveries = pgTable("deliveries", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  delivery_no: varchar("delivery_no", { length: 30 }).notNull().unique(),
  order_id: varchar("order_id", { length: 36 }).references(() => orders.id),
  order_no: varchar("order_no", { length: 30 }),
  customer_id: varchar("customer_id", { length: 36 }).references(() => customers.id),
  customer_name: varchar("customer_name", { length: 100 }),
  quantity: integer("quantity").default(0),
  status: varchar("status", { length: 20 }).notNull().default('待发货'),
  delivery_date: varchar("delivery_date", { length: 20 }),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }),
}, (table) => [
  index("deliveries_no_idx").on(table.delivery_no),
  index("deliveries_order_id_idx").on(table.order_id),
  index("deliveries_customer_id_idx").on(table.customer_id),
]);

// 应收账款表
export const receivables = pgTable("receivables", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  receivable_no: varchar("receivable_no", { length: 30 }).notNull().unique(),
  order_id: varchar("order_id", { length: 36 }).references(() => orders.id),
  order_no: varchar("order_no", { length: 30 }),
  customer_id: varchar("customer_id", { length: 36 }).references(() => customers.id),
  customer_name: varchar("customer_name", { length: 100 }),
  amount: numeric("amount", { precision: 12, scale: 2 }).default('0'),
  paid_amount: numeric("paid_amount", { precision: 12, scale: 2 }).default('0'),
  status: varchar("status", { length: 20 }).notNull().default('待收款'),
  due_date: varchar("due_date", { length: 20 }),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }),
}, (table) => [
  index("receivables_no_idx").on(table.receivable_no),
  index("receivables_customer_id_idx").on(table.customer_id),
  index("receivables_status_idx").on(table.status),
]);

// 应付账款表
export const payables = pgTable("payables", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  payable_no: varchar("payable_no", { length: 30 }).notNull().unique(),
  supplier_id: varchar("supplier_id", { length: 36 }).references(() => suppliers.id),
  supplier_name: varchar("supplier_name", { length: 100 }),
  amount: numeric("amount", { precision: 12, scale: 2 }).default('0'),
  paid_amount: numeric("paid_amount", { precision: 12, scale: 2 }).default('0'),
  status: varchar("status", { length: 20 }).notNull().default('待付款'),
  due_date: varchar("due_date", { length: 20 }),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }),
}, (table) => [
  index("payables_no_idx").on(table.payable_no),
  index("payables_supplier_id_idx").on(table.supplier_id),
  index("payables_status_idx").on(table.status),
]);

// 借料记录表
export const borrow_records = pgTable("borrow_records", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  borrow_no: varchar("borrow_no", { length: 30 }).notNull().unique(),
  material_id: varchar("material_id", { length: 36 }).references(() => materials.id),
  material_name: varchar("material_name", { length: 100 }),
  employee_id: varchar("employee_id", { length: 36 }).references(() => employees.id),
  employee_name: varchar("employee_name", { length: 50 }),
  quantity: integer("quantity").default(0),
  return_quantity: integer("return_quantity").default(0),
  status: varchar("status", { length: 20 }).notNull().default('借出'),
  borrow_date: varchar("borrow_date", { length: 20 }),
  return_date: varchar("return_date", { length: 20 }),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }),
}, (table) => [
  index("borrow_records_no_idx").on(table.borrow_no),
  index("borrow_records_material_id_idx").on(table.material_id),
  index("borrow_records_employee_id_idx").on(table.employee_id),
]);

// 系统预警表
export const alerts = pgTable("alerts", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  alert_type: varchar("alert_type", { length: 20 }).notNull(),
  title: varchar("title", { length: 100 }).notNull(),
  content: text("content"),
  severity: varchar("severity", { length: 10 }).default('info'),
  is_read: boolean("is_read").default(false),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index("alerts_type_idx").on(table.alert_type),
  index("alerts_is_read_idx").on(table.is_read),
  index("alerts_created_at_idx").on(table.created_at),
]);

// 库存表
export const stock_items = pgTable("stock_items", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  material_id: varchar("material_id", { length: 36 }).references(() => materials.id),
  material_code: varchar("material_code", { length: 20 }),
  material_name: varchar("material_name", { length: 100 }),
  quantity: integer("quantity").default(0),
  location: varchar("location", { length: 50 }),
  batch_no: varchar("batch_no", { length: 30 }),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }),
}, (table) => [
  index("stock_items_material_id_idx").on(table.material_id),
  index("stock_items_batch_no_idx").on(table.batch_no),
]);
