# 🚀 Deployment Guide - EmoClass with Authentication

Panduan lengkap deploy EmoClass dengan authentication system ke production.

## 📋 Pre-Deployment Checklist

### 1. Local Testing
- [ ] Build passes: `npm run build`
- [ ] Login works with admin account
- [ ] Can create teacher accounts
- [ ] Teacher login works
- [ ] All protected routes accessible
- [ ] Middleware protection works
- [ ] Logout functionality works

### 2. Database Setup
- [ ] Production Supabase project created
- [ ] `schema.sql` executed
- [ ] `auth-schema.sql` executed
- [ ] Admin account exists in users table
- [ ] RLS policies enabled
- [ ] Realtime enabled (optional)

### 3. Environment Variables
- [ ] JWT_SECRET generated (strong random string)
- [ ] Supabase URL copied
- [ ] Supabase Anon Key copied
- [ ] Telegram credentials (if using alerts)

## 🔧 Step-by-Step Deployment

### Step 1: Prepare Production Database

1. **Create Production Supabase Project**
   ```
   - Go to https://supabase.com/dashboard
   - Click "New Project"
   - Choose organization
   - Enter project name: "emoclass-production"
   - Choose region (closest to users)
   - Generate strong database password
   - Wait for project to be ready (~2 minutes)
   ```

2. **Run Database Schemas**
   ```sql
   -- In Supabase SQL Editor:
   
   -- 1. Run schema.sql (creates classes, students, emotion_checkins)
   -- Copy paste entire content of: supabase/schema.sql
   -- Click Run
   
   -- 2. Run auth-schema.sql (creates users table)
   -- Copy paste entire content of: supabase/auth-schema.sql
   -- Click Run
   ```

3. **Verify Tables Created**
   ```
   - Go to Table Editor
   - Should see tables:
     ✓ classes
     ✓ students
     ✓ emotion_checkins
     ✓ users
   ```

4. **Verify Admin Account**
   ```
   - Open users table
   - Should see 1 row:
     - email: admin@emoclass.com
     - role: admin
     - is_active: true
   ```

### Step 2: Generate Strong JWT Secret

```bash
# Option 1: Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Option 2: Using OpenSSL
openssl rand -hex 32

# Option 3: Online generator
# Visit: https://generate-secret.vercel.app/32

# Example output:
# 8f7a9b2c4d6e1f3a5b7c9d0e2f4a6b8c1d3e5f7a9b0c2d4e6f8a0b2c4d6e8f0a
```

Save this for Step 4!

### Step 3: Push to GitHub

```bash
# Initialize git (if not already)
git init

# Add all files
git add .

# Commit
git commit -m "Add authentication system"

# Create GitHub repository
# Go to https://github.com/new
# Create repository: "emoclass"

# Add remote
git remote add origin https://github.com/YOUR_USERNAME/emoclass.git

# Push
git branch -M main
git push -u origin main
```

### Step 4: Deploy to Vercel

1. **Import Project**
   ```
   - Go to https://vercel.com
   - Click "Add New" → "Project"
   - Import from GitHub
   - Select "emoclass" repository
   - Click "Import"
   ```

2. **Configure Project**
   ```
   Framework Preset: Next.js
   Root Directory: emoclass (if monorepo) or ./ (if single project)
   Build Command: npm run build
   Output Directory: .next
   Install Command: npm install
   ```

3. **Add Environment Variables**
   ```
   Click "Environment Variables"
   Add the following:
   
   Name: NEXT_PUBLIC_SUPABASE_URL
   Value: https://your-project.supabase.co
   
   Name: NEXT_PUBLIC_SUPABASE_ANON_KEY
   Value: your_supabase_anon_key
   
   Name: JWT_SECRET
   Value: (paste the 64-character hex from Step 2)
   
   Name: TELEGRAM_BOT_TOKEN (optional)
   Value: your_telegram_bot_token
   
   Name: TELEGRAM_CHAT_ID (optional)
   Value: your_telegram_chat_id
   ```

4. **Deploy**
   ```
   - Click "Deploy"
   - Wait for build to complete (~2-3 minutes)
   - Should see: "Congratulations! Your project has been deployed"
   ```

### Step 5: Post-Deployment Testing

1. **Test Login**
   ```
   - Visit: https://your-app.vercel.app
   - Should redirect to /login
   - Login with:
     Email: admin@emoclass.com
     Password: admin123
   - Should redirect to /admin dashboard
   ```

2. **Change Admin Password**
   ```
   IMPORTANT: Change default password immediately!
   
   Option 1: Via Supabase SQL Editor
   -- Generate new hash
   -- In your local terminal:
   node scripts/generate-admin-hash.js
   -- Enter new password when prompted
   -- Copy the hash
   
   -- Update in Supabase:
   UPDATE users 
   SET password_hash = 'new_hash_here'
   WHERE email = 'admin@emoclass.com';
   
   Option 2: Add "Change Password" feature (recommended)
   -- See AUTH_SETUP.md for implementation guide
   ```

3. **Create First Teacher**
   ```
   - In admin dashboard
   - Click "+ Tambah Guru"
   - Fill form:
     Name: Test Teacher
     Email: teacher@school.com
     Password: (strong password)
   - Click "Buat Akun"
   - Verify teacher appears in list
   ```

4. **Test Teacher Login**
   ```
   - Logout from admin
   - Login with teacher credentials
   - Should redirect to /dashboard
   - Verify can access:
     ✓ Dashboard
     ✓ Input Emotion
     ✓ Reports
     ✓ Notifications
   - Verify CANNOT access:
     ✗ /admin (should redirect to /dashboard)
   ```

5. **Test Student Check-in**
   ```
   - As teacher, go to /input-emotion
   - Select student
   - Choose emotion
   - Add note (optional)
   - Submit
   - Verify data appears in dashboard
   ```

### Step 6: Configure Custom Domain (Optional)

1. **Add Domain in Vercel**
   ```
   - Go to Project Settings
   - Click "Domains"
   - Add your domain: emoclass.school.com
   - Follow DNS configuration instructions
   ```

2. **Update Supabase Allowed Origins**
   ```
   - Go to Supabase Dashboard
   - Settings → API
   - Add to "Site URL": https://emoclass.school.com
   - Add to "Redirect URLs": https://emoclass.school.com/*
   ```

## 🔒 Security Hardening

### 1. Change Default Credentials
```sql
-- In Supabase SQL Editor:
UPDATE users 
SET password_hash = '$2b$10$NEW_HASH_HERE'
WHERE email = 'admin@emoclass.com';
```

### 2. Rotate JWT Secret Regularly
```bash
# Generate new secret
openssl rand -hex 32

# Update in Vercel:
# Settings → Environment Variables → JWT_SECRET → Edit
# Redeploy: Deployments → Latest → Redeploy
```

### 3. Enable Supabase Security Features
```
- Go to Supabase Dashboard
- Settings → API
- Enable "Email confirmations" (if using email)
- Enable "Secure email change" (if using email)
- Set "JWT expiry limit" to 86400 (24 hours)
```

### 4. Monitor Failed Login Attempts
```sql
-- Create audit log table (optional):
CREATE TABLE auth_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT,
  action TEXT,
  success BOOLEAN,
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add logging to login API
-- See AUTH_SETUP.md for implementation
```

## 📊 Monitoring & Maintenance

### 1. Vercel Analytics
```
- Go to Vercel Dashboard
- Click "Analytics"
- Monitor:
  - Page views
  - Response times
  - Error rates
  - Geographic distribution
```

### 2. Supabase Monitoring
```
- Go to Supabase Dashboard
- Click "Database"
- Monitor:
  - Database size
  - Active connections
  - Query performance
  - API requests
```

### 3. Regular Backups
```
- Supabase auto-backups (daily)
- Manual backup:
  - Settings → Database → Backup
  - Download SQL dump
  - Store securely
```

### 4. Update Dependencies
```bash
# Check for updates
npm outdated

# Update packages
npm update

# Test locally
npm run build
npm run dev

# Deploy
git add package*.json
git commit -m "Update dependencies"
git push
```

## 🚨 Troubleshooting

### Build Fails on Vercel
```
1. Check build logs in Vercel dashboard
2. Verify all environment variables are set
3. Test build locally: npm run build
4. Check for TypeScript errors
5. Verify all dependencies in package.json
```

### Login Not Working
```
1. Check browser console for errors
2. Verify JWT_SECRET is set in Vercel
3. Check Supabase credentials are correct
4. Verify users table exists
5. Check admin account exists in database
```

### Redirect Loop
```
1. Clear browser cookies
2. Check middleware.ts is deployed
3. Verify JWT_SECRET matches between deployments
4. Check token expiration (24h default)
```

### Cannot Access Protected Routes
```
1. Verify middleware is working
2. Check auth-token cookie is set
3. Verify JWT_SECRET is correct
4. Check user role in database
5. Test token verification: GET /api/me
```

## 📝 Post-Deployment Checklist

- [ ] Admin login works
- [ ] Changed default admin password
- [ ] Created test teacher account
- [ ] Teacher login works
- [ ] Student check-in works
- [ ] Dashboard shows data
- [ ] Real-time updates work (if enabled)
- [ ] Telegram alerts work (if enabled)
- [ ] All protected routes accessible
- [ ] Middleware protection works
- [ ] Logout works
- [ ] Custom domain configured (if applicable)
- [ ] SSL/HTTPS enabled (automatic on Vercel)
- [ ] Monitoring enabled
- [ ] Backup strategy in place

## 🎉 Success!

Your EmoClass application with authentication is now live in production!

### Share with Users

**For Admin:**
```
URL: https://your-app.vercel.app
Email: admin@emoclass.com
Password: (your new password)

Instructions:
1. Login to admin dashboard
2. Create teacher accounts
3. Give credentials to teachers
```

**For Teachers:**
```
URL: https://your-app.vercel.app
Email: (provided by admin)
Password: (provided by admin)

Instructions:
1. Login with credentials from admin
2. Go to "Input Emosi" page
3. Students select their emotions
4. View dashboard for real-time monitoring
```

**For Students:**
```
No login required!
Just select your emotion when teacher opens the page.
```

## 📞 Support

If you need help:
1. Check `TROUBLESHOOTING.md`
2. Check Vercel build logs
3. Check Supabase logs
4. Check browser console
5. Review `AUTH_SETUP.md`

## 🔄 Continuous Deployment

Every push to `main` branch will automatically deploy to Vercel:

```bash
# Make changes
git add .
git commit -m "Update feature"
git push

# Vercel automatically:
# 1. Detects push
# 2. Runs build
# 3. Deploys if successful
# 4. Updates production URL
```

---

**Deployment Date**: November 27, 2025
**Status**: ✅ PRODUCTION READY
**Platform**: Vercel + Supabase
**Cost**: $0 (Free tier)

**Happy deploying! 🚀**
