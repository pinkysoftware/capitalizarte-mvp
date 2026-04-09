/**
 * ============================================
 * THEME.JS — Sistema de diseño centralizado
 * ============================================
 */

import { Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// ============================================================================
// COLORES
// ============================================================================

export const C = {
  bg: '#0A0B0E',
  surface: '#13151A',
  surfaceHover: '#1A1D24',
  primary: '#D4A017',
  primaryLight: '#E8B830',
  primaryDim: 'rgba(212, 160, 23, 0.15)',
  text: '#FFFFFF',
  textSecondary: '#8A8F9C',
  textTertiary: '#4A4F5C',
  green: '#34C759',
  red: '#FF453A',
  blue: '#0A84FF',
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
    elevation: 5,
  };
}

// ============================================================================
// CATEGORÍAS
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

/**
 * Wrapper estándar para ScrollView con safe area
 */
export const screenWrapper = {
  flex: 1,
  backgroundColor: C.bg,
};

/**
 * Contenido de pantalla con padding horizontal
 */
export const screenContent = {
  paddingHorizontal: S.md,
  paddingBottom: 100, // Espacio para bottom tab
};

/**
 * Wrapper para FlatList
 */
export const flatListContent = {
  paddingHorizontal: S.md,
  paddingBottom: 100,
};

/**
 * Estilo para Screen que usa KeyboardAvoidingView
 */
export function screenBg() {
  return { flex: 1, backgroundColor: C.bg };
}

/**
 * Card simple con borde sutil
 */
export function simpleCard() {
  return {
    backgroundColor: C.surface,
    borderRadius: R.lg,
    padding: S.md,
    borderWidth: 1,
    borderColor: C.border,
  };
}
