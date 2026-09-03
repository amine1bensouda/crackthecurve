import Image from 'next/image';
import { normalizeMediaUrl } from '@/lib/media-url';

interface QuizImageProps {
  src: string;
  alt: string;
  fill?: boolean;
  className?: string;
  sizes?: string;
  priority?: boolean;
}

/**
 * Affiche les images quiz : <img> natif pour /uploads/ et base64,
 * Next/Image pour les URLs externes (WordPress, CDN, etc.).
 */
export default function QuizImage({
  src,
  alt,
  fill,
  className = '',
  sizes,
  priority,
}: QuizImageProps) {
  const normalized = normalizeMediaUrl(src) || src;
  const useNative =
    normalized.startsWith('data:') ||
    normalized.startsWith('/uploads/') ||
    normalized.startsWith('/api/uploads/');

  if (useNative) {
    if (fill) {
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={normalized}
          alt={alt}
          className={className}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      );
    }

    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={normalized} alt={alt} className={className} />
    );
  }

  return (
    <Image
      src={normalized}
      alt={alt}
      fill={fill}
      className={className}
      sizes={sizes}
      priority={priority}
      unoptimized={normalized.startsWith('http://')}
    />
  );
}
