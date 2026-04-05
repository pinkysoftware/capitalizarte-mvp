/**
 * Parser de lenguaje natural para transacciones
 * Reconoce patrones como:
 *   "cafe 4.50" → { monto: 4.50, categoria: 'Alimentacion', tipo: 'GASTO' }
 *   "comida 500" → { monto: 500, categoria: 'Alimentacion', tipo: 'GASTO' }
 *   "salario 50000" → { monto: 50000, categoria: 'Salario', tipo: 'INGRESO' }
 */

const expenseKeywords = {
  Alimentacion: ['comida', 'almuerzo', 'cena', 'cafe', 'café', 'desayuno', 'gasto', 'supermercado', 'verduleria', 'carniceria', 'panaderia', 'pizza', 'burger', 'mcdonald', 'burger king', 'subway', 'latte', 'starbucks', 'mercadito', 'carrefour', 'dia', 'jumbo', 'vea', 'walmart', 'whole foods', 'restaurant', ' Delivery', 'pedidos ya', ' rappi', 'uber eats'],
  Transporte: ['nafta', 'gasolina', 'combustible', 'subte', 'metro', 'bus', 'taxi', 'uber', 'cabify', 'peaje', 'estacionamiento', 'patente', ' seguro', 'mantenimiento auto', 'llanta', 'neumático', 'aceite', 'service', 'uber', 'cabify', 'bird', 'lime', 'scooter'],
  Vivienda: ['alquiler', 'expensas', 'luz', 'electricidad', 'gas', 'internet', 'telefono', 'celular', 'agua', 'muebles', 'decoracion', 'reparacion', 'pintura', 'mudanza'],
  Salud: ['medicamento', 'doctor', 'medico', 'clinica', 'hospital', 'analisis', 'laboratorio', 'obra social', ['curacion', 'vendaje', 'inyeccion', 'vacuna']],
  Entretenimiento: ['netflix', 'spotify', 'disney', 'amazon prime', 'hbo', 'pelicula', 'cine', 'teatro', 'concierto', 'juego', 'gaming', 'playstation', 'xbox', 'nintendo', 'steam', 'aplicacion', 'app', 'musica', ' serie'],
  Deuda: ['credito', 'prestamo', 'tarjeta', 'cuota', 'debito automatico', 'anticipo'],
  Inversion: ['inversion', 'fondo', 'plazo fijo', 'acciones', 'bitcoin', 'cripto', 'dolares', 'cedear', 'bono'],
};

const incomeKeywords = {
  Salario: ['salario', 'sueldo', 'honorario', 'liquidacion', 'haber', 'neto', 'bruto'],
  Ventas: ['venta', 'articulo', 'producto', 'mercado', 'local', 'negocio'],
  Freelance: ['freelance', 'freelancer', 'proyecto', 'consultoria', 'asesoria', 'servicio'],
  Comision: ['comision', 'bonus', 'gratificacion', 'propina'],
  Interes: ['interes', 'rendimiento', 'dividendo', 'cupon'],
};

function matchKeyword(text, keywords) {
  const lower = text.toLowerCase();
  for (const kw of keywords) {
    if (Array.isArray(kw)) {
      if (kw.every(k => lower.includes(k))) return true;
    } else {
      if (lower.includes(kw)) return true;
    }
  }
  return false;
}

function detectExpenseCategory(text) {
  for (const [cat, keywords] of Object.entries(expenseKeywords)) {
    if (matchKeyword(text, keywords)) return cat;
  }
  return 'Otro';
}

function detectIncomeCategory(text) {
  for (const [cat, keywords] of Object.entries(incomeKeywords)) {
    if (matchKeyword(text, keywords)) return cat;
  }
  return 'Otro';
}

function extractAmount(text) {
  // Busca montos: $450, 450, 450.50, $450.50, USD 100, etc
  const cleaned = text.replace(/[a-zA-Z]+/g, ' ').replace(/\s+/g, ' ').trim();
  
  // Pattern: extrae números con decimales opcionales
  const patterns = [
    /\$\s*([\d]+[.,]\d{2})/,
    /([\d]+[.,]\d{2})/,
    /\$\s*([\d]+)/,
    /([\d]+)/,
  ];

  for (const p of patterns) {
    const match = cleaned.match(p);
    if (match) {
      let num = match[1].replace(',', '.');
      const amount = parseFloat(num);
      if (!isNaN(amount) && amount > 0) return amount;
    }
  }
  return null;
}

function detectType(text) {
  const lower = text.toLowerCase();
  // Palabras que indican ingreso
  const incomeWords = ['cobro', 'pago recibido', 'recibido', 'ingreso', 'cobré', 'cobré', 'recibí', 'salario', 'sueldo', 'venta', 'ganancia', 'honorario'];
  for (const w of incomeWords) {
    if (lower.includes(w)) return 'INGRESO';
  }
  // Por defecto gasto
  return 'GASTO';
}

export function parseNaturalTransaction(text) {
  if (!text || !text.trim()) return null;

  const trimmed = text.trim();
  const tipo = detectType(trimmed);
  const monto = extractAmount(trimmed);
  
  if (!monto) return null;

  const categoria = tipo === 'INGRESO'
    ? detectIncomeCategory(trimmed)
    : detectExpenseCategory(trimmed);

  return {
    monto,
    categoria,
    tipo,
    descripcion: trimmed,
  };
}

export function formatTransactionPreview(parsed) {
  if (!parsed) return 'No pude entender. Intentá "cafe $4.50" o "comida 500"';
  const tipoEmoji = parsed.tipo === 'INGRESO' ? '💰' : '💸';
  return `${tipoEmoji} ${parsed.tipo}: $${parsed.monto.toFixed(2)} (${parsed.categoria})`;
}
