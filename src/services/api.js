import { database, saveUser } from "./database";
const API_URL = process.env.EXPO_PUBLIC_API_URL?.trim();
const REQUEST_TIMEOUT_MS = 12000;

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

  try {
    return await fetch(endpoint, {
      ...options,
      signal: controller.signal,
    });
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

  create: async (productData) => {
    const response = await fetchWithTimeout("/api/products", {
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
  },

  delete: async (productId) => {
    try {
      const response = await fetchWithTimeout(`/api/products/${productId}`, {
        method: "DELETE",
      });
      return response.ok;
    } catch (error) {
      console.warn("Falha ao excluir produto:", error?.message);
      return false;
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
    const response = await fetch(getEndpoint("/api/orders"), {
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

export const clearLocalUser = (email) => {
  database.runSync("DELETE FROM users WHERE email = ?", [email]);
};
