import Link from 'next/link';
import QuizModuleTable, { type AdminQuizRow } from '@/components/Admin/QuizModuleTable';
import { prisma } from '@/lib/db';

type ModuleGroup = {
  moduleId: string | null;
  moduleTitle: string;
  moduleOrder: number;
  quizzes: AdminQuizRow[];
};

type CourseGroup = {
  courseId: string | null;
  courseTitle: string;
  modules: ModuleGroup[];
};

export default async function AdminQuizzesPage({
  searchParams,
}: {
  searchParams?: { q?: string };
}) {
  const searchQuery = searchParams?.q?.trim() || '';

  const [quizzes, allQuizzesCount] = await Promise.all([
    prisma.quiz.findMany({
      where: searchQuery
        ? {
            OR: [
              { title: { contains: searchQuery, mode: 'insensitive' } },
              { slug: { contains: searchQuery, mode: 'insensitive' } },
            ],
          }
        : undefined,
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        difficulty: true,
        order: true,
        module: {
          select: {
            id: true,
            title: true,
            order: true,
            course: {
              select: { id: true, title: true },
            },
          },
        },
        _count: {
          select: { questions: true },
        },
      },
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    }),
    prisma.quiz.count(),
  ]);

  const courseMap = new Map<string, { courseId: string | null; courseTitle: string; modules: Map<string, ModuleGroup> }>();

  for (const quiz of quizzes) {
    const courseId = quiz.module?.course?.id ?? null;
    const courseKey = courseId ?? '__none__';
    const courseTitle = quiz.module?.course?.title || 'Unassigned course';
    const moduleId = quiz.module?.id ?? null;
    const moduleKey = moduleId ?? '__none__';

    if (!courseMap.has(courseKey)) {
      courseMap.set(courseKey, { courseId, courseTitle, modules: new Map() });
    }

    const course = courseMap.get(courseKey)!;
    if (!course.modules.has(moduleKey)) {
      course.modules.set(moduleKey, {
        moduleId,
        moduleTitle: quiz.module?.title || 'Unassigned module',
        moduleOrder: quiz.module?.order ?? Number.MAX_SAFE_INTEGER,
        quizzes: [],
      });
    }

    course.modules.get(moduleKey)!.quizzes.push({
      id: quiz.id,
      title: quiz.title,
      slug: quiz.slug,
      description: quiz.description,
      difficulty: quiz.difficulty,
      order: quiz.order,
      questionCount: quiz._count.questions,
    });
  }

  const grouped: CourseGroup[] = [...courseMap.values()]
    .map((course) => ({
      courseId: course.courseId,
      courseTitle: course.courseTitle,
      modules: [...course.modules.values()].sort((a, b) => a.moduleOrder - b.moduleOrder || a.moduleTitle.localeCompare(b.moduleTitle)),
    }))
    .sort((a, b) => {
      if (!a.courseId) return 1;
      if (!b.courseId) return -1;
      return a.courseTitle.localeCompare(b.courseTitle);
    });

  const canReorder = !searchQuery;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Quiz Management
          </h1>
          <p className="text-gray-600">{allQuizzesCount} quiz total</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          <form method="get" className="flex items-center gap-2">
            <input
              type="text"
              name="q"
              placeholder="Search by title or slug..."
              defaultValue={searchParams?.q || ''}
              className="w-full sm:w-64 px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors"
            >
              Search
            </button>
            {searchQuery && (
              <Link
                href="/admin/quizzes"
                className="px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Reset
              </Link>
            )}
          </form>
          <Link
            href="/admin/quizzes/new"
            className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all font-medium shadow-lg text-center"
          >
            ➕ New Quiz
          </Link>
        </div>
      </div>

      {searchQuery && (
        <p className="text-sm text-gray-600">
          Clear the search to change quiz order. Arrows are hidden while a filter is active.
        </p>
      )}

      {quizzes.length > 0 ? (
        <div className="space-y-8">
          {grouped.map((course) => {
            const courseQuizCount = course.modules.reduce((acc, moduleGroup) => acc + moduleGroup.quizzes.length, 0);

            return (
              <section
                key={course.courseId ?? 'unassigned-course'}
                className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden"
              >
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">{course.courseTitle}</h2>
                    <p className="text-sm text-gray-500">
                      {courseQuizCount} quiz
                      {courseQuizCount > 1 ? 'zes' : ''} in this course
                    </p>
                  </div>
                </div>

                <div className="divide-y divide-gray-200">
                  {course.modules.map((moduleGroup) => (
                    <div key={moduleGroup.moduleId ?? 'unassigned-module'} className="px-4 py-4">
                      <div className="flex items-center justify-between mb-3 px-2">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{moduleGroup.moduleTitle}</h3>
                          <p className="text-xs text-gray-500">
                            {moduleGroup.quizzes.length} quiz
                            {moduleGroup.quizzes.length > 1 ? 'zes' : ''} in this module
                            {canReorder ? '. Use the arrows to set the public order.' : ''}
                          </p>
                        </div>
                      </div>
                      <QuizModuleTable
                        key={`${moduleGroup.moduleId ?? 'unassigned'}-${searchQuery}`}
                        quizzes={moduleGroup.quizzes}
                        canReorder={canReorder}
                      />
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-12 text-center">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            {searchQuery ? 'No matching quizzes' : 'No quizzes'}
          </h3>
          <p className="text-gray-600 mb-6">
            {searchQuery ? 'Try another title or slug.' : 'Start by creating your first quiz'}
          </p>
          {!searchQuery && (
            <Link
              href="/admin/quizzes/new"
              className="inline-block px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all font-medium"
            >
              Create a quiz
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
