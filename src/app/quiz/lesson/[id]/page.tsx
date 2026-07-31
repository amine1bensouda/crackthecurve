'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Navigation from '@/components/Layout/Navigation';
import SafeHtmlRenderer from '@/components/Common/SafeHtmlRenderer';
import LoadingSpinner from '@/components/Layout/LoadingSpinner';

interface Lesson {
  id: string;
  title: string;
  slug: string;
  content: string;
  featuredImageUrl: string | null;
  videoUrl: string | null;
  videoPlaybackSeconds: number | null;
  pdfUrl: string | null;
  allowPreview: boolean;
  module: {
    id: string;
    title: string;
    course: {
      id: string;
      title: string;
      slug: string;
    };
  };
}

export default function LessonPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLesson() {
      try {
        const res = await fetch(`/api/lessons/${id}`);
        if (res.ok) {
          const data = await res.json();
          setLesson(data);
        } else if (res.status === 404) {
          router.push('/quiz');
        }
      } catch (e) {
        console.error('Erreur chargement lesson:', e);
      } finally {
        setLoading(false);
      }
    }
    if (id) loadLesson();
  }, [id, router]);

  if (loading) {
    return (
      <div className="relative min-h-screen bg-[#fdfbf7]">
        <Navigation />
        <div className="mx-auto flex max-w-[1160px] flex-col items-center gap-5 px-6 py-16">
          <LoadingSpinner size="lg" />
          <p className="font-display text-lg font-semibold text-[#2c3c5e]">Loading lesson...</p>
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="relative min-h-screen bg-[#fdfbf7]">
        <Navigation />
        <div className="mx-auto max-w-[1160px] px-6 py-16 text-center">
          <p className="mb-4 text-[#6b7180]">Lesson not found.</p>
          <Link href="/quiz" className="font-medium text-[#3f7267] hover:text-[#2c3c5e]">Back to courses</Link>
        </div>
      </div>
    );
  }

  const courseSlug = lesson.module.course.slug;

  return (
    <div className="relative min-h-screen bg-[#fdfbf7]">
      <Navigation />
      <div className="relative z-10 mx-auto max-w-4xl px-6 py-6 sm:py-10">
        <nav className="mb-6 text-sm text-[#6b7180]">
          <Link href="/" className="hover:text-[#2c3c5e]">Home</Link>
          <span className="mx-1.5">/</span>
          <Link href="/quiz" className="hover:text-[#2c3c5e]">Courses</Link>
          <span className="mx-1.5">/</span>
          <Link href={`/quiz/course/${courseSlug}`} className="hover:text-[#2c3c5e]">{lesson.module.course.title}</Link>
          <span className="mx-1.5">/</span>
          <span className="font-medium text-[#2c3c5e]">{lesson.title}</span>
        </nav>

        <article className="overflow-hidden rounded-[10px] border border-[#eae2d2] bg-white shadow-[0_2px_10px_rgba(44,60,94,0.04)]">
          {lesson.featuredImageUrl && (
            <div className="aspect-video w-full bg-[#f8f2e7]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={lesson.featuredImageUrl}
                alt=""
                className="h-full w-full object-cover"
              />
            </div>
          )}
          <div className="p-6 sm:p-8">
            <h1 className="font-display mb-4 text-2xl font-semibold text-[#2c3c5e] sm:text-3xl">{lesson.title}</h1>

            {lesson.videoUrl && (
              <div className="mb-6 overflow-hidden rounded-[10px] bg-black">
                <video
                  src={lesson.videoUrl}
                  controls
                  className="aspect-video w-full"
                  poster={lesson.featuredImageUrl ?? undefined}
                >
                  Your browser does not support the video tag.
                </video>
                {lesson.videoPlaybackSeconds != null && lesson.videoPlaybackSeconds > 0 && (
                  <p className="px-3 py-2 text-xs text-[#6b7180]">
                    Duration: {Math.floor(lesson.videoPlaybackSeconds / 60)} min {lesson.videoPlaybackSeconds % 60} s
                  </p>
                )}
              </div>
            )}

            {lesson.pdfUrl && (
              <div className="mb-6 overflow-hidden rounded-[10px] border border-[#eae2d2] bg-[#f8f2e7]">
                <div className="flex items-center justify-between gap-2 border-b border-[#eae2d2] bg-white px-4 py-3">
                  <span className="text-sm font-medium text-[#2c3c5e]">PDF</span>
                  <a
                    href={lesson.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-[#3f7267] hover:text-[#2c3c5e]"
                  >
                    Open in new tab
                  </a>
                </div>
                <iframe
                  src={`${lesson.pdfUrl}#view=FitH`}
                  title="Lesson PDF"
                  className="min-h-[60vh] w-full border-0 bg-white"
                />
              </div>
            )}

            {lesson.content && (
              <div className="prose max-w-none text-[#6b7180]">
                <SafeHtmlRenderer html={lesson.content} renderMath />
              </div>
            )}
          </div>
        </article>

        <div className="mt-6">
          <Link
            href={`/quiz/course/${courseSlug}`}
            className="inline-flex items-center gap-2 font-medium text-[#3f7267] hover:text-[#2c3c5e]"
          >
            ← Back to {lesson.module.course.title}
          </Link>
        </div>
      </div>
    </div>
  );
}
