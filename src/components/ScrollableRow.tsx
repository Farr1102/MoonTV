import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface ScrollableRowProps {
  children: React.ReactNode;
  scrollDistance?: number;
}

export default function ScrollableRow({
  children,
  scrollDistance = 1000,
}: ScrollableRowProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showLeftScroll, setShowLeftScroll] = useState(false);
  const [showRightScroll, setShowRightScroll] = useState(false);

  const checkScroll = () => {
    if (containerRef.current) {
      const { scrollWidth, clientWidth, scrollLeft } = containerRef.current;

      // 计算是否需要左右滚动按钮
      const threshold = 1; // 容差值，避免浮点误差
      const canScrollRight =
        scrollWidth - (scrollLeft + clientWidth) > threshold;
      const canScrollLeft = scrollLeft > threshold;

      setShowRightScroll(canScrollRight);
      setShowLeftScroll(canScrollLeft);
    }
  };

  useEffect(() => {
    // 多次延迟检查，确保内容已完全渲染
    checkScroll();

    // 监听窗口大小变化
    window.addEventListener('resize', checkScroll);

    // 创建一个 ResizeObserver 来监听容器大小变化
    const resizeObserver = new ResizeObserver(() => {
      // 延迟执行检查
      checkScroll();
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      window.removeEventListener('resize', checkScroll);
      resizeObserver.disconnect();
    };
  }, [children]); // 依赖 children，当子组件变化时重新检查

  // 添加一个额外的效果来监听子组件的变化
  useEffect(() => {
    if (containerRef.current) {
      // 监听 DOM 变化
      const observer = new MutationObserver(() => {
        setTimeout(checkScroll, 100);
      });

      observer.observe(containerRef.current, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['style', 'class'],
      });

      return () => observer.disconnect();
    }
  }, []);

  const handleScrollRightClick = () => {
    if (containerRef.current) {
      containerRef.current.scrollBy({
        left: scrollDistance,
        behavior: 'smooth',
      });
    }
  };

  const handleScrollLeftClick = () => {
    if (containerRef.current) {
      containerRef.current.scrollBy({
        left: -scrollDistance,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className='group/row relative' onMouseEnter={checkScroll}>
      <div
        ref={containerRef}
        className='scrollbar-hide flex snap-x snap-proximity gap-3 overflow-x-auto scroll-smooth px-0.5 pb-8 pt-1 sm:gap-5 sm:pb-10 sm:pt-2'
        onScroll={checkScroll}
      >
        {children}
      </div>
      {showLeftScroll && (
        <button
          onClick={handleScrollLeftClick}
          className='apple-pressable absolute left-2 top-[38%] z-[550] hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-lg border border-black/10 bg-[var(--app-surface)] text-[var(--app-ink)] opacity-0 shadow-lg backdrop-blur-xl transition-[opacity,background-color] hover:bg-white dark:border-white/10 dark:hover:bg-[#262a26] sm:flex sm:group-hover/row:opacity-100 sm:group-focus-within/row:opacity-100'
          aria-label='向左浏览'
          title='向左浏览'
        >
          <ChevronLeft className='h-5 w-5' />
        </button>
      )}

      {showRightScroll && (
        <button
          onClick={handleScrollRightClick}
          className='apple-pressable absolute right-2 top-[38%] z-[550] hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-lg border border-black/10 bg-[var(--app-surface)] text-[var(--app-ink)] opacity-0 shadow-lg backdrop-blur-xl transition-[opacity,background-color] hover:bg-white dark:border-white/10 dark:hover:bg-[#262a26] sm:flex sm:group-hover/row:opacity-100 sm:group-focus-within/row:opacity-100'
          aria-label='向右浏览'
          title='向右浏览'
        >
          <ChevronRight className='h-5 w-5' />
        </button>
      )}
    </div>
  );
}
