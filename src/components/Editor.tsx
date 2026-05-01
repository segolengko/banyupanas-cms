'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useActionState, useEffect, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { ArrowLeft, ExternalLink, Eye, Save, ShieldAlert, Sparkles } from 'lucide-react';
import MediaPickerPanel from '@/components/MediaPickerPanel';
import { cn, slugify } from '@/lib/utils';
import type { ContentItem, MediaItem } from '@/types';

type FormActionState = {
  status: 'idle' | 'error' | 'demo';
  message?: string;
};

function SaveButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center justify-center gap-2 rounded-full bg-ink-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-ink-900 disabled:cursor-not-allowed disabled:opacity-60"
    >
      <Save size={16} />
      {pending ? 'Menyimpan...' : 'Simpan perubahan'}
    </button>
  );
}

export default function Editor({
  item,
  mediaItems,
  action,
}: {
  item: ContentItem;
  mediaItems: MediaItem[];
  action: (state: FormActionState, payload: FormData) => Promise<FormActionState>;
}) {
  const [state, formAction] = useActionState(action, { status: 'idle' });
  const [title, setTitle] = useState(item.title);
  const [slug, setSlug] = useState(item.slug);
  const [slugTouched, setSlugTouched] = useState(Boolean(item.id));
  const [excerpt, setExcerpt] = useState(item.excerpt);
  const [content, setContent] = useState(item.content);
  const [coverImage, setCoverImage] = useState(item.coverImage);
  const [seoTitle, setSeoTitle] = useState(item.seoTitle);
  const [seoDescription, setSeoDescription] = useState(item.seoDescription);
  const availableCoverImages = mediaItems.filter((mediaItem) => mediaItem.type === 'image');

  useEffect(() => {
    if (!slugTouched) {
      setSlug(slugify(title));
    }
  }, [slugTouched, title]);

  return (
    <form action={formAction} className="grid gap-6 pb-28 lg:grid-cols-[minmax(0,1fr)_360px] lg:pb-8">
      <input type="hidden" name="id" value={item.id} />
      <input type="hidden" name="originalSlug" value={item.slug} />
      <input type="hidden" name="publishedAt" value={item.publishedAt || ''} />

      <section className="space-y-6">
        <div className="surface-panel px-6 py-6">
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-3">
              <Link
                href="/admin/content"
                className="inline-flex items-center gap-2 text-sm font-semibold text-oasis-600 transition hover:text-oasis-500"
              >
                <ArrowLeft size={16} />
                Kembali ke daftar konten
              </Link>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-copper-500">
                  Editor
                </p>
                <h2 className="mt-2 font-display text-4xl text-ink-950">
                  {item.id ? 'Perbarui konten' : 'Buat konten baru'}
                </h2>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {item.id && (
                <Link
                  href={`/admin/content/preview/${item.slug}`}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-ink-950/10 bg-white px-5 py-3 text-sm font-semibold text-ink-950 transition hover:border-oasis-500/30 hover:text-oasis-600"
                >
                  <Eye size={16} />
                  Preview admin
                </Link>
              )}
              {item.id && item.status === 'published' && (
                <Link
                  href={`/stories/${item.slug}`}
                  target="_blank"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-ink-950/10 bg-white px-5 py-3 text-sm font-semibold text-ink-950 transition hover:border-oasis-500/30 hover:text-oasis-600"
                >
                  <ExternalLink size={16} />
                  Buka publik
                </Link>
              )}
              <SaveButton />
            </div>
          </div>

          {state.message && (
            <div
              className={cn(
                'mb-6 flex items-start gap-3 rounded-[24px] px-4 py-4 text-sm leading-7',
                state.status === 'error'
                  ? 'border border-copper-400/18 bg-copper-400/10 text-copper-500'
                  : 'border border-oasis-500/18 bg-oasis-500/10 text-oasis-600',
              )}
            >
              {state.status === 'error' ? (
                <ShieldAlert size={18} className="mt-1 shrink-0" />
              ) : (
                <Sparkles size={18} className="mt-1 shrink-0" />
              )}
              <p>{state.message}</p>
            </div>
          )}

          <div className="space-y-6">
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-ink-900">Judul konten</span>
              <input
                name="title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Masukkan judul utama..."
                className="w-full rounded-[28px] border border-ink-950/10 bg-white px-5 py-4 text-2xl font-semibold text-ink-950 outline-none transition placeholder:text-ink-800/30 focus:border-oasis-500/35 focus:ring-4 focus:ring-oasis-500/10"
              />
            </label>

            <div className="grid gap-5 md:grid-cols-2">
              <label className="block space-y-2">
                <span className="text-sm font-semibold text-ink-900">Slug publik</span>
                <input
                  name="slug"
                  value={slug}
                  onChange={(event) => {
                    setSlugTouched(true);
                    setSlug(slugify(event.target.value));
                  }}
                  placeholder="slug-konten"
                  className="w-full rounded-[22px] border border-ink-950/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-oasis-500/35 focus:ring-4 focus:ring-oasis-500/10"
                />
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-semibold text-ink-900">Penulis</span>
                <input
                  name="author"
                  defaultValue={item.author || 'Admin CMS'}
                  placeholder="Nama editor"
                  className="w-full rounded-[22px] border border-ink-950/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-oasis-500/35 focus:ring-4 focus:ring-oasis-500/10"
                />
              </label>
            </div>

            <label className="block space-y-2">
              <span className="text-sm font-semibold text-ink-900">Ringkasan</span>
              <textarea
                name="excerpt"
                value={excerpt}
                onChange={(event) => setExcerpt(event.target.value)}
                rows={4}
                placeholder="Tulis ringkasan singkat untuk listing dan meta preview..."
                className="w-full rounded-[24px] border border-ink-950/10 bg-white px-4 py-4 text-sm leading-7 outline-none transition placeholder:text-ink-800/30 focus:border-oasis-500/35 focus:ring-4 focus:ring-oasis-500/10"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-semibold text-ink-900">Isi utama</span>
              <textarea
                name="content"
                value={content}
                onChange={(event) => setContent(event.target.value)}
                rows={18}
                placeholder="Tulis isi konten lengkap di sini..."
                className="custom-scrollbar min-h-[420px] w-full rounded-[30px] border border-ink-950/10 bg-white px-5 py-5 text-sm leading-8 outline-none transition placeholder:text-ink-800/30 focus:border-oasis-500/35 focus:ring-4 focus:ring-oasis-500/10"
              />
            </label>
          </div>
        </div>
      </section>

      <aside className="space-y-6">
        <section className="surface-panel px-5 py-5">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-oasis-600">
            Publish Settings
          </p>

          <div className="mt-5 space-y-4">
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-ink-900">Status</span>
              <select
                name="status"
                defaultValue={item.status}
                className="w-full rounded-[20px] border border-ink-950/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-oasis-500/35 focus:ring-4 focus:ring-oasis-500/10"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-semibold text-ink-900">Tipe konten</span>
              <select
                name="type"
                defaultValue={item.type}
                className="w-full rounded-[20px] border border-ink-950/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-oasis-500/35 focus:ring-4 focus:ring-oasis-500/10"
              >
                <option value="article">Article</option>
                <option value="page">Page</option>
                <option value="announcement">Announcement</option>
              </select>
            </label>

            <label className="flex items-center gap-3 rounded-[22px] border border-ink-950/10 bg-white px-4 py-3">
              <input
                type="checkbox"
                name="featured"
                defaultChecked={item.featured}
                className="h-4 w-4 rounded border-ink-950/20 text-oasis-600 focus:ring-oasis-500/20"
              />
              <span className="text-sm font-semibold text-ink-950">Tandai sebagai featured content</span>
            </label>
          </div>
        </section>

        <section className="surface-panel px-5 py-5">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-copper-500">Visual & SEO</p>

          <div className="mt-5 space-y-4">
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-ink-900">Cover image URL</span>
              <input
                name="coverImage"
                value={coverImage}
                onChange={(event) => setCoverImage(event.target.value)}
                placeholder="https://..."
                className="w-full rounded-[20px] border border-ink-950/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-oasis-500/35 focus:ring-4 focus:ring-oasis-500/10"
              />
            </label>

            <MediaPickerPanel
              title="Pilih cover dari media library"
              description="Pakai gambar yang sudah diupload ke bucket media untuk menjadi cover artikel, page, atau announcement."
              items={availableCoverImages}
              activeUrl={coverImage}
              kind="image"
              onSelect={setCoverImage}
              onClear={() => setCoverImage('')}
              emptyMessage="Belum ada gambar di media library. Upload dulu dari menu `Media`, lalu kembali ke sini untuk memilih cover."
              selectLabel="Pakai sebagai cover"
              activeLabel="Sedang dipakai"
              clearLabel="Lepas cover"
            />

            <label className="block space-y-2">
              <span className="text-sm font-semibold text-ink-900">SEO title</span>
              <input
                name="seoTitle"
                value={seoTitle}
                onChange={(event) => setSeoTitle(event.target.value)}
                placeholder="Title untuk search engine"
                className="w-full rounded-[20px] border border-ink-950/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-oasis-500/35 focus:ring-4 focus:ring-oasis-500/10"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-semibold text-ink-900">SEO description</span>
              <textarea
                name="seoDescription"
                value={seoDescription}
                onChange={(event) => setSeoDescription(event.target.value)}
                rows={5}
                placeholder="Deskripsi untuk preview search engine"
                className="w-full rounded-[20px] border border-ink-950/10 bg-white px-4 py-3 text-sm leading-7 outline-none transition focus:border-oasis-500/35 focus:ring-4 focus:ring-oasis-500/10"
              />
            </label>
          </div>
        </section>

        <section className="surface-panel px-5 py-5">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-oasis-600">Preview URL</p>
          <div className="mt-4 rounded-[22px] bg-ink-950 px-4 py-4 text-sm leading-7 text-white/76">
            <p className="font-semibold text-white">{title || 'Konten baru'}</p>
            <p className="mt-2 break-all text-white/60">/stories/{slug || 'slug-konten'}</p>
          </div>

          {item.id ? (
            <div className="mt-4 rounded-[22px] border border-ink-950/10 bg-white px-4 py-4 text-sm leading-7 text-ink-800/70">
              <p className="font-semibold text-ink-950">Workflow review</p>
              <p className="mt-2">
                Gunakan preview admin untuk meninjau layout cerita tanpa harus membuka halaman publik. Jika status
                sudah published, tombol versi publik akan muncul di atas.
              </p>
            </div>
          ) : (
            <div className="mt-4 rounded-[22px] border border-dashed border-ink-950/12 bg-white px-4 py-4 text-sm leading-7 text-ink-800/62">
              Simpan konten ini dulu untuk membuka preview admin yang stabil.
            </div>
          )}

          {coverImage ? (
            <div className="relative mt-4 aspect-[16/10] overflow-hidden rounded-[22px] border border-ink-950/10 bg-sand-50">
              <Image
                src={coverImage}
                alt={title || 'Preview cover'}
                fill
                sizes="(max-width: 1024px) 100vw, 360px"
                className="object-cover"
              />
            </div>
          ) : (
            <div className="mt-4 rounded-[22px] border border-dashed border-ink-950/12 bg-white px-4 py-4 text-sm leading-7 text-ink-800/62">
              Cover image belum dipilih.
            </div>
          )}

          <div className="mt-4 rounded-[22px] border border-ink-950/10 bg-white px-4 py-4 text-sm leading-7 text-ink-800/70">
            Editor sekarang diarahkan untuk submit ke server action. Ini menjaga operasi simpan tetap berada
            di backend boundary, bukan di browser pengguna.
          </div>
        </section>
      </aside>
    </form>
  );
}
