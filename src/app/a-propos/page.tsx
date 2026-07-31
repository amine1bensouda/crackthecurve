import { Metadata } from 'next';
import { SITE_NAME } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'About',
  description: `Discover ${SITE_NAME} and our mission to help you prepare for professional licenses`,
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#fdfbf7]">
      <div className="container mx-auto max-w-4xl px-4 py-12">
        <h1 className="font-display mb-8 text-4xl font-semibold text-[#2c3c5e]">About</h1>

        <div className="max-w-none space-y-6">
          <p className="mb-6 text-xl text-[#6b7180]">
            Welcome to {SITE_NAME}, your practice platform for professional licensing and
            certification exams across engineering, nursing, accounting, construction, and more.
          </p>

          <h2 className="font-display mb-4 mt-8 text-2xl font-semibold text-[#2c3c5e]">Our Mission</h2>
          <p className="mb-6 text-[#6b7180]">
            Our goal is to make license prep clear, structured, and accessible. Whether you are
            preparing for your first professional exam or advancing into a specialized certification,
            our quizzes are designed to build confidence and understanding.
          </p>

          <h2 className="font-display mb-4 mt-8 text-2xl font-semibold text-[#2c3c5e]">Our Quizzes</h2>
          <p className="mb-6 text-[#6b7180]">
            We offer practice quizzes covering a wide range of professional topics and industries.
            Each quiz is carefully designed to be both educational and exam-focused, with clear
            explanations for every answer.
          </p>

          <h2 className="font-display mb-4 mt-8 text-2xl font-semibold text-[#2c3c5e]">How It Works</h2>
          <p className="mb-6 text-[#6b7180]">
            Browse our categories, choose a quiz that matches your license or certification, and start
            answering questions. At the end, you will receive your score and detailed explanations for
            each answer.
          </p>
        </div>
      </div>
    </div>
  );
}
