"use client";

import React, { useState } from "react";
import { Clock } from "lucide-react";
import { HOURLY_SALES_DATA } from "@/data/analytics";
import { formatNaira } from "@/utils/formatters";

export default function HourlyTrafficChart() {
  const [activeHour, setActiveHour] = useState<number | null>(null);
  const data = HOURLY_SALES_DATA.slice(2, 12); // 10:00 to 19:00
  const maxTransactions = Math.max(...data.map((d) => d.transactions));

  return (
    <div className="bg-white border border-[#e4e4e7] rounded-xl p-6 card-stack-shadow flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-widest text-[#a1a1aa] font-semibold">
            Store Foot-Traffic & Till Load
          </span>
          <div className="flex items-baseline gap-2 mt-0.5">
            <h4 className="text-xl font-light font-mono text-black">
              1,284 Customers
            </h4>
            <span className="text-xs text-[#71717a] font-sans">
              peak velocity at 18:00 (Evening Rush)
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#71717a]">
          <span className="w-2 h-2 rounded-full bg-black"></span>
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
                <div className="absolute -top-12 z-20 bg-black text-white px-2.5 py-1.5 rounded-lg text-[10px] font-mono whitespace-nowrap shadow-xl border border-[#3f3f46] pointer-events-none">
                  <div className="font-semibold text-white">{item.transactions} orders</div>
                  <div className="text-[#c1fbd4]">{formatNaira(item.revenue)}</div>
                </div>
              )}

              {/* Bar */}
              <div className="w-full bg-[#fbfbf5] rounded-t-md overflow-hidden flex items-end h-[140px] border-b border-[#e4e4e7]">
                <div
                  className={`w-full rounded-t-md transition-all duration-300 ${
                    isPeak
                      ? "bg-black shadow-xs"
                      : isSelected
                      ? "bg-[#c1fbd4] border border-[#a8f2c2]"
                      : "bg-[#e4e4e7] group-hover:bg-[#c1fbd4]"
                  }`}
                  style={{ height: `${heightPercent}%` }}
                />
              </div>

              {/* X Label */}
              <span className="text-[10px] font-mono text-[#71717a] mt-2">
                {item.hour.slice(0, 2)}
              </span>
            </div>
          );
        })}
      </div>

      {/* Bottom Insights Banner */}
      <div className="pt-3 border-t border-[#e4e4e7] flex items-center justify-between text-xs text-[#71717a] font-sans">
        <span className="flex items-center gap-1.5 text-[11px] font-mono">
          <Clock className="w-3.5 h-3.5 text-[#a1a1aa]" />
          Average Checkout Time: <strong className="text-black">42 seconds</strong>
        </span>
        <span className="tag-mint text-[10px] px-2.5 py-0.5">
          Fleet Health: Optimal
        </span>
      </div>
    </div>
  );
}
