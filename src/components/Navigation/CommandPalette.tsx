"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  LayoutDashboard,
  Boxes,
  Package,
  ShoppingCart,
  Receipt,
  Truck,
  Users,
  UserCheck,
  BarChart3,
  Settings,
  ArrowRight,
} from "lucide-react";
import { Product } from "@/types/Entities";
import { formatNaira } from "@/utils/formatters";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: string) => void;
  products: Product[];
  onSelectProduct?: (product: Product) => void;
}

export default function CommandPalette({
  isOpen,
  onClose,
  onNavigate,
  products,
  onSelectProduct,
}: CommandPaletteProps) {
  const [query, setQuery] = useState("");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // Open
        }
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const NAV_ITEMS = [
    { id: "dashboard", label: "Dashboard Overview", icon: LayoutDashboard, category: "Navigation" },
    { id: "pos", label: "POS Terminal Register (Fast Checkout)", icon: ShoppingCart, category: "Navigation" },
    { id: "inventory", label: "Inventory Stock Control", icon: Boxes, category: "Navigation" },
    { id: "products", label: "Product Catalog", icon: Package, category: "Navigation" },
    { id: "orders", label: "Sales & Orders Ledger", icon: Receipt, category: "Navigation" },
    { id: "suppliers", label: "FMCG Suppliers Directory", icon: Truck, category: "Navigation" },
    { id: "customers", label: "Customer Loyalty Directory", icon: Users, category: "Navigation" },
    { id: "staff", label: "Staff & Register Tills", icon: UserCheck, category: "Navigation" },
    { id: "reports", label: "Reports & Financial Analytics", icon: BarChart3, category: "Navigation" },
    { id: "settings", label: "System & Terminal Settings", icon: Settings, category: "Navigation" },
  ];

  const filteredNav = NAV_ITEMS.filter((item) =>
    item.label.toLowerCase().includes(query.toLowerCase())
  );

  const filteredProducts = query.trim()
    ? products
        .filter(
          (p) =>
            p.name.toLowerCase().includes(query.toLowerCase()) ||
            p.barcode.includes(query) ||
            p.code.toLowerCase().includes(query.toLowerCase())
        )
        .slice(0, 6)
    : [];

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-start justify-center pt-20 p-4 font-sans text-black">
      <div
        className="fixed inset-0"
        onClick={onClose}
      />
      <div className="relative bg-white border border-[#e4e4e7] rounded-xl w-full max-w-xl card-stack-shadow overflow-hidden z-10 flex flex-col max-h-[75vh]">
        {/* Search Input Bar */}
        <div className="flex items-center px-5 py-4 border-b border-[#e4e4e7] gap-3 shrink-0">
          <Search className="w-4 h-4 text-[#a1a1aa] shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command, page, product name, or barcode..."
            className="w-full text-sm text-black placeholder:text-[#a1a1aa] bg-transparent focus:outline-none min-w-0"
            autoFocus
          />
          <kbd className="hidden sm:inline-block px-2.5 py-0.5 text-[10px] font-mono text-[#71717a] bg-[#fbfbf5] border border-[#e4e4e7] rounded-full shrink-0">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-3 text-xs">
          {filteredNav.length > 0 && (
            <div>
              <div className="px-3 py-1 text-[10px] font-mono uppercase tracking-wider text-[#71717a] font-semibold">
                Pages & Workspaces
              </div>
              <div className="space-y-1 mt-1">
                {filteredNav.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onNavigate(item.id);
                        onClose();
                      }}
                      className="w-full px-3.5 py-2.5 rounded-full text-left flex items-center justify-between text-[#52525b] hover:text-black hover:bg-[#fbfbf5] transition-colors group cursor-pointer gap-2"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="w-8 h-8 rounded-full bg-[#fbfbf5] group-hover:bg-[#c1fbd4] group-hover:text-black flex items-center justify-center transition-colors shrink-0">
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <span className="font-medium truncate">{item.label}</span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-[#d4d4d8] group-hover:text-black group-hover:translate-x-0.5 transition-all shrink-0" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {filteredProducts.length > 0 && (
            <div>
              <div className="px-3 py-1 text-[10px] font-mono uppercase tracking-wider text-[#71717a] font-semibold">
                Matching Inventory Products ({filteredProducts.length})
              </div>
              <div className="space-y-1 mt-1">
                {filteredProducts.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      if (onSelectProduct) onSelectProduct(p);
                      onClose();
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl text-left flex items-center justify-between text-[#52525b] hover:text-black hover:bg-[#fbfbf5] transition-colors group cursor-pointer gap-2"
                  >
                    <div className="min-w-0 flex-1 pr-2">
                      <div className="font-semibold text-black truncate">
                        {p.name}
                      </div>
                      <div className="text-[11px] font-mono text-[#a1a1aa] flex items-center gap-2 mt-0.5 truncate">
                        <span className="shrink-0">{p.code}</span>
                        <span className="shrink-0">•</span>
                        <span className="shrink-0">{p.barcode}</span>
                        <span className="shrink-0">•</span>
                        <span className="text-[#52525b] truncate">{p.category}</span>
                      </div>
                    </div>
                    <div className="text-right font-mono font-bold text-black shrink-0 tabular-nums">
                      {formatNaira(p.price)}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {filteredNav.length === 0 && filteredProducts.length === 0 && (
            <div className="py-12 text-center text-[#a1a1aa] font-mono text-xs">
              No matching commands or products found for &quot;{query}&quot;.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-2.5 bg-[#fbfbf5] border-t border-[#e4e4e7] flex items-center justify-between text-[11px] font-mono text-[#71717a] shrink-0">
          <span>Navigate with <strong>↑</strong> <strong>↓</strong></span>
          <span>Select with <strong>↵ Enter</strong></span>
        </div>
      </div>
    </div>
  );
}
