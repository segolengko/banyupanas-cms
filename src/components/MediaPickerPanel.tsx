'use client';

import Image from 'next/image';
import { Check, ExternalLink, Image as ImageIcon, Video, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { MediaItem } from '@/types';

type MediaPickerKind = 'image' | 'video';

export default function MediaPickerPanel({
  title,
  description,
  items,
  activeUrl,
  kind,
  onSelect,
  onClear,
  emptyMessage,
  selectLabel,
  activeLabel,
  clearLabel,
}: {
  title: string;
  description: string;
  items: MediaItem[];
  activeUrl: string;
  kind: MediaPickerKind;
  onSelect: (url: string) => void;
  onClear?: () => void;
  emptyMessage: string;
  selectLabel: string;
  activeLabel: string;
  clearLabel: string;
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <span className="text-sm font-semibold text-ink-900">{title}</span>
          <p className="mt-2 text-sm leading-7 text-ink-800/66">{description}</p>
        </div>

        {activeUrl && onClear && (
          <button
            type="button"
            onClick={onClear}
            className="inline-flex items-center gap-2 rounded-full border border-ink-950/10 bg-white px-4 py-2 text-sm font-semibold text-ink-950 transition hover:border-copper-400/35 hover:text-copper-500"
          >
            <X size={15} />
            {clearLabel}
          </button>
        )}
      </div>

      {items.length > 0 ? (
        <div className="grid gap-4 xl:grid-cols-2">
          {items.map((item) => {
            const isActive = activeUrl === item.url;

            return (
              <div
                key={item.id}
                className={cn(
                  'overflow-hidden rounded-[24px] border bg-white/82 p-3 transition',
                  isActive ? 'border-oasis-500/35 ring-4 ring-oasis-500/10' : 'border-ink-950/8',
                )}
              >
                <div className="overflow-hidden rounded-[20px] bg-sand-50">
                  {kind === 'image' ? (
                    <div className="relative aspect-[16/10] w-full">
                      <Image src={item.url} alt={item.alt} fill sizes="(max-width: 1280px) 100vw, 40vw" className="object-cover" />
                    </div>
                  ) : (
                    <video
                      src={item.url}
                      className="aspect-video w-full object-cover"
                      muted
                      playsInline
                      preload="metadata"
                      controls
                    />
                  )}
                </div>

                <div className="space-y-3 px-1 pb-1 pt-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-ink-950">{item.name}</p>
                      <p className="mt-1 text-xs text-ink-800/56">{item.sizeLabel}</p>
                    </div>
                    {isActive && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-oasis-500/10 px-3 py-1 text-xs font-semibold text-oasis-600">
                        <Check size={13} />
                        Aktif
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => onSelect(item.url)}
                      className={cn(
                        'inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition',
                        isActive
                          ? 'bg-oasis-600 text-white'
                          : 'border border-ink-950/10 bg-white text-ink-950 hover:border-oasis-500/35 hover:text-oasis-600',
                      )}
                    >
                      {kind === 'image' ? <ImageIcon size={15} /> : <Video size={15} />}
                      {isActive ? activeLabel : selectLabel}
                    </button>

                    <a
                      href={item.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-full border border-ink-950/10 bg-white px-4 py-2 text-sm font-semibold text-ink-950 transition hover:border-oasis-500/35 hover:text-oasis-600"
                    >
                      Buka file
                      <ExternalLink size={14} />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-[24px] border border-dashed border-ink-950/12 bg-white/68 px-5 py-6 text-sm leading-7 text-ink-800/66">
          {emptyMessage}
        </div>
      )}
    </div>
  );
}
