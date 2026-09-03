import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';

const MIME: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
};

/**
 * Sert les images uploadées via l'API (fiable derrière nginx / PM2,
 * même si /uploads/ statique n'est pas exposé).
 */
export async function GET(
  _request: NextRequest,
  context: { params: { filename: string } }
) {
  try {
    const raw = context.params.filename || '';
    const filename = path.basename(raw);
    if (!filename || filename !== raw || filename.includes('..')) {
      return NextResponse.json({ error: 'Invalid filename' }, { status: 400 });
    }

    const filepath = path.join(process.cwd(), 'public', 'uploads', filename);
    const data = await readFile(filepath);
    const ext = path.extname(filename).toLowerCase();
    const contentType = MIME[ext] || 'application/octet-stream';

    return new NextResponse(data, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
}
