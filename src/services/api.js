import { database } from "./database";

// IMPORTANTE: Altere para o IP da sua máquina se estiver testando em dispositivo físico
const API_URL = process.env.EXPO_PUBLIC_API_URL;

export const authService = {
  register: async (userData) => {
    try {
      const response = await fetch(`${API_URL}/api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });
      const data = await response.json();

      database.runSync(
        "INSERT OR REPLACE INTO users (name, email, password, phone) VALUES (?, ?, ?, ?)",
        [userData.name, userData.email, userData.password, userData.phone],
      );

      return data;
    } catch (error) {
      console.log("Aviso: API offline. Usuário salvo apenas localmente.");
      database.runSync(
        "INSERT OR REPLACE INTO users (name, email, password, phone) VALUES (?, ?, ?, ?)",
        [userData.name, userData.email, userData.password, userData.phone],
      );
      return { id: Date.now(), ...userData, message: "Modo Offline Ativo" };
    }
  },

  login: async (email, password) => {
    try {
      const response = await fetch(`${API_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (response.ok) return await response.json();
    } catch (error) {
      console.log("API offline, tentando login local via SQLite...");
    }

    const userLocal = database.getFirstSync(
      "SELECT * FROM users WHERE email = ? AND password = ?",
      [email, password],
    );

    if (userLocal) return userLocal;
    throw new Error("Usuário não encontrado ou senha incorreta (Offline)");
  },
};

// --- SERVIÇO DE PRODUTOS (Sincronizado com a tabela 'bolo' do servidor) ---
export const productService = {
  getAll: async () => {
    try {
      const response = await fetch(`${API_URL}/api/products`);
      const data = await response.json();
      // Mapeia os nomes do banco (bolo) para os nomes que o front usa (products)
      return data.map(item => ({
        id: item.id_bolo,
        name: item.nome,
        description: item.descricao,
        price: item.preco,
        image: item.imagem
      }));
    } catch (error) {
      console.error("Erro ao buscar produtos:", error);
      return [];
    }
  },

  create: async (productData) => {
    try {
      const response = await fetch(`${API_URL}/api/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: productData.name,
          descricao: productData.description,
          preco: productData.price,
          imagem: productData.image
        }),
      });
      return await response.json();
    } catch (error) {
      console.error("Erro ao criar produto:", error);
      throw error;
    }
  },

  delete: async (productId) => {
    try {
      const response = await fetch(`${API_URL}/api/products/${productId}`, {
        method: "DELETE",
      });
      return response.ok;
    } catch (error) {
      console.error("Erro ao deletar produto:", error);
      return false;
    }
  }
};

// --- NOVO SERVIÇO DE ENDEREÇOS (CRUD COMPLETO) ---
export const addressService = {
  // READ
  getByClientId: async (clientId) => {
    try {
      const response = await fetch(`${API_URL}/api/addresses/${clientId}`);
      if (!response.ok) return null;

      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        return await response.json();
      }
      return null;
    } catch (error) {
      console.error("Erro ao buscar endereço:", error);
      return null;
    }
  },

  // CREATE (ESSA ERA A FUNÇÃO QUE FALTAVA!)
  create: async (addressData) => {
    try {
      const response = await fetch(`${API_URL}/api/addresses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(addressData),
      });

      if (!response.ok) throw new Error("Erro ao salvar endereço no servidor");

      return await response.json();
    } catch (error) {
      console.error("Erro ao criar endereço:", error);
      throw error;
    }
  },

update: async (addressId, addressData) => {
  try {
    const response = await fetch(`${API_URL}/api/addresses/${addressId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nome_endereco: addressData.nome_endereco,
        logradouro: addressData.logradouro,
        numero: addressData.numero,
        CEP: addressData.CEP, // 👈 CORRIGIDO
        estado: addressData.estado,
        complemento: addressData.complemento
      }),
    });

    if (!response.ok) throw new Error("Erro ao atualizar");

    return true; // 👈 NÃO precisa retornar objeto
  } catch (error) {
    console.error("Erro ao atualizar endereço:", error);
    throw error;
  }
},

  // DELETE
  delete: async (addressId) => {
    try {
      const response = await fetch(`${API_URL}/api/addresses/${addressId}`, {
        method: "DELETE",
      });
      return response.ok;
    } catch (error) {
      console.error("Erro ao excluir endereço:", error);
      return false;
    }
  },
};

// --- SERVIÇO DE PAGAMENTO/PEDIDOS ---
export const paymentService = {
  processarPagamento: async (dadosPedido) => {
    try {
      const response = await fetch(`${API_URL}/api/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          valor_total: dadosPedido.valor_total,
          metodo_pagamento: dadosPedido.metodo_pagamento,
          fk_Cliente_id_cliente: dadosPedido.id_cliente
        }),
      });

      if (!response.ok) throw new Error("Erro ao processar pedido");
      return await response.json();
    } catch (error) {
      console.error("Erro na integração de pagamento:", error);
      throw error;
    }
  },
};
