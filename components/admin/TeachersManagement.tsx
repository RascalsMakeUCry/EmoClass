'use client';

import { useState, useEffect } from 'react';
import { UserPlus, Eye, EyeOff, Mail, Lock, User, Check, X, Trash2, Edit2 } from 'lucide-react';
import Toast from '@/components/Toast';
import LoadingSpinner from '@/components/LoadingSpinner';

interface Teacher {
  id: string;
  email: string;
  full_name: string;
  is_active: boolean;
  created_at: string;
}

export default function TeachersManagement() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; id: string; name: string }>({
    show: false,
    id: '',
    name: '',
  });
  const [toggleConfirm, setToggleConfirm] = useState<{ 
    show: boolean; 
    id: string; 
    name: string; 
    currentStatus: boolean;
  }>({
    show: false,
    id: '',
    name: '',
    currentStatus: false,
  });
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
  });
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTogglingStatus, setIsTogglingStatus] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      const res = await fetch('/api/admin/teachers');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setTeachers(data.teachers || []);
    } catch (err) {
      setToast({ message: 'Gagal memuat data guru', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (editingId) {
        const updateData: any = {
          full_name: formData.full_name,
          email: formData.email,
        };
        
        if (formData.password) {
          updateData.password = formData.password;
        }

        const res = await fetch(`/api/admin/teachers/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updateData),
        });

        const data = await res.json();

        if (!res.ok) {
          setToast({ message: data.error || 'Gagal mengupdate data guru', type: 'error' });
          return;
        }

        setToast({ message: 'Data guru berhasil diupdate!', type: 'success' });
      } else {
        const res = await fetch('/api/admin/teachers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        const data = await res.json();

        if (!res.ok) {
          setToast({ message: data.error || 'Gagal membuat akun guru', type: 'error' });
          return;
        }

        setToast({ message: 'Akun guru berhasil dibuat!', type: 'success' });
      }

      setFormData({ email: '', password: '', full_name: '' });
      setShowForm(false);
      setEditingId(null);
      fetchTeachers();
    } catch (err) {
      setToast({ message: 'Terjadi kesalahan', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (teacher: Teacher) => {
    setEditingId(teacher.id);
    setFormData({
      email: teacher.email,
      password: '',
      full_name: teacher.full_name,
    });
    setShowForm(true);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({ email: '', password: '', full_name: '' });
    handleCloseModal();
  };

  const handleToggleActive = async () => {
    setIsTogglingStatus(true);
    
    try {
      const res = await fetch(`/api/admin/teachers/${toggleConfirm.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !toggleConfirm.currentStatus }),
      });

      if (!res.ok) throw new Error('Failed to update');
      
      setToast({
        message: toggleConfirm.currentStatus 
          ? `Akun ${toggleConfirm.name} berhasil dinonaktifkan` 
          : `Akun ${toggleConfirm.name} berhasil diaktifkan`,
        type: 'success'
      });
      
      fetchTeachers();
      setToggleConfirm({ show: false, id: '', name: '', currentStatus: false });
    } catch (err) {
      setToast({ message: 'Gagal mengupdate status guru', type: 'error' });
      setToggleConfirm({ show: false, id: '', name: '', currentStatus: false });
    } finally {
      setIsTogglingStatus(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    
    try {
      const res = await fetch(`/api/admin/teachers/${deleteConfirm.id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete');
      fetchTeachers();
      setToast({ message: 'Akun guru berhasil dihapus', type: 'success' });
      setDeleteConfirm({ show: false, id: '', name: '' });
    } catch (err) {
      setToast({ message: 'Gagal menghapus akun guru', type: 'error' });
      setDeleteConfirm({ show: false, id: '', name: '' });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCloseModal = () => {
    setShowForm(false);
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

      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Manajemen Akun Guru</h2>
            <p className="text-sm text-gray-500 mt-1">Kelola akun guru yang dapat mengakses sistem</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <UserPlus className="h-5 w-5" />
            <span>Tambah Guru</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nama
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dibuat
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {teachers.map((teacher) => (
                <tr key={teacher.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{teacher.full_name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {teacher.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        teacher.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {teacher.is_active ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(teacher.created_at).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {/* Edit Button */}
                      <button
                        onClick={() => handleEdit(teacher)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 hover:text-blue-800 transition-all duration-200 font-medium text-sm group"
                        title="Edit data guru"
                      >
                        <Edit2 className="h-3.5 w-3.5 group-hover:scale-110 transition-transform" />
                        <span>Edit</span>
                      </button>

                      {/* Toggle Active Button */}
                      <button
                        onClick={() => setToggleConfirm({ 
                          show: true, 
                          id: teacher.id, 
                          name: teacher.full_name,
                          currentStatus: teacher.is_active 
                        })}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-200 font-medium text-sm group ${
                          teacher.is_active
                            ? 'bg-amber-50 text-amber-700 hover:bg-amber-100 hover:text-amber-800'
                            : 'bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800'
                        }`}
                        title={teacher.is_active ? 'Nonaktifkan akun' : 'Aktifkan akun'}
                      >
                        {teacher.is_active ? (
                          <>
                            <X className="h-3.5 w-3.5 group-hover:scale-110 transition-transform" />
                            <span>Nonaktifkan</span>
                          </>
                        ) : (
                          <>
                            <Check className="h-3.5 w-3.5 group-hover:scale-110 transition-transform" />
                            <span>Aktifkan</span>
                          </>
                        )}
                      </button>

                      {/* Delete Button */}
                      <button
                        onClick={() => setDeleteConfirm({ show: true, id: teacher.id, name: teacher.full_name })}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 hover:text-red-800 transition-all duration-200 font-medium text-sm group"
                        title="Hapus akun guru"
                      >
                        <Trash2 className="h-3.5 w-3.5 group-hover:scale-110 transition-transform" />
                        <span>Hapus</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {teachers.length === 0 && (
            <div className="text-center py-12">
              <UserPlus className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">Belum ada akun guru</p>
              <p className="text-sm text-gray-400 mt-1">Klik "Tambah Guru" untuk membuat akun baru</p>
            </div>
          )}
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeInFast"
          onClick={handleCloseModal}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 relative animate-scaleInFast max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              {editingId ? 'Edit Data Guru' : 'Tambah Guru Baru'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nama Lengkap
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-400"
                      placeholder="Nama lengkap guru"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-400"
                      placeholder="email@sekolah.com"
                      required
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password {editingId && <span className="text-gray-500 text-xs">(Kosongkan jika tidak ingin mengubah)</span>}
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full pl-10 pr-12 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-400"
                      placeholder={editingId ? "Kosongkan jika tidak ingin mengubah" : "Minimal 6 karakter"}
                      required={!editingId}
                      minLength={editingId ? 0 : 6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting && <LoadingSpinner size="sm" />}
                  <span>{editingId ? 'Update Data' : 'Buat Akun Guru'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm.show && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeInFast"
          onClick={() => setDeleteConfirm({ show: false, id: '', name: '' })}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative animate-scaleInFast"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center">
                <Trash2 className="w-10 h-10 text-red-600" />
              </div>
            </div>

            <h3 className="text-2xl font-bold text-gray-900 text-center mb-3">
              Konfirmasi Hapus
            </h3>

            <p className="text-gray-600 text-center mb-2">
              Apakah Anda yakin ingin menghapus akun guru:
            </p>
            <p className="text-lg font-semibold text-gray-900 text-center mb-6">
              {deleteConfirm.name}?
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm({ show: false, id: '', name: '' })}
                className="flex-1 px-6 py-3 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-xl hover:from-red-600 hover:to-red-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isDeleting && <LoadingSpinner size="sm" />}
                <span>Ya, Hapus</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toggle Active Confirmation Modal */}
      {toggleConfirm.show && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeInFast"
          onClick={() => setToggleConfirm({ show: false, id: '', name: '', currentStatus: false })}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative animate-scaleInFast"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-center mb-6">
              <div className={`w-20 h-20 bg-gradient-to-br rounded-full flex items-center justify-center ${
                toggleConfirm.currentStatus 
                  ? 'from-amber-100 to-amber-200' 
                  : 'from-green-100 to-green-200'
              }`}>
                {toggleConfirm.currentStatus ? (
                  <X className="w-10 h-10 text-amber-600" />
                ) : (
                  <Check className="w-10 h-10 text-green-600" />
                )}
              </div>
            </div>

            <h3 className="text-2xl font-bold text-gray-900 text-center mb-3">
              {toggleConfirm.currentStatus ? 'Konfirmasi Nonaktifkan' : 'Konfirmasi Aktifkan'}
            </h3>

            <p className="text-gray-600 text-center mb-2">
              {toggleConfirm.currentStatus ? (
                <>
                  Apakah Anda yakin ingin <span className="font-semibold text-amber-600">menonaktifkan</span> akun guru:
                </>
              ) : (
                <>
                  Apakah Anda yakin ingin <span className="font-semibold text-green-600">mengaktifkan</span> akun guru:
                </>
              )}
            </p>
            <p className="text-lg font-semibold text-gray-900 text-center mb-4">
              {toggleConfirm.name}?
            </p>

            {toggleConfirm.currentStatus && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-2">
                  <div className="text-amber-600 mt-0.5">⚠️</div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-amber-900 mb-1">
                      Perhatian!
                    </p>
                    <p className="text-xs text-amber-700">
                      Jika guru sedang login, mereka akan melihat notifikasi dan otomatis logout dalam 5 detik.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setToggleConfirm({ show: false, id: '', name: '', currentStatus: false })}
                className="flex-1 px-6 py-3 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleToggleActive}
                disabled={isTogglingStatus}
                className={`flex-1 px-6 py-3 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
                  toggleConfirm.currentStatus
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700'
                    : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'
                }`}
              >
                {isTogglingStatus && <LoadingSpinner size="sm" />}
                <span>{toggleConfirm.currentStatus ? 'Ya, Nonaktifkan' : 'Ya, Aktifkan'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
