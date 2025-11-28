# Enhanced Multi-Pattern Alert System

## Overview

The EmoClass alert system has been enhanced to detect and notify guidance counselors (Guru BK) about **three distinct emotional patterns** detected over 3 consecutive days. Each pattern triggers a specific Telegram notification with appropriate follow-up recommendations.

---

## 🎯 Detected Patterns

### 1. **Stressed/Sad Pattern** 😔
**Detection:** Student shows stressed/sad emotion for 3 consecutive days

**Alert Priority:** 🔴 **TINGGI (HIGH)**

**Telegram Message Includes:**
- Student name and class
- Pattern description
- **Recommended Actions:**
  1. 🗣️ Conduct individual counseling immediately
  2. 🏠 Contact parents/guardians for coordination
  3. 👥 Consider peer support group sessions
  4. 📋 Evaluate academic or social factors that may be causing stress
  5. 💚 Monitor daily emotional development next week

**Timeline:** Schedule meeting within 1-2 working days

---

### 2. **Sleepy/Drowsy Pattern** 😴
**Detection:** Student shows sleepy/drowsy emotion for 3 consecutive days

**Alert Priority:** 🟡 **SEDANG (MEDIUM)**

**Telegram Message Includes:**
- Student name and class
- Pattern description
- **Recommended Actions:**
  1. 🛏️ Ask about sleep patterns and health
  2. 📱 Evaluate gadget usage before bedtime
  3. 🏠 Consult with parents about evening routines
  4. 🏥 Consider referral to health professionals if necessary
  5. 💡 Educate on sleep hygiene importance
  6. 📚 Evaluate homework load and extracurricular activities

**Timeline:** Light counseling within 2-3 days

---

### 3. **Normal Energy Pattern** 🙂
**Detection:** Student shows normal/flat energy for 3 consecutive days

**Alert Priority:** 🔵 **RENDAH - Monitoring (LOW)**

**Telegram Message Includes:**
- Student name and class
- Pattern description
- **Recommended Actions:**
  1. 💬 Conduct informal check-in to understand student condition
  2. 🎯 Evaluate motivation and engagement in class
  3. 🌟 Find opportunities to increase positive involvement
  4. 🤝 Consider activities that could boost enthusiasm
  5. 📊 Monitor whether this is a consistent pattern or temporary phase

**Timeline:** Observation and informal check-in this week

---

## 🔧 Technical Implementation

### Alert Detection Logic

The system now checks for **3 consecutive identical emotions** in these categories:
- `stressed` → Triggers High Priority Alert
- `sleepy` → Triggers Medium Priority Alert
- `normal` → Triggers Low Priority Monitoring Alert

### Components Updated

1. **Supabase Edge Function** (`supabase/functions/alert-detector/index.ts`)
   - Enhanced to detect all three patterns
   - Sends differentiated Telegram messages based on alert type

2. **Check Alert API Route** (`app/api/check-alert/route.ts`)
   - Updated to handle three distinct alert types
   - Provides structured recommendations for each pattern

3. **Input Emotion Page** (`app/input-emotion/page.tsx`)
   - Now triggers alert checks for stressed, sleepy, AND normal emotions

4. **Dashboard UI** (`app/dashboard/page.tsx`)
   - Updated notification info box to show all three patterns
   - Enhanced student attention list to display all three emotion types
   - Modified database query to include 'normal' in attention tracking

---

## 📱 Telegram Message Format

### Example: Stressed Pattern Alert

```
🚨 EMOCLASS ALERT - PERLU PERHATIAN KHUSUS

👤 Siswa: Ahmad Rizki
📚 Kelas: Kelas 7A
😔 Pola: Emosi sedih/tertekan selama 3 hari berturut-turut

⚠️ REKOMENDASI TINDAK LANJUT GURU BK:
1. 🗣️ Lakukan konseling individual segera
2. 🏠 Hubungi orang tua/wali untuk koordinasi
3. 👥 Pertimbangkan sesi kelompok dukungan sebaya
4. 📋 Evaluasi faktor akademik atau sosial yang mungkin menjadi penyebab
5. 💚 Pantau perkembangan emosi harian minggu depan

📅 Tindakan: Jadwalkan pertemuan dalam 1-2 hari kerja
⏰ Prioritas: TINGGI
```

### Example: Sleepy Pattern Alert

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

### Example: Normal Pattern Alert

```
ℹ️ EMOCLASS MONITORING - PEMANTAUAN RUTIN

👤 Siswa: Budi Santoso
📚 Kelas: Kelas 7A
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

---

## 🧪 Testing the System

### Test Scenario 1: Stressed Pattern (High Priority)
1. Select a student (e.g., Ahmad Rizki from Kelas 7A)
2. Check-in with "Sedih" (😔) emotion on Day 1
3. Check-in with "Sedih" (😔) emotion on Day 2
4. Check-in with "Sedih" (😔) emotion on Day 3
5. **Expected:** Telegram alert sent with HIGH priority recommendations

### Test Scenario 2: Sleepy Pattern (Medium Priority)
1. Select a student (e.g., Siti Nurhaliza from Kelas 7A)
2. Check-in with "Mengantuk" (😴) emotion on Day 1
3. Check-in with "Mengantuk" (😴) emotion on Day 2
4. Check-in with "Mengantuk" (😴) emotion on Day 3
5. **Expected:** Telegram alert sent with MEDIUM priority health recommendations

### Test Scenario 3: Normal Pattern (Low Priority)
1. Select a student (e.g., Budi Santoso from Kelas 7A)
2. Check-in with "Biasa saja" (🙂) emotion on Day 1
3. Check-in with "Biasa saja" (🙂) emotion on Day 2
4. Check-in with "Biasa saja" (🙂) emotion on Day 3
5. **Expected:** Telegram alert sent with LOW priority monitoring recommendations

---

## 🎨 Dashboard UI Updates

The dashboard now displays:

### Enhanced Notification Info Box
Shows all three alert patterns with their priorities:
- 😔 3 hari sedih/tertekan (Prioritas: TINGGI)
- 😴 3 hari mengantuk (Prioritas: SEDANG)
- 🙂 3 hari energi normal/datar (Prioritas: RENDAH - Monitoring)

### Students Needing Attention
Displays students with any of the three tracked emotions:
- Stressed/Sad students with 😔 icon
- Sleepy students with 😴 icon
- Normal energy students with 🙂 icon

---

## 🔑 Key Benefits

1. **Early Intervention** - Catch students who need help before problems escalate
2. **Holistic Monitoring** - Track not just negative emotions, but also lack of engagement
3. **Prioritized Responses** - Guidance counselors know which cases need immediate attention
4. **Actionable Recommendations** - Each alert includes specific, practical follow-up steps
5. **Automated Workflow** - Zero manual monitoring required from teachers

---

## 📊 Impact on Educational Wellbeing

### For Students
- More comprehensive emotional support
- Earlier intervention when struggling
- Better engagement monitoring

### For Guidance Counselors (Guru BK)
- Clear prioritization of cases
- Structured follow-up recommendations
- Automated early warning system
- Reduced manual monitoring workload

### For Teachers
- Better understanding of class emotional dynamics
- Real-time insights into student wellbeing
- Data-driven intervention strategies

---

## 🚀 Future Enhancements

Potential additions:
- Configurable threshold (currently fixed at 3 days)
- Parent notifications via WhatsApp/SMS
- Weekly summary reports
- Historical pattern analysis
- Integration with academic performance data

---

## 📝 Notes

- All Telegram messages are in Bahasa Indonesia for Indonesian school context
- Emojis are used strategically to make alerts visually clear
- Priority levels help counselors triage cases effectively
- System respects one check-in per day per student constraint

---

**Last Updated:** November 27, 2025
**Version:** 2.0.0 - Enhanced Multi-Pattern Alert System
