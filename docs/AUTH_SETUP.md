# Setup Authentication untuk EmoClass

Panduan lengkap untuk mengaktifkan sistem authentication admin-only registration.

## 🎯 Konsep

Sistem ini menggunakan **admin-only registration** dimana:
- **Admin** membuat akun untuk guru
- **Guru** login dengan kredensial dari admin
- **Siswa** tidak perlu login, mereka hanya memilih emosi melalui sesi yang dibuka guru

## 📋 Langkah Setup

### 1. Install Dependencies

Dependencies sudah terinstall otomatis:
- `bcryptjs` - untuk hashing password
- `jose` - untuk JWT token
- `@supabase/supabase-js` - untuk database

### 2. Setup Database

Jalankan SQL schema di Supabase SQL Editor:

```bash
# 1. Buka Supabase Dashboard
# 2. Pilih project Anda
# 3. Buka SQL Editor
# 4. Copy paste isi file: supabase/auth-schema.sql
# 5. Klik Run
```

Schema ini akan membuat:
- Tabel `users` untuk admin dan guru
- Akun admin default dengan kredensial:
  - Email: `admin@emoclass.com`
  - Password: `admin123`

### 3. Environment Variables

File `.env.local` sudah diupdate dengan:

```env
JWT_SECRET=emoclass-secret-key-change-in-production-2024
```

**PENTING**: Ganti `JWT_SECRET` dengan string random yang aman untuk production!

### 4. Test Login

1. Jalankan development server:
```bash
npm run dev
```

2. Buka browser: `http://localhost:3000`

3. Anda akan otomatis redirect ke `/login`

4. Login dengan akun admin:
   - Email: `admin@emoclass.com`
   - Password: `admin123`

5. Setelah login, Anda akan masuk ke Admin Dashboard

## 🔐 Fitur Authentication

### Admin Dashboard (`/admin`)

Admin dapat:
- ✅ Melihat daftar semua guru
- ✅ Membuat akun guru baru
- ✅ Mengaktifkan/menonaktifkan akun guru
- ✅ Menghapus akun guru
- ✅ Melihat status dan tanggal pembuatan akun

### Teacher Dashboard (`/dashboard`)

Guru dapat:
- ✅ Login dengan kredensial dari admin
- ✅ Akses dashboard untuk monitoring emosi
- ✅ Buka sesi input emosi untuk siswa
- ✅ Lihat laporan dan notifikasi

### Route Protection

Middleware otomatis melindungi route:
- `/admin/*` - Hanya admin
- `/dashboard/*` - Admin dan guru
- `/input-emotion/*` - Admin dan guru
- `/reports/*` - Admin dan guru
- `/notifications/*` - Admin dan guru

## 📝 Cara Membuat Akun Guru

1. Login sebagai admin
2. Klik tombol **"+ Tambah Guru"**
3. Isi form:
   - Nama Lengkap
   - Email
   - Password
4. Klik **"Buat Akun"**
5. Berikan kredensial (email & password) ke guru tersebut

## 🔄 Flow Penggunaan

```
1. Admin login → Buat akun guru → Berikan kredensial ke guru

2. Guru login → Buka halaman input emosi → Siswa pilih emosi

3. Data emosi tersimpan dengan informasi guru yang sedang login
```

## 🛡️ Keamanan

- ✅ Password di-hash dengan bcrypt (cost 10)
- ✅ JWT token untuk session management
- ✅ HTTP-only cookies untuk menyimpan token
- ✅ Middleware protection untuk semua route
- ✅ Role-based access control (admin vs teacher)
- ✅ Row Level Security (RLS) di Supabase

## 🚀 Production Checklist

Sebelum deploy ke production:

1. ✅ Ganti `JWT_SECRET` dengan string random yang kuat
2. ✅ Ganti password admin default
3. ✅ Aktifkan HTTPS
4. ✅ Set `secure: true` di cookie options (sudah otomatis di production)
5. ✅ Review RLS policies di Supabase
6. ✅ Backup database secara berkala

## 🔧 Troubleshooting

### Login gagal terus
- Pastikan schema sudah dijalankan di Supabase
- Cek apakah tabel `users` sudah ada
- Cek apakah admin account sudah ter-insert

### Redirect loop
- Clear cookies browser
- Cek middleware.ts tidak ada error
- Pastikan JWT_SECRET sudah di set

### "Unauthorized" error
- Cek token di cookies (DevTools → Application → Cookies)
- Pastikan JWT_SECRET sama dengan yang digunakan saat create token
- Cek expiry time token (default 24 jam)

## 📚 File Structure

```
emoclass/
├── app/
│   ├── login/page.tsx          # Login page
│   ├── admin/page.tsx          # Admin dashboard
│   └── api/
│       ├── login/route.ts      # Login endpoint
│       ├── logout/route.ts     # Logout endpoint
│       ├── me/route.ts         # Get current user
│       └── admin/
│           └── teachers/       # CRUD teachers
├── lib/
│   ├── auth.ts                 # Auth utilities
│   └── supabase-admin.ts       # Supabase client
├── middleware.ts               # Route protection
└── supabase/
    └── auth-schema.sql         # Database schema
```

## 🎓 Next Steps

Setelah authentication berjalan:

1. Update halaman dashboard untuk menampilkan nama guru yang login
2. Filter data berdasarkan guru yang login (jika diperlukan)
3. Tambah fitur change password untuk guru
4. Tambah fitur forgot password (opsional)
5. Implementasi audit log untuk tracking aktivitas

---

**Selamat! Sistem authentication sudah siap digunakan! 🎉**
