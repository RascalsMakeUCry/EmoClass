"use client";

import { useState, useEffect } from "react";
import {
  Bell,
  AlertTriangle,
  Info,
  TrendingUp,
  Check,
  X,
  Trash2,
  CheckCheck,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import Toast from "@/components/Toast";
import LoadingSpinner from "@/components/LoadingSpinner";
import { supabase } from "@/lib/supabase";

interface Notification {
  id: string;
  type: "alert" | "system" | "summary";
  priority: "urgent" | "high" | "normal" | "low";
  title: string;
  message: string;
  metadata: any;
  is_read: boolean;
  created_at: string;
  read_at: string | null;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "alert" | "system" | "summary">(
    "all"
  );
  const [unreadCount, setUnreadCount] = useState(0);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [showReadNotifications, setShowReadNotifications] = useState(true);
  const [realtimeStatus, setRealtimeStatus] = useState<
    "connecting" | "connected" | "disconnected"
  >("connecting");

  useEffect(() => {
    fetchNotifications();

    // Setup realtime subscription for notifications
    setRealtimeStatus("connecting");

    const channel = supabase
      .channel("notifications-changes")
      .on(
        "postgres_changes",
        {
          event: "*", // Listen to all events (INSERT, UPDATE, DELETE)
          schema: "public",
          table: "notifications",
        },
        (payload) => {
          console.log("✅ Realtime notification change:", payload);

          // Refresh notifications when any change occurs
          fetchNotifications();

          // Show toast for new notifications
          if (payload.eventType === "INSERT") {
            const newNotif = payload.new as Notification;
            setToast({
              message: `🔔 Notifikasi baru: ${newNotif.title}`,
              type: "success",
            });
          }
        }
      )
      .subscribe((status) => {
        console.log("Realtime subscription status:", status);
        if (status === "SUBSCRIBED") {
          setRealtimeStatus("connected");
          console.log("✅ Realtime notifications connected!");
        } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          setRealtimeStatus("disconnected");
          console.error("❌ Realtime connection failed:", status);
        }
      });

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [filter]);

  const fetchNotifications = async () => {
    try {
      const url =
        filter === "all"
          ? "/api/notifications"
          : `/api/notifications?type=${filter}`;

      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch");

      const data = await res.json();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (err) {
      setToast({ message: "Gagal memuat notifikasi", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const res = await fetch(`/api/notifications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_read: true }),
      });

      if (!res.ok) throw new Error("Failed to update");

      fetchNotifications();
    } catch (err) {
      setToast({ message: "Gagal mengupdate notifikasi", type: "error" });
    }
  };

  const markAllAsRead = async () => {
    try {
      const res = await fetch("/api/notifications/mark-all-read", {
        method: "POST",
      });

      if (!res.ok) throw new Error("Failed to update");

      setToast({
        message: "Semua notifikasi ditandai sudah dibaca",
        type: "success",
      });
      fetchNotifications();
    } catch (err) {
      setToast({ message: "Gagal mengupdate notifikasi", type: "error" });
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      const res = await fetch(`/api/notifications/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete");

      setToast({ message: "Notifikasi dihapus", type: "success" });
      fetchNotifications();
    } catch (err) {
      setToast({ message: "Gagal menghapus notifikasi", type: "error" });
    }
  };

  const getIcon = (type: string, priority: string) => {
    if (priority === "urgent")
      return <AlertTriangle className="w-6 h-6 text-red-600" />;
    if (type === "alert")
      return <AlertTriangle className="w-6 h-6 text-orange-600" />;
    if (type === "summary")
      return <TrendingUp className="w-6 h-6 text-blue-600" />;
    return <Info className="w-6 h-6 text-gray-600" />;
  };

  const getPriorityBadge = (priority: string) => {
    const styles = {
      urgent: "bg-red-100 text-red-800 border-red-200",
      high: "bg-orange-100 text-orange-800 border-orange-200",
      normal: "bg-blue-100 text-blue-800 border-blue-200",
      low: "bg-gray-100 text-gray-800 border-gray-200",
    };

    return (
      <span
        className={`text-xs px-2 py-1 rounded-full border ${
          styles[priority as keyof typeof styles] || styles.normal
        }`}
      >
        {priority.toUpperCase()}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Baru saja";
    if (minutes < 60) return `${minutes} menit yang lalu`;
    if (hours < 24) return `${hours} jam yang lalu`;
    if (days < 7) return `${days} hari yang lalu`;

    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div
      className="min-h-screen p-4 lg:p-8"
      style={{
        background:
          "radial-gradient(circle at 70% 70%, #FFC966 0%, #FFE5B4 30%, #FFF8E7 60%)",
      }}
    >
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-4 sm:p-6 mb-6 hover:shadow-2xl transition-shadow">
          {/* Mobile: Stack vertically, Desktop: Side by side */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-orange-400 via-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                <Bell className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  Notifikasi
                </h1>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-1">
                  <p className="text-xs sm:text-sm text-gray-600">
                    {unreadCount > 0 ? (
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>
                        {unreadCount} notifikasi belum dibaca
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <span className="text-green-600">✓</span>
                        Semua notifikasi sudah dibaca
                      </span>
                    )}
                  </p>
                  <span className="text-gray-300 hidden sm:inline">•</span>
                  <p className="text-xs text-gray-500 flex items-center gap-1.5">
                    {realtimeStatus === "connecting" && (
                      <>
                        <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></span>
                        <span>Menghubungkan...</span>
                      </>
                    )}
                    {realtimeStatus === "connected" && (
                      <>
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        <span className="text-green-600">
                          Live Update Aktif
                        </span>
                      </>
                    )}
                    {realtimeStatus === "disconnected" && (
                      <>
                        <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                        <span className="text-red-600">
                          Live Update Nonaktif
                        </span>
                      </>
                    )}
                  </p>
                </div>
              </div>
            </div>

            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center justify-center gap-2 px-4 py-2.5 sm:px-5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg hover:shadow-xl font-medium text-sm sm:text-base whitespace-nowrap cursor-pointer"
              >
                <CheckCheck className="w-4 h-4" />
                <span>Tandai Semua Dibaca</span>
              </button>
            )}
          </div>

          {/* Filters */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setFilter("all")}
              className={`px-5 py-2.5 rounded-xl font-semibold transition-all shadow-md hover:cursor-pointer ${
                filter === "all"
                  ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200"
              }`}
            >
              Semua
            </button>
            <button
              onClick={() => setFilter("alert")}
              className={`px-5 py-2.5 rounded-xl font-semibold transition-all shadow-md cursor-pointer hover:shadow-lg flex items-center gap-2 ${
                filter === "alert"
                  ? "bg-gradient-to-r from-red-500 to-red-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200"
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
              <span>Alerts</span>
            </button>
            <button
              onClick={() => setFilter("system")}
              className={`px-5 py-2.5 rounded-xl font-semibold transition-all shadow-md hover:cursor-pointer
 flex items-center gap-2 ${
   filter === "system"
     ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white"
     : "bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200"
 }`}
            >
              <Info className="w-4 h-4" />
              <span>System</span>
            </button>
            <button
              onClick={() => setFilter("summary")}
              className={`px-5 py-2.5 rounded-xl font-semibold transition-all shadow-md cursor-pointer hover:shadow-lg flex items-center gap-2 ${
                filter === "summary"
                  ? "bg-gradient-to-r from-green-500 to-green-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200"
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>Summary</span>
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-6">
          {loading ? (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-12 text-center">
              <LoadingSpinner size="lg" color="blue" />
              <p className="text-gray-600 mt-4">Memuat notifikasi...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-12 text-center">
              <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Tidak Ada Notifikasi
              </h3>
              <p className="text-gray-600">
                {filter === "all"
                  ? "Anda belum memiliki notifikasi"
                  : `Tidak ada notifikasi ${filter}`}
              </p>
            </div>
          ) : (
            <>
              {/* Unread Notifications Section */}
              {notifications.filter((n) => !n.is_read).length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 px-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
                      <h2 className="text-lg font-bold text-gray-900">
                        Belum Dibaca
                      </h2>
                      <span className="px-2.5 py-0.5 bg-orange-500 text-white text-xs font-bold rounded-full">
                        {notifications.filter((n) => !n.is_read).length}
                      </span>
                    </div>
                  </div>

                  {notifications
                    .filter((n) => !n.is_read)
                    .map((notif) => (
                      <div
                        key={notif.id}
                        className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border-2 border-orange-300 bg-gradient-to-r from-orange-50/50 to-white/80 p-6 transition-all hover:shadow-2xl hover:scale-[1.01]"
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0">
                            {getIcon(notif.type, notif.priority)}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4 mb-2">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-semibold text-gray-900">
                                  {notif.title}
                                </h3>
                                {getPriorityBadge(notif.priority)}
                                <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>
                              </div>

                              <div className="flex items-center gap-2 flex-shrink-0">
                                <button
                                  onClick={() => markAsRead(notif.id)}
                                  className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors shadow-sm cursor-pointer"
                                  title="Tandai sudah dibaca"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => deleteNotification(notif.id)}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors shadow-sm cursor-pointer"
                                  title="Hapus notifikasi"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>

                            <p className="text-gray-700 mb-3">
                              {notif.message}
                            </p>

                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span>{formatDate(notif.created_at)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}

              {/* Read Notifications Section */}
              {notifications.filter((n) => n.is_read).length > 0 && (
                <div className="space-y-4">
                  <button
                    onClick={() =>
                      setShowReadNotifications(!showReadNotifications)
                    }
                    className="flex items-center gap-3 px-2 w-full hover:bg-gray-50 cursor-pointer rounded-lg py-2 transition-colors"
                  >
                    <div className="flex items-center gap-2 flex-1">
                      <Check className="w-4 h-4 text-green-600" />
                      <h2 className="text-lg font-bold text-gray-900">
                        Sudah Dibaca
                      </h2>
                      <span className="px-2.5 py-0.5 bg-gray-200 text-gray-700 text-xs font-bold rounded-full">
                        {notifications.filter((n) => n.is_read).length}
                      </span>
                    </div>
                    {showReadNotifications ? (
                      <ChevronUp className="w-5 h-5 text-gray-500" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-500" />
                    )}
                  </button>

                  {showReadNotifications &&
                    notifications
                      .filter((n) => n.is_read)
                      .map((notif) => (
                        <div
                          key={notif.id}
                          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border-2 border-white/40 p-6 transition-all hover:shadow-2xl hover:scale-[1.01] opacity-75 hover:opacity-100"
                        >
                          <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 opacity-60">
                              {getIcon(notif.type, notif.priority)}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-4 mb-2">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h3 className="font-semibold text-gray-900">
                                    {notif.title}
                                  </h3>
                                  {getPriorityBadge(notif.priority)}
                                </div>

                                <div className="flex items-center gap-2 flex-shrink-0">
                                  <button
                                    onClick={() => deleteNotification(notif.id)}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors shadow-sm hover:cursor-pointer
"
                                    title="Hapus notifikasi"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>

                              <p className="text-gray-700 mb-3">
                                {notif.message}
                              </p>

                              <div className="flex items-center gap-4 text-sm text-gray-500">
                                <span>{formatDate(notif.created_at)}</span>
                                {notif.read_at && (
                                  <span className="text-green-600">
                                    ✓ Dibaca {formatDate(notif.read_at)}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
