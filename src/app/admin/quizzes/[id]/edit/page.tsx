import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import EditQuizClient from '@/components/Admin/EditQuizClient';

export const dynamic = 'force-dynamic';

export default async function EditQuizPage({ params }: { params: { id: string } }) {
  const rawId = typeof params.id === 'string' ? params.id : '';
  const decodedId = decodeURIComponent(rawId);

  // Vérification légère uniquement (pas de questions) pour éviter un payload RSC énorme
  let quiz =
    (await prisma.quiz.findUnique({
      where: { id: decodedId },
      select: { id: true, title: true },
    })) ||
    (await prisma.quiz.findUnique({
      where: { slug: decodedId },
      select: { id: true, title: true },
    }));

  if (!quiz && decodedId.includes(' ')) {
    quiz = await prisma.quiz.findFirst({
      where: { slug: decodedId.replace(/\s+/g, '-') },
      select: { id: true, title: true },
    });
  }
  if (!quiz) {
    const normalizedSlug = decodedId.replace(/\s+/g, '-').toLowerCase();
    quiz = await prisma.quiz.findFirst({
      where: { slug: normalizedSlug },
      select: { id: true, title: true },
    });
  }

  if (!quiz) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
          Edit Quiz
        </h1>
        <p className="text-gray-600">{quiz.title}</p>
      </div>
      <EditQuizClient quizId={quiz.id} />
    </div>
  );
}
