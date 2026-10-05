"use client";

import React, { useState } from "react";
import { Clock, Check, PowerOff } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface ShiftModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ShiftModal({ isOpen, onClose }: ShiftModalProps) {
  const { activeShift, currentUser, machines, switchMachine, startShift, endShift } = useAuth();
  const [selectedMachine, setSelectedMachine] = useState<number>(
    activeShift?.machineId || 1
  );

  if (!isOpen) return null;

  const handleUpdateShift = () => {
    switchMachine(selectedMachine);
    startShift(selectedMachine);
    onClose();
  };

  const handleEndShift = () => {
    endShift();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 font-sans text-black">
      <div className="bg-white border border-[#e4e4e7] rounded-2xl w-full max-w-sm overflow-hidden card-stack-shadow">
        <div className="px-6 py-4 border-b border-[#e4e4e7] bg-[#fbfbf5] flex items-center justify-between font-mono text-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-[#c1fbd4] text-black flex items-center justify-center">
              <Clock className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-black uppercase tracking-wider">
              Terminal Shift Control
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-[#71717a] hover:text-black p-1.5 rounded-full hover:bg-[#f4f4f5] transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-4 font-mono text-xs">
          <div className="bg-[#fbfbf5] border border-[#e4e4e7] p-3.5 rounded-xl text-xs space-y-1">
            <div className="text-[10px] text-[#71717a] uppercase font-semibold">Current Session:</div>
            <div className="text-black font-bold uppercase">
              {currentUser?.username || "Guest"} ({currentUser?.role})
            </div>
            {activeShift && (
              <div className="text-[11px] text-emerald-900 font-medium">
                Operating Machine 0{activeShift.machineId} since{" "}
                {new Date(activeShift.startTime).toLocaleTimeString()}
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] text-[#52525b] uppercase font-semibold block font-sans">
              Switch Terminal Station:
            </label>
            <select
              value={selectedMachine}
              onChange={(e) => setSelectedMachine(Number(e.target.value))}
              className="w-full bg-white border border-[#e4e4e7] focus:border-black p-2 rounded-md text-black text-xs focus:outline-none font-mono transition-colors"
            >
              {machines.map((m) => (
                <option key={m.id} value={m.id}>
                  Machine 0{m.id}
                </option>
              ))}
            </select>
          </div>

          <div className="pt-3 flex flex-col gap-2.5 font-sans">
            <button
              onClick={handleUpdateShift}
              className="btn-primary-pill w-full py-2.5 text-xs flex items-center justify-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Confirm Terminal Assignment</span>
            </button>

            {activeShift && (
              <button
                onClick={handleEndShift}
                className="btn-outline-light w-full py-2.5 text-xs text-rose-700 border-rose-200 hover:bg-rose-50 flex items-center justify-center gap-1.5"
              >
                <PowerOff className="w-3.5 h-3.5" />
                <span>Close Active Shift</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
