/**
 * Convertit les images data:image/...;base64,... en fichiers uploadés
 * pour éviter des payloads JSON trop lourds (Error saving / 413).
 */

export async function uploadDataUrl(dataUrl: string): Promise<string | null> {
  try {
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    if (!blob.type.startsWith('image/')) return null;

    const ext =
      blob.type === 'image/png'
        ? 'png'
        : blob.type === 'image/webp'
          ? 'webp'
          : blob.type === 'image/gif'
            ? 'gif'
            : 'jpg';

    const formData = new FormData();
    formData.append('image', blob, `pasted-${Date.now()}.${ext}`);

    const uploadRes = await fetch('/api/admin/upload/image', {
      method: 'POST',
      body: formData,
    });

    if (!uploadRes.ok) {
      console.error('Base64 image upload failed', await uploadRes.text());
      return null;
    }

    const data = await uploadRes.json();
    return typeof data.url === 'string' ? data.url : null;
  } catch (error) {
    console.error('uploadDataUrl error:', error);
    return null;
  }
}

/** Remplace toutes les images base64 d'un HTML par des URLs /uploads/... */
export async function replaceBase64ImagesInHtml(html: string): Promise<string> {
  if (!html || !html.includes('data:image')) return html;

  const regex = /src=(["'])(data:image\/[^;]+;base64,[^"']+)\1/gi;
  const matches = [...html.matchAll(regex)];
  if (matches.length === 0) return html;

  let result = html;
  for (const match of matches) {
    const dataUrl = match[2];
    if (!result.includes(dataUrl)) continue;
    const url = await uploadDataUrl(dataUrl);
    if (url) {
      result = result.split(dataUrl).join(url);
    }
  }
  return result;
}

/** Si imageUrl est un data URL, l'uploade et renvoie l'URL fichier. */
export async function resolveImageUrl(imageUrl?: string | null): Promise<string | null> {
  if (!imageUrl || !String(imageUrl).trim()) return null;
  const value = String(imageUrl).trim();
  if (!value.startsWith('data:image')) return value;
  return (await uploadDataUrl(value)) || value;
}
