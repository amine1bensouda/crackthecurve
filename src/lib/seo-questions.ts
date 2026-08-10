import { stripHtml } from '@/lib/utils';

/**
 * Texte crawlable d’un énoncé ou d’une réponse — rendu serveur (SSR).
 * Extrait le alt des images + HTML strippé (LaTeX $...$ conservé).
 */
export function questionPlainTextForSeo(
  raw: string | undefined | null,
  fallback: string
): string {
  if (!raw) return fallback;

  const withAlt = raw.replace(
    /<img\b[^>]*\balt\s*=\s*(["'])(.*?)\1[^>]*>/gi,
    (_match, _q: string, alt: string) => (alt.trim() ? ` ${alt.trim()} ` : ' ')
  );

  const plain = stripHtml(withAlt)
    .replace(/\u00a0/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return plain || fallback;
}
