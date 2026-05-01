import type { ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  ExternalLink,
  Instagram,
  MapPin,
  Music2,
  Phone,
  Sparkles,
  Youtube,
} from 'lucide-react';
import { BrandMark } from '@/components/BrandLogo';
import HeroBackgroundVideo from '@/components/HeroBackgroundVideo';
import {
  getButtonShapeClassName,
  getDarkSurfaceClassName,
  getHeroLayoutClasses,
  getHeroMoodOverlayClassName,
  getLightSurfaceClassName,
  getTrustChipClassName,
} from '@/lib/hero-design';
import { getPrimaryCtaConfig, getSecondaryCtaConfig, ticketSectionId } from '@/lib/site-settings';
import { cn, formatDate } from '@/lib/utils';
import type { ContentItem, SiteSettings } from '@/types';

const fallbackHeroPoster =
  'https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=1800&q=80';

function ActionLink({
  href,
  external,
  className,
  children,
}: {
  href: string;
  external: boolean;
  className: string;
  children: ReactNode;
}) {
  if (external) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={className}>
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}

export default function LandingPage({
  settings,
  stories,
}: {
  settings: SiteSettings;
  stories: ContentItem[];
}) {
  const primaryCta = getPrimaryCtaConfig(settings);
  const secondaryCta = getSecondaryCtaConfig(settings);
  const heroVideoEnabled = Boolean(settings.heroVideoUrl);
  const siteLabel = settings.siteName || 'Website Publik';
  const heroTitle = settings.heroTitle || 'Konten landing page belum diisi.';
  const heroDescription =
    settings.heroDescription ||
    'Lengkapi informasi kunjungan, harga tiket, cerita, dan kontak agar halaman publik tampil lebih utuh.';
  const heroPosterImage = settings.heroPosterImage || stories[0]?.coverImage || fallbackHeroPoster;
  const visibleTrustChips = settings.trustChips.filter(Boolean);
  const visibleMetrics = settings.metrics.filter((metric) => metric.label && metric.value);
  const visibleTicketOptions = settings.ticketOptions.filter(
    (option) => option.name && option.price && option.description,
  );
  const heroLayout = getHeroLayoutClasses(
    settings.heroLayoutStyle === 'split' && visibleMetrics.length === 0 ? 'immersive' : settings.heroLayoutStyle,
  );
  const buttonShape = getButtonShapeClassName(settings.buttonStyle);
  const lightSurfaceClassName = getLightSurfaceClassName(settings.surfaceStyle);
  const darkSurfaceClassName = getDarkSurfaceClassName(settings.surfaceStyle);
  const socialLinks = [
    {
      label: 'Instagram',
      href: settings.instagramUrl,
      icon: Instagram,
    },
    {
      label: 'TikTok',
      href: settings.tiktokUrl,
      icon: Music2,
    },
    {
      label: 'YouTube',
      href: settings.youtubeUrl,
      icon: Youtube,
    },
  ].filter((item) => item.href);
  const hasContactInfo = Boolean(
    settings.contactPhone ||
      settings.contactEmail ||
      settings.location ||
      settings.googleMapsEmbedUrl ||
      settings.googleMapsPlaceUrl ||
      socialLinks.length,
  );

  return (
    <div className="overflow-x-hidden">
      <section
        id="pengalaman"
        className="theme-hero-shell relative isolate min-h-[92svh] overflow-hidden text-white md:min-h-[100svh]"
      >
        <div className="absolute inset-0">
          <Image
            src={heroPosterImage}
            alt={siteLabel}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          {heroVideoEnabled && (
            <HeroBackgroundVideo
              src={settings.heroVideoUrl}
              poster={heroPosterImage}
            />
          )}
          <div className="theme-hero-overlay absolute inset-0" />
          <div className={cn('absolute inset-0', getHeroMoodOverlayClassName(settings.heroMood))} />
          <div className="theme-hero-orb-a absolute -top-16 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full blur-3xl" />
          <div className="theme-hero-orb-b absolute bottom-[-10rem] right-[-4rem] h-72 w-72 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 mx-auto flex min-h-[92svh] max-w-[1460px] flex-col px-4 pb-6 pt-4 md:min-h-[100svh] md:px-6 md:pb-8 md:pt-6 lg:px-8">
          <header className="flex flex-col gap-3 rounded-[24px] border border-white/12 bg-white/10 px-4 py-3 shadow-[0_24px_80px_rgba(0,0,0,0.18)] backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-5 sm:py-4 sm:rounded-[28px]">
            <div className="flex items-center justify-between gap-3 sm:justify-start">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white shadow-[0_14px_32px_rgba(15,23,42,0.18)] ring-1 ring-black/6 sm:h-11 sm:w-11">
                <BrandMark className="h-7 w-7 sm:h-8 sm:w-8" priority />
              </div>
              <div className="min-w-0 flex-1 sm:flex-none">
                <p className="truncate font-display text-lg text-white sm:text-xl">{siteLabel}</p>
                {settings.siteTagline && (
                  <p className="truncate text-[10px] uppercase tracking-[0.22em] text-white/58 sm:text-xs sm:tracking-[0.24em]">
                    {settings.siteTagline}
                  </p>
                )}
              </div>
            </div>

            <nav className="hidden items-center gap-8 text-sm font-semibold text-white/78 md:flex">
              <a href="#pengalaman" className="transition hover:text-white">
                Pengalaman
              </a>
              <a href={`#${ticketSectionId}`} className="transition hover:text-white">
                Harga tiket
              </a>
              <a href="#cerita" className="transition hover:text-white">
                Cerita
              </a>
              <a href="#kontak" className="transition hover:text-white">
                Kontak
              </a>
            </nav>
          </header>

          <div className="custom-scrollbar mt-3 flex gap-2 overflow-x-auto pb-1 md:hidden">
            <a
              href="#pengalaman"
              className="shrink-0 rounded-full border border-white/14 bg-white/10 px-4 py-2 text-xs font-semibold text-white/82 backdrop-blur-md"
            >
              Pengalaman
            </a>
            <a
              href={`#${ticketSectionId}`}
              className="shrink-0 rounded-full border border-white/14 bg-white/10 px-4 py-2 text-xs font-semibold text-white/82 backdrop-blur-md"
            >
              Harga tiket
            </a>
            <a
              href="#cerita"
              className="shrink-0 rounded-full border border-white/14 bg-white/10 px-4 py-2 text-xs font-semibold text-white/82 backdrop-blur-md"
            >
              Cerita
            </a>
            <a
              href="#kontak"
              className="shrink-0 rounded-full border border-white/14 bg-white/10 px-4 py-2 text-xs font-semibold text-white/82 backdrop-blur-md"
            >
              Kontak
            </a>
          </div>

          <div className="flex flex-1 flex-col justify-end pb-8 pt-8 sm:pb-10 sm:pt-10 lg:pb-16 lg:pt-20">
            <div className={heroLayout.shell}>
              <div className={heroLayout.content}>
                {settings.heroEyebrow && (
                  <div
                    className={cn(
                      'inline-flex items-center gap-2 rounded-full border border-white/16 bg-white/10 px-3.5 py-2 text-[11px] font-semibold text-white/84 shadow-sm backdrop-blur-md sm:px-4 sm:text-sm',
                      settings.heroLayoutStyle === 'editorial' && 'mx-auto',
                    )}
                  >
                    <Sparkles size={16} />
                    {settings.heroEyebrow}
                  </div>
                )}

                <div className="space-y-6">
                  <h1
                    className={cn(
                      'font-display leading-[1.04] text-white',
                      heroLayout.heading,
                    )}
                  >
                    {heroTitle}
                  </h1>
                  <p className={cn('text-[15px] leading-7 text-white/80 sm:text-base sm:leading-8 md:text-lg', heroLayout.description)}>
                    {heroDescription}
                  </p>
                </div>

                <div className={cn('flex flex-col gap-4', heroLayout.actions)}>
                  <ActionLink
                    href={primaryCta.href}
                    external={primaryCta.external}
                    className={cn(
                      'inline-flex min-h-[3.25rem] w-full items-center justify-center gap-2 bg-white px-5 py-3.5 text-base font-semibold text-ink-950 shadow-[0_24px_60px_rgba(255,255,255,0.18)] transition hover:bg-sand-50 sm:min-h-0 sm:w-auto sm:px-6',
                      buttonShape,
                    )}
                  >
                    {settings.primaryCtaLabel}
                    {primaryCta.external ? <ExternalLink size={18} /> : <ArrowRight size={18} />}
                  </ActionLink>
                  <ActionLink
                    href={secondaryCta.href}
                    external={secondaryCta.external}
                    className={cn(
                      'inline-flex min-h-[3.25rem] w-full items-center justify-center gap-2 border border-white/18 bg-white/8 px-5 py-3.5 text-base font-semibold text-white transition hover:bg-white/14 sm:min-h-0 sm:w-auto sm:px-6',
                      buttonShape,
                    )}
                  >
                    {settings.secondaryCtaLabel}
                  </ActionLink>
                </div>

                {visibleTrustChips.length > 0 && (
                  <div className={cn('flex flex-wrap gap-3', heroLayout.chips)}>
                    {visibleTrustChips.map((signal) => (
                      <span
                        key={signal}
                        className={cn(
                          'rounded-full border px-3.5 py-2 text-[13px] font-medium sm:px-4 sm:text-sm',
                          getTrustChipClassName(settings.trustChipStyle),
                        )}
                      >
                        {signal}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {visibleMetrics.length > 0 && (
                <div className={cn('grid gap-4 pt-2', heroLayout.metrics)}>
                  {visibleMetrics.map((metric) => (
                    <div
                      key={`${metric.label}-${metric.value}`}
                      className={cn('rounded-[24px] border px-4 py-4 sm:rounded-[28px] sm:px-5 sm:py-5', darkSurfaceClassName)}
                    >
                      <p className="font-display text-[1.85rem] text-white sm:text-4xl">{metric.value}</p>
                      <p className="mt-2 text-[13px] leading-6 text-white/72 sm:text-sm sm:leading-7">{metric.label}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto flex max-w-[1320px] flex-col px-4 pb-16 pt-10 md:px-6 md:pb-20 md:pt-14 lg:px-8">
        <section id={ticketSectionId} className="py-10 md:py-14">
          <div className="mb-8 flex flex-col gap-5 md:mb-10 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl space-y-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-copper-500 sm:text-sm sm:tracking-[0.24em]">
                Harga tiket
              </p>
              <h2 className="font-display text-[2rem] leading-tight text-ink-950 sm:text-[2.35rem] md:text-5xl">
                Jenis dan harga tiket
              </h2>
            </div>
            <p className="max-w-xl text-[15px] leading-7 text-ink-800/75 sm:text-base sm:leading-8">
              Pilihan tiket yang tampil di sini membantu pengunjung memahami opsi kunjungan sebelum datang.
            </p>
          </div>

          {visibleTicketOptions.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-4">
              {visibleTicketOptions.map((ticket) => (
                <article
                  key={`${ticket.name}-${ticket.price}`}
                  className={cn('surface-panel flex h-full flex-col px-4 py-5 sm:px-5 sm:py-6', lightSurfaceClassName)}
                >
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-oasis-600 sm:text-xs sm:tracking-[0.24em]">
                    Jenis tiket
                  </p>
                  <h3 className="mt-3 font-display text-[1.55rem] leading-tight text-ink-950 sm:text-2xl">
                    {ticket.name}
                  </h3>
                  <p className="mt-3 font-display text-[2rem] leading-none text-copper-500 sm:mt-4 sm:text-4xl">
                    {ticket.price}
                  </p>
                  <p className="mt-3 flex-1 text-[15px] leading-7 text-ink-800/72 sm:mt-4 sm:text-sm">
                    {ticket.description}
                  </p>
                </article>
              ))}
            </div>
          ) : (
            <div
              className={cn(
                'surface-panel rounded-[32px] border border-dashed border-ink-950/12 px-6 py-10 text-center text-sm leading-7 text-ink-800/68',
                lightSurfaceClassName,
              )}
            >
              Belum ada jenis tiket yang ditampilkan.
            </div>
          )}
        </section>

        <section id="cerita" className="py-10 md:py-14">
          <div className="mb-8 flex flex-col gap-5 md:mb-10 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl space-y-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-copper-500 sm:text-sm sm:tracking-[0.24em]">
                Cerita publik
              </p>
              <h2 className="font-display text-[2rem] leading-tight text-ink-950 sm:text-[2.35rem] md:text-5xl">
                Konten dari CMS
              </h2>
            </div>
            <p className="max-w-xl text-[15px] leading-7 text-ink-800/75 sm:text-base sm:leading-8">
              Cerita terbaru, panduan kunjungan, dan informasi penting akan tampil di sini saat sudah diterbitkan.
            </p>
          </div>

          {stories.length > 0 ? (
            <>
              <div className="grid gap-4 md:gap-6 lg:grid-cols-3">
                {stories.map((story) => (
                  <article
                    key={story.id}
                    className={cn('surface-panel overflow-hidden p-2.5 sm:p-3', lightSurfaceClassName)}
                  >
                    <div className="theme-sidebar-glow h-52 overflow-hidden rounded-[22px] sm:h-64 sm:rounded-[26px]">
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
                    <div className="space-y-3 px-2 pb-2 pt-4 sm:space-y-4 sm:pt-5">
                      <div className="flex flex-wrap items-center gap-2.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-800/45 sm:gap-3 sm:text-xs sm:tracking-[0.22em]">
                        <span>{story.type}</span>
                        <span>{formatDate(story.publishedAt || story.updatedAt)}</span>
                      </div>
                      <h3 className="font-display text-[1.45rem] leading-tight text-ink-950 sm:text-2xl">
                        {story.title}
                      </h3>
                      <p className="text-[15px] leading-7 text-ink-800/72 sm:text-sm">{story.excerpt}</p>
                      <Link
                        href={`/stories/${story.slug}`}
                        className="inline-flex items-center gap-2 text-sm font-semibold text-oasis-600 transition hover:text-oasis-500"
                      >
                        Baca cerita
                        <ArrowRight size={16} />
                      </Link>
                    </div>
                  </article>
                ))}
              </div>

              <div className="mt-8 flex justify-center">
                <Link
                  href="/stories"
                  className={cn(
                    'inline-flex min-h-[3.15rem] w-full items-center justify-center gap-2 border border-ink-950/10 bg-white/84 px-6 py-3.5 text-base font-semibold text-ink-950 transition hover:border-oasis-500/30 hover:text-oasis-600 sm:min-h-0 sm:w-auto',
                    buttonShape,
                  )}
                >
                  Lihat semua cerita
                  <ArrowRight size={18} />
                </Link>
              </div>
            </>
          ) : (
            <div
              className={cn(
                'surface-panel rounded-[32px] border border-dashed border-ink-950/12 px-6 py-10 text-center text-sm leading-7 text-ink-800/68',
                lightSurfaceClassName,
              )}
            >
              Belum ada cerita publik yang diterbitkan.
            </div>
          )}
        </section>

        <section
          id="kontak"
          className="theme-preview-shell mb-12 rounded-[30px] px-5 py-8 text-white shadow-[0_35px_80px_rgba(16,33,38,0.18)] sm:px-6 sm:py-10 md:mb-16 md:rounded-[36px] md:px-10"
        >
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-start">
            <div className="space-y-5">
              <p className="inline-flex items-center gap-2 rounded-full border border-white/16 bg-white/10 px-4 py-2 text-[11px] font-semibold text-white/82 sm:text-sm">
                <Sparkles size={16} />
                Kontak & lokasi
              </p>
              <h2 className="max-w-3xl font-display text-[2rem] leading-tight sm:text-[2.35rem] md:text-5xl">
                Informasi publik
              </h2>
              <p className="max-w-2xl text-[15px] leading-7 text-white/78 sm:text-base sm:leading-8">
                {settings.siteDescription || 'Lengkapi informasi kontak, lokasi, dan media sosial resmi untuk memudahkan pengunjung.'}
              </p>

              {hasContactInfo ? (
                <>
                  <div className="flex flex-wrap gap-4 text-sm font-medium text-white/84">
                    {settings.contactPhone && (
                      <span className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2">
                        <Phone size={16} />
                        {settings.contactPhone}
                      </span>
                    )}
                    {settings.location && (
                      <span className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2">
                        <MapPin size={16} />
                        {settings.location}
                      </span>
                    )}
                    {settings.contactEmail && (
                      <span className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2">
                        {settings.contactEmail}
                      </span>
                    )}
                  </div>

                  {socialLinks.length > 0 && (
                    <div className="space-y-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/56">
                        Media sosial resmi
                      </p>
                      <div className="flex flex-wrap gap-3">
                        {socialLinks.map((link) => (
                          <a
                            key={link.label}
                            href={link.href}
                            target="_blank"
                            rel="noreferrer"
                            className={cn(
                              'inline-flex items-center gap-2 border border-white/15 bg-white/8 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/14',
                              buttonShape,
                            )}
                          >
                            <link.icon size={16} />
                            {link.label}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className={cn('rounded-[28px] border border-dashed px-5 py-6 text-sm leading-7 text-white/72', darkSurfaceClassName)}>
                  Informasi kontak belum diisi.
                </div>
              )}
            </div>

              <div className="space-y-4">
              {settings.googleMapsEmbedUrl ? (
                <div className={cn('overflow-hidden rounded-[30px] border', darkSurfaceClassName)}>
                  <div className="border-b border-white/10 px-5 py-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/56">Google Maps</p>
                    <h3 className="mt-2 font-display text-2xl text-white">Lokasi</h3>
                  </div>
                  <div className="aspect-[4/3]">
                    <iframe
                      src={settings.googleMapsEmbedUrl}
                      title={`Peta ${siteLabel}`}
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      allowFullScreen
                      className="h-full w-full border-0"
                    />
                  </div>
                </div>
              ) : (
                <div className={cn('rounded-[30px] border border-dashed px-5 py-6', darkSurfaceClassName)}>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/56">Google Maps</p>
                  <p className="mt-3 text-sm leading-7 text-white/72">Embed map belum diisi.</p>
                </div>
              )}

              <div className="flex flex-col gap-3">
                <ActionLink
                  href={primaryCta.href}
                  external={primaryCta.external}
                  className={cn(
                    'inline-flex min-h-[3.25rem] items-center justify-center gap-2 bg-white px-6 py-3.5 text-center text-base font-semibold text-ink-950 transition hover:bg-sand-50',
                    buttonShape,
                  )}
                >
                  {settings.primaryCtaLabel}
                  {primaryCta.external ? <ExternalLink size={16} /> : <ArrowRight size={16} />}
                </ActionLink>
                <ActionLink
                  href={secondaryCta.href}
                  external={secondaryCta.external}
                  className={cn(
                    'inline-flex min-h-[3.25rem] items-center justify-center gap-2 border border-white/18 px-6 py-3.5 text-center text-base font-semibold text-white transition hover:bg-white/10',
                    buttonShape,
                  )}
                >
                  {settings.secondaryCtaLabel}
                </ActionLink>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
