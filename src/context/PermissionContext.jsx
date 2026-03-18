'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { SUPER_ADMIN_ROLE } from '@/config/pages';

const PermissionContext = createContext(null);

/**
 * Wraps protected pages. Loads the current user's permissions fresh
 * from the API on every mount (no sessionStorage cache).
 */
export function PermissionProvider({ children }) {
  const [perms, setPerms]     = useState(null);   // array of permission rows, or 'FULL_ACCESS'
  const [role, setRole]       = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
      if (!userStr) { setLoading(false); return; }

      const user     = JSON.parse(userStr);
      const userRole = user?.role ?? null;
      setRole(userRole);

      if (userRole === SUPER_ADMIN_ROLE) {
        setPerms('FULL_ACCESS');
        setLoading(false);
        return;
      }

      if (!userRole) { setPerms([]); setLoading(false); return; }

      const token = localStorage.getItem('authToken');
      const res   = await fetch(`/api/permissions?role=${encodeURIComponent(userRole)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      const rows = data.permissions ?? [];

      setPerms(rows);
    } catch {
      setPerms([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <PermissionContext.Provider value={{ perms, role, loading }}>
      {children}
    </PermissionContext.Provider>
  );
}

export function usePermissions() {
  return useContext(PermissionContext);
}
