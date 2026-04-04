'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { initializeDatabase } from '@/lib/database';

export type ThemeMode = 'light' | 'dark';
export type ThemeColor = 'black' | 'blue' | 'green' | 'purple' | 'orange' | 'red';

interface ThemeConfig {
  mode: ThemeMode;
  primaryColor: ThemeColor;
}

interface ThemeContextType {
  theme: ThemeConfig;
  setTheme: (theme: Partial<ThemeConfig>) => void;
  toggleMode: () => void;
  getPrimaryColor: () => string;
}

const defaultTheme: ThemeConfig = {
  mode: 'light',
  primaryColor: 'black',
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_KEY = 'erp_theme_config';

// 颜色映射
const colorMap: Record<ThemeColor, { light: string; dark: string; name: string }> = {
  black: { light: '#000000', dark: '#ffffff', name: '经典黑' },
  blue: { light: '#2563eb', dark: '#3b82f6', name: '科技蓝' },
  green: { light: '#16a34a', dark: '#22c55e', name: '自然绿' },
  purple: { light: '#9333ea', dark: '#a855f7', name: '优雅紫' },
  orange: { light: '#ea580c', dark: '#f97316', name: '活力橙' },
  red: { light: '#dc2626', dark: '#ef4444', name: '热情红' },
};

export function ThemeProviderClient({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeConfig>(defaultTheme);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // 初始化数据库和服务端同步
    initializeDatabase().then(() => {
      console.log('[App] 数据库初始化完成');
    }).catch((err) => {
      console.error('[App] 数据库初始化失败', err);
    });
    
    // 从 localStorage 读取主题配置
    const stored = localStorage.getItem(THEME_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setThemeState(parsed);
      } catch (e) {
        console.error('Failed to parse theme config', e);
      }
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    // 应用主题模式
    const root = document.documentElement;
    if (theme.mode === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // 应用主色调
    const colorConfig = colorMap[theme.primaryColor];
    root.style.setProperty('--theme-primary', theme.mode === 'light' ? colorConfig.light : colorConfig.dark);
    
    // 保存到 localStorage
    localStorage.setItem(THEME_KEY, JSON.stringify(theme));
  }, [theme, mounted]);

  const setTheme = (newTheme: Partial<ThemeConfig>) => {
    setThemeState(prev => ({ ...prev, ...newTheme }));
  };

  const toggleMode = () => {
    setThemeState(prev => ({
      ...prev,
      mode: prev.mode === 'light' ? 'dark' : 'light',
    }));
  };

  const getPrimaryColor = () => {
    const colorConfig = colorMap[theme.primaryColor];
    return theme.mode === 'light' ? colorConfig.light : colorConfig.dark;
  };

  if (!mounted) {
    return null;
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleMode, getPrimaryColor }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProviderClient');
  }
  return context;
}

export { colorMap };
