import { notFound } from 'next/navigation';
import Editor from '@/components/Editor';
import { getContentItemBySlug, listMediaItems, saveContentAction } from '@/lib/cms/repository';

export default async function EditContentPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [item, mediaItems] = await Promise.all([getContentItemBySlug(slug), listMediaItems()]);

  if (!item) {
    notFound();
  }

  return <Editor item={item} mediaItems={mediaItems} action={saveContentAction} />;
}
