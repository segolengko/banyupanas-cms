create table if not exists public.admin_sessions (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  role text not null default 'admin',
  expires_at timestamptz not null,
  revoked_at timestamptz null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint admin_sessions_role_check check (role in ('admin'))
);

create index if not exists admin_sessions_email_idx on public.admin_sessions (email);
create index if not exists admin_sessions_expires_at_idx on public.admin_sessions (expires_at desc);
create index if not exists admin_sessions_revoked_at_idx on public.admin_sessions (revoked_at);

drop trigger if exists admin_sessions_set_updated_at on public.admin_sessions;
create trigger admin_sessions_set_updated_at
before update on public.admin_sessions
for each row
execute function public.set_updated_at();

alter table public.admin_sessions enable row level security;
