import { getAllCategories } from '@/lib/wordpress';
import Link from 'next/link';
import type { Category } from '@/lib/types';

interface SidebarProps {
  categories?: Category[];
}

export default function Sidebar({ categories = [] }: SidebarProps) {
  return (
    <aside className="w-full flex-shrink-0 md:w-64">
      <div className="space-y-6">
        {/* Categories */}
        {categories.length > 0 && (
          <div className="rounded-[10px] border border-[#eae2d2] bg-white p-6 shadow-[0_2px_10px_rgba(44,60,94,0.04)]">
            <h3 className="font-display mb-4 text-lg font-semibold text-[#2c3c5e]">Categories</h3>
            <ul className="space-y-2">
              {categories.map((category) => (
                <li key={category.id}>
                  <Link
                    href={`/categorie/${category.slug}`}
                    className="flex items-center justify-between py-2 text-[#6b7180] transition-colors hover:text-[#2c3c5e]"
                  >
                    <span>{category.name}</span>
                    <span className="rounded-md bg-[#f8f2e7] px-2 py-1 text-sm text-[#6b7180]">
                      {category.count}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </aside>
  );
}
