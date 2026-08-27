import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import { prisma } from '@/lib/db';
import { invalidatePublishedQuizzesCache } from '@/lib/cache';

export const dynamic = 'force-dynamic';

/**
 * PATCH /api/admin/quizzes/[id]/sync-settings
 * Body: { isEnabled?: boolean, lockLocalEdits?: boolean }
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authenticated = await isAdminAuthenticated();
    if (!authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const data: { isEnabled?: boolean; lockLocalEdits?: boolean } = {};

    if (typeof body.isEnabled === 'boolean') {
      data.isEnabled = body.isEnabled;
    }
    if (typeof body.lockLocalEdits === 'boolean') {
      data.lockLocalEdits = body.lockLocalEdits;
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { error: 'Aucun champ à mettre à jour' },
        { status: 400 }
      );
    }

    const quiz = await prisma.quiz.update({
      where: { id: params.id },
      data,
      select: {
        id: true,
        title: true,
        sourceQuizId: true,
        isEnabled: true,
        lockLocalEdits: true,
      },
    });

    invalidatePublishedQuizzesCache();

    return NextResponse.json({ quiz });
  } catch (error: unknown) {
    const err = error as { code?: string };
    if (err.code === 'P2025') {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
    }
    return NextResponse.json(
      { error: 'Failed to update sync settings' },
      { status: 500 }
    );
  }
}
