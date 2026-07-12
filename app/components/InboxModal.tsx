"use client";

import { useState, useEffect } from "react";
import { X, Heart, MessageCircle, UserPlus, AtSign, ShieldAlert, Check } from "lucide-react";
import { notifications as notifsApi, Notification } from "@/lib/api-client";

interface InboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAllRead?: () => void;
}

const relTime = (iso: string) => {
  const then = new Date(iso).getTime();
  if (isNaN(then)) return "";
  const s = Math.max(0, Math.floor((Date.now() - then) / 1000));
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
};

const icon = (type: Notification["type"]) => {
  switch (type) {
    case "like": return <Heart className="w-5 h-5 text-[#fe2c55]" />;
    case "comment": return <MessageCircle className="w-5 h-5 text-[#20d5ec]" />;
    case "follow": return <UserPlus className="w-5 h-5 text-[#fe2c55]" />;
    case "mention": return <AtSign className="w-5 h-5 text-green-500" />;
    case "moderation": return <ShieldAlert className="w-5 h-5 text-yellow-500" />;
    default: return <Heart className="w-5 h-5 text-[#fe2c55]" />;
  }
};

export function InboxModal({ isOpen, onClose, onAllRead }: InboxModalProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    notifsApi
      .list()
      .then((r) => setNotifications(r.notifications))
      .catch(() => setNotifications([]))
      .finally(() => setLoading(false));
  }, [isOpen]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    onAllRead?.();
    notifsApi.markRead().catch(() => {});
  };

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 bg-black z-50 flex flex-col animate-in slide-in-from-bottom duration-300">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10 bg-[#0f0f0f]">
        <button onClick={onClose} className="text-white/60 hover:text-white"><X className="w-6 h-6" /></button>
        <span className="text-white font-semibold text-lg">Notifications</span>
        {unreadCount > 0 ? (
          <button onClick={markAllAsRead} className="text-[#fe2c55] text-sm">Mark all read</button>
        ) : (
          <div className="w-12" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto bg-[#0f0f0f]">
        {loading ? (
          <div className="flex justify-center py-12"><div className="w-7 h-7 border-[3px] border-white/20 border-t-white rounded-full animate-spin" /></div>
        ) : notifications.length > 0 ? (
          <div className="divide-y divide-white/10">
            {notifications.map((n) => (
              <div key={n.id} className={`flex items-start gap-3 p-4 hover:bg-white/5 transition-colors ${!n.read ? "bg-white/5" : ""}`}>
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">{icon(n.type)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-3">
                    {n.actor && (
                      <img src={n.actor.avatarUrl} alt={n.actor.username} className="w-10 h-10 rounded-full bg-gray-700 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <p className="text-white text-sm">
                        {n.actor && <span className="font-semibold">{n.actor.username} </span>}
                        {n.text}
                      </p>
                      <p className="text-white/40 text-xs mt-1">{relTime(n.createdAt)}</p>
                    </div>
                    {!n.read && <div className="w-2 h-2 bg-[#fe2c55] rounded-full flex-shrink-0 mt-2" />}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-white/40 py-12">
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-white/40" />
            </div>
            <p>All caught up!</p>
            <p className="text-sm mt-1">No notifications yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
