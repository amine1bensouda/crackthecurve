import { stripHtml, difficultyToEnglish, categoryToEnglish, formatDuration } from '@/lib/utils';
import { SITE_NAME } from '@/lib/constants';

export interface SeoFaqItem {
  question: string;
  answer: string;
}

/**
 * Intro quiz : priorise l'extrait admin ; sinon construit un texte ancré
 * sur titre + catégorie + snippets de questions réelles (anti-template).
 */
export function buildQuizIntro(params: {
  title: string;
  category?: string;
  difficulty?: string;
  questionCount?: number;
  durationMinutes?: number;
  existingExcerptPlain?: string;
  /** Extraits des premières questions (texte brut) pour différencier chaque landing */
  questionSnippets?: string[];
}): string {
  const title = params.title.trim();
  const category = params.category ? categoryToEnglish(params.category) : '';
  const difficulty = params.difficulty
    ? difficultyToEnglish(params.difficulty)
    : '';
  const qCount = params.questionCount && params.questionCount > 0 ? params.questionCount : null;
  const duration =
    params.durationMinutes && params.durationMinutes > 0
      ? formatDuration(params.durationMinutes)
      : null;

  const existing = (params.existingExcerptPlain || '').trim();
  if (existing.length >= 160) {
    return existing.length >= 280 ? '' : existing;
  }

  const snippets = (params.questionSnippets || [])
    .map((s) => s.replace(/\s+/g, ' ').trim())
    .filter((s) => s.length > 20)
    .slice(0, 3)
    .map((s) => (s.length > 110 ? `${s.slice(0, 107)}…` : s));

  const parts: string[] = [];
  parts.push(
    `Practice ${title} on ${SITE_NAME}${category ? ` (${category})` : ''}${
      qCount ? ` with ${qCount} scored questions` : ''
    }${duration ? ` in about ${duration}` : ''}${
      difficulty && difficulty !== 'Intermediate' ? ` at ${difficulty} level` : ''
    }.`
  );

  if (snippets.length > 0) {
    parts.push(
      `This set covers problems such as: ${snippets.map((s) => `“${s}”`).join('; ')}.`
    );
  } else if (category) {
    parts.push(
      `Use it to strengthen ${category} skills with exam-style timing, clear scoring, and review after each attempt.`
    );
  }

  parts.push(
    `Work carefully, check explanations for misses, then retake to track improvement before test day.`
  );

  return parts.join(' ');
}

/**
 * FAQ : uniquement des faits spécifiques au quiz (évite 4 FAQ identiques × N landings).
 * Pas de FAQPage schema si la liste est vide.
 */
export function buildQuizFaqs(params: {
  title: string;
  category?: string;
  questionCount?: number;
  durationMinutes?: number;
  minimumScore?: number;
  hasEditorialExcerpt?: boolean;
}): SeoFaqItem[] {
  const title = params.title.trim();
  const category = params.category ? categoryToEnglish(params.category) : '';
  const qCount = params.questionCount && params.questionCount > 0 ? params.questionCount : null;
  const duration =
    params.durationMinutes && params.durationMinutes > 0
      ? formatDuration(params.durationMinutes)
      : null;
  const minScore = params.minimumScore ?? 70;

  // Sans signal éditorial ni données concrètes → pas de FAQ template
  if (!params.hasEditorialExcerpt && !qCount && !category) {
    return [];
  }

  const faqs: SeoFaqItem[] = [];

  if (qCount) {
    faqs.push({
      question: `How many questions are in ${title}?`,
      answer: `This practice set includes ${qCount} question${qCount === 1 ? '' : 's'}${
        duration ? ` and takes about ${duration}` : ''
      }. Finish in one sitting when possible, then review incorrect answers before retaking.`,
    });
  }

  if (category) {
    faqs.push({
      question: `What topic does ${title} cover?`,
      answer: `${title} focuses on ${category}. Questions follow exam-style wording and difficulty so you can practice the skills tested on major ${category} assessments. These are practice materials, not official exam questions.`,
    });
  }

  faqs.push({
    question: `How is ${title} scored?`,
    answer: `Your score is the percentage of correct answers. A typical passing score is ${minScore}%. After you finish, review each miss with the available explanations on ${SITE_NAME}.`,
  });

  return faqs.slice(0, 3);
}

/** Contenu catégorie : priorise description CMS ; sections plus courtes et ancrées. */
export function buildCategorySeoContent(params: {
  name: string;
  description?: string | null;
  courseCount: number;
}): { intro: string; sections: Array<{ heading: string; body: string }>; faqs: SeoFaqItem[] } {
  const name = params.name.trim();
  const courseCount = params.courseCount;
  const custom = (params.description || '').trim();

  const intro = custom
    ? custom
    : `${name} practice on ${SITE_NAME} organizes free exam-style quizzes by course so you can target one skill set at a time, score each attempt, and review explanations.`;

  const sections = [
    {
      heading: `Study ${name} with focused quizzes`,
      body: `Open a ${name} course below to browse modules and quizzes. Prefer short sessions, review every miss, and move to harder sets only after you pass the current one.`,
    },
  ];

  if (courseCount > 0) {
    sections.push({
      heading: 'Courses in this category',
      body: `There ${courseCount === 1 ? 'is' : 'are'} currently ${courseCount} course${
        courseCount === 1 ? '' : 's'
      } linked to ${name}. Use the cards to open lessons and practice quizzes.`,
    });
  }

  const faqs: SeoFaqItem[] = custom
    ? [
        {
          question: `Is ${name} practice free?`,
          answer: `Yes. ${SITE_NAME} offers free ${name} quizzes you can retake as needed.`,
        },
      ]
    : [];

  return { intro, sections, faqs };
}

export function buildStudyTip(percentage: number, category?: string): string {
  const topic = category ? categoryToEnglish(category) : 'the topics you missed';
  if (percentage >= 90) {
    return `Strong result. Keep momentum with a related quiz at the same or slightly higher difficulty, and review any single miss carefully.`;
  }
  if (percentage >= 70) {
    return `You passed. Before the next quiz, spend 15–20 minutes reviewing ${topic}—especially the questions you missed—then retry this set.`;
  }
  return `Focus on ${topic} fundamentals before the next quiz. Re-read explanations for incorrect answers, then retake to measure improvement.`;
}

/** Snippets texte pour différencier l'intro SEO d'un quiz. */
export function extractQuestionSnippets(
  questions: Array<{ texte_question?: string; title?: { rendered?: string } }>,
  limit = 3
): string[] {
  return questions
    .slice(0, 8)
    .map((q) =>
      stripHtml(q.texte_question || q.title?.rendered || '')
        .replace(/\$+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
    )
    .filter((t) => t.length > 24 && !/^Question\s+\d+$/i.test(t))
    .slice(0, limit);
}
