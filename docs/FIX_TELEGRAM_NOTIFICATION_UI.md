# Fix: Notifikasi Telegram Tidak Muncul di UI

## Masalah
Ketika menjalankan test sad alert (`npx tsx scripts/test-sad-alert.ts`), pesan Telegram berhasil terkirim tetapi notifikasi tidak muncul di halaman `/notifications`.

## Penyebab
API `/api/check-alert` hanya mengirim pesan ke Telegram bot, tetapi tidak membuat record notifikasi di database. Halaman notifikasi hanya menampilkan data dari tabel `notifications` di database.

## Solusi
Menambahkan fungsi `createNotificationForTeachers()` di `/app/api/check-alert/route.ts` yang:

1. Mengambil semua user dengan role `teacher` yang aktif
2. Membuat notifikasi untuk setiap teacher dengan:
   - Type: `alert`
   - Priority: `urgent`
   - Title: "🚨 Alert: Siswa Perlu Perhatian Khusus"
   - Message: Detail tentang siswa dan pola emosi
   - Metadata: Informasi tambahan (nama siswa, kelas, tipe alert, dll)

3. Menggunakan `supabase-admin` client (dengan Service Role Key) untuk bypass RLS dan memastikan notifikasi berhasil dibuat

## Perubahan File
- `app/api/check-alert/route.ts`:
  - Import `supabase` dari `@/lib/supabase-admin` (bukan `@/lib/supabase`)
  - Tambah fungsi `createNotificationForTeachers()`
  - Panggil fungsi tersebut setelah mengirim Telegram alert
  - Return `notificationCreated` status di response

## Testing
Jalankan test sad alert:
```bash
npx tsx scripts/test-sad-alert.ts
```

Setelah test berhasil:
1. ✅ Telegram bot mengirim pesan
2. ✅ Notifikasi muncul di halaman `/notifications`
3. ✅ Semua teacher yang aktif menerima notifikasi
4. ✅ Notifikasi memiliki priority "urgent" dan type "alert"

## Realtime Updates (Bonus!)

Halaman notifikasi sekarang mendukung **realtime updates**! Notifikasi baru akan muncul otomatis tanpa refresh.

### Cara Mengaktifkan Realtime:
1. Buka Supabase Dashboard > Database > Replication
2. Centang tabel `notifications`
3. Klik Save

### Test Realtime:
```bash
# Terminal 1: Dev server
npm run dev

# Terminal 2: Test realtime
npx tsx scripts/test-realtime-notifications.ts

# Browser: Buka /notifications
# Notifikasi muncul otomatis tanpa refresh!
```

### Visual Indicator:
- 🟡 Kuning "Menghubungkan..." → Sedang connect
- 🟢 Hijau "Live Update Aktif" → Realtime aktif ✅
- 🔴 Merah "Live Update Nonaktif" → Ada masalah

Lihat dokumentasi lengkap: `docs/REALTIME_NOTIFICATIONS.md`

## Catatan
- Notifikasi dibuat untuk **semua teacher yang aktif** (`role='teacher'` dan `is_active=true`)
- Menggunakan admin client untuk memastikan tidak ada masalah dengan RLS policies
- Metadata menyimpan informasi lengkap untuk tracking dan debugging
- Realtime menggunakan Supabase WebSocket (gratis di Free Tier)
