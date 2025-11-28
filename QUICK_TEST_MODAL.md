# 🚀 Quick Test: Modal Notification

## Langkah Cepat (5 Menit)

### 1. Start Development Server
```bash
npm run dev
```

### 2. Login Sebagai Guru
- Buka: `http://localhost:3000/login`
- Login dengan akun guru

### 3. Test Modal (2 Cara)

#### Cara A: Test Button (Paling Mudah) ⭐
1. Lihat header dashboard
2. Ada tombol merah **"Test Modal"** di sebelah "Dashboard Guru"
3. **Klik tombol tersebut**
4. Modal harus muncul langsung! ✅

#### Cara B: Test Realtime (Full Flow)
```bash
# Terminal baru
npx tsx scripts/test-account-deactivation.ts

# Pilih:
# 1. Nonaktifkan akun guru
# Pilih guru yang sedang login
```

---

## ✅ Expected Result

Modal harus muncul seperti ini:

```
┌─────────────────────────────────────┐
│                                     │
│        ⚠️ (pulse animation)         │
│                                     │
│      Akun Dinonaktifkan             │
│                                     │
│  Akun Anda telah dinonaktifkan      │
│  oleh administrator. Anda akan      │
│  dialihkan ke halaman login.        │
│                                     │
│           ┌─────┐                   │
│           │  5  │                   │
│           └─────┘                   │
│                                     │
│  Redirect otomatis dalam 5 detik    │
│                                     │
│  ┌───────────────────────────────┐  │
│  │    OK, Mengerti               │  │
│  └───────────────────────────────┘  │
│                                     │
└─────────────────────────────────────┘
```

---

## 🐛 Troubleshooting

### Modal Tidak Muncul?

**Check browser console (F12):**

Harus ada log seperti ini:
```
[Account Status] Fetching current user...
[Account Status] User fetched: { id: "...", ... }
[Account Status] Setting up Realtime listener...
[Account Status] Subscription status: SUBSCRIBED
```

**Jika tidak ada log:**
- Refresh browser
- Clear cache
- Check apakah ada error di console

**Jika ada error:**
- Lihat `docs/DEBUG_MODAL_NOT_SHOWING.md`

---

## 📊 Verification Checklist

- [ ] Development server running
- [ ] Login sebagai guru berhasil
- [ ] Dashboard terbuka
- [ ] Tombol "Test Modal" terlihat
- [ ] Klik tombol → Modal muncul
- [ ] Countdown berjalan 5 → 0
- [ ] Redirect ke login setelah countdown

---

## 🎯 Next Steps

Jika test button berhasil:
1. ✅ Component berfungsi dengan baik
2. Test dengan Realtime (Cara B)
3. Verify Realtime connection

Jika test button gagal:
1. ❌ Ada masalah di component
2. Baca `docs/DEBUG_MODAL_NOT_SHOWING.md`
3. Check console untuk error

---

## 💡 Tips

- **Test button** hanya muncul di development mode
- **Production** tidak akan ada test button
- **Realtime** butuh WebSocket support
- **Modal** tidak bisa ditutup (by design)

---

## 📚 Full Documentation

- `docs/ACCOUNT_STATUS_NOTIFICATION.md` - Feature docs
- `docs/TESTING_ACCOUNT_DEACTIVATION.md` - Full test guide
- `docs/DEBUG_MODAL_NOT_SHOWING.md` - Debugging guide
