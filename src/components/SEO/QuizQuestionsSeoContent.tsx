'use client';

import type { Quiz } from '@/lib/types';
import { questionStemNeedsHtmlRenderer } from '@/lib/utils';
import MathRenderer from '@/components/Quiz/MathRenderer';
import HtmlWithMathRenderer from '@/components/Common/HtmlWithMathRenderer';

function prepareStem(raw: string | undefined | null, fallback: string): string {
  if (!raw || !raw.trim()) return fallback;
  return raw;
}

function QuizMathText({ raw, fallback }: { raw: string | undefined | null; fallback: string }) {
  const text = prepareStem(raw, fallback);
  if (!text.trim()) return null;

  if (questionStemNeedsHtmlRenderer(text)) {
    return (
      <HtmlWithMathRenderer
        html={text}
        className="prose prose-sm max-w-none inline"
      />
    );
  }

  // Nettoyage léger comme Question.tsx (sans stripper le LaTeX)
  const cleaned = text
    .replace(/<p[^>]*>/gi, '')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/?div[^>]*>/gi, ' ')
    .replace(/<\/?span[^>]*>/gi, '');

  return <MathRenderer text={cleaned || fallback} />;
}

/**
 * Questions en HTML (SSR client) avec KaTeX — lisibles humains + crawlables.
 * Placées AVANT le QuizPlayer pour apparaître tôt dans le HTML.
 */
export default function QuizQuestionsSeoContent({ quiz }: { quiz: Quiz }) {
  const questions = quiz.acf?.questions || [];
  if (questions.length === 0) return null;

  return (
    <section
      aria-label="Quiz questions"
      className="mb-10 rounded-2xl border border-gray-200 bg-white p-6 md:p-8"
      data-seo-quiz-questions="true"
    >
      <h2 className="text-2xl font-bold text-gray-900">
        Questions in this quiz ({questions.length})
      </h2>
      <ol className="mt-6 space-y-6 list-decimal list-inside">
        {questions.map((question, index) => {
          const raw =
            question.texte_question ||
            question.title?.rendered ||
            question.content?.rendered ||
            `Question ${index + 1}`;
          const answers = question.reponses || question.acf?.reponses || [];

          return (
            <li key={question.id ?? index} className="text-gray-900">
              <span className="font-medium leading-relaxed [&>*]:inline">
                <QuizMathText raw={raw} fallback={`Question ${index + 1}`} />
              </span>
              {answers.length > 0 && (
                <ul className="mt-2 ml-5 list-disc space-y-1 text-gray-700">
                  {answers.map((answer, answerIndex) => {
                    if (!answer.texte?.trim()) return null;
                    return (
                      <li key={answerIndex} className="[&>*]:inline">
                        <QuizMathText raw={answer.texte} fallback="" />
                      </li>
                    );
                  })}
                </ul>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
