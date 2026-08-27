import { createHmac, timingSafeEqual } from 'crypto';
import type { NextRequest } from 'next/server';

function safeEqual(a: string, b: string): boolean {
  try {
    const ba = Buffer.from(a);
    const bb = Buffer.from(b);
    if (ba.length !== bb.length) return false;
    return timingSafeEqual(ba, bb);
  } catch {
    return false;
  }
}

export function verifySyncApiKey(request: NextRequest): boolean {
  const expected = process.env.SYNC_API_KEY?.trim();
  if (!expected) return false;

  const auth = request.headers.get('authorization') || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7).trim() : '';
  return token.length > 0 && safeEqual(token, expected);
}

export function verifySyncSignature(
  rawBody: string,
  signatureHeader: string | null
): boolean {
  const secret = process.env.SYNC_HMAC_SECRET?.trim();
  if (!secret || !signatureHeader) return false;

  const expected = createHmac('sha256', secret).update(rawBody).digest('hex');
  return safeEqual(expected.trim(), signatureHeader.trim());
}
