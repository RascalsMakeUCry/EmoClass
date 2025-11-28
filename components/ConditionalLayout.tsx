'use client';

import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';

export default function ConditionalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  // Pages without sidebar
  const noSidebarPages = ['/login', '/admin'];
  const shouldShowSidebar = !noSidebarPages.includes(pathname);

  if (!shouldShowSidebar) {
    // Full width layout for login and admin
    return <>{children}</>;
  }

  // Default layout with sidebar
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
