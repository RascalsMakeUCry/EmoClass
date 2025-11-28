# Quick Reference: Realtime Notifications

## Setup (1 Menit)

### 1. Aktifkan Realtime di Supabase
```
Dashboard > Database > Replication > Centang "notifications" > Save
```

### 2. Test Realtime
```bash
# Terminal 1
npm run dev

# Terminal 2
npx tsx scripts/test-realtime-notifications.ts

# Browser: http://localhost:3000/notifications
# Notifikasi muncul otomatis!
```

## Visual Indicator

| Status | Indicator | Arti |
|--------|-----------|------|
| 🟡 Kuning | "Menghubungkan..." | Sedang connect ke Realtime |
| 🟢 Hijau | "Live Update Aktif" | Realtime berhasil connect ✅ |
| 🔴 Merah | "Live Update Nonaktif" | Realtime gagal connect ❌ |

## Fitur Realtime

### ✅ Yang Otomatis Update:
- Notifikasi baru muncul (INSERT)
- Status read/unread berubah (UPDATE)
- Notifikasi dihapus (DELETE)
- Unread count bertambah/berkurang
- Toast notification untuk notifikasi baru

### ❌ Yang Tidak Perlu Lagi:
- Manual refresh halaman
- Polling interval
- Reload button

## Troubleshooting

### Realtime Tidak Connect?

**Check 1: Realtime Enabled?**
```
Supabase Dashboard > Database > Replication
Pastikan "notifications" di-check ✅
```

**Check 2: Console Log**
```javascript
// Buka F12 > Console
// Harus ada: "✅ Realtime notifications connected!"
// Status: "SUBSCRIBED"
```

**Check 3: Restart**
```bash
# Stop server: Ctrl+C
npm run dev
# Hard refresh browser: Ctrl+Shift+R
```

## Testing Scenarios

### Test 1: Sad Alert
```bash
npx tsx scripts/test-sad-alert.ts
# Notifikasi urgent muncul otomatis
```

### Test 2: Manual Notification
```bash
npx tsx scripts/test-realtime-notifications.ts
# Notifikasi test muncul otomatis
```

### Test 3: Mark as Read
```
Browser: Klik "Tandai sudah dibaca"
Notifikasi pindah ke "Sudah Dibaca" otomatis
```

### Test 4: Delete
```
Browser: Klik tombol hapus
Notifikasi hilang otomatis
```

## Performance

- **Latency**: <500ms (biasanya 100-200ms)
- **Bandwidth**: Minimal (WebSocket)
- **Free Tier**: 200 concurrent connections
- **Auto Reconnect**: Ya

## Dokumentasi Lengkap

- Setup detail: `docs/REALTIME_NOTIFICATIONS.md`
- Fix Telegram: `docs/FIX_TELEGRAM_NOTIFICATION_UI.md`
- Realtime Setup: `docs/REALTIME_SETUP.md`
