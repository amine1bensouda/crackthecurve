'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth-client';
import Logo from '@/components/Layout/Logo';

const links = [
  ['/', 'Home'],
  ['/quiz', 'Exams'],
  ['/about-us', 'About us'],
  ['/blogs', 'Blogs'],
] as const;

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const pathname = usePathname();

  useEffect(() => {
    getCurrentUser().then(setUser);
  }, [pathname]);

  const isActive = (path: string) =>
    path === '/' ? pathname === '/' : pathname === path || pathname?.startsWith(`${path}/`);

  return (
    <header className="sticky top-0 z-50 border-b border-[#eae2d2] bg-[#fdfbf7]">
      <div className="mx-auto flex max-w-[1160px] items-center justify-between px-6 py-[18px]">
        <Logo size="md" />

        <nav className="hidden items-center gap-[30px] md:flex">
          {links.map(([href, label]) => (
            <Link
              key={href}
              href={href}
              className={`text-[0.95rem] font-medium transition ${
                isActive(href) ? 'text-[#2c3c5e]' : 'text-[#6b7180] hover:text-[#2c3c5e]'
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3.5 text-[0.95rem] md:flex">
          {user ? (
            <Link
              href="/dashboard"
              className="rounded-md bg-[#2c3c5e] px-[26px] py-[13px] font-semibold text-white transition hover:bg-[#1d2a45]"
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link href="/login" className="font-medium text-[#2c3c5e]">
                Login
              </Link>
              <Link
                href="/register"
                className="rounded-md bg-[#2c3c5e] px-[26px] py-[13px] font-semibold text-white transition hover:bg-[#1d2a45]"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          className="rounded-md border border-[#eae2d2] p-2 text-[#2c3c5e] md:hidden"
          aria-label="Toggle navigation menu"
          aria-expanded={menuOpen}
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d={menuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
            />
          </svg>
        </button>
      </div>

      {menuOpen && (
        <nav className="border-t border-[#eae2d2] bg-[#fdfbf7] px-6 py-4 md:hidden">
          <div className="mx-auto flex max-w-[1160px] flex-col">
            {links.map(([href, label]) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMenuOpen(false)}
                className="border-b border-[#eae2d2]/70 py-3 text-sm font-medium text-[#2c3c5e]"
              >
                {label}
              </Link>
            ))}
            <div className="flex items-center gap-3 pt-4">
              {user ? (
                <Link
                  href="/dashboard"
                  className="rounded-md bg-[#2c3c5e] px-5 py-2.5 text-sm font-semibold text-white"
                >
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="rounded-md border border-[#eae2d2] px-5 py-2.5 text-sm font-semibold text-[#2c3c5e]"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="rounded-md bg-[#2c3c5e] px-5 py-2.5 text-sm font-semibold text-white"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}
