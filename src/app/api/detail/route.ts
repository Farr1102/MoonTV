import { NextRequest, NextResponse } from 'next/server';

import { getAdminRole } from '@/lib/admin-auth';
import { getAdultApiSite } from '@/lib/adult';
import { getAuthInfoFromCookie } from '@/lib/auth';
import { getAvailableApiSites, getCacheTime } from '@/lib/config';
import { getDetailFromApi } from '@/lib/downstream';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const id = searchParams.get('id');
  const sourceCode = searchParams.get('source');

  if (!id || !sourceCode) {
    return NextResponse.json({ error: '缺少必要参数' }, { status: 400 });
  }

  if (!/^[\w-]+$/.test(id)) {
    return NextResponse.json({ error: '无效的视频ID格式' }, { status: 400 });
  }

  try {
    const apiSites = await getAvailableApiSites();
    let apiSite = apiSites.find((site) => site.key === sourceCode);
    const adultApiSite = getAdultApiSite(sourceCode);

    if (adultApiSite) {
      const role = await getAdminRole(getAuthInfoFromCookie(request));
      if (!role) {
        return NextResponse.json({ error: '无权访问' }, { status: 403 });
      }
      apiSite = adultApiSite;
    }

    if (!apiSite) {
      return NextResponse.json({ error: '无效的API来源' }, { status: 400 });
    }

    const result = await getDetailFromApi(apiSite, id);
    const cacheTime = await getCacheTime();

    return NextResponse.json(
      result,
      adultApiSite
        ? { headers: { 'Cache-Control': 'private, no-store' } }
        : {
            headers: {
              'Cache-Control': `public, max-age=${cacheTime}, s-maxage=${cacheTime}`,
              'CDN-Cache-Control': `public, s-maxage=${cacheTime}`,
              'Vercel-CDN-Cache-Control': `public, s-maxage=${cacheTime}`,
            },
          }
    );
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
