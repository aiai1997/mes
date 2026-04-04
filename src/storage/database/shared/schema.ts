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
