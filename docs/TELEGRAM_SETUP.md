# Telegram Alert System Setup

## Overview

Sistem alert otomatis yang mengirim notifikasi Telegram ke guru BK ketika siswa menunjukkan 3x emosi negatif (Sedih/Mengantuk) berturut-turut.

---

## Step 1: Buat Telegram Bot

### 1.1 Buka Telegram dan cari @BotFather

1. Buka aplikasi Telegram
2. Search: `@BotFather`
3. Klik **Start**

### 1.2 Buat Bot Baru

1. Ketik: `/newbot`
2. BotFather akan tanya nama bot
3. Ketik nama: `EmoClass Alert Bot`
4. BotFather akan tanya username bot (harus unik dan diakhiri 'bot')
5. Ketik username: `emoclass_alert_bot` (atau variasi lain jika sudah dipakai)

### 1.3 Simpan Bot Token

BotFather akan memberikan token seperti ini:
```
1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
```

**SIMPAN TOKEN INI!** Anda akan butuh nanti.

---

## Step 2: Dapatkan Chat ID

### 2.1 Start Chat dengan Bot Anda

1. Search bot Anda di Telegram (username yang tadi dibuat)
2. Klik **Start** atau kirim pesan `/start`

### 2.2 Dapatkan Chat ID

**Cara 1: Menggunakan API (Mudah)**

1. Buka browser
2. Ganti `YOUR_BOT_TOKEN` dengan token Anda:
   ```
   https://api.telegram.org/botYOUR_BOT_TOKEN/getUpdates
   ```
3. Cari `"chat":{"id":123456789` di response
4. Angka `123456789` adalah Chat ID Anda

**Cara 2: Menggunakan Bot Lain**

1. Search `@userinfobot` di Telegram
2. Klik Start
3. Bot akan kirim Chat ID Anda

**SIMPAN CHAT ID INI!**

---

## Step 3: Deploy Supabase Edge Function

### 3.1 Install Supabase CLI

**Windows:**
```bash
npm install -g supabase
```

**Mac/Linux:**
```bash
brew install supabase/tap/supabase
```

### 3.2 Login ke Supabase

```bash
supabase login
```

Browser akan terbuka untuk login.

### 3.3 Link Project

```bash
cd emoclass
supabase link --project-ref YOUR_PROJECT_REF
```

**Cara dapat Project Ref:**
1. Buka Supabase Dashboard
2. Settings > General
3. Copy "Reference ID"

### 3.4 Set Environment Variables

```bash
supabase secrets set TELEGRAM_BOT_TOKEN=YOUR_BOT_TOKEN
supabase secrets set TELEGRAM_CHAT_ID=YOUR_CHAT_ID
```

Ganti `YOUR_BOT_TOKEN` dan `YOUR_CHAT_ID` dengan nilai yang tadi Anda simpan.

### 3.5 Deploy Edge Function

```bash
supabase functions deploy alert-detector
```

Tunggu sampai selesai. Anda akan dapat URL seperti:
```
https://YOUR_PROJECT.supabase.co/functions/v1/alert-detector
```

---

## Step 4: Setup Database Webhook

### 4.1 Buka Supabase Dashboard

1. Go to **Database** > **Webhooks**
2. Click **Create a new hook**

### 4.2 Configure Webhook

**Name:** `alert-detector-webhook`

**Table:** `emotion_checkins`

**Events:** Check **Insert**

**Type:** `HTTP Request`

**Method:** `POST`

**URL:** 
```
https://YOUR_PROJECT.supabase.co/functions/v1/alert-detector
```
(Ganti dengan URL edge function Anda)

**HTTP Headers:**
```
Content-Type: application/json
Authorization: Bearer YOUR_ANON_KEY
```
(Ganti `YOUR_ANON_KEY` dengan anon key dari Settings > API)

### 4.3 Save Webhook

Click **Create webhook**

---

## Step 5: Test Alert System

### 5.1 Test Manual

1. Buka `http://localhost:3000`
2. Pilih siswa (misal: Ahmad Rizki)
3. Check-in dengan emosi **Sedih** (😔)
4. Ulangi 2x lagi dengan emosi **Sedih** atau **Mengantuk**
5. Setelah check-in ke-3, Telegram harus menerima alert!

### 5.2 Verifikasi di Telegram

Pesan yang diterima:
```
🚨 EMOCLASS ALERT

Siswa Ahmad Rizki di kelas Kelas 7A menunjukkan emosi negatif 3 hari berturut-turut. Harap segera ditindaklanjuti.
```

### 5.3 Check Logs

Di Supabase Dashboard:
1. **Edge Functions** > **alert-detector** > **Logs**
2. Harus ada log: `"🚨 ALERT: 3 consecutive negative emotions detected!"`
3. Dan: `"✅ Telegram alert sent successfully"`

---

## Troubleshooting

### Error: "Telegram credentials missing"

**Solusi:**
```bash
supabase secrets set TELEGRAM_BOT_TOKEN=YOUR_TOKEN
supabase secrets set TELEGRAM_CHAT_ID=YOUR_CHAT_ID
```

### Error: "Unauthorized" di Telegram

**Penyebab:** Bot token salah

**Solusi:**
1. Check token di @BotFather dengan `/mybots`
2. Set ulang: `supabase secrets set TELEGRAM_BOT_TOKEN=CORRECT_TOKEN`

### Error: "Chat not found"

**Penyebab:** Chat ID salah atau belum start bot

**Solusi:**
1. Pastikan sudah klik Start di bot
2. Verifikasi Chat ID dengan `@userinfobot`
3. Set ulang: `supabase secrets set TELEGRAM_CHAT_ID=CORRECT_ID`

### Webhook tidak trigger

**Solusi:**
1. Check webhook di Database > Webhooks
2. Pastikan status "Enabled"
3. Test webhook dengan "Send test webhook"
4. Check logs di Edge Functions

### Alert tidak terkirim setelah 3 check-in

**Solusi:**
1. Check Edge Function logs
2. Pastikan 3 check-in terakhir adalah emosi negatif (Sedih/Mengantuk)
3. Pastikan dari siswa yang sama
4. Check webhook configuration

---

## Alternative: Test Tanpa Deploy

Jika tidak bisa deploy Edge Function, gunakan API route sebagai alternatif:

1. Buat file `app/api/alert-check/route.ts`
2. Implement logic yang sama
3. Call API ini setelah setiap check-in
4. Kirim Telegram alert dari Next.js API route

Dokumentasi lengkap ada di `ALTERNATIVE_ALERT.md` (jika diperlukan).

---

## Production Checklist

- [ ] Bot token tersimpan di Supabase secrets
- [ ] Chat ID tersimpan di Supabase secrets
- [ ] Edge function deployed
- [ ] Webhook configured dan enabled
- [ ] Test alert berhasil terkirim
- [ ] Logs menunjukkan no errors
- [ ] Bot sudah di-start oleh guru BK

---

## Monitoring

**Check alert history:**
1. Supabase Dashboard > Edge Functions > alert-detector > Logs
2. Filter by "ALERT" untuk lihat semua alert yang terkirim

**Check webhook status:**
1. Database > Webhooks > alert-detector-webhook
2. Lihat "Recent deliveries" untuk status

**Telegram bot info:**
1. Chat dengan @BotFather
2. `/mybots` > pilih bot Anda > Bot Settings
