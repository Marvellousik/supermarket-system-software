"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  Barcode,
  Package,
  Check,
  Plus,
} from "lucide-react";
import { Product } from "@/types/Entities";
import { CATEGORIES } from "@/data/products";
import { formatNaira, playScannerBeep } from "@/utils/formatters";
import { useAuth } from "@/context/AuthContext";

interface ProductCatalogProps {
  products: Product[];
  onAddToCart?: (product: Product) => void;
}

export default function ProductCatalog({
  products,
  onAddToCart,
}: ProductCatalogProps) {
  const { soundEnabled } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [copiedBarcode, setCopiedBarcode] = useState<string | null>(null);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory =
        selectedCategory === "All" || p.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.barcode.includes(q) ||
        p.code.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  const handleCopyBarcode = (barcode: string) => {
    navigator.clipboard?.writeText(barcode);
    setCopiedBarcode(barcode);
    setTimeout(() => setCopiedBarcode(null), 2000);
  };

  const handleAdd = (product: Product) => {
    if (soundEnabled) {
      playScannerBeep();
    }
    if (onAddToCart) {
      onAddToCart(product);
    }
  };

  return (
    <div className="w-full flex flex-col gap-4 font-sans text-slate-800">
      {/* Search & Header */}
      <div className="bg-white border border-slate-200 shadow-xs p-3.5 rounded-lg flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Household Product Master Registry ({products.length} Items)
          </h1>
          <p className="text-sm font-normal text-slate-500 mt-1">
            Registered inventory codes, EAN-13 barcodes, and retail prices in Nigerian Naira (₦)
          </p>
        </div>

        <div className="relative w-full sm:w-64 font-mono text-xs">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search code, name..."
            className="w-full bg-slate-50 border border-slate-300 focus:bg-white focus:border-emerald-600 pl-8 pr-3 py-1.5 rounded text-slate-900 placeholder-slate-400 text-xs focus:outline-none transition-colors"
          />
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 font-mono text-xs">
        {CATEGORIES.map((category) => {
          const count =
            category === "All"
              ? products.length
              : products.filter((p) => p.category === category).length;
          const isActive = selectedCategory === category;

          return (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-1.5 rounded text-xs whitespace-nowrap transition-colors border cursor-pointer ${
                isActive
                  ? "bg-emerald-600 border-emerald-600 text-white font-bold shadow-xs"
                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 shadow-2xs"
              }`}
            >
              <span>{category}</span>
              <span className={`ml-1 text-[10px] font-normal ${isActive ? "text-emerald-100" : "text-slate-400"}`}>
                ({count})
              </span>
            </button>
          );
        })}
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            className="bg-white border border-slate-200 hover:border-emerald-400 hover:shadow-md rounded-lg p-3.5 flex flex-col justify-between transition-all shadow-xs"
          >
            <div>
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1">
                <span className="uppercase text-slate-500 font-bold">{product.category}</span>
                <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-700 font-semibold">
                  {product.code}
                </span>
              </div>

              <h3 className="font-bold text-xs text-slate-900 line-clamp-2 leading-snug">
                {product.name}
              </h3>

              {product.description && (
                <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">
                  {product.description}
                </p>
              )}

              {/* Barcode Strip */}
              <div className="mt-2.5 p-1.5 bg-slate-50 rounded border border-slate-200 flex items-center justify-between font-mono text-[11px]">
                <div className="flex items-center gap-1.5 text-slate-600">
                  <Barcode className="w-3.5 h-3.5 text-slate-400" />
                  <span>{product.barcode}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyBarcode(product.barcode)}
                  className="text-[10px] text-slate-500 hover:text-slate-900 px-1.5 py-0.5 rounded hover:bg-slate-200 cursor-pointer font-medium"
                >
                  {copiedBarcode === product.barcode ? (
                    <span className="text-emerald-700 flex items-center gap-0.5 font-bold">
                      <Check className="w-2.5 h-2.5" /> Copied
                    </span>
                  ) : (
                    "Copy"
                  )}
                </button>
              </div>
            </div>

            {/* Price & Add to Register */}
            <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between font-mono">
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-semibold">Price</span>
                <span className="text-sm font-bold text-slate-900">
                  {formatNaira(product.price)}
                </span>
              </div>

              {onAddToCart && (
                <button
                  type="button"
                  onClick={() => handleAdd(product)}
                  className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs transition-colors flex items-center gap-1 shadow-xs cursor-pointer font-sans font-medium"
                >
                  <Plus className="w-3 h-3 text-slate-300" />
                  <span>To Register</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="p-8 text-center bg-white border border-slate-200 rounded-lg font-mono text-xs text-slate-400 shadow-xs">
          <Package className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p>No products match query.</p>
        </div>
      )}
    </div>
  );
}
