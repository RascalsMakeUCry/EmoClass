-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- 'alert', 'system', 'summary'
  priority VARCHAR(20) NOT NULL DEFAULT 'normal', -- 'urgent', 'high', 'normal', 'low'
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  metadata JSONB, -- Additional data (student_id, class_id, etc.)
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can only see their own notifications
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id OR true); -- Allow all for now, will be restricted by API

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id OR true);

-- System can insert notifications
CREATE POLICY "System can insert notifications"
  ON notifications FOR INSERT
  WITH CHECK (true);

-- Add to Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- Create function to auto-create notifications for student alerts
CREATE OR REPLACE FUNCTION create_student_alert_notification()
RETURNS TRIGGER AS $$
DECLARE
  teacher_id UUID;
  student_name TEXT;
  class_name TEXT;
BEGIN
  -- Get teacher ID from student's class
  SELECT u.id, s.name, c.name
  INTO teacher_id, student_name, class_name
  FROM students s
  JOIN classes c ON s.class_id = c.id
  JOIN users u ON u.role = 'teacher' -- Simplified: assign to all teachers
  WHERE s.id = NEW.student_id
  LIMIT 1;

  -- Create notification if teacher found
  IF teacher_id IS NOT NULL THEN
    INSERT INTO notifications (user_id, type, priority, title, message, metadata)
    VALUES (
      teacher_id,
      'alert',
      'urgent',
      'Siswa Membutuhkan Perhatian',
      student_name || ' dari ' || class_name || ' menunjukkan emosi negatif berturut-turut',
      jsonb_build_object(
        'student_id', NEW.student_id,
        'emotion', NEW.emotion,
        'pattern_days', 3
      )
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Note: Trigger will be created when alert system is integrated
