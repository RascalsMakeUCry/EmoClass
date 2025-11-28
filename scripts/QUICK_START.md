# 🚀 Quick Start - Test Telegram Alert

## Cara Cepat Test Alert 3 Hari Berturut-turut

### 1. Pastikan Development Server Running

Buka terminal pertama:
```bash
npm run dev
```

Biarkan tetap running!

### 2. Pilih Cara Testing

#### Opsi A: Quick Test (Otomatis) 🚀
Langsung test dengan siswa pertama dan emosi "Sedih":
```bash
npm run test:sad-alert
```

#### Opsi B: Interactive Test (Pilih Sendiri) 🎮
Pilih siswa dan jenis emosi sendiri:
```bash
npm run test:alert
```

**Rekomendasi:** Gunakan Interactive Test untuk lebih fleksibel!

### 3. Lihat Hasilnya

Script akan:
- ✅ Pilih 1 siswa dari database
- ✅ Insert 3 check-in "Sedih" berturut-turut
- ✅ Trigger alert API
- ✅ Kirim notifikasi ke Telegram (jika sudah dikonfigurasi)

### 4. Cek Telegram

Buka aplikasi Telegram dan cek bot Anda. Seharusnya ada pesan:

```
🚨 EMOCLASS ALERT - PERLU PERHATIAN KHUSUS

👤 Siswa: [Nama Siswa]
📚 Kelas: [Nama Kelas]
😔 Pola: Emosi sedih/tertekan selama 3 hari berturut-turut

⚠️ REKOMENDASI TINDAK LANJUT GURU BK:
1. 🗣️ Lakukan konseling individual segera
2. 🏠 Hubungi orang tua/wali untuk koordinasi
...
```

## ⚠️ Jika Telegram Tidak Terkirim

Pastikan `.env.local` sudah diisi:

```env
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_CHAT_ID=your_chat_id_here
```

Lihat `docs/TELEGRAM_SETUP.md` untuk setup lengkap.

## 🔄 Menjalankan Ulang

Script bisa dijalankan berkali-kali. Setiap kali dijalankan, data lama akan dihapus dan diganti dengan data testing baru.

```bash
npm run test:sad-alert
```

## 📖 Dokumentasi Lengkap

- `scripts/README.md` - Dokumentasi lengkap script testing
- `docs/TESTING_ALERT_PATTERNS.md` - Testing semua pola alert (sedih, mengantuk, normal)
- `docs/TELEGRAM_SETUP.md` - Setup Telegram bot dari awal
