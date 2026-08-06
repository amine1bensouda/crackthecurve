import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllQuiz } from '@/lib/quiz-service';
import { getStats } from '@/lib/wordpress';
import { getAllPublishedCourses } from '@/lib/course-service';
import { SITE_DESCRIPTION } from '@/lib/constants';
import { formatDuration, formatNumber, stripHtml } from '@/lib/utils';

export const metadata: Metadata = {
  title: {
    absolute: 'SonaPrep — Professional License & Certification Exam Prep',
  },
  description: SITE_DESCRIPTION,
  openGraph: {
    title: 'SonaPrep — Professional License & Certification Exam Prep',
    description: SITE_DESCRIPTION,
  },
};

export const dynamic = 'force-dynamic';
export const revalidate = 3600;

const accents = ['#3f7267', '#95586b', '#c79a55'];

const benefits = [
  {
    title: 'Practice Real Board Questions',
    text: "Solve PE, CPA, NCLEX, Bar, and PMP-style questions written to match each board's real exam difficulty and format.",
  },
  {
    title: 'Understand What Matters',
    text: 'Each question targets a high-frequency exam topic pulled from the official blueprint, not random subject theory.',
  },
  {
    title: 'Train Like Exam Day',
    text: 'Timed practice sessions build the speed, accuracy, and confidence you need under real testing-center conditions.',
  },
];

const reasons = [
  ['Board-Accurate Practice', 'Questions written to match the real difficulty and format of each licensing exam.'],
  ['Difficulty That Matches the Exam', 'Each question focuses on high-frequency, high-weight exam topics.'],
  ['Field-Focused Learning', 'Each bank is written by practitioners who hold that specific license.'],
  ['Every License in One Place', 'No switching platforms between fields. Practice under real exam conditions, in one account.'],
];

const personas = [
  ['Just Getting Started', 'Follow a clear path through the exam blueprint with tools built to help you learn faster.'],
  ['At a Plateau', 'Find the domains costing you points with analytics that show exactly what to focus on.'],
  ['Busy', 'Stay on track around a full-time job with study tools that adapt to your schedule.'],
  ['Not a Confident Test Taker', 'Learn to work through tricky, board-style questions with targeted practice and proven strategy.'],
  ['Retaking the Exam', 'Pinpoint and correct the exact problem areas from your last attempt with focused practice.'],
  ['Stressed by the Clock', 'Practice with the timer feature to build pacing and stay calm on test day.'],
];

export default async function HomePage() {
  const [quizzes, stats, courses] = await Promise.all([
    getAllQuiz(),
    getStats(),
    getAllPublishedCourses(),
  ]);

  const featuredQuizzes = quizzes.slice(0, 6);

  return (
    <div className="bg-[#fdfbf7] text-[#2b3244]">
      {/* Hero */}
      <section
        className="px-6 pb-16 pt-[88px] text-center"
        style={{
          background:
            'radial-gradient(ellipse 700px 380px at 18% 0%, rgba(63,114,103,0.08), transparent 60%), radial-gradient(ellipse 700px 380px at 85% 10%, rgba(149,88,107,0.08), transparent 60%)',
        }}
      >
        <div className="mx-auto max-w-[1160px]">
          <h1 className="font-display mx-auto max-w-[820px] text-[clamp(2.3rem,4.5vw,3.5rem)] font-semibold leading-[1.15] text-[#2c3c5e]">
            Practice Problems for Every Professional{' '}
            <span className="italic text-[#3f7267]">License &amp; Certification</span>
          </h1>
          <p className="mx-auto mt-[22px] max-w-[680px] text-[1.15rem] text-[#6b7180]">
            Practice for licenses and certifications across engineering, nursing, accounting,
            construction, and more — one platform, every industry.
          </p>
          <p className="mx-auto mt-3.5 max-w-[700px] text-base text-[#6b7180]">
            SonaPrep is a comprehensive online platform offering high-quality practice questions for
            professional licensing and certification exams in the United States. Improve your skills
            and prepare for any major credentialing exam across the industries you work in.
          </p>
          <div className="mt-[34px] flex flex-col items-center justify-center gap-3.5 sm:flex-row">
            <Link
              href="#courses"
              className="inline-block rounded-md bg-[#2c3c5e] px-[26px] py-[13px] text-[0.95rem] font-semibold text-white transition hover:bg-[#1d2a45]"
            >
              Start Practicing
            </Link>
            <Link
              href="/about-us"
              className="inline-block rounded-md border border-[#eae2d2] bg-transparent px-[26px] py-[13px] text-[0.95rem] font-semibold text-[#2c3c5e] transition hover:border-[#2c3c5e]"
            >
              About SonaPrep
            </Link>
          </div>
        </div>
      </section>

      {/* Courses / Licenses */}
      <section id="courses" className="px-6 py-[76px]">
        <div className="mx-auto max-w-[1160px]">
          <h2 className="font-display mb-[46px] text-center text-[2rem] font-semibold text-[#2c3c5e]">
            Explore Our Licenses
          </h2>
          {courses.length ? (
            <div className="grid gap-[22px] sm:grid-cols-2 lg:grid-cols-3">
              {courses.map((course, index) => {
                const totalQuizzes =
                  course.modules?.reduce((sum, module) => sum + (module._count?.quizzes ?? 0), 0) ?? 0;
                const moduleCount = course._count?.modules ?? course.modules?.length ?? 0;
                const accent = accents[index % accents.length];
                return (
                  <article
                    key={course.id}
                    className="rounded-[10px] border border-[#eae2d2] border-t-[3px] bg-white p-[26px] shadow-[0_2px_10px_rgba(44,60,94,0.04)]"
                    style={{ borderTopColor: accent }}
                  >
                    <h3 className="font-display text-[1.12rem] font-semibold text-[#2c3c5e]">
                      {course.title}
                    </h3>
                    <div
                      className="font-display mt-3.5 text-[2.2rem] font-bold leading-none"
                      style={{ color: accent }}
                    >
                      {formatNumber(moduleCount)}
                    </div>
                    <p className="mt-1 mb-[18px] text-[0.88rem] text-[#6b7180]">
                      {moduleCount === 1 ? 'Module' : 'Modules'} · {formatNumber(totalQuizzes)}{' '}
                      {totalQuizzes === 1 ? 'quiz' : 'quizzes'}
                    </p>
                    <Link
                      href={course.slug ? `/quiz/course/${course.slug}` : '/quiz'}
                      className="text-[0.9rem] font-semibold text-[#2c3c5e]"
                      style={{ borderBottom: `2px solid ${accent}`, paddingBottom: 2 }}
                    >
                      Practice {course.title.includes('QBank') ? course.title : `${course.title} QBank`} →
                    </Link>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="rounded-[10px] border border-[#eae2d2] bg-white p-10 text-center text-[#6b7180]">
              Our license collections are being prepared.
            </div>
          )}
        </div>
      </section>

      {/* Stats */}
      <div className="flex flex-wrap items-center justify-center gap-10 border-y border-[#eae2d2] bg-[#f8f2e7] px-6 py-14 text-center sm:gap-20">
        {[
          [stats.total_quiz, 'Available Quizzes'],
          [stats.total_questions, 'Practice Questions'],
          [stats.total_categories || courses.length, 'Licensing Fields'],
        ].map(([value, label]) => (
          <div key={String(label)}>
            <div className="font-display text-[2.5rem] font-bold text-[#2c3c5e]">
              {formatNumber(Number(value))}
            </div>
            <div className="mt-1 text-[0.9rem] text-[#6b7180]">{label}</div>
          </div>
        ))}
      </div>

      {/* How it helps */}
      <section className="px-6 py-[76px]">
        <div className="mx-auto max-w-[1160px]">
          <h2 className="font-display mb-[46px] text-center text-[2rem] font-semibold text-[#2c3c5e]">
            How SonaPrep Helps You Get Licensed
          </h2>
          <div className="grid gap-[30px] md:grid-cols-3">
            {benefits.map((item) => (
              <article key={item.title}>
                <h3 className="font-display text-[1.15rem] font-semibold text-[#2c3c5e]">{item.title}</h3>
                <p className="mt-2.5 text-[0.95rem] leading-relaxed text-[#6b7180]">{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Why */}
      <section className="bg-[#f8f2e7] px-6 py-[76px]">
        <div className="mx-auto max-w-[1160px]">
          <h2 className="font-display mb-[46px] text-center text-[2rem] font-semibold text-[#2c3c5e]">
            Why Professionals Use SonaPrep
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {reasons.map(([title, text]) => (
              <article
                key={title}
                className="rounded-[10px] border border-[#eae2d2] bg-white p-6"
              >
                <h3 className="font-display text-[1.02rem] font-semibold text-[#2c3c5e]">{title}</h3>
                <p className="mt-2 text-[0.88rem] leading-relaxed text-[#6b7180]">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Personas */}
      <section className="px-6 py-[76px]">
        <div className="mx-auto max-w-[1160px]">
          <h2 className="font-display mb-[46px] text-center text-[2rem] font-semibold text-[#2c3c5e]">
            Choose SonaPrep If You Are:
          </h2>
          <div className="grid gap-x-7 gap-y-[26px] sm:grid-cols-2 lg:grid-cols-3">
            {personas.map(([title, text], index) => (
              <article
                key={title}
                className="border-t-[3px] pt-5"
                style={{ borderColor: accents[index % accents.length] }}
              >
                <h3 className="font-display text-[1.05rem] font-semibold text-[#2c3c5e]">{title}</h3>
                <p className="mt-2 text-[0.9rem] leading-relaxed text-[#6b7180]">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Featured quizzes */}
      <section className="px-6 py-[76px]">
        <div className="mx-auto max-w-[1160px]">
          <h2 className="font-display mb-[46px] text-center text-[2rem] font-semibold text-[#2c3c5e]">
            Featured Quizzes
          </h2>
          {featuredQuizzes.length ? (
            <div className="flex gap-4 overflow-x-auto pb-2.5">
              {featuredQuizzes.map((quiz) => {
                const duration = quiz.acf?.duree_estimee;
                const moduleLabel = quiz.acf?.categorie || 'Practice';
                return (
                  <article
                    key={quiz.prismaId ?? quiz.id}
                    className="w-[220px] shrink-0 rounded-[10px] border border-[#eae2d2] bg-white p-5"
                  >
                    <div className="font-display mb-2 line-clamp-2 text-[1.02rem] font-semibold text-[#2c3c5e]">
                      {stripHtml(quiz.title.rendered)}
                    </div>
                    <div className="mb-4 text-[0.82rem] text-[#6b7180]">
                      {moduleLabel}
                      {duration ? ` · ${formatDuration(duration)}` : ''}
                    </div>
                    <Link
                      href={`/quiz/${quiz.slug}`}
                      className="block rounded-md bg-[#2c3c5e] py-[9px] text-center text-[0.85rem] font-semibold text-white transition hover:bg-[#1d2a45]"
                    >
                      Start Quiz
                    </Link>
                  </article>
                );
              })}
            </div>
          ) : (
            <p className="text-center text-[#6b7180]">New quizzes are coming soon.</p>
          )}
          <div className="mt-[26px] text-center">
            <Link
              href="/quiz"
              className="font-semibold text-[#2c3c5e]"
              style={{ borderBottom: '2px solid #3f7267', paddingBottom: 2 }}
            >
              View all quizzes →
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[linear-gradient(120deg,#2c3c5e_0%,#3f7267_100%)] px-6 py-[76px] text-center text-white">
        <div className="mx-auto max-w-[1160px]">
          <h2 className="font-display text-[2.1rem] font-semibold text-white">Ready to Get Licensed?</h2>
          <p className="mx-auto mt-3.5 mb-[30px] max-w-[560px] text-white/90">
            Join thousands of professionals who are preparing for their licensing exams and building
            confidence with SonaPrep&apos;s comprehensive practice platform.
          </p>
          <Link
            href="/register"
            className="inline-block rounded-md bg-white px-[26px] py-[13px] text-[0.95rem] font-semibold text-[#2c3c5e] transition hover:bg-[#f8f2e7]"
          >
            Get Started Now
          </Link>
        </div>
      </section>
    </div>
  );
}
