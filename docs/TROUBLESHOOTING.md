# Troubleshooting EmoClass

## Dashboard Tidak Auto-Update (Realtime Tidak Bekerja)

### Gejala:
- Dashboard guru harus di-refresh manual untuk melihat check-in baru
- Status indicator menunjukkan "Live Update Nonaktif" (dot abu-abu)

### Solusi:

#### 1. Aktifkan Realtime di Supabase Dashboard

**PENTING:** Supabase Realtime harus diaktifkan secara manual!

1. Buka https://supabase.com/dashboard
2. Pilih project EmoClass
3. Klik **Database** > **Replication**
4. Cari tabel `emotion_checkins`
5. **Toggle ON** untuk mengaktifkan replication
6. Klik **Save**

#### 2. Verifikasi di Browser Console

1. Buka dashboard: `http://localhost:3000/dashboard`
2. Tekan F12 untuk buka Developer Tools
3. Klik tab **Console**
4. Cari log: `"Realtime subscription status: SUBSCRIBED"`
5. Jika muncul, berarti realtime sudah aktif ✅

#### 3. Test Realtime

**Cara test dengan 2 browser window:**

1. **Window 1:** Buka `http://localhost:3000/dashboard`
   - Pilih kelas (misal: Kelas 7A)
   - Lihat status indicator - harus hijau "Live Update Aktif"

2. **Window 2:** Buka `http://localhost:3000`
   - Pilih kelas yang sama (Kelas 7A)
   - Pilih siswa
   - Pilih emoji
   - Klik "Kirim Check-in"

3. **Kembali ke Window 1:**
   - Dashboard harus auto-update dalam 1-2 detik
   - Pie chart berubah
   - Progress counter naik
   - Console menunjukkan: `"New check-in received: ..."`

### Jika Masih Tidak Bekerja:

#### Error: "Realtime is not enabled"

**Penyebab:** Replication belum diaktifkan di Supabase

**Solusi:**
- Ikuti langkah 1 di atas
- Pastikan toggle untuk `emotion_checkins` berwarna hijau/aktif
- Tunggu 10-30 detik setelah mengaktifkan
- Refresh halaman dashboard

#### Error: "Failed to connect to realtime"

**Penyebab:** Koneksi internet atau Supabase down

**Solusi:**
- Check koneksi internet
- Coba restart dev server: `npm run dev`
- Check status Supabase: https://status.supabase.com

#### Status Indicator Kuning Terus (Connecting...)

**Penyebab:** Subscription gagal connect

**Solusi:**
1. Check browser console untuk error
2. Pastikan environment variables benar di `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```
3. Restart dev server setelah ubah .env.local

### Alternative: Gunakan Polling

Jika Realtime tidak bisa diaktifkan (misalnya limit free tier), gunakan polling:

Edit `app/dashboard/page.tsx`, ganti realtime useEffect dengan:

```typescript
// Polling setiap 5 detik (alternative to realtime)
useEffect(() => {
  if (!selectedClassId) return;

  const interval = setInterval(() => {
    console.log('Polling for updates...');
    loadDashboardData();
  }, 5000); // Reload every 5 seconds

  return () => clearInterval(interval);
}, [selectedClassId]);
```

**Trade-off:**
- ✅ Lebih reliable, tidak perlu setup Realtime
- ❌ Menggunakan lebih banyak bandwidth
- ❌ Update delay 5 detik (vs 1-2 detik realtime)

---

## Dropdown Siswa Tidak Muncul

### Gejala:
- Dropdown siswa kosong atau disabled

### Solusi:
1. Pastikan Anda sudah **pilih kelas** terlebih dahulu
2. Check browser console untuk error
3. Verifikasi data siswa ada di Supabase:
   - Buka Supabase Dashboard > Table Editor
   - Klik tabel `students`
   - Pastikan ada data siswa dengan `class_id` yang benar

---

## Error: "Supabase credentials tidak ditemukan"

### Gejala:
- Aplikasi crash saat load
- Error di console tentang SUPABASE_URL atau SUPABASE_ANON_KEY

### Solusi:
1. Pastikan file `.env.local` ada di root folder `emoclass/`
2. Isi dengan credentials dari Supabase:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
   ```
3. Restart dev server: `npm run dev`

---

## Check-in Berhasil Tapi Tidak Muncul di Dashboard

### Gejala:
- Form check-in menunjukkan "Check-in berhasil!"
- Tapi data tidak muncul di dashboard

### Solusi:
1. **Pastikan pilih kelas yang sama** di check-in dan dashboard
2. Check data di Supabase:
   - Buka Table Editor > `emotion_checkins`
   - Verifikasi data ter-insert dengan `student_id` yang benar
3. Refresh dashboard manual (F5)
4. Check browser console untuk error

---

## Reset Button Tidak Bekerja

### Gejala:
- Klik "Reset untuk Besok" tapi data tidak terhapus

### Solusi:
1. Check browser console untuk error
2. Pastikan ada data check-in untuk hari ini
3. Verifikasi RLS (Row Level Security) di Supabase:
   - Database > Policies
   - Pastikan ada policy "Allow public delete on checkins"

---

## Pertanyaan Umum

### Q: Apakah harus online untuk menggunakan EmoClass?
A: Ya, karena menggunakan Supabase cloud database. Untuk offline, perlu setup Supabase local.

### Q: Berapa lama data check-in disimpan?
A: Permanent, sampai di-reset manual oleh guru atau dihapus dari database.

### Q: Apakah siswa bisa check-in lebih dari 1x per hari?
A: Ya, sistem tidak membatasi. Dashboard akan menampilkan check-in terbaru.

### Q: Bagaimana cara menambah kelas/siswa baru?
A: Saat ini harus manual via Supabase Table Editor. Fitur admin panel bisa ditambahkan nanti.

---

## Kontak Support

Jika masalah masih berlanjut:
1. Check semua langkah di atas
2. Screenshot error di browser console
3. Screenshot Supabase Replication settings
4. Hubungi tim development dengan info tersebut
