create table if not exists public.admin_login_attempts (
  client_key text primary key,
  failure_count integer not null default 0,
  window_started_at timestamptz not null default timezone('utc', now()),
  locked_until timestamptz null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint admin_login_attempts_failure_count_check check (failure_count >= 0)
);

drop trigger if exists admin_login_attempts_set_updated_at on public.admin_login_attempts;
create trigger admin_login_attempts_set_updated_at
before update on public.admin_login_attempts
for each row
execute function public.set_updated_at();

alter table public.admin_login_attempts enable row level security;

drop policy if exists "Authenticated admins can manage posts" on public.posts;
drop policy if exists "Authenticated admins can manage site settings" on public.site_settings;
drop policy if exists "Authenticated admins can read audit log" on public.admin_audit_log;
drop policy if exists "Authenticated admins can insert audit log" on public.admin_audit_log;
drop policy if exists "Authenticated admins can manage media bucket" on storage.objects;
drop policy if exists "Authenticated admins can manage media metadata" on public.media_assets;
