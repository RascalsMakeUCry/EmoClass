'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Menu, X, User, LogOut } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface MobileNavbarProps {
  onMenuToggle: () => void;
  isSidebarOpen: boolean;
  user?: {
    name: string;
    avatar: string;
  };
}

export default function MobileNavbar({ onMenuToggle, isSidebarOpen, user }: MobileNavbarProps) {
  const [currentUser, setCurrentUser] = useState<{ name: string; avatar: string } | null>(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const res = await fetch('/api/me');
      if (!res.ok) return;
      
      const data = await res.json();
      setCurrentUser({
        name: data.user.full_name || 'Guru',
        avatar: '👨‍🏫',
      });
    } catch (err) {
      // Silently fail
    }
  };

  const displayUser = currentUser || user || { name: 'Guru', avatar: '👨‍🏫' };

  const handleCloseModal = () => {
    setIsClosing(true);
    setTimeout(() => {
      setShowLogoutModal(false);
      setIsClosing(false);
    }, 200);
  };

  return (
    <>
      {/* Sticky Mobile Navbar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Left: Hamburger Menu */}
          <button
            onClick={onMenuToggle}
            className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Toggle menu"
          >
            {isSidebarOpen ? (
              <X className="w-6 h-6 text-gray-700" />
            ) : (
              <Menu className="w-6 h-6 text-gray-700" />
            )}
          </button>

          {/* Center: Logo - Clickable to Dashboard */}
          <div className="flex-1 flex justify-center">
            <Link href="/dashboard" className="focus:outline-none focus:ring-2 focus:ring-orange-400 rounded-lg">
              <Image
                src="/Frame 5.png"
                alt="EmoClass Logo"
                width={120}
                height={40}
                priority
                unoptimized
                className="object-contain w-auto h-8 cursor-pointer hover:opacity-80 transition-opacity"
              />
            </Link>
          </div>

          {/* Right: Profile */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="w-10 h-10 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-md ring-2 ring-white"
              aria-label="Profile menu"
            >
              <User className="w-5 h-5 text-white" />
            </button>

            {/* Profile Dropdown */}
            {showProfileMenu && (
              <>
                {/* Backdrop */}
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowProfileMenu(false)}
                />
                
                {/* Dropdown Menu */}
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 animate-fadeInFast">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-bold text-gray-900 truncate">{displayUser.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">Guru EmoClass</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      setShowLogoutModal(true);
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 transition-colors font-medium flex items-center gap-2"
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
    </>
  );
}
