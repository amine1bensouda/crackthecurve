import type { Quiz } from '@/lib/types';
import { SITE_URL } from '@/lib/constants';
import { stripHtml } from '@/lib/utils';
import { safeJsonLd } from '@/lib/sanitize-html';
import { questionPlainTextForSeo } from '@/lib/seo-questions';

interface QuizSchemaProps {
  quiz: Quiz;
}

export default function QuizSchema({ quiz }: QuizSchemaProps) {
  const questions = quiz.acf?.questions || [];
  const questionCount = questions.length;
  const title = stripHtml(quiz.title.rendered);
  const description = stripHtml(quiz.excerpt?.rendered || quiz.content?.rendered || '');

  const hasPart = questions.map((question, index) => {
    const raw =
      question.texte_question ||
      question.title?.rendered ||
      question.content?.rendered ||
      `Question ${index + 1}`;
    const text = questionPlainTextForSeo(raw, `Question ${index + 1}`);
    const answers = question.reponses || question.acf?.reponses || [];
    const suggestedAnswers = answers
      .map((answer) => questionPlainTextForSeo(answer.texte, ''))
      .filter(Boolean)
      .map((answerText) => ({
        '@type': 'Answer',
        text: answerText,
      }));

    return {
      '@type': 'Question',
      name: text,
      text,
      position: index + 1,
      ...(suggestedAnswers.length > 0 && {
        suggestedAnswer: suggestedAnswers,
      }),
    };
  });

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Quiz',
    name: title,
    description,
    url: `${SITE_URL}/quiz/${encodeURIComponent(quiz.slug)}`,
    ...(quiz.featured_media_url && {
      image: quiz.featured_media_url,
    }),
    ...(quiz.acf?.duree_estimee && {
      timeRequired: `PT${quiz.acf.duree_estimee}M`,
    }),
    ...(quiz.acf?.niveau_difficulte && {
      educationalLevel: quiz.acf.niveau_difficulte,
    }),
    numberOfQuestions: questionCount,
    isAccessibleForFree: true,
    ...(quiz.acf?.categorie && {
      about: {
        '@type': 'Thing',
        name: quiz.acf.categorie,
      },
    }),
    ...(hasPart.length > 0 && { hasPart }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: safeJsonLd(schema) }}
    />
  );
}
