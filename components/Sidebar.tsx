"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import { LayoutGrid, Heart, FileText, Bell, LogOut, X } from "lucide-react";

interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: React.ReactNode;
}

interface SidebarProps {
  isCollapsed?: boolean;
  onToggle?: () => void;
}

const navigationItems: NavItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    href: "/dashboard",
    icon: <LayoutGrid className="w-5 h-5" />,
  },
  {
    id: "input-emotion",
    label: "Input Emotion",
    href: "/input-emotion",
    icon: <Heart className="w-5 h-5" />,
  },
  {
    id: "reports",
    label: "Laporan",
    href: "/reports",
    icon: <FileText className="w-5 h-5" />,
  },
  {
    id: "notifications",
    label: "Notifikasi",
    href: "/notifications",
    icon: <Bell className="w-5 h-5" />,
  },
  {
    id: "iot-monitoring",
    label: "Monitoring IoT",
    href: "/iot",
    icon: <LayoutGrid className="w-5 h-5" />,
  },
];

export default function Sidebar({
  isCollapsed = false,
  onToggle,
}: SidebarProps) {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleCloseModal = () => {
    setIsClosing(true);
    setTimeout(() => {
      setShowLogoutModal(false);
      setIsClosing(false);
    }, 200); // Match animation duration
  };

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard" || pathname === "/";
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
        className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 bg-white rounded-lg shadow-lg flex items-center justify-center hover:bg-gray-100 transition-colors"
        aria-label="Toggle menu"
      >
        <span className="text-xl">{isMobileOpen ? "✕" : "☰"}</span>
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
          fixed top-0 left-0 h-full bg-white/100 backdrop-blur-sm border-r border-gray-200 z-40
          transition-transform duration-300 ease-in-out
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
          ${isCollapsed ? "w-20" : "w-64"}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <div className="p-6 border-b border-gray-100">
            <Link
              href="/dashboard"
              className="flex items-center justify-center"
            >
              {!isCollapsed && (
                <Image
                  src="/Frame 5.png"
                  alt="EmoClass Logo"
                  width={180}
                  height={60}
                  priority
                  unoptimized
                  className="object-contain w-auto h-auto"
                />
              )}
              {isCollapsed && (
                <div className="w-10 h-10 bg-gradient-to-r from-amber-400 to-amber-500 rounded-xl flex items-center justify-center">
                  <span className="text-xl">😊</span>
                </div>
              )}
            </Link>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 p-6 space-y-3">
            {navigationItems.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={`
                    relative flex items-center gap-4 px-4 py-3.5 rounded-lg font-poppins
                    ${isCollapsed ? "justify-center" : ""}
                    ${active ? "text-[#FEBE40] font-semibold" : "text-gray-600"}
                    ${
                      !active
                        ? "transition-all duration-300 ease-out hover:bg-[#FEBE40]/80 hover:translate-x-1 hover:shadow-[0_10px_30px_rgba(254,190,64,0.12)]"
                        : ""
                    }
                  `}
                  style={{ fontFamily: "var(--font-poppins)" }}
                >
                  {/* Active indicator */}
                  {active && (
                    <div
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-10 rounded-r-full"
                      style={{ background: "#FEBE40" }}
                    />
                  )}
                  <span className="flex-shrink-0">{item.icon}</span>
                  {!isCollapsed && (
                    <span className="text-base font-semibold">
                      {item.label}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Logout Button */}
          <div className="p-6 border-t border-gray-100">
            <button
              onClick={() => setShowLogoutModal(true)}
              className={`
                w-full flex items-center gap-4 px-4 py-3.5 rounded-lg
                text-gray-600 hover:bg-gray-50 hover:text-red-600 transition-colors font-poppins
                ${isCollapsed ? "justify-center" : ""}
              `}
              style={{ fontFamily: "var(--font-poppins)" }}
            >
              <LogOut className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && (
                <span className="text-base font-semibold">Logout</span>
              )}
            </button>
          </div>
        </div>
      </aside>

      {/* Spacer for desktop to prevent content overlap */}
      <div
        className={`hidden lg:block ${
          isCollapsed ? "w-20" : "w-64"
        } flex-shrink-0`}
      />

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div
          className={`fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm ${
            isClosing ? "animate-fadeOut" : "animate-fadeInFast"
          }`}
          onClick={handleCloseModal}
        >
          <div
            className={`bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative z-[61] ${
              isClosing ? "animate-scaleOut" : "animate-scaleInFast"
            }`}
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
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(254,190,64,0.12), rgba(254,190,64,0.04))",
                }}
              >
                <LogOut className="w-10 h-10" style={{ color: "#FEBE40" }} />
              </div>
            </div>

            {/* Title */}
            <h3
              className="text-2xl font-bold text-gray-900 text-center mb-3"
              style={{ fontFamily: "var(--font-poppins)" }}
            >
              Konfirmasi Logout
            </h3>

            {/* Message */}
            <p className="text-gray-600 text-center mb-8">
              Apakah Anda yakin ingin keluar dari EmoClass? Anda perlu login
              kembali untuk mengakses aplikasi.
            </p>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleCloseModal}
                disabled={isLoggingOut}
                className="flex-1 px-6 py-3 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ fontFamily: "var(--font-poppins)" }}
              >
                Batal
              </button>
              <button
                onClick={async () => {
                  setIsLoggingOut(true);
                  try {
                    await fetch("/api/logout", { method: "POST" });
                    window.location.href = "/login";
                  } catch (error) {
                    console.error("Logout error:", error);
                    setIsLoggingOut(false);
                    alert("Terjadi kesalahan saat logout. Silakan coba lagi.");
                  }
                }}
                disabled={isLoggingOut}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-xl hover:from-red-600 hover:to-red-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                style={{ fontFamily: "var(--font-poppins)" }}
              >
                {isLoggingOut ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Logging out...
                  </>
                ) : (
                  "Ya, Logout"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
