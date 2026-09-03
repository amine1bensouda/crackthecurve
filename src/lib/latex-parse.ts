/**
 * Helpers pour distinguer montants en dollars ($24,000) et formules LaTeX ($x^2$, $$0.68$$).
 */

/** Montant monétaire (avec séparateur de milliers ou $ entier explicite). */
export function isCurrencyAmount(text: string): boolean {
  const t = text.trim();
  // 24,000 ou $24,000
  if (/^\\?\$?\d{1,3}(,\d{3})+(\.\d+)?$/.test(t)) return true;
  // $18500 avec symbole $ (entier), pas $0.68
  if (/^\\?\$\d+$/.test(t)) return true;
  return false;
}

/** Texte capturé entre deux $ qui ressemble à du prose, pas à du LaTeX. */
export function isProseBetweenDollars(text: string): boolean {
  const inner = text.trim();
  if (!inner) return false;
  if (isCurrencyAmount(inner)) return true;

  const words = inner.match(/[a-zA-ZÀ-ÿ]{3,}/g);
  if (words && words.length >= 3) return true;
  if (inner.length > 40 && /\s/.test(inner) && /[a-zA-ZÀ-ÿ]{4,}/.test(inner)) {
    return true;
  }

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
  // Nombres courts type $0.68$ (radians, etc.) — pas de la devise
  if (/^[0-9]+(\.[0-9]+)?$/.test(inner) && inner.length <= 8) return true;

  return false;
}

function collectBlockMathRanges(text: string): Array<{ start: number; end: number }> {
  const shielded: Array<{ start: number; end: number }> = [];
  const blockRe = /\$\$[\s\S]*?\$\$/g;
  let blockMatch: RegExpExecArray | null;
  while ((blockMatch = blockRe.exec(text)) !== null) {
    shielded.push({
      start: blockMatch.index,
      end: blockMatch.index + blockMatch[0].length,
    });
  }
  return shielded;
}

/**
 * Remplace uniquement les vrais montants ($24,000 / \$18,500) par des placeholders.
 * Ne touche JAMAIS l'intérieur de $$...$$ (sinon $$38^\circ$$ devient cassé).
 */
export function protectCurrencyAmounts(text: string): {
  text: string;
  restore: (value: string) => string;
} {
  const tokens: string[] = [];
  let index = 0;

  const restore = (value: string) => {
    let result = value;
    for (let i = 0; i < tokens.length; i += 1) {
      result = result.split(`__CURRENCY_${i}__`).join(tokens[i]);
    }
    return result;
  };

  const shielded = collectBlockMathRanges(text);
  const isShielded = (pos: number) =>
    shielded.some((range) => pos >= range.start && pos < range.end);

  // \$24,000  ou  $24,000 (virgules milliers obligatoires pour un $ non échappé)
  const currencyRe = /(?:\\\$|(?<!\$)\$(?!\$))(\d{1,3}(?:,\d{3})+(?:\.\d+)?)/g;

  const replacements: Array<{ start: number; end: number; placeholder: string }> = [];
  let match: RegExpExecArray | null;

  while ((match = currencyRe.exec(text)) !== null) {
    if (isShielded(match.index)) continue;

    let end = match.index + match[0].length;
    // "$18,500$" → consommer le $ fermant (pas $$)
    if (text[end] === '$' && text[end + 1] !== '$') {
      end += 1;
    }

    let normalized = match[0].startsWith('\\$')
      ? `$${match[0].slice(2)}`
      : match[0];
    if (!normalized.startsWith('$')) normalized = `$${normalized}`;

    const placeholder = `__CURRENCY_${index}__`;
    tokens[index] = normalized;
    index += 1;
    replacements.push({ start: match.index, end, placeholder });
  }

  if (replacements.length === 0) {
    return { text, restore };
  }

  let result = '';
  let last = 0;
  for (const rep of replacements) {
    result += text.slice(last, rep.start);
    result += rep.placeholder;
    last = rep.end;
  }
  result += text.slice(last);

  return { text: result, restore };
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
