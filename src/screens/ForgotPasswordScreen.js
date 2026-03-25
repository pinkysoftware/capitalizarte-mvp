import React, { useTheme } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';, { useState } from 'react';
import {
  View,
  Text,
  Alert,
  Pressable,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { api } from '../services/api';
import { isValidEmail } from '../services/validators';

const { colors } = useTheme();
const COLORS = colors || {
  background: '#0D0F14',
  surface: '#141820',
  surfaceSoft: '#1A1F2B',
  primary: '#D4A017',
  primaryBright: '#F0C040',
  text: '#E8E8E8',
  textMuted: '#9A9FAA',
  border: 'rgba(212, 160, 23, 0.22)',
};

function Field({ label, value, onChangeText, placeholder, keyboardType = 'default' }) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        placeholder={placeholder}
        placeholderTextColor={COLORS.textMuted}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        autoCapitalize="none"
        style={styles.input}
      />
    </View>
  );
}

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    const safeEmail = email.trim().toLowerCase();
    if (!isValidEmail(safeEmail)) {
      return Alert.alert('Correo inválido', 'Ingresá un correo válido.');
    }

    setLoading(true);
    try {
      const res = api.requestPasswordReset ? await api.requestPasswordReset({ email: safeEmail }) : null;
      if (res?.ok === false) {
        Alert.alert('Correo no registrado', 'Este correo no está registrado en la app.');
      } else if (res?.message === 'recovery_email_sent') {
        Alert.alert(
          'Revisá tu correo',
          `Te enviamos un mail a ${safeEmail}.\n\nEl mail tiene el token para restablecer tu clave.\n\nSi no llega, revisá spam.`
        );
        navigation.navigate('ResetPassword');
      } else {
        Alert.alert('Error', 'No pudimos procesar la solicitud.');
      }
    } catch (e) {
      Alert.alert('No pudimos iniciar la recuperación', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={90}>
      <ScrollView style={styles.screen} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.heroCard}>
          <Text style={styles.eyebrow}>CAPITALIZARTE</Text>
          <Text style={styles.title}>Recuperar clave</Text>
          <Text style={styles.subtitle}>Ingresá tu correo y te enviaremos instrucciones para restablecer tu contraseña.</Text>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Correo de recuperación</Text>
          <Field label="Correo electrónico" placeholder="tuemail@ejemplo.com" value={email} onChangeText={setEmail} keyboardType="email-address" />
        </View>

        <Pressable style={[styles.primaryButton, loading && { opacity: 0.7 }]} onPress={submit} disabled={loading}>
          {loading ? <ActivityIndicator color="#111111" /> : <Text style={styles.primaryButtonText}>Enviar instrucciones</Text>}
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 20, paddingBottom: 48, gap: 16 },
  heroCard: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: 24, padding: 22, alignItems: 'center' },
  eyebrow: { color: COLORS.primaryBright, fontSize: 12, fontWeight: '800', letterSpacing: 1.4, marginBottom: 10, textAlign: 'center' },
  title: { color: COLORS.text, fontSize: 28, lineHeight: 34, fontWeight: '800', marginBottom: 10, textAlign: 'center' },
  subtitle: { color: COLORS.textMuted, fontSize: 15, lineHeight: 22, textAlign: 'center' },
  sectionCard: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: 20, padding: 18, gap: 14 },
  sectionTitle: { color: COLORS.primary, fontSize: 18, fontWeight: '700' },
  fieldWrap: { gap: 8 },
  fieldLabel: { color: COLORS.text, fontSize: 14, fontWeight: '600' },
  input: { backgroundColor: COLORS.surfaceSoft, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 13, color: COLORS.text, fontSize: 15 },
  primaryButton: { marginTop: 6, backgroundColor: COLORS.primary, borderRadius: 16, paddingVertical: 16, alignItems: 'center' },
  primaryButtonText: { color: '#111111', fontSize: 16, fontWeight: '800' },
});
