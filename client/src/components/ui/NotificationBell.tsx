import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../lib/axios";
import { useAuth } from "../../hooks/useAuth";

interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  read: boolean;
  link?: string;
  createdAt: string;
}

const typeEmoji: Record<string, string> = {
  APPLICATION_ACCEPTED: "🎉",
  APPLICATION_REJECTED: "📋",
  APPLICATION_REVIEWED: "👀",
  INFO: "ℹ️",
};

export const NotificationBell = () => {
  const { isStudent } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Fetch unread count every 30 seconds
  useEffect(() => {
    if (!isStudent) return;
    const fetch = () => {
      api
        .get("/notifications/unread-count")
        .then((r) => setUnreadCount(r.data.data.count))
        .catch(() => {});
    };
    fetch();
    const interval = setInterval(fetch, 30000);
    return () => clearInterval(interval);
  }, [isStudent]);

  const handleOpen = async () => {
    if (!open) {
      try {
        const r = await api.get("/notifications");
        setNotifications(r.data.data);
      } catch {}
    }
    setOpen(!open);
  };

  const handleClick = async (notif: Notification) => {
    if (!notif.read) {
      await api.put(`/notifications/${notif.id}/read`).catch(() => {});
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n)),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }
    if (notif.link) navigate(notif.link);
    setOpen(false);
  };

  const handleMarkAllRead = async () => {
    await api.put("/notifications/mark-all-read").catch(() => {});
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const formatTime = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  if (!isStudent) return null;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={handleOpen}
        className="relative w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-all border border-slate-700/50"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center leading-none">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-dark-800 border border-slate-700/50 rounded-2xl shadow-2xl z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/50">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-white">
                Notifications
              </h3>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 bg-primary-500/20 text-primary-400 text-xs rounded-full font-medium">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs text-primary-400 hover:text-primary-300 transition-colors"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="py-12 text-center">
                <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto mb-3">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className="text-slate-600"
                  >
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                  </svg>
                </div>
                <p className="text-slate-500 text-sm">No notifications yet</p>
                <p className="text-slate-600 text-xs mt-1">
                  We will notify you of application updates
                </p>
              </div>
            ) : (
              notifications.map((notif) => (
                <button
                  key={notif.id}
                  onClick={() => handleClick(notif)}
                  className={`w-full flex items-start gap-3 px-4 py-3 hover:bg-slate-700/30 transition-all text-left border-b border-slate-700/20 last:border-0 ${
                    !notif.read ? "bg-primary-500/5" : ""
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-base ${
                      !notif.read
                        ? "bg-primary-500/15 border border-primary-500/20"
                        : "bg-slate-800 border border-slate-700/50"
                    }`}
                  >
                    {typeEmoji[notif.type] || "ℹ️"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p
                        className={`text-sm font-medium leading-tight ${
                          !notif.read ? "text-white" : "text-slate-300"
                        }`}
                      >
                        {notif.title}
                      </p>
                      {!notif.read && (
                        <div className="w-2 h-2 bg-primary-500 rounded-full flex-shrink-0 mt-1" />
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed line-clamp-2">
                      {notif.message}
                    </p>
                    <p className="text-xs text-slate-600 mt-1">
                      {formatTime(notif.createdAt)}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
