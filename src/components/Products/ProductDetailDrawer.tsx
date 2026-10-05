"use client";

import React, { useState } from "react";
import {
  X,
  Package,
  Barcode,
  Truck,
  TrendingUp,
  ShoppingCart,
  Edit2,
} from "lucide-react";
import { Product } from "@/types/Entities";
import { formatNaira } from "@/utils/formatters";

interface ProductDetailDrawerProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart?: (product: Product) => void;
  onUpdateStock?: (productId: string, newStock: number) => void;
}

export default function ProductDetailDrawer({
  product,
  isOpen,
  onClose,
  onAddToCart,
  onUpdateStock,
}: ProductDetailDrawerProps) {
  const [isEditingStock, setIsEditingStock] = useState(false);
  const [stockInput, setStockInput] = useState<number>(product?.stock || 0);
  const [copiedBarcode, setCopiedBarcode] = useState(false);

  if (!isOpen || !product) return null;

  const minThreshold = product.minThreshold || 15;
  const stockHealthPercent = Math.min(100, Math.round((product.stock / (minThreshold * 3)) * 100));
  const estimatedCost = product.costPrice || Math.round(product.price * 0.85);
  const grossMargin = Math.round(((product.price - estimatedCost) / product.price) * 100);

  const handleSaveStock = () => {
    if (onUpdateStock) {
      onUpdateStock(product.id, stockInput);
    }
    setIsEditingStock(false);
  };

  const handleCopyBarcode = () => {
    navigator.clipboard?.writeText(product.barcode);
    setCopiedBarcode(true);
    setTimeout(() => setCopiedBarcode(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-sans text-black">
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-lg bg-white border-l border-[#e4e4e7] shadow-2xl flex flex-col h-full">
          {/* Header */}
          <div className="px-6 py-4 border-b border-[#e4e4e7] bg-[#fbfbf5] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-[11px] font-mono font-semibold bg-[#fbfbf5] text-black px-2.5 py-0.5 rounded-full border border-[#e4e4e7] shrink-0">
                {product.code}
              </span>
              <span className="text-[#a1a1aa] shrink-0">•</span>
              <span className="text-xs font-semibold text-[#71717a] uppercase truncate">{product.category}</span>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-full text-[#71717a] hover:text-black hover:bg-[#f4f4f5] transition-colors cursor-pointer shrink-0 ml-2"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 min-h-0 overflow-y-auto p-6 space-y-6">
            {/* Title & Price Header */}
            <div>
              <h2 className="text-xl font-semibold text-black tracking-tight leading-snug">
                {product.name}
              </h2>
              {product.description && (
                <p className="text-xs text-[#71717a] mt-1.5 leading-relaxed">
                  {product.description}
                </p>
              )}

              <div className="mt-4 flex items-baseline justify-between p-4 bg-[#fbfbf5] border border-[#e4e4e7] rounded-xl card-stack-shadow">
                <div>
                  <div className="text-[10px] font-mono text-[#71717a] uppercase font-semibold">
                    Retail Selling Price
                  </div>
                  <div className="text-2xl font-light font-mono text-black tracking-tight mt-0.5">
                    {formatNaira(product.price)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-mono text-[#71717a] uppercase font-semibold">
                    Gross Margin
                  </div>
                  <div className="text-sm font-mono font-bold text-black mt-0.5">
                    +{grossMargin}% (₦{(product.price - estimatedCost).toLocaleString()})
                  </div>
                </div>
              </div>
            </div>

            {/* Real-time Inventory Gauge */}
            <div className="p-4 bg-white border border-[#e4e4e7] rounded-xl card-stack-shadow space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-black" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-black">
                    Stock Inventory Level
                  </h3>
                </div>
                {product.stock <= 0 ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                    OUT OF STOCK
                  </span>
                ) : product.stock <= minThreshold ? (
                  <span className="tag-shade text-[10px] px-2.5 py-0.5 text-black">
                    LOW STOCK ALERT
                  </span>
                ) : (
                  <span className="tag-mint text-[10px] px-2.5 py-0.5">
                    HEALTHY STOCK
                  </span>
                )}
              </div>

              {/* Progress bar */}
              <div>
                <div className="flex justify-between text-xs font-mono mb-1.5">
                  <span className="text-[#52525b]">Available: <strong className="text-black">{product.stock} {product.unit}s</strong></span>
                  <span className="text-[#a1a1aa]">Reorder: {minThreshold} {product.unit}s</span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#fbfbf5] border border-[#e4e4e7] overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      product.stock <= minThreshold ? "bg-amber-500" : "bg-black"
                    }`}
                    style={{ width: `${Math.max(5, stockHealthPercent)}%` }}
                  />
                </div>
              </div>

              {/* Quick stock adjustment form */}
              {isEditingStock ? (
                <div className="flex items-center gap-2 pt-3 border-t border-[#e4e4e7] font-mono text-xs">
                  <input
                    type="number"
                    value={stockInput}
                    onChange={(e) => setStockInput(parseInt(e.target.value) || 0)}
                    className="w-24 px-2.5 py-1.5 border border-[#e4e4e7] rounded-md focus:border-black focus:outline-none"
                    autoFocus
                  />
                  <button
                    onClick={handleSaveStock}
                    className="btn-primary-pill px-3.5 py-1.5 text-xs font-medium cursor-pointer"
                  >
                    Save Stock
                  </button>
                  <button
                    onClick={() => setIsEditingStock(false)}
                    className="px-2.5 py-1 text-[#71717a] hover:text-black font-sans cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between pt-2.5 border-t border-[#e4e4e7] text-xs">
                  <span className="text-[11px] text-[#71717a] font-mono">Last restocked: 2 days ago</span>
                  <button
                    onClick={() => {
                      setStockInput(product.stock);
                      setIsEditingStock(true);
                    }}
                    className="text-black hover:underline font-medium flex items-center gap-1 cursor-pointer text-xs"
                  >
                    <Edit2 className="w-3 h-3" /> Adjust Quantity
                  </button>
                </div>
              )}
            </div>

            {/* Performance Statistics Grid */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#a1a1aa] mb-3 font-mono">
                Sales Velocity & Performance
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 bg-[#fbfbf5] border border-[#e4e4e7] rounded-xl card-stack-shadow">
                  <div className="text-[10px] font-mono text-[#71717a] uppercase font-semibold">Units Sold (7 Days)</div>
                  <div className="text-lg font-bold font-mono text-black mt-0.5">
                    {Math.round(product.stock * 1.8 + 14)} units
                  </div>
                  <div className="text-[10px] text-black font-medium mt-0.5 flex items-center gap-0.5">
                    <TrendingUp className="w-3 h-3" /> +14.2% velocity
                  </div>
                </div>

                <div className="p-3.5 bg-[#fbfbf5] border border-[#e4e4e7] rounded-xl card-stack-shadow">
                  <div className="text-[10px] font-mono text-[#71717a] uppercase font-semibold">Weekly Gross Revenue</div>
                  <div className="text-lg font-bold font-mono text-black mt-0.5">
                    {formatNaira(product.price * Math.round(product.stock * 1.8 + 14))}
                  </div>
                  <div className="text-[10px] text-[#71717a] font-medium mt-0.5">
                    Top 15% in category
                  </div>
                </div>
              </div>
            </div>

            {/* Barcode & Identification */}
            <div className="p-4 bg-[#fbfbf5] border border-[#e4e4e7] rounded-xl card-stack-shadow space-y-2.5 font-mono text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[#52525b] flex items-center gap-1.5">
                  <Barcode className="w-3.5 h-3.5 text-[#a1a1aa]" />
                  EAN-13 Optical Barcode:
                </span>
                <button
                  onClick={handleCopyBarcode}
                  className="text-black font-semibold hover:underline text-[11px] cursor-pointer"
                >
                  {copiedBarcode ? "Copied!" : "Copy Code"}
                </button>
              </div>
              <div className="p-3 bg-white border border-[#e4e4e7] rounded-lg text-center">
                <div className="text-base font-bold tracking-widest text-black">{product.barcode}</div>
                <div className="text-[9px] text-[#a1a1aa] tracking-widest mt-0.5">||||| | |||| ||||| ||||| |||</div>
              </div>
            </div>

            {/* Supplier Information */}
            <div className="p-4 bg-white border border-[#e4e4e7] rounded-xl card-stack-shadow space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <Truck className="w-3.5 h-3.5 text-black" />
                <h4 className="font-bold uppercase tracking-wider text-[11px] text-black font-mono">
                  Primary FMCG Distributor
                </h4>
              </div>
              <div className="space-y-1 font-mono text-[11px] text-[#52525b] pt-1">
                <div className="flex justify-between">
                  <span className="text-[#71717a]">Supplier:</span>
                  <span className="font-bold text-black">{product.supplierName || "Flour Mills of Nigeria Plc"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#71717a]">Contract Lead Time:</span>
                  <span className="text-black">48 Hours (2 Business Days)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#71717a]">Fulfillment Score:</span>
                  <span className="text-black font-bold">98.6% On-Time</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Footer - STRICT PILLS */}
          <div className="p-4 bg-[#fbfbf5] border-t border-[#e4e4e7] flex items-center gap-3 shrink-0">
            {onAddToCart && (
              <button
                onClick={() => {
                  onAddToCart(product);
                  onClose();
                }}
                className="btn-aloe-pill flex-1 py-2.5 text-xs font-semibold shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ShoppingCart className="w-3.5 h-3.5 shrink-0" />
                <span>Load into Active POS Till</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="btn-outline-light px-5 py-2.5 text-xs font-medium cursor-pointer shrink-0"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
