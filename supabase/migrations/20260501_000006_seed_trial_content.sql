update public.site_settings
set
  site_tagline = 'Destinasi air panas untuk jeda akhir pekan yang lebih tertata',
  site_description = 'Website publik Banyu Panas Cirebon yang menampilkan informasi kunjungan, harga tiket, cerita, dan lokasi.',
  theme_preset = 'oasis',
  hero_layout_style = 'immersive',
  trust_chip_style = 'soft',
  hero_mood = 'calm',
  button_style = 'pill',
  surface_style = 'soft',
  hero_eyebrow = 'Wisata Air Panas Alami',
  hero_title = 'Rancang pengalaman kunjungan yang terasa lebih jelas sejak halaman pertama.',
  hero_description = 'Nikmati informasi kunjungan, harga tiket, dan cerita terbaru Banyu Panas Cirebon dalam satu pengalaman yang lebih rapi.',
  hero_poster_image = 'https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=1800&q=80',
  hero_video_url = 'https://dwrpaczutipjyygjegcl.supabase.co/storage/v1/object/public/media/hero/hot-spring-kusatsu-onsen-204278-medium.mp4',
  hero_trust_chips = jsonb_build_array(
    'Air panas alami',
    'Jalur kunjungan lebih jelas',
    'Harga tiket mudah dibaca'
  ),
  booking_url = '#kontak',
  primary_cta_label = 'Lihat Map',
  secondary_cta_label = 'Harga Tiket',
  contact_phone = '',
  contact_email = '',
  location = 'Wisata Banyu Panas Gempol-Palimanan, Cirebon',
  google_maps_embed_url = 'https://www.google.com/maps?q=-6.7126849,108.3991874&z=17&output=embed',
  google_maps_place_url = 'https://www.google.com/maps/place/Wisata+Banyu+Panas+Gempol-Palimanan/@-6.7122973,108.4002435,3a,75y,90t/data=!3m8!1e2!3m6!1sCIHM0ogKEICAgIC4jc34Qg!2e10!3e12!6shttps:%2F%2Flh3.googleusercontent.com%2Fgps-cs-s%2FAPNQkAFuSN4c3O050rH68a01OFuPBIDJaMd-Ih7gAJXqlfCVqSX3CMBVgraBrqzo_I7vYcye2Bm9IjpBh4o62EVOhGLle6WoEVnwjr-fWUPbfmhtgjcuhhhTibwcajI1_Pmr2gxo1kkX%3Dw114-h86-k-no!7i1040!8i780!4m7!3m6!1s0x2e6edfb42f3978c3:0x738f5b50b3f9e611!8m2!3d-6.7126849!4d108.3991874!10e5!16s%2Fg%2F11cnmzwyq_?entry=ttu&g_ep=EgoyMDI2MDQyOC4wIKXMDSoASAFQAw%3D%3D',
  instagram_url = '',
  tiktok_url = '',
  youtube_url = '',
  metrics = jsonb_build_array(
    jsonb_build_object('label', 'Jam terbaik', 'value', 'Pagi - Sore'),
    jsonb_build_object('label', 'Format kunjungan', 'value', 'Keluarga'),
    jsonb_build_object('label', 'Akses lokasi', 'value', 'Gempol-Palimanan'),
    jsonb_build_object('label', 'Status kunjungan', 'value', 'Live')
  ),
  ticket_options = jsonb_build_array(
    jsonb_build_object(
      'name', 'Tiket Reguler Dewasa',
      'price', 'Rp 25.000',
      'description', 'Akses area rendam umum untuk satu kali kunjungan.'
    ),
    jsonb_build_object(
      'name', 'Tiket Reguler Anak',
      'price', 'Rp 18.000',
      'description', 'Pilihan tiket anak untuk kunjungan keluarga.'
    ),
    jsonb_build_object(
      'name', 'Paket Keluarga',
      'price', 'Rp 75.000',
      'description', 'Paket hemat untuk 2 dewasa dan 2 anak.'
    ),
    jsonb_build_object(
      'name', 'Ruang Rendam Privat',
      'price', 'Mulai Rp 120.000',
      'description', 'Untuk tamu yang ingin ritme kunjungan lebih tenang.'
    )
  )
where id = 'primary';

insert into public.posts (
  slug,
  title,
  excerpt,
  content,
  status,
  author,
  type,
  cover_image,
  seo_title,
  seo_description,
  featured,
  published_at
)
values
  (
    'panduan-kunjungan-pagi',
    'Panduan Kunjungan Pagi untuk Pengunjung Pertama',
    'Ringkasan singkat tentang waktu datang, alur masuk, dan ritme kunjungan yang lebih nyaman.',
    'Kunjungan pagi biasanya memberi suasana yang lebih tenang untuk tamu yang ingin menikmati pengalaman rendam tanpa keramaian berlebih. Artikel ini bisa membantu pengunjung memahami waktu kunjungan yang lebih nyaman sejak sebelum berangkat.',
    'published',
    'Tim Editorial',
    'article',
    'https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=1200&q=80',
    'Panduan Kunjungan Pagi',
    'Panduan singkat untuk pengunjung yang ingin datang lebih pagi.',
    true,
    timezone('utc', now())
  ),
  (
    'tentang-destinasi',
    'Tentang Destinasi dan Arah Pengalaman yang Ingin Dibangun',
    'Halaman yang menjelaskan arah pengalaman, ritme kunjungan, dan pendekatan presentasi website.',
    'Halaman ini menjelaskan bagaimana Banyu Panas Cirebon ingin menghadirkan pengalaman kunjungan yang lebih tertata, informatif, dan mudah dipahami oleh pengunjung sejak halaman pertama.',
    'published',
    'Tim Editorial',
    'page',
    'https://images.unsplash.com/photo-1473116763249-2faaef81ccda?auto=format&fit=crop&w=1200&q=80',
    'Tentang Destinasi',
    'Gambaran singkat tentang arah pengalaman dan presentasi destinasi.',
    false,
    timezone('utc', now())
  ),
  (
    'info-jam-operasional-akhir-pekan',
    'Info Jam Operasional Akhir Pekan',
    'Pengumuman singkat untuk memberi tahu jam operasional akhir pekan kepada pengunjung.',
    'Gunakan pengumuman ini untuk menyampaikan update singkat yang tetap rapi tampil di area publik, seperti penyesuaian jam operasional, kepadatan kunjungan, atau informasi layanan tertentu.',
    'published',
    'Tim Operasional',
    'announcement',
    'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
    'Info Jam Operasional Akhir Pekan',
    'Pengumuman publik terkait jam operasional akhir pekan.',
    false,
    timezone('utc', now())
  )
on conflict (slug) do update
set
  title = excluded.title,
  excerpt = excluded.excerpt,
  content = excluded.content,
  status = excluded.status,
  author = excluded.author,
  type = excluded.type,
  cover_image = excluded.cover_image,
  seo_title = excluded.seo_title,
  seo_description = excluded.seo_description,
  featured = excluded.featured,
  published_at = excluded.published_at;
