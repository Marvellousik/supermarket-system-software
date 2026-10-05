"use client";

import React, { useState } from "react";
import { X, Sparkles, PackagePlus, Barcode, DollarSign } from "lucide-react";
import { Product } from "@/types/Entities";
import { CATEGORIES } from "@/data/products";
import { INITIAL_SUPPLIERS } from "@/data/suppliers";

interface NewProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveProduct: (product: Product) => void;
  existingCount: number;
}

export default function NewProductModal({
  isOpen,
  onClose,
  onSaveProduct,
  existingCount,
}: NewProductModalProps) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState<string>("Groceries & Staples");
  const [unit, setUnit] = useState("Pack");
  const [price, setPrice] = useState<string>("2500");
  const [costPrice, setCostPrice] = useState<string>("2100");
  const [stock, setStock] = useState<string>("50");
  const [minThreshold, setMinThreshold] = useState<string>("15");
  const [supplierName, setSupplierName] = useState(INITIAL_SUPPLIERS[0]?.name || "Flour Mills of Nigeria Plc");
  const [barcode, setBarcode] = useState(() => `8901000${(1000 + existingCount + 1).toString().slice(-4)}`);
  const [description, setDescription] = useState("");

  if (!isOpen) return null;

  const handleGenerateBarcode = () => {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    setBarcode(`8901000${randomSuffix}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("Product name is required.");
      return;
    }

    const nextCodeNum = 1000 + existingCount + 1;
    const newProd: Product = {
      id: `prod-${Date.now()}`,
      barcode: barcode.trim(),
      code: `HH-${nextCodeNum}`,
      name: name.trim(),
      category,
      price: parseFloat(price) || 0,
      costPrice: parseFloat(costPrice) || 0,
      unit,
      stock: parseInt(stock) || 0,
      minThreshold: parseInt(minThreshold) || 15,
      supplierName,
      description: description.trim() || undefined,
    };

    onSaveProduct(newProd);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 font-sans text-black">
      <div className="bg-white border border-[#e4e4e7] rounded-xl w-full max-w-lg overflow-hidden card-stack-shadow flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#e4e4e7] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-full bg-[#c1fbd4] text-black flex items-center justify-center shrink-0">
              <PackagePlus className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-black truncate tracking-tight">Add New Inventory Item</h3>
              <p className="text-[11px] text-[#71717a] font-mono truncate">Create SKU, barcode & supplier link</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#71717a] hover:text-black p-2 rounded-full hover:bg-[#fbfbf5] transition-colors cursor-pointer shrink-0 ml-2"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 min-h-0 overflow-y-auto p-6 space-y-4 text-xs font-sans">
          <div>
            <label className="text-[11px] font-mono uppercase tracking-wider text-[#71717a] font-semibold block mb-1.5">
              Product Title & Specification *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Golden Terra Pure Soya Oil (5 Litres)"
              className="w-full bg-white border border-[#e4e4e7] rounded-md px-3.5 py-2.5 text-black placeholder:text-[#a1a1aa] focus:outline-none focus:border-black text-xs transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-mono uppercase tracking-wider text-[#71717a] font-semibold block mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-white border border-[#e4e4e7] rounded-md px-3.5 py-2.5 text-black text-xs focus:outline-none focus:border-black transition-colors"
              >
                {CATEGORIES.filter((c) => c !== "All").map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-mono uppercase tracking-wider text-[#71717a] font-semibold block mb-1.5">
                Retail Unit Type
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full bg-white border border-[#e4e4e7] rounded-md px-3.5 py-2.5 text-black text-xs focus:outline-none focus:border-black transition-colors"
              >
                {["Bag", "Bottle", "Carton", "Pack", "Pouch", "Can", "Tin", "Piece"].map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-mono uppercase tracking-wider text-[#71717a] font-semibold block mb-1.5">
                Retail Selling Price (₦) *
              </label>
              <input
                type="number"
                required
                min="1"
                step="any"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="2500"
                className="w-full bg-white border border-[#e4e4e7] rounded-md px-3.5 py-2.5 text-black font-mono font-bold focus:outline-none focus:border-black text-xs transition-colors"
              />
            </div>

            <div>
              <label className="text-[11px] font-mono uppercase tracking-wider text-[#71717a] font-semibold block mb-1.5">
                Wholesale Cost Price (₦)
              </label>
              <input
                type="number"
                min="0"
                step="any"
                value={costPrice}
                onChange={(e) => setCostPrice(e.target.value)}
                placeholder="2100"
                className="w-full bg-white border border-[#e4e4e7] rounded-md px-3.5 py-2.5 text-black font-mono focus:outline-none focus:border-black text-xs transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-mono uppercase tracking-wider text-[#71717a] font-semibold block mb-1.5">
                Initial Stock Units
              </label>
              <input
                type="number"
                required
                min="0"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="w-full bg-white border border-[#e4e4e7] rounded-md px-3.5 py-2.5 text-black font-mono font-bold focus:outline-none focus:border-black text-xs transition-colors"
              />
            </div>

            <div>
              <label className="text-[11px] font-mono uppercase tracking-wider text-[#71717a] font-semibold block mb-1.5">
                Safety Stock Threshold
              </label>
              <input
                type="number"
                min="1"
                value={minThreshold}
                onChange={(e) => setMinThreshold(e.target.value)}
                className="w-full bg-white border border-[#e4e4e7] rounded-md px-3.5 py-2.5 text-black font-mono focus:outline-none focus:border-black text-xs transition-colors"
              />
            </div>
          </div>

          {/* Barcode Field with Generator */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-mono uppercase tracking-wider text-[#71717a] font-semibold">
                EAN-13 Barcode *
              </label>
              <button
                type="button"
                onClick={handleGenerateBarcode}
                className="text-black hover:text-black font-mono text-[10px] flex items-center gap-1.5 cursor-pointer bg-[#fbfbf5] border border-[#e4e4e7] hover:bg-[#f4f4ec] px-2.5 py-1 rounded-full transition-colors"
              >
                <Sparkles className="w-3 h-3 text-black" /> Generate Valid Code
              </button>
            </div>
            <input
              type="text"
              required
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              className="w-full bg-white border border-[#e4e4e7] rounded-md px-3.5 py-2.5 text-black font-mono font-bold focus:outline-none focus:border-black text-xs transition-colors"
            />
          </div>

          {/* Supplier Picker */}
          <div>
            <label className="text-[11px] font-mono uppercase tracking-wider text-[#71717a] font-semibold block mb-1.5">
              FMCG Supplier Distributor
            </label>
            <select
              value={supplierName}
              onChange={(e) => setSupplierName(e.target.value)}
              className="w-full bg-white border border-[#e4e4e7] rounded-md px-3.5 py-2.5 text-black text-xs focus:outline-none focus:border-black transition-colors"
            >
              {INITIAL_SUPPLIERS.map((s) => (
                <option key={s.id} value={s.name}>
                  {s.name} ({s.code})
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="text-[11px] font-mono uppercase tracking-wider text-[#71717a] font-semibold block mb-1.5">
              Optional Shelf / Aisle Notes
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Aisle 3, Shelf B2. Requires cool dry storage."
              className="w-full bg-white border border-[#e4e4e7] rounded-md px-3.5 py-2.5 text-black text-xs focus:outline-none focus:border-black resize-none transition-colors"
            />
          </div>

          {/* Footer Actions - Strict DESIGN.md Pill Vocabulary */}
          <div className="pt-4 border-t border-[#e4e4e7] flex items-center justify-end gap-2.5 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="btn-outline-light px-4 py-2 font-medium text-xs transition-all cursor-pointer shrink-0"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary-pill px-5 py-2 font-semibold text-xs shadow-xs transition-all cursor-pointer shrink-0"
            >
              Save Product to Registry
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
