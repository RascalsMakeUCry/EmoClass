# Demo Telegram Alert - Quick Guide

## Overview
Fitur demo untuk mensimulasikan alert Telegram ketika siswa menunjukkan emosi sedih/tertekan selama 3 hari berturut-turut.

## Cara Menggunakan

### Melalui UI (Recommended untuk Demo)
1. Login sebagai **Guru** (bukan admin)
2. Buka halaman **Dashboard Guru** (`/dashboard`)
3. Scroll ke bawah, setelah Environment Alert Card, Anda akan melihat section **"Demo Telegram Alert"** dengan background biru
4. Klik tombol **"🚨 Jalankan Demo Alert"**
5. Tunggu beberapa detik hingga proses selesai
6. Hasil akan ditampilkan di bawah tombol:
   - ✅ Alert Detected
   - ✅ Telegram Sent
   - ✅ Notification Created
7. Cek Telegram Bot Anda untuk melihat notifikasi
8. Atau buka halaman `/notifications` untuk melihat notifikasi di UI

### Melalui Command Line (Alternative)
```bash
npm run test:sad-alert
```

## Apa yang Dilakukan Demo Ini?

1. **Pilih Siswa**: Mengambil siswa pertama dari database
2. **Bersihkan Data**: Menghapus check-in lama siswa tersebut
3. **Buat 3 Check-in**: Insert 3 check-in dengan emosi "stressed" untuk 3 hari berturut-turut
4. **Trigger Alert**: Memanggil API `/api/check-alert` untuk mendeteksi pola
5. **Kirim Telegram**: Mengirim notifikasi ke Telegram Bot (jika dikonfigurasi)
6. **Buat Notifikasi**: Membuat notifikasi di database untuk Guru BK

## Hasil yang Diharapkan

### Jika Berhasil Sempurna
- ✅ Alert terdeteksi
- ✅ Telegram notification terkirim
- ✅ Notifikasi dibuat di database
- Pesan muncul di Telegram Bot
- Notifikasi muncul di halaman `/notifications`

### Jika Telegram Tidak Terkirim
- ✅ Alert terdeteksi
- ❌ Telegram notification TIDAK terkirim
- ✅/❌ Notifikasi mungkin tetap dibuat di database

**Penyebab:**
- `TELEGRAM_BOT_TOKEN` atau `TELEGRAM_CHAT_ID` belum diset di `.env.local`
- Bot token atau chat ID tidak valid
- Koneksi internet bermasalah

**Solusi:**
- Pastikan Telegram Bot sudah dikonfigurasi dengan benar
- Lihat `docs/TELEGRAM_SETUP.md` untuk panduan setup

## API Endpoint

**POST** `/api/demo/trigger-sad-alert`

Response:
```json
{
  "success": true,
  "student": {
    "name": "Nama Siswa",
    "class": "Nama Kelas"
  },
  "checkinsCreated": 3,
  "alertResult": {
    "alert": true,
    "telegramSent": true,
    "notificationCreated": true,
    "alertType": "consecutive_sad",
    "message": "Alert triggered successfully"
  }
}
```

## Tips untuk Demo

1. **Sebelum Demo**: Pastikan Telegram Bot sudah dikonfigurasi
2. **Saat Demo**: Tunjukkan hasil di UI dan Telegram secara bersamaan
3. **Setelah Demo**: Jelaskan bahwa ini otomatis berjalan setiap hari via cron job
4. **Cleanup**: Demo akan otomatis menghapus check-in lama siswa yang dipilih

## Troubleshooting

### Demo Gagal
- Pastikan server development sedang berjalan (`npm run dev`)
- Cek koneksi ke Supabase
- Pastikan ada minimal 1 siswa di database

### Telegram Tidak Terkirim
- Cek `.env.local` untuk `TELEGRAM_BOT_TOKEN` dan `TELEGRAM_CHAT_ID`
- Test bot dengan command `/start` di Telegram
- Pastikan bot sudah ditambahkan ke group/channel yang benar

### Notifikasi Tidak Muncul di UI
- Pastikan ada minimal 1 teacher yang aktif di database
- Cek RLS policy di Supabase untuk tabel `notifications`
- Refresh halaman `/notifications`

## Related Files

- **UI Component**: `app/dashboard/page.tsx` (Demo section di Dashboard Guru)
- **API Endpoint**: `app/api/demo/trigger-sad-alert/route.ts`
- **Alert Logic**: `app/api/check-alert/route.ts`
- **Test Script**: `scripts/test-sad-alert.ts`
- **Notification Helper**: `lib/notification-helper.ts`

## Kenapa di Dashboard Guru?

Tombol demo ditempatkan di Dashboard Guru (bukan Admin) karena:
1. **Konteks yang Tepat**: Guru yang akan menerima dan melihat alert Telegram
2. **Flow yang Natural**: Guru bisa langsung melihat hasil demo di dashboard mereka
3. **Akses Mudah**: Tidak perlu switch ke halaman admin untuk demo
4. **User Experience**: Lebih intuitif untuk demo ke stakeholder (guru/kepala sekolah)
