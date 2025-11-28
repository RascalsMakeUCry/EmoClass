# Fix: Dashboard Tidak Mendeteksi Check-in Siswa

## Problem
Dashboard tidak menampilkan siswa yang sudah check-in hari ini.

## Root Cause Analysis

### 1. Timezone Issue
**Masalah**: Fungsi `getTodayDate()` menggunakan `toISOString()` yang return UTC time, sedangkan:
- Database mungkin menyimpan waktu dalam timezone lokal (Indonesia = UTC+7)
- User berada di timezone yang berbeda dengan UTC

**Solusi**: Menggunakan local timezone untuk menghitung start dan end of day:
```typescript
// BEFORE (Wrong - menggunakan UTC)
const today = getTodayDate(); // Returns UTC date
const startOfDay = new Date(today);
startOfDay.setHours(0, 0, 0, 0);

// AFTER (Correct - menggunakan local timezone)
const now = new Date();
const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
```

### 2. Query Filter Issue
**Masalah**: Query menggunakan `gte` dan `lte` dengan `toISOString()` yang mungkin tidak match dengan data di database.

**Solusi**: Pastikan format timestamp konsisten antara query dan data.

## Debugging Steps

### 1. Check Console Log
Buka browser DevTools (F12) dan lihat console untuk output:
```
Dashboard Debug: {
  startOfDay: "2024-11-29T00:00:00.000Z",
  endOfDay: "2024-11-29T23:59:59.999Z",
  totalStudents: 10,
  checkinsFound: 5,
  checkins: [...]
}
```

### 2. Verify Data
- **totalStudents**: Harus sesuai dengan jumlah siswa di kelas
- **checkinsFound**: Harus sesuai dengan jumlah check-in hari ini
- **checkins**: Array berisi data check-in dengan `student_id`, `emotion`, dan `created_at`

### 3. Check Timezone
```sql
-- Di Supabase SQL Editor, cek timezone database
SHOW timezone;

-- Cek data check-in hari ini
SELECT 
  id, 
  student_id, 
  emotion, 
  created_at,
  created_at AT TIME ZONE 'Asia/Jakarta' as local_time
FROM emotion_checkins
WHERE DATE(created_at AT TIME ZONE 'Asia/Jakarta') = CURRENT_DATE
ORDER BY created_at DESC;
```

## Testing

### 1. Test Check-in
1. Buka halaman Input Emotion
2. Pilih kelas dan siswa
3. Submit check-in
4. Kembali ke Dashboard
5. Verify:
   - Progress circle harus update
   - "X dari Y siswa sudah check-in" harus bertambah
   - Emotion distribution harus update

### 2. Test Realtime Update
1. Buka Dashboard di browser 1
2. Buka Input Emotion di browser 2
3. Submit check-in di browser 2
4. Dashboard di browser 1 harus auto-update (Live Update Aktif)

## Additional Fixes

### Remove Unused Imports
```typescript
// Remove if not used
import { formatIndonesianDate } from '@/lib/utils';
```

### Add Error Handling
Pastikan error handling yang baik untuk debugging:
```typescript
if (checkinsError) {
  console.error('Error fetching checkins:', checkinsError);
  throw checkinsError;
}
```

## Verification Checklist

- [ ] Console log menampilkan data yang benar
- [ ] totalStudents sesuai dengan jumlah siswa di kelas
- [ ] checkinsFound > 0 setelah ada check-in
- [ ] Progress circle menampilkan persentase yang benar
- [ ] Emotion distribution chart menampilkan data yang benar
- [ ] Realtime update bekerja (Live Update Aktif)
- [ ] Students needing attention muncul jika ada siswa stressed

## Related Fixes

### Reports Page Date Selection
**Problem**: Tidak bisa memilih tanggal hari ini di menu Laporan

**Root Cause**: Sama dengan dashboard - menggunakan `getTodayDate()` yang return UTC date

**Solution**: 
```typescript
// Helper function untuk get local date
function getLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Gunakan di state initialization dan max attribute
const [endDate, setEndDate] = useState<string>(getLocalDateString());
<input max={getLocalDateString()} />
```

## Notes

- Setelah fix, **hapus console.log** untuk production
- Pastikan timezone server dan client konsisten
- Test dengan berbagai timezone jika aplikasi digunakan di berbagai lokasi
- Fix ini juga diterapkan di Reports page untuk date picker
