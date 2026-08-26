'use client';

import { X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface ErrorInfo {
  id: string;
  message: string;
  timestamp: number;
}

export function GlobalErrorIndicator() {
  const [currentError, setCurrentError] = useState<ErrorInfo | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isReplacing, setIsReplacing] = useState(false);

  useEffect(() => {
    // 监听自定义错误事件
    const handleError = (event: CustomEvent) => {
      const { message } = event.detail;
      const newError: ErrorInfo = {
        id: Date.now().toString(),
        message,
        timestamp: Date.now(),
      };

      // 如果已有错误，开始替换动画
      if (currentError) {
        setCurrentError(newError);
        setIsReplacing(true);

        // 动画完成后恢复正常
        setTimeout(() => {
          setIsReplacing(false);
        }, 200);
      } else {
        // 第一次显示错误
        setCurrentError(newError);
      }

      setIsVisible(true);
    };

    // 监听错误事件
    window.addEventListener('globalError', handleError as EventListener);

    return () => {
      window.removeEventListener('globalError', handleError as EventListener);
    };
  }, [currentError]);

  const handleClose = () => {
    setIsVisible(false);
    setCurrentError(null);
    setIsReplacing(false);
  };

  if (!isVisible || !currentError) {
    return null;
  }

  return (
    <div className='fixed top-4 right-4 z-[2000]'>
      {/* 错误卡片 */}
      <div
        role='alert'
        className={`apple-toast flex min-w-[300px] max-w-[400px] items-center justify-between rounded-2xl bg-red-500 px-4 py-3 text-white shadow-lg ${
          isReplacing ? 'scale-105 bg-red-400' : 'scale-100 bg-red-500'
        }`}
      >
        <span className='mr-3 flex-1 text-sm font-medium'>
          {currentError.message}
        </span>
        <button
          onClick={handleClose}
          className='apple-pressable flex-shrink-0 rounded-full p-1 text-white transition-colors hover:bg-white/10 hover:text-red-100'
          aria-label='关闭错误提示'
        >
          <X className='h-4 w-4' />
        </button>
      </div>
    </div>
  );
}

// 全局错误触发函数
export function triggerGlobalError(message: string) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('globalError', {
        detail: { message },
      })
    );
  }
}
