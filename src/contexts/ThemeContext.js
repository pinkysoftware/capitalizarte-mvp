import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ============================================================================
// COLORES EXACTOS SEGÚN WHITEPAPER
// ============================================================================

// Dark Mode
export const darkColors = {
  bg: '#0B1020',
  surface: '#111827',
  surfaceHover: '#1A2133',
  primary: '#D4A017',
  primaryLight: '#E8B830',
  primaryDim: 'rgba(212, 160, 23, 0.15)',
  text: '#FFFFFF',
  textSecondary: '#8A8F9C',
  textTertiary: '#4A4F5C',
  green: '#22C55E',
  red: '#EF4444',
  blue: '#3B82F6',
  yellow: '#FBBF24',
  purple: '#8B5CF6',
  border: 'rgba(255, 255, 255, 0.06)',
  borderStrong: 'rgba(255, 255, 255, 0.12)',
};

// Light Mode
export const lightColors = {
  bg: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceHover: '#F0F4F8',
  primary: '#D4A017',
  primaryLight: '#E8B830',
  primaryDim: 'rgba(212, 160, 23, 0.15)',
  text: '#1E293B',
  textSecondary: '#64748B',
  textTertiary: '#94A3B8',
  green: '#22C55E',
  red: '#EF4444',
  blue: '#3B82F6',
  yellow: '#FBBF24',
  purple: '#8B5CF6',
  border: 'rgba(0, 0, 0, 0.06)',
  borderStrong: 'rgba(0, 0, 0, 0.12)',
};

// ============================================================================
// CONTEXTO
// ============================================================================
const ThemeContext = createContext({
  theme: 'light',
  colors: lightColors,
  isDark: false,
  toggleTheme: () => {},
});

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light'); // Default: CLARO

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('@theme');
      if (savedTheme) {
        setTheme(savedTheme);
      }
    } catch (e) {
      console.log('Error cargando tema:', e);
    }
  };

  const toggleTheme = async () => {
    try {
      const newTheme = theme === 'light' ? 'dark' : 'light';
      setTheme(newTheme);
      await AsyncStorage.setItem('@theme', newTheme);
    } catch (e) {
      console.log('Error guardando tema:', e);
    }
  };

  const isDark = theme === 'dark';
  const colors = isDark ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ theme, colors, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export default ThemeContext;
