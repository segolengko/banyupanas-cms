import MediaGallery from '@/components/MediaGallery';
import { getCmsHealth, listMediaItems } from '@/lib/cms/repository';

export default async function AdminMediaPage() {
  const [items, health] = await Promise.all([listMediaItems(), getCmsHealth()]);

  return <MediaGallery items={items} backendConfigured={health.backendConfigured} />;
}
