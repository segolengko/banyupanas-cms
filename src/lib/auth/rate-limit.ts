import 'server-only';

import { createHash } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';

type LoginAttemptRecord = {
  count: number;
  firstAttemptAt: number;
  lockedUntil: number | null;
};

type LoginAttemptRow = {
  client_key: string;
  failure_count: number | null;
  window_started_at: string | null;
  locked_until: string | null;
};

const attempts = new Map<string, LoginAttemptRecord>();
const WINDOW_MS = 15 * 60_000;
const LOCK_MS = 15 * 60_000;
const MAX_ATTEMPTS = 5;
const LOGIN_ATTEMPTS_TABLE = 'admin_login_attempts';

function getSupabaseUrl() {
  return process.env.SUPABASE_URL || '';
}

function getSupabaseServiceRoleKey() {
  return process.env.SUPABASE_SERVICE_ROLE_KEY || '';
}

function canUsePersistentStore() {
  return Boolean(getSupabaseUrl() && getSupabaseServiceRoleKey());
}

function getRateLimitClient() {
  return createClient(getSupabaseUrl(), getSupabaseServiceRoleKey(), {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

function getStorageKey(key: string) {
  const secret = process.env.CMS_SESSION_SECRET || 'cms-rate-limit';
  return createHash('sha256')
    .update(`${secret}:${key}`)
    .digest('hex');
}

function getCurrentLocalRecord(key: string) {
  const record = attempts.get(key);

  if (!record) {
    return null;
  }

  if (record.lockedUntil && record.lockedUntil < Date.now()) {
    attempts.delete(key);
    return null;
  }

  if (Date.now() - record.firstAttemptAt > WINDOW_MS) {
    attempts.delete(key);
    return null;
  }

  return record;
}

function getRemainingLocalLockMs(key: string) {
  const record = getCurrentLocalRecord(key);

  if (!record?.lockedUntil) {
    return 0;
  }

  return Math.max(0, record.lockedUntil - Date.now());
}

function recordLocalLoginFailure(key: string) {
  const record = getCurrentLocalRecord(key);

  if (!record) {
    attempts.set(key, {
      count: 1,
      firstAttemptAt: Date.now(),
      lockedUntil: null,
    });
    return;
  }

  record.count += 1;

  if (record.count >= MAX_ATTEMPTS) {
    record.lockedUntil = Date.now() + LOCK_MS;
  }

  attempts.set(key, record);
}

function clearLocalLoginFailures(key: string) {
  attempts.delete(key);
}

async function getPersistentRecord(storageKey: string) {
  const supabase = getRateLimitClient();
  const { data, error } = await supabase
    .from(LOGIN_ATTEMPTS_TABLE)
    .select('client_key, failure_count, window_started_at, locked_until')
    .eq('client_key', storageKey)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return (data as LoginAttemptRow | null) || null;
}

async function deletePersistentRecord(storageKey: string) {
  const supabase = getRateLimitClient();
  await supabase.from(LOGIN_ATTEMPTS_TABLE).delete().eq('client_key', storageKey);
}

async function getCurrentPersistentRecord(key: string) {
  const storageKey = getStorageKey(key);
  const record = await getPersistentRecord(storageKey);

  if (!record) {
    return null;
  }

  const lockedUntil = record.locked_until ? new Date(record.locked_until).getTime() : null;
  const windowStartedAt = record.window_started_at ? new Date(record.window_started_at).getTime() : 0;

  if (lockedUntil && lockedUntil < Date.now()) {
    await deletePersistentRecord(storageKey);
    return null;
  }

  if (Date.now() - windowStartedAt > WINDOW_MS) {
    await deletePersistentRecord(storageKey);
    return null;
  }

  return {
    storageKey,
    count: Number(record.failure_count || 0),
    firstAttemptAt: windowStartedAt,
    lockedUntil,
  };
}

async function getRemainingPersistentLockMs(key: string) {
  const record = await getCurrentPersistentRecord(key);

  if (!record?.lockedUntil) {
    return 0;
  }

  return Math.max(0, record.lockedUntil - Date.now());
}

async function recordPersistentLoginFailure(key: string) {
  const current = await getCurrentPersistentRecord(key);
  const nowIso = new Date().toISOString();
  const supabase = getRateLimitClient();

  if (!current) {
    await supabase.from(LOGIN_ATTEMPTS_TABLE).upsert({
      client_key: getStorageKey(key),
      failure_count: 1,
      window_started_at: nowIso,
      locked_until: null,
    });
    return;
  }

  const nextCount = current.count + 1;
  const lockedUntil = nextCount >= MAX_ATTEMPTS ? new Date(Date.now() + LOCK_MS).toISOString() : null;

  await supabase
    .from(LOGIN_ATTEMPTS_TABLE)
    .update({
      failure_count: nextCount,
      locked_until: lockedUntil,
      window_started_at: new Date(current.firstAttemptAt).toISOString(),
    })
    .eq('client_key', current.storageKey);
}

async function clearPersistentLoginFailures(key: string) {
  await deletePersistentRecord(getStorageKey(key));
}

export async function getRemainingLockMs(key: string) {
  if (!canUsePersistentStore()) {
    return getRemainingLocalLockMs(key);
  }

  try {
    return await getRemainingPersistentLockMs(key);
  } catch {
    return getRemainingLocalLockMs(key);
  }
}

export async function recordLoginFailure(key: string) {
  if (!canUsePersistentStore()) {
    recordLocalLoginFailure(key);
    return;
  }

  try {
    await recordPersistentLoginFailure(key);
  } catch {
    recordLocalLoginFailure(key);
  }
}

export async function clearLoginFailures(key: string) {
  if (!canUsePersistentStore()) {
    clearLocalLoginFailures(key);
    return;
  }

  try {
    await clearPersistentLoginFailures(key);
  } catch {
    clearLocalLoginFailures(key);
  }
}
