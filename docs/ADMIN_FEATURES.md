# 👨‍💼 Admin Features Documentation

Dokumentasi lengkap fitur admin untuk EmoClass.

## 🎯 Overview

Admin dashboard menyediakan 2 fitur utama:
1. **Manajemen Guru** - CRUD akun guru
2. **Manajemen Kelas & Siswa** - CRUD kelas dan siswa

## 🔐 Access Control

### Admin Role
- ✅ Akses ke `/admin` dashboard
- ✅ Manage akun guru (create, update, delete)
- ✅ Manage kelas dan siswa
- ✅ Logout functionality
- ❌ Tidak bisa akses fitur teacher (dashboard, input emotion, reports)

### Teacher Role
- ✅ Akses ke `/dashboard`, `/input-emotion`, `/reports`, `/notifications`
- ✅ Logout functionality via sidebar
- ❌ Tidak bisa akses `/admin`

## 📱 Admin Dashboard

### Layout
```
┌─────────────────────────────────────────────┐
│  🎭 Admin Dashboard    [User Info] [Logout] │
├─────────────────────────────────────────────┤
│  [Manajemen Guru] [Manajemen Kelas & Siswa] │ ← Tabs
├─────────────────────────────────────────────┤
│                                             │
│  Content Area (Teachers or Classes)         │
│                                             │
└─────────────────────────────────────────────┘
```

### Features

#### 1. Header
- Logo EmoClass
- User info (nama & email admin)
- Logout button

#### 2. Tabs
- **Manajemen Guru** - Manage teacher accounts
- **Manajemen Kelas & Siswa** - Manage classes and students

## 👨‍🏫 Manajemen Guru

### Features

#### Create Teacher
1. Click "Tambah Guru" button
2. Fill form:
   - Nama Lengkap
   - Email
   - Password (min 6 characters)
3. Click "Buat Akun Guru"

**Form Fields:**
- ✅ Icon indicators (User, Mail, Lock)
- ✅ Peek password toggle
- ✅ Input validation
- ✅ Error handling

#### View Teachers
- Table with columns:
  - Nama
  - Email
  - Status (Aktif/Nonaktif)
  - Dibuat (creation date)
  - Aksi (actions)

#### Update Teacher Status
- Click "Aktifkan" or "Nonaktifkan"
- Toggle between active/inactive
- Inactive teachers cannot login

#### Delete Teacher
- Click "Hapus" button
- Confirmation dialog
- Permanent deletion

### UI Components

**Teacher Card:**
```
┌────────────────────────────────────────┐
│ Nama Guru                              │
│ email@sekolah.com                      │
│ [Aktif] 27 Nov 2025                    │
│ [Nonaktifkan] [Hapus]                  │
└────────────────────────────────────────┘
```

## 🏫 Manajemen Kelas & Siswa

### Layout
```
┌──────────────┬─────────────────────────────┐
│ Daftar Kelas │ Daftar Siswa                │
│              │                             │
│ [+ Add]      │ [+ Tambah Siswa]            │
│              │                             │
│ Kelas 7A     │ ┌─────────────────────┐    │
│ 10 siswa     │ │ 👤 Ahmad Rizki      │    │
│              │ │    27 Nov 2025      │    │
│ Kelas 8B     │ └─────────────────────┘    │
│ 12 siswa     │                             │
│              │ ┌─────────────────────┐    │
│ Kelas 9C     │ │ 👤 Siti Nurhaliza   │    │
│ 8 siswa      │ │    27 Nov 2025      │    │
│              │ └─────────────────────┘    │
└──────────────┴─────────────────────────────┘
```

### Features

#### Create Class
1. Click "+" button in Classes section
2. Enter class name (e.g., "Kelas 7A")
3. Click "Simpan"

#### View Classes
- List of all classes
- Shows student count per class
- Click to select and view students

#### Delete Class
- Click trash icon on class card
- Confirmation dialog
- ⚠️ **Warning**: Deletes all students in the class

#### Create Student
1. Select a class
2. Click "Tambah Siswa" button
3. Enter student name
4. Click "Tambah Siswa"

#### View Students
- Grid layout (2 columns on desktop)
- Shows student name and creation date
- Filtered by selected class

#### Delete Student
- Click trash icon on student card
- Confirmation dialog
- Permanent deletion

### UI Components

**Class Card:**
```
┌────────────────────┐
│ Kelas 7A      [🗑️] │
│ 10 siswa           │
└────────────────────┘
```

**Student Card:**
```
┌─────────────────────────┐
│ 👤 Ahmad Rizki     [🗑️] │
│    27 Nov 2025          │
└─────────────────────────┘
```

## 🚪 Logout Feature

### For Admin
**Location**: Header (top right)
- Button with LogOut icon
- Confirmation dialog
- Redirects to `/login`

### For Teacher
**Location**: Sidebar (bottom)
- Button with door emoji 🚪
- Confirmation dialog
- Redirects to `/login`

### Implementation
```tsx
const handleLogout = async () => {
  if (confirm('Yakin ingin logout?')) {
    await fetch('/api/logout', { method: 'POST' });
    window.location.href = '/login';
  }
};
```

## 🎨 UI/UX Features

### Design System
- **Colors**: Blue primary, Red for logout, Green for success
- **Icons**: lucide-react library
- **Animations**: Smooth transitions, hover effects
- **Responsive**: Mobile-first design

### Visual Feedback
- ✅ Success messages (green)
- ❌ Error messages (red)
- ⏳ Loading spinners
- 🎯 Hover effects
- 📱 Touch-friendly buttons

### Accessibility
- ✅ Keyboard navigation
- ✅ Screen reader friendly
- ✅ High contrast
- ✅ Clear labels
- ✅ Confirmation dialogs

## 📊 Data Flow

### Teachers Management
```
Admin → Click "Tambah Guru"
     → Fill form (name, email, password)
     → Submit
     → API: POST /api/admin/teachers
     → Database: Insert into users table
     → Refresh list
     → Show success message
```

### Classes Management
```
Admin → Click "+" in Classes
     → Enter class name
     → Submit
     → Supabase: Insert into classes table
     → Refresh list
     → Show success message
```

### Students Management
```
Admin → Select class
     → Click "Tambah Siswa"
     → Enter student name
     → Submit
     → Supabase: Insert into students table
     → Refresh list
     → Show success message
```

## 🔒 Security

### Authentication
- ✅ JWT token verification
- ✅ Role-based access control
- ✅ Middleware protection
- ✅ Session management

### Authorization
- ✅ Admin-only routes
- ✅ API endpoint protection
- ✅ Database RLS policies
- ✅ Input validation

### Data Protection
- ✅ Password hashing (bcrypt)
- ✅ SQL injection prevention
- ✅ XSS protection
- ✅ CSRF protection

## 🧪 Testing Checklist

### Admin Dashboard
- [ ] Login as admin
- [ ] See admin dashboard
- [ ] Both tabs visible
- [ ] User info displayed
- [ ] Logout button works

### Teachers Management
- [ ] Create teacher account
- [ ] View teachers list
- [ ] Toggle teacher status
- [ ] Delete teacher
- [ ] Form validation works
- [ ] Error handling works

### Classes Management
- [ ] Create class
- [ ] View classes list
- [ ] Select class
- [ ] Delete class (with confirmation)
- [ ] Student count updates

### Students Management
- [ ] Create student
- [ ] View students list
- [ ] Delete student
- [ ] Students filtered by class
- [ ] Empty state shows

### Logout
- [ ] Admin logout works
- [ ] Teacher logout works
- [ ] Confirmation dialog shows
- [ ] Redirects to login
- [ ] Session cleared

## 📝 Usage Examples

### Create Teacher Account
```typescript
// Admin fills form
{
  full_name: "Pak Budi",
  email: "budi@sekolah.com",
  password: "guru123"
}

// API creates account
POST /api/admin/teachers
→ User created with role: "teacher"
→ Password hashed with bcrypt
→ Email must be unique
```

### Create Class with Students
```typescript
// 1. Create class
POST to Supabase: classes
{
  name: "Kelas 7A"
}

// 2. Add students
POST to Supabase: students
{
  name: "Ahmad Rizki",
  class_id: "class-uuid"
}
```

## 🚀 Future Enhancements

### Potential Features
- [ ] Bulk import students (CSV)
- [ ] Edit teacher info
- [ ] Edit student info
- [ ] Move student to another class
- [ ] Class statistics
- [ ] Teacher activity log
- [ ] Export data (PDF, Excel)
- [ ] Search and filter
- [ ] Pagination for large lists

## 📚 Related Documentation

- `AUTH_SETUP.md` - Authentication system
- `LOGIN_UI_IMPROVEMENTS.md` - Login page
- `IMPLEMENTATION_COMPLETE.md` - Implementation status

## 🎉 Summary

Admin dashboard sekarang memiliki:
- ✅ Tab-based navigation
- ✅ Complete CRUD for teachers
- ✅ Complete CRUD for classes
- ✅ Complete CRUD for students
- ✅ Logout functionality
- ✅ Modern UI/UX
- ✅ Responsive design
- ✅ Security best practices

**Status**: ✅ Complete & Production Ready

---

**Updated**: November 27, 2025
**Version**: 2.2 - Admin Features
