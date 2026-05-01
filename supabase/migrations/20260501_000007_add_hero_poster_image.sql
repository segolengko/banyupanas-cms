alter table public.site_settings
add column if not exists hero_poster_image text not null default '';

update public.site_settings
set hero_poster_image = coalesce(hero_poster_image, '');
