'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { ArrowRight, LockKeyhole } from 'lucide-react';
import { BrandLockup } from '@/components/BrandLogo';

type AuthActionState = {
  error?: string;
};

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending || disabled}
      className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-ink-950 px-5 py-3.5 text-base font-semibold text-white transition hover:bg-ink-900 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? 'Memverifikasi akses...' : 'Masuk ke dashboard'}
      <ArrowRight size={18} />
    </button>
  );
}

export default function LoginPage({
  action,
  authConfigured,
}: {
  action: (state: AuthActionState, payload: FormData) => Promise<AuthActionState>;
  authConfigured: boolean;
}) {
  const [state, formAction] = useActionState(action, {});

  return (
    <div className="theme-admin-shell min-h-screen px-4 py-8 md:px-6">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-[560px] items-center">
        <div className="surface-panel w-full px-5 py-6 md:px-7 md:py-8">
          <div className="w-full">
            <div className="mb-8 space-y-5">
              <BrandLockup className="h-[84px] w-[210px] md:h-[96px] md:w-[240px]" priority />
              <div>
                <h1 className="font-display text-4xl text-ink-950 md:text-[2.8rem]">Masuk ke dashboard</h1>
                <p className="mt-3 text-sm leading-7 text-ink-800/72">
                  Gunakan kredensial admin yang disimpan di environment server.
                </p>
              </div>
            </div>

            <form action={formAction} className="space-y-4">
              <label className="block space-y-2">
                <span className="text-sm font-semibold text-ink-900">Email admin</span>
                <input
                  type="email"
                  name="email"
                  placeholder="admin@banyupanascirebon.id"
                  autoComplete="username"
                  className="w-full rounded-[24px] border border-ink-950/10 bg-white px-4 py-3.5 text-sm text-ink-950 outline-none transition placeholder:text-ink-800/35 focus:border-oasis-500/40 focus:ring-4 focus:ring-oasis-500/10"
                />
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-semibold text-ink-900">Kata sandi</span>
                <div className="relative">
                  <LockKeyhole
                    size={18}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-800/40"
                  />
                  <input
                    type="password"
                    name="password"
                    autoComplete="current-password"
                    placeholder="Masukkan kata sandi admin"
                    className="w-full rounded-[24px] border border-ink-950/10 bg-white py-3.5 pl-11 pr-4 text-sm text-ink-950 outline-none transition placeholder:text-ink-800/35 focus:border-oasis-500/40 focus:ring-4 focus:ring-oasis-500/10"
                  />
                </div>
              </label>

              {state.error && (
                <div className="rounded-[24px] border border-copper-400/18 bg-copper-400/10 px-4 py-3 text-sm text-copper-500">
                  {state.error}
                </div>
              )}

              {!authConfigured && (
                <div className="rounded-[24px] border border-ink-950/10 bg-ink-950/4 px-4 py-3 text-sm leading-7 text-ink-800/72">
                  Variabel auth belum lengkap. Isi `CMS_ADMIN_EMAIL`, `CMS_ADMIN_PASSWORD_HASH`, dan
                  `CMS_SESSION_SECRET` agar login aktif di semua environment.
                </div>
              )}

              <SubmitButton disabled={!authConfigured} />
            </form>

            <div className="mt-6 flex flex-col gap-3 text-sm text-ink-800/66">
              <Link href="/" className="font-semibold text-oasis-600 transition hover:text-oasis-500">
                Kembali ke website publik
              </Link>
              <p>
                Tip setup hash: gunakan hash `scrypt` di environment agar password tidak pernah disimpan
                dalam bentuk plain text.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
