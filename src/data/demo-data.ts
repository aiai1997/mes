/**
 * ERP系统数据库初始化脚本
 * 
 * 说明：
 * - 系统启动时初始化空数据结构
 * - 不包含任何模拟数据
 * - 用户可以通过导入功能恢复备份数据
 */

import { DB_KEYS, DB_VERSION, initializeDatabase } from '@/lib/database';

// 重新导出初始化函数
export { initializeDatabase };

// 初始化函数（兼容旧版调用）
export function initializeDemoData() {
  initializeDatabase().catch(error => {
    console.error('[Database] 初始化失败:', error);
  });
}

// 重置数据库
export async function resetDemoData() {
  if (typeof window === 'undefined') return;
  
  // 清除所有ERP数据
  Object.values(DB_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
  
  // 重新初始化
  await initializeDatabase();
  
  console.log('[ERP] 数据库已重置');
}
