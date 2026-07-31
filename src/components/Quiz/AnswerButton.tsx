'use client';

interface AnswerButtonProps {
  answer: string;
  index: number;
  isSelected: boolean;
  isCorrect?: boolean;
  showResult?: boolean;
  onClick: () => void;
}

export default function AnswerButton({
  answer,
  index,
  isSelected,
  isCorrect,
  showResult = false,
  onClick,
}: AnswerButtonProps) {
  const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
  const letter = letters[index] || String(index + 1);

  return (
    <button
      onClick={onClick}
      disabled={showResult}
      className={`
        w-full text-left p-4 rounded-[10px] border-2 transition-all duration-200
        ${!showResult && 'hover:border-[#3f7267] hover:bg-[#f8f2e7] cursor-pointer'}
        ${isSelected && !showResult && 'border-[#2c3c5e] bg-[#f8f2e7]'}
        ${showResult && isCorrect && 'border-[#3f7267] bg-[#f0f7f5]'}
        ${showResult && isSelected && !isCorrect && 'border-[#95586b] bg-[#faf0f3]'}
        ${!isSelected && !showResult && 'border-[#eae2d2] bg-white'}
        ${showResult && 'cursor-not-allowed'}
      `}
    >
      <div className="flex items-center gap-3">
        <span
          className={`
            flex-shrink-0 w-8 h-8 rounded-md flex items-center justify-center font-bold text-sm
            ${isSelected && !showResult && 'bg-[#2c3c5e] text-white'}
            ${showResult && isCorrect && 'bg-[#3f7267] text-white'}
            ${showResult && isSelected && !isCorrect && 'bg-[#95586b] text-white'}
            ${!isSelected && !showResult && 'bg-[#f8f2e7] text-[#6b7180]'}
          `}
        >
          {letter}
        </span>
        <span className="flex-1 font-medium text-[#2c3c5e]">{answer}</span>
        {showResult && isCorrect && (
          <svg className="h-5 w-5 text-[#3f7267]" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        )}
      </div>
    </button>
  );
}
