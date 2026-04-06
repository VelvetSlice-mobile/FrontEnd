import * as SQLite from "expo-sqlite";

const db = SQLite.openDatabaseSync("velvetslice.db");

export const initDatabase = () => {

  
  db.execSync(`PRAGMA foreign_keys = ON;`);

  db.execSync(`
    CREATE TABLE IF NOT EXISTS cliente (
      id_cliente INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT,
      email TEXT UNIQUE,
      senha TEXT,
      telefone TEXT
    );
  `);

  db.execSync(`
    CREATE TABLE IF NOT EXISTS endereco (
      id_endereco INTEGER PRIMARY KEY AUTOINCREMENT,
      nome_endereco TEXT,
      logradouro TEXT,
      numero TEXT,
      cep TEXT,
      estado TEXT,
      complemento TEXT
    );
  `);

  db.execSync(`
    CREATE TABLE IF NOT EXISTS endereco_entrega (
      fk_cliente_id_cliente INTEGER,
      fk_endereco_id_endereco INTEGER,
      PRIMARY KEY (fk_cliente_id_cliente, fk_endereco_id_endereco),
      FOREIGN KEY (fk_cliente_id_cliente) REFERENCES cliente(id_cliente),
      FOREIGN KEY (fk_endereco_id_endereco) REFERENCES endereco(id_endereco)
    );
  `);

  db.execSync(`
    CREATE TABLE IF NOT EXISTS bolo (
      id_bolo INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT,
      descricao TEXT,
      preco REAL,
      imagem TEXT
    );
  `);

  db.execSync(`
    CREATE TABLE IF NOT EXISTS pedido (
      id_pedido INTEGER PRIMARY KEY AUTOINCREMENT,
      data_pedido TEXT,
      valor_total REAL,
      status_pedido TEXT,
      metodo_pagamento TEXT,
      fk_cliente_id_cliente INTEGER,
      FOREIGN KEY (fk_cliente_id_cliente) REFERENCES cliente(id_cliente)
    );
  `);

  db.execSync(`
    CREATE TABLE IF NOT EXISTS item_pedido (
      fk_pedido_id_pedido INTEGER,
      fk_bolo_id_bolo INTEGER,
      quantidade INTEGER,
      preco_unitario REAL,
      tamanho TEXT,
      PRIMARY KEY (fk_pedido_id_pedido, fk_bolo_id_bolo),
      FOREIGN KEY (fk_pedido_id_pedido) REFERENCES pedido(id_pedido),
      FOREIGN KEY (fk_bolo_id_bolo) REFERENCES bolo(id_bolo)
    );
  `);
};

// listar todos os clientes
export const getClientes = () => {
  return db.getAllSync(`SELECT * FROM cliente`);
};

// buscar por ID
export const getClienteById = (id) => {
  return db.getFirstSync(
    `SELECT * FROM cliente WHERE id_cliente = ?`,
    [id]
  );
};

// listar todos os bolos
export const getBolos = () => {
  return db.getAllSync(`SELECT * FROM bolo`);
};

// bolo por ID
export const getBoloById = (id) => {
  return db.getFirstSync(
    `SELECT * FROM bolo WHERE id_bolo = ?`,
    [id]
  );
};

// pedido por ID
export const getPedidoById = (id) => {
  return db.getFirstSync(
    `SELECT * FROM pedido WHERE id_pedido = ?`,
    [id]
  );
};


export const database = db;