# 🌡️ Environment Alert Card - Dokumentasi

## Overview
Fitur **Environment Alert Card** menampilkan kondisi lingkungan ruang kelas secara real-time di Teacher Dashboard, dengan alert otomatis dan rekomendasi aksi untuk guru.

## Fitur Utama

### 1. **Real-time Monitoring**
- Update otomatis setiap 10 detik
- Menampilkan data dari sensor IoT kelas
- Timestamp update terakhir

### 2. **Smart Classification**
Sistem mengklasifikasikan kondisi lingkungan berdasarkan threshold:

#### Suhu (Temperature)
- ❄️ **Dingin**: < 20°C (Warning)
- ✅ **Normal**: 20-30°C (Safe)
- 🌡️ **Panas**: 30-35°C (Warning)
- 🔥 **Sangat Panas**: ≥ 35°C (Danger)

#### Kelembaban (Humidity)
- 🏜️ **Kering**: < 30% (Warning)
- ✅ **Normal**: 30-70% (Safe)
- 💦 **Lembap**: 70-85% (Warning)
- 💧 **Sangat Lembap**: ≥ 85% (Danger)

#### Kualitas Udara (Gas)
- ✅ **Aman**: < 1000 (Safe)
- ⚡ **Waspada**: 1000-1500 (Warning)
- ⚠️ **Berbahaya**: ≥ 2000 (Danger)

#### Pencahayaan (Light)
- 🌙 **Gelap**: < 1000 lux (Warning)
- 💡 **Redup**: 1000-1500 lux (Warning)
- ✅ **Normal**: 1500-2500 lux (Safe)
- ☀️ **Sangat Terang**: > 2500 lux (Warning)

#### Kebisingan (Sound)
- 🤫 **Tenang**: < 800 (Safe)
- ✅ **Normal**: 800-1500 (Safe)
- 📢 **Agak Berisik**: 1500-2000 (Warning)
- 🔊 **Berisik**: ≥ 2000 (Danger)

### 3. **Alert Levels**
- 🚨 **BAHAYA** (Red): Kondisi berbahaya, butuh tindakan segera
- ⚠️ **PERHATIAN** (Yellow): Kondisi tidak ideal, perlu perbaikan
- ✅ **AMAN** (Green): Semua kondisi baik

### 4. **Smart Recommendations**
Sistem memberikan rekomendasi spesifik berdasarkan kondisi:

**Contoh Rekomendasi:**
- Suhu panas → "Nyalakan AC atau buka jendela"
- Gas tinggi → "Buka jendela untuk sirkulasi udara segar"
- Gelap → "Nyalakan lampu untuk pencahayaan yang lebih baik"
- Berisik → "Kelas terlalu berisik, coba aktivitas yang lebih tenang"

## Implementasi Teknis

### File Structure
```
lib/
  └── environment-helper.ts       # Classification logic & thresholds
components/
  └── EnvironmentAlertCard.tsx    # UI Component
app/
  └── api/
      └── environment/
          └── current/
              └── route.ts         # API endpoint
```

### API Endpoint
**GET** `/api/environment/current?classId={classId}`

**Response:**
```json
{
  "success": true,
  "data": {
    "temperature": 28,
    "humidity": 65,
    "gas_analog": 850,
    "light_analog": 1800,
    "sound_analog": 1200,
    "created_at": "2025-11-29T10:30:00Z"
  },
  "hasDevice": true,
  "hasData": true
}
```

### Component Usage
```tsx
import EnvironmentAlertCard from '@/components/EnvironmentAlertCard';

<EnvironmentAlertCard classId={selectedClassId} />
```

## Database Schema
Menggunakan tabel yang sudah ada:

### `iot_devices`
- `id` (uuid): Primary key
- `device_id` (text): MAC address ESP32
- `class_id` (int2): Foreign key ke classes

### `iot_sensor_data`
- `id` (int4): Primary key
- `device_id` (uuid): Foreign key ke iot_devices
- `temperature` (numeric)
- `humidity` (numeric)
- `gas_analog` (int4)
- `light_analog` (int4)
- `sound_analog` (int4)
- `created_at` (timestamptz)

## Behavior

### Jika Kelas Tidak Punya Sensor
- Card tidak ditampilkan (hidden)
- Tidak ada error message di UI

### Jika Sensor Ada Tapi Belum Ada Data
- Card ditampilkan dengan message: "Belum ada data sensor tersedia"

### Jika Semua Kondisi Normal
- Badge: "AMAN" (hijau)
- Icon: ✅
- Message: "Semua kondisi lingkungan dalam keadaan baik"
- Rekomendasi: "Pertahankan kondisi ruangan yang nyaman ini"

### Jika Ada Kondisi Warning/Danger
- Badge sesuai level (kuning/merah)
- Icon: ⚠️ atau 🚨
- List masalah yang terdeteksi
- Rekomendasi aksi spesifik

## Testing

### Manual Testing
1. Pastikan ada data di `iot_sensor_data` untuk kelas tertentu
2. Buka Teacher Dashboard
3. Pilih kelas yang punya sensor IoT
4. Environment Alert Card akan muncul di atas Stats Cards
5. Coba ubah data sensor untuk test berbagai kondisi

### Test Scenarios

#### Scenario 1: Kondisi Normal
```sql
-- Insert normal condition
INSERT INTO iot_sensor_data (device_id, temperature, humidity, gas_analog, light_analog, sound_analog)
VALUES ('device-uuid', 25, 50, 800, 2000, 1000);
```
Expected: Green badge, "AMAN"

#### Scenario 2: Suhu Panas
```sql
INSERT INTO iot_sensor_data (device_id, temperature, humidity, gas_analog, light_analog, sound_analog)
VALUES ('device-uuid', 32, 50, 800, 2000, 1000);
```
Expected: Yellow badge, "PERHATIAN", rekomendasi nyalakan AC

#### Scenario 3: Kualitas Udara Berbahaya
```sql
INSERT INTO iot_sensor_data (device_id, temperature, humidity, gas_analog, light_analog, sound_analog)
VALUES ('device-uuid', 28, 50, 2100, 2000, 1000);
```
Expected: Red badge, "BAHAYA", rekomendasi evakuasi

## Future Enhancements

### Phase 2 (Recommended)
1. **Historical Trends**: Chart kondisi lingkungan 24 jam terakhir
2. **Telegram Alerts**: Notifikasi otomatis ke guru jika kondisi berbahaya
3. **Correlation Analysis**: Hubungan kondisi lingkungan dengan emosi siswa
4. **Environment Score**: Score 0-100 untuk kualitas lingkungan

### Phase 3 (Advanced)
1. **Predictive Alerts**: Prediksi kondisi buruk sebelum terjadi
2. **Multi-class Comparison**: Bandingkan kondisi antar kelas
3. **Automated Actions**: Integrasi dengan smart AC/lights
4. **Reports**: Export laporan kondisi lingkungan mingguan/bulanan

## Benefits untuk Guru

✅ **Proaktif**: Tahu kondisi ruangan sebelum siswa komplain
✅ **Data-driven**: Keputusan berdasarkan data real-time
✅ **Efisien**: Tidak perlu cek manual atau buka menu IoT terpisah
✅ **Actionable**: Rekomendasi jelas dan spesifik
✅ **Kesehatan Siswa**: Cegah masalah kesehatan akibat lingkungan buruk

## Troubleshooting

### Card Tidak Muncul
- Pastikan kelas punya entry di `iot_devices`
- Cek `class_id` di `iot_devices` sesuai dengan kelas yang dipilih

### Data Tidak Update
- Cek koneksi ESP32 ke backend
- Pastikan data masuk ke `iot_sensor_data`
- Cek console browser untuk error API

### Alert Tidak Sesuai
- Review threshold di `lib/environment-helper.ts`
- Adjust sesuai kondisi lokal sekolah

---

**Built with ❤️ for better learning environment**
