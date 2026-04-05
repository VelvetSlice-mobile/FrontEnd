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
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      total REAL,
      items TEXT,
      date TEXT,
      status TEXT DEFAULT 'preparing'
    );
  `);
  db.execSync(`
  CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    title TEXT,
    message TEXT,
    status TEXT,
    date TEXT,
    read INTEGER DEFAULT 0
  );
`);
};

export const database = db;