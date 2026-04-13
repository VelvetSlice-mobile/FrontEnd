import * as SQLite from "expo-sqlite";

const db = SQLite.openDatabaseSync("velvetslice.db");

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
  };
};

export const initDatabase = () => {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      email TEXT UNIQUE,
      password TEXT,
      phone TEXT,
      avatar_url TEXT,
      access_token TEXT,
      token_type TEXT
    );
  `);

  const userColumns = db.getAllSync("PRAGMA table_info(users)");
  const hasAvatarColumn = userColumns.some((col) => col.name === "avatar_url");
  const hasAccessTokenColumn = userColumns.some(
    (col) => col.name === "access_token",
  );
  const hasTokenTypeColumn = userColumns.some(
    (col) => col.name === "token_type",
  );
  if (!hasAvatarColumn) {
    db.execSync("ALTER TABLE users ADD COLUMN avatar_url TEXT;");
  }
  if (!hasAccessTokenColumn) {
    db.execSync("ALTER TABLE users ADD COLUMN access_token TEXT;");
  }
  if (!hasTokenTypeColumn) {
    db.execSync("ALTER TABLE users ADD COLUMN token_type TEXT;");
  }

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

export const getPersistedUser = () => {
  const rows = db.getAllSync("SELECT * FROM users LIMIT 1");
  return rows.length ? normalizeDbUser(rows[0]) : null;
};

export const saveUser = (user) => {
  db.runSync(
    "INSERT OR REPLACE INTO users (id, name, email, password, phone, avatar_url, access_token, token_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    [
      user.id ?? null,
      user.name,
      user.email,
      user.password ?? null,
      user.phone ?? null,
      user.avatarUrl ?? null,
      user.accessToken ?? null,
      user.tokenType ?? null,
    ],
  );
};

export const deleteUser = (email) => {
  db.runSync("DELETE FROM users WHERE email = ?", [email]);
};

export const database = db;
