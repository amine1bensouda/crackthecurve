import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getAllBlogPostsFromDB, getBlogPostFromDB } from '@/lib/blog-data';
import ArticleSchema from '@/components/SEO/ArticleSchema';
import { resolveSeoDescription, resolveSeoTitle } from '@/lib/seo-meta';
import { SITE_NAME, SITE_URL } from '@/lib/constants';
import { sanitizeHtml } from '@/lib/sanitize-html';

export const revalidate = 900;

interface PageProps {
  params: Promise<{ id: string }> | { id: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await Promise.resolve(params);
  const post = await getBlogPostFromDB(id);
  if (!post) {
    return { title: 'Blog', robots: { index: false, follow: false } };
  }

  const title = resolveSeoTitle(post.metaTitle, `${post.title} | ${SITE_NAME}`);
  const description = resolveSeoDescription(post.metaDescription, post.excerpt);

  return {
    title,
    description,
    alternates: { canonical: `/blogs/${post.slug || post.id}` },
    openGraph: {
      title,
      description,
      type: 'article',
      url: `${SITE_URL}/blogs/${post.slug || post.id}`,
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { id } = await Promise.resolve(params);
  const post = await getBlogPostFromDB(id);

  if (!post) {
    notFound();
  }

  const allPosts = await getAllBlogPostsFromDB();
  const related = allPosts.filter((p) => p.id !== post.id).slice(0, 3);
  const formattedDate = new Date(post.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const title = resolveSeoTitle(post.metaTitle, post.title);
  const description = resolveSeoDescription(post.metaDescription, post.excerpt);

  return (
    <div className="min-h-screen bg-[#fdfbf7]">
      <ArticleSchema
        title={title}
        description={description}
        slug={String(post.slug || post.id)}
        datePublished={post.date}
        dateModified={post.date}
        category={post.category || null}
      />
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
            {post.category ? (
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#c79a55]">
                {post.category}
              </p>
            ) : null}
            <h1 className="font-display text-2xl font-semibold leading-tight tracking-tight text-white min-[400px]:text-3xl sm:text-4xl md:text-5xl">
              {post.title}
            </h1>
            <time dateTime={post.date} className="mt-4 block text-sm text-white/60">
              {formattedDate}
            </time>
          </div>
        </div>
      </header>

      <article className="container mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
        <div
          className="prose prose-lg max-w-none text-[#2b3244] prose-headings:font-display prose-headings:text-[#2c3c5e] prose-a:text-[#3f7267]"
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.content) }}
        />

        {post.ctaLink && post.ctaText ? (
          <div className="mt-10 rounded-[10px] border border-[#eae2d2] bg-[#f8f2e7] p-6 text-center">
            <Link
              href={post.ctaLink}
              className="inline-block rounded-md bg-[#2c3c5e] px-6 py-3 font-semibold text-white hover:bg-[#1d2a45]"
            >
              {post.ctaText}
            </Link>
          </div>
        ) : null}

        {related.length > 0 ? (
          <section className="mt-14 border-t border-[#eae2d2] pt-10">
            <h2 className="font-display mb-6 text-2xl font-semibold text-[#2c3c5e]">Related articles</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              {related.map((item) => (
                <Link
                  key={item.id}
                  href={`/blogs/${item.slug || item.id}`}
                  className="rounded-[10px] border border-[#eae2d2] bg-white p-4 transition hover:border-[#3f7267]/40"
                >
                  <h3 className="font-display text-base font-semibold text-[#2c3c5e]">{item.title}</h3>
                  <p className="mt-2 line-clamp-2 text-sm text-[#6b7180]">{item.excerpt}</p>
                </Link>
              ))}
            </div>
          </section>
        ) : null}
      </article>
    </div>
  );
}
