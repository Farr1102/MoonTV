import { ArrowLeft } from 'lucide-react';

export function BackButton() {
  return (
    <button
      onClick={() => window.history.back()}
      className='apple-pressable flex h-10 w-10 items-center justify-center rounded-full p-2 text-[var(--app-muted)] transition-colors hover:bg-black/[0.06] hover:text-[var(--app-ink)] dark:hover:bg-white/[0.08]'
      aria-label='返回'
    >
      <ArrowLeft className='w-full h-full' />
    </button>
  );
}
