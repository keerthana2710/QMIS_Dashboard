'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function VerifyOtpPage() {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleVerify = async (e) => {
    e.preventDefault();

    if (otp.length !== 6) {
      toast.error('OTP must be 6 digits');
      return;
    }

    try {
      setLoading(true);

      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          otp,
          userId: sessionStorage.getItem('otpUserId'),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Invalid OTP');
        return;
      }

      localStorage.setItem('authToken', data.token);

      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('loginTime', Date.now().toString());

      toast.success('Login successful');

      sessionStorage.removeItem('otpUserId');

      router.push('/dashboard');
    } catch (err) {
      console.error(err);
      toast.error('Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-blue-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="flex justify-center mb-8">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-2xl">
              QM
            </div>
          </div>

          <h1 className="text-3xl font-bold text-center text-primary mb-2">
            Verify OTP
          </h1>
          <p className="text-center text-gray-500 mb-8">
            Enter the 6-digit OTP sent to admin
          </p>

          <form onSubmit={handleVerify} className="space-y-5">

            {/* OTP */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                OTP Code
              </label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                className="w-full text-center tracking-widest text-xl px-4 py-3 rounded-lg border-2 border-gray-200 focus:outline-none focus:border-primary transition-colors"
                required
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-primary to-blue-700 text-white font-bold py-3 rounded-lg transition-all duration-300 disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Verify'}
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
