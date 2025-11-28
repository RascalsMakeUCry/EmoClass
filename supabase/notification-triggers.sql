-- Database Triggers untuk Auto-create Notifications
-- Run this after notifications-schema.sql

-- ============================================================================
-- TRIGGER 1: Alert untuk Siswa dengan Emosi Negatif 3 Hari Berturut-turut
-- ============================================================================

CREATE OR REPLACE FUNCTION check_consecutive_negative_emotions()
RETURNS TRIGGER AS $$
DECLARE
  consecutive_count INTEGER;
  teacher_record RECORD;
  student_name TEXT;
  class_name TEXT;
BEGIN
  -- Only check for stressed emotions
  IF NEW.emotion != 'stressed' THEN
    RETURN NEW;
  END IF;

  -- Count consecutive stressed check-ins in last 3 days
  SELECT COUNT(DISTINCT DATE(created_at))
  INTO consecutive_count
  FROM emotion_checkins
  WHERE student_id = NEW.student_id
    AND emotion = 'stressed'
    AND created_at >= NOW() - INTERVAL '3 days'
    AND created_at <= NOW();

  -- If 3 consecutive days, create notification for all teachers
  IF consecutive_count >= 3 THEN
    -- Get student and class info
    SELECT s.name, c.name
    INTO student_name, class_name
    FROM students s
    JOIN classes c ON s.class_id = c.id
    WHERE s.id = NEW.student_id;

    -- Create notification for all teachers
    FOR teacher_record IN 
      SELECT id FROM users WHERE role = 'teacher' AND is_active = true
    LOOP
      INSERT INTO notifications (user_id, type, priority, title, message, metadata)
      VALUES (
        teacher_record.id,
        'alert',
        'urgent',
        '🚨 Siswa Membutuhkan Perhatian Segera',
        student_name || ' dari ' || class_name || ' menunjukkan emosi sedih/tertekan 3 hari berturut-turut. Disarankan untuk segera melakukan pendekatan personal.',
        jsonb_build_object(
          'student_id', NEW.student_id,
          'student_name', student_name,
          'class_name', class_name,
          'emotion', 'stressed',
          'pattern_days', consecutive_count,
          'last_checkin', NEW.created_at
        )
      )
      ON CONFLICT DO NOTHING; -- Prevent duplicates
    END LOOP;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_consecutive_negative_emotions ON emotion_checkins;
CREATE TRIGGER trigger_consecutive_negative_emotions
  AFTER INSERT ON emotion_checkins
  FOR EACH ROW
  EXECUTE FUNCTION check_consecutive_negative_emotions();

-- ============================================================================
-- TRIGGER 2: Notification saat Siswa Baru Ditambahkan (Bulk Import)
-- ============================================================================

CREATE OR REPLACE FUNCTION notify_student_added()
RETURNS TRIGGER AS $$
DECLARE
  teacher_record RECORD;
  class_name TEXT;
  recent_count INTEGER;
BEGIN
  -- Get class name
  SELECT name INTO class_name
  FROM classes
  WHERE id = NEW.class_id;

  -- Check if this is part of bulk import (multiple inserts in last 5 seconds)
  SELECT COUNT(*)
  INTO recent_count
  FROM students
  WHERE class_id = NEW.class_id
    AND created_at >= NOW() - INTERVAL '5 seconds';

  -- Only notify if bulk import (5+ students added)
  IF recent_count >= 5 THEN
    -- Create notification for all teachers (only once per bulk import)
    FOR teacher_record IN 
      SELECT id FROM users WHERE role = 'teacher' AND is_active = true
    LOOP
      -- Check if notification already exists for this bulk import
      IF NOT EXISTS (
        SELECT 1 FROM notifications
        WHERE user_id = teacher_record.id
          AND type = 'system'
          AND metadata->>'class_name' = class_name
          AND created_at >= NOW() - INTERVAL '10 seconds'
      ) THEN
        INSERT INTO notifications (user_id, type, priority, title, message, metadata)
        VALUES (
          teacher_record.id,
          'system',
          'low',
          '👥 Data Siswa Baru Ditambahkan',
          recent_count || ' siswa baru berhasil ditambahkan ke ' || class_name || ' melalui import Excel.',
          jsonb_build_object(
            'action', 'bulk_import',
            'class_id', NEW.class_id,
            'class_name', class_name,
            'student_count', recent_count,
            'import_method', 'excel'
          )
        );
      END IF;
    END LOOP;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_notify_student_added ON students;
CREATE TRIGGER trigger_notify_student_added
  AFTER INSERT ON students
  FOR EACH ROW
  EXECUTE FUNCTION notify_student_added();

-- ============================================================================
-- TRIGGER 3: Notification saat Kelas Baru Dibuat
-- ============================================================================

CREATE OR REPLACE FUNCTION notify_class_created()
RETURNS TRIGGER AS $$
DECLARE
  teacher_record RECORD;
BEGIN
  -- Create notification for all teachers
  FOR teacher_record IN 
    SELECT id FROM users WHERE role = 'teacher' AND is_active = true
  LOOP
    INSERT INTO notifications (user_id, type, priority, title, message, metadata)
    VALUES (
      teacher_record.id,
      'system',
      'low',
      '🏫 Kelas Baru Dibuat',
      'Kelas ' || NEW.name || ' berhasil dibuat. Anda sekarang dapat menambahkan siswa ke kelas ini.',
      jsonb_build_object(
        'action', 'class_created',
        'class_id', NEW.id,
        'class_name', NEW.name,
        'created_at', NEW.created_at
      )
    );
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_notify_class_created ON classes;
CREATE TRIGGER trigger_notify_class_created
  AFTER INSERT ON classes
  FOR EACH ROW
  EXECUTE FUNCTION notify_class_created();

-- ============================================================================
-- TRIGGER 4: Notification saat Siswa Check-in (Real-time)
-- ============================================================================

CREATE OR REPLACE FUNCTION notify_student_checkin()
RETURNS TRIGGER AS $$
DECLARE
  teacher_record RECORD;
  student_name TEXT;
  class_name TEXT;
  emotion_emoji TEXT;
BEGIN
  -- Get student and class info
  SELECT s.name, c.name
  INTO student_name, class_name
  FROM students s
  JOIN classes c ON s.class_id = c.id
  WHERE s.id = NEW.student_id;

  -- Map emotion to emoji
  emotion_emoji := CASE NEW.emotion
    WHEN 'happy' THEN '😊'
    WHEN 'neutral' THEN '😐'
    WHEN 'sad' THEN '😢'
    WHEN 'stressed' THEN '😰'
    ELSE '📝'
  END;

  -- Create notification for all active teachers
  FOR teacher_record IN 
    SELECT id FROM users WHERE role = 'teacher' AND is_active = true
  LOOP
    INSERT INTO notifications (user_id, type, priority, title, message, metadata)
    VALUES (
      teacher_record.id,
      'system',
      CASE 
        WHEN NEW.emotion IN ('sad', 'stressed') THEN 'high'
        ELSE 'low'
      END,
      emotion_emoji || ' Check-in Baru',
      student_name || ' dari ' || class_name || ' baru saja check-in dengan emosi: ' || NEW.emotion || 
      CASE 
        WHEN NEW.note IS NOT NULL AND NEW.note != '' THEN '. Catatan: ' || NEW.note
        ELSE ''
      END,
      jsonb_build_object(
        'action', 'student_checkin',
        'student_id', NEW.student_id,
        'student_name', student_name,
        'class_name', class_name,
        'emotion', NEW.emotion,
        'note', NEW.note,
        'checkin_time', NEW.created_at
      )
    );
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_notify_student_checkin ON emotion_checkins;
CREATE TRIGGER trigger_notify_student_checkin
  AFTER INSERT ON emotion_checkins
  FOR EACH ROW
  EXECUTE FUNCTION notify_student_checkin();

-- ============================================================================
-- Verify Triggers Created
-- ============================================================================

SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
  AND (trigger_name LIKE 'trigger_notify%'
  OR trigger_name LIKE 'trigger_consecutive%')
ORDER BY trigger_name;
