import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllQuiz } from '@/lib/quiz-service';
import { getStats } from '@/lib/wordpress';
import { getAllPublishedCourses } from '@/lib/course-service';
import { SITE_DESCRIPTION } from '@/lib/constants';
import { formatDuration, formatNumber, stripHtml } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Free Math Practice for Standardized Exams',
  description: SITE_DESCRIPTION,
};

export const dynamic = 'force-dynamic';
export const revalidate = 3600;

const accents = ['#3f7267', '#95586b', '#c79a55'];

const benefits = [
  {
    title: 'Practice Real Exam Questions',
    text: 'Solve ACT, SAT, AP, GRE, and GMAT-style math problems written to match real test difficulty and format.',
  },
  {
    title: 'Understand What Matters',
    text: 'Each problem focuses on high-frequency exam concepts, so every study session moves you closer to your goal.',
  },
  {
    title: 'Train Like Test Day',
    text: 'Timed practice builds the speed, accuracy, and confidence you need under real exam conditions.',
  },
];

const reasons = [
  ['Exam-Accurate Practice', 'Questions designed around the structure, language, and difficulty of major standardized tests.'],
  ['Focused Learning', 'Spend your time on the concepts that are most likely to earn points on exam day.'],
  ['Clear Explanations', 'Learn from every attempt with straightforward solutions that make difficult ideas easier.'],
  ['Every Exam in One Place', 'Prepare for multiple exams and track your practice from one simple account.'],
];

const personas = [
  ['Just Getting Started', 'Build a strong foundation with a clear path through the essential exam topics.'],
  ['At a Plateau', 'Find the skills costing you points and focus your practice where it matters most.'],
  ['Short on Time', 'Keep progressing with focused quiz sessions that fit around a busy schedule.'],
  ['Not a Confident Test Taker', 'Get comfortable with exam-style questions through steady, targeted practice.'],
  ['Retaking an Exam', 'Turn your last result into a focused plan and close the gaps before your next attempt.'],
  ['Stressed by the Clock', 'Use timed quizzes to improve pacing and stay composed on test day.'],
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
      <section className="relative overflow-hidden border-b border-[#eae2d2] px-6 py-20 sm:py-24 lg:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_600px_350px_at_15%_0%,rgba(63,114,103,.11),transparent_65%),radial-gradient(ellipse_600px_350px_at_85%_5%,rgba(149,88,107,.10),transparent_65%)]" />
        <div className="relative mx-auto max-w-5xl text-center">
          <p className="mb-5 text-xs font-bold uppercase tracking-[0.22em] text-[#3f7267]">Free exam preparation</p>
          <h1 className="font-display mx-auto max-w-4xl text-4xl font-semibold leading-[1.08] text-[#2c3c5e] sm:text-5xl lg:text-[3.5rem]">
            Practice Math for Every Major{' '}
            <span className="italic text-[#3f7267]">Standardized Exam</span>
          </h1>
          <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-[#6b7180]">
            Prepare for the ACT, SAT, AP, GRE, GMAT, and more — one focused platform,
            thousands of exam-style questions, completely free.
          </p>
          <p className="mx-auto mt-3 max-w-3xl text-base leading-7 text-[#6b7180]">
            Sona Prep helps students build stronger math skills with focused practice,
            clear explanations, and realistic quizzes made for test day.
          </p>
          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/quiz" className="rounded-md bg-[#2c3c5e] px-7 py-3.5 font-semibold text-white transition hover:bg-[#1d2a45]">
              Start Practicing
            </Link>
            <Link href="/about-us" className="rounded-md border border-[#d9cfbd] px-7 py-3.5 font-semibold text-[#2c3c5e] transition hover:border-[#2c3c5e]">
              About Sona Prep
            </Link>
          </div>
        </div>
      </section>

      <section className="px-6 py-20" id="courses">
        <div className="mx-auto max-w-6xl">
          <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-[#95586b]">Choose your test</p>
          <h2 className="font-display mt-3 text-center text-3xl font-semibold text-[#2c3c5e] sm:text-4xl">Explore Our Exams</h2>
          {courses.length ? (
            <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {courses.map((course, index) => {
                const totalQuizzes = course.modules?.reduce((sum, module) => sum + (module._count?.quizzes ?? 0), 0) ?? 0;
                const moduleCount = course._count?.modules ?? course.modules?.length ?? 0;
                const accent = accents[index % accents.length];
                return (
                  <article key={course.id} className="rounded-[10px] border border-[#eae2d2] border-t-[3px] bg-white p-7 shadow-[0_3px_15px_rgba(44,60,94,.05)]" style={{ borderTopColor: accent }}>
                    <h3 className="font-display text-xl font-semibold text-[#2c3c5e]">{course.title}</h3>
                    <div className="font-display mt-4 text-4xl font-bold" style={{ color: accent }}>{formatNumber(moduleCount)}</div>
                    <p className="mt-1 text-sm text-[#6b7180]">
                      {moduleCount === 1 ? 'Module' : 'Modules'} · {formatNumber(totalQuizzes)} {totalQuizzes === 1 ? 'quiz' : 'quizzes'}
                    </p>
                    <Link href={course.slug ? `/quiz/course/${course.slug}` : '/quiz'} className="mt-6 inline-block border-b-2 pb-0.5 text-sm font-semibold text-[#2c3c5e]" style={{ borderColor: accent }}>
                      Practice this exam →
                    </Link>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="mt-10 rounded-lg border border-[#eae2d2] bg-white p-10 text-center text-[#6b7180]">Our exam collections are being prepared.</div>
          )}
        </div>
      </section>

      <section className="border-y border-[#eae2d2] bg-[#f8f2e7] px-6 py-14">
        <div className="mx-auto grid max-w-4xl gap-10 text-center sm:grid-cols-3">
          {[
            [stats.total_quiz, 'Available Quizzes'],
            [stats.total_questions, 'Practice Questions'],
            [stats.total_categories, 'Exam Categories'],
          ].map(([value, label]) => (
            <div key={label}>
              <div className="font-display text-4xl font-bold text-[#2c3c5e]">{formatNumber(Number(value))}</div>
              <div className="mt-1 text-sm text-[#6b7180]">{label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="font-display text-center text-3xl font-semibold text-[#2c3c5e] sm:text-4xl">How Sona Prep Helps You Score Higher</h2>
          <div className="mt-12 grid gap-9 md:grid-cols-3">
            {benefits.map((item, index) => (
              <article key={item.title} className="border-t-2 pt-6" style={{ borderColor: accents[index] }}>
                <span className="font-display text-sm font-bold" style={{ color: accents[index] }}>0{index + 1}</span>
                <h3 className="font-display mt-3 text-xl font-semibold text-[#2c3c5e]">{item.title}</h3>
                <p className="mt-3 text-[15px] leading-7 text-[#6b7180]">{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#f8f2e7] px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="font-display text-center text-3xl font-semibold text-[#2c3c5e] sm:text-4xl">Why Students Use Sona Prep</h2>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {reasons.map(([title, text]) => (
              <article key={title} className="rounded-[10px] border border-[#eae2d2] bg-white p-6">
                <h3 className="font-display text-lg font-semibold text-[#2c3c5e]">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-[#6b7180]">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="font-display text-center text-3xl font-semibold text-[#2c3c5e] sm:text-4xl">Sona Prep Is Built for You</h2>
          <div className="mt-12 grid gap-x-8 gap-y-10 md:grid-cols-2 lg:grid-cols-3">
            {personas.map(([title, text], index) => (
              <article key={title} className="border-t-[3px] pt-5" style={{ borderColor: accents[index % accents.length] }}>
                <h3 className="font-display text-lg font-semibold text-[#2c3c5e]">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#6b7180]">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-[#eae2d2] px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="font-display text-center text-3xl font-semibold text-[#2c3c5e] sm:text-4xl">Featured Quizzes</h2>
          {featuredQuizzes.length ? (
            <div className="mt-12 flex gap-4 overflow-x-auto pb-4">
              {featuredQuizzes.map((quiz) => {
                const duration = quiz.acf?.duree_estimee;
                const questions = quiz.acf?.nombre_questions;
                return (
                  <article key={quiz.prismaId ?? quiz.id} className="flex min-h-56 w-[240px] shrink-0 flex-col rounded-[10px] border border-[#eae2d2] bg-white p-5">
                    <p className="text-xs font-bold uppercase tracking-wider text-[#3f7267]">{quiz.acf?.categorie || 'Math practice'}</p>
                    <h3 className="font-display mt-3 line-clamp-3 text-lg font-semibold leading-6 text-[#2c3c5e]">{stripHtml(quiz.title.rendered)}</h3>
                    <p className="mt-3 text-xs text-[#6b7180]">
                      {questions ? `${questions} questions` : 'Practice quiz'}
                      {duration ? ` · ${formatDuration(duration)}` : ''}
                    </p>
                    <Link href={`/quiz/${quiz.slug}`} className="mt-auto block rounded-md bg-[#2c3c5e] px-4 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-[#1d2a45]">Start Quiz</Link>
                  </article>
                );
              })}
            </div>
          ) : (
            <p className="mt-10 text-center text-[#6b7180]">New quizzes are coming soon.</p>
          )}
          <div className="mt-7 text-center">
            <Link href="/quiz" className="border-b-2 border-[#3f7267] pb-1 font-semibold text-[#2c3c5e]">View all quizzes →</Link>
          </div>
        </div>
      </section>

      <section className="bg-[linear-gradient(120deg,#2c3c5e_0%,#3f7267_100%)] px-6 py-20 text-center text-white">
        <h2 className="font-display text-3xl font-semibold sm:text-4xl">Ready to Reach Your Best Score?</h2>
        <p className="mx-auto mt-4 max-w-xl leading-7 text-white/80">Build confidence one question at a time with free, focused math practice for your next exam.</p>
        <Link href="/register" className="mt-8 inline-block rounded-md bg-white px-7 py-3.5 font-semibold text-[#2c3c5e] transition hover:bg-[#f8f2e7]">Get Started Free</Link>
      </section>
    </div>
  );
}
