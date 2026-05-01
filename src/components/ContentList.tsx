'use client';

import Link from 'next/link';
import { useActionState, useDeferredValue, useEffect, useMemo, useState } from 'react';
import { useFormStatus } from 'react-dom';
import {
  ArrowRight,
  CheckSquare,
  Eye,
  ExternalLink,
  FileText,
  Search,
  ShieldAlert,
  Trash2,
  Upload,
} from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';
import type { ContentItem } from '@/types';

type FormActionState = {
  status: 'idle' | 'error' | 'demo';
  message?: string;
};

function BulkActionButton({
  intent,
  label,
  className,
  disabled,
}: {
  intent: 'publish' | 'draft' | 'delete';
  label: string;
  className: string;
  disabled?: boolean;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      name="intent"
      value={intent}
      disabled={pending || disabled}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60',
        className,
      )}
    >
      {intent === 'publish' && <Upload size={15} />}
      {intent === 'draft' && <CheckSquare size={15} />}
      {intent === 'delete' && <Trash2 size={15} />}
      {pending ? 'Memproses...' : label}
    </button>
  );
}

export default function ContentList({
  items,
  backendConfigured,
  deleteAction,
  bulkAction,
}: {
  items: ContentItem[];
  backendConfigured: boolean;
  deleteAction: (formData: FormData) => Promise<void>;
  bulkAction: (state: FormActionState, formData: FormData) => Promise<FormActionState>;
}) {
  const [state, formAction] = useActionState(bulkAction, { status: 'idle' });
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | ContentItem['status']>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | ContentItem['type']>('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const deferredQuery = useDeferredValue(query);
  const normalizedQuery = deferredQuery.trim().toLowerCase();

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesQuery =
        !normalizedQuery ||
        item.title.toLowerCase().includes(normalizedQuery) ||
        item.slug.toLowerCase().includes(normalizedQuery) ||
        item.excerpt.toLowerCase().includes(normalizedQuery);
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      const matchesType = typeFilter === 'all' || item.type === typeFilter;

      return matchesQuery && matchesStatus && matchesType;
    });
  }, [items, normalizedQuery, statusFilter, typeFilter]);

  const filteredIds = filteredItems.map((item) => item.id);
  const allFilteredSelected = filteredIds.length > 0 && filteredIds.every((id) => selectedIds.includes(id));
  const selectedCount = selectedIds.length;
  const totalPublished = items.filter((item) => item.status === 'published').length;
  const totalDraft = items.filter((item) => item.status === 'draft').length;
  const totalFeatured = items.filter((item) => item.featured).length;

  useEffect(() => {
    setSelectedIds((current) => current.filter((id) => items.some((item) => item.id === id)));
  }, [items]);

  useEffect(() => {
    if (state.message && state.status !== 'error' && state.status !== 'demo') {
      setSelectedIds([]);
    }
  }, [state.message, state.status]);

  function toggleItemSelection(id: string) {
    setSelectedIds((current) => (current.includes(id) ? current.filter((itemId) => itemId !== id) : [...current, id]));
  }

  function toggleAllFiltered() {
    setSelectedIds((current) => {
      if (allFilteredSelected) {
        return current.filter((id) => !filteredIds.includes(id));
      }

      return Array.from(new Set([...current, ...filteredIds]));
    });
  }

  return (
    <div className="space-y-5 pb-28 md:space-y-6 lg:pb-8">
      <section className="surface-panel px-5 py-5 md:px-6 md:py-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-oasis-600">
              Content Workspace
            </p>
            <div>
              <h2 className="font-display text-3xl leading-tight text-ink-950 md:text-4xl">
                Kelola narasi website dengan lebih rapi
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-ink-800/72">
                Workspace ini sekarang mendukung pencarian, filter, shortcut publik, dan bulk action supaya ritme
                editorial tidak bergantung pada edit satu per satu.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative sm:min-w-[260px]">
              <Search
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-800/38"
              />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Cari judul, slug, atau ringkasan..."
                className="w-full rounded-full border border-ink-950/10 bg-white px-4 py-3 pl-11 text-sm outline-none transition focus:border-oasis-500/40 focus:ring-4 focus:ring-oasis-500/10"
              />
            </div>

            <Link
              href="/admin/content/new"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-ink-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-ink-900"
            >
              Buat konten baru
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>

        {!backendConfigured && (
          <div className="mt-5 flex items-start gap-3 rounded-[24px] border border-copper-400/16 bg-copper-400/10 px-4 py-4 text-sm leading-7 text-copper-500">
            <ShieldAlert size={18} className="mt-1 shrink-0" />
            <p>
              Backend write masih berjalan di mode demo. Konten yang tampil sekarang aman untuk preview, tetapi
              penyimpanan permanen membutuhkan `SUPABASE_URL` dan `SUPABASE_SERVICE_ROLE_KEY`.
            </p>
          </div>
        )}

        {state.message && (
          <div
            className={cn(
              'mt-5 rounded-[24px] px-4 py-4 text-sm leading-7',
              state.status === 'error'
                ? 'border border-copper-400/16 bg-copper-400/10 text-copper-500'
                : 'border border-oasis-500/16 bg-oasis-500/10 text-oasis-600',
            )}
          >
            {state.message}
          </div>
        )}
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="surface-panel px-5 py-5">
          <p className="text-sm text-ink-800/58">Total konten</p>
          <p className="mt-3 font-display text-4xl text-ink-950">{items.length}</p>
        </article>
        <article className="surface-panel px-5 py-5">
          <p className="text-sm text-ink-800/58">Published</p>
          <p className="mt-3 font-display text-4xl text-oasis-700">{totalPublished}</p>
        </article>
        <article className="surface-panel px-5 py-5">
          <p className="text-sm text-ink-800/58">Draft</p>
          <p className="mt-3 font-display text-4xl text-copper-500">{totalDraft}</p>
        </article>
        <article className="surface-panel px-5 py-5">
          <p className="text-sm text-ink-800/58">Featured</p>
          <p className="mt-3 font-display text-4xl text-ink-950">{totalFeatured}</p>
        </article>
      </section>

      <section className="surface-panel overflow-hidden">
        <div className="border-b border-ink-950/8 px-6 py-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              <label className="block space-y-2">
                <span className="text-xs font-semibold uppercase tracking-[0.22em] text-ink-800/48">Status</span>
                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value as 'all' | ContentItem['status'])}
                  className="w-full rounded-[20px] border border-ink-950/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-oasis-500/35 focus:ring-4 focus:ring-oasis-500/10"
                >
                  <option value="all">Semua status</option>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                </select>
              </label>

              <label className="block space-y-2">
                <span className="text-xs font-semibold uppercase tracking-[0.22em] text-ink-800/48">Tipe</span>
                <select
                  value={typeFilter}
                  onChange={(event) => setTypeFilter(event.target.value as 'all' | ContentItem['type'])}
                  className="w-full rounded-[20px] border border-ink-950/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-oasis-500/35 focus:ring-4 focus:ring-oasis-500/10"
                >
                  <option value="all">Semua tipe</option>
                  <option value="article">Article</option>
                  <option value="page">Page</option>
                  <option value="announcement">Announcement</option>
                </select>
              </label>

              <div className="rounded-[20px] border border-ink-950/8 bg-sand-50/80 px-4 py-3 text-sm leading-7 text-ink-800/72">
                {filteredItems.length} konten tampil
                <br />
                {selectedCount} dipilih
              </div>
            </div>

            <form
              action={formAction}
              onSubmit={(event) => {
                const submitter = (event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
                const intent = submitter?.value;

                if (!selectedCount) {
                  event.preventDefault();
                  return;
                }

                if (intent === 'delete') {
                  const confirmed = window.confirm(
                    `Hapus ${selectedCount} konten terpilih? Tindakan ini tidak bisa dibatalkan.`,
                  );

                  if (!confirmed) {
                    event.preventDefault();
                  }
                }
              }}
              className="flex flex-col gap-3 xl:items-end"
            >
              {selectedIds.map((id) => (
                <input key={id} type="hidden" name="ids" value={id} />
              ))}

              <div className="flex flex-wrap gap-2">
                <BulkActionButton
                  intent="publish"
                  label="Publish terpilih"
                  className="bg-oasis-600 text-white hover:bg-oasis-700"
                  disabled={!backendConfigured || selectedCount === 0}
                />
                <BulkActionButton
                  intent="draft"
                  label="Pindah ke draft"
                  className="border border-ink-950/10 bg-white text-ink-950 hover:border-oasis-500/35 hover:text-oasis-600"
                  disabled={!backendConfigured || selectedCount === 0}
                />
                <BulkActionButton
                  intent="delete"
                  label="Hapus terpilih"
                  className="border border-copper-400/20 bg-white text-copper-500 hover:border-copper-400/40 hover:bg-copper-400/8"
                  disabled={!backendConfigured || selectedCount === 0}
                />
              </div>
            </form>
          </div>
        </div>

        <div className="space-y-4 p-4 lg:hidden">
          {filteredItems.map((item) => {
            const isSelected = selectedIds.includes(item.id);

            return (
              <article
                key={item.id}
                className={cn(
                  'rounded-[26px] border border-ink-950/8 bg-white/82 p-4 shadow-sm shadow-ink-950/4',
                  isSelected && 'border-oasis-500/25 bg-oasis-500/6',
                )}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleItemSelection(item.id)}
                    className="mt-1 h-4 w-4 rounded border-ink-950/20 text-oasis-600 focus:ring-oasis-500/20"
                  />

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-base font-semibold leading-7 text-ink-950">{item.title}</p>
                      <span
                        className={cn(
                          'inline-flex rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]',
                          item.status === 'published'
                            ? 'bg-oasis-500/10 text-oasis-600'
                            : 'bg-copper-400/12 text-copper-500',
                        )}
                      >
                        {item.status}
                      </span>
                      {item.featured && (
                        <span className="rounded-full bg-ink-950/6 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-800/70">
                          Featured
                        </span>
                      )}
                    </div>

                    <p className="mt-2 text-sm leading-7 text-ink-800/72">{item.excerpt}</p>

                    <div className="mt-3 flex flex-wrap gap-2 text-xs font-medium text-ink-800/62">
                      <span className="rounded-full bg-ink-950/5 px-3 py-1">/{item.slug}</span>
                      <span className="rounded-full bg-sand-50 px-3 py-1 capitalize">{item.type}</span>
                      <span className="rounded-full bg-sand-50 px-3 py-1">{item.author}</span>
                    </div>

                    <p className="mt-3 text-xs uppercase tracking-[0.18em] text-ink-800/45">
                      Update {formatDate(item.updatedAt)}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <Link
                        href={`/admin/content/preview/${item.slug}`}
                        className="inline-flex items-center gap-2 rounded-full border border-ink-950/10 px-3 py-2 text-xs font-semibold text-ink-950 transition hover:border-oasis-500/30 hover:text-oasis-600"
                      >
                        <Eye size={14} />
                        Preview
                      </Link>

                      {item.status === 'published' && (
                        <Link
                          href={`/stories/${item.slug}`}
                          target="_blank"
                          className="inline-flex items-center gap-2 rounded-full border border-ink-950/10 px-3 py-2 text-xs font-semibold text-ink-950 transition hover:border-oasis-500/30 hover:text-oasis-600"
                        >
                          <Eye size={14} />
                          Publik
                          <ExternalLink size={13} />
                        </Link>
                      )}

                      <Link
                        href={`/admin/content/${item.slug}`}
                        className="inline-flex items-center gap-2 rounded-full border border-ink-950/10 px-3 py-2 text-xs font-semibold text-ink-950 transition hover:border-oasis-500/30 hover:text-oasis-600"
                      >
                        <FileText size={14} />
                        Edit
                      </Link>

                      {backendConfigured && (
                        <form
                          action={deleteAction}
                          onSubmit={(event) => {
                            const confirmed = window.confirm(
                              `Hapus konten "${item.title}"? Tindakan ini tidak bisa dibatalkan.`,
                            );

                            if (!confirmed) {
                              event.preventDefault();
                            }
                          }}
                        >
                          <input type="hidden" name="id" value={item.id} />
                          <input type="hidden" name="slug" value={item.slug} />
                          <input type="hidden" name="title" value={item.title} />
                          <button
                            type="submit"
                            className="inline-flex items-center gap-2 rounded-full border border-copper-400/20 px-3 py-2 text-xs font-semibold text-copper-500 transition hover:border-copper-400/40 hover:bg-copper-400/8"
                          >
                            <Trash2 size={14} />
                            Hapus
                          </button>
                        </form>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <div className="hidden overflow-x-auto lg:block">
          <table className="min-w-full">
            <thead className="bg-ink-950 text-left text-xs uppercase tracking-[0.22em] text-white/70">
              <tr>
                <th className="px-6 py-4 font-medium">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={allFilteredSelected}
                      onChange={toggleAllFiltered}
                      className="h-4 w-4 rounded border-white/30 bg-transparent text-oasis-500 focus:ring-oasis-500/20"
                    />
                    Pilih
                  </label>
                </th>
                <th className="px-6 py-4 font-medium">Konten</th>
                <th className="px-6 py-4 font-medium">Tipe</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Penulis</th>
                <th className="px-6 py-4 font-medium">Update terakhir</th>
                <th className="px-6 py-4 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-950/8 bg-white/82">
              {filteredItems.map((item) => {
                const isSelected = selectedIds.includes(item.id);

                return (
                  <tr key={item.id} className={cn('transition hover:bg-sand-50/90', isSelected && 'bg-oasis-500/6')}>
                    <td className="px-6 py-5 align-top">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleItemSelection(item.id)}
                        className="mt-1 h-4 w-4 rounded border-ink-950/20 text-oasis-600 focus:ring-oasis-500/20"
                      />
                    </td>
                    <td className="px-6 py-5 align-top">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-base font-semibold text-ink-950">{item.title}</p>
                          {item.featured && (
                            <span className="rounded-full bg-oasis-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-oasis-600">
                              Featured
                            </span>
                          )}
                        </div>
                        <p className="max-w-xl text-sm leading-7 text-ink-800/70">{item.excerpt}</p>
                        <div className="inline-flex items-center gap-2 rounded-full bg-ink-950/5 px-3 py-1 text-xs font-medium text-ink-800/60">
                          /{item.slug}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 align-top text-sm font-semibold capitalize text-ink-800/78">
                      {item.type}
                    </td>
                    <td className="px-6 py-5 align-top">
                      <span
                        className={cn(
                          'inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]',
                          item.status === 'published'
                            ? 'bg-oasis-500/10 text-oasis-600'
                            : 'bg-copper-400/12 text-copper-500',
                        )}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-5 align-top text-sm text-ink-800/72">{item.author}</td>
                    <td className="px-6 py-5 align-top text-sm text-ink-800/72">
                      {formatDate(item.updatedAt)}
                    </td>
                    <td className="px-6 py-5 align-top text-right">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/admin/content/preview/${item.slug}`}
                          className="inline-flex items-center gap-2 rounded-full border border-ink-950/10 px-4 py-2 text-sm font-semibold text-ink-950 transition hover:border-oasis-500/30 hover:text-oasis-600"
                        >
                          <Eye size={16} />
                          Preview
                        </Link>

                        {item.status === 'published' && (
                          <Link
                            href={`/stories/${item.slug}`}
                            target="_blank"
                            className="inline-flex items-center gap-2 rounded-full border border-ink-950/10 px-4 py-2 text-sm font-semibold text-ink-950 transition hover:border-oasis-500/30 hover:text-oasis-600"
                          >
                            <Eye size={16} />
                            Publik
                            <ExternalLink size={14} />
                          </Link>
                        )}

                        <Link
                          href={`/admin/content/${item.slug}`}
                          className="inline-flex items-center gap-2 rounded-full border border-ink-950/10 px-4 py-2 text-sm font-semibold text-ink-950 transition hover:border-oasis-500/30 hover:text-oasis-600"
                        >
                          <FileText size={16} />
                          Edit
                        </Link>

                        {backendConfigured && (
                          <form
                            action={deleteAction}
                            onSubmit={(event) => {
                              const confirmed = window.confirm(
                                `Hapus konten "${item.title}"? Tindakan ini tidak bisa dibatalkan.`,
                              );

                              if (!confirmed) {
                                event.preventDefault();
                              }
                            }}
                          >
                            <input type="hidden" name="id" value={item.id} />
                            <input type="hidden" name="slug" value={item.slug} />
                            <input type="hidden" name="title" value={item.title} />
                            <button
                              type="submit"
                              className="inline-flex items-center gap-2 rounded-full border border-copper-400/20 px-4 py-2 text-sm font-semibold text-copper-500 transition hover:border-copper-400/40 hover:bg-copper-400/8"
                            >
                              <Trash2 size={16} />
                              Hapus
                            </button>
                          </form>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredItems.length === 0 && (
          <div className="px-6 py-14 text-center text-sm text-ink-800/62">
            {normalizedQuery || statusFilter !== 'all' || typeFilter !== 'all'
              ? 'Tidak ada konten yang cocok dengan pencarian atau filter saat ini.'
              : 'Belum ada konten yang dibuat.'}
          </div>
        )}
      </section>
    </div>
  );
}
