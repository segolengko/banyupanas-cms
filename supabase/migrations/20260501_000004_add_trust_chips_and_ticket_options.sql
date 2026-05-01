alter table public.site_settings
add column if not exists hero_trust_chips jsonb not null default '[]'::jsonb,
add column if not exists ticket_options jsonb not null default '[]'::jsonb;

update public.site_settings
set
  hero_trust_chips = case
    when jsonb_typeof(hero_trust_chips) = 'array' and jsonb_array_length(hero_trust_chips) > 0 then hero_trust_chips
    else jsonb_build_array(
      'Air panas alami',
      'Family-friendly',
      'Harga tiket transparan'
    )
  end,
  ticket_options = case
    when jsonb_typeof(ticket_options) = 'array' and jsonb_array_length(ticket_options) > 0 then ticket_options
    else jsonb_build_array(
      jsonb_build_object(
        'name', 'Tiket Reguler Dewasa',
        'price', 'Rp 25.000',
        'description', 'Akses area rendam umum, area bilas, dan fasilitas dasar untuk satu kunjungan.'
      ),
      jsonb_build_object(
        'name', 'Tiket Reguler Anak',
        'price', 'Rp 18.000',
        'description', 'Pilihan ramah keluarga untuk anak dengan akses ke area umum yang sama.'
      ),
      jsonb_build_object(
        'name', 'Paket Keluarga',
        'price', 'Rp 75.000',
        'description', 'Untuk 2 dewasa dan 2 anak dengan ritme kunjungan yang lebih hemat untuk weekend.'
      ),
      jsonb_build_object(
        'name', 'Rendam Privat',
        'price', 'Mulai Rp 120.000',
        'description', 'Untuk tamu yang ingin pengalaman lebih tenang dengan ruang rendam yang terasa eksklusif.'
      )
    )
  end,
  primary_cta_label = 'Lihat Map',
  secondary_cta_label = 'Harga Tiket'
where id = 'primary';
