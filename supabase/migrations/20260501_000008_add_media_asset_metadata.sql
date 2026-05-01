do $$
begin
  alter type public.audit_event_type add value if not exists 'media.update';
exception
  when duplicate_object then null;
end
$$;

create table if not exists public.media_assets (
  storage_path text primary key,
  alt_text text not null default '',
  role text not null default 'general',
  tags jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint media_assets_role_check check (role in ('general', 'hero', 'story-cover', 'gallery')),
  constraint media_assets_tags_array_check check (jsonb_typeof(tags) = 'array')
);

drop trigger if exists media_assets_set_updated_at on public.media_assets;
create trigger media_assets_set_updated_at
before update on public.media_assets
for each row
execute function public.set_updated_at();

alter table public.media_assets enable row level security;

drop policy if exists "Authenticated admins can manage media metadata" on public.media_assets;
create policy "Authenticated admins can manage media metadata"
on public.media_assets
for all
to authenticated
using (true)
with check (true);
