import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import StoryArticleView from '@/components/StoryArticleView';
import { getContentItemBySlug, getSiteSettings } from '@/lib/cms/repository';

export const dynamic = 'force-dynamic';

type AdminContentPreviewPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({ params }: AdminContentPreviewPageProps): Promise<Metadata> {
  const { slug } = await params;
  const story = await getContentItemBySlug(slug);

  return {
    title: story ? `Preview: ${story.title}` : 'Preview konten',
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function AdminContentPreviewPage({ params }: AdminContentPreviewPageProps) {
  const { slug } = await params;
  const [settings, story] = await Promise.all([getSiteSettings('admin'), getContentItemBySlug(slug)]);

  if (!story) {
    notFound();
  }

  return (
    <StoryArticleView
      story={story}
      settings={settings}
      backHref={`/admin/content/${story.slug}`}
      backLabel="Kembali ke editor"
      previewMode
      editHref={`/admin/content/${story.slug}`}
    />
  );
}
