const BASE = import.meta.env.VITE_API_BASE?.replace(/\/+$/, '') || '';

async function req(path, { method = 'GET', body, headers } = {}) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...headers },
    credentials: 'include',                    
    body: body ? JSON.stringify(body) : undefined
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
  return data;
}

export const API = {
  // auth
  loginWithGoogle: (idToken) => req('/api/auth/google', { method: 'POST', body: { idToken } }),
  me: () => req('/api/auth/me'),
  logout: () => req('/api/auth/logout', { method: 'POST' }),

  // health
  health: () => req('/api/health'),

  // ingestion (public)
  listCustomers: (page = 1, limit = 50) => req(`/api/customers?page=${page}&limit=${limit}`),
  createCustomer: (payload) => req('/api/customers', { method: 'POST', body: payload }),
  createOrder: (payload) => req('/api/orders', { method: 'POST', body: payload }),
  createOrderByEmail: (payload) => req('/api/orders/by-email', { method: 'POST', body: payload }),
  updateCustomer: (id, payload) => req(`/api/customers/${id}`, { method: 'PUT', body: payload }),


  // protected
  previewSegment: (rules) => req('/api/segments/preview', { method: 'POST', body: { rules } }),
  createSegment: (name, rules) => req('/api/segments', { method: 'POST', body: { name, rules } }),
  listSegments: () => req('/api/segments'),
  createCampaign: (segmentId, message) => req('/api/campaigns', { method: 'POST', body: { segmentId, message } }),
  listCampaigns: () => req('/api/campaigns'),
  sendCampaign: (campaignId) => req(`/api/campaigns/${campaignId}/send`, { method: 'POST' }),
  campaignHistory: () => req('/api/campaigns/history'),
};

export default API;
