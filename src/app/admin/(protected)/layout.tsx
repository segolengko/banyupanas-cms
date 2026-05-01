import type { Metadata } from 'next';
import Link from 'next/link';
import { ShieldCheck, Sparkles } from 'lucide-react';
import { BrandMark } from '@/components/BrandLogo';
import { logoutAction } from '@/app/admin/actions';
import Sidebar from '@/components/Sidebar';
import { requireSession } from '@/lib/auth/session';
import { getCmsHealth, getSiteSettings } from '@/lib/cms/repository';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default async function ProtectedAdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [session, health, settings] = await Promise.all([
    requireSession(),
    getCmsHealth(),
    getSiteSettings('admin'),
  ]);
  const siteLabel = settings.siteName || 'Website Publik';

  return (
    <div className="theme-admin-shell min-h-screen text-ink-950">
      <div className="mx-auto flex min-h-screen max-w-[1560px] gap-4 px-3 py-3 sm:px-4 sm:py-4 md:px-6 lg:gap-6">
        <Sidebar siteName={settings.siteName} />

        <div className="flex min-w-0 flex-1 flex-col gap-4 sm:gap-5 lg:gap-6">
          <div className="surface-panel flex items-center justify-between gap-3 px-4 py-3 lg:hidden">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-oasis-600 text-white shadow-lg shadow-oasis-600/20">
                <BrandMark className="h-7 w-7" />
              </div>
              <div className="min-w-0">
                <p className="truncate font-display text-lg text-ink-950">{siteLabel}</p>
                <p className="text-[11px] uppercase tracking-[0.22em] text-ink-800/52">
                  Admin Surface
                </p>
              </div>
            </div>

            <Link
              href="/"
              className="shrink-0 rounded-full border border-ink-950/10 px-3 py-2 text-xs font-semibold text-ink-950 transition hover:border-oasis-500/30 hover:text-oasis-600"
            >
              Lihat site
            </Link>
          </div>

          <header className="surface-panel sticky top-3 z-30 flex flex-col gap-4 px-4 py-4 sm:top-4 sm:px-5 sm:py-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-oasis-600 text-white shadow-lg shadow-oasis-600/20 sm:h-12 sm:w-12">
                <ShieldCheck size={20} className="sm:hidden" />
                <ShieldCheck size={22} className="hidden sm:block" />
              </div>
              <div className="space-y-1.5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-oasis-600 sm:text-xs sm:tracking-[0.24em]">
                  Secure Admin Surface
                </p>
                <h1 className="font-display text-xl leading-tight text-ink-950 sm:text-2xl">
                  CMS publik yang lebih aman
                </h1>
                <p className="text-sm leading-6 text-ink-800/75 sm:leading-7">
                  Session berjalan di server, akses admin dijaga oleh proxy dan pemeriksaan cookie
                  `httpOnly`.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 lg:min-w-[360px] lg:items-end">
              <div className="flex flex-wrap gap-2 lg:justify-end">
                <span className="rounded-full bg-oasis-500/10 px-3 py-1 text-xs font-semibold text-oasis-600">
                  Auth {health.authConfigured ? 'Ready' : 'Needs Env'}
                </span>
                <span className="rounded-full bg-copper-400/16 px-3 py-1 text-xs font-semibold text-copper-500">
                  Backend {health.backendConfigured ? 'Connected' : 'Demo Read Only'}
                </span>
                <span className="rounded-full bg-ink-950/6 px-3 py-1 text-xs font-semibold text-ink-800/70">
                  Public Read {health.publicReadConfigured ? 'Ready' : 'Needs Env'}
                </span>
              </div>

              <div className="flex items-center justify-between gap-3 rounded-[24px] border border-ink-950/8 bg-white/70 px-4 py-3 sm:rounded-full sm:py-2 lg:min-w-[320px]">
                <div className="min-w-0 space-y-0.5">
                  <p className="text-sm font-semibold text-ink-950">{session.email}</p>
                  <p className="text-xs text-ink-800/65">Administrator</p>
                </div>
                <form action={logoutAction}>
                  <button
                    type="submit"
                    className="rounded-full bg-ink-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-ink-900"
                  >
                    Keluar
                  </button>
                </form>
              </div>
            </div>
          </header>

          {!health.authConfigured && (
            <div className="surface-panel flex flex-col gap-3 border border-copper-400/25 bg-copper-400/8 px-5 py-4 text-sm text-ink-900">
              <div className="flex items-center gap-2 font-semibold text-copper-500">
                <Sparkles size={16} />
                Akses admin belum lengkap
              </div>
              <p>
                Isi variabel `CMS_ADMIN_EMAIL`, `CMS_ADMIN_PASSWORD_HASH`, dan `CMS_SESSION_SECRET`
                untuk mengaktifkan login aman di semua environment.
              </p>
              <Link
                href="/"
                className="w-fit rounded-full border border-copper-400/30 px-4 py-2 font-semibold text-copper-500 transition hover:bg-copper-400/10"
              >
                Kembali ke website publik
              </Link>
            </div>
          )}

          <main className="min-h-0 flex-1">{children}</main>
        </div>
      </div>
    </div>
  );
}
