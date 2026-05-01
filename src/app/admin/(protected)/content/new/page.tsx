import Editor from '@/components/Editor';
import { listMediaItems, saveContentAction } from '@/lib/cms/repository';
import type { ContentItem } from '@/types';

const emptyItem: ContentItem = {
  id: '',
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  status: 'draft',
  author: 'Admin CMS',
  type: 'article',
  createdAt: '',
  updatedAt: '',
  publishedAt: null,
  coverImage: '',
  seoTitle: '',
  seoDescription: '',
  featured: false,
};

export default async function NewContentPage() {
  const mediaItems = await listMediaItems();

  return <Editor item={emptyItem} mediaItems={mediaItems} action={saveContentAction} />;
}
