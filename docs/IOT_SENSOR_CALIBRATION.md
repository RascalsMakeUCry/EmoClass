# 🔧 IoT Sensor Calibration Guide

## Overview

Sensor IoT menggunakan **nilai ADC (Analog-to-Digital Converter)** dengan range **0-4095** (12-bit ADC pada ESP32). Nilai ini perlu dikalibrasi untuk mendapatkan satuan fisik yang akurat.

---

## 📊 **Sensor Details & Current Implementation**

### **1. DHT11 - Temperature & Humidity** ✅

#### **a) Temperature**
- **Key JSON**: `temperature`
- **Satuan**: °C (Celsius)
- **Tipe Data**: float
- **Range**: 0-50°C (DHT11 spec)
- **Akurasi**: ±2°C

**Status**: ✅ **Sudah dikalibrasi oleh library DHT**

**Threshold Saat Ini:**
```typescript
temperature: {
  cold: 20,      // < 20°C = Dingin
  hot: 30,       // 30-35°C = Panas
  extreme: 35,   // ≥ 35°C = Sangat Panas
}
```

#### **b) Humidity**
- **Key JSON**: `humidity`
- **Satuan**: % RH (Relative Humidity)
- **Tipe Data**: float
- **Range**: 20-90% RH (DHT11 spec)
- **Akurasi**: ±5% RH

**Status**: ✅ **Sudah dikalibrasi oleh library DHT**

**Threshold Saat Ini:**
```typescript
humidity: {
  dry: 30,       // < 30% = Kering
  humid: 70,     // 70-85% = Lembap
  extreme: 85,   // ≥ 85% = Sangat Lembap
}
```

---

### **2. MQ Gas Sensor (MQ-2 / MQ-135)** ⚠️

#### **a) Gas Analog**
- **Key JSON**: `gas.analog`
- **Satuan Saat Ini**: **ADC value (0-4095)**
- **Tipe Data**: int
- **Range**: 0-4095 (12-bit ADC)

**Status**: ⚠️ **Belum dikalibrasi ke ppm**

**Threshold Saat Ini (ADC):**
```typescript
gas: {
  safe: 1000,      // < 1000 ADC = Aman
  warning: 1500,   // 1500-2000 ADC = Waspada
  danger: 2000,    // ≥ 2000 ADC = Berbahaya
}
```

**Cara Kalibrasi ke ppm:**

```cpp
// Di ESP32 code
float Rs = (5.0 * 10000.0 / (adcValue * 5.0 / 4095.0)) - 10000.0;
float ratio = Rs / R0;  // R0 dari kalibrasi di udara bersih
float ppm = pow(10, ((log10(ratio) - b) / m));  // m dan b dari datasheet
```

**Rekomendasi:**
- Kalibrasi di udara outdoor (~ 400 ppm CO2)
- Simpan nilai R0 di EEPROM
- Kirim nilai ppm yang sudah dikalibrasi, bukan ADC

#### **b) Gas Digital**
- **Key JSON**: `gas.digital`
- **Satuan**: Boolean (0/1)
- **Tipe Data**: int
- **Arti**: 
  - `1` = Gas di bawah threshold (aman)
  - `0` = Gas melebihi threshold (bahaya)

**Status**: ✅ **Bisa digunakan untuk alert cepat**

---

### **3. LDR (Light Dependent Resistor)** ⚠️

#### **a) Light Analog**
- **Key JSON**: `light.analog`
- **Satuan Saat Ini**: **ADC value (0-4095)**
- **Tipe Data**: int
- **Range**: 0-4095 (12-bit ADC)
- **Arti**: **Higher value = Brighter** (lebih terang)

**Status**: ⚠️ **Belum dikalibrasi ke lux**

**Threshold Saat Ini (ADC):**
```typescript
light: {
  dark: 1000,      // < 1000 ADC = Gelap
  dim: 1500,       // 1000-1500 ADC = Redup
  bright: 2500,    // > 2500 ADC = Sangat Terang
}
```

**Cara Kalibrasi ke lux:**

```cpp
// Di ESP32 code
float voltage = adcValue * (3.3 / 4095.0);
float resistance = (10000.0 * voltage) / (3.3 - voltage);
float lux = pow(10, (log10(resistance / 10000.0) / -0.7));  // Approximate
```

**Rekomendasi:**
- Gunakan light meter profesional untuk kalibrasi
- Buat lookup table: ADC → lux
- Atau kirim nilai lux yang sudah dikalibrasi

#### **b) Light Digital**
- **Key JSON**: `light.digital`
- **Satuan**: Boolean (0/1)
- **Tipe Data**: int
- **Arti**:
  - `1` = Terang (di atas threshold)
  - `0` = Gelap (di bawah threshold)

**Status**: ✅ **Bisa digunakan untuk deteksi gelap/terang**

---

### **4. Sound Sensor (Microphone Module)** ⚠️

#### **a) Sound Analog**
- **Key JSON**: `sound.analog`
- **Satuan Saat Ini**: **ADC value (0-4095)**
- **Tipe Data**: int
- **Range**: 0-4095 (12-bit ADC)
- **Arti**: **Higher value = Louder** (lebih keras)

**Status**: ⚠️ **Belum dikalibrasi ke dB**

**Threshold Saat Ini (ADC):**
```typescript
sound: {
  quiet: 800,      // < 800 ADC = Tenang
  normal: 1500,    // 800-1500 ADC = Normal
  noisy: 2000,     // ≥ 2000 ADC = Berisik
}
```

**Cara Kalibrasi ke dB:**

```cpp
// Di ESP32 code
float voltage = adcValue * (3.3 / 4095.0);
float dB = 20 * log10(voltage / referenceVoltage) + offsetDB;
```

**Rekomendasi:**
- Gunakan sound level meter untuk kalibrasi
- Buat lookup table: ADC → dB
- Atau kirim nilai dB yang sudah dikalibrasi

#### **b) Sound Digital**
- **Key JSON**: `sound.digital`
- **Satuan**: Boolean (0/1)
- **Tipe Data**: int
- **Arti**:
  - `1` = Suara di bawah threshold (tenang)
  - `0` = Suara melebihi threshold (berisik)

**Status**: ✅ **Bisa digunakan untuk deteksi berisik/tenang**

---

## 🎯 **Rekomendasi untuk Tim IoT**

### **Option 1: Kalibrasi di ESP32 (Recommended)** ✅

**Keuntungan:**
- Frontend tidak perlu tahu detail sensor
- Data yang dikirim sudah dalam satuan fisik
- Lebih mudah untuk maintenance

**Implementasi:**
```cpp
// Di ESP32 code
void sendSensorData() {
  // Read raw ADC
  int gasADC = analogRead(GAS_PIN);
  int lightADC = analogRead(LDR_PIN);
  int soundADC = analogRead(MIC_PIN);
  
  // Calibrate to physical units
  float gasPPM = calibrateGas(gasADC);
  float lightLux = calibrateLight(lightADC);
  float soundDB = calibrateSound(soundADC);
  
  // Send calibrated values
  String payload = "{";
  payload += "\"temperature\":" + String(temp) + ",";
  payload += "\"humidity\":" + String(humidity) + ",";
  payload += "\"gas\":{\"analog\":" + String(gasPPM) + ",\"digital\":" + String(gasDigital) + "},";
  payload += "\"light\":{\"analog\":" + String(lightLux) + ",\"digital\":" + String(lightDigital) + "},";
  payload += "\"sound\":{\"analog\":" + String(soundDB) + ",\"digital\":" + String(soundDigital) + "}";
  payload += "}";
  
  http.POST(payload);
}
```

**Update Threshold di Frontend:**
```typescript
// lib/environment-helper.ts
const THRESHOLDS = {
  gas: {
    safe: 600,       // < 600 ppm CO2 = Aman
    warning: 1000,   // 1000-1500 ppm = Waspada
    danger: 1500,    // ≥ 1500 ppm = Berbahaya
  },
  light: {
    dark: 300,       // < 300 lux = Gelap
    dim: 500,        // 300-500 lux = Redup
    bright: 1000,    // > 1000 lux = Sangat Terang
  },
  sound: {
    quiet: 35,       // < 35 dB = Tenang
    normal: 50,      // 35-50 dB = Normal
    noisy: 70,       // ≥ 70 dB = Berisik
  },
};
```

---

### **Option 2: Gunakan ADC Value dengan Threshold yang Disesuaikan** ⚠️

**Keuntungan:**
- Tidak perlu kalibrasi kompleks
- Cukup adjust threshold berdasarkan testing

**Implementasi:**
1. Test sensor di kondisi real (ruang kelas)
2. Catat nilai ADC untuk kondisi:
   - Gas: Udara bersih vs udara pengap
   - Light: Gelap vs terang
   - Sound: Tenang vs berisik
3. Set threshold berdasarkan nilai tersebut

**Contoh Testing:**
```
Gas Sensor (MQ-2):
- Udara bersih outdoor: 150-300 ADC
- Ruang kelas normal: 300-800 ADC
- Ruang pengap: 800-1500 ADC
- Bahaya: > 1500 ADC

Light Sensor (LDR):
- Gelap (lampu mati): 0-500 ADC
- Redup (1 lampu): 500-1500 ADC
- Normal (semua lampu): 1500-3000 ADC
- Sangat terang (siang + lampu): > 3000 ADC

Sound Sensor:
- Tenang (kelas kosong): 0-300 ADC
- Normal (belajar): 300-1000 ADC
- Berisik (istirahat): 1000-2000 ADC
- Sangat berisik: > 2000 ADC
```

---

## 🔄 **Update Threshold Berdasarkan Data Real**

Setelah sensor dipasang dan running, kita bisa adjust threshold berdasarkan data real:

### **Step 1: Collect Data**
```sql
-- Query untuk lihat distribusi nilai sensor
SELECT 
  AVG(gas_analog) as avg_gas,
  MIN(gas_analog) as min_gas,
  MAX(gas_analog) as max_gas,
  AVG(light_analog) as avg_light,
  AVG(sound_analog) as avg_sound
FROM iot_sensor_data
WHERE created_at > NOW() - INTERVAL '7 days';
```

### **Step 2: Analyze & Adjust**
Berdasarkan hasil query, adjust threshold di `lib/environment-helper.ts`

### **Step 3: Test & Iterate**
Monitor alert yang muncul, adjust jika terlalu sensitif atau kurang sensitif

---

## 📝 **Current Status Summary**

| Sensor | Satuan Saat Ini | Status | Action Needed |
|--------|-----------------|--------|---------------|
| Temperature | °C | ✅ Calibrated | None |
| Humidity | % RH | ✅ Calibrated | None |
| Gas | ADC (0-4095) | ⚠️ Raw | Kalibrasi ke ppm atau adjust threshold |
| Light | ADC (0-4095) | ⚠️ Raw | Kalibrasi ke lux atau adjust threshold |
| Sound | ADC (0-4095) | ⚠️ Raw | Kalibrasi ke dB atau adjust threshold |

---

## 💡 **Rekomendasi Final**

### **Untuk Hackathon/Demo (Short Term):**
✅ **Gunakan ADC value dengan threshold yang disesuaikan**
- Lebih cepat implementasi
- Cukup untuk demo
- Adjust threshold berdasarkan testing di ruang kelas

### **Untuk Production (Long Term):**
✅ **Kalibrasi di ESP32 ke satuan fisik**
- Lebih profesional
- Data lebih meaningful
- Mudah untuk maintenance dan scaling

---

## 📞 **Koordinasi dengan Tim IoT**

Tolong konfirmasi:
1. Apakah mau kalibrasi di ESP32 atau pakai ADC value?
2. Jika pakai ADC, berapa range nilai untuk kondisi:
   - Gas: Bersih, Normal, Pengap, Bahaya
   - Light: Gelap, Redup, Normal, Terang
   - Sound: Tenang, Normal, Berisik, Sangat Berisik
3. Apakah ada datasheet sensor untuk referensi kalibrasi?

**Saya siap adjust threshold sesuai data real dari testing!** 🚀
