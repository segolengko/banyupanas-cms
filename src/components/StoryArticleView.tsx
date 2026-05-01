import Link from 'next/link';
import { ArrowLeft, ArrowRight, CalendarDays, ExternalLink, MapPin, Sparkles, UserRound } from 'lucide-react';
import { BrandMark } from '@/components/BrandLogo';
import {
  getButtonShapeClassName,
  getDarkSurfaceClassName,
  getLightSurfaceClassName,
} from '@/lib/hero-design';
import { getPrimaryCtaConfig, getSecondaryCtaConfig } from '@/lib/site-settings';
import { cn, formatDate } from '@/lib/utils';
import type { ContentItem, SiteSettings } from '@/types';

function renderParagraphs(content: string) {
  return content
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

export default function StoryArticleView({
  story,
  settings,
  backHref,
  backLabel,
  previewMode = false,
  editHref,
}: {
  story: ContentItem;
  settings: SiteSettings;
  backHref: string;
  backLabel: string;
  previewMode?: boolean;
  editHref?: string;
}) {
  const paragraphs = renderParagraphs(story.content);
  const siteLabel = settings.siteName || 'Website Publik';
  const primaryCta = getPrimaryCtaConfig(settings);
  const secondaryCta = getSecondaryCtaConfig(settings);
  const storyPrimaryHref = primaryCta.external
    ? primaryCta.href
    : primaryCta.href.startsWith('#')
      ? `/${primaryCta.href}`
      : primaryCta.href;
  const storySecondaryHref = secondaryCta.external
    ? secondaryCta.href
    : secondaryCta.href.startsWith('#')
      ? `/${secondaryCta.href}`
      : secondaryCta.href;
  const buttonShape = getButtonShapeClassName(settings.buttonStyle);
  const lightSurfaceClassName = getLightSurfaceClassName(settings.surfaceStyle);
  const darkSurfaceClassName = getDarkSurfaceClassName(settings.surfaceStyle);

  return (
    <div className="overflow-x-hidden">
      <div className="mx-auto flex max-w-[1100px] flex-col px-4 pb-20 pt-6 md:px-6 lg:px-8">
        <header className="surface-panel sticky top-4 z-40 mb-8 flex items-center justify-between gap-4 px-5 py-4">
          <Link href={previewMode ? '/admin/content' : '/'} className="flex items-center gap-3">
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

          <Link
            href={backHref}
            className={cn(
              'inline-flex items-center gap-2 border border-ink-950/10 bg-white/82 px-4 py-2 text-sm font-semibold text-ink-950 transition hover:border-oasis-500/30 hover:text-oasis-600',
              buttonShape,
            )}
          >
            <ArrowLeft size={16} />
            {backLabel}
          </Link>
        </header>

        {previewMode && (
          <div className="mb-6 rounded-[24px] border border-oasis-500/18 bg-oasis-500/10 px-5 py-4 text-sm leading-7 text-oasis-700">
            <div className="flex items-center gap-2 font-semibold text-oasis-700">
              <Sparkles size={16} />
              Preview admin aktif
            </div>
            <p className="mt-2">
              Ini adalah simulasi tampilan cerita untuk status <span className="font-semibold">{story.status}</span>.
              Gunakan halaman ini untuk review hasil konten sebelum dibuka ke publik.
            </p>
          </div>
        )}

        <article className={cn('surface-panel overflow-hidden p-4 md:p-5', lightSurfaceClassName)}>
          <div className="theme-sidebar-glow relative h-[340px] overflow-hidden rounded-[30px] md:h-[480px]">
            {story.coverImage && (
              <img
                src={story.coverImage}
                alt={story.title}
                className="h-full w-full object-cover"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-ink-950/78 via-ink-950/10 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
              <div className="inline-flex rounded-full border border-white/16 bg-white/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-white/82 backdrop-blur-md">
                {story.type}
              </div>
              <h1 className="mt-4 max-w-4xl font-display text-4xl leading-tight text-white md:text-6xl">
                {story.title}
              </h1>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-white/80 md:text-base md:leading-8">
                {story.excerpt}
              </p>
            </div>
          </div>

          <div className="grid gap-8 px-2 py-8 lg:grid-cols-[minmax(0,1fr)_280px]">
            <div className="space-y-5">
              {paragraphs.map((paragraph) => (
                <p key={paragraph} className="text-base leading-8 text-ink-900/80">
                  {paragraph}
                </p>
              ))}
            </div>

            <aside className="space-y-4">
              <div className={cn('rounded-[28px] border p-5', lightSurfaceClassName)}>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-oasis-600">Detail cerita</p>
                <div className="mt-5 space-y-4 text-sm leading-7 text-ink-800/72">
                  <div className="flex items-start gap-3">
                    <CalendarDays size={18} className="mt-1 shrink-0 text-copper-500" />
                    <div>
                      <p className="font-semibold text-ink-950">Tanggal publikasi</p>
                      <p>{formatDate(story.publishedAt || story.updatedAt)}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <UserRound size={18} className="mt-1 shrink-0 text-copper-500" />
                    <div>
                      <p className="font-semibold text-ink-950">Penulis</p>
                      <p>{story.author}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin size={18} className="mt-1 shrink-0 text-copper-500" />
                    <div>
                      <p className="font-semibold text-ink-950">Lokasi destinasi</p>
                      <p>{settings.location || 'Belum diisi'}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className={cn('rounded-[28px] border px-5 py-6 text-white', darkSurfaceClassName)}>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/60">
                  {previewMode ? 'Langkah berikutnya' : 'Ingin berkunjung?'}
                </p>
                <p className="mt-3 text-sm leading-7 text-white/78">
                  {previewMode
                    ? 'Review hasil preview ini, lalu lanjutkan edit atau buka versi publik jika status konten sudah published.'
                    : 'Gunakan tombol di bawah untuk melihat lokasi atau kembali ke section tiket di halaman utama.'}
                </p>
                <div className="mt-5 flex flex-col gap-3">
                  {primaryCta.external ? (
                    <a
                      href={storyPrimaryHref}
                      target="_blank"
                      rel="noreferrer"
                      className={cn(
                        'inline-flex items-center justify-center gap-2 bg-white px-4 py-3 text-center text-sm font-semibold text-ink-950 transition hover:bg-sand-50',
                        buttonShape,
                      )}
                    >
                      {settings.primaryCtaLabel}
                      <ExternalLink size={16} />
                    </a>
                  ) : (
                    <Link
                      href={storyPrimaryHref}
                      className={cn(
                        'inline-flex items-center justify-center gap-2 bg-white px-4 py-3 text-center text-sm font-semibold text-ink-950 transition hover:bg-sand-50',
                        buttonShape,
                      )}
                    >
                      {settings.primaryCtaLabel}
                      <ArrowRight size={16} />
                    </Link>
                  )}

                  {secondaryCta.external ? (
                    <a
                      href={storySecondaryHref}
                      target="_blank"
                      rel="noreferrer"
                      className={cn(
                        'inline-flex items-center justify-center gap-2 border border-white/14 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/10',
                        buttonShape,
                      )}
                    >
                      {settings.secondaryCtaLabel}
                      <ExternalLink size={16} />
                    </a>
                  ) : (
                    <Link
                      href={storySecondaryHref}
                      className={cn(
                        'inline-flex items-center justify-center gap-2 border border-white/14 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/10',
                        buttonShape,
                      )}
                    >
                      {settings.secondaryCtaLabel}
                    </Link>
                  )}

                  {previewMode ? (
                    <div className="flex flex-col gap-2">
                      {editHref && (
                        <Link
                          href={editHref}
                          className="text-center text-xs font-semibold uppercase tracking-[0.22em] text-white/56 transition hover:text-white/80"
                        >
                          Kembali ke editor
                        </Link>
                      )}
                      {story.status === 'published' && (
                        <Link
                          href={`/stories/${story.slug}`}
                          target="_blank"
                          className="text-center text-xs font-semibold uppercase tracking-[0.22em] text-white/56 transition hover:text-white/80"
                        >
                          Buka versi publik
                        </Link>
                      )}
                    </div>
                  ) : (
                    <Link
                      href="/admin/login"
                      className="text-center text-xs font-semibold uppercase tracking-[0.22em] text-white/56 transition hover:text-white/80"
                    >
                      Masuk ke admin
                    </Link>
                  )}
                </div>
              </div>
            </aside>
          </div>
        </article>
      </div>
    </div>
  );
}
