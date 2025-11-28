-- Test Notifications for User ID: ba9a0704-30fc-442f-b1b9-508247b295ed
-- Run this SQL in Supabase SQL Editor to create sample notifications

-- 1. URGENT ALERT - Siswa butuh perhatian segera
INSERT INTO notifications (user_id, type, priority, title, message, metadata)
VALUES (
  'ba9a0704-30fc-442f-b1b9-508247b295ed',
  'alert',
  'urgent',
  '🚨 Siswa Membutuhkan Perhatian Segera',
  'Ahmad Rizki dari Kelas 7A menunjukkan emosi sedih 3 hari berturut-turut. Disarankan untuk segera melakukan pendekatan personal.',
  jsonb_build_object(
    'student_id', 'sample-student-1',
    'student_name', 'Ahmad Rizki',
    'class_name', 'Kelas 7A',
    'emotion', 'stressed',
    'pattern_days', 3,
    'last_checkin', NOW()
  )
);

-- 2. HIGH ALERT - Siswa dengan pola menurun
INSERT INTO notifications (user_id, type, priority, title, message, metadata)
VALUES (
  'ba9a0704-30fc-442f-b1b9-508247b295ed',
  'alert',
  'high',
  '⚠️ Pola Emosi Menurun',
  'Siti Nurhaliza dari Kelas 7B menunjukkan penurunan mood dalam 5 hari terakhir. Perlu monitoring lebih lanjut.',
  jsonb_build_object(
    'student_id', 'sample-student-2',
    'student_name', 'Siti Nurhaliza',
    'class_name', 'Kelas 7B',
    'emotion_trend', 'declining',
    'days', 5
  )
);

-- 3. NORMAL ALERT - Siswa belum check-in
INSERT INTO notifications (user_id, type, priority, title, message, metadata)
VALUES (
  'ba9a0704-30fc-442f-b1b9-508247b295ed',
  'alert',
  'normal',
  '📋 Siswa Belum Check-in',
  '5 siswa dari Kelas 8A belum melakukan check-in emosi hari ini.',
  jsonb_build_object(
    'class_name', 'Kelas 8A',
    'missing_count', 5,
    'total_students', 30,
    'date', CURRENT_DATE
  )
);

-- 4. SYSTEM - Akun diaktifkan kembali
INSERT INTO notifications (user_id, type, priority, title, message, metadata)
VALUES (
  'ba9a0704-30fc-442f-b1b9-508247b295ed',
  'system',
  'normal',
  '✅ Akun Diaktifkan Kembali',
  'Akun Anda telah diaktifkan kembali oleh administrator. Anda sekarang dapat mengakses semua fitur EmoClass.',
  jsonb_build_object(
    'action', 'account_activated',
    'activated_by', 'admin',
    'activated_at', NOW()
  )
);

-- 5. SYSTEM - Data siswa ditambahkan
INSERT INTO notifications (user_id, type, priority, title, message, metadata)
VALUES (
  'ba9a0704-30fc-442f-b1b9-508247b295ed',
  'system',
  'normal',
  '👥 Data Siswa Baru Ditambahkan',
  '25 siswa baru berhasil ditambahkan ke Kelas 7C melalui import Excel.',
  jsonb_build_object(
    'action', 'bulk_import',
    'class_name', 'Kelas 7C',
    'student_count', 25,
    'import_method', 'excel'
  )
);

-- 6. SYSTEM - Password diubah
INSERT INTO notifications (user_id, type, priority, title, message, metadata, created_at)
VALUES (
  'ba9a0704-30fc-442f-b1b9-508247b295ed',
  'system',
  'low',
  '🔐 Password Berhasil Diubah',
  'Password akun Anda telah berhasil diubah. Jika ini bukan Anda, segera hubungi administrator.',
  jsonb_build_object(
    'action', 'password_changed',
    'changed_at', NOW() - INTERVAL '2 hours'
  ),
  NOW() - INTERVAL '2 hours'
);

-- 7. SUMMARY - Ringkasan harian
INSERT INTO notifications (user_id, type, priority, title, message, metadata, created_at)
VALUES (
  'ba9a0704-30fc-442f-b1b9-508247b295ed',
  'summary',
  'normal',
  '📊 Ringkasan Check-in Hari Ini',
  'Check-in hari ini: 85% (34/40 siswa). Mood kelas: Positif 😊. 3 siswa perlu perhatian.',
  jsonb_build_object(
    'date', CURRENT_DATE,
    'total_students', 40,
    'checked_in', 34,
    'checkin_rate', 85,
    'mood_positive', 28,
    'mood_normal', 3,
    'mood_negative', 3,
    'needs_attention', 3
  ),
  NOW() - INTERVAL '1 hour'
);

-- 8. SUMMARY - Ringkasan mingguan
INSERT INTO notifications (user_id, type, priority, title, message, metadata, created_at)
VALUES (
  'ba9a0704-30fc-442f-b1b9-508247b295ed',
  'summary',
  'normal',
  '📈 Ringkasan Mingguan',
  'Minggu ini: Rata-rata check-in 82%. Mood kelas meningkat 15% dibanding minggu lalu. Bagus! 👏',
  jsonb_build_object(
    'week_start', CURRENT_DATE - INTERVAL '7 days',
    'week_end', CURRENT_DATE,
    'avg_checkin_rate', 82,
    'mood_improvement', 15,
    'total_checkins', 234,
    'trend', 'improving'
  ),
  NOW() - INTERVAL '1 day'
);

-- 9. ALERT - Siswa dengan emosi mengantuk berulang
INSERT INTO notifications (user_id, type, priority, title, message, metadata, created_at)
VALUES (
  'ba9a0704-30fc-442f-b1b9-508247b295ed',
  'alert',
  'normal',
  '😴 Pola Kelelahan Terdeteksi',
  'Budi Santoso dari Kelas 8B menunjukkan emosi mengantuk/lelah 4 hari berturut-turut. Mungkin perlu istirahat lebih.',
  jsonb_build_object(
    'student_id', 'sample-student-3',
    'student_name', 'Budi Santoso',
    'class_name', 'Kelas 8B',
    'emotion', 'normal',
    'pattern_days', 4,
    'suggestion', 'Cek beban tugas atau aktivitas ekstrakurikuler'
  ),
  NOW() - INTERVAL '30 minutes'
);

-- 10. SYSTEM - Kelas baru dibuat
INSERT INTO notifications (user_id, type, priority, title, message, metadata, created_at)
VALUES (
  'ba9a0704-30fc-442f-b1b9-508247b295ed',
  'system',
  'low',
  '🏫 Kelas Baru Dibuat',
  'Kelas 9A berhasil dibuat. Anda sekarang dapat menambahkan siswa ke kelas ini.',
  jsonb_build_object(
    'action', 'class_created',
    'class_name', 'Kelas 9A',
    'created_by', 'admin'
  ),
  NOW() - INTERVAL '3 hours'
);

-- Verify: Check all notifications created
SELECT 
  id,
  type,
  priority,
  title,
  is_read,
  created_at
FROM notifications
WHERE user_id = 'ba9a0704-30fc-442f-b1b9-508247b295ed'
ORDER BY created_at DESC;

-- Count by type
SELECT 
  type,
  COUNT(*) as count,
  SUM(CASE WHEN is_read THEN 0 ELSE 1 END) as unread_count
FROM notifications
WHERE user_id = 'ba9a0704-30fc-442f-b1b9-508247b295ed'
GROUP BY type;
