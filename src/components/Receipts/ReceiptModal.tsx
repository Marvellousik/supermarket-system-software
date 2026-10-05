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
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto font-sans">
      <div className="bg-white border border-[#e4e4e7] rounded-2xl w-full max-w-md overflow-hidden card-stack-shadow flex flex-col my-8 max-h-[90vh]">
        {/* Top Header Bar */}
        <div className="bg-[#fbfbf5] px-6 py-4 text-black border-b border-[#e4e4e7] flex items-center justify-between font-mono text-xs shrink-0">
          <span className="font-bold uppercase tracking-wider text-black truncate">
            Receipt: {receipt.receiptNumber}
          </span>
          <button
            onClick={onClose}
            className="text-[#71717a] hover:text-black p-1.5 rounded-full hover:bg-[#e4e4e7]/50 transition-colors cursor-pointer shrink-0 ml-2"
          >
            ✕
          </button>
        </div>

        {/* Receipt Paper Card Container */}
        <div className="p-6 bg-[#fbfbf5] flex-1 min-h-0 overflow-y-auto">
          <div
            id="printable-receipt-card"
            className="bg-white text-black p-6 rounded-2xl font-mono text-xs card-stack-shadow border border-[#e4e4e7]"
          >
            {/* Store Header */}
            <div className="text-center pb-4 border-b border-dashed border-[#d4d4d8]">
              <div className="flex items-center justify-center gap-2 font-bold text-sm text-black uppercase tracking-wider mb-1">
                <Store className="w-4 h-4 text-black" />
                SHOPPING CENTER SUPERMARKET
              </div>
              <p className="text-[10px] text-[#71717a]">14 Adeola Odeku St, Victoria Island, Lagos</p>
              <p className="text-[10px] text-[#71717a]">Tel: +234 802 345 6789 | Currency: NGN (₦)</p>
            </div>

            {/* Receipt Meta */}
            <div className="py-3 border-b border-dashed border-[#d4d4d8] space-y-1.5 text-[11px]">
              <div className="flex justify-between">
                <span className="text-[#71717a]">Receipt No:</span>
                <span className="font-bold text-black">{receipt.receiptNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#71717a]">Date/Time:</span>
                <span className="text-[#52525b]">{receipt.date}</span>
              </div>
              <div className="flex justify-between items-center bg-[#fbfbf5] px-2.5 py-1 rounded-full font-bold text-black border border-[#e4e4e7]">
                <span className="flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-[#52525b]" />
                  Processed by:
                </span>
                <span className="uppercase text-black font-semibold">{receipt.cashierName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#71717a]">Terminal Register:</span>
                <span className="font-bold text-black">Machine 0{receipt.machineId}</span>
              </div>
            </div>

            {/* Items Table */}
            <div className="py-3 border-b border-dashed border-[#d4d4d8]">
              <div className="grid grid-cols-12 font-bold text-[10px] text-[#71717a] mb-2 border-b border-[#e4e4e7] pb-1">
                <span className="col-span-2">QTY</span>
                <span className="col-span-5">DESCRIPTION</span>
                <span className="col-span-2 text-right">UNIT</span>
                <span className="col-span-3 text-right">TOTAL</span>
              </div>

              <div className="space-y-2">
                {receipt.items.map((item, idx) => (
                  <div key={idx} className="grid grid-cols-12 text-[11px] items-start">
                    <span className="col-span-2 font-mono font-medium text-[#52525b]">{item.quantity}x</span>
                    <div className="col-span-5 pr-1">
                      <p className="font-medium text-black leading-tight">{item.name}</p>
                      <p className="text-[9px] text-[#a1a1aa] font-mono">[{item.barcode}]</p>
                    </div>
                    <span className="col-span-2 text-right text-[#52525b] tabular-nums">
                      {formatNaira(item.price)}
                    </span>
                    <span className="col-span-3 text-right font-bold text-black tabular-nums">
                      {formatNaira(item.total)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals in Naira */}
            <div className="py-3 border-b border-dashed border-[#d4d4d8] space-y-1.5 text-[11px]">
              <div className="flex justify-between text-[#52525b]">
                <span>Subtotal:</span>
                <span className="text-black font-semibold tabular-nums">{formatNaira(receipt.subtotal)}</span>
              </div>
              {receipt.tax > 0 && (
                <div className="flex justify-between text-[#52525b]">
                  <span>VAT (7.5%):</span>
                  <span className="text-black tabular-nums">{formatNaira(receipt.tax)}</span>
                </div>
              )}
              {receipt.discount > 0 && (
                <div className="flex justify-between text-black font-semibold">
                  <span>Discount:</span>
                  <span className="tabular-nums">-{formatNaira(receipt.discount)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-sm text-black pt-1.5 border-t border-[#e4e4e7]">
                <span>TOTAL AMOUNT:</span>
                <span className="text-black font-mono text-base tabular-nums font-bold">{formatNaira(receipt.total)}</span>
              </div>
            </div>

            {/* Tendered & Change */}
            <div className="py-3 border-b border-dashed border-[#d4d4d8] space-y-1.5 text-[11px]">
              <div className="flex justify-between">
                <span className="text-[#71717a]">Payment Tender:</span>
                <span className="font-bold uppercase text-black">{receipt.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#71717a]">Amount Tendered:</span>
                <span className="font-bold text-black tabular-nums">{formatNaira(receipt.amountTendered)}</span>
              </div>
              {receipt.paymentMethod === "cash" && (
                <div className="flex justify-between text-black font-bold">
                  <span>Change Given:</span>
                  <span className="tabular-nums">{formatNaira(receipt.change)}</span>
                </div>
              )}
            </div>

            {/* Footer & Barcode string */}
            <div className="text-center pt-3.5 space-y-1">
              <p className="font-bold text-[10px] text-[#3f3f46]">
                THANK YOU FOR YOUR PATRONAGE
              </p>
              <p className="text-[9px] text-[#a1a1aa]">
                Exchange within 48h with original receipt
              </p>
              <div className="pt-1.5 text-center font-mono">
                <div className="tracking-widest text-sm font-bold text-black">
                  |||| | |||||| || |||| |||||| |||
                </div>
                <p className="text-[9px] text-[#a1a1aa] tracking-wider">
                  *{receipt.receiptNumber}*
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Local Disk Location Notice */}
        <div className="px-6 py-3 bg-[#fbfbf5] border-t border-[#e4e4e7] text-[11px] font-mono flex items-center justify-between text-[#52525b] shrink-0">
          <span className="text-[#71717a]">Local Disk File:</span>
          <span className="text-black font-semibold select-all">
            data/receipts/Receipt-{receipt.receiptNumber}.pdf
          </span>
        </div>

        {/* Actions - Strict DESIGN.md Pill Vocabulary */}
        <div className="p-5 bg-white border-t border-[#e4e4e7] flex flex-col gap-2.5 shrink-0">
          <button
            onClick={handleDownloadPDF}
            className="btn-aloe-pill w-full py-2.5 text-xs font-semibold shadow-xs flex items-center justify-center gap-2 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Receipt PDF</span>
          </button>

          <div className="grid grid-cols-2 gap-2.5 font-mono text-xs">
            <button
              onClick={handleOpenPDFTab}
              className="btn-outline-light py-2.5 text-xs flex items-center justify-center gap-1.5 cursor-pointer font-medium"
              title="Open full printable PDF in new tab"
            >
              <ExternalLink className="w-3.5 h-3.5 text-[#71717a]" />
              <span>Open PDF</span>
            </button>
            <button
              onClick={handlePrint}
              className="btn-primary-pill py-2.5 text-xs flex items-center justify-center gap-1.5 cursor-pointer font-medium"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Direct Print</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="w-full py-2 text-center text-xs font-mono text-[#71717a] hover:text-black rounded-full hover:bg-[#fbfbf5] transition-colors cursor-pointer"
          >
            Close Window
          </button>
        </div>
      </div>
    </div>
  );
}
