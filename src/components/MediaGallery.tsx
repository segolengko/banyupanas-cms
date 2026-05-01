'use client';

import Image from 'next/image';
import { startTransition, useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ExternalLink,
  ImagePlus,
  Loader2,
  Save,
  Search,
  ShieldAlert,
  Tags,
  Trash2,
  Video,
} from 'lucide-react';
import type { MediaItem, MediaItemRole } from '@/types';

type MediaDraftState = {
  altText: string;
  tags: string;
  role: MediaItemRole;
};

const roleOptions: Array<{ value: 'all' | MediaItemRole; label: string }> = [
  { value: 'all', label: 'Semua role' },
  { value: 'general', label: 'General' },
  { value: 'hero', label: 'Hero' },
  { value: 'story-cover', label: 'Story cover' },
  { value: 'gallery', label: 'Gallery' },
];

async function readJsonOrText(response: Response) {
  const responseType = response.headers.get('content-type') || '';

  if (responseType.includes('application/json')) {
    return (await response.json()) as { error?: string; ok?: boolean; signedUrl?: string; storagePath?: string };
  }

  const text = (await response.text()).trim();

  if (
    response.status === 413 ||
    /FUNCTION_PAYLOAD_TOO_LARGE|Request Entity Too Large|Payload Too Large|Request Entity/i.test(text)
  ) {
    return {
      error:
        'Upload gagal karena request terlalu besar untuk diproses server. Sistem sekarang memakai upload langsung ke storage; coba ulangi sekali lagi dengan file maksimal 10 MB.',
    };
  }

  if (text.startsWith('<!DOCTYPE html')) {
    return {
      error: `Server mengembalikan halaman error (${response.status}). Coba ulangi beberapa saat lagi.`,
    };
  }

  return {
    error: text || `Request gagal dengan status ${response.status}.`,
  };
}

async function uploadFileToSignedUrl(file: File, signedUrl: string) {
  const formData = new FormData();
  formData.append('cacheControl', '3600');
  formData.append('', file);

  const response = await fetch(signedUrl, {
    method: 'PUT',
    body: formData,
  });

  if (response.ok) {
    return;
  }

  const payload = await readJsonOrText(response);
  throw new Error(payload.error || 'Upload ke storage gagal.');
}

function getInitialDrafts(items: MediaItem[]) {
  return Object.fromEntries(
    items.map((item) => [
      item.storagePath || item.id,
      {
        altText: item.alt,
        tags: item.tags.join(', '),
        role: item.role,
      } satisfies MediaDraftState,
    ]),
  );
}

export default function MediaGallery({
  items,
  backendConfigured,
}: {
  items: MediaItem[];
  backendConfigured: boolean;
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | MediaItem['type']>('all');
  const [roleFilter, setRoleFilter] = useState<'all' | MediaItemRole>('all');
  const [drafts, setDrafts] = useState<Record<string, MediaDraftState>>(() => getInitialDrafts(items));
  const [isUploading, setIsUploading] = useState(false);
  const [savingPath, setSavingPath] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const deferredQuery = useDeferredValue(query);
  const normalizedQuery = deferredQuery.trim().toLowerCase();

  useEffect(() => {
    setDrafts(getInitialDrafts(items));
  }, [items]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const draft = drafts[item.storagePath || item.id];
      const searchable = [
        item.name,
        item.alt,
        item.role,
        ...(item.tags || []),
        draft?.altText || '',
        draft?.tags || '',
      ]
        .join(' ')
        .toLowerCase();
      const matchesQuery = !normalizedQuery || searchable.includes(normalizedQuery);
      const matchesType = typeFilter === 'all' || item.type === typeFilter;
      const matchesRole = roleFilter === 'all' || item.role === roleFilter;

      return matchesQuery && matchesType && matchesRole;
    });
  }, [items, drafts, normalizedQuery, typeFilter, roleFilter]);

  function updateDraft(path: string, patch: Partial<MediaDraftState>) {
    setDrafts((current) => ({
      ...current,
      [path]: {
        ...current[path],
        ...patch,
      },
    }));
  }

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setError(null);
    setNotice(null);
    setIsUploading(true);

    try {
      const prepareResponse = await fetch('/api/admin/media', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'prepare-upload',
          fileName: file.name,
          contentType: file.type,
          size: file.size,
        }),
      });
      const prepareResult = await readJsonOrText(prepareResponse);

      if (!prepareResponse.ok || !prepareResult.signedUrl || !prepareResult.storagePath) {
        throw new Error(prepareResult.error || 'Upload gagal disiapkan.');
      }

      await uploadFileToSignedUrl(file, prepareResult.signedUrl);

      const completeResponse = await fetch('/api/admin/media', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'complete-upload',
          storagePath: prepareResult.storagePath,
          fileName: file.name,
          contentType: file.type,
          size: file.size,
        }),
      });
      const completeResult = await readJsonOrText(completeResponse);

      if (!completeResponse.ok) {
        throw new Error(completeResult.error || 'Metadata upload gagal disimpan.');
      }

      setNotice('Asset berhasil diupload.');
      startTransition(() => {
        router.refresh();
      });
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Upload gagal.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }

  async function handleDelete(path: string | undefined) {
    if (!path || !confirm('Hapus asset ini dari bucket media?')) {
      return;
    }

    setError(null);
    setNotice(null);

    try {
      const response = await fetch(`/api/admin/media?path=${encodeURIComponent(path)}`, {
        method: 'DELETE',
      });
      const result = await readJsonOrText(response);

      if (!response.ok) {
        throw new Error(result.error || 'Gagal menghapus asset.');
      }

      setNotice('Asset berhasil dihapus.');
      startTransition(() => {
        router.refresh();
      });
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Gagal menghapus asset.');
    }
  }

  async function handleMetadataSave(item: MediaItem) {
    const path = item.storagePath;

    if (!path) {
      return;
    }

    const draft = drafts[path];

    setError(null);
    setNotice(null);
    setSavingPath(path);

    try {
      const response = await fetch('/api/admin/media', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          storagePath: path,
          altText: draft?.altText || '',
          role: draft?.role || 'general',
          tags: (draft?.tags || '')
            .split(',')
            .map((tag) => tag.trim())
            .filter(Boolean),
          name: item.name,
        }),
      });
      const result = await readJsonOrText(response);

      if (!response.ok) {
        throw new Error(result.error || 'Gagal menyimpan metadata.');
      }

      setNotice(`Metadata untuk "${item.name}" berhasil diperbarui.`);
      startTransition(() => {
        router.refresh();
      });
    } catch (metadataError) {
      setError(metadataError instanceof Error ? metadataError.message : 'Gagal menyimpan metadata.');
    } finally {
      setSavingPath(null);
    }
  }

  return (
    <div className="space-y-6 pb-28 lg:pb-8">
      <section className="surface-panel px-6 py-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-oasis-600">Media Library</p>
            <div>
              <h2 className="font-display text-4xl text-ink-950">Kelola asset visual sebagai content system</h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-ink-800/72">
                Media library sekarang bukan cuma tempat upload file. Kamu bisa menata `alt text`, tag, dan peran
                asset agar editor dan visual picker punya konteks yang lebih jelas.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative min-w-[250px]">
              <Search
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-800/38"
              />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Cari nama, alt text, atau tag..."
                className="w-full rounded-full border border-ink-950/10 bg-white px-4 py-3 pl-11 text-sm outline-none transition focus:border-oasis-500/35 focus:ring-4 focus:ring-oasis-500/10"
              />
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              className="hidden"
              onChange={handleFileChange}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={!backendConfigured || isUploading}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-ink-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-ink-900 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isUploading ? <Loader2 size={16} className="animate-spin" /> : <ImagePlus size={16} />}
              {isUploading ? 'Uploading...' : 'Upload asset'}
            </button>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <label className="block space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.22em] text-ink-800/48">Tipe</span>
            <select
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value as 'all' | MediaItem['type'])}
              className="w-full rounded-[20px] border border-ink-950/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-oasis-500/35 focus:ring-4 focus:ring-oasis-500/10"
            >
              <option value="all">Semua tipe</option>
              <option value="image">Image</option>
              <option value="video">Video</option>
            </select>
          </label>

          <label className="block space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.22em] text-ink-800/48">Peran asset</span>
            <select
              value={roleFilter}
              onChange={(event) => setRoleFilter(event.target.value as 'all' | MediaItemRole)}
              className="w-full rounded-[20px] border border-ink-950/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-oasis-500/35 focus:ring-4 focus:ring-oasis-500/10"
            >
              {roleOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <div className="rounded-[20px] border border-ink-950/8 bg-sand-50/80 px-4 py-3 text-sm leading-7 text-ink-800/72">
            {items.length} asset total
            <br />
            {filteredItems.length} asset tampil
          </div>

          <div className="rounded-[20px] border border-ink-950/8 bg-sand-50/80 px-4 py-3 text-sm leading-7 text-ink-800/72">
            {items.filter((item) => item.role === 'hero').length} hero
            <br />
            {items.filter((item) => item.role === 'story-cover').length} story cover
          </div>
        </div>

        {!backendConfigured && (
          <div className="mt-5 flex items-start gap-3 rounded-[24px] border border-copper-400/16 bg-copper-400/10 px-4 py-4 text-sm leading-7 text-copper-500">
            <ShieldAlert size={18} className="mt-1 shrink-0" />
            <p>
              Upload, delete, dan metadata dinonaktifkan sampai backend media terhubung. Ini disengaja supaya
              operasi file tetap berada di jalur server yang aman.
            </p>
          </div>
        )}

        {error && (
          <div className="mt-5 rounded-[24px] border border-copper-400/16 bg-copper-400/10 px-4 py-4 text-sm leading-7 text-copper-500">
            {error}
          </div>
        )}

        {notice && (
          <div className="mt-5 rounded-[24px] border border-oasis-500/16 bg-oasis-500/10 px-4 py-4 text-sm leading-7 text-oasis-600">
            {notice}
          </div>
        )}
      </section>

      <section className="grid gap-4 xl:grid-cols-2 2xl:grid-cols-3">
        {filteredItems.map((item) => {
          const path = item.storagePath || item.id;
          const draft = drafts[path] || {
            altText: item.alt,
            tags: item.tags.join(', '),
            role: item.role,
          };
          const isSaving = savingPath === path;

          return (
            <article key={item.id} className="surface-panel overflow-hidden p-3">
              <div className="relative h-64 overflow-hidden rounded-[26px] bg-sand-50">
                {item.type === 'image' ? (
                  <Image
                    src={item.url}
                    alt={draft.altText || item.alt}
                    fill
                    sizes="(max-width: 1536px) 50vw, 33vw"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-ink-950 text-white">
                    <div className="text-center">
                      <Video size={34} className="mx-auto mb-3" />
                      <p className="text-sm font-semibold">Video asset</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4 px-2 pb-2 pt-5">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-base font-semibold text-ink-950">{item.name}</p>
                    <span className="rounded-full bg-ink-950/6 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-800/64">
                      {item.type}
                    </span>
                    <span className="rounded-full bg-oasis-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-oasis-600">
                      {draft.role}
                    </span>
                  </div>
                  <p className="text-sm text-ink-800/62">{item.sizeLabel}</p>
                  {item.storagePath && <p className="break-all text-xs leading-6 text-ink-800/48">{item.storagePath}</p>}
                </div>

                <label className="block space-y-2">
                  <span className="text-sm font-semibold text-ink-900">Alt text</span>
                  <input
                    value={draft.altText}
                    onChange={(event) => updateDraft(path, { altText: event.target.value })}
                    placeholder="Deskripsi singkat untuk aksesibilitas dan SEO"
                    className="w-full rounded-[18px] border border-ink-950/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-oasis-500/35 focus:ring-4 focus:ring-oasis-500/10"
                  />
                </label>

                <div className="grid gap-4 md:grid-cols-[160px_minmax(0,1fr)]">
                  <label className="block space-y-2">
                    <span className="text-sm font-semibold text-ink-900">Role</span>
                    <select
                      value={draft.role}
                      onChange={(event) => updateDraft(path, { role: event.target.value as MediaItemRole })}
                      className="w-full rounded-[18px] border border-ink-950/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-oasis-500/35 focus:ring-4 focus:ring-oasis-500/10"
                    >
                      {roleOptions
                        .filter((option) => option.value !== 'all')
                        .map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                    </select>
                  </label>

                  <label className="block space-y-2">
                    <span className="text-sm font-semibold text-ink-900">Tags</span>
                    <div className="relative">
                      <Tags size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-800/34" />
                      <input
                        value={draft.tags}
                        onChange={(event) => updateDraft(path, { tags: event.target.value })}
                        placeholder="hero, outdoor, steam"
                        className="w-full rounded-[18px] border border-ink-950/10 bg-white px-4 py-3 pl-11 text-sm outline-none transition focus:border-oasis-500/35 focus:ring-4 focus:ring-oasis-500/10"
                      />
                    </div>
                  </label>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-oasis-600 transition hover:text-oasis-500"
                  >
                    Buka asset
                    <ExternalLink size={14} />
                  </a>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => handleMetadataSave(item)}
                      disabled={!backendConfigured || isSaving}
                      className="inline-flex items-center gap-2 rounded-full bg-ink-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-ink-900 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                      {isSaving ? 'Menyimpan...' : 'Simpan metadata'}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(item.storagePath)}
                      disabled={!backendConfigured}
                      className="inline-flex items-center gap-2 rounded-full border border-ink-950/10 px-4 py-2 text-sm font-semibold text-ink-950 transition hover:border-copper-400/30 hover:text-copper-500 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Trash2 size={14} />
                      Hapus
                    </button>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </section>

      {filteredItems.length === 0 && (
        <section className="surface-panel px-6 py-14 text-center text-sm text-ink-800/62">
          {deferredQuery.trim() || typeFilter !== 'all' || roleFilter !== 'all'
            ? 'Tidak ada asset yang cocok dengan pencarian atau filter saat ini.'
            : 'Belum ada asset di library.'}
        </section>
      )}
    </div>
  );
}
