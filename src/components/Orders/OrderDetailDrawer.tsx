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
        className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-lg bg-white border-l border-slate-200 shadow-2xl flex flex-col h-full">
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-sm font-bold font-mono text-slate-900 shrink-0">
                {order.orderNumber}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                {order.paymentStatus}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 shrink-0">
                {order.orderStatus}
              </span>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer shrink-0 ml-2"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Dossier Body */}
          <div className="flex-1 min-h-0 overflow-y-auto p-6 space-y-6">
            {/* Amount Banner */}
            <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl flex items-baseline justify-between font-mono">
              <div className="min-w-0 flex-1 mr-3">
                <span className="text-[10px] uppercase text-slate-400 font-semibold block font-sans">
                  Total Settlement Amount
                </span>
                <span className="text-2xl font-bold text-slate-900 truncate block">
                  {formatNaira(order.total)}
                </span>
              </div>
              <div className="text-right shrink-0">
                <span className="text-[10px] uppercase text-slate-400 font-semibold block font-sans">
                  Payment Method
                </span>
                <span className="text-xs font-bold uppercase text-emerald-700">
                  {order.paymentMethod}
                </span>
              </div>
            </div>

            {/* Audit Metadata Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1 min-w-0">
                <div className="text-[10px] text-slate-400 font-sans uppercase font-bold flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-400 shrink-0" /> Date & Time
                </div>
                <div className="font-bold text-slate-800 truncate">{order.date}</div>
                <div className="text-[11px] text-slate-500 truncate">{order.time}</div>
              </div>

              <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1 min-w-0">
                <div className="text-[10px] text-slate-400 font-sans uppercase font-bold flex items-center gap-1">
                  <Monitor className="w-3 h-3 text-slate-400 shrink-0" /> Terminal Station
                </div>
                <div className="font-bold text-emerald-700 truncate">Machine 0{order.terminalId}</div>
                <div className="text-[11px] text-slate-500 truncate">Till Operator: {order.cashierName}</div>
              </div>
            </div>

            {/* Customer Information */}
            <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs space-y-1 min-w-0">
              <div className="text-[10px] font-mono text-slate-400 uppercase font-bold">
                Customer Account
              </div>
              <div className="font-bold text-slate-900 truncate">{order.customerName}</div>
              {order.customerPhone && (
                <div className="text-[11px] font-mono text-slate-500 truncate">{order.customerPhone}</div>
              )}
            </div>

            {/* Itemized Line Items Table */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400 uppercase font-bold">
                <span>Itemized Cart List ({order.items.length} Lines)</span>
                <span>Subtotal</span>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 bg-white">
                {order.items.map((item, idx) => (
                  <div key={idx} className="p-3 flex items-center justify-between text-xs hover:bg-slate-50 gap-3">
                    <div className="pr-3 min-w-0 flex-1">
                      <div className="font-semibold text-slate-900 leading-tight truncate">
                        {item.name}
                      </div>
                      <div className="text-[11px] font-mono text-slate-400 mt-0.5 truncate">
                        {item.quantity} × {formatNaira(item.price)}
                      </div>
                    </div>
                    <div className="font-mono font-bold text-slate-900 shrink-0 text-right">
                      {formatNaira(item.total)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals Breakdown */}
            <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl space-y-2 text-xs font-mono">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal Ext:</span>
                <span className="font-semibold text-slate-900">{formatNaira(order.subtotal)}</span>
              </div>
              {order.tax > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>VAT (7.5%):</span>
                  <span>{formatNaira(order.tax)}</span>
                </div>
              )}
              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Discount Applied:</span>
                  <span>-{formatNaira(order.discount)}</span>
                </div>
              )}
              <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-sm text-slate-900">
                <span>Settled Total:</span>
                <span className="text-emerald-700">{formatNaira(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center gap-3 shrink-0">
            <button
              onClick={handleDownloadPDF}
              className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer btn-tactile"
            >
              <Download className="w-3.5 h-3.5 shrink-0" />
              <span>Download Receipt PDF</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold rounded-lg text-xs transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
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
