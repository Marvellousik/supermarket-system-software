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
  const [storeName, setStoreName] = useState("Shopping Center Supermarket");
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
    <div className="w-full space-y-5 font-sans text-slate-800 max-w-4xl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200/80">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
            System & Terminal Fleet Settings
          </h1>
          <p className="text-sm font-normal text-slate-500 mt-1">
            Store identity, VAT taxation parameters, hardware peripherals & SQLite diagnostics
          </p>
        </div>

        {savedSuccess && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" /> Settings Saved Successfully
          </span>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-5 text-xs">
        {/* Store Identity */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Store className="w-4 h-4 text-emerald-600" />
            <h3 className="font-bold text-sm text-slate-900">Retail Store Profile</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-mono uppercase text-slate-600 font-bold block mb-1">
                Store Business Name
              </label>
              <input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 text-xs focus:bg-white focus:outline-none focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="text-[11px] font-mono uppercase text-slate-600 font-bold block mb-1">
                Official Contact Phone
              </label>
              <input
                type="text"
                value={storePhone}
                onChange={(e) => setStorePhone(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 text-xs focus:bg-white focus:outline-none focus:border-emerald-600"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-[11px] font-mono uppercase text-slate-600 font-bold block mb-1">
                Store Physical Address
              </label>
              <input
                type="text"
                value={storeAddress}
                onChange={(e) => setStoreAddress(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 text-xs focus:bg-white focus:outline-none focus:border-emerald-600"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-[11px] font-mono uppercase text-slate-600 font-bold block mb-1">
                Thermal Receipt Footer Policy Text
              </label>
              <input
                type="text"
                value={receiptFooter}
                onChange={(e) => setReceiptFooter(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono text-xs focus:bg-white focus:outline-none focus:border-emerald-600"
              />
            </div>
          </div>
        </div>

        {/* Taxation & Peripherals */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Tax Parameters */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Percent className="w-4 h-4 text-emerald-600" />
              <h3 className="font-bold text-sm text-slate-900">Taxation Parameters</h3>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-mono uppercase text-slate-600 font-bold block mb-1">
                  Nigerian Value Added Tax (VAT %)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    value={taxRate}
                    onChange={(e) => setTaxRate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono font-bold text-xs focus:bg-white focus:outline-none focus:border-emerald-600"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-slate-400 text-xs">%</span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-[11px] font-mono text-slate-500">
                Default: <strong>7.5% Federal VAT</strong> compliant with statutory retail invoicing guidelines.
              </div>
            </div>
          </div>

          {/* Hardware Peripherals */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Volume2 className="w-4 h-4 text-emerald-600" />
              <h3 className="font-bold text-sm text-slate-900">Hardware Peripherals</h3>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <div>
                  <div className="font-bold text-slate-900">Optical Scanner Audio Beep</div>
                  <div className="text-[11px] text-slate-500">Acoustic confirmation when barcode is scanned</div>
                </div>
                <input
                  type="checkbox"
                  checked={soundEnabled}
                  onChange={(e) => setSoundEnabled(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-0 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <div>
                  <div className="font-bold text-slate-900">Thermal Printer Protocol</div>
                  <div className="text-[11px] text-slate-500">80mm ESC/POS Thermal Receipt Emulation</div>
                </div>
                <span className="text-[10px] font-mono bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200 font-bold">
                  ACTIVE
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Database & Diagnostics */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Database className="w-4 h-4 text-emerald-600" />
            <h3 className="font-bold text-sm text-slate-900">Database Storage Diagnostics</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="text-[10px] text-slate-400 uppercase font-sans">Engine</div>
              <div className="font-bold text-slate-900 mt-0.5">SQLite 3 (better-sqlite3)</div>
              <div className="text-[10px] text-emerald-600 mt-1">Zero Latency Local WAL</div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="text-[10px] text-slate-400 uppercase font-sans">Database Location</div>
              <div className="font-bold text-emerald-700 mt-0.5 truncate">data/supermarket.db</div>
              <div className="text-[10px] text-slate-500 mt-1">Persistent Disk File</div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="text-[10px] text-slate-400 uppercase font-sans">Physical PDF Receipts</div>
              <div className="font-bold text-emerald-700 mt-0.5 truncate">data/receipts/*.pdf</div>
              <div className="text-[10px] text-slate-500 mt-1">Auto-saved to disk</div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs shadow-sm transition-colors flex items-center gap-2 cursor-pointer btn-tactile"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save System Preferences</span>
          </button>
        </div>
      </form>
    </div>
  );
}
