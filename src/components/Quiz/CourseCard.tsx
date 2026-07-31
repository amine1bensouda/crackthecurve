'use client';

import Link from 'next/link';
import SafeHtmlRenderer from '@/components/Common/SafeHtmlRenderer';

interface CourseCardProps {
  id: string;
  title: string;
  description?: string | null;
  moduleCount: number;
  totalQuizzes: number;
  slug: string;
}

export default function CourseCard({
  title,
  description,
  moduleCount,
  totalQuizzes,
  slug,
}: CourseCardProps) {
  return (
    <Link
      href={`/quiz/course/${slug}`}
      className="group block rounded-[10px] border border-[#eae2d2] border-t-[3px] border-t-[#3f7267] bg-white p-[26px] shadow-[0_2px_10px_rgba(44,60,94,0.04)] transition hover:border-[#2c3c5e]/30"
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <h3 className="font-display text-[1.12rem] font-semibold text-[#2c3c5e]">{title}</h3>
        <svg
          className="h-5 w-5 shrink-0 text-[#3f7267] opacity-0 transition-opacity group-hover:opacity-100"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>

      {description && (
        <div className="mb-4 overflow-hidden text-[#6b7180]">
          <SafeHtmlRenderer html={description} className="prose prose-sm max-w-none course-card-description" />
        </div>
      )}

      <div className="flex items-center gap-4 text-[0.88rem] text-[#6b7180]">
        <span>
          {moduleCount} module{moduleCount !== 1 ? 's' : ''}
        </span>
        <span>·</span>
        <span>
          {totalQuizzes} quiz{totalQuizzes !== 1 ? 'zes' : ''}
        </span>
      </div>
    </Link>
  );
}
