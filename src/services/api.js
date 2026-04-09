import { database } from "./database";
const API_URL = process.env.EXPO_PUBLIC_API_URL;

export const authService = {
  register: async (userData) => {
    const response = await fetch(`${API_URL}/api/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nome: userData.name,
        email: userData.email,
        senha: userData.password,
        telefone: userData.phone,
      }),
    });
    if (!response.ok) throw new Error("Erro no registro: API indisponível");

    const data = await response.json();

    database.runSync(
      "INSERT OR REPLACE INTO users (id, name, email, password, phone) VALUES (?, ?, ?, ?, ?)",
      [data.id_cliente, userData.name, userData.email, userData.password, userData.phone],
    );

    return data;
  },

  login: async (email, password) => {
    const response = await fetch(`${API_URL}/api/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, senha: password }),
    });
    if (!response.ok) throw new Error("Erro no login: API indisponível");

    return await response.json();
  },
};

export const productService = {
  getAll: async () => {
    try {
      const response = await fetch(`${API_URL}/api/products`);
      const data = await response.json();
      return data.map((item) => ({
        id: item.id_bolo,
        name: item.nome,
        description: item.descricao,
        price: item.preco,
        image: item.imagem,
      }));
    } catch (error) {
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
          imagem: productData.image,
        }),
      });
      return await response.json();
    } catch (error) {
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
      return false;
    }
  },
};

export const addressService = {
  getByClientId: async (clientId) => {
    try {
      const response = await fetch(
        `${API_URL}/api/addresses/client/${clientId}`,
      );
      if (!response.ok) return null;

      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const data = await response.json();
        return data;
      }
      return null;
    } catch (error) {
      return null;
    }
  },

  create: async (addressData) => {
    try {
      const response = await fetch(`${API_URL}/api/addresses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome_endereco: addressData.nome_endereco,
          logradouro: addressData.logradouro,
          numero: addressData.numero,
          CEP: addressData.CEP,
          estado: addressData.estado,
          complemento: addressData.complemento,
          fk_Cliente_id_cliente: addressData.fk_Cliente_id_cliente,
        }),
      });

      if (!response.ok) {
        let errorMessage = "Erro ao salvar endereço no servidor";
        try {
          const errorBody = await response.json();
          if (errorBody?.error) {
            errorMessage = `Erro ao salvar endereço: ${errorBody.error}`;
          }
        } catch (_) {
        }
        throw new Error(errorMessage);
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  },

  linkToClient: async (clientId, addressId) => {
    try {
      const response = await fetch(`${API_URL}/api/addresses/link`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fk_Cliente_id_cliente: clientId,
          fk_Endereco_id_endereco: addressId,
        }),
      });
      return response.ok;
    } catch (error) {
      return false;
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
          CEP: addressData.CEP,
          estado: addressData.estado,
          complemento: addressData.complemento,
        }),
      });

      if (!response.ok) throw new Error("Erro ao atualizar");

      return true;
    } catch (error) {
      throw error;
    }
  },

  delete: async (addressId, clientId) => {
    try {
      const response = await fetch(`${API_URL}/api/addresses/${addressId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId }),
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  },
};

export const orderService = {
  createOrder: async (orderData) => {
    try {
      const response = await fetch(`${API_URL}/api/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          valor_total: orderData.valor_total,
          metodo_pagamento: orderData.metodo_pagamento,
          fk_Cliente_id_cliente:
            orderData.fk_Cliente_id_cliente ?? orderData.fk_cliente_id_cliente,
          itens: orderData.itens,
        }),
      });

      if (!response.ok) throw new Error("Erro ao criar pedido");
      return await response.json();
    } catch (error) {
      throw error;
    }
  },

  getByClientId: async (clientId) => {
    try {
      const response = await fetch(`${API_URL}/api/orders/client/${clientId}`);
      if (!response.ok) throw new Error("Erro ao buscar pedidos");
      return await response.json();
    } catch (error) {
      return [];
    }
  },
};

export const paymentService = {
  createPayment: async (paymentData) => {
    try {
      const response = await fetch(`${API_URL}/api/payments/create-preference`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: paymentData.items,
          id_pedido: paymentData.id_pedido,
          back_urls: paymentData.back_urls,
        }),
      });

      if (!response.ok) throw new Error("Erro ao criar pagamento");
      return await response.json();
    } catch (error) {
      throw error;
    }
  },
};

export const clearLocalUser = (email) => {
  database.runSync("DELETE FROM users WHERE email = ?", [email]);
};
