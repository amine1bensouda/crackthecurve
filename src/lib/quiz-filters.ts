import type { Prisma } from '@prisma/client';

/**
 * Quiz visibles publiquement (cours publié ou sans module).
 * Note: crackthecurve n'a pas de champ isEnabled sur Quiz.
 */
export const PUBLISHED_QUIZ_WHERE: Prisma.QuizWhereInput = {
  OR: [
    {
      module: {
        course: {
          status: 'published',
        },
      },
    },
    {
      moduleId: null,
    },
  ],
};

/** Quiz indexables : publiés + au moins une question (évite soft-404 dans le sitemap). */
export const INDEXABLE_QUIZ_WHERE: Prisma.QuizWhereInput = {
  ...PUBLISHED_QUIZ_WHERE,
  questions: { some: {} },
};
