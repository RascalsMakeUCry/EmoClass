# API Documentation: Admin Classes & Students Management

## Overview
API endpoints untuk manajemen kelas dan siswa oleh administrator.

## Authentication
Semua endpoint memerlukan:
- Cookie `auth-token` dengan JWT valid
- User role harus `admin`

## Classes API

### GET /api/admin/classes
List semua kelas dengan jumlah siswa.

**Response:**
```json
{
  "classes": [
    {
      "id": "uuid",
      "name": "Kelas 7A",
      "created_at": "2025-11-28T...",
      "students": [{ "count": 25 }]
    }
  ]
}
```

### POST /api/admin/classes
Buat kelas baru.

**Request Body:**
```json
{
  "name": "Kelas 7A"
}
```

**Validation:**
- `name` required, tidak boleh kosong
- `name` harus unique

**Response:**
```json
{
  "class": {
    "id": "uuid",
    "name": "Kelas 7A",
    "created_at": "2025-11-28T..."
  }
}
```

**Errors:**
- `400` - Nama kelas harus diisi
- `400` - Nama kelas sudah digunakan
- `401` - Unauthorized
- `403` - Forbidden (not admin)

### PUT /api/admin/classes/[id]
Update nama kelas.

**Request Body:**
```json
{
  "name": "Kelas 7B"
}
```

**Validation:**
- `name` required, tidak boleh kosong
- `name` harus unique (excluding current class)

**Response:**
```json
{
  "class": {
    "id": "uuid",
    "name": "Kelas 7B",
    "created_at": "2025-11-28T..."
  }
}
```

**Errors:**
- `400` - Nama kelas harus diisi
- `400` - Nama kelas sudah digunakan
- `404` - Class not found

### DELETE /api/admin/classes/[id]
Hapus kelas (cascade delete students).

**Response:**
```json
{
  "success": true
}
```

**Note:** Semua siswa di kelas ini akan ikut terhapus (cascade).

---

## Students API

### GET /api/admin/students
List semua siswa, optional filter by class.

**Query Parameters:**
- `class_id` (optional) - Filter by class ID

**Examples:**
- `/api/admin/students` - All students
- `/api/admin/students?class_id=uuid` - Students in specific class

**Response:**
```json
{
  "students": [
    {
      "id": "uuid",
      "name": "Ahmad Rizki",
      "class_id": "uuid",
      "created_at": "2025-11-28T..."
    }
  ]
}
```

### POST /api/admin/students
Tambah siswa baru.

**Request Body:**
```json
{
  "name": "Ahmad Rizki",
  "class_id": "uuid"
}
```

**Validation:**
- `name` required, tidak boleh kosong
- `class_id` required
- `class_id` must exist in classes table

**Response:**
```json
{
  "student": {
    "id": "uuid",
    "name": "Ahmad Rizki",
    "class_id": "uuid",
    "created_at": "2025-11-28T..."
  }
}
```

**Errors:**
- `400` - Nama siswa harus diisi
- `400` - Kelas harus dipilih
- `404` - Kelas tidak ditemukan

### PUT /api/admin/students/[id]
Update data siswa.

**Request Body:**
```json
{
  "name": "Ahmad Rizki Updated",
  "class_id": "new-uuid"  // optional
}
```

**Validation:**
- `name` optional, tapi tidak boleh kosong jika provided
- `class_id` optional, must exist if provided

**Response:**
```json
{
  "student": {
    "id": "uuid",
    "name": "Ahmad Rizki Updated",
    "class_id": "uuid",
    "created_at": "2025-11-28T..."
  }
}
```

**Errors:**
- `400` - Nama siswa harus diisi
- `404` - Kelas tidak ditemukan
- `404` - Student not found

### DELETE /api/admin/students/[id]
Hapus siswa.

**Response:**
```json
{
  "success": true
}
```

---

## Error Responses

### 401 Unauthorized
```json
{
  "error": "Unauthorized"
}
```

### 403 Forbidden
```json
{
  "error": "Forbidden"
}
```

### 400 Bad Request
```json
{
  "error": "Nama kelas harus diisi"
}
```

### 404 Not Found
```json
{
  "error": "Class not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Failed to create class"
}
```

---

## Usage Examples

### Create Class
```typescript
const res = await fetch('/api/admin/classes', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: 'Kelas 7A' }),
});

const data = await res.json();
if (!res.ok) {
  console.error(data.error);
} else {
  console.log('Class created:', data.class);
}
```

### Update Class
```typescript
const res = await fetch(`/api/admin/classes/${classId}`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: 'Kelas 7B' }),
});
```

### Delete Class
```typescript
const res = await fetch(`/api/admin/classes/${classId}`, {
  method: 'DELETE',
});
```

### Create Student
```typescript
const res = await fetch('/api/admin/students', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    name: 'Ahmad Rizki',
    class_id: classId 
  }),
});
```

### Get Students by Class
```typescript
const res = await fetch(`/api/admin/students?class_id=${classId}`);
const data = await res.json();
console.log('Students:', data.students);
```

---

## Database Schema

### classes
```sql
CREATE TABLE classes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### students
```sql
CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Note:** `ON DELETE CASCADE` ensures students are deleted when class is deleted.

---

## Security

### Authentication
- JWT token verified via `verifyToken()`
- Token stored in HTTP-only cookie

### Authorization
- Only users with `role = 'admin'` can access
- Checked on every request

### Input Validation
- All inputs trimmed
- Empty strings rejected
- Duplicate names prevented
- Foreign key validation

### SQL Injection Prevention
- Using Supabase client (parameterized queries)
- No raw SQL with user input

---

## Testing

### Manual Testing
```bash
# Login as admin first
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}'

# Create class
curl -X POST http://localhost:3000/api/admin/classes \
  -H "Content-Type: application/json" \
  -H "Cookie: auth-token=YOUR_TOKEN" \
  -d '{"name":"Kelas 7A"}'

# Get classes
curl http://localhost:3000/api/admin/classes \
  -H "Cookie: auth-token=YOUR_TOKEN"
```

### UI Testing
1. Login sebagai admin
2. Go to Admin Panel → Classes tab
3. Test create, edit, delete operations
4. Verify error messages
5. Check student count updates

---

## Related Files

- `app/api/admin/classes/route.ts` - Classes list & create
- `app/api/admin/classes/[id]/route.ts` - Class update & delete
- `app/api/admin/students/route.ts` - Students list & create
- `app/api/admin/students/[id]/route.ts` - Student update & delete
- `components/admin/ClassesManagement.tsx` - UI component
- `lib/auth.ts` - Authentication utilities
- `lib/supabase-admin.ts` - Supabase admin client

---

## Changelog

### 2025-11-28
- ✅ Created all API endpoints
- ✅ Added authentication & authorization
- ✅ Added input validation
- ✅ Added error handling
- ✅ Integrated with UI component
