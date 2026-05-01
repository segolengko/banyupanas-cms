'use client';

import Image from 'next/image';
import { useActionState, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { Save, Settings2, ShieldAlert, Sparkles } from 'lucide-react';
import MediaPickerPanel from '@/components/MediaPickerPanel';
import {
  buttonStyleOptions,
  getButtonShapeClassName,
  getHeroMoodOverlayClassName,
  getLightSurfaceClassName,
  getTrustChipClassName,
  heroLayoutOptions,
  heroMoodOptions,
  surfaceStyleOptions,
  trustChipStyleOptions,
} from '@/lib/hero-design';
import { cn } from '@/lib/utils';
import { themePresetOptions } from '@/lib/theme-presets';
import type { MediaItem, SiteSettings } from '@/types';

type FormActionState = {
  status: 'idle' | 'error' | 'demo';
  message?: string;
};

function getPreviewHeroLayoutClasses(style: SiteSettings['heroLayoutStyle']) {
  switch (style) {
    case 'split':
      return {
        wrapper: 'space-y-4',
        heading: 'max-w-[14ch] text-[2rem] leading-tight',
        body: 'max-w-[28ch] text-sm leading-7 text-white/78',
        controls: 'items-start',
        chips: 'justify-start',
        frame: 'max-w-[92%]',
      };
    case 'editorial':
      return {
        wrapper: 'space-y-4 text-center',
        heading: 'mx-auto max-w-[15ch] text-[1.9rem] leading-tight',
        body: 'mx-auto max-w-[30ch] text-sm leading-7 text-white/78',
        controls: 'items-center justify-center',
        chips: 'justify-center',
        frame: 'mx-auto',
      };
    default:
      return {
        wrapper: 'space-y-4',
        heading: 'max-w-[15ch] text-[2rem] leading-tight',
        body: 'max-w-[34ch] text-sm leading-7 text-white/78',
        controls: 'items-start',
        chips: 'justify-start',
        frame: '',
      };
  }
}

function SaveButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center justify-center gap-2 rounded-full bg-ink-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-ink-900 disabled:cursor-not-allowed disabled:opacity-60"
    >
      <Save size={16} />
      {pending ? 'Menyimpan...' : 'Simpan pengaturan'}
    </button>
  );
}

export default function SettingsManager({
  settings,
  mediaItems,
  backendConfigured,
  action,
}: {
  settings: SiteSettings;
  mediaItems: MediaItem[];
  backendConfigured: boolean;
  action: (state: FormActionState, payload: FormData) => Promise<FormActionState>;
}) {
  const [state, formAction] = useActionState(action, { status: 'idle' });
  const [formValues, setFormValues] = useState(settings);
  const availableHeroPosterImages = mediaItems.filter((item) => item.type === 'image');
  const availableHeroVideos = mediaItems.filter((item) => item.type === 'video');
  const visibleTrustChips = formValues.trustChips.filter(Boolean);
  const visibleMetrics = formValues.metrics.filter((metric) => metric.label && metric.value);
  const visibleTicketOptions = formValues.ticketOptions.filter(
    (option) => option.name && option.price && option.description,
  );
  const previewHeroLayout = getPreviewHeroLayoutClasses(formValues.heroLayoutStyle);
  const previewButtonShape = getButtonShapeClassName(formValues.buttonStyle);
  const previewSurfaceClassName = getLightSurfaceClassName(formValues.surfaceStyle);

  function updateField<Key extends keyof SiteSettings>(key: Key, value: SiteSettings[Key]) {
    setFormValues((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function updateMetric(index: number, key: 'label' | 'value', value: string) {
    setFormValues((current) => ({
      ...current,
      metrics: current.metrics.map((metric, metricIndex) =>
        metricIndex === index
          ? {
              ...metric,
              [key]: value,
            }
          : metric,
        ),
    }));
  }

  function updateTrustChip(index: number, value: string) {
    setFormValues((current) => ({
      ...current,
      trustChips: current.trustChips.map((chip, chipIndex) => (chipIndex === index ? value : chip)),
    }));
  }

  function updateTicketOption(index: number, key: 'name' | 'price' | 'description', value: string) {
    setFormValues((current) => ({
      ...current,
      ticketOptions: current.ticketOptions.map((option, optionIndex) =>
        optionIndex === index
          ? {
              ...option,
              [key]: value,
            }
          : option,
      ),
    }));
  }

  return (
    <form
      action={formAction}
      data-theme={formValues.themePreset}
      className="grid gap-6 pb-28 lg:grid-cols-[minmax(0,1fr)_380px] lg:pb-8"
    >
      <input type="hidden" name="themePreset" value={formValues.themePreset} />
      <input type="hidden" name="heroLayoutStyle" value={formValues.heroLayoutStyle} />
      <input type="hidden" name="trustChipStyle" value={formValues.trustChipStyle} />
      <input type="hidden" name="heroMood" value={formValues.heroMood} />
      <input type="hidden" name="buttonStyle" value={formValues.buttonStyle} />
      <input type="hidden" name="surfaceStyle" value={formValues.surfaceStyle} />
      <section className="space-y-6">
        <div className="surface-panel px-6 py-6">
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-oasis-600">Brand Settings</p>
              <h2 className="mt-2 font-display text-4xl text-ink-950">Atur identitas website publik</h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-ink-800/72">
                Halaman ini mengontrol copy utama, CTA, dan detail kontak yang muncul di website publik.
              </p>
            </div>
            <SaveButton />
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

          {!backendConfigured && (
            <div className="mb-6 rounded-[24px] border border-copper-400/16 bg-copper-400/10 px-4 py-4 text-sm leading-7 text-copper-500">
              Backend pengaturan masih berjalan di mode demo. Kamu tetap bisa melihat preview live, tetapi
              penyimpanan permanen membutuhkan backend write yang aktif.
            </div>
          )}

          <div className="grid gap-5 md:grid-cols-2">
            <label className="block space-y-2 md:col-span-2">
              <span className="text-sm font-semibold text-ink-900">Nama situs</span>
              <input
                name="siteName"
                value={formValues.siteName}
                onChange={(event) => updateField('siteName', event.target.value)}
                className="w-full rounded-[22px] border border-ink-950/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-oasis-500/35 focus:ring-4 focus:ring-oasis-500/10"
              />
            </label>

            <label className="block space-y-2 md:col-span-2">
              <span className="text-sm font-semibold text-ink-900">Tagline</span>
              <input
                name="siteTagline"
                value={formValues.siteTagline}
                onChange={(event) => updateField('siteTagline', event.target.value)}
                className="w-full rounded-[22px] border border-ink-950/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-oasis-500/35 focus:ring-4 focus:ring-oasis-500/10"
              />
            </label>

            <label className="block space-y-2 md:col-span-2">
              <span className="text-sm font-semibold text-ink-900">Deskripsi singkat brand</span>
              <textarea
                name="siteDescription"
                rows={4}
                value={formValues.siteDescription}
                onChange={(event) => updateField('siteDescription', event.target.value)}
                className="w-full rounded-[22px] border border-ink-950/10 bg-white px-4 py-3 text-sm leading-7 outline-none transition focus:border-oasis-500/35 focus:ring-4 focus:ring-oasis-500/10"
              />
            </label>

            <div className="space-y-4 md:col-span-2">
              <div>
                <span className="text-sm font-semibold text-ink-900">Preset warna website</span>
                <p className="mt-2 text-sm leading-7 text-ink-800/66">
                  Pilih arah visual utama untuk website publik dan admin. Perubahan ini langsung terasa
                  di preview tanpa perlu simpan dulu.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {themePresetOptions.map((preset) => {
                  const active = formValues.themePreset === preset.value;

                  return (
                    <button
                      key={preset.value}
                      type="button"
                      data-theme={preset.value}
                      onClick={() => updateField('themePreset', preset.value)}
                      className={cn(
                        'rounded-[26px] border p-3 text-left transition',
                        active
                          ? 'border-oasis-500/35 bg-white shadow-[0_18px_50px_rgba(16,33,38,0.08)]'
                          : 'border-ink-950/8 bg-white/82 hover:border-oasis-500/24 hover:bg-white',
                      )}
                    >
                      <div className="theme-preview-shell rounded-[22px] px-4 py-4 text-white shadow-[0_22px_60px_rgba(16,33,38,0.16)]">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-white/88">{preset.label}</p>
                            <p className="mt-2 text-xs leading-6 text-white/72">{preset.description}</p>
                          </div>
                          <span
                            className={cn(
                              'shrink-0 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]',
                              active
                                ? 'border-white/18 bg-white text-ink-950'
                                : 'border-white/18 bg-white/10 text-white/84',
                            )}
                          >
                            {active ? 'Aktif' : 'Pilih'}
                          </span>
                        </div>

                        <div className="mt-5 flex flex-wrap gap-2">
                          {preset.swatches.map((swatch) => (
                            <span
                              key={`${preset.value}-${swatch}`}
                              className="h-8 w-8 rounded-full border border-white/20 shadow-sm"
                              style={{ backgroundColor: swatch }}
                            />
                          ))}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-4 md:col-span-2">
              <div>
                <span className="text-sm font-semibold text-ink-900">Layout hero publik</span>
                <p className="mt-2 text-sm leading-7 text-ink-800/66">
                  Mengatur bagaimana headline, CTA, dan metric disusun di hero landing page tanpa
                  perlu mengubah konten satu per satu.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                {heroLayoutOptions.map((option) => {
                  const active = formValues.heroLayoutStyle === option.value;

                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => updateField('heroLayoutStyle', option.value)}
                      className={cn(
                        'rounded-[24px] border px-4 py-4 text-left transition',
                        active
                          ? 'border-oasis-500/35 bg-oasis-500/8 shadow-[0_16px_40px_rgba(16,33,38,0.06)]'
                          : 'border-ink-950/8 bg-white/82 hover:border-oasis-500/20 hover:bg-white',
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-ink-950">{option.label}</p>
                          <p className="mt-2 text-sm leading-7 text-ink-800/66">{option.description}</p>
                        </div>
                        <span
                          className={cn(
                            'shrink-0 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]',
                            active ? 'bg-oasis-600 text-white' : 'bg-ink-950/6 text-ink-800/58',
                          )}
                        >
                          {active ? 'Aktif' : 'Pilih'}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-4 md:col-span-2">
              <div>
                <span className="text-sm font-semibold text-ink-900">Gaya trust chips</span>
                <p className="mt-2 text-sm leading-7 text-ink-800/66">
                  Mengatur seberapa kuat badge kepercayaan tampil di hero, dari yang halus sampai yang
                  lebih tegas.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                {trustChipStyleOptions.map((option) => {
                  const active = formValues.trustChipStyle === option.value;

                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => updateField('trustChipStyle', option.value)}
                      className={cn(
                        'rounded-[24px] border px-4 py-4 text-left transition',
                        active
                          ? 'border-oasis-500/35 bg-oasis-500/8 shadow-[0_16px_40px_rgba(16,33,38,0.06)]'
                          : 'border-ink-950/8 bg-white/82 hover:border-oasis-500/20 hover:bg-white',
                      )}
                    >
                      <p className="text-sm font-semibold text-ink-950">{option.label}</p>
                      <p className="mt-2 text-sm leading-7 text-ink-800/66">{option.description}</p>
                      <div className="mt-4">
                        <span
                          className={cn(
                            'inline-flex rounded-full px-3 py-1.5 text-xs font-semibold shadow-sm',
                            option.value === 'outline'
                              ? 'border border-ink-950/18 bg-transparent text-ink-950'
                              : option.value === 'solid'
                                ? 'border border-ink-950/0 bg-ink-950 text-white'
                                : 'border border-ink-950/10 bg-ink-950/6 text-ink-950',
                          )}
                        >
                          Contoh chip
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-4 md:col-span-2">
              <div>
                <span className="text-sm font-semibold text-ink-900">Mood overlay hero</span>
                <p className="mt-2 text-sm leading-7 text-ink-800/66">
                  Mengatur seberapa tenang, dalam, atau terang lapisan hero di atas poster atau video.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                {heroMoodOptions.map((option) => {
                  const active = formValues.heroMood === option.value;

                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => updateField('heroMood', option.value)}
                      className={cn(
                        'rounded-[24px] border px-4 py-4 text-left transition',
                        active
                          ? 'border-oasis-500/35 bg-oasis-500/8 shadow-[0_16px_40px_rgba(16,33,38,0.06)]'
                          : 'border-ink-950/8 bg-white/82 hover:border-oasis-500/20 hover:bg-white',
                      )}
                    >
                      <p className="text-sm font-semibold text-ink-950">{option.label}</p>
                      <p className="mt-2 text-sm leading-7 text-ink-800/66">{option.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-4 md:col-span-2">
              <div>
                <span className="text-sm font-semibold text-ink-900">Gaya tombol publik</span>
                <p className="mt-2 text-sm leading-7 text-ink-800/66">
                  Mengatur profil CTA publik agar terasa lebih lembut, modern, atau tegas.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                {buttonStyleOptions.map((option) => {
                  const active = formValues.buttonStyle === option.value;

                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => updateField('buttonStyle', option.value)}
                      className={cn(
                        'rounded-[24px] border px-4 py-4 text-left transition',
                        active
                          ? 'border-oasis-500/35 bg-oasis-500/8 shadow-[0_16px_40px_rgba(16,33,38,0.06)]'
                          : 'border-ink-950/8 bg-white/82 hover:border-oasis-500/20 hover:bg-white',
                      )}
                    >
                      <p className="text-sm font-semibold text-ink-950">{option.label}</p>
                      <p className="mt-2 text-sm leading-7 text-ink-800/66">{option.description}</p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <span
                          className={cn(
                            'inline-flex px-3 py-1.5 text-xs font-semibold',
                            getButtonShapeClassName(option.value),
                            option.value === 'crisp'
                              ? 'bg-ink-950 text-white'
                              : 'bg-oasis-600 text-white',
                          )}
                        >
                          CTA
                        </span>
                        <span
                          className={cn(
                            'inline-flex border px-3 py-1.5 text-xs font-semibold text-ink-950',
                            getButtonShapeClassName(option.value),
                            'border-ink-950/12 bg-white',
                          )}
                        >
                          Secondary
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-4 md:col-span-2">
              <div>
                <span className="text-sm font-semibold text-ink-900">Karakter panel publik</span>
                <p className="mt-2 text-sm leading-7 text-ink-800/66">
                  Mengatur rasa kartu, panel tiket, dan daftar cerita di halaman publik.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                {surfaceStyleOptions.map((option) => {
                  const active = formValues.surfaceStyle === option.value;

                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => updateField('surfaceStyle', option.value)}
                      className={cn(
                        'rounded-[24px] border px-4 py-4 text-left transition',
                        active
                          ? 'border-oasis-500/35 bg-oasis-500/8 shadow-[0_16px_40px_rgba(16,33,38,0.06)]'
                          : 'border-ink-950/8 bg-white/82 hover:border-oasis-500/20 hover:bg-white',
                      )}
                    >
                      <p className="text-sm font-semibold text-ink-950">{option.label}</p>
                      <p className="mt-2 text-sm leading-7 text-ink-800/66">{option.description}</p>
                      <div className="mt-4">
                        <div className={cn('rounded-[18px] border px-4 py-3 text-xs text-ink-800/68', getLightSurfaceClassName(option.value))}>
                          Contoh panel publik
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <label className="block space-y-2 md:col-span-2">
              <span className="text-sm font-semibold text-ink-900">Hero eyebrow</span>
              <input
                name="heroEyebrow"
                value={formValues.heroEyebrow}
                onChange={(event) => updateField('heroEyebrow', event.target.value)}
                className="w-full rounded-[22px] border border-ink-950/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-oasis-500/35 focus:ring-4 focus:ring-oasis-500/10"
              />
            </label>

            <label className="block space-y-2 md:col-span-2">
              <span className="text-sm font-semibold text-ink-900">Hero title</span>
              <textarea
                name="heroTitle"
                rows={3}
                value={formValues.heroTitle}
                onChange={(event) => updateField('heroTitle', event.target.value)}
                className="w-full rounded-[22px] border border-ink-950/10 bg-white px-4 py-3 text-sm leading-7 outline-none transition focus:border-oasis-500/35 focus:ring-4 focus:ring-oasis-500/10"
              />
            </label>

            <label className="block space-y-2 md:col-span-2">
              <span className="text-sm font-semibold text-ink-900">Hero description</span>
              <textarea
                name="heroDescription"
                rows={5}
                value={formValues.heroDescription}
                onChange={(event) => updateField('heroDescription', event.target.value)}
                className="w-full rounded-[22px] border border-ink-950/10 bg-white px-4 py-3 text-sm leading-7 outline-none transition focus:border-oasis-500/35 focus:ring-4 focus:ring-oasis-500/10"
              />
            </label>

            <label className="block space-y-2 md:col-span-2">
              <span className="text-sm font-semibold text-ink-900">Hero poster image</span>
              <input
                name="heroPosterImage"
                value={formValues.heroPosterImage}
                onChange={(event) => updateField('heroPosterImage', event.target.value)}
                placeholder="https://...jpg"
                className="w-full rounded-[22px] border border-ink-950/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-oasis-500/35 focus:ring-4 focus:ring-oasis-500/10"
              />
              <p className="text-sm leading-7 text-ink-800/62">
                Gambar ini menjadi lapisan pertama hero publik dan fallback saat video belum dipakai atau tidak
                bisa autoplay.
              </p>
            </label>

            <div className="md:col-span-2">
              <MediaPickerPanel
                title="Pilih poster dari media library"
                description="Pakai gambar yang sudah diupload ke bucket media untuk menjadi poster hero publik."
                items={availableHeroPosterImages}
                activeUrl={formValues.heroPosterImage}
                kind="image"
                onSelect={(url) => updateField('heroPosterImage', url)}
                onClear={() => updateField('heroPosterImage', '')}
                emptyMessage="Belum ada gambar di media library. Upload dulu dari menu `Media`, lalu kembali ke sini untuk memilih poster hero."
                selectLabel="Pakai sebagai poster"
                activeLabel="Sedang dipakai"
                clearLabel="Lepas poster hero"
              />
            </div>

            <label className="block space-y-2 md:col-span-2">
              <span className="text-sm font-semibold text-ink-900">Hero video URL untuk desktop</span>
              <input
                name="heroVideoUrl"
                value={formValues.heroVideoUrl}
                onChange={(event) => updateField('heroVideoUrl', event.target.value)}
                placeholder="https://...mp4"
                className="w-full rounded-[22px] border border-ink-950/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-oasis-500/35 focus:ring-4 focus:ring-oasis-500/10"
              />
              <p className="text-sm leading-7 text-ink-800/62">
                Video hanya akan dipakai di desktop. Mobile tetap memakai image agar loading lebih ringan.
              </p>
            </label>

            <div className="md:col-span-2">
              <MediaPickerPanel
                title="Pilih video dari media library"
                description="Klik video yang sudah diupload ke bucket media untuk menjadikannya background hero di desktop."
                items={availableHeroVideos}
                activeUrl={formValues.heroVideoUrl}
                kind="video"
                onSelect={(url) => updateField('heroVideoUrl', url)}
                onClear={() => updateField('heroVideoUrl', '')}
                emptyMessage="Belum ada video di media library. Upload dulu dari menu `Media`, lalu kembali ke sini untuk memilihnya sebagai hero."
                selectLabel="Pakai untuk hero"
                activeLabel="Sedang dipakai"
                clearLabel="Lepas video hero"
              />
            </div>

            <div className="space-y-4 md:col-span-2">
              <div>
                <span className="text-sm font-semibold text-ink-900">Trust chips hero</span>
                <p className="mt-2 text-sm leading-7 text-ink-800/66">
                  Label kecil ini membantu pengunjung menangkap nilai penting website dalam beberapa detik.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                {formValues.trustChips.map((chip, index) => (
                  <label key={`trust-chip-${index}`} className="block space-y-2">
                    <span className="text-sm font-semibold text-ink-900">Chip {index + 1}</span>
                    <input
                      name={`trustChip${index}`}
                      value={chip}
                      onChange={(event) => updateTrustChip(index, event.target.value)}
                      className="w-full rounded-[22px] border border-ink-950/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-oasis-500/35 focus:ring-4 focus:ring-oasis-500/10"
                    />
                  </label>
                ))}
              </div>
            </div>

            <label className="block space-y-2">
              <span className="text-sm font-semibold text-ink-900">Primary CTA</span>
              <input
                name="primaryCtaLabel"
                value={formValues.primaryCtaLabel}
                onChange={(event) => updateField('primaryCtaLabel', event.target.value)}
                className="w-full rounded-[22px] border border-ink-950/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-oasis-500/35 focus:ring-4 focus:ring-oasis-500/10"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-semibold text-ink-900">Secondary CTA</span>
              <input
                name="secondaryCtaLabel"
                value={formValues.secondaryCtaLabel}
                onChange={(event) => updateField('secondaryCtaLabel', event.target.value)}
                className="w-full rounded-[22px] border border-ink-950/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-oasis-500/35 focus:ring-4 focus:ring-oasis-500/10"
              />
            </label>

            <label className="block space-y-2 md:col-span-2">
              <span className="text-sm font-semibold text-ink-900">Link CTA utama / fallback anchor</span>
              <input
                name="bookingUrl"
                value={formValues.bookingUrl}
                onChange={(event) => updateField('bookingUrl', event.target.value)}
                className="w-full rounded-[22px] border border-ink-950/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-oasis-500/35 focus:ring-4 focus:ring-oasis-500/10"
              />
              <p className="text-sm leading-7 text-ink-800/62">
                Jika link Google Maps diisi, CTA utama publik akan memprioritaskan Google Maps. Field ini
                dipakai sebagai fallback.
              </p>
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-semibold text-ink-900">Nomor kontak</span>
              <input
                name="contactPhone"
                value={formValues.contactPhone}
                onChange={(event) => updateField('contactPhone', event.target.value)}
                className="w-full rounded-[22px] border border-ink-950/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-oasis-500/35 focus:ring-4 focus:ring-oasis-500/10"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-semibold text-ink-900">Email kontak</span>
              <input
                name="contactEmail"
                value={formValues.contactEmail}
                onChange={(event) => updateField('contactEmail', event.target.value)}
                className="w-full rounded-[22px] border border-ink-950/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-oasis-500/35 focus:ring-4 focus:ring-oasis-500/10"
              />
            </label>

            <label className="block space-y-2 md:col-span-2">
              <span className="text-sm font-semibold text-ink-900">Lokasi</span>
              <input
                name="location"
                value={formValues.location}
                onChange={(event) => updateField('location', event.target.value)}
                className="w-full rounded-[22px] border border-ink-950/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-oasis-500/35 focus:ring-4 focus:ring-oasis-500/10"
              />
            </label>

            <label className="block space-y-2 md:col-span-2">
              <span className="text-sm font-semibold text-ink-900">Google Maps embed URL</span>
              <input
                name="googleMapsEmbedUrl"
                value={formValues.googleMapsEmbedUrl}
                onChange={(event) => updateField('googleMapsEmbedUrl', event.target.value)}
                placeholder="https://www.google.com/maps/embed?..."
                className="w-full rounded-[22px] border border-ink-950/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-oasis-500/35 focus:ring-4 focus:ring-oasis-500/10"
              />
            </label>

            <label className="block space-y-2 md:col-span-2">
              <span className="text-sm font-semibold text-ink-900">Google Maps public link</span>
              <input
                name="googleMapsPlaceUrl"
                value={formValues.googleMapsPlaceUrl}
                onChange={(event) => updateField('googleMapsPlaceUrl', event.target.value)}
                placeholder="https://maps.app.goo.gl/..."
                className="w-full rounded-[22px] border border-ink-950/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-oasis-500/35 focus:ring-4 focus:ring-oasis-500/10"
              />
            </label>

            <div className="space-y-4 md:col-span-2">
              <div>
                <span className="text-sm font-semibold text-ink-900">Link media sosial</span>
                <p className="mt-2 text-sm leading-7 text-ink-800/66">
                  Link ini akan muncul di bagian kontak publik agar pengunjung bisa lanjut ke kanal brand.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <label className="block space-y-2">
                  <span className="text-sm font-semibold text-ink-900">Instagram</span>
                  <input
                    name="instagramUrl"
                    value={formValues.instagramUrl}
                    onChange={(event) => updateField('instagramUrl', event.target.value)}
                    placeholder="https://instagram.com/..."
                    className="w-full rounded-[22px] border border-ink-950/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-oasis-500/35 focus:ring-4 focus:ring-oasis-500/10"
                  />
                </label>

                <label className="block space-y-2">
                  <span className="text-sm font-semibold text-ink-900">TikTok</span>
                  <input
                    name="tiktokUrl"
                    value={formValues.tiktokUrl}
                    onChange={(event) => updateField('tiktokUrl', event.target.value)}
                    placeholder="https://tiktok.com/@..."
                    className="w-full rounded-[22px] border border-ink-950/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-oasis-500/35 focus:ring-4 focus:ring-oasis-500/10"
                  />
                </label>

                <label className="block space-y-2">
                  <span className="text-sm font-semibold text-ink-900">YouTube</span>
                  <input
                    name="youtubeUrl"
                    value={formValues.youtubeUrl}
                    onChange={(event) => updateField('youtubeUrl', event.target.value)}
                    placeholder="https://youtube.com/@..."
                    className="w-full rounded-[22px] border border-ink-950/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-oasis-500/35 focus:ring-4 focus:ring-oasis-500/10"
                  />
                </label>
              </div>
            </div>

            <div className="space-y-4 md:col-span-2">
              <div>
                <span className="text-sm font-semibold text-ink-900">Metric hero publik</span>
                <p className="mt-2 text-sm leading-7 text-ink-800/66">
                  Empat metric ini tampil langsung di halaman publik untuk menegaskan positioning tempat.
                </p>
              </div>

              <div className="grid gap-4">
                {formValues.metrics.map((metric, index) => (
                  <div
                    key={`${index}-${metric.label}`}
                    className="grid gap-4 rounded-[24px] border border-ink-950/8 bg-sand-50/70 p-4 md:grid-cols-[1.1fr_0.9fr]"
                  >
                    <label className="block space-y-2">
                      <span className="text-sm font-semibold text-ink-900">Label metric {index + 1}</span>
                      <input
                        name={`metricLabel${index}`}
                        value={metric.label}
                        onChange={(event) => updateMetric(index, 'label', event.target.value)}
                        className="w-full rounded-[18px] border border-ink-950/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-oasis-500/35 focus:ring-4 focus:ring-oasis-500/10"
                      />
                    </label>

                    <label className="block space-y-2">
                      <span className="text-sm font-semibold text-ink-900">Value metric {index + 1}</span>
                      <input
                        name={`metricValue${index}`}
                        value={metric.value}
                        onChange={(event) => updateMetric(index, 'value', event.target.value)}
                        className="w-full rounded-[18px] border border-ink-950/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-oasis-500/35 focus:ring-4 focus:ring-oasis-500/10"
                      />
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4 md:col-span-2">
              <div>
                <span className="text-sm font-semibold text-ink-900">Jenis dan harga tiket</span>
                <p className="mt-2 text-sm leading-7 text-ink-800/66">
                  Atur nama tiket, harga, dan deskripsi singkat yang ingin ditampilkan.
                </p>
              </div>

              <div className="grid gap-4">
                {formValues.ticketOptions.map((option, index) => (
                  <div
                    key={`ticket-option-${index}`}
                    className="grid gap-4 rounded-[24px] border border-ink-950/8 bg-sand-50/70 p-4"
                  >
                    <div className="grid gap-4 md:grid-cols-[1fr_220px]">
                      <label className="block space-y-2">
                        <span className="text-sm font-semibold text-ink-900">Nama tiket {index + 1}</span>
                        <input
                          name={`ticketName${index}`}
                          value={option.name}
                          onChange={(event) => updateTicketOption(index, 'name', event.target.value)}
                          className="w-full rounded-[18px] border border-ink-950/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-oasis-500/35 focus:ring-4 focus:ring-oasis-500/10"
                        />
                      </label>

                      <label className="block space-y-2">
                        <span className="text-sm font-semibold text-ink-900">Harga tiket {index + 1}</span>
                        <input
                          name={`ticketPrice${index}`}
                          value={option.price}
                          onChange={(event) => updateTicketOption(index, 'price', event.target.value)}
                          className="w-full rounded-[18px] border border-ink-950/10 bg-white px-4 py-3 text-sm outline-none transition focus:border-oasis-500/35 focus:ring-4 focus:ring-oasis-500/10"
                        />
                      </label>
                    </div>

                    <label className="block space-y-2">
                      <span className="text-sm font-semibold text-ink-900">Deskripsi tiket {index + 1}</span>
                      <textarea
                        name={`ticketDescription${index}`}
                        rows={3}
                        value={option.description}
                        onChange={(event) => updateTicketOption(index, 'description', event.target.value)}
                        className="w-full rounded-[18px] border border-ink-950/10 bg-white px-4 py-3 text-sm leading-7 outline-none transition focus:border-oasis-500/35 focus:ring-4 focus:ring-oasis-500/10"
                      />
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <aside className="space-y-6">
        <section className="surface-panel overflow-hidden">
          <div className="border-b border-ink-950/8 px-5 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-copper-500">Preview</p>
            <h3 className="mt-2 font-display text-3xl text-ink-950">Hero website publik</h3>
          </div>

            <div className="space-y-5 p-5">
              <div
                className={cn(
                  'theme-preview-shell relative overflow-hidden rounded-[28px] p-5 text-white shadow-[0_25px_60px_rgba(16,33,38,0.18)]',
                  previewHeroLayout.frame,
                )}
              >
                {formValues.heroPosterImage && (
                  <>
                    <Image
                      src={formValues.heroPosterImage}
                      alt={formValues.siteName || 'Hero poster'}
                      fill
                      sizes="(max-width: 1024px) 100vw, 420px"
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,16,18,0.2)_0%,rgba(8,16,18,0.58)_100%)]" />
                    <div className={cn('absolute inset-0', getHeroMoodOverlayClassName(formValues.heroMood))} />
                  </>
                )}
                <div className={cn('relative', previewHeroLayout.wrapper)}>
                  {formValues.heroEyebrow && (
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/68">
                      {formValues.heroEyebrow}
                    </p>
                  )}
                  <h4 className={cn('mt-3 font-display', previewHeroLayout.heading)}>
                    {formValues.heroTitle || 'Hero publik belum diisi'}
                  </h4>
                  <p className={cn('mt-4', previewHeroLayout.body)}>
                    {formValues.heroDescription || 'Isi judul, deskripsi, dan CTA dari panel kiri untuk memulai trial.'}
                  </p>
                  {visibleTrustChips.length > 0 && (
                    <div className={cn('mt-4 flex flex-wrap gap-2', previewHeroLayout.chips)}>
                      {visibleTrustChips.map((chip) => (
                        <span
                          key={chip}
                          className={cn(
                            'rounded-full border px-3 py-1.5 text-xs font-semibold',
                            getTrustChipClassName(formValues.trustChipStyle),
                          )}
                        >
                          {chip}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className={cn('mt-6 flex flex-wrap gap-3', previewHeroLayout.controls)}>
                    <span
                      className={cn(
                        'bg-white px-4 py-2 text-sm font-semibold text-ink-950',
                        previewButtonShape,
                      )}
                    >
                      {formValues.primaryCtaLabel}
                    </span>
                    <span
                      className={cn(
                        'border border-white/20 px-4 py-2 text-sm font-semibold text-white',
                        previewButtonShape,
                      )}
                    >
                      {formValues.secondaryCtaLabel}
                    </span>
                  </div>
                </div>
              </div>

            <div className={cn('rounded-[24px] border p-4', previewSurfaceClassName)}>
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink-950">
                <Settings2 size={16} className="text-oasis-600" />
                Detail kontak
              </div>
              <div className="space-y-2 text-sm leading-7 text-ink-800/72">
                <p>{formValues.contactPhone}</p>
                <p>{formValues.contactEmail}</p>
                <p>{formValues.location}</p>
              </div>
            </div>

            <div className={cn('rounded-[24px] border p-4', previewSurfaceClassName)}>
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink-950">
                <Sparkles size={16} className="text-oasis-600" />
                Map & sosial
              </div>
              <div className="space-y-2 text-sm leading-7 text-ink-800/72">
                <p>{formValues.googleMapsEmbedUrl ? 'Embed map aktif' : 'Embed map belum diisi'}</p>
                <p>{formValues.googleMapsPlaceUrl ? 'Link Google Maps aktif' : 'Link Google Maps belum diisi'}</p>
                <p>
                  {[
                    formValues.instagramUrl && 'Instagram',
                    formValues.tiktokUrl && 'TikTok',
                    formValues.youtubeUrl && 'YouTube',
                  ]
                    .filter(Boolean)
                    .join(' / ') || 'Belum ada link sosial aktif'}
                </p>
              </div>
            </div>

            <div className={cn('rounded-[24px] border p-4', previewSurfaceClassName)}>
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink-950">
                <Sparkles size={16} className="text-oasis-600" />
                Media hero
              </div>
              <div className="space-y-2 text-sm leading-7 text-ink-800/72">
                <p>{formValues.heroPosterImage ? 'Poster hero aktif' : 'Poster hero mengikuti fallback sistem'}</p>
                <p>{formValues.heroVideoUrl ? 'Video desktop aktif' : 'Hero berjalan dengan image saja'}</p>
                {formValues.heroPosterImage && (
                  <p className="break-all text-ink-800/58">{formValues.heroPosterImage}</p>
                )}
                {formValues.heroVideoUrl && (
                  <p className="break-all text-ink-800/58">{formValues.heroVideoUrl}</p>
                )}
              </div>
            </div>

            <div className={cn('rounded-[24px] border p-4', previewSurfaceClassName)}>
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink-950">
                <Sparkles size={16} className="text-copper-500" />
                Metric publik
              </div>
              {visibleMetrics.length > 0 ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  {visibleMetrics.map((metric) => (
                    <div
                      key={`${metric.label}-${metric.value}`}
                      className={cn('rounded-[20px] border px-4 py-4', previewSurfaceClassName)}
                    >
                      <p className="font-display text-2xl text-ink-950">{metric.value}</p>
                      <p className="mt-1 text-sm leading-6 text-ink-800/66">{metric.label}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm leading-7 text-ink-800/66">Belum ada metric publik yang diisi.</p>
              )}
            </div>

            <div className={cn('rounded-[24px] border p-4', previewSurfaceClassName)}>
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink-950">
                <Sparkles size={16} className="text-copper-500" />
                Harga tiket
              </div>
              {visibleTicketOptions.length > 0 ? (
                <div className="space-y-3">
                  {visibleTicketOptions.map((option) => (
                    <div
                      key={`${option.name}-${option.price}`}
                      className={cn('rounded-[20px] border px-4 py-4', previewSurfaceClassName)}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-ink-950">{option.name}</p>
                          <p className="mt-1 text-sm leading-6 text-ink-800/66">{option.description}</p>
                        </div>
                        <p className="font-display text-xl text-oasis-700">{option.price}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm leading-7 text-ink-800/66">Belum ada jenis tiket yang diisi.</p>
              )}
            </div>
          </div>
        </section>
      </aside>
    </form>
  );
}
