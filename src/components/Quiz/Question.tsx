'use client';

import type { Question as QuestionType } from '@/lib/types';
import MathRenderer from './MathRenderer';
import HtmlWithMathRenderer from '@/components/Common/HtmlWithMathRenderer';
import QuizImage from '@/components/Common/QuizImage';
import { normalizeMediaUrl } from '@/lib/media-url';

interface QuestionProps {
  question: QuestionType;
  questionNumber: number;
  totalQuestions: number;
  selectedAnswer?: string;
  onAnswerSelect: (answer: string) => void;
  showResult?: boolean;
  correctAnswer?: string;
}

export default function Question({
  question,
  questionNumber,
  totalQuestions,
  selectedAnswer,
  onAnswerSelect,
  showResult = false,
  correctAnswer,
}: QuestionProps) {
  // Vérification de sécurité
  if (!question) {
    return (
      <div className="card-modern p-8 text-center">
        <p className="text-[#6b7180]">Question not found</p>
      </div>
    );
  }

  // Gérer les deux formats : Repeater ACF ou Question WordPress
  // Format Repeater ACF (dans quiz.acf.questions)
  let questionText = question.texte_question || question.title?.rendered || '';
  
  // Si le texte est vide ou sérialisé, chercher dans d'autres champs
  if (!questionText || (typeof questionText === 'string' && questionText.match(/^(a:\d+:\{|s:\d+:|O:\d+:|i:\d+|b:[01]|d:|N;)/))) {
    // Essayer d'autres champs possibles
    const questionAny = question as any;
    questionText = questionAny.question_title 
      || questionAny.question_name
      || questionAny.question_text
      || questionAny.question
      || question.content?.rendered
      || questionAny.post_title
      || questionAny.name
      || '';
  }
  
  // Vérifier si c'est toujours du code sérialisé PHP
  if (questionText && typeof questionText === 'string') {
    // Détecter le format PHP sérialisé
    if (questionText.match(/^(a:\d+:\{|s:\d+:|O:\d+:|i:\d+|b:[01]|d:|N;)/) || 
        (questionText.match(/[a-z]:\d+:/g) && questionText.match(/[a-z]:\d+:/g)!.length > 3)) {
      console.warn('⚠️ Texte de question contient du code sérialisé');
      // Utiliser l'ID de la question comme fallback
      const questionId = question.id || questionNumber;
      questionText = `Question ${questionId}`;
    }
  }
  
  // Si toujours vide, utiliser un message par défaut
  if (!questionText || questionText.trim() === '') {
    questionText = `Question ${questionNumber}`;
  }

  // Vérifier si le texte contient des images base64 ou des balises <img> avant de nettoyer
  const hasImages = questionText && typeof questionText === 'string' && 
    (questionText.includes('<img') || questionText.includes('data:image/'));
  
  // Nettoyer et améliorer le formatage du texte seulement si pas d'images
  // Si le texte contient des images, on le garde tel quel pour SafeHtmlRenderer
  let cleanedQuestionText = questionText;
  if (questionText && typeof questionText === 'string' && !hasImages) {
    // Remplacer les balises de paragraphe et de saut de ligne par des espaces
    cleanedQuestionText = questionText
      .replace(/<p[^>]*>/gi, '')
      .replace(/<\/p>/gi, '\n\n')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<div[^>]*>/gi, '')
      .replace(/<\/div>/gi, '\n')
      .replace(/&nbsp;/g, ' ')
      .replace(/\n{3,}/g, '\n\n') // Limiter les sauts de ligne multiples
      .trim();
  }
  
  const questionContent = question.content?.rendered || '';
  const answers = question.reponses || question.acf?.reponses || [];
  const mediaUrl = question.media || question.acf?.media_url;
  const explication = question.explication || question.acf?.explication;
  const points = question.points || question.acf?.points;
  const questionType = question.type_question || question.acf?.type_question || 'QCM';
  const isTextInput = questionType === 'TexteLibre' || questionType === 'text_input' || questionType === 'open_ended';

  // Diagnostic détaillé si pas de réponses (sauf pour texte libre)
  if (answers.length === 0 && !isTextInput) {
    console.error('❌ Question sans réponses:', {
      questionId: question.id,
      questionNumber,
      questionText: questionText.substring(0, 50),
      hasReponses: !!question.reponses,
      reponsesLength: question.reponses?.length || 0,
      hasAcfReponses: !!question.acf?.reponses,
      acfReponsesLength: question.acf?.reponses?.length || 0,
      questionKeys: Object.keys(question),
      questionAcfKeys: question.acf ? Object.keys(question.acf) : [],
    });
    
    return (
      <div className="card-modern p-8">
        <h2 className="text-2xl font-bold text-[#2c3c5e] mb-4">{questionText}</h2>
        <div className="space-y-2">
          <p className="text-[#95586b] font-semibold">No answers available for this question.</p>
          <p className="text-sm text-[#6b7180]">
            Question ID: {question.id} | Question #{questionNumber}
          </p>
          <p className="text-xs text-[#6b7180] mt-4">
            Please check the console for more details about this issue.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[10px] shadow-[0_2px_10px_rgba(44,60,94,0.04)] p-8 md:p-10 border border-[#eae2d2] relative overflow-hidden">
      {/* Effet de fond décoratif */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#f8f2e7] rounded-full blur-3xl opacity-30 -z-0"></div>
      
      <div className="relative z-10">
        {/* En-tête de la question */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-[10px] bg-[#2c3c5e] flex items-center justify-center shadow-[0_2px_10px_rgba(44,60,94,0.04)]">
              <span className="text-white font-bold text-lg">{questionNumber}</span>
            </div>
            <div>
              <span className="text-base font-semibold text-[#2c3c5e] block">Question {questionNumber}</span>
              <span className="text-sm text-[#6b7180]">of {totalQuestions}</span>
            </div>
          </div>
          {points && (
            <div className="px-4 py-2 rounded-[10px] bg-[#f8f2e7] border border-[#eae2d2]">
              <span className="text-sm font-bold text-[#2c3c5e]">
                {points} point{points !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>

        {/* Média (image) si présent */}
        {mediaUrl && (
          <div className="relative w-full h-72 mb-6 rounded-[10px] overflow-hidden shadow-[0_2px_10px_rgba(44,60,94,0.04)] group">
            <QuizImage
              src={normalizeMediaUrl(mediaUrl) || mediaUrl}
              alt={questionText}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 768px) 100vw, 800px"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
          </div>
        )}

        {/* Texte de la question */}
        <div className="mb-8">
          {hasImages ? (
            <div className="text-2xl md:text-3xl font-bold text-[#2c3c5e] leading-relaxed">
              <HtmlWithMathRenderer 
                html={questionText || ''}
                className="prose prose-lg max-w-none"
              />
            </div>
          ) : (
            <h2 className="text-2xl md:text-3xl font-bold text-[#2c3c5e] leading-relaxed">
              <MathRenderer text={cleanedQuestionText || ''} />
            </h2>
          )}
        </div>

        {/* Description si présente */}
        {questionContent && (
          <div
            className="prose prose-sm max-w-none mb-8 text-[#6b7180] leading-relaxed"
            dangerouslySetInnerHTML={{ __html: questionContent }}
          />
        )}

        {/* Champ de texte libre ou liste des réponses */}
        {isTextInput ? (
          <div className="space-y-4">
            <div>
              <label htmlFor="text-answer" className="block text-sm font-medium text-[#6b7180] mb-3">
                Your Answer:
              </label>
              <textarea
                id="text-answer"
                value={selectedAnswer && selectedAnswer.startsWith('text:') ? selectedAnswer.replace('text:', '') : (selectedAnswer || '')}
                onChange={(e) => onAnswerSelect(`text:${e.target.value}`)}
                disabled={showResult}
                rows={4}
                className={`
                  w-full px-4 py-3 border-2 rounded-[10px] transition-all duration-300
                  ${showResult 
                    ? 'border-[#eae2d2] bg-[#f8f2e7] cursor-not-allowed' 
                    : 'border-[#eae2d2] bg-white focus:border-[#2c3c5e] focus:ring-2 focus:ring-[#2c3c5e] focus:outline-none'
                  }
                  text-[#2c3c5e] placeholder-[#6b7180] resize-y
                `}
                placeholder="Type your answer here..."
              />
              {showResult && (
                <div className="mt-4 space-y-3">
                  {answers.length > 0 && answers[0]?.texte && (
                    <div className={`p-4 rounded-[10px] border-l-4 ${
                      correctAnswer && selectedAnswer &&
                      selectedAnswer.replace('text:', '').toLowerCase().trim() === (answers[0].texte || '').replace(/<[^>]*>/g, '').toLowerCase().trim()
                        ? 'bg-[#f0f7f5] border-[#3f7267]'
                        : 'bg-[#f8f2e7] border-[#2c3c5e]'
                    }`}>
                      <p className="text-sm font-semibold text-[#2c3c5e] mb-2">Expected Answer:</p>
                      <div className="text-sm text-[#6b7180]">
                        <HtmlWithMathRenderer html={answers[0].texte} />
                      </div>
                    </div>
                  )}
                  {explication && (
                    <div className="p-4 rounded-[10px] bg-[#f8f2e7] border-l-4 border-[#2c3c5e]">
                      <p className="text-sm font-semibold text-[#2c3c5e] mb-2">Explanation:</p>
                      <p className="text-sm text-[#6b7180]">
                        <MathRenderer text={explication} />
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {answers.map((answer, index) => {
              const answerKey = `answer-${index}`;
              const isSelected = selectedAnswer === answerKey;
              const isCorrect = answer.correcte;
              const showCorrect = showResult && isCorrect;
              const showIncorrect = showResult && isSelected && !isCorrect;

  const getButtonStyles = () => {
    if (showCorrect) {
      return 'border-[#3f7267] bg-[#f0f7f5] shadow-none';
    }
    if (showIncorrect) {
      return 'border-[#95586b] bg-[#faf0f3] shadow-none';
    }
    if (isSelected && !showResult) {
      return 'border-[#2c3c5e] bg-[#f8f2e7] shadow-none';
    }
    return 'border-[#eae2d2] bg-white hover:border-[#3f7267] hover:bg-[#f8f2e7]';
  };

            return (
              <button
                key={index}
                onClick={() => !showResult && onAnswerSelect(answerKey)}
                disabled={showResult}
                className={`
                  w-full text-left p-6 rounded-[10px] border-2 transition-all duration-300 transform
                  ${getButtonStyles()}
                  ${!showResult && 'hover:scale-[1.01] active:scale-[0.99] cursor-pointer shadow-[0_2px_10px_rgba(44,60,94,0.04)] hover:shadow-[0_2px_10px_rgba(44,60,94,0.04)]'}
                  ${showResult && 'cursor-not-allowed'}
                `}
              >
                <div className="flex items-start gap-4">
                  {/* Indicateur de réponse (A, B, C...) */}
                  <div className={`
                    flex-shrink-0 w-10 h-10 rounded-[10px] flex items-center justify-center font-bold text-sm transition-all duration-300
                    ${showCorrect && 'bg-[#3f7267] text-white shadow-[0_2px_10px_rgba(44,60,94,0.04)]'}
                    ${showIncorrect && 'bg-[#95586b] text-white shadow-[0_2px_10px_rgba(44,60,94,0.04)]'}
                    ${isSelected && !showResult && 'bg-[#2c3c5e] text-white shadow-[0_2px_10px_rgba(44,60,94,0.04)]'}
                    ${!isSelected && !showResult && 'bg-[#f8f2e7] text-[#6b7180] border-2 border-[#eae2d2]'}
                  `}>
                    {showResult && isCorrect && (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                    {showIncorrect && (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    )}
                    {!showResult && isSelected && (
                      <div className="w-4 h-4 rounded-full bg-white"></div>
                    )}
                    {!showResult && !isSelected && (
                      <span>{String.fromCharCode(65 + index)}</span>
                    )}
                  </div>

                  {/* Contenu du choix : image + texte (images bien visibles parmi les choix) */}
                  <div className="flex-1 min-w-0">
                    {answer.imageUrl && (
                      <div className="mb-3 rounded-[10px] overflow-hidden border border-[#eae2d2] bg-[#f8f2e7] max-w-sm max-h-40 w-full">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={normalizeMediaUrl(answer.imageUrl) || answer.imageUrl}
                          alt=""
                          className="object-contain w-full h-32 sm:h-40"
                        />
                      </div>
                    )}
                    <div className="font-semibold text-[#2c3c5e] text-lg leading-relaxed [&_.ql-editor]:p-0">
                      <HtmlWithMathRenderer html={answer.texte || ''} />
                    </div>
                    {showResult && answer.explication && (
                      <div className="text-sm text-[#6b7180] mt-3 italic leading-relaxed bg-[#f8f2e7] p-3 rounded-lg">
                        💡 <HtmlWithMathRenderer html={answer.explication || ''} />
                      </div>
                    )}
                  </div>

                  {/* Badge correcte */}
                  {showCorrect && (
                    <div className="flex-shrink-0">
                      <span className="px-3 py-1.5 rounded-lg bg-[#3f7267] text-white text-xs font-bold">
                        ✓ Correct
                      </span>
                    </div>
                  )}
                </div>
              </button>
            );
          })}
          </div>
        )}

        {/* Explication générale si présente et résultat affiché */}
        {showResult && explication && (
          <div className="mt-8 p-6 rounded-[10px] bg-[#f8f2e7] border-l-4 border-[#2c3c5e] shadow-[0_2px_10px_rgba(44,60,94,0.04)] animate-fade-in">
            <p className="text-sm font-bold text-[#2c3c5e] mb-3 flex items-center gap-2">
              <span className="text-lg">💡</span>
              Detailed Explanation:
            </p>
            <p className="text-sm text-[#6b7180] leading-relaxed">
              <MathRenderer text={explication || ''} />
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
