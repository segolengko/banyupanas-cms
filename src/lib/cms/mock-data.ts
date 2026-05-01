import type { ContentItem, DashboardData, MediaItem, SiteSettings } from '@/types';

export const defaultSiteSettings: SiteSettings = {
  siteName: '',
  siteTagline: '',
  siteDescription: '',
  themePreset: 'oasis',
  heroLayoutStyle: 'immersive',
  trustChipStyle: 'soft',
  heroMood: 'calm',
  buttonStyle: 'pill',
  surfaceStyle: 'soft',
  heroEyebrow: '',
  heroTitle: '',
  heroDescription: '',
  heroPosterImage: '',
  heroVideoUrl: '',
  trustChips: ['', '', ''],
  bookingUrl: '#kontak',
  primaryCtaLabel: 'Lihat Map',
  secondaryCtaLabel: 'Harga Tiket',
  contactPhone: '',
  contactEmail: '',
  location: '',
  googleMapsEmbedUrl: '',
  googleMapsPlaceUrl: '',
  instagramUrl: '',
  tiktokUrl: '',
  youtubeUrl: '',
  metrics: [
    { label: '', value: '' },
    { label: '', value: '' },
    { label: '', value: '' },
    { label: '', value: '' },
  ],
  ticketOptions: [
    {
      name: '',
      price: '',
      description: '',
    },
    {
      name: '',
      price: '',
      description: '',
    },
    {
      name: '',
      price: '',
      description: '',
    },
    {
      name: '',
      price: '',
      description: '',
    },
  ],
};

export const mockContentItems: ContentItem[] = [];

export const mockMediaItems: MediaItem[] = [];

export const mockDashboardData: DashboardData = {
  metrics: [
    {
      label: 'Konten terbit',
      value: '0',
      change: '0',
      positive: true,
      helper: 'belum ada data publik',
    },
    {
      label: 'Draft aktif',
      value: '0',
      change: '0',
      positive: true,
      helper: 'belum ada draft',
    },
    {
      label: 'Aset media',
      value: '0',
      change: '0',
      positive: true,
      helper: 'library masih kosong',
    },
    {
      label: 'Aktivitas audit',
      value: '0',
      change: '0',
      positive: true,
      helper: 'belum ada aktivitas tercatat',
    },
  ],
  pipeline: [],
  activities: [],
};
