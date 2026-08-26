/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/exhaustive-deps, no-console */

'use client';

import {
  type LucideIcon,
  BellRing,
  Bookmark,
  ChevronRight,
  Film,
  Heart,
  Search,
  Sparkles,
  Trash2,
  Tv,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { type ReactNode, Suspense, useEffect, useState } from 'react';

// 客户端收藏 API
import {
  clearAllFavorites,
  getAllFavorites,
  getAllPlayRecords,
  subscribeToDataUpdates,
} from '@/lib/db.client';
import { getDoubanCategories } from '@/lib/douban.client';
import { DoubanItem } from '@/lib/types';

import CapsuleSwitch from '@/components/CapsuleSwitch';
import ContinueWatching from '@/components/ContinueWatching';
import PageLayout from '@/components/PageLayout';
import ScrollableRow from '@/components/ScrollableRow';
import { useSite } from '@/components/SiteProvider';
import VideoCard from '@/components/VideoCard';

const rowCardClass =
  'w-[112px] min-w-[112px] snap-start sm:w-40 sm:min-w-[160px] xl:w-[172px] xl:min-w-[172px]';

function SectionHeading({
  icon: Icon,
  title,
  action,
}: {
  icon: LucideIcon;
  title: string;
  action?: ReactNode;
}) {
  return (
    <div className='mb-4 flex min-h-9 items-center justify-between gap-3 sm:mb-5'>
      <div className='flex min-w-0 items-center gap-2.5'>
        <span className='hidden h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--app-accent)]/10 text-[var(--app-accent)]'>
          <Icon className='h-4 w-4' strokeWidth={2.2} />
        </span>
        <h2 className='truncate text-[21px] font-semibold tracking-[-0.015em] text-[var(--app-ink)]'>
          {title}
        </h2>
      </div>
      {action}
    </div>
  );
}

function PosterSkeleton() {
  return (
    <div className={rowCardClass}>
      <div className='aspect-[2/3] w-full animate-pulse overflow-hidden rounded-lg border border-black/[0.04] bg-black/[0.08] dark:border-white/[0.04] dark:bg-white/[0.08]' />
      <div className='mt-3 h-3 w-4/5 animate-pulse rounded bg-black/[0.08] dark:bg-white/[0.08]' />
      <div className='mt-2 h-2.5 w-1/3 animate-pulse rounded bg-black/[0.06] dark:bg-white/[0.06]' />
    </div>
  );
}

function CategoryRow({
  items,
  loading,
  searchType,
}: {
  items: DoubanItem[];
  loading: boolean;
  searchType: 'movie' | 'tv';
}) {
  return (
    <ScrollableRow>
      {loading
        ? Array.from({ length: 8 }).map((_, index) => (
            <PosterSkeleton key={index} />
          ))
        : items.map((item) => (
            <div key={item.id} className={rowCardClass}>
              <VideoCard
                from='douban'
                title={item.title}
                poster={item.poster}
                douban_id={Number(item.id)}
                rate={item.rate}
                year={item.year}
                type={searchType}
              />
            </div>
          ))}
    </ScrollableRow>
  );
}

function HomeClient() {
  const [activeTab, setActiveTab] = useState<'home' | 'favorites'>('home');
  const [hotMovies, setHotMovies] = useState<DoubanItem[]>([]);
  const [hotTvShows, setHotTvShows] = useState<DoubanItem[]>([]);
  const [hotVarietyShows, setHotVarietyShows] = useState<DoubanItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { announcement } = useSite();

  const [showAnnouncement, setShowAnnouncement] = useState(false);

  // 检查公告弹窗状态
  useEffect(() => {
    if (typeof window !== 'undefined' && announcement) {
      const hasSeenAnnouncement = localStorage.getItem('hasSeenAnnouncement');
      if (hasSeenAnnouncement !== announcement) {
        setShowAnnouncement(true);
      } else {
        setShowAnnouncement(Boolean(!hasSeenAnnouncement && announcement));
      }
    }
  }, [announcement]);

  // 收藏夹数据
  type FavoriteItem = {
    id: string;
    source: string;
    title: string;
    poster: string;
    episodes: number;
    source_name: string;
    currentEpisode?: number;
    search_title?: string;
  };

  const [favoriteItems, setFavoriteItems] = useState<FavoriteItem[]>([]);

  useEffect(() => {
    const fetchDoubanData = async () => {
      try {
        setLoading(true);

        // 并行获取热门电影、热门剧集和热门综艺
        const [moviesData, tvShowsData, varietyShowsData] = await Promise.all([
          getDoubanCategories({
            kind: 'movie',
            category: '热门',
            type: '全部',
          }),
          getDoubanCategories({ kind: 'tv', category: 'tv', type: 'tv' }),
          getDoubanCategories({ kind: 'tv', category: 'show', type: 'show' }),
        ]);

        if (moviesData.code === 200) {
          setHotMovies(moviesData.list);
        }

        if (tvShowsData.code === 200) {
          setHotTvShows(tvShowsData.list);
        }

        if (varietyShowsData.code === 200) {
          setHotVarietyShows(varietyShowsData.list);
        }
      } catch (error) {
        console.error('获取豆瓣数据失败:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDoubanData();
  }, []);

  // 处理收藏数据更新的函数
  const updateFavoriteItems = async (allFavorites: Record<string, any>) => {
    const allPlayRecords = await getAllPlayRecords();

    // 根据保存时间排序（从近到远）
    const sorted = Object.entries(allFavorites)
      .sort(([, a], [, b]) => b.save_time - a.save_time)
      .map(([key, fav]) => {
        const plusIndex = key.indexOf('+');
        const source = key.slice(0, plusIndex);
        const id = key.slice(plusIndex + 1);

        // 查找对应的播放记录，获取当前集数
        const playRecord = allPlayRecords[key];
        const currentEpisode = playRecord?.index;

        return {
          id,
          source,
          title: fav.title,
          year: fav.year,
          poster: fav.cover,
          episodes: fav.total_episodes,
          source_name: fav.source_name,
          currentEpisode,
          search_title: fav?.search_title,
        } as FavoriteItem;
      });
    setFavoriteItems(sorted);
  };

  // 当切换到收藏夹时加载收藏数据
  useEffect(() => {
    if (activeTab !== 'favorites') return;

    const loadFavorites = async () => {
      const allFavorites = await getAllFavorites();
      await updateFavoriteItems(allFavorites);
    };

    loadFavorites();

    // 监听收藏更新事件
    const unsubscribe = subscribeToDataUpdates(
      'favoritesUpdated',
      (newFavorites: Record<string, any>) => {
        updateFavoriteItems(newFavorites);
      }
    );

    return unsubscribe;
  }, [activeTab]);

  const handleCloseAnnouncement = (announcement: string) => {
    setShowAnnouncement(false);
    localStorage.setItem('hasSeenAnnouncement', announcement); // 记录已查看弹窗
  };

  return (
    <PageLayout>
      <div className='overflow-visible px-4 pb-8 pt-6 sm:px-8 sm:pb-12 sm:pt-10 lg:px-10'>
        <div className='mx-auto max-w-[1680px]'>
          <header className='mb-9 border-b border-[var(--app-line)] pb-6 pr-0 sm:mb-11 sm:pb-7 md:pr-20'>
            <div className='flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between'>
              <div className='min-w-0'>
                <div className='mb-2 text-[13px] font-medium tracking-[0.01em] text-[var(--app-muted)]'>
                  为你精选
                </div>
                <h1 className='whitespace-nowrap text-[28px] font-semibold leading-[1.08] tracking-[-0.035em] text-[var(--app-ink)] sm:text-4xl'>
                  今晚看什么？
                </h1>
              </div>

              <div className='flex w-full items-center justify-start gap-3 lg:w-auto lg:justify-end'>
                <Link
                  href='/search'
                  className='apple-pressable apple-glass-control flex h-10 shrink-0 items-center gap-2 whitespace-nowrap rounded-full border border-black/[0.08] px-4 text-sm font-medium text-[var(--app-muted)] transition-colors hover:border-[var(--app-accent)] hover:text-[var(--app-ink)] dark:border-white/[0.12]'
                >
                  <Search className='h-4 w-4' />
                  <span>搜索</span>
                </Link>
                <CapsuleSwitch
                  options={[
                    { label: '推荐', value: 'home' },
                    { label: '收藏', value: 'favorites' },
                  ]}
                  active={activeTab}
                  onChange={(value) =>
                    setActiveTab(value as 'home' | 'favorites')
                  }
                />
              </div>
            </div>
          </header>

          {activeTab === 'favorites' ? (
            <section className='mb-8 min-h-[45vh]'>
              <SectionHeading
                icon={Bookmark}
                title='我的收藏'
                action={
                  favoriteItems.length > 0 ? (
                    <button
                      className='apple-pressable flex h-9 items-center gap-1.5 rounded-full px-2.5 text-xs font-medium text-[var(--app-muted)] transition-colors hover:bg-black/[0.05] hover:text-[var(--app-ink)] dark:hover:bg-white/[0.06]'
                      onClick={async () => {
                        await clearAllFavorites();
                        setFavoriteItems([]);
                      }}
                    >
                      <Trash2 className='h-3.5 w-3.5' />
                      清空
                    </button>
                  ) : undefined
                }
              />
              <div className='grid grid-cols-3 justify-items-start gap-x-3 gap-y-8 sm:grid-cols-[repeat(auto-fill,minmax(150px,1fr))] sm:gap-x-5 sm:gap-y-10 lg:grid-cols-[repeat(auto-fill,minmax(160px,1fr))]'>
                {favoriteItems.map((item) => (
                  <div
                    key={item.id + item.source}
                    className='w-full max-w-[172px]'
                  >
                    <VideoCard
                      query={item.search_title}
                      {...item}
                      from='favorite'
                      type={item.episodes > 1 ? 'tv' : ''}
                    />
                  </div>
                ))}
                {favoriteItems.length === 0 && (
                  <div className='col-span-full flex w-full flex-col items-center justify-center py-20 text-center'>
                    <span className='mb-4 flex h-12 w-12 items-center justify-center rounded-lg border border-[var(--app-line)] text-[var(--app-muted)]'>
                      <Heart className='h-5 w-5' />
                    </span>
                    <p className='font-medium text-[var(--app-ink)]'>
                      还没有收藏
                    </p>
                    <button
                      onClick={() => setActiveTab('home')}
                      className='apple-pressable mt-2 text-sm text-[var(--app-accent-strong)] hover:underline'
                    >
                      去推荐页看看
                    </button>
                  </div>
                )}
              </div>
            </section>
          ) : (
            <>
              <ContinueWatching />

              <section className='mb-4 sm:mb-6'>
                <SectionHeading
                  icon={Film}
                  title='热门电影'
                  action={
                    <Link
                      href='/douban?type=movie'
                      className='apple-pressable flex h-9 items-center gap-0.5 rounded-full px-2 text-xs font-medium text-[var(--app-accent)] transition-colors hover:bg-[var(--app-accent)]/10 hover:text-[var(--app-accent-strong)] sm:text-sm'
                    >
                      全部
                      <ChevronRight className='h-4 w-4' />
                    </Link>
                  }
                />
                <CategoryRow
                  items={hotMovies}
                  loading={loading}
                  searchType='movie'
                />
              </section>

              <section className='mb-4 sm:mb-6'>
                <SectionHeading
                  icon={Tv}
                  title='热门剧集'
                  action={
                    <Link
                      href='/douban?type=tv'
                      className='apple-pressable flex h-9 items-center gap-0.5 rounded-full px-2 text-xs font-medium text-[var(--app-accent)] transition-colors hover:bg-[var(--app-accent)]/10 hover:text-[var(--app-accent-strong)] sm:text-sm'
                    >
                      全部
                      <ChevronRight className='h-4 w-4' />
                    </Link>
                  }
                />
                <CategoryRow
                  items={hotTvShows}
                  loading={loading}
                  searchType='tv'
                />
              </section>

              <section className='mb-4 sm:mb-6'>
                <SectionHeading
                  icon={Sparkles}
                  title='热门综艺'
                  action={
                    <Link
                      href='/douban?type=show'
                      className='apple-pressable flex h-9 items-center gap-0.5 rounded-full px-2 text-xs font-medium text-[var(--app-accent)] transition-colors hover:bg-[var(--app-accent)]/10 hover:text-[var(--app-accent-strong)] sm:text-sm'
                    >
                      全部
                      <ChevronRight className='h-4 w-4' />
                    </Link>
                  }
                />
                <CategoryRow
                  items={hotVarietyShows}
                  loading={loading}
                  searchType='tv'
                />
              </section>
            </>
          )}
        </div>
      </div>
      {announcement && showAnnouncement && (
        <div
          className={`apple-scrim fixed inset-0 z-[900] flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm ${
            showAnnouncement ? '' : 'opacity-0 pointer-events-none'
          }`}
          role='dialog'
          aria-modal='true'
          aria-labelledby='announcement-title'
        >
          <div className='apple-modal-panel apple-glass w-full max-w-md rounded-2xl border-black/[0.08] p-5 shadow-2xl dark:border-white/[0.12] sm:p-6'>
            <div className='mb-5 flex items-start justify-between gap-4'>
              <div className='flex items-center gap-3'>
                <span className='flex h-9 w-9 items-center justify-center rounded-full bg-[var(--app-accent)] text-white shadow-[0_5px_14px_rgba(0,113,227,0.2)]'>
                  <BellRing className='h-4 w-4' />
                </span>
                <h3
                  id='announcement-title'
                  className='text-lg font-semibold text-[var(--app-ink)]'
                >
                  站点公告
                </h3>
              </div>
              <button
                onClick={() => handleCloseAnnouncement(announcement)}
                className='apple-pressable flex h-9 w-9 items-center justify-center rounded-full text-[var(--app-muted)] transition-colors hover:bg-black/[0.06] hover:text-[var(--app-ink)] dark:hover:bg-white/[0.08]'
                aria-label='关闭'
                title='关闭'
              >
                <X className='h-4 w-4' />
              </button>
            </div>
            <p className='mb-6 max-h-[45vh] overflow-y-auto text-sm leading-7 text-[var(--app-muted)]'>
              {announcement}
            </p>
            <button
              onClick={() => handleCloseAnnouncement(announcement)}
              className='apple-pressable flex h-11 w-full items-center justify-center rounded-full bg-[var(--app-accent)] px-4 text-sm font-semibold text-white transition-colors hover:bg-[var(--app-accent-strong)]'
            >
              我知道了
            </button>
          </div>
        </div>
      )}
    </PageLayout>
  );
}

export default function Home() {
  return (
    <Suspense>
      <HomeClient />
    </Suspense>
  );
}
