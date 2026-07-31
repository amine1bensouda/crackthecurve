'use client';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function LoadingSpinner({ size = 'md', className = '' }: LoadingSpinnerProps) {
  const sizeMap = {
    sm: { box: 'h-10 w-10', text: 'text-sm', ring: 'border-2' },
    md: { box: 'h-14 w-14', text: 'text-lg', ring: 'border-[3px]' },
    lg: { box: 'h-20 w-20', text: 'text-2xl', ring: 'border-4' },
  };

  const s = sizeMap[size];

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className={`relative ${s.box}`}>
        {/* Soft glow */}
        <div className="absolute -inset-3 rounded-2xl bg-[radial-gradient(circle,rgba(63,114,103,0.18),transparent_70%)]" />

        {/* Spinning ring */}
        <div
          className={`absolute inset-0 rounded-xl ${s.ring} border-[#eae2d2] border-t-[#3f7267] border-r-[#2c3c5e] animate-spin`}
        />

        {/* Brand badge */}
        <div className="absolute inset-[18%] flex items-center justify-center rounded-lg bg-[linear-gradient(135deg,#3f7267,#2c3c5e)] shadow-sm">
          <span className={`font-bold tracking-tight text-white ${s.text}`}>SP</span>
        </div>
      </div>
    </div>
  );
}
