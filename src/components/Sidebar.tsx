'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ExternalLink, FileText, History, Home, Image as ImageIcon, LayoutDashboard, Settings } from 'lucide-react';
import { BrandMark } from '@/components/BrandLogo';
import { cn } from '@/lib/utils';

const navigation = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard },
  { href: '/admin/content', label: 'Content', icon: FileText },
  { href: '/admin/media', label: 'Media', icon: ImageIcon },
  { href: '/admin/audit', label: 'Audit', icon: History },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar({ siteName }: { siteName: string }) {
  const pathname = usePathname();
  const siteLabel = siteName || 'Website Publik';

  return (
    <>
      <aside className="surface-panel custom-scrollbar sticky top-4 hidden h-[calc(100vh-2rem)] w-[280px] shrink-0 overflow-y-auto px-4 py-5 lg:flex lg:flex-col">
        <div className="mb-8 flex items-center gap-3 px-2">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-oasis-600 text-white shadow-lg shadow-oasis-600/20">
            <BrandMark className="h-8 w-8" />
          </div>
          <div>
            <p className="font-display text-xl text-ink-950">{siteLabel}</p>
            <p className="text-xs uppercase tracking-[0.24em] text-ink-800/52">Admin Control</p>
          </div>
        </div>

        <nav className="space-y-1">
          {navigation.map((item) => {
            const active =
              item.href === '/admin' ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-[22px] px-4 py-3 text-sm font-semibold transition',
                  active
                    ? 'bg-ink-950 text-white shadow-lg shadow-ink-950/12'
                    : 'text-ink-800/74 hover:bg-white/82 hover:text-ink-950',
                )}
              >
                <item.icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="theme-sidebar-glow mt-auto rounded-[26px] p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-oasis-600">Public Website</p>
          <p className="mt-2 text-sm leading-7 text-ink-800/74">
            Buka halaman publik untuk mengecek hasil trial terbaru tanpa konten demo bawaan.
          </p>
          <Link
            href="/"
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-ink-950 transition hover:text-oasis-600"
          >
            Lihat website
            <ExternalLink size={16} />
          </Link>
        </div>
      </aside>

      <div className="surface-panel fixed inset-x-3 bottom-3 z-40 flex items-center justify-between gap-2 px-2.5 py-2.5 pb-[calc(0.625rem+env(safe-area-inset-bottom))] shadow-2xl shadow-ink-950/10 backdrop-blur-xl lg:hidden">
        {navigation.map((item) => {
          const active =
            item.href === '/admin' ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex min-w-0 flex-1 flex-col items-center gap-1 rounded-2xl px-2 py-2.5 text-[11px] font-semibold transition',
                active ? 'bg-ink-950 text-white' : 'text-ink-800/74',
              )}
            >
              <item.icon size={16} />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}

        <Link
          href="/"
          className="flex flex-col items-center gap-1 rounded-2xl px-2 py-2.5 text-[11px] font-semibold text-ink-800/74 transition"
        >
          <Home size={16} />
          <span>Site</span>
        </Link>
      </div>
    </>
  );
}
