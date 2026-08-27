import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { getQuizBySlug } from '@/lib/wordpress';
import QuizPlayer from '@/components/Quiz/QuizPlayer';
import CommentsSection from '@/components/Comments/CommentsSection';
import QuizSchema from '@/components/SEO/QuizSchema';
import QuizQuestionsSeoContent from '@/components/SEO/QuizQuestionsSeoContent';
import BreadcrumbSchema from '@/components/SEO/BreadcrumbSchema';
import FaqSchema from '@/components/SEO/FaqSchema';
import { SITE_URL } from '@/lib/constants';
import { stripHtml, formatDuration, difficultyToEnglish, categoryToEnglish } from '@/lib/utils';
import { sanitizeHtml } from '@/lib/sanitize-html';
import { buildQuizFaqs, buildQuizIntro } from '@/lib/seo-content';
import { resolveSeoDescription, resolveSeoTitle, buildQuizPublicTitle } from '@/lib/seo-meta';

export const revalidate = 3600; // Revalider toutes les heures

interface PageProps {
  params: {
    slug: string;
  };
}

// Toujours [] pour éviter des centaines de pages au build → épuisement du pool PostgreSQL (Hostinger/Supabase)
export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  // Décoder le slug pour gérer les espaces encodés (%20)
  const decodedSlug = decodeURIComponent(params.slug);
  
  // Essayer d'abord avec le slug décodé, puis avec le slug original
  let quiz = await getQuizBySlug(decodedSlug);
  
  if (!quiz && decodedSlug !== params.slug) {
    // Si le slug décodé ne fonctionne pas, essayer le slug original
    quiz = await getQuizBySlug(params.slug);
  }

  if (!quiz) {
    return {
      title: 'Quiz Not Found',
      robots: { index: false, follow: false },
      alternates: { canonical: `/quiz/${encodeURIComponent(params.slug)}` },
    };
  }

  const rawTitle = stripHtml(quiz.title.rendered);
  const title = buildQuizPublicTitle({
    title: rawTitle,
    category: quiz.acf?.categorie,
    slug: quiz.slug || params.slug,
  });
  const fallbackDescription = stripHtml(quiz.excerpt?.rendered || quiz.content.rendered);
  const seoTitle = resolveSeoTitle(quiz.metaTitle, title);
  const seoDescription = resolveSeoDescription(
    quiz.metaDescription,
    fallbackDescription,
    buildQuizIntro({
      title,
      category: quiz.acf?.categorie,
      difficulty: quiz.acf?.niveau_difficulte,
      questionCount: quiz.acf?.nombre_questions,
      durationMinutes: quiz.acf?.duree_estimee,
      existingExcerptPlain: fallbackDescription,
    }) || `Free ${title} practice quiz on SonaPrep.`
  );
  const image = quiz.featured_media_url || '';
  const canonicalSlug = quiz.slug || params.slug;
  const canonical = `/quiz/${encodeURIComponent(canonicalSlug)}`;

  return {
    title: seoTitle,
    description: seoDescription,
    alternates: { canonical },
    openGraph: {
      title: seoTitle,
      description: seoDescription,
      images: image ? [{ url: image }] : [],
      type: 'article',
      url: `${SITE_URL}${canonical}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: seoTitle,
      description: seoDescription,
      images: image ? [image] : [],
    },
  };
}

export default async function QuizPage({ params }: PageProps) {
  // Décoder le slug pour gérer les espaces encodés (%20)
  const decodedSlug = decodeURIComponent(params.slug);
  
  // Essayer d'abord avec le slug décodé, puis avec le slug original
  let quiz = await getQuizBySlug(decodedSlug);
  
  if (!quiz && decodedSlug !== params.slug) {
    // Si le slug décodé ne fonctionne pas, essayer le slug original
    quiz = await getQuizBySlug(params.slug);
  }

  if (!quiz) {
    notFound();
  }

  const rawTitle = stripHtml(quiz.title.rendered);
  const title = buildQuizPublicTitle({
    title: rawTitle,
    category: quiz.acf?.categorie,
    slug: quiz.slug || decodedSlug,
  });
  const description = quiz.excerpt?.rendered || '';
  const intro = buildQuizIntro({
    title,
    category: quiz.acf?.categorie,
    difficulty: quiz.acf?.niveau_difficulte,
    questionCount: quiz.acf?.nombre_questions,
    durationMinutes: quiz.acf?.duree_estimee,
    existingExcerptPlain: stripHtml(description),
  });
  const faqs = buildQuizFaqs({
    title,
    category: quiz.acf?.categorie,
    questionCount: quiz.acf?.nombre_questions,
    durationMinutes: quiz.acf?.duree_estimee,
  });
  const difficulty = quiz.acf?.niveau_difficulte;
  const duration = quiz.acf?.duree_estimee;
  const questionCount = quiz.acf?.nombre_questions || 0;
  const canonicalSlug = quiz.slug || decodedSlug;
  
  // Ne pas afficher "Level" si vide ou ancienne valeur par défaut "Moyen"
  const showDifficulty = difficulty && String(difficulty).trim() !== '' && difficulty !== 'Moyen';
  // Compter le nombre de métadonnées à afficher
  const metadataCount = [
    duration && duration > 0,
    questionCount > 0,
    showDifficulty,
    quiz.acf?.categorie,
  ].filter(Boolean).length;
  
  const gridColsClass = metadataCount === 1 ? 'grid-cols-1' : 
                        metadataCount === 2 ? 'grid-cols-2' : 
                        metadataCount === 3 ? 'grid-cols-2 md:grid-cols-3' : 
                        'grid-cols-2 md:grid-cols-4';

  const breadcrumbItems = [
    { name: 'Home', url: SITE_URL },
    { name: 'Quizzes', url: `${SITE_URL}/quiz` },
    { name: title, url: `${SITE_URL}/quiz/${encodeURIComponent(canonicalSlug)}` },
  ];

  return (
    <>
      <QuizSchema quiz={quiz} />
      <BreadcrumbSchema items={breadcrumbItems} />
      {faqs.length > 0 ? <FaqSchema items={faqs} /> : null}

      <div className="bg-[#fdfbf7]">
        <div className="mx-auto max-w-[1160px] px-6 py-8 md:py-12">
          {/* En-tête du quiz */}
          <div className="mb-12">
            {quiz.featured_media_url && (
              <div className="relative mb-8 h-64 w-full overflow-hidden rounded-[10px] md:h-80">
                <Image
                  src={quiz.featured_media_url}
                  alt={title}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 768px) 100vw, 1200px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1d2a45]/70 via-[#1d2a45]/20 to-transparent"></div>
                <div className="absolute bottom-6 left-6 right-6">
                  <h1 className="font-display mb-2 text-3xl font-semibold text-white drop-shadow-lg md:text-4xl lg:text-5xl">
                    {title}
                  </h1>
                </div>
              </div>
            )}

            {!quiz.featured_media_url && (
              <div className="mb-8">
                <h1 className="font-display mb-4 text-4xl font-semibold text-[#2c3c5e] md:text-5xl lg:text-6xl">
                  {title}
                </h1>
              </div>
            )}

            <div className="rounded-[10px] border border-[#eae2d2] bg-white p-6 shadow-[0_2px_10px_rgba(44,60,94,0.04)] md:p-8">
              {(intro || description) && (
                <div
                  className="prose prose-lg mb-8 max-w-none text-lg leading-relaxed text-[#6b7180] md:text-xl"
                  dangerouslySetInnerHTML={{ __html: sanitizeHtml(intro || description) }}
                />
              )}

              {/* Métadonnées */}
              {metadataCount > 0 && (
              <div className={`grid ${gridColsClass} gap-4`}>
                {duration && duration > 0 && (
                  <div className="flex items-center gap-3 rounded-[10px] border border-[#eae2d2] bg-[#f8f2e7] p-4">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md bg-[#2c3c5e]">
                      <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-[#6b7180]">Duration</div>
                      <div className="text-sm font-bold text-[#2c3c5e]">{formatDuration(duration)}</div>
                    </div>
                  </div>
                )}

                {questionCount > 0 && (
                  <div className="flex items-center gap-3 rounded-[10px] border border-[#eae2d2] bg-[#f8f2e7] p-4">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md bg-[#2c3c5e]">
                      <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-[#6b7180]">Questions</div>
                      <div className="text-sm font-bold text-[#2c3c5e]">{questionCount}</div>
                    </div>
                  </div>
                )}

                {showDifficulty && (
                  <div className="flex items-center gap-3 rounded-[10px] border border-[#eae2d2] bg-[#f8f2e7] p-4">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md bg-[#2c3c5e]">
                      <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-[#6b7180]">Level</div>
                      <div className="text-sm font-bold text-[#2c3c5e]">{difficultyToEnglish(difficulty)}</div>
                    </div>
                  </div>
                )}

                {quiz.acf?.categorie && (
                  <div className="flex items-center gap-3 rounded-[10px] border border-[#eae2d2] bg-[#f8f2e7] p-4">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md bg-[#2c3c5e]">
                      <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-[#6b7180]">Category</div>
                      <div className="text-sm font-bold text-[#2c3c5e]">{categoryToEnglish(quiz.acf.categorie)}</div>
                    </div>
                  </div>
                )}
              </div>
              )}
            </div>
          </div>

          <QuizQuestionsSeoContent quiz={quiz} />

          <QuizPlayer quiz={quiz} />

          <div className="mt-12">
            <CommentsSection targetType="quiz" targetSlug={canonicalSlug} />
          </div>
        </div>
      </div>
    </>
  );
}
