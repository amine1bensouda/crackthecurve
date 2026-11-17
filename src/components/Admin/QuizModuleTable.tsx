'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import DeleteQuizButton from './DeleteQuizButton';
import { difficultyToEnglish, stripHtml } from '@/lib/utils';

export type AdminQuizRow = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  difficulty: string | null;
  order: number;
  questionCount: number;
};

interface QuizModuleTableProps {
  quizzes: AdminQuizRow[];
  canReorder: boolean;
}

export default function QuizModuleTable({ quizzes: initialQuizzes, canReorder }: QuizModuleTableProps) {
  const router = useRouter();
  const [quizzes, setQuizzes] = useState(initialQuizzes);
  const [loading, setLoading] = useState(false);
  const quizSignature = initialQuizzes.map((quiz) => `${quiz.id}:${quiz.order}`).join('|');

  useEffect(() => {
    setQuizzes(initialQuizzes);
  }, [quizSignature, initialQuizzes]);

  const reorder = async (fromIndex: number, direction: 'up' | 'down') => {
    const toIndex = direction === 'up' ? fromIndex - 1 : fromIndex + 1;
    if (toIndex < 0 || toIndex >= quizzes.length || loading) return;

    const next = [...quizzes];
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);

    setLoading(true);
    try {
      const res = await fetch('/api/admin/quizzes/order', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quizIds: next.map((quiz) => quiz.id) }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to reorder quizzes');
      }
      setQuizzes(next.map((quiz, index) => ({ ...quiz, order: index })));
      router.refresh();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to reorder quizzes');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            {canReorder && (
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-24">
                Order
              </th>
            )}
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Title
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Slug
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Questions
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Difficulty
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {quizzes.map((quiz, index) => {
            const difficulty = quiz.difficulty;
            const isEmpty =
              !difficulty || String(difficulty).trim() === '' || difficulty === 'Moyen';
            const label = isEmpty ? 'Not specified' : difficultyToEnglish(difficulty ?? undefined);

            return (
              <tr key={quiz.id} className="hover:bg-gray-50 transition-colors">
                {canReorder && (
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => reorder(index, 'up')}
                        disabled={index === 0 || loading}
                        className="p-1.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-gray-600"
                        title="Move up"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => reorder(index, 'down')}
                        disabled={index === quizzes.length - 1 || loading}
                        className="p-1.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-gray-600"
                        title="Move down"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    </div>
                  </td>
                )}
                <td className="px-6 py-3">
                  <div className="font-semibold text-gray-900">{quiz.title || 'No title'}</div>
                  {quiz.description && (
                    <div className="text-sm text-gray-500 mt-1 truncate max-w-xl">
                      {stripHtml(quiz.description)}
                    </div>
                  )}
                </td>
                <td className="px-6 py-3">
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-700">{quiz.slug}</code>
                </td>
                <td className="px-6 py-3 text-gray-700">{quiz.questionCount}</td>
                <td className="px-6 py-3">
                  <span
                    className={`px-3 py-1 text-xs font-medium rounded-full ${
                      isEmpty ? 'bg-gray-100 text-gray-600' : 'bg-indigo-100 text-indigo-800'
                    }`}
                  >
                    {label}
                  </span>
                </td>
                <td className="px-6 py-3">
                  <div className="flex items-center space-x-2">
                    <Link
                      href={`/admin/quizzes/${encodeURIComponent(quiz.slug)}/edit`}
                      className="px-3 py-1 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                    >
                      Edit
                    </Link>
                    <DeleteQuizButton quizId={quiz.id} quizTitle={quiz.title || 'No title'} />
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
