'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: string;
}

interface SidebarProps {
  isCollapsed?: boolean;
  onToggle?: () => void;
}

const navigationItems: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    href: '/dashboard',
    icon: '📊',
  },
  {
    id: 'input-emotion',
    label: 'Input Emotion',
    href: '/input-emotion',
    icon: '😊',
  },
  {
    id: 'reports',
    label: 'Reports',
    href: '/reports',
    icon: '📈',
  },
  {
    id: 'notifications',
    label: 'Notifications',
    href: '/notifications',
    icon: '🔔',
  },
  {
    id: 'more',
    label: 'More',
    href: '#',
    icon: '⋯',
  },
];

export default function Sidebar({ isCollapsed = false, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard' || pathname === '/';
    }
    return pathname?.startsWith(href);
  };

  const toggleMobile = () => {
    setIsMobileOpen(!isMobileOpen);
    onToggle?.();
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={toggleMobile}
        className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 bg-white rounded-lg shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
        aria-label="Toggle menu"
      >
        <span className="text-xl">{isMobileOpen ? '✕' : '☰'}</span>
      </button>

      {/* Overlay for mobile */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={toggleMobile}
        />
      )}

      {/* Sidebar */}
      <aside
        role="complementary"
        className={`
          fixed top-0 left-0 h-full bg-white border-r border-gray-200 z-40
          transition-transform duration-300 ease-in-out
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
          ${isCollapsed ? 'w-20' : 'w-64'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <div className="p-6 border-b border-gray-200">
            <Link href="/dashboard" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-red-400 to-pink-400 rounded-xl flex items-center justify-center shadow-md">
                <span className="text-xl">😊</span>
              </div>
              {!isCollapsed && (
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold text-gray-800">EmoClass</span>
                </div>
              )}
            </Link>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 p-4 space-y-2">
            {navigationItems.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl
                    transition-all duration-200
                    ${
                      active
                        ? 'bg-red-50 text-red-600 font-semibold shadow-sm'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }
                    ${isCollapsed ? 'justify-center' : ''}
                  `}
                >
                  <span className="text-xl flex-shrink-0">{item.icon}</span>
                  {!isCollapsed && (
                    <span className="text-sm font-medium">{item.label}</span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Logout Button */}
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={async () => {
                if (confirm('Yakin ingin logout?')) {
                  await fetch('/api/logout', { method: 'POST' });
                  window.location.href = '/login';
                }
              }}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-xl
                text-red-600 hover:bg-red-50 transition-colors
                ${isCollapsed ? 'justify-center' : ''}
              `}
            >
              <span className="text-xl">🚪</span>
              {!isCollapsed && <span className="text-sm font-medium">Logout</span>}
            </button>
          </div>

          {/* Footer */}
          {!isCollapsed && (
            <div className="p-4 border-t border-gray-200">
              <div className="text-xs text-gray-500 text-center">
                <p>EmoClass v1.0</p>
                <p className="mt-1">© 2025 EISD Hackathon</p>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Spacer for desktop to prevent content overlap */}
      <div className={`hidden lg:block ${isCollapsed ? 'w-20' : 'w-64'} flex-shrink-0`} />
    </>
  );
}
