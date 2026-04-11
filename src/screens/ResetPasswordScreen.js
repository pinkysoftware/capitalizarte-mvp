import React, { useState, useEffect } from 'react';
import { View, Text, Alert, Pressable, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, TextInput, TouchableOpacity } from 'react-native';
import { api } from '../services/api';
import { C, S, R } from '../theme';

function PasswordField({ label, value, onChangeText, placeholder }) {
  const [secure, setSecure] = useState(true);
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.passwordContainer}>
        <TextInput
          placeholder={placeholder}
          placeholderTextColor={C.textTertiary}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secure}
          autoCapitalize="none"
          style={[styles.input, { flex: 1, paddingRight: 44 }]}
        />
        <TouchableOpacity style={styles.eyeButton} onPress={() => setSecure(!secure)}>
          <Text style={styles.eyeText}>{secure ? '👁️' : '🔒'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function Field({ label, value, onChangeText, placeholder }) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        placeholder={placeholder}
        placeholderTextColor={C.textTertiary}
        value={value}
        onChangeText={onChangeText}
        autoCapitalize="none"
        style={styles.input}
      />
    </View>
  );
}

export default function ResetPasswordScreen({ navigation, route }) {
  const initialToken = route?.params?.token || '';
  const [token, setToken] = useState(initialToken);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (route?.params?.token) {
      setToken(route.params.token);
    }
  }, [route?.params?.token]);

  const submit = async () => {
    if (!token.trim()) return Alert.alert('Falta token', 'Ingresá el token de recuperación.');
    if (!password || password.length < 8) return Alert.alert('Contraseña débil', 'Usá al menos 8 caracteres.');
    if (password !== confirm) return Alert.alert('No coincide', 'La confirmación no coincide.');

    setLoading(true);
    try {
      await api.resetPassword({ token: token.trim(), password });
      Alert.alert('Clave actualizada', 'Ya podés ingresar con tu nueva contraseña.');
      navigation.navigate('Login');
    } catch (e) {
      if (e.message.includes('500') || e.message.includes('network') || e.message.includes('http')) {
        Alert.alert('Servicio temporalmente indisponible', 'El servidor de recuperación de clave no responde. Intentá más tarde o contactá al administrador.');
      } else {
        Alert.alert('No pudimos restablecer la clave', e.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={90}>
      <ScrollView style={styles.screen} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.heroCard}>
          <Text style={styles.eyebrow}>CAPITALIZARTE</Text>
          <Text style={styles.title}>Nueva clave</Text>
          <Text style={styles.subtitle}>Cambiá tu contraseña de forma segura.</Text>
        </View>
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Restablecer contraseña</Text>
          <Field label="Token" value={token} onChangeText={setToken} placeholder="Token del enlace" />
          <PasswordField label="Nueva contraseña" value={password} onChangeText={setPassword} placeholder="Mínimo 8 caracteres" />
          <PasswordField label="Confirmar contraseña" value={confirm} onChangeText={setConfirm} placeholder="Repetí la contraseña" />
        </View>
        <Pressable style={[styles.primaryButton, loading && { opacity: 0.7 }]} onPress={submit} disabled={loading}>
          {loading ? <ActivityIndicator color="#111111" /> : <Text style={styles.primaryButtonText}>Guardar nueva clave</Text>}
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  content: { padding: S.lg, paddingBottom: S.xxl, gap: S.md },
  heroCard: { backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: R.xl, padding: S.lg, alignItems: 'center' },
  eyebrow: { color: C.primaryLight, fontSize: 12, fontWeight: '800', letterSpacing: 1.4, marginBottom: S.sm, textAlign: 'center' },
  title: { color: C.text, fontSize: 28, lineHeight: 34, fontWeight: '800', marginBottom: S.sm, textAlign: 'center' },
  subtitle: { color: C.textSecondary, fontSize: 15, lineHeight: 22, textAlign: 'center' },
  sectionCard: { backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: R.lg, padding: S.lg, gap: S.md },
  sectionTitle: { color: C.primary, fontSize: 18, fontWeight: '700' },
  fieldWrap: { gap: S.sm },
  fieldLabel: { color: C.text, fontSize: 14, fontWeight: '600' },
  input: { backgroundColor: C.surfaceHover, borderWidth: 1, borderColor: C.border, borderRadius: R.md, paddingHorizontal: S.md, paddingVertical: 13, color: C.text, fontSize: 15 },
  passwordContainer: { position: 'relative' },
  eyeButton: { position: 'absolute', right: 12, top: 0, bottom: 0, justifyContent: 'center', paddingVertical: 13 },
  eyeText: { fontSize: 18 },
  primaryButton: { marginTop: S.sm, backgroundColor: C.primary, borderRadius: R.md, paddingVertical: S.md, alignItems: 'center' },
  primaryButtonText: { color: '#111111', fontSize: 16, fontWeight: '800' },
});
