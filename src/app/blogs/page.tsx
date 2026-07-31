import { Metadata } from 'next';
import { SITE_NAME } from '@/lib/constants';
import Link from 'next/link';
import { getAllBlogPosts } from '@/lib/blog-data';

export const metadata: Metadata = {
  title: 'Blog | Exam Tips & License Prep',
  description: `Read our latest articles, exam tips, and practice guides from ${SITE_NAME}. Professional license and certification prep.`,
  openGraph: {
    title: `Blog | ${SITE_NAME}`,
    description: `Articles and tips to help you pass your professional licensing exams.`,
  },
};

export default function BlogsPage() {
  const blogPosts = getAllBlogPosts();

  return (
    <div className="min-h-screen bg-[#fdfbf7]">
      <div className="container mx-auto max-w-[100vw] px-4 py-10 sm:px-5 sm:py-12 md:px-6 md:py-16">
        <div className="mx-auto max-w-6xl">
          <header className="mb-10 text-center sm:mb-14 md:mb-16">
            <h1 className="font-display mb-3 text-3xl font-semibold text-[#2c3c5e] sm:mb-4 sm:text-4xl md:text-5xl">
              Blog
            </h1>
            <p className="mx-auto max-w-2xl text-base text-[#6b7180] sm:text-lg md:text-xl">
              Tips, exam prep, and practice guides to help you pass your professional licensing exams.
            </p>
          </header>

          {blogPosts.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 md:gap-8">
              {blogPosts.map((post) => (
                <Link
                  key={post.id}
                  href={`/blogs/${post.id}`}
                  className="group flex flex-col overflow-hidden rounded-[10px] border border-[#eae2d2] bg-white transition hover:border-[#3f7267]/40 hover:shadow-[0_2px_10px_rgba(44,60,94,0.06)]"
                >
                  <div className="flex flex-1 flex-col p-5 sm:p-6 md:p-7">
                    <span className="mb-3 inline-block w-fit rounded-md bg-[#f8f2e7] px-3 py-1 text-xs font-semibold text-[#3f7267]">
                      {post.category}
                    </span>
                    <h2 className="font-display mb-2 line-clamp-2 text-lg font-semibold text-[#2c3c5e] transition-colors group-hover:text-[#3f7267] sm:mb-3 sm:text-xl">
                      {post.title}
                    </h2>
                    <p className="line-clamp-3 flex-1 text-sm text-[#6b7180] sm:text-base">
                      {post.excerpt}
                    </p>
                    <div className="mt-4 flex items-center justify-between border-t border-[#eae2d2] pt-4">
                      <span className="text-xs text-[#6b7180] sm:text-sm">
                        {new Date(post.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                      <span className="text-sm font-semibold text-[#2c3c5e] group-hover:underline">
                        Read more →
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-[10px] border border-[#eae2d2] bg-white py-16 text-center sm:py-20">
              <p className="text-base text-[#6b7180] sm:text-lg">No blog posts available at the moment.</p>
            </div>
          )}

          <div className="mt-12 text-center sm:mt-16">
            <div className="inline-flex flex-col items-center gap-4 rounded-[10px] border border-[#eae2d2] bg-[#f8f2e7] p-6 sm:flex-row sm:p-8">
              <p className="text-sm font-medium text-[#2c3c5e] sm:text-base">
                Ready to practice? Try our free license prep quizzes.
              </p>
              <Link
                href="/quiz"
                className="inline-flex items-center gap-2 rounded-md bg-[#2c3c5e] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1d2a45] sm:px-6 sm:py-3 sm:text-base"
              >
                View quizzes
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
