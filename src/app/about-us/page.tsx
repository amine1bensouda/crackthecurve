import { Metadata } from 'next';
import { SITE_NAME } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'About us',
  description: `Learn more about ${SITE_NAME} and our mission to help you prepare for professional licensing exams`,
};

export default function AboutUsPage() {
  return (
    <div className="min-h-screen bg-[#fdfbf7]">
      <div className="container mx-auto max-w-4xl px-4 py-12 md:py-16">
        <section className="mb-12">
          <h1 className="font-display mb-6 text-3xl font-semibold text-[#2c3c5e] md:text-4xl">
            About {SITE_NAME}
          </h1>
          <div className="space-y-4 leading-relaxed text-[#6b7180]">
            <p>
              {SITE_NAME} is an independent platform dedicated to helping professionals prepare for
              licensing and certification exams across engineering, nursing, accounting, construction, and more.
            </p>
            <p>
              Our goal is to make effective exam practice accessible — whether you are studying for your
              first professional license or advancing into a specialized certification.
            </p>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="font-display mb-6 text-3xl font-semibold text-[#2c3c5e] md:text-4xl">
            What We Offer
          </h2>
          <div className="space-y-4 leading-relaxed text-[#6b7180]">
            <p>
              We provide practice quizzes organized by industry, topic, and difficulty level. Each question
              includes a clear explanation designed to help you understand concepts, improve accuracy, and
              build exam-day confidence.
            </p>
            <p>
              As the platform grows, {SITE_NAME} will continue expanding with instructional lessons,
              study guides, and curated prep resources for more licenses and certifications.
            </p>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="font-display mb-6 text-3xl font-semibold text-[#2c3c5e] md:text-4xl">
            Who This Platform Is For
          </h2>
          <p className="leading-relaxed text-[#6b7180]">
            {SITE_NAME} is designed for aspiring and practicing professionals — engineers, nurses,
            accountants, contractors, and independent learners — who want structured practice for
            professional licensing and certification exams.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="font-display mb-6 text-3xl font-semibold text-[#2c3c5e] md:text-4xl">
            Educational Disclaimer
          </h2>
          <div className="rounded-[10px] border border-[#eae2d2] bg-[#f8f2e7] p-6">
            <p className="leading-relaxed text-[#6b7180]">
              {SITE_NAME} is an independent educational resource and is not affiliated with or endorsed by
              any licensing board, professional association, or testing organization. All trademarks belong
              to their respective owners.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
