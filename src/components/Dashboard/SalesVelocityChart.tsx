"use client";

import React, { useState } from "react";
import { TrendingUp } from "lucide-react";
import { HourlySalesPoint, HOURLY_SALES_DATA } from "@/data/analytics";
import { formatNaira } from "@/utils/formatters";

export default function SalesVelocityChart() {
  const [timeRange, setTimeRange] = useState<"today" | "week" | "month">("today");
  const [hoveredPoint, setHoveredPoint] = useState<HourlySalesPoint | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const data = HOURLY_SALES_DATA;
  const maxRevenue = Math.max(...data.map((d) => d.revenue));

  // Chart dimensions
  const width = 640;
  const height = 220;
  const paddingX = 35;
  const paddingY = 25;

  const getX = (index: number) => {
    return paddingX + (index / (data.length - 1)) * (width - paddingX * 2);
  };

  const getY = (value: number) => {
    return height - paddingY - (value / maxRevenue) * (height - paddingY * 2);
  };

  // Construct smooth bezier curve path
  const points = data.map((d, i) => ({ x: getX(i), y: getY(d.revenue) }));

  let pathD = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i === 0 ? 0 : i - 1];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] || p2;

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    pathD += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }

  // Construct closed area path for subtle gradient fill
  const areaD = `${pathD} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`;

  const totalVolume = data.reduce((sum, d) => sum + d.revenue, 0);

  return (
    <div className="bg-white border border-[#e4e4e7] rounded-xl p-6 card-stack-shadow flex flex-col justify-between">
      {/* Chart Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#a1a1aa] font-semibold">
              Real-time Sales Velocity
            </span>
            <span className="tag-mint text-[10px] px-2 py-0.5">
              <TrendingUp className="w-2.5 h-2.5" /> +12.8% vs yesterday
            </span>
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <h3 className="text-2xl font-light font-mono text-black tracking-tight">
              {formatNaira(totalVolume)}
            </h3>
            <span className="text-xs text-[#71717a] font-sans">
              accumulated today across 4 active registers
            </span>
          </div>
        </div>

        {/* Time Filter Pills - STRICT PILLS */}
        <div className="flex items-center bg-[#fbfbf5] p-1 rounded-full border border-[#e4e4e7] font-sans text-xs">
          {(["today", "week", "month"] as const).map((r) => (
            <button
              key={r}
              onClick={() => setTimeRange(r)}
              className={`px-3.5 py-1 rounded-full text-xs transition-all cursor-pointer ${
                timeRange === r
                  ? "bg-black text-white font-semibold shadow-xs"
                  : "text-[#71717a] hover:text-black font-medium"
              }`}
            >
              {r === "today" ? "Today" : r === "week" ? "Last 7 Days" : "Last 30 Days"}
            </button>
          ))}
        </div>
      </div>

      {/* SVG Interactive Curve */}
      <div className="relative w-full h-[220px]">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full overflow-visible"
          onMouseLeave={() => {
            setHoveredPoint(null);
            setHoveredIndex(null);
          }}
        >
          <defs>
            <linearGradient id="velocityGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#c1fbd4" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#c1fbd4" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const y = height - paddingY - ratio * (height - paddingY * 2);
            return (
              <g key={ratio}>
                <line
                  x1={paddingX}
                  y1={y}
                  x2={width - paddingX}
                  y2={y}
                  stroke="#e4e4e7"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
                <text
                  x={paddingX - 6}
                  y={y + 3}
                  textAnchor="end"
                  className="text-[9px] fill-[#a1a1aa] font-mono"
                >
                  ₦{Math.round((maxRevenue * ratio) / 1000)}k
                </text>
              </g>
            );
          })}

          {/* Area Fill */}
          <path d={areaD} fill="url(#velocityGradient)" />

          {/* Line Stroke */}
          <path
            d={pathD}
            fill="none"
            stroke="#000000"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data Points & Hover Targets */}
          {points.map((p, i) => {
            const isHovered = hoveredIndex === i;
            return (
              <g key={i}>
                {/* Visible dot */}
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={isHovered ? 5 : 2.5}
                  fill={isHovered ? "#000000" : "#ffffff"}
                  stroke="#000000"
                  strokeWidth={isHovered ? 2 : 1.5}
                  className="transition-all duration-150"
                />

                {/* Vertical hover guide line */}
                {isHovered && (
                  <line
                    x1={p.x}
                    y1={paddingY}
                    x2={p.x}
                    y2={height - paddingY}
                    stroke="#a1a1aa"
                    strokeWidth="1"
                    strokeDasharray="3 3"
                  />
                )}

                {/* Invisible hover trigger */}
                <rect
                  x={p.x - 18}
                  y={0}
                  width={36}
                  height={height}
                  fill="transparent"
                  className="cursor-pointer"
                  onMouseEnter={() => {
                    setHoveredPoint(data[i]);
                    setHoveredIndex(i);
                  }}
                />
              </g>
            );
          })}

          {/* X-axis labels */}
          {data.map((d, i) => {
            if (i % 2 !== 0 && i !== data.length - 1) return null;
            return (
              <text
                key={i}
                x={getX(i)}
                y={height - 6}
                textAnchor="middle"
                className="text-[9px] fill-[#71717a] font-mono"
              >
                {d.hour}
              </text>
            );
          })}
        </svg>

        {/* Hover Tooltip Box */}
        {hoveredPoint && hoveredIndex !== null && (
          <div
            className="absolute z-20 pointer-events-none -translate-x-1/2 -translate-y-full pb-2"
            style={{
              left: `${(points[hoveredIndex].x / width) * 100}%`,
              top: `${(points[hoveredIndex].y / height) * 100}%`,
            }}
          >
            <div className="bg-black text-white px-3 py-2 rounded-xl shadow-xl text-xs font-mono whitespace-nowrap border border-[#3f3f46]">
              <div className="text-[10px] text-[#a1a1aa] uppercase font-sans font-medium">
                {hoveredPoint.hour} Window
              </div>
              <div className="font-bold text-[#c1fbd4] text-xs">
                {formatNaira(hoveredPoint.revenue)}
              </div>
              <div className="text-[10px] text-white font-sans">
                {hoveredPoint.transactions} receipts generated
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
