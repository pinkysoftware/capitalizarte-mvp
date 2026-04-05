/**
 * ============================================
 * NATURALLANGUAGEPARSER.JS — Parser de texto natural
 * ============================================
 * 
 * ¿Qué hace este archivo?
 * Recibe texto como "cafe 4.50" o "comida 500" y extrae:
 * - El MONTO (número)
 * - La CATEGORÍA (Alimentacion, Transporte, etc)
 * - El TIPO (GASTO o INGRESO)
 * 
 * Ejemplos de lo que entiende:
 *   "cafe 4.50"           → { monto: 4.50, categoria: 'Alimentacion', tipo: 'GASTO' }
 *   "comida 500"          → { monto: 500, categoria: 'Alimentacion', tipo: 'GASTO' }
 *   "salario 50000"       → { monto: 50000, categoria: 'Salario', tipo: 'INGRESO' }
 *   "nafta 200"           → { monto: 200, categoria: 'Transporte', tipo: 'GASTO' }
 */

/**
 * Palabras clave que indican que es un GASTO
 * Si el texto contiene alguna de estas palabras, se clasifica en la categoría correspondiente
 */
const expenseKeywords = {
  // Categoría: palabras que la activan
  Alimentacion: [
    'comida', 'almuerzo', 'cena', 'cafe', 'café', 'desayuno', 'gasto',  // comidas generales
    'supermercado', 'verduleria', 'carniceria', 'panaderia',              // lugares de compra
    'pizza', 'burger', 'mcdonald', 'burger king', 'subway',               // fast food
    'latte', 'starbucks', 'mercadito', 'carrefour', 'dia', 'jumbo', 'vea', // supermercados
    'walmart', 'whole foods', 'restaurant', 'delivery',                   // delivery
    'pedidos ya', 'rappi', 'uber eats'                                     // apps de delivery
  ],
  Transporte: [
    'nafta', 'gasolina', 'combustible', 'subte', 'metro', 'bus',         // transporte público
    'taxi', 'uber', 'cabify', 'peaje', 'estacionamiento',                 // auto y taxi
    'patente', 'seguro', 'mantenimiento auto', 'llanta', 'neumático',     // auto
    'aceite', 'service', 'bird', 'lime', 'scooter'                         // scooters compartidos
  ],
  Vivienda: [
    'alquiler', 'expensas', 'luz', 'electricidad', 'gas',                 // servicios del hogar
    'internet', 'telefono', 'celular', 'agua',                             // comunicaciones
    'muebles', 'decoracion', 'reparacion', 'pintura', 'mudanza'            // mejoras del hogar
  ],
  Salud: [
    'medicamento', 'doctor', 'medico', 'clinica', 'hospital',             // salud
    'analisis', 'laboratorio', 'obra social',                               // estudios y prepaga
    'curacion', 'vendaje', 'inyeccion', 'vacuna'                          // atención básica
  ],
  Entretenimiento: [
    'netflix', 'spotify', 'disney', 'amazon prime', 'hbo',                // streaming
    'pelicula', 'cine', 'teatro', 'concierto',                             // entretenimiento
    'juego', 'gaming', 'playstation', 'xbox', 'nintendo', 'steam',        // gaming
    'aplicacion', 'app', 'musica', 'serie'                                 // apps y medios
  ],
  Deuda: [
    'credito', 'prestamo', 'tarjeta', 'cuota', 'debito automatico', 'anticipo'
  ],
  Inversion: [
    'inversion', 'fondo', 'plazo fijo', 'acciones', 'bitcoin', 'cripto', 'dolares', 'cedear', 'bono'
  ],
};

/**
 * Palabras clave para INGRESOS
 * Si el texto contiene alguna de estas, se clasifica como INGRESO
 */
const incomeKeywords = {
  Salario: ['salario', 'sueldo', 'honorario', 'liquidacion', 'haber', 'neto', 'bruto'],
  Ventas: ['venta', 'articulo', 'producto', 'mercado', 'local', 'negocio'],
  Freelance: ['freelance', 'freelancer', 'proyecto', 'consultoria', 'asesoria', 'servicio'],
  Comision: ['comision', 'bonus', 'gratificacion', 'propina'],
  Interes: ['interes', 'rendimiento', 'dividendo', 'cupon'],
};

/**
 * Detecta si una categoría contiene una keyword del texto
 * 
 * @param {string} text - El texto a analizar (ej: "cafe 4.50")
 * @param {string[]} keywords - Array de palabras clave de la categoría
 * @returns {boolean} - true si alguna keyword está en el texto
 */
function matchKeyword(text, keywords) {
  const lower = text.toLowerCase();
  for (const kw of keywords) {
    // Si es un array (varias palabras que deben estar todas), checkeamos todas
    if (Array.isArray(kw)) {
      if (kw.every(k => lower.includes(k))) return true;
    } else {
      // Si el texto incluye esta keyword,返回 true
      if (lower.includes(kw)) return true;
    }
  }
  return false;
}

/**
 * Detecta la categoría de un gasto basándose en las palabras clave
 * 
 * @param {string} text - Texto del usuario (ej: "uber al trabajo")
 * @returns {string} - Nombre de la categoría o 'Otro' si no matcheó nada
 */
function detectExpenseCategory(text) {
  for (const [cat, keywords] of Object.entries(expenseKeywords)) {
    if (matchKeyword(text, keywords)) return cat;
  }
  return 'Otro';  // Si no matcheó ninguna, categoría genérica
}

/**
 * Detecta la categoría de un ingreso
 * Mismo funcionamiento que detectExpenseCategory pero para ingresos
 */
function detectIncomeCategory(text) {
  for (const [cat, keywords] of Object.entries(incomeKeywords)) {
    if (matchKeyword(text, keywords)) return cat;
  }
  return 'Otro';
}

/**
 * Extrae el monto (número) del texto
 * 
 * Reconoce varios formatos:
 * - "$450.50" → 450.50
 * - "450.50" → 450.50
 * - "$450" → 450
 * - "450" → 450
 * 
 * @param {string} text - Texto del usuario (ej: "cafe $4.50")
 * @returns {number|null} - El monto como número, o null si no encontró
 */
function extractAmount(text) {
  // Primero limpiamos el texto: sacamos las letras y normalizamos espacios
  const cleaned = text.replace(/[a-zA-Z]+/g, ' ').replace(/\s+/g, ' ').trim();
  
  // Patterns en orden de especificidad (del más específico al más genérico)
  const patterns = [
    /\$\s*([\d]+[.,]\d{2})/,    // $450.50 o $ 450.50
    /([\d]+[.,]\d{2})/,          // 450.50 o 450,50
    /\$\s*([\d]+)/,              // $450
    /([\d]+)/,                   // 450
  ];

  for (const p of patterns) {
    const match = cleaned.match(p);
    if (match) {
      // Normalizamos: si usa coma, la reemplazamos por punto (formato JS)
      let num = match[1].replace(',', '.');
      const amount = parseFloat(num);
      // Validamos: debe ser un número válido y mayor a 0
      if (!isNaN(amount) && amount > 0) return amount;
    }
  }
  return null;
}

/**
 * Detecta si el texto indica un GASTO o un INGRESO
 * 
 * Palabras que indican INGRESO: "cobro", "pago recibido", "salario", "venta", etc.
 * Si no hay ninguna, por defecto es GASTO
 * 
 * @param {string} text - Texto del usuario
 * @returns {'GASTO'|'INGRESO'}
 */
function detectType(text) {
  const lower = text.toLowerCase();
  // Palabras que claramente indican un ingreso de dinero
  const incomeWords = [
    'cobro', 'pago recibido', 'recibido', 'ingreso', 'cobré', 'cobré',
    'recibí', 'salario', 'sueldo', 'venta', 'ganancia', 'honorario'
  ];
  for (const w of incomeWords) {
    if (lower.includes(w)) return 'INGRESO';
  }
  // Por defecto asumimos que es un gasto
  return 'GASTO';
}

/**
 * Función principal: parsea el texto del usuario
 * 
 * @param {string} text - Lo que escribió/habló el usuario (ej: "cafe $4.50")
 * @returns {object|null} - Objeto con { monto, categoria, tipo, descripcion } o null si falló
 * 
 * Ejemplo:
 *   parseNaturalTransaction("cafe 4.50")
 *   → { monto: 4.50, categoria: 'Alimentacion', tipo: 'GASTO', descripcion: 'cafe 4.50' }
 */
export function parseNaturalTransaction(text) {
  // Validamos que haya texto para procesar
  if (!text || !text.trim()) return null;

  const trimmed = text.trim();
  
  // 1. Detectamos tipo (GASTO o INGRESO)
  const tipo = detectType(trimmed);
  
  // 2. Extraemos el monto del texto
  const monto = extractAmount(trimmed);
  
  // 3. Si no encontré monto, no tiene sentido continuar
  if (!monto) return null;

  // 4. Detectamos categoría según el tipo
  const categoria = tipo === 'INGRESO'
    ? detectIncomeCategory(trimmed)
    : detectExpenseCategory(trimmed);

  // 5. Devolvemos el resultado
  return {
    monto,
    categoria,
    tipo,
    descripcion: trimmed,
  };
}

/**
 * Formatea el resultado del parser para mostrar en pantalla
 * 
 * @param {object} parsed - Resultado de parseNaturalTransaction
 * @returns {string} - Texto legible para el usuario
 * 
 * Ejemplo:
 *   formatTransactionPreview({ monto: 4.50, categoria: 'Alimentacion', tipo: 'GASTO' })
 *   → "💸 GASTO: $4.50 (Alimentacion)"
 */
export function formatTransactionPreview(parsed) {
  if (!parsed) return 'No pude entender. Intentá "cafe $4.50" o "comida 500"';
  const tipoEmoji = parsed.tipo === 'INGRESO' ? '💰' : '💸';
  return `${tipoEmoji} ${parsed.tipo}: $${parsed.monto.toFixed(2)} (${parsed.categoria})`;
}
