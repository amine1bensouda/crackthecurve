import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Navigation from '@/components/Layout/Navigation';
import Accordion from '@/components/Layout/Accordion';
import QuizCard from '@/components/Quiz/QuizCard';
import SafeHtmlRenderer from '@/components/Common/SafeHtmlRenderer';
import { getCourseBySlug } from '@/lib/course-service';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const course = await getCourseBySlug(decodeURIComponent(params.slug));

  if (!course) {
    return {
      title: 'Course Not Found',
      robots: { index: false, follow: false },
    };
  }

  return {
    title: `${course.title} practice`,
    robots: { index: false, follow: true },
    alternates: { canonical: `/quiz/course/${encodeURIComponent(course.slug)}` },
  };
}

export default async function CoursePracticePage({ params }: PageProps) {
  const course = await getCourseBySlug(decodeURIComponent(params.slug));

  if (!course) {
    notFound();
  }

  const totalQuizzes = course.modules.reduce((sum, module) => sum + module.quizzes.length, 0);
  const courseHref = `/quiz/course/${encodeURIComponent(course.slug)}`;

  return (
    <div className="min-h-screen bg-[#fdfbf7]">
      <Navigation />
      <div className="relative z-10 mx-auto max-w-[1160px] px-6 py-8 md:py-12">
        <main className="mx-auto min-w-0 max-w-4xl">
          <nav className="mb-6 overflow-x-auto whitespace-nowrap text-sm text-[#6b7180]">
            <Link href="/" className="hover:text-[#2c3c5e]">Home</Link>
            <span className="mx-1.5">/</span>
            <Link href="/quiz" className="hover:text-[#2c3c5e]">Courses</Link>
            <span className="mx-1.5">/</span>
            <Link href={courseHref} className="hover:text-[#2c3c5e]">{course.title}</Link>
            <span className="mx-1.5">/</span>
            <span className="font-medium text-[#2c3c5e]">Practice</span>
          </nav>

          <header className="mb-10">
            <div className="rounded-[10px] border border-[#eae2d2] bg-white p-6 shadow-[0_2px_10px_rgba(44,60,94,0.04)] sm:p-8 md:p-10">
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <span className="rounded-md bg-[#f8f2e7] px-3 py-1 text-xs font-semibold text-[#2c3c5e]">
                  {course.modules.length} module{course.modules.length === 1 ? '' : 's'}
                </span>
                <span className="rounded-md bg-[#f8f2e7] px-3 py-1 text-xs font-semibold text-[#3f7267]">
                  {totalQuizzes} quiz{totalQuizzes === 1 ? '' : 'zes'}
                </span>
              </div>
              <h1 className="font-display mb-3 text-3xl font-semibold text-[#2c3c5e] sm:text-4xl">
                {course.title}
              </h1>
              {course.description && (
                <SafeHtmlRenderer html={course.description} className="leading-relaxed text-[#6b7180]" />
              )}
            </div>
          </header>

          {course.modules.some((module) => module.quizzes.length > 0) ? (
            <section className="space-y-4" aria-label="Modules du cours">
              <h2 className="font-display text-2xl font-semibold text-[#2c3c5e]">Practice by topic</h2>
              {course.modules.map((module) => {
                if (module.quizzes.length === 0) return null;
                return (
                  <div key={module.id} id={`module-${module.id}`} className="scroll-mt-24">
                    <Accordion
                      title={module.title}
                      quizCount={module.quizzes.length}
                      defaultOpen={false}
                      icon={
                        <svg className="h-5 w-5 flex-shrink-0 text-[#3f7267] sm:h-6 sm:w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      }
                    >
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
                        {module.quizzes.map((quiz, index) => (
                          <QuizCard key={quiz.prismaId ?? quiz.id} quiz={quiz} index={index} />
                        ))}
                      </div>
                    </Accordion>
                  </div>
                );
              })}
            </section>
          ) : (
            <div className="rounded-[10px] border border-[#eae2d2] bg-white px-4 py-12 text-center">
              <p className="text-[#6b7180]">This course has no quizzes yet.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
