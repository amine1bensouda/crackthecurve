import Link from 'next/link';
import SafeHtmlRenderer from '@/components/Common/SafeHtmlRenderer';

export type LandingLesson = {
  id: string;
  title: string;
  href: string;
  moduleTitle: string;
};

export type LandingModule = {
  id: string;
  title: string;
  quizCount: number;
};

export type CourseHeroStats = {
  quizzes: number;
  questions: number;
  modules: number;
  lessons: number;
};

export type RelatedCourse = {
  title: string;
  slug: string;
  moduleCount: number;
  totalQuizzes: number;
};

interface CourseLandingProps {
  courseTitle: string;
  courseSlug: string;
  description?: string | null;
  lessons: LandingLesson[];
  modules: LandingModule[];
  related: RelatedCourse[];
  stats: CourseHeroStats;
}

export default function CourseLanding({
  courseTitle,
  courseSlug,
  description,
  lessons,
  modules,
  related,
  stats,
}: CourseLandingProps) {
  const practiceHref = `/quiz/course/${encodeURIComponent(courseSlug)}/practice`;

  return (
    <div className="bg-[#fdfbf7] text-[#2b3244]">
      <header className="bg-[#2c3c5e] px-4 py-12 text-center sm:px-8 sm:py-16">
        <h1 className="font-display mx-auto max-w-3xl text-3xl font-semibold leading-tight text-white sm:text-5xl">
          {courseTitle}
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-white/75">
          Practice by topic, in the order set for this course, then work through the full set.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {stats.quizzes > 0 && (
            <Link
              href={practiceHref}
              className="rounded-md bg-[#c79a55] px-7 py-3 text-[15px] font-semibold text-[#2c3c5e] hover:bg-[#d7ae72]"
            >
              Start practicing
            </Link>
          )}
          <Link
            href={practiceHref}
            className="rounded-md border border-white/35 px-7 py-3 text-[15px] font-semibold text-white hover:border-white/70"
          >
            Browse all topics
          </Link>
        </div>
        <dl className="mx-auto mt-10 flex max-w-3xl flex-wrap justify-center gap-x-10 gap-y-4">
          {[
            { value: String(stats.quizzes), label: 'Quizzes' },
            { value: String(stats.questions), label: 'Questions' },
            { value: String(stats.modules), label: 'Modules' },
            { value: String(stats.lessons), label: 'Lessons' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <dd className="text-[28px] font-semibold text-white">{stat.value}</dd>
              <dt className="mt-1 text-[10px] font-semibold uppercase tracking-widest text-white/45">{stat.label}</dt>
            </div>
          ))}
        </dl>
      </header>

      <div className="mx-auto max-w-[980px] px-4 sm:px-8">
        <nav className="mb-6 flex flex-wrap items-center gap-1.5 pt-6 text-xs text-[#6b7180]">
          <Link href="/" className="hover:text-[#2c3c5e]">Home</Link>
          <span>›</span>
          <Link href="/quiz" className="hover:text-[#2c3c5e]">Courses</Link>
          <span>›</span>
          <span className="text-[#2c3c5e]">{courseTitle}</span>
        </nav>

        <div className="grid grid-cols-1 items-start gap-8 pb-16 lg:grid-cols-[minmax(0,1fr)_280px]">
          <div>
            {description && (
              <section className="mb-6 rounded-[10px] border border-[#eae2d2] bg-white p-5">
                <SafeHtmlRenderer html={description} className="prose prose-sm max-w-none text-[#6b7180]" />
              </section>
            )}

            {modules.length > 0 && (
              <section className="mb-6 overflow-hidden rounded-[10px] border border-[#eae2d2] bg-white">
                <div className="flex items-center justify-between bg-[#2c3c5e] px-4 py-3.5">
                  <h2 className="text-sm font-semibold text-white">Quiz topics</h2>
                  <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-[11px] font-semibold text-white">
                    {stats.quizzes}
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-1.5 p-3 sm:grid-cols-2">
                  {modules.map((module) => (
                    <Link
                      key={module.id}
                      href={`${practiceHref}#module-${module.id}`}
                      className="flex items-center justify-between gap-2 rounded-md border border-[#eae2d2] bg-[#f8f2e7] px-3 py-2 hover:bg-white"
                    >
                      <span className="min-w-0">
                        <span className="block text-[13px] font-semibold text-[#2c3c5e]">{module.title}</span>
                        <span className="text-[11px] text-[#6b7180]">
                          {module.quizCount} quiz{module.quizCount === 1 ? '' : 'zes'}
                        </span>
                      </span>
                      <span className="text-[#c79a55]" aria-hidden>→</span>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {lessons.length > 0 && (
              <section id="lessons" className="mb-6 scroll-mt-24 overflow-hidden rounded-[10px] border border-[#eae2d2] bg-white">
                <div className="flex items-center justify-between bg-[#2c3c5e] px-4 py-3.5">
                  <h2 className="text-sm font-semibold text-white">Lessons</h2>
                  <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-[11px] font-semibold text-white">
                    {lessons.length}
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-1.5 p-3 sm:grid-cols-2">
                  {lessons.map((lesson, index) => (
                    <Link
                      key={lesson.id}
                      href={lesson.href}
                      className="rounded-md border border-[#eae2d2] bg-[#f8f2e7] px-3 py-2 hover:bg-white"
                    >
                      <span className="text-[10px] font-semibold uppercase tracking-wide text-[#6b7180]">
                        Lesson {index + 1}
                        {lesson.moduleTitle ? ` · ${lesson.moduleTitle}` : ''}
                      </span>
                      <span className="mt-0.5 block text-[13px] font-semibold text-[#2c3c5e]">{lesson.title}</span>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>

          <aside className="lg:sticky lg:top-24">
            {related.length > 0 && (
              <div className="mb-4 overflow-hidden rounded-[10px] border border-[#eae2d2] bg-white">
                <h2 className="border-b border-[#eae2d2] bg-[#f8f2e7] px-4 py-2.5 text-[11px] font-semibold uppercase tracking-widest text-[#6b7180]">
                  Other courses
                </h2>
                <ul>
                  {related.map((item) => (
                    <li key={item.slug} className="border-b border-[#eae2d2] last:border-b-0">
                      <Link
                        href={`/quiz/course/${encodeURIComponent(item.slug)}`}
                        className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-[#f8f2e7]"
                      >
                        <span>
                          <span className="block text-[13px] font-semibold text-[#2c3c5e]">{item.title}</span>
                          <span className="mt-0.5 block text-[11px] text-[#6b7180]">
                            {item.totalQuizzes} quiz{item.totalQuizzes === 1 ? '' : 'zes'}
                          </span>
                        </span>
                        <span className="text-[#c79a55]" aria-hidden>›</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {stats.quizzes > 0 && (
              <div className="rounded-[10px] bg-[#2c3c5e] p-5 text-center text-white">
                <p className="text-sm font-semibold">Ready to start?</p>
                <p className="mt-1 text-xs leading-relaxed text-white/60">Quizzes stay in the order you set in admin.</p>
                <Link
                  href={practiceHref}
                  className="mt-3 block rounded-md bg-[#c79a55] py-2.5 text-[13px] font-semibold text-[#2c3c5e] hover:bg-[#d7ae72]"
                >
                  Start practicing
                </Link>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
