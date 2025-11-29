'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createPortal } from 'react-dom';
import { Users, GraduationCap, LogOut, X } from 'lucide-react';
import TeachersManagement from '@/components/admin/TeachersManagement';
import ClassesManagement from '@/components/admin/ClassesManagement';

type Tab = 'teachers' | 'classes';

export default function AdminPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('teachers');
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    fetchCurrentUser();
    
    // Check user status every 30 seconds
    const interval = setInterval(() => {
      checkUserStatus();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const checkUserStatus = async () => {
    try {
      const res = await fetch('/api/me');
      if (!res.ok) {
        router.push('/login');
      }
    } catch (err) {
      router.push('/login');
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const res = await fetch('/api/me');
      if (!res.ok) {
        router.push('/login');
        return;
      }
      const data = await res.json();
      if (data.user.role !== 'admin') {
        router.push('/dashboard');
        return;
      }
      setUser(data.user);
    } catch (err) {
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setIsClosing(true);
    setTimeout(() => {
      setShowLogoutModal(false);
      setIsClosing(false);
    }, 200);
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch('/api/logout', { method: 'POST' });
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      setIsLoggingOut(false);
      alert('Terjadi kesalahan saat logout. Silakan coba lagi.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen p-4 lg:p-8"
      style={{ 
        background: 'radial-gradient(circle at 70% 70%, #FFC966 0%, #FFE5B4 30%, #FFF8E7 60%)'
      }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white/40 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-4 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-xs text-gray-500 mt-0.5">EmoClass Management</p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-700">{user?.full_name}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
              <button
                onClick={() => setShowLogoutModal(true)}
                className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white/40 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 mb-6">
          <div className="flex gap-1 p-2">
            <button
              onClick={() => setActiveTab('teachers')}
              className={`flex items-center gap-2 px-6 py-3 font-medium text-sm rounded-xl transition-all ${
                activeTab === 'teachers'
                  ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Users className="h-5 w-5" />
              <span>Manajemen Guru</span>
            </button>
            <button
              onClick={() => setActiveTab('classes')}
              className={`flex items-center gap-2 px-6 py-3 font-medium text-sm rounded-xl transition-all ${
                activeTab === 'classes'
                  ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <GraduationCap className="h-5 w-5" />
              <span>Manajemen Kelas & Siswa</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div>
          {activeTab === 'teachers' && <TeachersManagement />}
          {activeTab === 'classes' && <ClassesManagement />}
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {mounted && showLogoutModal && createPortal(
        <div 
          className={`fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm ${isClosing ? 'animate-fadeOut' : 'animate-fadeInFast'}`}
          onClick={handleCloseModal}
        >
          <div 
            className={`bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative z-[61] ${isClosing ? 'animate-scaleOut' : 'animate-scaleInFast'}`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              disabled={isLoggingOut}
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-amber-100 to-amber-200 rounded-full flex items-center justify-center">
                <LogOut className="w-10 h-10 text-amber-600" />
              </div>
            </div>

            {/* Title */}
            <h3 className="text-2xl font-bold text-gray-900 text-center mb-3" style={{ fontFamily: 'var(--font-poppins)' }}>
              Konfirmasi Logout
            </h3>

            {/* Message */}
            <p className="text-gray-600 text-center mb-8">
              Apakah Anda yakin ingin keluar dari Admin Dashboard? Anda perlu login kembali untuk mengakses aplikasi.
            </p>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleCloseModal}
                disabled={isLoggingOut}
                className="flex-1 px-6 py-3 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ fontFamily: 'var(--font-poppins)' }}
              >
                Batal
              </button>
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-xl hover:from-red-600 hover:to-red-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                style={{ fontFamily: 'var(--font-poppins)' }}
              >
                {isLoggingOut ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Logging out...
                  </>
                ) : (
                  'Ya, Logout'
                )}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
