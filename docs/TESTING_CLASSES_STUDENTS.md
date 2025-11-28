# Testing Guide: Classes & Students Management

## Quick Test Checklist

### ✅ Test Create Class
1. Login sebagai admin
2. Go to Admin Panel → Classes tab
3. Klik tombol "+" (Plus) di bagian "Daftar Kelas"
4. Input nama kelas (e.g., "Kelas 7A")
5. Klik "Simpan"

**Expected:**
- ✅ Success message: "Kelas berhasil dibuat!"
- ✅ Kelas muncul di daftar
- ✅ Form tertutup otomatis

### ✅ Test Edit Class
1. Klik icon "Edit" (pensil) di kelas yang ingin diedit
2. Form edit muncul dengan nama kelas ter-fill
3. Ubah nama kelas (e.g., "Kelas 7B")
4. Klik "Update"

**Expected:**
- ✅ Success message: "Kelas berhasil diupdate!"
- ✅ Nama kelas berubah di daftar
- ✅ Form tertutup otomatis

### ✅ Test Delete Class (Empty)
1. Pilih kelas yang tidak ada siswanya
2. Klik icon "Trash" (tempat sampah)
3. Modal konfirmasi muncul
4. Klik "Ya, Hapus"

**Expected:**
- ✅ Success message: "Kelas berhasil dihapus"
- ✅ Kelas hilang dari daftar
- ✅ Modal tertutup otomatis

### ✅ Test Delete Class (With Students)
1. Pilih kelas yang ada siswanya
2. Klik icon "Trash"
3. Modal konfirmasi muncul dengan warning: "Kelas ini memiliki X siswa"
4. Klik "Ya, Hapus"

**Expected:**
- ✅ Warning message visible
- ✅ Success message: "Kelas berhasil dihapus"
- ✅ Kelas dan semua siswanya terhapus
- ✅ Modal tertutup otomatis

### ✅ Test Create Student
1. Pilih kelas dari daftar kelas
2. Klik "Tambah Siswa"
3. Input nama siswa (e.g., "Ahmad Rizki")
4. Klik "Tambah Siswa"

**Expected:**
- ✅ Success message: "Siswa berhasil ditambahkan!"
- ✅ Siswa muncul di grid
- ✅ Student count di kelas bertambah
- ✅ Form tertutup otomatis

### ✅ Test Edit Student
1. Klik icon "Edit" di card siswa
2. Form edit muncul dengan nama siswa ter-fill
3. Ubah nama siswa
4. Klik "Update"

**Expected:**
- ✅ Success message: "Data siswa berhasil diupdate!"
- ✅ Nama siswa berubah di card
- ✅ Form tertutup otomatis

### ✅ Test Delete Student
1. Klik icon "Trash" di card siswa
2. Modal konfirmasi muncul
3. Klik "Ya, Hapus"

**Expected:**
- ✅ Success message: "Siswa berhasil dihapus"
- ✅ Siswa hilang dari grid
- ✅ Student count di kelas berkurang
- ✅ Modal tertutup otomatis

---

## Error Scenarios

### ❌ Test Duplicate Class Name
1. Buat kelas "Kelas 7A"
2. Coba buat kelas "Kelas 7A" lagi

**Expected:**
- ❌ Error message: "Nama kelas sudah digunakan"
- ❌ Kelas tidak dibuat

### ❌ Test Empty Class Name
1. Klik tambah kelas
2. Kosongkan input
3. Klik "Simpan"

**Expected:**
- ❌ Browser validation: "Please fill out this field"

### ❌ Test Empty Student Name
1. Klik tambah siswa
2. Kosongkan input
3. Klik "Tambah Siswa"

**Expected:**
- ❌ Browser validation: "Please fill out this field"

---

## API Testing (Manual)

### Test Create Class API
```bash
curl -X POST http://localhost:3000/api/admin/classes \
  -H "Content-Type: application/json" \
  -H "Cookie: auth-token=YOUR_TOKEN" \
  -d '{"name":"Kelas 7A"}'
```

**Expected Response:**
```json
{
  "class": {
    "id": "uuid",
    "name": "Kelas 7A",
    "created_at": "2025-11-28T..."
  }
}
```

### Test Update Class API
```bash
curl -X PUT http://localhost:3000/api/admin/classes/CLASS_ID \
  -H "Content-Type: application/json" \
  -H "Cookie: auth-token=YOUR_TOKEN" \
  -d '{"name":"Kelas 7B"}'
```

### Test Delete Class API
```bash
curl -X DELETE http://localhost:3000/api/admin/classes/CLASS_ID \
  -H "Cookie: auth-token=YOUR_TOKEN"
```

### Test Create Student API
```bash
curl -X POST http://localhost:3000/api/admin/students \
  -H "Content-Type: application/json" \
  -H "Cookie: auth-token=YOUR_TOKEN" \
  -d '{"name":"Ahmad Rizki","class_id":"CLASS_ID"}'
```

---

## Common Issues

### Issue: "Failed to update class"

**Possible Causes:**
1. Not logged in as admin
2. Invalid class ID
3. Duplicate class name
4. Network error

**Debug:**
1. Check browser console for errors
2. Check Network tab for API response
3. Verify admin authentication
4. Check server logs

### Issue: "Failed to delete class"

**Possible Causes:**
1. Not logged in as admin
2. Invalid class ID
3. Database constraint error

**Debug:**
1. Check browser console
2. Check Network tab
3. Check server logs for detailed error

### Issue: Student count not updating

**Solution:**
- Refresh page
- Check if `fetchClasses()` is called after student operations

---

## Browser Console Debugging

Open browser console (F12) and check for:

```javascript
// Success logs
"Class created:", data
"Student added:", data

// Error logs
"Error updating class:", error
"Error deleting student:", error
```

---

## Database Verification

### Check Classes
```sql
SELECT * FROM classes ORDER BY name;
```

### Check Students
```sql
SELECT s.*, c.name as class_name 
FROM students s 
JOIN classes c ON s.class_id = c.id 
ORDER BY c.name, s.name;
```

### Check Student Count
```sql
SELECT c.name, COUNT(s.id) as student_count
FROM classes c
LEFT JOIN students s ON c.id = s.class_id
GROUP BY c.id, c.name
ORDER BY c.name;
```

---

## Performance Testing

### Test with Many Classes
1. Create 50+ classes
2. Verify list loads quickly
3. Verify search/filter works

### Test with Many Students
1. Create 100+ students in one class
2. Verify grid loads quickly
3. Verify pagination (if implemented)

---

## Success Criteria

All tests must pass:
- ✅ Create class works
- ✅ Edit class works
- ✅ Delete class works
- ✅ Create student works
- ✅ Edit student works
- ✅ Delete student works
- ✅ Student count updates correctly
- ✅ Error messages display correctly
- ✅ Success messages display correctly
- ✅ Modals open and close properly
- ✅ Forms reset after submit
- ✅ No console errors

---

## Related Documentation

- `docs/API_ADMIN_CLASSES_STUDENTS.md` - API documentation
- `CHANGELOG.md` - Feature changelog
- `components/admin/ClassesManagement.tsx` - Component code
