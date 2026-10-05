"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  Scan,
  Package,
  Users,
  ReceiptText,
  Volume2,
  VolumeX,
  LogIn,
  LogOut,
  Clock,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import LoginModal from "../Auth/LoginModal";
import ShiftModal from "../Auth/ShiftModal";

export type NavTab = "pos" | "products" | "staff" | "receipts";

interface NavbarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  cartCount: number;
}

export default function Navbar({
  activeTab,
  setActiveTab,
  cartCount,
}: NavbarProps) {
  const {
    currentUser,
    activeMachineId,
    machines,
    switchMachine,
    logout,
    soundEnabled,
    setSoundEnabled,
  } = useAuth();

  const [currentTime, setCurrentTime] = useState("");
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isShiftOpen, setIsShiftOpen] = useState(false);
  const [machineDropdownOpen, setMachineDropdownOpen] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toISOString().replace("T", " ").substring(0, 19)
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <header className="w-full bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
          {/* Logo & System Metadata */}
          <div className="flex items-center gap-4">
            <div className="relative w-36 h-9 flex items-center">
              <Image
                src="/ShoppingCenter.svg"
                alt="ShoppingCenter"
                fill
                className="object-contain"
                priority
              />
            </div>

            {/* Quick Terminal Switcher Dropdown in Header */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setMachineDropdownOpen(!machineDropdownOpen)}
                className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded text-[11px] font-mono text-slate-800 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span className="text-slate-500 font-sans text-[10px] uppercase font-bold tracking-wider">
                  Terminal:
                </span>
                <span className="font-bold text-emerald-700">
                  Machine 0{activeMachineId}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {machineDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setMachineDropdownOpen(false)}
                  />
                  <div className="absolute left-0 mt-1 w-48 bg-white border border-slate-200 rounded-md shadow-xl py-1 z-50 font-mono text-xs">
                    <div className="px-3 py-1 text-[10px] text-slate-400 font-sans uppercase tracking-wider border-b border-slate-100">
                      Switch Active Machine
                    </div>
                  {machines.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => {
                        switchMachine(m.id);
                        setMachineDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer ${
                        activeMachineId === m.id
                          ? "bg-emerald-50 text-emerald-800 font-bold border-l-2 border-emerald-600"
                          : "text-slate-700"
                      }`}
                    >
                      <span>Machine 0{m.id}</span>
                      {activeMachineId === m.id && (
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1 py-0.2 rounded font-sans font-semibold">
                          ACTIVE
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </>
            )}
            </div>
          </div>

          {/* Navigation Tabs - Enterprise Light Grid */}
          <nav className="flex items-center bg-slate-100 p-1 rounded-md border border-slate-200 order-3 lg:order-2 w-full lg:w-auto justify-center overflow-x-auto font-sans text-xs">
            <button
              onClick={() => setActiveTab("pos")}
              className={`px-3.5 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === "pos"
                  ? "bg-white text-slate-900 shadow-xs border border-slate-200/80 font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Scan className="w-3.5 h-3.5 text-emerald-600" />
              <span>POS Register</span>
              {cartCount > 0 && (
                <span className="bg-emerald-600 text-white text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold">
                  {cartCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("products")}
              className={`px-3.5 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === "products"
                  ? "bg-white text-slate-900 shadow-xs border border-slate-200/80 font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Package className="w-3.5 h-3.5 text-slate-500" />
              <span>Catalog (150 Items)</span>
            </button>

            <button
              onClick={() => setActiveTab("receipts")}
              className={`px-3.5 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === "receipts"
                  ? "bg-white text-slate-900 shadow-xs border border-slate-200/80 font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <ReceiptText className="w-3.5 h-3.5 text-slate-500" />
              <span>Transaction Logs</span>
            </button>

            <button
              onClick={() => setActiveTab("staff")}
              className={`px-3.5 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === "staff"
                  ? "bg-white text-slate-900 shadow-xs border border-slate-200/80 font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Users className="w-3.5 h-3.5 text-slate-500" />
              <span>Staff & Machines</span>
            </button>
          </nav>

          {/* Right Info: Live UTC/Local Timestamp & Cashier Status */}
          <div className="flex items-center gap-2.5 order-2 lg:order-3">
            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? "Mute scan sound" : "Unmute scan sound"}
              className="p-1.5 rounded bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-800 border border-slate-200 shadow-xs transition-colors text-xs flex items-center gap-1 cursor-pointer"
            >
              {soundEnabled ? (
                <Volume2 className="w-3.5 h-3.5 text-slate-700" />
              ) : (
                <VolumeX className="w-3.5 h-3.5 text-slate-400" />
              )}
            </button>

            {/* Time */}
            <div className="hidden sm:flex items-center gap-1 text-[11px] font-mono text-slate-600 bg-white px-2 py-1 rounded border border-slate-200 shadow-xs">
              <Clock className="w-3 h-3 text-slate-400" />
              <span>{currentTime}</span>
            </div>

            {/* User Session */}
            {currentUser ? (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setIsShiftOpen(true)}
                  className="px-2.5 py-1 bg-white hover:bg-slate-50 border border-slate-200 shadow-xs rounded text-left transition-colors cursor-pointer"
                >
                  <div className="text-[11px] font-mono text-slate-700 flex items-center gap-1">
                    <span className="text-slate-400 font-sans text-[10px] uppercase font-bold">
                      Staff:
                    </span>
                    <span className="font-bold uppercase text-slate-900">
                      {currentUser.username}
                    </span>
                  </div>
                </button>

                <button
                  onClick={logout}
                  title="Sign Out"
                  className="p-1.5 rounded bg-white hover:bg-slate-50 text-slate-400 hover:text-rose-600 border border-slate-200 shadow-xs transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsLoginOpen(true)}
                className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white border border-slate-900 text-xs font-semibold rounded shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Auth Modals */}
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
      <ShiftModal isOpen={isShiftOpen} onClose={() => setIsShiftOpen(false)} />
    </>
  );
}
