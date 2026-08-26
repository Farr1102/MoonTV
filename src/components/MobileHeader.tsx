'use client';

import { Clapperboard } from 'lucide-react';
import Link from 'next/link';

import { BackButton } from './BackButton';
import { useSite } from './SiteProvider';
import { ThemeToggle } from './ThemeToggle';
import { UserMenu } from './UserMenu';

interface MobileHeaderProps {
  showBackButton?: boolean;
}

const MobileHeader = ({ showBackButton = false }: MobileHeaderProps) => {
  const { siteName } = useSite();
  return (
    <header className='apple-glass relative z-40 w-full rounded-none border-x-0 border-b-black/[0.08] border-t-0 lg:hidden dark:border-b-white/[0.1]'>
      <div className='flex h-14 items-center justify-between px-3'>
        <div className='flex items-center gap-2'>
          {showBackButton && <BackButton />}
        </div>

        <div className='flex items-center gap-1'>
          <ThemeToggle />
          <UserMenu />
        </div>
      </div>

      <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'>
        <Link
          href='/'
          className='apple-pressable flex max-w-[52vw] items-center gap-2 text-sm font-semibold text-[var(--app-ink)] transition-opacity hover:opacity-75'
        >
          <span className='flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[var(--app-accent)] text-white shadow-[0_4px_12px_rgba(0,113,227,0.2)]'>
            <Clapperboard className='h-3.5 w-3.5' strokeWidth={2.3} />
          </span>
          <span className='truncate'>{siteName}</span>
        </Link>
      </div>
    </header>
  );
};

export default MobileHeader;
