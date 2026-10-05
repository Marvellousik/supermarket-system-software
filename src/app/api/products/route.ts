import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const db = getDatabase();
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (query && query.trim()) {
      const q = `%${query.trim()}%`;
      const stmt = db.prepare(`
        SELECT * FROM products
        WHERE name LIKE ? OR barcode LIKE ? OR code LIKE ? OR category LIKE ?
        ORDER BY name ASC
      `);
      const products = stmt.all(q, q, q, q);
      return NextResponse.json({ success: true, count: products.length, products });
    }

    const stmt = db.prepare("SELECT * FROM products ORDER BY id ASC");
    const products = stmt.all();
    return NextResponse.json({ success: true, count: products.length, products });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch products";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const db = getDatabase();
    const body = await request.json();

    const stmt = db.prepare(`
      INSERT INTO products (id, barcode, code, name, category, price, unit, stock, description)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      body.id || `prod-${Date.now()}`,
      body.barcode,
      body.code,
      body.name,
      body.category,
      body.price,
      body.unit || "Pack",
      body.stock || 50,
      body.description || ""
    );

    return NextResponse.json({ success: true, message: "Product created" });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create product";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
