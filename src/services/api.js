// src/services/api.js
import { database } from './database';

const API_URL = 'http://192.168.1.9:3000'; // Ajuste para seu IP real

export const authService = {
  // Tenta registrar na API e salva no SQLite como backup
  register: async (userData) => {
    try {
      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      
      const data = await response.json();
      
      // Salva localmente também para permitir login offline futuro
      database.runSync(
        'INSERT OR REPLACE INTO users (name, email, password, phone) VALUES (?, ?, ?, ?)',
        [userData.name, userData.email, userData.password, userData.phone]
      );
      
      return data;
    } catch (error) {
      // Se a API falhar, salva apenas no SQLite
      console.log("Aviso: API offline. Usuário salvo apenas localmente.");
      database.runSync(
        'INSERT OR REPLACE INTO users (name, email, password, phone) VALUES (?, ?, ?, ?)',
        [userData.name, userData.email, userData.password, userData.phone]
      );
      return { id: Date.now(), ...userData, message: "Modo Offline Ativo" };
    }
  },

  login: async (email, password) => {
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (response.ok) return await response.json();
    } catch (error) {
      console.log("API offline, tentando login local via SQLite...");
    }

    // Busca no SQLite se a API falhar
    const userLocal = database.getFirstSync(
      'SELECT * FROM users WHERE email = ? AND password = ?',
      [email, password]
    );
    
    if (userLocal) return userLocal;
    throw new Error("Usuário não encontrado ou senha incorreta (Offline)");
  }
};