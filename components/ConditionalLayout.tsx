'use client';

import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';

/**
 * ConditionalLayout Component
 * 
 * Mengatur tampilan layout berdasarkan halaman:
 * - Halaman DENGAN Sidebar (Guru): /dashboard, /reports, /notifications, /iot, /input-emotion
 * - Halaman TANPA Sidebar: /login, /admin (admin punya sidebar sendiri)
 * 
 * @param children - React children components
 */
export default function ConditionalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  // Pages without guru sidebar
  // - /login: Halaman login tidak perlu sidebar
  // - /admin: Admin panel punya sidebar sendiri yang berbeda
  const noSidebarPages = ['/login', '/admin'];
  const shouldShowSidebar = pathname ? !noSidebarPages.some(page => pathname.startsWith(page)) : false;

  if (!shouldShowSidebar) {
    // Full width layout untuk login dan admin
    return <>{children}</>;
  }

  // Default layout dengan sidebar untuk guru
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
