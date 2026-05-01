import 'server-only';

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { assertTrustedRequestOrigin, isInvalidRequestOriginError } from '@/lib/auth/request-guard';
import { isAuthConfigured, requireSession } from '@/lib/auth/session';
import { defaultSiteSettings, mockContentItems, mockDashboardData, mockMediaItems } from '@/lib/cms/mock-data';
import {
  normalizeButtonStyle,
  normalizeHeroLayoutStyle,
  normalizeHeroMood,
  normalizeSurfaceStyle,
  normalizeTrustChipStyle,
} from '@/lib/hero-design';
import {
  sanitizeExternalProfileUrl,
  sanitizeGoogleMapsEmbedUrl,
  sanitizeGoogleMapsPlaceUrl,
  sanitizeMediaAssetUrl,
  sanitizePublicLinkUrl,
} from '@/lib/url-safety';
import { slugify } from '@/lib/utils';
import type {
  AuditLogItem,
  AuditEventType,
  CmsHealth,
  ContentItem,
  DashboardActivityItem,
  DashboardData,
  MediaItem,
  MediaItemRole,
  SiteMetric,
  SiteSettings,
  TicketOption,
  ThemePreset,
} from '@/types';

export type FormActionState = {
  status: 'idle' | 'error' | 'demo';
  message?: string;
};

type AuditMetadata = Record<string, string | number | boolean | null | undefined>;
type StorageListEntry = {
  name: string;
  id: string | null;
  created_at?: string | null;
  metadata?: {
    mimetype?: string;
    size?: number;
  } | null;
};
type StorageFileEntry = StorageListEntry & {
  fullPath: string;
};
type MediaAssetMetadataRow = {
  storage_path: string;
  alt_text?: string | null;
  role?: string | null;
  tags?: unknown;
};

function getSupabaseUrl() {
  return process.env.SUPABASE_URL || '';
}

function getSupabaseServiceRoleKey() {
  return process.env.SUPABASE_SERVICE_ROLE_KEY || '';
}

function getSupabaseAnonKey() {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
}

export function isCmsBackendConfigured() {
  return Boolean(getSupabaseUrl() && getSupabaseServiceRoleKey());
}

export function isCmsPublicReadConfigured() {
  return Boolean(getSupabaseUrl() && getSupabaseAnonKey());
}

export function getSupabaseAdmin() {
  return createClient(getSupabaseUrl(), getSupabaseServiceRoleKey(), {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export function getSupabasePublic() {
  return createClient(getSupabaseUrl(), getSupabaseAnonKey(), {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

function getPublishedAt(status: ContentItem['status'], currentValue: string | null) {
  if (status !== 'published') {
    return null;
  }

  return currentValue || new Date().toISOString();
}

function revalidateContentSurface(slugs: string[]) {
  revalidatePath('/');
  revalidatePath('/stories');
  revalidatePath('/admin');
  revalidatePath('/admin/content');

  for (const slug of slugs) {
    revalidatePath(`/stories/${slug}`);
  }
}

function normalizeMetrics(input: unknown): SiteMetric[] {
  const fallback = defaultSiteSettings.metrics;

  if (!Array.isArray(input)) {
    return fallback;
  }

  return fallback.map((defaultMetric, index) => {
    const candidate = input[index];

    if (!candidate || typeof candidate !== 'object') {
      return defaultMetric;
    }

    const label = String((candidate as { label?: unknown }).label || '').trim();
    const value = String((candidate as { value?: unknown }).value || '').trim();

    if (!label || !value) {
      return defaultMetric;
    }

    return {
      label,
      value,
    };
  });
}

function normalizeTrustChips(input: unknown): string[] {
  const fallback = defaultSiteSettings.trustChips;

  if (!Array.isArray(input)) {
    return fallback;
  }

  return fallback.map((defaultChip, index) => {
    const candidate = input[index];
    const value = typeof candidate === 'string' ? candidate.trim() : '';

    return value || defaultChip;
  });
}

function normalizeTicketOptions(input: unknown): TicketOption[] {
  const fallback = defaultSiteSettings.ticketOptions;

  if (!Array.isArray(input)) {
    return fallback;
  }

  return fallback.map((defaultOption, index) => {
    const candidate = input[index];

    if (!candidate || typeof candidate !== 'object') {
      return defaultOption;
    }

    const name = String((candidate as { name?: unknown }).name || '').trim();
    const price = String((candidate as { price?: unknown }).price || '').trim();
    const description = String((candidate as { description?: unknown }).description || '').trim();

    if (!name || !price || !description) {
      return defaultOption;
    }

    return {
      name,
      price,
      description,
    };
  });
}

function normalizeMediaTags(input: unknown): string[] {
  if (!Array.isArray(input)) {
    return [];
  }

  return input
    .map((item) => String(item || '').trim())
    .filter(Boolean)
    .slice(0, 8);
}

function normalizeMediaRole(input: unknown): MediaItemRole {
  const value = String(input || '').trim();

  switch (value) {
    case 'hero':
    case 'story-cover':
    case 'gallery':
      return value;
    default:
      return 'general';
  }
}

function normalizeThemePreset(input: unknown): ThemePreset {
  switch (String(input || '').trim()) {
    case 'mineral':
    case 'forest':
    case 'sunset':
      return String(input) as ThemePreset;
    default:
      return 'oasis';
  }
}

function pushInvalidUrlLabel(
  rawValue: string,
  sanitizedValue: string,
  label: string,
  collector: string[],
) {
  if (rawValue && !sanitizedValue) {
    collector.push(label);
  }
}

function getDefaultMediaAlt(fileName: string) {
  return fileName
    .replace(/\.[a-z0-9]+$/i, '')
    .replace(/[-_]+/g, ' ')
    .trim();
}

function normalizeContentRow(row: Record<string, unknown>): ContentItem {
  return {
    id: String(row.id || ''),
    title: String(row.title || ''),
    slug: String(row.slug || ''),
    excerpt: String(row.excerpt || ''),
    content: String(row.content || ''),
    status: (row.status as ContentItem['status']) || 'draft',
    author: String(row.author || 'Admin CMS'),
    type: (row.type as ContentItem['type']) || 'article',
    createdAt: String(row.created_at || new Date().toISOString()),
    updatedAt: String(row.updated_at || new Date().toISOString()),
    publishedAt: row.published_at ? String(row.published_at) : null,
    coverImage: String(row.cover_image || '').trim(),
    seoTitle: String(row.seo_title || row.title || ''),
    seoDescription: String(row.seo_description || row.excerpt || ''),
    featured: Boolean(row.featured),
  };
}

function isStorageFolder(entry: StorageListEntry) {
  return !entry.id && !entry.metadata;
}

function normalizeSettingsRow(row: Record<string, unknown>): SiteSettings {
  const primaryCtaLabel = String(row.primary_cta_label || '').trim();
  const secondaryCtaLabel = String(row.secondary_cta_label || '').trim();

  return {
    siteName: String(row.site_name || defaultSiteSettings.siteName),
    siteTagline: String(row.site_tagline || defaultSiteSettings.siteTagline),
    siteDescription: String(row.site_description || defaultSiteSettings.siteDescription),
    themePreset: normalizeThemePreset(row.theme_preset),
    heroLayoutStyle: normalizeHeroLayoutStyle(row.hero_layout_style),
    trustChipStyle: normalizeTrustChipStyle(row.trust_chip_style),
    heroMood: normalizeHeroMood(row.hero_mood),
    buttonStyle: normalizeButtonStyle(row.button_style),
    surfaceStyle: normalizeSurfaceStyle(row.surface_style),
    heroEyebrow: String(row.hero_eyebrow || defaultSiteSettings.heroEyebrow),
    heroTitle: String(row.hero_title || defaultSiteSettings.heroTitle),
    heroDescription: String(row.hero_description || defaultSiteSettings.heroDescription),
    heroPosterImage: sanitizeMediaAssetUrl(
      String(row.hero_poster_image || defaultSiteSettings.heroPosterImage),
    ),
    heroVideoUrl: sanitizeMediaAssetUrl(String(row.hero_video_url || defaultSiteSettings.heroVideoUrl)),
    trustChips: normalizeTrustChips(row.hero_trust_chips),
    bookingUrl: sanitizePublicLinkUrl(String(row.booking_url || defaultSiteSettings.bookingUrl)),
    primaryCtaLabel:
      !primaryCtaLabel || primaryCtaLabel === 'Rencanakan Kunjungan'
        ? defaultSiteSettings.primaryCtaLabel
        : primaryCtaLabel,
    secondaryCtaLabel:
      !secondaryCtaLabel || secondaryCtaLabel === 'Masuk ke CMS'
        ? defaultSiteSettings.secondaryCtaLabel
        : secondaryCtaLabel,
    contactPhone: String(row.contact_phone || defaultSiteSettings.contactPhone),
    contactEmail: String(row.contact_email || defaultSiteSettings.contactEmail),
    location: String(row.location || defaultSiteSettings.location),
    googleMapsEmbedUrl: sanitizeGoogleMapsEmbedUrl(
      String(row.google_maps_embed_url || defaultSiteSettings.googleMapsEmbedUrl),
    ),
    googleMapsPlaceUrl: sanitizeGoogleMapsPlaceUrl(
      String(row.google_maps_place_url || defaultSiteSettings.googleMapsPlaceUrl),
    ),
    instagramUrl: sanitizeExternalProfileUrl(String(row.instagram_url || defaultSiteSettings.instagramUrl)),
    tiktokUrl: sanitizeExternalProfileUrl(String(row.tiktok_url || defaultSiteSettings.tiktokUrl)),
    youtubeUrl: sanitizeExternalProfileUrl(String(row.youtube_url || defaultSiteSettings.youtubeUrl)),
    metrics: normalizeMetrics(row.metrics),
    ticketOptions: normalizeTicketOptions(row.ticket_options),
  };
}

function sortPublishedItems(items: ContentItem[]) {
  return [...items].sort((left, right) => {
    if (left.featured !== right.featured) {
      return left.featured ? -1 : 1;
    }

    const leftTime = new Date(left.publishedAt || left.updatedAt).getTime();
    const rightTime = new Date(right.publishedAt || right.updatedAt).getTime();

    return rightTime - leftTime;
  });
}

function getMetricInputPairs(formData: FormData): SiteMetric[] {
  return defaultSiteSettings.metrics.map((defaultMetric, index) => {
    const rawLabel = formData.get(`metricLabel${index}`);
    const rawValue = formData.get(`metricValue${index}`);

    return {
      label: rawLabel === null ? defaultMetric.label : String(rawLabel).trim(),
      value: rawValue === null ? defaultMetric.value : String(rawValue).trim(),
    };
  });
}

function getTrustChipInputPairs(formData: FormData): string[] {
  return defaultSiteSettings.trustChips.map((defaultChip, index) => {
    const rawValue = formData.get(`trustChip${index}`);

    return rawValue === null ? defaultChip : String(rawValue).trim();
  });
}

function getTicketOptionInputPairs(formData: FormData): TicketOption[] {
  return defaultSiteSettings.ticketOptions.map((defaultOption, index) => {
    const rawName = formData.get(`ticketName${index}`);
    const rawPrice = formData.get(`ticketPrice${index}`);
    const rawDescription = formData.get(`ticketDescription${index}`);

    return {
      name: rawName === null ? defaultOption.name : String(rawName).trim(),
      price: rawPrice === null ? defaultOption.price : String(rawPrice).trim(),
      description: rawDescription === null ? defaultOption.description : String(rawDescription).trim(),
    };
  });
}

function isBlankMetric(metric: SiteMetric) {
  return !metric.label && !metric.value;
}

function isIncompleteMetric(metric: SiteMetric) {
  return !isBlankMetric(metric) && (!metric.label || !metric.value);
}

function isBlankTicketOption(option: TicketOption) {
  return !option.name && !option.price && !option.description;
}

function isIncompleteTicketOption(option: TicketOption) {
  return !isBlankTicketOption(option) && (!option.name || !option.price || !option.description);
}

function formatAuditTime(value: string) {
  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Jakarta',
  }).format(new Date(value));
}

function getAuditTitle(eventType: AuditEventType) {
  switch (eventType) {
    case 'auth.login':
      return 'Admin login berhasil';
    case 'auth.logout':
      return 'Admin logout';
    case 'content.create':
      return 'Konten baru dibuat';
    case 'content.update':
      return 'Konten diperbarui';
    case 'content.delete':
      return 'Konten dihapus';
    case 'settings.update':
      return 'Pengaturan website diperbarui';
    case 'media.upload':
      return 'Aset media diunggah';
    case 'media.update':
      return 'Metadata media diperbarui';
    case 'media.delete':
      return 'Aset media dihapus';
    default:
      return 'Aktivitas admin';
  }
}

function normalizeAuditLogRow(row: Record<string, unknown>): AuditLogItem {
  const eventType = String(row.event_type || 'auth.login') as AuditEventType;
  const actorEmail = String(row.actor_email || 'admin');
  const detail = String(row.detail || '').trim();

  return {
    id: String(row.id || `${eventType}-${row.created_at || Date.now()}`),
    title: getAuditTitle(eventType),
    detail: detail || `Aksi ${eventType} dijalankan oleh ${actorEmail}.`,
    time: formatAuditTime(String(row.created_at || new Date().toISOString())),
    actorEmail,
    eventType,
    resourceType: String(row.resource_type || 'unknown'),
    resourceId: row.resource_id ? String(row.resource_id) : null,
    metadata:
      row.metadata && typeof row.metadata === 'object' && !Array.isArray(row.metadata)
        ? (row.metadata as Record<string, unknown>)
        : {},
  };
}

function normalizeAuditRows(rows: Array<Record<string, unknown>>): DashboardActivityItem[] {
  return rows.map((row) => {
    const item = normalizeAuditLogRow(row);

    return {
      id: item.id,
      title: item.title,
      detail: item.detail,
      time: item.time,
    };
  });
}

export async function recordAuditEvent({
  eventType,
  actorEmail,
  resourceType,
  resourceId,
  detail,
  metadata = {},
}: {
  eventType: AuditEventType;
  actorEmail: string;
  resourceType: string;
  resourceId?: string | null;
  detail: string;
  metadata?: AuditMetadata;
}) {
  if (!isCmsBackendConfigured()) {
    return;
  }

  const supabase = getSupabaseAdmin();
  await supabase.from('admin_audit_log').insert({
    event_type: eventType,
    actor_email: actorEmail,
    resource_type: resourceType,
    resource_id: resourceId || null,
    detail,
    metadata,
  });
}

export async function getCmsHealth(): Promise<CmsHealth> {
  return {
    authConfigured: isAuthConfigured(),
    backendConfigured: isCmsBackendConfigured(),
    mediaConfigured: isCmsBackendConfigured(),
    publicReadConfigured: isCmsPublicReadConfigured(),
  };
}

export async function getSiteSettings(scope: 'public' | 'admin' = 'public'): Promise<SiteSettings> {
  const useAdminClient = scope === 'admin';
  const canReadFromSupabase = useAdminClient ? isCmsBackendConfigured() : isCmsPublicReadConfigured();

  if (!canReadFromSupabase) {
    return defaultSiteSettings;
  }

  const supabase = useAdminClient ? getSupabaseAdmin() : getSupabasePublic();
  const { data } = await supabase.from('site_settings').select('*').eq('id', 'primary').maybeSingle();

  if (!data) {
    return defaultSiteSettings;
  }

  return normalizeSettingsRow(data);
}

export async function getDashboardData(): Promise<DashboardData> {
  if (!isCmsBackendConfigured()) {
    return mockDashboardData;
  }

  const supabase = getSupabaseAdmin();
  const [publishedResult, draftResult, mediaItems, auditResult] = await Promise.all([
    supabase.from('posts').select('*', { head: true, count: 'exact' }).eq('status', 'published'),
    supabase.from('posts').select('*', { head: true, count: 'exact' }).eq('status', 'draft'),
    listMediaItems(),
    supabase.from('admin_audit_log').select('*').order('created_at', { ascending: false }).limit(5),
  ]);

  return {
    metrics: [
      {
        label: 'Konten terbit',
        value: String(publishedResult.count || 0),
        change: 'Live',
        positive: true,
        helper: 'langsung dari Supabase',
      },
      {
        label: 'Draft aktif',
        value: String(draftResult.count || 0),
        change: 'Live',
        positive: true,
        helper: 'siap dipublikasikan',
      },
      {
        label: 'Aset media',
        value: String(mediaItems.length || 0),
        change: 'Live',
        positive: true,
        helper: 'isi bucket media',
      },
      {
        label: 'Audit event',
        value: String(auditResult.data?.length || 0),
        change: 'Latest',
        positive: true,
        helper: '5 aktivitas admin terakhir',
      },
    ],
    pipeline: [],
    activities: auditResult.data?.length ? normalizeAuditRows(auditResult.data) : [],
  };
}

export async function listContentItems(): Promise<ContentItem[]> {
  if (!isCmsBackendConfigured()) {
    return mockContentItems;
  }

  const supabase = getSupabaseAdmin();
  const { data } = await supabase.from('posts').select('*').order('updated_at', { ascending: false });

  if (!data?.length) {
    return [];
  }

  return data.map((row) => normalizeContentRow(row));
}

export async function listPublishedContentItems(limit?: number): Promise<ContentItem[]> {
  if (!isCmsPublicReadConfigured()) {
    const items = sortPublishedItems(mockContentItems.filter((item) => item.status === 'published'));
    return typeof limit === 'number' ? items.slice(0, limit) : items;
  }

  const supabase = getSupabasePublic();
  let query = supabase
    .from('posts')
    .select('*')
    .eq('status', 'published')
    .order('featured', { ascending: false })
    .order('published_at', { ascending: false })
    .order('updated_at', { ascending: false });

  if (typeof limit === 'number') {
    query = query.limit(limit);
  }

  const { data } = await query;

  if (!data?.length) {
    return [];
  }

  return data.map((row) => normalizeContentRow(row));
}

export async function getContentItemBySlug(slug: string) {
  if (!isCmsBackendConfigured()) {
    return mockContentItems.find((item) => item.slug === slug) || null;
  }

  const supabase = getSupabaseAdmin();
  const { data } = await supabase.from('posts').select('*').eq('slug', slug).maybeSingle();

  if (!data) {
    return null;
  }

  return normalizeContentRow(data);
}

export async function getPublishedContentItemBySlug(slug: string) {
  if (!isCmsPublicReadConfigured()) {
    return mockContentItems.find((item) => item.slug === slug && item.status === 'published') || null;
  }

  const supabase = getSupabasePublic();
  const { data } = await supabase
    .from('posts')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle();

  if (!data) {
    return null;
  }

  return normalizeContentRow(data);
}

export async function listMediaItems(): Promise<MediaItem[]> {
  if (!isCmsBackendConfigured()) {
    return mockMediaItems;
  }

  const supabase = getSupabaseAdmin();
  const storage = supabase.storage.from('media');

  async function collectFiles(prefix = ''): Promise<StorageFileEntry[]> {
    const { data } = await storage.list(prefix, {
      limit: 200,
      sortBy: { column: 'created_at', order: 'desc' },
    });

    if (!data?.length) {
      return [];
    }

    const files: StorageFileEntry[] = [];

    for (const entry of data as StorageListEntry[]) {
      if (entry.name === '.emptyFolderPlaceholder') {
        continue;
      }

      const fullPath = prefix ? `${prefix}/${entry.name}` : entry.name;

      if (isStorageFolder(entry)) {
        const nestedFiles = await collectFiles(fullPath);
        files.push(...nestedFiles);
        continue;
      }

      files.push({
        ...entry,
        fullPath,
      });
    }

    return files;
  }

  const files = await collectFiles();

  if (!files.length) {
    return [];
  }

  const metadataByPath = new Map<string, MediaAssetMetadataRow>();

  const { data: metadataRows } = await supabase
    .from('media_assets')
    .select('storage_path, alt_text, role, tags')
    .in(
      'storage_path',
      files.map((file) => file.fullPath),
    );

  for (const row of metadataRows || []) {
    metadataByPath.set(String(row.storage_path), row as MediaAssetMetadataRow);
  }

  return files
    .sort((left, right) => {
      const leftTime = new Date(left.created_at || 0).getTime();
      const rightTime = new Date(right.created_at || 0).getTime();

      return rightTime - leftTime;
    })
    .map((file) => {
      const {
        data: { publicUrl },
      } = storage.getPublicUrl(file.fullPath);
      const metadata = metadataByPath.get(file.fullPath);
      const fileName = file.fullPath.split('/').pop() || file.fullPath;

      return {
        id: file.id || file.fullPath,
        name: fileName,
        url: publicUrl,
        alt: String(metadata?.alt_text || getDefaultMediaAlt(fileName)),
        type: file.metadata?.mimetype?.startsWith('video/') ? 'video' : 'image',
        role: normalizeMediaRole(metadata?.role),
        tags: normalizeMediaTags(metadata?.tags),
        sizeLabel: file.metadata?.size
          ? `${(file.metadata.size / (1024 * 1024)).toFixed(2)} MB`
          : 'Unknown',
        createdAt: file.created_at || new Date().toISOString(),
        storagePath: file.fullPath,
      } satisfies MediaItem;
    });
}

export async function listAuditLogItems(limit = 100): Promise<AuditLogItem[]> {
  if (!isCmsBackendConfigured()) {
    return [];
  }

  const supabase = getSupabaseAdmin();
  const { data } = await supabase.from('admin_audit_log').select('*').order('created_at', { ascending: false }).limit(limit);

  if (!data?.length) {
    return [];
  }

  return data.map((row) => normalizeAuditLogRow(row));
}

export async function saveContentAction(_: FormActionState, formData: FormData): Promise<FormActionState> {
  'use server';

  try {
    await assertTrustedRequestOrigin();
  } catch (error) {
    if (isInvalidRequestOriginError(error)) {
      return {
        status: 'error',
        message: 'Origin request tidak valid.',
      };
    }

    throw error;
  }

  const session = await requireSession();
  const title = String(formData.get('title') || '').trim();
  const rawSlug = String(formData.get('slug') || '').trim();
  const originalSlug = String(formData.get('originalSlug') || '').trim();
  const excerpt = String(formData.get('excerpt') || '').trim();
  const content = String(formData.get('content') || '').trim();
  const status = (String(formData.get('status') || 'draft') as ContentItem['status']) || 'draft';
  const author = String(formData.get('author') || 'Admin CMS').trim();
  const type = (String(formData.get('type') || 'article') as ContentItem['type']) || 'article';
  const coverImage = String(formData.get('coverImage') || '').trim();
  const seoTitle = String(formData.get('seoTitle') || '').trim();
  const seoDescription = String(formData.get('seoDescription') || '').trim();
  const id = String(formData.get('id') || '').trim();
  const featured = formData.get('featured') === 'on';
  const existingPublishedAt = String(formData.get('publishedAt') || '').trim() || null;
  const slug = slugify(rawSlug || title);

  if (!title || !slug || !excerpt || !content) {
    return {
      status: 'error',
      message: 'Judul, slug, ringkasan, dan isi utama wajib diisi.',
    };
  }

  if (!isCmsBackendConfigured()) {
    return {
      status: 'demo',
      message:
        'Mode demo aktif. Hubungkan SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY untuk menyimpan perubahan dengan aman di server.',
    };
  }

  const supabase = getSupabaseAdmin();
  const payload = {
    title,
    slug,
    excerpt,
    content,
    status,
    author,
    type,
    cover_image: coverImage,
    seo_title: seoTitle || title,
    seo_description: seoDescription || excerpt,
    featured,
    published_at: getPublishedAt(status, existingPublishedAt),
  };

  const result = id
    ? await supabase.from('posts').update(payload).eq('id', id).select('id, slug, title').single()
    : await supabase
        .from('posts')
        .insert(payload)
        .select('id, slug, title')
        .single();

  if (result.error) {
    return {
      status: 'error',
      message: result.error.message,
    };
  }

  await recordAuditEvent({
    eventType: id ? 'content.update' : 'content.create',
    actorEmail: session.email,
    resourceType: 'post',
    resourceId: String(result.data.id),
    detail: `${id ? 'Memperbarui' : 'Membuat'} konten "${result.data.title}" (${result.data.slug}).`,
    metadata: {
      slug: String(result.data.slug),
      status,
      featured,
      type,
    },
  });

  const slugsToRevalidate = [String(result.data.slug)];

  if (originalSlug && originalSlug !== result.data.slug) {
    slugsToRevalidate.push(originalSlug);
  }

  revalidateContentSurface(slugsToRevalidate);

  redirect('/admin/content');
}

export async function deleteContentAction(formData: FormData) {
  'use server';

  try {
    await assertTrustedRequestOrigin();
  } catch (error) {
    if (isInvalidRequestOriginError(error)) {
      return;
    }

    throw error;
  }

  const session = await requireSession();
  const id = String(formData.get('id') || '').trim();
  const slug = String(formData.get('slug') || '').trim();
  const title = String(formData.get('title') || '').trim();

  if (!id || !slug) {
    return;
  }

  if (!isCmsBackendConfigured()) {
    return;
  }

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from('posts').delete().eq('id', id);

  if (error) {
    return;
  }

  await recordAuditEvent({
    eventType: 'content.delete',
    actorEmail: session.email,
    resourceType: 'post',
    resourceId: id,
    detail: `Menghapus konten "${title || slug}" (${slug}).`,
    metadata: {
      slug,
    },
  });

  revalidateContentSurface([slug]);
}

export async function bulkContentAction(_: FormActionState, formData: FormData): Promise<FormActionState> {
  'use server';

  try {
    await assertTrustedRequestOrigin();
  } catch (error) {
    if (isInvalidRequestOriginError(error)) {
      return {
        status: 'error',
        message: 'Origin request tidak valid.',
      };
    }

    throw error;
  }

  const session = await requireSession();
  const intent = String(formData.get('intent') || '').trim();
  const ids = Array.from(
    new Set(
      formData
        .getAll('ids')
        .map((value) => String(value).trim())
        .filter(Boolean),
    ),
  );

  if (!ids.length) {
    return {
      status: 'error',
      message: 'Pilih minimal satu konten sebelum menjalankan bulk action.',
    };
  }

  if (!['publish', 'draft', 'delete'].includes(intent)) {
    return {
      status: 'error',
      message: 'Aksi bulk tidak dikenali.',
    };
  }

  if (!isCmsBackendConfigured()) {
    return {
      status: 'demo',
      message:
        'Mode demo aktif. Hubungkan SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY untuk menjalankan bulk action dengan aman.',
    };
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('posts')
    .select('id, slug, title, status, published_at')
    .in('id', ids);

  if (error) {
    return {
      status: 'error',
      message: error.message,
    };
  }

  const items =
    data?.map((row) => ({
      id: String(row.id || ''),
      slug: String(row.slug || ''),
      title: String(row.title || ''),
      status: (row.status as ContentItem['status']) || 'draft',
      publishedAt: row.published_at ? String(row.published_at) : null,
    })) || [];

  if (!items.length) {
    return {
      status: 'error',
      message: 'Konten yang dipilih tidak ditemukan.',
    };
  }

  if (intent === 'delete') {
    const { error: deleteError } = await supabase.from('posts').delete().in('id', items.map((item) => item.id));

    if (deleteError) {
      return {
        status: 'error',
        message: deleteError.message,
      };
    }

    for (const item of items) {
      await recordAuditEvent({
        eventType: 'content.delete',
        actorEmail: session.email,
        resourceType: 'post',
        resourceId: item.id,
        detail: `Menghapus konten "${item.title || item.slug}" (${item.slug}) lewat bulk action.`,
        metadata: {
          slug: item.slug,
          mode: 'bulk',
        },
      });
    }

    revalidateContentSurface(items.map((item) => item.slug));

    return {
      status: 'idle',
      message: `${items.length} konten berhasil dihapus.`,
    };
  }

  const nextStatus = intent === 'publish' ? 'published' : 'draft';
  const changedItems = items.filter((item) => item.status !== nextStatus);

  if (!changedItems.length) {
    return {
      status: 'idle',
      message:
        nextStatus === 'published'
          ? 'Semua konten terpilih sudah berstatus published.'
          : 'Semua konten terpilih sudah berstatus draft.',
    };
  }

  for (const item of changedItems) {
    const { error: updateError } = await supabase
      .from('posts')
      .update({
        status: nextStatus,
        published_at: getPublishedAt(nextStatus, item.publishedAt),
      })
      .eq('id', item.id);

    if (updateError) {
      return {
        status: 'error',
        message: updateError.message,
      };
    }

    await recordAuditEvent({
      eventType: 'content.update',
      actorEmail: session.email,
      resourceType: 'post',
      resourceId: item.id,
      detail: `Mengubah status konten "${item.title || item.slug}" (${item.slug}) menjadi ${nextStatus} lewat bulk action.`,
      metadata: {
        slug: item.slug,
        status: nextStatus,
        mode: 'bulk',
      },
    });
  }

  revalidateContentSurface(changedItems.map((item) => item.slug));

  return {
    status: 'idle',
    message:
      nextStatus === 'published'
        ? `${changedItems.length} konten berhasil dipublikasikan.`
        : `${changedItems.length} konten berhasil dipindahkan ke draft.`,
  };
}

export async function saveSiteSettingsAction(
  _: FormActionState,
  formData: FormData,
): Promise<FormActionState> {
  'use server';

  try {
    await assertTrustedRequestOrigin();
  } catch (error) {
    if (isInvalidRequestOriginError(error)) {
      return {
        status: 'error',
        message: 'Origin request tidak valid.',
      };
    }

    throw error;
  }

  const session = await requireSession();
  const metrics = getMetricInputPairs(formData);
  const trustChips = getTrustChipInputPairs(formData);
  const ticketOptions = getTicketOptionInputPairs(formData);
  const rawHeroPosterImage = String(formData.get('heroPosterImage') || '').trim();
  const rawHeroVideoUrl = String(formData.get('heroVideoUrl') || '').trim();
  const rawBookingUrl = String(formData.get('bookingUrl') || '').trim();
  const rawGoogleMapsEmbedUrl = String(formData.get('googleMapsEmbedUrl') || '').trim();
  const rawGoogleMapsPlaceUrl = String(formData.get('googleMapsPlaceUrl') || '').trim();
  const rawInstagramUrl = String(formData.get('instagramUrl') || '').trim();
  const rawTiktokUrl = String(formData.get('tiktokUrl') || '').trim();
  const rawYoutubeUrl = String(formData.get('youtubeUrl') || '').trim();
  const heroPosterImage = sanitizeMediaAssetUrl(rawHeroPosterImage);
  const heroVideoUrl = sanitizeMediaAssetUrl(rawHeroVideoUrl);
  const bookingUrl = sanitizePublicLinkUrl(rawBookingUrl);
  const googleMapsEmbedUrl = sanitizeGoogleMapsEmbedUrl(rawGoogleMapsEmbedUrl);
  const googleMapsPlaceUrl = sanitizeGoogleMapsPlaceUrl(rawGoogleMapsPlaceUrl);
  const instagramUrl = sanitizeExternalProfileUrl(rawInstagramUrl);
  const tiktokUrl = sanitizeExternalProfileUrl(rawTiktokUrl);
  const youtubeUrl = sanitizeExternalProfileUrl(rawYoutubeUrl);
  const populatedMetrics = metrics.filter((metric) => !isBlankMetric(metric));
  const populatedTrustChips = trustChips.filter(Boolean);
  const populatedTicketOptions = ticketOptions.filter((option) => !isBlankTicketOption(option));
  const invalidUrlLabels: string[] = [];
  const payload = {
    id: 'primary',
    site_name: String(formData.get('siteName') || '').trim(),
    site_tagline: String(formData.get('siteTagline') || '').trim(),
    site_description: String(formData.get('siteDescription') || '').trim(),
    theme_preset: normalizeThemePreset(formData.get('themePreset')),
    hero_layout_style: normalizeHeroLayoutStyle(formData.get('heroLayoutStyle')),
    trust_chip_style: normalizeTrustChipStyle(formData.get('trustChipStyle')),
    hero_mood: normalizeHeroMood(formData.get('heroMood')),
    button_style: normalizeButtonStyle(formData.get('buttonStyle')),
    surface_style: normalizeSurfaceStyle(formData.get('surfaceStyle')),
    hero_eyebrow: String(formData.get('heroEyebrow') || '').trim(),
    hero_title: String(formData.get('heroTitle') || '').trim(),
    hero_description: String(formData.get('heroDescription') || '').trim(),
    hero_poster_image: heroPosterImage,
    hero_video_url: heroVideoUrl,
    hero_trust_chips: populatedTrustChips,
    booking_url: bookingUrl,
    primary_cta_label: String(formData.get('primaryCtaLabel') || '').trim(),
    secondary_cta_label: String(formData.get('secondaryCtaLabel') || '').trim(),
    contact_phone: String(formData.get('contactPhone') || '').trim(),
    contact_email: String(formData.get('contactEmail') || '').trim(),
    location: String(formData.get('location') || '').trim(),
    google_maps_embed_url: googleMapsEmbedUrl,
    google_maps_place_url: googleMapsPlaceUrl,
    instagram_url: instagramUrl,
    tiktok_url: tiktokUrl,
    youtube_url: youtubeUrl,
    metrics: populatedMetrics,
    ticket_options: populatedTicketOptions,
  };

  pushInvalidUrlLabel(rawHeroPosterImage, heroPosterImage, 'Hero poster image', invalidUrlLabels);
  pushInvalidUrlLabel(rawHeroVideoUrl, heroVideoUrl, 'Hero video URL', invalidUrlLabels);
  pushInvalidUrlLabel(rawBookingUrl, bookingUrl, 'CTA / booking URL', invalidUrlLabels);
  pushInvalidUrlLabel(
    rawGoogleMapsEmbedUrl,
    googleMapsEmbedUrl,
    'Google Maps embed URL',
    invalidUrlLabels,
  );
  pushInvalidUrlLabel(
    rawGoogleMapsPlaceUrl,
    googleMapsPlaceUrl,
    'Google Maps place URL',
    invalidUrlLabels,
  );
  pushInvalidUrlLabel(rawInstagramUrl, instagramUrl, 'Instagram URL', invalidUrlLabels);
  pushInvalidUrlLabel(rawTiktokUrl, tiktokUrl, 'TikTok URL', invalidUrlLabels);
  pushInvalidUrlLabel(rawYoutubeUrl, youtubeUrl, 'YouTube URL', invalidUrlLabels);

  if (metrics.some(isIncompleteMetric)) {
    return {
      status: 'error',
      message: 'Lengkapi atau kosongkan penuh setiap metric hero sebelum menyimpan.',
    };
  }

  if (ticketOptions.some(isIncompleteTicketOption)) {
    return {
      status: 'error',
      message: 'Lengkapi atau kosongkan penuh setiap jenis tiket sebelum menyimpan.',
    };
  }

  if (invalidUrlLabels.length > 0) {
    return {
      status: 'error',
      message: `Periksa format URL berikut: ${invalidUrlLabels.join(', ')}.`,
    };
  }

  if (!isCmsBackendConfigured()) {
    return {
      status: 'demo',
      message:
        'Mode demo aktif. Hubungkan backend Supabase agar perubahan identitas website bisa disimpan dengan aman.',
    };
  }

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from('site_settings').upsert(payload);

  if (error) {
    return {
      status: 'error',
      message: error.message,
    };
  }

  await recordAuditEvent({
    eventType: 'settings.update',
    actorEmail: session.email,
    resourceType: 'site_settings',
    resourceId: 'primary',
    detail: 'Memperbarui identitas website, CTA, trust chips, kontak, dan harga tiket publik.',
    metadata: {
      siteName: payload.site_name,
      themePreset: payload.theme_preset,
      heroLayoutStyle: payload.hero_layout_style,
      trustChipStyle: payload.trust_chip_style,
      heroMood: payload.hero_mood,
      buttonStyle: payload.button_style,
      surfaceStyle: payload.surface_style,
      contactEmail: payload.contact_email,
      heroPosterImage: payload.hero_poster_image || null,
      heroVideoUrl: payload.hero_video_url || null,
      googleMapsEmbedUrl: payload.google_maps_embed_url || null,
      googleMapsPlaceUrl: payload.google_maps_place_url || null,
      trustChipCount: payload.hero_trust_chips.length,
      ticketOptionCount: payload.ticket_options.length,
    },
  });

  revalidatePath('/');
  revalidatePath('/stories');
  revalidatePath('/admin');
  revalidatePath('/admin/settings');

  return {
    status: 'idle',
    message: 'Pengaturan website berhasil diperbarui.',
  };
}
