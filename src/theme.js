/**
 * ============================================
 * THEME.JS — Sistema de diseño centralizado
 * ============================================
 * 
 * Acá se define TODA la paleta de colores, espaciado,
 * tipografía y estilos base para la app.
 * 
 * Inspiración: MonAi — ultra minimal, tecnológico, limpio
 */

// ============================================================================
// COLORES
// ============================================================================

export const C = {
  // Fondos
  bg: '#0A0B0E',           // Fondo principal — negro azulado profundo
  surface: '#13151A',      // Tarjetas y superficies — negro suave
  surfaceHover: '#1A1D24', // Hover/pressed state
  
  // Acento principal — dorado refinado
  primary: '#D4A017',
  primaryLight: '#E8B830',
  primaryDim: 'rgba(212, 160, 23, 0.15)',
  
  // Texto
  text: '#FFFFFF',
  textSecondary: '#8A8F9C',
  textTertiary: '#4A4F5C',
  
  // Semánticos
  green: '#34C759',
  red: '#FF453A',
  blue: '#0A84FF',
  
  // Bordes — muy sutiles
  border: 'rgba(255, 255, 255, 0.06)',
  borderStrong: 'rgba(255, 255, 255, 0.12)',
};

// ============================================================================
// ESPACIADO (multiplos de 4)
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
  sm: 12,
  md: 16,
  lg: 24,
  full: 9999,
};

// ============================================================================
// SOMBRA (iOS style)
// ============================================================================
export const SHADOW = (opacity = 0.15) => ({
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: opacity,
  shadowRadius: 12,
  elevation: 4,
});

// ============================================================================
// HELPERS — Funciones para crear estilos rápido
// ============================================================================

/**
 * Crea un objeto de tarjeta estándar
 */
export function card(props = {}) {
  return {
    backgroundColor: C.surface,
    borderRadius: R.lg,
    padding: S.lg,
    ...(props.bordered 
      ? { borderWidth: 1, borderColor: C.border }
      : { ...SHADOW() }
    ),
    ...props,
  };
}

/**
 * Texto de encabezado principal (H1)
 */
export function h1(props = {}) {
  return {
    fontSize: 32,
    fontWeight: '800',
    color: C.text,
    letterSpacing: -0.5,
    ...props,
  };
}

/**
 * Texto de encabezado secundario (H2)
 */
export function h2(props = {}) {
  return {
    fontSize: 22,
    fontWeight: '700',
    color: C.text,
    letterSpacing: -0.3,
    ...props,
  };
}

/**
 * Texto secundario (muted)
 */
export function muted(props = {}) {
  return {
    fontSize: 14,
    color: C.textSecondary,
    ...props,
  };
}

/**
 * Botón primario — dorado, full width
 */
export function btnPrimary(props = {}, textProps = {}) {
  return {
    backgroundColor: C.primary,
    borderRadius: R.md,
    paddingVertical: S.md,
    alignItems: 'center',
    justifyContent: 'center',
    ...props,
  };
}

/**
 * Texto de botón primario
 */
export function btnPrimaryText(props = {}) {
  return {
    color: '#000',
    fontSize: 16,
    fontWeight: '700',
    ...props,
  };
}

/**
 * Botón secundario — transparente con borde
 */
export function btnSecondary(props = {}) {
  return {
    backgroundColor: 'transparent',
    borderRadius: R.md,
    borderWidth: 1,
    borderColor: C.border,
    paddingVertical: S.md,
    alignItems: 'center',
    justifyContent: 'center',
    ...props,
  };
}

/**
 * Texto de botón secundario
 */
export function btnSecondaryText(props = {}) {
  return {
    color: C.text,
    fontSize: 16,
    fontWeight: '600',
    ...props,
  };
}

/**
 * Input field estándar
 */
export function input(props = {}) {
  return {
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: R.md,
    paddingHorizontal: S.md,
    paddingVertical: 14,
    color: C.text,
    fontSize: 16,
    ...props,
  };
}

// ============================================================================
// CATEGORÍAS — Emojis para cada categoría
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
