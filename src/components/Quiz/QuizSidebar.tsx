'use client';

import { useState } from 'react';
import type { Question } from '@/lib/types';
import MathRenderer from './MathRenderer';

interface QuizSidebarProps {
  questions: Question[];
  currentQuestionIndex: number;
  selectedAnswers: Record<number, string>;
  onQuestionSelect: (index: number) => void;
  isOpen: boolean;
  flaggedQuestions: Set<number>;
  onToggleFlag: (index: number) => void;
}

export default function QuizSidebar({
  questions,
  currentQuestionIndex,
  selectedAnswers,
  onQuestionSelect,
  isOpen,
  flaggedQuestions,
  onToggleFlag,
}: QuizSidebarProps) {
  const getQuestionStatus = (index: number) => {
    const hasAnswer = selectedAnswers[index] !== undefined;
    const isCurrent = index === currentQuestionIndex;
    
    if (isCurrent) {
      return 'current';
    }
    if (hasAnswer) {
      return 'answered';
    }
    return 'unanswered';
  };

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
    <aside className={`
      hidden lg:block sticky top-0 self-start w-80 bg-white shadow-[0_2px_10px_rgba(44,60,94,0.08)] z-40 overflow-y-auto border-r border-[#eae2d2] h-[calc(100vh-16rem)]
      transform transition-transform duration-300 ease-in-out
      ${isOpen ? 'translate-x-0' : '-translate-x-full'}
    `}>
      <div className="sticky top-0 z-10 border-b border-[#eae2d2] bg-white px-6 pb-6">
        <div className="mb-4">
          <h2 className="font-display text-xl font-semibold text-[#2c3c5e]">
            Quiz Questions
          </h2>
        </div>
          
          {/* Statistiques */}
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-[#3f7267]"></div>
              <span className="text-[#6b7180]">
                {Object.keys(selectedAnswers).length} answered
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-[#eae2d2]"></div>
              <span className="text-[#6b7180]">
                {questions.length - Object.keys(selectedAnswers).length} unanswered
              </span>
            </div>
            {flaggedQuestions.size > 0 && (
              <div className="flex items-center gap-2">
                <svg className="h-3 w-3 fill-current text-[#c79a55]" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                </svg>
                <span className="font-medium text-[#c79a55]">
                  {flaggedQuestions.size} flagged
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Liste des questions */}
        <div className="space-y-2 px-4 pb-4 pt-0">
          {questions.map((question, index) => {
            const status = getQuestionStatus(index);
            const questionText = getQuestionText(question, index);

            const isFlagged = flaggedQuestions.has(index);

            return (
              <div
                key={index}
                className={`
                  w-full rounded-[10px] border-2 transition-all duration-200
                  ${
                    status === 'current'
                      ? 'border-[#2c3c5e] bg-[#f8f2e7] shadow-sm'
                      : status === 'answered'
                      ? 'border-[#3f7267] bg-[#f0f7f5]'
                      : 'border-[#eae2d2] bg-white'
                  }
                  ${isFlagged ? 'ring-2 ring-[#c79a55] ring-offset-1' : ''}
                `}
              >
                <button
                  onClick={() => {
                    onQuestionSelect(index);
                  }}
                  className={`
                    w-full text-left p-4 rounded-[10px] transition-all duration-200
                    ${
                      status === 'current'
                        ? 'hover:bg-[#f3ebe0]'
                        : status === 'answered'
                        ? 'hover:bg-[#e8f2ef]'
                        : 'hover:bg-[#f8f2e7]'
                    }
                    transform hover:scale-[1.01] active:scale-[0.99]
                  `}
                >
                  <div className="flex items-start gap-3">
                    {/* Numéro de la question */}
                    <div
                      className={`
                        flex-shrink-0 w-8 h-8 rounded-md flex items-center justify-center font-bold text-sm
                        ${
                          status === 'current'
                            ? 'bg-[#2c3c5e] text-white'
                            : status === 'answered'
                            ? 'bg-[#3f7267] text-white'
                            : 'bg-[#f8f2e7] text-[#6b7180]'
                        }
                      `}
                    >
                      {index + 1}
                    </div>

                    {/* Texte de la question */}
                    <div className="min-w-0 flex-1">
                      <div
                        className={`
                          text-sm font-medium leading-relaxed
                          ${
                            status === 'current'
                              ? 'text-[#2c3c5e]'
                              : status === 'answered'
                              ? 'text-[#3f7267]'
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
                        <MathRenderer text={questionText} className="text-sm" />
                      </div>
                    </div>

                    {/* Indicateur de statut */}
                    <div className="flex flex-shrink-0 items-center gap-2">
                      {status === 'answered' && (
                        <svg className="h-5 w-5 text-[#3f7267]" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                      {status === 'current' && (
                        <div className="h-2 w-2 animate-pulse rounded-full bg-[#2c3c5e]"></div>
                      )}
                    </div>
                  </div>
                </button>
                
                {/* Bouton drapeau */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFlag(index);
                  }}
                  className={`
                    w-full px-4 pb-3 flex items-center justify-center transition-colors
                    ${isFlagged 
                      ? 'text-[#c79a55] hover:text-[#a87f3f]' 
                      : 'text-[#6b7180] hover:text-[#c79a55]'
                    }
                  `}
                  title={isFlagged ? 'Remove flag' : 'Flag this question'}
                >
                  <svg 
                    className={`h-5 w-5 ${isFlagged ? 'fill-current' : ''}`} 
                    fill={isFlagged ? 'currentColor' : 'none'} 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                  </svg>
                </button>
              </div>
            );
          })}
        </div>

        {/* Note en bas */}
        <div className="border-t border-[#eae2d2] bg-[#f8f2e7] p-4">
          <p className="text-center text-xs text-[#6b7180]">
            💡 Click on a question to access it directly
          </p>
        </div>
      </aside>
  );
}
