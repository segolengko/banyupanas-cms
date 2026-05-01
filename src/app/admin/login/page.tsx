import type { Metadata } from 'next';
import LoginPage from '@/components/LoginPage';
import { loginAction } from '@/app/admin/actions';
import { getCmsHealth } from '@/lib/cms/repository';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Login Admin',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminLoginPage() {
  const health = await getCmsHealth();

  return <LoginPage action={loginAction} authConfigured={health.authConfigured} />;
}
