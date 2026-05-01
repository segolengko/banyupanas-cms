import type { Metadata } from 'next';
import LandingPage from '@/components/LandingPage';
import { getSiteSettings, listPublishedContentItems } from '@/lib/cms/repository';
import { buildPublicMetadata } from '@/lib/seo';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();

  return buildPublicMetadata({
    settings,
    path: '/',
    description: settings.heroDescription || settings.siteDescription,
    image: settings.heroPosterImage,
    keywords: [settings.siteName || 'Banyu Panas Cirebon', 'wisata air panas', 'harga tiket', 'lokasi'],
  });
}

export default async function HomePage() {
  const [settings, stories] = await Promise.all([getSiteSettings(), listPublishedContentItems(3)]);

  return <LandingPage settings={settings} stories={stories} />;
}
