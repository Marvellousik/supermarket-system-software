"use client";

import React from "react";
import {
  X,
  Receipt,
  Download,
  Printer,
  Calendar,
  UserCheck,
  Monitor,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Clock,
} from "lucide-react";
import { Order, Receipt as ReceiptEntity } from "@/types/Entities";
import { formatNaira, generateReceiptPDF } from "@/utils/formatters";

interface OrderDetailDrawerProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function OrderDetailDrawer({
  order,
  isOpen,
  onClose,
}: OrderDetailDrawerProps) {
  if (!isOpen || !order) return null;

  const handleDownloadPDF = () => {
    // Construct receipt object for PDF generator
    const receiptObj: ReceiptEntity = {
      id: order.id,
      receiptNumber: order.orderNumber,
      date: `${order.date} ${order.time}`,
      cashierName: order.cashierName,
      cashierId: 1,
      machineId: order.terminalId,
      items: order.items,
      subtotal: order.subtotal,
      tax: order.tax,
      discount: order.discount,
      total: order.total,
      paymentMethod: order.paymentMethod,
      amountTendered: order.total,
      change: 0,
    };
    generateReceiptPDF(receiptObj);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-sans">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-lg bg-[#fbfbf5] border-l border-[#e4e4e7] card-stack-shadow shadow-2xl flex flex-col h-full">
          {/* Header */}
          <div className="px-6 py-4 border-b border-[#e4e4e7] bg-white flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-sm font-bold font-mono text-black shrink-0">
                {order.orderNumber}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#c1fbd4] text-black border border-[#a8f5c2] shrink-0">
                {order.paymentStatus}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#e4e4e7] text-black border border-[#d4d4d8] shrink-0">
                {order.orderStatus}
              </span>
            </div>
            <button
              onClick={onClose}
              className="text-[#71717a] hover:text-black p-2 rounded-full hover:bg-[#fbfbf5] transition-colors cursor-pointer shrink-0 ml-2"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Dossier Body */}
          <div className="flex-1 min-h-0 overflow-y-auto p-6 space-y-6">
            {/* Amount Banner */}
            <div className="p-5 bg-white border border-[#e4e4e7] rounded-xl card-stack-shadow flex items-baseline justify-between font-mono">
              <div className="min-w-0 flex-1 mr-3">
                <span className="text-[10px] uppercase tracking-wider text-[#71717a] font-semibold block font-sans">
                  Total Settlement Amount
                </span>
                <span className="text-3xl font-medium text-black truncate block mt-1 tracking-tight">
                  {formatNaira(order.total)}
                </span>
              </div>
              <div className="text-right shrink-0">
                <span className="text-[10px] uppercase tracking-wider text-[#71717a] font-semibold block font-sans">
                  Payment Method
                </span>
                <span className="inline-block mt-1 text-xs font-semibold uppercase px-2.5 py-0.5 rounded-full bg-[#c1fbd4] text-black border border-[#a8f5c2]">
                  {order.paymentMethod}
                </span>
              </div>
            </div>

            {/* Audit Metadata Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-4 bg-white border border-[#e4e4e7] rounded-xl card-stack-shadow space-y-1 min-w-0">
                <div className="text-[10px] text-[#71717a] font-sans uppercase font-semibold tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#a1a1aa] shrink-0" /> Date & Time
                </div>
                <div className="font-semibold text-black truncate mt-1">{order.date}</div>
                <div className="text-[11px] text-[#71717a] truncate">{order.time}</div>
              </div>

              <div className="p-4 bg-white border border-[#e4e4e7] rounded-xl card-stack-shadow space-y-1 min-w-0">
                <div className="text-[10px] text-[#71717a] font-sans uppercase font-semibold tracking-wider flex items-center gap-1.5">
                  <Monitor className="w-3.5 h-3.5 text-[#a1a1aa] shrink-0" /> Terminal Station
                </div>
                <div className="font-semibold text-black truncate mt-1">Machine 0{order.terminalId}</div>
                <div className="text-[11px] text-[#71717a] truncate">Till Operator: {order.cashierName}</div>
              </div>
            </div>

            {/* Customer Information */}
            <div className="p-4 bg-white border border-[#e4e4e7] rounded-xl card-stack-shadow text-xs space-y-1 min-w-0">
              <div className="text-[10px] font-mono text-[#71717a] uppercase tracking-wider font-semibold">
                Customer Account
              </div>
              <div className="font-semibold text-black truncate text-sm">{order.customerName}</div>
              {order.customerPhone && (
                <div className="text-[11px] font-mono text-[#71717a] truncate">{order.customerPhone}</div>
              )}
            </div>

            {/* Itemized Line Items Table */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-[#71717a] uppercase tracking-wider font-semibold px-1">
                <span>Itemized Cart List ({order.items.length} Lines)</span>
                <span>Subtotal</span>
              </div>

              <div className="border border-[#e4e4e7] rounded-xl overflow-hidden divide-y divide-[#e4e4e7] bg-white card-stack-shadow">
                {order.items.map((item, idx) => (
                  <div key={idx} className="p-3.5 flex items-center justify-between text-xs hover:bg-[#fbfbf5] gap-3 transition-colors">
                    <div className="pr-3 min-w-0 flex-1">
                      <div className="font-medium text-black leading-tight truncate">
                        {item.name}
                      </div>
                      <div className="text-[11px] font-mono text-[#a1a1aa] mt-0.5 truncate">
                        {item.quantity} × {formatNaira(item.price)}
                      </div>
                    </div>
                    <div className="font-mono font-bold text-black shrink-0 text-right tabular-nums">
                      {formatNaira(item.total)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals Breakdown */}
            <div className="p-5 bg-white border border-[#e4e4e7] rounded-xl card-stack-shadow space-y-2.5 text-xs font-mono">
              <div className="flex justify-between text-[#52525b]">
                <span>Subtotal Ext:</span>
                <span className="font-semibold text-black tabular-nums">{formatNaira(order.subtotal)}</span>
              </div>
              {order.tax > 0 && (
                <div className="flex justify-between text-[#52525b]">
                  <span>VAT (7.5%):</span>
                  <span className="tabular-nums">{formatNaira(order.tax)}</span>
                </div>
              )}
              {order.discount > 0 && (
                <div className="flex justify-between text-black font-semibold">
                  <span>Discount Applied:</span>
                  <span className="tabular-nums">-{formatNaira(order.discount)}</span>
                </div>
              )}
              <div className="pt-3 border-t border-[#e4e4e7] flex justify-between font-bold text-sm text-black">
                <span>Settled Total:</span>
                <span className="text-black text-base tabular-nums">{formatNaira(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Footer Actions - Strict DESIGN.md Pill Vocabulary */}
          <div className="p-4 bg-white border-t border-[#e4e4e7] flex items-center gap-3 shrink-0">
            <button
              onClick={handleDownloadPDF}
              className="btn-aloe-pill flex-1 py-2.5 text-xs font-semibold shadow-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 shrink-0" />
              <span>Download Receipt PDF</span>
            </button>
            <button
              onClick={handlePrint}
              className="btn-primary-pill px-5 py-2.5 text-xs font-medium flex items-center gap-1.5 cursor-pointer shrink-0 shadow-xs"
            >
              <Printer className="w-3.5 h-3.5 shrink-0" />
              <span>Print</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
