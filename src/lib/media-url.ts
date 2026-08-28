/**
 * Normalise les URLs d'images pour qu'elles fonctionnent quel que soit le domaine/port
 * (ex. https://sonaprep.com:3002/uploads/x.jpg → /uploads/x.jpg).
 */

export function normalizeMediaUrl(url?: string | null): string | undefined {
  if (!url || !String(url).trim()) return undefined;

  const value = String(url).trim();
  if (value.startsWith('data:image')) return value;
  if (value.startsWith('/uploads/')) return value;

  const absoluteMatch = value.match(/^(?:https?:)?\/\/[^/]+(\/uploads\/[^\s"'<>?#]+)/i);
  if (absoluteMatch) return absoluteMatch[1];

  if (value.startsWith('//') && value.includes('/uploads/')) {
    const protocolRelative = value.match(/(\/uploads\/[^\s"'<>?#]+)/i);
    if (protocolRelative) return protocolRelative[1];
  }

  return value;
}

/** Réécrit les src/href absolus vers /uploads/... en chemins relatifs dans du HTML. */
export function normalizeUploadUrlsInHtml(html: string): string {
  if (!html || !html.includes('uploads')) return html;

  return html.replace(
    /(\s(?:src|href)\s*=\s*(["']))(?:https?:)?\/\/[^"']+?(\/uploads\/[^"']+)\2/gi,
    '$1$3$2'
  );
}
