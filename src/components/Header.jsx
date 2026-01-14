'use client';

import React from 'react';
import { Bell, Search, User } from 'lucide-react';

export default function Header() {
  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-20">
      <div className="px-6 py-4 flex items-center justify-between">
        <div className="hidden md:flex items-center gap-4 flex-1">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
            <Bell size={20} />
          </button>
          <button className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
            <User size={20} />
          </button>
        </div>
      </div>
    </header>
  );
}
