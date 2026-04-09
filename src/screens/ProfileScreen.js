import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Alert,
  Pressable,
  StyleSheet,
  ScrollView,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { api, clearToken } from '../services/api';
import { C, S, R } from '../theme';

const investorLevels = ['Principiante', 'Intermedio', 'Avanzado'];

export default function ProfileScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    email: '',
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

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const res = await api.getProfile().catch(e => ({ user: null }));
      const u = (res?.user || res) || {};
      setForm({
        email: u.email || '',
        nombre: u.nombre || '',
        apodo: u.apodo || '',
        ciudad: u.ciudad || '',
        pais: u.pais || '',
        ocupacion: u.ocupacion || '',
        ingreso_mensual: String(u.ingreso_mensual || ''),
        gastos_fijos: String(u.gastos_fijos || ''),
        gastos_variables: String(u.gastos_variables || ''),
        nivel_inversor: u.nivel_inversor || 'Principiante',
      });
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  const set = (k, v) => setForm(s => ({ ...s, [k]: v }));

  const submit = async () => {
    if (!form.nombre.trim()) return Alert.alert('Nombre requerido', 'Ingresá tu nombre.');
    setSaving(true);
    try {
      await api.updateProfile({
        nombre: form.nombre,
        apodo: form.apodo,
        ciudad: form.ciudad,
        pais: form.pais,
        ocupacion: form.ocupacion,
        ingreso_mensual: Number(form.ingreso_mensual) || 0,
        gastos_fijos: Number(form.gastos_fijos) || 0,
        gastos_variables: Number(form.gastos_variables) || 0,
        nivel_inversor: form.nivel_inversor,
      });
      Alert.alert('Guardado', 'Perfil actualizado correctamente.');
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setSaving(false);
    }
  };

  const logout = async () => {
    await clearToken();
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
  };

  if (loading) {
    return <View style={styles.loading}><ActivityIndicator color={C.primary} size="large" /></View>;
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Datos personales</Text>
        <TextInput style={styles.input} placeholder="Nombre" placeholderTextColor={C.textTertiary} value={form.nombre} onChangeText={t => set('nombre', t)} />
        <TextInput style={styles.input} placeholder="Apodo" placeholderTextColor={C.textTertiary} value={form.apodo} onChangeText={t => set('apodo', t)} />
        <View style={styles.row}>
          <TextInput style={[styles.input, { flex: 1 }]} placeholder="Ciudad" placeholderTextColor={C.textTertiary} value={form.ciudad} onChangeText={t => set('ciudad', t)} />
          <TextInput style={[styles.input, { flex: 1 }]} placeholder="País" placeholderTextColor={C.textTertiary} value={form.pais} onChangeText={t => set('pais', t)} />
        </View>
        <TextInput style={styles.input} placeholder="Ocupación" placeholderTextColor={C.textTertiary} value={form.ocupacion} onChangeText={t => set('ocupacion', t)} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Finanzas</Text>
        <TextInput style={styles.input} placeholder="Ingreso mensual $" placeholderTextColor={C.textTertiary} value={form.ingreso_mensual} onChangeText={t => set('ingreso_mensual', t)} keyboardType="decimal-pad" />
        <TextInput style={styles.input} placeholder="Gastos fijos $" placeholderTextColor={C.textTertiary} value={form.gastos_fijos} onChangeText={t => set('gastos_fijos', t)} keyboardType="decimal-pad" />
        <TextInput style={styles.input} placeholder="Gastos variables $" placeholderTextColor={C.textTertiary} value={form.gastos_variables} onChangeText={t => set('gastos_variables', t)} keyboardType="decimal-pad" />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Nivel inversor</Text>
        <View style={styles.chips}>
          {investorLevels.map(level => (
            <Pressable key={level} style={[styles.chip, form.nivel_inversor === level && styles.chipActive]} onPress={() => set('nivel_inversor', level)}>
              <Text style={[styles.chipText, form.nivel_inversor === level && styles.chipTextActive]}>{level}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <Pressable style={[styles.saveBtn, saving && styles.btnDisabled]} onPress={submit} disabled={saving}>
        {saving ? <ActivityIndicator color="#000" /> : <Text style={styles.saveBtnText}>Guardar cambios</Text>}
      </Pressable>

      <Pressable style={styles.logoutBtn} onPress={logout}>
        <Text style={styles.logoutBtnText}>Cerrar sesión</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  content: { padding: S.lg, paddingBottom: S.xxl, gap: S.lg },
  loading: { flex: 1, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center' },
  section: { gap: S.sm },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: C.primary, letterSpacing: 1 },
  input: { backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: R.md, paddingHorizontal: S.md, paddingVertical: 15, color: C.text, fontSize: 16 },
  row: { flexDirection: 'row', gap: S.sm },
  chips: { flexDirection: 'row', gap: S.sm },
  chip: { flex: 1, paddingVertical: 12, borderRadius: R.md, alignItems: 'center', backgroundColor: C.surface, borderWidth: 1, borderColor: C.border },
  chipActive: { backgroundColor: C.primary, borderColor: C.primary },
  chipText: { fontWeight: '600', fontSize: 14, color: C.textSecondary },
  chipTextActive: { color: '#000' },
  saveBtn: { backgroundColor: C.primary, borderRadius: R.md, paddingVertical: 16, alignItems: 'center', marginTop: S.sm },
  btnDisabled: { opacity: 0.6 },
  saveBtnText: { color: '#000', fontSize: 16, fontWeight: '700' },
  logoutBtn: { borderRadius: R.md, paddingVertical: 16, alignItems: 'center', borderWidth: 1, borderColor: C.red },
  logoutBtnText: { color: C.red, fontSize: 16, fontWeight: '700' },
});
