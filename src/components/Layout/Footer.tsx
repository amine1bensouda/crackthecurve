import Link from 'next/link';
import { SITE_NAME } from '@/lib/constants';

const navigation = [
  ['/', 'Home'],
  ['/about-us', 'About Us'],
  ['/contact-us', 'Contact Us'],
  ['/blogs', 'Blogs'],
];

const information = [
  ['/terms-of-service', 'Terms of Service'],
  ['/privacy-policy', 'Privacy Policy'],
  ['/contact-us', 'Support'],
];

export default function Footer() {
  return (
    <footer className="bg-[#1d2a45] px-6 pb-7 pt-14 text-white/60">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-10 border-b border-white/10 pb-10 md:grid-cols-[1.6fr_1fr_1fr]">
          <div>
            <Link href="/" className="font-display flex items-center gap-2.5 text-xl font-semibold text-white">
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-[linear-gradient(135deg,#3f7267,#2c3c5e)] font-sans text-[11px] font-bold">SP</span>
              {SITE_NAME}
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-6">
              Free, structured math practice for major standardized exams, with focused questions designed to build skill and confidence.
            </p>
          </div>
          <div>
            <h3 className="mb-4 text-xs font-bold uppercase tracking-[0.15em] text-white">Navigation</h3>
            <div className="space-y-2.5 text-sm">
              {navigation.map(([href, label]) => <Link key={href} href={href} className="block transition hover:text-white">{label}</Link>)}
            </div>
          </div>
          <div>
            <h3 className="mb-4 text-xs font-bold uppercase tracking-[0.15em] text-white">Information</h3>
            <div className="space-y-2.5 text-sm">
              {information.map(([href, label]) => <Link key={href} href={href} className="block transition hover:text-white">{label}</Link>)}
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2 pt-6 text-xs sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} {SITE_NAME}. All rights reserved.</span>
          <span>Made for every score.</span>
        </div>
      </div>
    </footer>
  );
}
