import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/db";

export async function GET() {
  try {
    const db = getDatabase();
    const stmt = db.prepare("SELECT * FROM machines ORDER BY id ASC");
    const machines = stmt.all();
    return NextResponse.json({ success: true, count: machines.length, machines });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch machines";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const db = getDatabase();
    const body = await request.json();

    const stmt = db.prepare(`
      INSERT OR REPLACE INTO machines (id, name, status)
      VALUES (?, ?, ?)
    `);

    stmt.run(
      body.id,
      body.name || `Terminal ${body.id < 10 ? "0" + body.id : body.id}`,
      body.status || "active"
    );

    return NextResponse.json({ success: true, message: "Machine registered" });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to register machine";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const db = getDatabase();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "Missing machine id" }, { status: 400 });
    }

    const stmt = db.prepare("DELETE FROM machines WHERE id = ?");
    stmt.run(parseInt(id, 10));

    return NextResponse.json({ success: true, message: "Machine removed" });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to delete machine";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
