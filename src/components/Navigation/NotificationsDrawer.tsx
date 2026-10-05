"use client";

import React from "react";
import { X, Bell, AlertTriangle, CheckCircle2, Info, Clock } from "lucide-react";
import { NotificationItem } from "@/types/Entities";

interface NotificationsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onMarkAllRead: () => void;
}

export default function NotificationsDrawer({
  isOpen,
  onClose,
  notifications,
  onMarkAllRead,
}: NotificationsDrawerProps) {
  if (!isOpen) return null;

  const getIcon = (type: NotificationItem["type"]) => {
    switch (type) {
      case "warning":
      case "alert":
        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case "success":
        return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      default:
        return <Info className="w-4 h-4 text-emerald-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-sans">
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
          <div className="w-screen max-w-md bg-[#fbfbf5] border-l border-[#e4e4e7] card-stack-shadow shadow-2xl flex flex-col h-full">
          {/* Header */}
          <div className="px-6 py-4 bg-white border-b border-[#e4e4e7] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-full bg-[#c1fbd4] flex items-center justify-center text-black shrink-0">
                <Bell className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-semibold text-black tracking-tight truncate">System Notifications</h3>
                <p className="text-[11px] text-[#71717a] font-mono truncate">Store alerts & telemetry</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-[#71717a] hover:text-black p-2 rounded-full hover:bg-[#f4f4f5] transition-colors cursor-pointer shrink-0 ml-2"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Subheader action */}
          <div className="px-6 py-3 bg-[#fbfbf5] border-b border-[#e4e4e7] flex items-center justify-between text-xs shrink-0">
            <span className="text-[#71717a] font-mono text-[11px]">
              {notifications.filter((n) => !n.read).length} unread notices
            </span>
            <button
              onClick={onMarkAllRead}
              className="btn-outline-light text-xs py-1 px-3.5"
            >
              Mark all as read
            </button>
          </div>

          {/* Notification List */}
          <div className="flex-1 min-h-0 overflow-y-auto space-y-2.5 p-4">
            {notifications.map((item) => (
              <div
                key={item.id}
                className={`p-4 rounded-2xl border transition-all ${
                  item.read
                    ? "bg-white border-[#e4e4e7] card-stack-shadow"
                    : "bg-[#c1fbd4]/20 border border-[#c1fbd4] card-stack-shadow"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 shrink-0">{getIcon(item.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2 min-w-0">
                      <h4 className="text-xs font-semibold text-black truncate">{item.title}</h4>
                      <span className="text-[10px] font-mono text-[#71717a] shrink-0 flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" />
                        {item.timestamp}
                      </span>
                    </div>
                    <p className="text-xs text-[#52525b] mt-1 leading-relaxed break-words">{item.message}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-[#e4e4e7] bg-white text-[11px] font-mono text-[#71717a] text-center shrink-0">
            Push alerts connected to active register fleet • Port 3000
          </div>
        </div>
      </div>
    </div>
  );
}
