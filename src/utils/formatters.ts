import jsPDF from "jspdf";
import { Receipt } from "@/types/Entities";

/**
 * Format a number into Nigerian Naira currency format (₦)
 */
export function formatNaira(amount: number): string {
  const formatted = new Intl.NumberFormat("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount || 0);

  return `₦${formatted}`;
}

/**
 * Play a standard barcode scanner audio beep
 */
export function playScannerBeep(): void {
  if (typeof window === "undefined") return;

  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;

    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(1800, ctx.currentTime);

    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.1);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  } catch {
    // Ignore audio autoplay restrictions
  }
}

/**
 * Build a jsPDF instance for client-side rendering or printing fallback
 */
export function buildClientReceiptPDF(receipt: Receipt): jsPDF {
  const baseHeight = 160 + receipt.items.length * 10;
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: [80, Math.max(180, baseHeight)],
  });

  doc.setProperties({
    title: `Receipt-${receipt.receiptNumber}`,
    subject: "Supermarket Sales Receipt",
    author: "Neil Supermarket Software",
    creator: "Neil Supermarket Software POS",
  });

  const pageWidth = 80;
  const margin = 5;
  let y = 10;

  // Header
  doc.setFont("courier", "bold");
  doc.setFontSize(11);
  doc.text("NEIL SUPERMARKET SOFTWARE", pageWidth / 2, y, { align: "center" });
  y += 5;

  doc.setFontSize(8);
  doc.setFont("courier", "normal");
  doc.text("POINT OF SALE & RETAIL SYSTEM", pageWidth / 2, y, { align: "center" });
  y += 4;
  doc.text("14 Adeola Odeku St, Victoria Island", pageWidth / 2, y, {
    align: "center",
  });
  y += 4;
  doc.text("Lagos, Nigeria | Tel: +234 802 345 6789", pageWidth / 2, y, {
    align: "center",
  });
  y += 5;

  // Divider
  doc.text("------------------------------------------", pageWidth / 2, y, {
    align: "center",
  });
  y += 4;

  // Metadata
  doc.setFontSize(8);
  doc.setFont("courier", "normal");
  doc.text(`Receipt #: ${receipt.receiptNumber}`, margin, y);
  y += 4;
  doc.text(`Date/Time: ${receipt.date}`, margin, y);
  y += 4;

  doc.setFont("courier", "bold");
  doc.text(`PROCESSED BY: ${receipt.cashierName.toUpperCase()}`, margin, y);
  y += 4;
  doc.text(`Terminal: Machine 0${receipt.machineId}`, margin, y);
  y += 5;

  // Table header
  doc.setFont("courier", "bold");
  doc.text("------------------------------------------", pageWidth / 2, y, {
    align: "center",
  });
  y += 4;
  doc.text("QTY ITEM                   PRICE    TOTAL", margin, y);
  y += 3;
  doc.text("------------------------------------------", pageWidth / 2, y, {
    align: "center",
  });
  y += 4;

  // Items
  doc.setFont("courier", "normal");
  receipt.items.forEach((item) => {
    const cleanName =
      item.name.length > 18 ? item.name.substring(0, 16) + ".." : item.name;

    const qtyStr = `${item.quantity}x`.padEnd(4, " ");
    const nameStr = cleanName.padEnd(19, " ");
    const priceStr = item.price
      .toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      .padStart(7, " ");
    const totalStr = item.total
      .toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      .padStart(8, " ");

    doc.text(`${qtyStr}${nameStr}${priceStr}${totalStr}`, margin, y);
    y += 4;
    doc.setFontSize(6.5);
    doc.text(`    [${item.barcode}]`, margin, y);
    doc.setFontSize(8);
    y += 4.5;
  });

  // Divider
  doc.text("------------------------------------------", pageWidth / 2, y, {
    align: "center",
  });
  y += 5;

  const formatAmt = (val: number) =>
    `NGN ${val.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  doc.setFont("courier", "normal");
  doc.text("Subtotal:", margin, y);
  doc.text(formatAmt(receipt.subtotal), pageWidth - margin, y, { align: "right" });
  y += 4;

  if (receipt.tax > 0) {
    doc.text("VAT (7.5%):", margin, y);
    doc.text(formatAmt(receipt.tax), pageWidth - margin, y, { align: "right" });
    y += 4;
  }

  if (receipt.discount > 0) {
    doc.text("Discount:", margin, y);
    doc.text(`-${formatAmt(receipt.discount)}`, pageWidth - margin, y, { align: "right" });
    y += 4;
  }

  doc.setFont("courier", "bold");
  doc.setFontSize(9);
  doc.text("TOTAL DUE:", margin, y);
  doc.text(formatAmt(receipt.total), pageWidth - margin, y, { align: "right" });
  y += 5;

  doc.setFontSize(8);
  doc.setFont("courier", "normal");
  doc.text("------------------------------------------", pageWidth / 2, y, {
    align: "center",
  });
  y += 4;

  doc.text(`Payment: ${receipt.paymentMethod.toUpperCase()}`, margin, y);
  doc.text(formatAmt(receipt.amountTendered), pageWidth - margin, y, { align: "right" });
  y += 4;

  if (receipt.paymentMethod === "cash") {
    doc.text("Change Given:", margin, y);
    doc.text(formatAmt(receipt.change), pageWidth - margin, y, { align: "right" });
    y += 4;
  }

  doc.text("------------------------------------------", pageWidth / 2, y, {
    align: "center",
  });
  y += 6;

  // Footer
  doc.setFont("courier", "bold");
  doc.setFontSize(8);
  doc.text("THANK YOU FOR YOUR PATRONAGE!", pageWidth / 2, y, { align: "center" });
  y += 4;
  doc.setFont("courier", "normal");
  doc.setFontSize(7);
  doc.text("Exchange within 48h with this receipt", pageWidth / 2, y, { align: "center" });
  y += 5;

  doc.setFont("courier", "bold");
  doc.setFontSize(8);
  doc.text("|||| | |||||| || |||| |||||| |||", pageWidth / 2, y, { align: "center" });
  y += 4;
  doc.setFontSize(7);
  doc.text(`* ${receipt.receiptNumber} *`, pageWidth / 2, y, { align: "center" });

  return doc;
}

/**
 * Generate and download a receipt as a standard, printable PDF.
 * 1. Synchronously instructs the backend to write the physical file to data/receipts/
 * 2. Triggers a clean browser download with the exact name `Receipt-[RCP-XXXX].pdf`
 */
export async function generateReceiptPDF(receipt: Receipt): Promise<void> {
  if (typeof window === "undefined") return;

  const fileName = `Receipt-${receipt.receiptNumber}.pdf`;

  try {
    // 1. Send receipt to server API to save to disk in data/receipts/ and retrieve PDF stream
    const res = await fetch("/api/receipts/download", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(receipt),
    });

    if (res.ok) {
      const blob = await res.blob();
      const pdfBlob = new Blob([blob], { type: "application/pdf" });
      const downloadUrl = window.URL.createObjectURL(pdfBlob);

      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = fileName;
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();

      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(downloadUrl);
      }, 1000);
      return;
    }
  } catch (err) {
    console.warn("Server PDF generation failed, using client-side jsPDF save:", err);
  }

  // 2. Client-side fallback using jsPDF's native doc.save (never strips .pdf extension)
  const doc = buildClientReceiptPDF(receipt);
  doc.save(fileName);
}

/**
 * Open the receipt PDF in a new browser tab for preview or direct native printing (Ctrl+P)
 */
export function openReceiptPrintWindow(receipt: Receipt): void {
  if (typeof window === "undefined") return;

  const printUrl = `/api/receipts/download?receipt_number=${encodeURIComponent(receipt.receiptNumber)}`;
  window.open(printUrl, "_blank");
}
