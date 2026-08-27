import { NextRequest, NextResponse } from 'next/server';
import { ingestQuizFromPremium } from '@/lib/sync/ingest';
import { validateSyncPayload } from '@/lib/sync/validate-payload';
import {
  verifySyncApiKey,
  verifySyncSignature,
} from '@/lib/sync/verify-request';

export const dynamic = 'force-dynamic';

/**
 * POST /api/internal/sync/ingest
 * Réception des quiz depuis quiz-main (premium). Auth : Bearer + HMAC.
 */
export async function POST(request: NextRequest) {
  try {
    if (!verifySyncApiKey(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const rawBody = await request.text();
    const signature = request.headers.get('x-sync-signature');

    if (!verifySyncSignature(rawBody, signature)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const validation = validateSyncPayload(parsed);
    if (!validation.ok) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const result = await ingestQuizFromPremium(validation.payload);
    return NextResponse.json(result);
  } catch (error) {
    console.error('sync ingest:', error);
    const message =
      error instanceof Error ? error.message : 'Ingest failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
