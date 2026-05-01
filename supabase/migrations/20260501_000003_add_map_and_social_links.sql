alter table public.site_settings
add column if not exists google_maps_embed_url text not null default '',
add column if not exists google_maps_place_url text not null default '',
add column if not exists instagram_url text not null default '',
add column if not exists tiktok_url text not null default '',
add column if not exists youtube_url text not null default '';

update public.site_settings
set
  google_maps_embed_url = coalesce(google_maps_embed_url, ''),
  google_maps_place_url = coalesce(google_maps_place_url, ''),
  instagram_url = coalesce(instagram_url, ''),
  tiktok_url = coalesce(tiktok_url, ''),
  youtube_url = coalesce(youtube_url, '');
