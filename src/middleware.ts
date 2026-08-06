import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Redirect www → non-www (canonical unique).
 * Ne pas rediriger sur le port interne PM2 (évite ERR_TOO_MANY_REDIRECTS).
 */
export function middleware(request: NextRequest) {
  const host = request.headers.get('host') || '';
  const hostname = host.split(':')[0].toLowerCase();
  const internalPort = request.nextUrl.port;

  // Port interne (ex. 3001 derrière nginx) → ne pas toucher
  if (internalPort && internalPort !== '80' && internalPort !== '443' && internalPort !== '') {
    return NextResponse.next();
  }

  if (hostname.startsWith('www.')) {
    const bare = hostname.replace(/^www\./, '');
    const url = request.nextUrl.clone();
    url.hostname = bare;
    url.protocol = 'https';
    url.port = '';
    return NextResponse.redirect(url, 308);
  }

  const pathname = request.nextUrl.pathname;
  const response = NextResponse.next();

  if (
    pathname.startsWith('/admin') ||
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/register') ||
    pathname.includes('/correction')
  ) {
    response.headers.set('X-Robots-Tag', 'noindex, nofollow');
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
