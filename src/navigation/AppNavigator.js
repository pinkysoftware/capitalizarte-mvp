import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import RegisterScreen from '../screens/RegisterScreen';
import LoginScreen from '../screens/LoginScreen';
import ProfileScreen from '../screens/ProfileScreen';
import DashboardScreen from '../screens/DashboardScreen';
import AddTransactionScreen from '../screens/AddTransactionScreen';
import LifeScreen from '../screens/LifeScreen';
import HistoryScreen from '../screens/HistoryScreen';
import SavingsScreen from '../screens/SavingsScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import ResetPasswordScreen from '../screens/ResetPasswordScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator({ initialRouteName = 'Register' }) {
  return (
    <Stack.Navigator
      initialRouteName={initialRouteName}
      screenOptions={{
        headerStyle: { backgroundColor: '#141820' },
        headerTintColor: '#E8E8E8',
        headerTitleStyle: { fontWeight: '700' },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: '#0D0F14' },
      }}
    >
      <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Bienvenido' }} />
      <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Ingresar' }} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{ title: 'Recuperar clave' }} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} options={{ title: 'Nueva clave' }} />
      <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Tu perfil' }} />
      <Stack.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'Dashboard' }} />
      <Stack.Screen name="AddTransaction" component={AddTransactionScreen} options={{ title: 'Nuevo movimiento' }} />
      <Stack.Screen name="Life" component={LifeScreen} options={{ title: 'Saldo actual' }} />
      <Stack.Screen name="History" component={HistoryScreen} options={{ title: 'Historial' }} />
      <Stack.Screen name="Savings" component={SavingsScreen} options={{ title: 'Ahorros' }} />
    </Stack.Navigator>
  );
}
