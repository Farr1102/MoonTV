import { NextRequest, NextResponse } from 'next/server';

import { getAdminRole } from '@/lib/admin-auth';
import { ADULT_API_SITES } from '@/lib/adult';
import { getAuthInfoFromCookie } from '@/lib/auth';
import { searchFromApi } from '@/lib/downstream';
import { SearchResult } from '@/lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_RESULTS = 72;

function resultKey(result: SearchResult): string {
  return `${result.title.replace(/\s+/g, '').toLocaleLowerCase()}-${
    result.year || 'unknown'
  }`;
}

export async function GET(request: NextRequest) {
  const role = await getAdminRole(getAuthInfoFromCookie(request));
  if (!role) {
    return NextResponse.json({ error: '无权访问' }, { status: 403 });
  }

  const query = request.nextUrl.searchParams.get('q')?.trim();
  if (!query) {
    return NextResponse.json({ error: '请输入搜索内容' }, { status: 400 });
  }
  if (query.length > 40) {
    return NextResponse.json({ error: '搜索内容过长' }, { status: 400 });
  }

  const sourceResults = await Promise.all(
    ADULT_API_SITES.map((site) => searchFromApi(site, query, 1))
  );
  const availableSources = sourceResults.filter(
    (results) => results.length > 0
  ).length;

  const seen = new Set<string>();
  const results = sourceResults
    .flat()
    .filter((result) => {
      const key = resultKey(result);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => {
      const yearDiff = Number(b.year) - Number(a.year);
      return Number.isNaN(yearDiff) || yearDiff === 0
        ? a.title.localeCompare(b.title)
        : yearDiff;
    })
    .slice(0, MAX_RESULTS);

  return NextResponse.json(
    { results, availableSources },
    { headers: { 'Cache-Control': 'private, no-store' } }
  );
}
