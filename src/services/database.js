// src/services/database.js
import * as SQLite from 'expo-sqlite';

// Abre (ou cria) o arquivo do banco de dados
const db = SQLite.openDatabaseSync('velvetslice.db');

export const initDatabase = () => {
  // Criar tabela de usuários local para persistir o login offline
  db.execSync(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      email TEXT UNIQUE,
      password TEXT,
      phone TEXT
    );
  `);

  // Criar tabela de pedidos para histórico offline
  db.execSync(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      total REAL,
      items TEXT,
      date TEXT
    );
  `);
};

export const database = db;