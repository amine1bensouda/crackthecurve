'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { register } from '@/lib/auth-client';
import { SITE_NAME } from '@/lib/constants';
import Logo from '@/components/Layout/Logo';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      await register(email, password, name);
      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
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
          <h1 className="font-display mt-6 text-3xl font-semibold text-[#2c3c5e]">Create Account</h1>
          <p className="mt-2 text-[#6b7180]">Join {SITE_NAME} and start preparing for your license</p>
        </div>

        <div className="rounded-[10px] border border-[#eae2d2] bg-white p-8 shadow-[0_2px_10px_rgba(44,60,94,0.04)]">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="name" className="mb-2 block text-sm font-semibold text-[#2c3c5e]">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full rounded-md border border-[#eae2d2] px-4 py-3 outline-none transition focus:border-[#2c3c5e] focus:ring-1 focus:ring-[#2c3c5e]"
                placeholder="John Doe"
              />
            </div>

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
                minLength={6}
                className="w-full rounded-md border border-[#eae2d2] px-4 py-3 outline-none transition focus:border-[#2c3c5e] focus:ring-1 focus:ring-[#2c3c5e]"
                placeholder="At least 6 characters"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="mb-2 block text-sm font-semibold text-[#2c3c5e]">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                className="w-full rounded-md border border-[#eae2d2] px-4 py-3 outline-none transition focus:border-[#2c3c5e] focus:ring-1 focus:ring-[#2c3c5e]"
                placeholder="Confirm your password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-[#2c3c5e] py-3.5 font-semibold text-white transition hover:bg-[#1d2a45] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center text-[#6b7180]">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-[#2c3c5e] hover:underline">
              Sign in
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
