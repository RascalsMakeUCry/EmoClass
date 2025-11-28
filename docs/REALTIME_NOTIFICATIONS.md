# Realtime Notifications Setup

## Fitur Realtime Notifications

Halaman `/notifications` sekarang mendukung **realtime updates** menggunakan Supabase Realtime. Notifikasi baru akan muncul secara otomatis tanpa perlu refresh halaman.

## Cara Mengaktifkan

### Langkah 1: Aktifkan Realtime untuk Tabel Notifications

1. Buka **Supabase Dashboard**: https://supabase.com/dashboard
2. Pilih project EmoClass Anda
3. Klik **Database** di sidebar kiri
4. Klik tab **Replication** 
5. Cari tabel `notifications` di daftar
6. **Centang/Enable** untuk tabel `notifications`
7. Klik **Save** atau **Apply**

### Langkah 2: Verifikasi Realtime Bekerja

#### Test dengan 2 Browser Window:

**Window 1: Halaman Notifications**
```
http://localhost:3000/notifications
```
- Buka browser console (F12)
- Harus ada log: `"Realtime notification change:"`

**Window 2: Jalankan Test Script**
```bash
npx tsx scripts/test-sad-alert.ts
```

**Hasil yang Diharapkan:**
- ✅ Window 1 menampilkan notifikasi baru **secara otomatis** (tanpa refresh)
- ✅ Toast notification muncul: "🔔 Notifikasi baru: [title]"
- ✅ Unread count bertambah otomatis
- ✅ Console log menunjukkan: `"Realtime notification change: { eventType: 'INSERT', ... }"`

## Fitur Realtime yang Tersedia

### 1. INSERT (Notifikasi Baru)
- Notifikasi baru muncul otomatis di bagian "Belum Dibaca"
- Toast notification muncul dengan judul notifikasi
- Unread count bertambah

### 2. UPDATE (Notifikasi Diupdate)
- Status `is_read` berubah otomatis
- Notifikasi pindah dari "Belum Dibaca" ke "Sudah Dibaca"
- Unread count berkurang

### 3. DELETE (Notifikasi Dihapus)
- Notifikasi hilang otomatis dari list
- Tidak perlu refresh halaman

## Troubleshooting

### Realtime Tidak Bekerja

**1. Check Console untuk Error:**
```javascript
// Buka F12 > Console
// Cari error message seperti:
// - "Realtime is not enabled for table notifications"
// - "Subscription failed"
```

**2. Verifikasi Realtime Enabled:**
- Supabase Dashboard > Database > Replication
- Pastikan tabel `notifications` di-check ✅

**3. Check Active Channels:**
```javascript
// Di browser console, ketik:
supabase.getChannels()
// Harus return array dengan channel 'notifications-changes'
```

**4. Restart Dev Server:**
```bash
# Stop server (Ctrl+C)
npm run dev
```

**5. Hard Refresh Browser:**
- Windows: `Ctrl + Shift + R`
- Mac: `Cmd + Shift + R`

### Realtime Connected tapi Tidak Update

**Check RLS Policies:**
```sql
-- Pastikan user bisa SELECT notifications mereka sendiri
-- Di Supabase Dashboard > Authentication > Policies
-- Tabel: notifications
-- Policy: SELECT harus allow untuk user_id = auth.uid()
```

**Check Subscription Filter:**
```javascript
// Realtime hanya mengirim changes untuk rows yang user bisa akses
// Jika RLS policy terlalu ketat, realtime tidak akan trigger
```

## Implementasi Teknis

### Code di `app/notifications/page.tsx`:

```typescript
useEffect(() => {
  fetchNotifications();

  // Setup realtime subscription
  const channel = supabase
    .channel('notifications-changes')
    .on(
      'postgres_changes',
      {
        event: '*', // Listen to INSERT, UPDATE, DELETE
        schema: 'public',
        table: 'notifications',
      },
      (payload) => {
        console.log('Realtime notification change:', payload);
        
        // Refresh notifications
        fetchNotifications();
        
        // Show toast for new notifications
        if (payload.eventType === 'INSERT') {
          const newNotif = payload.new as Notification;
          setToast({ 
            message: `🔔 Notifikasi baru: ${newNotif.title}`, 
            type: 'success' 
          });
        }
      }
    )
    .subscribe();

  // Cleanup on unmount
  return () => {
    supabase.removeChannel(channel);
  };
}, [filter]);
```

## Testing Realtime

### Test 1: Alert dari Telegram Bot
```bash
# Terminal 1: Jalankan dev server
npm run dev

# Terminal 2: Jalankan test sad alert
npx tsx scripts/test-sad-alert.ts

# Browser: Buka /notifications
# Notifikasi harus muncul otomatis!
```

### Test 2: Manual Notification via API
```bash
# Gunakan Postman atau curl untuk create notification
curl -X POST http://localhost:3000/api/notifications/create \
  -H "Content-Type: application/json" \
  -H "Cookie: your-session-cookie" \
  -d '{
    "target": "all_teachers",
    "type": "system",
    "priority": "normal",
    "title": "Test Realtime",
    "message": "Testing realtime notifications"
  }'

# Browser: Notifikasi harus muncul otomatis!
```

### Test 3: Mark as Read
```bash
# Browser: Klik tombol "Tandai sudah dibaca" pada notifikasi
# Notifikasi harus pindah ke section "Sudah Dibaca" otomatis
# Tidak perlu refresh halaman
```

## Performance Notes

- **Bandwidth**: Realtime menggunakan WebSocket, sangat efisien
- **Latency**: Update muncul dalam 100-500ms
- **Free Tier**: Supabase Free Tier support 200 concurrent connections
- **Auto Reconnect**: Jika koneksi terputus, otomatis reconnect

## Fallback: Polling (Jika Realtime Tidak Tersedia)

Jika Realtime tidak bisa diaktifkan, gunakan polling:

```typescript
// Ganti realtime useEffect dengan polling
useEffect(() => {
  fetchNotifications();

  // Polling setiap 5 detik
  const interval = setInterval(() => {
    fetchNotifications();
  }, 5000);

  return () => clearInterval(interval);
}, [filter]);
```

**Trade-off:**
- ✅ Tidak perlu setup Realtime
- ✅ Lebih reliable
- ❌ Update delay 5 detik (vs <1 detik realtime)
- ❌ Lebih banyak database queries

## Kesimpulan

Realtime notifications memberikan pengalaman user yang lebih baik:
- ✅ Notifikasi muncul instant
- ✅ Tidak perlu refresh manual
- ✅ Toast notification untuk awareness
- ✅ Unread count update otomatis
- ✅ Gratis di Supabase Free Tier!
