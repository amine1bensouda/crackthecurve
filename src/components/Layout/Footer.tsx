import Link from 'next/link';
import { SITE_NAME } from '@/lib/constants';
import Logo from '@/components/Layout/Logo';

const navigation = [
  ['/', 'Home'],
  ['/about-us', 'About Us'],
  ['/contact-us', 'Contact Us'],
  ['/blogs', 'Blogs'],
];

const information = [
  ['/terms-of-service', 'Terms of Service'],
  ['/privacy-policy', 'Privacy Policy'],
  ['/privacy-policy', 'Cookie Policy'],
  ['/about-us', 'Editorial Policy'],
  ['/about-us', 'Our Methodology'],
];

export default function Footer() {
  return (
    <footer className="bg-[#1d2a45] px-6 pb-[26px] pt-[60px] text-white/60">
      <div className="mx-auto max-w-[1160px]">
        <div className="grid gap-10 border-b border-white/[0.12] pb-9 md:grid-cols-[1.6fr_1fr_1fr]">
          <div>
            <Logo href="/" variant="dark" size="sm" />
            <p className="footer-desc mt-3 max-w-[280px] text-[0.88rem] leading-relaxed">
              Structured license and certification exam preparation, with rigorous, board-mapped
              practice questions to help you pass.
            </p>
          </div>
          <div>
            <h5 className="mb-3.5 text-[0.85rem] font-bold tracking-[0.02em] text-white">Navigation</h5>
            <div className="space-y-2.5 text-[0.88rem]">
              {navigation.map(([href, label]) => (
                <Link key={`${href}-${label}`} href={href} className="block transition hover:text-white">
                  {label}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <h5 className="mb-3.5 text-[0.85rem] font-bold tracking-[0.02em] text-white">Information</h5>
            <div className="space-y-2.5 text-[0.88rem]">
              {information.map(([href, label]) => (
                <Link key={label} href={href} className="block transition hover:text-white">
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2 pt-[22px] text-[0.82rem] sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} {SITE_NAME}. All rights reserved.</span>
          <span>Made for every license.</span>
        </div>
      </div>
    </footer>
  );
}
