# 🚀 Quick Start - Authentication

Panduan cepat untuk mengaktifkan authentication dalam 5 menit.

## Step 1: Setup Database (2 menit)

1. Buka [Supabase Dashboard](https://supabase.com/dashboard)
2. Pilih project Anda
3. Klik **SQL Editor** di sidebar
4. Copy paste isi file `supabase/auth-schema.sql`
5. Klik **Run** atau tekan `Ctrl+Enter`

✅ Selesai! Tabel `users` dan akun admin sudah dibuat.

## Step 2: Test Login (1 menit)

1. Jalankan dev server:
```bash
cd emoclass
npm run dev
```

2. Buka browser: `http://localhost:3000`

3. Login dengan:
   - **Email**: `admin@emoclass.com`
   - **Password**: `admin123`

✅ Anda akan masuk ke Admin Dashboard!

## Step 3: Buat Akun Guru (2 menit)

Di Admin Dashboard:

1. Klik tombol **"+ Tambah Guru"**
2. Isi form:
   - Nama: `Pak Budi`
   - Email: `budi@sekolah.com`
   - Password: `guru123`
3. Klik **"Buat Akun"**

✅ Akun guru berhasil dibuat!

## Step 4: Test Login Guru

1. Logout dari admin
2. Login dengan akun guru:
   - Email: `budi@sekolah.com`
   - Password: `guru123`

✅ Guru akan masuk ke Dashboard!

## 🎉 Selesai!

Sistem authentication sudah berjalan. Sekarang:

- **Admin** bisa manage akun guru di `/admin`
- **Guru** bisa login dan akses dashboard di `/dashboard`
- **Siswa** tidak perlu login, tinggal pilih emosi

## 📝 Kredensial Default

**Admin:**
- Email: `admin@emoclass.com`
- Password: `admin123`

⚠️ **PENTING**: Ganti password admin setelah login pertama kali!

## 🔐 Keamanan

File `.env.local` sudah include:
```env
JWT_SECRET=emoclass-secret-key-change-in-production-2024
```

Untuk production, ganti dengan string random yang kuat!

## ❓ Troubleshooting

**Login gagal?**
- Pastikan SQL schema sudah dijalankan
- Cek tabel `users` di Supabase Table Editor
- Pastikan ada row dengan email `admin@emoclass.com`

**Redirect loop?**
- Clear cookies browser (F12 → Application → Cookies → Clear)
- Restart dev server

**Need help?**
- Baca `AUTH_SETUP.md` untuk dokumentasi lengkap
- Cek `TROUBLESHOOTING.md` untuk masalah umum

---

**Happy coding! 🚀**
