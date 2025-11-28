# Quick Reference: Account Deactivation Notification

## 🚀 Quick Test

```bash
# 1. Start dev server
npm run dev

# 2. Login sebagai guru di browser
# http://localhost:3000/login

# 3. Run test script
npx tsx scripts/test-account-deactivation.ts

# 4. Pilih aksi "1. Nonaktifkan akun guru"
# 5. Pilih guru yang sedang login
# 6. Lihat modal muncul di browser! ⚠️
```

## 📋 Component Location

```
components/DashboardHeader.tsx
├── Realtime listener (line ~50)
├── Modal state management (line ~20)
└── Modal UI (line ~200)
```

## 🔧 Key Features

| Feature | Description |
|---------|-------------|
| **Realtime Detection** | Supabase Realtime listener untuk UPDATE & DELETE |
| **Modal Notification** | Warning modal dengan countdown 5 detik |
| **Auto Redirect** | Redirect ke `/login` setelah countdown |
| **Manual Redirect** | Button "OK, Mengerti" untuk skip countdown |
| **Cannot Close** | Modal tidak bisa ditutup (forced logout) |
| **Multi-session** | Semua session ter-logout bersamaan |

## 🎨 Modal Design

```
┌─────────────────────────────┐
│      ⚠️ (pulse)             │
│   Akun Dinonaktifkan        │
│                             │
│   Akun Anda telah...        │
│                             │
│        ┌───┐                │
│        │ 5 │ countdown      │
│        └───┘                │
│                             │
│   Redirect dalam 5 detik    │
│                             │
│  [OK, Mengerti]             │
└─────────────────────────────┘
```

## 🔍 How It Works

```typescript
// 1. Fetch current user
useEffect(() => {
  fetchCurrentUser(); // Get user.id
}, []);

// 2. Setup Realtime listener
useEffect(() => {
  const channel = supabase
    .channel(`user-status-${currentUser.id}`)
    .on('postgres_changes', {
      event: '*',
      table: 'users',
      filter: `id=eq.${currentUser.id}`
    }, (payload) => {
      if (payload.eventType === 'DELETE' || 
          !payload.new.is_active) {
        setShowInactiveModal(true); // Show modal!
      }
    })
    .subscribe();
}, [currentUser?.id]);

// 3. Countdown timer
useEffect(() => {
  if (showInactiveModal && countdown > 0) {
    setTimeout(() => setCountdown(countdown - 1), 1000);
  } else if (countdown === 0) {
    window.location.href = '/login'; // Redirect!
  }
}, [showInactiveModal, countdown]);
```

## 🧪 Test Scenarios

| Scenario | Expected Result |
|----------|----------------|
| Deactivate account | Modal muncul, countdown, redirect |
| Delete account | Modal muncul, countdown, redirect |
| Click "OK" button | Langsung redirect tanpa countdown |
| Multiple sessions | Semua session logout bersamaan |
| Reactivate account | Bisa login lagi, no modal |

## 🐛 Debugging

```javascript
// Browser console
console.log('Current user:', currentUser);
console.log('Realtime status:', realtimeStatus);
console.log('Modal visible:', showInactiveModal);
console.log('Countdown:', countdown);
```

## 📊 Success Metrics

- ✅ Modal muncul < 3 detik
- ✅ Countdown smooth 5 → 0
- ✅ Auto redirect works
- ✅ Button redirect works
- ✅ No console errors

## 🔗 Related Files

```
components/DashboardHeader.tsx       # Main component
lib/auth.ts                          # verifyTokenWithDB()
app/api/me/route.ts                  # User status check
scripts/test-account-deactivation.ts # Test script
docs/ACCOUNT_STATUS_NOTIFICATION.md  # Full docs
docs/TESTING_ACCOUNT_DEACTIVATION.md # Test guide
```

## 💡 Tips

1. **Testing**: Gunakan 2 browser untuk test (Chrome + Firefox)
2. **Debugging**: Check browser console untuk Realtime connection
3. **Latency**: Normal latency 1-3 detik untuk modal muncul
4. **Cleanup**: Realtime listener auto cleanup saat unmount

## ⚠️ Important Notes

- Modal hanya muncul di `DashboardHeader` (guru dashboard)
- Admin tidak terpengaruh (tidak pakai DashboardHeader)
- Realtime requires WebSocket support
- Service role key needed untuk test script

## 🎯 Quick Commands

```bash
# Test deactivation
npx tsx scripts/test-account-deactivation.ts

# Check diagnostics
npm run type-check

# Run dev server
npm run dev
```
