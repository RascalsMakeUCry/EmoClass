# Supabase Setup Instructions

## Step 1: Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign in or create a free account
3. Click "New Project"
4. Fill in:
   - Project name: `emoclass`
   - Database password: (generate a strong password)
   - Region: Choose closest to Indonesia (Singapore recommended)
5. Wait for project to be created (~2 minutes)

## Step 2: Get API Credentials

1. In your Supabase project dashboard, go to **Settings** > **API**
2. Copy the following values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public** key (long string starting with `eyJ...`)

## Step 3: Update Environment Variables

1. Open `.env.local` in the project root
2. Replace the placeholder values:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-actual-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-actual-anon-key-here
   ```

## Step 4: Run Database Schema

1. In Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy the entire contents of `supabase/schema.sql`
4. Paste into the SQL editor
5. Click **Run** button
6. Verify success: You should see "Success. No rows returned"

## Step 5: Verify Data

1. Go to **Table Editor** in Supabase dashboard
2. You should see 3 tables:
   - `classes` (3 rows: Kelas 7A, 8B, 9C)
   - `students` (30 rows: 10 students per class)
   - `emotion_checkins` (0 rows initially)

## Step 6: Configure Row Level Security (Optional but Recommended)

For production, add RLS policies:

```sql
-- Enable RLS
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE emotion_checkins ENABLE ROW LEVEL SECURITY;

-- Allow public read access (since we don't have auth)
CREATE POLICY "Allow public read on classes" ON classes FOR SELECT USING (true);
CREATE POLICY "Allow public read on students" ON students FOR SELECT USING (true);
CREATE POLICY "Allow public read on checkins" ON emotion_checkins FOR SELECT USING (true);

-- Allow public insert on checkins
CREATE POLICY "Allow public insert on checkins" ON emotion_checkins FOR INSERT WITH CHECK (true);

-- Allow public delete on checkins (for reset functionality)
CREATE POLICY "Allow public delete on checkins" ON emotion_checkins FOR DELETE USING (true);
```

## Troubleshooting

### Error: "relation does not exist"
- Make sure you ran the schema.sql file completely
- Check that all tables were created in Table Editor

### Error: "permission denied"
- Check that RLS policies are set up correctly
- Verify you're using the correct anon key

### No data showing in app
- Verify environment variables are set correctly
- Restart Next.js dev server after changing .env.local
- Check browser console for errors

## Next Steps

Once Supabase is configured, you can:
1. Start the Next.js development server: `npm run dev`
2. Test the check-in page at `http://localhost:3000`
3. Test the dashboard at `http://localhost:3000/dashboard`
