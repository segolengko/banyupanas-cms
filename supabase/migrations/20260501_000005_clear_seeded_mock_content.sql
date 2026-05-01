update public.site_settings
set
  site_tagline = '',
  site_description = '',
  hero_eyebrow = '',
  hero_title = '',
  hero_description = '',
  hero_video_url = '',
  hero_trust_chips = '[]'::jsonb,
  booking_url = '#kontak',
  primary_cta_label = 'Lihat Map',
  secondary_cta_label = 'Harga Tiket',
  contact_phone = '',
  contact_email = '',
  location = '',
  google_maps_embed_url = '',
  google_maps_place_url = '',
  instagram_url = '',
  tiktok_url = '',
  youtube_url = '',
  metrics = '[]'::jsonb,
  ticket_options = '[]'::jsonb
where id = 'primary';
