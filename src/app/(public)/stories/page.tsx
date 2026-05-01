import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
import { BrandMark } from '@/components/BrandLogo';
import { getSiteSettings, listPublishedContentItems } from '@/lib/cms/repository';
import { getButtonShapeClassName, getLightSurfaceClassName } from '@/lib/hero-design';
import { buildPublicMetadata } from '@/lib/seo';
import { cn, formatDate } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();

  return buildPublicMetadata({
    settings,
    title: 'Cerita Publik',
    path: '/stories',
    description:
      'Kumpulan artikel, halaman informasi, dan pengumuman yang sudah dipublikasikan dari CMS Banyu Panas Cirebon.',
    image: settings.heroPosterImage,
    keywords: ['cerita publik', 'artikel wisata', 'pengumuman', settings.siteName || 'Banyu Panas Cirebon'],
  });
}

export default async function StoriesPage() {
  const [settings, stories] = await Promise.all([getSiteSettings(), listPublishedContentItems(24)]);
  const siteLabel = settings.siteName || 'Website Publik';
  const visibleMetrics = settings.metrics.filter((metric) => metric.label && metric.value).slice(0, 4);
  const buttonShape = getButtonShapeClassName(settings.buttonStyle);
  const lightSurfaceClassName = getLightSurfaceClassName(settings.surfaceStyle);

  return (
    <div className="overflow-x-hidden">
      <div className="mx-auto flex max-w-[1320px] flex-col px-4 pb-20 pt-6 md:px-6 lg:px-8">
        <header className="surface-panel sticky top-4 z-40 mb-8 flex items-center justify-between gap-4 px-5 py-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-lg shadow-ink-950/10 ring-1 ring-ink-950/6">
              <BrandMark className="h-8 w-8" />
            </div>
            <div>
              <p className="font-display text-xl text-ink-950">{siteLabel}</p>
              {settings.siteTagline && (
                <p className="text-xs uppercase tracking-[0.24em] text-ink-800/55">{settings.siteTagline}</p>
              )}
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className={cn(
                'inline-flex items-center gap-2 border border-ink-950/10 bg-white/82 px-4 py-2 text-sm font-semibold text-ink-950 transition hover:border-oasis-500/30 hover:text-oasis-600',
                buttonShape,
              )}
            >
              <ArrowLeft size={16} />
              Kembali ke beranda
            </Link>
            <Link
              href="/admin/login"
              className={cn('bg-ink-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-ink-900', buttonShape)}
            >
              Admin Login
            </Link>
          </div>
        </header>

        <section className={cn('surface-panel overflow-hidden px-6 py-8 md:px-8', lightSurfaceClassName)}>
          <div className={`grid gap-8 ${visibleMetrics.length > 0 ? 'lg:grid-cols-[1.05fr_0.95fr] lg:items-center' : ''}`}>
            <div className="space-y-5">
              <p className="inline-flex items-center gap-2 rounded-full border border-copper-400/16 bg-copper-400/10 px-4 py-2 text-sm font-semibold text-copper-500">
                <Sparkles size={16} />
                Cerita publik
              </p>
              <h1 className="max-w-3xl font-display text-5xl leading-[1.05] text-ink-950 md:text-6xl">
                Semua konten yang sudah dipublikasikan.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-ink-800/74">
                Halaman ini hanya menampilkan konten nyata dari CMS admin, tanpa artikel demo bawaan.
              </p>
            </div>

            {visibleMetrics.length > 0 && (
              <div className="grid gap-4 sm:grid-cols-2">
                {visibleMetrics.map((metric) => (
                  <div key={`${metric.label}-${metric.value}`} className={cn('rounded-[28px] border p-5', lightSurfaceClassName)}>
                    <p className="font-display text-3xl text-ink-950">{metric.value}</p>
                    <p className="mt-2 text-sm leading-7 text-ink-800/68">{metric.label}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="py-16">
          {stories.length > 0 ? (
            <div className="grid gap-6 lg:grid-cols-3">
              {stories.map((story) => (
                <article key={story.id} className={cn('surface-panel overflow-hidden p-3', lightSurfaceClassName)}>
                  <div className="theme-sidebar-glow h-72 overflow-hidden rounded-[26px]">
                    {story.coverImage ? (
                      <img
                        src={story.coverImage}
                        alt={story.title}
                        className="h-full w-full object-cover transition duration-700 hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center px-6 text-center text-sm text-ink-800/56">
                        Belum ada gambar cover.
                      </div>
                    )}
                  </div>

                  <div className="space-y-4 px-2 pb-2 pt-5">
                    <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.22em] text-ink-800/45">
                      <span>{story.type}</span>
                      <span>{formatDate(story.publishedAt || story.updatedAt)}</span>
                    </div>
                    <h2 className="font-display text-2xl text-ink-950">{story.title}</h2>
                    <p className="text-sm leading-7 text-ink-800/72">{story.excerpt}</p>
                    <Link
                      href={`/stories/${story.slug}`}
                      className="inline-flex items-center gap-2 text-sm font-semibold text-oasis-600 transition hover:text-oasis-500"
                    >
                      Buka detail cerita
                      <ArrowRight size={16} />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className={cn('surface-panel px-6 py-14 text-center text-sm leading-7 text-ink-800/68', lightSurfaceClassName)}>
              Belum ada konten publik yang diterbitkan.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
