import { AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '安全警告 - MoonTV',
  description: '站点安全配置警告',
};

export default function WarningPage() {
  return (
    <div className='flex min-h-screen items-center justify-center bg-[var(--app-canvas)] p-4 text-[var(--app-ink)]'>
      <div className='apple-glass w-full max-w-2xl rounded-2xl p-4 shadow-xl sm:p-8'>
        {/* 警告图标 */}
        <div className='flex justify-center mb-4 sm:mb-6'>
          <div className='flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 sm:h-20 sm:w-20'>
            <ShieldAlert className='h-10 w-10 text-red-500 sm:h-12 sm:w-12' />
          </div>
        </div>

        {/* 标题 */}
        <div className='text-center mb-6 sm:mb-8'>
          <h1 className='mb-2 text-2xl font-bold sm:text-3xl'>
            安全合规配置警告
          </h1>
          <div className='mx-auto h-1 w-12 rounded-full bg-red-500 sm:w-16'></div>
        </div>

        {/* 警告内容 */}
        <div className='space-y-4 text-[var(--app-ink)] sm:space-y-6'>
          <div className='rounded-r-lg border-l-4 border-red-500 bg-red-500/10 p-3 sm:p-4'>
            <p className='mb-2 flex items-center gap-2 text-base font-semibold text-red-700 dark:text-red-300 sm:text-lg'>
              <AlertTriangle className='h-5 w-5' />
              安全风险提示
            </p>
            <p className='text-sm text-red-700 dark:text-red-300 sm:text-base'>
              检测到您的站点未配置访问控制，存在潜在的安全风险和法律合规问题。
            </p>
          </div>

          <div className='space-y-3 sm:space-y-4'>
            <h2 className='text-lg font-semibold sm:text-xl'>主要风险</h2>
            <ul className='space-y-2 text-sm text-[var(--app-muted)] sm:space-y-3 sm:text-base'>
              <li className='flex items-start'>
                <CheckCircle2 className='mr-2 mt-0.5 h-4 w-4 flex-shrink-0 text-red-500' />
                <span>未经授权的访问可能导致内容被恶意传播</span>
              </li>
              <li className='flex items-start'>
                <CheckCircle2 className='mr-2 mt-0.5 h-4 w-4 flex-shrink-0 text-red-500' />
                <span>服务器资源可能被滥用，影响正常服务</span>
              </li>
              <li className='flex items-start'>
                <CheckCircle2 className='mr-2 mt-0.5 h-4 w-4 flex-shrink-0 text-red-500' />
                <span>可能收到相关权利方的法律通知</span>
              </li>
              <li className='flex items-start'>
                <CheckCircle2 className='mr-2 mt-0.5 h-4 w-4 flex-shrink-0 text-red-500' />
                <span>服务提供商可能因合规问题终止服务</span>
              </li>
            </ul>
          </div>

          <div className='rounded-lg border border-amber-500/25 bg-amber-500/10 p-3 sm:p-4'>
            <h3 className='mb-2 flex items-center gap-2 text-base font-semibold text-amber-700 dark:text-amber-300 sm:text-lg'>
              <ShieldAlert className='h-5 w-5' />
              安全配置建议
            </h3>
            <p className='text-sm text-amber-700 dark:text-amber-300 sm:text-base'>
              请立即配置{' '}
              <code className='rounded bg-amber-500/15 px-1.5 py-0.5 font-mono text-xs sm:text-sm'>
                PASSWORD
              </code>{' '}
              环境变量以启用访问控制。
            </p>
          </div>
        </div>

        {/* 底部装饰 */}
        <div className='mt-6 border-t border-[var(--app-line)] pt-4 sm:mt-8 sm:pt-6'>
          <div className='text-center text-xs text-[var(--app-muted)] sm:text-sm'>
            <p>为确保系统安全性和合规性，请及时完成安全配置</p>
          </div>
        </div>
      </div>
    </div>
  );
}
