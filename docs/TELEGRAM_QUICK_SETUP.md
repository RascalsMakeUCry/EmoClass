# Telegram Alert - Quick Setup (Tanpa Edge Function)

## Cara Mudah untuk Hackathon/Demo

Versi ini menggunakan Next.js API route, **tidak perlu Supabase CLI atau deploy Edge Function**.

---

## Step 1: Buat Telegram Bot (5 menit)

### 1.1 Buka Telegram

1. Buka aplikasi Telegram di HP/Desktop
2. Search: **@BotFather**
3. Klik **Start**

### 1.2 Buat Bot Baru

Ketik command ini satu per satu:

```
/newbot
```

BotFather tanya nama bot, ketik:
```
EmoClass Alert Bot
```

BotFather tanya username (harus diakhiri 'bot'), ketik:
```
emoclass_alert_bot
```
(Jika sudah dipakai, coba: `emoclass_alert_2024_bot`)

### 1.3 Simpan Bot Token

BotFather akan kasih token seperti ini:
```
1234567890:ABCdefGHIjklMNOpqrsTUVwxyz-123456
```

**📝 COPY dan SIMPAN token ini!**

---

## Step 2: Dapatkan Chat ID (2 menit)

### 2.1 Start Bot Anda

1. Search bot Anda di Telegram (username yang tadi dibuat)
2. Klik **Start**
3. Kirim pesan apa saja, misal: "test"

### 2.2 Dapatkan Chat ID

Buka browser dan paste URL ini (ganti `YOUR_BOT_TOKEN`):

```
https://api.telegram.org/botYOUR_BOT_TOKEN/getUpdates
```

**Contoh:**
```
https://api.telegram.org/bot1234567890:ABCdefGHI/getUpdates
```

Cari di response:
```json
"chat": {
  "id": 123456789,
  ...
}
```

Angka `123456789` adalah **Chat ID** Anda.

**📝 COPY dan SIMPAN Chat ID ini!**

---

## Step 3: Update Environment Variables (1 menit)

Edit file `.env.local` di folder `emoclass/`:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz-123456
TELEGRAM_CHAT_ID=123456789
```

Ganti dengan token dan chat ID Anda!

---

## Step 4: Restart Dev Server (30 detik)

```bash
# Stop server (Ctrl+C)
# Start lagi
npm run dev
```

---

## Step 5: Test Alert System (2 menit)

### 5.1 Buka Check-in Page

`http://localhost:3000`

### 5.2 Lakukan 3x Check-in Negatif

1. **Check-in 1:**
   - Pilih kelas: Kelas 7A
   - Pilih siswa: Ahmad Rizki
   - Pilih emoji: 😔 Sedih
   - Klik "Kirim Check-in"

2. **Check-in 2:**
   - Siswa yang sama: Ahmad Rizki
   - Emoji: 😔 Sedih atau 😴 Mengantuk
   - Klik "Kirim Check-in"

3. **Check-in 3:**
   - Siswa yang sama: Ahmad Rizki
   - Emoji: 😔 Sedih atau 😴 Mengantuk
   - Klik "Kirim Check-in"

### 5.3 Cek Telegram

Setelah check-in ke-3, Telegram harus menerima pesan:

```
🚨 EMOCLASS ALERT

Siswa Ahmad Rizki di kelas Kelas 7A menunjukkan emosi negatif 3 hari berturut-turut. Harap segera ditindaklanjuti.
```

---

## Troubleshooting

### ❌ Tidak ada pesan di Telegram

**Check 1: Environment variables**
```bash
# Pastikan .env.local sudah benar
cat .env.local
```

**Check 2: Restart server**
```bash
# Stop (Ctrl+C) dan start lagi
npm run dev
```

**Check 3: Browser console**
- Buka F12 > Console
- Cari error message

**Check 4: Test bot token manual**

Buka browser:
```
https://api.telegram.org/botYOUR_TOKEN/getMe
```

Harus return info bot. Jika error, token salah.

### ❌ Error: "Unauthorized"

**Penyebab:** Bot token salah

**Solusi:**
1. Check token di @BotFather: `/mybots` > pilih bot > API Token
2. Copy token yang benar
3. Update `.env.local`
4. Restart server

### ❌ Error: "Chat not found"

**Penyebab:** Chat ID salah atau belum start bot

**Solusi:**
1. Pastikan sudah klik **Start** di bot
2. Kirim pesan "test" ke bot
3. Dapatkan Chat ID lagi dari `/getUpdates`
4. Update `.env.local`
5. Restart server

### ❌ Alert terkirim tapi bukan ke saya

**Penyebab:** Chat ID salah

**Solusi:**
1. Verifikasi Chat ID dengan bot `@userinfobot`
2. Update `.env.local` dengan Chat ID yang benar
3. Restart server

---

## Cara Kerja

1. Setiap check-in disimpan ke database
2. Sistem check 3 check-in terakhir siswa tersebut
3. Jika 3x berturut-turut negatif (Sedih/Mengantuk) → Kirim alert
4. Alert dikirim via Telegram Bot API

---

## Tips untuk Demo Hackathon

### Persiapan:
1. ✅ Setup bot sebelum demo
2. ✅ Test alert 1x untuk memastikan bekerja
3. ✅ Simpan screenshot alert Telegram
4. ✅ Siapkan 2 device: 1 untuk check-in, 1 untuk dashboard

### Saat Demo:
1. Tunjukkan check-in page (mobile view)
2. Lakukan 3x check-in negatif
3. Tunjukkan dashboard (data update real-time)
4. **Show Telegram alert** yang masuk
5. Explain: "Guru BK langsung dapat notifikasi untuk follow-up"

### Highlight untuk Juri:
- ✨ **Automated early intervention** - tidak perlu manual monitoring
- ✨ **Real-time notification** - guru BK langsung tahu
- ✨ **Prevents students from falling through cracks**
- ✨ **Free solution** - Telegram gratis, tidak perlu WhatsApp Business

---

## Alternative: Simulasi Alert (Jika Telegram Gagal)

Jika saat demo Telegram tidak bekerja, gunakan simulasi:

1. Buat screenshot alert Telegram sebelumnya
2. Saat demo, show screenshot tersebut
3. Explain: "Dalam production, alert langsung terkirim ke Telegram guru BK"

Atau gunakan browser notification sebagai fallback (bisa saya buatkan jika perlu).

---

## Next Steps

Setelah alert bekerja:
- [ ] Test dengan siswa berbeda
- [ ] Test dengan emosi positif (tidak boleh alert)
- [ ] Test dengan 2x negatif + 1x positif (tidak boleh alert)
- [ ] Screenshot alert untuk dokumentasi
- [ ] Siapkan demo script

**Good luck untuk hackathon! 🚀**
