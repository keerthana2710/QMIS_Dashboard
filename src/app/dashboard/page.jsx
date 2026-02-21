'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import Dashboard from '@/components/Dashboard';

export default function DashboardPage() {
  const router = useRouter();

  // Authentication is handled by PageLayout component

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="flex-1 flex flex-col ml-0 md:ml-0 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto">
          <div className="p-4 md:p-8">
            <Dashboard />
          </div>
        </main>
      </div>
    </div>
  );
}
