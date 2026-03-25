import React, { useEffect, useState } from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, Linking } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import { api, clearToken, getToken, hydrateToken } from './src/services/api';
import { ThemeProvider, useTheme } from './src/contexts/ThemeContext';

const darkTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#0D0F14',
    card: '#141820',
    text: '#E8E8E8',
    border: 'rgba(212, 160, 23, 0.22)',
    primary: '#D4A017',
  },
};

const lightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#F5F5F5',
    card: '#FFFFFF',
    text: '#1A1A1A',
    border: 'rgba(0, 0, 0, 0.1)',
    primary: '#D4A017',
  },
};

function useDeepLink() {
  const [deepLinkRoute, setDeepLinkRoute] = useState(null);

  useEffect(() => {
    const handleUrl = (event) => {
      const url = event.url || '';
      if (url.includes('reset-password') || url.includes('login') || url.includes('screen=login')) {
        setDeepLinkRoute('Login');
      }
    };

    Linking.getInitialURL().then((url) => {
      if (url && (url.includes('reset-password') || url.includes('login'))) {
        setDeepLinkRoute('Login');
      }
    });

    const subscription = Linking.addEventListener('url', handleUrl);
    return () => subscription.remove();
  }, []);

  return deepLinkRoute;
}

function AppContent() {
  const { isDark } = useTheme();
  const [booting, setBooting] = useState(true);
  const [initialRouteName, setInitialRouteName] = useState('Login');
  const deepLinkRoute = useDeepLink();

  useEffect(() => {
    if (deepLinkRoute) {
      setInitialRouteName(deepLinkRoute);
      setBooting(false);
      return;
    }
  }, [deepLinkRoute]);

  useEffect(() => {
    (async () => {
      try {
        const token = await hydrateToken();
        if (!token) {
          setInitialRouteName('Login');
          return;
        }

        try {
          await api.getProfile();
          setInitialRouteName(getToken() ? 'Dashboard' : 'Login');
        } catch {
          await clearToken();
          setInitialRouteName('Login');
        }
      } finally {
        setBooting(false);
      }
    })();
  }, []);

  const currentTheme = isDark ? darkTheme : lightTheme;

  if (booting) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#D4A017" />
      </View>
    );
  }

  return (
    <NavigationContainer theme={currentTheme}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <AppNavigator initialRouteName={initialRouteName} />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <
      <AppContent />
    </
  );
}
