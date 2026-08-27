import { Metadata } from 'next';
import { SITE_NAME } from '@/lib/constants';
import Link from 'next/link';
import { getAllBlogPostsFromDB } from '@/lib/blog-data';

export const revalidate = 900;

export async function generateMetadata(): Promise<Metadata> {
  const blogPosts = await getAllBlogPostsFromDB();
  const hasPosts = blogPosts.length > 0;

  return {
    title: 'Blog | Exam Tips & License Prep',
    description: `Read our latest articles, exam tips, and practice guides from ${SITE_NAME}. Professional license and certification prep.`,
    alternates: { canonical: '/blogs' },
    openGraph: {
      title: `Blog | ${SITE_NAME}`,
      description: `Articles and tips to help you pass your professional licensing exams.`,
    },
    robots: hasPosts
      ? { index: true, follow: true }
      : { index: false, follow: false },
  };
}

export default async function BlogsPage() {
  const blogPosts = await getAllBlogPostsFromDB();

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
                  href={`/blogs/${post.slug || post.id}`}
                  className="group flex flex-col overflow-hidden rounded-[10px] border border-[#eae2d2] bg-white transition hover:border-[#3f7267]/40 hover:shadow-[0_2px_10px_rgba(44,60,94,0.06)]"
                >
                  <div className="flex flex-1 flex-col p-5 sm:p-6 md:p-7">
                    {post.category ? (
                      <span className="mb-3 inline-block w-fit rounded-md bg-[#f8f2e7] px-3 py-1 text-xs font-semibold text-[#3f7267]">
                        {post.category}
                      </span>
                    ) : null}
                    <h2 className="font-display mb-3 text-xl font-semibold text-[#2c3c5e] transition group-hover:text-[#3f7267] sm:text-2xl">
                      {post.title}
                    </h2>
                    <p className="mb-4 flex-1 text-sm leading-relaxed text-[#6b7180] line-clamp-3 sm:text-base">
                      {post.excerpt}
                    </p>
                    <time dateTime={post.date} className="text-xs text-[#6b7180]/80">
                      {new Date(post.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </time>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-[10px] border border-[#eae2d2] bg-white p-10 text-center text-[#6b7180]">
              No articles published yet. Create posts from the admin panel.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
