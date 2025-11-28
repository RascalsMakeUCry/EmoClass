# 🔧 Quick Fix: Modal Tidak Muncul

## Problem
✅ Test button works → Component OK  
❌ Real deactivation tidak trigger modal → **Realtime belum enabled untuk tabel users**

## Solution (2 Menit)

### 1. Buka Supabase Dashboard
https://supabase.com/dashboard → Pilih project → **SQL Editor**

### 2. Copy-Paste SQL Ini

```sql
-- Enable Realtime for users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own data" ON users;
CREATE POLICY "Users can read own data" 
ON users FOR SELECT USING (true);

ALTER PUBLICATION supabase_realtime ADD TABLE users;
```

### 3. Klik **Run** (atau Ctrl+Enter)

### 4. Verify

Harus muncul output:
```
Success. No rows returned
```

Atau jika error "already added", itu OK (skip).

### 5. Test Lagi

```bash
# Refresh browser (Ctrl+Shift+R)
# Login sebagai guru
# Terminal:
npx tsx scripts/test-account-deactivation.ts
# Pilih "1. Nonaktifkan akun"
# Pilih guru yang sedang login
```

**Modal harus muncul sekarang!** ✅

---

## Verification

Console harus menunjukkan:

```
[Account Status] Realtime event received: { eventType: "UPDATE", ... }
[Account Status] User deactivated, showing modal
```

---

## Still Not Working?

Cek file: `docs/FIX_REALTIME_USERS.md` untuk troubleshooting lengkap.

---

## Why This Happens?

Supabase Realtime harus **explicitly enabled** untuk setiap tabel.

Default: Realtime OFF untuk semua tabel  
Solution: Add tabel ke `supabase_realtime` publication

---

## Alternative: Enable via UI

1. Database → Replication
2. Find table **users**
3. Toggle **Enable Realtime** ON
4. Save

---

## Quick Commands

```bash
# Test Realtime connection
npx tsx scripts/debug-realtime.ts

# Test deactivation
npx tsx scripts/test-account-deactivation.ts
```
