
import { QuoteData, Branding, CatalogItem, ClientProfile, AppUser, Category } from './types';
import { MOCK_USERS, INITIAL_PROJECT_CATEGORIES, INITIAL_CATALOG } from './constants';

const getApiUrl = () => {
  const savedUrl = localStorage.getItem('cr_server_url');
  if (savedUrl) return savedUrl;
  
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:5000/api';
  }
  
  return `${window.location.origin}/api`;
};

const api = {
  async request(path: string, options: RequestInit = {}) {
    const baseUrl = getApiUrl();
    try {
      const response = await fetch(`${baseUrl}/${path}`, {
        ...options,
        headers: { 'Content-Type': 'application/json', ...options.headers },
        mode: 'cors'
      });
      
      if (response.status === 404) return { error: 'not_found' };
      if (response.status === 204 || response.status === 401) return null;
      
      const text = await response.text();
      try { 
        const json = JSON.parse(text);
        if (json && json.error) return json;
        return json;
      } catch { 
        return null; 
      }
    } catch (e) { 
      console.error("API Request Error:", e);
      return null; 
    }
  }
};

export const storage = {
  login: async (username: string, password: string): Promise<AppUser | null> => {
    const remoteUser = await api.request('login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
    if (remoteUser && !remoteUser.error) return remoteUser;
    const user = MOCK_USERS.find(u => u.username === username && u.password === password);
    if (user) {
      const { password: _, ...userSafe } = user;
      return userSafe as AppUser;
    }
    return null;
  },

  setServerUrl: (url: string) => localStorage.setItem('cr_server_url', url),
  getServerUrl: () => getApiUrl(),
  checkConnection: async (): Promise<boolean> => {
    const res = await api.request('health');
    return res && res.status === 'ok';
  },

  getQuotes: async (): Promise<QuoteData[]> => {
    const remote = await api.request('quotes');
    if (remote && Array.isArray(remote)) {
      localStorage.setItem('hybrid_quotes', JSON.stringify(remote));
      return remote;
    }
    const local = localStorage.getItem('hybrid_quotes');
    return local ? JSON.parse(local) : [];
  },

  getQuoteById: async (id: string): Promise<QuoteData | null> => {
    const remote = await api.request(`quotes/${id}`);
    if (remote && !remote.error && (remote.id || remote.project)) {
      return remote;
    }
    if (remote?.error === 'not_found') return null;
    const local = localStorage.getItem('hybrid_quotes');
    if (local) {
      const quotes: QuoteData[] = JSON.parse(local);
      return quotes.find(q => q.id === id) || null;
    }
    return null;
  },

  saveQuotes: async (quotes: QuoteData[]): Promise<void> => {
    localStorage.setItem('hybrid_quotes', JSON.stringify(quotes));
    await api.request('quotes/bulk', { method: 'POST', body: JSON.stringify({ items: quotes }) });
  },

  syncQuote: async (quote: QuoteData): Promise<void> => {
    await api.request('quotes', { method: 'POST', body: JSON.stringify(quote) });
  },

  deleteQuote: async (id: string) => {
    await api.request(`quotes/${id}`, { method: 'DELETE' });
  },

  getCategories: async (): Promise<Category[]> => {
    const remote = await api.request('categories');
    if (remote && Array.isArray(remote)) {
      localStorage.setItem('hybrid_categories', JSON.stringify(remote));
      return remote;
    }
    const local = localStorage.getItem('hybrid_categories');
    return local ? JSON.parse(local) : INITIAL_PROJECT_CATEGORIES;
  },

  saveCategories: async (categories: Category[]): Promise<void> => {
    localStorage.setItem('hybrid_categories', JSON.stringify(categories));
    await api.request('categories/bulk', { method: 'POST', body: JSON.stringify({ items: categories }) });
  },

  getBranding: async (): Promise<Branding | null> => {
    const remote = await api.request('branding');
    if (remote && !remote.error && remote.companyName) {
      localStorage.setItem('hybrid_branding', JSON.stringify(remote));
      return remote;
    }
    const local = localStorage.getItem('hybrid_branding');
    return local ? JSON.parse(local) : null;
  },

  saveBranding: async (branding: Branding): Promise<void> => {
    localStorage.setItem('hybrid_branding', JSON.stringify(branding));
    await api.request('branding', { method: 'POST', body: JSON.stringify(branding) });
  },

  getCatalog: async (): Promise<CatalogItem[]> => {
    const remote = await api.request('inventory');
    if (remote && Array.isArray(remote)) {
      localStorage.setItem('hybrid_inventory', JSON.stringify(remote));
      return remote;
    }
    const local = localStorage.getItem('hybrid_inventory');
    return local ? JSON.parse(local) : INITIAL_CATALOG;
  },

  saveCatalog: async (catalog: CatalogItem[]): Promise<void> => {
    localStorage.setItem('hybrid_inventory', JSON.stringify(catalog));
    await api.request('inventory/bulk', { method: 'POST', body: JSON.stringify({ items: catalog }) });
  },

  // NUEVA ACTUALIZACIÓN: Métodos para guardar ítems individuales y evitar payloads masivos
  saveCatalogItem: async (item: CatalogItem): Promise<void> => {
    await api.request('inventory', { method: 'POST', body: JSON.stringify(item) });
  },

  deleteCatalogItem: async (codigo: string): Promise<void> => {
    await api.request(`inventory/${encodeURIComponent(codigo)}`, { method: 'DELETE' });
  },

  getClients: async (): Promise<ClientProfile[]> => {
    const remote = await api.request('clients');
    if (remote && Array.isArray(remote)) {
      localStorage.setItem('hybrid_clients', JSON.stringify(remote));
      return remote;
    }
    const local = localStorage.getItem('hybrid_clients');
    return local ? JSON.parse(local) : [];
  },

  saveClients: async (clients: ClientProfile[]): Promise<void> => {
    localStorage.setItem('hybrid_clients', JSON.stringify(clients));
    await api.request('clients/bulk', { method: 'POST', body: JSON.stringify({ items: clients }) });
  },

  deleteClient: async (id: string) => {
    await api.request(`clients/${id}`, { method: 'DELETE' });
  },

  getUsers: async (): Promise<AppUser[] | null> => {
    const remote = await api.request('users');
    if (remote && Array.isArray(remote)) {
      localStorage.setItem('hybrid_users', JSON.stringify(remote));
      return remote;
    }
    const local = localStorage.getItem('hybrid_users');
    return local ? JSON.parse(local) : null;
  },

  saveUsers: async (users: AppUser[]): Promise<void> => {
    localStorage.setItem('hybrid_users', JSON.stringify(users));
    await api.request('users/bulk', { method: 'POST', body: JSON.stringify({ items: users }) });
  },

  getLastUser: async (): Promise<AppUser | null> => {
    const data = localStorage.getItem('hybrid_last_user');
    return data ? JSON.parse(data) : null;
  },

  saveLastUser: async (user: AppUser): Promise<void> => {
    localStorage.setItem('hybrid_last_user', JSON.stringify(user));
  }
};
