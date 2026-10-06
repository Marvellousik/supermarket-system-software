"use client";

import React, { useState } from "react";
import {
  Users,
  Award,
  Search,
  Phone,
  Mail,
  Calendar,
  Sparkles,
  TrendingUp,
  Download,
  CheckCircle2,
} from "lucide-react";
import { Customer } from "@/types/Entities";
import { INITIAL_CUSTOMERS } from "@/data/customers";
import { formatNaira } from "@/utils/formatters";

export default function CustomersView() {
  const [customers, setCustomers] = useState<Customer[]>(INITIAL_CUSTOMERS);
  const [searchQuery, setSearchQuery] = useState("");
  const [tierFilter, setTierFilter] = useState<string>("all");

  const filteredCustomers = customers.filter((c) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      c.name.toLowerCase().includes(q) ||
      c.phone.includes(q) ||
      c.email.toLowerCase().includes(q);

    const matchesTier = tierFilter === "all" || c.tier.toLowerCase() === tierFilter.toLowerCase();
    return matchesSearch && matchesTier;
  });

  const totalMembers = 1420;
  const totalSpendAll = customers.reduce((sum, c) => sum + c.totalSpend, 0);

  const getTierBadge = (tier: Customer["tier"]) => {
    switch (tier) {
      case "Diamond":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "Platinum":
        return "bg-emerald-50 text-emerald-800 border-emerald-200";
      case "Gold":
        return "bg-amber-50 text-amber-700 border-amber-200";
      default:
        return "bg-[#f4f4f5] text-[#52525b] border-[#e4e4e7]";
    }
  };

  return (
    <div className="w-full space-y-6 font-sans text-black">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#e4e4e7]">
        <div>
          <h1 className="text-3xl sm:text-4xl display-thin text-black tracking-tight">
            Customer Loyalty & Relationship CRM
          </h1>
          <p className="text-sm font-normal text-[#52525b] mt-1">
            Member tiers, reward points tracking & high-value shopper retention
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-[11px] font-mono text-[#52525b] bg-white border border-[#e4e4e7] px-3.5 py-1.5 rounded-full card-stack-shadow">
            Registry: <strong className="text-black font-bold">{totalMembers.toLocaleString()} Enrolled Shoppers</strong>
          </span>
        </div>
      </div>

      {/* KPI Cards - Fully Contained Flex/Grid Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
        <div className="p-5 bg-white border border-[#e4e4e7] rounded-xl card-stack-shadow min-w-0 overflow-hidden flex flex-col justify-between">
          <span className="text-xs font-mono uppercase tracking-wider text-[#71717a] block truncate">Active Shoppers</span>
          <div className="text-xl sm:text-2xl lg:text-3xl font-medium text-black mt-2 tracking-tight tabular-nums truncate">{totalMembers.toLocaleString()}</div>
          <span className="inline-block mt-2 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#c1fbd4] text-black border border-[#a8f5c2] truncate w-fit">
            +14 new this week
          </span>
        </div>

        <div className="p-5 bg-white border border-[#e4e4e7] rounded-xl card-stack-shadow min-w-0 overflow-hidden flex flex-col justify-between">
          <span className="text-xs font-mono uppercase tracking-wider text-[#71717a] block truncate">VIP Tier Members</span>
          <div className="text-xl sm:text-2xl lg:text-3xl font-medium text-black mt-2 tracking-tight tabular-nums truncate">84 Diamond</div>
          <span className="text-[11px] font-normal text-[#71717a] mt-2 block truncate">Top 6% spenders</span>
        </div>

        <div className="p-5 bg-white border border-[#e4e4e7] rounded-xl card-stack-shadow min-w-0 overflow-hidden flex flex-col justify-between">
          <span className="text-xs font-mono uppercase tracking-wider text-[#71717a] block truncate">Avg Member LTV</span>
          <div className="text-xl sm:text-2xl lg:text-3xl font-medium text-black mt-2 tracking-tight tabular-nums truncate" title={formatNaira(642000)}>{formatNaira(642000)}</div>
          <span className="text-[11px] font-normal text-[#71717a] mt-2 block truncate">Lifetime retail spend</span>
        </div>

        <div className="p-5 bg-white border border-[#e4e4e7] rounded-xl card-stack-shadow min-w-0 overflow-hidden flex flex-col justify-between">
          <span className="text-xs font-mono uppercase tracking-wider text-[#71717a] block truncate">Loyalty Points Issued</span>
          <div className="text-xl sm:text-2xl lg:text-3xl font-medium text-black mt-2 tracking-tight tabular-nums truncate">48,200 pts</div>
          <span className="text-[11px] font-normal text-[#71717a] mt-2 block truncate">Redeemable at till</span>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white border border-[#e4e4e7] card-stack-shadow p-4 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-64">
            <Search className="w-3.5 h-3.5 text-[#a1a1aa] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search customer, phone, email..."
              className="w-full bg-white border border-[#e4e4e7] focus:border-black pl-8 pr-3 py-2 rounded-md text-black placeholder:text-[#a1a1aa] text-xs focus:outline-none transition-colors"
            />
          </div>

          <div className="flex items-center bg-[#fbfbf5] p-1 rounded-full border border-[#e4e4e7] text-xs font-sans">
            {["all", "diamond", "platinum", "gold", "silver"].map((t) => (
              <button
                key={t}
                onClick={() => setTierFilter(t)}
                className={`px-3.5 py-1.5 rounded-full capitalize cursor-pointer transition-all text-xs ${
                  tierFilter === t
                    ? "bg-black font-semibold text-white shadow-xs"
                    : "text-[#52525b] hover:text-black"
                }`}
              >
                {t === "all" ? "All Tiers" : t}
              </button>
            ))}
          </div>
        </div>

        <span className="text-[#a1a1aa] font-mono text-xs">
          Showing {filteredCustomers.length} accounts
        </span>
      </div>

      {/* Customers Table */}
      <div className="bg-white border border-[#e4e4e7] rounded-xl card-stack-shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-[#fbfbf5] text-[#71717a] uppercase text-[10px] font-mono border-b border-[#e4e4e7] font-semibold">
              <tr>
                <th className="py-3.5 px-4">Member Name</th>
                <th className="py-3.5 px-3">Loyalty Tier</th>
                <th className="py-3.5 px-3">Phone & Email</th>
                <th className="py-3.5 px-3 font-mono text-right">Lifetime Spend (₦)</th>
                <th className="py-3.5 px-3 text-center">Store Visits</th>
                <th className="py-3.5 px-3">Last Checkout</th>
                <th className="py-3.5 px-3 font-mono text-right">Reward Points</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e4e4e7]">
              {filteredCustomers.map((cust) => (
                <tr key={cust.id} className="hover:bg-[#fbfbf5] transition-colors">
                  <td className="py-3.5 px-4 font-bold text-black">
                    {cust.name}
                  </td>

                  <td className="py-3.5 px-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                      cust.tier === "Diamond"
                        ? "bg-black text-white border-black"
                        : cust.tier === "Platinum"
                        ? "bg-[#c1fbd4] text-black border-[#a8f5c2]"
                        : cust.tier === "Gold"
                        ? "bg-[#d4f9e0] text-black border-[#a8f2c2]"
                        : "bg-[#e4e4e7] text-black border-[#d4d4d8]"
                    }`}>
                      {cust.tier}
                    </span>
                  </td>

                  <td className="py-3.5 px-3 text-[#52525b] font-mono text-[11px]">
                    <div>{cust.phone}</div>
                    <div className="text-[#a1a1aa]">{cust.email}</div>
                  </td>

                  <td className="py-3.5 px-3 font-mono font-bold text-black text-right tabular-nums">
                    {formatNaira(cust.totalSpend)}
                  </td>

                  <td className="py-3.5 px-3 text-center font-mono text-[#52525b]">
                    {cust.visitCount} visits
                  </td>

                  <td className="py-3.5 px-3 text-[#71717a] text-[11px] font-mono">
                    {cust.lastVisit}
                  </td>

                  <td className="py-3.5 px-3 font-mono font-bold text-black text-right tabular-nums">
                    {cust.loyaltyPoints.toLocaleString()} pts
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
