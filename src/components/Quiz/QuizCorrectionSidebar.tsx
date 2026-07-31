'use client';

import type { Question } from '@/lib/types';
import MathRenderer from './MathRenderer';

interface QuizCorrectionSidebarProps {
  questions: Question[];
  currentQuestionIndex: number;
  onQuestionSelect: (index: number) => void;
}

export default function QuizCorrectionSidebar({
  questions,
  currentQuestionIndex,
  onQuestionSelect,
}: QuizCorrectionSidebarProps) {
  const getQuestionText = (question: Question, index: number): string => {
    const text = question.texte_question || question.title?.rendered || '';
    if (!text || text.trim() === '') {
      return `Question ${index + 1}`;
    }
    // Retourner le texte complet pour que MathRenderer le traite
    // La troncature visuelle sera gérée par CSS (WebkitLineClamp)
    return text;
  };

  return (
    <aside className="sticky top-24 z-40 hidden h-[calc(100vh-12rem)] w-80 flex-shrink-0 flex-col self-start border-r border-[#eae2d2] bg-white shadow-[0_2px_10px_rgba(44,60,94,0.08)] lg:flex">
      <div className="flex-shrink-0 border-b border-[#eae2d2] bg-white px-6 py-4">
        <div className="mb-3">
          <h2 className="font-display text-lg font-semibold text-[#2c3c5e]">
            Quiz Questions
          </h2>
        </div>
        
        {/* Statistiques */}
        <div className="flex items-center gap-2 text-xs text-[#6b7180]">
          <div className="h-2 w-2 rounded-full bg-[#3f7267]"></div>
          <span>
            {questions.length} questions
          </span>
        </div>
      </div>

      {/* Liste des questions */}
      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto px-3 pb-4 pt-3">
        {questions.map((question, index) => {
          const isCurrent = index === currentQuestionIndex;
          const questionText = getQuestionText(question, index);
          const answers = question.reponses || question.acf?.reponses || [];
          const hasCorrectAnswer = answers.some((a: any) => 
            a.correcte === true || 
            a.correcte === 1 || 
            a.correcte === 'yes' ||
            a.is_correct === true ||
            a.is_correct === 1 ||
            a.is_correct === 'yes' ||
            a.correct === true
          );

          return (
            <div
              key={index}
              className={`
                w-full rounded-[10px] border-2 transition-all duration-200
                ${
                  isCurrent
                    ? 'border-[#2c3c5e] bg-[#f8f2e7] shadow-sm'
                    : 'border-[#eae2d2] bg-white hover:border-[#2c3c5e]/30 hover:shadow-sm'
                }
              `}
            >
              <button
                onClick={() => onQuestionSelect(index)}
                className={`
                  w-full text-left p-3 rounded-[10px] transition-all duration-200 relative
                  ${
                    isCurrent
                      ? 'hover:bg-[#f3ebe0]'
                      : 'hover:bg-[#f8f2e7]'
                  }
                `}
              >
                <div className="flex items-start gap-3">
                  {/* Numéro de la question */}
                  <div
                    className={`
                      flex-shrink-0 w-7 h-7 rounded-md flex items-center justify-center font-bold text-xs
                      ${
                        isCurrent
                          ? 'bg-[#2c3c5e] text-white'
                          : 'bg-[#f8f2e7] text-[#6b7180]'
                      }
                    `}
                  >
                    {index + 1}
                  </div>

                  {/* Texte de la question */}
                  <div className="min-w-0 flex-1 overflow-hidden">
                    <div
                      className={`
                        text-xs font-medium leading-snug
                        ${
                          isCurrent
                            ? 'text-[#2c3c5e]'
                            : 'text-[#6b7180]'
                        }
                      `}
                      style={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      <MathRenderer text={questionText} className="text-xs" />
                    </div>
                    {!hasCorrectAnswer && (
                      <div className="mt-1 text-xs text-[#c79a55]">⚠️ No answer</div>
                    )}
                  </div>

                  {/* Indicateur de statut */}
                  <div className="flex flex-shrink-0 items-center gap-1.5">
                    {isCurrent && (
                      <div className="h-1.5 w-1.5 rounded-full bg-[#2c3c5e]"></div>
                    )}
                    {hasCorrectAnswer && (
                      <svg className="h-4 w-4 flex-shrink-0 text-[#3f7267]" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </div>
              </button>
            </div>
          );
        })}
      </div>

      {/* Note en bas */}
      <div className="border-t border-[#eae2d2] bg-[#f8f2e7] px-3 py-3">
        <p className="text-center text-xs text-[#6b7180]">
          💡 Click to view correction
        </p>
      </div>
    </aside>
  );
}
