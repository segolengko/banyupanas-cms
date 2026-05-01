export type ContentStatus = 'draft' | 'published';
export type ContentType = 'article' | 'page' | 'announcement';
export type ThemePreset = 'oasis' | 'mineral' | 'forest' | 'sunset';
export type HeroLayoutStyle = 'immersive' | 'split' | 'editorial';
export type TrustChipStyle = 'soft' | 'outline' | 'solid';
export type HeroMood = 'calm' | 'dramatic' | 'bright';
export type ButtonStyle = 'pill' | 'soft-corner' | 'crisp';
export type SurfaceStyle = 'soft' | 'glass' | 'outlined';
export type AuditEventType =
  | 'auth.login'
  | 'auth.logout'
  | 'content.create'
  | 'content.update'
  | 'content.delete'
  | 'settings.update'
  | 'media.upload'
  | 'media.update'
  | 'media.delete';

export type MediaItemRole = 'general' | 'hero' | 'story-cover' | 'gallery';

export interface ContentItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  status: ContentStatus;
  author: string;
  type: ContentType;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  coverImage: string;
  seoTitle: string;
  seoDescription: string;
  featured: boolean;
}

export interface SiteMetric {
  label: string;
  value: string;
}

export interface TicketOption {
  name: string;
  price: string;
  description: string;
}

export interface SiteSettings {
  siteName: string;
  siteTagline: string;
  siteDescription: string;
  themePreset: ThemePreset;
  heroLayoutStyle: HeroLayoutStyle;
  trustChipStyle: TrustChipStyle;
  heroMood: HeroMood;
  buttonStyle: ButtonStyle;
  surfaceStyle: SurfaceStyle;
  heroEyebrow: string;
  heroTitle: string;
  heroDescription: string;
  heroPosterImage: string;
  heroVideoUrl: string;
  trustChips: string[];
  bookingUrl: string;
  primaryCtaLabel: string;
  secondaryCtaLabel: string;
  contactPhone: string;
  contactEmail: string;
  location: string;
  googleMapsEmbedUrl: string;
  googleMapsPlaceUrl: string;
  instagramUrl: string;
  tiktokUrl: string;
  youtubeUrl: string;
  metrics: SiteMetric[];
  ticketOptions: TicketOption[];
}

export interface MediaItem {
  id: string;
  name: string;
  url: string;
  alt: string;
  type: 'image' | 'video';
  role: MediaItemRole;
  tags: string[];
  sizeLabel: string;
  createdAt: string;
  storagePath?: string;
}

export interface DashboardMetric {
  label: string;
  value: string;
  change: string;
  positive: boolean;
  helper: string;
}

export interface DashboardPipelineItem {
  label: string;
  value: number;
  tone: 'emerald' | 'amber' | 'sky';
}

export interface DashboardActivityItem {
  id: string;
  title: string;
  detail: string;
  time: string;
}

export interface AuditLogItem {
  id: string;
  title: string;
  detail: string;
  time: string;
  actorEmail: string;
  eventType: AuditEventType;
  resourceType: string;
  resourceId: string | null;
  metadata: Record<string, unknown>;
}

export interface DashboardData {
  metrics: DashboardMetric[];
  pipeline: DashboardPipelineItem[];
  activities: DashboardActivityItem[];
}

export interface CmsHealth {
  authConfigured: boolean;
  backendConfigured: boolean;
  mediaConfigured: boolean;
  publicReadConfigured: boolean;
}
