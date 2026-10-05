import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import { INITIAL_PRODUCTS } from "@/data/products";

let dbInstance: Database.Database | null = null;

export function getDatabase(): Database.Database {
  if (dbInstance) {
    return dbInstance;
  }

  // Support Vercel ephemeral /tmp or local data folder
  const isVercel = process.env.VERCEL === "1";
  const dbDir = isVercel ? "/tmp" : path.join(process.cwd(), "data");

  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  const dbPath = path.join(dbDir, "supermarket.db");
  const db = new Database(dbPath);

  // WAL mode for high performance
  db.pragma("journal_mode = WAL");

  // Create tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      barcode TEXT UNIQUE,
      code TEXT,
      name TEXT,
      category TEXT,
      price REAL,
      unit TEXT,
      stock INTEGER,
      description TEXT
    );

    CREATE TABLE IF NOT EXISTS machines (
      id INTEGER PRIMARY KEY,
      name TEXT,
      status TEXT DEFAULT 'active'
    );

    CREATE TABLE IF NOT EXISTS cashiers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      email TEXT,
      password TEXT,
      role TEXT DEFAULT 'cashier'
    );

    CREATE TABLE IF NOT EXISTS shifts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      machine_id INTEGER,
      cashier_id INTEGER,
      cashier_name TEXT,
      start_time TEXT,
      end_time TEXT
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      receipt_number TEXT UNIQUE,
      machine_id INTEGER,
      cashier_id INTEGER,
      cashier_name TEXT,
      subtotal REAL,
      tax REAL,
      discount REAL,
      total REAL,
      payment_method TEXT,
      amount_tendered REAL,
      change_due REAL,
      created_at TEXT
    );

    CREATE TABLE IF NOT EXISTS transaction_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      transaction_id TEXT,
      product_id TEXT,
      barcode TEXT,
      name TEXT,
      unit TEXT,
      price REAL,
      quantity INTEGER,
      total REAL,
      FOREIGN KEY (transaction_id) REFERENCES transactions (id) ON DELETE CASCADE
    );
  `);

  // Seed default machines if empty
  const machineCount = db.prepare("SELECT COUNT(*) as count FROM machines").get() as { count: number };
  if (machineCount.count === 0) {
    const insertMachine = db.prepare("INSERT INTO machines (id, name, status) VALUES (?, ?, ?)");
    insertMachine.run(1, "Terminal 01", "active");
    insertMachine.run(2, "Terminal 02", "active");
    insertMachine.run(3, "Terminal 03", "active");
    insertMachine.run(4, "Terminal 04", "active");
  }

  // Seed default cashiers if empty
  const cashierCount = db.prepare("SELECT COUNT(*) as count FROM cashiers").get() as { count: number };
  if (cashierCount.count === 0) {
    const insertCashier = db.prepare(
      "INSERT INTO cashiers (id, username, email, password, role) VALUES (?, ?, ?, ?, ?)"
    );
    insertCashier.run(1, "admin", "admin@supermarket.ng", "admin", "admin");
    insertCashier.run(2, "chioma", "chioma.e@supermarket.ng", "password123", "cashier");
    insertCashier.run(3, "emeka", "emeka.o@supermarket.ng", "password123", "cashier");
  }

  // Seed 150 products if empty
  const productCount = db.prepare("SELECT COUNT(*) as count FROM products").get() as { count: number };
  if (productCount.count === 0) {
    const insertProduct = db.prepare(`
      INSERT INTO products (id, barcode, code, name, category, price, unit, stock, description)
      VALUES (@id, @barcode, @code, @name, @category, @price, @unit, @stock, @description)
    `);

    const insertMany = db.transaction((productsList) => {
      for (const prod of productsList) {
        insertProduct.run({
          id: prod.id,
          barcode: prod.barcode,
          code: prod.code,
          name: prod.name,
          category: prod.category,
          price: prod.price,
          unit: prod.unit,
          stock: prod.stock,
          description: prod.description || "",
        });
      }
    });

    insertMany(INITIAL_PRODUCTS);
  }

  // Seed initial sample transactions if empty
  const txCount = db.prepare("SELECT COUNT(*) as count FROM transactions").get() as { count: number };
  if (txCount.count === 0) {
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

    const seedTx = db.transaction(() => {
      // Machine 1 transaction
      const tx1Id = "rec-init-01";
      insertTx.run(
        tx1Id,
        "RCP-20261003-1042",
        1,
        1,
        "admin",
        24100,
        1807.5,
        0,
        25907.5,
        "card",
        25907.5,
        0,
        new Date(Date.now() - 3600000 * 3).toISOString()
      );
      insertItem.run(tx1Id, "prod-023", "89010001023", "Indomie Instant Noodles Regular Chicken (Carton 40pcs)", "Carton", 12500, 1, 12500);
      insertItem.run(tx1Id, "prod-030", "89010001030", "Peak Instant Full Cream Milk Powder (850g Pouch)", "Pouch", 6800, 1, 6800);
      insertItem.run(tx1Id, "prod-051", "89010001051", "Eva Premium Table Water (75cl x 12 Pack)", "Pack", 2400, 2, 4800);

      // Machine 2 transaction
      const tx2Id = "rec-init-02";
      insertTx.run(
        tx2Id,
        "RCP-20261003-2194",
        2,
        2,
        "chioma",
        10700,
        802.5,
        535,
        10967.5,
        "cash",
        11000,
        32.5,
        new Date(Date.now() - 3600000 * 5).toISOString()
      );
      insertItem.run(tx2Id, "prod-071", "89010001071", "Dettol Original Anti-Bacterial Bath Soap (110g x 3)", "Pack", 2100, 2, 4200);
      insertItem.run(tx2Id, "prod-102", "89010001102", "Morning Fresh Antibacterial Dishwashing Liquid (1 Litre)", "Bottle", 2900, 1, 2900);
      insertItem.run(tx2Id, "prod-116", "89010001116", "Rose Toilet Paper Rolls 2-Ply (Pack of 12)", "Pack", 3600, 1, 3600);

      // Machine 3 transaction
      const tx3Id = "rec-init-03";
      insertTx.run(
        tx3Id,
        "RCP-20261003-3451",
        3,
        3,
        "emeka",
        14500,
        1087.5,
        0,
        15587.5,
        "transfer",
        15587.5,
        0,
        new Date(Date.now() - 3600000 * 1).toISOString()
      );
      insertItem.run(tx3Id, "prod-010", "89010001010", "Golden Terra Pure Soya Oil (5 Litres)", "Keg", 14500, 1, 14500);
    });

    seedTx();
  }

  dbInstance = db;
  return db;
}
