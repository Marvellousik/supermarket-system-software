import jsPDF from "jspdf";
import fs from "fs";
import path from "path";
import { Receipt } from "@/types/Entities";

/**
 * Build a jsPDF document for a receipt
 */
export function buildReceiptPDFDocument(receipt: Receipt): jsPDF {
  // Standard receipt format: 80mm width, dynamic height
  const baseHeight = 160 + receipt.items.length * 10;
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: [80, Math.max(180, baseHeight)],
  });

  // Explicit PDF document metadata
  doc.setProperties({
    title: `Receipt ${receipt.receiptNumber}`,
    subject: "Supermarket Sales Receipt",
    author: "Shopping Center Supermarket",
    keywords: "receipt, supermarket, invoice, pos",
    creator: "Shopping Center POS System",
  });

  const pageWidth = 80;
  const margin = 5;
  let y = 10;

  // Header
  doc.setFont("courier", "bold");
  doc.setFontSize(12);
  doc.text("SHOPPING CENTER", pageWidth / 2, y, { align: "center" });
  y += 5;

  doc.setFontSize(8);
  doc.setFont("courier", "normal");
  doc.text("SUPERMARKET & RETAIL STORE", pageWidth / 2, y, { align: "center" });
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

  // Items Header
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

  // Items List
  doc.setFont("courier", "normal");
  receipt.items.forEach((item) => {
    const cleanName =
      item.name.length > 18 ? item.name.substring(0, 16) + ".." : item.name;

    const qtyStr = `${item.quantity}x`.padEnd(4, " ");
    const nameStr = cleanName.padEnd(19, " ");
    const priceStr = item.price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).padStart(7, " ");
    const totalStr = item.total.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).padStart(8, " ");

    doc.text(`${qtyStr}${nameStr}${priceStr}${totalStr}`, margin, y);
    y += 4;
    doc.setFontSize(6.5);
    doc.text(`    [${item.barcode}]`, margin, y);
    doc.setFontSize(8);
    y += 4.5;
  });

  // Totals Divider
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
  doc.text("TOTAL AMOUNT:", margin, y);
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
  doc.text("THANK YOU FOR YOUR PATRONAGE", pageWidth / 2, y, { align: "center" });
  y += 4;
  doc.setFont("courier", "normal");
  doc.setFontSize(7);
  doc.text("Exchange within 48h with original receipt", pageWidth / 2, y, { align: "center" });
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
 * Save receipt PDF directly to local disk directory (data/receipts/)
 */
export function saveReceiptPDFToDisk(receipt: Receipt): string {
  const isVercel = process.env.VERCEL === "1";
  const receiptsDir = isVercel
    ? path.join("/tmp", "receipts")
    : path.join(process.cwd(), "data", "receipts");

  if (!fs.existsSync(receiptsDir)) {
    fs.mkdirSync(receiptsDir, { recursive: true });
  }

  const doc = buildReceiptPDFDocument(receipt);
  const pdfArrayBuffer = doc.output("arraybuffer");
  const buffer = Buffer.from(pdfArrayBuffer);

  const fileName = `Receipt-${receipt.receiptNumber}.pdf`;
  const filePath = path.join(receiptsDir, fileName);

  fs.writeFileSync(filePath, buffer);
  return filePath;
}
