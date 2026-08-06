import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Analytics } from '@vercel/analytics/react';
import './globals.css';
import GoogleAnalytics from '@/components/Analytics/GoogleAnalytics';
import NavigationProgress from '@/components/Layout/NavigationProgress';
import ConditionalLayout from '@/components/Layout/ConditionalLayout';
import CookieBanner from '@/components/Layout/CookieBanner';
import SiteJsonLd from '@/components/SEO/SiteJsonLd';
import { SITE_NAME, SITE_DESCRIPTION, SITE_URL } from '@/lib/constants';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: SITE_NAME,
  title: {
    default: `${SITE_NAME} — Professional License & Certification Exam Prep`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    'license exam prep',
    'certification practice',
    'PE',
    'NCLEX',
    'CPA',
    'PMP',
    'bar exam',
    'SonaPrep',
  ],
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} — Professional License & Certification Exam Prep`,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_NAME} — Professional License & Certification Exam Prep`,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'aqePUc7IOnNBwXrNGJFYlioTwHiWw7VugJH7lJ_BmVc',
  },
  icons: {
    icon: [
      { url: '/icon', type: 'image/png', sizes: '48x48' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/icon',
    apple: [{ url: '/apple-icon', sizes: '180x180', type: 'image/png' }],
  },
  other: {
    'google-site-verification': 'aqePUc7IOnNBwXrNGJFYlioTwHiWw7VugJH7lJ_BmVc',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,600;0,700;1,600&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <SiteJsonLd />
      </head>
      <body>
        <GoogleAnalytics />
        <Suspense fallback={null}>
          <NavigationProgress />
        </Suspense>
        <ConditionalLayout>{children}</ConditionalLayout>
        <CookieBanner />
        <Analytics />
      </body>
    </html>
  );
}
