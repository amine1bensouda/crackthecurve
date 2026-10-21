/**
 * Formules « papier d'examen » : variables simples en Times italique,
 * fractions / grands opérateurs restent en KaTeX (sinon le baseline décale).
 */

const COMPLEX_LATEX =
  /\\(?:frac|dfrac|tfrac|cfrac|binom|sum|prod|coprod|int|iint|iiint|oint|lim|liminf|limsup|sqrt|begin|end|left|right|bigl|bigr|Bigl|Bigr|biggl|biggr|over|atop|choose|displaystyle|textstyle|overrightarrow|overleftarrow|overline|underline|underbrace|overbrace|widehat|widetilde|vec|hat|tilde|bar|dot|ddot|mathbb|mathcal|mathfrak|boldsymbol|pmb|matrix|pmatrix|bmatrix|vmatrix|Vmatrix|cases|align|aligned|array|gather)\b/;

const COMMAND_TO_UNICODE: Record<string, string> = {
  varepsilon: 'ε',
  vartheta: 'ϑ',
  varphi: 'φ',
  varrho: 'ϱ',
  varsigma: 'ς',
  leftrightarrow: '↔',
  rightarrow: '→',
  leftarrow: '←',
  Rightarrow: '⇒',
  Leftarrow: '⇐',
  approx: '≈',
  infty: '∞',
  cdot: '·',
  times: '×',
  circ: '∘',
  degree: '°',
  ldots: '…',
  prime: '′',
  leq: '≤',
  geq: '≥',
  neq: '≠',
  pm: '±',
  mp: '∓',
  alpha: 'α',
  beta: 'β',
  gamma: 'γ',
  delta: 'δ',
  epsilon: 'ε',
  zeta: 'ζ',
  eta: 'η',
  theta: 'θ',
  iota: 'ι',
  kappa: 'κ',
  lambda: 'λ',
  mu: 'μ',
  nu: 'ν',
  xi: 'ξ',
  pi: 'π',
  rho: 'ρ',
  sigma: 'σ',
  tau: 'τ',
  upsilon: 'υ',
  phi: 'φ',
  chi: 'χ',
  psi: 'ψ',
  omega: 'ω',
  Gamma: 'Γ',
  Delta: 'Δ',
  Theta: 'Θ',
  Lambda: 'Λ',
  Xi: 'Ξ',
  Pi: 'Π',
  Sigma: 'Σ',
  Phi: 'Φ',
  Psi: 'Ψ',
  Omega: 'Ω',
};

const COMMANDS_BY_LENGTH = Object.keys(COMMAND_TO_UNICODE).sort(
  (a, b) => b.length - a.length
);

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export function latexNeedsKatex(formula: string): boolean {
  const f = formula.trim();
  if (!f) return false;
  if (/[\n\r]/.test(f)) return true;
  if (COMPLEX_LATEX.test(f)) return true;
  if (f.length > 72) return true;
  return false;
}

function replaceScript(src: string, marker: '_' | '^', tag: 'sub' | 'sup'): string {
  let out = '';
  let i = 0;
  while (i < src.length) {
    if (src[i] === marker && src[i + 1] === '{') {
      let depth = 1;
      let j = i + 2;
      while (j < src.length && depth > 0) {
        if (src[j] === '{') depth += 1;
        else if (src[j] === '}') depth -= 1;
        j += 1;
      }
      out += `<${tag}>${src.slice(i + 2, j - 1)}</${tag}>`;
      i = j;
      continue;
    }
    if (src[i] === marker && src[i + 1] && /[A-Za-z0-9]/.test(src[i + 1])) {
      out += `<${tag}>${src[i + 1]}</${tag}>`;
      i += 2;
      continue;
    }
    out += src[i];
    i += 1;
  }
  return out;
}

function replaceCommandBraces(
  src: string,
  command: string,
  wrapStart: string,
  wrapEnd: string
): string {
  const needle = `\\${command}{`;
  let out = '';
  let i = 0;
  while (i < src.length) {
    const at = src.indexOf(needle, i);
    if (at === -1) {
      out += src.slice(i);
      break;
    }
    out += src.slice(i, at);
    let depth = 1;
    let j = at + needle.length;
    while (j < src.length && depth > 0) {
      if (src[j] === '{') depth += 1;
      else if (src[j] === '}') depth -= 1;
      j += 1;
    }
    out += `${wrapStart}${src.slice(at + needle.length, j - 1)}${wrapEnd}`;
    i = j;
  }
  return out;
}

/**
 * Convertit une formule simple (F_1, r_s, \\theta) en HTML Times.
 * Retourne null si un reste LaTeX impose KaTeX.
 */
export function simpleLatexToTimesHtml(formula: string): string | null {
  let out = formula.trim();
  if (!out || latexNeedsKatex(out)) return null;

  out = out.replace(/\\quad/g, ' ').replace(/\\,/g, ' ').replace(/\\;/g, ' ').replace(/\\[ ]/g, ' ');
  out = replaceCommandBraces(out, 'text', '<span class="quiz-exam-roman">', '</span>');
  out = replaceCommandBraces(out, 'mathrm', '<span class="quiz-exam-roman">', '</span>');
  out = replaceCommandBraces(out, 'operatorname', '<span class="quiz-exam-roman">', '</span>');

  for (const cmd of COMMANDS_BY_LENGTH) {
    const symbol = COMMAND_TO_UNICODE[cmd];
    if (!symbol) continue;
    out = out.replace(new RegExp(`\\\\${cmd}(?![A-Za-z])`, 'g'), symbol);
  }

  out = replaceScript(out, '_', 'sub');
  out = replaceScript(out, '^', 'sup');
  out = out.replace(/\{([^{}]+)\}/g, '$1');
  out = out.replace(/\\'/g, '′').replace(/'/g, '′');

  if (/\\[A-Za-z]/.test(out)) return null;

  out = out
    .split(/(<\/?[^>]+>)/g)
    .map((chunk) => (chunk.startsWith('<') ? chunk : escapeHtml(chunk)))
    .join('');

  return out;
}
