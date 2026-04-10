import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Alert,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { api, setToken } from '../services/api';
import { isValidEmail } from '../services/validators';
import { C, S, R, SHADOW } from '../theme';

const investorLevels = ['Principiante', 'Intermedio', 'Avanzado'];

export default function RegisterScreen({ navigation }) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    email: '',
    password: '',
    nombre: '',
    apodo: '',
    ciudad: '',
    pais: '',
    ocupacion: '',
    ingreso_mensual: '',
    gastos_fijos: '',
    gastos_variables: '',
    nivel_inversor: 'Principiante',
  });

  const set = (k, v) => setForm((s) => ({ ...s, [k]: v }));

  const submit = async () => {
    if (!isValidEmail(form.email.trim().toLowerCase())) return Alert.alert(' Email inválido', 'Ingresá un correo válido.');
    if (!form.password || form.password.length < 6) return Alert.alert(' Contraseña débil', 'Usá al menos 6 caracteres.');
    if (!form.nombre.trim()) return Alert.alert(' Falta nombre', 'Ingresá tu nombre.');

    setSaving(true);
    try {
      const payload = {
        name: form.nombre,
        email: form.email.trim().toLowerCase(),
        password: form.password,
        apodo: form.apodo,
        ciudad: form.ciudad,
        pais: form.pais,
        ocupacion: form.ocupacion,
        nivel_inversor: form.nivel_inversor,
        ingreso_mensual: Number(form.ingreso_mensual || 0),
        gastos_fijos: Number(form.gastos_fijos || 0),
        gastos_variables: Number(form.gastos_variables || 0),
      };
      const res = await api.register(payload);
      await setToken(res.token);
      navigation.replace('Dashboard');
    } catch (e) {
      Alert.alert(' Error', e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

        <View style={styles.header}>
          <Text style={styles.title}>Crear cuenta</Text>
          <Text style={styles.subtitle}>Configurá tu perfil financiero</Text>
        </View>

        {/* Datos básicos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Acceso</Text>
          <TextInput style={styles.input} placeholder="Email" placeholderTextColor={C.textTertiary} value={form.email} onChangeText={(t) => set('email', t)} keyboardType="email-address" autoCapitalize="none" />
          <TextInput style={styles.input} placeholder="Contraseña" placeholderTextColor={C.textTertiary} value={form.password} onChangeText={(t) => set('password', t)} secureTextEntry />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sobre vos</Text>
          <TextInput style={styles.input} placeholder="Nombre completo" placeholderTextColor={C.textTertiary} value={form.nombre} onChangeText={(t) => set('nombre', t)} />
          <TextInput style={styles.input} placeholder="Apodo (opcional)" placeholderTextColor={C.textTertiary} value={form.apodo} onChangeText={(t) => set('apodo', t)} />
          <View style={styles.row}>
            <TextInput style={[styles.input, { flex: 1 }]} placeholder="Ciudad" placeholderTextColor={C.textTertiary} value={form.ciudad} onChangeText={(t) => set('ciudad', t)} />
            <TextInput style={[styles.input, { flex: 1 }]} placeholder="País" placeholderTextColor={C.textTertiary} value={form.pais} onChangeText={(t) => set('pais', t)} />
          </View>
          <TextInput style={styles.input} placeholder="Ocupación" placeholderTextColor={C.textTertiary} value={form.ocupacion} onChangeText={(t) => set('ocupacion', t)} />
        </View>

        {/* Panorama financiero */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Finanzas</Text>
          <TextInput style={styles.input} placeholder="Ingreso mensual $" placeholderTextColor={C.textTertiary} value={form.ingreso_mensual} onChangeText={(t) => set('ingreso_mensual', t)} keyboardType="decimal-pad" />
          <TextInput style={styles.input} placeholder="Gastos fijos $" placeholderTextColor={C.textTertiary} value={form.gastos_fijos} onChangeText={(t) => set('gastos_fijos', t)} keyboardType="decimal-pad" />
          <TextInput style={styles.input} placeholder="Gastos variables $" placeholderTextColor={C.textTertiary} value={form.gastos_variables} onChangeText={(t) => set('gastos_variables', t)} keyboardType="decimal-pad" />
        </View>

        {/* Nivel */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nivel inversor</Text>
          <View style={styles.chips}>
            {investorLevels.map(level => (
              <Pressable
                key={level}
                style={[styles.chip, form.nivel_inversor === level && styles.chipActive]}
                onPress={() => set('nivel_inversor', level)}
              >
                <Text style={[styles.chipText, form.nivel_inversor === level && styles.chipTextActive]}>{level}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <Pressable style={[styles.submitBtn, saving && styles.btnDisabled]} onPress={submit} disabled={saving}>
          {saving ? <ActivityIndicator color="#000" /> : <Text style={styles.submitBtnText}>Crear cuenta</Text>}
        </Pressable>

        <Pressable style={styles.loginLink} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.loginLinkText}>¿Ya tenés cuenta? Ingresá</Text>
        </Pressable>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  scroll: { flex: 1 },
  content: { padding: S.lg, paddingBottom: S.xxl, gap: S.lg },
  header: { gap: S.xs },
  title: { fontSize: 28, fontWeight: '800', color: C.text },
  subtitle: { color: C.textSecondary, fontSize: 15 },
  section: { gap: S.sm },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: C.primary, letterSpacing: 1 },
  input: {
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: R.md,
    paddingHorizontal: S.md,
    paddingVertical: 15,
    color: C.text,
    fontSize: 16,
  },
  row: { flexDirection: 'row', gap: S.sm },
  chips: { flexDirection: 'row', gap: S.sm },
  chip: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: R.md,
    alignItems: 'center',
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
  },
  chipActive: { backgroundColor: C.primary, borderColor: C.primary },
  chipText: { fontWeight: '600', fontSize: 14, color: C.textSecondary },
  chipTextActive: { color: '#000' },
  submitBtn: { backgroundColor: C.primary, borderRadius: R.md, paddingVertical: 16, alignItems: 'center', marginTop: S.sm },
  btnDisabled: { opacity: 0.6 },
  submitBtnText: { color: '#000', fontSize: 16, fontWeight: '700' },
  loginLink: { alignItems: 'center', paddingVertical: S.sm },
  loginLinkText: { color: C.primary, fontSize: 15, fontWeight: '600' },
});
