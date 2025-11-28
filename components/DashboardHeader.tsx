'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { formatIndonesianDate } from '@/lib/utils';
import { LogOut, X, AlertTriangle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface DashboardHeaderProps {
  user?: {
    name: string;
    avatar: string;
  };
}

export default function DashboardHeader({ user }: DashboardHeaderProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showInactiveModal, setShowInactiveModal] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [isClosing, setIsClosing] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ name: string; avatar: string; id: string } | null>(null);
  const [mounted, setMounted] = useState(false);
  const channelRef = useRef<any>(null);
  const isSubscribedRef = useRef(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Countdown effect for inactive modal
  useEffect(() => {
    if (showInactiveModal && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (showInactiveModal && countdown === 0) {
      window.location.href = '/login';
    }
  }, [showInactiveModal, countdown]);

  const handleCloseModal = () => {
    setIsClosing(true);
    setTimeout(() => {
      setShowLogoutModal(false);
      setIsClosing(false);
    }, 200);
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  // Set up Realtime listener for user status changes
  useEffect(() => {
    if (!currentUser?.id) return;

    // Prevent multiple subscriptions
    if (isSubscribedRef.current) return;

    const channel = supabase
      .channel(`user-status-${currentUser.id}`, {
        config: {
          broadcast: { self: true },
        },
      })
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'users',
          filter: `id=eq.${currentUser.id}`,
        },
        (payload) => {
          // Check if user was deactivated or deleted
          if (payload.eventType === 'DELETE') {
            setShowInactiveModal(true);
          } else if (
            payload.eventType === 'UPDATE' &&
            payload.new &&
            !(payload.new as any).is_active
          ) {
            setShowInactiveModal(true);
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          isSubscribedRef.current = true;
        } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          isSubscribedRef.current = false;
        }
      });

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
        isSubscribedRef.current = false;
      }
    };
  }, [currentUser?.id]);

  const fetchCurrentUser = async () => {
    try {
      const res = await fetch('/api/me');
      if (!res.ok) return;
      
      const data = await res.json();
      setCurrentUser({
        id: data.user.id,
        name: data.user.full_name || 'Guru',
        avatar: '👨‍🏫',
      });
    } catch (err) {
      // Silently fail
    }
  };

  const displayUser = currentUser || user || { name: 'Guru', avatar: '👨‍🏫' };

  return (
    <>
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-4 mb-6">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Title + Date */}
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-gray-900">
            Dashboard Guru
          </h1>
          <p className="text-xs text-gray-600 font-medium mt-0.5">
            {formatIndonesianDate(new Date())}
          </p>
        </div>

        {/* Right: User Info */}
        <div className="relative flex-shrink-0">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-gray-800">{displayUser.name}</p>
              <p className="text-xs text-gray-500">Guru</p>
            </div>
            <div className="w-9 h-9 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-lg shadow-md">
              {displayUser.avatar}
            </div>
          </button>

          {/* Dropdown Menu */}
          {showDropdown && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowDropdown(false)}
              />
              
              {/* Dropdown */}
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50">
                <button
                  onClick={() => {
                    setShowDropdown(false);
                    setShowLogoutModal(true);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            </>
          )}
        </div>
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
              Apakah Anda yakin ingin keluar dari EmoClass? Anda perlu login kembali untuk mengakses aplikasi.
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
                onClick={async () => {
                  setIsLoggingOut(true);
                  try {
                    await fetch('/api/logout', { method: 'POST' });
                    window.location.href = '/login';
                  } catch (error) {
                    console.error('Logout error:', error);
                    setIsLoggingOut(false);
                    alert('Terjadi kesalahan saat logout. Silakan coba lagi.');
                  }
                }}
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

      {/* Account Deactivated Modal */}
      {mounted && showInactiveModal && createPortal(
        <div 
          className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeInFast"
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative z-[71] animate-scaleInFast"
          >
            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center animate-pulse">
                <AlertTriangle className="w-10 h-10 text-red-600" />
              </div>
            </div>

            {/* Title */}
            <h3 className="text-2xl font-bold text-gray-900 text-center mb-3" style={{ fontFamily: 'var(--font-poppins)' }}>
              Akun Dinonaktifkan
            </h3>

            {/* Message */}
            <p className="text-gray-700 text-center mb-6">
              Akun Anda telah dinonaktifkan oleh administrator. Anda akan dialihkan ke halaman login.
            </p>

            {/* Countdown */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-3xl font-bold text-white">{countdown}</span>
              </div>
            </div>

            {/* Info */}
            <p className="text-sm text-gray-500 text-center mb-6">
              Redirect otomatis dalam {countdown} detik...
            </p>

            {/* Button */}
            <button
              onClick={() => window.location.href = '/login'}
              className="w-full px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-xl hover:from-red-600 hover:to-red-700 transition-all shadow-lg hover:shadow-xl"
              style={{ fontFamily: 'var(--font-poppins)' }}
            >
              OK, Mengerti
            </button>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
