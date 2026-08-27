import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import {
  getApprovedComments,
  isValidTargetType,
  sanitizeCommentContent,
  type CommentTargetType,
} from '@/lib/comments';

export const dynamic = 'force-dynamic';

/**
 * GET /api/comments?targetType=quiz&targetSlug=my-quiz
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const targetType = searchParams.get('targetType') || '';
    const targetSlug = searchParams.get('targetSlug')?.trim() || '';

    if (!isValidTargetType(targetType) || !targetSlug) {
      return NextResponse.json(
        { error: 'targetType and targetSlug are required' },
        { status: 400 }
      );
    }

    const comments = await getApprovedComments(targetType as CommentTargetType, targetSlug);
    return NextResponse.json(comments);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('GET /api/comments:', error);
    return NextResponse.json({ error: 'Failed to fetch comments', details: message }, { status: 500 });
  }
}

/**
 * POST /api/comments — nouveau commentaire (en attente de modération)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const targetType = String(body.targetType || '');
    const targetSlug = String(body.targetSlug || '').trim();
    const authorName = String(body.authorName || '').trim();
    const authorEmail = body.authorEmail ? String(body.authorEmail).trim() : null;
    const content = sanitizeCommentContent(String(body.content || ''));

    if (!isValidTargetType(targetType) || !targetSlug) {
      return NextResponse.json(
        { error: 'Invalid targetType or targetSlug' },
        { status: 400 }
      );
    }

    if (!authorName || authorName.length < 2) {
      return NextResponse.json(
        { error: 'Name is required (min. 2 characters)' },
        { status: 400 }
      );
    }

    if (!content || content.length < 3) {
      return NextResponse.json(
        { error: 'Comment is required (min. 3 characters)' },
        { status: 400 }
      );
    }

    if (authorEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(authorEmail)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    const comment = await prisma.comment.create({
      data: {
        targetType,
        targetSlug,
        authorName: authorName.slice(0, 120),
        authorEmail: authorEmail?.slice(0, 255) || null,
        content,
        status: 'pending',
      },
      select: {
        id: true,
        status: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      {
        ...comment,
        message:
          'Your comment has been submitted and will appear after approval.',
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('POST /api/comments:', error);
    return NextResponse.json({ error: 'Failed to submit comment', details: message }, { status: 500 });
  }
}
