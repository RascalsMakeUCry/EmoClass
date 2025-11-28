'use client';

import { useState, useEffect } from 'react';
import { School, UserPlus, Users, Trash2, Check, X, Plus } from 'lucide-react';
import { supabase } from '@/lib/supabase';

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
  const [className, setClassName] = useState('');
  const [studentName, setStudentName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
      const { data, error } = await supabase
        .from('classes')
        .select('*, students(count)')
        .order('name');

      if (error) throw error;

      const classesWithCount = data?.map(c => ({
        ...c,
        student_count: c.students?.[0]?.count || 0
      })) || [];

      setClasses(classesWithCount);
      if (classesWithCount.length > 0 && !selectedClass) {
        setSelectedClass(classesWithCount[0].id);
      }
    } catch (err) {
      setError('Gagal memuat data kelas');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async (classId: string) => {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('class_id', classId)
        .order('name');

      if (error) throw error;
      setStudents(data || []);
    } catch (err) {
      setError('Gagal memuat data siswa');
    }
  };

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const { error } = await supabase
        .from('classes')
        .insert({ name: className });

      if (error) throw error;

      setSuccess('Kelas berhasil dibuat!');
      setClassName('');
      setShowClassForm(false);
      fetchClasses();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Gagal membuat kelas');
    }
  };

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClass) return;

    setError('');
    setSuccess('');

    try {
      const { error } = await supabase
        .from('students')
        .insert({ name: studentName, class_id: selectedClass });

      if (error) throw error;

      setSuccess('Siswa berhasil ditambahkan!');
      setStudentName('');
      setShowStudentForm(false);
      fetchStudents(selectedClass);
      fetchClasses();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Gagal menambahkan siswa');
    }
  };

  const handleDeleteClass = async (id: string) => {
    if (!confirm('Yakin ingin menghapus kelas ini? Semua siswa di kelas ini juga akan terhapus.')) return;

    try {
      const { error } = await supabase
        .from('classes')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setSuccess('Kelas berhasil dihapus');
      if (selectedClass === id) {
        setSelectedClass(null);
      }
      fetchClasses();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Gagal menghapus kelas');
    }
  };

  const handleDeleteStudent = async (id: string) => {
    if (!confirm('Yakin ingin menghapus siswa ini?')) return;

    try {
      const { error } = await supabase
        .from('students')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setSuccess('Siswa berhasil dihapus');
      if (selectedClass) {
        fetchStudents(selectedClass);
      }
      fetchClasses();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Gagal menghapus siswa');
    }
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
      {/* Alerts */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-start gap-2">
          <X className="h-5 w-5 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl flex items-start gap-2">
          <Check className="h-5 w-5 mt-0.5" />
          <span>{success}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Classes List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-gray-800">Daftar Kelas</h3>
              <button
                onClick={() => setShowClassForm(!showClassForm)}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Tambah Kelas"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>

            {showClassForm && (
              <form onSubmit={handleCreateClass} className="mb-4 space-y-2">
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
                    className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                  >
                    Simpan
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowClassForm(false)}
                    className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm"
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
                      : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
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
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClass(cls.id);
                      }}
                      className="text-red-500 hover:text-red-700 p-1"
                      title="Hapus kelas"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
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
          <div className="bg-white rounded-xl shadow-sm p-6">
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
                <button
                  onClick={() => setShowStudentForm(!showStudentForm)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <UserPlus className="h-5 w-5" />
                  <span>Tambah Siswa</span>
                </button>
              )}
            </div>

            {showStudentForm && selectedClass && (
              <form onSubmit={handleCreateStudent} className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="space-y-3">
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
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      Tambah Siswa
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowStudentForm(false)}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                    >
                      Batal
                    </button>
                  </div>
                </div>
              </form>
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
                      <button
                        onClick={() => handleDeleteStudent(student.id)}
                        className="text-red-500 hover:text-red-700 p-1"
                        title="Hapus siswa"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
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
    </div>
  );
}
