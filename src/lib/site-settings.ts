import type { SiteSettings } from '@/types';
import { sanitizeGoogleMapsPlaceUrl, sanitizePublicLinkUrl } from '@/lib/url-safety';

export const ticketSectionId = 'harga-tiket';

function isExternalHref(href: string) {
  return /^https?:\/\//i.test(href);
}

export function getPrimaryCtaConfig(settings: SiteSettings) {
  const href =
    sanitizeGoogleMapsPlaceUrl(settings.googleMapsPlaceUrl) ||
    sanitizePublicLinkUrl(settings.bookingUrl) ||
    '#kontak';

  return {
    href,
    external: isExternalHref(href),
  };
}

export function getSecondaryCtaConfig(settings: SiteSettings) {
  const label = settings.secondaryCtaLabel.trim();
  const safeMapsUrl = sanitizeGoogleMapsPlaceUrl(settings.googleMapsPlaceUrl);

  if (/harga|ticket|tiket/i.test(label)) {
    return {
      href: `#${ticketSectionId}`,
      external: false,
    };
  }

  if (/map|lokasi/i.test(label) && safeMapsUrl) {
    return {
      href: safeMapsUrl,
      external: true,
    };
  }

  if (/cms|admin/i.test(label)) {
    return {
      href: '/admin/login',
      external: false,
    };
  }

  return {
    href: '/stories',
    external: false,
  };
}
