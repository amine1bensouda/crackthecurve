import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { isValidCommentStatus } from '@/lib/comments';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: Promise<{ id: string }> | { id: string };
}

/**
 * PATCH /api/admin/comments/[id] — { status: 'approved' | 'rejected' | 'pending' }
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await Promise.resolve(params);
    const body = await request.json();
    const status = String(body.status || '');

    if (!isValidCommentStatus(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const comment = await prisma.comment.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json(comment);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    if (message.includes('Record to update not found')) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }
    console.error('PATCH /api/admin/comments/[id]:', error);
    return NextResponse.json({ error: 'Failed to update comment', details: message }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/comments/[id]
 */
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await Promise.resolve(params);
    await prisma.comment.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    if (message.includes('Record to delete does not exist')) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }
    console.error('DELETE /api/admin/comments/[id]:', error);
    return NextResponse.json({ error: 'Failed to delete comment', details: message }, { status: 500 });
  }
}
