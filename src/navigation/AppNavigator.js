import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import ProfileScreen from '../screens/ProfileScreen';
import DashboardScreen from '../screens/DashboardScreen';
import AddTransactionScreen from '../screens/AddTransactionScreen';
import AddTransactionVoice from '../screens/AddTransactionVoice';
import LifeScreen from '../screens/LifeScreen';
import HistoryScreen from '../screens/HistoryScreen';
import SavingsScreen from '../screens/SavingsScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import ResetPasswordScreen from '../screens/ResetPasswordScreen';
import ChatScreen from '../screens/ChatScreen';
import BudgetScreen from '../screens/BudgetScreen';

const Stack = createNativeStackNavigator();

const SCREEN_OPTIONS = {
  headerStyle: { backgroundColor: '#0A0B0E' },
  headerTintColor: '#FFFFFF',
  headerTitleStyle: { fontWeight: '700', fontSize: 17 },
  headerShadowVisible: false,
  contentStyle: { backgroundColor: '#0A0B0E' },
  headerBackTitleVisible: false,
};

export default function AppNavigator({ initialRouteName = 'Register' }) {
  return (
    <Stack.Navigator initialRouteName={initialRouteName} screenOptions={SCREEN_OPTIONS}>
      <Stack.Screen name="Login" component={LoginScreen} options={{ title: '' }} />
      <Stack.Screen name="Register" component={RegisterScreen} options={{ title: '' }} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{ title: 'Recuperar clave' }} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} options={{ title: 'Nueva clave' }} />
      <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Perfil' }} />
      <Stack.Screen name="Dashboard" component={DashboardScreen} options={{ title: '', headerShown: false }} />
      <Stack.Screen name="AddTransaction" component={AddTransactionScreen} options={{ title: 'Nuevo movimiento' }} />
      <Stack.Screen name="AddTransactionVoice" component={AddTransactionVoice} options={{ title: 'Registro rápido' }} />
      <Stack.Screen name="Chat" component={ChatScreen} options={{ title: 'Asistente AI' }} />
      <Stack.Screen name="Budget" component={BudgetScreen} options={{ title: 'Presupuestos' }} />
      <Stack.Screen name="Life" component={LifeScreen} options={{ title: 'Balance' }} />
      <Stack.Screen name="History" component={HistoryScreen} options={{ title: 'Historial' }} />
      <Stack.Screen name="Savings" component={SavingsScreen} options={{ title: 'Ahorros' }} />
    </Stack.Navigator>
  );
}
