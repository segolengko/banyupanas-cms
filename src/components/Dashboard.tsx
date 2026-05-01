import Link from 'next/link';
import { Activity, ArrowUpRight, LockKeyhole, ShieldCheck, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CmsHealth, DashboardData, SiteSettings } from '@/types';

export default function Dashboard({
  data,
  health,
  settings,
}: {
  data: DashboardData;
  health: CmsHealth;
  settings: SiteSettings;
}) {
  const siteLabel = settings.siteName || 'Website publik';

  return (
    <div className="space-y-5 pb-28 md:space-y-6 lg:pb-8">
      <section className="surface-panel overflow-hidden px-5 py-6 md:px-8 md:py-7">
        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-oasis-600">
              Admin Overview
            </p>
            <h2 className="font-display text-3xl leading-tight text-ink-950 md:text-5xl">
              {siteLabel} siap untuk trial CMS tanpa konten demo bawaan.
            </h2>
            <p className="max-w-3xl text-sm leading-7 text-ink-800/76 md:text-base md:leading-8">
              Dashboard ini menampilkan status koneksi, data nyata, dan area kerja inti tanpa metrik atau
              narasi palsu.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {[
              {
                icon: ShieldCheck,
                label: 'Auth Layer',
                value: health.authConfigured ? 'Ready' : 'Needs Env',
              },
              {
                icon: LockKeyhole,
                label: 'Write Backend',
                value: health.backendConfigured ? 'Connected' : 'Not Connected',
              },
              {
                icon: Sparkles,
                label: 'Public Read',
                value: health.publicReadConfigured ? 'Ready' : 'Needs Env',
              },
              {
                icon: Activity,
                label: 'Media Surface',
                value: health.mediaConfigured ? 'Active' : 'Inactive',
              },
            ].map((item) => (
              <div key={item.label} className="rounded-[24px] border border-ink-950/8 bg-white/76 p-4">
                <item.icon size={18} className="mb-3 text-oasis-600" />
                <p className="text-sm font-semibold text-ink-950">{item.value}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.22em] text-ink-800/48">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {data.metrics.map((metric) => (
          <article key={metric.label} className="surface-panel px-5 py-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm text-ink-800/58">{metric.label}</p>
                <p className="mt-3 font-display text-4xl text-ink-950">{metric.value}</p>
              </div>
              <span
                className={cn(
                  'inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold',
                  metric.positive
                    ? 'bg-oasis-500/10 text-oasis-600'
                    : 'bg-copper-400/12 text-copper-500',
                )}
              >
                {metric.change}
                <ArrowUpRight size={14} />
              </span>
            </div>
            <p className="mt-4 text-sm leading-7 text-ink-800/68">{metric.helper}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <article className="surface-panel px-6 py-6">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-oasis-600">
            Prioritas operasional
          </p>
          {data.pipeline.length > 0 ? (
            <div className="mt-6 space-y-5">
              {data.pipeline.map((item) => (
                <div key={item.label} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-ink-950">{item.label}</span>
                    <span className="text-ink-800/58">{item.value}%</span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-ink-950/8">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all',
                        item.tone === 'emerald' && 'bg-oasis-600',
                        item.tone === 'amber' && 'bg-copper-500',
                        item.tone === 'sky' && 'bg-ink-900',
                      )}
                      style={{ width: `${item.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-6 rounded-[28px] border border-dashed border-ink-950/12 bg-white/60 px-5 py-8 text-sm leading-7 text-ink-800/68">
              Belum ada prioritas operasional yang ditambahkan. Kamu bisa mulai isi konten, media, atau
              pengaturan publik sesuai kebutuhan trial.
            </div>
          )}
        </article>

        <article className="surface-panel px-6 py-6">
          <div className="mb-6 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-copper-500">
                Recent Activity
              </p>
              <h3 className="mt-2 font-display text-2xl text-ink-950 md:text-3xl">
                Perubahan yang paling terasa
              </h3>
            </div>
            <Link
              href="/admin/audit"
              className="inline-flex items-center gap-2 rounded-full bg-copper-400/10 px-3 py-2 text-xs font-semibold text-copper-500 transition hover:bg-copper-400/14"
            >
              <Sparkles size={14} />
              Lihat semua audit
            </Link>
          </div>

          {data.activities.length > 0 ? (
            <div className="space-y-4">
              {data.activities.map((activity) => (
                <div key={activity.id} className="rounded-[24px] border border-ink-950/8 bg-white/76 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h4 className="text-base font-semibold text-ink-950">{activity.title}</h4>
                    <span className="text-xs font-semibold uppercase tracking-[0.22em] text-ink-800/48">
                      {activity.time}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-ink-800/72">{activity.detail}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-[24px] border border-dashed border-ink-950/12 bg-white/70 px-5 py-8 text-sm leading-7 text-ink-800/68">
              Belum ada aktivitas admin yang tercatat.
            </div>
          )}
        </article>
      </section>
    </div>
  );
}
