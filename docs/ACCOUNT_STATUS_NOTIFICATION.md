# Account Status Notification

## Overview
Fitur ini memberikan notifikasi real-time kepada guru yang sedang login ketika akun mereka dinonaktifkan atau dihapus oleh administrator.

## Fitur Utama

### 1. Real-time Monitoring
- Menggunakan **Supabase Realtime** untuk mendeteksi perubahan status akun
- Listener otomatis aktif saat user login
- Mendeteksi event `UPDATE` (is_active = false) dan `DELETE` pada tabel users

### 2. Modal Notifikasi
Ketika akun dinonaktifkan/dihapus, sistem akan menampilkan modal dengan:
- ⚠️ **Icon warning** yang jelas dan menarik perhatian
- **Pesan informatif**: "Akun Anda telah dinonaktifkan oleh administrator"
- **Countdown 5 detik** sebelum redirect otomatis
- **Tombol "OK, Mengerti"** untuk redirect langsung tanpa menunggu countdown

### 3. User Experience
- Modal tidak bisa ditutup (no close button, no backdrop click)
- Countdown visual yang jelas
- Redirect otomatis ke halaman login setelah 5 detik
- User bisa klik tombol untuk redirect lebih cepat

## Implementasi Teknis

### Component: DashboardHeader.tsx

```typescript
// Realtime listener untuk perubahan status user
useEffect(() => {
  if (!currentUser?.id) return;

  const channel = supabase
    .channel(`user-status-${currentUser.id}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'users',
        filter: `id=eq.${currentUser.id}`,
      },
      (payload) => {
        // Deteksi deactivation atau deletion
        if (payload.eventType === 'DELETE' || 
            (payload.eventType === 'UPDATE' && !(payload.new as any).is_active)) {
          setShowInactiveModal(true);
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, [currentUser?.id]);
```

### Countdown Timer

```typescript
useEffect(() => {
  if (showInactiveModal && countdown > 0) {
    const timer = setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);
    return () => clearTimeout(timer);
  } else if (showInactiveModal && countdown === 0) {
    window.location.href = '/login';
  }
}, [showInactiveModal, countdown]);
```

## Testing

### Skenario 1: Admin Menonaktifkan Akun Guru
1. Login sebagai guru di browser A
2. Login sebagai admin di browser B
3. Admin menonaktifkan akun guru tersebut
4. **Expected**: Modal muncul di browser A dengan countdown 5 detik
5. Setelah 5 detik, guru otomatis redirect ke login

### Skenario 2: Admin Menghapus Akun Guru
1. Login sebagai guru di browser A
2. Login sebagai admin di browser B
3. Admin menghapus akun guru tersebut
4. **Expected**: Modal muncul di browser A dengan countdown 5 detik
5. Setelah 5 detik, guru otomatis redirect ke login

### Skenario 3: User Klik Tombol "OK, Mengerti"
1. Login sebagai guru
2. Admin menonaktifkan akun
3. Modal muncul dengan countdown
4. User klik tombol "OK, Mengerti"
5. **Expected**: Langsung redirect tanpa menunggu countdown selesai

## UI/UX Design

### Modal Appearance
- **Background**: Black overlay dengan blur (bg-black/60 backdrop-blur-sm)
- **Modal**: White rounded card dengan shadow
- **Icon**: Red warning triangle dengan pulse animation
- **Countdown**: Large circular display dengan gradient red background
- **Button**: Full-width red gradient button

### Animations
- Modal fade in dengan scale animation
- Icon pulse animation untuk menarik perhatian
- Countdown number transition smooth

## Benefits

### 1. Transparency
User tahu kenapa mereka di-logout, tidak bingung atau mengira ada bug

### 2. Less Confusing
Tidak tiba-tiba di login screen tanpa penjelasan

### 3. Professional
Menunjukkan sistem yang well-designed dan user-friendly

### 4. User Respect
Menghargai user dengan memberikan informasi yang jelas

## Configuration

### Countdown Duration
Default: 5 detik

Untuk mengubah durasi countdown, edit initial state:
```typescript
const [countdown, setCountdown] = useState(5); // Ubah angka ini
```

### Modal Z-Index
Modal menggunakan z-index 70 untuk memastikan tampil di atas semua element lain:
```typescript
className="fixed inset-0 z-[70]"
```

## Dependencies

- **Supabase Realtime**: Untuk monitoring perubahan database
- **React Portal**: Untuk render modal di document.body
- **Lucide React**: Untuk icon AlertTriangle

## Notes

- Modal ini hanya muncul di DashboardHeader, yang digunakan di halaman dashboard guru
- Admin tidak akan melihat modal ini karena admin tidak menggunakan DashboardHeader
- Realtime listener otomatis cleanup saat component unmount
- Cookie auth-token otomatis dihapus oleh API `/api/me` saat user inactive

## Future Improvements

1. **Customizable Message**: Admin bisa memberikan pesan custom saat menonaktifkan akun
2. **Email Notification**: Kirim email ke guru yang dinonaktifkan
3. **Reactivation Request**: Guru bisa request reactivation melalui form
4. **Audit Log**: Catat siapa yang menonaktifkan dan kapan
