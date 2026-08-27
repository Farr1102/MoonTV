import { NextRequest } from 'next/server';

export interface AuthInfo {
  password?: string;
  username?: string;
  signature?: string;
  timestamp?: number;
  role?: 'owner' | 'admin' | 'user';
}

export function parseAuthCookieValue(value?: string): AuthInfo | null {
  if (!value) return null;

  try {
    let decoded = value;
    for (let attempt = 0; attempt < 2; attempt += 1) {
      if (!decoded.includes('%')) break;
      decoded = decodeURIComponent(decoded);
    }
    return JSON.parse(decoded) as AuthInfo;
  } catch (error) {
    return null;
  }
}

// 从cookie获取认证信息 (服务端使用)
export function getAuthInfoFromCookie(request: NextRequest): AuthInfo | null {
  const authCookie = request.cookies.get('auth');
  return parseAuthCookieValue(authCookie?.value);
}

// 从cookie获取认证信息 (客户端使用)
export function getAuthInfoFromBrowserCookie(): AuthInfo | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    // 解析 document.cookie
    const cookies = document.cookie.split(';').reduce((acc, cookie) => {
      const trimmed = cookie.trim();
      const firstEqualIndex = trimmed.indexOf('=');

      if (firstEqualIndex > 0) {
        const key = trimmed.substring(0, firstEqualIndex);
        const value = trimmed.substring(firstEqualIndex + 1);
        if (key && value) {
          acc[key] = value;
        }
      }

      return acc;
    }, {} as Record<string, string>);

    const authCookie = cookies['auth'];
    if (!authCookie) {
      return null;
    }

    return parseAuthCookieValue(authCookie);
  } catch (error) {
    return null;
  }
}
