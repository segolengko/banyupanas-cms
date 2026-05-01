'use server';

import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { assertTrustedRequestOrigin, isInvalidRequestOriginError } from '@/lib/auth/request-guard';
import { clearLoginFailures, getRemainingLockMs, recordLoginFailure } from '@/lib/auth/rate-limit';
import { createSession, destroySession, getSession, isAuthConfigured } from '@/lib/auth/session';
import { recordAuditEvent } from '@/lib/cms/repository';
import { verifyAdminPassword } from '@/lib/auth/password';

export type AuthActionState = {
  error?: string;
};

function getClientKey(forwardedFor: string | null, realIp: string | null) {
  return forwardedFor?.split(',')[0]?.trim() || realIp || 'unknown';
}

export async function loginAction(_: AuthActionState, formData: FormData): Promise<AuthActionState> {
  try {
    await assertTrustedRequestOrigin();
  } catch (error) {
    if (isInvalidRequestOriginError(error)) {
      return {
        error: 'Origin request tidak valid.',
      };
    }

    throw error;
  }

  if (!isAuthConfigured()) {
    return {
      error:
        'Autentikasi admin belum dikonfigurasi. Isi CMS_ADMIN_EMAIL, CMS_ADMIN_PASSWORD_HASH, dan CMS_SESSION_SECRET di environment.',
    };
  }

  const email = String(formData.get('email') || '').trim().toLowerCase();
  const password = String(formData.get('password') || '');

  if (!email || !password) {
    return {
      error: 'Email dan kata sandi wajib diisi.',
    };
  }

  const requestHeaders = await headers();
  const clientKey = getClientKey(
    requestHeaders.get('x-forwarded-for'),
    requestHeaders.get('x-real-ip'),
  );
  const remainingLockMs = await getRemainingLockMs(clientKey);

  if (remainingLockMs > 0) {
    const retryInMinutes = Math.max(1, Math.ceil(remainingLockMs / 60_000));

    return {
      error: `Terlalu banyak percobaan login. Coba lagi dalam ${retryInMinutes} menit.`,
    };
  }

  const isValid = await verifyAdminPassword(email, password);

  if (!isValid) {
    await recordLoginFailure(clientKey);

    return {
      error: 'Kredensial tidak valid.',
    };
  }

  await clearLoginFailures(clientKey);
  await createSession({
    email,
    role: 'admin',
  });
  await recordAuditEvent({
    eventType: 'auth.login',
    actorEmail: email,
    resourceType: 'session',
    resourceId: email,
    detail: `Admin ${email} berhasil login ke dashboard.`,
    metadata: {
      clientKey,
    },
  });
  revalidatePath('/admin');
  redirect('/admin');
}

export async function logoutAction() {
  try {
    await assertTrustedRequestOrigin();
  } catch (error) {
    if (isInvalidRequestOriginError(error)) {
      redirect('/admin');
    }

    throw error;
  }

  const session = await getSession();

  if (session) {
    await recordAuditEvent({
      eventType: 'auth.logout',
      actorEmail: session.email,
      resourceType: 'session',
      resourceId: session.email,
      detail: `Admin ${session.email} keluar dari dashboard.`,
    });
  }

  await destroySession();
  revalidatePath('/admin');
  redirect('/admin/login');
}
