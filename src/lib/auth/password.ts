import { scryptSync, timingSafeEqual } from 'node:crypto';

function splitHash(hash: string) {
  const [algorithm, saltHex, derivedHex] = hash.split(':');

  if (algorithm !== 'scrypt' || !saltHex || !derivedHex) {
    return null;
  }

  return {
    salt: Buffer.from(saltHex, 'hex'),
    derivedKey: Buffer.from(derivedHex, 'hex'),
  };
}

export function isPasswordAuthConfigured() {
  return Boolean(process.env.CMS_ADMIN_EMAIL && process.env.CMS_ADMIN_PASSWORD_HASH);
}

export async function verifyAdminPassword(email: string, password: string) {
  const configuredEmail = process.env.CMS_ADMIN_EMAIL?.trim().toLowerCase();
  const configuredHash = process.env.CMS_ADMIN_PASSWORD_HASH?.trim();

  if (!configuredEmail || !configuredHash) {
    return false;
  }

  if (email !== configuredEmail) {
    return false;
  }

  const parsed = splitHash(configuredHash);

  if (!parsed) {
    return false;
  }

  const candidate = scryptSync(password, parsed.salt, parsed.derivedKey.length);

  return timingSafeEqual(candidate, parsed.derivedKey);
}
