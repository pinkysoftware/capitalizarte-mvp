/**
 * ============================================
 * API.JS — Servicio de comunicación con el servidor
 * ============================================
 * 
 * ¿Qué hace este archivo?
 * Define las funciones para comunicarse con el backend de Capitalizarte
 * (capitalizarte.com/api/)
 * 
 * Funciones disponibles:
 * - login(email, password) → inicia sesión
 * - register(name, email, password) → crea cuenta
 * - getProfile() → obtiene datos del usuario
 * - listTx(limit) → obtiene transacciones
 * - addTx(data) → agrega transacción
 * - etc.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// ============================================================================
// CONFIGURACIÓN
// ============================================================================

/** URL base del servidor de Capitalizarte */
const API_BASE = 'https://www.capitalizarte.com/api';

/** Clave usada para guardar el token en el almacenamiento local del celular */
const TOKEN_KEY = 'capitalizarte.token';

/**
 * Headers por defecto para todas las peticiones HTTP
 * Content-Type: JSON → enviamos y recibimos datos en formato JSON
 * Accept: JSON → esperamos recibir respuesta en JSON
 */
const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
};

// ============================================================================
// FUNCIONES AUXILIARES
// ============================================================================

/**
 * Hace una petición HTTP al servidor
 * 
 * @param {string} endpoint - La ruta de la API (ej: '/login')
 * @param {object} options - Opciones de fetch (method, body, headers)
 * @returns {Promise<object>} - La respuesta del servidor parseada como JSON
 * @throws {Error} - Si la petición falla o el servidor devuelve un error
 */
async function fetchApi(endpoint, options = {}) {
  // Obtenemos el token guardado (si existe)
  const token = await getToken();
  
  // Headers de esta petición en particular
  // Si hay token, lo incluimos para autenticarnos
  const headers = {
    ...DEFAULT_HEADERS,
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers || {}),  // Los headers específicos de esta llamada pisan los defaults
  };

  // Armamos la URL completa
  const url = `${API_BASE}${endpoint}`;

  try {
    // fetch: función nativa de JavaScript para hacer peticiones HTTP
    const response = await fetch(url, {
      ...options,
      headers,
    });

    // response.ok = false significa que el servidor devolvió un código de error (4xx, 5xx)
    if (!response.ok) {
      // Intentamos parsear el mensaje de error que devolvió el servidor
      let errorMessage = 'Error en la petición';
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch {
        // Si no se puede parsear el JSON del error, usamos el texto genérico
      }
      throw new Error(errorMessage);
    }

    // Si la respuesta es 204 No Content, no hay JSON que parsear
    if (response.status === 204) {
      return null;
    }

    // Parseamos la respuesta exitosa como JSON
    return await response.json();
  } catch (error) {
    // Log para debugging
    console.error(`API Error [${endpoint}]:`, error.message);
    throw error;
  }
}

// ============================================================================
// GESTIÓN DEL TOKEN (sesión)
// ============================================================================

/**
 * Guarda el token de sesión en el almacenamiento local
 * 
 * ¿Por qué guardamos el token?
 * Porque si el usuario cierra la app y la abre de nuevo,
 * no tiene que hacer login otra vez.
 * 
 * @param {string} token - El token que nos dio el servidor al hacer login
 */
export async function setToken(token) {
  await AsyncStorage.setItem(TOKEN_KEY, token);
}

/**
 * Obtiene el token guardado anteriormente
 * 
 * @returns {string|null} - El token o null si no hay ninguno guardado
 */
export function getToken() {
  return AsyncStorage.getItem(TOKEN_KEY);
}

/**
 * Elimina el token (cierra la sesión del usuario)
 */
export async function clearToken() {
  await AsyncStorage.removeItem(TOKEN_KEY);
}

/**
 * Recupera el token y verifica que no esté vacío
 * 
 * @returns {Promise<string|null>} - El token válido o null
 */
export async function hydrateToken() {
  try {
    const token = await getToken();
    return token && token.length > 0 ? token : null;
  } catch {
    return null;
  }
}

// ============================================================================
// FUNCIONES DE LA API (las que usamos en la app)
// ============================================================================

/**
 * Inicia sesión con email y contraseña
 * 
 * POST /login
 * Body: { email, password }
 * Response: { token, user: { id, name, email } }
 * 
 * @param {string} email 
 * @param {string} password 
 * @returns {Promise<object>} - Datos del usuario + token de sesión
 */
export const api = {
  async login({ email, password }) {
    const data = await fetchApi('/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    // Guardamos el token para futuras peticiones
    if (data.token) {
      await setToken(data.token);
    }
    return data;
  },

  /**
   * Crea una cuenta nueva
   * 
   * POST /register
   * Body: { name, email, password }
   * Response: { token, user: { id, name, email } }
   */
  register(payload) {
    return fetchApi('/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /**
   * Obtiene los datos del usuario autenticado
   * 
   * GET /profile
   * Headers: Authorization: Bearer {token}
   * Response: { id, name, email, created_at, ... }
   */
  async getProfile() {
    return await fetchApi('/profile');
  },

  /**
   * Cierra la sesión del usuario
   * 
   * POST /logout
   */
  async logout() {
    try {
      await fetchApi('/logout', { method: 'POST' });
    } finally {
      await clearToken();
    }
  },

  /**
   * Obtiene la lista de transacciones del usuario
   * 
   * GET /transactions?limit=100
   * Response: { transactions: [...] }
   * 
   * @param {number} limit - Cantidad máxima de transacciones a traer
   */
  async listTx(limit = 50) {
    return await fetchApi(`/transactions?limit=${limit}`);
  },

  /**
   * Agrega una nueva transacción (gasto o ingreso)
   * 
   * POST /transactions
   * Body: { tipo, naturaleza, categoria, monto, descripcion, fecha }
   * 
   * @param {object} tx - Datos de la transacción
   * @param {string} tx.tipo - 'GASTO' o 'INGRESO'
   * @param {string} tx.naturaleza - 'FIJO' o 'VARIABLE'
   * @param {string} tx.categoria - 'Alimentacion', 'Transporte', etc.
   * @param {number} tx.monto - Cantidad en números (ej: 450.50)
   * @param {string} tx.descripcion - Descripción libre (opcional)
   * @param {string} tx.fecha - Fecha en formato 'YYYY-MM-DD'
   */
  async addTx(tx) {
    return await fetchApi('/transactions', {
      method: 'POST',
      body: JSON.stringify(tx),
    });
  },

  /**
   * Elimina una transacción
   * 
   * DELETE /transactions/{id}
   */
  async deleteTx(id) {
    return await fetchApi(`/transactions/${id}`, {
      method: 'DELETE',
    });
  },

  /**
   * Obtiene el resumen financiero (totales de ingresos, gastos, balance)
   * 
   * GET /dashboard
   * Response: { balance_total, total_ingresos, total_gastos, ... }
   */
  async getDashboard() {
    return await fetchApi('/dashboard');
  },
};
