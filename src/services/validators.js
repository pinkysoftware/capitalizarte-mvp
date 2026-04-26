export function isValidEmail(value = '') {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value).trim().toLowerCase());
}

export function isPositiveNumber(value) {
  const num = Number(value);
  return Number.isFinite(num) && num > 0;
}

export function isNonNegativeNumber(value) {
  const num = Number(value);
  return Number.isFinite(num) && num >= 0;
}

export function isIsoDate(value = '') {
  return /^\d{4}-\d{2}-\d{2}$/.test(String(value).trim());
}

export function normalizeMoney(value) {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
}
