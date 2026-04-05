import React from 'react';
import { useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Alert,
  Pressable,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { api } from '../services/api';
import { isIsoDate, isPositiveNumber } from '../services/validators';

const COLORS = {
  background: '#0D0F14',
  surface: '#141820',
  surfaceSoft: '#1A1F2B',
  primary: '#D4A017',
  primaryBright: '#F0C040',
  text: '#E8E8E8',
  textMuted: '#9A9FAA',
  border: 'rgba(212, 160, 23, 0.22)',
  green: '#2ECC40',
  red: '#E53935',
};

const tipos = ['INGRESO', 'GASTO'];
const naturalezas = ['FIJO', 'VARIABLE'];
const incomeCategories = ['Salario', 'Ventas', 'Freelance', 'Comision', 'Interes', 'Otro'];
const expenseCategories = ['Vivienda', 'Alimentacion', 'Transporte', 'Salud', 'Entretenimiento', 'Deuda', 'Inversion', 'Otro'];

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
        style={styles.input}
      />
    </View>
  );
}

export default function AddTransactionScreen({ route, navigation }) {
  const defaultTipo = route?.params?.tipo || 'GASTO';
  const [tipo, setTipo] = useState(defaultTipo);
  const [naturaleza, setNaturaleza] = useState('VARIABLE');
  const [monto, setMonto] = useState('');
  const [categoria, setCategoria] = useState(defaultTipo === 'INGRESO' ? 'Salario' : 'Vivienda');
  const [descripcion, setDescripcion] = useState('');
  const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10));
  const [saving, setSaving] = useState(false);

  const categorias = useMemo(() => (tipo === 'INGRESO' ? incomeCategories : expenseCategories), [tipo]);

  const onChangeTipo = (nextTipo) => {
    setTipo(nextTipo);
    setCategoria(nextTipo === 'INGRESO' ? 'Salario' : 'Vivienda');
  };

  const save = async () => {
    if (!isPositiveNumber(monto)) return Alert.alert('Monto inválido', 'Ingresá un monto mayor a cero.');
    if (!descripcion.trim()) return Alert.alert('Falta descripción', 'Agregá una descripción breve.');
    if (!isIsoDate(fecha)) return Alert.alert('Fecha inválida', 'Usá formato YYYY-MM-DD.');

    setSaving(true);
    try {
      await api.addTx({ tipo, naturaleza, monto: Number(monto), categoria, descripcion: descripcion.trim(), fecha });
      Alert.alert('Movimiento guardado', 'Tu registro se cargó correctamente.');
      navigation.goBack();
    } catch (e) {
      Alert.alert('No pudimos guardar el movimiento', e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={90}>
      <ScrollView style={styles.screen} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.heroCard}>
          <Text style={styles.eyebrow}>CAPITALIZARTE</Text>
          <Text style={styles.title}>Registrar movimiento</Text>
          <Text style={styles.subtitle}>Sumá ingresos o gastos y marcá si son fijos o variables.</Text>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Tipo de movimiento</Text>
          <View style={styles.chipsRow}>
            {tipos.map((item) => {
              const active = tipo === item;
              const activeColor = item === 'INGRESO' ? COLORS.green : COLORS.red;
              return (
                <Pressable key={item} onPress={() => onChangeTipo(item)} style={[styles.chip, active && { borderColor: activeColor, backgroundColor: `${activeColor}22` }]}>
                  <Text style={[styles.chipText, active && { color: activeColor }]}>{item}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Naturaleza</Text>
          <View style={styles.chipsRow}>
            {naturalezas.map((item) => {
              const active = naturaleza === item;
              return (
                <Pressable key={item} onPress={() => setNaturaleza(item)} style={[styles.chip, active && styles.chipActive]}>
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>{item}</Text>
                </Pressable>
              );
            })}
          </View>
          <Text style={styles.helperText}>Usá fijo para compromisos o ingresos recurrentes, y variable para lo ocasional.</Text>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Detalle</Text>
          <Field label="Monto" placeholder="0" value={monto} onChangeText={setMonto} keyboardType="numeric" />
          <Field label="Descripción" placeholder="Ej. Compra de mercadería" value={descripcion} onChangeText={setDescripcion} />
          <Field label="Fecha" placeholder="YYYY-MM-DD" value={fecha} onChangeText={setFecha} />
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>{tipo === 'INGRESO' ? 'Categoría de ingreso' : 'Categoría de gasto'}</Text>
          <View style={styles.chipsRow}>
            {categorias.map((item) => {
              const active = categoria === item;
              return (
                <Pressable key={item} onPress={() => setCategoria(item)} style={[styles.chip, active && styles.chipActive]}>
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>{item}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <Pressable style={[styles.primaryButton, saving && { opacity: 0.7 }]} onPress={save} disabled={saving}>
          {saving ? <ActivityIndicator color="#111111" /> : <Text style={styles.primaryButtonText}>Guardar movimiento</Text>}
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 20, paddingBottom: 48, gap: 16 },
  heroCard: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: 24, padding: 22 },
  eyebrow: { color: COLORS.primaryBright, fontSize: 12, fontWeight: '800', letterSpacing: 1.4, marginBottom: 10 },
  title: { color: COLORS.text, fontSize: 28, lineHeight: 34, fontWeight: '800', marginBottom: 10 },
  subtitle: { color: COLORS.textMuted, fontSize: 15, lineHeight: 22 },
  sectionCard: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: 20, padding: 18, gap: 14 },
  sectionTitle: { color: COLORS.primary, fontSize: 18, fontWeight: '700' },
  fieldWrap: { gap: 8 },
  fieldLabel: { color: COLORS.text, fontSize: 14, fontWeight: '600' },
  input: { backgroundColor: COLORS.surfaceSoft, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 13, color: COLORS.text, fontSize: 15 },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 999, backgroundColor: COLORS.surfaceSoft, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  chipActive: { backgroundColor: 'rgba(212, 160, 23, 0.16)', borderColor: COLORS.primary },
  chipText: { color: COLORS.textMuted, fontWeight: '600' },
  chipTextActive: { color: COLORS.primaryBright },
  helperText: { color: COLORS.textMuted, fontSize: 12, lineHeight: 18 },
  primaryButton: { marginTop: 6, backgroundColor: COLORS.primary, borderRadius: 16, paddingVertical: 16, alignItems: 'center' },
  primaryButtonText: { color: '#111111', fontSize: 16, fontWeight: '800' },
});
