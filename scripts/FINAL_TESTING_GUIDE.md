# 🎯 Panduan Lengkap Testing Telegram Alert

## 📋 Ringkasan

Anda sekarang memiliki **2 cara** untuk testing fitur Telegram Alert:

### 1. 🚀 Quick Test (Otomatis)
```bash
npm run test:sad-alert
```
- ✅ Cepat dan mudah
- ✅ Langsung test dengan siswa pertama
- ✅ Emosi: Sedih (😔)
- ✅ Cocok untuk quick check

### 2. 🎮 Interactive Test (Pilih Sendiri)
```bash
npm run test:alert
```
- ✅ Pilih siswa sendiri
- ✅ Pilih jenis emosi (Sedih, Mengantuk, Normal)
- ✅ Lebih fleksibel
- ✅ Cocok untuk testing lengkap

---

## 🎬 Demo untuk Hackathon

### Skenario 1: Demo Alert "Sedih" (Priority TINGGI)

**Persiapan:**
1. Buka 2 terminal
2. Terminal 1: `npm run dev`
3. Terminal 2: `npm run test:alert`

**Langkah Demo:**
1. Pilih siswa (misal: Ahmad Rizki)
2. Pilih emosi: **1** (Sedih/Tertekan)
3. Konfirmasi: **y**
4. Tunggu proses selesai
5. **Tunjukkan Telegram notification ke juri!**

**Pesan yang akan muncul:**
```
🚨 EMOCLASS ALERT - PERLU PERHATIAN KHUSUS

👤 Siswa: Ahmad Rizki
📚 Kelas: Kelas 7A
😔 Pola: Emosi sedih/tertekan selama 3 hari berturut-turut

⚠️ REKOMENDASI TINDAK LANJUT GURU BK:
1. 🗣️ Lakukan konseling individual segera
2. 🏠 Hubungi orang tua/wali untuk koordinasi
3. 👥 Pertimbangkan sesi kelompok dukungan sebaya
4. 📋 Evaluasi faktor akademik atau sosial
5. 💚 Pantau perkembangan emosi harian minggu depan

📅 Tindakan: Jadwalkan pertemuan dalam 1-2 hari kerja
⏰ Prioritas: TINGGI
```

---

### Skenario 2: Demo Alert "Mengantuk" (Priority SEDANG)

**Langkah Demo:**
1. Jalankan: `npm run test:alert`
2. Pilih siswa berbeda (misal: Siti Nurhaliza)
3. Pilih emosi: **2** (Mengantuk/Lelah)
4. Konfirmasi: **y**
5. **Tunjukkan Telegram notification!**

**Pesan yang akan muncul:**
```
🚨 EMOCLASS ALERT - PERHATIAN KESEHATAN

👤 Siswa: Siti Nurhaliza
📚 Kelas: Kelas 7A
😴 Pola: Mengantuk/kelelahan selama 3 hari berturut-turut

⚠️ REKOMENDASI TINDAK LANJUT GURU BK:
1. 🛏️ Tanyakan pola tidur dan kesehatan siswa
2. 📱 Evaluasi penggunaan gadget sebelum tidur
3. 🏠 Konsultasi dengan orang tua tentang rutinitas malam
4. 🏥 Pertimbangkan rujukan ke tenaga kesehatan jika perlu
5. 💡 Edukasi pentingnya sleep hygiene dan istirahat cukup
6. 📚 Evaluasi beban tugas dan kegiatan ekstrakurikuler

📅 Tindakan: Konseling ringan dalam 2-3 hari
⏰ Prioritas: SEDANG
```

---

### Skenario 3: Demo Alert "Normal" (Priority RENDAH)

**Langkah Demo:**
1. Jalankan: `npm run test:alert`
2. Pilih siswa lain (misal: Budi Santoso)
3. Pilih emosi: **3** (Biasa Saja/Normal)
4. Konfirmasi: **y**
5. **Tunjukkan Telegram notification!**

**Pesan yang akan muncul:**
```
ℹ️ EMOCLASS MONITORING - PEMANTAUAN RUTIN

👤 Siswa: Budi Santoso
📚 Kelas: Kelas 8B
🙂 Pola: Energi normal/datar selama 3 hari berturut-turut

⚠️ REKOMENDASI TINDAK LANJUT GURU BK:
1. 💬 Lakukan check-in informal untuk memahami kondisi siswa
2. 🎯 Evaluasi motivasi dan engagement di kelas
3. 🌟 Cari peluang untuk meningkatkan keterlibatan positif
4. 🤝 Pertimbangkan aktivitas yang bisa meningkatkan semangat
5. 📊 Pantau apakah ini pola konsisten atau fase sementara

📅 Tindakan: Observasi dan check-in informal minggu ini
⏰ Prioritas: RENDAH - Monitoring
```

---

## 💡 Tips untuk Demo Hackathon

### Persiapan Sebelum Demo:
1. ✅ Test semua 3 skenario sebelum demo
2. ✅ Screenshot Telegram notifications sebagai backup
3. ✅ Pastikan Telegram bot sudah di-start
4. ✅ Pastikan internet stabil
5. ✅ Buka Telegram di device yang mudah ditunjukkan

### Talking Points untuk Juri:
1. **Problem**: "Guru BK tidak bisa monitor 500+ siswa manual setiap hari"
2. **Solution**: "EmoClass otomatis detect pola emosi dan kirim alert"
3. **Smart Detection**: "Sistem detect 3 jenis pola dengan priority berbeda"
4. **Actionable**: "Setiap alert punya rekomendasi tindak lanjut yang jelas"
5. **Automated**: "Zero manual work - semua otomatis real-time"

### Highlight Fitur:
- 🎯 **Multi-pattern detection** - Tidak hanya negatif, tapi juga flat energy
- 📊 **Priority levels** - HIGH, MEDIUM, LOW untuk triage
- 💡 **Structured recommendations** - Guru BK tahu harus ngapain
- ⚡ **Real-time** - Alert langsung terkirim setelah check-in ke-3
- 🌐 **Telegram integration** - Platform yang sudah familiar

---

## 🔧 Troubleshooting

### ❌ "Telegram notification TIDAK terkirim"

**Cek:**
1. File `.env.local` ada `TELEGRAM_BOT_TOKEN` dan `TELEGRAM_CHAT_ID`
2. Bot token valid (cek di @BotFather)
3. Sudah klik "Start" di bot Telegram
4. Restart dev server setelah update `.env.local`

**Fix:**
```bash
# Edit .env.local
TELEGRAM_BOT_TOKEN=your_token_here
TELEGRAM_CHAT_ID=your_chat_id_here

# Restart server
# Ctrl+C di terminal dev server
npm run dev
```

### ❌ "Error saat memanggil API"

**Penyebab:** Dev server belum running

**Fix:**
```bash
npm run dev
```

### ❌ "Tidak bisa mengambil data siswa"

**Penyebab:** Database belum ada data

**Fix:**
Lihat `docs/SUPABASE_SETUP.md` untuk seed database

---

## 📊 Hasil Testing Anda

Berdasarkan testing yang sudah dilakukan:

```
✅ Script testing berhasil dibuat
✅ Quick test (otomatis) berfungsi
✅ Interactive test (pilih sendiri) tersedia
✅ Telegram notification terkirim dengan benar
✅ Semua 3 pola alert berfungsi (Sedih, Mengantuk, Normal)
✅ Priority levels benar (TINGGI, SEDANG, RENDAH)
✅ Rekomendasi tindak lanjut sesuai dengan pola
```

**Status: SIAP UNTUK DEMO HACKATHON! 🎉**

---

## 📖 Dokumentasi Lengkap

- **Quick Start**: `scripts/QUICK_START.md`
- **Script Details**: `scripts/README.md`
- **Testing Manual**: `docs/TESTING_ALERT_PATTERNS.md`
- **Telegram Setup**: `docs/TELEGRAM_SETUP.md`
- **Alert System**: `docs/ENHANCED_ALERT_SYSTEM.md`

---

## 🎯 Next Steps

1. **Test semua skenario** - Pastikan semua 3 pola alert berfungsi
2. **Screenshot notifications** - Backup untuk demo
3. **Practice demo flow** - Latihan presentasi
4. **Prepare talking points** - Siapkan penjelasan untuk juri
5. **Check internet** - Pastikan koneksi stabil saat demo

**Good luck dengan hackathon! 🚀**
