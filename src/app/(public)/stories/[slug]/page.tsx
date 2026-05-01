import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import StoryArticleView from '@/components/StoryArticleView';
import { getPublishedContentItemBySlug, getSiteSettings } from '@/lib/cms/repository';
import { buildPublicMetadata } from '@/lib/seo';

export const dynamic = 'force-dynamic';

type StoryDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({ params }: StoryDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const [settings, story] = await Promise.all([getSiteSettings(), getPublishedContentItemBySlug(slug)]);

  if (!story) {
    return {
      title: 'Cerita tidak ditemukan',
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  return buildPublicMetadata({
    settings,
    title: story.seoTitle || story.title,
    description: story.seoDescription || story.excerpt,
    path: `/stories/${story.slug}`,
    image: story.coverImage || settings.heroPosterImage,
    type: 'article',
    keywords: [story.type, story.author, settings.siteName || 'Banyu Panas Cirebon'],
  });
}

export default async function StoryDetailPage({ params }: StoryDetailPageProps) {
  const { slug } = await params;
  const [settings, story] = await Promise.all([getSiteSettings(), getPublishedContentItemBySlug(slug)]);

  if (!story) {
    notFound();
  }

  return <StoryArticleView story={story} settings={settings} backHref="/stories" backLabel="Semua cerita" />;
}
