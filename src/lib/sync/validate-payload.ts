import {
  SYNC_PAYLOAD_VERSION,
  type SyncQuizPayload,
} from './types';

export function validateSyncPayload(data: unknown): {
  ok: true;
  payload: SyncQuizPayload;
} | { ok: false; error: string } {
  if (!data || typeof data !== 'object') {
    return { ok: false, error: 'Corps JSON invalide' };
  }

  const p = data as Record<string, unknown>;

  if (p.version !== SYNC_PAYLOAD_VERSION) {
    return { ok: false, error: 'Version de payload non supportée' };
  }

  if (typeof p.sourceQuizId !== 'string' || !p.sourceQuizId) {
    return { ok: false, error: 'sourceQuizId requis' };
  }

  if (typeof p.payloadHash !== 'string' || !p.payloadHash) {
    return { ok: false, error: 'payloadHash requis' };
  }

  const quiz = p.quiz as Record<string, unknown> | undefined;
  if (!quiz || typeof quiz.title !== 'string' || typeof quiz.slug !== 'string') {
    return { ok: false, error: 'quiz.title et quiz.slug requis' };
  }

  if (!Array.isArray(p.questions)) {
    return { ok: false, error: 'questions doit être un tableau' };
  }

  return { ok: true, payload: data as SyncQuizPayload };
}
