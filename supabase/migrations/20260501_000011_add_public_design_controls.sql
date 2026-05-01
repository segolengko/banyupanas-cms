alter table public.site_settings
add column if not exists hero_mood text not null default 'calm',
add column if not exists button_style text not null default 'pill',
add column if not exists surface_style text not null default 'soft';

alter table public.site_settings
drop constraint if exists site_settings_hero_mood_check;

alter table public.site_settings
add constraint site_settings_hero_mood_check
check (hero_mood in ('calm', 'dramatic', 'bright'));

alter table public.site_settings
drop constraint if exists site_settings_button_style_check;

alter table public.site_settings
add constraint site_settings_button_style_check
check (button_style in ('pill', 'soft-corner', 'crisp'));

alter table public.site_settings
drop constraint if exists site_settings_surface_style_check;

alter table public.site_settings
add constraint site_settings_surface_style_check
check (surface_style in ('soft', 'glass', 'outlined'));

update public.site_settings
set
  hero_mood = case
    when hero_mood in ('calm', 'dramatic', 'bright') then hero_mood
    else 'calm'
  end,
  button_style = case
    when button_style in ('pill', 'soft-corner', 'crisp') then button_style
    else 'pill'
  end,
  surface_style = case
    when surface_style in ('soft', 'glass', 'outlined') then surface_style
    else 'soft'
  end;
