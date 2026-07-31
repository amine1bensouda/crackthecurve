'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Navigation from '@/components/Layout/Navigation';
import Accordion from '@/components/Layout/Accordion';
import QuizCard from '@/components/Quiz/QuizCard';
import SafeHtmlRenderer from '@/components/Common/SafeHtmlRenderer';
import LoadingSpinner from '@/components/Layout/LoadingSpinner';
import type { Quiz } from '@/lib/types';

interface Lesson {
  id: string;
  title: string;
  slug: string;
  order: number;
  videoPlaybackSeconds: number | null;
  allowPreview: boolean;
}

interface Module {
  id: string;
  title: string;
  slug: string;
  order: number;
  quizzes: Quiz[];
  lessons: Lesson[];
  _count: {
    quizzes: number;
    lessons: number;
  };
}

interface Course {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  modules: Module[];
}

export default function CoursePage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCourse() {
      try {
        const response = await fetch(`/api/courses/${slug}`);
        if (response.ok) {
          const courseData = await response.json();
          setCourse(courseData);
        } else if (response.status === 404) {
          // Rediriger vers la page 404 ou la liste des cours
          router.push('/quiz');
        }
      } catch (error) {
        console.error('Erreur chargement cours:', error);
      } finally {
        setLoading(false);
      }
    }

    if (slug) {
      loadCourse();
    }
  }, [slug, router]);

  if (loading) {
    return (
      <div className="relative min-h-screen bg-[#fdfbf7]">
        <Navigation />
        <div className="mx-auto max-w-[1160px] px-6 py-16 md:py-20">
          <div className="flex flex-col items-center gap-5">
            <LoadingSpinner size="lg" />
            <p className="font-display text-lg font-semibold text-[#2c3c5e]">Loading the course...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="relative min-h-screen bg-[#fdfbf7]">
        <Navigation />
        <div className="mx-auto max-w-[1160px] px-6 py-16 md:py-20">
          <div className="mx-auto max-w-lg rounded-[10px] border border-[#eae2d2] bg-white p-8 text-center shadow-[0_2px_10px_rgba(44,60,94,0.04)] md:p-12">
            <h3 className="font-display mb-3 text-2xl font-semibold text-[#2c3c5e]">
              Course not found
            </h3>
            <p className="mb-6 text-[#6b7180]">The requested course does not exist.</p>
            <Link
              href="/quiz"
              className="inline-block rounded-md bg-[#2c3c5e] px-6 py-3 text-white transition hover:bg-[#1d2a45]"
            >
              Back to courses
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const totalQuizzes = course.modules.reduce((sum, module) => sum + module._count.quizzes, 0);
  const totalLessons = course.modules.reduce((sum, module) => sum + (module._count.lessons ?? 0), 0);

  return (
    <div className="relative min-h-screen bg-[#fdfbf7]">
      <Navigation />
      <div className="relative z-10 mx-auto flex max-w-[1160px] gap-4 overflow-x-hidden px-6 py-8 md:py-12 lg:gap-6">
        <main className="mx-auto min-w-0 max-w-4xl flex-1">
          {/* Breadcrumb */}
          <nav className="mb-6 overflow-x-auto whitespace-nowrap text-sm text-[#6b7180] scrollbar-hide">
            <Link href="/" className="transition-colors hover:text-[#2c3c5e]">Home</Link>
            <span className="mx-1.5">/</span>
            <Link href="/quiz" className="transition-colors hover:text-[#2c3c5e]">Courses</Link>
            <span className="mx-1.5">/</span>
            <span className="inline-block max-w-[160px] truncate font-medium text-[#2c3c5e] sm:max-w-none">{course.title}</span>
          </nav>

          {/* Hero cours */}
          <header className="mb-10 animate-fade-in md:mb-12">
            <div className="rounded-[10px] border border-[#eae2d2] bg-white p-6 shadow-[0_2px_10px_rgba(44,60,94,0.04)] sm:p-8 md:p-10">
              <div className="mb-4 flex flex-wrap items-center gap-2 sm:gap-3">
                <span className="inline-flex items-center gap-1.5 rounded-md bg-[#f8f2e7] px-3 py-1 text-xs font-semibold text-[#2c3c5e]">
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  {course.modules.length} module{course.modules.length !== 1 ? 's' : ''}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-md bg-[#f8f2e7] px-3 py-1 text-xs font-semibold text-[#3f7267]">
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  {totalQuizzes} quiz{totalQuizzes !== 1 ? 'zes' : ''}
                </span>
                {totalLessons > 0 && (
                  <span className="inline-flex items-center gap-1.5 rounded-md bg-[#f8f2e7] px-3 py-1 text-xs font-semibold text-[#95586b]">
                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    {totalLessons} lesson{totalLessons !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
              <h1 className="font-display mb-3 text-2xl font-semibold leading-tight text-[#2c3c5e] min-[400px]:text-3xl sm:mb-4 sm:text-4xl md:text-5xl">
                {course.title}
              </h1>
              {course.description && (
                <div className="prose prose-sm max-w-none sm:prose-base">
                  <SafeHtmlRenderer html={course.description} className="leading-relaxed text-[#6b7180]" />
                </div>
              )}
            </div>
          </header>

          {/* Liste des modules */}
          {course.modules.length > 0 ? (
            <section className="animate-fade-in space-y-4 sm:space-y-5" aria-label="Modules du cours">
              {course.modules.map((module) => {
                const hasQuizzes = (module._count.quizzes ?? 0) > 0;
                const hasLessons = (module._count.lessons ?? 0) > 0;
                if (!hasQuizzes && !hasLessons) return null;
                return (
                  <Accordion
                    key={module.id}
                    title={module.title}
                    quizCount={module._count.quizzes ?? 0}
                    lessonCount={module._count.lessons ?? 0}
                    defaultOpen={false}
                    icon={
                      <svg className="h-5 w-5 flex-shrink-0 text-[#3f7267] sm:h-6 sm:w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    }
                  >
                    <div className="space-y-6">
                      {module.lessons && module.lessons.length > 0 && (
                        <div>
                          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#2c3c5e]">
                            <svg className="h-4 w-4 text-[#3f7267]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            Lessons
                          </h3>
                          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {module.lessons.map((lesson) => (
                              <li key={lesson.id}>
                                <Link
                                  href={`/quiz/lesson/${lesson.id}`}
                                  className="block rounded-[10px] border border-[#eae2d2] bg-white p-4 shadow-[0_2px_10px_rgba(44,60,94,0.04)] transition-all hover:border-[#2c3c5e]/30"
                                >
                                  <span className="font-medium text-[#2c3c5e]">{lesson.title}</span>
                                  {lesson.videoPlaybackSeconds != null && lesson.videoPlaybackSeconds > 0 && (
                                    <span className="ml-2 text-xs text-[#6b7180]">
                                      {Math.floor(lesson.videoPlaybackSeconds / 60)} min
                                    </span>
                                  )}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {hasQuizzes && (
                        <div>
                          {module.lessons && module.lessons.length > 0 && (
                            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#2c3c5e]">
                              <svg className="h-4 w-4 text-[#3f7267]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                              </svg>
                              Quizzes
                            </h3>
                          )}
                          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
                            {module.quizzes.map((quiz, index) => (
                              <QuizCard key={quiz.prismaId ?? quiz.id} quiz={quiz} index={index} />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </Accordion>
                );
              })}
            </section>
          ) : (
            <div className="rounded-[10px] border border-[#eae2d2] bg-white px-4 py-12 text-center shadow-[0_2px_10px_rgba(44,60,94,0.04)] sm:py-16">
              <p className="text-[#6b7180]">This course has no modules yet.</p>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
