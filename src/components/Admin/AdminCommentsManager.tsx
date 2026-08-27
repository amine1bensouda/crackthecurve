'use client';

import { useState, useEffect, useCallback } from 'react';
import { getTargetLabel, type CommentStatus } from '@/lib/comments';

interface AdminComment {
  id: string;
  targetType: string;
  targetSlug: string;
  authorName: string;
  authorEmail: string | null;
  content: string;
  status: string;
  createdAt: string;
}

type StatusFilter = CommentStatus | 'all';

const STATUS_LABELS: Record<string, string> = {
  pending: 'En attente',
  approved: 'Approuvé',
  rejected: 'Désapprouvé',
};

export default function AdminCommentsManager() {
  const [filter, setFilter] = useState<StatusFilter>('pending');
  const [comments, setComments] = useState<AdminComment[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);

  const loadComments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/comments?status=${filter}`);
      if (res.ok) {
        const data = await res.json();
        setComments(data.comments);
        setCounts(data.countByStatus || {});
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  const updateStatus = async (id: string, status: CommentStatus) => {
    setActionId(id);
    try {
      const res = await fetch(`/api/admin/comments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) await loadComments();
    } finally {
      setActionId(null);
    }
  };

  const deleteComment = async (id: string) => {
    if (!confirm('Supprimer ce commentaire définitivement ?')) return;
    setActionId(id);
    try {
      const res = await fetch(`/api/admin/comments/${id}`, { method: 'DELETE' });
      if (res.ok) await loadComments();
    } finally {
      setActionId(null);
    }
  };

  const filters: { key: StatusFilter; label: string }[] = [
    { key: 'pending', label: 'En attente' },
    { key: 'approved', label: 'Approuvés' },
    { key: 'rejected', label: 'Désapprouvés' },
    { key: 'all', label: 'Tous' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilter(f.key)}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
              filter === f.key
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {f.label}
            {f.key !== 'all' && counts[f.key] != null && (
              <span className="ml-2 opacity-80">({counts[f.key]})</span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-gray-500">Chargement…</p>
      ) : comments.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center text-gray-600">
          Aucun commentaire dans cette catégorie.
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((c) => (
            <article
              key={c.id}
              className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
                <div>
                  <p className="font-semibold text-gray-900">{c.authorName}</p>
                  {c.authorEmail && (
                    <p className="text-sm text-gray-500">{c.authorEmail}</p>
                  )}
                  <p className="text-xs text-indigo-600 mt-1 font-medium">
                    {getTargetLabel(
                      c.targetType as 'blog' | 'quiz' | 'lesson',
                      c.targetSlug
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 text-xs font-medium rounded-full ${
                      c.status === 'approved'
                        ? 'bg-green-100 text-green-800'
                        : c.status === 'rejected'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {STATUS_LABELS[c.status] || c.status}
                  </span>
                  <time className="text-xs text-gray-500">
                    {new Date(c.createdAt).toLocaleString('fr-FR')}
                  </time>
                </div>
              </div>

              <p className="text-gray-700 whitespace-pre-wrap mb-4 leading-relaxed border-l-4 border-gray-200 pl-4">
                {c.content}
              </p>

              <div className="flex flex-wrap gap-2">
                {c.status !== 'approved' && (
                  <button
                    type="button"
                    disabled={actionId === c.id}
                    onClick={() => updateStatus(c.id, 'approved')}
                    className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    Approuver
                  </button>
                )}
                {c.status !== 'rejected' && (
                  <button
                    type="button"
                    disabled={actionId === c.id}
                    onClick={() => updateStatus(c.id, 'rejected')}
                    className="px-4 py-2 bg-amber-600 text-white text-sm font-medium rounded-lg hover:bg-amber-700 disabled:opacity-50"
                  >
                    Désapprouver
                  </button>
                )}
                {c.status !== 'pending' && (
                  <button
                    type="button"
                    disabled={actionId === c.id}
                    onClick={() => updateStatus(c.id, 'pending')}
                    className="px-4 py-2 bg-gray-200 text-gray-800 text-sm font-medium rounded-lg hover:bg-gray-300 disabled:opacity-50"
                  >
                    Remettre en attente
                  </button>
                )}
                <button
                  type="button"
                  disabled={actionId === c.id}
                  onClick={() => deleteComment(c.id)}
                  className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  Supprimer
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
