import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getAllCategories, getQuizByModule } from '@/lib/quiz-service';
import type { Category } from '@/lib/types';
import QuizCard from '@/components/Quiz/QuizCard';
import Navigation from '@/components/Layout/Navigation';

export const revalidate = 3600;

interface PageProps {
  params: {
    slug: string;
  };
}

function normalizeSlug(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

function findCategoryBySlug(categories: Category[], slugParam: string) {
  const decoded = decodeURIComponent(slugParam || '');
  const exact = categories.find((c) => c.slug === decoded);
  if (exact) return exact;
  const normalized = normalizeSlug(decoded);
  const bySlug = categories.find((c) => normalizeSlug(c.slug) === normalized);
  if (bySlug) return bySlug;
  const byName = categories.find((c) => normalizeSlug(c.name) === normalized || c.name.toLowerCase() === decoded.toLowerCase());
  return byName ?? null;
}

// Toujours [] pour éviter des centaines de pages au build → épuisement du pool PostgreSQL (Hostinger/Supabase)
export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const categories = await getAllCategories();
  const category = findCategoryBySlug(categories, params.slug);

  if (!category) {
    return {
      title: 'Category Not Found',
    };
  }

  return {
    title: `${category.name} Quizzes`,
    description: `Discover all our quizzes on the topic of ${category.name}`,
  };
}

export default async function CategoryPage({ params }: PageProps) {
  const categories = await getAllCategories();
  const category = findCategoryBySlug(categories, params.slug);

  if (!category) {
    notFound();
  }

  const quizs = await getQuizByModule(category.slug);

  return (
    <div className="min-h-screen bg-[#fdfbf7]">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-12">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-[#3f7267]">Category</p>
          <h1 className="font-display mb-4 text-4xl font-semibold text-[#2c3c5e] md:text-5xl">
            {category.name} Quizzes
          </h1>
          {category.description && (
            <p className="mb-4 max-w-3xl text-lg leading-relaxed text-[#6b7180]">{category.description}</p>
          )}
          <p className="text-base text-[#6b7180]">
            {quizs.length} quiz{quizs.length !== 1 ? 'zes' : ''} available
          </p>
        </div>

        {quizs.length > 0 ? (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {quizs.map((quiz, index) => (
              <QuizCard key={quiz.id} quiz={quiz} index={index} />
            ))}
          </div>
        ) : (
          <div className="rounded-[10px] border border-[#eae2d2] bg-white py-16 text-center">
            <p className="text-lg text-[#6b7180]">
              No quizzes available in this category at the moment.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
