'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { SITE_NAME } from '@/lib/constants';
import { getCurrentUser } from '@/lib/auth-client';

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
    <header className="sticky top-0 z-50 border-b border-[#eae2d2] bg-[#fdfbf7]/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-[18px]">
        <Link href="/" className="font-display flex items-center gap-2.5 text-xl font-bold text-[#2c3c5e]">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-[linear-gradient(135deg,#3f7267,#2c3c5e)] font-sans text-[11px] font-bold text-white">SP</span>
          {SITE_NAME}
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map(([href, label]) => (
            <Link
              key={href}
              href={href}
              className={`text-[15px] font-medium transition ${isActive(href) ? 'text-[#2c3c5e]' : 'text-[#6b7180] hover:text-[#2c3c5e]'}`}
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-4 md:flex">
          {user ? (
            <Link href="/dashboard" className="rounded-md bg-[#2c3c5e] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1d2a45]">Dashboard</Link>
          ) : (
            <>
              <Link href="/login" className="text-sm font-semibold text-[#2c3c5e]">Login</Link>
              <Link href="/register" className="rounded-md bg-[#2c3c5e] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1d2a45]">Sign Up</Link>
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
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={menuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
          </svg>
        </button>
      </div>

      {menuOpen && (
        <nav className="border-t border-[#eae2d2] bg-[#fdfbf7] px-6 py-4 md:hidden">
          <div className="mx-auto flex max-w-6xl flex-col">
            {links.map(([href, label]) => (
              <Link key={href} href={href} onClick={() => setMenuOpen(false)} className="border-b border-[#eae2d2]/70 py-3 text-sm font-medium text-[#2c3c5e]">{label}</Link>
            ))}
            <div className="flex items-center gap-3 pt-4">
              {user ? (
                <Link href="/dashboard" className="rounded-md bg-[#2c3c5e] px-5 py-2.5 text-sm font-semibold text-white">Dashboard</Link>
              ) : (
                <>
                  <Link href="/login" className="rounded-md border border-[#d9cfbd] px-5 py-2.5 text-sm font-semibold text-[#2c3c5e]">Login</Link>
                  <Link href="/register" className="rounded-md bg-[#2c3c5e] px-5 py-2.5 text-sm font-semibold text-white">Sign Up</Link>
                </>
              )}
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}
