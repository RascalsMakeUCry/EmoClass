'use client';

import { useState, useEffect } from 'react';
import { School, UserPlus, Users, Trash2, Check, X, Plus, Edit2, Upload, Download } from 'lucide-react';
import Toast from '@/components/Toast';
import LoadingSpinner from '@/components/LoadingSpinner';
import * as XLSX from 'xlsx';

interface Class {
  id: string;
  name: string;
  created_at: string;
  student_count?: number;
}

interface Student {
  id: string;
  name: string;
  class_id: string;
  created_at: string;
}

export default function ClassesManagement() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showClassForm, setShowClassForm] = useState(false);
  const [showStudentForm, setShowStudentForm] = useState(false);
  const [editingClassId, setEditingClassId] = useState<string | null>(null);
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [deleteClassConfirm, setDeleteClassConfirm] = useState<{ show: boolean; id: string; name: string; studentCount: number }>({
    show: false,
    id: '',
    name: '',
    studentCount: 0,
  });
  const [deleteStudentConfirm, setDeleteStudentConfirm] = useState<{ show: boolean; id: string; name: string }>({
    show: false,
    id: '',
    name: '',
  });
  const [className, setClassName] = useState('');
  const [studentName, setStudentName] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeletingClass, setIsDeletingClass] = useState(false);
  const [isDeletingStudent, setIsDeletingStudent] = useState(false);

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchStudents(selectedClass);
    }
  }, [selectedClass]);

  const fetchClasses = async () => {
    try {
      const res = await fetch('/api/admin/classes');
      if (!res.ok) throw new Error('Failed to fetch');
      
      const data = await res.json();
      const classesWithCount = data.classes?.map((c: any) => ({
        ...c,
        student_count: c.students?.[0]?.count || 0
      })) || [];

      setClasses(classesWithCount);
      if (classesWithCount.length > 0 && !selectedClass) {
        setSelectedClass(classesWithCount[0].id);
      }
    } catch (err) {
      setToast({ message: 'Gagal memuat data kelas', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async (classId: string) => {
    try {
      const res = await fetch(`/api/admin/students?class_id=${classId}`);
      if (!res.ok) throw new Error('Failed to fetch');
      
      const data = await res.json();
      setStudents(data.students || []);
    } catch (err) {
      setToast({ message: 'Gagal memuat data siswa', type: 'error' });
    }
  };

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (editingClassId) {
        // Update existing class
        const res = await fetch(`/api/admin/classes/${editingClassId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: className }),
        });

        const data = await res.json();
        if (!res.ok) {
          setToast({ message: data.error || 'Gagal mengupdate kelas', type: 'error' });
          return;
        }
        setToast({ message: 'Kelas berhasil diupdate!', type: 'success' });
      } else {
        // Create new class
        const res = await fetch('/api/admin/classes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: className }),
        });

        const data = await res.json();
        if (!res.ok) {
          setToast({ message: data.error || 'Gagal membuat kelas', type: 'error' });
          return;
        }
        setToast({ message: 'Kelas berhasil dibuat!', type: 'success' });
      }

      setClassName('');
      setShowClassForm(false);
      setEditingClassId(null);
      fetchClasses();
    } catch (err) {
      setToast({ 
        message: editingClassId ? 'Gagal mengupdate kelas' : 'Gagal membuat kelas', 
        type: 'error' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClass = (classItem: Class) => {
    setEditingClassId(classItem.id);
    setClassName(classItem.name);
    setShowClassForm(true);
  };

  const handleCancelEditClass = () => {
    setEditingClassId(null);
    setClassName('');
    setShowClassForm(false);
  };

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClass) return;
    
    setIsSubmitting(true);

    try {
      if (editingStudentId) {
        // Update existing student
        const res = await fetch(`/api/admin/students/${editingStudentId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: studentName }),
        });

        const data = await res.json();
        if (!res.ok) {
          setToast({ message: data.error || 'Gagal mengupdate siswa', type: 'error' });
          return;
        }
        setToast({ message: 'Data siswa berhasil diupdate!', type: 'success' });
      } else {
        // Create new student
        const res = await fetch('/api/admin/students', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: studentName, class_id: selectedClass }),
        });

        const data = await res.json();
        if (!res.ok) {
          setToast({ message: data.error || 'Gagal menambahkan siswa', type: 'error' });
          return;
        }
        setToast({ message: 'Siswa berhasil ditambahkan!', type: 'success' });
      }

      setStudentName('');
      setShowStudentForm(false);
      setEditingStudentId(null);
      fetchStudents(selectedClass);
      fetchClasses();
    } catch (err) {
      setToast({ 
        message: editingStudentId ? 'Gagal mengupdate siswa' : 'Gagal menambahkan siswa', 
        type: 'error' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditStudent = (student: Student) => {
    setEditingStudentId(student.id);
    setStudentName(student.name);
    setShowStudentForm(true);
  };

  const handleCancelEditStudent = () => {
    setEditingStudentId(null);
    setStudentName('');
    setShowStudentForm(false);
  };

  const handleDeleteClass = async () => {
    setIsDeletingClass(true);
    
    try {
      const res = await fetch(`/api/admin/classes/${deleteClassConfirm.id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete');

      setToast({ message: 'Kelas berhasil dihapus', type: 'success' });
      if (selectedClass === deleteClassConfirm.id) {
        setSelectedClass(null);
      }
      setDeleteClassConfirm({ show: false, id: '', name: '', studentCount: 0 });
      fetchClasses();
    } catch (err) {
      setToast({ message: 'Gagal menghapus kelas', type: 'error' });
      setDeleteClassConfirm({ show: false, id: '', name: '', studentCount: 0 });
    } finally {
      setIsDeletingClass(false);
    }
  };

  const handleDeleteStudent = async () => {
    setIsDeletingStudent(true);
    
    try {
      const res = await fetch(`/api/admin/students/${deleteStudentConfirm.id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete');

      setToast({ message: 'Siswa berhasil dihapus', type: 'success' });
      if (selectedClass) {
        fetchStudents(selectedClass);
      }
      setDeleteStudentConfirm({ show: false, id: '', name: '' });
      fetchClasses();
    } catch (err) {
      setToast({ message: 'Gagal menghapus siswa', type: 'error' });
      setDeleteStudentConfirm({ show: false, id: '', name: '' });
    } finally {
      setIsDeletingStudent(false);
    }
  };

  const handleBulkImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedClass) return;

    // Validate file type
    const validTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];
    if (!validTypes.includes(file.type) && !file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      setToast({ message: 'File harus berformat Excel (.xlsx atau .xls)', type: 'error' });
      e.target.value = '';
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('class_id', selectedClass);

      const res = await fetch('/api/admin/students/bulk-import', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.details) {
          // Show first few errors
          const errorMsg = data.details.slice(0, 3).join(', ');
          setToast({ 
            message: `${data.error}: ${errorMsg}${data.details.length > 3 ? '...' : ''}`, 
            type: 'error' 
          });
        } else {
          setToast({ message: data.error || 'Gagal mengimport data', type: 'error' });
        }
        return;
      }

      setToast({ message: data.message, type: 'success' });
      setShowBulkImport(false);
      fetchStudents(selectedClass);
      fetchClasses();
    } catch (err) {
      setToast({ message: 'Terjadi kesalahan saat mengupload file', type: 'error' });
    } finally {
      setIsUploading(false);
      e.target.value = ''; // Reset file input
    }
  };

  const downloadTemplate = () => {
    // Create a simple Excel template
    const template = [
      ['Nama Siswa'],
      ['Ahmad Rizki'],
      ['Siti Nurhaliza'],
      ['Budi Santoso'],
    ];

    const ws = XLSX.utils.aoa_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    XLSX.writeFile(wb, 'template_siswa.xlsx');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Classes List */}
        <div className="lg:col-span-1">
          <div className="bg-white/40 rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-gray-800">Daftar Kelas</h3>
              <button
                onClick={() => {
                  if (showClassForm) {
                    handleCancelEditClass();
                  } else {
                    setShowClassForm(true);
                  }
                }}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Tambah Kelas"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>

            {showClassForm && (
              <form onSubmit={handleCreateClass} className="mb-4 space-y-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {editingClassId ? 'Edit Nama Kelas' : 'Nama Kelas Baru'}
                </label>
                <input
                  type="text"
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-gray-900 placeholder-gray-400"
                  placeholder="Nama kelas (e.g., Kelas 7A)"
                  required
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmitting && <LoadingSpinner size="sm" />}
                    <span>{editingClassId ? 'Update' : 'Simpan'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelEditClass}
                    disabled={isSubmitting}
                    className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Batal
                  </button>
                </div>
              </form>
            )}

            <div className="space-y-2">
              {classes.map((cls) => (
                <div
                  key={cls.id}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedClass === cls.id
                      ? 'bg-blue-50 border-2 border-blue-500'
                      : 'bg-white/90 border-2 border-transparent hover:bg-gray-100'
                  }`}
                  onClick={() => setSelectedClass(cls.id)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="font-medium text-gray-800">{cls.name}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {cls.student_count || 0} siswa
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditClass(cls);
                        }}
                        className="text-blue-500 hover:text-blue-700 p-1"
                        title="Edit kelas"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteClassConfirm({ 
                            show: true, 
                            id: cls.id, 
                            name: cls.name,
                            studentCount: cls.student_count || 0
                          });
                        }}
                        className="text-red-500 hover:text-red-700 p-1"
                        title="Hapus kelas"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {classes.length === 0 && (
                <div className="text-center py-8 text-gray-500 text-sm">
                  <School className="h-10 w-10 mx-auto mb-2 text-gray-400" />
                  <p>Belum ada kelas</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Students List */}
        <div className="lg:col-span-2">
          <div className="bg-white/40 rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="font-semibold text-gray-800">
                  {selectedClass ? classes.find(c => c.id === selectedClass)?.name : 'Pilih Kelas'}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {students.length} siswa terdaftar
                </p>
              </div>
              {selectedClass && (
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      if (showStudentForm) {
                        handleCancelEditStudent();
                      } else {
                        setShowStudentForm(true);
                      }
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <UserPlus className="h-5 w-5" />
                    <span>{showStudentForm ? 'Batal' : 'Tambah Siswa'}</span>
                  </button>
                  
                  <button
                    onClick={() => setShowBulkImport(!showBulkImport)}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    title="Import dari Excel"
                  >
                    <Upload className="h-5 w-5" />
                    <span>Import Excel</span>
                  </button>
                </div>
              )}
            </div>

            {showStudentForm && selectedClass && (
              <form onSubmit={handleCreateStudent} className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">
                    {editingStudentId ? 'Edit Nama Siswa' : 'Nama Siswa Baru'}
                  </label>
                  <input
                    type="text"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-400"
                    placeholder="Nama lengkap siswa"
                    required
                  />
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {isSubmitting && <LoadingSpinner size="sm" />}
                      <span>{editingStudentId ? 'Update' : 'Tambah Siswa'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelEditStudent}
                      disabled={isSubmitting}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Batal
                    </button>
                  </div>
                </div>
              </form>
            )}

            {showBulkImport && selectedClass && (
              <div className="mb-6 p-6 bg-gradient-to-br from-green-50 to-blue-50 border-2 border-green-200 rounded-xl">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                      <Upload className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-2">Import Siswa dari Excel</h4>
                    <p className="text-sm text-gray-600 mb-4">
                      Upload file Excel (.xlsx atau .xls) dengan kolom "Nama Siswa" atau "nama" untuk menambahkan banyak siswa sekaligus.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row gap-3">
                      <label className="flex-1">
                        <input
                          type="file"
                          accept=".xlsx,.xls"
                          onChange={handleBulkImport}
                          disabled={isUploading}
                          className="hidden"
                          id="excel-upload"
                        />
                        <div className="flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-dashed border-green-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors cursor-pointer">
                          {isUploading ? (
                            <>
                              <div className="w-5 h-5 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                              <span className="text-sm font-medium text-gray-700">Mengupload...</span>
                            </>
                          ) : (
                            <>
                              <Upload className="w-5 h-5 text-green-600" />
                              <span className="text-sm font-medium text-gray-700">Pilih File Excel</span>
                            </>
                          )}
                        </div>
                      </label>
                      
                      <button
                        type="button"
                        onClick={downloadTemplate}
                        className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Download className="w-5 h-5" />
                        <span className="text-sm font-medium">Download Template</span>
                      </button>
                    </div>

                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-xs font-medium text-blue-900 mb-1">📝 Format Excel:</p>
                      <ul className="text-xs text-blue-800 space-y-1">
                        <li>• Kolom pertama harus bernama "Nama Siswa" atau "nama"</li>
                        <li>• Setiap baris adalah satu siswa</li>
                        <li>• Download template untuk contoh format yang benar</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {selectedClass ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {students.map((student) => (
                  <div
                    key={student.id}
                    className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <Users className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-800">{student.name}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            {new Date(student.created_at).toLocaleDateString('id-ID')}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleEditStudent(student)}
                          className="text-blue-500 hover:text-blue-700 p-1"
                          title="Edit siswa"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeleteStudentConfirm({ show: true, id: student.id, name: student.name })}
                          className="text-red-500 hover:text-red-700 p-1"
                          title="Hapus siswa"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {students.length === 0 && (
                  <div className="col-span-2 text-center py-12 text-gray-500">
                    <UserPlus className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                    <p>Belum ada siswa di kelas ini</p>
                    <p className="text-sm text-gray-400 mt-1">Klik "Tambah Siswa" untuk menambahkan</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <School className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                <p>Pilih kelas untuk melihat daftar siswa</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Class Confirmation Modal */}
      {deleteClassConfirm.show && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeInFast"
          onClick={() => setDeleteClassConfirm({ show: false, id: '', name: '', studentCount: 0 })}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative animate-scaleInFast"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center">
                <School className="w-10 h-10 text-red-600" />
              </div>
            </div>

            <h3 className="text-2xl font-bold text-gray-900 text-center mb-3">
              Konfirmasi Hapus Kelas
            </h3>

            <p className="text-gray-600 text-center mb-2">
              Apakah Anda yakin ingin menghapus kelas:
            </p>
            <p className="text-lg font-semibold text-gray-900 text-center mb-4">
              {deleteClassConfirm.name}?
            </p>

            {deleteClassConfirm.studentCount > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
                <div className="flex items-start gap-3">
                  <div className="text-2xl flex-shrink-0">⚠️</div>
                  <div>
                    <p className="text-sm font-semibold text-amber-900 mb-1">
                      Perhatian!
                    </p>
                    <p className="text-sm text-amber-800">
                      Kelas ini memiliki <span className="font-bold">{deleteClassConfirm.studentCount} siswa</span>. 
                      Semua siswa di kelas ini juga akan terhapus.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setDeleteClassConfirm({ show: false, id: '', name: '', studentCount: 0 })}
                className="flex-1 px-6 py-3 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleDeleteClass}
                disabled={isDeletingClass}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-xl hover:from-red-600 hover:to-red-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isDeletingClass && <LoadingSpinner size="sm" />}
                <span>Ya, Hapus</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Student Confirmation Modal */}
      {deleteStudentConfirm.show && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeInFast"
          onClick={() => setDeleteStudentConfirm({ show: false, id: '', name: '' })}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative animate-scaleInFast"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center">
                <Users className="w-10 h-10 text-red-600" />
              </div>
            </div>

            <h3 className="text-2xl font-bold text-gray-900 text-center mb-3">
              Konfirmasi Hapus Siswa
            </h3>

            <p className="text-gray-600 text-center mb-2">
              Apakah Anda yakin ingin menghapus siswa:
            </p>
            <p className="text-lg font-semibold text-gray-900 text-center mb-6">
              {deleteStudentConfirm.name}?
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setDeleteStudentConfirm({ show: false, id: '', name: '' })}
                className="flex-1 px-6 py-3 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleDeleteStudent}
                disabled={isDeletingStudent}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-xl hover:from-red-600 hover:to-red-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isDeletingStudent && <LoadingSpinner size="sm" />}
                <span>Ya, Hapus</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
