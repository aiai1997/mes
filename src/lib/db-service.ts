/**
 * 数据库服务层
 * 提供统一的数据库访问接口
 */

import { getSupabaseClient } from '@/storage/database/supabase-client';

// 数据计数接口
export interface DataCounts {
  customers: number;
  suppliers: number;
  teams: number;
  employees: number;
  orders: number;
  materials: number;
  stockItems: number;
  cuttingTasks: number;
  bundles: number;
  workReports: number;
  qcRecords: number;
  deliveries: number;
  outsourcing: number;
  receivables: number;
  payables: number;
  borrowRecords: number;
  alerts: number;
  total: number;
}

// 获取数据库客户端
function getClient() {
  return getSupabaseClient();
}

/**
 * 获取各表数据统计
 */
export async function getDataCounts(): Promise<DataCounts> {
  const client = getClient();
  
  const [
    customersResult,
    suppliersResult,
    teamsResult,
    employeesResult,
    ordersResult,
    materialsResult,
    stockItemsResult,
    cuttingTasksResult,
    bundlesResult,
    workReportsResult,
    qcRecordsResult,
    deliveriesResult,
    outsourcingResult,
    receivablesResult,
    payablesResult,
    borrowRecordsResult,
    alertsResult,
  ] = await Promise.all([
    client.from('customers').select('*', { count: 'exact', head: true }),
    client.from('suppliers').select('*', { count: 'exact', head: true }),
    client.from('teams').select('*', { count: 'exact', head: true }),
    client.from('employees').select('*', { count: 'exact', head: true }),
    client.from('orders').select('*', { count: 'exact', head: true }),
    client.from('materials').select('*', { count: 'exact', head: true }),
    client.from('stock_items').select('*', { count: 'exact', head: true }),
    client.from('cutting_tasks').select('*', { count: 'exact', head: true }),
    client.from('bundles').select('*', { count: 'exact', head: true }),
    client.from('work_reports').select('*', { count: 'exact', head: true }),
    client.from('qc_records').select('*', { count: 'exact', head: true }),
    client.from('deliveries').select('*', { count: 'exact', head: true }),
    client.from('outsourcing').select('*', { count: 'exact', head: true }),
    client.from('receivables').select('*', { count: 'exact', head: true }),
    client.from('payables').select('*', { count: 'exact', head: true }),
    client.from('borrow_records').select('*', { count: 'exact', head: true }),
    client.from('alerts').select('*', { count: 'exact', head: true }),
  ]);

  const counts: DataCounts = {
    customers: customersResult.count || 0,
    suppliers: suppliersResult.count || 0,
    teams: teamsResult.count || 0,
    employees: employeesResult.count || 0,
    orders: ordersResult.count || 0,
    materials: materialsResult.count || 0,
    stockItems: stockItemsResult.count || 0,
    cuttingTasks: cuttingTasksResult.count || 0,
    bundles: bundlesResult.count || 0,
    workReports: workReportsResult.count || 0,
    qcRecords: qcRecordsResult.count || 0,
    deliveries: deliveriesResult.count || 0,
    outsourcing: outsourcingResult.count || 0,
    receivables: receivablesResult.count || 0,
    payables: payablesResult.count || 0,
    borrowRecords: borrowRecordsResult.count || 0,
    alerts: alertsResult.count || 0,
    total: 0,
  };

  counts.total = Object.values(counts).reduce((sum, val) => sum + (typeof val === 'number' ? val : 0), 0) - counts.total;
  counts.total = counts.customers + counts.suppliers + counts.teams + counts.employees + 
                 counts.orders + counts.materials + counts.stockItems + counts.cuttingTasks +
                 counts.bundles + counts.workReports + counts.qcRecords + counts.deliveries +
                 counts.outsourcing + counts.receivables + counts.payables + counts.borrowRecords + 
                 counts.alerts;

  return counts;
}

/**
 * 清空所有演示数据
 */
export async function clearDemoData(): Promise<void> {
  const client = getClient();
  
  const tables = [
    'alerts', 'borrow_records', 'payables', 'receivables', 'deliveries',
    'outsourcing', 'qc_records', 'work_reports', 'bundles', 'cutting_tasks',
    'stock_items', 'boms', 'materials', 'orders', 'employees', 'teams',
    'suppliers', 'customers', 'users'
  ];

  for (const table of tables) {
    // 删除所有数据（RLS 策略允许公开操作）
    const { error } = await client.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (error) {
      console.error(`清空表 ${table} 失败:`, error.message);
    }
  }
}

/**
 * 初始化演示数据
 */
export async function initializeDemoData(): Promise<DataCounts> {
  const client = getClient();
  
  // 1. 客户数据
  const customers = [
    { customer_code: 'C001', customer_name: '杭州服装有限公司', contact_person: '王经理', phone: '13800138001', address: '杭州市西湖区', status: '启用' },
    { customer_code: 'C002', customer_name: '上海时尚集团', contact_person: '李总', phone: '13900139001', address: '上海市浦东新区', status: '启用' },
  ];
  
  const { error: customersError } = await client.from('customers').insert(customers);
  if (customersError) throw new Error(`插入客户失败: ${customersError.message}`);

  // 2. 供应商数据
  const suppliers = [
    { supplier_code: 'S001', supplier_name: '华纺布业', contact_person: '张经理', phone: '13700137001', address: '广州市天河区', status: '启用' },
    { supplier_code: 'S002', supplier_name: 'YKK拉链', contact_person: '陈经理', phone: '13600136001', address: '深圳市南山区', status: '启用' },
  ];
  
  const { error: suppliersError } = await client.from('suppliers').insert(suppliers);
  if (suppliersError) throw new Error(`插入供应商失败: ${suppliersError.message}`);

  // 3. 班组数据
  const teams = [
    { team_code: 'T001', team_name: '缝制A组', team_type: '缝制', leader_name: '张组长', member_count: 15, status: '启用' },
    { team_code: 'T002', team_name: '裁床组', team_type: '裁床', leader_name: '李组长', member_count: 8, status: '启用' },
    { team_code: 'T003', team_name: '尾部组', team_type: '尾部', leader_name: '王组长', member_count: 10, status: '启用' },
  ];
  
  const { error: teamsError } = await client.from('teams').insert(teams);
  if (teamsError) throw new Error(`插入班组失败: ${teamsError.message}`);

  // 4. 员工数据
  const employees = [
    { employee_no: 'E001', name: '张三', gender: '男', phone: '13800000001', team_name: '缝制A组', position: '车工', wage_level: 'A级', base_wage: '5000', subsidy: '500', entry_date: '2023-01-15', status: '在职' },
    { employee_no: 'E002', name: '李四', gender: '女', phone: '13800000002', team_name: '裁床组', position: '裁剪工', wage_level: 'B级', base_wage: '4500', subsidy: '300', entry_date: '2023-03-20', status: '在职' },
    { employee_no: 'E003', name: '王五', gender: '男', phone: '13800000003', team_name: '尾部组', position: '整烫工', wage_level: 'B级', base_wage: '4500', subsidy: '400', entry_date: '2023-05-10', status: '在职' },
  ];
  
  const { error: employeesError } = await client.from('employees').insert(employees);
  if (employeesError) throw new Error(`插入员工失败: ${employeesError.message}`);

  // 5. 订单数据
  const orders = [
    {
      order_no: 'ORD2024010001',
      style_no: 'STYLE-2024-001',
      product_name: '女士休闲连衣裙',
      customer_name: '杭州服装有限公司',
      brand: '时尚品牌',
      customer_model: 'MOD-001',
      order_date: '2024-01-15',
      delivery_date: '2024-03-15',
      total_quantity: 1000,
      color_size_matrix: [
        { colorName: '黑色', S: 50, M: 100, L: 150, XL: 100, XXL: 50, XXXL: 0, subtotal: 450 },
        { colorName: '白色', S: 50, M: 100, L: 150, XL: 100, XXL: 50, XXXL: 0, subtotal: 450 },
        { colorName: '蓝色', S: 20, M: 30, L: 30, XL: 20, XXL: 0, XXXL: 0, subtotal: 100 },
      ],
      status: '已审核',
      created_by: 'admin',
    },
    {
      order_no: 'ORD2024010002',
      style_no: 'STYLE-2024-002',
      product_name: '男士休闲衬衫',
      customer_name: '上海时尚集团',
      brand: '潮流品牌',
      customer_model: 'MOD-002',
      order_date: '2024-01-20',
      delivery_date: '2024-04-01',
      total_quantity: 2000,
      color_size_matrix: [
        { colorName: '深蓝', S: 100, M: 200, L: 300, XL: 200, XXL: 100, XXXL: 50, subtotal: 950 },
        { colorName: '浅灰', S: 100, M: 200, L: 300, XL: 200, XXL: 100, XXXL: 50, subtotal: 950 },
        { colorName: '白色', S: 20, M: 30, L: 30, XL: 20, XXL: 0, XXXL: 0, subtotal: 100 },
      ],
      status: '生产中',
      created_by: 'admin',
    },
  ];
  
  const { error: ordersError } = await client.from('orders').insert(orders);
  if (ordersError) throw new Error(`插入订单失败: ${ordersError.message}`);

  // 6. 物料数据
  const materials = [
    { material_code: 'ML001', material_name: '纯棉汗布', category: '面料', specification: '180g/m²', unit: '米', unit_price: '35', supplier: '华纺布业', inventory: 5000, safety_stock: 1000 },
    { material_code: 'ML002', material_name: '涤棉斜纹布', category: '面料', specification: '200g/m²', unit: '米', unit_price: '28', supplier: '华纺布业', inventory: 8000, safety_stock: 2000 },
    { material_code: 'ML003', material_name: '牛仔布', category: '面料', specification: '12oz', unit: '米', unit_price: '45', supplier: '牛仔世界', inventory: 3000, safety_stock: 800 },
    { material_code: 'FL001', material_name: '树脂纽扣', category: '辅料', specification: '15mm', unit: '个', unit_price: '0.15', supplier: '纽扣城', inventory: 50000, safety_stock: 10000 },
    { material_code: 'FL002', material_name: '金属拉链', category: '辅料', specification: '20cm', unit: '条', unit_price: '2.5', supplier: 'YKK', inventory: 3000, safety_stock: 500 },
    { material_code: 'FL003', material_name: '涤纶缝纫线', category: '辅料', specification: '40S/2', unit: '轴', unit_price: '8', supplier: '线业公司', inventory: 2000, safety_stock: 300 },
    { material_code: 'FL004', material_name: '洗水标', category: '辅料', specification: '3×5cm', unit: '个', unit_price: '0.05', supplier: '标牌厂', inventory: 100000, safety_stock: 20000 },
    { material_code: 'BZ001', material_name: 'PE胶袋', category: '包装', specification: '30×40cm', unit: '个', unit_price: '0.3', supplier: '包装材料厂', inventory: 20000, safety_stock: 5000 },
    { material_code: 'BZ002', material_name: '纸箱', category: '包装', specification: '60×40×30cm', unit: '个', unit_price: '5', supplier: '纸箱厂', inventory: 500, safety_stock: 100 },
    { material_code: 'BZ003', material_name: '吊牌', category: '包装', specification: '5×8cm', unit: '个', unit_price: '0.1', supplier: '印刷厂', inventory: 30000, safety_stock: 5000 },
  ];
  
  const { error: materialsError } = await client.from('materials').insert(materials);
  if (materialsError) throw new Error(`插入物料失败: ${materialsError.message}`);

  // 7. 裁床任务
  const cuttingTasks = [
    { task_no: 'CT2024010001', order_no: 'ORD2024010001', style_no: 'STYLE-2024-001', product_name: '女士休闲连衣裙', cut_quantity: 500, status: '已裁剪' },
  ];
  
  const { error: cuttingTasksError } = await client.from('cutting_tasks').insert(cuttingTasks);
  if (cuttingTasksError) throw new Error(`插入裁床任务失败: ${cuttingTasksError.message}`);

  // 8. 报工记录
  const workReports = [
    { report_no: 'WR2024010001', employee_name: '张三', bundle_no: 'BND2024010001', process: '车缝', quantity: 100, status: '已审核' },
  ];
  
  const { error: workReportsError } = await client.from('work_reports').insert(workReports);
  if (workReportsError) throw new Error(`插入报工记录失败: ${workReportsError.message}`);

  // 9. 应收账款
  const receivables = [
    { receivable_no: 'AR2024010001', order_no: 'ORD2024010001', customer_name: '杭州服装有限公司', amount: '50000', paid_amount: '20000', status: '部分收款', due_date: '2024-04-15' },
  ];
  
  const { error: receivablesError } = await client.from('receivables').insert(receivables);
  if (receivablesError) throw new Error(`插入应收账款失败: ${receivablesError.message}`);

  // 10. 应付账款
  const payables = [
    { payable_no: 'AP2024010001', supplier_name: '华纺布业', amount: '15000', paid_amount: '0', status: '待付款', due_date: '2024-02-28' },
  ];
  
  const { error: payablesError } = await client.from('payables').insert(payables);
  if (payablesError) throw new Error(`插入应付账款失败: ${payablesError.message}`);

  // 返回数据统计
  return await getDataCounts();
}

/**
 * 检查数据库是否可用
 */
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    const client = getClient();
    const { error } = await client.from('customers').select('id').limit(1);
    return !error;
  } catch {
    return false;
  }
}
