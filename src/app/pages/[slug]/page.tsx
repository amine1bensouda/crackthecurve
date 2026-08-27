import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPublishedPageBySlugData } from '@/lib/cache';
import { SITE_URL } from '@/lib/constants';
import { extractEmbeddedCss, sanitizeCss, sanitizeHtml } from '@/lib/sanitize-html';
import { resolveSeoDescription, resolveSeoTitle } from '@/lib/seo-meta';

export const revalidate = 900;

interface PageProps {
  params: Promise<{ slug: string }> | { slug: string };
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await Promise.resolve(params);
  const page = await getPublishedPageBySlugData(slug);

  if (!page) {
    return {
      title: 'Page not found',
      robots: { index: false, follow: false },
    };
  }

  const canonical = `/pages/${page.slug}`;
  const title = resolveSeoTitle(page.metaTitle, page.title);
  const description = resolveSeoDescription(page.metaDescription) || undefined;

  return {
    title,
    description,
    alternates: { canonical },
    robots: page.noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
    openGraph: {
      title,
      description,
      type: 'website',
      url: `${SITE_URL}${canonical}`,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function CustomPublicPage({ params }: PageProps) {
  const { slug } = await Promise.resolve(params);
  const page = await getPublishedPageBySlugData(slug);

  if (!page) {
    notFound();
  }

  const pageCss = [
    sanitizeCss(page.css || ''),
    extractEmbeddedCss(page.html || ''),
  ]
    .filter(Boolean)
    .join('\n');

  return (
    <>
      {pageCss && (
        <style
          dangerouslySetInnerHTML={{
            __html: `\n/* Custom page CSS: ${page.slug} */\n${pageCss}\n`,
          }}
        />
      )}
      <main
        className="custom-page"
        data-page-slug={page.slug}
        dangerouslySetInnerHTML={{ __html: sanitizeHtml(page.html || '') }}
      />
    </>
  );
}
