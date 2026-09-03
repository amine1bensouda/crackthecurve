import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';
import { adminGuard } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

function extensionFor(file: File): string {
  const fromName = path.extname(file.name || '').toLowerCase();
  if (fromName && ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(fromName)) {
    return fromName === '.jpeg' ? '.jpg' : fromName;
  }
  if (file.type === 'image/jpeg') return '.jpg';
  if (file.type === 'image/png') return '.png';
  if (file.type === 'image/gif') return '.gif';
  if (file.type === 'image/webp') return '.webp';
  return '.jpg';
}

export async function POST(request: NextRequest) {
  try {
    const denied = await adminGuard();
    if (denied) return denied;

    const formData = await request.formData();
    const file = formData.get('image') as File | null;
    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: 'No image file provided. Use field name "image".' },
        { status: 400 }
      );
    }

    const mime = file.type || 'image/jpeg';
    if (!ALLOWED_TYPES.includes(mime)) {
      return NextResponse.json(
        { error: 'Invalid file type. Use JPEG, PNG, GIF or WebP.' },
        { status: 400 }
      );
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: 'File too large. Max 10 MB.' },
        { status: 400 }
      );
    }

    const ext = extensionFor(file);
    const filename = `${randomUUID()}${ext}`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadDir, { recursive: true });
    const filepath = path.join(uploadDir, filename);
    const bytes = await file.arrayBuffer();
    await writeFile(filepath, Buffer.from(bytes));

    // URL via API → toujours accessible derrière nginx/PM2
    const url = `/api/uploads/${filename}`;
    return NextResponse.json({ url });
  } catch (error: unknown) {
    console.error('Upload image error:', error);
    return NextResponse.json(
      { error: 'Upload failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
