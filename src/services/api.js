import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE = 'https://www.capitalizarte.com/api';
const AUTH_TOKEN_KEY = 'capitalizarte.authToken';
const CHAT_HISTORY_KEY = 'capitalizarte.chatHistory';
const REQUEST_TIMEOUT = 10000; // 10 seconds

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

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  let res;
  let data = {};
  try {
    res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers,
      signal: controller.signal,
    });
    data = await res.json().catch(() => ({}));
  } catch (e) {
    if (e.name === 'AbortError') {
      throw new Error('timeout');
    }
    throw new Error('network_error');
  } finally {
    clearTimeout(timeoutId);
  }

  if (res.status === 401) {
    await clearToken();
  }

  if (!res.ok || data.ok === false) {
    throw new Error(data.error || `http_${res.status}`);
  }
  return data;
}

// Chat - uses the backend chatbot endpoint
export async function chat(message, history = []) {
  return request('/chatbot.php', {
    method: 'POST',
    body: JSON.stringify({ message, history }),
  });
}

// Chat history management
export async function getChatHistory() {
  const raw = await AsyncStorage.getItem(CHAT_HISTORY_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export async function saveChatHistory(history) {
  // Keep only last 20 messages to avoid storage bloat
  const trimmed = history.slice(-20);
  await AsyncStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(trimmed));
}

export async function clearChatHistory() {
  await AsyncStorage.removeItem(CHAT_HISTORY_KEY);
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
