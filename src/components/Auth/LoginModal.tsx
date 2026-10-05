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
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 font-sans text-black">
      <div className="bg-white border border-[#e4e4e7] rounded-2xl w-full max-w-sm overflow-hidden card-stack-shadow">
        <div className="px-6 py-4 border-b border-[#e4e4e7] bg-[#fbfbf5] flex items-center justify-between font-mono text-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-[#c1fbd4] text-black flex items-center justify-center">
              <KeyRound className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-black uppercase tracking-wider">
              Cashier Authentication
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-[#71717a] hover:text-black p-1.5 rounded-full hover:bg-[#f4f4f5] transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 font-mono text-xs">
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 text-red-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="p-3.5 bg-[#fbfbf5] border border-[#e4e4e7] rounded-xl text-xs text-[#52525b] space-y-1">
            <div className="font-semibold text-black uppercase text-[10px] tracking-wider">Default Credentials:</div>
            <div>Username: <span className="text-black font-bold">admin</span></div>
            <div>Password: <span className="text-black font-bold">admin</span> or <span className="text-black font-bold">123456789</span></div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] text-[#52525b] uppercase font-semibold block font-sans">Username:</label>
            <div className="relative">
              <User className="w-3.5 h-3.5 text-[#71717a] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full bg-white border border-[#e4e4e7] focus:border-black pl-8 pr-3.5 py-2 rounded-md text-black text-xs focus:outline-none transition-colors"
                placeholder="Username"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] text-[#52525b] uppercase font-semibold block font-sans">Password:</label>
            <div className="relative">
              <Lock className="w-3.5 h-3.5 text-[#71717a] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-white border border-[#e4e4e7] focus:border-black pl-8 pr-3.5 py-2 rounded-md text-black text-xs focus:outline-none transition-colors"
                placeholder="Password"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] text-[#52525b] uppercase font-semibold block font-sans">Assign Terminal Station:</label>
            <div className="relative">
              <Monitor className="w-3.5 h-3.5 text-[#71717a] absolute left-3 top-1/2 -translate-y-1/2" />
              <select
                value={selectedMachine}
                onChange={(e) => setSelectedMachine(Number(e.target.value))}
                className="w-full bg-white border border-[#e4e4e7] focus:border-black pl-8 pr-3.5 py-2 rounded-md text-black text-xs focus:outline-none font-mono transition-colors"
              >
                {machines.map((m) => (
                  <option key={m.id} value={m.id}>
                    Machine 0{m.id}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-3 flex justify-end gap-2.5 font-sans">
            <button
              type="button"
              onClick={onClose}
              className="btn-outline-light text-xs py-2 px-4"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary-pill text-xs py-2 px-5 flex items-center gap-1.5"
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
