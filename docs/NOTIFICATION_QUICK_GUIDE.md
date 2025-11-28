# 🔔 Panduan Cepat Sistem Notifikasi

## 🚀 Quick Start

### 1. Setup Database Triggers (5 menit)

```bash
# 1. Buka Supabase Dashboard → SQL Editor
# 2. Copy-paste isi file: supabase/notification-triggers.sql
# 3. Run query
# 4. Done! ✅
```

### 2. Setup Cron Jobs (3 menit)

```bash
# 1. Tambahkan ke .env.local
CRON_SECRET=your-random-secret-here

# 2. File vercel.json sudah ada ✅
# 3. Deploy ke Vercel
vercel --prod

# 4. Done! ✅
```

### 3. Gunakan Helper Functions (1 menit)

```typescript
import { notifyBulkImport } from '@/lib/notification-helper';

// Setelah bulk import berhasil
await notifyBulkImport('Kelas 7A', 25);
```

---

## 📋 Kapan Notifikasi Dibuat?

### ⚡ Otomatis (Database Triggers):
- ✅ Siswa check-in dengan emosi stressed 3 hari berturut-turut → Alert URGENT
- ✅ Bulk import 5+ siswa → Notifikasi sistem
- ✅ Kelas baru dibuat → Notifikasi sistem
- ✅ Siswa check-in → Notifikasi real-time

### ⏰ Terjadwal (Cron Jobs):
- ✅ **15:00** setiap hari → Ringkasan harian
- ✅ **08:00** setiap Senin → Ringkasan mingguan
- ✅ **12:00** setiap hari → Reminder siswa belum check-in

### 🎯 Manual (Event-based):
- ✅ Dari Telegram bot
- ✅ Admin actions
- ✅ Custom logic

---

## 🎨 Jenis Notifikasi

| Type | Priority | Warna | Contoh |
|------|----------|-------|--------|
| `alert` | `urgent` | 🔴 Merah | Siswa butuh perhatian segera |
| `alert` | `high` | 🟠 Orange | Banyak siswa belum check-in |
| `system` | `normal` | 🔵 Biru | Kelas baru dibuat |
| `system` | `low` | ⚪ Abu-abu | Bulk import berhasil |
| `summary` | `normal` | 🟢 Hijau | Ringkasan harian/mingguan |

---

## 💻 Contoh Kode

### Buat Notifikasi Custom:

```typescript
import { createNotification } from '@/lib/notification-helper';

await createNotification({
  target: 'all_teachers',
  type: 'alert',
  priority: 'high',
  title: '⚠️ Peringatan Penting',
  message: 'Ada masalah yang perlu perhatian',
  metadata: { custom_data: 'value' }
});
```

### Helper Functions:

```typescript
// Bulk import
await notifyBulkImport('Kelas 7A', 25);

// Kelas baru
await notifyClassCreated('Kelas 7A', 'class-id');

// Check-in siswa
await notifyStudentCheckin('Ahmad', 'Kelas 7A', 'stressed', 'Catatan');

// Alert dari Telegram
await notifyTelegramAlert('Ahmad', 'Kelas 7A', 'Butuh bantuan', {});

// Admin action
await notifyAdminAction('action_type', 'Deskripsi', {});
```

---

## 🧪 Testing

### Test Cron Job Lokal:

```bash
curl -X GET http://localhost:3000/api/cron/daily-summary \
  -H "Authorization: Bearer your-cron-secret"
```

### Test Helper Function:

```typescript
import { notifyBulkImport } from '@/lib/notification-helper';

const result = await notifyBulkImport('Test', 10);
console.log(result); // { success: true, count: 5 }
```

---

## 📊 Monitoring

### Check Notifikasi Hari Ini:

```sql
SELECT type, priority, COUNT(*) 
FROM notifications 
WHERE DATE(created_at) = CURRENT_DATE
GROUP BY type, priority;
```

### Check Unread Notifications:

```sql
SELECT COUNT(*) as unread_count
FROM notifications
WHERE is_read = false;
```

---

## ⚙️ Environment Variables

```bash
# .env.local
CRON_SECRET=your-random-secret-key
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

---

## 🎯 Best Practices

1. ✅ Gunakan **Database Triggers** untuk event real-time
2. ✅ Gunakan **Cron Jobs** untuk laporan berkala
3. ✅ Gunakan **Event-based** untuk custom logic
4. ✅ Set priority sesuai urgency
5. ✅ Tambahkan metadata untuk context
6. ✅ Test di local sebelum deploy

---

## 🐛 Troubleshooting

### Notifikasi tidak muncul?
```sql
-- Check apakah trigger aktif
SELECT * FROM information_schema.triggers 
WHERE trigger_name LIKE 'trigger_notify%';
```

### Cron job tidak jalan?
```bash
# Check Vercel logs
vercel logs --follow

# Test manual
curl -X GET https://your-app.vercel.app/api/cron/daily-summary \
  -H "Authorization: Bearer ${CRON_SECRET}"
```

### Helper function error?
```typescript
// Check return value
const result = await notifyBulkImport('Test', 10);
if (!result.success) {
  console.error('Error:', result.error);
}
```

---

## 📚 Dokumentasi Lengkap

Lihat: `docs/NOTIFICATION_SYSTEM_IMPLEMENTATION.md`

---

**Last Updated**: 29 November 2024
