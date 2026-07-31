import LoadingSpinner from '@/components/Layout/LoadingSpinner';

export default function QuizLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#fdfbf7] py-12">
      <div className="flex flex-col items-center gap-6 px-6 text-center">
        <LoadingSpinner size="lg" />
        <div>
          <p className="font-display text-xl font-semibold text-[#2c3c5e]">Loading quizzes</p>
          <p className="mt-2 text-sm text-[#6b7180]">Fetching your practice questions…</p>
        </div>
      </div>
    </div>
  );
}
