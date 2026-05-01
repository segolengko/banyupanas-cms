'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { ArrowRight, LockKeyhole, ShieldCheck, Sparkles } from 'lucide-react';
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
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-[1240px] gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-stretch">
        <div className="surface-panel fine-grid flex flex-col justify-between overflow-hidden px-6 py-7 md:px-8 lg:px-10">
          <div className="space-y-8">
            <div className="space-y-4">
              <BrandLockup className="h-[88px] w-[220px] md:h-[104px] md:w-[260px]" priority />
              <p className="text-xs uppercase tracking-[0.24em] text-ink-800/56">Public CMS Control Room</p>
            </div>
            <div className="space-y-5">
              <p className="inline-flex items-center gap-2 rounded-full border border-oasis-500/15 bg-oasis-500/8 px-4 py-2 text-sm font-semibold text-oasis-600">
                <ShieldCheck size={16} />
                Public-facing CMS with safer boundaries
              </p>
              <h1 className="max-w-2xl font-display text-5xl leading-[1.04] text-ink-950 md:text-6xl">
                Area admin baru yang lebih layak untuk website publik.
              </h1>
              <p className="max-w-xl text-base leading-8 text-ink-800/76">
                Login sekarang dijaga dari sisi server dengan cookie `httpOnly`, proteksi route, dan
                kredensial yang tidak lagi ditanam di browser pengguna.
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {[
              'Session admin dipisah dari browser storage.',
              'Route admin difilter sejak request pertama.',
              'Arsitektur siap untuk operasi tulis yang aman di server.',
            ].map((item) => (
              <div key={item} className="rounded-[24px] border border-ink-950/8 bg-white/76 p-4 text-sm leading-7 text-ink-800/76">
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="surface-panel flex items-center justify-center px-5 py-6 md:px-7">
          <div className="w-full max-w-md">
            <div className="mb-8 space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-copper-400/16 bg-copper-400/10 px-4 py-2 text-sm font-semibold text-copper-500">
                <Sparkles size={16} />
                Secure admin sign-in
              </div>
              <div>
                <h2 className="font-display text-4xl text-ink-950">Masuk ke dashboard</h2>
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
