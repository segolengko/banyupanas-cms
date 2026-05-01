import 'server-only';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { SignJWT, jwtVerify } from 'jose';
import { AUTH_COOKIE_NAME } from '@/lib/auth/constants';
import { isPasswordAuthConfigured } from '@/lib/auth/password';

export type SessionPayload = {
  email: string;
  role: 'admin';
};

type SessionTokenPayload = SessionPayload & {
  sessionId?: string;
};

const SESSION_DURATION_SECONDS = 60 * 60 * 12;
const ADMIN_SESSIONS_TABLE = 'admin_sessions';

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

function getSupabaseUrl() {
  return process.env.SUPABASE_URL || '';
}

function getSupabaseServiceRoleKey() {
  return process.env.SUPABASE_SERVICE_ROLE_KEY || '';
}

function canUsePersistentSessions() {
  return Boolean(getSupabaseUrl() && getSupabaseServiceRoleKey());
}

function getSessionStoreClient() {
  return createClient(getSupabaseUrl(), getSupabaseServiceRoleKey(), {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

async function createPersistentSession(payload: SessionPayload) {
  if (!canUsePersistentSessions()) {
    return null;
  }

  const supabase = getSessionStoreClient();
  const expiresAt = new Date(Date.now() + SESSION_DURATION_SECONDS * 1000).toISOString();
  const { data, error } = await supabase
    .from(ADMIN_SESSIONS_TABLE)
    .insert({
      email: payload.email,
      role: payload.role,
      expires_at: expiresAt,
    })
    .select('id')
    .single();

  if (error || !data?.id) {
    return null;
  }

  return String(data.id);
}

async function revokePersistentSession(sessionId: string) {
  if (!canUsePersistentSessions()) {
    return;
  }

  const supabase = getSessionStoreClient();
  await supabase
    .from(ADMIN_SESSIONS_TABLE)
    .update({
      revoked_at: new Date().toISOString(),
    })
    .eq('id', sessionId)
    .is('revoked_at', null);
}

async function isPersistentSessionActive(sessionId: string) {
  if (!canUsePersistentSessions()) {
    return false;
  }

  const supabase = getSessionStoreClient();
  const { data, error } = await supabase
    .from(ADMIN_SESSIONS_TABLE)
    .select('id, expires_at, revoked_at')
    .eq('id', sessionId)
    .maybeSingle();

  if (error || !data?.id) {
    return false;
  }

  if (data.revoked_at) {
    return false;
  }

  if (!data.expires_at) {
    return false;
  }

  return new Date(String(data.expires_at)).getTime() > Date.now();
}

async function readVerifiedTokenPayload() {
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

    return payload as SessionTokenPayload;
  } catch {
    return null;
  }
}

export function isAuthConfigured() {
  return isPasswordAuthConfigured() && getSessionSecret().length >= 32;
}

export async function createSession(payload: SessionPayload) {
  const sessionId = await createPersistentSession(payload);
  const token = await new SignJWT({
    ...payload,
    ...(sessionId ? { sessionId } : {}),
  })
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
    maxAge: SESSION_DURATION_SECONDS,
    priority: 'high',
  });
}

export async function destroySession() {
  const payload = await readVerifiedTokenPayload();

  if (payload?.sessionId) {
    await revokePersistentSession(payload.sessionId);
  }

  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE_NAME);
}

export async function getSession() {
  const payload = await readVerifiedTokenPayload();

  if (!payload) {
    return null;
  }

  if (payload.sessionId) {
    const isActive = await isPersistentSessionActive(payload.sessionId);

    if (!isActive) {
      return null;
    }
  }

  return {
    email: payload.email,
    role: payload.role,
  } satisfies SessionPayload;
}

export async function requireSession() {
  const session = await getSession();

  if (!session) {
    redirect('/admin/login');
  }

  return session;
}
