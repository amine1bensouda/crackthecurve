import Link from 'next/link';
import { prisma } from '@/lib/db';
import SyncDatabaseError from '@/components/Admin/SyncDatabaseError';
import { formatPrismaDbError } from '@/lib/sync/db-error-message';

export const dynamic = 'force-dynamic';

async function loadSyncPageData() {
  const [logs, syncedQuizzes] = await Promise.all([
    prisma.syncLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
    }),
    prisma.quiz.findMany({
      where: { sourceQuizId: { not: null } },
      select: {
        id: true,
        title: true,
        slug: true,
        sourceQuizId: true,
        isEnabled: true,
        lockLocalEdits: true,
        sourceSyncedAt: true,
      },
      orderBy: { sourceSyncedAt: 'desc' },
      take: 50,
    }),
  ]);
  return { logs, syncedQuizzes };
}

export default async function AdminSyncPage() {
  try {
    const { logs, syncedQuizzes } = await loadSyncPageData();

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent mb-2">
            Synchronisation depuis le site payant
          </h1>
          <p className="text-gray-600">
            {syncedQuizzes.length} quiz reçus depuis quiz-main
          </p>
        </div>

        <section className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <h2 className="px-4 py-3 font-semibold text-gray-900 border-b bg-gray-50">
            Quiz synchronisés
          </h2>
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Titre</th>
                <th className="px-4 py-3 text-left font-semibold">Source ID</th>
                <th className="px-4 py-3 text-left font-semibold">Actif</th>
                <th className="px-4 py-3 text-left font-semibold">Verrouillé</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {syncedQuizzes.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                    Aucun quiz reçu.
                  </td>
                </tr>
              ) : (
                syncedQuizzes.map((q) => (
                  <tr key={q.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/quizzes/${q.id}/edit`}
                        className="text-teal-700 hover:underline font-medium"
                      >
                        {q.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <code className="text-xs">{q.sourceQuizId}</code>
                    </td>
                    <td className="px-4 py-3">{q.isEnabled ? 'Oui' : 'Non'}</td>
                    <td className="px-4 py-3">
                      {q.lockLocalEdits ? 'Oui' : 'Non'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </section>

        <section className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <h2 className="px-4 py-3 font-semibold text-gray-900 border-b bg-gray-50">
            Journal des ingest
          </h2>
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Date</th>
                <th className="px-4 py-3 text-left font-semibold">Action</th>
                <th className="px-4 py-3 text-left font-semibold">Statut</th>
                <th className="px-4 py-3 text-left font-semibold">Source</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                    Aucun log d&apos;ingest.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-600">
                      {log.createdAt.toLocaleString('fr-FR')}
                    </td>
                    <td className="px-4 py-3">{log.action}</td>
                    <td className="px-4 py-3">{log.status}</td>
                    <td className="px-4 py-3">
                      <code className="text-xs">{log.sourceQuizId}</code>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </section>
      </div>
    );
  } catch (error) {
    return (
      <SyncDatabaseError
        appLabel="The School of Mathematics (gratuit)"
        errorInfo={formatPrismaDbError(error)}
      />
    );
  }
}
