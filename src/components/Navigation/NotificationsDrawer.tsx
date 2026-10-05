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
        className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white border-l border-slate-200 shadow-2xl flex flex-col h-full">
          {/* Header */}
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700 shrink-0">
                <Bell className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-slate-900 truncate">System Notifications</h3>
                <p className="text-[11px] text-slate-500 font-mono truncate">Store alerts & telemetry</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer shrink-0 ml-2"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Subheader action */}
          <div className="px-5 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-xs shrink-0">
            <span className="text-slate-500 font-mono text-[11px]">
              {notifications.filter((n) => !n.read).length} unread notices
            </span>
            <button
              onClick={onMarkAllRead}
              className="text-emerald-700 hover:text-emerald-800 font-medium text-xs cursor-pointer font-semibold shrink-0"
            >
              Mark all as read
            </button>
          </div>

          {/* Notification List */}
          <div className="flex-1 min-h-0 overflow-y-auto divide-y divide-slate-100 p-2">
            {notifications.map((item) => (
              <div
                key={item.id}
                className={`p-3.5 rounded-xl transition-colors ${
                  item.read ? "bg-white hover:bg-slate-50" : "bg-emerald-50/50 hover:bg-emerald-50/80"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 shrink-0">{getIcon(item.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2 min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 truncate">{item.title}</h4>
                      <span className="text-[10px] font-mono text-slate-400 shrink-0 flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" />
                        {item.timestamp}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed break-words">{item.message}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-100 bg-slate-50 text-[11px] font-mono text-slate-500 text-center shrink-0">
            Push alerts connected to active register fleet • Port 3000
          </div>
        </div>
      </div>
    </div>
  );
}
