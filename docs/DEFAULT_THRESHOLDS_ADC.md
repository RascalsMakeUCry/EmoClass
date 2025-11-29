# 📊 Default Thresholds untuk Sensor ADC

## Overview

Ini adalah **threshold umum** yang sudah di-set berdasarkan karakteristik sensor yang umum digunakan. Threshold ini bisa langsung dipakai untuk demo/hackathon tanpa perlu testing ekstensif.

---

## 🎯 **Threshold yang Sudah Di-set**

### **1. 🌡️ Temperature (DHT11)** - Sudah Dikalibrasi

| Range | Status | Threshold | Keterangan |
|-------|--------|-----------|------------|
| **< 20°C** | ❄️ Dingin | `cold: 20` | Terlalu dingin |
| **20-30°C** | ✅ Normal | - | Suhu ideal |
| **30-35°C** | 🌡️ Panas | `hot: 30` | Mulai panas |
| **≥ 35°C** | 🔥 Sangat Panas | `extreme: 35` | Berbahaya |

**Satuan**: °C (Celsius)  
**Status**: ✅ Sudah dikalibrasi oleh library DHT

---

### **2. 💧 Humidity (DHT11)** - Sudah Dikalibrasi

| Range | Status | Threshold | Keterangan |
|-------|--------|-----------|------------|
| **< 30%** | 🏜️ Kering | `dry: 30` | Udara kering |
| **30-70%** | ✅ Normal | - | Kelembaban ideal |
| **70-85%** | 💦 Lembap | `humid: 70` | Mulai lembap |
| **≥ 85%** | 💧 Sangat Lembap | `extreme: 85` | Terlalu lembap |

**Satuan**: % RH (Relative Humidity)  
**Status**: ✅ Sudah dikalibrasi oleh library DHT

---

### **3. 🌫️ Gas Sensor (MQ-2/MQ-135)** - ADC Value

| Range | Status | Threshold | Keterangan |
|-------|--------|-----------|------------|
| **< 500** | ✅ Aman | `safe: 500` | Udara bersih |
| **500-1000** | ⚡ Waspada | `warning: 1000` | Mulai terdeteksi gas |
| **1000-1500** | ⚡ Waspada | - | Kualitas udara menurun |
| **≥ 1500** | ⚠️ Berbahaya | `danger: 1500` | Udara buruk |

**Satuan**: ADC (0-4095)  
**Karakteristik**: Lower = cleaner, Higher = more pollution

**Contoh Nilai Real:**
- Outdoor (udara bersih): 100-300 ADC
- Indoor normal: 300-800 ADC
- Ruang pengap: 800-1500 ADC
- Banyak orang/AC mati lama: > 1500 ADC

**Basis Threshold:**
- Berdasarkan pengalaman umum dengan MQ-2/MQ-135
- Sensor ini sensitif terhadap CO2, CO, smoke, alcohol
- Nilai akan naik signifikan di ruangan tertutup dengan banyak orang

---

### **4. 💡 Light Sensor (LDR)** - ADC Value

| Range | Status | Threshold | Keterangan |
|-------|--------|-----------|------------|
| **< 1000** | 🌙 Gelap | `dark: 1000` | Lampu mati/senja |
| **1000-2000** | 💡 Redup | `dim: 2000` | Beberapa lampu |
| **2000-3500** | ✅ Normal | - | Pencahayaan baik |
| **> 3500** | ☀️ Sangat Terang | `bright: 3500` | Siang hari + lampu |

**Satuan**: ADC (0-4095)  
**Karakteristik**: Lower = darker, Higher = brighter

**Contoh Nilai Real:**
- Malam/gelap total: 0-500 ADC
- Lampu redup: 500-1500 ADC
- Lampu kelas nyala semua: 1500-3000 ADC
- Siang hari (jendela terbuka): 3000-4095 ADC

**Basis Threshold:**
- LDR resistance menurun saat cahaya meningkat
- Dengan pull-down resistor 10kΩ, range ADC akan proporsional dengan cahaya
- Threshold di-set untuk ruang kelas dengan lampu fluorescent standar

---

### **5. 🔊 Sound Sensor (Microphone)** - ADC Value

| Range | Status | Threshold | Keterangan |
|-------|--------|-----------|------------|
| **< 500** | 🤫 Tenang | `quiet: 500` | Sangat tenang |
| **500-1000** | ✅ Normal | `normal: 1000` | Percakapan normal |
| **1000-1500** | 📢 Agak Berisik | - | Mulai ramai |
| **≥ 1500** | 🔊 Berisik | `noisy: 1500` | Terlalu berisik |

**Satuan**: ADC (0-4095)  
**Karakteristik**: Lower = quieter, Higher = louder

**Contoh Nilai Real:**
- Kelas kosong/tenang: 100-400 ADC
- Belajar normal: 400-800 ADC
- Diskusi kelompok: 800-1200 ADC
- Istirahat/ramai: 1200-2000 ADC
- Sangat berisik: > 2000 ADC

**Basis Threshold:**
- Microphone module biasanya punya gain yang bisa di-adjust
- Threshold di-set untuk gain medium (potensiometer di tengah)
- Nilai baseline (silence) biasanya sekitar 2048 (tengah ADC), tapi dengan rectification bisa lebih rendah

---

## 🔧 **Cara Kerja Threshold**

### **Gas Sensor (MQ)**
```typescript
if (gas_analog < 500) {
  status = "✅ Aman";
  level = "safe";
} else if (gas_analog < 1000) {
  status = "⚡ Waspada";
  level = "warning";
} else if (gas_analog < 1500) {
  status = "⚡ Waspada";
  level = "warning";
} else {
  status = "⚠️ Berbahaya";
  level = "danger";
}
```

### **Light Sensor (LDR)**
```typescript
if (light_analog < 1000) {
  status = "🌙 Gelap";
  level = "warning";
} else if (light_analog < 2000) {
  status = "💡 Redup";
  level = "warning";
} else if (light_analog <= 3500) {
  status = "✅ Normal";
  level = "safe";
} else {
  status = "☀️ Sangat Terang";
  level = "warning";
}
```

### **Sound Sensor (Mic)**
```typescript
if (sound_analog < 500) {
  status = "🤫 Tenang";
  level = "safe";
} else if (sound_analog < 1000) {
  status = "✅ Normal";
  level = "safe";
} else if (sound_analog < 1500) {
  status = "📢 Agak Berisik";
  level = "warning";
} else {
  status = "🔊 Berisik";
  level = "danger";
}
```

---

## 📊 **Visualisasi Range ADC**

### **Gas Sensor (0-4095)**
```
0────500────1000────1500────2000────3000────4095
│  Aman  │ Waspada │ Bahaya │  Sangat Bahaya  │
└────────┴─────────┴────────┴─────────────────┘
```

### **Light Sensor (0-4095)**
```
0────1000────2000────3500────4095
│ Gelap │ Redup │ Normal │ Terang │
└───────┴───────┴────────┴────────┘
```

### **Sound Sensor (0-4095)**
```
0────500────1000────1500────2000────4095
│ Tenang │ Normal │ Berisik │ Sangat Berisik │
└────────┴────────┴─────────┴────────────────┘
```

---

## ✅ **Keuntungan Threshold Ini**

1. ✅ **Langsung Pakai** - Tidak perlu testing ekstensif
2. ✅ **Berdasarkan Pengalaman** - Dari karakteristik sensor umum
3. ✅ **Conservative** - Lebih baik false positive daripada miss alert
4. ✅ **Mudah Di-adjust** - Tinggal edit 1 file jika perlu

---

## 🔄 **Cara Adjust Jika Perlu**

### **Jika Alert Terlalu Sensitif:**
Naikkan threshold:
```typescript
gas: {
  safe: 500 → 700,      // Naikkan 200
  warning: 1000 → 1200,
  danger: 1500 → 1800,
}
```

### **Jika Alert Kurang Sensitif:**
Turunkan threshold:
```typescript
gas: {
  safe: 500 → 300,      // Turunkan 200
  warning: 1000 → 800,
  danger: 1500 → 1200,
}
```

### **Edit File:**
`lib/environment-helper.ts` → Bagian `THRESHOLDS`

---

## 📝 **Testing Recommendations**

Meskipun threshold ini bisa langsung dipakai, untuk hasil optimal:

### **Quick Test (5 menit):**
1. Pasang sensor di ruang kelas
2. Buka dashboard, lihat nilai ADC real-time
3. Coba kondisi berbeda:
   - Lampu mati/nyala (light)
   - Jendela tutup/buka (gas)
   - Kelas tenang/ramai (sound)
4. Catat nilai ADC
5. Adjust threshold jika perlu

### **Monitor & Adjust:**
```sql
-- Query untuk lihat distribusi nilai
SELECT 
  AVG(gas_analog) as avg_gas,
  MIN(gas_analog) as min_gas,
  MAX(gas_analog) as max_gas,
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY gas_analog) as median_gas
FROM iot_sensor_data
WHERE created_at > NOW() - INTERVAL '1 day';
```

Berdasarkan hasil, adjust threshold untuk menghindari false alert.

---

## 🎯 **Expected Behavior dengan Threshold Ini**

### **Kondisi Normal (Kelas Belajar):**
- Gas: 300-800 ADC → ✅ Aman
- Light: 2000-3000 ADC → ✅ Normal
- Sound: 500-1000 ADC → ✅ Normal
- **Result**: Badge HIJAU "AMAN"

### **Kondisi Warning (Perlu Perhatian):**
- Gas: 1000-1400 ADC → ⚠️ Waspada
- Light: 800 ADC → 🌙 Gelap
- Sound: 1200 ADC → 📢 Agak Berisik
- **Result**: Badge KUNING "PERHATIAN"

### **Kondisi Danger (Butuh Tindakan):**
- Gas: 1600 ADC → ⚠️ Berbahaya
- Sound: 1800 ADC → 🔊 Berisik
- **Result**: Badge MERAH "BAHAYA"

---

## 💡 **Tips untuk Demo/Hackathon**

1. **Gunakan threshold ini as-is** untuk demo
2. **Tunjukkan realtime update** saat kondisi berubah
3. **Simulasi kondisi berbeda**:
   - Tutup jendela → Gas naik
   - Matikan lampu → Light turun
   - Tepuk tangan → Sound naik
4. **Highlight alert system** saat threshold terlewati

---

## 📚 **Referensi**

Threshold ini berdasarkan:
- Datasheet MQ-2, MQ-135 (gas sensors)
- Karakteristik LDR dengan pull-down 10kΩ
- Microphone module MAX4466/MAX9814
- ESP32 ADC 12-bit (0-4095)
- Pengalaman umum dengan sensor-sensor ini

---

**Threshold ini sudah siap pakai untuk demo! Adjust nanti jika perlu berdasarkan kondisi real.** 🚀
