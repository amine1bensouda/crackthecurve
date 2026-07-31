import Link from 'next/link';
import { getAllCategories } from '@/lib/quiz-service';
import Navigation from '@/components/Layout/Navigation';
import { SITE_NAME } from '@/lib/constants';

export const dynamic = 'force-dynamic';
export const revalidate = 3600;

export const metadata = {
  title: 'Categories',
  description: `Browse quiz categories on ${SITE_NAME}`,
};

export default async function CategoriesListPage() {
  let categories: { slug: string; name: string; description?: string }[] = [];
  try {
    categories = await getAllCategories();
  } catch (error) {
    console.warn('Erreur lors de la récupération des catégories:', error);
  }

  return (
    <div className="min-h-screen bg-[#fdfbf7]">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-12">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-[#3f7267]">Categories</p>
          <h1 className="font-display mb-4 text-4xl font-semibold text-[#2c3c5e] md:text-5xl">
            Quiz Categories
          </h1>
          <p className="max-w-3xl text-lg text-[#6b7180]">
            Choose a category to explore quizzes
          </p>
        </div>

        {categories.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <Link
                key={category.slug}
                href={`/categorie/${category.slug}`}
                className="block rounded-[10px] border border-[#eae2d2] bg-white p-6 transition hover:border-[#3f7267]/40 hover:shadow-[0_2px_10px_rgba(44,60,94,0.06)]"
              >
                <h2 className="font-display mb-2 text-xl font-semibold text-[#2c3c5e]">{category.name}</h2>
                {category.description && (
                  <p className="line-clamp-2 text-sm text-[#6b7180]">{category.description}</p>
                )}
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-[10px] border border-[#eae2d2] bg-[#f8f2e7] py-16 text-center">
            <p className="text-[#6b7180]">No categories available at the moment.</p>
          </div>
        )}
      </div>
    </div>
  );
}
