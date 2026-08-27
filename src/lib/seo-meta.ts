import { stripHtml } from '@/lib/utils';

/** Tronque une meta description pour Google (~155–160 chars). */
export function truncateMetaDescription(text: string, max = 158): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max);
  const lastSpace = cut.lastIndexOf(' ');
  const safe = lastSpace > 80 ? cut.slice(0, lastSpace) : cut;
  return `${safe.trim()}…`;
}

export function resolveSeoTitle(
  metaTitle: string | null | undefined,
  fallbackTitle: string
): string {
  const custom = (metaTitle || '').trim();
  return custom || fallbackTitle.trim();
}

/**
 * Titre public unique pour un quiz.
 * Évite les titres génériques ("Quiz 5", "Module 2") qui font consolider Google vers /quiz.
 */
export function buildQuizPublicTitle(params: {
  title: string;
  category?: string | null;
  slug?: string | null;
}): string {
  const raw = stripHtml(params.title || '').replace(/\s+/g, ' ').trim();
  const category = (params.category || '').replace(/\s+/g, ' ').trim();
  const isGeneric = /^(quiz|module|exam|test)\s*#?\s*\d+$/i.test(raw);

  if (raw && !isGeneric) {
    if (
      category &&
      !raw.toLowerCase().includes(category.toLowerCase().slice(0, 24))
    ) {
      return `${raw} — ${category}`;
    }
    return raw;
  }

  if (category && raw) {
    return `${category} — ${raw}`;
  }

  const fromSlug = humanizeQuizSlug(params.slug || '');
  if (fromSlug) return fromSlug;
  return raw || category || 'Practice Quiz';
}

function humanizeQuizSlug(slug: string): string {
  const clean = decodeURIComponent(slug || '')
    .trim()
    .replace(/[_]+/g, '-')
    .replace(/\s+/g, '-');
  if (!clean) return '';

  return clean
    .split('-')
    .filter(Boolean)
    .map((part) => {
      if (/^\d+$/.test(part)) return part;
      if (/^psat$/i.test(part)) return 'PSAT';
      if (/^nmsqt$/i.test(part)) return 'NMSQT';
      if (/^sat$/i.test(part)) return 'SAT';
      if (/^act$/i.test(part)) return 'ACT';
      if (/^ap$/i.test(part)) return 'AP';
      if (/^gre$/i.test(part)) return 'GRE';
      if (/^gmat$/i.test(part)) return 'GMAT';
      return part.charAt(0).toUpperCase() + part.slice(1);
    })
    .join(' ');
}

export function resolveSeoDescription(
  metaDescription: string | null | undefined,
  ...fallbacks: Array<string | null | undefined>
): string {
  const custom = (metaDescription || '').trim();
  if (custom) return truncateMetaDescription(custom);

  for (const fb of fallbacks) {
    const plain = stripHtml(fb || '').replace(/\s+/g, ' ').trim();
    if (plain) return truncateMetaDescription(plain);
  }
  return '';
}
