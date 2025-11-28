# Testing Scripts

Script-script untuk testing fitur EmoClass.

## 🎯 Pilihan Testing

### 1. 🚀 Quick Test (Otomatis)
Script otomatis yang langsung test dengan siswa pertama dan emosi "Sedih".

```bash
npm run test:sad-alert
```

### 2. 🎮 Interactive Test (Pilih Sendiri)
Script interaktif yang memungkinkan Anda memilih siswa dan jenis emosi.

```bash
npm run test:alert
```

---

## 🧪 Test Sad Alert (Otomatis)

Script untuk menguji fitur Telegram alert ketika siswa menunjukkan emosi "Sedih" selama 3 hari berturut-turut.

### Prasyarat

1. ✅ Development server harus running:
   ```bash
   npm run dev
   ```

2. ✅ File `.env.local` sudah dikonfigurasi dengan:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `TELEGRAM_BOT_TOKEN` (opsional, tapi diperlukan untuk test Telegram)
   - `TELEGRAM_CHAT_ID` (opsional, tapi diperlukan untuk test Telegram)

3. ✅ Database Supabase sudah ada data siswa

### Cara Menjalankan

```bash
npx tsx scripts/test-sad-alert.ts
```

### Apa yang Dilakukan Script Ini?

1. **Pilih siswa** - Mengambil 1 siswa dari database untuk testing
2. **Bersihkan data lama** - Menghapus check-in lama siswa tersebut
3. **Insert 3 check-in** - Memasukkan 3 check-in dengan emosi "stressed" (Sedih) berturut-turut
4. **Trigger alert** - Memanggil API `/api/check-alert` untuk mendeteksi pola
5. **Verifikasi hasil** - Menampilkan apakah alert terdeteksi dan Telegram terkirim

### Output yang Diharapkan

Jika berhasil, Anda akan melihat:

```
🧪 TESTING TELEGRAM ALERT - 3 HARI SEDIH BERTURUT-TURUT

============================================================

📋 Step 1: Mengambil data siswa untuk testing...
✅ Siswa dipilih: Ahmad Rizki (Kelas 7A)
   Student ID: xxx-xxx-xxx

🧹 Step 2: Membersihkan data check-in lama...
✅ Data lama berhasil dihapus

📝 Step 3: Memasukkan 3 check-in "Sedih" berturut-turut...
✅ Check-in 1/3 berhasil (26/11/2025)
✅ Check-in 2/3 berhasil (27/11/2025)
✅ Check-in 3/3 berhasil (28/11/2025)

🔍 Step 4: Verifikasi data di database...
✅ Data berhasil diverifikasi:
   1. stressed - 28/11/2025 - Testing alert - Hari ke-3
   2. stressed - 27/11/2025 - Testing alert - Hari ke-2
   3. stressed - 26/11/2025 - Testing alert - Hari ke-1

🚨 Step 5: Trigger Alert API...
   Mengirim request ke /api/check-alert...

📊 HASIL TESTING:
============================================================
Status: ✅ SUCCESS
Alert Triggered: ✅ YA
Telegram Sent: ✅ YA
Alert Type: stressed
Message: 🚨 Alert sent! 3 consecutive stressed emotions detected.

🎉 TESTING BERHASIL!
✅ Alert terdeteksi dan Telegram notification terkirim!

📱 Cek Telegram Anda untuk melihat pesan alert.
```

### Troubleshooting

#### ❌ "Telegram notification TIDAK terkirim"

**Penyebab:**
- `TELEGRAM_BOT_TOKEN` atau `TELEGRAM_CHAT_ID` belum diset di `.env.local`
- Bot token atau chat ID tidak valid

**Solusi:**
1. Lihat `docs/TELEGRAM_SETUP.md` untuk setup Telegram bot
2. Pastikan `.env.local` sudah diisi dengan benar
3. Restart development server setelah update `.env.local`

#### ❌ "Error saat memanggil API"

**Penyebab:**
- Development server belum running

**Solusi:**
```bash
npm run dev
```

#### ❌ "Tidak bisa mengambil data siswa"

**Penyebab:**
- Database belum ada data siswa
- Koneksi Supabase bermasalah

**Solusi:**
1. Pastikan Supabase credentials benar di `.env.local`
2. Seed database dengan data siswa (lihat `docs/SUPABASE_SETUP.md`)

### Testing Manual (Alternatif)

Jika tidak ingin menggunakan script, Anda bisa test manual:

1. Buka `http://localhost:3000/input-emotion`
2. Pilih siswa (misal: Ahmad Rizki)
3. Check-in dengan emosi **😔 Sedih** - Hari 1
4. Check-in dengan emosi **😔 Sedih** - Hari 2
5. Check-in dengan emosi **😔 Sedih** - Hari 3
6. Setelah check-in ke-3, alert Telegram harus terkirim!

**Catatan:** Untuk testing manual, Anda perlu menunggu 3 hari atau manually update `created_at` di database.

---

## 🎮 Interactive Test (Pilih Sendiri)

Script interaktif yang memungkinkan Anda:
- Memilih siswa mana yang mau di-test
- Memilih jenis emosi (Sedih, Mengantuk, atau Normal)

### Cara Menjalankan

```bash
npm run test:alert
```

### Apa yang Dilakukan Script Ini?

1. **Tampilkan daftar siswa** - Pilih siswa dari database
2. **Pilih jenis emosi** - Sedih (😔), Mengantuk (😴), atau Normal (🙂)
3. **Konfirmasi** - Review pilihan sebelum testing
4. **Insert 3 check-in** - Memasukkan 3 check-in berturut-turut
5. **Trigger alert** - Memanggil API dan kirim Telegram
6. **Verifikasi hasil** - Menampilkan status testing

### Output yang Diharapkan

```
🧪 INTERACTIVE TESTING - TELEGRAM ALERT

============================================================

📋 Mengambil daftar siswa...

👥 Pilih siswa untuk testing:

1. Ahmad Rizki (Kelas 7A)
2. Siti Nurhaliza (Kelas 7A)
3. Budi Santoso (Kelas 8B)
...

Pilih nomor siswa (1-10): 1

✅ Siswa dipilih: Ahmad Rizki (Kelas 7A)

😊 Pilih jenis emosi untuk testing:

1. 😔 Sedih/Tertekan (Priority: TINGGI)
2. 😴 Mengantuk/Lelah (Priority: SEDANG)
3. 🙂 Biasa Saja/Normal (Priority: RENDAH - Monitoring)

Pilih nomor emosi (1-3): 1

✅ Emosi dipilih: 😔 Sedih/Tertekan

============================================================
📝 RINGKASAN TESTING:
   Siswa: Ahmad Rizki
   Kelas: Kelas 7A
   Emosi: 😔 Sedih/Tertekan
============================================================

Lanjutkan testing? (y/n): y

[... proses testing ...]

🎉 TESTING BERHASIL!
✅ Alert terdeteksi dan Telegram notification terkirim!
```

---

---

## 🔐 Test Account Deactivation (Real-time Notification)

Script untuk menguji fitur notifikasi real-time ketika admin menonaktifkan atau menghapus akun guru yang sedang login.

### Prasyarat

1. ✅ File `.env.local` sudah dikonfigurasi dengan:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY` (untuk admin access)

2. ✅ Ada akun guru di database untuk testing

### Cara Menjalankan

```bash
npx tsx scripts/test-account-deactivation.ts
```

### Apa yang Dilakukan Script Ini?

1. **Tampilkan daftar guru** - Menampilkan semua guru dengan status aktif/nonaktif
2. **Pilih aksi** - Nonaktifkan, aktifkan kembali, atau hapus akun
3. **Eksekusi** - Melakukan perubahan di database
4. **Real-time notification** - Guru yang sedang login akan melihat modal notifikasi

### Skenario Testing

#### Skenario 1: Nonaktifkan Akun Guru yang Sedang Login

1. **Browser A**: Login sebagai guru (misal: guru@example.com)
2. **Terminal**: Jalankan script `npx tsx scripts/test-account-deactivation.ts`
3. **Terminal**: Pilih aksi "1. Nonaktifkan akun guru"
4. **Terminal**: Pilih guru yang sedang login
5. **Browser A**: Modal notifikasi muncul dengan countdown 5 detik
6. **Browser A**: Setelah 5 detik, otomatis redirect ke login

#### Skenario 2: Hapus Akun Guru yang Sedang Login

1. **Browser A**: Login sebagai guru
2. **Terminal**: Jalankan script
3. **Terminal**: Pilih aksi "3. Hapus akun guru (PERMANENT)"
4. **Terminal**: Ketik "DELETE" untuk konfirmasi
5. **Browser A**: Modal notifikasi muncul
6. **Browser A**: Redirect ke login

#### Skenario 3: Klik Tombol "OK, Mengerti"

1. **Browser A**: Login sebagai guru
2. **Terminal**: Nonaktifkan akun guru
3. **Browser A**: Modal muncul dengan countdown
4. **Browser A**: Klik tombol "OK, Mengerti"
5. **Browser A**: Langsung redirect tanpa menunggu countdown

### Output yang Diharapkan

```
╔════════════════════════════════════════════════════════════════════════════╗
║         Test Script: Account Deactivation Notification                    ║
╚════════════════════════════════════════════════════════════════════════════╝

📝 Instruksi Testing:
1. Buka browser dan login sebagai guru
2. Jalankan script ini untuk menonaktifkan akun guru tersebut
3. Perhatikan modal notifikasi muncul di browser guru
4. Modal akan menampilkan countdown 5 detik sebelum redirect

📋 Daftar Guru:
────────────────────────────────────────────────────────────────────────────────
1. Ahmad Guru (guru1@example.com) - ✅ Aktif
   ID: xxx-xxx-xxx
2. Siti Guru (guru2@example.com) - ✅ Aktif
   ID: yyy-yyy-yyy
────────────────────────────────────────────────────────────────────────────────

📌 Pilih Aksi:
1. Nonaktifkan akun guru
2. Aktifkan kembali akun guru
3. Hapus akun guru (PERMANENT)
4. Refresh daftar
5. Keluar

Pilih aksi (1-5): 1

Pilih nomor guru: 1

👤 Guru dipilih: Ahmad Guru (guru1@example.com)

🔄 Menonaktifkan akun...
✅ Akun berhasil dinonaktifkan!
💡 Jika guru sedang login, mereka akan melihat modal notifikasi.

⏳ Tunggu beberapa detik untuk melihat efek di browser...
```

### Modal Notification (Browser)

Ketika akun dinonaktifkan, guru akan melihat modal dengan:

```
⚠️ (Icon warning dengan pulse animation)

Akun Dinonaktifkan

Akun Anda telah dinonaktifkan oleh administrator.
Anda akan dialihkan ke halaman login.

[5] (Countdown dalam circle)

Redirect otomatis dalam 5 detik...

[OK, Mengerti] (Button)
```

### Fitur Modal

- ⚠️ Icon warning yang jelas
- Countdown 5 detik yang visible
- Tombol untuk skip countdown
- Tidak bisa ditutup (no close button)
- Auto redirect setelah countdown
- Smooth animations

### Troubleshooting

#### ❌ "Modal tidak muncul di browser"

**Penyebab:**
- Supabase Realtime belum aktif
- Browser tidak support WebSocket

**Solusi:**
1. Pastikan Supabase Realtime sudah enabled (lihat `docs/ENABLE_REALTIME.md`)
2. Cek console browser untuk error
3. Refresh browser dan coba lagi

#### ❌ "Error: Missing Supabase credentials"

**Penyebab:**
- `SUPABASE_SERVICE_ROLE_KEY` belum diset

**Solusi:**
1. Copy dari Supabase Dashboard > Settings > API
2. Tambahkan ke `.env.local`:
   ```
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

#### ❌ "Tidak ada guru ditemukan"

**Penyebab:**
- Database belum ada data guru

**Solusi:**
1. Buat akun guru melalui admin panel
2. Atau seed database dengan data guru

### Testing Manual (Alternatif)

Jika tidak ingin menggunakan script:

1. **Browser A**: Login sebagai guru
2. **Browser B**: Login sebagai admin
3. **Browser B**: Buka halaman Admin > Teachers Management
4. **Browser B**: Nonaktifkan atau hapus akun guru
5. **Browser A**: Modal notifikasi harus muncul

---

## 📚 Dokumentasi Terkait

- `docs/ACCOUNT_STATUS_NOTIFICATION.md` - Dokumentasi lengkap fitur notifikasi
- `docs/TESTING_ALERT_PATTERNS.md` - Panduan lengkap testing semua pola alert
- `docs/TELEGRAM_SETUP.md` - Setup Telegram bot
- `docs/ENHANCED_ALERT_SYSTEM.md` - Dokumentasi sistem alert


---

## 🔔 Test Notification System (NEW)

Script untuk menguji sistem notifikasi lengkap termasuk database triggers, table, dan statistik.

### Cara Menjalankan

```bash
npx tsx scripts/test-notifications.ts
```

### Apa yang Dilakukan Script Ini?

1. **Check notification table** - Verifikasi tabel notifikasi ada
2. **Check database triggers** - Verifikasi trigger otomatis
3. **Check active teachers** - Cek guru yang akan menerima notifikasi
4. **Create test notification** - Buat notifikasi test
5. **Check statistics** - Tampilkan statistik notifikasi
6. **Clean up** - Hapus notifikasi test

### Output yang Diharapkan

```
🧪 Testing Notification System

1️⃣ Checking notification table...
✅ Notification table exists

2️⃣ Checking database triggers...
✅ Triggers: [list of triggers]

3️⃣ Checking active teachers...
✅ Found 3 active teacher(s):
   - Ahmad Guru (guru1@example.com)
   - Siti Guru (guru2@example.com)
   - Budi Guru (guru3@example.com)

4️⃣ Creating test notification...
✅ Test notification created:
   ID: xxx-xxx-xxx
   Title: 🧪 Test Notification
   For: Ahmad Guru

5️⃣ Notification statistics...
   Total notifications: 15
   Unread: 5
   By type: { alert: 3, system: 10, summary: 2 }
   By priority: { urgent: 1, high: 2, normal: 10, low: 2 }

6️⃣ Cleaning up test notification...
✅ Test notification deleted

📊 Test Summary:
✅ Notification table: OK
✅ Active teachers: 3
✅ Create notification: OK
✅ Delete notification: OK

🎉 All tests passed!
```

---

## ⏰ Test Cron Jobs (NEW)

Script untuk menguji semua cron job endpoints (daily summary, weekly summary, missing check-ins).

### Prasyarat

1. ✅ Development server harus running:
   ```bash
   npm run dev
   ```

2. ✅ File `.env.local` sudah dikonfigurasi dengan:
   - `CRON_SECRET` - Secret key untuk autentikasi cron jobs

### Cara Menjalankan

```bash
npx tsx scripts/test-cron-jobs.ts
```

### Apa yang Dilakukan Script Ini?

1. **Test Daily Summary** - Ringkasan check-in harian
2. **Test Weekly Summary** - Ringkasan check-in mingguan
3. **Test Missing Check-ins** - Reminder siswa belum check-in

### Output yang Diharapkan

```
🔔 Testing Cron Jobs

Base URL: http://localhost:3000
CRON_SECRET: ✅ Set

🧪 Testing Daily Summary...
   URL: http://localhost:3000/api/cron/daily-summary
✅ Success!
   Response: {
     "success": true,
     "message": "Daily summary sent to 3 teachers",
     "stats": {
       "totalStudents": 50,
       "checkedInCount": 35,
       "checkinRate": 70,
       "happyCount": 20,
       "normalCount": 10,
       "stressedCount": 5
     }
   }

🧪 Testing Weekly Summary...
   URL: http://localhost:3000/api/cron/weekly-summary
✅ Success!
   Response: {
     "success": true,
     "message": "Weekly summary sent to 3 teachers",
     "stats": {
       "totalStudents": 50,
       "activeStudents": 45,
       "participationRate": 90,
       "totalCheckins": 280,
       "avgDailyCheckins": 40,
       "concerningStudents": 2,
       "trend": "Positif"
     }
   }

🧪 Testing Check Missing Check-ins...
   URL: http://localhost:3000/api/cron/check-missing-checkins
✅ Success!
   Response: {
     "success": true,
     "message": "Missing check-in alert sent to 3 teachers",
     "stats": {
       "totalStudents": 50,
       "checkedIn": 35,
       "missing": 15,
       "missingPercentage": 30
     }
   }


📊 Test Summary:
═══════════════════════════════════════
✅ Daily Summary: PASSED
✅ Weekly Summary: PASSED
✅ Check Missing Check-ins: PASSED
═══════════════════════════════════════
Total: 3 | Passed: 3 | Failed: 0

🎉 All cron jobs working correctly!

📝 Next Steps:
1. Make sure your dev server is running: npm run dev
2. Check that CRON_SECRET matches in .env.local
3. For production, deploy to Vercel with vercel.json
4. Verify cron jobs in Vercel Dashboard → Settings → Cron Jobs
```

### Troubleshooting

#### ❌ "CRON_SECRET not found"

**Solusi:**
```bash
# Tambahkan ke .env.local
CRON_SECRET=your-random-secret-key-here
```

#### ❌ "Failed to fetch" atau "Connection refused"

**Penyebab:**
- Development server belum running

**Solusi:**
```bash
npm run dev
```

#### ❌ "Unauthorized (401)"

**Penyebab:**
- CRON_SECRET tidak match

**Solusi:**
1. Pastikan CRON_SECRET sama di `.env.local` dan script
2. Restart dev server setelah update `.env.local`

---

## 📚 Dokumentasi Lengkap

Untuk dokumentasi lengkap sistem notifikasi, lihat:
- `docs/NOTIFICATION_SYSTEM_IMPLEMENTATION.md` - Implementasi lengkap 3 opsi
- `docs/NOTIFICATION_QUICK_GUIDE.md` - Panduan cepat
