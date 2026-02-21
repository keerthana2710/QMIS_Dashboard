'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';

export default function PageLayout({ children, title }) {
  const router = useRouter();

  useEffect(() => {
    const auth = localStorage.getItem('authToken');
    const loginTime = localStorage.getItem('loginTime');
    const ONE_DAY_MS = 24 * 60 * 60 * 1000;

    const logout = () => {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      localStorage.removeItem('loginTime');
      router.push('/login');
    };

    if (!auth) {
      logout();
      return;
    }

    if (loginTime) {
      const timeElapsed = Date.now() - parseInt(loginTime);
      if (timeElapsed > ONE_DAY_MS) {
        logout();
        return;
      }
    } else {
      // If no loginTime exists but authToken does, set it now to start the clock
      // or logout to be safe. Let's start the clock for existing sessions.
      localStorage.setItem('loginTime', Date.now().toString());
    }
  }, [router]);

  return (
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
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
