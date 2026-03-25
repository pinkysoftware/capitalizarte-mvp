import React, { useTheme } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Alert,
  Pressable,
  StyleSheet,
  Switch,
  Image,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { api, setToken } from '../services/api';
import { isNonNegativeNumber, isValidEmail } from '../services/validators';

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

const investorLevels = ['Principiante', 'Intermedio', 'Avanzado'];

function Field({ label, value, onChangeText, placeholder, secureTextEntry = false, keyboardType = 'default' }) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        placeholder={placeholder}
        placeholderTextColor={COLORS.textMuted}
        secureTextEntry={secureTextEntry}
        value={String(value ?? '')}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        style={styles.input}
      />
    </View>
  );
}

export default function RegisterScreen({ navigation }) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    email: '',
    password: '',
    nombre: '',
    apodo: '',
    edad: '',
    ciudad: '',
    pais: '',
    ocupacion: '',
    ingreso_mensual: '',
    gastos_fijos: '',
    gastos_variables: '',
    tiene_tarjeta: false,
    nivel_inversor: 'Principiante',
    avatar_id: '1',
  });

  const set = (k, v) => setForm((s) => ({ ...s, [k]: v }));

  const submit = async () => {
    const safeEmail = form.email.trim().toLowerCase();
    if (!isValidEmail(safeEmail)) return Alert.alert('Correo inválido', 'Ingresá un correo válido.');
    if (!form.password || form.password.length < 6) return Alert.alert('Contraseña débil', 'Usá al menos 6 caracteres.');
    if (!form.nombre.trim()) return Alert.alert('Falta nombre', 'Ingresá tu nombre.');
    if (!isNonNegativeNumber(form.ingreso_mensual) || !isNonNegativeNumber(form.gastos_fijos) || !isNonNegativeNumber(form.gastos_variables)) {
      return Alert.alert('Montos inválidos', 'Ingresá números válidos mayores o iguales a cero.');
    }

    setSaving(true);
    try {
      const payload = {
        ...form,
        email: safeEmail,
        edad: form.edad ? Number(form.edad) : null,
        ingreso_mensual: Number(form.ingreso_mensual || 0),
        gastos_fijos: Number(form.gastos_fijos || 0),
        gastos_variables: Number(form.gastos_variables || 0),
      };
      const res = await api.register(payload);
      await setToken(res.token);
      navigation.replace('Dashboard');
    } catch (e) {
      Alert.alert('No pudimos crear tu cuenta', e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}
    >
      <ScrollView style={styles.screen} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.heroCard}>
          <Image source={require('../../assets/capitalizarte-eye.png')} style={styles.logoImage} resizeMode="contain" />
          <Text style={styles.eyebrow}>CAPITALIZARTE</Text>
          <Text style={styles.title}>Creá tu perfil financiero</Text>
          <Text style={styles.subtitle}>
            Empezá con tus datos básicos para personalizar tu experiencia y construir una visión más clara de tus finanzas.
          </Text>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Acceso</Text>
          <Field label="Correo electrónico" placeholder="tuemail@ejemplo.com" value={form.email} onChangeText={(t) => set('email', t)} keyboardType="email-address" />
          <Field label="Contraseña" placeholder="Elegí una contraseña" value={form.password} onChangeText={(t) => set('password', t)} secureTextEntry />
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Identidad</Text>
          <Field label="Nombre completo" placeholder="Cómo te llamás" value={form.nombre} onChangeText={(t) => set('nombre', t)} />
          <Field label="Apodo" placeholder="Cómo querés que te vea la app" value={form.apodo} onChangeText={(t) => set('apodo', t)} />
          <Field label="Edad" placeholder="Tu edad" value={form.edad} onChangeText={(t) => set('edad', t)} keyboardType="numeric" />
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Contexto personal</Text>
          <Field label="Ciudad" placeholder="Dónde vivís" value={form.ciudad} onChangeText={(t) => set('ciudad', t)} />
          <Field label="País" placeholder="Tu país" value={form.pais} onChangeText={(t) => set('pais', t)} />
          <Field label="Ocupación" placeholder="A qué te dedicás" value={form.ocupacion} onChangeText={(t) => set('ocupacion', t)} />
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Panorama financiero</Text>
          <Field label="Ingreso mensual" placeholder="0" value={form.ingreso_mensual} onChangeText={(t) => set('ingreso_mensual', t)} keyboardType="numeric" />
          <Field label="Gastos fijos" placeholder="0" value={form.gastos_fijos} onChangeText={(t) => set('gastos_fijos', t)} keyboardType="numeric" />
          <Field label="Gastos variables" placeholder="0" value={form.gastos_variables} onChangeText={(t) => set('gastos_variables', t)} keyboardType="numeric" />

          <View style={styles.switchRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.fieldLabel}>¿Tenés tarjeta?</Text>
              <Text style={styles.switchHint}>Esto nos ayuda a entender mejor tu estructura financiera.</Text>
            </View>
            <Switch
              value={form.tiene_tarjeta}
              onValueChange={(v) => set('tiene_tarjeta', v)}
              trackColor={{ false: '#394150', true: '#8D6A12' }}
              thumbColor={form.tiene_tarjeta ? COLORS.primaryBright : '#D3D8E2'}
            />
          </View>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Nivel inversor</Text>
          <View style={styles.chipsRow}>
            {investorLevels.map((level) => {
              const active = form.nivel_inversor === level;
              return (
                <Pressable
                  key={level}
                  onPress={() => set('nivel_inversor', level)}
                  style={[styles.chip, active && styles.chipActive]}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>{level}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <Pressable style={[styles.primaryButton, saving && { opacity: 0.7 }]} onPress={submit} disabled={saving}>
          {saving ? <ActivityIndicator color="#111111" /> : <Text style={styles.primaryButtonText}>Crear cuenta</Text>}
        </Pressable>

        <Pressable style={styles.secondaryButton} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.secondaryButtonText}>Ya tengo cuenta</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 20, paddingBottom: 48, gap: 16 },
  heroCard: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 24,
    padding: 22,
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOpacity: 0.15,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  logoImage: { width: 92, height: 92, marginBottom: 16 },
  eyebrow: {
    color: COLORS.primaryBright,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.4,
    marginBottom: 10,
    textAlign: 'center',
  },
  title: {
    color: COLORS.text,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '800',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    color: COLORS.textMuted,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
  sectionCard: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 20,
    padding: 18,
    gap: 14,
  },
  sectionTitle: { color: COLORS.primary, fontSize: 18, fontWeight: '700' },
  fieldWrap: { gap: 8 },
  fieldLabel: { color: COLORS.text, fontSize: 14, fontWeight: '600' },
  input: {
    backgroundColor: COLORS.surfaceSoft,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 13,
    color: COLORS.text,
    fontSize: 15,
  },
  switchRow: {
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: COLORS.surfaceSoft,
    borderRadius: 16,
    padding: 14,
  },
  switchHint: { marginTop: 4, color: COLORS.textMuted, fontSize: 12, lineHeight: 17 },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: COLORS.surfaceSoft,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  chipActive: { backgroundColor: 'rgba(212, 160, 23, 0.16)', borderColor: COLORS.primary },
  chipText: { color: COLORS.textMuted, fontWeight: '600' },
  chipTextActive: { color: COLORS.primaryBright },
  primaryButton: {
    marginTop: 6,
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryButtonText: { color: '#111111', fontSize: 16, fontWeight: '800' },
  secondaryButton: {
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  secondaryButtonText: { color: COLORS.text, fontSize: 15, fontWeight: '700' },
});
