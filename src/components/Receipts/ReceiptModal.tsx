"use client";

import React from "react";
import { Download, Printer, Store, UserCheck, ExternalLink } from "lucide-react";
import { Receipt } from "@/types/Entities";
import { formatNaira, generateReceiptPDF, openReceiptPrintWindow } from "@/utils/formatters";

interface ReceiptModalProps {
  receipt: Receipt | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ReceiptModal({
  receipt,
  isOpen,
  onClose,
}: ReceiptModalProps) {
  if (!isOpen || !receipt) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    generateReceiptPDF(receipt);
  };

  const handleOpenPDFTab = () => {
    openReceiptPrintWindow(receipt);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto font-sans">
      <div className="bg-white border border-slate-200 rounded-lg w-full max-w-md overflow-hidden shadow-2xl flex flex-col my-8 max-h-[90vh]">
        {/* Top Header Bar */}
        <div className="bg-slate-50 px-5 py-3 text-slate-800 border-b border-slate-200 flex items-center justify-between font-mono text-xs shrink-0">
          <span className="font-bold uppercase tracking-wider text-slate-900 truncate">
            Receipt: {receipt.receiptNumber}
          </span>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 font-mono cursor-pointer shrink-0 ml-2"
          >
            [X]
          </button>
        </div>

        {/* Receipt Paper Card Container */}
        <div className="p-5 bg-slate-100 flex-1 min-h-0 overflow-y-auto">
          <div
            id="printable-receipt-card"
            className="bg-white text-slate-900 p-5 rounded font-mono text-xs shadow-md border border-slate-200"
          >
            {/* Store Header */}
            <div className="text-center pb-3 border-b border-dashed border-slate-300">
              <div className="flex items-center justify-center gap-1.5 font-bold text-sm text-slate-900 uppercase tracking-wider mb-0.5">
                <Store className="w-3.5 h-3.5 text-slate-700" />
                SHOPPING CENTER SUPERMARKET
              </div>
              <p className="text-[10px] text-slate-500">14 Adeola Odeku St, Victoria Island, Lagos</p>
              <p className="text-[10px] text-slate-500">Tel: +234 802 345 6789 | Currency: NGN (₦)</p>
            </div>

            {/* Receipt Meta */}
            <div className="py-2.5 border-b border-dashed border-slate-300 space-y-1 text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-500">Receipt No:</span>
                <span className="font-bold text-slate-900">{receipt.receiptNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Date/Time:</span>
                <span className="text-slate-800">{receipt.date}</span>
              </div>
              <div className="flex justify-between items-center bg-slate-100 px-2 py-1 rounded font-bold text-slate-900 border border-slate-200">
                <span className="flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5 text-slate-600" />
                  Processed by:
                </span>
                <span className="uppercase text-emerald-700">{receipt.cashierName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Terminal Register:</span>
                <span className="font-bold text-slate-900">Machine 0{receipt.machineId}</span>
              </div>
            </div>

            {/* Items Table */}
            <div className="py-2.5 border-b border-dashed border-slate-300">
              <div className="grid grid-cols-12 font-bold text-[10px] text-slate-500 mb-1.5 border-b border-slate-200 pb-1">
                <span className="col-span-2">QTY</span>
                <span className="col-span-5">DESCRIPTION</span>
                <span className="col-span-2 text-right">UNIT</span>
                <span className="col-span-3 text-right">TOTAL</span>
              </div>

              <div className="space-y-1.5">
                {receipt.items.map((item, idx) => (
                  <div key={idx} className="grid grid-cols-12 text-[11px] items-start">
                    <span className="col-span-2 font-mono font-medium text-slate-700">{item.quantity}x</span>
                    <div className="col-span-5 pr-1">
                      <p className="font-semibold text-slate-900 leading-tight">{item.name}</p>
                      <p className="text-[9px] text-slate-400 font-mono">[{item.barcode}]</p>
                    </div>
                    <span className="col-span-2 text-right text-slate-600">
                      {formatNaira(item.price)}
                    </span>
                    <span className="col-span-3 text-right font-bold text-slate-900">
                      {formatNaira(item.total)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals in Naira */}
            <div className="py-2.5 border-b border-dashed border-slate-300 space-y-1 text-[11px]">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="text-slate-900 font-semibold">{formatNaira(receipt.subtotal)}</span>
              </div>
              {receipt.tax > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>VAT (7.5%):</span>
                  <span className="text-slate-900">{formatNaira(receipt.tax)}</span>
                </div>
              )}
              {receipt.discount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Discount:</span>
                  <span>-{formatNaira(receipt.discount)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-sm text-slate-900 pt-1 border-t border-slate-200">
                <span>TOTAL AMOUNT:</span>
                <span className="text-emerald-700 font-mono text-base">{formatNaira(receipt.total)}</span>
              </div>
            </div>

            {/* Tendered & Change */}
            <div className="py-2.5 border-b border-dashed border-slate-300 space-y-1 text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-500">Payment Tender:</span>
                <span className="font-bold uppercase text-slate-900">{receipt.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Amount Tendered:</span>
                <span className="font-bold text-slate-900">{formatNaira(receipt.amountTendered)}</span>
              </div>
              {receipt.paymentMethod === "cash" && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>Change Given:</span>
                  <span>{formatNaira(receipt.change)}</span>
                </div>
              )}
            </div>

            {/* Footer & Barcode string */}
            <div className="text-center pt-3 space-y-1">
              <p className="font-bold text-[10px] text-slate-700">
                THANK YOU FOR YOUR PATRONAGE
              </p>
              <p className="text-[9px] text-slate-400">
                Exchange within 48h with original receipt
              </p>
              <div className="pt-1 text-center font-mono">
                <div className="tracking-widest text-sm font-bold text-slate-800">
                  |||| | |||||| || |||| |||||| |||
                </div>
                <p className="text-[9px] text-slate-400 tracking-wider">
                  *{receipt.receiptNumber}*
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Local Disk Location Notice */}
        <div className="px-5 py-2.5 bg-slate-50 border-t border-slate-200 text-[11px] font-mono flex items-center justify-between text-slate-600 shrink-0">
          <span className="text-slate-400">Local Disk File:</span>
          <span className="text-emerald-700 font-bold select-all">
            data/receipts/Receipt-{receipt.receiptNumber}.pdf
          </span>
        </div>

        {/* Actions */}
        <div className="p-4 bg-white border-t border-slate-200 flex flex-col gap-2 shrink-0">
          <button
            onClick={handleDownloadPDF}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-mono font-bold rounded-md shadow-xs text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Receipt PDF</span>
          </button>

          <div className="grid grid-cols-2 gap-2 font-mono text-xs">
            <button
              onClick={handleOpenPDFTab}
              className="py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-md shadow-2xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer font-medium"
              title="Open full printable PDF in new tab"
            >
              <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
              <span>Open PDF / Print</span>
            </button>
            <button
              onClick={handlePrint}
              className="py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-md shadow-2xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer font-medium"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span>Direct Print</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="w-full py-1.5 text-center text-xs font-mono text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
          >
            [ Close Window ]
          </button>
        </div>
      </div>
    </div>
  );
}
