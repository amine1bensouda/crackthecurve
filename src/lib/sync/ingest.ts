import { prisma } from '@/lib/db';
import { invalidatePublishedQuizzesCache } from '@/lib/cache';
import type { SyncCoursePayload, SyncModulePayload, SyncQuizPayload } from './types';
import { verifyPayloadHash } from './hash';

async function upsertCourse(course: SyncCoursePayload) {
  const existing = await prisma.course.findUnique({
    where: { slug: course.slug },
  });

  if (existing) {
    return prisma.course.update({
      where: { id: existing.id },
      data: {
        title: course.title,
        description: course.description,
        status: course.status,
      },
    });
  }

  return prisma.course.create({
    data: {
      title: course.title,
      slug: course.slug,
      description: course.description,
      status: course.status,
    },
  });
}

async function upsertModule(module: SyncModulePayload, courseId: string) {
  const existing = await prisma.module.findUnique({
    where: {
      courseId_slug: { courseId, slug: module.slug },
    },
  });

  if (existing) {
    return prisma.module.update({
      where: { id: existing.id },
      data: {
        title: module.title,
        description: module.description,
        order: module.order,
      },
    });
  }

  return prisma.module.create({
    data: {
      courseId,
      title: module.title,
      slug: module.slug,
      description: module.description,
      order: module.order,
    },
  });
}

async function resolveModuleId(
  modulePayload: SyncModulePayload | null
): Promise<string | null> {
  if (!modulePayload) return null;

  let courseId: string | null = null;
  if (modulePayload.course) {
    const course = await upsertCourse(modulePayload.course);
    courseId = course.id;
  }

  if (!courseId) return null;

  const mod = await upsertModule(modulePayload, courseId);
  return mod.id;
}

async function replaceQuizQuestions(
  quizId: string,
  questions: SyncQuizPayload['questions']
) {
  await prisma.answer.deleteMany({
    where: { question: { quizId } },
  });
  await prisma.question.deleteMany({ where: { quizId } });

  for (const q of questions) {
    await prisma.question.create({
      data: {
        quizId,
        sourceQuestionId: q.sourceQuestionId,
        text: q.text,
        type: q.type,
        points: q.points,
        explanation: q.explanation,
        timeLimit: q.timeLimit,
        order: q.order,
        answers: {
          create: q.answers.map((a) => ({
            sourceAnswerId: a.sourceAnswerId,
            text: a.text,
            isCorrect: a.isCorrect,
            explanation: a.explanation,
            imageUrl: a.imageUrl,
            order: a.order,
          })),
        },
      },
    });
  }
}

export async function ingestQuizFromPremium(payload: SyncQuizPayload) {
  if (!verifyPayloadHash(payload)) {
    throw new Error('Hash du payload invalide');
  }

  const moduleId = await resolveModuleId(payload.quiz.module);
  const now = new Date();

  const existing = await prisma.quiz.findUnique({
    where: { sourceQuizId: payload.sourceQuizId },
  });

  if (existing?.lockLocalEdits) {
    await prisma.syncLog.create({
      data: {
        sourceQuizId: payload.sourceQuizId,
        localQuizId: existing.id,
        action: 'update_blocked',
        status: 'failed',
        details: 'lockLocalEdits est activé sur ce quiz',
      },
    });
    throw new Error(
      'Synchronisation refusée : éditions locales verrouillées (lockLocalEdits)'
    );
  }

  const quizData = {
    title: payload.quiz.title,
    slug: payload.quiz.slug,
    description: payload.quiz.description,
    excerpt: payload.quiz.excerpt,
    duration: payload.quiz.duration,
    difficulty: payload.quiz.difficulty ?? '',
    passingGrade: payload.quiz.passingGrade,
    randomizeOrder: payload.quiz.randomizeOrder,
    maxQuestions: payload.quiz.maxQuestions,
    featuredImageUrl: payload.quiz.featuredImageUrl,
    order: payload.quiz.order,
    moduleId,
    sourceQuizId: payload.sourceQuizId,
    sourceSyncedAt: now,
    sourcePayloadHash: payload.payloadHash,
    isEnabled: true,
  };

  let localQuizId: string;
  let localSlug: string;
  let action: 'created' | 'updated';

  if (existing) {
    const updated = await prisma.quiz.update({
      where: { id: existing.id },
      data: quizData,
    });
    localQuizId = updated.id;
    localSlug = updated.slug;
    action = 'updated';
    await replaceQuizQuestions(existing.id, payload.questions);
  } else {
    const slugTaken = await prisma.quiz.findUnique({
      where: { slug: payload.quiz.slug },
    });
    const slug = slugTaken
      ? `${payload.quiz.slug}-${payload.sourceQuizId.slice(-6)}`
      : payload.quiz.slug;

    const created = await prisma.quiz.create({
      data: { ...quizData, slug },
    });
    localQuizId = created.id;
    localSlug = created.slug;
    action = 'created';
    await replaceQuizQuestions(created.id, payload.questions);
  }

  await prisma.syncLog.create({
    data: {
      sourceQuizId: payload.sourceQuizId,
      localQuizId,
      action,
      status: 'success',
      details: JSON.stringify({
        questionCount: payload.questions.length,
        payloadHash: payload.payloadHash,
      }),
    },
  });

  invalidatePublishedQuizzesCache();

  return {
    ok: true as const,
    localQuizId,
    localSlug,
    syncedAt: now.toISOString(),
    action,
  };
}
