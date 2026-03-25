import React, { useTheme } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Alert,
  Pressable,
  StyleSheet,
  ScrollView,
  Image,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { api, setToken } from '../services/api';
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

function Field({ label, value, onChangeText, placeholder, secureTextEntry = false, keyboardType = 'default' }) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        placeholder={placeholder}
        placeholderTextColor={COLORS.textMuted}
        secureTextEntry={secureTextEntry}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        style={styles.input}
      />
    </View>
  );
}

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const login = async () => {
    const safeEmail = email.trim().toLowerCase();
    if (!isValidEmail(safeEmail)) {
      return Alert.alert('Correo inválido', 'Ingresá un correo válido.');
    }
    if (!password || password.length < 6) {
      return Alert.alert('Contraseña inválida', 'Ingresá una contraseña válida.');
    }

    setLoading(true);
    try {
      const res = await api.login({ email: safeEmail, password });
      await setToken(res.token);
      navigation.reset({ index: 0, routes: [{ name: 'Dashboard' }] });
    } catch (e) {
      Alert.alert('No pudimos iniciar sesión', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={90}>
      <ScrollView style={styles.screen} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.heroCard}>
          <Image source={require('../../assets/capitalizarte-eye.png')} style={styles.logoImage} resizeMode="contain" />
          <Text style={styles.eyebrow}>CAPITALIZARTE</Text>
          <Text style={styles.title}>Ingresá a tu cuenta</Text>
          <Text style={styles.subtitle}>Volvé a tu dashboard para seguir registrando movimientos y revisando tu avance.</Text>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Acceso</Text>
          <Field label="Correo electrónico" placeholder="tuemail@ejemplo.com" value={email} onChangeText={setEmail} keyboardType="email-address" />
          <Field label="Contraseña" placeholder="Tu contraseña" value={password} onChangeText={setPassword} secureTextEntry />
        </View>

        <Pressable style={[styles.primaryButton, loading && { opacity: 0.7 }]} onPress={login} disabled={loading}>
          {loading ? <ActivityIndicator color="#111111" /> : <Text style={styles.primaryButtonText}>Ingresar</Text>}
        </Pressable>

        <Pressable style={styles.linkButton} onPress={() => navigation.navigate('ForgotPassword')}>
          <Text style={styles.linkButtonText}>Olvidé mi clave</Text>
        </Pressable>

        <Pressable style={styles.secondaryButton} onPress={() => navigation.navigate('Register')}>
          <Text style={styles.secondaryButtonText}>Crear cuenta nueva</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 20, paddingBottom: 48, gap: 16 },
  heroCard: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: 24, padding: 22, alignItems: 'center' },
  logoImage: { width: 92, height: 92, marginBottom: 16 },
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
  linkButton: { alignItems: 'center', paddingVertical: 6 },
  linkButtonText: { color: COLORS.primaryBright, fontSize: 14, fontWeight: '700' },
  secondaryButton: { borderRadius: 16, paddingVertical: 15, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.surface },
  secondaryButtonText: { color: COLORS.text, fontSize: 15, fontWeight: '700' },
});
