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
        return { title: "Inventory Stock Control", subtitle: "Product balances, stock valuation & inventory levels" };
      case "products":
        return { title: "Products Master Catalog", subtitle: "150 Household goods, EAN-13 barcodes & pricing in Naira (₦)" };
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
    <div className="min-h-screen bg-[#fbfbf5] text-black flex font-sans selection:bg-[#c1fbd4] selection:text-black">
      {/* DESKTOP SIDEBAR - SLIM, EDITORIAL, REFINED */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-[#e4e4e7] h-screen sticky top-0 shrink-0 z-30 select-none">
        {/* Brand Emblem */}
        <div className="p-5 pb-4 border-b border-[#e4e4e7] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center text-white shadow-xs shrink-0">
              <Zap className="w-4 h-4 fill-current" />
            </div>
            <div className="min-w-0">
              <div className="font-semibold text-sm tracking-tight text-black flex items-center gap-1.5">
                <span className="truncate">NEIL SUPERMARKET SOFTWARE</span>
                <span className="text-[10px] font-mono font-medium bg-[#fbfbf5] text-[#52525b] px-2 py-0.5 rounded-full border border-[#e4e4e7] shrink-0">
                  OPS
                </span>
              </div>
              <div className="text-[10px] font-mono text-[#a1a1aa] truncate">Supermarket OS v2.4</div>
            </div>
          </div>
        </div>

        {/* Navigation Items List */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-5">
          <div>
            <div className="px-3 pb-2 text-[10px] font-mono uppercase tracking-widest text-[#a1a1aa] font-medium">
              Operations
            </div>
            <nav className="space-y-1">
              {NAV_ITEMS.slice(0, 5).map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as NavTabKey)}
                    className={`w-full px-3.5 py-2.5 rounded-full text-left flex items-center justify-between text-xs font-medium transition-all cursor-pointer relative ${
                      isActive
                        ? "bg-black text-white shadow-sm font-semibold"
                        : "text-[#52525b] hover:text-black hover:bg-[#f4f4ec]"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-[#71717a]"}`} />
                      <span>{item.label}</span>
                    </div>

                    {"badge" in item && (
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-semibold ${
                          isActive
                            ? "bg-white/20 text-white"
                            : item.id === "pos"
                            ? "bg-[#c1fbd4] text-black border border-[#a1f3be]"
                            : "bg-[#e4e4e7] text-black"
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
            <div className="px-3 pb-2 text-[10px] font-mono uppercase tracking-widest text-[#a1a1aa] font-medium">
              Management
            </div>
            <nav className="space-y-1">
              {NAV_ITEMS.slice(5).map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as NavTabKey)}
                    className={`w-full px-3.5 py-2.5 rounded-full text-left flex items-center justify-between text-xs font-medium transition-all cursor-pointer ${
                      isActive
                        ? "bg-black text-white shadow-sm font-semibold"
                        : "text-[#52525b] hover:text-black hover:bg-[#f4f4ec]"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-[#71717a]"}`} />
                      <span>{item.label}</span>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Sidebar Footer: Active Till Operator Card */}
        <div className="p-3 border-t border-[#e4e4e7] bg-[#fbfbf5] shrink-0">
          <div className="p-3 bg-white border border-[#e4e4e7] rounded-xl card-stack-shadow space-y-2.5">
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="text-[#71717a]">Till Station:</span>
              <button
                onClick={() => setIsShiftModalOpen(true)}
                className="font-semibold text-black hover:underline cursor-pointer shrink-0"
              >
                Machine 0{currentUser?.machineId || 1}
              </button>
            </div>

            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-6 h-6 rounded-full bg-black text-white text-[10px] font-bold flex items-center justify-center uppercase shrink-0">
                  {currentUser?.username?.[0] || "A"}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-black uppercase truncate">
                    {currentUser?.username || "Admin"}
                  </div>
                  <div className="text-[10px] text-[#52525b] font-mono truncate flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
                    <span>On Duty</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setIsLoginModalOpen(true)}
                title="Switch cashier account"
                className="p-1.5 rounded-full text-[#71717a] hover:text-black hover:bg-[#f4f4ec] cursor-pointer shrink-0"
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
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 max-w-full flex">
            <div className="w-72 bg-white border-r border-[#e4e4e7] shadow-2xl flex flex-col p-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#e4e4e7]">
                <div className="font-semibold text-sm text-black tracking-tight truncate">NEIL SUPERMARKET SOFTWARE</div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1 rounded-full text-[#71717a] hover:text-black cursor-pointer"
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
                      className={`w-full px-3.5 py-2.5 rounded-full text-left flex items-center gap-2.5 text-xs font-medium cursor-pointer ${
                        isActive ? "bg-black text-white font-semibold" : "text-[#52525b] hover:bg-[#f4f4ec]"
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
        <header className="h-16 bg-white border-b border-[#e4e4e7] px-4 sm:px-8 flex items-center justify-between gap-4 sticky top-0 z-20 shrink-0">
          {/* Mobile hamburger + Breadcrumbs */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-full border border-[#e4e4e7] text-[#52525b] hover:bg-[#fbfbf5] cursor-pointer shrink-0"
            >
              <Menu className="w-4 h-4" />
            </button>

            <div className="min-w-0">
              <div className="text-sm sm:text-base font-semibold text-black tracking-tight leading-tight truncate">
                {pageMeta.title}
              </div>
              <div className="text-[11px] text-[#71717a] hidden sm:block font-mono truncate">
                {pageMeta.subtitle}
              </div>
            </div>
          </div>

          {/* Right Header Controls: Search trigger, Quick POS, Audio, Notifications, User */}
          <div className="flex items-center gap-2 font-sans shrink-0">
            {/* Command Palette Trigger */}
            <button
              onClick={() => setIsCommandPaletteOpen(true)}
              className="hidden md:flex items-center gap-3 px-3.5 py-1.5 bg-[#fbfbf5] hover:bg-[#f4f4ec] border border-[#e4e4e7] rounded-full text-xs text-[#71717a] transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5 text-[#a1a1aa] group-hover:text-black" />
                <span className="text-[#52525b] font-sans">Search products, commands...</span>
              </div>
              <kbd className="text-[10px] font-mono bg-white border border-[#e4e4e7] px-1.5 py-0.5 rounded-full text-[#71717a]">
                ⌘K
              </kbd>
            </button>

            {/* Quick POS Shortcut - Signature Aloe Pill */}
            {activeTab !== "pos" && (
              <button
                onClick={() => setActiveTab("pos")}
                className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 bg-[#c1fbd4] hover:bg-[#aaf5c2] text-black border border-[#a8f2c2] rounded-full text-xs font-semibold transition-colors cursor-pointer btn-tactile"
              >
                <Zap className="w-3 h-3 fill-current" />
                <span>POS Till</span>
              </button>
            )}

            {/* Audio Toggle */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={`Barcode audio beep is ${soundEnabled ? "Enabled" : "Muted"}`}
              className="p-2 rounded-full text-[#52525b] hover:text-black hover:bg-[#f4f4ec] transition-colors cursor-pointer"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-[#a1a1aa]" />}
            </button>

            {/* Notifications Trigger */}
            <button
              onClick={() => setIsNotificationsOpen(true)}
              className="p-2 rounded-full text-[#52525b] hover:text-black hover:bg-[#f4f4ec] transition-colors relative cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-black ring-2 ring-white" />
              )}
            </button>

            {/* Shift Modal Trigger Chip */}
            <button
              onClick={() => setIsShiftModalOpen(true)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-[#fbfbf5] hover:bg-[#f4f4ec] border border-[#e4e4e7] rounded-full text-xs font-mono text-black cursor-pointer"
            >
              <Clock className="w-3 h-3 text-[#a1a1aa]" />
              <span className="font-semibold">Till 0{currentUser?.machineId || 1}</span>
            </button>

            {/* User Profile Pill */}
            <button
              onClick={() => setIsLoginModalOpen(true)}
              className="flex items-center gap-2 p-1 px-2 rounded-full hover:bg-[#f4f4ec] border border-transparent hover:border-[#e4e4e7] transition-colors cursor-pointer"
            >
              <div className="w-6 h-6 rounded-full bg-black text-white font-bold text-[10px] flex items-center justify-center uppercase">
                {currentUser?.username?.[0] || "A"}
              </div>
              <span className="hidden sm:inline text-xs font-semibold text-black uppercase">
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
        <footer className="w-full bg-white border-t border-[#e4e4e7] py-3 px-4 sm:px-8 text-[11px] font-mono text-[#71717a]">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-black font-semibold tracking-tight">
                NEIL SUPERMARKET SOFTWARE
              </span>
              <span className="text-[#e4e4e7]">|</span>
              <span>SQLITE EMBEDDED ENGINE</span>
              <span className="text-[#e4e4e7]">|</span>
              <span className="text-black font-medium">CURRENCY: NGN (₦)</span>
            </div>

            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#c1fbd4] border border-[#10b981] inline-block" />
                <span>FLEET: 4 TILLS ONLINE</span>
              </span>
              <span className="text-[#e4e4e7]">|</span>
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
