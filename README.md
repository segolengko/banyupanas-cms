# Banyu Panas Cirebon CMS

Frontend ini sudah dipindahkan ke **Next.js App Router** dan disusun ulang untuk kebutuhan **website publik + CMS admin yang lebih aman**.

## Yang Sudah Ada

- Website publik dan area admin dipisah lewat route Next.js.
- Login admin memakai **server-side session cookie** `httpOnly`, bukan `localStorage`.
- Area admin dijaga oleh `proxy.ts` dan validasi session di server layout.
- Operasi tulis memakai **server actions** dan route handler.
- Aktivitas sensitif seperti login, logout, upload media, hapus media, dan perubahan konten bisa dicatat ke `admin_audit_log`.
- Halaman publik `/stories` dan `/stories/[slug]` mengambil data dari konten yang sudah `published`.
- Metadata publik sekarang mendukung **SEO dinamis**, `robots.txt`, dan `sitemap.xml`.
- Admin punya halaman **Audit Log** dan picker media langsung dari library untuk cover konten serta hero visual.
- Media library sekarang mendukung **metadata asset** seperti `alt text`, `tag`, dan `role` visual.
- `site_settings` sekarang mendukung **preset multi-theme** untuk mengganti arah warna publik dan admin dari CMS.
- Hero publik juga mendukung **layout style** dan **trust chip style** agar tone tampilannya bisa diubah tanpa edit code.
- Kontrol desain publik sekarang juga mencakup **hero mood**, **button style**, dan **surface style**.
- Hardening terbaru menambahkan **validasi URL settings**, **lockout login persisten**, dan pengetatan policy Supabase agar write berjalan lewat server yang memegang `service_role`.
- CSP production sekarang memakai **nonce per request** lewat `proxy.ts`, mengikuti pola keamanan Next.js App Router agar tidak bergantung pada `'unsafe-inline'`.

## Prasyarat

- Node.js `20.9+`
- NPM terbaru
- Project Supabase untuk mode backend persisten

## Menjalankan Lokal

1. Install dependency:
   `npm install`
2. Siapkan environment dari [.env.example](./.env.example)
3. Jalankan development server:
   `npm run dev`

## Environment

Minimal untuk booting frontend:

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Untuk login admin aman:

```env
CMS_ADMIN_EMAIL=admin@banyupanascirebon.id
CMS_ADMIN_PASSWORD_HASH=scrypt:...
CMS_SESSION_SECRET=secret_min_32_characters
```

Untuk backend write CMS:

```env
SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_public_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Generate Password Hash

Gunakan util bawaan:

```bash
node scripts/generate-password-hash.mjs "ganti-password-aman"
```

Output-nya tinggal dipasang ke `CMS_ADMIN_PASSWORD_HASH`.

## Setup Supabase

Urutan yang disarankan:

1. Buat project Supabase.
2. Jalankan semua migration SQL di folder [supabase/migrations](./supabase/migrations) secara berurutan.
3. Isi `SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, dan `SUPABASE_SERVICE_ROLE_KEY` di environment app.
4. Generate hash password admin lalu isi `CMS_ADMIN_EMAIL`, `CMS_ADMIN_PASSWORD_HASH`, dan `CMS_SESSION_SECRET`.
5. Jalankan app lalu uji login, CRUD konten, upload media, dan halaman publik `/stories`.

## Route Teknis Publik

- `GET /robots.txt` dihasilkan otomatis dari app route.
- `GET /sitemap.xml` dihasilkan otomatis dari homepage, listing cerita, dan semua konten publik yang sudah `published`.

## Struktur Backend

Migration yang disiapkan akan membuat:

- Table `posts`
- Table `site_settings`
- Table `admin_audit_log`
- Table `admin_login_attempts`
- Table `media_assets`
- Bucket storage `media`
- Trigger `updated_at`
- RLS policy untuk read publik, sementara write admin dijalankan dari server dengan `service_role`
- Preset warna `oasis`, `mineral`, `forest`, dan `sunset` di `site_settings.theme_preset`

## Mode Demo

Kalau backend Supabase belum dihubungkan, aplikasi tetap bisa tampil dalam **mode demo read-only** untuk preview UI dan arsitektur. Namun:

- penyimpanan konten tidak persisten,
- settings tidak tersimpan permanen,
- media upload tidak aktif,
- audit log tidak tercatat,
- halaman publik memakai fallback mock bila `NEXT_PUBLIC_SUPABASE_ANON_KEY` belum diisi.
