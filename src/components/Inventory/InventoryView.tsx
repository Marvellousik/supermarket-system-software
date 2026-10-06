"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  Plus,
  Download,
  Package,
  Eye,
  ArrowUpDown,
  ShoppingCart,
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

  // Compute inventory KPIs in Naira value (₦)
  const totalStockUnits = useMemo(() => products.reduce((sum, p) => sum + p.stock, 0), [products]);
  const totalInventoryValuation = useMemo(() => products.reduce((sum, p) => sum + p.price * p.stock, 0), [products]);
  const lowStockProducts = useMemo(() => products.filter((p) => p.stock > 0 && p.stock <= (p.minThreshold || 15)), [products]);
  const lowStockCount = lowStockProducts.length;
  const lowStockValuation = useMemo(() => lowStockProducts.reduce((sum, p) => sum + p.price * p.stock, 0), [lowStockProducts]);
  const outOfStockCount = useMemo(() => products.filter((p) => p.stock <= 0).length, [products]);
  const inStockProducts = useMemo(() => products.filter((p) => p.stock > (p.minThreshold || 15)), [products]);
  const inStockCount = inStockProducts.length;
  const inStockValuation = useMemo(() => inStockProducts.reduce((sum, p) => sum + p.price * p.stock, 0), [inStockProducts]);

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
    <div className="w-full space-y-6 font-sans text-black">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#e4e4e7]">
        <div>
          <h1 className="text-3xl sm:text-4xl display-thin text-black tracking-tight">
            Inventory Stock Control
          </h1>
          <p className="text-sm font-normal text-[#52525b] mt-1">
            Real-time inventory balances, stock valuation in Naira (₦) & FMCG distributor tracking
          </p>
        </div>

        <div className="flex items-center gap-2.5 font-sans text-xs shrink-0">
          <button
            onClick={handleExportCSV}
            className="btn-outline-light px-4 py-2 text-xs font-medium cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[#71717a]" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={onOpenNewProductModal}
            className="btn-primary-pill px-5 py-2.5 text-xs font-semibold cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* KPI Metric Summary Strip - Fully Contained Flex/Grid Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5 text-xs">
        <div className="p-4 bg-white border border-[#e4e4e7] rounded-xl card-stack-shadow min-w-0 overflow-hidden flex flex-col justify-between">
          <span className="text-[11px] font-medium text-[#71717a] uppercase tracking-wider block truncate">Total Stock Valuation</span>
          <div className="text-lg sm:text-xl lg:text-2xl font-bold text-black mt-1 tracking-tight tabular-nums truncate" title={formatNaira(totalInventoryValuation)}>
            {formatNaira(totalInventoryValuation)}
          </div>
          <span className="text-[11px] font-normal text-[#71717a] truncate mt-1 block">
            {products.length} Products ({totalStockUnits.toLocaleString()} units)
          </span>
        </div>

        <div className="p-4 bg-white border border-[#e4e4e7] rounded-xl card-stack-shadow min-w-0 overflow-hidden flex flex-col justify-between">
          <span className="text-[11px] font-medium text-[#71717a] uppercase tracking-wider block truncate">In Stock Valuation</span>
          <div className="text-lg sm:text-xl lg:text-2xl font-bold text-black mt-1 tracking-tight tabular-nums truncate" title={formatNaira(inStockValuation)}>
            {formatNaira(inStockValuation)}
          </div>
          <span className="text-[11px] font-normal text-[#71717a] truncate mt-1 block">
            {inStockCount} Items Available
          </span>
        </div>

        <div className="p-4 bg-white border border-[#e4e4e7] rounded-xl card-stack-shadow min-w-0 overflow-hidden flex flex-col justify-between">
          <span className="text-[11px] font-medium text-[#71717a] uppercase tracking-wider block truncate">Low Stock Valuation</span>
          <div className="text-lg sm:text-xl lg:text-2xl font-bold text-amber-700 mt-1 tracking-tight tabular-nums truncate" title={formatNaira(lowStockValuation)}>
            {formatNaira(lowStockValuation)}
          </div>
          <span className="text-[11px] font-semibold text-amber-700 truncate mt-1 block">
            {lowStockCount} Items Low
          </span>
        </div>

        <div className="p-4 bg-white border border-[#e4e4e7] rounded-xl card-stack-shadow min-w-0 overflow-hidden flex flex-col justify-between">
          <span className="text-[11px] font-medium text-[#71717a] uppercase tracking-wider block truncate">Out of Stock Value</span>
          <div className="text-lg sm:text-xl lg:text-2xl font-bold text-rose-600 mt-1 tracking-tight tabular-nums truncate">
            {outOfStockCount} Items (₦0.00)
          </div>
          <span className="text-[11px] font-semibold text-rose-600 truncate mt-1 block">
            Depleted Shelf Stock
          </span>
        </div>

        <div className="p-4 bg-white border border-[#e4e4e7] rounded-xl card-stack-shadow min-w-0 overflow-hidden flex flex-col justify-between col-span-2 md:col-span-1">
          <span className="text-[11px] font-medium text-[#71717a] uppercase tracking-wider block truncate">Total Stock Units</span>
          <div className="text-lg sm:text-xl lg:text-2xl font-bold text-black mt-1 tracking-tight tabular-nums truncate">
            {totalStockUnits.toLocaleString()} Units
          </div>
          <span className="text-[11px] font-medium text-[#52525b] truncate mt-1 block">
            Across {products.length} Products
          </span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white border border-[#e4e4e7] card-stack-shadow p-3.5 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search */}
          <div className="relative w-64">
            <Search className="w-3.5 h-3.5 text-[#a1a1aa] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search product, code, barcode, supplier..."
              className="w-full bg-[#fbfbf5] border border-[#e4e4e7] focus:bg-white focus:border-black pl-9 pr-3 py-2 rounded-md text-black placeholder-[#a1a1aa] text-xs focus:outline-none transition-colors"
            />
          </div>

          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-[#fbfbf5] border border-[#e4e4e7] text-black px-3 py-2 rounded-md text-xs focus:outline-none focus:border-black cursor-pointer"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c === "All" ? "All Categories" : c}
              </option>
            ))}
          </select>

          {/* Status Pills - STRICT PILLS */}
          <div className="flex items-center bg-[#fbfbf5] p-1 rounded-full border border-[#e4e4e7] text-xs font-sans">
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-3 py-1 rounded-full cursor-pointer transition-all ${
                statusFilter === "all" ? "bg-black font-semibold text-white shadow-xs" : "text-[#71717a] hover:text-black"
              }`}
            >
              All ({products.length})
            </button>
            <button
              onClick={() => setStatusFilter("in_stock")}
              className={`px-3 py-1 rounded-full cursor-pointer transition-all ${
                statusFilter === "in_stock" ? "bg-black font-semibold text-white shadow-xs" : "text-[#71717a] hover:text-black"
              }`}
            >
              In Stock ({inStockCount})
            </button>
            <button
              onClick={() => setStatusFilter("low_stock")}
              className={`px-3 py-1 rounded-full cursor-pointer transition-all ${
                statusFilter === "low_stock" ? "bg-black font-semibold text-white shadow-xs" : "text-[#71717a] hover:text-black"
              }`}
            >
              Low Stock ({lowStockCount})
            </button>
            <button
              onClick={() => setStatusFilter("out_of_stock")}
              className={`px-3 py-1 rounded-full cursor-pointer transition-all ${
                statusFilter === "out_of_stock" ? "bg-black font-semibold text-white shadow-xs" : "text-[#71717a] hover:text-black"
              }`}
            >
              Depleted ({outOfStockCount})
            </button>
          </div>
        </div>

        {/* Sorting */}
        <div className="flex items-center gap-1.5 text-xs text-[#71717a] font-mono">
          <ArrowUpDown className="w-3.5 h-3.5 text-[#a1a1aa]" />
          <span>Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-transparent font-sans text-xs text-black font-semibold focus:outline-none cursor-pointer"
          >
            <option value="stock_asc">Stock: Low to High</option>
            <option value="stock_desc">Stock: High to Low</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="name">Product Name (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Main Inventory Table - Level 3 Stacked Micro-Shadows */}
      <div className="bg-white border border-[#e4e4e7] rounded-xl card-stack-shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-[#fbfbf5] text-[#71717a] uppercase text-[10px] font-mono border-b border-[#e4e4e7] font-semibold">
              <tr>
                <th className="py-3 px-4">Product Details</th>
                <th className="py-3 px-3">Product Code</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Stock Available</th>
                <th className="py-3 px-3">Selling Price</th>
                <th className="py-3 px-3">Distributor</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e4e4e7]">
              {filteredProducts.map((p) => {
                const minThresh = p.minThreshold || 15;
                const isOutOfStock = p.stock <= 0;
                const isLowStock = p.stock > 0 && p.stock <= minThresh;

                return (
                  <tr
                    key={p.id}
                    onClick={() => setSelectedProduct(p)}
                    className="hover:bg-[#fbfbf5] transition-colors cursor-pointer group"
                  >
                    <td className="py-3 px-4">
                      <div className="font-semibold text-black group-hover:underline transition-colors line-clamp-1 max-w-xs sm:max-w-md">
                        {p.name}
                      </div>
                      <div className="text-[11px] font-mono text-[#71717a] mt-0.5 flex items-center gap-1.5">
                        <span>Barcode: {p.barcode}</span>
                        <span>•</span>
                        <span>Unit: {p.unit}</span>
                      </div>
                    </td>

                    <td className="py-3 px-3 font-mono font-bold text-black">
                      {p.code}
                    </td>

                    <td className="py-3 px-3">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] bg-[#fbfbf5] border border-[#e4e4e7] text-[#52525b] font-medium">
                        {p.category}
                      </span>
                    </td>

                    <td className="py-3 px-3 font-mono">
                      <div className="flex flex-col">
                        <span className={`font-bold ${isOutOfStock ? "text-rose-600" : isLowStock ? "text-amber-700" : "text-black"}`}>
                          {p.stock} <span className="text-[11px] font-normal text-[#71717a]">{p.unit}s</span>
                        </span>
                        <span className="text-[10px] text-[#71717a] tabular-nums">
                          Value: {formatNaira(p.stock * p.price)}
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-3 font-mono font-bold text-black">
                      {formatNaira(p.price)}
                    </td>

                    <td className="py-3 px-3 text-[#52525b] text-[11px]">
                      {p.supplierName || "Flour Mills of Nigeria"}
                    </td>

                    <td className="py-3 px-3">
                      {isOutOfStock ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          OUT OF STOCK
                        </span>
                      ) : isLowStock ? (
                        <span className="tag-shade text-[10px] px-2.5 py-0.5 text-black">
                          LOW STOCK
                        </span>
                      ) : (
                        <span className="tag-mint text-[10px] px-2.5 py-0.5">
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
                          className="p-1.5 rounded-full bg-white hover:bg-[#fbfbf5] border border-[#e4e4e7] text-black transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {onAddToCart && (
                          <button
                            type="button"
                            onClick={() => onAddToCart(p)}
                            title="Add item to POS Till"
                            className="p-1.5 rounded-full bg-[#c1fbd4] hover:bg-[#aaf5c2] text-black border border-[#a8f2c2] transition-colors cursor-pointer"
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
          <div className="py-12 text-center text-[#a1a1aa] font-mono text-xs">
            <Package className="w-8 h-8 text-[#d4d4d8] mx-auto mb-2" />
            <p>No inventory products match criteria.</p>
          </div>
        )}

        <div className="px-5 py-3 bg-[#fbfbf5] border-t border-[#e4e4e7] flex items-center justify-between text-xs text-[#71717a] font-mono">
          <span>Showing {filteredProducts.length} of {products.length} products</span>
          <span>Inventory valuation: <strong className="text-black">{formatNaira(totalInventoryValuation)}</strong></span>
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
