"use client";

import React, { useState } from "react";
import {
  BarChart3,
  Download,
  Calendar,
  CreditCard,
  Banknote,
  Smartphone,
  TrendingUp,
  FileSpreadsheet,
  CheckCircle2,
  Printer,
} from "lucide-react";
import { CATEGORY_DISTRIBUTION, PAYMENT_SPLIT } from "@/data/analytics";
import { formatNaira } from "@/utils/formatters";

export default function ReportsView() {
  const [downloading, setDownloading] = useState(false);

  const DAILY_AUDIT_LOGS = [
    { date: "Today (Oct 03)", orders: 1284, gross: 2842500, vat: 213187, card: 1648650, cash: 767475, transfer: 426375, status: "Audited" },
    { date: "Yesterday (Oct 02)", orders: 1190, gross: 2610000, vat: 195750, card: 1513800, cash: 704700, transfer: 391500, status: "Reconciled" },
    { date: "Oct 01, 2026", orders: 1340, gross: 2980000, vat: 223500, card: 1728400, cash: 804600, transfer: 447000, status: "Reconciled" },
    { date: "Sep 30, 2026", orders: 1120, gross: 2450000, vat: 183750, card: 1421000, cash: 661500, transfer: 367500, status: "Reconciled" },
    { date: "Sep 29, 2026", orders: 1080, gross: 2320000, vat: 174000, card: 1345600, cash: 626400, transfer: 348000, status: "Reconciled" },
  ];

  const handleExportReport = () => {
    setDownloading(true);
    setTimeout(() => {
      setDownloading(false);
      window.print();
    }, 600);
  };

  return (
    <div className="w-full space-y-6 font-sans text-black">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#e4e4e7]">
        <div>
          <h1 className="text-3xl sm:text-4xl display-thin text-black tracking-tight">
            Financial & Store Performance Audit
          </h1>
          <p className="text-sm font-normal text-[#52525b] mt-1">
            Tender reconciliation, category margins & executive audit statements
          </p>
        </div>

        <button
          onClick={handleExportReport}
          disabled={downloading}
          className="btn-primary-pill px-5 py-2.5 text-xs font-medium flex items-center gap-2 cursor-pointer shadow-xs"
        >
          <Download className="w-3.5 h-3.5" />
          <span>{downloading ? "Preparing PDF..." : "Export Executive Audit PDF"}</span>
        </button>
      </div>

      {/* Two Column Visual Breakdowns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Payment Methods Distribution */}
        <div className="bg-white border border-[#e4e4e7] rounded-xl p-6 card-stack-shadow space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#71717a] font-semibold">
                Tender Distribution
              </span>
              <h3 className="text-sm font-semibold text-black mt-1 tracking-tight">
                Payment Channel Settlement Split
              </h3>
            </div>
            <span className="text-xs font-mono text-black font-semibold bg-[#c1fbd4] px-2.5 py-0.5 rounded-full border border-[#a8f5c2]">
              100% Reconciled
            </span>
          </div>

          {/* Bar split */}
          <div className="space-y-3 pt-1">
            {PAYMENT_SPLIT.map((item) => (
              <div key={item.method} className="space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-[#52525b] font-medium font-sans">{item.method}</span>
                  <span className="font-bold text-black">{item.percentage}% ({item.count} orders)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#fbfbf5] border border-[#e4e4e7] overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${item.percentage}%`,
                      backgroundColor: item.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-[#e4e4e7] text-[11px] font-mono text-[#71717a] flex justify-between">
            <span>Primary settlement gateway: <strong className="text-black">POS Card (58%)</strong></span>
            <span>Card failure rate: <strong className="text-black">0.02%</strong></span>
          </div>
        </div>

        {/* Category Revenue Contribution */}
        <div className="bg-white border border-[#e4e4e7] rounded-xl p-6 card-stack-shadow space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#71717a] font-semibold">
                Revenue Share
              </span>
              <h3 className="text-sm font-semibold text-black mt-1 tracking-tight">
                Category Contribution to Gross Sales
              </h3>
            </div>
            <span className="text-xs font-mono text-[#71717a]">
              8 FMCG Departments
            </span>
          </div>

          <div className="space-y-2.5 pt-1">
            {CATEGORY_DISTRIBUTION.map((cat) => (
              <div key={cat.name} className="flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-2 max-w-[200px]">
                  <span className="w-2.5 h-2.5 rounded-[4px] shrink-0" style={{ backgroundColor: cat.color }} />
                  <span className="font-sans text-[#52525b] truncate">{cat.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[#a1a1aa]">{cat.percentage}%</span>
                  <span className="font-bold text-black tabular-nums">{formatNaira(cat.amount)}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-[#e4e4e7] text-[11px] font-mono text-[#71717a] flex justify-between">
            <span>Fastest growing department: <strong className="text-black">Groceries (+18.4%)</strong></span>
          </div>
        </div>
      </div>

      {/* Daily Reconciliation Ledger Table */}
      <div className="bg-white border border-[#e4e4e7] rounded-xl card-stack-shadow overflow-hidden">
        <div className="px-6 py-4 bg-[#fbfbf5] border-b border-[#e4e4e7] flex items-center justify-between">
          <div>
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-black">
              Daily Settlement Ledger (Audit Reconciled)
            </h3>
            <p className="text-[11px] text-[#71717a] font-sans mt-0.5">
              Audited daily financial ledger cross-referenced with SQLite transaction logs
            </p>
          </div>
          <span className="text-xs font-mono text-[#a1a1aa]">
            Currency: Nigerian Naira (₦)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#fbfbf5] text-[#71717a] uppercase text-[10px] border-b border-[#e4e4e7] font-semibold">
              <tr>
                <th className="py-3.5 px-4">Audit Period</th>
                <th className="py-3.5 px-3 text-center">Settled Receipts</th>
                <th className="py-3.5 px-3 text-right">Gross Total (₦)</th>
                <th className="py-3.5 px-3 text-right">VAT (7.5%)</th>
                <th className="py-3.5 px-3 text-right">POS Card (₦)</th>
                <th className="py-3.5 px-3 text-right">Cash (₦)</th>
                <th className="py-3.5 px-3 text-right">Transfer (₦)</th>
                <th className="py-3.5 px-4 text-center">Audit Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e4e4e7]">
              {DAILY_AUDIT_LOGS.map((log) => (
                <tr key={log.date} className="hover:bg-[#fbfbf5] transition-colors">
                  <td className="py-3.5 px-4 font-bold text-black font-sans">
                    {log.date}
                  </td>
                  <td className="py-3.5 px-3 text-center text-[#52525b]">
                    {log.orders.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-3 text-right font-bold text-black tabular-nums">
                    {formatNaira(log.gross)}
                  </td>
                  <td className="py-3.5 px-3 text-right text-[#71717a] tabular-nums">
                    {formatNaira(log.vat)}
                  </td>
                  <td className="py-3.5 px-3 text-right text-black font-medium tabular-nums">
                    {formatNaira(log.card)}
                  </td>
                  <td className="py-3.5 px-3 text-right text-black font-medium tabular-nums">
                    {formatNaira(log.cash)}
                  </td>
                  <td className="py-3.5 px-3 text-right text-black font-medium tabular-nums">
                    {formatNaira(log.transfer)}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#c1fbd4] text-black border border-[#a8f5c2]">
                      <CheckCircle2 className="w-3 h-3" />
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
