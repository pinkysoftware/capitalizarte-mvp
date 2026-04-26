import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE = 'https://www.capitalizarte.com/api';
const AUTH_TOKEN_KEY = 'capitalizarte.authToken';
const CHAT_HISTORY_KEY = 'capitalizarte.chatHistory';
const REQUEST_TIMEOUT = 15000;

const GROQ_API_KEY = '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';
const GROQ_MODEL = 'llama-3.1-8b-instant';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// Token storage - always read fresh from AsyncStorage for chat calls
export function getToken() {
  return null; // Will be set on login
}

export async function setToken(token) {
  if (token) {
    await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
  } else {
    await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
  }
}

export async function clearToken() {
  await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
}

export async function hydrateToken() {
  return await AsyncStorage.getItem(AUTH_TOKEN_KEY);
}

// Internal token getter for requests
async function getStoredToken() {
  try {
    return await AsyncStorage.getItem(AUTH_TOKEN_KEY);
  } catch (e) {
    return null;
  }
}

async function request(path, options = {}) {
  // Always get fresh token for each request
  const token = await getStoredToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

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
    await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
  }

  if (!res.ok || data.ok === false) {
    throw new Error(data.error || `http_${res.status}`);
  }
  return data;
}

// Obtiene los datos financieros del usuario para dar contexto a la IA
async function getFinancialContext() {
  const token = await getStoredToken();
  if (!token) {
    return 'NOTA: No hay sesión activa. El usuario necesita iniciar sesión para ver sus datos financieros.';
  }
  
  let dashboardData = null;
  let txData = null;
  
  // Obtener dashboard
  try {
    dashboardData = await request('/dashboard.php');
  } catch (e) {
    // Continue even if dashboard fails
  }
  
  // Obtener transacciones
  try {
    txData = await request('/transactions.php?limit=10');
  } catch (e) {
    // Continue even if transactions fails
  }

  let context = '';
  
  // Resumen del dashboard
  if (dashboardData && dashboardData.saldo !== undefined) {
    const ing = dashboardData.ingresos || 0;
    const gas = dashboardData.gastos || 0;
    const sal = dashboardData.saldo || 0;
    context += 'RESUMEN FINANCIERO DEL MES ACTUAL:\n';
    context += '- Ingresos del mes: ' + (ing > 0 ? '$' + Math.round(ing).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') : '$0') + '\n';
    context += '- Gastos del mes: ' + (gas > 0 ? '$' + Math.round(gas).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') : '$0') + '\n';
    context += '- Balance actual: ' + (sal >= 0 ? '$' + Math.round(sal).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') : '-$' + Math.abs(Math.round(sal)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')) + '\n';
    if (dashboardData.salud_financiera !== undefined) {
      context += '- Salud financiera: ' + dashboardData.salud_financiera + '%\n';
    }
  }
  
  // Resumen del dashboard
  if (dashboardData && dashboardData.saldo !== undefined) {
    const ing = dashboardData.ingresos || 0;
    const gas = dashboardData.gastos || 0;
    const sal = dashboardData.saldo || 0;
    context += 'RESUMEN FINANCIERO DEL MES ACTUAL:\n';
    context += '- Ingresos del mes: ' + (ing > 0 ? '$' + Math.round(ing).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') : '$0') + '\n';
    context += '- Gastos del mes: ' + (gas > 0 ? '$' + Math.round(gas).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') : '$0') + '\n';
    context += '- Balance actual: ' + (sal >= 0 ? '$' + Math.round(sal).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') : '-$' + Math.abs(Math.round(sal)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')) + '\n';
    if (dashboardData.salud_financiera !== undefined) {
      context += '- Salud financiera: ' + dashboardData.salud_financiera + '%\n';
    }
  }
  
  // Debug: ver estructura real de las transacciones
  const rawTx = dashboardData?.ultimas_transacciones || txData?.data || [];
  if (rawTx.length > 0) {
    console.log('TX raw sample:', JSON.stringify(rawTx[0]));
  }
  
  // Ultimas transacciones
  const txList = rawTx;
  if (txList.length > 0) {
    context += '\nULTIMAS TRANSACCIONES:\n';
    txList.slice(0, 10).forEach(tx => {
      const tipo = tx.type === 'income' ? 'INGRESO' : 'GASTO';
      // Handle various field names - backend usa 'monto' no 'amount'
      const monto = tx.monto || tx.amount || tx.value || tx.importe || 0;
      const montoNum = typeof monto === 'string' ? parseFloat(monto.replace(/[^0-9.-]/g, '')) : monto;
      const montoStr = montoNum > 0 ? '$' + Math.round(montoNum).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') : 's/monto';
      const signo = tx.type === 'income' ? '+' : '-';
      const cat = tx.categoria || tx.category || 'Sin categoria';
      const desc = tx.descripcion || tx.description || tx.nota || '-';
      context += tipo + ': ' + cat + ' ' + signo + montoStr + ' | ' + desc + '\n';
    });
  }
  
  if (!context || context === 'RESUMEN FINANCIERO') {
    return 'NOTA: No se pudieron obtener los datos financieros del servidor.';
  }
  
  return context;
}

const SYSTEM_PROMPT_BASE = `Sos el asistente financiero personal de Capitalizarte. Ayudás a Toche a entender sus finanzas.

PERSONALIDAD:
- Amigable, directo, sin jerga innecesaria
- Hablás en español argentino (vos)
- Respondés de forma concisa pero útil

REGLAS MUY IMPORTANTES SOBRE LOS DATOS:
- Las transacciones tienen dos tipos: GASTO (expense, con -) e INGRESO (income, con +)
- NUNCA confundas un GASTO con un INGRESO
- Cuando te pregunten por "mayor gasto" o "gasto más grande":
  - FILTRÁ solo las transacciones tipo GASTO
  - Buscá la de mayor monto ABSOLUTO
  - Respondé con esa transacción específica
- Cuando te pregunten por "mayor ingreso":
  - FILTRÁ solo las transacciones tipo INGRESO
  - Buscá la de mayor monto
- Cuando te pregunten por "gastos" en general: solo transacciones GASTO
- Cuando te pregunten por "ingresos" en general: solo transacciones INGRESO
- Los montos en NEGATIVO (con -) son GASTOS
- Los montos en POSITIVO (con +) son INGRESOS

REGLAS DE RESPUESTA:
- Cuando te piden registrar un gasto o ingreso, respondé con un mensaje confirmando lo que vas a registrar
- Los datos financieros que te damos son REALES y están actualizados`;

// Chat - Groq direct con contexto financiero
export async function chat(message, history = []) {
  // Obtener contexto financiero primero
  const financialContext = await getFinancialContext();
  
  const systemPrompt = financialContext 
    ? `${SYSTEM_PROMPT_BASE}\n\n${financialContext}`
    : SYSTEM_PROMPT_BASE;

  const messages = [
    { role: 'system', content: systemPrompt },
    ...history.map(h => ({
      role: h.role === 'ai' ? 'assistant' : 'user',
      content: h.content,
    })),
    { role: 'user', content: message },
  ];

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  try {
    const res = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: messages,
        temperature: 0.7,
        max_tokens: 1024,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`http_${res.status}`);
    }

    const data = await res.json();
    return data.choices?.[0]?.message?.content || 'No pude obtener respuesta.';
  } catch (e) {
    clearTimeout(timeoutId);
    if (e.name === 'AbortError') {
      throw new Error('timeout');
    }
    throw new Error('network_error');
  }
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
  requestPasswordReset: (payload) => request('/forgot_password.php', { method: 'POST', body: JSON.stringify(payload) }),
  resetPassword: (payload) => request('/reset_password.php', { method: 'POST', body: JSON.stringify(payload) }),
};

// Also export these for direct use
export { getStoredToken };
