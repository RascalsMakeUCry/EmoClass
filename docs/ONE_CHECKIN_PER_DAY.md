# One Check-in Per Day Feature

## Overview
Sistem EmoClass sekarang membatasi siswa untuk hanya bisa melakukan check-in emosi **1 kali per hari**. Fitur ini memastikan data yang lebih konsisten dan mencegah penyalahgunaan sistem.

## Implementasi

### Frontend Validation
- Ketika siswa memilih nama mereka, sistem otomatis mengecek apakah mereka sudah check-in hari ini
- Jika sudah check-in, form akan diganti dengan pesan sukses yang menampilkan:
  - Emoji dan label emosi yang dipilih
  - Waktu check-in
  - Catatan (jika ada)
  - Pesan bahwa mereka bisa check-in lagi besok

### Backend Validation
- API `/api/checkin` melakukan double-check di server
- Mencegah multiple check-in meskipun ada manipulasi di frontend
- Mengembalikan error message jika siswa sudah check-in hari ini

## User Experience

### Belum Check-in
1. Siswa memilih kelas
2. Siswa memilih nama
3. Form emoji dan catatan muncul
4. Siswa bisa submit check-in

### Sudah Check-in
1. Siswa memilih kelas
2. Siswa memilih nama
3. Muncul pesan sukses dengan detail check-in hari ini
4. Form tidak bisa diakses sampai besok

## Benefits

1. **Data Quality**: Setiap siswa = 1 data per hari, lebih mudah dianalisis
2. **Consistency**: Dashboard menampilkan data yang akurat
3. **Alert System**: Sistem alert 3 hari berturut-turut lebih valid
4. **Prevent Abuse**: Siswa tidak bisa spam check-in berkali-kali

## Technical Details

### Check-in Detection
```typescript
// Mengecek check-in hari ini berdasarkan:
- student_id
- created_at >= start of day (00:00:00)
- created_at <= end of day (23:59:59)
```

### Time Zone
Sistem menggunakan waktu lokal server untuk menentukan "hari ini". Pastikan timezone server sudah dikonfigurasi dengan benar.

## Future Enhancements

Potensi fitur tambahan:
- Edit check-in dalam window waktu tertentu (misal: 1 jam pertama)
- Admin override untuk reset check-in siswa tertentu
- Notifikasi reminder untuk siswa yang belum check-in
