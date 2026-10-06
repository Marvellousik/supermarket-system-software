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
    <div className="w-full flex flex-col gap-6 font-sans text-black">
      {/* Top Header & Refresh */}
      <div className="bg-white border border-[#e4e4e7] card-stack-shadow p-6 rounded-2xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl display-thin text-black tracking-tight">
            Register Audit & Transaction Logs (SQLite Database)
          </h1>
          <p className="text-sm font-normal text-[#52525b] mt-1">
            Per-terminal sales audit, cashier logs, and physical PDF receipt reprints
          </p>
        </div>

        <button
          onClick={() => fetchTransactions(selectedMachineFilter)}
          disabled={isLoading}
          className="btn-outline-light px-4 py-2 text-xs font-mono flex items-center gap-2 transition-all cursor-pointer font-medium"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
          <span>Refresh Database Logs</span>
        </button>
      </div>

      {/* Per-Machine Breakdown Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {machineStats.map((st) => (
          <div
            key={st.machineId}
            onClick={() => setSelectedMachineFilter(st.machineId.toString())}
            className={`p-4 rounded-xl border cursor-pointer transition-all min-w-0 overflow-hidden ${
              selectedMachineFilter === st.machineId.toString()
                ? "bg-[#c1fbd4]/30 border-2 border-black card-stack-shadow"
                : "bg-white border-[#e4e4e7] card-stack-shadow hover:border-[#a1a1aa]"
            }`}
          >
            <div className="flex justify-between items-center text-[11px] font-mono text-[#71717a] mb-1.5 truncate">
              <span className="font-semibold text-black truncate">Terminal 0{st.machineId}</span>
              <span className="text-[10px] bg-[#fbfbf5] border border-[#e4e4e7] px-2 py-0.5 rounded-full text-[#52525b] font-sans font-medium shrink-0 ml-1">
                {st.count} Logs
              </span>
            </div>
            <div className="text-lg font-mono font-medium text-black tabular-nums truncate" title={formatNaira(st.revenue)}>
              {formatNaira(st.revenue)}
            </div>
          </div>
        ))}
      </div>

      {/* Filter Tabs & Search */}
      <div className="bg-white border border-[#e4e4e7] card-stack-shadow p-4 rounded-xl flex flex-wrap items-center justify-between gap-3 font-mono text-xs">
        <div className="flex items-center gap-2 overflow-x-auto">
          <span className="text-[11px] text-[#71717a] uppercase font-semibold mr-1 font-sans">
            Filter:
          </span>
          <button
            type="button"
            onClick={() => setSelectedMachineFilter("all")}
            className={`px-3.5 py-1.5 rounded-full text-xs transition-all cursor-pointer ${
              selectedMachineFilter === "all"
                ? "bg-black text-white font-semibold shadow-xs"
                : "bg-[#fbfbf5] border border-[#e4e4e7] text-[#52525b] hover:text-black"
            }`}
          >
            All Machines ({allReceipts.length})
          </button>

          {machines.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setSelectedMachineFilter(m.id.toString())}
              className={`px-3.5 py-1.5 rounded-full text-xs transition-all cursor-pointer ${
                selectedMachineFilter === m.id.toString()
                  ? "bg-black text-white font-semibold shadow-xs"
                  : "bg-[#fbfbf5] border border-[#e4e4e7] text-[#52525b] hover:text-black"
              }`}
            >
              Machine 0{m.id}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-[#a1a1aa] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search receipt #, staff..."
            className="w-full bg-[#ffffff] border border-[#e4e4e7] focus:border-black pl-8 pr-3 py-2 rounded-md text-black placeholder:text-[#a1a1aa] text-xs focus:outline-none transition-colors"
          />
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white border border-[#e4e4e7] card-stack-shadow rounded-xl overflow-hidden">
        <div className="px-6 py-4 bg-[#fbfbf5] border-b border-[#e4e4e7] flex justify-between items-center text-xs font-mono">
          <span className="text-[#52525b] font-semibold uppercase tracking-wider">
            Viewing: {selectedMachineFilter === "all" ? "All Terminals" : `Machine 0${selectedMachineFilter}`} ({filteredReceipts.length} entries)
          </span>
          <span className="text-black font-bold font-mono tabular-nums">
            Total Ext: {formatNaira(totalVolume)}
          </span>
        </div>

        {filteredReceipts.length === 0 ? (
          <div className="p-12 text-center text-[#a1a1aa] font-mono text-xs">
            <FileText className="w-8 h-8 text-[#d4d4d8] mx-auto mb-2" />
            <p>No transactions found for this terminal.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#fbfbf5] text-[#71717a] uppercase text-[10px] border-b border-[#e4e4e7] font-semibold">
                <tr>
                  <th className="py-3.5 px-4">Receipt No</th>
                  <th className="py-3.5 px-3">Date/Time</th>
                  <th className="py-3.5 px-3">Terminal</th>
                  <th className="py-3.5 px-3">Cashier</th>
                  <th className="py-3.5 px-3">Items</th>
                  <th className="py-3.5 px-3">Method</th>
                  <th className="py-3.5 px-3 text-right">Amount (₦)</th>
                  <th className="py-3.5 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e4e4e7]">
                {filteredReceipts.map((receipt) => (
                  <tr key={receipt.id} className="hover:bg-[#fbfbf5] transition-colors">
                    <td className="py-3.5 px-4 font-bold text-black">
                      {receipt.receiptNumber}
                    </td>
                    <td className="py-3.5 px-3 text-[#71717a] whitespace-nowrap text-[11px]">
                      {receipt.date}
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="px-2.5 py-0.5 rounded-full bg-[#c1fbd4] text-black font-semibold text-[10px]">
                        Machine 0{receipt.machineId}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-black uppercase font-sans text-xs font-medium">
                      {receipt.cashierName}
                    </td>
                    <td className="py-3.5 px-3 text-[#71717a] text-[11px]">
                      {receipt.items.reduce((acc, i) => acc + i.quantity, 0)} units ({receipt.items.length} lines)
                    </td>
                    <td className="py-3.5 px-3 uppercase text-[#52525b] text-[10px] font-semibold">
                      {receipt.paymentMethod}
                    </td>
                    <td className="py-3.5 px-3 text-right font-bold text-black tabular-nums">
                      {formatNaira(receipt.total)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-2 font-sans">
                        <button
                          type="button"
                          onClick={() => setSelectedReceipt(receipt)}
                          title="View receipt"
                          className="p-1.5 rounded-full bg-white hover:bg-[#fbfbf5] border border-[#e4e4e7] text-[#52525b] hover:text-black transition-all cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => generateReceiptPDF(receipt)}
                          title="Download PDF"
                          className="px-3 py-1 rounded-full bg-[#c1fbd4] hover:bg-[#aaf5c2] text-black text-[10px] font-mono font-semibold transition-all flex items-center gap-1 shadow-xs cursor-pointer"
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
