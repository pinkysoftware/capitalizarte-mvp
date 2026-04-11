import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE = 'https://www.capitalizarte.com/api';
const AUTH_TOKEN_KEY = 'capitalizarte.authToken';

let authToken = null;

export function getToken() {
  return authToken;
}

export async function setToken(token) {
  authToken = token || null;
  if (token) {
    await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
  } else {
    await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
  }
}

export async function clearToken() {
  authToken = null;
  await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
}

export async function hydrateToken() {
  const stored = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
  authToken = stored || null;
  return authToken;
}

async function request(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };
  if (authToken) headers.Authorization = `Bearer ${authToken}`;

  let res;
  let data = {};
  try {
    res = await fetch(`${API_BASE}${path}`, { ...options, headers });
    data = await res.json().catch(() => ({}));
  } catch {
    throw new Error('network_error');
  }

  if (res.status === 401) {
    await clearToken();
  }

  if (!res.ok || data.ok === false) {
    throw new Error(data.error || `http_${res.status}`);
  }
  return data;
}

export const api = {
  register: (payload) => request('/register.php', { method: 'POST', body: JSON.stringify(payload) }),
  login: (payload) => request('/login.php', { method: 'POST', body: JSON.stringify(payload) }),
  getProfile: () => request('/user/profile.php'),
  updateProfile: (payload) => request('/user/profile.php', { method: 'PUT', body: JSON.stringify(payload) }),
  addTx: (payload) => request('/transactions.php', { method: 'POST', body: JSON.stringify(payload) }),
  deleteTx: (id) => request(`/transactions.php?id=${id}`, { method: 'DELETE' }),
  listTx: (limit = 50) => request(`/transactions.php?limit=${limit}`),
  getDashboard: (month) => request(`/dashboard.php${month ? `?month=${month}` : ''}`),
  requestPasswordReset: (payload) => request('/auth/recover.php', { method: 'POST', body: JSON.stringify(payload) }),
  resetPassword: (payload) => request('/auth/reset-password.php', { method: 'POST', body: JSON.stringify(payload) }),
};
