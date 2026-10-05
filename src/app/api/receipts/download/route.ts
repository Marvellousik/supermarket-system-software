import { NextResponse } from "next/server";
import fs from "fs";
import { getDatabase } from "@/lib/db";
import { buildReceiptPDFDocument, saveReceiptPDFToDisk } from "@/lib/pdfGenerator";
import { Receipt } from "@/types/Entities";

interface DBTransaction {
  id: string;
  receipt_number: string;
  created_at: string;
  cashier_name: string;
  cashier_id: number;
  machine_id: number;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  payment_method: "cash" | "card" | "transfer";
  amount_tendered: number;
  change_due: number;
}

interface DBItem {
  product_id: string;
  barcode: string;
  name: string;
  unit: string;
  price: number;
  quantity: number;
  total: number;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const rawReceiptParam = searchParams.get("receipt_number") || searchParams.get("id");

    if (!rawReceiptParam) {
      return NextResponse.json({ success: false, error: "Missing receipt number" }, { status: 400 });
    }

    const cleanNumber = rawReceiptParam.replace(/^Receipt-/, "").replace(/\.pdf$/i, "").trim();

    // 1. Check if the physical PDF already exists on disk in data/receipts/
    const isVercel = process.env.VERCEL === "1";
    const receiptsDir = isVercel
      ? "/tmp/receipts"
      : `${process.cwd()}/data/receipts`;
    const cachedFilePath = `${receiptsDir}/Receipt-${cleanNumber}.pdf`;

    let fileName = `Receipt-${cleanNumber}.pdf`;

    if (fs.existsSync(cachedFilePath)) {
      const pdfBuffer = fs.readFileSync(cachedFilePath);
      return new NextResponse(pdfBuffer, {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${fileName}"`,
          "Content-Length": pdfBuffer.length.toString(),
        },
      });
    }

    const db = getDatabase();
    const txStmt = db.prepare(`
      SELECT * FROM transactions
      WHERE receipt_number = ? OR receipt_number = ? OR id = ?
    `);
    const tx = txStmt.get(cleanNumber, rawReceiptParam, rawReceiptParam) as DBTransaction | undefined;

    if (!tx) {
      return NextResponse.json({ success: false, error: "Receipt not found in database or disk" }, { status: 404 });
    }

    const itemsStmt = db.prepare(`
      SELECT * FROM transaction_items WHERE transaction_id = ?
    `);
    const items = itemsStmt.all(tx.id) as DBItem[];

    const receipt: Receipt = {
      id: tx.id,
      receiptNumber: tx.receipt_number,
      date: new Date(tx.created_at).toLocaleString(),
      cashierName: tx.cashier_name,
      cashierId: tx.cashier_id,
      machineId: tx.machine_id,
      subtotal: tx.subtotal,
      tax: tx.tax,
      discount: tx.discount,
      total: tx.total,
      paymentMethod: tx.payment_method,
      amountTendered: tx.amount_tendered,
      change: tx.change_due,
      items: items.map((it) => ({
        id: it.product_id,
        barcode: it.barcode,
        name: it.name,
        unit: it.unit,
        price: it.price,
        quantity: it.quantity,
        total: it.total,
      })),
    };

    // Save to disk in data/receipts/
    saveReceiptPDFToDisk(receipt);

    // Build PDF
    const doc = buildReceiptPDFDocument(receipt);
    const pdfBuffer = Buffer.from(doc.output("arraybuffer"));

    fileName = `Receipt-${receipt.receiptNumber}.pdf`;

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Content-Length": pdfBuffer.length.toString(),
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to generate receipt PDF";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const receipt: Receipt = await request.json();

    if (!receipt || !receipt.receiptNumber) {
      return NextResponse.json({ success: false, error: "Invalid receipt payload" }, { status: 400 });
    }

    // Save to disk in data/receipts/
    const diskPath = saveReceiptPDFToDisk(receipt);

    const doc = buildReceiptPDFDocument(receipt);
    const pdfBuffer = Buffer.from(doc.output("arraybuffer"));

    const fileName = `Receipt-${receipt.receiptNumber}.pdf`;

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "X-Saved-Path": diskPath,
        "Content-Length": pdfBuffer.length.toString(),
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to save receipt PDF";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
