# Testing the Enhanced Multi-Pattern Alert System

This guide provides step-by-step instructions to test all three alert patterns in the EmoClass system.

---

## 📋 Prerequisites

Before testing, ensure:
1. ✅ Telegram Bot is configured (see `TELEGRAM_QUICK_SETUP.md`)
2. ✅ `.env` file has `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID`
3. ✅ Development server is running (`npm run dev`)
4. ✅ Supabase database is seeded with students

---

## 🧪 Test Scenario 1: Stressed/Sad Pattern (HIGH Priority)

### Expected Behavior
After 3 consecutive days of "Sedih" emotions, a HIGH priority Telegram alert is sent.

### Steps to Test

1. **Day 1: First Stressed Check-in**
   ```
   Navigate to: http://localhost:3000/input-emotion
   
   - Select Kelas: Kelas 7A
   - Select Student: Ahmad Rizki
   - Select Emotion: 😔 Sedih
   - Note (optional): "Merasa tertekan dengan tugas"
   - Click: "Kirim Check-in"
   ```
   
   **Expected Result:** 
   - ✅ Success message shown
   - ❌ No Telegram alert (only 1 check-in)

2. **Day 2: Second Stressed Check-in**
   ```
   (Next day or manually reset date in DB)
   
   - Select same student: Ahmad Rizki
   - Select Emotion: 😔 Sedih
   - Click: "Kirim Check-in"
   ```
   
   **Expected Result:**
   - ✅ Success message shown
   - ❌ No Telegram alert (only 2 check-ins)

3. **Day 3: Third Stressed Check-in - ALERT TRIGGERED**
   ```
   (Next day or manually reset date in DB)
   
   - Select same student: Ahmad Rizki
   - Select Emotion: 😔 Sedih
   - Click: "Kirim Check-in"
   ```
   
   **Expected Result:**
   - ✅ Success message shown
   - ✅ **Telegram alert sent!**
   
   **Telegram Message Should Contain:**
   ```
   🚨 EMOCLASS ALERT - PERLU PERHATIAN KHUSUS
   
   👤 Siswa: Ahmad Rizki
   📚 Kelas: Kelas 7A
   😔 Pola: Emosi sedih/tertekan selama 3 hari berturut-turut
   
   ⚠️ REKOMENDASI TINDAK LANJUT GURU BK:
   1. 🗣️ Lakukan konseling individual segera
   2. 🏠 Hubungi orang tua/wali untuk koordinasi
   3. 👥 Pertimbangkan sesi kelompok dukungan sebaya
   4. 📋 Evaluasi faktor akademik atau sosial
   5. 💚 Pantau perkembangan emosi harian minggu depan
   
   📅 Tindakan: Jadwalkan pertemuan dalam 1-2 hari kerja
   ⏰ Prioritas: TINGGI
   ```

4. **Verify on Dashboard**
   ```
   Navigate to: http://localhost:3000/dashboard
   
   - Select Kelas: Kelas 7A
   - Scroll to "Siswa yang Perlu Perhatian"
   ```
   
   **Expected Result:**
   - Ahmad Rizki appears with 😔 icon
   - Label: "Sedih/Tertekan"

---

## 🧪 Test Scenario 2: Sleepy/Drowsy Pattern (MEDIUM Priority)

### Expected Behavior
After 3 consecutive days of "Mengantuk" emotions, a MEDIUM priority Telegram alert is sent.

### Steps to Test

1. **Day 1-3: Three Sleepy Check-ins**
   ```
   Repeat for 3 consecutive days:
   
   Navigate to: http://localhost:3000/input-emotion
   
   - Select Kelas: Kelas 7A
   - Select Student: Siti Nurhaliza
   - Select Emotion: 😴 Mengantuk
   - Note (optional): "Kurang tidur"
   - Click: "Kirim Check-in"
   ```

2. **After Day 3 - Check Telegram**
   
   **Expected Telegram Message:**
   ```
   🚨 EMOCLASS ALERT - PERHATIAN KESEHATAN
   
   👤 Siswa: Siti Nurhaliza
   📚 Kelas: Kelas 7A
   😴 Pola: Mengantuk/kelelahan selama 3 hari berturut-turut
   
   ⚠️ REKOMENDASI TINDAK LANJUT GURU BK:
   1. 🛏️ Tanyakan pola tidur dan kesehatan siswa
   2. 📱 Evaluasi penggunaan gadget sebelum tidur
   3. 🏠 Konsultasi dengan orang tua tentang rutinitas malam
   4. 🏥 Pertimbangkan rujukan ke tenaga kesehatan jika perlu
   5. 💡 Edukasi pentingnya sleep hygiene dan istirahat cukup
   6. 📚 Evaluasi beban tugas dan kegiatan ekstrakurikuler
   
   📅 Tindakan: Konseling ringan dalam 2-3 hari
   ⏰ Prioritas: SEDANG
   ```

3. **Verify on Dashboard**
   - Siti Nurhaliza appears with 😴 icon
   - Label: "Mengantuk/Lelah"

---

## 🧪 Test Scenario 3: Normal/Flat Energy Pattern (LOW Priority)

### Expected Behavior
After 3 consecutive days of "Biasa saja" emotions, a LOW priority monitoring alert is sent.

### Steps to Test

1. **Day 1-3: Three Normal Check-ins**
   ```
   Repeat for 3 consecutive days:
   
   Navigate to: http://localhost:3000/input-emotion
   
   - Select Kelas: Kelas 8B
   - Select Student: Budi Santoso
   - Select Emotion: 🙂 Biasa saja
   - Note (optional): "Tidak ada yang spesial"
   - Click: "Kirim Check-in"
   ```

2. **After Day 3 - Check Telegram**
   
   **Expected Telegram Message:**
   ```
   ℹ️ EMOCLASS MONITORING - PEMANTAUAN RUTIN
   
   👤 Siswa: Budi Santoso
   📚 Kelas: Kelas 8B
   🙂 Pola: Energi normal/datar selama 3 hari berturut-turut
   
   ⚠️ REKOMENDASI TINDAK LANJUT GURU BK:
   1. 💬 Lakukan check-in informal untuk memahami kondisi siswa
   2. 🎯 Evaluasi motivasi dan engagement di kelas
   3. 🌟 Cari peluang untuk meningkatkan keterlibatan positif
   4. 🤝 Pertimbangkan aktivitas yang bisa meningkatkan semangat
   5. 📊 Pantau apakah ini pola konsisten atau fase sementara
   
   📅 Tindakan: Observasi dan check-in informal minggu ini
   ⏰ Prioritas: RENDAH - Monitoring
   ```

3. **Verify on Dashboard**
   - Budi Santoso appears with 🙂 icon
   - Label: "Energi Normal"

---

## 🧪 Test Scenario 4: Mixed Emotions (No Alert)

### Expected Behavior
If emotions are NOT consecutive and identical, NO alert should be sent.

### Steps to Test

1. **Day 1: Stressed**
   ```
   - Student: Dewi Lestari
   - Emotion: 😔 Sedih
   ```

2. **Day 2: Happy**
   ```
   - Student: Dewi Lestari (same student)
   - Emotion: 😊 Senang
   ```

3. **Day 3: Stressed**
   ```
   - Student: Dewi Lestari (same student)
   - Emotion: 😔 Sedih
   ```

**Expected Result:**
- ✅ All check-ins successful
- ❌ **NO Telegram alert** (emotions not consecutive)

---

## 🔍 Advanced Testing

### Test Alert API Directly

You can test the alert detection API endpoint directly:

```bash
curl -X POST http://localhost:3000/api/check-alert \
  -H "Content-Type: application/json" \
  -d '{"studentId": "STUDENT_UUID_HERE"}'
```

**Expected Response (if 3 consecutive found):**
```json
{
  "success": true,
  "alert": true,
  "telegramSent": true,
  "student": "Ahmad Rizki",
  "class": "Kelas 7A",
  "alertType": "stressed",
  "message": "🚨 Alert sent! 3 consecutive stressed emotions detected."
}
```

**Expected Response (if less than 3):**
```json
{
  "success": true,
  "alert": false,
  "message": "Only 2 check-ins found"
}
```

---

## 🛠️ Troubleshooting

### ❌ Alert Not Sent

**Check 1: Telegram Configuration**
```bash
# Verify .env file
cat .env

# Should contain:
TELEGRAM_BOT_TOKEN=your-token-here
TELEGRAM_CHAT_ID=your-chat-id-here
```

**Check 2: Console Logs**
Open browser DevTools (F12) → Console tab
Look for:
- ✅ `"✅ Telegram alert sent successfully!"`
- ❌ `"❌ Telegram credentials not configured"`

**Check 3: Database Query**
```sql
-- Check last 3 check-ins for a student
SELECT emotion, created_at 
FROM emotion_checkins 
WHERE student_id = 'YOUR_STUDENT_ID'
ORDER BY created_at DESC
LIMIT 3;
```

**Check 4: Server Logs**
Check terminal running `npm run dev`:
```
Check-in successful: { studentId: '...', emotion: 'stressed' }
Alert API response: { success: true, alert: true, ... }
```

### ❌ Dashboard Not Showing Students

**Verify:**
1. Correct class selected
2. Students have checked in today
3. At least one student has stressed/sleepy/normal emotion
4. Page refresh (F5)

---

## 📊 Testing Checklist

Use this checklist to verify all functionality:

- [ ] **Stressed Pattern Alert**
  - [ ] Day 1 check-in successful
  - [ ] Day 2 check-in successful
  - [ ] Day 3 triggers Telegram alert
  - [ ] Alert shows HIGH priority
  - [ ] Student appears on dashboard

- [ ] **Sleepy Pattern Alert**
  - [ ] Day 1 check-in successful
  - [ ] Day 2 check-in successful
  - [ ] Day 3 triggers Telegram alert
  - [ ] Alert shows MEDIUM priority
  - [ ] Student appears on dashboard

- [ ] **Normal Pattern Alert**
  - [ ] Day 1 check-in successful
  - [ ] Day 2 check-in successful
  - [ ] Day 3 triggers Telegram alert
  - [ ] Alert shows LOW priority
  - [ ] Student appears on dashboard

- [ ] **Mixed Emotions (No Alert)**
  - [ ] Different emotions don't trigger alert
  - [ ] System only tracks consecutive identical patterns

- [ ] **Dashboard Display**
  - [ ] Enhanced notification info box shows all 3 patterns
  - [ ] Students displayed with correct icons
  - [ ] Emotions labeled correctly

---

## 🎯 Success Criteria

All tests pass if:
1. ✅ Each pattern (stressed, sleepy, normal) triggers appropriate alert
2. ✅ Telegram messages contain correct priority levels
3. ✅ Recommendations are specific to each pattern
4. ✅ Dashboard shows all three emotion types correctly
5. ✅ Mixed emotions don't trigger false alerts

---

## 📞 Support

If you encounter issues:
1. Check `docs/TROUBLESHOOTING.md`
2. Review `docs/ENHANCED_ALERT_SYSTEM.md`
3. Verify Telegram setup in `docs/TELEGRAM_QUICK_SETUP.md`

---

**Last Updated:** November 27, 2025
**Version:** 2.0.0 - Enhanced Multi-Pattern Alert System
