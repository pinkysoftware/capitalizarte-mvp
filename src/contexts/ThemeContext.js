import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_KEY = 'capitalizarte.theme';

const darkColors = {
  background: '#0D0F14',
  surface: '#141820',
  surfaceSoft: '#1A1F2B',
  primary: '#D4A017',
  primaryBright: '#F0C040',
  text: '#E8E8E8',
  textMuted: '#9A9FAA',
  border: 'rgba(212, 160, 23, 0.22)',
  green: '#4CAF50',
  red: '#FF5252',
  success: '#4CAF50',
  danger: '#FF5252',
};

const lightColors = {
  background: '#F5F5F5',
  surface: '#FFFFFF',
  surfaceSoft: '#EEEEEE',
  primary: '#D4A017',
  primaryBright: '#F0C040',
  text: '#1A1A1A',
  textMuted: '#666666',
  border: 'rgba(212, 160, 23, 0.3)',
  green: '#2E7D32',
  red: '#D32F2F',
  success: '#2E7D32',
  danger: '#D32F2F',
};

const ThemeContext = createContext({
  colors: darkColors,
  isDark: true,
  toggleTheme: () => {},
});

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    // Load saved theme preference
    AsyncStorage.getItem(THEME_KEY).then((value) => {
      if (value !== null) {
        setIsDark(value === 'dark');
      }
    });
  }, []);

  const toggleTheme = async () => {
    const newValue = !isDark;
    setIsDark(newValue);
    await AsyncStorage.setItem(THEME_KEY, newValue ? 'dark' : 'light');
  };

  const colors = isDark ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ colors, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
