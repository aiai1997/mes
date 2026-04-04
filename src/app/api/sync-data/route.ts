import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

/**
 * 同步数据库数据到前端 localStorage
 * GET: 获取所有演示数据
 * POST: 初始化演示数据
 */
export async function GET() {
  try {
    const client = getSupabaseClient();
    
    // 获取用户数据
    const { data: users, error: usersError } = await client
      .from('users')
      .select('*');
    
    if (usersError) throw usersError;
    
    // 获取员工数据
    const { data: employees, error: employeesError } = await client
      .from('employees')
      .select('*');
    
    if (employeesError) throw employeesError;
    
    // 获取客户数据
    const { data: customers, error: customersError } = await client
      .from('customers')
      .select('*');
    
    if (customersError) throw customersError;
    
    // 获取供应商数据
    const { data: suppliers, error: suppliersError } = await client
      .from('suppliers')
      .select('*');
    
    if (suppliersError) throw suppliersError;
    
    // 获取班组数据
    const { data: teams, error: teamsError } = await client
      .from('teams')
      .select('*');
    
    if (teamsError) throw teamsError;
    
    // 获取订单数据
    const { data: orders, error: ordersError } = await client
      .from('orders')
      .select('*');
    
    if (ordersError) throw ordersError;
    
    // 获取物料数据
    const { data: materials, error: materialsError } = await client
      .from('materials')
      .select('*');
    
    if (materialsError) throw materialsError;

    // 格式化用户数据为前端格式（不返回密码）
    const formattedUsers = users.map(user => ({
      id: user.id,
      username: user.username,
      password: '******', // 不返回真实密码
      realName: user.real_name,
      role: user.role,
      department: user.department,
      permissions: user.permissions || [],
      status: user.status,
      lastLogin: user.last_login,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    }));

    // 格式化员工数据为前端格式
    const formattedEmployees = employees.map(emp => ({
      id: emp.id,
      employeeNo: emp.employee_no,
      name: emp.name,
      gender: emp.gender,
      idCard: emp.id_card,
      phone: emp.phone,
      teamId: emp.team_id,
      teamName: emp.team_name,
      position: emp.position,
      wageLevel: emp.wage_level,
      baseWage: emp.base_wage,
      subsidy: emp.subsidy,
      entryDate: emp.entry_date,
      status: emp.status,
      userId: emp.user_id,
      createdAt: emp.created_at,
    }));

    // 格式化客户数据
    const formattedCustomers = customers.map(c => ({
      id: c.id,
      customerCode: c.customer_code,
      customerName: c.customer_name,
      contactPerson: c.contact_person,
      phone: c.phone,
      address: c.address,
      status: c.status,
      createdAt: c.created_at,
    }));

    // 格式化供应商数据
    const formattedSuppliers = suppliers.map(s => ({
      id: s.id,
      supplierCode: s.supplier_code,
      supplierName: s.supplier_name,
      contactPerson: s.contact_person,
      phone: s.phone,
      address: s.address,
      status: s.status,
      createdAt: s.created_at,
    }));

    // 格式化班组数据
    const formattedTeams = teams.map(t => ({
      id: t.id,
      teamCode: t.team_code,
      teamName: t.team_name,
      teamType: t.team_type,
      leaderName: t.leader_name,
      memberCount: t.member_count,
      status: t.status,
      createdAt: t.created_at,
    }));

    // 格式化订单数据
    const formattedOrders = orders.map(o => ({
      id: o.id,
      orderNo: o.order_no,
      styleNo: o.style_no,
      productName: o.product_name,
      customerName: o.customer_name,
      brand: o.brand,
      customerModel: o.customer_model,
      orderDate: o.order_date,
      deliveryDate: o.delivery_date,
      totalQuantity: o.total_quantity,
      colorSizeMatrix: o.color_size_matrix || [],
      status: o.status,
      createdBy: o.created_by,
      createdAt: o.created_at,
    }));

    // 格式化物料数据
    const formattedMaterials = materials.map(m => ({
      id: m.id,
      materialCode: m.material_code,
      materialName: m.material_name,
      category: m.category,
      specification: m.specification,
      unit: m.unit,
      unitPrice: m.unit_price,
      supplier: m.supplier,
      inventory: m.inventory,
      safetyStock: m.safety_stock,
      createdAt: m.created_at,
    }));
    
    return NextResponse.json({
      success: true,
      data: {
        users: formattedUsers,
        employees: formattedEmployees,
        customers: formattedCustomers,
        suppliers: formattedSuppliers,
        teams: formattedTeams,
        orders: formattedOrders,
        materials: formattedMaterials,
      }
    });
  } catch (error) {
    console.error('同步数据失败:', error);
    return NextResponse.json(
      { success: false, error: '同步数据失败，请稍后重试' },
      { status: 500 }
    );
  }
}
