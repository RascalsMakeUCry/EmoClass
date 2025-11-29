# 🚀 Environment Alert Card - Quick Start Guide

## Setup dalam 5 Menit

### 1. Pastikan Database Sudah Siap ✅

Tabel yang dibutuhkan (sudah ada):
- ✅ `iot_devices` - Mapping device ke kelas
- ✅ `iot_sensor_data` - Data sensor dari ESP32

### 2. Register IoT Device untuk Kelas

Jalankan SQL di Supabase SQL Editor:

```sql
-- Contoh: Register device untuk Kelas 7A (class_id = 1)
INSERT INTO iot_devices (device_id, class_id)
VALUES ('ESP32-7A-001', 1);

-- Untuk kelas lain, sesuaikan class_id
-- Cek class_id dengan: SELECT id, name FROM classes;
```

### 3. Test dengan Data Dummy

Gunakan test script yang sudah disediakan:

```bash
npm run test:environment
```

Script akan:
1. Cari device pertama di database
2. Tampilkan menu 8 scenario test
3. Insert data sesuai pilihan
4. Environment Alert Card akan update otomatis

### 4. Lihat Hasilnya

1. Buka Teacher Dashboard: `http://localhost:3000/dashboard`
2. Pilih kelas yang punya IoT device
3. Environment Alert Card akan muncul di atas Stats Cards
4. Card akan auto-refresh setiap 10 detik

## Test Scenarios

### Scenario 1: Kondisi Normal ✅
```bash
npm run test:environment
# Pilih: 1. ✅ Kondisi Normal (Semua Aman)
```
**Expected**: Badge hijau "AMAN", semua sensor dalam range normal

### Scenario 2: Suhu Panas 🌡️
```bash
npm run test:environment
# Pilih: 2. 🌡️ Suhu Panas (Warning)
```
**Expected**: Badge kuning "PERHATIAN", rekomendasi nyalakan AC

### Scenario 3: Kualitas Udara Buruk ⚠️
```bash
npm run test:environment
# Pilih: 4. ⚠️ Kualitas Udara Buruk (Danger)
```
**Expected**: Badge merah "BAHAYA", rekomendasi evakuasi

### Scenario 4: Multiple Issues 🚨
```bash
npm run test:environment
# Pilih: 8. 🚨 Multiple Issues (Danger)
```
**Expected**: Badge merah, multiple issues & recommendations

## Manual Insert (Tanpa Script)

Jika ingin insert manual via SQL:

```sql
-- Get device_id dulu
SELECT id, device_id, class_id FROM iot_devices LIMIT 1;

-- Insert data sensor (ganti 'device-uuid' dengan id dari query di atas)
INSERT INTO iot_sensor_data (
  device_id, 
  temperature, 
  humidity, 
  gas_analog, 
  gas_digital,
  light_analog, 
  light_digital,
  sound_analog, 
  sound_digital
)
VALUES (
  'device-uuid',  -- Ganti dengan UUID dari iot_devices.id
  32,             -- Suhu panas (warning)
  50,             -- Humidity normal
  800,            -- Gas aman
  0,
  2000,           -- Light normal
  1,
  1000,           -- Sound normal
  0
);
```

## Troubleshooting

### Card Tidak Muncul
**Problem**: Environment Alert Card tidak tampil di dashboard

**Solution**:
1. Cek apakah kelas punya device:
   ```sql
   SELECT * FROM iot_devices WHERE class_id = 1;
   ```
2. Jika tidak ada, insert device dulu (lihat step 2)

### Card Tampil Tapi "Belum ada data sensor"
**Problem**: Device ada tapi belum ada data

**Solution**:
1. Insert data sensor (gunakan test script atau manual SQL)
2. Atau tunggu ESP32 kirim data pertama

### Data Tidak Update
**Problem**: Data di card tidak berubah setelah insert baru

**Solution**:
1. Tunggu 10 detik (auto-refresh interval)
2. Atau refresh halaman browser
3. Cek console browser untuk error API

### ESP32 Tidak Bisa Kirim Data
**Problem**: ESP32 kirim data tapi dapat error 404

**Solution**:
1. Pastikan device sudah registered di `iot_devices`
2. Cek MAC address ESP32 sesuai dengan `device_id` di database
3. Lihat log di `/api/iot` endpoint

## Integration dengan ESP32

### Format Data dari ESP32
ESP32 harus POST ke `/api/iot` dengan format:

```json
{
  "deviceId": "ESP32-7A-001",
  "temperature": 28.5,
  "humidity": 65.2,
  "gas": {
    "analog": 850,
    "digital": 0
  },
  "light": {
    "analog": 1800,
    "digital": 1
  },
  "sound": {
    "analog": 1200,
    "digital": 0
  }
}
```

### Arduino Code Example
```cpp
// Di ESP32 code
HTTPClient http;
http.begin("https://your-app.vercel.app/api/iot");
http.addHeader("Content-Type", "application/json");

String payload = "{";
payload += "\"deviceId\":\"" + WiFi.macAddress() + "\",";
payload += "\"temperature\":" + String(temp) + ",";
payload += "\"humidity\":" + String(humidity) + ",";
payload += "\"gas\":{\"analog\":" + String(gasAnalog) + ",\"digital\":" + String(gasDigital) + "},";
payload += "\"light\":{\"analog\":" + String(lightAnalog) + ",\"digital\":" + String(lightDigital) + "},";
payload += "\"sound\":{\"analog\":" + String(soundAnalog) + ",\"digital\":" + String(soundDigital) + "}";
payload += "}";

int httpCode = http.POST(payload);
```

## Next Steps

Setelah fitur ini jalan, bisa lanjut ke:

1. **Telegram Alerts** - Notifikasi otomatis jika kondisi berbahaya
2. **Historical Trends** - Chart kondisi 24 jam terakhir
3. **Correlation Analysis** - Hubungan lingkungan dengan emosi siswa
4. **Environment Score** - Score 0-100 untuk kualitas ruangan

Lihat `docs/ENVIRONMENT_ALERT_FEATURE.md` untuk detail lengkap.

---

**🎉 Selamat! Environment Alert Card sudah siap digunakan!**
