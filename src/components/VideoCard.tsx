/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  Clapperboard,
  ExternalLink,
  Heart,
  Play,
  Star,
  Trash2,
} from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import {
  deleteFavorite,
  deletePlayRecord,
  generateStorageKey,
  isFavorited,
  saveFavorite,
  subscribeToDataUpdates,
} from '@/lib/db.client';
import { SearchResult } from '@/lib/types';
import { processImageUrl } from '@/lib/utils';

import { ImagePlaceholder } from '@/components/ImagePlaceholder';

interface VideoCardProps {
  id?: string;
  source?: string;
  title?: string;
  query?: string;
  poster?: string;
  episodes?: number;
  source_name?: string;
  progress?: number;
  year?: string;
  from: 'playrecord' | 'favorite' | 'search' | 'douban';
  currentEpisode?: number;
  douban_id?: number;
  onDelete?: () => void;
  rate?: string;
  items?: SearchResult[];
  type?: string;
}

export default function VideoCard({
  id,
  title = '',
  query = '',
  poster = '',
  episodes,
  source,
  source_name,
  progress = 0,
  year,
  from,
  currentEpisode,
  douban_id,
  onDelete,
  rate,
  items,
  type = '',
}: VideoCardProps) {
  const router = useRouter();
  const [favorited, setFavorited] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);

  const isAggregate = from === 'search' && !!items?.length;

  const aggregateData = useMemo(() => {
    if (!isAggregate || !items) return null;
    const countMap = new Map<number, number>();
    const episodeCountMap = new Map<number, number>();
    items.forEach((item) => {
      if (item.douban_id && item.douban_id !== 0) {
        countMap.set(item.douban_id, (countMap.get(item.douban_id) || 0) + 1);
      }
      const len = item.episodes?.length || 0;
      if (len > 0) {
        episodeCountMap.set(len, (episodeCountMap.get(len) || 0) + 1);
      }
    });

    const getMostFrequent = (map: Map<number, number>) => {
      let maxCount = 0;
      let result: number | undefined;
      map.forEach((cnt, key) => {
        if (cnt > maxCount) {
          maxCount = cnt;
          result = key;
        }
      });
      return result;
    };

    return {
      first: items[0],
      mostFrequentDoubanId: getMostFrequent(countMap),
      mostFrequentEpisodes: getMostFrequent(episodeCountMap) || 0,
    };
  }, [isAggregate, items]);

  const actualTitle = aggregateData?.first.title ?? title;
  const actualPoster = aggregateData?.first.poster ?? poster;
  const actualSource = aggregateData?.first.source ?? source;
  const actualId = aggregateData?.first.id ?? id;
  const actualDoubanId = aggregateData?.mostFrequentDoubanId ?? douban_id;
  const actualEpisodes = aggregateData?.mostFrequentEpisodes ?? episodes;
  const actualYear = aggregateData?.first.year ?? year;
  const actualQuery = query || '';
  const actualSearchType = isAggregate
    ? aggregateData?.first.episodes?.length === 1
      ? 'movie'
      : 'tv'
    : type;

  useEffect(() => {
    setIsLoading(false);
    setImageFailed(false);
  }, [actualPoster]);

  // 获取收藏状态
  useEffect(() => {
    if (from === 'douban' || !actualSource || !actualId) return;

    const fetchFavoriteStatus = async () => {
      try {
        const fav = await isFavorited(actualSource, actualId);
        setFavorited(fav);
      } catch (err) {
        throw new Error('检查收藏状态失败');
      }
    };

    fetchFavoriteStatus();

    // 监听收藏状态更新事件
    const storageKey = generateStorageKey(actualSource, actualId);
    const unsubscribe = subscribeToDataUpdates(
      'favoritesUpdated',
      (newFavorites: Record<string, any>) => {
        // 检查当前项目是否在新的收藏列表中
        const isNowFavorited = !!newFavorites[storageKey];
        setFavorited(isNowFavorited);
      }
    );

    return unsubscribe;
  }, [from, actualSource, actualId]);

  const handleToggleFavorite = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (from === 'douban' || !actualSource || !actualId) return;
      try {
        if (favorited) {
          // 如果已收藏，删除收藏
          await deleteFavorite(actualSource, actualId);
          setFavorited(false);
        } else {
          // 如果未收藏，添加收藏
          await saveFavorite(actualSource, actualId, {
            title: actualTitle,
            source_name: source_name || '',
            year: actualYear || '',
            cover: actualPoster,
            total_episodes: actualEpisodes ?? 1,
            save_time: Date.now(),
          });
          setFavorited(true);
        }
      } catch (err) {
        throw new Error('切换收藏状态失败');
      }
    },
    [
      from,
      actualSource,
      actualId,
      actualTitle,
      source_name,
      actualYear,
      actualPoster,
      actualEpisodes,
      favorited,
    ]
  );

  const handleDeleteRecord = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (from !== 'playrecord' || !actualSource || !actualId) return;
      try {
        await deletePlayRecord(actualSource, actualId);
        onDelete?.();
      } catch (err) {
        throw new Error('删除播放记录失败');
      }
    },
    [from, actualSource, actualId, onDelete]
  );

  const handleClick = useCallback(() => {
    if (from === 'douban') {
      router.push(
        `/play?title=${encodeURIComponent(actualTitle.trim())}${
          actualYear ? `&year=${actualYear}` : ''
        }${actualSearchType ? `&stype=${actualSearchType}` : ''}`
      );
    } else if (actualSource && actualId) {
      router.push(
        `/play?source=${actualSource}&id=${actualId}&title=${encodeURIComponent(
          actualTitle
        )}${actualYear ? `&year=${actualYear}` : ''}${
          isAggregate ? '&prefer=true' : ''
        }${
          actualQuery ? `&stitle=${encodeURIComponent(actualQuery.trim())}` : ''
        }${actualSearchType ? `&stype=${actualSearchType}` : ''}`
      );
    }
  }, [
    from,
    actualSource,
    actualId,
    router,
    actualTitle,
    actualYear,
    isAggregate,
    actualQuery,
    actualSearchType,
  ]);

  const config = useMemo(() => {
    const configs = {
      playrecord: {
        showSourceName: true,
        showProgress: true,
        showPlayButton: true,
        showHeart: true,
        showCheckCircle: true,
        showDoubanLink: false,
        showRating: false,
      },
      favorite: {
        showSourceName: true,
        showProgress: false,
        showPlayButton: true,
        showHeart: true,
        showCheckCircle: false,
        showDoubanLink: false,
        showRating: false,
      },
      search: {
        showSourceName: true,
        showProgress: false,
        showPlayButton: true,
        showHeart: !isAggregate,
        showCheckCircle: false,
        showDoubanLink: !!actualDoubanId,
        showRating: false,
      },
      douban: {
        showSourceName: false,
        showProgress: false,
        showPlayButton: true,
        showHeart: false,
        showCheckCircle: false,
        showDoubanLink: true,
        showRating: !!rate,
      },
    };
    return configs[from] || configs.search;
  }, [from, isAggregate, actualDoubanId, rate]);

  return (
    <div
      className='apple-pressable apple-hover-lift group relative w-full cursor-pointer rounded-xl bg-transparent hover:z-[500]'
      onClick={handleClick}
      onKeyDown={(event) => {
        if (
          event.currentTarget === event.target &&
          (event.key === 'Enter' || event.key === ' ')
        ) {
          event.preventDefault();
          handleClick();
        }
      }}
      role='button'
      tabIndex={0}
      aria-label={`播放 ${actualTitle}`}
    >
      {/* 海报容器 */}
      <div className='relative aspect-[2/3] overflow-hidden rounded-xl border border-black/[0.08] bg-[#e5e5ea] shadow-[0_8px_24px_rgba(30,30,34,0.10)] transition-shadow duration-300 group-hover:shadow-[0_14px_32px_rgba(30,30,34,0.16)] dark:border-white/[0.12] dark:bg-[#1c1c1e]'>
        {/* 骨架屏 */}
        {!isLoading && !imageFailed && (
          <ImagePlaceholder aspectRatio='aspect-[2/3]' />
        )}
        {/* 图片 */}
        {!imageFailed ? (
          <Image
            src={processImageUrl(actualPoster)}
            alt={actualTitle}
            fill
            className='object-cover transition-transform duration-500 ease-out group-hover:scale-[1.035]'
            referrerPolicy='no-referrer'
            onLoad={() => setIsLoading(true)}
            onError={() => {
              setImageFailed(true);
              setIsLoading(true);
            }}
          />
        ) : (
          <div
            aria-hidden='true'
            className='absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#e5e5ea] px-4 text-center dark:bg-[#1c1c1e]'
          >
            <span className='flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--app-accent)]/10 text-[var(--app-accent)]'>
              <Clapperboard className='h-6 w-6' strokeWidth={1.8} />
            </span>
            <span className='line-clamp-3 text-xs font-medium leading-5 text-[var(--app-muted)]'>
              {actualTitle}
            </span>
          </div>
        )}

        {/* 悬浮遮罩 */}
        <div className='absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-20 transition-opacity duration-300 group-hover:opacity-100' />

        {/* 播放按钮 */}
        {config.showPlayButton && (
          <div className='pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition-all duration-300 group-hover:opacity-100 group-focus-visible:opacity-100'>
            <span className='flex h-11 w-11 translate-y-2 items-center justify-center rounded-full border border-white/40 bg-black/45 text-white shadow-xl backdrop-blur-md transition-transform duration-300 group-hover:translate-y-0'>
              <Play className='ml-0.5 h-5 w-5 fill-current' />
            </span>
          </div>
        )}

        {/* 操作按钮 */}
        {(config.showHeart || config.showCheckCircle) && (
          <div className='absolute bottom-2 right-2 flex translate-y-0 gap-1.5 opacity-100 transition-all duration-300 sm:translate-y-2 sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100 sm:group-focus-within:translate-y-0 sm:group-focus-within:opacity-100'>
            {config.showCheckCircle && (
              <button
                type='button'
                onClick={handleDeleteRecord}
                className='apple-pressable flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-black/50 text-white backdrop-blur-md transition-colors hover:bg-white hover:text-[#1d1d1f]'
                aria-label={`删除 ${actualTitle} 的观看记录`}
                title='删除观看记录'
              >
                <Trash2 className='h-3.5 w-3.5' />
              </button>
            )}
            {config.showHeart && (
              <button
                type='button'
                onClick={handleToggleFavorite}
                className={`apple-pressable flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-black/50 text-white backdrop-blur-md transition-colors hover:bg-white hover:text-[var(--app-accent)] ${
                  favorited ? 'text-[var(--app-accent-strong)]' : 'text-white'
                }`}
                aria-label={
                  favorited ? `取消收藏 ${actualTitle}` : `收藏 ${actualTitle}`
                }
                title={favorited ? '取消收藏' : '收藏'}
              >
                <Heart
                  className={`h-3.5 w-3.5 ${favorited ? 'fill-current' : ''}`}
                />
              </button>
            )}
          </div>
        )}

        {/* 徽章 */}
        {config.showRating && rate && (
          <div className='absolute right-2 top-2 flex h-7 items-center gap-1 rounded-full bg-black/65 px-2 text-[11px] font-semibold text-white shadow-md backdrop-blur-md'>
            <Star className='h-3 w-3 fill-[var(--app-rating)] text-[var(--app-rating)]' />
            <span>{rate}</span>
          </div>
        )}

        {actualEpisodes && actualEpisodes > 1 && (
          <div className='absolute right-2 top-2 rounded-full bg-black/65 px-2 py-1.5 text-[10px] font-semibold text-white shadow-md backdrop-blur-md'>
            {currentEpisode
              ? `${currentEpisode}/${actualEpisodes}`
              : `${actualEpisodes} 集`}
          </div>
        )}

        {/* 豆瓣链接 */}
        {config.showDoubanLink && actualDoubanId && actualDoubanId !== 0 && (
          <a
            href={`https://movie.douban.com/subject/${actualDoubanId.toString()}`}
            target='_blank'
            rel='noopener noreferrer'
            onClick={(e) => e.stopPropagation()}
            className='apple-pressable absolute left-2 top-2 hidden h-8 w-8 -translate-x-2 items-center justify-center rounded-full border border-white/20 bg-black/50 text-white opacity-0 backdrop-blur-md transition-all hover:bg-white hover:text-[#1d1d1f] sm:flex sm:group-hover:translate-x-0 sm:group-hover:opacity-100 sm:group-focus-within:translate-x-0 sm:group-focus-within:opacity-100'
            aria-label={`在豆瓣查看 ${actualTitle}`}
            title='豆瓣详情'
          >
            <ExternalLink className='h-3.5 w-3.5' />
          </a>
        )}

        {config.showProgress && progress !== undefined && (
          <div className='absolute inset-x-0 bottom-0 h-1 bg-white/25'>
            <div
              className='h-full bg-[var(--app-positive)] transition-[width] duration-500 ease-out'
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        )}
      </div>

      {/* 标题与来源 */}
      <div className='mt-2.5 min-w-0 text-left'>
        <div className='relative min-w-0'>
          <span
            className='block truncate text-[13px] font-semibold tracking-[-0.005em] text-[var(--app-ink)] transition-colors duration-200 group-hover:text-[var(--app-accent-strong)] sm:text-sm'
            title={actualTitle}
          >
            {actualTitle}
          </span>
        </div>
        {(actualYear || (config.showSourceName && source_name)) && (
          <div className='mt-1.5 flex min-w-0 items-center gap-1.5 text-[11px] text-[var(--app-muted)]'>
            {actualYear && <span className='shrink-0'>{actualYear}</span>}
            {actualYear && config.showSourceName && source_name && (
              <span className='h-0.5 w-0.5 shrink-0 rounded-full bg-current opacity-60' />
            )}
            {config.showSourceName && source_name && (
              <span className='truncate'>{source_name}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
