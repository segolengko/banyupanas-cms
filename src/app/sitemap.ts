import type { MetadataRoute } from 'next';
import { listPublishedContentItems } from '@/lib/cms/repository';
import { getSiteUrl, toAbsoluteUrl } from '@/lib/seo';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const stories = await listPublishedContentItems();
  const now = new Date();

  return [
    {
      url: getSiteUrl(),
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: toAbsoluteUrl('/stories'),
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.8,
    },
    ...stories.map((story) => ({
      url: toAbsoluteUrl(`/stories/${story.slug}`),
      lastModified: new Date(story.publishedAt || story.updatedAt),
      changeFrequency: 'weekly' as const,
      priority: story.featured ? 0.9 : 0.7,
    })),
  ];
}
