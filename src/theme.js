/**
 * ============================================
 * THEME.JS — Sistema de diseño Capitalizarte
 * COLORES WHITEPAPER COMPLIANT
 * ============================================
 */

import { Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// ============================================================================
// COLORES EXACTOS SEGÚN WHITEPAPER
// ============================================================================

export const C = {
  // Dark mode backgrounds
  bg: '#0B1020',
  surface: '#111827',
  surfaceHover: '#1A2133',

  // Primary
  primary: '#D4A017',
  primaryLight: '#E8B830',
  primaryDim: 'rgba(212, 160, 23, 0.15)',

  // Text
  text: '#FFFFFF',
  textSecondary: '#8A8F9C',
  textTertiary: '#4A4F5C',

  // Semantic colors (whitepaper exact)
  green: '#22C55E',    // Ingresos / positivo
  red: '#EF4444',       // Gastos / deuda / negativo
  blue: '#3B82F6',     // Información
  yellow: '#FBBF24',   // Alertas / warnings
  purple: '#8B5CF6',   // AI / funciones especiales

  // Borders
  border: 'rgba(255, 255, 255, 0.06)',
  borderStrong: 'rgba(255, 255, 255, 0.12)',
};

// ============================================================================
// ESPACIADO
// ============================================================================
export const S = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// ============================================================================
// BORDES
// ============================================================================
export const R = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 999,
};

// ============================================================================
// HELPERS
// ============================================================================

export function card(props = {}) {
  return {
    backgroundColor: C.surface,
    borderRadius: R.lg,
    padding: S.md,
    ...(props.bordered
      ? { borderWidth: 1, borderColor: C.border }
      : {}
    ),
    ...props,
  };
}

export function h1(props = {}) {
  return { fontSize: 28, fontWeight: '800', color: C.text, ...props };
}

export function h2(props = {}) {
  return { fontSize: 20, fontWeight: '700', color: C.text, ...props };
}

export function muted(props = {}) {
  return { fontSize: 14, color: C.textSecondary, ...props };
}

// ============================================================================
// SHADOW
// ============================================================================

export function SHADOW(opacity = 0.3) {
  return {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: opacity,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 0.5,
    borderColor: `rgba(0, 0, 0, ${opacity * 0.4})`,
  };
}

// ============================================================================
// CATEGORÍAS CON EMOJIS
// ============================================================================
export const CATEGORY_EMOJI = {
  Alimentacion: '🍔',
  Transporte: '🚗',
  Vivienda: '🏠',
  Salud: '💊',
  Entretenimiento: '🎬',
  Deuda: '💳',
  Inversion: '📈',
  Salario: '💰',
  Ventas: '🏪',
  Freelance: '💻',
  Comision: '🎁',
  Interes: '📊',
  Otro: '📦',
};

// ============================================================================
// ESTILOS DE PANTALLA COMPARTIDOS
// ============================================================================

export const screenWrapper = {
  flex: 1,
  backgroundColor: C.bg,
};

export const screenContent = {
  paddingHorizontal: S.md,
  paddingBottom: 100,
};

export const flatListContent = {
  paddingHorizontal: S.md,
  paddingBottom: 100,
};

export function screenBg() {
  return { flex: 1, backgroundColor: C.bg };
}

export function simpleCard() {
  return {
    backgroundColor: C.surface,
    borderRadius: R.lg,
    padding: S.md,
    borderWidth: 1,
    borderColor: C.border,
  };
}
