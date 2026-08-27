import { revalidateTag, unstable_cache } from 'next/cache';
import { prisma } from './db';

export const BLOGS_CACHE_TAG = 'blogs';
export const PAGES_CACHE_TAG = 'custom-pages';
export const QUIZZES_CACHE_TAG = 'quizzes';
export const COURSES_CACHE_TAG = 'courses';

const blogsCacheConfig = {
  revalidate: 900,
  tags: [BLOGS_CACHE_TAG],
};

const pagesCacheConfig = {
  revalidate: 900,
  tags: [PAGES_CACHE_TAG],
};

/** Liste publique des blogs publiés. */
export const getAllPublishedBlogsData = unstable_cache(
  async () => {
    return prisma.blogPost.findMany({
      where: { status: 'published' },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        content: true,
        category: true,
        tags: true,
        ctaLink: true,
        ctaText: true,
        metaTitle: true,
        metaDescription: true,
        publishedAt: true,
        createdAt: true,
      },
      orderBy: { publishedAt: 'desc' },
    });
  },
  ['blogs-published-list'],
  blogsCacheConfig
);

/** Blog public publié par id ou slug. */
export const getPublishedBlogByIdOrSlugData = unstable_cache(
  async (idOrSlug: string) => {
    const byId = await prisma.blogPost.findFirst({
      where: { id: idOrSlug, status: 'published' },
    });
    if (byId) return byId;

    return (
      (await prisma.blogPost.findFirst({
        where: { slug: idOrSlug, status: 'published' },
      })) ?? null
    );
  },
  ['blogs-published-by-id-or-slug'],
  blogsCacheConfig
);

export function invalidatePublishedBlogsCache() {
  revalidateTag(BLOGS_CACHE_TAG);
}

export function invalidatePublishedQuizzesCache() {
  revalidateTag(QUIZZES_CACHE_TAG);
}

export function invalidatePublishedCoursesCache() {
  revalidateTag(COURSES_CACHE_TAG);
}

export const getAllPublishedPagesData = unstable_cache(
  async () => {
    return prisma.customPage.findMany({
      where: { status: 'published' },
      select: {
        id: true,
        title: true,
        slug: true,
        metaTitle: true,
        metaDescription: true,
        noIndex: true,
        publishedAt: true,
        updatedAt: true,
      },
      orderBy: { publishedAt: 'desc' },
    });
  },
  ['pages-published-list'],
  pagesCacheConfig
);

export const getPublishedPageBySlugData = unstable_cache(
  async (slug: string) => {
    return prisma.customPage.findFirst({
      where: { slug, status: 'published' },
    });
  },
  ['pages-published-by-slug'],
  pagesCacheConfig
);

export function invalidatePublishedPagesCache() {
  revalidateTag(PAGES_CACHE_TAG);
}
