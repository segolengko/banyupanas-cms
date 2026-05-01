alter table public.site_settings
add column if not exists theme_preset text not null default 'oasis';

alter table public.site_settings
drop constraint if exists site_settings_theme_preset_check;

alter table public.site_settings
add constraint site_settings_theme_preset_check
check (theme_preset in ('oasis', 'mineral', 'forest', 'sunset'));

update public.site_settings
set theme_preset = case
  when theme_preset in ('oasis', 'mineral', 'forest', 'sunset') then theme_preset
  else 'oasis'
end;
