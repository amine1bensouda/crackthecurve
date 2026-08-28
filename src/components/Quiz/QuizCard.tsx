import Link from 'next/link';
import type { Quiz } from '@/lib/types';
import QuizImage from '@/components/Common/QuizImage';
import { DIFFICULTY_LEVELS } from '@/lib/constants';
import { formatDuration, stripHtml, categoryToEnglish } from '@/lib/utils';

interface QuizCardProps {
  quiz: Quiz;
  index?: number;
}

export default function QuizCard({ quiz, index = 0 }: QuizCardProps) {
  const difficulty = quiz.acf?.niveau_difficulte;
  // Ne pas afficher le badge si vide ou ancienne valeur par défaut "Moyen"
  const showDifficulty = difficulty && String(difficulty).trim() !== '' && difficulty !== 'Moyen';
  const difficultyConfig = showDifficulty ? (DIFFICULTY_LEVELS[difficulty as keyof typeof DIFFICULTY_LEVELS] || DIFFICULTY_LEVELS.Intermediate) : null;
  const duration = quiz.acf?.duree_estimee;
  const questionCount = quiz.acf?.nombre_questions || 0;

  const getDifficultyStyles = () => {
    if (!difficultyConfig) return '';
    switch (difficultyConfig.color) {
      case 'green':
        return 'bg-[#f0f7f5] text-[#3f7267] border-[#3f7267]/30';
      case 'yellow':
        return 'bg-[#faf6ee] text-[#c79a55] border-[#c79a55]/30';
      case 'orange':
        return 'bg-[#faf0f3] text-[#95586b] border-[#95586b]/30';
      default:
        return 'bg-[#faf0f3] text-[#95586b] border-[#95586b]/30';
    }
  };

  return (
    <Link
      href={`/quiz/${quiz.slug}`}
      prefetch={true}
      className="group relative block h-full animate-fade-in rounded-[10px] border border-[#eae2d2] bg-white shadow-[0_2px_10px_rgba(44,60,94,0.04)] transition hover:-translate-y-1 hover:border-[#2c3c5e]/30"
      style={{ animationDelay: index !== undefined ? `${index * 0.1}s` : '0s' }}
    >
      {quiz.featured_media_url && (
        <div className="relative h-48 w-full overflow-hidden bg-[#f8f2e7]">
          <QuizImage
            src={quiz.featured_media_url}
            alt={quiz.title.rendered}
            fill
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          {/* Badge catégorie sur image */}
          {quiz.acf?.categorie && (
            <div className="absolute right-4 top-4 rounded-md border border-[#eae2d2] bg-white/90 px-3 py-1.5 text-xs font-semibold text-[#2c3c5e]">
              {quiz.acf.categorie}
            </div>
          )}
        </div>
      )}
      
      <div className="flex h-full flex-col p-6">
        <div className="mb-4 flex items-center justify-between">
          {difficultyConfig && (
            <span
              className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-semibold ${getDifficultyStyles()}`}
            >
              <span className="text-base">{difficultyConfig.icon}</span>
              {difficultyConfig.label}
            </span>
          )}
          
          {!quiz.featured_media_url && quiz.acf?.categorie && (
            <span className="rounded-md bg-[#f8f2e7] px-3 py-1.5 text-xs font-medium text-[#6b7180]">
              {categoryToEnglish(quiz.acf.categorie)}
            </span>
          )}
        </div>

        <h3 className="font-display mb-2 line-clamp-2 text-lg font-semibold text-[#2c3c5e] transition-colors duration-200 group-hover:text-[#1d2a45] sm:mb-3 sm:text-xl">
          {stripHtml(quiz.title.rendered)}
        </h3>

        {quiz.excerpt?.rendered && (
          <div 
            className="prose prose-sm mb-4 hidden max-w-none line-clamp-2 text-sm leading-relaxed text-[#6b7180] sm:mb-5 sm:block"
            dangerouslySetInnerHTML={{ __html: quiz.excerpt.rendered }}
          />
        )}

        <div className="mt-auto flex items-center justify-between border-t border-[#eae2d2] pt-4">
          <div className="flex items-center gap-5 text-sm text-[#6b7180]">
            {questionCount > 0 && (
              <span className="flex items-center gap-1.5 font-medium">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#f8f2e7]">
                  <svg className="h-3 w-3 text-[#2c3c5e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                {questionCount}
              </span>
            )}
            {duration && duration > 0 && (
              <span className="flex items-center gap-1.5 font-medium">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#f8f2e7]">
                  <svg className="h-3 w-3 text-[#2c3c5e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                {formatDuration(duration)}
              </span>
            )}
          </div>
          
          <span className="inline-flex items-center gap-2 font-semibold text-[#2c3c5e] transition-all duration-300 group-hover:gap-3 group-hover:text-[#1d2a45]">
            Start Quiz
            <svg className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  );
}
