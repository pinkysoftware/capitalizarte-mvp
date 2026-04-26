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
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { api, clearToken } from '../services/api';
import { getUserProfile, saveUserProfile } from '../services/userStorage';
import { useTheme } from '../contexts/ThemeContext';

const investorLevels = ['Principiante', 'Intermedio', 'Avanzado'];

export default function ProfileScreen({ navigation }) {
  const { colors, isDark, toggleTheme } = useTheme();
  const insets = useSafeAreaInsets();
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
      const u = await getUserProfile();
      if (u) {
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
      }
    } catch (e) {
      // silent fail
    } finally {
      setLoading(false);
    }
  };

  const set = (k, v) => setForm(s => ({ ...s, [k]: v }));

  const submit = async () => {
    if (!form.nombre.trim()) return Alert.alert('Nombre requerido', 'Ingresá tu nombre.');
    setSaving(true);
    try {
      const updatedProfile = {
        ...form,
        ingreso_mensual: Number(form.ingreso_mensual) || 0,
        gastos_fijos: Number(form.gastos_fijos) || 0,
        gastos_variables: Number(form.gastos_variables) || 0,
      };
      await saveUserProfile(updatedProfile);
      try { await api.updateProfile(updatedProfile); } catch {}
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
    return (
      <View style={[styles.loading, { backgroundColor: colors.bg }]}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <ScrollView style={[styles.screen, { backgroundColor: colors.bg }]} contentContainerStyle={[styles.content, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 100 }]}>
      {/* ============================================================
          AVATAR + TEMA
          ============================================================ */}
      <View style={styles.profileHeader}>
        <View style={[styles.avatarWrapper, { backgroundColor: colors.surface }]}>
          <View style={[styles.avatarCircle, { backgroundColor: colors.primaryDim }]}>
            <Text style={[styles.avatarInitial, { color: colors.primary }]}>
              {(form.nombre || 'U')[0].toUpperCase()}
            </Text>
          </View>
          <Pressable style={[styles.cameraBtn, { backgroundColor: colors.primary }]} onPress={() => {}}>
            <Feather name="camera" size={14} color="#000" />
          </Pressable>
        </View>

        <View style={styles.themeToggle}>
          <Pressable style={[styles.themeBtn, { backgroundColor: isDark ? '#1A1D24' : '#F0F0F0' }]} onPress={toggleTheme}>
            <Feather name={isDark ? 'moon' : 'sun'} size={18} color={isDark ? '#AF52DE' : '#FBBF24'} />
            <Text style={[styles.themeText, { color: colors.text }]}>
              {isDark ? 'Oscuro' : 'Claro'}
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Datos personales */}
      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: colors.primary }]}>Datos personales</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.bg, color: colors.text, borderColor: colors.border }]}
          placeholder="Nombre" placeholderTextColor={colors.textTertiary}
          value={form.nombre} onChangeText={t => set('nombre', t)}
        />
        <TextInput
          style={[styles.input, { backgroundColor: colors.bg, color: colors.text, borderColor: colors.border }]}
          placeholder="Apodo" placeholderTextColor={colors.textTertiary}
          value={form.apodo} onChangeText={t => set('apodo', t)}
        />
        <View style={styles.row}>
          <TextInput
            style={[styles.input, { flex: 1, backgroundColor: colors.bg, color: colors.text, borderColor: colors.border }]}
            placeholder="Ciudad" placeholderTextColor={colors.textTertiary}
            value={form.ciudad} onChangeText={t => set('ciudad', t)}
          />
          <TextInput
            style={[styles.input, { flex: 1, backgroundColor: colors.bg, color: colors.text, borderColor: colors.border }]}
            placeholder="País" placeholderTextColor={colors.textTertiary}
            value={form.pais} onChangeText={t => set('pais', t)}
          />
        </View>
        <TextInput
          style={[styles.input, { backgroundColor: colors.bg, color: colors.text, borderColor: colors.border }]}
          placeholder="Ocupación" placeholderTextColor={colors.textTertiary}
          value={form.ocupacion} onChangeText={t => set('ocupacion', t)}
        />
      </View>

      {/* Finanzas */}
      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: colors.primary }]}>Finanzas</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.bg, color: colors.text, borderColor: colors.border }]}
          placeholder="Ingreso mensual $" placeholderTextColor={colors.textTertiary}
          value={form.ingreso_mensual} onChangeText={t => set('ingreso_mensual', t)} keyboardType="decimal-pad"
        />
        <TextInput
          style={[styles.input, { backgroundColor: colors.bg, color: colors.text, borderColor: colors.border }]}
          placeholder="Gastos fijos $" placeholderTextColor={colors.textTertiary}
          value={form.gastos_fijos} onChangeText={t => set('gastos_fijos', t)} keyboardType="decimal-pad"
        />
        <TextInput
          style={[styles.input, { backgroundColor: colors.bg, color: colors.text, borderColor: colors.border }]}
          placeholder="Gastos variables $" placeholderTextColor={colors.textTertiary}
          value={form.gastos_variables} onChangeText={t => set('gastos_variables', t)} keyboardType="decimal-pad"
        />
      </View>

      {/* Nivel inversor */}
      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: colors.primary }]}>Nivel inversor</Text>
        <View style={styles.chips}>
          {investorLevels.map(level => (
            <Pressable
              key={level}
              style={[styles.chip, form.nivel_inversor === level && { backgroundColor: colors.primary, borderColor: colors.primary }]}
              onPress={() => set('nivel_inversor', level)}
            >
              <Text style={[styles.chipText, { color: form.nivel_inversor === level ? '#000' : colors.textSecondary }]}>{level}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Guardar */}
      <Pressable
        style={[styles.saveBtn, saving && { opacity: 0.6 }]}
        onPress={submit}
        disabled={saving}
      >
        {saving ? <ActivityIndicator color="#000" /> : <Text style={styles.saveBtnText}>Guardar cambios</Text>}
      </Pressable>

      {/* Cerrar sesión */}
      <Pressable style={[styles.logoutBtn, { borderColor: colors.red }]} onPress={logout}>
        <Feather name="log-out" size={16} color={colors.red} />
        <Text style={[styles.logoutBtnText, { color: colors.red }]}>Cerrar sesión</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: 16, gap: 16 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  // Profile Header
  profileHeader: { alignItems: 'center', gap: 16 },
  avatarWrapper: { position: 'relative', padding: 4, borderRadius: 60 },
  avatarCircle: { width: 100, height: 100, borderRadius: 50, alignItems: 'center', justifyContent: 'center' },
  avatarInitial: { fontSize: 40, fontWeight: '700' },
  cameraBtn: { position: 'absolute', bottom: 0, right: 0, width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  themeToggle: { flexDirection: 'row', gap: 8 },
  themeBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20 },
  themeText: { fontSize: 14, fontWeight: '600' },

  // Section
  section: { borderRadius: 16, padding: 16, gap: 10 },
  sectionTitle: { fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 4 },
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13, fontSize: 15 },
  row: { flexDirection: 'row', gap: 10 },

  // Chips
  chips: { flexDirection: 'row', gap: 10 },
  chip: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(0,0,0,0.1)' },
  chipText: { fontWeight: '600', fontSize: 13 },

  // Buttons
  saveBtn: { backgroundColor: '#D4A017', borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  saveBtnText: { color: '#000', fontSize: 16, fontWeight: '700' },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 14, paddingVertical: 16, borderWidth: 1 },
  logoutBtnText: { fontSize: 16, fontWeight: '700' },
});
