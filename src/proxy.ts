import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { AUTH_COOKIE_NAME } from '@/lib/auth/constants';

function createNonce() {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  let binary = '';

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary);
}

function buildContentSecurityPolicy(nonce: string) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || '';
  const isDevelopment = process.env.NODE_ENV !== 'production';
  const isHttpsDeployment = /^https:\/\//i.test(siteUrl);

  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDevelopment ? " 'unsafe-eval'" : ''}`,
    `style-src 'self' https://fonts.googleapis.com ${isDevelopment ? "'unsafe-inline'" : `'nonce-${nonce}'`}`,
    "img-src 'self' data: blob: https:",
    "font-src 'self' data: https://fonts.gstatic.com",
    "connect-src 'self' https://*.supabase.co",
    "media-src 'self' blob: https:",
    "frame-src 'self' https://www.google.com https://www.google.com/maps https://maps.google.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    ...(isHttpsDeployment ? ['upgrade-insecure-requests'] : []),
  ]
    .join('; ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSessionCookie = Boolean(request.cookies.get(AUTH_COOKIE_NAME)?.value);
  const nonce = createNonce();
  const contentSecurityPolicy = buildContentSecurityPolicy(nonce);
  const requestHeaders = new Headers(request.headers);

  requestHeaders.set('x-nonce', nonce);
  requestHeaders.set('Content-Security-Policy', contentSecurityPolicy);

  if (pathname.startsWith('/admin') && pathname !== '/admin/login' && !hasSessionCookie) {
    const response = NextResponse.redirect(new URL('/admin/login', request.url));
    response.headers.set('Content-Security-Policy', contentSecurityPolicy);
    response.headers.set('x-nonce', nonce);
    return response;
  }

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  response.headers.set('Content-Security-Policy', contentSecurityPolicy);
  response.headers.set('x-nonce', nonce);

  return response;
}

export const config = {
  matcher: [
    {
      source: '/((?!api|_next/static|_next/image|favicon.ico|manifest.webmanifest|robots.txt|sitemap.xml).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
};
