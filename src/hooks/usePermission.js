'use client';

import { useState, useEffect } from 'react';
import { SUPER_ADMIN_ROLE } from '@/config/pages';

/**
 * Self-contained permission hook — does NOT require PermissionProvider.
 * Reads the current user's role from localStorage, fetches permissions
 * from the API on every mount (no cache), and returns per-page flags.
 *
 * Usage:
 *   const { canRead, canWrite, canDelete, isFullAccess, loading } = usePermission('leads');
 *
 * @param {string} page - page key from /config/pages.js (e.g. 'leads', 'activities')
 */
export function usePermission(page) {
  const [state, setState] = useState({
    canRead:      false,
    canWrite:     false,
    canDelete:    false,
    isFullAccess: false,
    loading:      true,
  });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null;

        if (!userStr) {
          if (!cancelled) setState({ canRead: false, canWrite: false, canDelete: false, isFullAccess: false, loading: false });
          return;
        }

        const role = JSON.parse(userStr)?.role ?? null;

        // SUPER_ADMIN — always full access, no API call needed
        if (role === SUPER_ADMIN_ROLE) {
          if (!cancelled) setState({ canRead: true, canWrite: true, canDelete: true, isFullAccess: true, loading: false });
          return;
        }

        if (!role) {
          if (!cancelled) setState({ canRead: false, canWrite: false, canDelete: false, isFullAccess: false, loading: false });
          return;
        }

        const token = localStorage.getItem('authToken') ?? '';
        const res   = await fetch(`/api/permissions?role=${encodeURIComponent(role)}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data  = await res.json();
        const perms = data.permissions ?? [];

        const row = Array.isArray(perms) ? perms.find((p) => p.page === page) : null;

        if (!cancelled) {
          setState({
            canRead:      row?.can_read   ?? false,
            canWrite:     row?.can_write  ?? false,
            canDelete:    row?.can_delete ?? false,
            isFullAccess: false,
            loading:      false,
          });
        }
      } catch {
        if (!cancelled) setState({ canRead: false, canWrite: false, canDelete: false, isFullAccess: false, loading: false });
      }
    }

    load();
    return () => { cancelled = true; };
  }, [page]);

  return state;
}
