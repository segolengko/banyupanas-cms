import type { MetadataRoute } from 'next';
import { getSiteSettings } from '@/lib/cms/repository';
import { getSiteDescription, getSiteTitle, getSiteUrl } from '@/lib/seo';

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const settings = await getSiteSettings();
  const name = getSiteTitle(settings);
  const description = getSiteDescription(settings);
  const startUrl = getSiteUrl();

  return {
    name,
    short_name: name,
    description,
    start_url: startUrl,
    display: 'standalone',
    background_color: '#f7f4ec',
    theme_color: '#17323a',
    icons: [
      {
        src: '/brand/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/brand/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/brand/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  };
}
