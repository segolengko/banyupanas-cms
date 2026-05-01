import AuditLogPage from '@/components/AuditLogPage';
import { getCmsHealth, listAuditLogItems } from '@/lib/cms/repository';

export default async function AdminAuditPage() {
  const [items, health] = await Promise.all([listAuditLogItems(120), getCmsHealth()]);

  return <AuditLogPage items={items} backendConfigured={health.backendConfigured} />;
}
