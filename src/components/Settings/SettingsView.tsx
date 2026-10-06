"use client";

import React, { useState } from "react";
import {
  Settings,
  Store,
  Printer,
  Percent,
  Volume2,
  Database,
  Save,
  CheckCircle2,
  Shield,
  HardDrive,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function SettingsView() {
  const { soundEnabled, setSoundEnabled } = useAuth();
  const [storeName, setStoreName] = useState("Neil Supermarket Software");
  const [storeAddress, setStoreAddress] = useState("14 Adeola Odeku St, Victoria Island, Lagos");
  const [storePhone, setStorePhone] = useState("+234 802 345 6789");
  const [taxRate, setTaxRate] = useState("7.5");
  const [receiptFooter, setReceiptFooter] = useState("THANK YOU FOR YOUR PATRONAGE • EXCHANGE WITHIN 48 HOURS WITH RECEIPT");
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="w-full space-y-6 font-sans text-black max-w-4xl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#e4e4e7]">
        <div>
          <h1 className="text-3xl sm:text-4xl display-thin text-black tracking-tight">
            System & Terminal Fleet Settings
          </h1>
          <p className="text-sm font-normal text-[#52525b] mt-1">
            Store identity, VAT taxation parameters, hardware peripherals & SQLite diagnostics
          </p>
        </div>

        {savedSuccess && (
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#c1fbd4] text-black border border-[#a8f5c2] shadow-xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-black" /> Settings Saved Successfully
          </span>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6 text-xs">
        {/* Store Identity */}
        <div className="bg-white border border-[#e4e4e7] rounded-xl p-6 card-stack-shadow space-y-4">
          <div className="flex items-center gap-2.5 border-b border-[#e4e4e7] pb-3.5">
            <div className="w-8 h-8 rounded-full bg-[#c1fbd4] text-black flex items-center justify-center">
              <Store className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-sm text-black tracking-tight">Retail Store Profile</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-mono uppercase tracking-wider text-[#71717a] font-semibold block mb-1.5">
                Store Business Name
              </label>
              <input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full bg-white border border-[#e4e4e7] rounded-md px-3.5 py-2.5 text-black text-xs focus:outline-none focus:border-black transition-colors"
              />
            </div>

            <div>
              <label className="text-[11px] font-mono uppercase tracking-wider text-[#71717a] font-semibold block mb-1.5">
                Official Contact Phone
              </label>
              <input
                type="text"
                value={storePhone}
                onChange={(e) => setStorePhone(e.target.value)}
                className="w-full bg-white border border-[#e4e4e7] rounded-md px-3.5 py-2.5 text-black text-xs focus:outline-none focus:border-black transition-colors"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-[11px] font-mono uppercase tracking-wider text-[#71717a] font-semibold block mb-1.5">
                Store Physical Address
              </label>
              <input
                type="text"
                value={storeAddress}
                onChange={(e) => setStoreAddress(e.target.value)}
                className="w-full bg-white border border-[#e4e4e7] rounded-md px-3.5 py-2.5 text-black text-xs focus:outline-none focus:border-black transition-colors"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-[11px] font-mono uppercase tracking-wider text-[#71717a] font-semibold block mb-1.5">
                Thermal Receipt Footer Policy Text
              </label>
              <input
                type="text"
                value={receiptFooter}
                onChange={(e) => setReceiptFooter(e.target.value)}
                className="w-full bg-white border border-[#e4e4e7] rounded-md px-3.5 py-2.5 text-black font-mono text-xs focus:outline-none focus:border-black transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Taxation & Peripherals */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Tax Parameters */}
          <div className="bg-white border border-[#e4e4e7] rounded-xl p-6 card-stack-shadow space-y-4">
            <div className="flex items-center gap-2.5 border-b border-[#e4e4e7] pb-3.5">
              <div className="w-8 h-8 rounded-full bg-[#c1fbd4] text-black flex items-center justify-center">
                <Percent className="w-4 h-4" />
              </div>
              <h3 className="font-semibold text-sm text-black tracking-tight">Taxation Parameters</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[11px] font-mono uppercase tracking-wider text-[#71717a] font-semibold block mb-1.5">
                  Nigerian Value Added Tax (VAT %)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    value={taxRate}
                    onChange={(e) => setTaxRate(e.target.value)}
                    className="w-full bg-white border border-[#e4e4e7] rounded-md px-3.5 py-2.5 text-black font-mono font-bold text-xs focus:outline-none focus:border-black transition-colors"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 font-mono text-[#a1a1aa] text-xs">%</span>
                </div>
              </div>

              <div className="p-3.5 bg-[#fbfbf5] border border-[#e4e4e7] rounded-xl text-[11px] font-mono text-[#52525b]">
                Default: <strong>7.5% Federal VAT</strong> compliant with statutory retail invoicing guidelines.
              </div>
            </div>
          </div>

          {/* Hardware Peripherals */}
          <div className="bg-white border border-[#e4e4e7] rounded-xl p-6 card-stack-shadow space-y-4">
            <div className="flex items-center gap-2.5 border-b border-[#e4e4e7] pb-3.5">
              <div className="w-8 h-8 rounded-full bg-[#c1fbd4] text-black flex items-center justify-center">
                <Volume2 className="w-4 h-4" />
              </div>
              <h3 className="font-semibold text-sm text-black tracking-tight">Hardware Peripherals</h3>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3.5 bg-[#fbfbf5] border border-[#e4e4e7] rounded-xl">
                <div>
                  <div className="font-medium text-black">Optical Scanner Audio Beep</div>
                  <div className="text-[11px] text-[#71717a] mt-0.5">Acoustic confirmation when barcode is scanned</div>
                </div>
                <input
                  type="checkbox"
                  checked={soundEnabled}
                  onChange={(e) => setSoundEnabled(e.target.checked)}
                  className="w-4 h-4 rounded text-black focus:ring-0 cursor-pointer accent-black"
                />
              </div>

              <div className="flex items-center justify-between p-3.5 bg-[#fbfbf5] border border-[#e4e4e7] rounded-xl">
                <div>
                  <div className="font-medium text-black">Thermal Printer Protocol</div>
                  <div className="text-[11px] text-[#71717a] mt-0.5">80mm ESC/POS Thermal Receipt Emulation</div>
                </div>
                <span className="text-[10px] font-mono bg-[#c1fbd4] text-black px-2.5 py-0.5 rounded-full border border-[#a8f5c2] font-semibold">
                  ACTIVE
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Database & Diagnostics */}
        <div className="bg-white border border-[#e4e4e7] rounded-xl p-6 card-stack-shadow space-y-4">
          <div className="flex items-center gap-2.5 border-b border-[#e4e4e7] pb-3.5">
            <div className="w-8 h-8 rounded-full bg-[#c1fbd4] text-black flex items-center justify-center">
              <Database className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-sm text-black tracking-tight">Database Storage Diagnostics</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
            <div className="p-4 bg-[#fbfbf5] border border-[#e4e4e7] rounded-xl">
              <div className="text-[10px] text-[#71717a] uppercase tracking-wider font-sans">Engine</div>
              <div className="font-bold text-black mt-1">SQLite 3 (better-sqlite3)</div>
              <div className="text-[10px] text-black font-semibold mt-1">Zero Latency Local WAL</div>
            </div>

            <div className="p-4 bg-[#fbfbf5] border border-[#e4e4e7] rounded-xl">
              <div className="text-[10px] text-[#71717a] uppercase tracking-wider font-sans">Database Location</div>
              <div className="font-bold text-black mt-1 truncate">data/supermarket.db</div>
              <div className="text-[10px] text-[#71717a] mt-1">Persistent Disk File</div>
            </div>

            <div className="p-4 bg-[#fbfbf5] border border-[#e4e4e7] rounded-xl">
              <div className="text-[10px] text-[#71717a] uppercase tracking-wider font-sans">Physical PDF Receipts</div>
              <div className="font-bold text-black mt-1 truncate">data/receipts/*.pdf</div>
              <div className="text-[10px] text-[#71717a] mt-1">Auto-saved to disk</div>
            </div>
          </div>
        </div>

        {/* Action Button - Strict DESIGN.md Pill Vocabulary */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="btn-primary-pill px-6 py-2.5 text-xs font-semibold shadow-xs flex items-center gap-2 cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save System Preferences</span>
          </button>
        </div>
      </form>
    </div>
  );
}
