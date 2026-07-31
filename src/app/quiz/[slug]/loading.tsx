import LoadingSpinner from '@/components/Layout/LoadingSpinner';

export default function QuizDetailLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#fdfbf7] py-12">
      <div className="flex flex-col items-center gap-6">
        <LoadingSpinner size="lg" />
        <div className="text-center">
          <p className="font-display mb-2 text-lg font-semibold text-[#2c3c5e]">Loading quiz...</p>
          <p className="text-sm text-[#6b7180]">Preparing your quiz experience</p>
        </div>
      </div>
    </div>
  );
}
