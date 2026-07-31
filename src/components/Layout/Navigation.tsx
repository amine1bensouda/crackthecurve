'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { Category } from '@/lib/types';

export default function Navigation() {
  const pathname = usePathname();
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then(setCategories)
      .catch(() => setCategories([]));
  }, []);

  const isActive = (path: string) => pathname === path || pathname?.startsWith(path);

  return (
    <nav className="border-b border-[#eae2d2] bg-[#fdfbf7]">
      <div className="mx-auto max-w-[1160px] px-6">
        <div className="flex items-center gap-6 overflow-x-auto">
          <Link
            href="/quiz"
            className={`whitespace-nowrap border-b-2 py-4 text-sm font-medium transition-colors ${
              isActive('/quiz')
                ? 'border-[#3f7267] text-[#2c3c5e]'
                : 'border-transparent text-[#6b7180] hover:text-[#2c3c5e]'
            }`}
          >
            All Quizzes
          </Link>

          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/categorie/${category.slug}`}
              className={`whitespace-nowrap border-b-2 py-4 text-sm font-medium transition-colors ${
                isActive(`/categorie/${category.slug}`)
                  ? 'border-[#3f7267] text-[#2c3c5e]'
                  : 'border-transparent text-[#6b7180] hover:text-[#2c3c5e]'
              }`}
            >
              {category.name} ({category.count})
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
