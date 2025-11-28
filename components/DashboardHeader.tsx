'use client';

import { useState, useEffect } from 'react';
import { formatIndonesianDate } from '@/lib/utils';

interface DashboardHeaderProps {
  user?: {
    name: string;
    avatar: string;
  };
  lastUpdated?: Date;
}

export default function DashboardHeader({ user, lastUpdated }: DashboardHeaderProps) {
  const [showDropdown, setShowDropdown] = useState(false);

  const [currentUser, setCurrentUser] = useState<{ name: string; avatar: string } | null>(null);

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const res = await fetch('/api/me');
      if (res.ok) {
        const data = await res.json();
        setCurrentUser({
          name: data.user.full_name || 'Guru',
          avatar: '👨‍🏫',
        });
      }
    } catch (err) {
      console.error('Failed to fetch user');
    }
  };

  const displayUser = currentUser || user || { name: 'Guru', avatar: '👨‍🏫' };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-4 mb-6">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Icon + Title + Date in one line */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
            <span className="text-xl">📊</span>
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Dashboard Guru
            </h1>
            <div className="flex items-center gap-2 mt-0.5">
              <p className="text-xs text-gray-600 font-medium">
                {formatIndonesianDate(new Date())}
              </p>
              {lastUpdated && (
                <>
                  <span className="text-gray-400">•</span>
                  <p className="text-xs text-gray-500">
                    Update terakhir: {lastUpdated.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </>
              )}
            </div>
          </div>
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
                  onClick={async () => {
                    await fetch('/api/logout', { method: 'POST' });
                    window.location.href = '/login';
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                >
                  <span>🚪</span>
                  <span>Logout</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
