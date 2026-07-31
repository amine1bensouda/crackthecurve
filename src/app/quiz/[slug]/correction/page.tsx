import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getQuizBySlug } from '@/lib/wordpress';
import QuizCorrection from '@/components/Quiz/QuizCorrection';
import { SITE_NAME, SITE_URL } from '@/lib/constants';
import { stripHtml } from '@/lib/utils';

export const revalidate = 3600; // Revalider toutes les heures

interface PageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const quiz = await getQuizBySlug(params.slug);

  if (!quiz) {
    return {
      title: 'Quiz Not Found',
    };
  }

  const title = stripHtml(quiz.title.rendered);
  const description = `Correction du quiz: ${title}`;

  return {
    title: `Correction - ${title}`,
    description,
    openGraph: {
      title: `Correction - ${title}`,
      description,
      type: 'article',
      url: `${SITE_URL}/quiz/${params.slug}/correction`,
    },
  };
}

export default async function QuizCorrectionPage({ params }: PageProps) {
  const quiz = await getQuizBySlug(params.slug);

  if (!quiz) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#fdfbf7]">
      <div className="mx-auto max-w-[1160px] px-6 py-8 md:py-12">
        <div className="mb-8">
          <h1 className="font-display mb-2 text-3xl font-semibold text-[#2c3c5e] md:text-4xl">
            Quiz Correction
          </h1>
          <p className="text-lg text-[#6b7180]">
            {stripHtml(quiz.title.rendered)}
          </p>
        </div>

        <QuizCorrection quiz={quiz} />
      </div>
    </div>
  );
}
