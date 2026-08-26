/* eslint-disable no-console */
'use client';

import { History, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

import type { PlayRecord } from '@/lib/db.client';
import {
  clearAllPlayRecords,
  getAllPlayRecords,
  subscribeToDataUpdates,
} from '@/lib/db.client';

import ScrollableRow from '@/components/ScrollableRow';
import VideoCard from '@/components/VideoCard';

interface ContinueWatchingProps {
  className?: string;
}

export default function ContinueWatching({ className }: ContinueWatchingProps) {
  const [playRecords, setPlayRecords] = useState<
    (PlayRecord & { key: string })[]
  >([]);
  const [loading, setLoading] = useState(true);

  // 处理播放记录数据更新的函数
  const updatePlayRecords = (allRecords: Record<string, PlayRecord>) => {
    // 将记录转换为数组并根据 save_time 由近到远排序
    const recordsArray = Object.entries(allRecords).map(([key, record]) => ({
      ...record,
      key,
    }));

    // 按 save_time 降序排序（最新的在前面）
    const sortedRecords = recordsArray.sort(
      (a, b) => b.save_time - a.save_time
    );

    setPlayRecords(sortedRecords);
  };

  useEffect(() => {
    const fetchPlayRecords = async () => {
      try {
        setLoading(true);

        // 从缓存或API获取所有播放记录
        const allRecords = await getAllPlayRecords();
        updatePlayRecords(allRecords);
      } catch (error) {
        console.error('获取播放记录失败:', error);
        setPlayRecords([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPlayRecords();

    // 监听播放记录更新事件
    const unsubscribe = subscribeToDataUpdates(
      'playRecordsUpdated',
      (newRecords: Record<string, PlayRecord>) => {
        updatePlayRecords(newRecords);
      }
    );

    return unsubscribe;
  }, []);

  // 如果没有播放记录，则不渲染组件
  if (!loading && playRecords.length === 0) {
    return null;
  }

  // 计算播放进度百分比
  const getProgress = (record: PlayRecord) => {
    if (record.total_time === 0) return 0;
    return (record.play_time / record.total_time) * 100;
  };

  // 从 key 中解析 source 和 id
  const parseKey = (key: string) => {
    const [source, id] = key.split('+');
    return { source, id };
  };

  return (
    <section className={`mb-4 sm:mb-6 ${className || ''}`}>
      <div className='mb-4 flex min-h-9 items-center justify-between gap-3 sm:mb-5'>
        <div className='flex min-w-0 items-center gap-2.5'>
          <span className='hidden h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--app-accent)]/10 text-[var(--app-accent)]'>
            <History className='h-4 w-4' strokeWidth={2.2} />
          </span>
          <h2 className='truncate text-[21px] font-semibold tracking-[-0.015em] text-[var(--app-ink)]'>
            继续观看
          </h2>
        </div>
        {!loading && playRecords.length > 0 && (
          <button
            className='apple-pressable flex h-9 items-center gap-1.5 rounded-full px-2.5 text-xs font-medium text-[var(--app-muted)] transition-colors hover:bg-black/[0.05] hover:text-[var(--app-ink)] dark:hover:bg-white/[0.06]'
            onClick={async () => {
              await clearAllPlayRecords();
              setPlayRecords([]);
            }}
          >
            <Trash2 className='h-3.5 w-3.5' />
            清空
          </button>
        )}
      </div>
      <ScrollableRow>
        {loading
          ? // 加载状态显示灰色占位数据
            Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className='w-[112px] min-w-[112px] snap-start sm:w-40 sm:min-w-[160px] xl:w-[172px] xl:min-w-[172px]'
              >
                <div className='relative aspect-[2/3] w-full animate-pulse overflow-hidden rounded-lg border border-black/[0.04] bg-black/[0.08] dark:border-white/[0.04] dark:bg-white/[0.08]' />
                <div className='mt-3 h-3 w-4/5 animate-pulse rounded bg-black/[0.08] dark:bg-white/[0.08]' />
                <div className='mt-2 h-2.5 w-1/3 animate-pulse rounded bg-black/[0.06] dark:bg-white/[0.06]' />
              </div>
            ))
          : // 显示真实数据
            playRecords.map((record) => {
              const { source, id } = parseKey(record.key);
              return (
                <div
                  key={record.key}
                  className='w-[112px] min-w-[112px] snap-start sm:w-40 sm:min-w-[160px] xl:w-[172px] xl:min-w-[172px]'
                >
                  <VideoCard
                    id={id}
                    title={record.title}
                    poster={record.cover}
                    year={record.year}
                    source={source}
                    source_name={record.source_name}
                    progress={getProgress(record)}
                    episodes={record.total_episodes}
                    currentEpisode={record.index}
                    query={record.search_title}
                    from='playrecord'
                    onDelete={() =>
                      setPlayRecords((prev) =>
                        prev.filter((r) => r.key !== record.key)
                      )
                    }
                    type={record.total_episodes > 1 ? 'tv' : ''}
                  />
                </div>
              );
            })}
      </ScrollableRow>
    </section>
  );
}
