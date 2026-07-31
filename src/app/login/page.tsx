'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { login } from '@/lib/auth-client';
import { SITE_NAME } from '@/lib/constants';
import Logo from '@/components/Layout/Logo';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#fdfbf7] px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mb-6 flex justify-center">
            <Logo size="lg" />
          </div>
          <h1 className="font-display mt-6 text-3xl font-semibold text-[#2c3c5e]">Welcome Back</h1>
          <p className="mt-2 text-[#6b7180]">Sign in to continue to {SITE_NAME}</p>
        </div>

        <div className="rounded-[10px] border border-[#eae2d2] bg-white p-8 shadow-[0_2px_10px_rgba(44,60,94,0.04)]">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-semibold text-[#2c3c5e]">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-md border border-[#eae2d2] px-4 py-3 outline-none transition focus:border-[#2c3c5e] focus:ring-1 focus:ring-[#2c3c5e]"
                placeholder="your.email@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-semibold text-[#2c3c5e]">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-md border border-[#eae2d2] px-4 py-3 outline-none transition focus:border-[#2c3c5e] focus:ring-1 focus:ring-[#2c3c5e]"
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-[#2c3c5e] py-3.5 font-semibold text-white transition hover:bg-[#1d2a45] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center text-[#6b7180]">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="font-semibold text-[#2c3c5e] hover:underline">
              Sign up
            </Link>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link href="/" className="text-sm text-[#6b7180] hover:text-[#2c3c5e]">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
