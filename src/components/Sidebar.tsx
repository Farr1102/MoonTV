/* eslint-disable @typescript-eslint/no-explicit-any */

'use client';

import {
  Clapperboard,
  Clover,
  Film,
  Home,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  ShieldCheck,
  Star,
  Tv,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useState,
} from 'react';

import { useAdminAccess } from '@/hooks/useAdminAccess';

import { useSite } from './SiteProvider';

interface SidebarContextType {
  isCollapsed: boolean;
}

const SidebarContext = createContext<SidebarContextType>({
  isCollapsed: false,
});

export const useSidebar = () => useContext(SidebarContext);

const Logo = ({ compact = false }: { compact?: boolean }) => {
  const { siteName } = useSite();
  return (
    <Link
      href='/'
      className={`flex min-w-0 items-center select-none transition-opacity duration-200 hover:opacity-80 ${
        compact ? 'justify-center' : 'gap-3'
      }`}
      aria-label={`${siteName} 首页`}
    >
      <span className='flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#0071e3] text-white shadow-[0_6px_18px_rgba(0,113,227,0.24)]'>
        <Clapperboard className='h-[18px] w-[18px]' strokeWidth={2.2} />
      </span>
      {!compact && (
        <span className='truncate text-[17px] font-semibold tracking-[-0.01em] text-[var(--app-ink)]'>
          {siteName}
        </span>
      )}
    </Link>
  );
};

interface SidebarProps {
  onToggle?: (collapsed: boolean) => void;
  activePath?: string;
}

// 在浏览器环境下通过全局变量缓存折叠状态，避免组件重新挂载时出现初始值闪烁
declare global {
  interface Window {
    __sidebarCollapsed?: boolean;
  }
}

const Sidebar = ({ onToggle, activePath = '/' }: SidebarProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isAdmin = useAdminAccess();
  // 若同一次 SPA 会话中已经读取过折叠状态，则直接复用，避免闪烁
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    if (
      typeof window !== 'undefined' &&
      typeof window.__sidebarCollapsed === 'boolean'
    ) {
      return window.__sidebarCollapsed;
    }
    return false; // 默认展开
  });

  // 首次挂载时读取 localStorage，以便刷新后仍保持上次的折叠状态
  useLayoutEffect(() => {
    const saved = localStorage.getItem('sidebarCollapsed');
    if (saved !== null) {
      const val = JSON.parse(saved);
      setIsCollapsed(val);
      window.__sidebarCollapsed = val;
    }
  }, []);

  // 当折叠状态变化时，同步到 <html> data 属性，供首屏 CSS 使用
  useLayoutEffect(() => {
    if (typeof document !== 'undefined') {
      if (isCollapsed) {
        document.documentElement.dataset.sidebarCollapsed = 'true';
      } else {
        delete document.documentElement.dataset.sidebarCollapsed;
      }
    }
  }, [isCollapsed]);

  const [active, setActive] = useState(activePath);

  useEffect(() => {
    // 优先使用传入的 activePath
    if (activePath) {
      setActive(activePath);
    } else {
      // 否则使用当前路径
      const getCurrentFullPath = () => {
        const queryString = searchParams.toString();
        return queryString ? `${pathname}?${queryString}` : pathname;
      };
      const fullPath = getCurrentFullPath();
      setActive(fullPath);
    }
  }, [activePath, pathname, searchParams]);

  const handleToggle = useCallback(() => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem('sidebarCollapsed', JSON.stringify(newState));
    if (typeof window !== 'undefined') {
      window.__sidebarCollapsed = newState;
    }
    onToggle?.(newState);
  }, [isCollapsed, onToggle]);

  const handleSearchClick = useCallback(() => {
    router.push('/search');
  }, [router]);

  const contextValue = {
    isCollapsed,
  };

  const [hasCustomCategories, setHasCustomCategories] = useState(false);
  const menuItems = [
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
    ...(isAdmin
      ? [
          {
            icon: ShieldCheck,
            label: '成人',
            href: '/adult',
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

  return (
    <SidebarContext.Provider value={contextValue}>
      <div className='hidden lg:flex'>
        <aside
          data-sidebar
          className={`apple-glass fixed left-0 top-0 z-30 h-screen rounded-none border-b-0 border-l-0 border-r-black/[0.06] border-t-0 text-[var(--app-ink)] shadow-[10px_0_34px_rgba(30,30,34,0.06)] transition-[width] duration-300 dark:border-r-white/[0.08] ${
            isCollapsed ? 'w-[72px]' : 'w-[232px]'
          }`}
        >
          <div className='flex h-full flex-col'>
            <div
              className={`flex h-20 items-center ${
                isCollapsed ? 'px-[18px]' : 'px-5'
              }`}
            >
              <Logo compact={isCollapsed} />
            </div>

            <nav className='space-y-1 px-3 pt-3'>
              <Link
                href='/'
                onClick={() => setActive('/')}
                data-active={active === '/'}
                title={isCollapsed ? '首页' : undefined}
                className={`apple-pressable group relative flex min-h-11 items-center rounded-lg text-sm font-medium text-[var(--app-muted)] transition-colors hover:bg-black/[0.05] hover:text-[var(--app-ink)] data-[active=true]:bg-black/[0.06] data-[active=true]:text-[var(--app-ink)] dark:hover:bg-white/[0.08] dark:data-[active=true]:bg-white/[0.1] ${
                  isCollapsed ? 'justify-center px-0' : 'gap-3 px-3'
                }`}
              >
                <span className='absolute left-0 h-5 w-0.5 rounded-full bg-[var(--app-accent)] opacity-0 transition-opacity group-data-[active=true]:opacity-100' />
                <Home className='h-[18px] w-[18px] shrink-0 transition-colors group-data-[active=true]:text-[var(--app-accent)]' />
                {!isCollapsed && (
                  <span className='whitespace-nowrap'>首页</span>
                )}
              </Link>
              <Link
                href='/search'
                onClick={(e) => {
                  e.preventDefault();
                  handleSearchClick();
                  setActive('/search');
                }}
                data-active={active === '/search'}
                title={isCollapsed ? '搜索' : undefined}
                className={`apple-pressable group relative flex min-h-11 items-center rounded-lg text-sm font-medium text-[var(--app-muted)] transition-colors hover:bg-black/[0.05] hover:text-[var(--app-ink)] data-[active=true]:bg-black/[0.06] data-[active=true]:text-[var(--app-ink)] dark:hover:bg-white/[0.08] dark:data-[active=true]:bg-white/[0.1] ${
                  isCollapsed ? 'justify-center px-0' : 'gap-3 px-3'
                }`}
              >
                <span className='absolute left-0 h-5 w-0.5 rounded-full bg-[var(--app-accent)] opacity-0 transition-opacity group-data-[active=true]:opacity-100' />
                <Search className='h-[18px] w-[18px] shrink-0 transition-colors group-data-[active=true]:text-[var(--app-accent)]' />
                {!isCollapsed && (
                  <span className='whitespace-nowrap'>搜索</span>
                )}
              </Link>
            </nav>

            <div className='mt-7 flex-1 overflow-y-auto px-3'>
              {!isCollapsed && (
                <div className='mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--app-muted)]'>
                  片库
                </div>
              )}
              <div className='space-y-1'>
                {menuItems.map((item) => {
                  const typeMatch = item.href.match(/type=([^&]+)/)?.[1];
                  const decodedActive = decodeURIComponent(active);
                  const decodedItemHref = decodeURIComponent(item.href);

                  const isActive =
                    decodedActive === decodedItemHref ||
                    (decodedActive.startsWith('/douban') &&
                      decodedActive.includes(`type=${typeMatch}`));
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={() => setActive(item.href)}
                      data-active={isActive}
                      title={isCollapsed ? item.label : undefined}
                      className={`apple-pressable group relative flex min-h-11 items-center rounded-lg text-sm text-[var(--app-muted)] transition-colors hover:bg-black/[0.05] hover:text-[var(--app-ink)] data-[active=true]:bg-black/[0.06] data-[active=true]:text-[var(--app-ink)] dark:hover:bg-white/[0.08] dark:data-[active=true]:bg-white/[0.1] ${
                        isCollapsed ? 'justify-center px-0' : 'gap-3 px-3'
                      }`}
                    >
                      <span className='absolute left-0 h-5 w-0.5 rounded-full bg-[var(--app-accent)] opacity-0 transition-opacity group-data-[active=true]:opacity-100' />
                      <Icon className='h-[18px] w-[18px] shrink-0 transition-colors group-data-[active=true]:text-[var(--app-accent)]' />
                      {!isCollapsed && (
                        <span className='whitespace-nowrap'>{item.label}</span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className='p-3'>
              <button
                onClick={handleToggle}
                className={`apple-pressable flex h-11 w-full items-center rounded-lg text-[var(--app-muted)] transition-colors hover:bg-black/[0.05] hover:text-[var(--app-ink)] dark:hover:bg-white/[0.08] ${
                  isCollapsed ? 'justify-center' : 'gap-3 px-3'
                }`}
                aria-label={isCollapsed ? '展开侧边栏' : '收起侧边栏'}
                title={isCollapsed ? '展开侧边栏' : '收起侧边栏'}
              >
                {isCollapsed ? (
                  <PanelLeftOpen className='h-[18px] w-[18px]' />
                ) : (
                  <PanelLeftClose className='h-[18px] w-[18px]' />
                )}
                {!isCollapsed && <span className='text-sm'>收起导航</span>}
              </button>
            </div>
          </div>
        </aside>
        <div
          className={`sidebar-offset transition-[width] duration-300 ${
            isCollapsed ? 'w-[72px]' : 'w-[232px]'
          }`}
        ></div>
      </div>
    </SidebarContext.Provider>
  );
};

export default Sidebar;
