'use client';

import { useState, useEffect, useCallback } from 'react';
import type { CommentTargetType } from '@/lib/comments';

interface PublicComment {
  id: string;
  authorName: string;
  content: string;
  createdAt: string;
}

interface CommentsSectionProps {
  targetType: CommentTargetType;
  targetSlug: string;
  title?: string;
}

export default function CommentsSection({
  targetType,
  targetSlug,
  title = 'Comments',
}: CommentsSectionProps) {
  const [comments, setComments] = useState<PublicComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [authorName, setAuthorName] = useState('');
  const [authorEmail, setAuthorEmail] = useState('');
  const [content, setContent] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadComments = useCallback(async () => {
    try {
      const params = new URLSearchParams({ targetType, targetSlug });
      const res = await fetch(`/api/comments?${params}`);
      if (res.ok) {
        const data = await res.json();
        setComments(data);
      }
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, [targetType, targetSlug]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setSubmitting(true);

    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetType,
          targetSlug,
          authorName,
          authorEmail: authorEmail || undefined,
          content,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage({ type: 'error', text: data.error || 'Unable to submit comment' });
        return;
      }

      setContent('');
      setMessage({
        type: 'success',
        text:
          data.message ||
          'Thank you! Your comment will appear after it is approved by our team.',
      });
    } catch {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  return (
    <section className="mt-12 border-t border-gray-200 pt-10">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
      <p className="text-sm text-gray-500 mb-8">
        Share your thoughts or ask a question. Comments are moderated before publication.
      </p>

      {loading ? (
        <p className="text-gray-500 text-sm">Loading comments…</p>
      ) : comments.length > 0 ? (
        <ul className="space-y-4 mb-10">
          {comments.map((c) => (
            <li
              key={c.id}
              className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm"
            >
              <div className="flex items-center justify-between gap-4 mb-2">
                <span className="font-semibold text-gray-900">{c.authorName}</span>
                <time className="text-xs text-gray-500" dateTime={c.createdAt}>
                  {formatDate(c.createdAt)}
                </time>
              </div>
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{c.content}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500 text-sm mb-10">No comments yet. Be the first to comment!</p>
      )}

      <div className="bg-gray-50 rounded-2xl border border-gray-200 p-6 md:p-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Leave a comment</h3>

        {message && (
          <div
            className={`mb-4 rounded-lg px-4 py-3 text-sm ${
              message.type === 'success'
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="comment-author" className="block text-sm font-medium text-gray-700 mb-1">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                id="comment-author"
                type="text"
                required
                minLength={2}
                maxLength={120}
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
                placeholder="Your name"
              />
            </div>
            <div>
              <label htmlFor="comment-email" className="block text-sm font-medium text-gray-700 mb-1">
                Email <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <input
                id="comment-email"
                type="email"
                value={authorEmail}
                onChange={(e) => setAuthorEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
                placeholder="you@example.com"
              />
            </div>
          </div>
          <div>
            <label htmlFor="comment-content" className="block text-sm font-medium text-gray-700 mb-1">
              Comment <span className="text-red-500">*</span>
            </label>
            <textarea
              id="comment-content"
              required
              minLength={3}
              maxLength={5000}
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none resize-y"
              placeholder="Write your comment here…"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-3 bg-gray-900 text-white font-semibold rounded-xl hover:bg-black transition-colors disabled:opacity-50 shadow-md"
          >
            {submitting ? 'Submitting…' : 'Submit comment'}
          </button>
        </form>
      </div>
    </section>
  );
}
