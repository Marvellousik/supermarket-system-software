"use client";

import React, { useState } from "react";
import {
  X,
  Package,
  Barcode,
  Truck,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Check,
  Tag,
  ShieldCheck,
  Clock,
  Layers,
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
    <div className="fixed inset-0 z-50 overflow-hidden font-sans">
      <div
        className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-lg bg-white border-l border-slate-200 shadow-2xl flex flex-col h-full">
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-[11px] font-mono font-bold bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200 shrink-0">
                {product.code}
              </span>
              <span className="text-slate-400 shrink-0">•</span>
              <span className="text-xs font-semibold text-slate-500 uppercase truncate">{product.category}</span>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer shrink-0 ml-2"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 min-h-0 overflow-y-auto p-6 space-y-6">
            {/* Title & Price Header */}
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight leading-snug">
                {product.name}
              </h2>
              {product.description && (
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                  {product.description}
                </p>
              )}

              <div className="mt-4 flex items-baseline justify-between p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl">
                <div>
                  <div className="text-[10px] font-mono text-slate-400 uppercase font-semibold">
                    Retail Selling Price
                  </div>
                  <div className="text-2xl font-bold font-mono text-slate-900 tracking-tight">
                    {formatNaira(product.price)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-mono text-slate-400 uppercase font-semibold">
                    Gross Margin
                  </div>
                  <div className="text-sm font-mono font-bold text-emerald-600">
                    +{grossMargin}% (₦{(product.price - estimatedCost).toLocaleString()})
                  </div>
                </div>
              </div>
            </div>

            {/* Real-time Inventory Gauge */}
            <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-emerald-600" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                    Stock Inventory Level
                  </h3>
                </div>
                {product.stock <= 0 ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                    OUT OF STOCK
                  </span>
                ) : product.stock <= minThreshold ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                    LOW STOCK ALERT
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    HEALTHY STOCK
                  </span>
                )}
              </div>

              {/* Progress bar */}
              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-slate-500">Available: <strong className="text-slate-900">{product.stock} {product.unit}s</strong></span>
                  <span className="text-slate-400">Reorder Threshold: {minThreshold} {product.unit}s</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      product.stock <= minThreshold ? "bg-amber-500" : "bg-emerald-500"
                    }`}
                    style={{ width: `${Math.max(5, stockHealthPercent)}%` }}
                  />
                </div>
              </div>

              {/* Quick stock adjustment form */}
              {isEditingStock ? (
                <div className="flex items-center gap-2 pt-2 border-t border-slate-100 font-mono text-xs">
                  <input
                    type="number"
                    value={stockInput}
                    onChange={(e) => setStockInput(parseInt(e.target.value) || 0)}
                    className="w-24 px-2 py-1 border border-slate-300 rounded focus:border-emerald-600 focus:outline-none"
                    autoFocus
                  />
                  <button
                    onClick={handleSaveStock}
                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-sans font-medium cursor-pointer"
                  >
                    Save Stock
                  </button>
                  <button
                    onClick={() => setIsEditingStock(false)}
                    className="px-2 py-1 text-slate-500 hover:text-slate-800 font-sans cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                  <span className="text-[11px] text-slate-500 font-mono">Last restocked: 2 days ago</span>
                  <button
                    onClick={() => {
                      setStockInput(product.stock);
                      setIsEditingStock(true);
                    }}
                    className="text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1 cursor-pointer text-xs"
                  >
                    <Edit2 className="w-3 h-3" /> Adjust Quantity
                  </button>
                </div>
              )}
            </div>

            {/* Performance Statistics Grid */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 font-mono">
                Sales Velocity & Performance
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl">
                  <div className="text-[10px] font-mono text-slate-400 uppercase font-semibold">Units Sold (7 Days)</div>
                  <div className="text-lg font-bold font-mono text-slate-900 mt-0.5">
                    {Math.round(product.stock * 1.8 + 14)} units
                  </div>
                  <div className="text-[10px] text-emerald-600 font-medium mt-0.5 flex items-center gap-0.5">
                    <TrendingUp className="w-3 h-3" /> +14.2% velocity
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl">
                  <div className="text-[10px] font-mono text-slate-400 uppercase font-semibold">Weekly Gross Revenue</div>
                  <div className="text-lg font-bold font-mono text-slate-900 mt-0.5">
                    {formatNaira(product.price * Math.round(product.stock * 1.8 + 14))}
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium mt-0.5">
                    Top 15% in category
                  </div>
                </div>
              </div>
            </div>

            {/* Barcode & Identification */}
            <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl space-y-2.5 font-mono text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <Barcode className="w-3.5 h-3.5 text-slate-400" />
                  EAN-13 Optical Barcode:
                </span>
                <button
                  onClick={handleCopyBarcode}
                  className="text-emerald-600 hover:text-emerald-700 text-[11px] font-medium cursor-pointer"
                >
                  {copiedBarcode ? "Copied!" : "Copy Code"}
                </button>
              </div>
              <div className="p-2.5 bg-white border border-slate-200 rounded-lg text-center">
                <div className="text-base font-bold tracking-widest text-slate-900">{product.barcode}</div>
                <div className="text-[9px] text-slate-400 tracking-widest mt-0.5">||||| | |||| ||||| ||||| |||</div>
              </div>
            </div>

            {/* Supplier Information */}
            <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <Truck className="w-3.5 h-3.5 text-emerald-600" />
                <h4 className="font-bold uppercase tracking-wider text-[11px] text-slate-900 font-mono">
                  Primary FMCG Distributor
                </h4>
              </div>
              <div className="space-y-1 font-mono text-[11px] text-slate-600 pt-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">Supplier:</span>
                  <span className="font-bold text-slate-900">{product.supplierName || "Flour Mills of Nigeria Plc"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Contract Lead Time:</span>
                  <span className="text-slate-800">48 Hours (2 Business Days)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Fulfillment Score:</span>
                  <span className="text-emerald-700 font-bold">98.6% On-Time</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center gap-3 shrink-0">
            {onAddToCart && (
              <button
                onClick={() => {
                  onAddToCart(product);
                  onClose();
                }}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer btn-tactile"
              >
                <ShoppingCart className="w-3.5 h-3.5 shrink-0" />
                <span>Load into Active POS Till</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold rounded-lg text-xs transition-colors cursor-pointer shrink-0"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
