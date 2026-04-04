import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

/**
 * 初始化丰富的演示数据
 */
export async function POST() {
  try {
    const client = getSupabaseClient();
    
    // 1. 清空现有数据
    const tables = [
      'alerts', 'borrow_records', 'payables', 'receivables', 'deliveries',
      'outsourcing', 'qc_records', 'work_reports', 'bundles', 'cutting_tasks',
      'stock_items', 'boms', 'materials', 'orders', 'employees', 'teams',
      'suppliers', 'customers', 'users'
    ];
    
    for (const table of tables) {
      await client.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000');
    }

    // 2. 插入客户数据（10个）
    const customers = [
      { customer_code: 'C001', customer_name: '杭州服装有限公司', contact_person: '王经理', phone: '13800138001', address: '杭州市西湖区', status: '启用' },
      { customer_code: 'C002', customer_name: '上海时尚集团', contact_person: '李总', phone: '13900139001', address: '上海市浦东新区', status: '启用' },
      { customer_code: 'C003', customer_name: '广州纺织贸易', contact_person: '张总', phone: '13500135001', address: '广州市白云区', status: '启用' },
      { customer_code: 'C004', customer_name: '深圳品牌服饰', contact_person: '刘经理', phone: '13600136001', address: '深圳市福田区', status: '启用' },
      { customer_code: 'C005', customer_name: '北京时装公司', contact_person: '赵总', phone: '13700137001', address: '北京市朝阳区', status: '启用' },
      { customer_code: 'C006', customer_name: '江苏纺织集团', contact_person: '陈经理', phone: '13800138002', address: '南京市鼓楼区', status: '启用' },
      { customer_code: 'C007', customer_name: '浙江服饰贸易', contact_person: '周总', phone: '13900139002', address: '宁波市海曙区', status: '启用' },
      { customer_code: 'C008', customer_name: '福建服装出口', contact_person: '吴经理', phone: '13500135002', address: '厦门市思明区', status: '启用' },
      { customer_code: 'C009', customer_name: '山东纺织品', contact_person: '郑总', phone: '13600136002', address: '青岛市市南区', status: '启用' },
      { customer_code: 'C010', customer_name: '天津服饰公司', contact_person: '孙经理', phone: '13700137002', address: '天津市和平区', status: '启用' },
    ];
    
    const { error: customersError } = await client.from('customers').insert(customers);
    if (customersError) throw new Error(`插入客户失败: ${customersError.message}`);

    // 3. 插入供应商数据（10个）
    const suppliers = [
      { supplier_code: 'S001', supplier_name: '华纺布业', contact_person: '张经理', phone: '13700137001', address: '广州市天河区', status: '启用' },
      { supplier_code: 'S002', supplier_name: 'YKK拉链', contact_person: '陈经理', phone: '13600136001', address: '深圳市南山区', status: '启用' },
      { supplier_code: 'S003', supplier_name: '牛仔世界', contact_person: '王总', phone: '13500135001', address: '东莞市虎门镇', status: '启用' },
      { supplier_code: 'S004', supplier_name: '纽扣城', contact_person: '李经理', phone: '13800138001', address: '义乌市稠城镇', status: '启用' },
      { supplier_code: 'S005', supplier_name: '线业公司', contact_person: '赵总', phone: '13900139001', address: '绍兴市柯桥区', status: '启用' },
      { supplier_code: 'S006', supplier_name: '标牌厂', contact_person: '刘经理', phone: '13600136002', address: '温州市瓯海区', status: '启用' },
      { supplier_code: 'S007', supplier_name: '包装材料厂', contact_person: '周总', phone: '13700137002', address: '佛山市南海区', status: '启用' },
      { supplier_code: 'S008', supplier_name: '纸箱厂', contact_person: '吴经理', phone: '13500135002', address: '惠州市惠城区', status: '启用' },
      { supplier_code: 'S009', supplier_name: '印刷厂', contact_person: '郑总', phone: '13800138002', address: '深圳市宝安区', status: '启用' },
      { supplier_code: 'S010', supplier_name: '绣花加工', contact_person: '孙经理', phone: '13900139002', address: '东莞市厚街镇', status: '启用' },
    ];
    
    const { error: suppliersError } = await client.from('suppliers').insert(suppliers);
    if (suppliersError) throw new Error(`插入供应商失败: ${suppliersError.message}`);

    // 4. 插入班组数据（8个）
    const teams = [
      { team_code: 'T001', team_name: '缝制A组', team_type: '缝制', leader_name: '张组长', member_count: 15, status: '启用' },
      { team_code: 'T002', team_name: '缝制B组', team_type: '缝制', leader_name: '李组长', member_count: 12, status: '启用' },
      { team_code: 'T003', team_name: '裁床组', team_type: '裁床', leader_name: '王组长', member_count: 8, status: '启用' },
      { team_code: 'T004', team_name: '尾部组', team_type: '尾部', leader_name: '赵组长', member_count: 10, status: '启用' },
      { team_code: 'T005', team_name: '质检组', team_type: '质检', leader_name: '刘组长', member_count: 6, status: '启用' },
      { team_code: 'T006', team_name: '包装组', team_type: '包装', leader_name: '周组长', member_count: 8, status: '启用' },
      { team_code: 'T007', team_name: '印花组', team_type: '印花', leader_name: '吴组长', member_count: 5, status: '启用' },
      { team_code: 'T008', team_name: '绣花组', team_type: '绣花', leader_name: '郑组长', member_count: 5, status: '启用' },
    ];
    
    const { error: teamsError } = await client.from('teams').insert(teams);
    if (teamsError) throw new Error(`插入班组失败: ${teamsError.message}`);

    // 5. 插入员工数据（25个）
    const employees = [
      // 缝制A组
      { employee_no: 'E001', name: '张三', gender: '男', phone: '13800000001', team_name: '缝制A组', position: '车工', wage_level: 'A级', base_wage: '5000', subsidy: '500', entry_date: '2023-01-15', status: '在职' },
      { employee_no: 'E002', name: '李梅', gender: '女', phone: '13800000002', team_name: '缝制A组', position: '车工', wage_level: 'A级', base_wage: '5000', subsidy: '500', entry_date: '2023-02-20', status: '在职' },
      { employee_no: 'E003', name: '王芳', gender: '女', phone: '13800000003', team_name: '缝制A组', position: '车工', wage_level: 'B级', base_wage: '4500', subsidy: '400', entry_date: '2023-03-10', status: '在职' },
      { employee_no: 'E004', name: '赵强', gender: '男', phone: '13800000004', team_name: '缝制A组', position: '车工', wage_level: 'B级', base_wage: '4500', subsidy: '400', entry_date: '2023-04-05', status: '在职' },
      { employee_no: 'E005', name: '刘洋', gender: '男', phone: '13800000005', team_name: '缝制A组', position: '车工', wage_level: 'C级', base_wage: '4000', subsidy: '300', entry_date: '2023-05-15', status: '在职' },
      
      // 缝制B组
      { employee_no: 'E006', name: '陈静', gender: '女', phone: '13800000006', team_name: '缝制B组', position: '车工', wage_level: 'A级', base_wage: '5000', subsidy: '500', entry_date: '2023-01-20', status: '在职' },
      { employee_no: 'E007', name: '周磊', gender: '男', phone: '13800000007', team_name: '缝制B组', position: '车工', wage_level: 'A级', base_wage: '5000', subsidy: '500', entry_date: '2023-02-15', status: '在职' },
      { employee_no: 'E008', name: '吴婷', gender: '女', phone: '13800000008', team_name: '缝制B组', position: '车工', wage_level: 'B级', base_wage: '4500', subsidy: '400', entry_date: '2023-03-25', status: '在职' },
      { employee_no: 'E009', name: '郑伟', gender: '男', phone: '13800000009', team_name: '缝制B组', position: '车工', wage_level: 'B级', base_wage: '4500', subsidy: '400', entry_date: '2023-04-10', status: '在职' },
      { employee_no: 'E010', name: '孙丽', gender: '女', phone: '13800000010', team_name: '缝制B组', position: '车工', wage_level: 'C级', base_wage: '4000', subsidy: '300', entry_date: '2023-05-20', status: '在职' },
      
      // 裁床组
      { employee_no: 'E011', name: '马超', gender: '男', phone: '13800000011', team_name: '裁床组', position: '裁剪工', wage_level: 'A级', base_wage: '5500', subsidy: '600', entry_date: '2023-01-10', status: '在职' },
      { employee_no: 'E012', name: '钱敏', gender: '女', phone: '13800000012', team_name: '裁床组', position: '裁剪工', wage_level: 'A级', base_wage: '5500', subsidy: '600', entry_date: '2023-02-25', status: '在职' },
      { employee_no: 'E013', name: '冯刚', gender: '男', phone: '13800000013', team_name: '裁床组', position: '裁剪工', wage_level: 'B级', base_wage: '5000', subsidy: '500', entry_date: '2023-03-15', status: '在职' },
      { employee_no: 'E014', name: '韩雪', gender: '女', phone: '13800000014', team_name: '裁床组', position: '拉布工', wage_level: 'C级', base_wage: '4000', subsidy: '300', entry_date: '2023-04-20', status: '在职' },
      
      // 尾部组
      { employee_no: 'E015', name: '杨帆', gender: '男', phone: '13800000015', team_name: '尾部组', position: '整烫工', wage_level: 'A级', base_wage: '5000', subsidy: '500', entry_date: '2023-01-25', status: '在职' },
      { employee_no: 'E016', name: '朱红', gender: '女', phone: '13800000016', team_name: '尾部组', position: '整烫工', wage_level: 'B级', base_wage: '4500', subsidy: '400', entry_date: '2023-02-10', status: '在职' },
      { employee_no: 'E017', name: '徐浩', gender: '男', phone: '13800000017', team_name: '尾部组', position: '剪线工', wage_level: 'C级', base_wage: '4000', subsidy: '300', entry_date: '2023-03-20', status: '在职' },
      { employee_no: 'E018', name: '何琳', gender: '女', phone: '13800000018', team_name: '尾部组', position: '剪线工', wage_level: 'C级', base_wage: '4000', subsidy: '300', entry_date: '2023-04-15', status: '在职' },
      
      // 质检组
      { employee_no: 'E019', name: '罗明', gender: '男', phone: '13800000019', team_name: '质检组', position: '质检员', wage_level: 'A级', base_wage: '5200', subsidy: '500', entry_date: '2023-01-30', status: '在职' },
      { employee_no: 'E020', name: '谢芳', gender: '女', phone: '13800000020', team_name: '质检组', position: '质检员', wage_level: 'A级', base_wage: '5200', subsidy: '500', entry_date: '2023-02-28', status: '在职' },
      { employee_no: 'E021', name: '唐杰', gender: '男', phone: '13800000021', team_name: '质检组', position: '质检员', wage_level: 'B级', base_wage: '4800', subsidy: '400', entry_date: '2023-03-25', status: '在职' },
      
      // 包装组
      { employee_no: 'E022', name: '曹艳', gender: '女', phone: '13800000022', team_name: '包装组', position: '包装工', wage_level: 'B级', base_wage: '4500', subsidy: '400', entry_date: '2023-04-10', status: '在职' },
      { employee_no: 'E023', name: '许涛', gender: '男', phone: '13800000023', team_name: '包装组', position: '包装工', wage_level: 'C级', base_wage: '4000', subsidy: '300', entry_date: '2023-05-05', status: '在职' },
      { employee_no: 'E024', name: '蒋婷', gender: '女', phone: '13800000024', team_name: '包装组', position: '包装工', wage_level: 'C级', base_wage: '4000', subsidy: '300', entry_date: '2023-05-25', status: '在职' },
      
      // 印花组
      { employee_no: 'E025', name: '邓刚', gender: '男', phone: '13800000025', team_name: '印花组', position: '印花工', wage_level: 'A级', base_wage: '5300', subsidy: '550', entry_date: '2023-02-05', status: '在职' },
    ];
    
    const { error: employeesError } = await client.from('employees').insert(employees);
    if (employeesError) throw new Error(`插入员工失败: ${employeesError.message}`);

    // 6. 插入订单数据（15个）
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
        status: '已完成',
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
      {
        order_no: 'ORD2024020001',
        style_no: 'STYLE-2024-003',
        product_name: '女士针织T恤',
        customer_name: '广州纺织贸易',
        brand: '优雅风尚',
        customer_model: 'MOD-003',
        order_date: '2024-02-05',
        delivery_date: '2024-04-20',
        total_quantity: 3000,
        color_size_matrix: [
          { colorName: '粉色', S: 200, M: 400, L: 500, XL: 400, XXL: 200, XXXL: 100, subtotal: 1800 },
          { colorName: '紫色', S: 150, M: 300, L: 350, XL: 250, XXL: 100, XXXL: 50, subtotal: 1200 },
        ],
        status: '生产中',
        created_by: 'admin',
      },
      {
        order_no: 'ORD2024020002',
        style_no: 'STYLE-2024-004',
        product_name: '男士牛仔裤',
        customer_name: '深圳品牌服饰',
        brand: '经典牛仔',
        customer_model: 'MOD-004',
        order_date: '2024-02-10',
        delivery_date: '2024-05-01',
        total_quantity: 1500,
        color_size_matrix: [
          { colorName: '深蓝', S: 100, M: 200, L: 250, XL: 200, XXL: 100, XXXL: 50, subtotal: 900 },
          { colorName: '黑色', S: 80, M: 150, L: 200, XL: 100, XXL: 50, XXXL: 20, subtotal: 600 },
        ],
        status: '已审核',
        created_by: 'admin',
      },
      {
        order_no: 'ORD2024020003',
        style_no: 'STYLE-2024-005',
        product_name: '女士西装外套',
        customer_name: '北京时装公司',
        brand: '职场精英',
        customer_model: 'MOD-005',
        order_date: '2024-02-15',
        delivery_date: '2024-05-10',
        total_quantity: 800,
        color_size_matrix: [
          { colorName: '黑色', S: 80, M: 150, L: 200, XL: 150, XXL: 100, XXXL: 50, subtotal: 730 },
          { colorName: '灰色', S: 10, M: 20, L: 20, XL: 10, XXL: 10, XXXL: 0, subtotal: 70 },
        ],
        status: '已审核',
        created_by: 'admin',
      },
      {
        order_no: 'ORD2024030001',
        style_no: 'STYLE-2024-006',
        product_name: '男士运动套装',
        customer_name: '江苏纺织集团',
        brand: '运动先锋',
        customer_model: 'MOD-006',
        order_date: '2024-03-01',
        delivery_date: '2024-05-20',
        total_quantity: 2500,
        color_size_matrix: [
          { colorName: '蓝色', S: 200, M: 400, L: 500, XL: 400, XXL: 200, XXXL: 100, subtotal: 1800 },
          { colorName: '红色', S: 100, M: 200, L: 250, XL: 100, XXL: 50, XXXL: 0, subtotal: 700 },
        ],
        status: '生产中',
        created_by: 'admin',
      },
      {
        order_no: 'ORD2024030002',
        style_no: 'STYLE-2024-007',
        product_name: '女士风衣',
        customer_name: '浙江服饰贸易',
        brand: '时尚前沿',
        customer_model: 'MOD-007',
        order_date: '2024-03-05',
        delivery_date: '2024-06-01',
        total_quantity: 600,
        color_size_matrix: [
          { colorName: '卡其色', S: 60, M: 120, L: 150, XL: 120, XXL: 80, XXXL: 40, subtotal: 570 },
          { colorName: '军绿色', S: 5, M: 10, L: 10, XL: 5, XXL: 0, XXXL: 0, subtotal: 30 },
        ],
        status: '已审核',
        created_by: 'admin',
      },
      {
        order_no: 'ORD2024030003',
        style_no: 'STYLE-2024-008',
        product_name: '男士夹克',
        customer_name: '福建服装出口',
        brand: '户外探险',
        customer_model: 'MOD-008',
        order_date: '2024-03-10',
        delivery_date: '2024-06-05',
        total_quantity: 1800,
        color_size_matrix: [
          { colorName: '黑色', S: 150, M: 300, L: 400, XL: 300, XXL: 150, XXXL: 100, subtotal: 1400 },
          { colorName: '军绿色', S: 100, M: 150, L: 100, XL: 50, XXL: 0, XXXL: 0, subtotal: 400 },
        ],
        status: '已审核',
        created_by: 'admin',
      },
      {
        order_no: 'ORD2024030004',
        style_no: 'STYLE-2024-009',
        product_name: '女士运动裤',
        customer_name: '山东纺织品',
        brand: '瑜伽时光',
        customer_model: 'MOD-009',
        order_date: '2024-03-15',
        delivery_date: '2024-06-10',
        total_quantity: 2000,
        color_size_matrix: [
          { colorName: '黑色', S: 200, M: 400, L: 500, XL: 400, XXL: 200, XXXL: 100, subtotal: 1800 },
          { colorName: '深灰', S: 50, M: 80, L: 50, XL: 20, XXL: 0, XXXL: 0, subtotal: 200 },
        ],
        status: '已审核',
        created_by: 'admin',
      },
      {
        order_no: 'ORD2024030005',
        style_no: 'STYLE-2024-010',
        product_name: '男士POLO衫',
        customer_name: '天津服饰公司',
        brand: '商务休闲',
        customer_model: 'MOD-010',
        order_date: '2024-03-20',
        delivery_date: '2024-06-15',
        total_quantity: 1200,
        color_size_matrix: [
          { colorName: '白色', S: 100, M: 200, L: 250, XL: 200, XXL: 100, XXXL: 50, subtotal: 900 },
          { colorName: '深蓝', S: 80, M: 150, L: 150, XL: 80, XXL: 40, XXXL: 0, subtotal: 500 },
        ],
        status: '已审核',
        created_by: 'admin',
      },
      {
        order_no: 'ORD2024040001',
        style_no: 'STYLE-2024-011',
        product_name: '女士雪纺衫',
        customer_name: '杭州服装有限公司',
        brand: '浪漫花园',
        customer_model: 'MOD-011',
        order_date: '2024-04-01',
        delivery_date: '2024-06-25',
        total_quantity: 900,
        color_size_matrix: [
          { colorName: '白色', S: 100, M: 200, L: 250, XL: 150, XXL: 100, XXXL: 50, subtotal: 850 },
          { colorName: '粉色', S: 10, M: 20, L: 20, XL: 0, XXL: 0, XXXL: 0, subtotal: 50 },
        ],
        status: '已审核',
        created_by: 'admin',
      },
      {
        order_no: 'ORD2024040002',
        style_no: 'STYLE-2024-012',
        product_name: '男士休闲裤',
        customer_name: '上海时尚集团',
        brand: '都市休闲',
        customer_model: 'MOD-012',
        order_date: '2024-04-05',
        delivery_date: '2024-07-01',
        total_quantity: 1600,
        color_size_matrix: [
          { colorName: '深灰', S: 150, M: 300, L: 400, XL: 300, XXL: 150, XXXL: 100, subtotal: 1400 },
          { colorName: '卡其色', S: 50, M: 100, L: 100, XL: 50, XXL: 0, XXXL: 0, subtotal: 300 },
        ],
        status: '待审核',
        created_by: 'admin',
      },
      {
        order_no: 'ORD2024040003',
        style_no: 'STYLE-2024-013',
        product_name: '女士毛衫',
        customer_name: '广州纺织贸易',
        brand: '温暖冬季',
        customer_model: 'MOD-013',
        order_date: '2024-04-10',
        delivery_date: '2024-07-10',
        total_quantity: 700,
        color_size_matrix: [
          { colorName: '米色', S: 70, M: 150, L: 200, XL: 150, XXL: 80, XXXL: 50, subtotal: 700 },
        ],
        status: '待审核',
        created_by: 'admin',
      },
      {
        order_no: 'ORD2024040004',
        style_no: 'STYLE-2024-014',
        product_name: '男士卫衣',
        customer_name: '深圳品牌服饰',
        brand: '街头潮流',
        customer_model: 'MOD-014',
        order_date: '2024-04-15',
        delivery_date: '2024-07-15',
        total_quantity: 1100,
        color_size_matrix: [
          { colorName: '黑色', S: 100, M: 200, L: 250, XL: 200, XXL: 100, XXXL: 50, subtotal: 900 },
          { colorName: '深灰', S: 50, M: 100, L: 100, XL: 50, XXL: 0, XXXL: 0, subtotal: 300 },
        ],
        status: '待审核',
        created_by: 'admin',
      },
      {
        order_no: 'ORD2024040005',
        style_no: 'STYLE-2024-015',
        product_name: '女士短裙',
        customer_name: '北京时装公司',
        brand: '青春活力',
        customer_model: 'MOD-015',
        order_date: '2024-04-20',
        delivery_date: '2024-07-20',
        total_quantity: 800,
        color_size_matrix: [
          { colorName: '黑色', S: 80, M: 150, L: 200, XL: 150, XXL: 100, XXXL: 50, subtotal: 730 },
          { colorName: '酒红', S: 10, M: 20, L: 20, XL: 10, XXL: 10, XXXL: 0, subtotal: 70 },
        ],
        status: '待审核',
        created_by: 'admin',
      },
    ];
    
    const { error: ordersError } = await client.from('orders').insert(orders);
    if (ordersError) throw new Error(`插入订单失败: ${ordersError.message}`);

    // 返回成功信息
    return NextResponse.json({
      success: true,
      message: '演示数据初始化成功',
      counts: {
        customers: customers.length,
        suppliers: suppliers.length,
        teams: teams.length,
        employees: employees.length,
        orders: orders.length,
      }
    });
  } catch (error) {
    console.error('初始化演示数据失败:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '初始化演示数据失败' },
      { status: 500 }
    );
  }
}
