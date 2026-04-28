/**
 * ============================================
 * APP.JS — Punto de entrada principal de Capitalizarte
 * ============================================
 * 
 * ¿Qué hace este archivo?
 * - Es el primer archivo que se ejecuta cuando la app arranca
 * - Configura el tema visual (oscuro/claro)
 * -决定 qué pantalla mostrar primero (Login o Dashboard)
 * - Maneja los links profundos (deep links) para recover passwords
 */

import React, { useEffect, useState } from 'react';
// NavigationContainer: envuelve toda la app para poder navegar entre pantallas
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
// StatusBar: controla la barra de estado del celular (hora, wifi, etc)
import { StatusBar } from 'expo-status-bar';
// ActivityIndicator: el círculo de carga que aparece mientras arrancamos
import { View, ActivityIndicator, Linking } from 'react-native';
// AppNavigator: el archivo que define todas las rutas (Login, Dashboard, etc)
import AppNavigator from './src/navigation/AppNavigator';
// api: funciones para comunicarse con el servidor (login, registrar gasto, etc)
// hydrateToken: intenta recuperar el token de sesión guardado anteriormente
import { api, clearToken, getToken, hydrateToken } from './src/services/api';
import { getUserProfile } from './src/services/userStorage';
// ThemeProvider: contexto que permite cambiar entre tema oscuro y claro
import { ThemeProvider, useTheme } from './src/contexts/ThemeContext';

/**
 * Definición de los colores del TEMA OSCURO
 * DefaultTheme es el tema base de React Navigation, lo personalizamos con nuestros colores
 */
const darkTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#0D0F14',   // Fondo negro azulado
    card: '#141820',          // Fondo de las tarjetas
    text: '#E8E8E8',          // Texto principal (casi blanco)
    border: 'rgba(212, 160, 23, 0.22)',  // Bordes dorados semi-transparentes
    primary: '#D4A017',       // Dorado principal (color de marca)
  },
};

/**
 * Definición de los colores del TEMA CLARO
 * Se usa cuando el usuario cambia a modo claro
 */
const lightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#F5F5F5',    // Fondo gris claro
    card: '#FFFFFF',         // Fondo blanco para tarjetas
    text: '#1A1A1A',         // Texto casi negro
    border: 'rgba(0, 0, 0, 0.1)',  // Bordes negros suaves
    primary: '#D4A017',      // Dorado igual que el oscuro
  },
};

/**
 * Hook useDeepLink — Detecta si la app se abrió desde un link
 * 
 * Ejemplo: si alguien toca un link de "recuperar contraseña" en su email,
 * este hook detecta esa URL y devuelve 'Login' para mostrar la pantalla correcta
 * 
 * @returns {string|null} — Nombre de la pantalla a mostrar o null
 */
function useDeepLink() {
  const [deepLinkRoute, setDeepLinkRoute] = useState(null);
  const [deepLinkParams, setDeepLinkParams] = useState(null);

  useEffect(() => {
    // URL token extractor - uses simple string parsing for React Native compatibility
    function extractTokenFromUrl(url) {
      // Simple regex fallback - works on all platforms
      const match = url.match(/[?&]token=([a-f0-9]{64})/i);
      if (match) return match[1];
      return null;
    }

    function handleUrl(event) {
      const url = event.url || '';
      if (url.includes('reset-password') || url.includes('reset_password')) {
        const token = extractTokenFromUrl(url);
        if (token) {
          setDeepLinkParams({ token });
          setDeepLinkRoute('ResetPassword');
        } else {
          setDeepLinkRoute('Login');
        }
      }
    }

    //getInitialURL: verifica si la app se abrió con una URL (ej: desde un email)
    Linking.getInitialURL().then((url) => {
      if (url) {
        console.log('Initial URL:', url);
        if (url.includes('reset-password') || url.includes('reset_password')) {
          const token = extractTokenFromUrl(url);
          if (token) {
            setDeepLinkParams({ token });
            setDeepLinkRoute('ResetPassword');
          } else {
            setDeepLinkRoute('Login');
          }
        }
      }
    });

    // addEventListener: queda escuchando por si llega una URL mientras la app está abierta
    const subscription = Linking.addEventListener('url', handleUrl);
    // cleanup: cuando el componente se destruye, dejamos de escuchar
    return () => subscription.remove();
  }, []);

  return { deepLinkRoute, deepLinkParams };
}

/**
 * AppContent — Componente principal interno
 * 
 * Aquí pasa lo más importante:
 * 1. Decide si mostrar Login o Dashboard (según si hay sesión guardada)
 * 2. Muestra una pantalla de carga mientras verifica la sesión
 * 3. Aplica el tema (oscuro/claro)
 */
function AppContent() {
  // useTheme: obtiene el estado del tema actual (isDark = true/false)
  const { isDark } = useTheme();
  
  // booting: true mientras verificamos si hay sesión guardada
  const [booting, setBooting] = useState(true);
  
  // initialRouteName: la pantalla inicial — empieza en Login
  const [initialRouteName, setInitialRouteName] = useState('Login');
  
  // deepLinkRoute: si came de un link, lo guardamos aquí
  const { deepLinkRoute, deepLinkParams } = useDeepLink();

  // useEffect: se ejecuta cuando deepLinkRoute cambia
  useEffect(() => {
    if (deepLinkRoute) {
      setInitialRouteName(deepLinkRoute);
      setBooting(false);
      return;
    }
  }, [deepLinkRoute]);

  /**
   * useEffect para verificar la sesión
   * 
   * Lo que hace:
   * 1. hydrateToken() → intenta leer el token guardado en el celular
   * 2. Si no hay token → muestra Login
   * 3. Si hay token → llama a api.getProfile() para verificar que el token sea válido
   *    - Si es válido → muestra Dashboard
   *    - Si no es válido → borra el token y muestra Login
   */
  useEffect(() => {
    (async () => {
      try {
        // Intenta recuperar el token de sesión guardado anteriormente
        const token = await hydrateToken();
        if (!token) {
          // No hay token, el usuario no ha iniciado sesión
          setInitialRouteName('Login');
          return;
        }

        try {
          // Hay token, verificamos que sea válido leyendo perfil local
          const localProfile = await getUserProfile();
          if (localProfile && localProfile.email) {
            // Perfil guardado localmente = sesión válida
            setInitialRouteName('Dashboard');
          } else {
            // No hay perfil local, intentamos con API (puede fallar si el servidor no responde)
            try {
              await api.getProfile();
              setInitialRouteName('Dashboard');
            } catch {
              // Token roto o servidor caído - limpiamos todo
              await clearToken();
              setInitialRouteName('Login');
            }
          }
        } catch {
          // Fallback: si todo falla, vamos a login
          await clearToken();
          setInitialRouteName('Login');
        }
      } finally {
        // Siempre dejamos de mostrar la pantalla de carga
        setBooting(false);
      }
    })();
  }, []);

  // currentTheme: elige el tema según isDark
  const currentTheme = isDark ? darkTheme : lightTheme;

  // Mientras está arrancando, mostramos una pantalla de carga con el logo
  if (booting) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#D4A017" />
      </View>
    );
  }

  /**
   * NavigationContainer: envuelve toda la app y habilita la navegación
   * theme: pasa los colores del tema (oscuro o claro)
   */
  return (
    <NavigationContainer theme={currentTheme}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      {/* AppNavigator: muestra la pantalla correspondiente (Login o Dashboard) */}
      <AppNavigator initialRouteName={initialRouteName} />
    </NavigationContainer>
  );
}

/**
 * App — Componente exportado por defecto
 * 
 * ThemeProvider: provee el contexto del tema a toda la app
 * Sin esto, los componentes hijos no pueden usar useTheme()
 */
export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
