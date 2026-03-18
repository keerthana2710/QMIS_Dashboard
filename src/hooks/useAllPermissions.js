'use client';

import { useState, useEffect } from 'react';
import { SUPER_ADMIN_ROLE } from '@/config/pages';

/**
 * Loads the full permissions map for the current user.
 * Fetches fresh from the API on every mount (no cache).
 *
 * Returns:
 *   { permsMap: 'FULL_ACCESS' | { [pageKey]: { canRead, canWrite, canDelete } }, loading: boolean }
 */
export function useAllPermissions() {
  const [state, setState] = useState({ permsMap: null, loading: true });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null;

        if (!userStr) {
          if (!cancelled) setState({ permsMap: {}, loading: false });
          return;
        }

        const role = JSON.parse(userStr)?.role ?? null;

        if (role === SUPER_ADMIN_ROLE) {
          if (!cancelled) setState({ permsMap: 'FULL_ACCESS', loading: false });
          return;
        }

        if (!role) {
          if (!cancelled) setState({ permsMap: {}, loading: false });
          return;
        }

        const token = localStorage.getItem('authToken') ?? '';
        const res   = await fetch(`/api/permissions?role=${encodeURIComponent(role)}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data  = await res.json();
        const perms = data.permissions ?? [];

        const permsMap = Array.isArray(perms)
          ? perms.reduce((acc, row) => {
              acc[row.page] = {
                canRead:   row.can_read,
                canWrite:  row.can_write,
                canDelete: row.can_delete,
              };
              return acc;
            }, {})
          : {};

        if (!cancelled) setState({ permsMap, loading: false });
      } catch {
        if (!cancelled) setState({ permsMap: {}, loading: false });
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  return state;
}
