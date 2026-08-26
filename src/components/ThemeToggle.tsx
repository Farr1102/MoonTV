/* eslint-disable @typescript-eslint/no-explicit-any,react-hooks/exhaustive-deps */

'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { setTheme, resolvedTheme } = useTheme();

  const setThemeColor = (theme?: string) => {
    const meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) {
      const meta = document.createElement('meta');
      meta.name = 'theme-color';
      meta.content = theme === 'dark' ? '#0c111c' : '#f9fbfe';
      document.head.appendChild(meta);
    } else {
      meta.setAttribute('content', theme === 'dark' ? '#0c111c' : '#f9fbfe');
    }
  };

  useEffect(() => {
    setMounted(true);
    setThemeColor(resolvedTheme);
  }, []);

  if (!mounted) {
    // 渲染一个占位符以避免布局偏移
    return <div className='h-10 w-10' />;
  }

  const toggleTheme = () => {
    // 检查浏览器是否支持 View Transitions API
    const targetTheme = resolvedTheme === 'dark' ? 'light' : 'dark';
    setThemeColor(targetTheme);
    if (!(document as any).startViewTransition) {
      setTheme(targetTheme);
      return;
    }

    (document as any).startViewTransition(() => {
      setTheme(targetTheme);
    });
  };

  return (
    <button
      onClick={toggleTheme}
      className='apple-pressable flex h-10 w-10 items-center justify-center rounded-full text-[var(--app-muted)] transition-colors hover:bg-black/[0.06] hover:text-[var(--app-ink)] dark:hover:bg-white/[0.08]'
      aria-label={
        resolvedTheme === 'dark' ? '切换到浅色模式' : '切换到深色模式'
      }
      title={resolvedTheme === 'dark' ? '浅色模式' : '深色模式'}
    >
      {resolvedTheme === 'dark' ? (
        <Sun className='h-[18px] w-[18px]' />
      ) : (
        <Moon className='h-[18px] w-[18px]' />
      )}
    </button>
  );
}
