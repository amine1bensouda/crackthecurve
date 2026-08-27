import { prisma } from '@/lib/db';

export const COMMENT_TARGET_TYPES = ['blog', 'quiz', 'lesson'] as const;
export type CommentTargetType = (typeof COMMENT_TARGET_TYPES)[number];

export const COMMENT_STATUSES = ['pending', 'approved', 'rejected'] as const;
export type CommentStatus = (typeof COMMENT_STATUSES)[number];

export function isValidTargetType(value: string): value is CommentTargetType {
  return (COMMENT_TARGET_TYPES as readonly string[]).includes(value);
}

export function isValidCommentStatus(value: string): value is CommentStatus {
  return (COMMENT_STATUSES as readonly string[]).includes(value);
}

export function sanitizeCommentContent(content: string): string {
  return content.trim().slice(0, 5000);
}

export async function getApprovedComments(targetType: CommentTargetType, targetSlug: string) {
  return prisma.comment.findMany({
    where: {
      targetType,
      targetSlug,
      status: 'approved',
    },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      authorName: true,
      content: true,
      createdAt: true,
    },
  });
}

export function getTargetLabel(targetType: CommentTargetType, targetSlug: string): string {
  const labels: Record<CommentTargetType, string> = {
    blog: 'Article',
    quiz: 'Quiz',
    lesson: 'Leçon',
  };
  return `${labels[targetType]} : ${targetSlug}`;
}
