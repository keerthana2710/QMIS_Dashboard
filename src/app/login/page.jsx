'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Sun, Moon } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const { isDark, toggleTheme } = useTheme();

  const handleLogin = (e) => {
    e.preventDefault();
    if (email && password) {
      localStorage.setItem('authToken', 'demo_token');
      router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-blue-800 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <button
        onClick={toggleTheme}
        className="absolute top-4 right-4 p-2 bg-white dark:bg-gray-800 text-primary dark:text-accent rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      >
        {isDark ? <Sun size={24} /> : <Moon size={24} />}
      </button>

      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8">
          <div className="flex justify-center mb-8">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-2xl">
              QM
            </div>
          </div>

          <h1 className="text-3xl font-bold text-center text-primary dark:text-white mb-2">
            QMIS Portal
          </h1>
          <p className="text-center text-gray-500 dark:text-gray-400 mb-8">
            Happy Schooling Management System
          </p>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@qmis.com"
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:border-primary transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-500 dark:text-gray-400 hover:text-primary transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer text-gray-700 dark:text-gray-300">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-gray-300 cursor-pointer"
                />
                Remember me
              </label>
              <a href="#" className="text-accent hover:underline font-medium">
                Forgot Password?
              </a>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-primary to-blue-700 hover:from-blue-700 hover:to-primary text-white font-bold py-3 rounded-lg transition-all duration-300 transform hover:scale-105 active:scale-95"
            >
              Sign In
            </button>
          </form>

          <p className="text-center text-gray-600 dark:text-gray-400 mt-6">
            Don't have an account?{' '}
            <a href="#" className="text-accent font-medium hover:underline">
              Sign up
            </a>
          </p>
        </div>

        <p className="text-center text-gray-300 dark:text-gray-500 text-xs mt-8">
          © 2024 Happy Schooling. All rights reserved.
        </p>
      </div>
    </div>
  );
}
