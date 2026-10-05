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
      <header className="w-full bg-white border-b border-[#e4e4e7] sticky top-0 z-40 card-stack-shadow">
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
                className="px-3 py-1 bg-[#fbfbf5] hover:bg-[#f4f4ec] border border-[#e4e4e7] rounded-full text-[11px] font-mono text-black flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span className="text-[#71717a] font-sans text-[10px] uppercase font-bold tracking-wider">
                  Terminal:
                </span>
                <span className="font-bold text-black">
                  Machine 0{activeMachineId}
                </span>
                <ChevronDown className="w-3 h-3 text-[#71717a]" />
              </button>

              {machineDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setMachineDropdownOpen(false)}
                  />
                  <div className="absolute left-0 mt-1 w-48 bg-white border border-[#e4e4e7] rounded-xl card-stack-shadow py-1 z-50 font-mono text-xs">
                    <div className="px-3 py-1 text-[10px] text-[#71717a] font-sans uppercase tracking-wider border-b border-[#e4e4e7]">
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
                      className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-[#fbfbf5] transition-colors cursor-pointer ${
                        activeMachineId === m.id
                          ? "bg-[#c1fbd4] text-black font-bold"
                          : "text-[#52525b]"
                      }`}
                    >
                      <span>Machine 0{m.id}</span>
                      {activeMachineId === m.id && (
                        <span className="text-[10px] bg-black text-white px-2 py-0.5 rounded-full font-sans font-semibold">
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

          {/* Navigation Tabs - Strict Pill Vocabulary */}
          <nav className="flex items-center bg-[#fbfbf5] p-1 rounded-full border border-[#e4e4e7] order-3 lg:order-2 w-full lg:w-auto justify-center overflow-x-auto font-sans text-xs">
            <button
              onClick={() => setActiveTab("pos")}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === "pos"
                  ? "bg-black text-white shadow-xs font-bold"
                  : "text-[#52525b] hover:text-black"
              }`}
            >
              <Scan className="w-3.5 h-3.5" />
              <span>POS Register</span>
              {cartCount > 0 && (
                <span className="bg-[#c1fbd4] text-black text-[10px] font-mono px-1.5 py-0.5 rounded-full font-bold">
                  {cartCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("products")}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === "products"
                  ? "bg-black text-white shadow-xs font-bold"
                  : "text-[#52525b] hover:text-black"
              }`}
            >
              <Package className="w-3.5 h-3.5 text-[#71717a]" />
              <span>Catalog (150 Items)</span>
            </button>

            <button
              onClick={() => setActiveTab("receipts")}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === "receipts"
                  ? "bg-black text-white shadow-xs font-bold"
                  : "text-[#52525b] hover:text-black"
              }`}
            >
              <ReceiptText className="w-3.5 h-3.5 text-[#71717a]" />
              <span>Transaction Logs</span>
            </button>

            <button
              onClick={() => setActiveTab("staff")}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === "staff"
                  ? "bg-black text-white shadow-xs font-bold"
                  : "text-[#52525b] hover:text-black"
              }`}
            >
              <Users className="w-3.5 h-3.5 text-[#71717a]" />
              <span>Staff & Machines</span>
            </button>
          </nav>

          {/* Right Info: Live UTC/Local Timestamp & Cashier Status */}
          <div className="flex items-center gap-2.5 order-2 lg:order-3">
            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? "Mute scan sound" : "Unmute scan sound"}
              className="p-2 rounded-full bg-white hover:bg-[#fbfbf5] text-[#52525b] hover:text-black border border-[#e4e4e7] shadow-xs transition-colors text-xs flex items-center gap-1 cursor-pointer"
            >
              {soundEnabled ? (
                <Volume2 className="w-3.5 h-3.5" />
              ) : (
                <VolumeX className="w-3.5 h-3.5 text-[#a1a1aa]" />
              )}
            </button>

            {/* Time */}
            <div className="hidden sm:flex items-center gap-1 text-[11px] font-mono text-[#52525b] bg-white px-2.5 py-1 rounded-full border border-[#e4e4e7] shadow-xs">
              <Clock className="w-3 h-3 text-[#a1a1aa]" />
              <span>{currentTime}</span>
            </div>

            {/* User Session */}
            {currentUser ? (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setIsShiftOpen(true)}
                  className="px-3 py-1 bg-white hover:bg-[#fbfbf5] border border-[#e4e4e7] shadow-xs rounded-full text-left transition-colors cursor-pointer"
                >
                  <div className="text-[11px] font-mono text-[#52525b] flex items-center gap-1">
                    <span className="text-[#a1a1aa] font-sans text-[10px] uppercase font-bold">
                      Staff:
                    </span>
                    <span className="font-bold uppercase text-black">
                      {currentUser.username}
                    </span>
                  </div>
                </button>

                <button
                  onClick={logout}
                  title="Sign Out"
                  className="p-2 rounded-full bg-white hover:bg-[#fbfbf5] text-[#71717a] hover:text-rose-600 border border-[#e4e4e7] shadow-xs transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsLoginOpen(true)}
                className="btn-primary-pill px-4 py-1.5 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
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
