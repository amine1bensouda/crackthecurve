/**
 * Helpers pour distinguer montants en dollars ($24,000) et formules LaTeX ($x^2$).
 */

const CURRENCY_AMOUNT =
  /^(\\?\$)?(\d{1,3}(?:,\d{3})*(?:\.\d+)?|\d+(?:\.\d+)?)$/;

/** Montant monétaire seul, ex. 24,000 ou $24,000 */
export function isCurrencyAmount(text: string): boolean {
  return CURRENCY_AMOUNT.test(text.trim());
}

/** Texte capturé entre deux $ qui ressemble à du prose, pas à du LaTeX. */
export function isProseBetweenDollars(text: string): boolean {
  const inner = text.trim();
  if (!inner) return false;
  if (isCurrencyAmount(inner)) return true;

  const words = inner.match(/[a-zA-ZÀ-ÿ]{3,}/g);
  if (words && words.length >= 3) return true;
  if (inner.length > 40 && /\s/.test(inner) && /[a-zA-ZÀ-ÿ]{4,}/.test(inner)) return true;

  return false;
}

/** True si le contenu entre $...$ doit être rendu comme formule LaTeX. */
export function looksLikeLatexMath(text: string): boolean {
  const inner = text.trim();
  if (!inner) return false;
  if (isCurrencyAmount(inner)) return false;
  if (isProseBetweenDollars(inner)) return false;

  if (/[\\^_{}=+\-*/<>≤≥≠∑∫√]/.test(inner)) return true;
  if (/\\[a-zA-Z]+/.test(inner)) return true;
  if (/^[a-zA-Z](_[a-zA-Z0-9]+)?(\^[0-9a-zA-Z]+)?$/.test(inner)) return true;
  if (/^[0-9]+(\.[0-9]+)?$/.test(inner) && inner.length <= 4) return true;

  return false;
}

const CURRENCY_IN_TEXT =
  /\\?\$(\d{1,3}(?:,\d{3})*(?:\.\d+)?|\d+(?:\.\d+)?)/g;

/** Remplace les montants $24,000 par des placeholders avant le parsing LaTeX. */
export function protectCurrencyAmounts(text: string): {
  text: string;
  restore: (value: string) => string;
} {
  const tokens: string[] = [];
  let index = 0;

  const protectedText = text.replace(CURRENCY_IN_TEXT, (match) => {
    const normalized = match.startsWith('\\$') ? `$${match.slice(2)}` : match;
    const placeholder = `__CURRENCY_${index}__`;
    tokens[index] = normalized;
    index += 1;
    return placeholder;
  });

  return {
    text: protectedText,
    restore: (value: string) => {
      let result = value;
      for (let i = 0; i < tokens.length; i += 1) {
        result = result.split(`__CURRENCY_${i}__`).join(tokens[i]);
      }
      return result;
    },
  };
}

/** Extrait les formules inline $...$ valides (ignore devises et prose). */
export function findInlineMathMatches(
  text: string
): Array<{ start: number; end: number; formula: string }> {
  const regex = /(?<!\$)\$(?!\$)([^$]+?)\$(?!\$)/g;
  const matches: Array<{ start: number; end: number; formula: string }> = [];
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    const formula = match[1]
      .replace(/<br\s*\/?>/gi, ' ')
      .replace(/<\/?p[^>]*>/gi, ' ')
      .replace(/<[^>]+>/g, '')
      .replace(/\s*\n\s*/g, ' ')
      .trim();

    if (!looksLikeLatexMath(formula)) continue;

    matches.push({
      start: match.index,
      end: match.index + match[0].length,
      formula,
    });
  }

  return matches;
}
