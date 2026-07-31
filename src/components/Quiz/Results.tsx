'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { QuizResults, Quiz, Question } from '@/lib/types';
import { getAllQuiz } from '@/lib/wordpress';
import { trackSimilarQuizClick } from '@/lib/analytics';
import { getCurrentUser } from '@/lib/auth-client';

interface ResultsProps {
  results: QuizResults;
  quizTitle: string;
  quizSlug: string;
  minimumScore?: number;
  quizId?: number;
  category?: string;
  questions?: Question[];
}

export default function Results({
  results,
  quizTitle,
  quizSlug,
  minimumScore = 70,
  quizId,
  category,
  questions = [],
}: ResultsProps) {
  const [similarQuizs, setSimilarQuizs] = useState<Quiz[]>([]);
  const [user, setUser] = useState<any>(null);
  const percentage = results.percentage;
  const passed = results.passed;
  const minutes = Math.floor(results.timeSpent / 60);
  const seconds = results.timeSpent % 60;

  useEffect(() => {
    getCurrentUser().then(setUser).catch(() => setUser(null));
  }, []);

  // Charger les quiz similaires
  useEffect(() => {
    const loadSimilarQuizs = async () => {
      try {
        const allQuizs = await getAllQuiz();
        // Filter by category if available, exclude current quiz
        const filtered = allQuizs
          .filter((q) => q.id !== quizId && (category ? q.acf?.categorie === category : true))
          .slice(0, 3);
        setSimilarQuizs(filtered);
      } catch (error) {
        console.error('Error loading similar quizzes:', error);
      }
    };

    if (quizId) {
      loadSimilarQuizs();
    }
  }, [quizId, category]);

  // Déterminer le message et l'icône selon le score
  let message = '';
  let icon = '';
  let scoreBgClass = '';
  let badgeClass = '';

  if (percentage >= 90) {
    message = 'Excellent!';
    icon = '🌟';
    scoreBgClass = 'bg-[#c79a55]';
    badgeClass = 'bg-[#faf6ee] text-[#c79a55] border-[#c79a55]/40';
  } else if (percentage >= 80) {
    message = 'Very Good!';
    icon = '👏';
    scoreBgClass = 'bg-[#3f7267]';
    badgeClass = 'bg-[#f0f7f5] text-[#3f7267] border-[#3f7267]/40';
  } else if (percentage >= minimumScore) {
    message = 'Well Done!';
    icon = '🎯';
    scoreBgClass = 'bg-[#2c3c5e]';
    badgeClass = 'bg-[#f8f2e7] text-[#2c3c5e] border-[#2c3c5e]/30';
  } else {
    message = 'Keep Up the Effort!';
    icon = '📚';
    scoreBgClass = 'bg-[#95586b]';
    badgeClass = 'bg-[#faf0f3] text-[#95586b] border-[#95586b]/40';
  }

  return (
    <div className="mx-auto max-w-3xl animate-scale-in">
      <div className="card-modern relative overflow-hidden p-8 md:p-12">
        <div className="relative z-10">
          {/* En-tête avec icône */}
          <div className="mb-10 text-center">
            <div className="mb-6 inline-block animate-bounce-slow text-7xl">
              {icon}
            </div>
            <h2 className="font-display mb-3 text-4xl font-semibold text-[#2c3c5e] md:text-5xl">
              {message}
            </h2>
            <p className="text-lg text-[#6b7180]">
              You have completed the quiz
            </p>
            <p className="mt-1 text-sm font-medium text-[#6b7180]">
              {quizTitle}
            </p>
            {/* Message si le temps est écoulé */}
            {results.timeExpired && (
              <div className="mt-4 inline-block rounded-[10px] border border-[#c79a55]/40 bg-[#faf6ee] p-4">
                <div className="flex items-center gap-2 text-[#c79a55]">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-semibold">Time expired! The quiz was automatically closed.</span>
                </div>
              </div>
            )}
          </div>

          {/* Score principal */}
          <div className={`relative mb-10 overflow-hidden rounded-[10px] p-8 text-white md:p-12 ${scoreBgClass}`}>
            <div className="relative z-10 text-center">
              <div className="mb-4 text-7xl font-black md:text-8xl">
                {percentage}%
              </div>
              <div className="text-xl font-semibold opacity-95 md:text-2xl">
                {results.correctAnswers} out of {results.totalQuestions} correct answers
              </div>
            </div>
          </div>

          {/* Statistiques détaillées */}
          <div className="mb-8 grid grid-cols-2 gap-4">
            <div className="rounded-[10px] border border-[#3f7267]/30 bg-[#f0f7f5] p-6 text-center transition-transform hover:scale-105">
              <div className="mb-2 text-4xl font-black text-[#3f7267]">
                {results.correctAnswers}
              </div>
              <div className="text-sm font-semibold uppercase tracking-wide text-[#3f7267]">
                Correct
              </div>
            </div>
            <div className="rounded-[10px] border border-[#95586b]/30 bg-[#faf0f3] p-6 text-center transition-transform hover:scale-105">
              <div className="mb-2 text-4xl font-black text-[#95586b]">
                {results.incorrectAnswers}
              </div>
              <div className="text-sm font-semibold uppercase tracking-wide text-[#95586b]">
                Incorrect
              </div>
            </div>
          </div>

          {/* Temps passé */}
          <div className="mb-8 rounded-[10px] border border-[#eae2d2] bg-[#f8f2e7] p-6 text-center">
            <div className="mb-2 text-sm font-semibold uppercase tracking-wide text-[#6b7180]">
              ⏱️ Time Spent
            </div>
            <div className="font-display text-3xl font-semibold text-[#2c3c5e]">
              {minutes > 0 && `${minutes} min `}
              {seconds} sec
            </div>
          </div>

          {/* Résultat (réussi/échoué) */}
          <div className={`mb-8 animate-fade-in rounded-[10px] border-2 p-5 text-center text-lg font-bold ${badgeClass}`}>
            {passed ? (
              <span className="flex items-center justify-center gap-2">
                <span className="text-2xl">✅</span>
                Quiz Passed! Minimum score required: {minimumScore}%
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <span className="text-2xl">⚠️</span>
                Insufficient Score. Minimum score required: {minimumScore}%
              </span>
            )}
          </div>

          {/* Quiz similaires */}
          {similarQuizs.length > 0 && (
            <div className="mb-8">
              <h3 className="font-display mb-4 text-xl font-semibold text-[#2c3c5e]">Similar Quizzes</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {similarQuizs.map((quiz) => (
                  <Link
                    key={quiz.id}
                    href={`/quiz/${quiz.slug}`}
                    onClick={() => trackSimilarQuizClick(quiz.id, quiz.title.rendered.replace(/<[^>]*>/g, ''))}
                    className="card-modern p-4 transition-transform hover:scale-105"
                  >
                    <h4 className="mb-2 line-clamp-2 font-semibold text-[#2c3c5e]">
                      {quiz.title.rendered.replace(/<[^>]*>/g, '')}
                    </h4>
                    <p className="text-sm text-[#6b7180]">
                      {quiz.acf?.nombre_questions || 0} questions
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Bouton pour voir la correction */}
          {questions.length > 0 && (
            <div className="mb-8">
              <Link
                href={`/quiz/${quizSlug}/correction`}
                className="flex w-full items-center justify-center gap-2 rounded-md bg-[#2c3c5e] px-6 py-4 font-semibold text-white transition hover:bg-[#1d2a45]"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                View Full Correction
              </Link>
            </div>
          )}


          {/* Actions */}
          <div className="flex flex-col gap-4 sm:flex-row">
            <Link
              href={`/quiz/${quizSlug}?reset=true`}
              onClick={(e) => {
                // Nettoyer la progression sauvegardée avant de refaire le quiz
                if (quizId) {
                  localStorage.removeItem(`quiz-progress-${quizId}`);
                }
              }}
              className="btn-primary flex-1 py-4 text-center text-lg"
            >
              🔄 Retake Quiz
            </Link>
            {user && (
              <Link
                href="/dashboard"
                className="btn-secondary flex-1 py-4 text-center text-lg"
              >
                📊 View Dashboard
              </Link>
            )}
            <Link
              href="/quiz"
              className="btn-secondary flex-1 py-4 text-center text-lg"
            >
              📚 View Other Quizzes
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
