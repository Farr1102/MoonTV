'use client';

import { useEffect, useState } from 'react';

let cachedAdminAccess: boolean | undefined;
let adminAccessRequest: Promise<boolean> | null = null;

async function fetchAdminAccess(): Promise<boolean> {
  if (typeof cachedAdminAccess === 'boolean') return cachedAdminAccess;

  if (!adminAccessRequest) {
    adminAccessRequest = fetch('/api/admin/access', { cache: 'no-store' })
      .then(async (response) => {
        if (!response.ok) return false;
        const data = (await response.json()) as { isAdmin?: boolean };
        return data.isAdmin === true;
      })
      .catch(() => false)
      .then((isAdmin) => {
        cachedAdminAccess = isAdmin;
        return isAdmin;
      });
  }

  return adminAccessRequest;
}

export function useAdminAccess(): boolean {
  const [isAdmin, setIsAdmin] = useState(cachedAdminAccess ?? false);

  useEffect(() => {
    let active = true;
    void fetchAdminAccess().then((allowed) => {
      if (active) setIsAdmin(allowed);
    });
    return () => {
      active = false;
    };
  }, []);

  return isAdmin;
}
