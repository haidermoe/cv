'use client';

import { useState, useEffect, useCallback } from 'react';

export type ThemeMode = 'light' | 'dark';

export function useTheme() {
  const [theme, setThemeState] = useState<ThemeMode>('light');

  useEffect(() => {
    const saved = localStorage.getItem('haider_theme') as ThemeMode | null;
    if (saved === 'dark' || saved === 'light') {
      setThemeState(saved);
    }

    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'haider_theme' && (e.newValue === 'dark' || e.newValue === 'light')) {
        setThemeState(e.newValue);
      }
    };

    const handleCustomChange = () => {
      const current = localStorage.getItem('haider_theme') as ThemeMode | null;
      if (current === 'dark' || current === 'light') {
        setThemeState(current);
      }
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener('haider-theme-changed', handleCustomChange);

    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('haider-theme-changed', handleCustomChange);
    };
  }, []);

  const setTheme = useCallback((newTheme: ThemeMode) => {
    setThemeState(newTheme);
    localStorage.setItem('haider_theme', newTheme);
    window.dispatchEvent(new Event('haider-theme-changed'));
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const next = prev === 'light' ? 'dark' : 'light';
      localStorage.setItem('haider_theme', next);
      window.dispatchEvent(new Event('haider-theme-changed'));
      return next;
    });
  }, []);

  const isDark = theme === 'dark';

  return {
    theme,
    isDark,
    setTheme,
    toggleTheme,
  };
}
