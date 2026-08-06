// Site constants

export const SITE_NAME = 'SonaPrep';
export const SITE_DESCRIPTION =
  'Practice for professional licenses and certifications across engineering, nursing, accounting, construction, and more — one platform, every industry.';

/** Canonical toujours en non-www (évite le split d’autorité www / non-www). */
function normalizeSiteUrl(url: string): string {
  return url
    .trim()
    .replace(/\/+$/, '')
    .replace(/^(https?:\/\/)www\./i, '$1');
}

export const SITE_URL = normalizeSiteUrl(
  process.env.NEXT_PUBLIC_SITE_URL || 'https://crackthecurve.vercel.app'
);

// Difficulty levels (Fundamental, Intermediate, Advanced + legacy for backward compatibility)
export const DIFFICULTY_LEVELS: Record<string, { label: string; color: string; icon: string }> = {
  Fundamental: { label: 'Fundamental', color: 'green', icon: '🟢' },
  Intermediate: { label: 'Intermediate', color: 'yellow', icon: '🟡' },
  Advanced: { label: 'Advanced', color: 'orange', icon: '🟠' },
  // Legacy : Easy/Facile → Fundamental, Medium/Moyen → Intermediate, Hard/Expert → Advanced
  Easy: { label: 'Fundamental', color: 'green', icon: '🟢' },
  Medium: { label: 'Intermediate', color: 'yellow', icon: '🟡' },
  Hard: { label: 'Advanced', color: 'orange', icon: '🟠' },
  Expert: { label: 'Advanced', color: 'red', icon: '🔴' },
  Facile: { label: 'Fundamental', color: 'green', icon: '🟢' },
  Moyen: { label: 'Intermediate', color: 'yellow', icon: '🟡' },
  Difficile: { label: 'Difficile', color: 'orange', icon: '🟠' },
};

// Default categories
export const DEFAULT_CATEGORIES = [
  'Histoire',
  'Géographie',
  'Science',
  'Sport',
  'Culture générale',
  'Littérature',
  'Cinéma',
  'Musique',
] as const;

// Configuration AdSense
export const ADSENSE_CONFIG = {
  clientId: process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || '',
  adSlot: {
    display: '1234567890',
    inArticle: '1234567891',
    sidebar: '1234567892',
  },
} as const;

// Temps de revalidation ISR
export const REVALIDATE_TIME = parseInt(process.env.NEXT_REVALIDATE_TIME || '3600', 10);
