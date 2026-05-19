import * as SQLite from "expo-sqlite";
import { Platform } from "react-native";

const db = Platform.OS !== "web" ? SQLite.openDatabaseSync("velvetslice.db") : null;

const normalizeDbUser = (row) => {
  if (!row) return null;
  return {
    id: row.id,
    id_cliente: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    password: row.password,
    avatarUrl: row.avatar_url,
    accessToken: row.access_token,
    tokenType: row.token_type,
    role: row.role ?? "cliente",
  };
};

export const initDatabase = () => {
  if (!db) return;
  db.execSync(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      email TEXT UNIQUE,
      password TEXT,
      phone TEXT,
      avatar_url TEXT,
      access_token TEXT,
      token_type TEXT,
      role TEXT
    );
  `);

  const userColumns = new Set(db.getAllSync("PRAGMA table_info(users)").map((c) => c.name));
  if (!userColumns.has("avatar_url")) db.execSync("ALTER TABLE users ADD COLUMN avatar_url TEXT");
  if (!userColumns.has("access_token")) db.execSync("ALTER TABLE users ADD COLUMN access_token TEXT");
  if (!userColumns.has("token_type")) db.execSync("ALTER TABLE users ADD COLUMN token_type TEXT");
  if (!userColumns.has("role")) db.execSync("ALTER TABLE users ADD COLUMN role TEXT");

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
  db.execSync(
    `CREATE UNIQUE INDEX IF NOT EXISTS idx_notif_user_title ON notifications(user_id, title);`
  );

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

export const getPersistedUser = () => {
  if (!db) return null;
  const rows = db.getAllSync("SELECT * FROM users LIMIT 1");
  return rows.length ? normalizeDbUser(rows[0]) : null;
};

export const saveUser = (user) => {
  if (!db) return;
  db.runSync(
    "INSERT OR REPLACE INTO users (id, name, email, password, phone, avatar_url, access_token, token_type, role) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [
      user.id ?? null,
      user.name ?? null,
      user.email,
      user.password ?? null,
      user.phone ?? null,
      user.avatarUrl ?? null,
      user.accessToken ?? null,
      user.tokenType ?? null,
      user.role ?? "cliente",
    ],
  );
};

export const deleteUser = (email) => {
  if (!db) return;
  db.runSync("DELETE FROM users WHERE email = ?", [email]);
};

export const database = db;
