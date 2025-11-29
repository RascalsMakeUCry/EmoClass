# Changelog

All notable changes to EmoClass project.

## [2.5.0] - 2025-11-29

### 🌡️ IoT Environment Monitoring Integration

#### Added - Environment Alert Card for Teacher Dashboard

**Real-time Environment Monitoring**
- Environment Alert Card component di Teacher Dashboard
- Auto-refresh setiap 10 detik tanpa reload
- Smart classification untuk 5 sensor: suhu, kelembaban, kualitas udara, pencahayaan, kebisingan
- 3-level alert system: Safe (hijau), Warning (kuning), Danger (merah)
- Actionable recommendations berdasarkan kondisi terdeteksi

**Files Added:**
- `components/EnvironmentAlertCard.tsx` - UI component
- `lib/environment-helper.ts` - Classification logic & thresholds
- `app/api/environment/current/route.ts` - API endpoint
- `scripts/test-environment-alert.ts` - Interactive test script
- `docs/ENVIRONMENT_ALERT_FEATURE.md` - Full documentation
- `docs/ENVIRONMENT_QUICK_START.md` - Quick setup guide

**Integration:**
- Seamless integration dengan existing IoT infrastructure
- Menggunakan tabel `iot_devices` dan `iot_sensor_data`
- Card hanya muncul jika kelas punya IoT device
- Graceful handling untuk kelas tanpa sensor

**Benefits:**
- Guru bisa monitor kondisi ruangan tanpa buka menu IoT terpisah
- Proactive alerts sebelum siswa komplain
- Data-driven decisions untuk kenyamanan belajar
- Cegah masalah kesehatan akibat lingkungan buruk

#### Updated
- `app/dashboard/page.tsx` - Added EnvironmentAlertCard
- `lib/types.ts` - Added IoT sensor types
- `README.md` - Added IoT monitoring documentation
- `package.json` - Added `test:environment` script

---

## [2.4.0] - 2025-11-29

### 🔔 Complete Notification System Implementation

#### Added - 3 Notification Methods

**1. Database Triggers (Real-time) ⚡**
- Auto-create notifications saat event terjadi di database
- Trigger untuk emosi negatif 3 hari berturut-turut (URGENT alert)
- Trigger untuk bulk import siswa (system notification)
- Trigger untuk kelas baru dibuat (system notification)
- Trigger untuk setiap check-in siswa (real-time notification)
- File: `supabase/notification-triggers.sql`

**2. Cron Jobs (Scheduled) ⏰**
- Daily Summary (15:00) - Ringkasan check-in harian
- Weekly Summary (Senin 08:00) - Ringkasan mingguan dengan trend analysis
- Check Missing Check-ins (12:00) - Reminder siswa belum check-in
- Vercel Cron configuration (`vercel.json`)
- CRON_SECRET untuk security
- Files:
  - `app/api/cron/daily-summary/route.ts`
  - `app/api/cron/weekly-summary/route.ts`
  - `app/api/cron/check-missing-checkins/route.ts`

**3. Event-based (Manual Trigger) 🎯**
- API endpoint untuk create notification manual
- Helper functions untuk common use cases
- Integration ready untuk Telegram bot, admin actions, dll
- Files:
  - `app/api/notifications/create/route.ts`
  - `lib/notification-helper.ts`

#### Helper Functions
- `notifyBulkImport()` - Notifikasi setelah bulk import
- `notifyClassCreated()` - Notifikasi kelas baru
- `notifyStudentCheckin()` - Notifikasi check-in siswa
- `notifyTelegramAlert()` - Notifikasi dari Telegram bot
- `notifyAdminAction()` - Notifikasi admin actions
- `createNotification()` - Generic notification creator

#### Testing Scripts
- `scripts/test-notifications.ts` - Test notification system lengkap
- `scripts/test-cron-jobs.ts` - Test semua cron job endpoints
- Updated `scripts/README.md` dengan panduan lengkap

#### Documentation
- `docs/NOTIFICATION_SYSTEM_IMPLEMENTATION.md` - Dokumentasi lengkap 3 opsi
- `docs/NOTIFICATION_QUICK_GUIDE.md` - Panduan cepat
- Comparison table untuk 3 metode
- Setup instructions untuk setiap metode
- Testing guidelines
- Troubleshooting tips

#### Configuration
- Added `CRON_SECRET` to `.env.local.example`
- Added `SUPABASE_SERVICE_ROLE_KEY` to `.env.local.example`
- Created `vercel.json` untuk Vercel Cron setup

#### Features
- ✅ Real-time notifications via database triggers
- ✅ Scheduled notifications via cron jobs
- ✅ Manual notifications via API/helpers
- ✅ Priority levels (urgent, high, normal, low)
- ✅ Notification types (alert, system, summary)
- ✅ Rich metadata support
- ✅ Target options (all_teachers, all_users, specific_user)
- ✅ Comprehensive testing suite

---

# Changelog

All notable changes to EmoClass project.

## [2.3.0] - 2025-11-28

### 🔔 Notifications System

#### Added
- **Notifications Page** 📬
  - List semua notifikasi (alerts, system, summary)
  - Filter by type (All, Alerts, System, Summary)
  - Mark as read/unread
  - Mark all as read
  - Delete notifications
  - Unread counter badge
  - Real-time capable (Supabase Realtime ready)

#### Database
- Created `notifications` table with RLS
- Indexes untuk performance
- Realtime enabled
- Auto-notification function (ready for integration)

#### API Endpoints
- `GET /api/notifications` - List notifications
- `POST /api/notifications` - Create notification
- `PATCH /api/notifications/[id]` - Mark as read
- `DELETE /api/notifications/[id]` - Delete notification
- `POST /api/notifications/mark-all-read` - Mark all as read

#### UI Features
- ✅ Filter by type dengan visual icons
- ✅ Priority badges (urgent, high, normal, low)
- ✅ Unread indicator (blue dot & border)
- ✅ Relative time display ("5 menit yang lalu")
- ✅ Empty state yang informatif
- ✅ Loading states
- ✅ Toast notifications untuk feedback
- ✅ Responsive design

#### Future Integration
- Auto-create notifications dari alert system
- Push notifications
- Email notifications
- Notification preferences

### ⏳ Loading States for All Database Operations

#### Added
- **Loading Indicators on Buttons** 🔄
  - Spinner animation saat proses database berjalan
  - Button disabled untuk prevent double-click
  - Visual feedback yang jelas untuk user
  - Consistent UX across all CRUD operations

#### Features
- ✅ Loading spinner component (reusable)
- ✅ Disabled state saat loading
- ✅ Opacity 50% untuk visual feedback
- ✅ Cursor not-allowed saat disabled
- ✅ Smooth animations

#### Affected Components
- **ClassesManagement**: Create, Update, Delete class & students
- **TeachersManagement**: Create, Update, Delete, Toggle status teachers
- All confirmation modals

#### Benefits
- 🚫 Prevent double submissions
- 👁️ Clear visual feedback
- ⚡ Better UX
- 🐛 Reduce bugs from multiple clicks

### 📊 Bulk Import Students from Excel

#### Added
- **Excel Import Feature** 📁
  - Upload Excel file (.xlsx atau .xls) untuk bulk import siswa
  - Download template Excel dengan format yang benar
  - Validasi format dan data otomatis
  - Error handling dengan detail per baris
  - Progress indicator saat upload
  - Support multiple column names (Nama Siswa, nama, Name, etc.)
  - Bulk insert ke database (efficient)
  - Auto-refresh setelah import berhasil

#### Features
- ✅ Import banyak siswa sekaligus (10-500+ siswa)
- ✅ Template Excel yang bisa didownload
- ✅ Validasi real-time
- ✅ Error messages yang jelas
- ✅ Toast notifications untuk feedback
- ✅ Modern UI dengan gradient background

#### API
- Created `/api/admin/students/bulk-import` - POST endpoint
- Uses `xlsx` library untuk parsing Excel
- Bulk insert dengan single query

#### Dependencies
- Added `xlsx@^0.18.5` untuk Excel parsing

### 🎨 Toast Notifications

#### Added
- **Floating Toast Notifications** 🎉
  - Created reusable Toast component
  - Smooth slide-in animation from right
  - Auto-dismiss after 3 seconds
  - Manual close button
  - Support for success, error, warning, info types
  - Clean, modern design with icons
  - Portal rendering (fixed position)

#### Updated
- Replaced static alert boxes with floating toasts in:
  - `ClassesManagement` - All CRUD operations
  - `TeachersManagement` - All CRUD operations
- Better UX dengan notifikasi yang tidak mengganggu layout

## [2.3.0] - 2025-11-28

### 🏫 Classes & Students Management (Fixed)

#### Fixed
- **API Endpoints untuk Classes & Students** 🔧
  - Created `/api/admin/classes` - GET, POST
  - Created `/api/admin/classes/[id]` - PUT, DELETE
  - Created `/api/admin/students` - GET, POST
  - Created `/api/admin/students/[id]` - PUT, DELETE
  - Fixed Next.js 15 dynamic route params (await params)
  - Proper authentication & authorization checks
  - Input validation & error handling

#### Features Now Working
- ✅ Tambah kelas baru
- ✅ Edit nama kelas
- ✅ Hapus kelas (dengan warning jika ada siswa)
- ✅ Tambah siswa ke kelas
- ✅ Edit nama siswa
- ✅ Hapus siswa
- ✅ Auto-refresh student count
- ✅ Duplicate name validation

### 🔐 Account Status Real-time Notification

#### Added
- **Real-time Account Deactivation Notification** 🚨
  - Supabase Realtime listener untuk monitoring status akun
  - Modal notifikasi otomatis saat akun dinonaktifkan/dihapus
  - Countdown 5 detik sebelum redirect ke login
  - Tombol "OK, Mengerti" untuk skip countdown
  - Icon warning dengan pulse animation
  - Modal tidak bisa ditutup (forced logout)
  - Support multiple sessions (semua session ter-logout)
  - Clean production code (no debug logs, no test buttons)

- **Confirmation Modal untuk Toggle Status Guru** ⚠️
  - Modal konfirmasi saat nonaktifkan/aktifkan akun guru
  - Warning message jika guru sedang login
  - Informasi bahwa guru akan auto-logout dalam 5 detik
  - Prevent accidental deactivation
  - Success notification setelah toggle

#### Documentation
- `docs/ACCOUNT_STATUS_NOTIFICATION.md` - Feature documentation
- `docs/TESTING_ACCOUNT_DEACTIVATION.md` - Testing guide
- `docs/FIX_REALTIME_USERS.md` - Realtime setup guide
- `scripts/test-account-deactivation.ts` - Testing script
- `scripts/debug-realtime.ts` - Debug Realtime connection
- `supabase/enable-users-realtime.sql` - SQL script

#### Benefits
- ✅ User tidak bingung kenapa di-logout
- ✅ Transparansi dan komunikasi yang jelas
- ✅ Professional UX
- ✅ Menghargai user dengan informasi
- ✅ Prevent accidental deactivation dengan confirmation modal
- ✅ Clean code tanpa debugging artifacts

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
