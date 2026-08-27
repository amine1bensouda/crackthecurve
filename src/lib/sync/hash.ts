import { createHash, timingSafeEqual } from 'crypto';
import type { SyncQuizPayload } from './types';

export function computeSyncContentHash(
  payload: Omit<SyncQuizPayload, 'payloadHash' | 'version'>
): string {
  const normalized = JSON.stringify(payload);
  return createHash('sha256').update(normalized).digest('hex');
}

export function verifyPayloadHash(payload: SyncQuizPayload): boolean {
  const { payloadHash, version, ...rest } = payload;
  const expected = computeSyncContentHash(rest);
  try {
    const a = Buffer.from(payloadHash, 'hex');
    const b = Buffer.from(expected, 'hex');
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}
