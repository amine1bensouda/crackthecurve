import { SITE_NAME, SITE_URL } from '@/lib/constants';
import { safeJsonLd } from '@/lib/sanitize-html';

interface ArticleSchemaProps {
  title: string;
  description: string;
  slug: string;
  datePublished: string;
  dateModified?: string;
  image?: string | null;
  category?: string | null;
}

export default function ArticleSchema({
  title,
  description,
  slug,
  datePublished,
  dateModified,
  image,
  category,
}: ArticleSchemaProps) {
  const url = `${SITE_URL}/blogs/${encodeURIComponent(slug)}`;
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    url,
    datePublished,
    dateModified: dateModified || datePublished,
    author: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
    ...(image ? { image } : {}),
    ...(category ? { articleSection: category } : {}),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: safeJsonLd(schema) }}
    />
  );
}
