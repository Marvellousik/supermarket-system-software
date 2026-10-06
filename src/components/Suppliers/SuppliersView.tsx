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
    <div className="w-full space-y-6 font-sans text-black">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#e4e4e7]">
        <div>
          <h1 className="text-3xl sm:text-4xl display-thin text-black tracking-tight">
            FMCG Supplier & Procurement Hub
          </h1>
          <p className="text-sm font-normal text-[#52525b] mt-1">
            Direct wholesale vendor contracts, on-time fulfillment rates & replenishment orders
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-[11px] font-mono text-[#52525b] bg-white border border-[#e4e4e7] px-3.5 py-1.5 rounded-full card-stack-shadow">
            Procurement Network: <strong className="text-black font-bold">10 Contracted Partners</strong>
          </span>
        </div>
      </div>

      {/* Supplier Performance Metrics - Fully Contained Flex/Grid Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
        <div className="p-5 bg-white border border-[#e4e4e7] rounded-xl card-stack-shadow min-w-0 overflow-hidden flex flex-col justify-between">
          <span className="text-xs font-mono uppercase tracking-wider text-[#71717a] block truncate">Active Distributors</span>
          <div className="text-xl sm:text-2xl lg:text-3xl font-medium text-black mt-2 tracking-tight tabular-nums truncate">10 Partners</div>
          <span className="inline-block mt-2 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#c1fbd4] text-black border border-[#a8f5c2] truncate w-fit">
            100% SLA compliant
          </span>
        </div>

        <div className="p-5 bg-white border border-[#e4e4e7] rounded-xl card-stack-shadow min-w-0 overflow-hidden flex flex-col justify-between">
          <span className="text-xs font-mono uppercase tracking-wider text-[#71717a] block truncate">Fulfillment Score</span>
          <div className="text-xl sm:text-2xl lg:text-3xl font-medium text-black mt-2 tracking-tight tabular-nums truncate">98.4%</div>
          <span className="text-[11px] font-normal text-[#71717a] mt-2 block truncate">On-time dock arrival</span>
        </div>

        <div className="p-5 bg-white border border-[#e4e4e7] rounded-xl card-stack-shadow min-w-0 overflow-hidden flex flex-col justify-between">
          <span className="text-xs font-mono uppercase tracking-wider text-[#71717a] block truncate">Average Lead Time</span>
          <div className="text-xl sm:text-2xl lg:text-3xl font-medium text-black mt-2 tracking-tight tabular-nums truncate">2.1 Days</div>
          <span className="text-[11px] font-normal text-[#71717a] mt-2 block truncate">Order to delivery</span>
        </div>

        <div className="p-5 bg-white border border-[#e4e4e7] rounded-xl card-stack-shadow min-w-0 overflow-hidden flex flex-col justify-between">
          <span className="text-xs font-mono uppercase tracking-wider text-[#71717a] block truncate">Active Restock POs</span>
          <div className="text-xl sm:text-2xl lg:text-3xl font-medium text-black mt-2 tracking-tight tabular-nums truncate">32 Orders</div>
          <span className="text-[11px] font-normal text-[#71717a] mt-2 block truncate">In transit / processing</span>
        </div>
      </div>

      {/* Search Toolbar */}
      <div className="bg-white border border-[#e4e4e7] card-stack-shadow p-4 rounded-xl flex items-center justify-between gap-3 text-xs">
        <div className="relative w-72">
          <Search className="w-3.5 h-3.5 text-[#a1a1aa] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search supplier, contact, category..."
            className="w-full bg-white border border-[#e4e4e7] focus:border-black pl-8 pr-3 py-2 rounded-md text-black placeholder:text-[#a1a1aa] text-xs focus:outline-none transition-colors"
          />
        </div>
        <span className="text-[#a1a1aa] font-mono text-xs">
          {filteredSuppliers.length} vendor profiles found
        </span>
      </div>

      {/* Suppliers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredSuppliers.map((sup) => (
          <div
            key={sup.id}
            className="bg-white border border-[#e4e4e7] rounded-xl p-6 card-stack-shadow flex flex-col justify-between hover:border-black transition-all"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-semibold bg-[#c1fbd4] text-black px-2.5 py-0.5 rounded-full border border-[#a8f5c2]">
                      {sup.code}
                    </span>
                    <span className="text-[11px] font-semibold text-[#71717a] uppercase tracking-wider">{sup.category}</span>
                  </div>
                  <h3 className="text-base font-semibold text-black mt-2 leading-snug tracking-tight">
                    {sup.name}
                  </h3>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-sm font-bold font-mono text-black">
                    {sup.fulfillmentRate}%
                  </div>
                  <span className="text-[10px] text-[#a1a1aa] font-mono">Fulfillment</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-1.5 bg-[#fbfbf5] border border-[#e4e4e7] rounded-full overflow-hidden mt-3">
                <div
                  className="h-full bg-black rounded-full"
                  style={{ width: `${sup.fulfillmentRate}%` }}
                />
              </div>

              {/* Contact Information */}
              <div className="mt-5 pt-4 border-t border-[#e4e4e7] space-y-2 text-xs text-[#52525b] font-sans">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-black">Rep:</span>
                  <span>{sup.contactPerson}</span>
                </div>
                <div className="flex items-center gap-2 text-[#71717a] font-mono text-[11px]">
                  <Phone className="w-3.5 h-3.5 text-[#a1a1aa] shrink-0" />
                  <span>{sup.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-[#71717a] font-mono text-[11px]">
                  <Mail className="w-3.5 h-3.5 text-[#a1a1aa] shrink-0" />
                  <span>{sup.email}</span>
                </div>
                <div className="flex items-center gap-2 text-[#a1a1aa] text-[11px] truncate">
                  <MapPin className="w-3.5 h-3.5 text-[#a1a1aa] shrink-0" />
                  <span className="truncate">{sup.address}</span>
                </div>
              </div>
            </div>

            {/* Bottom Card Actions */}
            <div className="mt-5 pt-4 border-t border-[#e4e4e7] flex items-center justify-between text-xs font-mono">
              <span className="text-[#71717a] text-[11px]">
                Lead Time: <strong className="text-black font-bold">{sup.leadTimeDays} Days</strong>
              </span>

              <button
                type="button"
                onClick={() => setActivePoSupplier(sup)}
                className="btn-primary-pill px-4 py-2 text-xs font-medium flex items-center gap-1.5 cursor-pointer font-sans"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Place Restock PO</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Place PO Modal */}
      {activePoSupplier && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 font-sans text-black">
          <div className="bg-white border border-[#e4e4e7] rounded-xl w-full max-w-md overflow-hidden card-stack-shadow p-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#e4e4e7]">
              <div>
                <h3 className="text-sm font-semibold text-black tracking-tight">
                  New Purchase Order
                </h3>
                <p className="text-[11px] text-[#71717a] font-mono">
                  {activePoSupplier.name} ({activePoSupplier.code})
                </p>
              </div>
              <button
                onClick={() => setActivePoSupplier(null)}
                className="text-[#71717a] hover:text-black p-1.5 rounded-full hover:bg-[#fbfbf5] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {poSuccess ? (
              <div className="py-10 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-black mx-auto" />
                <h4 className="font-semibold text-black text-sm">Purchase Order Dispatched</h4>
                <p className="text-xs text-[#71717a]">
                  PO notification transmitted to {activePoSupplier.email}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSendPO} className="pt-4 space-y-4 text-xs">
                <div>
                  <label className="text-[11px] font-mono uppercase tracking-wider text-[#71717a] font-semibold block mb-1.5">
                    Restock Requirements & Item Quantities
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={poNotes}
                    onChange={(e) => setPoNotes(e.target.value)}
                    placeholder="e.g. 50 Bags of Mama Gold 50kg, 30 Bags of Royal Stallion 25kg. Urgent restock for Lagos flagship floor."
                    className="w-full bg-white border border-[#e4e4e7] rounded-md p-3 text-black focus:outline-none focus:border-black text-xs resize-none transition-colors"
                  />
                </div>

                <div className="p-3.5 bg-[#fbfbf5] border border-[#e4e4e7] rounded-xl text-[11px] font-mono text-[#52525b] space-y-1">
                  <div>Vendor SLA: <strong className="text-black">{activePoSupplier.leadTimeDays} Days Guaranteed Delivery</strong></div>
                  <div>Contact: {activePoSupplier.contactPerson} ({activePoSupplier.phone})</div>
                </div>

                <div className="pt-3 flex justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setActivePoSupplier(null)}
                    className="btn-outline-light px-4 py-2 font-medium cursor-pointer transition-all text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary-pill px-5 py-2 font-medium shadow-sm transition-all flex items-center gap-1.5 cursor-pointer text-xs"
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
