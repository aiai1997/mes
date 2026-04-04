/**
 * 统一存储层 - 所有数据存储都通过此模块
 * 自动触发服务端同步
 *
 * 安全注意事项：
 * - 此实现使用 localStorage 进行演示目的
 * - 生产环境应使用加密存储和后端数据库
 * - localStorage 数据对客户端可见，不适合存储敏感信息
 */

// 导入同步函数
let debouncedSave: (() => void) | null = null;

// 动态加载同步模块，避免循环依赖
const loadSync = async () => {
  if (!debouncedSave) {
    try {
      const syncModule = await import('./database/sync');
      debouncedSave = syncModule.debouncedSave;
    } catch {
      // 忽略
    }
  }
};

/**
 * 存储数据到 localStorage，并触发服务端同步
 */
export function setItem(key: string, value: unknown): void {
  if (typeof window === 'undefined') return;
  
  try {
    const jsonValue = typeof value === 'string' ? value : JSON.stringify(value);
    localStorage.setItem(key, jsonValue);
    
    // 触发同步
    loadSync().then(() => {
      debouncedSave?.();
    });
  } catch (error) {
    console.error(`[Storage] 保存失败: ${key}`, error);
  }
}

/**
 * 从 localStorage 读取数据
 */
export function getItem<T>(key: string, defaultValue?: T): T | null {
  if (typeof window === 'undefined') return defaultValue ?? null;
  
  try {
    const value = localStorage.getItem(key);
    if (value === null) return defaultValue ?? null;
    
    // 尝试解析 JSON
    try {
      return JSON.parse(value) as T;
    } catch {
      return value as unknown as T;
    }
  } catch (error) {
    console.error(`[Storage] 读取失败: ${key}`, error);
    return defaultValue ?? null;
  }
}

/**
 * 从 localStorage 删除数据，并触发服务端同步
 */
export function removeItem(key: string): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(key);
    
    // 触发同步
    loadSync().then(() => {
      debouncedSave?.();
    });
  } catch (error) {
    console.error(`[Storage] 删除失败: ${key}`, error);
  }
}

/**
 * 批量存储数据
 */
export function setItems(data: Record<string, unknown>): void {
  if (typeof window === 'undefined') return;
  
  try {
    Object.entries(data).forEach(([key, value]) => {
      const jsonValue = typeof value === 'string' ? value : JSON.stringify(value);
      localStorage.setItem(key, jsonValue);
    });
    
    // 触发一次同步
    loadSync().then(() => {
      debouncedSave?.();
    });
  } catch (error) {
    console.error('[Storage] 批量保存失败', error);
  }
}

/**
 * 检查键是否存在
 */
export function hasItem(key: string): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(key) !== null;
}

/**
 * 获取所有以指定前缀开头的键
 */
export function getKeysByPrefix(prefix: string): string[] {
  if (typeof window === 'undefined') return [];
  
  const keys: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(prefix)) {
      keys.push(key);
    }
  }
  return keys;
}

/**
 * 获取所有 ERP 相关的键
 */
export function getAllERPKeys(): string[] {
  return getKeysByPrefix('erp_');
}

/**
 * 清除所有 ERP 数据
 */
export function clearAllERPData(): void {
  if (typeof window === 'undefined') return;
  
  const keys = getAllERPKeys();
  keys.forEach(key => localStorage.removeItem(key));
  
  // 触发同步
  loadSync().then(() => {
    debouncedSave?.();
  });
}

// 导出默认对象
export default {
  setItem,
  getItem,
  removeItem,
  setItems,
  hasItem,
  getKeysByPrefix,
  getAllERPKeys,
  clearAllERPData
};
