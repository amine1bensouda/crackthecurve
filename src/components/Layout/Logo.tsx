import Link from 'next/link';
import { SITE_NAME } from '@/lib/constants';

type LogoProps = {
  href?: string;
  variant?: 'light' | 'dark';
  size?: 'sm' | 'md' | 'lg';
  showWordmark?: boolean;
  className?: string;
};

const sizes = {
  sm: { mark: 30, text: 'text-lg', gap: 'gap-2.5' },
  md: { mark: 36, text: 'text-[1.4rem]', gap: 'gap-3' },
  lg: { mark: 48, text: 'text-[1.75rem]', gap: 'gap-3.5' },
};

/** Clean seal mark: open book / certificate arc + monogram */
function LogoMark({ size, variant }: { size: number; variant: 'light' | 'dark' }) {
  const isDark = variant === 'dark';
  const navy = isDark ? '#FDFBF7' : '#2C3C5E';
  const emerald = isDark ? '#9FC4BB' : '#3F7267';
  const amber = isDark ? '#E0C089' : '#C79A55';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="shrink-0"
    >
      {/* Soft circular seal */}
      <circle cx="24" cy="24" r="22" stroke={navy} strokeWidth="2.2" />
      <circle cx="24" cy="24" r="17.5" stroke={emerald} strokeWidth="1.2" opacity="0.55" />

      {/* Top accent diamond */}
      <path d="M24 6.5 L26.2 9.2 L24 11.9 L21.8 9.2 Z" fill={amber} />

      {/* Stylized S path */}
      <path
        d="M29.5 17.2c-1.1-1.8-3.2-2.9-5.6-2.9-3.4 0-5.8 1.9-5.8 4.5 0 2.2 1.6 3.5 4.6 4.3l2.2.6c2 .5 2.9 1.1 2.9 2.3 0 1.5-1.5 2.5-3.7 2.5-1.9 0-3.4-.7-4.4-2"
        stroke={navy}
        strokeWidth="2.4"
        strokeLinecap="round"
        fill="none"
      />

      {/* Small prep check / leaf accent */}
      <path
        d="M31.5 28.5c1.8-2.8 3.8-4.2 6-4.8-1.1 3.2-2.9 5.5-5.5 7.2"
        stroke={emerald}
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

export default function Logo({
  href = '/',
  variant = 'light',
  size = 'md',
  showWordmark = true,
  className = '',
}: LogoProps) {
  const s = sizes[size];
  const isDark = variant === 'dark';

  const content = (
    <span className={`inline-flex items-center ${s.gap} ${className}`}>
      <LogoMark size={s.mark} variant={variant} />
      {showWordmark && (
        <span className={`font-display leading-none tracking-[-0.025em] ${s.text}`}>
          <span className={`font-semibold ${isDark ? 'text-white' : 'text-[#2c3c5e]'}`}>Sona</span>
          <span className={`font-medium ${isDark ? 'text-[#9fc4bb]' : 'text-[#3f7267]'}`}>Prep</span>
        </span>
      )}
      <span className="sr-only">{SITE_NAME}</span>
    </span>
  );

  if (!href) return content;

  return (
    <Link href={href} className="inline-flex transition-opacity hover:opacity-90" aria-label={SITE_NAME}>
      {content}
    </Link>
  );
}
