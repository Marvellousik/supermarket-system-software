"use client";

import React, { useState } from "react";
import { User, Lock, Monitor, LogIn, KeyRound, AlertCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const { login, machines } = useAuth();
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin");
  const [selectedMachine, setSelectedMachine] = useState<number>(1);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const result = login(username, password, selectedMachine);
    if (result.success) {
      onClose();
    } else {
      setErrorMessage(result.message || "Invalid credentials.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 font-sans text-slate-800">
      <div className="bg-white border border-slate-200 rounded-xl w-full max-w-sm overflow-hidden shadow-2xl">
        <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between font-mono text-xs">
          <div className="flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-emerald-600" />
            <span className="font-bold text-slate-800 uppercase tracking-wider">
              Cashier Authentication
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 font-mono text-xs"
          >
            [X]
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 font-mono text-xs">
          {errorMessage && (
            <div className="p-2.5 bg-red-50 border border-red-200 rounded text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 text-red-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="p-3 bg-slate-50 border border-slate-200 rounded text-xs text-slate-600 space-y-1">
            <div className="font-bold text-slate-800 uppercase text-[11px]">Default Credentials:</div>
            <div>Username: <span className="text-slate-900 font-bold">admin</span></div>
            <div>Password: <span className="text-slate-900 font-bold">admin</span> or <span className="text-slate-900 font-bold">123456789</span></div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] text-slate-600 uppercase font-semibold">Username:</label>
            <div className="relative">
              <User className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full bg-white border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 pl-8 pr-3 py-1.5 rounded text-slate-900 text-xs focus:outline-none"
                placeholder="Username"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] text-slate-600 uppercase font-semibold">Password:</label>
            <div className="relative">
              <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-white border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 pl-8 pr-3 py-1.5 rounded text-slate-900 text-xs focus:outline-none"
                placeholder="Password"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] text-slate-600 uppercase font-semibold">Assign Terminal Station:</label>
            <div className="relative">
              <Monitor className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <select
                value={selectedMachine}
                onChange={(e) => setSelectedMachine(Number(e.target.value))}
                className="w-full bg-white border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 pl-8 pr-3 py-1.5 rounded text-slate-900 text-xs focus:outline-none font-mono"
              >
                {machines.map((m) => (
                  <option key={m.id} value={m.id}>
                    Machine 0{m.id}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2 font-sans">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-800 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded text-xs shadow-sm flex items-center gap-1.5 transition-colors"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Authenticate & Begin</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
