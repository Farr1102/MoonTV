'use client';

import { Search, ShieldCheck } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FormEvent, useEffect, useMemo, useState } from 'react';

import { SearchResult } from '@/lib/types';

import ContinueWatching from '@/components/ContinueWatching';
import PageLayout from '@/components/PageLayout';
import VideoCard from '@/components/VideoCard';

const categories = [
  { key: 'featured', label: '精选', query: '女' },
  { key: 'domestic', label: '国产', query: '国产' },
  { key: 'japan', label: '日韩', query: '日本' },
  { key: 'western', label: '欧美', query: '欧美' },
  { key: 'anime', label: '动漫', query: '动漫' },
] as const;

const ANIME_MARKER = /动漫|动画|番剧|二次元|\banime\b|\bcartoon\b/i;

function isAnimeResult(item: SearchResult): boolean {
  return [item.class, item.type_name, item.title].some(
    (value) => typeof value === 'string' && ANIME_MARKER.test(value)
  );
}

function AdultCardSkeleton() {
  return (
    <div className='w-full animate-pulse'>
      <div className='aspect-[2/3] rounded-xl border border-black/[0.04] bg-black/[0.08] dark:border-white/[0.05] dark:bg-white/[0.08]' />
      <div className='mt-3 h-3 w-4/5 rounded bg-black/[0.08] dark:bg-white/[0.08]' />
      <div className='mt-2 h-2.5 w-2/5 rounded bg-black/[0.06] dark:bg-white/[0.06]' />
    </div>
  );
}

export default function AdultPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlQuery = searchParams.get('q')?.trim() || categories[0].query;
  const categoryForQuery = useMemo(
    () => categories.find((category) => category.query === urlQuery)?.key || '',
    [urlQuery]
  );
  const [searchInput, setSearchInput] = useState(
    searchParams.get('q')?.trim() || ''
  );
  const [results, setResults] = useState<SearchResult[]>([]);
  const [availableSources, setAvailableSources] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [excludeAnime, setExcludeAnime] = useState(true);

  const visibleResults = useMemo(
    () =>
      excludeAnime ? results.filter((item) => !isAnimeResult(item)) : results,
    [excludeAnime, results]
  );

  useEffect(() => {
    setSearchInput(categoryForQuery ? '' : urlQuery);
  }, [categoryForQuery, urlQuery]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadResults() {
      setLoading(true);
      setError('');

      try {
        const response = await fetch(
          `/api/adult?q=${encodeURIComponent(urlQuery)}`,
          { cache: 'no-store', signal: controller.signal }
        );
        const data = (await response.json()) as {
          results?: SearchResult[];
          availableSources?: number;
          error?: string;
        };

        if (!response.ok) throw new Error(data.error || '加载失败');
        setResults(data.results || []);
        setAvailableSources(data.availableSources || 0);
      } catch (requestError) {
        if ((requestError as Error).name === 'AbortError') return;
        setResults([]);
        setAvailableSources(0);
        setError(
          requestError instanceof Error ? requestError.message : '加载失败'
        );
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    void loadResults();
    return () => controller.abort();
  }, [urlQuery]);

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextQuery = searchInput.trim().replace(/\s+/g, ' ');
    if (!nextQuery) return;
    router.push(`/adult?q=${encodeURIComponent(nextQuery)}`);
  };

  return (
    <PageLayout activePath='/adult'>
      <div className='overflow-visible px-4 pb-10 pt-6 sm:px-8 sm:pb-14 sm:pt-10 lg:px-10'>
        <div className='mx-auto max-w-[1680px]'>
          <header className='mb-7 border-b border-[var(--app-line)] pb-6 pr-0 sm:mb-9 sm:pb-7 md:pr-20'>
            <div className='flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between'>
              <div className='flex min-w-0 items-center gap-3'>
                <span
                  className='flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--app-rating)]/12 text-[var(--app-rating)]'
                  title='管理员专属'
                >
                  <ShieldCheck className='h-5 w-5' strokeWidth={2.1} />
                </span>
                <div className='min-w-0'>
                  <div className='mb-1 text-[12px] font-medium text-[var(--app-muted)]'>
                    管理员片库
                  </div>
                  <h1 className='text-[28px] font-semibold leading-[1.08] text-[var(--app-ink)] sm:text-4xl'>
                    成人内容
                  </h1>
                </div>
              </div>

              <form
                onSubmit={handleSearch}
                className='relative w-full lg:w-[360px]'
              >
                <Search className='pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--app-muted)]' />
                <input
                  type='search'
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  placeholder='搜索片名或关键词'
                  aria-label='搜索成人内容'
                  className='apple-glass-control h-11 w-full rounded-full border-black/[0.08] py-2 pl-10 pr-4 text-sm text-[var(--app-ink)] placeholder:text-[var(--app-muted)] focus:border-[var(--app-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--app-accent)]/20 dark:border-white/[0.12]'
                />
              </form>
            </div>
          </header>

          <div className='mb-8 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide'>
            {categories.map((category) => {
              const active = categoryForQuery === category.key;
              return (
                <button
                  key={category.key}
                  type='button'
                  aria-pressed={active}
                  onClick={() => {
                    router.push(
                      `/adult?q=${encodeURIComponent(category.query)}`
                    );
                  }}
                  className={`apple-pressable h-9 shrink-0 rounded-full px-4 text-sm font-medium transition-colors ${
                    active
                      ? 'bg-[var(--app-ink)] text-[var(--app-canvas)] shadow-sm'
                      : 'apple-glass-control text-[var(--app-muted)] hover:text-[var(--app-ink)]'
                  }`}
                >
                  {category.label}
                </button>
              );
            })}
          </div>

          <div className='mb-7 flex justify-end'>
            <label className='apple-pressable inline-flex cursor-pointer select-none items-center gap-2 text-sm text-[var(--app-muted)]'>
              <span>排除动漫</span>
              <span className='relative inline-flex h-5 w-9 shrink-0 items-center'>
                <input
                  type='checkbox'
                  checked={excludeAnime}
                  onChange={(event) => setExcludeAnime(event.target.checked)}
                  className='peer sr-only'
                  aria-label='排除动漫内容'
                />
                <span className='absolute inset-0 rounded-full bg-black/[0.14] transition-colors peer-checked:bg-[var(--app-accent)] dark:bg-white/[0.18]' />
                <span className='absolute left-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-4' />
              </span>
            </label>
          </div>

          <ContinueWatching
            className='mb-8'
            title='最近观看'
            sourcePrefix='adult_'
            showClear={false}
          />

          <section aria-live='polite'>
            <div className='mb-5 flex min-h-8 items-center justify-between gap-4'>
              <h2 className='truncate text-[21px] font-semibold text-[var(--app-ink)]'>
                {categoryForQuery
                  ? categories.find((item) => item.key === categoryForQuery)
                      ?.label
                  : `“${urlQuery}”`}
              </h2>
              {!loading && !error && (
                <span className='shrink-0 text-xs text-[var(--app-muted)]'>
                  {visibleResults.length} 部 · {availableSources} 个源
                </span>
              )}
            </div>

            {error ? (
              <div className='flex min-h-[36vh] items-center justify-center text-center text-sm text-[var(--app-muted)]'>
                {error}
              </div>
            ) : (
              <div className='grid grid-cols-3 gap-x-3 gap-y-9 sm:grid-cols-[repeat(auto-fill,minmax(150px,1fr))] sm:gap-x-5 sm:gap-y-11 lg:grid-cols-[repeat(auto-fill,minmax(160px,1fr))]'>
                {loading
                  ? Array.from({ length: 18 }).map((_, index) => (
                      <AdultCardSkeleton key={index} />
                    ))
                  : visibleResults.map((item) => (
                      <div
                        key={`${item.source}-${item.id}`}
                        className='w-full max-w-[180px]'
                      >
                        <VideoCard
                          id={item.id}
                          title={item.title}
                          poster={item.poster}
                          episodes={item.episodes.length}
                          source={item.source}
                          source_name={item.source_name}
                          year={item.year}
                          query={urlQuery}
                          from='search'
                          type={item.episodes.length > 1 ? 'tv' : 'movie'}
                        />
                      </div>
                    ))}
              </div>
            )}

            {!loading && !error && visibleResults.length === 0 && (
              <div className='flex min-h-[36vh] items-center justify-center text-sm text-[var(--app-muted)]'>
                {results.length > 0 ? '没有符合条件的内容' : '没有找到相关内容'}
              </div>
            )}
          </section>
        </div>
      </div>
    </PageLayout>
  );
}
