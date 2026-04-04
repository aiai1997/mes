/**
 * 数据同步模块 - 自动同步所有数据到服务端
 * 
 * 功能：
 * 1. 自动扫描所有 erp_ 开头的数据
 * 2. 定时同步到服务端
 * 3. 应用启动时自动恢复
 * 4. 页面关闭时自动保存
 */

import { TABLES } from './schema';

// 同步状态
let isSyncing = false;
let lastSyncTime = 0;
let syncTimeout: NodeJS.Timeout | null = null;
let isInitialized = false;
let periodicSyncInterval: NodeJS.Timeout | null = null;

// 同步间隔配置
const SYNC_DEBOUNCE = 1000;    // 防抖延迟 1秒
const PERIODIC_SYNC = 30000;   // 定时同步 30秒
const MIN_SYNC_INTERVAL = 500; // 最小同步间隔

// 同步标记键
const SYNC_MARK_KEY = 'erp_last_sync_time';

/**
 * 获取所有需要同步的键
 */
function getAllSyncKeys(): string[] {
  const keys: string[] = [];
  
  // 添加所有定义的表
  Object.values(TABLES).forEach(key => {
    if (!keys.includes(key)) {
      keys.push(key);
    }
  });
  
  // 扫描所有以 erp_ 开头的键
  if (typeof window !== 'undefined') {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('erp_') && !keys.includes(key)) {
        keys.push(key);
      }
    }
  }
  
  return keys;
}

/**
 * 从服务端加载数据
 */
export async function loadFromServer(): Promise<{
  success: boolean;
  data: Record<string, unknown> | null;
  exists: boolean;
}> {
  try {
    const response = await fetch('/api/data', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    
    const result = await response.json();
    
    if (result.success && result.data) {
      return { success: true, data: result.data, exists: result.exists };
    }
    
    return { success: true, data: null, exists: false };
  } catch (error) {
    console.error('[Sync] 从服务端加载失败:', error);
    return { success: false, data: null, exists: false };
  }
}

/**
 * 保存数据到服务端
 */
export async function saveToServer(): Promise<{ success: boolean; message?: string }> {
  if (isSyncing) {
    return { success: false, message: '正在同步中' };
  }
  
  try {
    isSyncing = true;
    const startTime = Date.now();
    
    // 收集所有数据
    const data: Record<string, unknown> = {};
    const allKeys = getAllSyncKeys();
    
    allKeys.forEach(key => {
      const value = localStorage.getItem(key);
      if (value) {
        try {
          data[key] = JSON.parse(value);
        } catch {
          data[key] = value;
        }
      }
    });
    
    // 添加额外数据（主题、语言等）
    const extraKeys = [
      'erp_theme_config',
      'erp_language',
      'erp_current_user',
      'erp_remembered_username'
    ];
    
    extraKeys.forEach(key => {
      const value = localStorage.getItem(key);
      if (value) {
        try {
          data[key] = JSON.parse(value);
        } catch {
          data[key] = value;
        }
      }
    });
    
    // 发送到服务端
    const response = await fetch('/api/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    const result = await response.json();
    
    if (result.success) {
      lastSyncTime = Date.now();
      localStorage.setItem(SYNC_MARK_KEY, new Date().toISOString());
      
      const duration = Date.now() - startTime;
      console.log(`[Sync] 数据已同步到服务端 (${duration}ms, ${allKeys.length}个表)`);
      
      return { success: true, message: result.message };
    }
    
    return { success: false, message: result.error };
  } catch (error) {
    console.error('[Sync] 保存到服务端失败:', error);
    return { success: false, message: '同步失败' };
  } finally {
    isSyncing = false;
  }
}

/**
 * 防抖保存
 */
export function debouncedSave(): void {
  if (syncTimeout) {
    clearTimeout(syncTimeout);
  }
  
  // 检查最小同步间隔
  const now = Date.now();
  const timeSinceLastSync = now - lastSyncTime;
  const delay = timeSinceLastSync < MIN_SYNC_INTERVAL 
    ? MIN_SYNC_INTERVAL - timeSinceLastSync + SYNC_DEBOUNCE 
    : SYNC_DEBOUNCE;
  
  syncTimeout = setTimeout(() => {
    saveToServer();
  }, delay);
}

/**
 * 初始化同步 - 应用启动时调用
 */
export async function initializeSync(): Promise<{ loaded: boolean; fromServer: boolean }> {
  if (isInitialized) {
    return { loaded: true, fromServer: false };
  }
  
  console.log('[Sync] 初始化数据同步...');
  
  try {
    // 尝试从服务端加载
    const serverResult = await loadFromServer();
    
    if (serverResult.success && serverResult.exists && serverResult.data) {
      console.log('[Sync] 发现服务端数据，正在恢复...');
      
      // 恢复所有数据到 localStorage
      let restoredCount = 0;
      Object.entries(serverResult.data).forEach(([key, value]) => {
        if (typeof value === 'object') {
          localStorage.setItem(key, JSON.stringify(value));
        } else {
          localStorage.setItem(key, String(value));
        }
        restoredCount++;
      });
      
      console.log(`[Sync] 服务端数据已恢复 (${restoredCount}个表)`);
      isInitialized = true;
      return { loaded: true, fromServer: true };
    }
    
    // 服务端无数据
    console.log('[Sync] 服务端无数据，使用本地数据');
    isInitialized = true;
    return { loaded: true, fromServer: false };
  } catch (error) {
    console.error('[Sync] 初始化同步失败:', error);
    isInitialized = true;
    return { loaded: false, fromServer: false };
  }
}

/**
 * 启动同步监听
 */
export function startSyncWatch(): void {
  // 页面关闭前保存
  window.addEventListener('beforeunload', () => {
    const data: Record<string, unknown> = {};
    
    getAllSyncKeys().forEach(key => {
      const value = localStorage.getItem(key);
      if (value) {
        try {
          data[key] = JSON.parse(value);
        } catch {
          data[key] = value;
        }
      }
    });
    
    // 使用 sendBeacon 发送
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    navigator.sendBeacon('/api/data', blob);
  });
  
  // 页面隐藏时保存
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      saveToServer();
    }
  });
  
  // 页面获得焦点时检查同步
  window.addEventListener('focus', () => {
    const lastSyncStr = localStorage.getItem(SYNC_MARK_KEY);
    if (lastSyncStr) {
      const lastSync = new Date(lastSyncStr).getTime();
      const now = Date.now();
      // 超过1分钟未同步则触发
      if (now - lastSync > 60000) {
        saveToServer();
      }
    }
  });
  
  // 启动定时同步
  startPeriodicSync();
  
  console.log('[Sync] 同步监听已启动');
}

/**
 * 启动定时同步
 */
export function startPeriodicSync(): void {
  if (periodicSyncInterval) {
    clearInterval(periodicSyncInterval);
  }
  
  periodicSyncInterval = setInterval(() => {
    if (document.visibilityState === 'visible') {
      saveToServer();
    }
  }, PERIODIC_SYNC);
  
  console.log(`[Sync] 定时同步已启动 (${PERIODIC_SYNC / 1000}秒)`);
}

/**
 * 停止定时同步
 */
export function stopPeriodicSync(): void {
  if (periodicSyncInterval) {
    clearInterval(periodicSyncInterval);
    periodicSyncInterval = null;
  }
}

/**
 * 手动触发同步
 */
export async function manualSync(): Promise<{ success: boolean; message: string }> {
  const result = await saveToServer();
  return {
    success: result.success,
    message: result.message || (result.success ? '同步成功' : '同步失败')
  };
}

/**
 * 清除服务端数据
 */
export async function clearServerData(): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch('/api/data', {
      method: 'DELETE'
    });
    
    const result = await response.json();
    return {
      success: result.success,
      message: result.message || '清除成功'
    };
  } catch (error) {
    console.error('[Sync] 清除服务端数据失败:', error);
    return { success: false, message: '清除失败' };
  }
}

/**
 * 获取同步状态
 */
export function getSyncStatus(): {
  isInitialized: boolean;
  isSyncing: boolean;
  lastSyncTime: number;
  lastSyncTimeStr: string | null;
  tableCount: number;
} {
  const lastSyncStr = localStorage.getItem(SYNC_MARK_KEY);
  const tableCount = getAllSyncKeys().length;
  
  return {
    isInitialized,
    isSyncing,
    lastSyncTime,
    lastSyncTimeStr: lastSyncStr,
    tableCount
  };
}

// 默认导出
export default {
  initializeSync,
  saveToServer,
  loadFromServer,
  debouncedSave,
  startSyncWatch,
  startPeriodicSync,
  stopPeriodicSync,
  manualSync,
  clearServerData,
  getSyncStatus
};
