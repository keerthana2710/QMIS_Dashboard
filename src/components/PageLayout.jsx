'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { PermissionProvider, usePermissions } from '@/context/PermissionContext';

/**
 * Inner wrapper that can perform a permission-based redirect once the
 * context has loaded. Kept separate so it runs inside PermissionProvider.
 */
function ProtectedContent({ page, children }) {
  const router = useRouter();
  const ctx    = usePermissions();

  useEffect(() => {
    // Only enforce after permissions have loaded and a page key was given
    if (!page || !ctx || ctx.loading) return;
    if (ctx.perms === 'FULL_ACCESS') return; // SUPER_ADMIN – always allow

    const row = Array.isArray(ctx.perms)
      ? ctx.perms.find((p) => p.page === page)
      : null;

    if (!row?.can_read) {
      router.replace('/dashboard'); // redirect to safe page
    }
  }, [ctx, page, router]);

  return <>{children}</>;
}

/**
 * PageLayout wraps every protected page.
 *
 * Props:
 *   title    - heading shown at the top of the content area
 *   page     - (optional) page key from /config/pages.js
 *              When provided, users without READ permission are redirected.
 */
export default function PageLayout({ children, title, page }) {
  const router = useRouter();

  useEffect(() => {
    const auth = localStorage.getItem('authToken');

    const logout = () => {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      router.push('/login');
    };

    if (!auth) { logout(); return; }
  }, [router]);

  return (
    <PermissionProvider>
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar />
        <div className="flex-1 flex flex-col ml-0 md:ml-0 overflow-hidden">
          <Header />
          <main className="flex-1 overflow-auto">
            <div className="p-4 md:p-8">
              {title && (
                <div className="mb-6">
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{title}</h1>
                </div>
              )}
              <ProtectedContent page={page}>
                {children}
              </ProtectedContent>
            </div>
          </main>
        </div>
      </div>
    </PermissionProvider>
  );
}
