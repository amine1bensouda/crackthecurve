import { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/constants';
import { getAllQuizSlugs, getIndexableCategorySlugs } from '@/lib/quiz-service';
import { getAllPublishedCourses } from '@/lib/course-service';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = SITE_URL;
  const currentDate = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/about-us`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact-us`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/blogs`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/quiz`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/privacy-policy`,
      lastModified: currentDate,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms-of-service`,
      lastModified: currentDate,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/categorie`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
  ];

  let quizPages: MetadataRoute.Sitemap = [];
  try {
    const quizSlugs = await getAllQuizSlugs();
    quizPages = quizSlugs.map((slug) => ({
      url: `${baseUrl}/quiz/${encodeURIComponent(slug)}`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));
  } catch (error) {
    console.error('Erreur récupération slugs quiz pour sitemap:', error);
  }

  let coursePages: MetadataRoute.Sitemap = [];
  try {
    const courses = await getAllPublishedCourses();
    coursePages = courses
      .filter((course) =>
        course.modules.some((module) => (module._count?.quizzes ?? 0) > 0)
      )
      .map((course) => ({
        url: `${baseUrl}/quiz/course/${encodeURIComponent(course.slug)}`,
        lastModified: course.updatedAt || currentDate,
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      }));
  } catch (error) {
    console.error('Erreur récupération cours pour sitemap:', error);
  }

  let categoryPages: MetadataRoute.Sitemap = [];
  try {
    const categorySlugs = await getIndexableCategorySlugs();
    categoryPages = categorySlugs.map((slug) => ({
      url: `${baseUrl}/categorie/${encodeURIComponent(slug)}`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));
  } catch (error) {
    console.error('Erreur récupération catégories pour sitemap:', error);
  }

  return [...staticPages, ...quizPages, ...coursePages, ...categoryPages];
}
