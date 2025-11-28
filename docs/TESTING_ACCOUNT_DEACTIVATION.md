# Testing Guide: Account Deactivation Notification

## Quick Start

### 1. Persiapan

```bash
# Pastikan development server running
npm run dev

# Di terminal baru, jalankan test script
npx tsx scripts/test-account-deactivation.ts
```

### 2. Testing Flow

```
┌─────────────────────────────────────────────────────────────┐
│  Browser A (Guru)          Terminal              Browser B  │
├─────────────────────────────────────────────────────────────┤
│  1. Login sebagai guru                                      │
│  2. Buka dashboard         →                                │
│                            3. Run script                    │
│                            4. Pilih "Nonaktifkan"           │
│                            5. Pilih guru                    │
│  6. Modal muncul! ⚠️       ←                                │
│  7. Countdown 5 detik                                       │
│  8. Redirect ke login                                       │
└─────────────────────────────────────────────────────────────┘
```

## Test Cases

### ✅ Test Case 1: Deactivation dengan Auto Redirect

**Steps:**
1. Login sebagai guru di browser
2. Jalankan script dan nonaktifkan akun
3. Tunggu modal muncul
4. Jangan klik tombol, biarkan countdown selesai

**Expected Result:**
- Modal muncul dengan icon warning ⚠️
- Countdown dari 5 ke 0
- Auto redirect ke `/login` setelah countdown selesai

**Pass Criteria:**
- ✅ Modal muncul dalam 1-2 detik
- ✅ Countdown berjalan smooth
- ✅ Redirect otomatis ke login

---

### ✅ Test Case 2: Deactivation dengan Manual Redirect

**Steps:**
1. Login sebagai guru di browser
2. Jalankan script dan nonaktifkan akun
3. Tunggu modal muncul
4. Klik tombol "OK, Mengerti"

**Expected Result:**
- Modal muncul
- Langsung redirect tanpa menunggu countdown

**Pass Criteria:**
- ✅ Modal muncul
- ✅ Tombol berfungsi
- ✅ Redirect langsung saat klik

---

### ✅ Test Case 3: Account Deletion

**Steps:**
1. Login sebagai guru di browser
2. Jalankan script dan pilih "Hapus akun"
3. Konfirmasi dengan ketik "DELETE"
4. Tunggu modal muncul

**Expected Result:**
- Modal muncul dengan pesan yang sama
- Redirect ke login

**Pass Criteria:**
- ✅ Modal muncul
- ✅ Redirect berfungsi
- ✅ Tidak bisa login lagi dengan akun tersebut

---

### ✅ Test Case 4: Reactivation

**Steps:**
1. Nonaktifkan akun guru
2. Jalankan script dan pilih "Aktifkan kembali"
3. Guru login kembali

**Expected Result:**
- Akun bisa login lagi
- Tidak ada modal muncul

**Pass Criteria:**
- ✅ Login berhasil
- ✅ Dashboard bisa diakses
- ✅ Tidak ada error

---

### ✅ Test Case 5: Multiple Sessions

**Steps:**
1. Login sebagai guru di 2 browser berbeda (Chrome & Firefox)
2. Nonaktifkan akun
3. Perhatikan kedua browser

**Expected Result:**
- Modal muncul di KEDUA browser
- Kedua browser redirect ke login

**Pass Criteria:**
- ✅ Modal muncul di semua session
- ✅ Semua session ter-logout

---

### ✅ Test Case 6: Modal Cannot Be Closed

**Steps:**
1. Login sebagai guru
2. Nonaktifkan akun
3. Modal muncul
4. Coba klik di luar modal (backdrop)
5. Coba tekan ESC

**Expected Result:**
- Modal tetap terbuka
- Tidak ada cara untuk menutup modal kecuali redirect

**Pass Criteria:**
- ✅ Backdrop click tidak menutup modal
- ✅ ESC tidak menutup modal
- ✅ Tidak ada tombol close (X)

---

## Visual Checklist

### Modal Appearance

```
┌─────────────────────────────────────────────┐
│                                             │
│              ⚠️ (Pulse animation)           │
│                                             │
│         Akun Dinonaktifkan                  │
│                                             │
│  Akun Anda telah dinonaktifkan oleh         │
│  administrator. Anda akan dialihkan         │
│  ke halaman login.                          │
│                                             │
│              ┌─────┐                        │
│              │  5  │  (Countdown circle)    │
│              └─────┘                        │
│                                             │
│  Redirect otomatis dalam 5 detik...         │
│                                             │
│  ┌───────────────────────────────────┐     │
│  │      OK, Mengerti                 │     │
│  └───────────────────────────────────┘     │
│                                             │
└─────────────────────────────────────────────┘
```

**Check:**
- ✅ Icon warning visible dan pulse
- ✅ Text jelas dan terbaca
- ✅ Countdown number besar dan jelas
- ✅ Button full-width dan menonjol
- ✅ Background blur dan dark overlay

---

## Performance Testing

### Realtime Latency

**Test:**
1. Nonaktifkan akun
2. Ukur waktu sampai modal muncul

**Expected:**
- Modal muncul dalam 1-3 detik

**Measurement:**
```javascript
// Di browser console
const start = Date.now();
// ... tunggu modal muncul ...
const end = Date.now();
console.log(`Latency: ${end - start}ms`);
```

**Pass Criteria:**
- ✅ < 3000ms (3 detik)

---

## Error Scenarios

### ❌ Scenario 1: Supabase Realtime Down

**Simulate:**
1. Matikan internet di browser
2. Nonaktifkan akun

**Expected:**
- Modal tidak muncul (karena no connection)
- User tetap bisa menggunakan app (offline)

**Recovery:**
- Saat internet kembali, modal harus muncul

---

### ❌ Scenario 2: Browser Refresh During Countdown

**Test:**
1. Modal muncul dengan countdown
2. Refresh browser saat countdown berjalan

**Expected:**
- Setelah refresh, user tidak bisa login
- Redirect ke login dengan error message

---

## Automation Script

### Run All Tests

```bash
# Test deactivation
npx tsx scripts/test-account-deactivation.ts

# Pilih aksi 1 (Nonaktifkan)
# Pilih guru nomor 1
# Verifikasi modal muncul di browser

# Test reactivation
# Pilih aksi 2 (Aktifkan kembali)
# Pilih guru yang sama
# Verifikasi bisa login lagi
```

---

## Troubleshooting

### Modal Tidak Muncul

**Check:**
1. ✅ Supabase Realtime enabled?
2. ✅ Browser console ada error?
3. ✅ Network tab menunjukkan WebSocket connection?
4. ✅ User ID benar di listener?

**Debug:**
```javascript
// Di browser console
console.log('Current user:', currentUser);
console.log('Realtime status:', realtimeStatus);
```

### Countdown Tidak Berjalan

**Check:**
1. ✅ `showInactiveModal` state true?
2. ✅ `countdown` state berubah?
3. ✅ useEffect dependency benar?

**Debug:**
```javascript
// Di DashboardHeader.tsx
console.log('Modal state:', showInactiveModal);
console.log('Countdown:', countdown);
```

### Redirect Tidak Berfungsi

**Check:**
1. ✅ `window.location.href` dipanggil?
2. ✅ Tidak ada error di console?

**Debug:**
```javascript
// Di useEffect countdown
console.log('Redirecting to login...');
window.location.href = '/login';
```

---

## Success Metrics

### Definition of Done

- ✅ Modal muncul dalam < 3 detik setelah deactivation
- ✅ Countdown berjalan smooth dari 5 ke 0
- ✅ Auto redirect berfungsi
- ✅ Manual redirect (button) berfungsi
- ✅ Modal tidak bisa ditutup
- ✅ Multiple sessions ter-logout semua
- ✅ Reactivation berfungsi
- ✅ No console errors

### User Experience

- ✅ User tidak bingung kenapa di-logout
- ✅ Pesan jelas dan informatif
- ✅ Countdown memberikan waktu untuk membaca
- ✅ Button memberikan kontrol ke user
- ✅ Animation smooth dan professional

---

## Next Steps

Setelah testing berhasil:

1. ✅ Deploy ke staging
2. ✅ Test di staging environment
3. ✅ User acceptance testing
4. ✅ Deploy ke production
5. ✅ Monitor logs untuk errors
6. ✅ Collect user feedback

---

## Related Documentation

- `docs/ACCOUNT_STATUS_NOTIFICATION.md` - Feature documentation
- `scripts/README.md` - Script usage guide
- `docs/ENABLE_REALTIME.md` - Supabase Realtime setup
