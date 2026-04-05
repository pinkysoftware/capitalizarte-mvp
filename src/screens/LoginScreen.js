import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Alert,
  Pressable,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { api, setToken } from '../services/api';
import { C, S, R, card, h1, h2, muted, btnPrimary, btnPrimaryText, btnSecondary, btnSecondaryText, input } from '../theme';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const login = async () => {
    if (!email.trim() || !password) {
      return Alert.alert(' Campos requeridos', 'Ingresá email y contraseña.');
    }
    setLoading(true);
    try {
      const res = await api.login({ email: email.trim().toLowerCase(), password });
      await setToken(res.token);
      navigation.reset({ index: 0, routes: [{ name: 'Dashboard' }] });
    } catch (e) {
      Alert.alert(' Error de acceso', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.container}>
        
        {/* Logo */}
        <View style={styles.logoWrap}>
          <Image source={require('../../assets/capitalizarte-eye.png')} style={styles.logo} resizeMode="contain" />
        </View>

        {/* Título */}
        <View style={styles.header}>
          <Text style={styles.title}>Capitalizarte</Text>
          <Text style={styles.subtitle}>Tu salud financiera en orden</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <TextInput
            placeholder="Email"
            placeholderTextColor={C.textTertiary}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
          />
          <TextInput
            placeholder="Contraseña"
            placeholderTextColor={C.textTertiary}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            style={[styles.input, { marginTop: S.sm }]}
          />
        </View>

        {/* Olvidaste contraseña */}
        <Pressable style={styles.forgotLink} onPress={() => navigation.navigate('ForgotPassword')}>
          <Text style={styles.forgotText}>¿Olvidaste tu clave?</Text>
        </Pressable>

        {/* Botón ingresar */}
        <Pressable style={[styles.primaryBtn, loading && styles.btnDisabled]} onPress={login} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text style={styles.primaryBtnText}>Ingresar</Text>
          )}
        </Pressable>

        {/* Crear cuenta */}
        <Pressable style={styles.secondaryBtn} onPress={() => navigation.navigate('Register')}>
          <Text style={styles.secondaryBtnText}>Crear cuenta nueva</Text>
        </Pressable>

      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  container: { flex: 1, padding: S.lg, justifyContent: 'center', gap: S.lg },
  logoWrap: { alignItems: 'center', marginBottom: S.md },
  logo: { width: 72, height: 72 },
  header: { alignItems: 'center', gap: S.xs },
  title: { ...h1(), textAlign: 'center' },
  subtitle: { ...muted(), textAlign: 'center' },
  form: { gap: S.sm },
  input: {
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: R.md,
    paddingHorizontal: S.md,
    paddingVertical: 16,
    color: C.text,
    fontSize: 16,
  },
  forgotLink: { alignItems: 'flex-end' },
  forgotText: { color: C.primary, fontSize: 14, fontWeight: '600' },
  primaryBtn: {
    backgroundColor: C.primary,
    borderRadius: R.md,
    paddingVertical: 16,
    alignItems: 'center',
  },
  btnDisabled: { opacity: 0.6 },
  primaryBtnText: { color: '#000', fontSize: 16, fontWeight: '700' },
  secondaryBtn: {
    borderRadius: R.md,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: C.border,
  },
  secondaryBtnText: { color: C.text, fontSize: 16, fontWeight: '600' },
});
