import React, { useTheme } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';, { useState, useEffect } from 'react';
import { View, Text, Alert, Pressable, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, TextInput, TouchableOpacity } from 'react-native';
import { api } from '../services/api';

const { colors } = useTheme();
const COLORS = colors || {
  background: '#0D0F14', surface: '#141820', surfaceSoft: '#1A1F2B', primary: '#D4A017', primaryBright: '#F0C040', text: '#E8E8E8', textMuted: '#9A9FAA', border: 'rgba(212, 160, 23, 0.22)',
};

function PasswordField({ label, value, onChangeText, placeholder }) {
  const [secure, setSecure] = useState(true);
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.passwordContainer}>
        <TextInput
          placeholder={placeholder}
          placeholderTextColor={COLORS.textMuted}
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
      Alert.alert('No pudimos restablecer la clave', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={90}>
      <ScrollView style={styles.screen} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.heroCard}><Text style={styles.eyebrow}>CAPITALIZARTE</Text><Text style={styles.title}>Nueva clave</Text><Text style={styles.subtitle}>Cambiá tu contraseña de forma segura.</Text></View>
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Restablecer contraseña</Text>
          <Field label="Token" value={token} onChangeText={setToken} placeholder="Token del enlace" />
          <PasswordField label="Nueva contraseña" value={password} onChangeText={setPassword} placeholder="Mínimo 8 caracteres" />
          <PasswordField label="Confirmar contraseña" value={confirm} onChangeText={setConfirm} placeholder="Repetí la contraseña" />
        </View>
        <Pressable style={[styles.primaryButton, loading && { opacity: 0.7 }]} onPress={submit} disabled={loading}>{loading ? <ActivityIndicator color="#111111" /> : <Text style={styles.primaryButtonText}>Guardar nueva clave</Text>}</Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Field({ label, value, onChangeText, placeholder }) {
  return <View style={styles.fieldWrap}><Text style={styles.fieldLabel}>{label}</Text><TextInput placeholder={placeholder} placeholderTextColor={COLORS.textMuted} value={value} onChangeText={onChangeText} autoCapitalize="none" style={styles.input} /></View>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background }, content: { padding: 20, paddingBottom: 48, gap: 16 },
  heroCard: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: 24, padding: 22, alignItems: 'center' },
  eyebrow: { color: COLORS.primaryBright, fontSize: 12, fontWeight: '800', letterSpacing: 1.4, marginBottom: 10, textAlign: 'center' },
  title: { color: COLORS.text, fontSize: 28, lineHeight: 34, fontWeight: '800', marginBottom: 10, textAlign: 'center' },
  subtitle: { color: COLORS.textMuted, fontSize: 15, lineHeight: 22, textAlign: 'center' },
  sectionCard: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: 20, padding: 18, gap: 14 },
  sectionTitle: { color: COLORS.primary, fontSize: 18, fontWeight: '700' },
  fieldWrap: { gap: 8 },
  fieldLabel: { color: COLORS.text, fontSize: 14, fontWeight: '600' },
  input: { backgroundColor: COLORS.surfaceSoft, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 13, color: COLORS.text, fontSize: 15 },
  passwordContainer: { position: 'relative' },
  eyeButton: { position: 'absolute', right: 12, top: 0, bottom: 0, justifyContent: 'center', paddingVertical: 13 },
  eyeText: { fontSize: 18 },
  primaryButton: { marginTop: 6, backgroundColor: COLORS.primary, borderRadius: 16, paddingVertical: 16, alignItems: 'center' },
  primaryButtonText: { color: '#111111', fontSize: 16, fontWeight: '800' },
});
