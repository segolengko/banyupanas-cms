import Dashboard from '@/components/Dashboard';
import { getCmsHealth, getDashboardData, getSiteSettings } from '@/lib/cms/repository';

export default async function AdminDashboardPage() {
  const [health, data, settings] = await Promise.all([
    getCmsHealth(),
    getDashboardData(),
    getSiteSettings('admin'),
  ]);

  return <Dashboard data={data} health={health} settings={settings} />;
}
