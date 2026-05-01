import SettingsManager from '@/components/SettingsManager';
import { getCmsHealth, getSiteSettings, listMediaItems, saveSiteSettingsAction } from '@/lib/cms/repository';

export default async function AdminSettingsPage() {
  const [settings, health, mediaItems] = await Promise.all([
    getSiteSettings('admin'),
    getCmsHealth(),
    listMediaItems(),
  ]);

  return (
    <SettingsManager
      settings={settings}
      mediaItems={mediaItems}
      backendConfigured={health.backendConfigured}
      action={saveSiteSettingsAction}
    />
  );
}
