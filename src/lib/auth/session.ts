import 'server-only';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { SignJWT, jwtVerify } from 'jose';
import { AUTH_COOKIE_NAME } from '@/lib/auth/constants';
import { isPasswordAuthConfigured } from '@/lib/auth/password';

export type SessionPayload = {
  email: string;
  role: 'admin';
};

function shouldUseSecureCookies() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  if (siteUrl) {
    try {
      const parsed = new URL(siteUrl);

      if (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1') {
        return false;
      }
    } catch {
      return process.env.NODE_ENV === 'production';
    }
  }

  return process.env.NODE_ENV === 'production';
}

function getSessionSecret() {
  return process.env.CMS_SESSION_SECRET || '';
}

function getSecretKey() {
  return new TextEncoder().encode(getSessionSecret());
}

export function isAuthConfigured() {
  return isPasswordAuthConfigured() && getSessionSecret().length >= 32;
}

export async function createSession(payload: SessionPayload) {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('12h')
    .sign(getSecretKey());

  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: shouldUseSecureCookies(),
    path: '/',
    maxAge: 60 * 60 * 12,
    priority: 'high',
  });
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE_NAME);
}

export async function getSession() {
  if (!isAuthConfigured()) {
    return null;
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, getSecretKey());

    return payload as SessionPayload;
  } catch {
    return null;
  }
}

export async function requireSession() {
  const session = await getSession();

  if (!session) {
    redirect('/admin/login');
  }

  return session;
}
