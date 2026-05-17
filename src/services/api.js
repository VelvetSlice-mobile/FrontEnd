import { database, saveUser } from "./database";
const API_URL = process.env.EXPO_PUBLIC_API_URL?.trim();
const REQUEST_TIMEOUT_MS = 12000;

let _onSessionExpired = null;
export const registerSessionExpiredHandler = (cb) => { _onSessionExpired = cb; };

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
    const response = await fetch(endpoint, {
      ...options,
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
    const response = await fetchWithTimeout("/api/clients/register", {
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
      throw new Error(
        await getApiErrorMessage(
          response,
          "Erro no registro: API indisponível",
        ),
      );
    }

    const data = await response.json();
    const normalized = normalizeSession(data, userData);

    saveUser({
      ...normalized,
      email: normalized.email || userData.email,
      phone: normalized.phone || userData.phone,
      password: userData.password,
    });

    return {
      ...normalized,
      email: normalized.email || userData.email,
      phone: normalized.phone || userData.phone,
    };
  },

  login: async (email, password) => {
    const response = await fetchWithTimeout("/api/clients/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, senha: password }),
    });
    if (!response.ok) throw new Error("Erro no login: API indisponível");
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

  uploadAvatar: async (id, imageUri, accessToken) => {
    const formData = new FormData();
    const fileName = imageUri.split("/").pop() || `avatar-${Date.now()}.jpg`;
    const ext = fileName.split(".").pop()?.toLowerCase();
    let mimeType = "image/jpeg";
    if (ext === "png") {
      mimeType = "image/png";
    } else if (ext === "webp") {
      mimeType = "image/webp";
    }

    formData.append("file", {
      uri: imageUri,
      name: fileName,
      type: mimeType,
    });

    const response = await fetchWithTimeout(`/api/clients/${id}/avatar`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(
        await getApiErrorMessage(response, "Erro ao enviar foto"),
      );
    }

    const data = await response.json();
    return normalizeUser(data?.user ?? data);
  },
};

export const productService = {
  getAll: async () => {
    try {
      const response = await fetch(`${API_URL}/api/products`);

      const response = await fetchWithTimeout("/api/products");

      const data = await response.json();
      return data.map((item) => ({
        id: item.id_bolo,
        name: item.nome,
        description: item.descricao,
        price: item.preco,
        image: item.imagem,
      }));
    } catch (error) {
      console.warn("Falha ao carregar produtos:", error?.message);
      return [];
    }
  },
};

export const addressService = {
  getByClientId: async (clientId) => {
    try {
      const response = await fetchWithTimeout(
        `/api/addresses/client/${clientId}`,
      );
      if (!response.ok) return null;

      const contentType = response.headers.get("content-type");
      if (contentType?.includes("application/json")) {
        const data = await response.json();
        return data;
      }
      return null;
    } catch (error) {
      console.warn("Falha ao carregar endereços:", error?.message);
      return null;
    }
  },

  create: async (addressData) => {
    try {
      const response = await fetch(getEndpoint("/api/addresses"), {
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
        } catch (parseError) {
          console.warn(
            "Não foi possível ler erro detalhado de endereço:",
            parseError?.message,
          );
        }
        throw new Error(errorMessage);
      }

      return await response.json();
    } catch (error) {
      console.error("Falha ao criar endereço:", error?.message);
      throw error;
    }
  },

  linkToClient: async (clientId, addressId) => {
    try {
      const response = await fetch(getEndpoint("/api/addresses/link"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fk_Cliente_id_cliente: clientId,
          fk_Endereco_id_endereco: addressId,
        }),
      });
      return response.ok;
    } catch (error) {
      console.warn("Falha ao vincular endereço ao cliente:", error?.message);
      return false;
    }
  },

  update: async (addressId, addressData) => {
    const response = await fetch(getEndpoint(`/api/addresses/${addressId}`), {
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
  },

  delete: async (addressId, clientId) => {
    try {
      const response = await fetch(getEndpoint(`/api/addresses/${addressId}`), {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId }),
      });
      return response.ok;
    } catch (error) {
      console.warn("Falha ao excluir endereço:", error?.message);
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
    const response = await fetch(getEndpoint("/api/orders"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        valor_total: orderData.valor_total,
        metodo_pagamento: orderData.metodo_pagamento,
        fk_Cliente_id_cliente:
          orderData.fk_Cliente_id_cliente ?? orderData.fk_cliente_id_cliente,

        fk_Endereco_id_endereco: orderData.fk_Endereco_id_endereco ?? null,
        itens: orderData.itens,
      }),
    });

        itens: orderData.itens,
      }),
    });


    if (!response.ok) throw new Error("Erro ao criar pedido");
    return await response.json();
  },

  getByClientId: async (clientId) => {
    const response = await fetchWithTimeout(`/api/orders/client/${clientId}`);
    if (!response.ok) throw new Error("Erro ao buscar pedidos");
    return await response.json();
  },
};

export const paymentService = {
  createPayment: async (paymentData) => {
    const response = await fetch(
      getEndpoint("/api/payments/create-preference"),
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: paymentData.items,
          id_pedido: paymentData.id_pedido,
          back_urls: paymentData.back_urls,
        }),
      },
    );

    if (!response.ok) throw new Error("Erro ao criar pagamento");
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
    const response = await fetch(getEndpoint(`/api/dashboard/pedidos/${id}/status`), {
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
    const response = await fetch(getEndpoint("/api/dashboard/bolos"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Erro ao criar bolo.");
    return response.json();
  },

  updateBolo: async (id, data) => {
    const response = await fetch(getEndpoint(`/api/dashboard/bolos/${id}`), {
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

  deleteBolo: async (id) => {
    const response = await fetch(getEndpoint(`/api/dashboard/bolos/${id}`), {
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
};

export const clearLocalUser = (email) => {
  database.runSync("DELETE FROM users WHERE email = ?", [email]);
};
