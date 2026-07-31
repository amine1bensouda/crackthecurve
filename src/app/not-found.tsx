import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#fdfbf7] px-4">
      <div className="container mx-auto max-w-lg py-16 text-center">
        <p className="mb-2 font-display text-6xl font-semibold text-[#2c3c5e]">404</p>
        <h1 className="font-display mb-4 text-3xl font-semibold text-[#2c3c5e]">
          Page Not Found
        </h1>
        <p className="mb-8 text-[#6b7180]">
          The page you are looking for does not exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-block rounded-md bg-[#2c3c5e] px-6 py-3 font-semibold text-white transition hover:bg-[#1d2a45]"
        >
          Return to Home
        </Link>
      </div>
    </div>
  );
}
