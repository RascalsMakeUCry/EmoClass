-- EmoClass Database Schema
-- This schema creates the necessary tables for the EmoClass application

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Classes table
CREATE TABLE IF NOT EXISTS classes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Students table
CREATE TABLE IF NOT EXISTS students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Emotion check-ins table
CREATE TABLE IF NOT EXISTS emotion_checkins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  emotion TEXT NOT NULL CHECK (emotion IN ('happy', 'neutral', 'normal', 'stressed', 'sleepy')),
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_checkins_student_date ON emotion_checkins(student_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_checkins_date ON emotion_checkins(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_students_class ON students(class_id);

-- Seed initial data: 3 classes with 10 students each
INSERT INTO classes (name) VALUES 
  ('Kelas 7A'),
  ('Kelas 8B'),
  ('Kelas 9C')
ON CONFLICT DO NOTHING;

-- Get class IDs for seeding students
DO $$
DECLARE
  class_7a_id UUID;
  class_8b_id UUID;
  class_9c_id UUID;
BEGIN
  SELECT id INTO class_7a_id FROM classes WHERE name = 'Kelas 7A' LIMIT 1;
  SELECT id INTO class_8b_id FROM classes WHERE name = 'Kelas 8B' LIMIT 1;
  SELECT id INTO class_9c_id FROM classes WHERE name = 'Kelas 9C' LIMIT 1;

  -- Seed students for Kelas 7A
  INSERT INTO students (name, class_id) VALUES
    ('Ahmad Rizki', class_7a_id),
    ('Siti Nurhaliza', class_7a_id),
    ('Budi Santoso', class_7a_id),
    ('Dewi Lestari', class_7a_id),
    ('Eko Prasetyo', class_7a_id),
    ('Fitri Handayani', class_7a_id),
    ('Gilang Ramadhan', class_7a_id),
    ('Hana Pertiwi', class_7a_id),
    ('Indra Gunawan', class_7a_id),
    ('Jasmine Putri', class_7a_id)
  ON CONFLICT DO NOTHING;

  -- Seed students for Kelas 8B
  INSERT INTO students (name, class_id) VALUES
    ('Kurnia Sari', class_8b_id),
    ('Lukman Hakim', class_8b_id),
    ('Maya Anggraini', class_8b_id),
    ('Nanda Pratama', class_8b_id),
    ('Olivia Tan', class_8b_id),
    ('Putra Wijaya', class_8b_id),
    ('Qori Amalia', class_8b_id),
    ('Reza Fauzi', class_8b_id),
    ('Sari Wulandari', class_8b_id),
    ('Taufik Hidayat', class_8b_id)
  ON CONFLICT DO NOTHING;

  -- Seed students for Kelas 9C
  INSERT INTO students (name, class_id) VALUES
    ('Umar Bakri', class_9c_id),
    ('Vina Melati', class_9c_id),
    ('Wahyu Nugroho', class_9c_id),
    ('Xena Kartika', class_9c_id),
    ('Yusuf Rahman', class_9c_id),
    ('Zahra Amira', class_9c_id),
    ('Andi Setiawan', class_9c_id),
    ('Bella Safira', class_9c_id),
    ('Citra Dewi', class_9c_id),
    ('Dimas Aditya', class_9c_id)
  ON CONFLICT DO NOTHING;
END $$;


-- ============================================
-- REALTIME CONFIGURATION
-- ============================================

-- Enable Row Level Security (RLS) - Required for Realtime
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE emotion_checkins ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first (to avoid conflicts)
DROP POLICY IF EXISTS "Allow public read on classes" ON classes;
DROP POLICY IF EXISTS "Allow public read on students" ON students;
DROP POLICY IF EXISTS "Allow public read on checkins" ON emotion_checkins;
DROP POLICY IF EXISTS "Allow public insert on checkins" ON emotion_checkins;
DROP POLICY IF EXISTS "Allow public delete on checkins" ON emotion_checkins;

-- RLS Policies: Allow public access (no authentication required)
CREATE POLICY "Allow public read on classes" ON classes FOR SELECT USING (true);
CREATE POLICY "Allow public read on students" ON students FOR SELECT USING (true);
CREATE POLICY "Allow public read on checkins" ON emotion_checkins FOR SELECT USING (true);
CREATE POLICY "Allow public insert on checkins" ON emotion_checkins FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public delete on checkins" ON emotion_checkins FOR DELETE USING (true);

-- Enable Realtime for emotion_checkins table
-- This allows clients to listen to INSERT/UPDATE/DELETE events
ALTER PUBLICATION supabase_realtime ADD TABLE emotion_checkins;
