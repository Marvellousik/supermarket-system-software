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
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 font-sans text-slate-800">
      <div className="bg-white border border-slate-200 rounded-xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <PackagePlus className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-slate-900 truncate">Add New Inventory Item</h3>
              <p className="text-[11px] text-slate-500 font-mono truncate">Create SKU, barcode & supplier link</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer shrink-0 ml-2"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 min-h-0 overflow-y-auto p-6 space-y-4 text-xs font-sans">
          <div>
            <label className="text-[11px] font-mono uppercase text-slate-600 font-bold block mb-1">
              Product Title & Specification *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Golden Terra Pure Soya Oil (5 Litres)"
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-mono uppercase text-slate-600 font-bold block mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 text-xs focus:outline-none focus:border-emerald-600"
              >
                {CATEGORIES.filter((c) => c !== "All").map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-mono uppercase text-slate-600 font-bold block mb-1">
                Retail Unit Type
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 text-xs focus:outline-none focus:border-emerald-600"
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
              <label className="text-[11px] font-mono uppercase text-slate-600 font-bold block mb-1">
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
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono font-bold focus:outline-none focus:border-emerald-600 text-xs"
              />
            </div>

            <div>
              <label className="text-[11px] font-mono uppercase text-slate-600 font-bold block mb-1">
                Wholesale Cost Price (₦)
              </label>
              <input
                type="number"
                min="0"
                step="any"
                value={costPrice}
                onChange={(e) => setCostPrice(e.target.value)}
                placeholder="2100"
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono focus:outline-none focus:border-emerald-600 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-mono uppercase text-slate-600 font-bold block mb-1">
                Initial Stock Units
              </label>
              <input
                type="number"
                required
                min="0"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono font-bold focus:outline-none focus:border-emerald-600 text-xs"
              />
            </div>

            <div>
              <label className="text-[11px] font-mono uppercase text-slate-600 font-bold block mb-1">
                Safety Stock Threshold
              </label>
              <input
                type="number"
                min="1"
                value={minThreshold}
                onChange={(e) => setMinThreshold(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono focus:outline-none focus:border-emerald-600 text-xs"
              />
            </div>
          </div>

          {/* Barcode Field with Generator */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-mono uppercase text-slate-600 font-bold">
                EAN-13 Barcode *
              </label>
              <button
                type="button"
                onClick={handleGenerateBarcode}
                className="text-emerald-600 hover:text-emerald-700 font-mono text-[10px] flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3 h-3" /> Generate Valid Code
              </button>
            </div>
            <input
              type="text"
              required
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono font-bold focus:outline-none focus:border-emerald-600 text-xs"
            />
          </div>

          {/* Supplier Picker */}
          <div>
            <label className="text-[11px] font-mono uppercase text-slate-600 font-bold block mb-1">
              FMCG Supplier Distributor
            </label>
            <select
              value={supplierName}
              onChange={(e) => setSupplierName(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 text-xs focus:outline-none focus:border-emerald-600"
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
            <label className="text-[11px] font-mono uppercase text-slate-600 font-bold block mb-1">
              Optional Shelf / Aisle Notes
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Aisle 3, Shelf B2. Requires cool dry storage."
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 text-xs focus:outline-none focus:border-emerald-600 resize-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-500 hover:text-slate-800 font-medium text-xs transition-colors cursor-pointer shrink-0"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs shadow-xs transition-colors cursor-pointer btn-tactile shrink-0"
            >
              Save Product to Registry
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
