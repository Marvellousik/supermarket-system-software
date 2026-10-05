"use client";

import React, { useState } from "react";
import {
  Truck,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  Clock,
  Search,
  ExternalLink,
  Plus,
  ShieldCheck,
  Send,
  X,
} from "lucide-react";
import { Supplier } from "@/types/Entities";
import { INITIAL_SUPPLIERS } from "@/data/suppliers";

export default function SuppliersView() {
  const [suppliers, setSuppliers] = useState<Supplier[]>(INITIAL_SUPPLIERS);
  const [searchQuery, setSearchQuery] = useState("");
  const [activePoSupplier, setActivePoSupplier] = useState<Supplier | null>(null);
  const [poNotes, setPoNotes] = useState("");
  const [poSuccess, setPoSuccess] = useState(false);

  const filteredSuppliers = suppliers.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.contactPerson.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendPO = (e: React.FormEvent) => {
    e.preventDefault();
    setPoSuccess(true);
    setTimeout(() => {
      setPoSuccess(false);
      setActivePoSupplier(null);
      setPoNotes("");
    }, 1800);
  };

  return (
    <div className="w-full space-y-5 font-sans text-slate-800">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200/80">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
            FMCG Supplier & Procurement Hub
          </h1>
          <p className="text-sm font-normal text-slate-500 mt-1">
            Direct wholesale vendor contracts, on-time fulfillment rates & replenishment orders
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-[11px] font-medium text-slate-500 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-2xs">
            Procurement Network: <strong className="text-slate-900 font-bold">10 Contracted Partners</strong>
          </span>
        </div>
      </div>

      {/* Supplier Performance Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-xs">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block">Active Distributors</span>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1 tracking-tight tabular-nums">10 Partners</div>
          <span className="text-[11px] font-semibold text-emerald-800">100% SLA compliant</span>
        </div>

        <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-xs">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block">Fulfillment Score</span>
          <div className="text-2xl sm:text-3xl font-bold text-emerald-700 mt-1 tracking-tight tabular-nums">98.4%</div>
          <span className="text-[11px] font-normal text-slate-500">On-time dock arrival</span>
        </div>

        <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-xs">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block">Average Lead Time</span>
          <div className="text-2xl sm:text-3xl font-bold text-emerald-700 mt-1 tracking-tight tabular-nums">2.1 Days</div>
          <span className="text-[11px] font-normal text-slate-500">Order to delivery</span>
        </div>

        <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-xs">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block">Active Restock POs</span>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1 tracking-tight tabular-nums">32 Orders</div>
          <span className="text-[11px] font-normal text-slate-500">In transit / processing</span>
        </div>
      </div>

      {/* Search Toolbar */}
      <div className="bg-white border border-slate-200 shadow-xs p-3 rounded-xl flex items-center justify-between gap-3 text-xs">
        <div className="relative w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search supplier, contact, category..."
            className="w-full bg-slate-50 border border-slate-300 focus:bg-white focus:border-emerald-600 pl-8 pr-3 py-1.5 rounded-lg text-slate-900 placeholder-slate-400 text-xs focus:outline-none transition-colors"
          />
        </div>
        <span className="text-slate-400 font-mono text-xs">
          {filteredSuppliers.length} vendor profiles found
        </span>
      </div>

      {/* Suppliers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredSuppliers.map((sup) => (
          <div
            key={sup.id}
            className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200">
                      {sup.code}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500 uppercase">{sup.category}</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mt-1.5 leading-snug">
                    {sup.name}
                  </h3>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-sm font-bold font-mono text-emerald-700">
                    {sup.fulfillmentRate}%
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">Fulfillment</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mt-3">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{ width: `${sup.fulfillmentRate}%` }}
                />
              </div>

              {/* Contact Information */}
              <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600 font-sans">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-800">Rep:</span>
                  <span>{sup.contactPerson}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-500 font-mono text-[11px]">
                  <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                  <span>{sup.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-500 font-mono text-[11px]">
                  <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                  <span>{sup.email}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400 text-[11px] truncate">
                  <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                  <span className="truncate">{sup.address}</span>
                </div>
              </div>
            </div>

            {/* Bottom Card Actions */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-500 text-[11px]">
                Lead Time: <strong className="text-slate-900">{sup.leadTimeDays} Days</strong>
              </span>

              <button
                type="button"
                onClick={() => setActivePoSupplier(sup)}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[11px] shadow-2xs transition-colors flex items-center gap-1 cursor-pointer btn-tactile font-sans"
              >
                <Plus className="w-3 h-3" />
                <span>Place Restock PO</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Place PO Modal */}
      {activePoSupplier && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 font-sans text-slate-800">
          <div className="bg-white border border-slate-200 rounded-xl w-full max-w-md overflow-hidden shadow-2xl p-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  New Purchase Order
                </h3>
                <p className="text-[11px] text-slate-500 font-mono">
                  {activePoSupplier.name} ({activePoSupplier.code})
                </p>
              </div>
              <button
                onClick={() => setActivePoSupplier(null)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {poSuccess ? (
              <div className="py-8 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                <h4 className="font-bold text-slate-900 text-sm">Purchase Order Dispatched</h4>
                <p className="text-xs text-slate-500">
                  PO notification transmitted to {activePoSupplier.email}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSendPO} className="pt-4 space-y-3 text-xs">
                <div>
                  <label className="text-[11px] font-mono uppercase text-slate-600 font-bold block mb-1">
                    Restock Requirements & Item Quantities
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={poNotes}
                    onChange={(e) => setPoNotes(e.target.value)}
                    placeholder="e.g. 50 Bags of Mama Gold 50kg, 30 Bags of Royal Stallion 25kg. Urgent restock for Lagos flagship floor."
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-emerald-600 text-xs resize-none"
                  />
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-[11px] font-mono text-slate-600 space-y-1">
                  <div>Vendor SLA: <strong className="text-slate-900">{activePoSupplier.leadTimeDays} Days Guaranteed Delivery</strong></div>
                  <div>Contact: {activePoSupplier.contactPerson} ({activePoSupplier.phone})</div>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setActivePoSupplier(null)}
                    className="px-3 py-1.5 text-slate-500 hover:text-slate-800 font-medium cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer btn-tactile"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Transmit PO</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
