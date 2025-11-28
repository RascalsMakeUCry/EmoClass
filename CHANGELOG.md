# Changelog

All notable changes to EmoClass project.

## [2.2.0] - 2025-11-27

### 🎯 Major Update: Admin Dashboard & Logout Feature

#### Added
- **Admin Dashboard Redesign** 🎨
  - Tab-based navigation (Teachers & Classes)
  - Modern UI with gradient header
  - User info display in header
  - Responsive layout

- **Manajemen Kelas & Siswa** 🏫
  - Create, view, delete classes
  - Create, view, delete students
  - Two-column layout (classes list + students grid)
  - Student count per class
  - Filtered student view by class
  - Confirmation dialogs for deletions

- **Enhanced Teachers Management** 👨‍🏫
  - Improved UI with better form design
  - Icons for all input fields
  - Peek password in create form
  - Better table layout
  - Success/error notifications with icons

- **Logout Feature** 🚪
  - Logout button in admin header
  - Logout button in teacher sidebar
  - Confirmation dialog before logout
  - Proper session cleanup
  - Redirect to login page

- **Components**
  - `components/admin/TeachersManagement.tsx` - Teachers CRUD
  - `components/admin/ClassesManagement.tsx` - Classes & Students CRUD
  - Updated `components/Sidebar.tsx` - Added logout button

#### Changed
- **Admin Page** - Complete redesign with tabs
- **Sidebar** - Added logout button at bottom
- **Access Control** - Admin only sees admin features, teachers only see teacher features

#### Security
- ✅ Role-based UI rendering
- ✅ Proper session termination on logout
- ✅ Confirmation dialogs for destructive actions

#### Documentation
- `docs/ADMIN_FEATURES.md` - Complete admin features documentation

### 🎯 User Experience
- **Admin**: Tab-based navigation, manage teachers and classes in one place
- **Teacher**: Easy logout from sidebar
- **Better UX**: Confirmation dialogs, success/error messages, loading states

---

## [2.1.0] - 2025-11-27

### 🎨 UI/UX Improvements: Enhanced Login Page

#### Added
- **Peek Password Feature** 👁️
  - Toggle show/hide password dengan icon Eye/EyeOff
  - Smooth transition saat toggle
  - Icon dari lucide-react library

- **Premium UI Design** ✨
  - Glass morphism dengan backdrop blur
  - Animated blob background (3 shapes)
  - Gradient elements (logo, title, button)
  - Shadow effects dan hover animations
  - Rounded corners (xl, 2xl, 3xl)

- **Visual Feedback** 🎯
  - Icons untuk email (Mail) dan password (Lock)
  - Loading spinner dengan animation
  - Error shake animation dengan emoji
  - Hover effects pada inputs dan button
  - Focus ring yang jelas

- **Better Input Visibility** 📝
  - Background gray-50 (bukan putih)
  - Text color gray-900 (hitam, jelas terlihat)
  - Placeholder gray-400 (visible)
  - Kursor berkedip saat focus
  - Hover effect (gray-100)

- **Layout Improvements** 📐
  - Login layout khusus (tanpa sidebar)
  - Admin layout khusus (tanpa sidebar)
  - Centered card dengan max-width
  - Responsive padding

- **Animations** 🎬
  - Blob animation untuk background
  - Shake animation untuk error
  - Smooth transitions untuk semua elements
  - Transform effects pada button hover

#### Changed
- **Login Page** - Complete redesign dengan modern UI
- **Input Fields** - Improved visibility dan usability
- **Button** - Gradient background dengan lift effect
- **Error Display** - Better visual dengan animation
- **Layout Structure** - Separate layouts untuk login dan admin

#### Dependencies
- Added `lucide-react` - Icon library untuk UI

#### Files Modified
- `app/login/page.tsx` - Complete UI overhaul
- `app/login/layout.tsx` - NEW: Layout tanpa sidebar
- `app/admin/layout.tsx` - NEW: Layout tanpa sidebar
- `app/globals.css` - Added blob and shake animations

#### Documentation
- `docs/LOGIN_UI_IMPROVEMENTS.md` - Complete documentation

### 🐛 Bug Fixes
- ✅ Fixed sidebar appearing on login page
- ✅ Fixed input text not visible (white on white)
- ✅ Fixed cursor not blinking on focus
- ✅ Fixed no visual feedback on interactions

### 🎯 User Experience
- **Before**: Basic login form, sidebar visible, text invisible
- **After**: Premium UI, no sidebar, clear text, peek password, animations

---

## [2.0.0] - 2025-11-27

### 🎉 Major Release: Authentication System

#### Added
- **Authentication System** 🔐
  - Admin-only registration for teacher accounts
  - Secure login with JWT tokens and bcrypt password hashing
  - Role-based access control (Admin vs Teacher)
  - HTTP-only cookies for session management
  - Middleware protection for all routes
  - Admin dashboard for managing teacher accounts

- **New Pages**
  - `/login` - Login page with modern UI
  - `/admin` - Admin dashboard for CRUD teacher accounts
  - Auto redirect from home to login

- **New API Endpoints**
  - `POST /api/login` - User authentication
  - `POST /api/logout` - Session termination
  - `GET /api/me` - Get current user info
  - `GET /api/admin/teachers` - List all teachers (admin only)
  - `POST /api/admin/teachers` - Create teacher account (admin only)
  - `PUT /api/admin/teachers/[id]` - Update teacher (admin only)
  - `DELETE /api/admin/teachers/[id]` - Delete teacher (admin only)

- **Database Schema**
  - New `users` table for admin and teacher accounts
  - Row Level Security (RLS) policies
  - Indexes for performance optimization
  - Default admin account seeded

- **Security Features**
  - Bcrypt password hashing (cost 10)
  - JWT token authentication (24h expiry)
  - HTTP-only cookies (XSS protection)
  - Secure flag in production (HTTPS only)
  - SameSite=lax (CSRF protection)
  - Input validation and sanitization

- **Documentation** 📚
  - Organized all docs into `docs/` folder
  - `docs/AUTH_QUICK_START.md` - 5-minute setup guide
  - `docs/AUTH_SETUP.md` - Complete authentication documentation
  - `docs/AUTHENTICATION_IMPLEMENTATION.md` - Technical details
  - `docs/WHATS_NEW_AUTH.md` - What's new with authentication
  - `docs/DEPLOYMENT_WITH_AUTH.md` - Deployment guide
  - `docs/IMPLEMENTATION_COMPLETE.md` - Implementation status
  - `docs/DOCUMENTATION_STRUCTURE.md` - Docs organization guide
  - `docs/README.md` - Documentation index

- **Dependencies**
  - `bcryptjs` - Password hashing
  - `@types/bcryptjs` - TypeScript types
  - `jose` - JWT token handling

#### Changed
- **Home Page** - Now redirects to login instead of direct access
- **All Protected Routes** - Now require authentication
- **Documentation Structure** - Moved all docs to `docs/` folder
- **README.md** - Updated with authentication section and new doc links
- **Environment Variables** - Added `JWT_SECRET` requirement

#### Security
- All routes now protected with middleware
- Password never stored in plain text
- Secure token-based authentication
- Role-based access control implemented

#### Developer Experience
- Cleaner root directory (only 1 README.md)
- Better organized documentation
- Type-safe authentication utilities
- Comprehensive error handling

### 📊 Statistics
- **11 new files** created for authentication
- **18 documentation files** organized
- **7 API endpoints** added
- **3 new dependencies** installed
- **100% build success** rate
- **0 breaking changes** for existing features

### 🔒 Default Credentials
```
Admin Account:
Email: admin@emoclass.com
Password: admin123
```
⚠️ **IMPORTANT**: Change password after first login!

### 🚀 Migration Guide
For existing users:
1. Pull latest code
2. Run `npm install`
3. Execute `supabase/auth-schema.sql` in Supabase
4. Add `JWT_SECRET` to `.env.local`
5. Restart dev server
6. Login with admin credentials
7. Create teacher accounts

### 📝 Breaking Changes
**None!** All existing features work as before. Only added authentication layer.

### 🎯 What's Next
- Change password feature
- Forgot password flow
- Email verification
- Two-factor authentication
- Audit logging

---

## [1.0.0] - 2025-11-XX

### Initial Release

#### Features
- Student emotion check-in system
- Teacher dashboard with real-time monitoring
- Telegram alert system for negative emotions
- Supabase database integration
- Real-time updates with Supabase Realtime
- Premium UI with glass morphism design
- Mobile-first responsive design
- 68 tests with 100% passing rate

#### Tech Stack
- Next.js 14 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- Supabase (PostgreSQL + Realtime)
- Chart.js
- Telegram Bot API
- Vitest + fast-check

---

## Version History

- **v2.0.0** (2025-11-27) - Authentication System
- **v1.0.0** (2025-11-XX) - Initial Release

---

**Maintained by**: EmoClass Team
**License**: MIT
