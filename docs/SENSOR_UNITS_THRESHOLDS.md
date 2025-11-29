# 📊 Sensor Units & Thresholds - Dokumentasi Lengkap

## Overview

Dokumen ini menjelaskan **satuan** dan **ambang batas** untuk setiap sensor IoT yang digunakan dalam Environment Alert Card.

---

## 🌡️ **1. Suhu (Temperature)**

### **Satuan: °C (Celsius)**

| Range | Status | Level | Contoh | Keterangan |
|-------|--------|-------|--------|------------|
| **< 20°C** | ❄️ Dingin | ⚠️ Warning | 18°C | Terlalu dingin, siswa kedinginan |
| **20-30°C** | ✅ Normal | ✅ Safe | 25°C | Suhu ideal untuk belajar |
| **30-35°C** | 🌡️ Panas | ⚠️ Warning | 32°C | Mulai tidak nyaman, berkeringat |
| **≥ 35°C** | 🔥 Sangat Panas | 🚨 Danger | 37°C | Berbahaya, risiko heat stress |

### **Rekomendasi Berdasarkan Suhu:**
- **18°C** → "Tutup jendela atau nyalakan pemanas ruangan"
- **25°C** → Kondisi ideal, tidak ada rekomendasi
- **32°C** → "Nyalakan AC atau buka jendela untuk sirkulasi udara"
- **37°C** → "🚨 SEGERA nyalakan AC atau pindah ke ruangan lebih sejuk"

### **Standar Internasional:**
- **ASHRAE 55**: 20-26°C (thermal comfort zone)
- **WHO**: 18-24°C (recommended indoor temperature)
- **Indonesia**: 23-26°C (SNI untuk ruang kelas ber-AC)

---

## 💧 **2. Kelembaban (Humidity)**

### **Satuan: % (Persen)**

| Range | Status | Level | Contoh | Keterangan |
|-------|--------|-------|--------|------------|
| **< 30%** | 🏜️ Kering | ⚠️ Warning | 25% | Udara terlalu kering, iritasi mata/kulit |
| **30-70%** | ✅ Normal | ✅ Safe | 50% | Kelembaban ideal |
| **70-85%** | 💦 Lembap | ⚠️ Warning | 75% | Mulai lembap, tidak nyaman |
| **≥ 85%** | 💧 Sangat Lembap | 🚨 Danger | 90% | Terlalu lembap, risiko jamur |

### **Rekomendasi Berdasarkan Kelembaban:**
- **25%** → "Gunakan humidifier atau letakkan wadah air di ruangan"
- **50%** → Kondisi ideal, tidak ada rekomendasi
- **75%** → "Buka jendela untuk mengurangi kelembaban"
- **90%** → "Gunakan dehumidifier atau tingkatkan ventilasi"

### **Standar Internasional:**
- **ASHRAE 55**: 30-60% (comfort zone)
- **WHO**: 40-70% (healthy indoor humidity)
- **EPA**: 30-50% (prevent mold growth)

---

## 🌫️ **3. Kualitas Udara (Gas/Air Quality)**

### **Satuan: ppm (parts per million)**

| Range | Status | Level | Contoh | Keterangan |
|-------|--------|-------|--------|------------|
| **< 1000 ppm** | ✅ Aman | ✅ Safe | 500 ppm | Kualitas udara baik |
| **1000-1500 ppm** | ⚡ Waspada | ⚠️ Warning | 1200 ppm | Mulai ada polusi, ventilasi kurang |
| **1500-2000 ppm** | ⚡ Waspada | ⚠️ Warning | 1800 ppm | Kualitas udara menurun |
| **≥ 2000 ppm** | ⚠️ Berbahaya | 🚨 Danger | 2500 ppm | Udara buruk, butuh evakuasi |

### **Rekomendasi Berdasarkan Kualitas Udara:**
- **500 ppm** → Kondisi ideal, tidak ada rekomendasi
- **1200 ppm** → "Buka jendela untuk sirkulasi udara segar"
- **1800 ppm** → "Buka jendela untuk sirkulasi udara segar"
- **2500 ppm** → "🚨 BAHAYA! Evakuasi siswa dan buka semua jendela"

### **Standar CO2 (jika sensor mengukur CO2):**
- **< 600 ppm**: Outdoor air quality
- **600-1000 ppm**: Good indoor air quality
- **1000-1500 ppm**: Acceptable (ventilasi kurang)
- **1500-2000 ppm**: Poor (mengantuk, konsentrasi menurun)
- **> 2000 ppm**: Very poor (sakit kepala, mual)

### **Catatan:**
Sensor gas bisa mendeteksi:
- **CO2** (Carbon Dioxide) - indikator ventilasi
- **VOC** (Volatile Organic Compounds) - dari cat, furniture, dll
- **CO** (Carbon Monoxide) - dari pembakaran
- **Gas berbahaya lainnya**

---

## 💡 **4. Kecerahan (Brightness/Light)**

### **Satuan: lux (lumen per meter persegi)**

| Range | Status | Level | Contoh | Keterangan |
|-------|--------|-------|--------|------------|
| **< 1000 lux** | 🌙 Gelap | ⚠️ Warning | 500 lux | Terlalu gelap, mata lelah |
| **1000-1500 lux** | 💡 Redup | ⚠️ Warning | 1200 lux | Kurang terang untuk belajar |
| **1500-2500 lux** | ✅ Normal | ✅ Safe | 2000 lux | Pencahayaan ideal |
| **> 2500 lux** | ☀️ Sangat Terang | ⚠️ Warning | 3000 lux | Terlalu terang, silau |

### **Rekomendasi Berdasarkan Kecerahan:**
- **500 lux** → "Nyalakan lampu untuk pencahayaan yang lebih baik"
- **1200 lux** → "Nyalakan lampu untuk pencahayaan yang lebih baik"
- **2000 lux** → Kondisi ideal, tidak ada rekomendasi
- **3000 lux** → "Tutup tirai atau kurangi intensitas cahaya"

### **Standar Pencahayaan Ruang Kelas:**
- **SNI 03-6575-2001**: 250-350 lux (ruang kelas umum)
- **ISO 8995**: 300-500 lux (classroom)
- **IESNA**: 500-750 lux (reading/writing tasks)
- **Ideal untuk detail work**: 750-1000 lux

### **Referensi Pencahayaan:**
- **0-50 lux**: Malam hari (bulan purnama ~1 lux)
- **50-100 lux**: Ruangan sangat redup
- **100-300 lux**: Ruangan redup (minimal untuk membaca)
- **300-500 lux**: Ruang kelas standar
- **500-1000 lux**: Ruang kerja/belajar
- **1000-2000 lux**: Supermarket, retail
- **10,000-25,000 lux**: Siang hari outdoor (cloudy)
- **32,000-100,000 lux**: Siang hari outdoor (sunny)

---

## 🔊 **5. Kebisingan (Sound/Noise)**

### **Satuan: dB (Decibel)**

| Range | Status | Level | Contoh | Keterangan |
|-------|--------|-------|--------|------------|
| **< 800 dB** | 🤫 Tenang | ✅ Safe | 25 dB | Sangat tenang, ideal untuk konsentrasi |
| **800-1500 dB** | ✅ Normal | ✅ Safe | 45 dB | Tingkat kebisingan normal |
| **1500-2000 dB** | 📢 Agak Berisik | ⚠️ Warning | 60 dB | Mulai mengganggu konsentrasi |
| **≥ 2000 dB** | 🔊 Berisik | 🚨 Danger | 75 dB | Terlalu berisik, sulit fokus |

### **Rekomendasi Berdasarkan Kebisingan:**
- **25 dB** → Kondisi ideal, tidak ada rekomendasi
- **45 dB** → Kondisi normal, tidak ada rekomendasi
- **60 dB** → "Tingkat kebisingan agak tinggi, perhatikan konsentrasi siswa"
- **75 dB** → "Kelas terlalu berisik, coba aktivitas yang lebih tenang"

### **Standar Kebisingan Ruang Kelas:**
- **WHO**: < 35 dB (background noise in classroom)
- **ANSI S12.60**: 35 dB (unoccupied classroom)
- **Indonesia (KEP-48/1996)**: 45-55 dB (ruang kelas)

### **Referensi Tingkat Kebisingan:**
- **0 dB**: Threshold of hearing (batas pendengaran)
- **10 dB**: Napas normal
- **20 dB**: Bisikan, perpustakaan sangat tenang
- **30 dB**: Perpustakaan, ruangan tenang
- **40 dB**: Ruang kelas tenang, rumah tenang
- **50 dB**: Percakapan normal, kantor tenang
- **60 dB**: Percakapan ramai, restoran
- **70 dB**: Vacuum cleaner, traffic
- **80 dB**: Alarm clock, blender
- **90 dB**: Lawnmower, motorcycle
- **100 dB**: Chainsaw, nightclub
- **110 dB**: Rock concert, car horn
- **120 dB**: Threshold of pain (batas sakit)

### **Catatan Penting:**
- **< 40 dB**: Ideal untuk belajar dan konsentrasi
- **40-55 dB**: Acceptable untuk ruang kelas
- **55-70 dB**: Mengganggu konsentrasi
- **> 70 dB**: Berbahaya untuk pendengaran jika lama
- **> 85 dB**: Butuh ear protection jika exposure lama

---

## 🎯 **Prioritas Alert Level**

### **🚨 DANGER (Merah)** - Butuh Tindakan Segera
Kondisi berbahaya yang memerlukan tindakan immediate:
- Suhu ≥ 35°C (risiko heat stroke)
- Kelembaban ≥ 85% (risiko jamur, sulit bernapas)
- Gas ≥ 2000 ppm (kualitas udara sangat buruk)
- Kebisingan ≥ 2000 dB (terlalu berisik, tidak bisa belajar)

### **⚠️ WARNING (Kuning)** - Perlu Perhatian
Kondisi tidak ideal yang perlu diperbaiki:
- Suhu < 20°C atau 30-35°C
- Kelembaban < 30% atau 70-85%
- Gas 1000-2000 ppm
- Cahaya < 1000 atau > 2500 lux
- Kebisingan 1500-2000 dB

### **✅ SAFE (Hijau)** - Kondisi Ideal
Kondisi optimal untuk belajar:
- Suhu 20-30°C (ideal: 23-26°C)
- Kelembaban 30-70% (ideal: 40-60%)
- Gas < 1000 ppm (ideal: < 600 ppm)
- Cahaya 1500-2500 lux (ideal: 500-750 lux)
- Kebisingan < 1500 dB (ideal: < 40 dB)

---

## 📱 **Tampilan di UI**

### **Sensor Readings Card:**
```
┌─────────────────────────────────────┐
│ Suhu              Kelembaban        │
│ 25.4°C            58.3%             │
│                                      │
│ Kualitas Udara    Kecerahan         │
│ 196 ppm           4053 lux          │
│                                      │
│ Kebisingan                          │
│ 61 dB                               │
└─────────────────────────────────────┘
```

### **Issues & Recommendations:**
```
⚠️ Masalah Terdeteksi:
• Kecerahan: 4053 lux (☀️ Sangat Terang)

💡 Rekomendasi:
→ Tutup tirai atau kurangi intensitas cahaya
```

---

## 🔧 **Kalibrasi Sensor**

### **Jika Nilai Sensor Tidak Akurat:**

1. **Suhu**: Bandingkan dengan termometer standar
2. **Kelembaban**: Gunakan hygrometer kalibrasi
3. **Gas**: Kalibrasi dengan udara outdoor (~ 400 ppm CO2)
4. **Cahaya**: Gunakan light meter profesional
5. **Suara**: Gunakan sound level meter kalibrasi

### **Adjust Threshold Jika Perlu:**

Edit `lib/environment-helper.ts`:
```typescript
const THRESHOLDS = {
  temperature: {
    cold: 20,    // Sesuaikan dengan iklim lokal
    hot: 30,
    extreme: 35,
  },
  // ... dst
};
```

---

## 📚 **Referensi Standar**

- **ASHRAE 55-2020**: Thermal Environmental Conditions
- **WHO Guidelines**: Indoor Air Quality
- **ISO 7730**: Ergonomics of thermal environments
- **ISO 8995**: Lighting of work places
- **ANSI S12.60**: Acoustical Performance Criteria
- **SNI 03-6572-2001**: Tata cara perancangan sistem ventilasi
- **SNI 03-6575-2001**: Tata cara perancangan sistem pencahayaan

---

**Dokumen ini dapat disesuaikan dengan kondisi lokal sekolah Anda!** 🎯
