import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/db";

export async function GET() {
  try {
    const db = getDatabase();
    const stmt = db.prepare(`
      SELECT 
        id,
        machine_id as machineId,
        cashier_id as cashierId,
        cashier_name as cashierName,
        start_time as startTime,
        end_time as endTime
      FROM shifts
      ORDER BY id DESC
    `);
    const shifts = stmt.all();
    return NextResponse.json({ success: true, count: shifts.length, shifts });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch shifts";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const db = getDatabase();
    const body = await request.json();

    if (body.action === "end") {
      const stmt = db.prepare(`
        UPDATE shifts
        SET end_time = ?
        WHERE id = ? OR (machine_id = ? AND cashier_id = ? AND (end_time IS NULL OR end_time = ''))
      `);
      stmt.run(
        new Date().toISOString(),
        body.shiftId || 0,
        body.machineId || 1,
        body.cashierId || 1
      );
      return NextResponse.json({ success: true, message: "Shift closed" });
    }

    const stmt = db.prepare(`
      INSERT INTO shifts (machine_id, cashier_id, cashier_name, start_time, end_time)
      VALUES (?, ?, ?, ?, '')
    `);

    const result = stmt.run(
      body.machineId || 1,
      body.cashierId || 1,
      body.cashierName || "admin",
      body.startTime || new Date().toISOString()
    );

    return NextResponse.json({
      success: true,
      shiftId: result.lastInsertRowid,
      message: "Shift started",
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to record shift";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
