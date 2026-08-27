/* eslint-disable @typescript-eslint/no-explicit-any */

'use client';

import {
  Clover,
  Film,
  Home,
  Search,
  ShieldCheck,
  Star,
  Tv,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

import { useAdminAccess } from '@/hooks/useAdminAccess';

interface MobileBottomNavProps {
  /**
   * 主动指定当前激活的路径。当未提供时，自动使用 usePathname() 获取的路径。
   */
  activePath?: string;
}

const MobileBottomNav = ({ activePath }: MobileBottomNavProps) => {
  const pathname = usePathname();
  const isAdmin = useAdminAccess();

  // 当前激活路径：优先使用传入的 activePath，否则回退到浏览器地址
  const currentActive = activePath ?? pathname;

  const [hasCustomCategories, setHasCustomCategories] = useState(false);
  const navItems = [
    { icon: Home, label: '首页', href: '/' },
    { icon: Search, label: '搜索', href: '/search' },
    ...(isAdmin
      ? [
          {
            icon: ShieldCheck,
            label: '成人',
            href: '/adult',
          },
        ]
      : []),
    {
      icon: Film,
      label: '电影',
      href: '/douban?type=movie',
    },
    {
      icon: Tv,
      label: '剧集',
      href: '/douban?type=tv',
    },
    {
      icon: Clover,
      label: '综艺',
      href: '/douban?type=show',
    },
    ...(hasCustomCategories
      ? [
          {
            icon: Star,
            label: '自定义',
            href: '/douban?type=custom',
          },
        ]
      : []),
  ];

  useEffect(() => {
    const runtimeConfig = (window as any).RUNTIME_CONFIG;
    if (runtimeConfig?.CUSTOM_CATEGORIES?.length > 0) {
      setHasCustomCategories(true);
    }
  }, []);

  const isActive = (href: string) => {
    const typeMatch = href.match(/type=([^&]+)/)?.[1];

    // 解码URL以进行正确的比较
    const decodedActive = decodeURIComponent(currentActive);
    const decodedItemHref = decodeURIComponent(href);

    return (
      decodedActive === decodedItemHref ||
      (decodedActive.startsWith('/douban') &&
        decodedActive.includes(`type=${typeMatch}`))
    );
  };

  return (
    <nav
      className='apple-glass fixed bottom-0 left-0 right-0 z-[600] overflow-hidden rounded-none border-x-0 border-b-0 border-t-black/[0.08] lg:hidden dark:border-t-white/[0.1]'
      style={{
        /* 紧贴视口底部，同时在内部留出安全区高度 */
        bottom: 0,
        paddingBottom: 'env(safe-area-inset-bottom)',
        minHeight: 'calc(3.5rem + env(safe-area-inset-bottom))',
      }}
    >
      <ul className='flex items-center overflow-x-auto scrollbar-hide'>
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <li
              key={item.href}
              className='flex-shrink-0'
              style={{ width: '20vw', minWidth: '20vw' }}
            >
              <Link
                href={item.href}
                className='apple-pressable group relative flex h-14 w-full flex-col items-center justify-center gap-1 text-[10px]'
              >
                <span
                  className={`absolute top-0 h-0.5 w-5 rounded-full bg-[var(--app-accent)] transition-opacity ${
                    active ? 'opacity-100' : 'opacity-0'
                  }`}
                />
                <item.icon
                  className={`h-5 w-5 transition-colors ${
                    active
                      ? 'text-[var(--app-accent)]'
                      : 'text-[var(--app-muted)]'
                  }`}
                  strokeWidth={active ? 2.3 : 1.8}
                />
                <span
                  className={
                    active
                      ? 'font-medium text-[var(--app-ink)]'
                      : 'text-[var(--app-muted)]'
                  }
                >
                  {item.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default MobileBottomNav;
