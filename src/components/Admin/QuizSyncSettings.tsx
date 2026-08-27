'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Props = {
  quizId: string;
  sourceQuizId: string | null;
  isEnabled: boolean;
  lockLocalEdits: boolean;
  sourceSyncedAt: string | null;
};

export default function QuizSyncSettings({
  quizId,
  sourceQuizId,
  isEnabled,
  lockLocalEdits,
  sourceSyncedAt,
}: Props) {
  const router = useRouter();
  const [enabled, setEnabled] = useState(isEnabled);
  const [locked, setLocked] = useState(lockLocalEdits);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const save = async (patch: { isEnabled?: boolean; lockLocalEdits?: boolean }) => {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch(
        `/api/admin/quizzes/${encodeURIComponent(quizId)}/sync-settings`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(patch),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur');
      setMessage('Paramètres enregistrés.');
      router.refresh();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Erreur');
    } finally {
      setSaving(false);
    }
  };

  if (!sourceQuizId) {
    return (
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
        Quiz créé localement (non synchronisé depuis le site payant).
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-teal-200 bg-teal-50/80 p-5 space-y-4">
      <div>
        <h3 className="font-semibold text-gray-900">Synchronisation premium</h3>
        <p className="text-sm text-gray-600 mt-1">
          Source :{' '}
          <code className="text-xs bg-white px-1 rounded">{sourceQuizId}</code>
          {sourceSyncedAt && (
            <>
              {' '}
              · Dernière réception :{' '}
              {new Date(sourceSyncedAt).toLocaleString('fr-FR')}
            </>
          )}
        </p>
      </div>

      <label className="flex items-center gap-2 text-sm text-gray-800">
        <input
          type="checkbox"
          checked={enabled}
          disabled={saving}
          onChange={async (e) => {
            const v = e.target.checked;
            setEnabled(v);
            await save({ isEnabled: v });
          }}
        />
        Quiz visible sur le site gratuit
      </label>

      <label className="flex items-start gap-2 text-sm text-gray-800">
        <input
          type="checkbox"
          checked={locked}
          disabled={saving}
          onChange={async (e) => {
            const v = e.target.checked;
            setLocked(v);
            await save({ lockLocalEdits: v });
          }}
          className="mt-0.5"
        />
        <span>
          Verrouiller les éditions locales — les republications depuis le site
          payant ne pourront plus écraser ce quiz.
        </span>
      </label>

      {message && <p className="text-sm text-gray-700">{message}</p>}
    </div>
  );
}
