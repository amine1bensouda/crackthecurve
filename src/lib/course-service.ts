import { prisma } from './db';
import { convertPrismaQuizToQuiz } from './quiz-service';
import { INDEXABLE_QUIZ_WHERE } from './quiz-filters';

/**
 * Service pour gérer les cours avec Prisma
 */

/**
 * Récupère tous les cours publiés avec leurs modules et quiz
 */
export async function getAllPublishedCourses() {
  try {
    const courses = await prisma.course.findMany({
      where: {
        status: 'published',
      },
      include: {
        modules: {
          include: {
            quizzes: {
              where: INDEXABLE_QUIZ_WHERE,
              select: { id: true },
            },
          },
          orderBy: {
            order: 'asc',
          },
        },
        _count: {
          select: {
            modules: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return courses.map((course) => ({
      ...course,
      modules: course.modules.map((module) => ({
        ...module,
        _count: {
          quizzes: module.quizzes.length,
        },
      })),
    }));
  } catch (error) {
    console.error('Erreur getAllPublishedCourses:', error);

    // En dev, on logue l'erreur mais on ne casse pas toute la page.
    // On retourne simplement un tableau vide de cours.
    return [];
  }
}

export type PublishedCourseSummary = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  moduleCount: number;
  totalQuizzes: number;
};

/**
 * Résumé des cours publiés pour les listes et les cours liés.
 */
export async function getPublishedCoursesSummary(): Promise<PublishedCourseSummary[]> {
  try {
    const courses = await prisma.course.findMany({
      where: { status: 'published' },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        modules: {
          select: {
            quizzes: {
              where: INDEXABLE_QUIZ_WHERE,
              select: { id: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return courses.map((course) => ({
      id: course.id,
      title: course.title,
      slug: course.slug,
      description: course.description,
      moduleCount: course.modules.length,
      totalQuizzes: course.modules.reduce((sum, module) => sum + module.quizzes.length, 0),
    }));
  } catch (error) {
    console.error('Erreur getPublishedCoursesSummary:', error);
    return [];
  }
}

/**
 * Récupère un cours par son slug avec ses modules et quiz
 */
export async function getCourseBySlug(slug: string) {
  try {
    const course = await prisma.course.findFirst({
      where: {
        slug,
        status: 'published',
      },
      include: {
        modules: {
          include: {
            quizzes: {
              where: INDEXABLE_QUIZ_WHERE,
              include: {
                questions: {
                  include: {
                    answers: true,
                  },
                  orderBy: {
                    order: 'asc',
                  },
                },
              },
              orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
            },
            lessons: {
              orderBy: { order: 'asc' },
            },
            _count: {
              select: {
                quizzes: true,
                lessons: true,
              },
            },
          },
          orderBy: {
            order: 'asc',
          },
        },
      },
    });

    if (!course) {
      return null;
    }

    // Convertir les quiz au format attendu par le frontend
    const courseWithConvertedQuizzes = {
      ...course,
      modules: course.modules.map((module) => ({
        ...module,
        quizzes: module.quizzes.map(convertPrismaQuizToQuiz),
        _count: {
          ...module._count,
          quizzes: module.quizzes.length,
        },
      })),
    };

    return courseWithConvertedQuizzes;
  } catch (error) {
    console.error(`Erreur getCourseBySlug(${slug}):`, error);
    
    // Vérifier si c'est une erreur de connexion
    if (error instanceof Error) {
      const errorMessage = error.message.toLowerCase();
      if (errorMessage.includes('connect') || errorMessage.includes('connection') || errorMessage.includes('database')) {
        throw new Error('Database connection error. Please check your DATABASE_URL configuration.');
      }
    }
    
    return null;
  }
}

/**
 * Récupère le nombre de cours publiés par type de test et retourne les slugs pour les liens
 */
export async function getCourseStatsByTestType() {
  try {
    const courses = await prisma.course.findMany({
      where: {
        status: 'published',
      },
      select: {
        title: true,
        slug: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Filtrer les cours par type de test en fonction du titre ou slug
    const actCourses = courses.filter(
      (course) =>
        course.title.toLowerCase().includes('act') ||
        course.slug.toLowerCase().includes('act')
    );

    const satCourses = courses.filter(
      (course) =>
        (course.title.toLowerCase().includes('sat') &&
          !course.title.toLowerCase().includes('psat')) ||
        (course.slug.toLowerCase().includes('sat') &&
          !course.slug.toLowerCase().includes('psat'))
    );

    const psatCourses = courses.filter(
      (course) =>
        course.title.toLowerCase().includes('psat') ||
        course.slug.toLowerCase().includes('psat')
    );

    return {
      act: {
        count: actCourses.length,
        slug: actCourses.length > 0 ? actCourses[0].slug : null,
      },
      sat: {
        count: satCourses.length,
        slug: satCourses.length > 0 ? satCourses[0].slug : null,
      },
      psat: {
        count: psatCourses.length,
        slug: psatCourses.length > 0 ? psatCourses[0].slug : null,
      },
    };
  } catch (error) {
    console.error('Erreur getCourseStatsByTestType:', error);
    return {
      act: { count: 0, slug: null },
      sat: { count: 0, slug: null },
      psat: { count: 0, slug: null },
    };
  }
}
