# Fix: Enable Realtime for Users Table

## Problem
Modal tidak muncul karena Supabase Realtime belum enabled untuk tabel `users`.

Console menunjukkan:
- ✅ `Subscription status: SUBSCRIBED`
- ❌ Tapi tidak ada event saat user di-update/delete

## Solution: Enable Realtime untuk Tabel Users

### Step 1: Buka Supabase Dashboard

1. Go to https://supabase.com/dashboard
2. Pilih project Anda
3. Klik **SQL Editor** di sidebar kiri

### Step 2: Run SQL Script

Copy-paste SQL ini dan klik **Run**:

```sql
-- Enable Realtime for users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create RLS Policy (allow all reads for now)
DROP POLICY IF EXISTS "Users can read own data" ON users;
CREATE POLICY "Users can read own data" 
ON users FOR SELECT 
USING (true);

-- Add users table to Realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE users;

-- Verify (should show 'users' in the list)
SELECT schemaname, tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime';
```

### Step 3: Verify

Setelah run SQL, Anda harus melihat output seperti ini:

```
schemaname | tablename
-----------+-------------------
public     | emotion_checkins
public     | users            ← This should appear!
```

### Step 4: Test

1. **Refresh browser** (hard refresh: Ctrl+Shift+R)
2. **Login sebagai guru**
3. **Buka console** (F12)
4. Harus muncul log:
   ```
   [Account Status] Subscription status: SUBSCRIBED
   ```

5. **Di terminal**, jalankan:
   ```bash
   npx tsx scripts/test-account-deactivation.ts
   ```

6. **Nonaktifkan akun** guru yang sedang login

7. **Console harus menunjukkan**:
   ```
   [Account Status] Realtime event received: { eventType: "UPDATE", ... }
   [Account Status] User deactivated, showing modal
   ```

8. **Modal harus muncul!** ✅

---

## Alternative: Enable via Supabase UI

Jika prefer UI daripada SQL:

1. Go to **Database** → **Replication**
2. Scroll ke tabel **users**
3. Toggle **Enable Realtime** ON
4. Click **Save**

---

## Troubleshooting

### Error: "relation already added to publication"

**Meaning:** Tabel users sudah ada di publication.

**Solution:** Skip error ini, lanjut ke testing.

### Error: "permission denied"

**Meaning:** RLS policy belum benar.

**Solution:** Run SQL policy creation lagi.

### Modal masih tidak muncul setelah enable Realtime

**Check:**

1. **Console logs** - Apakah ada log `Realtime event received`?
   - ❌ Tidak ada → Realtime belum enabled dengan benar
   - ✅ Ada → Lanjut ke step 2

2. **Event payload** - Check `payload.new.is_active`:
   ```javascript
   console.log('Is active:', (payload.new as any)?.is_active);
   ```
   - Should be `false` saat deactivation

3. **Filter** - Pastikan user ID match:
   ```javascript
   console.log('Current user ID:', currentUser.id);
   console.log('Event user ID:', payload.new.id);
   ```

---

## Verification Checklist

- [ ] SQL script berhasil dijalankan
- [ ] Tabel `users` muncul di publication list
- [ ] Browser di-refresh (hard refresh)
- [ ] Console menunjukkan `SUBSCRIBED`
- [ ] Test script dijalankan
- [ ] User di-deactivate
- [ ] Console menunjukkan `Realtime event received`
- [ ] Modal muncul dengan countdown
- [ ] Redirect ke login setelah countdown

---

## Expected Console Logs (Success)

```
[Account Status] Fetching current user...
[Account Status] User fetched: { id: "3df7ee29-...", ... }
[Account Status] Setting up Realtime listener for user: 3df7ee29-...
[Account Status] Subscription status: SUBSCRIBED

// After deactivation:
[Account Status] Realtime event received: {
  eventType: "UPDATE",
  new: { id: "3df7ee29-...", is_active: false, ... },
  old: { id: "3df7ee29-...", is_active: true, ... }
}
[Account Status] User deactivated, showing modal
[Account Status] Countdown: 5
[Account Status] Countdown: 4
...
```

---

## Quick Test Command

```bash
# Terminal 1: Watch Realtime events
npx tsx scripts/debug-realtime.ts

# Terminal 2: Trigger deactivation
npx tsx scripts/test-account-deactivation.ts
```

Terminal 1 harus menunjukkan event received!

---

## Related Files

- `supabase/enable-users-realtime.sql` - SQL script
- `scripts/debug-realtime.ts` - Debug Realtime connection
- `scripts/test-account-deactivation.ts` - Test deactivation
- `components/DashboardHeader.tsx` - Component with listener

---

## Next Steps

Setelah Realtime enabled:

1. ✅ Test dengan script
2. ✅ Test dengan UI admin
3. ✅ Test multiple sessions
4. ✅ Remove test button dari production
5. ✅ Deploy to staging
