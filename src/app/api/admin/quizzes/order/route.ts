import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { adminGuard } from '@/lib/admin-auth';
import { invalidatePublishedQuizzesCache } from '@/lib/cache';

/**
 * PATCH /api/admin/quizzes/order
 * Met à jour l'ordre des quiz d'un même module.
 * Body: { quizIds: string[] } — ids dans le nouvel ordre, tous les quiz du module.
 */
export async function PATCH(request: NextRequest) {
  try {
    const denied = await adminGuard();
    if (denied) return denied;

    const body = await request.json();
    const { quizIds } = body;

    if (!Array.isArray(quizIds) || quizIds.length === 0 || quizIds.some((id) => typeof id !== 'string')) {
      return NextResponse.json(
        { error: 'quizIds must be a non-empty array of strings' },
        { status: 400 }
      );
    }

    if (new Set(quizIds).size !== quizIds.length) {
      return NextResponse.json({ error: 'Duplicate quiz ids' }, { status: 400 });
    }

    const quizzes = await prisma.quiz.findMany({
      where: { id: { in: quizIds } },
      select: { id: true, moduleId: true },
    });

    if (quizzes.length !== quizIds.length) {
      return NextResponse.json({ error: 'Some quizzes were not found' }, { status: 400 });
    }

    const moduleIds = new Set(quizzes.map((quiz) => quiz.moduleId));
    if (moduleIds.size !== 1) {
      return NextResponse.json(
        { error: 'Quizzes must belong to the same module' },
        { status: 400 }
      );
    }

    const moduleId = quizzes[0].moduleId;
    const allInModule = await prisma.quiz.findMany({
      where: { moduleId },
      select: { id: true },
    });

    if (allInModule.length !== quizIds.length) {
      return NextResponse.json(
        { error: 'The list must include every quiz of this module' },
        { status: 400 }
      );
    }

    await prisma.$transaction(
      quizIds.map((quizId: string, index: number) =>
        prisma.quiz.update({
          where: { id: quizId },
          data: { order: index },
        })
      )
    );

    invalidatePublishedQuizzesCache();

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error('Erreur reorder quizzes:', error);
    return NextResponse.json(
      { error: 'Failed to reorder quizzes', details: error.message },
      { status: 500 }
    );
  }
}
