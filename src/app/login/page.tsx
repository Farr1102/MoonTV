/* eslint-disable @typescript-eslint/no-explicit-any */

'use client';

import { AlertCircle, CheckCircle, Clapperboard } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

import { checkForUpdates, CURRENT_VERSION, UpdateStatus } from '@/lib/version';

import { useSite } from '@/components/SiteProvider';
import { ThemeToggle } from '@/components/ThemeToggle';

// 版本显示组件
function VersionDisplay() {
  const [updateStatus, setUpdateStatus] = useState<UpdateStatus | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkUpdate = async () => {
      try {
        const status = await checkForUpdates();
        setUpdateStatus(status);
      } catch (_) {
        // do nothing
      } finally {
        setIsChecking(false);
      }
    };

    checkUpdate();
  }, []);

  return (
    <button
      onClick={() =>
        window.open('https://github.com/LunaTechLab/MoonTV', '_blank')
      }
      className='apple-pressable absolute bottom-4 left-1/2 flex -translate-x-1/2 cursor-pointer items-center gap-2 rounded-full px-3 py-2 text-xs text-[var(--app-muted)] transition-colors hover:bg-black/[0.05] hover:text-[var(--app-ink)] dark:hover:bg-white/[0.06]'
    >
      <span className='font-mono'>v{CURRENT_VERSION}</span>
      {!isChecking && updateStatus !== UpdateStatus.FETCH_FAILED && (
        <div
          className={`flex items-center gap-1.5 ${
            updateStatus === UpdateStatus.HAS_UPDATE
              ? 'text-yellow-600 dark:text-yellow-400'
              : updateStatus === UpdateStatus.NO_UPDATE
              ? 'text-[var(--app-positive)]'
              : ''
          }`}
        >
          {updateStatus === UpdateStatus.HAS_UPDATE && (
            <>
              <AlertCircle className='w-3.5 h-3.5' />
              <span className='font-semibold text-xs'>有新版本</span>
            </>
          )}
          {updateStatus === UpdateStatus.NO_UPDATE && (
            <>
              <CheckCircle className='w-3.5 h-3.5' />
              <span className='font-semibold text-xs'>已是最新</span>
            </>
          )}
        </div>
      )}
    </button>
  );
}

function LoginPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [shouldAskUsername, setShouldAskUsername] = useState(false);
  const [enableRegister, setEnableRegister] = useState(false);
  const { siteName } = useSite();

  // 在客户端挂载后设置配置
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storageType = (window as any).RUNTIME_CONFIG?.STORAGE_TYPE;
      setShouldAskUsername(storageType && storageType !== 'localstorage');
      setEnableRegister(
        Boolean((window as any).RUNTIME_CONFIG?.ENABLE_REGISTER)
      );
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!password || (shouldAskUsername && !username)) return;

    try {
      setLoading(true);
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password,
          ...(shouldAskUsername ? { username } : {}),
        }),
      });

      if (res.ok) {
        const redirect = searchParams.get('redirect') || '/';
        router.replace(redirect);
      } else if (res.status === 401) {
        setError('密码错误');
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? '服务器错误');
      }
    } catch (error) {
      setError('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  // 处理注册逻辑
  const handleRegister = async () => {
    setError(null);
    if (!password || !username) return;

    try {
      setLoading(true);
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (res.ok) {
        const redirect = searchParams.get('redirect') || '/';
        router.replace(redirect);
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? '服务器错误');
      }
    } catch (error) {
      setError('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12'>
      <div className='absolute right-4 top-4'>
        <ThemeToggle />
      </div>
      <div className='apple-glass relative z-10 w-full max-w-md rounded-[28px] border-black/[0.08] p-6 shadow-2xl dark:border-white/[0.12] sm:p-10'>
        <div className='mb-8 flex flex-col items-center gap-3 text-center'>
          <span className='flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--app-accent)] text-white shadow-[0_8px_20px_rgba(0,113,227,0.24)]'>
            <Clapperboard className='h-7 w-7' strokeWidth={2} />
          </span>
          <h1 className='text-2xl font-semibold tracking-[-0.025em] text-[var(--app-ink)]'>
            {siteName}
          </h1>
          <p className='text-sm text-[var(--app-muted)]'>登录后继续观看</p>
        </div>
        <form onSubmit={handleSubmit} className='space-y-4'>
          {shouldAskUsername && (
            <div>
              <label htmlFor='username' className='sr-only'>
                用户名
              </label>
              <input
                id='username'
                type='text'
                autoComplete='username'
                className='apple-input block w-full rounded-xl px-4 py-3 text-sm sm:text-base'
                placeholder='输入用户名'
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          )}

          <div>
            <label htmlFor='password' className='sr-only'>
              密码
            </label>
            <input
              id='password'
              type='password'
              autoComplete='current-password'
              className='apple-input block w-full rounded-xl px-4 py-3 text-sm sm:text-base'
              placeholder='输入访问密码'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <p className='rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-300'>
              {error}
            </p>
          )}

          {/* 登录 / 注册按钮 */}
          {shouldAskUsername && enableRegister ? (
            <div className='flex gap-3'>
              <button
                type='button'
                onClick={handleRegister}
                disabled={!password || !username || loading}
                className='apple-pressable flex-1 rounded-xl bg-black/[0.06] py-3 text-sm font-semibold text-[var(--app-ink)] transition-colors hover:bg-black/[0.1] disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white/[0.08] dark:hover:bg-white/[0.14]'
              >
                {loading ? '注册中...' : '注册'}
              </button>
              <button
                type='submit'
                disabled={
                  !password || loading || (shouldAskUsername && !username)
                }
                className='apple-pressable flex-1 rounded-xl bg-[var(--app-accent)] py-3 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(0,113,227,0.2)] transition-colors hover:bg-[var(--app-accent-strong)] disabled:cursor-not-allowed disabled:opacity-50'
              >
                {loading ? '登录中...' : '登录'}
              </button>
            </div>
          ) : (
            <button
              type='submit'
              disabled={
                !password || loading || (shouldAskUsername && !username)
              }
              className='apple-pressable w-full rounded-xl bg-[var(--app-accent)] py-3 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(0,113,227,0.2)] transition-colors hover:bg-[var(--app-accent-strong)] disabled:cursor-not-allowed disabled:opacity-50'
            >
              {loading ? '登录中...' : '登录'}
            </button>
          )}
        </form>
      </div>

      {/* 版本信息显示 */}
      <VersionDisplay />
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginPageClient />
    </Suspense>
  );
}
