'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  Menu,
  X,
  LayoutDashboard,
  Users,
  FileText,
  BarChart3,
  Settings,
  LogOut,
} from 'lucide-react';

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const menuItems = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Leads', href: '/leads', icon: Users },
    { label: 'Psychometric Test', href: '/psychometric', icon: FileText },
    { label: 'Google Analytics', href: '/analytics', icon: BarChart3 },
    { label: 'AI Chatbot', href: '/chatbot', icon: FileText },
    { label: 'Career Guidance', href: '/career', icon: Settings },
    { label: 'School Activities', href: '/activities', icon: FileText },
    { label: 'Contact', href: '/contact', icon: Users },
    { label: 'Enquiry', href: '/enquiry', icon: FileText },
    { label: 'Profile', href: '/profile', icon: Settings },
  ];

  const isActive = (href) => pathname === href;

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    router.push('/login');
  };

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-primary text-white rounded-lg"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed md:static top-0 left-0 h-screen w-64 bg-primary text-white shadow-lg transform transition-transform duration-300 z-40 ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Logo */}
        <div className="p-6 flex items-center gap-3 border-b border-blue-900">
          <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center font-bold text-white">
            QM
          </div>
          <div>
            <h1 className="font-bold text-sm">QMIS</h1>
            <p className="text-xs text-gray-300">Portal</p>
          </div>
        </div>

        {/* Menu */}
        <nav className="mt-6 px-4 space-y-2 flex-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive(item.href)
                    ? 'bg-accent text-white'
                    : 'text-gray-200 hover:bg-blue-800'
                }`}
              >
                <Icon size={20} />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-blue-900 p-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-gray-200 hover:bg-red-600 transition-colors"
          >
            <LogOut size={20} />
            <span className="text-sm">Logout</span>
          </button>
        </div>
      </aside>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 md:hidden z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
