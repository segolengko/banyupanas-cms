import ContentList from '@/components/ContentList';
import { bulkContentAction, deleteContentAction, getCmsHealth, listContentItems } from '@/lib/cms/repository';

export default async function AdminContentPage() {
  const [items, health] = await Promise.all([listContentItems(), getCmsHealth()]);

  return (
    <ContentList
      items={items}
      backendConfigured={health.backendConfigured}
      deleteAction={deleteContentAction}
      bulkAction={bulkContentAction}
    />
  );
}
