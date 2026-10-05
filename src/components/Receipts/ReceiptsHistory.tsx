"use client";

import React, { useState, useEffect } from "react";
import {
  FileText,
  Download,
  Eye,
  Search,
  RefreshCw,
} from "lucide-react";
import { Receipt } from "@/types/Entities";
import { formatNaira, generateReceiptPDF } from "@/utils/formatters";
import { useAuth } from "@/context/AuthContext";
import ReceiptModal from "./ReceiptModal";

interface ReceiptsHistoryProps {
  receipts: Receipt[];
}

export default function ReceiptsHistory({ receipts: initialReceipts }: ReceiptsHistoryProps) {
  const { machines } = useAuth();
  const [selectedMachineFilter, setSelectedMachineFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);
  const [allReceipts, setAllReceipts] = useState<Receipt[]>(initialReceipts);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Fetch transactions from SQLite API
  const fetchTransactions = async (machineId: string = "all") => {
    setIsLoading(true);
    try {
      const url =
        machineId === "all"
          ? "/api/transactions"
          : `/api/transactions?machine_id=${machineId}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success && Array.isArray(data.receipts)) {
        setAllReceipts(data.receipts);
      }
    } catch {
      // Fallback to local list if API unavailable
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions(selectedMachineFilter);
  }, [selectedMachineFilter]);

  const filteredReceipts = allReceipts.filter((r) => {
    const matchesSearch =
      r.receiptNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.cashierName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.items.some((i) =>
        i.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    return matchesSearch;
  });

  // Calculate machine breakdowns
  const totalVolume = filteredReceipts.reduce((sum, r) => sum + r.total, 0);

  // Per-machine stats
  const machineStats = machines.map((m) => {
    const machineTx = allReceipts.filter((r) => r.machineId === m.id);
    const machineTotal = machineTx.reduce((sum, r) => sum + r.total, 0);
    return {
      machineId: m.id,
      count: machineTx.length,
      revenue: machineTotal,
    };
  });

  return (
    <div className="w-full flex flex-col gap-4 font-sans text-slate-800">
      {/* Top Header & Refresh */}
      <div className="bg-white border border-slate-200 shadow-xs p-3.5 rounded-lg flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Register Audit & Transaction Logs (SQLite Database)
          </h1>
          <p className="text-sm font-normal text-slate-500 mt-1">
            Per-terminal sales audit, cashier logs, and physical PDF receipt reprints
          </p>
        </div>

        <button
          onClick={() => fetchTransactions(selectedMachineFilter)}
          disabled={isLoading}
          className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 shadow-xs rounded text-xs font-mono text-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-3 h-3 ${isLoading ? "animate-spin" : ""}`} />
          <span>Refresh Database Logs</span>
        </button>
      </div>

      {/* Per-Machine Breakdown Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {machineStats.map((st) => (
          <div
            key={st.machineId}
            onClick={() => setSelectedMachineFilter(st.machineId.toString())}
            className={`p-3 rounded-lg border cursor-pointer transition-all shadow-xs ${
              selectedMachineFilter === st.machineId.toString()
                ? "bg-emerald-50/70 border-2 border-emerald-600"
                : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50"
            }`}
          >
            <div className="flex justify-between items-center text-[11px] font-mono text-slate-500 mb-1">
              <span className="font-semibold">Terminal 0{st.machineId}</span>
              <span className="text-[10px] bg-slate-100 px-1.5 py-0.2 rounded text-slate-700 font-sans font-medium">
                {st.count} Logs
              </span>
            </div>
            <div className="text-base font-mono font-bold text-slate-900">
              {formatNaira(st.revenue)}
            </div>
          </div>
        ))}
      </div>

      {/* Filter Tabs & Search */}
      <div className="bg-white border border-slate-200 shadow-xs p-3 rounded-lg flex flex-wrap items-center justify-between gap-3 font-mono text-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <span className="text-[11px] text-slate-400 uppercase font-bold mr-1">
            Filter:
          </span>
          <button
            type="button"
            onClick={() => setSelectedMachineFilter("all")}
            className={`px-3 py-1.5 rounded text-xs transition-colors border cursor-pointer ${
              selectedMachineFilter === "all"
                ? "bg-emerald-600 border-emerald-600 text-white font-bold shadow-xs"
                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            All Machines ({allReceipts.length})
          </button>

          {machines.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setSelectedMachineFilter(m.id.toString())}
              className={`px-3 py-1.5 rounded text-xs transition-colors border cursor-pointer ${
                selectedMachineFilter === m.id.toString()
                  ? "bg-emerald-600 border-emerald-600 text-white font-bold shadow-xs"
                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              Machine 0{m.id}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search receipt #, staff..."
            className="w-full bg-slate-50 border border-slate-300 focus:bg-white focus:border-emerald-600 pl-8 pr-3 py-1.5 rounded text-slate-900 placeholder-slate-400 text-xs focus:outline-none transition-colors"
          />
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white border border-slate-200 shadow-xs rounded-lg overflow-hidden">
        <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex justify-between items-center text-xs font-mono">
          <span className="text-slate-600 font-bold uppercase">
            Viewing: {selectedMachineFilter === "all" ? "All Terminals" : `Machine 0${selectedMachineFilter}`} ({filteredReceipts.length} entries)
          </span>
          <span className="text-slate-900 font-bold font-mono">
            Total Ext: {formatNaira(totalVolume)}
          </span>
        </div>

        {filteredReceipts.length === 0 ? (
          <div className="p-8 text-center text-slate-400 font-mono text-xs">
            <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p>No transactions found for this terminal.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-50/80 text-slate-500 uppercase text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Receipt No</th>
                  <th className="py-2.5 px-3">Date/Time</th>
                  <th className="py-2.5 px-3">Terminal</th>
                  <th className="py-2.5 px-3">Cashier</th>
                  <th className="py-2.5 px-3">Items</th>
                  <th className="py-2.5 px-3">Method</th>
                  <th className="py-2.5 px-3 text-right">Amount (₦)</th>
                  <th className="py-2.5 px-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredReceipts.map((receipt) => (
                  <tr key={receipt.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2.5 px-3 font-bold text-slate-900">
                      {receipt.receiptNumber}
                    </td>
                    <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap text-[11px]">
                      {receipt.date}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="px-1.5 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold text-[10px]">
                        Machine 0{receipt.machineId}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-800 uppercase font-sans text-xs font-medium">
                      {receipt.cashierName}
                    </td>
                    <td className="py-2.5 px-3 text-slate-500 text-[11px]">
                      {receipt.items.reduce((acc, i) => acc + i.quantity, 0)} units ({receipt.items.length} lines)
                    </td>
                    <td className="py-2.5 px-3 uppercase text-slate-600 text-[10px] font-semibold">
                      {receipt.paymentMethod}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                      {formatNaira(receipt.total)}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <div className="flex items-center justify-center gap-1.5 font-sans">
                        <button
                          type="button"
                          onClick={() => setSelectedReceipt(receipt)}
                          title="View receipt"
                          className="px-2 py-1 rounded bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-[11px] transition-colors shadow-2xs cursor-pointer"
                        >
                          <Eye className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => generateReceiptPDF(receipt)}
                          title="Download PDF"
                          className="px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-mono transition-colors flex items-center gap-1 shadow-2xs cursor-pointer"
                        >
                          <Download className="w-3 h-3" />
                          <span>PDF</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* RECEIPT MODAL */}
      <ReceiptModal
        receipt={selectedReceipt}
        isOpen={!!selectedReceipt}
        onClose={() => setSelectedReceipt(null)}
      />
    </div>
  );
}
