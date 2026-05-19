import { database, saveUser } from "./database";
const API_URL = process.env.EXPO_PUBLIC_API_URL?.trim();
const REQUEST_TIMEOUT_MS = 12000;

let _onSessionExpired = null;
export const registerSessionExpiredHandler = (cb) => { _onSessionExpired = cb; };

let _authToken = null;
export const setAuthToken = (token) => { _authToken = token; };

const getEndpoint = (path) => {
  if (!API_URL) {
    throw new Error(
      "EXPO_PUBLIC_API_URL não configurado. Crie um arquivo .env na raiz com EXPO_PUBLIC_API_URL=http://<seu_ip_local>:3000",
    );
  }

  const base = API_URL.replace(/\/+$/, "");
  return `${base}${path}`;
};

const fetchWithTimeout = async (
  path,
  options = {},
  timeoutMs = REQUEST_TIMEOUT_MS,
) => {
  const endpoint = getEndpoint(path);
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const AUTH_PATHS = ["/api/clients/login", "/api/clients/register"];

  try {
    const headers = { ...(options.headers || {}) };
    if (_authToken && !headers.Authorization && !headers.authorization) {
      headers.Authorization = `Bearer ${_authToken}`;
    }

    const response = await fetch(endpoint, {
      ...options,
      headers,
      signal: controller.signal,
    });

    if (response.status === 401 && !AUTH_PATHS.some((p) => path.startsWith(p)) && _onSessionExpired) {
      _onSessionExpired();
    }

    return response;
  } catch (error) {
    if (error?.name === "AbortError") {
      throw new Error(
        `Timeout de rede ao acessar ${endpoint}. Verifique se o backend está ativo e acessível pela mesma rede do dispositivo.`,
      );
    }

    throw new Error(
      `Falha de conexão com ${endpoint}. Confirme se EXPO_PUBLIC_API_URL (${API_URL}) está correto e se celular/emulador consegue acessar esse IP.`,
    );
  } finally {
    clearTimeout(timeoutId);
  }
};

const adminFetch = (path, options = {}) => {
  const headers = { ...(options.headers || {}) };
  if (_authToken) headers.Authorization = `Bearer ${_authToken}`;
  return fetch(getEndpoint(path), { ...options, headers });
};

const normalizeUser = (user) => ({
  id: user.id ?? user.id_cliente ?? null,
  id_cliente: user.id_cliente ?? user.id ?? null,
  name: user.name ?? user.nome ?? null,
  email: user.email ?? null,
  phone: user.phone ?? user.telefone ?? null,
  password: user.password ?? user.senha ?? null,
  avatarUrl: user.avatarUrl ?? user.avatar_url ?? user.foto_perfil ?? null,
  accessToken: user.accessToken ?? user.access_token ?? null,
  tokenType: user.tokenType ?? user.token_type ?? null,
  role: user.role ?? "cliente",
  lastPasswordChange: user.lastPasswordChange ?? user.ultima_alteracao_senha ?? null,
});

const normalizeSession = (payload, fallbackUserData = {}) => {
  const source = payload?.user ?? payload ?? {};
  const normalized = normalizeUser(source);

  return {
    ...normalized,
    name: normalized.name ?? fallbackUserData.name ?? null,
    email: normalized.email ?? fallbackUserData.email ?? null,
    phone: normalized.phone ?? fallbackUserData.phone ?? null,
    password: fallbackUserData.password ?? null,
    accessToken:
      payload?.access_token ??
      payload?.accessToken ??
      normalized.accessToken ??
      null,
    tokenType:
      payload?.token_type ??
      payload?.tokenType ??
      normalized.tokenType ??
      "Bearer",
  };
};

const getApiErrorMessage = async (response, fallbackMessage) => {
  const errorData = await response.json().catch(() => null);
  if (response.status === 400) {
    return (
      errorData?.error ||
      errorData?.message ||
      "Arquivo inválido. Envie uma imagem JPG, PNG ou WEBP de até 3MB."
    );
  }

  if (response.status === 401) {
    return (
      errorData?.error ||
      errorData?.message ||
      "Sessão expirada. Faça login novamente."
    );
  }

  if (response.status === 403) {
    return (
      errorData?.error ||
      errorData?.message ||
      "Você não tem permissão para alterar esta foto."
    );
  }

  return errorData?.error || errorData?.message || fallbackMessage;
};

export const authService = {
  register: async (userData) => {
    const response = await fetch(getEndpoint("/api/clients/register"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nome: userData.name,
        email: userData.email,
        senha: userData.password,
        telefone: userData.phone,
      }),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || "Erro no registro.");
    }

    const data = await response.json();
    const normalized = normalizeSession(data, { email: userData.email, password: userData.password, phone: userData.phone });

    saveUser(normalized);
    return normalized;
  },

  login: async (email, password) => {
    const response = await fetch(getEndpoint("/api/clients/login"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, senha: password }),
    });
    if (!response.ok) {
      throw new Error(
        await getApiErrorMessage(response, "Erro no login: API indisponível"),
      );
    }

    const data = await response.json();
    const normalized = normalizeSession(data, { email, password });

    saveUser({
      ...normalized,
      password,
    });

    return normalized;
  },

  resetPassword: async (email, novaSenha) => {
    const response = await fetch(getEndpoint("/api/clients/reset-password"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim().toLowerCase(), novaSenha }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.error || errorData?.message || "Erro ao redefinir senha.");
    }

    return await response.json();
  },

  updatePassword: async (id, { senhaAtual, novaSenha }) => {
    const response = await fetchWithTimeout(`/api/clients/${id}/password`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ senhaAtual, novaSenha }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.error || errorData?.message || "Erro ao alterar senha.");
    }

    return await response.json();
  },

  updateProfile: async (id, profileData) => {
    const response = await fetchWithTimeout(`/api/clients/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nome: profileData.name,
        email: profileData.email,
        telefone: profileData.phone,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(
        errorData?.error || errorData?.message || "Erro ao atualizar perfil",
      );
    }

    return await response.json();
  },

  uploadAvatar: async (userId, imageUri, accessToken) => {
    const formData = new FormData();
    const fileName = imageUri.split("/").pop() || `avatar-${Date.now()}.jpg`;
    const ext = fileName.split(".").pop()?.toLowerCase();
    const mimeType = ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : "image/jpeg";

    formData.append("file", { uri: imageUri, name: fileName, type: mimeType });

    const response = await fetchWithTimeout(`/api/clients/${userId}/avatar`, {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}` },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(await getApiErrorMessage(response, "Erro ao atualizar foto de perfil."));
    }

    const data = await response.json();
    return normalizeUser(data.user ?? data);
  },
};

export const productService = {
  getAll: async () => {
    try {
      const response = await fetchWithTimeout("/api/bolos");
      const data = await response.json();
      return data.map((item) => ({
        id: item.id_bolo,
        name: item.nome,
        description: item.descricao,
        price: item.preco,
        image: item.imagem,
        categoria: item.categoria ?? "",
      }));
    } catch {
      return [];
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
          bairro: addressData.bairro,
          cidade: addressData.cidade,
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
          bairro: addressData.bairro,
          cidade: addressData.cidade,
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
    const response = await fetchWithTimeout("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        valor_total: orderData.valor_total,
        metodo_pagamento: orderData.metodo_pagamento,
        fk_Cliente_id_cliente:
          orderData.fk_Cliente_id_cliente ?? orderData.fk_cliente_id_cliente,
        fk_Endereco_id_endereco: orderData.fk_Endereco_id_endereco ?? null,
        cupom_codigo: orderData.cupom_codigo ?? null,
        desconto_valor: orderData.desconto_valor ?? 0,
        itens: orderData.itens,
      }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || `Erro ${response.status} ao criar pedido`);
    }
    return await response.json();
  },

  getByClientId: async (clientId) => {
    try {
      const response = await fetch(`${API_URL}/api/orders/client/${clientId}`);
      if (!response.ok) throw new Error("Erro ao buscar pedidos");
      return await response.json();
    } catch {
      return [];
    }
  },

  getItems: async (orderId) => {
    try {
      const response = await fetch(`${API_URL}/api/orders/${orderId}/items`);
      if (!response.ok) return [];
      return await response.json();
    } catch {
      return [];
    }
  },
};

export const paymentService = {
  createPayment: async (paymentData) => {
    const response = await fetch(`${API_URL}/api/payments/create-preference`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: paymentData.items,
        id_pedido: paymentData.id_pedido,
        metodo_pagamento: paymentData.metodo_pagamento,
        back_urls: paymentData.back_urls,
      }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || errData.message || `Erro ${response.status} ao criar pagamento`);
    }
    return await response.json();
  },
};

export const cupomService = {
  validate: async (codigo) => {
    const response = await fetchWithTimeout("/api/cupons/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ codigo }),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || "Cupom inválido.");
    }
    return response.json();
  },
};

export const adminService = {
  registerAdmin: async ({ nome, telefone, email, senha, codigo }) => {
    const response = await fetch(getEndpoint("/api/dashboard/register-admin"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, telefone, email, senha, codigo }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || "Erro ao cadastrar administrador.");
    return data;
  },

  getStats: async () => {
    const response = await fetchWithTimeout("/api/dashboard/stats");
    if (!response.ok) throw new Error("Erro ao buscar estatísticas.");
    return response.json();
  },

  getMaisVendidos: async () => {
    const response = await fetchWithTimeout("/api/dashboard/mais-vendidos");
    if (!response.ok) throw new Error("Erro ao buscar mais vendidos.");
    return response.json();
  },

  getPedidos: async (status) => {
    const qs = status ? `?status=${encodeURIComponent(status)}` : "";
    const response = await fetchWithTimeout(`/api/dashboard/pedidos${qs}`);
    if (!response.ok) throw new Error("Erro ao buscar pedidos.");
    return response.json();
  },

  getPedidoDetalhado: async (id) => {
    const response = await fetchWithTimeout(`/api/dashboard/pedidos/${id}`);
    if (!response.ok) throw new Error("Erro ao buscar pedido.");
    return response.json();
  },

  updatePedidoStatus: async (id, status_pedido) => {
    const response = await adminFetch(`/api/dashboard/pedidos/${id}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status_pedido }),
    });
    if (!response.ok) throw new Error("Erro ao atualizar status.");
    return response.json();
  },

  getBolos: async () => {
    const response = await fetchWithTimeout("/api/dashboard/bolos");
    if (!response.ok) throw new Error("Erro ao buscar bolos.");
    return response.json();
  },

  createBolo: async (data) => {
    const response = await adminFetch("/api/dashboard/bolos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Erro ao criar bolo.");
    return response.json();
  },

  updateBolo: async (id, data) => {
    const response = await adminFetch(`/api/dashboard/bolos/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Erro ao atualizar bolo.");
    return response.json();
  },

  uploadBoloImage: async (id, imageUri) => {
    const formData = new FormData();
    const fileName = imageUri.split("/").pop() || `product-${Date.now()}.jpg`;
    const ext = fileName.split(".").pop()?.toLowerCase();
    const mimeType = ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : "image/jpeg";

    formData.append("file", { uri: imageUri, name: fileName, type: mimeType });

    const response = await fetchWithTimeout(`/api/dashboard/bolos/${id}/image`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || "Erro ao enviar imagem do produto.");
    }

    return response.json();
  },

  toggleBoloAtivo: async (id) => {
    const response = await adminFetch(`/api/dashboard/bolos/${id}/toggle`, {
      method: "PATCH",
    });
    if (!response.ok) throw new Error("Erro ao alterar status do bolo.");
    return response.json();
  },

  deleteBolo: async (id) => {
    const response = await adminFetch(`/api/dashboard/bolos/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Erro ao excluir bolo.");
    return response.json();
  },
};

export const avaliacaoService = {
  getByBolo: async (boloId) => {
    const response = await fetchWithTimeout(`/api/bolos/${boloId}/avaliacoes`);
    if (!response.ok) throw new Error("Erro ao buscar avaliações.");
    return response.json();
  },

  create: async (boloId, { nota, comentario, fk_Cliente_id_cliente }) => {
    const response = await fetchWithTimeout(`/api/bolos/${boloId}/avaliacoes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nota, comentario, fk_Cliente_id_cliente }),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || "Erro ao enviar avaliação.");
    }
    return response.json();
  },

  getByClient: async (clientId) => {
    const response = await fetchWithTimeout(`/api/bolos/avaliacoes/cliente/${clientId}`);
    if (!response.ok) throw new Error("Erro ao buscar avaliações.");
    return response.json();
  },

  update: async (id, { nota, comentario }) => {
    const response = await fetchWithTimeout(`/api/bolos/avaliacoes/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nota, comentario }),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || "Erro ao atualizar avaliação.");
    }
    return response.json();
  },

  delete: async (id) => {
    const response = await fetchWithTimeout(`/api/bolos/avaliacoes/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || "Erro ao excluir avaliação.");
    }
    return response.json();
  },
};

export const clearLocalUser = (email) => {
  database.runSync("DELETE FROM users WHERE email = ?", [email]);
};
