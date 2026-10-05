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
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="w-full space-y-5 font-sans text-slate-800">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200/80">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
            Customer Loyalty & Relationship CRM
          </h1>
          <p className="text-sm font-normal text-slate-500 mt-1">
            Member tiers, reward points tracking & high-value shopper retention
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-[11px] font-medium text-slate-500 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-2xs">
            Registry: <strong className="text-slate-900 font-bold">{totalMembers.toLocaleString()} Enrolled Shoppers</strong>
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-xs">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block">Active Shoppers</span>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1 tracking-tight tabular-nums">{totalMembers.toLocaleString()}</div>
          <span className="text-[11px] font-semibold text-emerald-800">+14 new this week</span>
        </div>

        <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-xs">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block">VIP Tier Members</span>
          <div className="text-2xl sm:text-3xl font-bold text-purple-700 mt-1 tracking-tight tabular-nums">84 Diamond</div>
          <span className="text-[11px] font-normal text-slate-500">Top 6% spenders</span>
        </div>

        <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-xs">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block">Avg Member LTV</span>
          <div className="text-2xl sm:text-3xl font-bold text-emerald-700 mt-1 tracking-tight tabular-nums">{formatNaira(642000)}</div>
          <span className="text-[11px] font-normal text-slate-500">Lifetime retail spend</span>
        </div>

        <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-xs">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block">Loyalty Points Issued</span>
          <div className="text-2xl sm:text-3xl font-bold text-amber-700 mt-1 tracking-tight tabular-nums">48,200 pts</div>
          <span className="text-[11px] font-normal text-slate-500">Redeemable at till</span>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white border border-slate-200 shadow-xs p-3 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search customer, phone, email..."
              className="w-full bg-slate-50 border border-slate-300 focus:bg-white focus:border-emerald-600 pl-8 pr-3 py-1.5 rounded-lg text-slate-900 placeholder-slate-400 text-xs focus:outline-none transition-colors"
            />
          </div>

          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs font-sans">
            {["all", "diamond", "platinum", "gold", "silver"].map((t) => (
              <button
                key={t}
                onClick={() => setTierFilter(t)}
                className={`px-3 py-1 rounded-md capitalize cursor-pointer transition-all ${
                  tierFilter === t ? "bg-white font-bold text-slate-900 shadow-2xs" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {t === "all" ? "All Tiers" : t}
              </button>
            ))}
          </div>
        </div>

        <span className="text-slate-400 font-mono text-xs">
          Showing {filteredCustomers.length} accounts
        </span>
      </div>

      {/* Customers Table */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-slate-50/80 text-slate-500 uppercase text-[10px] font-mono border-b border-slate-200 font-bold">
              <tr>
                <th className="py-3 px-4">Member Name</th>
                <th className="py-3 px-3">Loyalty Tier</th>
                <th className="py-3 px-3">Phone & Email</th>
                <th className="py-3 px-3 font-mono text-right">Lifetime Spend (₦)</th>
                <th className="py-3 px-3 text-center">Store Visits</th>
                <th className="py-3 px-3">Last Checkout</th>
                <th className="py-3 px-3 font-mono text-right">Reward Points</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCustomers.map((cust) => (
                <tr key={cust.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-900">
                    {cust.name}
                  </td>

                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getTierBadge(cust.tier)}`}>
                      {cust.tier}
                    </span>
                  </td>

                  <td className="py-3 px-3 text-slate-600 font-mono text-[11px]">
                    <div>{cust.phone}</div>
                    <div className="text-slate-400">{cust.email}</div>
                  </td>

                  <td className="py-3 px-3 font-mono font-bold text-slate-900 text-right">
                    {formatNaira(cust.totalSpend)}
                  </td>

                  <td className="py-3 px-3 text-center font-mono text-slate-700">
                    {cust.visitCount} visits
                  </td>

                  <td className="py-3 px-3 text-slate-500 text-[11px] font-mono">
                    {cust.lastVisit}
                  </td>

                  <td className="py-3 px-3 font-mono font-bold text-emerald-700 text-right">
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
