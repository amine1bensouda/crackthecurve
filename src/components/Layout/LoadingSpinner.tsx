'use client';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function LoadingSpinner({ size = 'md', className = '' }: LoadingSpinnerProps) {
  const sizeMap = {
    sm: 40,
    md: 56,
    lg: 72,
  };

  const box = sizeMap[size];

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="relative" style={{ width: box, height: box }}>
        <div className="absolute -inset-3 rounded-full bg-[radial-gradient(circle,rgba(63,114,103,0.16),transparent_70%)]" />

        <div className="absolute inset-0 animate-spin rounded-full border-[3px] border-[#eae2d2] border-t-[#3f7267] border-r-[#c79a55]" />

        <svg
          className="absolute inset-[18%]"
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <circle cx="24" cy="24" r="22" stroke="#2C3C5E" strokeWidth="2.2" />
          <circle cx="24" cy="24" r="17.5" stroke="#3F7267" strokeWidth="1.2" opacity="0.55" />
          <path d="M24 6.5 L26.2 9.2 L24 11.9 L21.8 9.2 Z" fill="#C79A55" />
          <path
            d="M29.5 17.2c-1.1-1.8-3.2-2.9-5.6-2.9-3.4 0-5.8 1.9-5.8 4.5 0 2.2 1.6 3.5 4.6 4.3l2.2.6c2 .5 2.9 1.1 2.9 2.3 0 1.5-1.5 2.5-3.7 2.5-1.9 0-3.4-.7-4.4-2"
            stroke="#2C3C5E"
            strokeWidth="2.4"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M31.5 28.5c1.8-2.8 3.8-4.2 6-4.8-1.1 3.2-2.9 5.5-5.5 7.2"
            stroke="#3F7267"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
      </div>
    </div>
  );
}
