import { AuthInfo } from '@/lib/auth';
import { getConfig } from '@/lib/config';

export type AdminRole = 'owner' | 'admin';

export async function getAdminRole(
  authInfo: AuthInfo | null
): Promise<AdminRole | null> {
  if (!authInfo) return null;

  const storageType = process.env.NEXT_PUBLIC_STORAGE_TYPE || 'localstorage';

  // 单用户本地模式下，持有站点密码的用户就是站点所有者。
  if (storageType === 'localstorage') {
    return authInfo.password && authInfo.password === process.env.PASSWORD
      ? 'owner'
      : null;
  }

  if (!authInfo.username) return null;
  if (authInfo.username === process.env.USERNAME) return 'owner';

  const config = await getConfig();
  const user = config.UserConfig.Users.find(
    (entry) => entry.username === authInfo.username
  );

  return user?.role === 'admin' && !user.banned ? 'admin' : null;
}
