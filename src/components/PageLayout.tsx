import { BackButton } from './BackButton';
import MobileBottomNav from './MobileBottomNav';
import MobileHeader from './MobileHeader';
import Sidebar from './Sidebar';
import { ThemeToggle } from './ThemeToggle';
import { UserMenu } from './UserMenu';

interface PageLayoutProps {
  children: React.ReactNode;
  activePath?: string;
}

const PageLayout = ({ children, activePath = '/' }: PageLayoutProps) => {
  return (
    <div className='min-h-screen w-full'>
      {/* 移动端头部 */}
      <MobileHeader showBackButton={['/play'].includes(activePath)} />

      {/* 主要布局容器 */}
      <div className='flex min-h-screen w-full lg:grid lg:min-h-0 lg:grid-cols-[auto_1fr]'>
        {/* 侧边栏 - 桌面端显示，移动端隐藏 */}
        <div className='hidden lg:block'>
          <Sidebar activePath={activePath} />
        </div>

        {/* 主内容区域 */}
        <div className='relative min-w-0 flex-1'>
          {/* 桌面端左上角返回按钮 */}
          {['/play'].includes(activePath) && (
            <div className='absolute left-1 top-3 z-20 hidden lg:flex'>
              <BackButton />
            </div>
          )}

          {/* 桌面端顶部按钮 */}
          <div className='apple-glass-control absolute right-5 top-4 z-20 hidden items-center gap-1 rounded-full px-1 lg:flex'>
            <ThemeToggle />
            <UserMenu />
          </div>

          {/* 主内容 */}
          <main className='mb-14 flex-1 pb-[calc(3.5rem+env(safe-area-inset-bottom))] lg:mb-0 lg:min-h-0 lg:pb-0'>
            {children}
          </main>
        </div>
      </div>

      {/* 移动端底部导航 */}
      <div className='lg:hidden'>
        <MobileBottomNav activePath={activePath} />
      </div>
    </div>
  );
};

export default PageLayout;
