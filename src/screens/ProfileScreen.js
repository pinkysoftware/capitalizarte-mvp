import React, { useEffect, useState } from 'react';
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
  Switch,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { api } from '../services/api';
import { getStoredProfilePhoto, setStoredProfilePhoto } from '../services/profileMedia';


const COLORS = {
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
const AVATARS = { '1': '🧑‍💼', '2': '🧑‍🎓', '3': '🧑‍🚀', '4': '🧑‍🔧', '5': '🧑‍💻' };

function Field({ label, value, onChangeText, placeholder, secureTextEntry = false, keyboardType = 'default', editable = true }) {
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
        editable={editable}
        style={[styles.input, !editable && styles.inputDisabled]}
      />
    </View>
  );
}

export default function ProfileScreen({ navigation }) {
  const isDark = true; const toggleTheme = () => {};
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [photoUri, setPhotoUri] = useState(null);
  const [form, setForm] = useState({
    email: '',
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

  const loadProfile = async () => {
    setLoading(true);
    try {
      const res = await api.getProfile();
      const user = res.user || {};
      setForm({
        email: user.email || '',
        nombre: user.nombre || '',
        apodo: user.apodo || '',
        edad: user.edad != null ? String(user.edad) : '',
        ciudad: user.ciudad || '',
        pais: user.pais || '',
        ocupacion: user.ocupacion || '',
        ingreso_mensual: user.ingreso_mensual != null ? String(user.ingreso_mensual) : '',
        gastos_fijos: user.gastos_fijos != null ? String(user.gastos_fijos) : '',
        gastos_variables: user.gastos_variables != null ? String(user.gastos_variables) : '',
        tiene_tarjeta: Boolean(Number(user.tiene_tarjeta || 0)),
        nivel_inversor: user.nivel_inversor || 'Principiante',
        avatar_id: user.avatar_id || '1',
      });
      const storedPhoto = await getStoredProfilePhoto(user.email || '');
      setPhotoUri(storedPhoto || null);
    } catch (e) {
      Alert.alert('No pudimos cargar tu perfil', e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const choosePhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permiso requerido', 'Necesitamos acceso a tu galería para elegir una foto.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets?.[0]?.uri) {
      const uri = result.assets[0].uri;
      setPhotoUri(uri);
      await setStoredProfilePhoto(form.email, uri);
    }
  };

  const save = async () => {
    setSaving(true);
    try {
      await api.updateProfile({
        ...form,
        edad: form.edad ? Number(form.edad) : null,
        ingreso_mensual: Number(form.ingreso_mensual || 0),
        gastos_fijos: Number(form.gastos_fijos || 0),
        gastos_variables: Number(form.gastos_variables || 0),
      });
      Alert.alert('Perfil actualizado', 'Tus datos se guardaron correctamente.');
      navigation.goBack();
    } catch (e) {
      Alert.alert('No pudimos guardar tu perfil', e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const emoji = AVATARS[String(form.avatar_id || '1')] || '🧑';

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}
    >
      <ScrollView style={styles.screen} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.heroCard}>
          <Pressable style={styles.logoWrap} onPress={choosePhoto}>
            {photoUri ? <Image source={{ uri: photoUri }} style={styles.photoAvatar} /> : <Text style={styles.heroEmoji}>{emoji}</Text>}
          </Pressable>
          <Text style={styles.eyebrow}>TU PERFIL</Text>
          <Text style={styles.title}>{form.apodo || form.nombre || 'Capitalizarte'}</Text>
          <Text style={styles.subtitle}>
            Editá tu identidad visual y tus datos para personalizar mejor tu experiencia financiera.
          </Text>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Identidad visual</Text>
          <Pressable style={styles.galleryButton} onPress={choosePhoto}>
            <Text style={styles.galleryButtonText}>Elegir foto de la galería</Text>
          </Pressable>
          <View style={styles.avatarSelectorRow}>
            {Object.entries(AVATARS).map(([id, icon]) => {
              const active = String(form.avatar_id || '1') === id;
              return (
                <Pressable key={id} style={[styles.avatarOption, active && styles.avatarOptionActive]} onPress={() => set('avatar_id', id)}>
                  <Text style={styles.avatarOptionText}>{icon}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Acceso</Text>
          <Field label="Correo electrónico" placeholder="tuemail@ejemplo.com" value={form.email} onChangeText={() => {}} editable={false} />
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
          <View style={styles.switchRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.fieldLabel}>Modo oscuro</Text>
              <Text style={styles.switchHint}>{isDark ? 'Actualmente activo' : 'Cambiar a oscuro'}</Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: '#8D6A12', true: '#8D6A12' }}
              thumbColor={isDark ? COLORS.primaryBright : '#D3D8E2'}
            />
          </View>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Panorama financiero</Text>
          <Field label="Ingreso mensual" placeholder="0" value={form.ingreso_mensual} onChangeText={(t) => set('ingreso_mensual', t)} keyboardType="numeric" />
          <Field label="Gastos fijos" placeholder="0" value={form.gastos_fijos} onChangeText={(t) => set('gastos_fijos', t)} keyboardType="numeric" />
          <Field label="Gastos variables" placeholder="0" value={form.gastos_variables} onChangeText={(t) => set('gastos_variables', t)} keyboardType="numeric" />

          <View style={styles.switchRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.fieldLabel}>¿Tenés tarjeta?</Text>
              <Text style={styles.switchHint}>Esto ayuda a personalizar mejor tu control financiero.</Text>
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
                <Pressable key={level} onPress={() => set('nivel_inversor', level)} style={[styles.chip, active && styles.chipActive]}>
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>{level}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <Pressable style={styles.primaryButton} onPress={save} disabled={saving}>
          <Text style={styles.primaryButtonText}>{saving ? 'Guardando...' : 'Guardar perfil'}</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  loadingScreen: { flex: 1, backgroundColor: COLORS.background, alignItems: 'center', justifyContent: 'center' },
  content: { padding: 20, paddingBottom: 48, gap: 16 },
  heroCard: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 24,
    padding: 22,
    alignItems: 'center',
  },
  logoWrap: {
    width: 92,
    height: 92,
    borderRadius: 46,
    marginBottom: 16,
    overflow: 'hidden',
    backgroundColor: COLORS.surfaceSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoAvatar: { width: '100%', height: '100%' },
  heroEmoji: { fontSize: 42 },
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
  inputDisabled: { opacity: 0.6 },
  galleryButton: { backgroundColor: COLORS.primary, borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  galleryButtonText: { color: '#111111', fontWeight: '800' },
  avatarSelectorRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  avatarOption: { width: 58, height: 58, borderRadius: 29, backgroundColor: COLORS.surfaceSoft, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  avatarOptionActive: { borderColor: COLORS.primary, backgroundColor: 'rgba(212, 160, 23, 0.16)' },
  avatarOptionText: { fontSize: 28 },
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
});
