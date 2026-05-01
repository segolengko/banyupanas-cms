'use client';

import { useDeferredValue, useMemo, useState } from 'react';
import { Activity, Search, ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AuditLogItem } from '@/types';

function getEventTone(eventType: AuditLogItem['eventType']) {
  if (eventType.startsWith('auth.')) {
    return 'bg-oasis-500/10 text-oasis-600';
  }

  if (eventType.startsWith('media.')) {
    return 'bg-copper-400/12 text-copper-500';
  }

  return 'bg-ink-950/6 text-ink-800/72';
}

export default function AuditLogPage({
  items,
  backendConfigured,
}: {
  items: AuditLogItem[];
  backendConfigured: boolean;
}) {
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);
  const normalizedQuery = deferredQuery.trim().toLowerCase();

  const filteredItems = useMemo(() => {
    if (!normalizedQuery) {
      return items;
    }

    return items.filter((item) =>
      [
        item.title,
        item.detail,
        item.actorEmail,
        item.eventType,
        item.resourceType,
        item.resourceId || '',
      ]
        .join(' ')
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [items, normalizedQuery]);

  return (
    <div className="space-y-6 pb-28 lg:pb-8">
      <section className="surface-panel px-6 py-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-oasis-600">Audit Trail</p>
            <div>
              <h2 className="font-display text-4xl text-ink-950">Semua aktivitas admin tersimpan lebih rapi</h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-ink-800/72">
                Halaman ini membantu kamu menelusuri perubahan penting di auth, konten, media, dan settings
                tanpa harus mengandalkan ringkasan singkat di dashboard.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative min-w-[260px]">
              <Search
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-800/38"
              />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Cari event, actor, atau resource..."
                className="w-full rounded-full border border-ink-950/10 bg-white px-4 py-3 pl-11 text-sm outline-none transition focus:border-oasis-500/40 focus:ring-4 focus:ring-oasis-500/10"
              />
            </div>

            <div className="inline-flex items-center justify-center rounded-full bg-ink-950 px-5 py-3 text-sm font-semibold text-white">
              {items.length} event
            </div>
          </div>
        </div>

        {!backendConfigured && (
          <div className="mt-5 flex items-start gap-3 rounded-[24px] border border-copper-400/16 bg-copper-400/10 px-4 py-4 text-sm leading-7 text-copper-500">
            <ShieldAlert size={18} className="mt-1 shrink-0" />
            <p>
              Audit log baru akan terisi penuh saat backend Supabase aktif. Dalam mode demo, halaman ini
              tetap tampil untuk menjaga struktur operasional admin.
            </p>
          </div>
        )}
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <article className="surface-panel px-5 py-5">
          <p className="text-sm text-ink-800/58">Auth event</p>
          <p className="mt-3 font-display text-4xl text-ink-950">
            {items.filter((item) => item.eventType.startsWith('auth.')).length}
          </p>
        </article>
        <article className="surface-panel px-5 py-5">
          <p className="text-sm text-ink-800/58">Content event</p>
          <p className="mt-3 font-display text-4xl text-ink-950">
            {items.filter((item) => item.eventType.startsWith('content.')).length}
          </p>
        </article>
        <article className="surface-panel px-5 py-5">
          <p className="text-sm text-ink-800/58">Media & settings</p>
          <p className="mt-3 font-display text-4xl text-ink-950">
            {items.filter((item) => item.eventType.startsWith('media.') || item.eventType === 'settings.update').length}
          </p>
        </article>
      </section>

      <section className="space-y-4">
        {filteredItems.map((item) => (
          <article key={item.id} className="surface-panel px-5 py-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={cn('rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]', getEventTone(item.eventType))}>
                    {item.eventType}
                  </span>
                  <span className="rounded-full bg-ink-950/6 px-3 py-1 text-xs font-semibold text-ink-800/72">
                    {item.resourceType}
                  </span>
                  {item.resourceId && (
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-ink-800/62">
                      {item.resourceId}
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-ink-950">{item.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-ink-800/72">{item.detail}</p>
                </div>
              </div>

              <div className="min-w-[220px] rounded-[22px] border border-ink-950/8 bg-white/82 px-4 py-4 text-sm leading-7 text-ink-800/72">
                <div className="flex items-center gap-2 font-semibold text-ink-950">
                  <Activity size={16} className="text-oasis-600" />
                  Detail event
                </div>
                <p className="mt-3">{item.actorEmail}</p>
                <p>{item.time}</p>
              </div>
            </div>
          </article>
        ))}
      </section>

      {filteredItems.length === 0 && (
        <section className="surface-panel px-6 py-14 text-center text-sm text-ink-800/62">
          {normalizedQuery ? 'Tidak ada event audit yang cocok dengan pencarian saat ini.' : 'Belum ada aktivitas audit yang tercatat.'}
        </section>
      )}
    </div>
  );
}
