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
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 font-sans text-slate-800">
      <div className="bg-white border border-slate-200 rounded-xl w-full max-w-sm overflow-hidden shadow-2xl">
        <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between font-mono text-xs">
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-emerald-600" />
            <span className="font-bold text-slate-800 uppercase tracking-wider">
              Terminal Shift Control
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 font-mono text-xs"
          >
            [X]
          </button>
        </div>

        <div className="p-5 space-y-3.5 font-mono text-xs">
          <div className="bg-slate-50 border border-slate-200 p-3 rounded text-xs space-y-1">
            <div className="text-[10px] text-slate-500 uppercase font-semibold">Current Session:</div>
            <div className="text-slate-900 font-bold uppercase">
              {currentUser?.username || "Guest"} ({currentUser?.role})
            </div>
            {activeShift && (
              <div className="text-[11px] text-emerald-700 font-medium">
                Operating Machine 0{activeShift.machineId} since{" "}
                {new Date(activeShift.startTime).toLocaleTimeString()}
              </div>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-[11px] text-slate-600 uppercase font-semibold">
              Switch Terminal Station:
            </label>
            <select
              value={selectedMachine}
              onChange={(e) => setSelectedMachine(Number(e.target.value))}
              className="w-full bg-white border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 p-2 rounded text-slate-900 text-xs focus:outline-none font-mono"
            >
              {machines.map((m) => (
                <option key={m.id} value={m.id}>
                  Machine 0{m.id}
                </option>
              ))}
            </select>
          </div>

          <div className="pt-2 flex flex-col gap-2 font-sans">
            <button
              onClick={handleUpdateShift}
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold transition-colors shadow-sm flex items-center justify-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Confirm Terminal Assignment</span>
            </button>

            {activeShift && (
              <button
                onClick={handleEndShift}
                className="w-full py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 font-mono"
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
