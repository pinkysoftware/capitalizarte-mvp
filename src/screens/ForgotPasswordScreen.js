import React from 'react';
import { useState } from 'react';
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
import { C, S, R } from '../theme';

function Field({ label, value, onChangeText, placeholder, keyboardType = 'default' }) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        placeholder={placeholder}
        placeholderTextColor={C.textTertiary}
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
      const res = await api.requestPasswordReset({ email: safeEmail });
      if (res?.error) {
        Alert.alert('Error', res.error);
      } else {
        Alert.alert(
          'Revisá tu correo',
          `Te enviamos un mail a ${safeEmail}.\n\nEl mail tiene el token para restablecer tu clave.\n\nSi no llega, revisá spam.`
        );
        navigation.navigate('ResetPassword');
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
  primaryButton: { marginTop: S.sm, backgroundColor: C.primary, borderRadius: R.md, paddingVertical: S.md, alignItems: 'center' },
  primaryButtonText: { color: '#111111', fontSize: 16, fontWeight: '800' },
});
