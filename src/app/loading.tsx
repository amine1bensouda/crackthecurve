import LoadingSpinner from '@/components/Layout/LoadingSpinner';

export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#fdfbf7]">
      <div
        className="flex flex-col items-center gap-7 px-6"
        style={{
          background:
            'radial-gradient(ellipse 420px 260px at 50% 40%, rgba(63,114,103,0.08), transparent 70%)',
        }}
      >
        <LoadingSpinner size="lg" />

        <div className="text-center">
          <p className="font-display text-xl font-semibold text-[#2c3c5e]">Loading page</p>
          <p className="mt-2 text-sm text-[#6b7180]">Preparing your practice session…</p>

          <div className="mt-5 flex justify-center gap-1.5">
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#3f7267]" style={{ animationDelay: '0ms' }} />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#95586b]" style={{ animationDelay: '150ms' }} />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#c79a55]" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </div>
    </div>
  );
}
