import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { getAdminRole } from '@/lib/admin-auth';
import { parseAuthCookieValue } from '@/lib/auth';

import AdultPageClient from './AdultPageClient';

export const dynamic = 'force-dynamic';

export default async function AdultPage() {
  const authInfo = parseAuthCookieValue(cookies().get('auth')?.value);
  const role = await getAdminRole(authInfo);

  if (!role) redirect('/');

  return <AdultPageClient />;
}
