create extension if not exists pgcrypto;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'content_status') then
    create type public.content_status as enum ('draft', 'published');
  end if;

  if not exists (select 1 from pg_type where typname = 'content_type') then
    create type public.content_type as enum ('article', 'page', 'announcement');
  end if;

  if not exists (select 1 from pg_type where typname = 'audit_event_type') then
    create type public.audit_event_type as enum (
      'auth.login',
      'auth.logout',
      'content.create',
      'content.update',
      'content.delete',
      'settings.update',
      'media.upload',
      'media.delete'
    );
  end if;
end
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  excerpt text not null,
  content text not null,
  status public.content_status not null default 'draft',
  author text not null default 'Admin CMS',
  type public.content_type not null default 'article',
  cover_image text not null default '',
  seo_title text not null default '',
  seo_description text not null default '',
  featured boolean not null default false,
  published_at timestamptz null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint posts_slug_length check (char_length(slug) between 3 and 180),
  constraint posts_title_length check (char_length(title) between 3 and 180),
  constraint posts_excerpt_length check (char_length(excerpt) between 12 and 600),
  constraint posts_content_length check (char_length(content) >= 20)
);

create index if not exists posts_status_idx on public.posts (status);
create index if not exists posts_featured_idx on public.posts (featured);
create index if not exists posts_published_at_idx on public.posts (published_at desc);
create index if not exists posts_updated_at_idx on public.posts (updated_at desc);

drop trigger if exists posts_set_updated_at on public.posts;
create trigger posts_set_updated_at
before update on public.posts
for each row
execute function public.set_updated_at();

create table if not exists public.site_settings (
  id text primary key,
  site_name text not null,
  site_tagline text not null,
  site_description text not null,
  hero_eyebrow text not null,
  hero_title text not null,
  hero_description text not null,
  booking_url text not null,
  primary_cta_label text not null,
  secondary_cta_label text not null,
  contact_phone text not null,
  contact_email text not null,
  location text not null,
  metrics jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint site_settings_singleton check (id = 'primary'),
  constraint site_settings_metrics_array check (jsonb_typeof(metrics) = 'array')
);

drop trigger if exists site_settings_set_updated_at on public.site_settings;
create trigger site_settings_set_updated_at
before update on public.site_settings
for each row
execute function public.set_updated_at();

insert into public.site_settings (
  id,
  site_name,
  site_tagline,
  site_description,
  hero_eyebrow,
  hero_title,
  hero_description,
  booking_url,
  primary_cta_label,
  secondary_cta_label,
  contact_phone,
  contact_email,
  location,
  metrics
)
values (
  'primary',
  'Banyu Panas Cirebon',
  'Wellness destination for a slower, better weekend',
  'Destinasi air panas alami di Cirebon dengan pengalaman yang lebih tenang, tertata, dan family-friendly.',
  'Wisata Air Panas Premium',
  'Ruang berendam yang lebih hangat, rapi, dan terasa dipercaya.',
  'Kami merapikan pengalaman pengunjung dari tiket, fasilitas, hingga cerita brand agar Banyu Panas Cirebon terasa modern tanpa kehilangan kehangatan lokalnya.',
  '#kontak',
  'Rencanakan Kunjungan',
  'Masuk ke CMS',
  '+62 821-2345-6789',
  'halo@banyupanascirebon.id',
  'Palimanan, Cirebon, Jawa Barat',
  jsonb_build_array(
    jsonb_build_object('label', 'Suhu air alami', 'value', '42°C'),
    jsonb_build_object('label', 'Area wisata', 'value', '5.2 Ha'),
    jsonb_build_object('label', 'Pengunjung / tahun', 'value', '150K+'),
    jsonb_build_object('label', 'Tingkat kepuasan', 'value', '4.8 / 5')
  )
)
on conflict (id) do update
set
  site_name = excluded.site_name,
  site_tagline = excluded.site_tagline,
  site_description = excluded.site_description,
  hero_eyebrow = excluded.hero_eyebrow,
  hero_title = excluded.hero_title,
  hero_description = excluded.hero_description,
  booking_url = excluded.booking_url,
  primary_cta_label = excluded.primary_cta_label,
  secondary_cta_label = excluded.secondary_cta_label,
  contact_phone = excluded.contact_phone,
  contact_email = excluded.contact_email,
  location = excluded.location,
  metrics = excluded.metrics;

create table if not exists public.admin_audit_log (
  id uuid primary key default gen_random_uuid(),
  event_type public.audit_event_type not null,
  actor_email text not null,
  resource_type text not null,
  resource_id text null,
  detail text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists admin_audit_log_created_at_idx on public.admin_audit_log (created_at desc);
create index if not exists admin_audit_log_event_type_idx on public.admin_audit_log (event_type);

alter table public.posts enable row level security;
alter table public.site_settings enable row level security;
alter table public.admin_audit_log enable row level security;

drop policy if exists "Public can read published posts" on public.posts;
create policy "Public can read published posts"
on public.posts
for select
to anon, authenticated
using (status = 'published');

drop policy if exists "Authenticated admins can manage posts" on public.posts;
create policy "Authenticated admins can manage posts"
on public.posts
for all
to authenticated
using (true)
with check (true);

drop policy if exists "Public can read site settings" on public.site_settings;
create policy "Public can read site settings"
on public.site_settings
for select
to anon, authenticated
using (id = 'primary');

drop policy if exists "Authenticated admins can manage site settings" on public.site_settings;
create policy "Authenticated admins can manage site settings"
on public.site_settings
for all
to authenticated
using (true)
with check (true);

drop policy if exists "Authenticated admins can read audit log" on public.admin_audit_log;
create policy "Authenticated admins can read audit log"
on public.admin_audit_log
for select
to authenticated
using (true);

drop policy if exists "Authenticated admins can insert audit log" on public.admin_audit_log;
create policy "Authenticated admins can insert audit log"
on public.admin_audit_log
for insert
to authenticated
with check (true);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'media',
  'media',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public can read media bucket" on storage.objects;
create policy "Public can read media bucket"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'media');

drop policy if exists "Authenticated admins can manage media bucket" on storage.objects;
create policy "Authenticated admins can manage media bucket"
on storage.objects
for all
to authenticated
using (bucket_id = 'media')
with check (bucket_id = 'media');
