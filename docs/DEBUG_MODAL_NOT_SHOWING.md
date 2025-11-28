# Debugging: Modal Tidak Muncul

## Quick Diagnosis

### Step 1: Test Modal Manually (Bypass Realtime)

1. Buka browser dan login sebagai guru
2. Buka dashboard (`/dashboard`)
3. Lihat tombol **"Test Modal"** di sebelah "Dashboard Guru"
4. Klik tombol tersebut

**Expected Result:**
- Modal harus muncul langsung
- Countdown dari 5 ke 0
- Redirect ke login

**If modal muncul:**
✅ Component berfungsi, masalahnya di Realtime
→ Lanjut ke Step 2

**If modal TIDAK muncul:**
❌ Ada masalah di component
→ Lanjut ke Step 3

---

### Step 2: Test Realtime Connection

```bash
# Terminal 1: Start Realtime listener
npx tsx scripts/debug-realtime.ts

# Terminal 2: Trigger update
npx tsx scripts/test-account-deactivation.ts
```

**Expected Output (Terminal 1):**
```
✅ Successfully subscribed to Realtime!
⏳ Listening for changes...

✅ Realtime event received!
Event type: UPDATE
Payload: { ... }
```

**If Realtime berfungsi:**
✅ Realtime OK, masalahnya di event handler
→ Lanjut ke Step 4

**If Realtime TIDAK berfungsi:**
❌ Realtime belum enabled
→ Lanjut ke Step 5

---

### Step 3: Check Browser Console

Buka browser console (F12) dan cari log:

```
[Account Status] Fetching current user...
[Account Status] User fetched: { id: "...", ... }
[Account Status] Setting up Realtime listener for user: ...
[Account Status] Subscription status: SUBSCRIBED
```

**If tidak ada log sama sekali:**
❌ Component tidak render atau error
→ Check React DevTools

**If ada error:**
❌ Ada bug di code
→ Fix error tersebut

**If log OK tapi modal tidak muncul:**
→ Lanjut ke Step 4

---

### Step 4: Check Realtime Event

Saat akun dinonaktifkan, harus ada log:

```
[Account Status] Realtime event received: { eventType: "UPDATE", ... }
[Account Status] User deactivated, showing modal
```

**If tidak ada log event:**
❌ Realtime tidak mengirim event
→ Check filter di listener

**If ada log tapi modal tidak muncul:**
❌ State update tidak trigger re-render
→ Check React state

---

### Step 5: Enable Supabase Realtime

1. Buka Supabase Dashboard
2. Go to **Database** → **Replication**
3. Cari tabel **users**
4. Enable **Realtime** untuk tabel users
5. Klik **Save**

**Verify:**
```bash
npx tsx scripts/debug-realtime.ts
```

Harus muncul: `✅ Successfully subscribed to Realtime!`

---

## Common Issues

### Issue 1: Modal Tidak Muncul Sama Sekali

**Symptoms:**
- Tombol "Test Modal" tidak ada
- Tidak ada log di console

**Causes:**
- Component tidak render
- `mounted` state masih false
- Error di component

**Solutions:**
```typescript
// Check di browser console
console.log('Mounted:', mounted);
console.log('Show modal:', showInactiveModal);
```

---

### Issue 2: Realtime Tidak Connect

**Symptoms:**
- Log: `Subscription status: CHANNEL_ERROR`
- Tidak ada event received

**Causes:**
- Realtime tidak enabled di Supabase
- Network issues
- Invalid credentials

**Solutions:**
1. Enable Realtime di Supabase Dashboard
2. Check network connection
3. Verify `.env.local` credentials

---

### Issue 3: Event Tidak Trigger Modal

**Symptoms:**
- Log: `Realtime event received`
- Tapi tidak ada log: `showing modal`

**Causes:**
- Filter tidak match
- Condition tidak terpenuhi
- Payload structure berbeda

**Solutions:**
```typescript
// Add more detailed logging
console.log('Event type:', payload.eventType);
console.log('New data:', payload.new);
console.log('Is active:', (payload.new as any)?.is_active);
```

---

### Issue 4: Modal Muncul Tapi Tidak Redirect

**Symptoms:**
- Modal visible
- Countdown berjalan
- Tidak redirect ke login

**Causes:**
- `window.location.href` tidak berfungsi
- Error di countdown logic

**Solutions:**
```typescript
// Check countdown
console.log('Countdown:', countdown);
console.log('Should redirect:', countdown === 0);
```

---

## Debugging Checklist

### Frontend (Browser)

- [ ] Component render tanpa error
- [ ] `mounted` state = true
- [ ] `currentUser` state ada ID
- [ ] Realtime subscription status = SUBSCRIBED
- [ ] Test button berfungsi
- [ ] Modal muncul saat klik test button

### Realtime (Network)

- [ ] Supabase Realtime enabled untuk tabel users
- [ ] WebSocket connection established
- [ ] Event diterima saat update user
- [ ] Payload structure benar

### Backend (Database)

- [ ] User exists di database
- [ ] `is_active` column exists
- [ ] Update query berhasil
- [ ] No database errors

---

## Debug Commands

```bash
# 1. Test modal manually (browser)
# Klik tombol "Test Modal" di dashboard

# 2. Test Realtime connection
npx tsx scripts/debug-realtime.ts

# 3. Test account deactivation
npx tsx scripts/test-account-deactivation.ts

# 4. Check TypeScript errors
npm run type-check

# 5. Check console logs
# Open browser DevTools (F12) → Console
```

---

## Expected Console Logs (Success)

### On Page Load:
```
[Account Status] Fetching current user...
[Account Status] User fetched: { id: "abc-123", email: "guru@example.com", ... }
[Account Status] Setting up Realtime listener for user: abc-123
[Account Status] Subscription status: SUBSCRIBED
```

### On Account Deactivation:
```
[Account Status] Realtime event received: { eventType: "UPDATE", ... }
[Account Status] User deactivated, showing modal
[Account Status] Countdown: 5
[Account Status] Countdown: 4
[Account Status] Countdown: 3
[Account Status] Countdown: 2
[Account Status] Countdown: 1
[Account Status] Countdown finished, redirecting to login
```

---

## Still Not Working?

### Last Resort Debugging

1. **Add breakpoint** di browser DevTools:
   - Line: `setShowInactiveModal(true)`
   - Check if this line is reached

2. **Force show modal** di console:
   ```javascript
   // Di browser console
   document.querySelector('[data-modal="inactive"]')
   ```

3. **Check React state** di React DevTools:
   - Find `DashboardHeader` component
   - Check `showInactiveModal` state
   - Manually set to `true`

4. **Simplify the code**:
   - Remove all conditions
   - Just show modal on mount
   - Verify modal renders

---

## Contact Support

If masih tidak berfungsi setelah semua step di atas:

1. Copy semua console logs
2. Screenshot browser DevTools
3. Share `.env.local` (hide sensitive data)
4. Describe exact steps yang dilakukan

---

## Quick Fix: Force Show Modal

Jika urgent dan perlu demo, tambahkan ini temporary:

```typescript
// Di DashboardHeader.tsx
useEffect(() => {
  // TEMPORARY: Force show modal after 5 seconds
  setTimeout(() => {
    console.log('FORCE SHOWING MODAL');
    setShowInactiveModal(true);
  }, 5000);
}, []);
```

**WARNING:** Ini hanya untuk testing! Remove setelah debugging selesai.
