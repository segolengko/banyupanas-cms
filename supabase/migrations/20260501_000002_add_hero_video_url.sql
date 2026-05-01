alter table public.site_settings
add column if not exists hero_video_url text not null default '';

update public.site_settings
set hero_video_url = ''
where hero_video_url is null;
