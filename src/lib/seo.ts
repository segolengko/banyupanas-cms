import type { Metadata } from 'next';
import type { SiteSettings } from '@/types';

const fallbackSiteName = 'Banyu Panas Cirebon';
const fallbackDescription =
  'Website publik Banyu Panas Cirebon dengan informasi kunjungan, harga tiket, cerita, dan pengelolaan CMS yang lebih rapi.';

export function getSiteUrl() {
  const rawValue =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.NEXT_PUBLIC_VERCEL_URL ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` : '') ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '') ||
    'http://localhost:3000';

  try {
    return new URL(rawValue).origin;
  } catch {
    return 'http://localhost:3000';
  }
}

export function toAbsoluteUrl(path = '/') {
  return new URL(path, `${getSiteUrl()}/`).toString();
}

export function getSiteTitle(settings: SiteSettings) {
  return settings.siteName.trim() || fallbackSiteName;
}

export function getSiteDescription(settings: SiteSettings) {
  return settings.siteDescription.trim() || settings.heroDescription.trim() || fallbackDescription;
}

export function getBrandSocialImage() {
  return toAbsoluteUrl('/brand/og-card.png');
}

export function getDefaultSocialImage(settings: SiteSettings, fallbackImage = getBrandSocialImage()) {
  return settings.heroPosterImage.trim() || fallbackImage || undefined;
}

function getImageEntries(url: string | undefined, alt: string) {
  if (!url) {
    return [];
  }

  return [
    {
      url,
      alt,
    },
  ];
}

export function buildPublicMetadata({
  settings,
  title,
  description,
  path,
  image,
  type = 'website',
  keywords = [],
}: {
  settings: SiteSettings;
  title?: string;
  description?: string;
  path: string;
  image?: string;
  type?: 'website' | 'article';
  keywords?: string[];
}): Metadata {
  const siteTitle = getSiteTitle(settings);
  const resolvedDescription = description?.trim() || getSiteDescription(settings);
  const resolvedImage = image || getDefaultSocialImage(settings);
  const canonicalUrl = toAbsoluteUrl(path);
  const openGraphTitle = title || siteTitle;
  const imageEntries = getImageEntries(resolvedImage, openGraphTitle);

  return {
    title,
    description: resolvedDescription,
    alternates: {
      canonical: canonicalUrl,
    },
    keywords,
    openGraph: {
      title: openGraphTitle,
      description: resolvedDescription,
      url: canonicalUrl,
      type,
      images: imageEntries,
      siteName: siteTitle,
      locale: 'id_ID',
    },
    twitter: {
      card: imageEntries.length > 0 ? 'summary_large_image' : 'summary',
      title: openGraphTitle,
      description: resolvedDescription,
      images: resolvedImage ? [resolvedImage] : [],
    },
  };
}
