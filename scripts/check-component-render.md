# Debug Checklist - Environment Alert Card

## ✅ Langkah-langkah Debug:

### 1. **Pastikan Dev Server Running**
```bash
npm run dev
```

Tunggu sampai muncul:
```
✓ Ready in [X]s
○ Local: http://localhost:3000
```

### 2. **Buka Dashboard**
```
http://localhost:3000/dashboard
```

### 3. **Login** (jika diminta)
- Email: `admin@emoclass.com`
- Password: `admin123`

### 4. **Pilih Kelas 7A**
Dari dropdown di atas, pilih "Kelas 7A"

### 5. **Buka Browser Console** (F12)
Cari log berikut:
```
🔄 EnvironmentAlertCard mounted/updated. classId: bb938c77-...
🌡️ Fetching environment data for classId: bb938c77-...
📊 API Response: {...}
✅ Environment data loaded successfully
```

### 6. **Cek Network Tab** (F12 → Network)
Cari request ke:
```
/api/environment/current?classId=bb938c77-9a7a-4bb3-aebe-796dc5f7c63f
```

Status harus: **200 OK**

Response harus berisi:
```json
{
  "success": true,
  "data": {
    "temperature": 28,
    "humidity": 50,
    "gas_analog": 2100,
    ...
  },
  "hasDevice": true,
  "hasData": true
}
```

---

## 🐛 Troubleshooting:

### Problem 1: Console log tidak muncul sama sekali
**Kemungkinan**: Component tidak di-render

**Solusi**:
1. Cek apakah `selectedClassId` ada value
2. Restart dev server: `Ctrl+C` lalu `npm run dev`
3. Hard refresh browser: `Ctrl+Shift+R`

### Problem 2: Log muncul tapi API error 404
**Kemungkinan**: Route tidak terdaftar

**Solusi**:
1. Restart dev server
2. Cek file ada: `app/api/environment/current/route.ts`
3. Build ulang: `npm run build` (optional)

### Problem 3: API return error "No IoT device found"
**Kemungkinan**: Mapping class_id salah

**Solusi**:
1. Run: `npx tsx scripts/test-api-environment.ts`
2. Cek apakah mapping benar
3. Jika salah, cek urutan classes di database

### Problem 4: Card tidak tampil tapi API sukses
**Kemungkinan**: CSS issue atau conditional render

**Solusi**:
1. Cek console untuk error React
2. Inspect element, cari div dengan class "EnvironmentAlertCard"
3. Cek apakah `hasDevice` state true

### Problem 5: Card tampil tapi data kosong
**Kemungkinan**: Data parsing issue

**Solusi**:
1. Cek console log untuk data structure
2. Pastikan field names match (temperature, humidity, etc.)
3. Run test script lagi: `npm run test:environment`

---

## 📸 Screenshot Expected:

Setelah pilih Kelas 7A, Anda harus lihat card seperti ini:

```
┌─────────────────────────────────────────────────┐
│ 🚨  🌡️ Kondisi Ruang Kelas      [BAHAYA]       │
│     Update: 10:25 WIB                           │
├─────────────────────────────────────────────────┤
│  [Suhu: 28°C] [Kelembaban: 50%]                │
│  [Kualitas Udara: 2100] [Kebisingan: 1000]     │
│                                                  │
│  ⚠️ Masalah Terdeteksi:                          │
│  • Kualitas Udara: 2100 (⚠️ Berbahaya)          │
│                                                  │
│  💡 Rekomendasi:                                 │
│  → 🚨 BAHAYA! Evakuasi siswa...                 │
└─────────────────────────────────────────────────┘
```

**Posisi**: Di atas 4 stats cards (Students Checked In, dll)

---

## 🔧 Quick Fix Commands:

```bash
# 1. Restart dev server
Ctrl+C
npm run dev

# 2. Test API manually
npx tsx scripts/test-api-environment.ts

# 3. Insert fresh test data
npm run test:environment
# Pilih: 4 (Kualitas Udara Buruk)

# 4. Check tables
npx tsx scripts/check-iot-tables.ts
```

---

## 📞 Jika Masih Tidak Muncul:

Kirim screenshot dari:
1. Browser console (F12 → Console tab)
2. Network tab (request ke /api/environment/current)
3. Dashboard page (full screen)

Dan info:
- Apakah ada error di console?
- Apakah API request muncul di Network tab?
- Status code API response?
