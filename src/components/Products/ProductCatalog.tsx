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
    <div className="w-full flex flex-col gap-5 font-sans text-black">
      {/* Search & Header */}
      <div className="bg-white border border-[#e4e4e7] card-stack-shadow p-5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl display-thin text-black tracking-tight">
            Household Product Master Registry ({products.length} Items)
          </h1>
          <p className="text-sm font-normal text-[#52525b] mt-1">
            Registered inventory codes, EAN-13 barcodes, and retail prices in Nigerian Naira (₦)
          </p>
        </div>

        <div className="relative w-full sm:w-72 font-mono text-xs">
          <Search className="w-3.5 h-3.5 text-[#a1a1aa] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search code, name, barcode..."
            className="w-full bg-[#fbfbf5] border border-[#e4e4e7] focus:bg-white focus:border-black pl-9 pr-3 py-2 rounded-md text-black placeholder-[#a1a1aa] text-xs focus:outline-none transition-colors"
          />
        </div>
      </div>

      {/* Category Filter Pills - STRICT PILLS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 font-mono text-xs">
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
              className={`px-3.5 py-1.5 rounded-full text-xs whitespace-nowrap transition-colors border cursor-pointer font-medium ${
                isActive
                  ? "bg-black border-black text-white shadow-xs font-semibold"
                  : "bg-white border-[#e4e4e7] text-[#52525b] hover:bg-[#fbfbf5] hover:text-black hover:border-black"
              }`}
            >
              <span>{category}</span>
              <span className={`ml-1 text-[10px] font-normal ${isActive ? "text-[#c1fbd4]" : "text-[#a1a1aa]"}`}>
                ({count})
              </span>
            </button>
          );
        })}
      </div>

      {/* Product Grid - Level 3 Stacked Micro-Shadows */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            className="bg-white border border-[#e4e4e7] hover:border-black rounded-xl p-4 flex flex-col justify-between transition-all card-stack-shadow"
          >
            <div>
              <div className="flex items-center justify-between text-[10px] font-mono text-[#71717a] mb-1.5">
                <span className="uppercase text-[#52525b] font-semibold">{product.category}</span>
                <span className="bg-[#fbfbf5] border border-[#e4e4e7] px-2 py-0.5 rounded-full text-black font-medium">
                  {product.code}
                </span>
              </div>

              <h3 className="font-semibold text-xs text-black line-clamp-2 leading-snug">
                {product.name}
              </h3>

              {product.description && (
                <p className="text-[11px] text-[#71717a] line-clamp-2 mt-1 font-sans">
                  {product.description}
                </p>
              )}

              {/* Barcode Strip */}
              <div className="mt-3 p-2 bg-[#fbfbf5] rounded-lg border border-[#e4e4e7] flex items-center justify-between font-mono text-[11px]">
                <div className="flex items-center gap-1.5 text-[#52525b]">
                  <Barcode className="w-3.5 h-3.5 text-[#a1a1aa]" />
                  <span>{product.barcode}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyBarcode(product.barcode)}
                  className="text-[10px] text-[#52525b] hover:text-black px-2 py-0.5 rounded-full hover:bg-white border border-transparent hover:border-[#e4e4e7] cursor-pointer font-medium"
                >
                  {copiedBarcode === product.barcode ? (
                    <span className="text-black flex items-center gap-0.5 font-bold">
                      <Check className="w-2.5 h-2.5" /> Copied
                    </span>
                  ) : (
                    "Copy"
                  )}
                </button>
              </div>
            </div>

            {/* Price & Add to Register */}
            <div className="pt-3 mt-3 border-t border-[#e4e4e7] flex items-center justify-between font-mono">
              <div>
                <span className="text-[10px] text-[#71717a] block uppercase font-medium">Price</span>
                <span className="text-sm font-bold text-black">
                  {formatNaira(product.price)}
                </span>
              </div>

              {onAddToCart && (
                <button
                  type="button"
                  onClick={() => handleAdd(product)}
                  className="btn-primary-pill px-3.5 py-1.5 text-xs font-medium flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>To Register</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="p-12 text-center bg-white border border-[#e4e4e7] rounded-xl font-mono text-xs text-[#a1a1aa] card-stack-shadow">
          <Package className="w-8 h-8 text-[#d4d4d8] mx-auto mb-2" />
          <p>No products match query.</p>
        </div>
      )}
    </div>
  );
}
