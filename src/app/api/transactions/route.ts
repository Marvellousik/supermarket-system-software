import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/db";
import { saveReceiptPDFToDisk } from "@/lib/pdfGenerator";
import { Receipt } from "@/types/Entities";

interface DBTransactionRow {
  id: string;
  receipt_number: string;
  machine_id: number;
  cashier_id: number;
  cashier_name: string;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  payment_method: "cash" | "card" | "transfer";
  amount_tendered: number;
  change_due: number;
  created_at: string;
}

interface DBItemRow {
  id: number;
  transaction_id: string;
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
    const db = getDatabase();
    const { searchParams } = new URL(request.url);
    const machineIdParam = searchParams.get("machine_id");

    let txRows: DBTransactionRow[] = [];
    if (machineIdParam && machineIdParam !== "all") {
      const machineId = parseInt(machineIdParam, 10);
      const stmt = db.prepare(`
        SELECT * FROM transactions
        WHERE machine_id = ?
        ORDER BY datetime(created_at) DESC
      `);
      txRows = stmt.all(machineId) as DBTransactionRow[];
    } else {
      const stmt = db.prepare(`
        SELECT * FROM transactions
        ORDER BY datetime(created_at) DESC
      `);
      txRows = stmt.all() as DBTransactionRow[];
    }

    // Attach items for each transaction
    const itemsStmt = db.prepare(`
      SELECT * FROM transaction_items WHERE transaction_id = ?
    `);

    const receipts = txRows.map((row) => {
      const itemRows = itemsStmt.all(row.id) as DBItemRow[];
      return {
        id: row.id,
        receiptNumber: row.receipt_number,
        date: new Date(row.created_at).toLocaleString(),
        cashierName: row.cashier_name,
        cashierId: row.cashier_id,
        machineId: row.machine_id,
        subtotal: row.subtotal,
        tax: row.tax,
        discount: row.discount,
        total: row.total,
        paymentMethod: row.payment_method,
        amountTendered: row.amount_tendered,
        change: row.change_due,
        items: itemRows.map((it) => ({
          id: it.product_id,
          barcode: it.barcode,
          name: it.name,
          unit: it.unit,
          price: it.price,
          quantity: it.quantity,
          total: it.total,
        })),
      };
    });

    return NextResponse.json({ success: true, count: receipts.length, receipts });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch transactions";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const db = getDatabase();
    const body = await request.json();

    const id = body.id || `rec-${Date.now()}`;
    const createdAt = new Date().toISOString();

    const insertTx = db.prepare(`
      INSERT INTO transactions (
        id, receipt_number, machine_id, cashier_id, cashier_name,
        subtotal, tax, discount, total, payment_method, amount_tendered, change_due, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertItem = db.prepare(`
      INSERT INTO transaction_items (
        transaction_id, product_id, barcode, name, unit, price, quantity, total
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const saveTransaction = db.transaction(() => {
      insertTx.run(
        id,
        body.receiptNumber,
        body.machineId || 1,
        body.cashierId || 1,
        body.cashierName || "admin",
        body.subtotal || 0,
        body.tax || 0,
        body.discount || 0,
        body.total || 0,
        body.paymentMethod || "cash",
        body.amountTendered || body.total || 0,
        body.change || 0,
        createdAt
      );

      if (Array.isArray(body.items)) {
        for (const item of body.items) {
          insertItem.run(
            id,
            item.id || "",
            item.barcode || "",
            item.name || "",
            item.unit || "Pack",
            item.price || 0,
            item.quantity || 1,
            item.total || item.price * (item.quantity || 1)
          );
        }
      }
    });

    saveTransaction();

    // Auto-save physical PDF receipt to local disk data/receipts/
    try {
      const fullReceipt: Receipt = {
        id,
        receiptNumber: body.receiptNumber,
        date: new Date(createdAt).toLocaleString(),
        cashierName: body.cashierName || "admin",
        cashierId: body.cashierId || 1,
        machineId: body.machineId || 1,
        subtotal: body.subtotal || 0,
        tax: body.tax || 0,
        discount: body.discount || 0,
        total: body.total || 0,
        paymentMethod: body.paymentMethod || "cash",
        amountTendered: body.amountTendered || body.total || 0,
        change: body.change || 0,
        items: (body.items || []).map((it: { id?: string; barcode?: string; name?: string; unit?: string; price?: number; quantity?: number; total?: number }) => ({
          id: it.id || "",
          barcode: it.barcode || "",
          name: it.name || "",
          unit: it.unit || "Pack",
          price: it.price || 0,
          quantity: it.quantity || 1,
          total: it.total || (it.price || 0) * (it.quantity || 1),
        })),
      };
      saveReceiptPDFToDisk(fullReceipt);
    } catch (pdfErr) {
      console.warn("Could not save receipt PDF to disk:", pdfErr);
    }

    return NextResponse.json({ success: true, id, message: "Transaction logged" });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to record transaction";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
