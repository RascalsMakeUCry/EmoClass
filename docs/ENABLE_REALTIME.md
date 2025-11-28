# Enable Supabase Realtime - Step by Step

## Masalah
Realtime sudah SUBSCRIBED tapi tidak menerima event INSERT karena:
1. Row Level Security (RLS) belum dikonfigurasi
2. Table belum ditambahkan ke Realtime publication

## Solusi: Jalankan SQL Berikut

### Langkah 1: Buka SQL Editor di Supabase

1. Buka https://supabase.com/dashboard
2. Pilih project EmoClass
3. Klik **SQL Editor** di sidebar
4. Klik **New Query**

### Langkah 2: Copy-Paste SQL Ini

```sql
-- Enable Row Level Security (RLS) - Required for Realtime
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE emotion_checkins ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first (to avoid conflicts)
DROP POLICY IF EXISTS "Allow public read on classes" ON classes;
DROP POLICY IF EXISTS "Allow public read on students" ON students;
DROP POLICY IF EXISTS "Allow public read on checkins" ON emotion_checkins;
DROP POLICY IF EXISTS "Allow public insert on checkins" ON emotion_checkins;
DROP POLICY IF EXISTS "Allow public delete on checkins" ON emotion_checkins;

-- Create RLS Policies: Allow public access (no authentication required)
CREATE POLICY "Allow public read on classes" 
ON classes FOR SELECT USING (true);

CREATE POLICY "Allow public read on students" 
ON students FOR SELECT USING (true);

CREATE POLICY "Allow public read on checkins" 
ON emotion_checkins FOR SELECT USING (true);

CREATE POLICY "Allow public insert on checkins" 
ON emotion_checkins FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public delete on checkins" 
ON emotion_checkins FOR DELETE USING (true);

-- Enable Realtime for emotion_checkins table
ALTER PUBLICATION supabase_realtime ADD TABLE emotion_checkins;
```

### Langkah 3: Run SQL

1. Klik tombol **Run** (atau tekan Ctrl+Enter)
2. Tunggu sampai muncul "Success"
3. Jika ada error "already exists", itu normal - skip saja

### Langkah 4: Verifikasi

1. Buka **Database** > **Policies** di Supabase
2. Pastikan ada policies untuk `emotion_checkins`:
   - Allow public read on checkins
   - Allow public insert on checkins
   - Allow public delete on checkins

### Langkah 5: Test Realtime

1. **Refresh halaman dashboard** di browser
2. Buka console (F12)
3. Harus muncul: `"✅ Realtime connected!"`
4. **Lakukan check-in** di tab lain
5. Console harus menunjukkan: `"✅ New check-in received via Realtime:"`
6. Dashboard **auto-update dalam 1-2 detik** (tidak perlu refresh!)

## Troubleshooting

### Error: "permission denied for table emotion_checkins"
**Solusi:** RLS policies belum diterapkan. Jalankan ulang SQL di atas.

### Error: "relation already added to publication"
**Solusi:** Ini normal, berarti sudah ditambahkan sebelumnya. Skip error ini.

### Realtime masih tidak bekerja setelah SQL
**Solusi:**
1. Restart dev server: `npm run dev`
2. Hard refresh browser: Ctrl+Shift+R
3. Check console untuk error baru

### Polling terus muncul di console
**Solusi:** Ini normal! Polling adalah fallback. Jika Realtime bekerja, polling akan berhenti otomatis setelah menerima event pertama.

## Cara Kerja Sistem

**Hybrid Realtime + Polling:**
1. **Realtime (Primary):** Instant update (1-2 detik) via WebSocket
2. **Polling (Fallback):** Update setiap 5 detik jika Realtime gagal

**Indikator:**
- 🟢 Hijau "Live Update Aktif" = Realtime connected
- Console log `"✅ New check-in received via Realtime:"` = Realtime bekerja
- Console log `"📡 Polling for updates"` = Fallback aktif

## Hasil Akhir

Setelah setup ini, dashboard akan:
- ✅ Auto-update **instant (1-2 detik)** via Realtime
- ✅ Fallback ke polling (5 detik) jika Realtime gagal
- ✅ Tidak perlu refresh manual
- ✅ Status indicator hijau menunjukkan live update aktif
