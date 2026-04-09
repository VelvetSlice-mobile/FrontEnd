import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('velvetslice.db');

export const initDatabase = () => {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      email TEXT UNIQUE,
      password TEXT,
      phone TEXT
    );
  `);

  db.execSync(`
    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      title TEXT,
      message TEXT,
      status TEXT,
      date TEXT
    );
  `);

  db.execSync(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      total REAL,
      items TEXT,
      date TEXT,
      status TEXT
    );
  `);

  const orderColumns = db.getAllSync("PRAGMA table_info(orders)");
  const orderColumnNames = orderColumns.map((col) => col.name);
  const requiredColumns = ["id", "user_id", "total", "items", "date", "status"];
  const isLegacyOrdersTable = requiredColumns.some(
    (column) => !orderColumnNames.includes(column),
  );

  if (isLegacyOrdersTable) {
    const hasCreatedAt = orderColumnNames.includes("created_at");

    db.execSync(`
      ALTER TABLE orders RENAME TO orders_old;

      CREATE TABLE orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        total REAL,
        items TEXT,
        date TEXT,
        status TEXT
      );
    `);

    if (hasCreatedAt) {
      db.execSync(`
        INSERT INTO orders (id, total, date, status)
        SELECT id, total, created_at, status
        FROM orders_old;
      `);
    } else {
      db.execSync(`
        INSERT INTO orders (id, total, status)
        SELECT id, total, status
        FROM orders_old;
      `);
    }

    db.execSync("DROP TABLE orders_old;");
  }
};


export const database = db;