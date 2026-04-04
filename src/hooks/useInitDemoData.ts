'use client';

import { useEffect } from 'react';
import { initializeDatabase } from '@/lib/database';

/**
 * 初始化数据库的Hook
 * 在应用启动时自动初始化数据库结构
 */
export function useInitDemoData() {
  useEffect(() => {
    // 异步初始化数据库
    initializeDatabase().catch(error => {
      console.error('[Database] 初始化失败:', error);
    });
  }, []);
}
