'use client';

import { useState, useEffect } from 'react';
import { Menu, X, User } from 'lucide-react';
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
                    onClick={async () => {
                      setShowProfileMenu(false);
                      try {
                        await fetch('/api/logout', { method: 'POST' });
                        window.location.href = '/login';
                      } catch (error) {
                        console.error('Logout error:', error);
                      }
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 transition-colors font-medium"
                  >
                    Logout
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
