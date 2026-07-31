'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser, getQuizStats, logout, type User } from '@/lib/auth-client';
import { formatDuration } from '@/lib/utils';
import LoadingSpinner from '@/components/Layout/LoadingSpinner';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUserAndStats() {
      try {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
          router.push('/login');
          return;
        }
        setUser(currentUser);
        const userStats = await getQuizStats();
        setStats(userStats);
      } catch (error) {
        console.error('Error loading user:', error);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    }
    loadUserAndStats();
  }, [router]);

  const handleLogout = async () => {
    await logout();
    router.push('/');
    router.refresh();
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fdfbf7]">
        <div className="flex flex-col items-center gap-5 text-center">
          <LoadingSpinner size="lg" />
          <p className="font-display text-lg font-semibold text-[#2c3c5e]">Loading…</p>
        </div>
      </div>
    );
  }

  if (!user || !stats) {
    return null;
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getScoreColor = (percentage: number) => {
    if (percentage >= 90) return 'text-[#3f7267] bg-[#f8f2e7] border-[#eae2d2]';
    if (percentage >= 70) return 'text-[#2c3c5e] bg-[#f8f2e7] border-[#eae2d2]';
    if (percentage >= 50) return 'text-[#c79a55] bg-[#f8f2e7] border-[#eae2d2]';
    return 'text-[#95586b] bg-[#f8f2e7] border-[#eae2d2]';
  };

  return (
    <div className="min-h-screen bg-[#fdfbf7]">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="font-display mb-2 text-4xl font-semibold text-[#2c3c5e] md:text-5xl">
                Dashboard
              </h1>
              <p className="text-[#6b7180]">Welcome back, {user.name}!</p>
            </div>
            <button
              onClick={handleLogout}
              className="rounded-md border border-[#eae2d2] bg-white px-6 py-3 font-semibold text-[#2c3c5e] transition hover:bg-[#f8f2e7]"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-4">
          <div className="rounded-[10px] border border-[#eae2d2] bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-md bg-[linear-gradient(135deg,#3f7267,#2c3c5e)]">
                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
            <div className="font-display mb-1 text-3xl font-semibold text-[#2c3c5e]">{stats.totalAttempts}</div>
            <div className="text-sm text-[#6b7180]">Total Attempts</div>
          </div>

          <div className="rounded-[10px] border border-[#eae2d2] bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-md bg-[linear-gradient(135deg,#3f7267,#2c3c5e)]">
                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="font-display mb-1 text-3xl font-semibold text-[#2c3c5e]">{stats.averageScore}%</div>
            <div className="text-sm text-[#6b7180]">Average Score</div>
          </div>

          <div className="rounded-[10px] border border-[#eae2d2] bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-md bg-[linear-gradient(135deg,#3f7267,#2c3c5e)]">
                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <div className="font-display mb-1 text-3xl font-semibold text-[#2c3c5e]">{stats.passedQuizzes}</div>
            <div className="text-sm text-[#6b7180]">Passed Quizzes</div>
          </div>

          <div className="rounded-[10px] border border-[#eae2d2] bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-md bg-[linear-gradient(135deg,#3f7267,#2c3c5e)]">
                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="font-display mb-1 text-3xl font-semibold text-[#2c3c5e]">
              {formatDuration(Math.floor(stats.totalTimeSpent / 60))}
            </div>
            <div className="text-sm text-[#6b7180]">Time Spent</div>
          </div>
        </div>

        {/* Quiz History */}
        <div className="overflow-hidden rounded-[10px] border border-[#eae2d2] bg-white">
          <div className="border-b border-[#eae2d2] p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl font-semibold text-[#2c3c5e]">Quiz History</h2>
              <Link
                href="/quiz"
                className="flex items-center gap-2 font-semibold text-[#2c3c5e] hover:text-[#1d2a45]"
              >
                Take New Quiz
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </div>

          {stats.attempts.length === 0 ? (
            <div className="p-12 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-md bg-[#f8f2e7] text-[#3f7267]">
                <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="font-display mb-2 text-xl font-semibold text-[#2c3c5e]">No quiz attempts yet</h3>
              <p className="mb-6 text-[#6b7180]">Start taking quizzes to track your progress!</p>
              <Link
                href="/quiz"
                className="inline-flex items-center gap-2 rounded-md bg-[#2c3c5e] px-5 py-3 font-semibold text-white transition hover:bg-[#1d2a45]"
              >
                Browse Quizzes
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-[#eae2d2]">
              {stats.attempts
                .sort((a: any, b: any) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
                .map((attempt: any, index: number) => (
                  <div key={index} className="p-6 transition-colors hover:bg-[#f8f2e7]/40">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="mb-3 flex items-center gap-4">
                          <Link
                            href={`/quiz/${attempt.quizSlug}`}
                            className="font-display text-lg font-semibold text-[#2c3c5e] transition-colors hover:text-[#3f7267]"
                          >
                            {attempt.quizTitle}
                          </Link>
                          <span className={`rounded-md border px-3 py-1 text-sm font-semibold ${getScoreColor(attempt.percentage)}`}>
                            {attempt.percentage}%
                          </span>
                        </div>
                        <div className="flex items-center gap-6 text-sm text-[#6b7180]">
                          <span className="flex items-center gap-1.5">
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {attempt.correctAnswers} / {attempt.totalQuestions} correct
                          </span>
                          <span className="flex items-center gap-1.5">
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {formatDuration(Math.floor(attempt.timeSpent / 60))}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {formatDate(attempt.completedAt)}
                          </span>
                        </div>
                      </div>
                      <Link
                        href={`/quiz/${attempt.quizSlug}`}
                        className="ml-4 rounded-md border border-[#eae2d2] bg-white px-4 py-2 font-semibold text-[#2c3c5e] transition hover:bg-[#f8f2e7]"
                      >
                        Retake
                      </Link>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
