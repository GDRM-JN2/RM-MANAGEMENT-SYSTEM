# Backend - Satu Aplikasi

## Setup lokal

1. `npm install`
2. Copy `.env.example` jadi `.env`, isi dengan:
   - `SUPABASE_URL` dan `SUPABASE_SERVICE_ROLE_KEY` (dari Supabase Dashboard > Project Settings > API)
   - `JWT_SECRET` (buat string acak panjang, misal lewat `openssl rand -hex 32`)
3. `npm run dev` -> jalan di `http://localhost:3000`

## Deploy ke Vercel

1. Push repo ini ke GitHub.
2. Import project di Vercel, pilih repo ini.
3. Di Vercel > Settings > Environment Variables, isi variable yang sama seperti `.env`.
4. Deploy. `vercel.json` sudah mengatur semua request diarahkan ke `api/index.js`.

## Endpoint yang sudah ada

- `POST /auth/register` - daftar akun baru (status pending, belum bisa login)
- `POST /auth/login` - login (harus sudah diapprove Head)
- `GET /users/pending` - daftar user menunggu approval (khusus Head)
- `POST /users/:id/approve` - approve user + tentukan role (khusus Head), body: `{ "role_id": "uuid-role" }`
- `POST /users/:id/reject` - tolak pendaftaran user (khusus Head)

## Cara dapat role_id untuk approve user pertama kali

Karena approve user butuh Head yang sudah login, tapi user Head pertama belum ada
yang approve dia sendiri - untuk **user Head pertama saja**, buat manual lewat
Supabase Table Editor:
1. Daftar dulu lewat `/auth/register` seperti biasa.
2. Buka Supabase > Table Editor > tabel `users`, cari user tadi.
3. Edit manual: `registration_status` jadi `approved`, dan `role_id` isi dengan
   id role `HEAD_FULL_ACCESS` (cek di tabel `roles`).
4. Setelah itu, user Head ini bisa login dan approve user-user berikutnya lewat API.

## Struktur folder

```
backend/
  api/index.js          <- entry point Vercel
  src/
    app.js               <- setup Express
    server.js             <- untuk jalan lokal (npm run dev)
    config/supabaseClient.js
    middleware/           <- auth.middleware.js, role.middleware.js
    controllers/          <- auth.controller.js, users.controller.js
    routes/                <- auth.routes.js, users.routes.js
    utils/                  <- password.js (hash), jwt.js
```

## Fase berikutnya

Tambahkan `src/controllers/gdrm/*.controller.js` dan `src/routes/gdrm.routes.js`
untuk endpoint Reservasi, Planning, Service Level - ikut pola yang sama seperti
`auth` dan `users` di atas.
