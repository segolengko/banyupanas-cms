import type { Metadata } from 'next';
import { getSiteSettings, isCmsBackendConfigured } from '@/lib/cms/repository';
import { getDefaultSocialImage, getSiteDescription, getSiteTitle, getSiteUrl } from '@/lib/seo';
import './globals.css';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const siteTitle = getSiteTitle(settings);
  const description = getSiteDescription(settings);
  const socialImage = getDefaultSocialImage(settings);

  return {
    metadataBase: new URL(getSiteUrl()),
    title: {
      default: siteTitle,
      template: `%s | ${siteTitle}`,
    },
    description,
    applicationName: `${siteTitle} CMS`,
    manifest: '/manifest.webmanifest',
    icons: {
      icon: [
        {
          url: '/favicon.ico',
          sizes: 'any',
          type: 'image/x-icon',
        },
        {
          url: '/brand/favicon-32.png',
          sizes: '32x32',
          type: 'image/png',
        },
        {
          url: '/brand/icon-192.png',
          sizes: '192x192',
          type: 'image/png',
        },
        {
          url: '/brand/icon-512.png',
          sizes: '512x512',
          type: 'image/png',
        },
      ],
      shortcut: ['/favicon.ico'],
      apple: [
        {
          url: '/brand/apple-touch-icon.png',
          sizes: '180x180',
          type: 'image/png',
        },
      ],
    },
    keywords: [siteTitle, 'wisata air panas', 'Cirebon', 'harga tiket', 'cerita pengunjung'],
    openGraph: {
      title: siteTitle,
      description,
      type: 'website',
      url: getSiteUrl(),
      siteName: siteTitle,
      locale: 'id_ID',
      images: socialImage
        ? [
            {
              url: socialImage,
              alt: siteTitle,
            },
          ]
        : [],
    },
    twitter: {
      card: socialImage ? 'summary_large_image' : 'summary',
      title: siteTitle,
      description,
      images: socialImage ? [socialImage] : [],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getSiteSettings(isCmsBackendConfigured() ? 'admin' : 'public');

  return (
    <html lang="id" data-theme={settings.themePreset}>
      <body>{children}</body>
    </html>
  );
}
