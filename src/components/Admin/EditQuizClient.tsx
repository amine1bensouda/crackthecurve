'use client';

import { useEffect, useState } from 'react';
import QuizForm from '@/components/Admin/QuizForm';
import QuizSyncSettings from '@/components/Admin/QuizSyncSettings';
import EditorErrorBoundary from '@/components/Admin/EditorErrorBoundary';

type QuizPayload = {
  id: string;
  title: string;
  slug: string;
  moduleId: string;
  description: string;
  excerpt: string;
  metaTitle: string;
  metaDescription: string;
  duration?: number;
  difficulty?: string;
  passingGrade?: number;
  randomizeOrder: boolean;
  maxQuestions?: number;
  featuredImageUrl: string;
  sourceQuizId: string | null;
  isEnabled: boolean;
  lockLocalEdits: boolean;
  sourceSyncedAt: string | null;
  questions: Array<{
    id?: string;
    text: string;
    type: string;
    points: number;
    explanation: string;
    timeLimit?: number;
    order: number;
    answers: Array<{
      id?: string;
      text: string;
      isCorrect: boolean;
      explanation: string;
      imageUrl?: string;
      order: number;
    }>;
  }>;
};

export default function EditQuizClient({ quizId }: { quizId: string }) {
  const [quiz, setQuiz] = useState<QuizPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/admin/quizzes/${encodeURIComponent(quizId)}`, {
          credentials: 'include',
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to load quiz');
        if (!cancelled) setQuiz(data);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Failed to load quiz');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [quizId]);

  if (loading) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-gray-600">
        Loading quiz…
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center text-red-700">
        {error || 'Quiz not found'}
      </div>
    );
  }

  const { sourceQuizId, isEnabled, lockLocalEdits, sourceSyncedAt, ...formData } = quiz;

  return (
    <div className="space-y-6">
      <QuizSyncSettings
        quizId={quiz.id}
        sourceQuizId={sourceQuizId}
        isEnabled={isEnabled}
        lockLocalEdits={lockLocalEdits}
        sourceSyncedAt={sourceSyncedAt}
      />
      <EditorErrorBoundary
        fallback={
          <div className="rounded-xl border border-amber-300 bg-amber-50 p-6 text-amber-900">
            Impossible d&apos;afficher le formulaire d&apos;édition. Rechargez la page
            (Ctrl+F5). Si le problème continue, éditez un quiz plus court ou retirez
            les images base64.
          </div>
        }
      >
        <QuizForm initialData={formData} />
      </EditorErrorBoundary>
    </div>
  );
}
