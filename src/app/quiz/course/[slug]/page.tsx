import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import CourseSchema from '@/components/SEO/CourseSchema';
import CourseLanding from '@/components/Course/CourseLanding';
import Navigation from '@/components/Layout/Navigation';
import { getCourseBySlug, getPublishedCoursesSummary } from '@/lib/course-service';
import { SITE_NAME, SITE_URL } from '@/lib/constants';
import { stripHtml } from '@/lib/utils';
import { resolveSeoDescription, resolveSeoTitle } from '@/lib/seo-meta';

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

  const title = resolveSeoTitle(course.metaTitle, stripHtml(course.title));
  const description =
    resolveSeoDescription(
      course.metaDescription,
      course.description,
      `${stripHtml(course.title)} practice on ${SITE_NAME}.`
    ) || `${stripHtml(course.title)} practice on ${SITE_NAME}.`;
  const canonical = `/quiz/course/${encodeURIComponent(course.slug)}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      type: 'article',
      url: `${SITE_URL}${canonical}`,
    },
  };
}

export default async function CoursePage({ params }: PageProps) {
  const course = await getCourseBySlug(decodeURIComponent(params.slug));

  if (!course) {
    notFound();
  }

  const lessons = course.modules.flatMap((module) =>
    module.lessons.map((lesson) => ({
      id: lesson.id,
      title: lesson.title,
      moduleTitle: module.title,
      href: `/quiz/lesson/${encodeURIComponent(lesson.id)}`,
    }))
  );
  const modules = course.modules
    .filter((module) => module.quizzes.length > 0)
    .map((module) => ({
      id: module.id,
      title: module.title,
      quizCount: module.quizzes.length,
    }));
  const totalQuizzes = modules.reduce((sum, module) => sum + module.quizCount, 0);
  const stats = {
    quizzes: totalQuizzes,
    questions: course.modules.reduce(
      (sum, module) =>
        sum + module.quizzes.reduce((quizSum, quiz) => quizSum + (quiz.acf?.nombre_questions || 0), 0),
      0
    ),
    modules: course.modules.length,
    lessons: lessons.length,
  };

  let related: { title: string; slug: string; moduleCount: number; totalQuizzes: number }[] = [];
  try {
    const courses = await getPublishedCoursesSummary();
    related = courses
      .filter((item) => item.slug !== course.slug && item.totalQuizzes > 0)
      .slice(0, 8)
      .map((item) => ({
        title: item.title,
        slug: item.slug,
        moduleCount: item.moduleCount,
        totalQuizzes: item.totalQuizzes,
      }));
  } catch {
    related = [];
  }

  return (
    <>
      <CourseSchema
        slug={course.slug}
        title={course.title}
        description={course.description}
        moduleCount={course.modules.length}
        totalQuizzes={totalQuizzes}
      />
      <Navigation />
      <CourseLanding
        courseTitle={course.title}
        courseSlug={course.slug}
        description={course.description}
        lessons={lessons}
        modules={modules}
        related={related}
        stats={stats}
      />
    </>
  );
}
