import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { isValidCommentStatus } from '@/lib/comments';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/comments?status=pending|approved|rejected|all
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get('status') || 'pending';

    const where =
      statusFilter === 'all'
        ? {}
        : isValidCommentStatus(statusFilter)
          ? { status: statusFilter }
          : { status: 'pending' };

    const comments = await prisma.comment.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 200,
    });

    const counts = await prisma.comment.groupBy({
      by: ['status'],
      _count: { id: true },
    });

    const countByStatus = Object.fromEntries(
      counts.map((c) => [c.status, c._count.id])
    );

    return NextResponse.json({ comments, countByStatus });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('GET /api/admin/comments:', error);
    return NextResponse.json({ error: 'Failed to fetch comments', details: message }, { status: 500 });
  }
}
