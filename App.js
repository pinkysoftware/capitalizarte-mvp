import React, { useEffect, useState } from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, Linking } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import { api, clearToken, getToken, hydrateToken } from './src/services/api';


const theme = {
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

function useDeepLink() {
  const [deepLinkRoute, setDeepLinkRoute] = useState(null);

  useEffect(() => {
    const handleUrl = (event) => {
      const url = event.url || '';
      // If URL contains reset-password or login, go to Login
      if (url.includes('reset-password') || url.includes('login') || url.includes('screen=login')) {
        setDeepLinkRoute('Login');
      }
    };

    // Check initial URL
    Linking.getInitialURL().then((url) => {
      if (url && (url.includes('reset-password') || url.includes('login'))) {
        setDeepLinkRoute('Login');
      }
    });

    // Listen for deep links
    const subscription = Linking.addEventListener('url', handleUrl);
    return () => subscription.remove();
  }, []);

  return deepLinkRoute;
}

export default function App() {
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

  if (booting) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0D0F14', alignItems: 'center', justifyContent: 'center' }}>
        <StatusBar style="light" />
        <ActivityIndicator size="large" color="#D4A017" />
      </View>
    );
  }

  return (
    
      <NavigationContainer theme={theme}>
        <StatusBar style="light" />
        <AppNavigator initialRouteName={initialRouteName} />
      </NavigationContainer>
    
  );
}
