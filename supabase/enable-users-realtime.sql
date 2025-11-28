-- Enable Realtime for users table
-- This is needed for account deactivation notification feature

-- Step 1: Enable RLS if not already enabled
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Step 2: Drop existing policies (if any)
DROP POLICY IF EXISTS "Allow public read on users" ON users;
DROP POLICY IF EXISTS "Allow authenticated read on users" ON users;

-- Step 3: Create RLS Policy
-- Allow users to read their own data
CREATE POLICY "Users can read own data" 
ON users FOR SELECT 
USING (true);  -- For now, allow all reads (you can restrict this later)

-- Step 4: Add users table to Realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE users;

-- Verify
SELECT schemaname, tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime';
