// API Service para integração com o backend
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Tipos
export interface Categoria {
  id: number;
  nome: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Prato {
  id: number;
  nome: string;
  descricao?: string;
  preco: number;
  categoriaId: number;
  categoria?: Categoria;
  createdAt?: string;
  updatedAt?: string;
}

export interface ItemPedido {
  pratoId: number;
  quantidade: number;
  prato?: Prato;
}

export interface Pedido {
  id: number;
  items: ItemPedido[];
  total?: number;
  createdAt?: string;
  updatedAt?: string;
}

// Funções auxiliares
async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const url = `${API_URL}${endpoint}`;

  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  const response = await fetch(url, config);

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API Error: ${response.status} - ${error}`);
  }

  // Se a resposta for 204 (No Content) ou não tiver corpo, retorna undefined
  if (response.status === 204 || response.headers.get('content-length') === '0') {
    return undefined;
  }

  // Verificar se há conteúdo antes de tentar fazer parse
  const text = await response.text();
  if (!text || text.trim() === '') {
    return undefined;
  }

  try {
    return JSON.parse(text);
  } catch (e) {
    console.warn('Resposta não é JSON válido:', text);
    return undefined;
  }
}

// Categorias
export const categoriesAPI = {
  list: async (): Promise<Categoria[]> => {
    return fetchAPI('/api/categories');
  },

  getById: async (id: number): Promise<Categoria> => {
    return fetchAPI(`/api/categories/${id}`);
  },

  create: async (data: { nome: string }): Promise<Categoria> => {
    return fetchAPI('/api/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: number, data: { nome: string }): Promise<Categoria> => {
    return fetchAPI(`/api/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: number): Promise<void> => {
    return fetchAPI(`/api/categories/${id}`, {
      method: 'DELETE',
    });
  },
};

// Pratos (Dishes)
export const dishesAPI = {
  list: async (): Promise<Prato[]> => {
    return fetchAPI('/api/dishes');
  },

  getById: async (id: number): Promise<Prato> => {
    return fetchAPI(`/api/dishes/${id}`);
  },

  create: async (data: {
    nome: string;
    descricao?: string;
    preco: number;
    categoriaId: number;
  }): Promise<Prato> => {
    return fetchAPI('/api/dishes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (
    id: number,
    data: { nome?: string; descricao?: string; preco?: number; categoriaId?: number }
  ): Promise<Prato> => {
    return fetchAPI(`/api/dishes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: number): Promise<void> => {
    return fetchAPI(`/api/dishes/${id}`, {
      method: 'DELETE',
    });
  },
};

// Pedidos (Orders)
export const ordersAPI = {
  list: async (): Promise<Pedido[]> => {
    return fetchAPI('/api/orders');
  },

  getById: async (id: number): Promise<Pedido> => {
    return fetchAPI(`/api/orders/${id}`);
  },

  create: async (data: { items: { pratoId: number; quantidade: number }[] }): Promise<Pedido> => {
    return fetchAPI('/api/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (
    id: number,
    data: { items: { pratoId: number; quantidade: number }[] }
  ): Promise<Pedido> => {
    return fetchAPI(`/api/orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: number): Promise<void> => {
    return fetchAPI(`/api/orders/${id}`, {
      method: 'DELETE',
    });
  },
};

// Health check
export const healthAPI = {
  check: async (): Promise<any> => {
    return fetchAPI('/health');
  },
};
