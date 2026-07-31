import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  getBlogPostById,
  getBlogPostBySlug,
  getRelatedBlogPosts,
  getAllBlogPosts,
} from '@/lib/blog-data';

interface PageProps {
  params: { id: string };
}

function getPost(id: string) {
  const byId = getBlogPostById(id);
  if (byId) return byId;
  return getBlogPostBySlug(id);
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const post = getPost(params.id);
  if (!post) return { title: 'Blog' };
  return {
    title: `${post.title} | SonaPrep`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
    },
  };
}

export function generateStaticParams() {
  const posts = getAllBlogPosts();
  return posts.flatMap((p) => [
    { id: String(p.id) },
    ...(p.slug ? [{ id: p.slug }] : []),
  ]);
}

export default function BlogPostPage({ params }: PageProps) {
  const post = getPost(params.id);

  if (!post) {
    notFound();
  }

  const related = getRelatedBlogPosts(post.id, 3);
  const formattedDate = new Date(post.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="min-h-screen bg-[#fdfbf7]">
      <header className="bg-[#2c3c5e] text-white">
        <div className="container mx-auto max-w-[100vw] px-4 py-6 sm:px-5 sm:py-8 md:px-6 md:py-10">
          <div className="max-w-3xl">
            <Link
              href="/blogs"
              className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-white/70 transition-colors hover:text-white"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              All articles
            </Link>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#c79a55]">
              {post.category}
            </p>
            <h1 className="font-display text-2xl font-semibold leading-tight tracking-tight text-white min-[400px]:text-3xl sm:text-4xl md:text-5xl">
              {post.title}
            </h1>
            <time dateTime={post.date} className="mt-4 block text-sm text-white/60">
              {formattedDate}
            </time>
          </div>
        </div>
      </header>

      <div className="container mx-auto max-w-[100vw] px-4 py-8 sm:px-5 sm:py-10 md:px-6 md:py-12">
        <div className="mx-auto flex max-w-6xl flex-col lg:flex-row lg:gap-12">
          <article className="min-w-0 flex-1 lg:max-w-[65%]">
            <div
              className="prose prose-lg max-w-none
                prose-headings:font-display prose-headings:font-semibold prose-headings:tracking-tight prose-headings:text-[#2c3c5e]
                prose-h2:mb-4 prose-h2:mt-10 prose-h2:border-b prose-h2:border-[#eae2d2] prose-h2:pb-2 prose-h2:text-xl sm:prose-h2:text-2xl
                prose-p:leading-[1.75] prose-p:text-[#6b7180]
                prose-a:text-[#3f7267] prose-a:no-underline hover:prose-a:underline"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {post.tags && post.tags.length > 0 && (
              <div className="mt-10 border-t border-[#eae2d2] pt-6">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#6b7180]">Topics</p>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-md bg-[#f8f2e7] px-3 py-1.5 text-xs font-medium text-[#2c3c5e]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </article>

          <aside className="mt-10 lg:mt-0 lg:w-[35%] lg:max-w-sm lg:flex-shrink-0">
            <div className="space-y-8 lg:sticky lg:top-24">
              {post.ctaLink && post.ctaText && (
                <div className="rounded-[10px] bg-[#2c3c5e] p-5 text-white sm:p-6">
                  <p className="mb-2 text-sm font-semibold text-[#c79a55]">Next step</p>
                  <Link
                    href={post.ctaLink}
                    className="mt-2 inline-flex items-center gap-2 rounded-md bg-white px-4 py-3 text-sm font-semibold text-[#2c3c5e] transition hover:bg-[#f8f2e7]"
                  >
                    {post.ctaText}
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Link>
                </div>
              )}

              {related.length > 0 && (
                <div>
                  <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[#6b7180]">
                    Related articles
                  </h3>
                  <ul className="space-y-3">
                    {related.map((p) => (
                      <li key={p.id}>
                        <Link
                          href={`/blogs/${p.id}`}
                          className="group block rounded-[10px] border border-transparent p-3 transition-colors hover:border-[#eae2d2] hover:bg-white"
                        >
                          <span className="text-xs font-medium text-[#6b7180]">{p.category}</span>
                          <p className="mt-0.5 line-clamp-2 text-sm font-semibold leading-snug text-[#2c3c5e] group-hover:text-[#3f7267]">
                            {p.title}
                          </p>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <Link
                href="/blogs"
                className="block rounded-[10px] border border-[#eae2d2] bg-white py-3 text-center text-sm font-medium text-[#6b7180] transition-colors hover:border-[#2c3c5e] hover:text-[#2c3c5e]"
              >
                ← Back to all articles
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
