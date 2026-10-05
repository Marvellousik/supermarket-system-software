"use client";

import React, { useState } from "react";
import {
  LayoutDashboard,
  ShoppingCart,
  Boxes,
  Package,
  Receipt,
  Truck,
  Users,
  UserCheck,
  BarChart3,
  Settings,
  Search,
  Bell,
  Volume2,
  VolumeX,
  Menu,
  X,
  ChevronRight,
  Sparkles,
  Zap,
  Clock,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Product, NotificationItem } from "@/types/Entities";
import CommandPalette from "@/components/Navigation/CommandPalette";
import NotificationsDrawer from "@/components/Navigation/NotificationsDrawer";
import LoginModal from "@/components/Auth/LoginModal";
import ShiftModal from "@/components/Auth/ShiftModal";
import { RECENT_NOTIFICATIONS } from "@/data/analytics";

export type NavTabKey =
  | "dashboard"
  | "pos"
  | "inventory"
  | "products"
  | "orders"
  | "suppliers"
  | "customers"
  | "staff"
  | "reports"
  | "settings";

interface AppShellProps {
  activeTab: NavTabKey;
  setActiveTab: (tab: NavTabKey) => void;
  products: Product[];
  onSelectProduct?: (product: Product) => void;
  cartCount?: number;
  children: React.ReactNode;
}

export default function AppShell({
  activeTab,
  setActiveTab,
  products,
  onSelectProduct,
  cartCount = 0,
  children,
}: AppShellProps) {
  const { currentUser, activeShift, soundEnabled, setSoundEnabled } = useAuth();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>(RECENT_NOTIFICATIONS);

  const NAV_ITEMS = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "pos", label: "POS Register", icon: ShoppingCart, badge: cartCount > 0 ? cartCount : "FAST" },
    { id: "inventory", label: "Inventory", icon: Boxes },
    { id: "products", label: "Products", icon: Package },
    { id: "orders", label: "Sales & Orders", icon: Receipt },
    { id: "suppliers", label: "Suppliers", icon: Truck },
    { id: "customers", label: "Customers", icon: Users },
    { id: "staff", label: "Staff & Tills", icon: UserCheck },
    { id: "reports", label: "Reports", icon: BarChart3 },
    { id: "settings", label: "Settings", icon: Settings },
  ] as const;

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getPageTitle = (tab: NavTabKey) => {
    switch (tab) {
      case "dashboard":
        return { title: "Operations Dashboard", subtitle: "Real-time store metrics & sales velocity" };
      case "pos":
        return { title: "Point of Sale Register", subtitle: "High-speed barcode scanner & receipt printer" };
      case "inventory":
        return { title: "Inventory Stock Control", subtitle: "SKU balances, health index & reorder thresholds" };
      case "products":
        return { title: "Products Master Registry", subtitle: "150 Household goods, EAN-13 barcodes & pricing" };
      case "orders":
        return { title: "Sales & Order Settlement", subtitle: "Reconciled receipt ledger & reprints" };
      case "suppliers":
        return { title: "FMCG Supplier Hub", subtitle: "Vendor fulfillment rates & purchase orders" };
      case "customers":
        return { title: "Customer Loyalty CRM", subtitle: "Loyalty tiers, points & lifetime spend" };
      case "staff":
        return { title: "Staff & Register Fleet", subtitle: "Physical till management & shift tracking" };
      case "reports":
        return { title: "Financial & Audit Reports", subtitle: "Category margins & executive audit PDFs" };
      case "settings":
        return { title: "System Preferences", subtitle: "VAT parameters, store profile & SQLite engine" };
    }
  };

  const pageMeta = getPageTitle(activeTab);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* DESKTOP SIDEBAR - SLIM, ATHLETIC, REFINED */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-slate-200/90 h-screen sticky top-0 shrink-0 z-30 select-none">
        {/* Brand Emblem */}
        <div className="p-5 pb-4 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-xs shrink-0">
              <Zap className="w-4 h-4 fill-current" />
            </div>
            <div className="min-w-0">
              <div className="font-extrabold text-sm tracking-tight text-slate-900 flex items-center gap-1.5">
                <span className="truncate">APEX RETAIL</span>
                <span className="text-[9px] font-mono font-bold bg-slate-100 text-slate-600 px-1 py-0.2 rounded border border-slate-200 shrink-0">
                  OPS
                </span>
              </div>
              <div className="text-[10px] font-mono text-slate-400 truncate">Supermarket OS v2.4</div>
            </div>
          </div>
        </div>

        {/* Navigation Items List */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-6">
          <div>
            <div className="px-3 pb-1.5 text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
              Operations
            </div>
            <nav className="space-y-0.5">
              {NAV_ITEMS.slice(0, 5).map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as NavTabKey)}
                    className={`w-full px-3 py-2 rounded-xl text-left flex items-center justify-between text-xs font-semibold transition-all cursor-pointer relative ${
                      isActive
                        ? "bg-emerald-600 text-white shadow-xs font-bold"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                      <span>{item.label}</span>
                    </div>

                    {"badge" in item && (
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-bold ${
                          isActive
                            ? "bg-white/20 text-white"
                            : item.id === "pos"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-emerald-50 text-emerald-800 border border-emerald-200"
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          <div>
            <div className="px-3 pb-1.5 text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
              Management
            </div>
            <nav className="space-y-0.5">
              {NAV_ITEMS.slice(5).map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as NavTabKey)}
                    className={`w-full px-3 py-2 rounded-xl text-left flex items-center justify-between text-xs font-semibold transition-all cursor-pointer ${
                      isActive
                        ? "bg-emerald-600 text-white shadow-xs font-bold"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                      <span>{item.label}</span>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Sidebar Footer: Active Till Operator Card */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/70 shrink-0">
          <div className="p-2.5 bg-white border border-slate-200/80 rounded-xl shadow-2xs space-y-2">
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="text-slate-400">Till Station:</span>
              <button
                onClick={() => setIsShiftModalOpen(true)}
                className="font-bold text-emerald-700 hover:underline cursor-pointer shrink-0"
              >
                Machine 0{currentUser?.machineId || 1}
              </button>
            </div>

            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-6 h-6 rounded-full bg-slate-900 text-white text-[10px] font-bold flex items-center justify-center uppercase shrink-0">
                  {currentUser?.username?.[0] || "A"}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-900 uppercase truncate">
                    {currentUser?.username || "Admin"}
                  </div>
                  <div className="text-[10px] text-emerald-600 font-mono font-medium truncate">On Duty (Online)</div>
                </div>
              </div>

              <button
                onClick={() => setIsLoginModalOpen(true)}
                title="Switch cashier account"
                className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer shrink-0"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* MOBILE DRAWER */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 overflow-hidden font-sans">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 max-w-full flex">
            <div className="w-72 bg-white border-r border-slate-200 shadow-2xl flex flex-col p-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="font-extrabold text-sm text-slate-900">APEX RETAIL</div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="flex-1 overflow-y-auto py-3 space-y-1">
                {NAV_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id as NavTabKey);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full px-3 py-2.5 rounded-xl text-left flex items-center gap-2.5 text-xs font-semibold cursor-pointer ${
                        isActive ? "bg-emerald-600 text-white font-bold" : "text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* MAIN WORKSPACE WRAPPER */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* TOP CONTEXTUAL BAR */}
        <header className="h-16 bg-white border-b border-slate-200/90 px-4 sm:px-8 flex items-center justify-between gap-4 sticky top-0 z-20 shadow-2xs shrink-0">
          {/* Mobile hamburger + Breadcrumbs */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 cursor-pointer shrink-0"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="min-w-0">
              <div className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight leading-tight truncate">
                {pageMeta.title}
              </div>
              <div className="text-[11px] text-slate-400 hidden sm:block font-mono truncate">
                {pageMeta.subtitle}
              </div>
            </div>
          </div>

          {/* Right Header Controls: Search trigger, Quick POS, Audio, Notifications, User */}
          <div className="flex items-center gap-2.5 font-sans shrink-0">
            {/* Command Palette Trigger */}
            <button
              onClick={() => setIsCommandPaletteOpen(true)}
              className="hidden md:flex items-center gap-3 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-400 transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600" />
                <span className="text-slate-500 font-sans">Search products, commands...</span>
              </div>
              <kbd className="text-[10px] font-mono bg-white border border-slate-200 px-1.5 py-0.2 rounded text-slate-500 shadow-2xs">
                ⌘K
              </kbd>
            </button>

            {/* Quick POS Shortcut */}
            {activeTab !== "pos" && (
              <button
                onClick={() => setActiveTab("pos")}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold transition-colors cursor-pointer btn-tactile"
              >
                <Zap className="w-3 h-3 fill-current" />
                <span>POS Till</span>
              </button>
            )}

            {/* Audio Toggle */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={`Barcode audio beep is ${soundEnabled ? "Enabled" : "Muted"}`}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
            </button>

            {/* Notifications Trigger */}
            <button
              onClick={() => setIsNotificationsOpen(true)}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors relative cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-600 ring-2 ring-white" />
              )}
            </button>

            {/* Shift Modal Trigger Chip */}
            <button
              onClick={() => setIsShiftModalOpen(true)}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-mono text-slate-700 cursor-pointer"
            >
              <Clock className="w-3 h-3 text-slate-400" />
              <span className="font-bold text-emerald-700">Till 0{currentUser?.machineId || 1}</span>
            </button>

            {/* User Profile Pill */}
            <button
              onClick={() => setIsLoginModalOpen(true)}
              className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <div className="w-7 h-7 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center uppercase">
                {currentUser?.username?.[0] || "A"}
              </div>
              <span className="hidden sm:inline text-xs font-bold text-slate-800 uppercase">
                {currentUser?.username || "Admin"}
              </span>
            </button>
          </div>
        </header>

        {/* MAIN WORKSPACE VIEW CONTAINER */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto overflow-y-auto min-w-0">
          {children}
        </main>

        {/* FOOTER AUDIT STATUS */}
        <footer className="w-full bg-white border-t border-slate-200/90 py-2.5 px-4 sm:px-8 text-[11px] font-mono text-slate-500">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-slate-900 font-bold tracking-tight">
                SHOPPING CENTER SUPERMARKET
              </span>
              <span className="text-slate-300">|</span>
              <span>SQLITE EMBEDDED ENGINE</span>
              <span className="text-slate-300">|</span>
              <span className="text-slate-700 font-semibold">CURRENCY: NGN (₦)</span>
            </div>

            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                FLEET: 4 TILLS ONLINE
              </span>
              <span className="text-slate-300">|</span>
              <span>DIGITAL RECEIPTS: PDF PERSISTENCE</span>
            </div>
          </div>
        </footer>
      </div>

      {/* Global Modals & Drawers */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onNavigate={(tab) => setActiveTab(tab as NavTabKey)}
        products={products}
        onSelectProduct={onSelectProduct}
      />

      <NotificationsDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        onMarkAllRead={handleMarkAllRead}
      />

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />

      <ShiftModal
        isOpen={isShiftModalOpen}
        onClose={() => setIsShiftModalOpen(false)}
      />
    </div>
  );
}
