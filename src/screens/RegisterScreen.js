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
  SafeAreaView,
} from 'react-native';
import { api, setToken } from '../services/api';
import { C, S, R } from '../theme';

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
    if (!form.email.trim() || !form.password || form.password.length < 6 || !form.nombre.trim()) {
      return Alert.alert(' Campos requeridos', 'Email, contraseña (6+ chars) y nombre son obligatorios.');
    }
    setSaving(true);
    try {
      const payload = {
        name: form.nombre,
        ...form,
        email: form.email.trim().toLowerCase(),
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
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>Crear cuenta</Text>

          {/* Acceso */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>ACCESO</Text>
            <TextInput style={styles.input} placeholder="Email" placeholderTextColor={C.textTertiary} value={form.email} onChangeText={t => set('email', t)} keyboardType="email-address" autoCapitalize="none" />
            <TextInput style={styles.input} placeholder="Contraseña (min 6 chars)" placeholderTextColor={C.textTertiary} value={form.password} onChangeText={t => set('password', t)} secureTextEntry />
          </View>

          {/* Datos personales */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>SOBRE VOS</Text>
            <TextInput style={styles.input} placeholder="Nombre completo" placeholderTextColor={C.textTertiary} value={form.nombre} onChangeText={t => set('nombre', t)} />
            <View style={styles.row}>
              <TextInput style={[styles.input, { flex: 1 }]} placeholder="Ciudad" placeholderTextColor={C.textTertiary} value={form.ciudad} onChangeText={t => set('ciudad', t)} />
              <TextInput style={[styles.input, { flex: 1 }]} placeholder="País" placeholderTextColor={C.textTertiary} value={form.pais} onChangeText={t => set('pais', t)} />
            </View>
            <TextInput style={styles.input} placeholder="Ocupación" placeholderTextColor={C.textTertiary} value={form.ocupacion} onChangeText={t => set('ocupacion', t)} />
          </View>

          {/* Finanzas */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>FINANZAS (OPCIONAL)</Text>
            <View style={styles.row}>
              <TextInput style={[styles.input, { flex: 1 }]} placeholder="Ingreso mensual $" placeholderTextColor={C.textTertiary} value={form.ingreso_mensual} onChangeText={t => set('ingreso_mensual', t)} keyboardType="decimal-pad" />
              <TextInput style={[styles.input, { flex: 1 }]} placeholder="Gastos fijos $" placeholderTextColor={C.textTertiary} value={form.gastos_fijos} onChangeText={t => set('gastos_fijos', t)} keyboardType="decimal-pad" />
            </View>
          </View>

          {/* Nivel */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>NIVEL INVERSOR</Text>
            <View style={styles.chips}>
              {investorLevels.map(level => (
                <Pressable key={level} style={[styles.chip, form.nivel_inversor === level && styles.chipActive]} onPress={() => set('nivel_inversor', level)}>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  container: { flex: 1 },
  scroll: { flex: 1 },
  content: { padding: S.md, paddingBottom: S.xl, gap: S.md },
  title: { fontSize: 24, fontWeight: '800', color: C.text, marginBottom: S.sm },
  section: { gap: S.xs },
  sectionTitle: { fontSize: 11, fontWeight: '700', color: C.primary, letterSpacing: 1, marginBottom: 4 },
  row: { flexDirection: 'row', gap: S.xs },
  input: {
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: R.md,
    paddingHorizontal: S.sm,
    paddingVertical: 10,
    color: C.text,
    fontSize: 14,
    flex: 1,
  },
  chips: { flexDirection: 'row', gap: S.xs },
  chip: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: R.md,
    alignItems: 'center',
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
  },
  chipActive: { backgroundColor: C.primary, borderColor: C.primary },
  chipText: { fontWeight: '600', fontSize: 12, color: C.textSecondary },
  chipTextActive: { color: '#000' },
  submitBtn: { backgroundColor: C.primary, borderRadius: R.md, paddingVertical: 12, alignItems: 'center', marginTop: S.sm },
  btnDisabled: { opacity: 0.6 },
  submitBtnText: { color: '#000', fontSize: 14, fontWeight: '700' },
  loginLink: { alignItems: 'center', paddingVertical: S.sm },
  loginLinkText: { color: C.primary, fontSize: 13, fontWeight: '600' },
});
