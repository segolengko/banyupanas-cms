import 'server-only';

import { headers } from 'next/headers';

const INVALID_REQUEST_ORIGIN = 'INVALID_REQUEST_ORIGIN';

function getFallbackOrigin(requestHeaders: Headers) {
  const host = requestHeaders.get('x-forwarded-host') || requestHeaders.get('host');
  const protocol =
    requestHeaders.get('x-forwarded-proto') || (process.env.NODE_ENV === 'development' ? 'http' : 'https');

  if (!host) {
    return null;
  }

  return `${protocol}://${host}`;
}

function normalizeOrigin(value: string | null) {
  if (!value) {
    return null;
  }

  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

export async function assertTrustedRequestOrigin() {
  const requestHeaders = await headers();
  const requestOrigin =
    normalizeOrigin(requestHeaders.get('origin')) || normalizeOrigin(requestHeaders.get('referer'));
  const expectedOrigin =
    normalizeOrigin(process.env.NEXT_PUBLIC_SITE_URL || null) || normalizeOrigin(getFallbackOrigin(requestHeaders));

  if (!requestOrigin || !expectedOrigin || requestOrigin !== expectedOrigin) {
    throw new Error(INVALID_REQUEST_ORIGIN);
  }
}

export function isInvalidRequestOriginError(error: unknown) {
  return error instanceof Error && error.message === INVALID_REQUEST_ORIGIN;
}
