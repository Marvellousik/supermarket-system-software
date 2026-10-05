"use client";

import React, { useState } from "react";
import { Users, Zap, Clock } from "lucide-react";
import { HOURLY_SALES_DATA } from "@/data/analytics";
import { formatNaira } from "@/utils/formatters";

export default function HourlyTrafficChart() {
  const [activeHour, setActiveHour] = useState<number | null>(null);
  const data = HOURLY_SALES_DATA.slice(2, 12); // 10:00 to 19:00
  const maxTransactions = Math.max(...data.map((d) => d.transactions));

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold">
            Store Foot-Traffic & Till Load
          </span>
          <div className="flex items-baseline gap-2 mt-0.5">
            <h4 className="text-xl font-bold font-mono text-slate-900">
              1,284 Customers
            </h4>
            <span className="text-xs text-slate-500 font-sans">
              peak velocity at 18:00 (Evening Rush)
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-500">
          <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
          <span>Receipt Volume</span>
        </div>
      </div>

      {/* Bar Chart Area */}
      <div className="h-[180px] flex items-end gap-2 pt-6 pb-2">
        {data.map((item, index) => {
          const heightPercent = Math.round((item.transactions / maxTransactions) * 100);
          const isSelected = activeHour === index;
          const isPeak = item.transactions === maxTransactions;

          return (
            <div
              key={item.hour}
              className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer relative"
              onMouseEnter={() => setActiveHour(index)}
              onMouseLeave={() => setActiveHour(null)}
            >
              {/* Tooltip on Hover */}
              {isSelected && (
                <div className="absolute -top-12 z-20 bg-slate-900 text-white px-2 py-1 rounded-md text-[10px] font-mono whitespace-nowrap shadow-lg pointer-events-none">
                  <div className="font-bold">{item.transactions} orders</div>
                  <div className="text-emerald-400">{formatNaira(item.revenue)}</div>
                </div>
              )}

              {/* Bar */}
              <div className="w-full bg-slate-100 rounded-t-md overflow-hidden flex items-end h-[140px]">
                <div
                  className={`w-full rounded-t-md transition-all duration-300 ${
                    isPeak
                      ? "bg-emerald-600 shadow-xs"
                      : isSelected
                      ? "bg-emerald-500"
                      : "bg-slate-300 group-hover:bg-emerald-400"
                  }`}
                  style={{ height: `${heightPercent}%` }}
                />
              </div>

              {/* X Label */}
              <span className="text-[10px] font-mono text-slate-400 mt-2">
                {item.hour.slice(0, 2)}
              </span>
            </div>
          );
        })}
      </div>

      {/* Bottom Insights Banner */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-sans">
        <span className="flex items-center gap-1 text-[11px] font-mono">
          <Clock className="w-3 h-3 text-slate-400" />
          Average Checkout Time: <strong className="text-slate-800">42 seconds</strong>
        </span>
        <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-semibold">
          Fleet Health: Optimal
        </span>
      </div>
    </div>
  );
}
