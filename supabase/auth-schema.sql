-- Authentication Schema for EmoClass
-- Admin-only registration system for teachers

-- Users table (for admin and teachers)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'teacher')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for email lookup
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
DROP POLICY IF EXISTS "Allow authenticated read on users" ON users;
DROP POLICY IF EXISTS "Allow admin full access on users" ON users;

-- Allow authenticated users to read user data
CREATE POLICY "Allow authenticated read on users" ON users 
  FOR SELECT USING (true);

-- Allow admin to manage users (handled in API layer)
CREATE POLICY "Allow admin full access on users" ON users 
  FOR ALL USING (true);

-- Seed initial admin account
-- Password: admin123 (hashed with bcrypt, cost 10)
-- IMPORTANT: Change this password after first login!
INSERT INTO users (email, password_hash, full_name, role) VALUES
  ('admin@emoclass.com', '$2b$10$pHt73a01oRcKp6oWohcFretF7MR4vlP8pkVjM/zVTpOY1Bz0qBh0.', 'Administrator', 'admin')
ON CONFLICT (email) DO NOTHING;
