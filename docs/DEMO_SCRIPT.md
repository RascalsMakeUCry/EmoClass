# EmoClass - Demo Script untuk Hackathon

## 🎯 Durasi: 3 Menit

---

## Opening (15 detik)

**"Selamat pagi/siang. Nama saya [NAMA], dan ini adalah EmoClass."**

**Problem Statement:**
> "Guru nggak punya gambaran harian: hari ini murid lagi stres, ngantuk, atau baik-baik saja. Anak yang kesulitan sering 'hilang' di keramaian kelas."

**Solution:**
> "EmoClass adalah platform web yang membantu guru memantau kesejahteraan emosional siswa secara real-time, dengan alert otomatis untuk early intervention."

---

## Demo Part 1: Student Check-in (45 detik)

**[Tunjukkan HP/Mobile View]**

**"Pertama, dari sisi siswa - sangat sederhana:"**

1. **Buka** `http://localhost:3000` atau deployment URL
2. **Pilih kelas** - "Kelas 7A"
3. **Pilih nama** - "Ahmad Rizki"
4. **Pilih emoji** - 😔 Sedih
5. **Opsional catatan** - "Pusing, kurang tidur"
6. **Klik submit** - "Check-in berhasil!"

**Highlight:**
- ✨ "Hanya 10 detik per siswa"
- ✨ "Mobile-friendly untuk HP siswa"
- ✨ "100% Bahasa Indonesia"

---

## Demo Part 2: Teacher Dashboard (60 detik)

**[Switch ke Dashboard - Desktop/Tablet View]**

**"Sekarang dari sisi guru:"**

1. **Buka** `http://localhost:3000/dashboard`
2. **Pilih kelas** - "Kelas 7A"

**Tunjukkan 3 Fitur Utama:**

### A. Pie Chart (15 detik)
**"Distribusi emosi kelas secara visual"**
- Tunjukkan pie chart
- "Guru langsung tahu: berapa siswa senang, sedih, mengantuk"
- **Real-time**: Lakukan check-in lagi → Chart auto-update!

### B. Progress Indicator (10 detik)
**"Progress check-in hari ini"**
- "15 dari 30 siswa sudah check-in"
- "Guru tahu siapa yang belum lapor"

### C. Students Needing Attention (15 detik)
**"Yang paling penting - siswa yang perlu perhatian"**
- Tunjukkan list siswa dengan emosi negatif
- "Ahmad Rizki - Sedih - 'Pusing, kurang tidur'"
- "Guru bisa langsung follow-up"

### D. Real-time Update (20 detik)
**[Lakukan check-in di device lain]**
- "Saya check-in sekarang..."
- **Dashboard auto-update dalam 1-2 detik!**
- "Tidak perlu refresh manual"

---

## Demo Part 3: Automated Alert System (60 detik)

**"Fitur paling powerful - Alert Otomatis:"**

### Setup Context (15 detik)
**"Bayangkan Ahmad Rizki sudah 2 hari berturut-turut sedih."**
- Tunjukkan history check-in (jika ada)
- "Hari ini dia check-in sedih lagi - yang ke-3 kali"

### Trigger Alert (20 detik)
**[Lakukan check-in ke-3 dengan emosi negatif]**
1. Siswa: Ahmad Rizki
2. Emoji: 😴 Mengantuk
3. Submit

**"Sistem otomatis mendeteksi 3x emosi negatif berturut-turut..."**

### Show Telegram Alert (25 detik)
**[Tunjukkan HP dengan Telegram]**

**Alert yang diterima guru BK:**
```
🚨 EMOCLASS ALERT

Siswa Ahmad Rizki di kelas Kelas 7A 
menunjukkan emosi negatif 3 hari 
berturut-turut. Harap segera 
ditindaklanjuti.
```

**Highlight:**
- ✨ "Guru BK langsung dapat notifikasi"
- ✨ "Early intervention sebelum terlambat"
- ✨ "Tidak ada siswa yang 'hilang' di keramaian"

---

## Impact & Metrics (30 detik)

**"Kenapa EmoClass berbeda?"**

### 1. Automation
- ❌ **Dulu**: Guru observasi manual 15 menit per hari
- ✅ **Sekarang**: Otomatis, 10 detik per siswa

### 2. Early Detection
- ❌ **Dulu**: Siswa bermasalah baru ketahuan saat nilai turun
- ✅ **Sekarang**: Deteksi dini dalam 3 hari

### 3. Scalability
- ❌ **Dulu**: Sulit untuk kelas besar (30+ siswa)
- ✅ **Sekarang**: Real-time monitoring untuk semua siswa

### 4. Cost
- ✅ **100% Gratis** - Supabase, Vercel, Telegram free tier
- ✅ **Web-based** - Tidak perlu install app
- ✅ **Works on 3G** - Optimized untuk koneksi lambat

---

## Closing (10 detik)

**"EmoClass - Making learning smarter, fairer, and more human-centered."**

**"Empowering teachers to focus on teaching, not paperwork."**

**"Terima kasih!"**

---

## 🎬 Tips Presentasi

### Persiapan:
- [ ] Test semua fitur 1 jam sebelum demo
- [ ] Siapkan 2 device: 1 check-in, 1 dashboard
- [ ] Screenshot alert Telegram sebagai backup
- [ ] Clear browser cache untuk demo yang bersih
- [ ] Seed data: minimal 10 siswa per kelas

### Saat Demo:
- ✅ Bicara dengan percaya diri dan jelas
- ✅ Tunjukkan problem dulu, baru solution
- ✅ Highlight automation dan real-time
- ✅ Jangan terlalu teknis - fokus ke impact
- ✅ Siapkan backup plan jika internet lambat

### Jika Ada Masalah:
- **Internet lambat**: Gunakan screenshot/video
- **Realtime gagal**: Polling fallback akan handle
- **Telegram gagal**: Tunjukkan screenshot alert
- **Browser crash**: Siapkan backup device

---

## 🎯 Key Messages untuk Juri

### Problem:
- Guru tidak punya gambaran harian kondisi siswa
- Siswa yang kesulitan sering "hilang" di keramaian
- Manual monitoring tidak scalable

### Solution:
- Real-time emotional monitoring
- Automated early intervention
- Free, web-based, mobile-friendly

### Impact:
- Reduces teacher workload (15 min → 10 sec)
- Early detection (3 days vs weeks/months)
- No student falls through the cracks
- Scalable to rural schools (free + 3G-optimized)

### Innovation:
- Hybrid Realtime + Polling (reliable)
- Telegram integration (free alternative to WhatsApp)
- Property-based testing (68 tests, production-ready)
- Indonesian-first design

---

## 📊 Backup Slides (Jika Ditanya)

### Technical Stack:
- Next.js 14, Supabase, Vercel
- 100% free tier platforms
- 68 automated tests
- Mobile-first responsive design

### Scalability:
- Supabase free tier: 500MB database
- Vercel free tier: unlimited bandwidth
- Can handle 100+ schools
- No per-user cost

### Security:
- Row Level Security (RLS) di Supabase
- No authentication required (by design)
- Data isolated per class
- HTTPS encryption

### Future Roadmap:
- Teacher authentication
- Historical trend analysis
- Parent portal
- WhatsApp integration
- AI-powered insights

---

**Good luck! 🚀**

*Remember: Show impact, not just features!*
