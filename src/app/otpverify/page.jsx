'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = (e) => {
    e.preventDefault();
    if (email && password) {
      localStorage.setItem('authToken', 'demo_token');
      router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-blue-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-2xl">
              QM
            </div>
          </div>

          <h1 className="text-3xl font-bold text-center text-primary mb-2">
            QMIS Portal
          </h1>
          <p className="text-center text-gray-500 mb-8">
            Happy Schooling Management System
          </p>

          <form onSubmit={handleLogin} className="space-y-5">
           
            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter Your 6 Digit Whatsapp OTP code
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:outline-none focus:border-primary transition-colors"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-500 hover:text-primary transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            

            {/* Submit */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-primary to-blue-700 hover:from-blue-700 hover:to-primary text-white font-bold py-3 rounded-lg transition-all duration-300 transform hover:scale-105 active:scale-95"
            >
             Verify
            </button>
          </form>
        </div>

        <p className="text-center text-gray-300 text-xs mt-8">
          © 2026 Happy Schooling. All rights reserved.
        </p>
      </div>
    </div>
  );
}
