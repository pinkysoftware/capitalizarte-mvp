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
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { api, setToken } from '../services/api';
import { saveUserEmail, saveUserProfile } from '../services/userStorage';
import { C, S, R } from '../theme';

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
      if (res.user?.email) await saveUserEmail(res.user.email);
      if (res.user) await saveUserProfile(res.user);
      navigation.reset({ index: 0, routes: [{ name: 'Dashboard' }] });
    } catch (e) {
      Alert.alert(' Error de acceso', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo */}
          <View style={styles.logoWrap}>
            <Image
              source={require('../../assets/capitalizarte-eye.png')}
              style={styles.logo}
              resizeMode="contain"
            />
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
          <Pressable
            style={[styles.primaryBtn, loading && styles.btnDisabled]}
            onPress={login}
            disabled={loading}
          >
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
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  container: { flex: 1 },
  scroll: { flex: 1 },
  content: {
    flexGrow: 1,
    padding: S.lg,
    justifyContent: 'center',
    gap: S.lg,
  },
  logoWrap: { alignItems: 'center' },
  logo: { width: 64, height: 64 },
  header: { alignItems: 'center', gap: S.xs },
  title: { fontSize: 28, fontWeight: '800', color: C.text },
  subtitle: { color: C.textSecondary, fontSize: 14 },
  form: { gap: S.sm },
  input: {
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: R.md,
    paddingHorizontal: S.md,
    paddingVertical: 14,
    color: C.text,
    fontSize: 15,
  },
  forgotLink: { alignItems: 'flex-end' },
  forgotText: { color: C.primary, fontSize: 13, fontWeight: '600' },
  primaryBtn: {
    backgroundColor: C.primary,
    borderRadius: R.md,
    paddingVertical: 14,
    alignItems: 'center',
  },
  btnDisabled: { opacity: 0.6 },
  primaryBtnText: { color: '#000', fontSize: 15, fontWeight: '700' },
  secondaryBtn: {
    borderRadius: R.md,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: C.border,
  },
  secondaryBtnText: { color: C.text, fontSize: 15, fontWeight: '600' },
});
