# Supabase Realtime Setup (GRATIS!)

## ✅ Supabase Realtime GRATIS di Free Tier!

EmoClass menggunakan **Supabase Realtime** untuk live updates. Fitur ini **100% gratis** di free tier!

## Cara Mengaktifkan Realtime

### Langkah 1: Aktifkan Realtime untuk Tabel

1. Buka Supabase Dashboard: https://supabase.com/dashboard
2. Pilih project EmoClass Anda
3. Klik **Database** di sidebar kiri
4. Klik tab **Realtime** (BUKAN Replication!)
5. Cari tabel `emotion_checkins` di daftar
6. **Centang/Enable** untuk tabel `emotion_checkins`
7. Klik **Save** atau **Apply**

**PENTING:** Pastikan Anda di tab **Realtime**, bukan Replication!

### Langkah 2: Verifikasi di Browser

1. Buka dashboard guru: `http://localhost:3000/dashboard`
2. Pilih kelas (misal: Kelas 7A)
3. **Lihat status indicator** di bawah tanggal:
   - 🟡 Kuning "Menghubungkan..." → Sedang connect
   - 🟢 Hijau "Live Update Aktif" → Berhasil! ✅
   - 🔴 Merah "Live Update Nonaktif" → Ada masalah ❌

4. Buka Browser Console (F12) untuk detail:
   - Harus ada log: `"✅ Realtime connected successfully!"`
   - Status: `"SUBSCRIBED"`

5. **Test realtime:**
   - Buka tab baru: `http://localhost:3000`
   - Lakukan check-in
   - Kembali ke dashboard → Auto-update dalam 1-2 detik!
   - Console menunjukkan: `"✅ New check-in received via Realtime"`

### Troubleshooting

**Jika tidak auto-update:**

1. **Check console untuk error:**
   - Buka F12 > Console
   - Cari error message berwarna merah
   - Biasanya: "Realtime is not enabled" atau "Subscription failed"

2. **Pastikan Realtime enabled:**
   - Di Supabase Dashboard > Database > Replication
   - Pastikan `emotion_checkins` table di-check

3. **Check connection:**
   - Di console, ketik: `supabase.getChannels()`
   - Harus return array dengan channel 'dashboard-updates'

4. **Restart dev server:**
   ```bash
   # Stop server (Ctrl+C)
   npm run dev
   ```

5. **Clear browser cache:**
   - Hard refresh: Ctrl+Shift+R (Windows) atau Cmd+Shift+R (Mac)

### Fallback: Gunakan Polling Jika Realtime Gagal

Jika Realtime tidak bisa diaktifkan, gunakan polling sebagai fallback.

Edit `app/dashboard/page.tsx`, ganti realtime useEffect dengan:

```typescript
// Polling fallback (jika Realtime tidak tersedia)
useEffect(() => {
  if (!selectedClassId) return;

  setRealtimeStatus('connected');
  
  const interval = setInterval(() => {
    console.log('Polling for updates...');
    loadDashboardData();
  }, 3000); // Refresh setiap 3 detik

  return () => clearInterval(interval);
}, [selectedClassId]);
```

**Trade-off Polling:**
- ✅ Tidak perlu setup Realtime
- ✅ Lebih reliable
- ❌ Update delay 3 detik (vs 1-2 detik realtime)
- ❌ Lebih banyak database queries

### Verifikasi Realtime Bekerja

Test dengan 2 browser window:
1. Window 1: Dashboard guru (`/dashboard`)
2. Window 2: Check-in siswa (`/`)
3. Submit check-in di Window 2
4. Window 1 harus auto-update tanpa refresh

Jika berhasil, Anda akan lihat:
- Pie chart berubah
- Progress counter naik
- Students needing attention list update (jika emosi negatif)
