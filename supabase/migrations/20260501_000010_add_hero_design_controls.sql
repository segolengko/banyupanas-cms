alter table public.site_settings
add column if not exists hero_layout_style text not null default 'immersive',
add column if not exists trust_chip_style text not null default 'soft';

alter table public.site_settings
drop constraint if exists site_settings_hero_layout_style_check;

alter table public.site_settings
add constraint site_settings_hero_layout_style_check
check (hero_layout_style in ('immersive', 'split', 'editorial'));

alter table public.site_settings
drop constraint if exists site_settings_trust_chip_style_check;

alter table public.site_settings
add constraint site_settings_trust_chip_style_check
check (trust_chip_style in ('soft', 'outline', 'solid'));

update public.site_settings
set
  hero_layout_style = case
    when hero_layout_style in ('immersive', 'split', 'editorial') then hero_layout_style
    else 'immersive'
  end,
  trust_chip_style = case
    when trust_chip_style in ('soft', 'outline', 'solid') then trust_chip_style
    else 'soft'
  end;
