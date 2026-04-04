/**
 * RBAC系统测试脚本
 * 验证权限系统各项功能是否正常工作
 */

import { getUserPermissionInfo, checkUserPermission, getUserMenuTree } from '../src/lib/rbac-service';
import { initializeDatabase } from '../scripts/init-rbac-db';

async function testRBACSystem() {
  console.log('🧪 开始测试RBAC权限系统...\n');

  try {
    // 1. 初始化数据库
    console.log('1️⃣ 初始化数据库...');
    await initializeDatabase();
    console.log('✅ 数据库初始化完成\n');

    // 2. 测试获取用户权限信息
    console.log('2️⃣ 测试获取用户权限信息...');
    const testUserId = 'test-user-id'; // 这里需要一个实际的用户ID
    const permissionInfo = await getUserPermissionInfo(testUserId);

    if (permissionInfo) {
      console.log('✅ 用户权限信息获取成功');
      console.log('   用户名:', permissionInfo.username);
      console.log('   角色数量:', permissionInfo.roles.length);
      console.log('   权限数量:', permissionInfo.permissions.length);
      console.log('   菜单权限数量:', permissionInfo.menuPermissions.length);
    } else {
      console.log('⚠️  用户权限信息为空（可能是因为测试用户不存在）');
    }
    console.log('');

    // 3. 测试权限检查
    console.log('3️⃣ 测试权限检查...');
    const hasOrderRead = await checkUserPermission(testUserId, ['order:read']);
    const hasFinanceView = await checkUserPermission(testUserId, ['finance:view']);
    console.log('   order:read 权限:', hasOrderRead ? '✅' : '❌');
    console.log('   finance:view 权限:', hasFinanceView ? '✅' : '❌');
    console.log('');

    // 4. 测试菜单树获取
    console.log('4️⃣ 测试菜单树获取...');
    const menuTree = await getUserMenuTree(testUserId);
    console.log('   菜单树节点数量:', menuTree.length);
    if (menuTree.length > 0) {
      console.log('   示例菜单:', menuTree.slice(0, 3).map(m => m.menuName).join(', '));
    }
    console.log('');

    // 5. 测试财务服务
    console.log('5️⃣ 测试财务服务...');
    try {
      const { createFinancialTransaction, getFinancialStatistics } = await import('../src/lib/finance-service');

      // 创建测试财务流水
      const transaction = await createFinancialTransaction({
        transactionType: '收入',
        category: '测试收入',
        amount: 1000,
        description: 'RBAC系统测试交易',
        operator: '系统测试',
      });

      console.log('✅ 财务流水创建成功，交易号:', transaction.transactionNo);

      // 获取财务统计
      const stats = await getFinancialStatistics();
      console.log('   总收入:', stats.totalIncome);
      console.log('   总支出:', stats.totalExpense);
      console.log('   净利润:', stats.netIncome);

    } catch (error) {
      console.log('❌ 财务服务测试失败:', error.message);
    }
    console.log('');

    // 6. 测试定时任务
    console.log('6️⃣ 测试定时任务...');
    try {
      const { initializeScheduler } = await import('../src/lib/scheduler');
      console.log('✅ 定时任务模块导入成功');
      // 注意：实际初始化会在应用启动时进行
    } catch (error) {
      console.log('❌ 定时任务测试失败:', error.message);
    }
    console.log('');

    console.log('🎉 RBAC权限系统测试完成！');

  } catch (error) {
    console.error('❌ RBAC系统测试失败:', error);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  testRBACSystem();
}

export { testRBACSystem };