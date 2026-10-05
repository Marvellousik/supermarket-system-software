"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  Filter,
  Plus,
  Download,
  AlertTriangle,
  Package,
  Layers,
  CheckCircle2,
  XCircle,
  Eye,
  ArrowUpDown,
  ShoppingCart,
  ChevronDown,
} from "lucide-react";
import { Product } from "@/types/Entities";
import { CATEGORIES } from "@/data/products";
import { formatNaira } from "@/utils/formatters";
import ProductDetailDrawer from "@/components/Products/ProductDetailDrawer";

interface InventoryViewProps {
  products: Product[];
  onOpenNewProductModal: () => void;
  onAddToCart?: (product: Product) => void;
  onUpdateStock?: (productId: string, newStock: number) => void;
}

export default function InventoryView({
  products,
  onOpenNewProductModal,
  onAddToCart,
  onUpdateStock,
}: InventoryViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<"all" | "in_stock" | "low_stock" | "out_of_stock">("all");
  const [sortBy, setSortBy] = useState<"name" | "price_asc" | "price_desc" | "stock_asc" | "stock_desc">("stock_asc");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Compute inventory KPIs
  const totalStockUnits = useMemo(() => products.reduce((sum, p) => sum + p.stock, 0), [products]);
  const totalInventoryValuation = useMemo(() => products.reduce((sum, p) => sum + p.price * p.stock, 0), [products]);
  const lowStockCount = useMemo(() => products.filter((p) => p.stock > 0 && p.stock <= (p.minThreshold || 15)).length, [products]);
  const outOfStockCount = useMemo(() => products.filter((p) => p.stock <= 0).length, [products]);
  const inStockCount = products.length - lowStockCount - outOfStockCount;

  // Filtered & Sorted products
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        const matchesCategory = selectedCategory === "All" || p.category === selectedCategory;
        const q = searchQuery.toLowerCase().trim();
        const matchesSearch =
          !q ||
          p.name.toLowerCase().includes(q) ||
          p.barcode.includes(q) ||
          p.code.toLowerCase().includes(q) ||
          (p.supplierName && p.supplierName.toLowerCase().includes(q));

        const minThresh = p.minThreshold || 15;
        let matchesStatus = true;
        if (statusFilter === "in_stock") matchesStatus = p.stock > minThresh;
        if (statusFilter === "low_stock") matchesStatus = p.stock > 0 && p.stock <= minThresh;
        if (statusFilter === "out_of_stock") matchesStatus = p.stock <= 0;

        return matchesCategory && matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === "name") return a.name.localeCompare(b.name);
        if (sortBy === "price_asc") return a.price - b.price;
        if (sortBy === "price_desc") return b.price - a.price;
        if (sortBy === "stock_asc") return a.stock - b.stock;
        if (sortBy === "stock_desc") return b.stock - a.stock;
        return 0;
      });
  }, [products, selectedCategory, searchQuery, statusFilter, sortBy]);

  const handleExportCSV = () => {
    const headers = "Code,Name,Category,Stock,Unit,Price (NGN),Supplier,Barcode\n";
    const rows = filteredProducts
      .map(
        (p) =>
          `"${p.code}","${p.name.replace(/"/g, '""')}","${p.category}",${p.stock},"${p.unit}",${p.price},"${p.supplierName || "FMCG Supplier"}","${p.barcode}"`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `inventory-audit-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full space-y-5 font-sans text-slate-800">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200/80">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
            Inventory Stock Control
          </h1>
          <p className="text-sm font-normal text-slate-500 mt-1">
            Real-time SKU balances, reorder safety thresholds & FMCG distributor tracking
          </p>
        </div>

        <div className="flex items-center gap-2 font-sans text-xs">
          <button
            onClick={handleExportCSV}
            className="px-3 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold rounded-lg shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={onOpenNewProductModal}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer btn-tactile"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add New SKU</span>
          </button>
        </div>
      </div>

      {/* KPI Metric Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
        <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-xs">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block">Total SKU Items</span>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1 tracking-tight tabular-nums">{products.length} Products</div>
          <span className="text-[11px] font-normal text-slate-500">{totalStockUnits.toLocaleString()} total units</span>
        </div>

        <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-xs">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block">Stock Valuation</span>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1 tracking-tight tabular-nums">{formatNaira(totalInventoryValuation)}</div>
          <span className="text-[11px] font-semibold text-emerald-800">Assets on floor</span>
        </div>

        <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-xs">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block">Healthy Stock</span>
          <div className="text-2xl sm:text-3xl font-bold text-emerald-700 mt-1 tracking-tight tabular-nums">{inStockCount} SKUs</div>
          <span className="text-[11px] font-normal text-slate-500">Above safety levels</span>
        </div>

        <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-xs">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block">Low Stock Warning</span>
          <div className="text-2xl sm:text-3xl font-bold text-amber-700 mt-1 tracking-tight tabular-nums">{lowStockCount} SKUs</div>
          <span className="text-[11px] font-semibold text-amber-800">Requires reorder</span>
        </div>

        <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-xs col-span-2 sm:col-span-1">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block">Out of Stock</span>
          <div className="text-2xl sm:text-3xl font-bold text-rose-700 mt-1 tracking-tight tabular-nums">{outOfStockCount} SKUs</div>
          <span className="text-[11px] font-semibold text-rose-800">Zero shelf units</span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white border border-slate-200 shadow-xs p-3 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search product, SKU, barcode, supplier..."
              className="w-full bg-slate-50 border border-slate-300 focus:bg-white focus:border-emerald-600 pl-8 pr-3 py-1.5 rounded-lg text-slate-900 placeholder-slate-400 text-xs focus:outline-none transition-colors"
            />
          </div>

          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-50 border border-slate-300 text-slate-700 px-3 py-1.5 rounded-lg text-xs focus:outline-none focus:border-emerald-600 cursor-pointer"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c === "All" ? "All Categories" : c}
              </option>
            ))}
          </select>

          {/* Status Pills */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs font-sans">
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-2.5 py-1 rounded-md cursor-pointer transition-all ${
                statusFilter === "all" ? "bg-white font-bold text-slate-900 shadow-2xs" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              All ({products.length})
            </button>
            <button
              onClick={() => setStatusFilter("in_stock")}
              className={`px-2.5 py-1 rounded-md cursor-pointer transition-all ${
                statusFilter === "in_stock" ? "bg-white font-bold text-emerald-700 shadow-2xs" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              In Stock ({inStockCount})
            </button>
            <button
              onClick={() => setStatusFilter("low_stock")}
              className={`px-2.5 py-1 rounded-md cursor-pointer transition-all ${
                statusFilter === "low_stock" ? "bg-white font-bold text-amber-700 shadow-2xs" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Low Stock ({lowStockCount})
            </button>
            <button
              onClick={() => setStatusFilter("out_of_stock")}
              className={`px-2.5 py-1 rounded-md cursor-pointer transition-all ${
                statusFilter === "out_of_stock" ? "bg-white font-bold text-rose-700 shadow-2xs" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Depleted ({outOfStockCount})
            </button>
          </div>
        </div>

        {/* Sorting */}
        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
          <span>Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-transparent font-sans text-xs text-slate-800 font-semibold focus:outline-none cursor-pointer"
          >
            <option value="stock_asc">Stock: Low to High</option>
            <option value="stock_desc">Stock: High to Low</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="name">Product Name (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Main Inventory Table */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-slate-50/80 text-slate-500 uppercase text-[10px] font-mono border-b border-slate-200 font-bold">
              <tr>
                <th className="py-3 px-4">Product Details</th>
                <th className="py-3 px-3">SKU</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Stock Level</th>
                <th className="py-3 px-3">Selling Price</th>
                <th className="py-3 px-3">Distributor</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.map((p) => {
                const minThresh = p.minThreshold || 15;
                const isOutOfStock = p.stock <= 0;
                const isLowStock = p.stock > 0 && p.stock <= minThresh;
                const barPercent = Math.min(100, Math.round((p.stock / (minThresh * 3)) * 100));

                return (
                  <tr
                    key={p.id}
                    onClick={() => setSelectedProduct(p)}
                    className="hover:bg-slate-50/70 transition-colors cursor-pointer group"
                  >
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-1 max-w-xs sm:max-w-md">
                        {p.name}
                      </div>
                      <div className="text-[11px] font-mono text-slate-400 mt-0.5 flex items-center gap-1.5">
                        <span>Barcode: {p.barcode}</span>
                        <span>•</span>
                        <span>Unit: {p.unit}</span>
                      </div>
                    </td>

                    <td className="py-3 px-3 font-mono font-bold text-slate-700">
                      {p.code}
                    </td>

                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded text-[11px] bg-slate-100 text-slate-700 font-medium">
                        {p.category}
                      </span>
                    </td>

                    <td className="py-3 px-3 font-mono">
                      <div className="flex items-center gap-2">
                        <span className={`font-bold ${isOutOfStock ? "text-rose-600" : isLowStock ? "text-amber-600" : "text-slate-900"}`}>
                          {p.stock}
                        </span>
                        <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              isOutOfStock ? "bg-rose-500" : isLowStock ? "bg-amber-500" : "bg-emerald-500"
                            }`}
                            style={{ width: `${Math.max(8, barPercent)}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3 font-mono font-bold text-slate-900">
                      {formatNaira(p.price)}
                    </td>

                    <td className="py-3 px-3 text-slate-600 text-[11px]">
                      {p.supplierName || "Flour Mills of Nigeria"}
                    </td>

                    <td className="py-3 px-3">
                      {isOutOfStock ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          OUT OF STOCK
                        </span>
                      ) : isLowStock ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          LOW STOCK
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          IN STOCK
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <div
                        className="flex items-center justify-center gap-1.5"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={() => setSelectedProduct(p)}
                          title="Inspect Product Dossier"
                          className="p-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 shadow-2xs transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {onAddToCart && (
                          <button
                            type="button"
                            onClick={() => onAddToCart(p)}
                            title="Add item to POS Till"
                            className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs transition-colors cursor-pointer"
                          >
                            <ShoppingCart className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredProducts.length === 0 && (
          <div className="py-12 text-center text-slate-400 font-mono text-xs">
            <Package className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p>No inventory products match criteria.</p>
          </div>
        )}

        <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 font-mono">
          <span>Showing {filteredProducts.length} of {products.length} products</span>
          <span>Inventory valuation: <strong className="text-slate-900">{formatNaira(totalInventoryValuation)}</strong></span>
        </div>
      </div>

      {/* Slide-over inspector */}
      <ProductDetailDrawer
        product={selectedProduct}
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={onAddToCart}
        onUpdateStock={onUpdateStock}
      />
    </div>
  );
}
