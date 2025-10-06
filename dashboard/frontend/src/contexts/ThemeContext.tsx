import React, { createContext, useContext, useEffect, useState } from 'react';
import { Theme, ThemeContextType, ThemeProviderProps } from '../types/react';

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    // 从localStorage读取主题设置
    const saved = localStorage.getItem('theme') as Theme;
    return saved || 'system';
  });

  // 计算当前是否为暗色主题
  const isDark =
    theme === 'dark' ||
    (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  // 设置主题
  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  // 应用主题到DOM
  useEffect(() => {
    const root = document.documentElement;

    if (isDark) {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }

    // 设置CSS自定义属性
    const colors = {
      light: {
        'toast-bg': '#ffffff',
        'toast-color': '#374151',
        'toast-border': '#e5e7eb'
      },
      dark: {
        'toast-bg': '#1f2937',
        'toast-color': '#f9fafb',
        'toast-border': '#374151'
      }
    };

    const currentColors = isDark ? colors.dark : colors.light;
    Object.entries(currentColors).forEach(([key, value]) => {
      root.style.setProperty(`--${key}`, value);
    });
  }, [isDark]);

  // 监听系统主题变化
  useEffect(() => {
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => {
        // 强制重新渲染以应用系统主题
        document.documentElement.classList.toggle('dark', mediaQuery.matches);
        document.documentElement.classList.toggle('light', !mediaQuery.matches);
      };

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme]);

  const value: ThemeContextType = {
    theme,
    setTheme,
    isDark
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
