'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import RichTextEditor from './RichTextEditor';
import HtmlWithMathRenderer from '@/components/Common/HtmlWithMathRenderer';
import { restoreQuestionMarkup } from '@/lib/utils';

interface Answer {
  id?: string;
  text: string;
  isCorrect: boolean;
  explanation: string;
  imageUrl?: string;
  order: number;
}

interface Question {
  id?: string;
  text: string;
  type: string;
  points: number;
  explanation: string;
  timeLimit?: number;
  order: number;
  answers: Answer[];
}

interface QuestionEditorProps {
  question: Question;
  index: number;
  onUpdate: (question: Question) => void;
  onDelete: () => void;
  /** Ouvert par défaut (ex. première question) */
  defaultExpanded?: boolean;
  /** Contrôle externe de l'accordéon (un seul ouvert à la fois) */
  expanded?: boolean;
  onToggle?: () => void;
}

export default function QuestionEditor({
  question,
  index,
  onUpdate,
  onDelete,
  defaultExpanded = false,
  expanded: expandedProp,
  onToggle,
}: QuestionEditorProps) {
  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded);
  const expanded = expandedProp ?? internalExpanded;
  const [localQuestion, setLocalQuestion] = useState<Question>(question);
  const questionIdRef = useRef<string | undefined>(question.id);

  useEffect(() => {
    if (question.id !== questionIdRef.current) {
      setLocalQuestion(question);
      questionIdRef.current = question.id;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question.id]);

  const toggleExpanded = () => {
    if (onToggle) {
      onToggle();
      return;
    }
    setInternalExpanded((v) => !v);
  };

  const updateQuestion = useCallback(
    (updates: Partial<Question>) => {
      setLocalQuestion((prev) => {
        const updated = { ...prev, ...updates };
        queueMicrotask(() => {
          onUpdate(updated);
        });
        return updated;
      });
    },
    [onUpdate]
  );

  const handleAnswerChange = (answerIndex: number, updates: Partial<Answer>) => {
    const newAnswers = [...localQuestion.answers];
    newAnswers[answerIndex] = { ...newAnswers[answerIndex], ...updates };
    updateQuestion({ answers: newAnswers });
  };

  const handleAddAnswer = () => {
    const newAnswer: Answer = {
      text: '',
      isCorrect: false,
      explanation: '',
      imageUrl: '',
      order: localQuestion.answers.length,
    };
    updateQuestion({ answers: [...localQuestion.answers, newAnswer] });
  };

  const handleDeleteAnswer = (answerIndex: number) => {
    const newAnswers = localQuestion.answers.filter((_, i) => i !== answerIndex);
    updateQuestion({ answers: newAnswers.map((a, i) => ({ ...a, order: i })) });
  };

  const correctCount = localQuestion.answers?.filter((a) => a.isCorrect).length || 0;
  const previewHtml = restoreQuestionMarkup(localQuestion.text || '');

  return (
    <div
      id={`admin-question-${index}`}
      className="scroll-mt-4 border border-gray-300 rounded-lg bg-gray-50 overflow-hidden"
    >
      <div className="flex items-start justify-between gap-3 p-4">
        <button
          type="button"
          onClick={toggleExpanded}
          className="flex-1 text-left min-w-0"
        >
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-gray-500 text-sm font-mono">{expanded ? '[-]' : '[+]'}</span>
            <h3 className="text-lg font-semibold text-gray-900">Question {index + 1}</h3>
            <span className="text-xs text-gray-500">
              {localQuestion.answers?.length || 0} réponse(s)
            </span>
            {correctCount > 0 ? (
              <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                {correctCount} correcte{correctCount > 1 ? 's' : ''}
              </span>
            ) : (
              <span className="text-xs font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                aucune bonne réponse
              </span>
            )}
            <span className="text-xs text-gray-400">{localQuestion.points} pt</span>
          </div>
          {!expanded && previewHtml ? (
            <div className="mt-2 pl-6 text-sm text-gray-700 line-clamp-3 overflow-hidden [&_.katex]:text-[0.95em] [&_.katex-display]:my-0 [&_.katex-display]:inline [&_img]:max-h-16 [&_img]:w-auto">
              <HtmlWithMathRenderer html={previewHtml} />
            </div>
          ) : null}
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium shrink-0"
        >
          Delete
        </button>
      </div>

      {expanded ? (
        <div className="space-y-4 px-4 pb-6 border-t border-gray-200 pt-4">
          {previewHtml ? (
            <div className="rounded-xl border border-indigo-100 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600 mb-2">
                Aperçu (comme l&apos;élève le voit)
              </p>
              <HtmlWithMathRenderer
                html={previewHtml}
                className="text-gray-900 text-[15px] leading-relaxed"
              />
              {localQuestion.type !== 'text_input' && localQuestion.answers.length > 0 ? (
                <ul className="mt-3 space-y-2">
                  {localQuestion.answers.map((answer, answerIndex) => (
                    <li
                      key={answer.id || answerIndex}
                      className={`rounded-lg border px-3 py-2 text-sm ${
                        answer.isCorrect
                          ? 'border-emerald-200 bg-emerald-50'
                          : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <span className="mr-2 font-semibold text-gray-500">
                        {String.fromCharCode(65 + answerIndex)}.
                      </span>
                      {answer.text ? (
                        <HtmlWithMathRenderer html={restoreQuestionMarkup(answer.text)} />
                      ) : (
                        <span className="italic text-gray-400">Réponse vide</span>
                      )}
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          ) : null}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
              <select
                value={localQuestion.type}
                onChange={(e) => updateQuestion({ type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="multiple_choice">Multiple Choice</option>
                <option value="true_false">True/False</option>
                <option value="text_input">Text Input (Open-ended)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Points</label>
              <input
                type="number"
                min="1"
                value={localQuestion.points}
                onChange={(e) => updateQuestion({ points: parseInt(e.target.value) || 1 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Time Limit (seconds)
              </label>
              <input
                type="number"
                min="1"
                value={localQuestion.timeLimit || ''}
                onChange={(e) =>
                  updateQuestion({
                    timeLimit: e.target.value ? parseInt(e.target.value) : undefined,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Unlimited"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Question Text *
            </label>
            <RichTextEditor
              value={localQuestion.text}
              onChange={(value) => updateQuestion({ text: value })}
              placeholder="Enter the question..."
              showMathPreview
            />
          </div>

          {localQuestion.type !== 'text_input' ? (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">Answers *</label>
                <button
                  type="button"
                  onClick={handleAddAnswer}
                  className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  ➕ Add Answer
                </button>
              </div>
              <div className="space-y-3">
                {localQuestion.answers.map((answer, answerIndex) => (
                  <div
                    key={answer.id || answerIndex}
                    className="bg-white p-4 rounded-lg border border-gray-200"
                  >
                    <div className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        checked={answer.isCorrect}
                        onChange={(e) =>
                          handleAnswerChange(answerIndex, { isCorrect: e.target.checked })
                        }
                        className="mt-2 w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                        title="Bonne réponse"
                      />
                      <div className="flex-1 space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Answer text *
                        </label>
                        <RichTextEditor
                          value={answer.text}
                          onChange={(value) => handleAnswerChange(answerIndex, { text: value })}
                          placeholder="Answer text..."
                          compact
                          showMathPreview
                        />
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Explanation (optional)
                          </label>
                          <RichTextEditor
                            value={answer.explanation}
                            onChange={(value) =>
                              handleAnswerChange(answerIndex, { explanation: value })
                            }
                            placeholder="Explanation (optional)..."
                            compact
                            showMathPreview
                          />
                        </div>
                      </div>
                      {localQuestion.answers.length > 2 && (
                        <button
                          type="button"
                          onClick={() => handleDeleteAnswer(answerIndex)}
                          className="px-2 py-1 text-red-600 hover:text-red-800 text-sm font-medium"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expected Answer (for grading reference) *
              </label>
              <div className="space-y-3">
                {localQuestion.answers.length === 0 ? (
                  <button
                    type="button"
                    onClick={() => {
                      const newAnswer: Answer = {
                        text: '',
                        isCorrect: true,
                        explanation: '',
                        imageUrl: '',
                        order: 0,
                      };
                      updateQuestion({ answers: [newAnswer] });
                    }}
                    className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                  >
                    ➕ Add Expected Answer
                  </button>
                ) : (
                  localQuestion.answers.map((answer, answerIndex) => (
                    <div
                      key={answer.id || answerIndex}
                      className="bg-white p-4 rounded-lg border border-gray-200"
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-1 space-y-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Expected answer (for reference) *
                          </label>
                          <RichTextEditor
                            value={answer.text}
                            onChange={(value) =>
                              handleAnswerChange(answerIndex, { text: value })
                            }
                            placeholder="Expected answer (for reference)..."
                            compact
                            showMathPreview
                          />
                          <label className="block text-sm font-medium text-gray-700">
                            Additional explanation (optional)
                          </label>
                          <RichTextEditor
                            value={answer.explanation}
                            onChange={(value) =>
                              handleAnswerChange(answerIndex, { explanation: value })
                            }
                            placeholder="Additional explanation (optional)..."
                            compact
                            showMathPreview
                          />
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              General Explanation (optional)
            </label>
            <RichTextEditor
              value={localQuestion.explanation}
              onChange={(value) => updateQuestion({ explanation: value })}
              placeholder="Enter general explanation of the question..."
              showMathPreview
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
