# 🔔 Sistem Notifikasi - Implementasi Lengkap

Dokumentasi lengkap untuk 3 opsi implementasi sistem notifikasi di EmoClass.

---

## 📋 Overview

Sistem notifikasi EmoClass mendukung 3 metode pembuatan notifikasi:

1. **Database Triggers (Real-time)** ⚡ - Otomatis saat event terjadi di database
2. **Cron Jobs (Scheduled)** ⏰ - Terjadwal berkala (harian/mingguan)
3. **Event-based (Manual Trigger)** 🎯 - Dipanggil manual dari kode/API

---

## 🎯 Option 1: Database Triggers (Real-time)

### Deskripsi
Trigger database Supabase yang otomatis membuat notifikasi saat event tertentu terjadi.

### File: `supabase/notification-triggers.sql`

### Triggers yang Tersedia:

#### 1. **Alert Emosi Negatif 3 Hari Berturut-turut**
```sql
trigger_consecutive_negative_emotions
```
- **Event**: INSERT ke `emotion_checkins`
- **Kondisi**: Siswa check-in dengan emosi "stressed" 3 hari berturut-turut
- **Action**: Buat notifikasi URGENT untuk semua guru
- **Priority**: `urgent`
- **Type**: `alert`

#### 2. **Notifikasi Bulk Import Siswa**
```sql
trigger_notify_student_added
```
- **Event**: INSERT ke `students`
- **Kondisi**: 5+ siswa ditambahkan dalam 5 detik (bulk import)
- **Action**: Buat notifikasi untuk semua guru
- **Priority**: `low`
- **Type**: `system`

#### 3. **Notifikasi Kelas Baru Dibuat**
```sql
trigger_notify_class_created
```
- **Event**: INSERT ke `classes`
- **Kondisi**: Setiap kelas baru dibuat
- **Action**: Buat notifikasi untuk semua guru
- **Priority**: `low`
- **Type**: `system`

#### 4. **Notifikasi Check-in Real-time**
```sql
trigger_notify_student_checkin
```
- **Event**: INSERT ke `emotion_checkins`
- **Kondisi**: Setiap siswa check-in
- **Action**: Buat notifikasi untuk semua guru
- **Priority**: `high` (jika sad/stressed), `low` (lainnya)
- **Type**: `system`

### Cara Install:

```bash
# 1. Login ke Supabase Dashboard
# 2. Buka SQL Editor
# 3. Copy-paste isi file supabase/notification-triggers.sql
# 4. Run query
```

### Cara Verify:

```sql
-- Check triggers yang sudah dibuat
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
  AND (trigger_name LIKE 'trigger_notify%'
  OR trigger_name LIKE 'trigger_consecutive%')
ORDER BY trigger_name;
```

### Testing:

```bash
# Test trigger dengan insert data
npm run test:triggers
```

---

## ⏰ Option 2: Cron Jobs (Scheduled)

### Deskripsi
API endpoints yang dipanggil secara terjadwal menggunakan Vercel Cron atau external scheduler.

### Cron Jobs yang Tersedia:

#### 1. **Daily Summary** (Ringkasan Harian)
- **File**: `app/api/cron/daily-summary/route.ts`
- **Schedule**: Setiap hari jam 15:00 (3 PM)
- **Vercel Cron**: `0 15 * * *`
- **Priority**: `normal`
- **Type**: `summary`

**Data yang dikirim:**
- Total siswa
- Jumlah yang sudah check-in
- Persentase check-in
- Distribusi emosi (happy, neutral, stressed)
- Mood kelas secara keseluruhan

#### 2. **Weekly Summary** (Ringkasan Mingguan)
- **File**: `app/api/cron/weekly-summary/route.ts`
- **Schedule**: Setiap Senin jam 08:00 (8 AM)
- **Vercel Cron**: `0 8 * * 1`
- **Priority**: `normal` atau `high` (jika ada siswa concerning)
- **Type**: `summary`

**Data yang dikirim:**
- Partisipasi 7 hari terakhir
- Rata-rata check-in per hari
- Trend emosi (positif/negatif/stabil)
- Jumlah siswa yang perlu perhatian khusus
- Distribusi emosi mingguan

#### 3. **Check Missing Check-ins** (Reminder Siswa Belum Check-in)
- **File**: `app/api/cron/check-missing-checkins/route.ts`
- **Schedule**: Setiap hari jam 12:00 (12 PM)
- **Vercel Cron**: `0 12 * * *`
- **Priority**: `urgent` (>50%), `high` (>30%), `normal` (<30%)
- **Type**: `alert`

**Data yang dikirim:**
- Jumlah siswa yang belum check-in
- Persentase yang belum check-in
- Breakdown per kelas
- Daftar nama siswa yang belum check-in

### Setup Vercel Cron:

#### 1. Tambahkan CRON_SECRET ke Environment Variables:

```bash
# .env.local
CRON_SECRET=your-random-secret-key-here
```

#### 2. Buat file `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/daily-summary",
      "schedule": "0 15 * * *"
    },
    {
      "path": "/api/cron/weekly-summary",
      "schedule": "0 8 * * 1"
    },
    {
      "path": "/api/cron/check-missing-checkins",
      "schedule": "0 12 * * *"
    }
  ]
}
```

#### 3. Deploy ke Vercel:

```bash
vercel --prod
```

### Testing Manual:

```bash
# Test daily summary
curl -X GET http://localhost:3000/api/cron/daily-summary \
  -H "Authorization: Bearer your-cron-secret"

# Test weekly summary
curl -X GET http://localhost:3000/api/cron/weekly-summary \
  -H "Authorization: Bearer your-cron-secret"

# Test missing check-ins
curl -X GET http://localhost:3000/api/cron/check-missing-checkins \
  -H "Authorization: Bearer your-cron-secret"
```

---

## 🎯 Option 3: Event-based (Manual Trigger)

### Deskripsi
API dan helper functions untuk membuat notifikasi secara manual dari kode aplikasi.

### File Utama:
- `app/api/notifications/create/route.ts` - API endpoint
- `lib/notification-helper.ts` - Helper functions

### API Endpoint:

#### POST `/api/notifications/create`

**Request Body:**
```json
{
  "target": "all_teachers",
  "type": "system",
  "priority": "normal",
  "title": "Judul Notifikasi",
  "message": "Pesan notifikasi",
  "metadata": {
    "custom_field": "value"
  }
}
```

**Target Options:**
- `all_teachers` - Semua guru aktif
- `all_users` - Semua user aktif
- `specific_user` - User tertentu (perlu `user_id`)

**Type Options:**
- `alert` - Peringatan penting
- `system` - Notifikasi sistem
- `summary` - Ringkasan/laporan

**Priority Options:**
- `urgent` - Sangat penting (merah)
- `high` - Penting (orange)
- `normal` - Normal (biru)
- `low` - Rendah (abu-abu)

### Helper Functions:

#### 1. **notifyBulkImport**
```typescript
import { notifyBulkImport } from '@/lib/notification-helper';

await notifyBulkImport('Kelas 7A', 25);
```

#### 2. **notifyClassCreated**
```typescript
import { notifyClassCreated } from '@/lib/notification-helper';

await notifyClassCreated('Kelas 7A', 'class-id-123');
```

#### 3. **notifyStudentCheckin**
```typescript
import { notifyStudentCheckin } from '@/lib/notification-helper';

await notifyStudentCheckin(
  'Ahmad Rizki',
  'Kelas 7A',
  'stressed',
  'Merasa tertekan karena ujian'
);
```

#### 4. **notifyTelegramAlert**
```typescript
import { notifyTelegramAlert } from '@/lib/notification-helper';

await notifyTelegramAlert(
  'Ahmad Rizki',
  'Kelas 7A',
  'Siswa meminta bantuan',
  { source: 'telegram', urgency: 'high' }
);
```

#### 5. **notifyAdminAction**
```typescript
import { notifyAdminAction } from '@/lib/notification-helper';

await notifyAdminAction(
  'teacher_deactivated',
  'Akun guru Budi telah dinonaktifkan oleh admin',
  { teacher_id: 'user-123' }
);
```

### Contoh Integrasi:

#### Dalam API Bulk Import:
```typescript
// app/api/admin/students/bulk-import/route.ts
import { notifyBulkImport } from '@/lib/notification-helper';

// Setelah berhasil import
await notifyBulkImport(classData.name, insertedStudents.length);
```

#### Dalam API Check-in:
```typescript
// app/api/checkin/route.ts
import { notifyStudentCheckin } from '@/lib/notification-helper';

// Setelah berhasil check-in
const { data: student } = await supabase
  .from('students')
  .select('name, classes(name)')
  .eq('id', studentId)
  .single();

await notifyStudentCheckin(
  student.name,
  student.classes.name,
  emotion,
  note
);
```

---

## 🔄 Perbandingan 3 Opsi

| Aspek | Database Triggers | Cron Jobs | Event-based |
|-------|------------------|-----------|-------------|
| **Timing** | Real-time | Terjadwal | On-demand |
| **Performance** | Sangat cepat | Batch processing | Cepat |
| **Reliability** | Tinggi | Tinggi | Sedang |
| **Flexibility** | Rendah | Sedang | Tinggi |
| **Setup** | Kompleks | Sedang | Mudah |
| **Testing** | Sulit | Mudah | Sangat mudah |
| **Use Case** | Event otomatis | Laporan berkala | Custom logic |

---

## 🎨 Rekomendasi Penggunaan

### Gunakan **Database Triggers** untuk:
- ✅ Alert emosi negatif berturut-turut
- ✅ Event yang harus real-time
- ✅ Logic yang tidak berubah-ubah

### Gunakan **Cron Jobs** untuk:
- ✅ Ringkasan harian/mingguan
- ✅ Reminder terjadwal
- ✅ Batch processing data

### Gunakan **Event-based** untuk:
- ✅ Integrasi dengan sistem eksternal (Telegram bot)
- ✅ Admin actions yang perlu notifikasi
- ✅ Custom business logic
- ✅ Testing dan development

---

## 🧪 Testing

### Test Database Triggers:
```sql
-- Test trigger consecutive emotions
INSERT INTO emotion_checkins (student_id, emotion)
VALUES ('student-id', 'stressed');
-- Lakukan 3x dalam 3 hari berbeda
```

### Test Cron Jobs:
```bash
# Local testing dengan curl
curl -X GET http://localhost:3000/api/cron/daily-summary \
  -H "Authorization: Bearer ${CRON_SECRET}"
```

### Test Event-based:
```typescript
// Dalam test file atau script
import { notifyBulkImport } from '@/lib/notification-helper';

const result = await notifyBulkImport('Test Class', 10);
console.log(result);
```

---

## 📊 Monitoring

### Check Notifikasi yang Dibuat:
```sql
SELECT 
  type,
  priority,
  COUNT(*) as count,
  DATE(created_at) as date
FROM notifications
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY type, priority, DATE(created_at)
ORDER BY date DESC, count DESC;
```

### Check Trigger Performance:
```sql
SELECT 
  schemaname,
  tablename,
  n_tup_ins as inserts,
  n_tup_upd as updates
FROM pg_stat_user_tables
WHERE tablename IN ('emotion_checkins', 'students', 'classes')
ORDER BY n_tup_ins DESC;
```

---

## 🚀 Next Steps

1. ✅ Install database triggers di Supabase
2. ✅ Setup Vercel Cron jobs
3. ✅ Integrate helper functions ke existing APIs
4. ⏳ Test semua 3 opsi
5. ⏳ Monitor notification creation
6. ⏳ Optimize berdasarkan usage patterns

---

## 📝 Notes

- Semua notifikasi otomatis dikirim ke **semua guru aktif**
- Priority menentukan warna dan urutan di UI
- Metadata bisa digunakan untuk filtering dan analytics
- Notifikasi bisa dihapus atau ditandai sudah dibaca oleh user
- Real-time updates menggunakan Supabase Realtime (optional)

---

**Dibuat**: 29 November 2024  
**Status**: ✅ Implementasi Lengkap
