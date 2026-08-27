import { NextRequest, NextResponse } from 'next/server';

import { getAdminRole } from '@/lib/admin-auth';
import { getAuthInfoFromCookie } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const role = await getAdminRole(getAuthInfoFromCookie(request));

  return NextResponse.json(
    { isAdmin: role !== null, role },
    { headers: { 'Cache-Control': 'private, no-store' } }
  );
}
